import "server-only";

import { asc, desc, eq, inArray } from "drizzle-orm";

import { db } from "@/db";
import { photoTags, photos, tags } from "@/db/schema";
import type { GalleryData, GalleryPhoto } from "@/lib/gallery-types";

const DEFAULT_GALLERY_LIMIT = 60;
const MAX_GALLERY_LIMIT = 120;

function clampLimit(limit?: number) {
  if (!limit || Number.isNaN(limit)) {
    return DEFAULT_GALLERY_LIMIT;
  }

  return Math.min(Math.max(limit, 1), MAX_GALLERY_LIMIT);
}

function filenameToAltText(filename: string) {
  const withoutExtension = filename.replace(/\.[^.]+$/, "");
  const normalized = withoutExtension
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  return normalized.length > 0 ? normalized : "Uploaded photo";
}

function normalizeDimension(value: number | null, fallback: number) {
  if (!value || value <= 0) {
    return fallback;
  }

  return value;
}

type PhotoForImageAccess = {
  id: string;
  storageKey: string;
  mimeType: string;
  originalFilename: string;
};

export async function getGalleryData(options?: {
  limit?: number;
}): Promise<GalleryData> {
  const limit = clampLimit(options?.limit);
  const orderedPhotos = await db
    .select({
      id: photos.id,
      originalFilename: photos.originalFilename,
      mimeType: photos.mimeType,
      width: photos.width,
      height: photos.height,
      fileSize: photos.fileSize,
      favorite: photos.favorite,
      createdAt: photos.createdAt,
    })
    .from(photos)
    .orderBy(desc(photos.createdAt), desc(photos.id))
    .limit(limit + 1);

  const hasMore = orderedPhotos.length > limit;
  const pagePhotos = orderedPhotos.slice(0, limit);

  const photoIds = pagePhotos.map((photo) => photo.id);

  const photoTagRows =
    photoIds.length > 0
      ? await db
          .select({
            photoId: photoTags.photoId,
            tagName: tags.name,
          })
          .from(photoTags)
          .innerJoin(tags, eq(tags.id, photoTags.tagId))
          .where(inArray(photoTags.photoId, photoIds))
          .orderBy(asc(tags.name))
      : [];

  const allTags = await db
    .select({
      name: tags.name,
    })
    .from(tags)
    .orderBy(asc(tags.name));

  const tagsByPhoto = new Map<string, string[]>();

  for (const row of photoTagRows) {
    const current = tagsByPhoto.get(row.photoId) ?? [];
    current.push(row.tagName);
    tagsByPhoto.set(row.photoId, current);
  }

  const mappedPhotos: GalleryPhoto[] = pagePhotos.map((photo) => {
    const photoTagsForPhoto = tagsByPhoto.get(photo.id) ?? [];

    return {
      id: photo.id,
      src: `/api/photos/${photo.id}/image`,
      alt: filenameToAltText(photo.originalFilename),
      width: normalizeDimension(photo.width, 4),
      height: normalizeDimension(photo.height, 5),
      tags: Array.from(new Set(photoTagsForPhoto)),
      favorite: photo.favorite,
      originalFilename: photo.originalFilename,
      mimeType: photo.mimeType,
      fileSizeBytes: photo.fileSize.toString(),
      createdAt: photo.createdAt.toISOString(),
    };
  });

  return {
    photos: mappedPhotos,
    tags: Array.from(new Set(allTags.map((tag) => tag.name))),
    hasMore,
    limit,
  };
}

export async function getPhotoForImageAccess(
  photoId: string,
): Promise<PhotoForImageAccess | null> {
  const result = await db
    .select({
      id: photos.id,
      storageKey: photos.storageKey,
      mimeType: photos.mimeType,
      originalFilename: photos.originalFilename,
    })
    .from(photos)
    .where(eq(photos.id, photoId))
    .limit(1);

  return result[0] ?? null;
}
