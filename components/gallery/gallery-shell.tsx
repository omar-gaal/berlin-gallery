"use client";

import { startTransition, useEffect, useMemo, useRef, useState } from "react";
import AppSidebar from "@/components/gallery/app-sidebar";
import AuthModal, { type AuthModalMode } from "@/components/gallery/auth-modal";
import GalleryHeader from "@/components/gallery/gallery-header";
import FilterChips from "@/components/gallery/filter-chips";
import MobileNav from "@/components/gallery/mobile-nav";
import PhotoGrid from "@/components/gallery/photo-grid";
import PhotoModal from "@/components/gallery/photo-modal";
import UploadModal from "@/components/gallery/upload-modal";
import WelcomeEntrance from "@/components/gallery/welcome-entrance";
import { authClient } from "@/lib/auth-client";
import { mockPhotos, type PhotoItem } from "@/lib/mock-photos";

const chips = ["All", "Nature", "City", "Travel", "People", "Food"];
const welcomeKey = "berlin-gallery:welcome-seen";
const welcomeExitDurationMs = 280;

type ViewMode = "gallery" | "favorites";
type WelcomePhase = "checking" | "open" | "closing" | "hidden";

type AuthPrompt = {
  mode: AuthModalMode;
  message?: string;
  returnFocusTo?: HTMLElement | null;
};

function getUserInitials(name?: string | null, email?: string | null) {
  const trimmedName = name?.trim();

  if (trimmedName) {
    return trimmedName
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part.charAt(0).toUpperCase())
      .join("");
  }

  return email?.charAt(0).toUpperCase() ?? "?";
}

function prefersReducedMotion() {
  return typeof window !== "undefined"
    ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
    : false;
}

export default function GalleryShell() {
  const [openPhoto, setOpenPhoto] = useState<string | null>(null);
  const [activeChip, setActiveChip] = useState("All");
  const [activeView, setActiveView] = useState<ViewMode>("gallery");
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [authPrompt, setAuthPrompt] = useState<AuthPrompt | null>(null);
  const [welcomePhase, setWelcomePhase] = useState<WelcomePhase>("checking");
  const [favorites, setFavorites] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(mockPhotos.map((photo) => [photo.id, photo.favorite])),
  );
  const headerSignInButtonRef = useRef<HTMLButtonElement | null>(null);
  const welcomeTimerRef = useRef<number | null>(null);
  const {
    data: sessionData,
    isPending: isSessionPending,
    refetch,
  } = authClient.useSession();

  const currentUser = sessionData?.user ?? null;
  const isSignedIn = Boolean(sessionData?.session && currentUser);
  const userInitials = getUserInitials(currentUser?.name, currentUser?.email);

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

  useEffect(() => {
    if (isSessionPending) {
      return;
    }

    if (isSignedIn) {
      startTransition(() => {
        setWelcomePhase("hidden");
      });
      return;
    }

    try {
      startTransition(() => {
        setWelcomePhase(
          window.sessionStorage.getItem(welcomeKey) ? "hidden" : "open",
        );
      });
    } catch {
      startTransition(() => {
        setWelcomePhase("open");
      });
    }
  }, [isSessionPending, isSignedIn]);

  useEffect(() => {
    return () => {
      if (welcomeTimerRef.current) {
        window.clearTimeout(welcomeTimerRef.current);
      }
    };
  }, []);

  const closeWelcomeEntrance = (nextPrompt?: AuthPrompt) => {
    try {
      window.sessionStorage.setItem(welcomeKey, "1");
    } catch {}

    const duration = prefersReducedMotion() ? 0 : welcomeExitDurationMs;
    setWelcomePhase("closing");

    if (welcomeTimerRef.current) {
      window.clearTimeout(welcomeTimerRef.current);
    }

    welcomeTimerRef.current = window.setTimeout(() => {
      setWelcomePhase("hidden");
      if (nextPrompt) {
        setAuthPrompt(nextPrompt);
      }
    }, duration);
  };

  const openAuthPrompt = (prompt: AuthPrompt) => {
    setAuthPrompt(prompt);
  };

  const handleToggleFavorite = (
    photoId: string,
    trigger: HTMLButtonElement,
  ) => {
    if (!isSignedIn) {
      openAuthPrompt({
        mode: "sign-in",
        message: "Sign in or create an account to save favorites.",
        returnFocusTo: trigger,
      });
      return;
    }

    setFavorites((current) => ({
      ...current,
      [photoId]: !current[photoId],
    }));
  };

  const handleUploadClick = (trigger: HTMLButtonElement) => {
    if (!isSignedIn) {
      openAuthPrompt({
        mode: "sign-in",
        message: "Sign in or create an account to upload photos.",
        returnFocusTo: trigger,
      });
      return;
    }

    setIsUploadOpen(true);
  };

  const handleAuthSuccess = async () => {
    await refetch();
    setAuthPrompt(null);
  };

  const handleSignOut = async () => {
    setIsSigningOut(true);
    const response = await authClient.signOut();
    setIsSigningOut(false);

    if (!response.error) {
      await refetch();
    }
  };

  return (
    <div className="relative flex h-screen flex-col bg-white lg:flex-row">
      <div className="hidden border-r border-slate-200/50 lg:block lg:w-60">
        <AppSidebar activeView={activeView} onSelectView={setActiveView} />
      </div>

      <div className="flex flex-1 flex-col overflow-hidden">
        <GalleryHeader
          isSignedIn={isSignedIn}
          isSigningOut={isSigningOut}
          onUploadClick={handleUploadClick}
          onSignInClick={(trigger) =>
            openAuthPrompt({ mode: "sign-in", returnFocusTo: trigger })
          }
          onSignOutClick={handleSignOut}
          userEmail={currentUser?.email ?? null}
          userInitials={userInitials}
          userName={currentUser?.name ?? null}
          signInButtonRef={headerSignInButtonRef}
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
      {welcomePhase === "open" || welcomePhase === "closing" ? (
        <WelcomeEntrance
          phase={welcomePhase === "closing" ? "closing" : "open"}
          onAuthChoice={(mode) =>
            closeWelcomeEntrance({
              mode,
              returnFocusTo: headerSignInButtonRef.current,
            })
          }
          onContinueAsGuest={() => closeWelcomeEntrance()}
        />
      ) : null}
      {authPrompt ? (
        <AuthModal
          mode={authPrompt.mode}
          message={authPrompt.message}
          returnFocusTo={authPrompt.returnFocusTo}
          onClose={() => setAuthPrompt(null)}
          onModeChange={(mode) =>
            setAuthPrompt((current) =>
              current
                ? {
                    ...current,
                    mode,
                  }
                : current,
            )
          }
          onSuccess={handleAuthSuccess}
        />
      ) : null}
    </div>
  );
}
