import { Readable } from "node:stream";

import { GetObjectCommand } from "@aws-sdk/client-s3";
import { NextResponse } from "next/server";
import { z } from "zod";

import { getPhotoForImageAccess } from "@/lib/gallery-queries";
import { bucketName, s3Client } from "@/lib/s3";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const routeParamsSchema = z.object({
  photoId: z.string().uuid(),
});

function asWebStream(
  body: unknown,
): ReadableStream<Uint8Array<ArrayBufferLike>> | null {
  if (!body) {
    return null;
  }

  if (
    typeof body === "object" &&
    body !== null &&
    "transformToWebStream" in body &&
    typeof body.transformToWebStream === "function"
  ) {
    return body.transformToWebStream() as ReadableStream<
      Uint8Array<ArrayBufferLike>
    >;
  }

  if (body instanceof Readable) {
    return Readable.toWeb(body) as ReadableStream<Uint8Array<ArrayBufferLike>>;
  }

  return null;
}

function filenameForContentDisposition(filename: string) {
  return encodeURIComponent(filename).replace(/['()*]/g, (char) => {
    return `%${char.charCodeAt(0).toString(16).toUpperCase()}`;
  });
}

export async function GET(
  _request: Request,
  context: { params: Promise<{ photoId: string }> },
) {
  const params = await context.params;
  const parsed = routeParamsSchema.safeParse(params);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid photo id." }, { status: 400 });
  }

  const photo = await getPhotoForImageAccess(parsed.data.photoId);

  if (!photo) {
    return NextResponse.json({ error: "Photo not found." }, { status: 404 });
  }

  try {
    const objectResponse = await s3Client.send(
      new GetObjectCommand({
        Bucket: bucketName,
        Key: photo.storageKey,
      }),
    );

    const stream = asWebStream(objectResponse.Body);

    if (!stream) {
      return NextResponse.json({ error: "Photo not available." }, { status: 404 });
    }

    const headers = new Headers();
    headers.set("Content-Type", objectResponse.ContentType ?? photo.mimeType);
    headers.set(
      "Content-Disposition",
      `inline; filename*=UTF-8''${filenameForContentDisposition(photo.originalFilename)}`,
    );
    headers.set("Cache-Control", "public, max-age=300, stale-while-revalidate=86400");
    headers.set("X-Content-Type-Options", "nosniff");

    if (typeof objectResponse.ContentLength === "number") {
      headers.set("Content-Length", String(objectResponse.ContentLength));
    }

    if (typeof objectResponse.ETag === "string") {
      headers.set("ETag", objectResponse.ETag);
    }

    if (objectResponse.LastModified instanceof Date) {
      headers.set("Last-Modified", objectResponse.LastModified.toUTCString());
    }

    return new NextResponse(stream, {
      status: 200,
      headers,
    });
  } catch {
    return NextResponse.json(
      { error: "Unable to load image from storage." },
      { status: 502 },
    );
  }
}
