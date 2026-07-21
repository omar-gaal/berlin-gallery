"use client";

import type { KeyboardEvent, MouseEvent } from "react";
import Image from "next/image";
import type { PhotoItem } from "@/lib/mock-photos";

type PhotoCardProps = {
  photo: PhotoItem;
  onOpen: (photo: PhotoItem) => void;
  onToggleFavorite: (photoId: string) => void;
};

export default function PhotoCard({
  photo,
  onOpen,
  onToggleFavorite,
}: PhotoCardProps) {
  const handleFavoriteClick = (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    onToggleFavorite(photo.id);
  };

  const handleCardKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onOpen(photo);
    }
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onOpen(photo)}
      onKeyDown={handleCardKeyDown}
      className="group relative w-full cursor-pointer overflow-hidden rounded-xl border border-slate-200/50 bg-white shadow-sm transition hover:shadow-md"
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

      <button
        type="button"
        onClick={handleFavoriteClick}
        aria-label={
          photo.favorite ? "Remove from favorites" : "Add to favorites"
        }
        aria-pressed={photo.favorite}
        className={`absolute right-3 top-3 z-10 hidden rounded-full border border-white/80 bg-white/90 p-2 text-slate-700 shadow-sm transition hover:bg-white lg:flex ${
          photo.favorite
            ? "opacity-100"
            : "opacity-0 lg:group-hover:opacity-100 lg:group-focus-within:opacity-100"
        }`}
      >
        <svg
          viewBox="0 0 24 24"
          className={`h-4 w-4 ${photo.favorite ? "fill-rose-500 text-rose-500" : "fill-none text-slate-700"}`}
          stroke="currentColor"
          strokeWidth="1.8"
          aria-hidden="true"
        >
          <path d="M12 20s-6.5-4.1-8.9-7.3C1.2 10.2 2.1 6.7 5.2 5.5c1.7-.6 3.7-.1 5.1 1.2 1.4-1.3 3.4-1.8 5.1-1.2 3.1 1.2 4 4.7 2.1 7.2C18.5 15.9 12 20 12 20Z" />
        </svg>
      </button>
    </div>
  );
}
