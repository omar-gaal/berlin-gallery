"use client";

import { useMemo, useState } from "react";
import AppSidebar from "@/components/gallery/app-sidebar";
import GalleryHeader from "@/components/gallery/gallery-header";
import FilterChips from "@/components/gallery/filter-chips";
import MobileNav from "@/components/gallery/mobile-nav";
import PhotoGrid from "@/components/gallery/photo-grid";
import PhotoModal from "@/components/gallery/photo-modal";
import UploadModal from "@/components/gallery/upload-modal";
import { mockPhotos, type PhotoItem } from "@/lib/mock-photos";

const chips = ["All", "Nature", "City", "Travel", "People", "Food"];
const userEmail = "omar@example.com";

type ViewMode = "gallery" | "favorites";

export default function GalleryShell() {
  const [openPhoto, setOpenPhoto] = useState<string | null>(null);
  const [activeChip, setActiveChip] = useState("All");
  const [activeView, setActiveView] = useState<ViewMode>("gallery");
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [favorites, setFavorites] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(mockPhotos.map((photo) => [photo.id, photo.favorite])),
  );

  const photosWithFavorites = useMemo<PhotoItem[]>(() => {
    return mockPhotos.map((photo) => ({
      ...photo,
      favorite: favorites[photo.id] ?? photo.favorite,
    }));
  }, [favorites]);

  const selectedPhoto = useMemo(
    () => photosWithFavorites.find((photo) => photo.id === openPhoto) ?? null,
    [openPhoto, photosWithFavorites],
  );

  const visiblePhotos = useMemo(() => {
    const basePhotos =
      activeView === "favorites"
        ? photosWithFavorites.filter((photo) => photo.favorite)
        : photosWithFavorites;

    if (activeChip === "All") {
      return basePhotos;
    }

    return basePhotos.filter((photo) => photo.tags.includes(activeChip));
  }, [activeChip, activeView, photosWithFavorites]);

  const handleToggleFavorite = (photoId: string) => {
    setFavorites((current) => ({
      ...current,
      [photoId]: !current[photoId],
    }));
  };

  return (
    <div className="flex h-screen flex-col bg-white lg:flex-row">
      <div className="hidden border-r border-slate-200/50 lg:block lg:w-60">
        <AppSidebar activeView={activeView} onSelectView={setActiveView} />
      </div>

      <div className="flex flex-1 flex-col overflow-hidden">
        <GalleryHeader
          onUploadClick={() => setIsUploadOpen(true)}
          userEmail={userEmail}
        />
        <FilterChips
          chips={chips}
          activeChip={activeChip}
          onSelectChip={setActiveChip}
        />
        <div className="flex-1 overflow-y-auto pb-24">
          <PhotoGrid
            photos={visiblePhotos}
            onOpen={(photo) => setOpenPhoto(photo.id)}
            onToggleFavorite={handleToggleFavorite}
            emptyMessage={
              activeView === "favorites" ? "No favorite photos yet." : undefined
            }
          />
        </div>
      </div>

      <MobileNav activeView={activeView} onSelectView={setActiveView} />

      {selectedPhoto ? (
        <PhotoModal
          photo={selectedPhoto}
          onClose={() => setOpenPhoto(null)}
          isFavorite={selectedPhoto.favorite}
          onToggleFavorite={handleToggleFavorite}
        />
      ) : null}
      {isUploadOpen ? (
        <UploadModal
          onClose={() => setIsUploadOpen(false)}
          onUploadComplete={() => {
            setIsUploadOpen(false);
            setShowToast(true);
            window.setTimeout(() => setShowToast(false), 1800);
          }}
        />
      ) : null}
      {showToast ? (
        <div className="fixed bottom-24 left-1/2 z-[60] -translate-x-1/2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700 shadow-sm">
          Upload complete
        </div>
      ) : null}
    </div>
  );
}
