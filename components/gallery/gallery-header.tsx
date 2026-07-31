import type { RefObject } from "react";

type GalleryHeaderProps = {
  isSignedIn: boolean;
  isSigningOut: boolean;
  onUploadClick: (trigger: HTMLButtonElement) => void;
  onSignInClick: (trigger: HTMLButtonElement) => void;
  onSignOutClick: () => void;
  userEmail?: string | null;
  userInitials?: string;
  userName?: string | null;
  signInButtonRef: RefObject<HTMLButtonElement | null>;
};

export default function GalleryHeader({
  isSignedIn,
  isSigningOut,
  onUploadClick,
  onSignInClick,
  onSignOutClick,
  userEmail,
  userInitials,
  userName,
  signInButtonRef,
}: GalleryHeaderProps) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-slate-200/50 px-6 py-4">
      <div className="flex-1" />
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={(event) => onUploadClick(event.currentTarget)}
          className="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
        >
          Upload
        </button>
        {isSignedIn ? (
          <div className="flex items-center gap-3">
            <div className="hidden min-w-0 text-right sm:block">
              {userName ? (
                <p className="truncate text-sm font-medium text-slate-900">
                  {userName}
                </p>
              ) : null}
              <p className="truncate text-xs text-slate-500">{userEmail}</p>
            </div>
            <div
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-900 text-sm font-semibold text-white"
              aria-label="Signed in profile"
              title={userName ?? userEmail ?? undefined}
            >
              {userInitials}
            </div>
            <button
              type="button"
              onClick={onSignOutClick}
              disabled={isSigningOut}
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSigningOut ? "Signing out..." : "Sign out"}
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <button
              ref={signInButtonRef}
              type="button"
              onClick={(event) => onSignInClick(event.currentTarget)}
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
              Sign in
            </button>
            <div
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500"
              aria-hidden="true"
            >
              <svg
                viewBox="0 0 24 24"
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
              >
                <path d="M12 12a4 4 0 1 0-4-4 4 4 0 0 0 4 4Zm0 2c-3.33 0-6 1.79-6 4v1h12v-1c0-2.21-2.67-4-6-4Z" />
              </svg>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
