import { randomUUID } from "node:crypto";

import {
  DeleteObjectCommand,
  PutObjectCommand,
} from "@aws-sdk/client-s3";
import { sql } from "drizzle-orm";
import { imageSize } from "image-size";
import { NextResponse } from "next/server";
import { z } from "zod";

import { db } from "@/db";
import { photoTags, photos, tags } from "@/db/schema";
import { requireUser } from "@/lib/auth";
import { bucketName, s3Client } from "@/lib/s3";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_UPLOAD_SIZE_BYTES = 15 * 1024 * 1024;
const SUPPORTED_MIME_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

const tagSchema = z
  .string()
  .trim()
  .min(1, "Tag is required.")
  .max(50, "Tag must be 50 characters or less.")
  .regex(/^[A-Za-z0-9][A-Za-z0-9 '\-_&]*$/, "Tag contains invalid characters.");

class RouteError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

function extensionForMimeType(mimeType: string) {
  switch (mimeType) {
    case "image/jpeg":
      return "jpg";
    case "image/png":
      return "png";
    case "image/webp":
      return "webp";
    default:
      return null;
  }
}

function createStorageKey(userId: string, extension: string, now = new Date()) {
  const year = String(now.getUTCFullYear());
  const month = String(now.getUTCMonth() + 1).padStart(2, "0");

  return `photos/${userId}/${year}/${month}/${randomUUID()}.${extension}`;
}

async function parseUploadFormData(request: Request) {
  const formData = await request.formData();
  const imageEntries = formData.getAll("image");
  const tagEntries = formData.getAll("tag");

  if (imageEntries.length !== 1) {
    throw new RouteError(400, "Exactly one image file is required.");
  }

  if (tagEntries.length !== 1) {
    throw new RouteError(400, "Exactly one tag is required.");
  }

  const imageEntry = imageEntries[0];
  const tagEntry = tagEntries[0];

  if (!(imageEntry instanceof File)) {
    throw new RouteError(400, "Invalid image file.");
  }

  if (typeof tagEntry !== "string") {
    throw new RouteError(400, "Invalid tag value.");
  }

  if (imageEntry.size <= 0) {
    throw new RouteError(400, "Uploaded file is empty.");
  }

  if (imageEntry.size > MAX_UPLOAD_SIZE_BYTES) {
    throw new RouteError(413, "File is too large. Maximum size is 15 MB.");
  }

  if (!SUPPORTED_MIME_TYPES.has(imageEntry.type)) {
    throw new RouteError(415, "Unsupported file type. Use JPEG, PNG, or WebP.");
  }

  const parsedTag = tagSchema.safeParse(tagEntry);

  if (!parsedTag.success) {
    throw new RouteError(400, parsedTag.error.issues[0]?.message ?? "Invalid tag.");
  }

  const extension = extensionForMimeType(imageEntry.type);

  if (!extension) {
    throw new RouteError(415, "Unsupported file type.");
  }

  return {
    file: imageEntry,
    normalizedTag: parsedTag.data,
    extension,
  };
}

export async function POST(request: Request) {
  let storageKey: string | null = null;

  try {
    const session = await requireUser(request);
    const { file, normalizedTag, extension } = await parseUploadFormData(request);

    const fileBuffer = Buffer.from(await file.arrayBuffer());

    if (fileBuffer.byteLength === 0) {
      throw new RouteError(400, "Uploaded file is empty.");
    }

    const dimensions = imageSize(fileBuffer);

    if (!dimensions.width || !dimensions.height) {
      throw new RouteError(400, "Unable to read image dimensions.");
    }

    const generatedStorageKey = createStorageKey(session.user.id, extension);
    storageKey = generatedStorageKey;

    await s3Client.send(
      new PutObjectCommand({
        Bucket: bucketName,
        Key: storageKey,
        Body: fileBuffer,
        ContentType: file.type,
      }),
    );

    const photoResult = await db.transaction(async (tx) => {
      const [insertedPhoto] = await tx
        .insert(photos)
        .values({
          uploadedBy: session.user.id,
          originalFilename: file.name || `upload.${extension}`,
          storageKey: generatedStorageKey,
          mimeType: file.type,
          width: dimensions.width,
          height: dimensions.height,
          fileSize: BigInt(file.size),
        })
        .returning({
          id: photos.id,
        });

      if (!insertedPhoto) {
        throw new Error("Failed to insert photo row.");
      }

      const normalizedTagLower = normalizedTag.toLowerCase();

      const [existingTag] = await tx
        .select({
          id: tags.id,
          name: tags.name,
        })
        .from(tags)
        .where(sql`lower(${tags.name}) = ${normalizedTagLower}`)
        .limit(1);

      let tagId = existingTag?.id;

      if (!tagId) {
        const [insertedTag] = await tx
          .insert(tags)
          .values({
            name: normalizedTag,
          })
          .onConflictDoNothing({ target: tags.name })
          .returning({
            id: tags.id,
          });

        tagId = insertedTag?.id;
      }

      if (!tagId) {
        const [resolvedTag] = await tx
          .select({
            id: tags.id,
          })
          .from(tags)
          .where(sql`lower(${tags.name}) = ${normalizedTagLower}`)
          .limit(1);

        tagId = resolvedTag?.id;
      }

      if (!tagId) {
        throw new Error("Failed to resolve tag row.");
      }

      await tx
        .insert(photoTags)
        .values({
          photoId: insertedPhoto.id,
          tagId,
        })
        .onConflictDoNothing();

      return {
        photoId: insertedPhoto.id,
        tag: normalizedTag,
      };
    });

    return NextResponse.json(
      {
        photoId: photoResult.photoId,
        storageKey,
        tag: photoResult.tag,
      },
      { status: 201 },
    );
  } catch (error) {
    if (storageKey) {
      try {
        await s3Client.send(
          new DeleteObjectCommand({
            Bucket: bucketName,
            Key: storageKey,
          }),
        );
      } catch {
        // Best-effort cleanup; surface original error response.
      }
    }

    if (error instanceof RouteError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }

    if (error instanceof Error && error.message === "Authentication required") {
      return NextResponse.json({ error: "Authentication required." }, { status: 401 });
    }

    return NextResponse.json(
      { error: "Unable to upload photo right now." },
      { status: 500 },
    );
  }
}
