"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import type { PhotoItem } from "@/lib/mock-photos";

type PhotoModalProps = {
  photo: PhotoItem;
  onClose: () => void;
};

export default function PhotoModal({ photo, onClose }: PhotoModalProps) {
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

        <div className="relative aspect-[3/4] w-full">
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
