"use client";

import { type MouseEvent, useEffect, useRef, useState } from "react";
import Image from "next/image";
import type { PhotoItem } from "@/lib/mock-photos";

type PhotoModalProps = {
  photo: PhotoItem;
  onClose: () => void;
  isFavorite: boolean;
  onToggleFavorite: (photoId: string) => void;
};

export default function PhotoModal({
  photo,
  onClose,
  isFavorite,
  onToggleFavorite,
}: PhotoModalProps) {
  const [isVisible, setIsVisible] = useState(true);
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    const previousScrollY = window.scrollY;
    const previousScrollX = window.scrollX;
    const previousBodyOverflow = document.body.style.overflow;
    const previousHtmlOverflow = document.documentElement.style.overflow;
    const previousBodyPaddingRight = document.body.style.paddingRight;
    const scrollbarWidth =
      window.innerWidth - document.documentElement.clientWidth;

    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }

    closeButtonRef.current?.focus();

    return () => {
      document.body.style.overflow = previousBodyOverflow;
      document.documentElement.style.overflow = previousHtmlOverflow;
      document.body.style.paddingRight = previousBodyPaddingRight;
      window.scrollTo({
        top: previousScrollY,
        left: previousScrollX,
        behavior: "auto",
      });
    };
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsVisible(false);
        window.setTimeout(() => onClose(), 160);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const handleClose = () => {
    setIsVisible(false);
    window.setTimeout(() => onClose(), 160);
  };

  const handleFavoriteClick = (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    onToggleFavorite(photo.id);
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-3 backdrop-blur-sm transition-opacity duration-200 sm:p-4 ${
        isVisible ? "opacity-100" : "opacity-0"
      }`}
      onClick={handleClose}
      role="presentation"
    >
      <div
        className={`relative w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-lg transition-transform duration-200 ${
          isVisible ? "translate-y-0 scale-100" : "translate-y-2 scale-[0.98]"
        }`}
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Photo preview"
      >
        <button
          ref={closeButtonRef}
          type="button"
          onClick={handleClose}
          className="absolute right-3 top-3 rounded-lg border border-slate-200 bg-white p-2 text-slate-700 shadow-sm transition hover:bg-slate-50"
          aria-label="Close photo preview"
        >
          ×
        </button>

        <button
          type="button"
          onClick={handleFavoriteClick}
          aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
          aria-pressed={isFavorite}
          className="fixed right-5 top-[calc(1rem+env(safe-area-inset-top))] z-70 flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white/95 text-slate-700 shadow-lg transition hover:bg-slate-50 sm:absolute sm:right-14 sm:top-3 sm:h-10 sm:w-10 sm:rounded-lg sm:shadow-sm"
          style={{ top: "calc(1rem + env(safe-area-inset-top))" }}
        >
          <svg
            viewBox="0 0 24 24"
            className={`h-5 w-5 ${isFavorite ? "fill-rose-500 text-rose-500" : "fill-none text-slate-700"}`}
            stroke="currentColor"
            strokeWidth="1.8"
            aria-hidden="true"
          >
            <path d="M12 20s-6.5-4.1-8.9-7.3C1.2 10.2 2.1 6.7 5.2 5.5c1.7-.6 3.7-.1 5.1 1.2 1.4-1.3 3.4-1.8 5.1-1.2 3.1 1.2 4 4.7 2.1 7.2C18.5 15.9 12 20 12 20Z" />
          </svg>
        </button>

        <div className="relative aspect-3/4 w-full">
          <Image
            src={photo.src}
            alt={photo.alt}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 80vw, 60vw"
            className="object-cover"
          />
        </div>
      </div>
    </div>
  );
}
