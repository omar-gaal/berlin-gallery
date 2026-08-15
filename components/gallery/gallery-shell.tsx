"use client";

import {
  startTransition,
  useEffect,
  useMemo,
  useRef,
  useState,
  useTransition,
} from "react";
import { useRouter } from "next/navigation";
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
import type { GalleryPhoto } from "@/lib/gallery-types";

const welcomeKey = "berlin-gallery:welcome-seen";
const welcomeExitDurationMs = 280;

type ViewMode = "gallery" | "favorites";
type WelcomePhase = "checking" | "open" | "closing" | "hidden";

type AuthPrompt = {
  mode: AuthModalMode;
  message?: string;
  returnFocusTo?: HTMLElement | null;
};

type GalleryShellProps = {
  initialPhotos: GalleryPhoto[];
  initialTags: string[];
  hasMore: boolean;
  pageSize: number;
  loadError?: string;
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

export default function GalleryShell({
  initialPhotos,
  initialTags,
  hasMore,
  pageSize,
  loadError,
}: GalleryShellProps) {
  const router = useRouter();
  const [isRefreshingGallery, startGalleryRefresh] = useTransition();
  const [openPhoto, setOpenPhoto] = useState<string | null>(null);
  const [activeChip, setActiveChip] = useState("All");
  const [activeView, setActiveView] = useState<ViewMode>("gallery");
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [authPrompt, setAuthPrompt] = useState<AuthPrompt | null>(null);
  const [welcomePhase, setWelcomePhase] = useState<WelcomePhase>("checking");
  const [favoriteOverrides, setFavoriteOverrides] = useState<
    Record<string, boolean>
  >({});
  const [sessionUploadTags, setSessionUploadTags] = useState<string[]>([]);
  const [deletedPhotoIds, setDeletedPhotoIds] = useState<Record<string, true>>(
    {},
  );
  const [isDeletingPhoto, setIsDeletingPhoto] = useState(false);
  const [deleteErrorMessage, setDeleteErrorMessage] = useState<string | null>(
    null,
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

  const uploadTags = useMemo(() => {
    return Array.from(new Set([...initialTags, ...sessionUploadTags]));
  }, [initialTags, sessionUploadTags]);

  const chips = useMemo(() => {
    return ["All", ...uploadTags];
  }, [uploadTags]);

  const effectiveActiveChip = chips.includes(activeChip) ? activeChip : "All";

  const initialFavoritesById = useMemo(() => {
    return Object.fromEntries(
      initialPhotos.map((photo) => [photo.id, photo.favorite]),
    );
  }, [initialPhotos]);

  const photosWithFavorites = useMemo<GalleryPhoto[]>(() => {
    return initialPhotos
      .filter((photo) => !deletedPhotoIds[photo.id])
      .map((photo) => ({
        ...photo,
        favorite: favoriteOverrides[photo.id] ?? photo.favorite,
      }));
  }, [deletedPhotoIds, favoriteOverrides, initialPhotos]);

  const selectedPhoto = useMemo(
    () => photosWithFavorites.find((photo) => photo.id === openPhoto) ?? null,
    [openPhoto, photosWithFavorites],
  );

  const visiblePhotos = useMemo(() => {
    const basePhotos =
      activeView === "favorites"
        ? photosWithFavorites.filter((photo) => photo.favorite)
        : photosWithFavorites;

    if (effectiveActiveChip === "All") {
      return basePhotos;
    }

    return basePhotos.filter((photo) =>
      photo.tags.includes(effectiveActiveChip),
    );
  }, [activeView, effectiveActiveChip, photosWithFavorites]);

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

    setFavoriteOverrides((current) => {
      const fallbackFavorite = initialFavoritesById[photoId] ?? false;
      const currentValue = current[photoId] ?? fallbackFavorite;

      return {
        ...current,
        [photoId]: !currentValue,
      };
    });
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

  const handleUploadComplete = async (uploadedTag: string) => {
    setIsUploadOpen(false);

    if (uploadedTag.trim()) {
      setSessionUploadTags((current) => {
        if (current.includes(uploadedTag)) {
          return current;
        }

        return [...current, uploadedTag];
      });
    }

    setToastMessage("Upload complete. Refreshing gallery...");
    window.setTimeout(() => setToastMessage(null), 2200);

    startGalleryRefresh(() => {
      router.refresh();
    });
  };

  const handleDeletePhoto = async (photoId: string) => {
    if (isDeletingPhoto) {
      return;
    }

    if (!isSignedIn || !currentUser) {
      setDeleteErrorMessage("Sign in to delete photos.");
      return;
    }

    const photo = photosWithFavorites.find(
      (candidate) => candidate.id === photoId,
    );

    if (!photo) {
      setDeleteErrorMessage("Photo not found.");
      return;
    }

    if (photo.uploadedByUserId !== currentUser.id) {
      setDeleteErrorMessage("You can only delete photos you uploaded.");
      return;
    }

    const confirmed = window.confirm("Delete this photo permanently?");

    if (!confirmed) {
      return;
    }

    setIsDeletingPhoto(true);
    setDeleteErrorMessage(null);

    try {
      const response = await fetch(`/api/photos/${photoId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        let message = "Unable to delete this photo right now.";

        try {
          const payload = (await response.json()) as { error?: string };
          if (payload.error) {
            message = payload.error;
          }
        } catch {
          // Keep fallback message when response body is unavailable.
        }

        setDeleteErrorMessage(message);
        return;
      }

      setDeletedPhotoIds((current) => ({
        ...current,
        [photoId]: true,
      }));
      setFavoriteOverrides((current) => {
        const next = { ...current };
        delete next[photoId];
        return next;
      });
      setOpenPhoto((current) => (current === photoId ? null : current));
      setToastMessage("Photo deleted.");
      window.setTimeout(() => setToastMessage(null), 2200);

      startGalleryRefresh(() => {
        router.refresh();
      });
    } finally {
      setIsDeletingPhoto(false);
    }
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

  const galleryEmptyMessage =
    activeView === "favorites"
      ? "No favorite photos yet."
      : effectiveActiveChip === "All"
        ? "No uploaded photos yet."
        : `No photos tagged \"${effectiveActiveChip}\" yet.`;

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
          activeChip={effectiveActiveChip}
          onSelectChip={setActiveChip}
        />
        {loadError ? (
          <p className="px-6 py-2 text-sm text-rose-600">{loadError}</p>
        ) : null}
        {isRefreshingGallery ? (
          <p className="px-6 py-2 text-xs text-slate-500">
            Updating gallery...
          </p>
        ) : null}
        <div className="flex-1 overflow-y-auto pb-24">
          <PhotoGrid
            photos={visiblePhotos}
            onOpen={(photo) => {
              setDeleteErrorMessage(null);
              setOpenPhoto(photo.id);
            }}
            onToggleFavorite={handleToggleFavorite}
            emptyMessage={galleryEmptyMessage}
          />
          {hasMore ? (
            <p className="px-6 pb-3 text-center text-xs text-slate-500">
              Showing the latest {pageSize} uploads.
            </p>
          ) : null}
        </div>
      </div>

      <MobileNav activeView={activeView} onSelectView={setActiveView} />

      {selectedPhoto ? (
        <PhotoModal
          photo={selectedPhoto}
          onClose={() => {
            setDeleteErrorMessage(null);
            setOpenPhoto(null);
          }}
          isFavorite={selectedPhoto.favorite}
          onToggleFavorite={handleToggleFavorite}
          canDelete={Boolean(
            isSignedIn &&
            currentUser &&
            selectedPhoto.uploadedByUserId === currentUser.id,
          )}
          isDeleting={isDeletingPhoto}
          onDelete={handleDeletePhoto}
          deleteErrorMessage={deleteErrorMessage}
        />
      ) : null}
      {isUploadOpen ? (
        <UploadModal
          onClose={() => setIsUploadOpen(false)}
          onUploadComplete={handleUploadComplete}
          availableTags={uploadTags}
        />
      ) : null}
      {toastMessage ? (
        <div className="fixed bottom-24 left-1/2 z-60 -translate-x-1/2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700 shadow-sm">
          {toastMessage}
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
