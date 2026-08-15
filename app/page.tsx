import GalleryShell from "@/components/gallery/gallery-shell";
import { getGalleryData } from "@/lib/gallery-queries";
import type { GalleryPhoto } from "@/lib/gallery-types";

export const dynamic = "force-dynamic";

export default async function Home() {
  let initialPhotos: GalleryPhoto[] = [];
  let initialTags: string[] = [];
  let hasMore = false;
  let pageSize = 60;
  let loadError: string | undefined;

  try {
    const galleryData = await getGalleryData({ limit: 60 });
    initialPhotos = galleryData.photos;
    initialTags = galleryData.tags;
    hasMore = galleryData.hasMore;
    pageSize = galleryData.limit;
  } catch (error) {
    console.error("Failed to load gallery data", error);
    loadError = "We could not load the gallery right now.";
  }

  return (
    <GalleryShell
      initialPhotos={initialPhotos}
      initialTags={initialTags}
      hasMore={hasMore}
      pageSize={pageSize}
      loadError={loadError}
    />
  );
}
