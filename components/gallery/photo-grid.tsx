"use client";

import type { GalleryPhoto } from "@/lib/gallery-types";
import PhotoCard from "@/components/gallery/photo-card";

type PhotoGridProps = {
  photos: GalleryPhoto[];
  onOpen: (photo: GalleryPhoto) => void;
  onToggleFavorite: (photoId: string, trigger: HTMLButtonElement) => void;
  emptyMessage?: string;
};

export default function PhotoGrid({
  photos,
  onOpen,
  onToggleFavorite,
  emptyMessage,
}: PhotoGridProps) {
  if (photos.length === 0) {
    return (
      <div className="px-6 py-16 text-center text-sm text-slate-500">
        {emptyMessage ?? "No photos found."}
      </div>
    );
  }

  return (
    <div className="px-6 py-4">
      <div className="columns-1 gap-4 sm:columns-2 lg:columns-3 xl:columns-4">
        {photos.map((photo) => (
          <div key={photo.id} className="mb-4 break-inside-avoid">
            <PhotoCard
              photo={photo}
              onOpen={onOpen}
              onToggleFavorite={onToggleFavorite}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
