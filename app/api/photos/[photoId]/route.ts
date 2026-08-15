import { DeleteObjectCommand } from "@aws-sdk/client-s3";
import { and, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { z } from "zod";

import { db } from "@/db";
import { photos } from "@/db/schema";
import { requireUser } from "@/lib/auth";
import { bucketName, s3Client } from "@/lib/s3";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const routeParamsSchema = z.object({
  photoId: z.string().uuid(),
});

export async function DELETE(
  request: Request,
  context: { params: Promise<{ photoId: string }> },
) {
  try {
    const session = await requireUser(request);
    const params = await context.params;
    const parsed = routeParamsSchema.safeParse(params);

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid photo id." }, { status: 400 });
    }

    const photoId = parsed.data.photoId;

    const [existingPhoto] = await db
      .select({
        id: photos.id,
        uploadedBy: photos.uploadedBy,
        storageKey: photos.storageKey,
      })
      .from(photos)
      .where(eq(photos.id, photoId))
      .limit(1);

    if (!existingPhoto) {
      return NextResponse.json({ error: "Photo not found." }, { status: 404 });
    }

    if (existingPhoto.uploadedBy !== session.user.id) {
      return NextResponse.json(
        { error: "You can only delete photos you uploaded." },
        { status: 403 },
      );
    }

    await db
      .delete(photos)
      .where(
        and(eq(photos.id, photoId), eq(photos.uploadedBy, session.user.id)),
      );

    try {
      await s3Client.send(
        new DeleteObjectCommand({
          Bucket: bucketName,
          Key: existingPhoto.storageKey,
        }),
      );
    } catch {
      // Keep the user-facing operation successful even if storage cleanup fails.
    }

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (error) {
    if (error instanceof Error && error.message === "Authentication required") {
      return NextResponse.json({ error: "Authentication required." }, { status: 401 });
    }

    return NextResponse.json(
      { error: "Unable to delete this photo right now." },
      { status: 500 },
    );
  }
}
