"use client";

import Image from "next/image";
import type { PhotoItem } from "@/lib/mock-photos";

type PhotoCardProps = {
  photo: PhotoItem;
  onOpen: (photo: PhotoItem) => void;
};

export default function PhotoCard({ photo, onOpen }: PhotoCardProps) {
  return (
    <button
      type="button"
      onClick={() => onOpen(photo)}
      className="group w-full overflow-hidden rounded-xl border border-slate-200/50 bg-white shadow-sm transition hover:shadow-md"
    >
      <div
        style={{ aspectRatio: `${photo.width} / ${photo.height}` }}
        className="relative overflow-hidden bg-slate-100"
      >
        <Image
          src={photo.src}
          alt={photo.alt}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover transition duration-300 group-hover:scale-105"
        />
      </div>
    </button>
  );
}
