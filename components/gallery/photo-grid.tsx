"use client";

import type { PhotoItem } from "@/lib/mock-photos";
import PhotoCard from "@/components/gallery/photo-card";

type PhotoGridProps = {
  photos: PhotoItem[];
  onOpen: (photo: PhotoItem) => void;
};

export default function PhotoGrid({ photos, onOpen }: PhotoGridProps) {
  return (
    <div className="px-6 py-4">
      <div className="columns-1 gap-4 sm:columns-2 lg:columns-3 xl:columns-4">
        {photos.map((photo) => (
          <div key={photo.id} className="mb-4 break-inside-avoid">
            <PhotoCard photo={photo} onOpen={onOpen} />
          </div>
        ))}
      </div>
    </div>
  );
}
