"use client";

import type { AuthModalMode } from "@/components/gallery/auth-modal";

type WelcomeEntranceProps = {
  phase: "open" | "closing";
  onAuthChoice: (mode: AuthModalMode, trigger: HTMLButtonElement) => void;
  onContinueAsGuest: () => void;
};

export default function WelcomeEntrance({
  phase,
  onAuthChoice,
  onContinueAsGuest,
}: WelcomeEntranceProps) {
  return (
    <div
      className={`fixed inset-0 z-[60] overflow-hidden bg-black/80 backdrop-blur-md transition duration-1000 ease-out motion-reduce:duration-0 ${
        phase === "closing"
          ? "pointer-events-none translate-x-full opacity-0 motion-reduce:translate-x-0"
          : "translate-x-0 opacity-100"
      }`}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.12),_transparent_32%),linear-gradient(135deg,_rgba(255,255,255,0.08),_transparent_42%)]" />
      <div className="relative flex h-full items-center justify-center px-6 py-10">
        <div
          className="w-full max-w-xl rounded-[2rem] border border-white/12 bg-black/60 p-8 text-white shadow-2xl shadow-black/40 sm:p-10"
          role="dialog"
          aria-modal="true"
          aria-labelledby="welcome-entrance-title"
        >
          <p className="text-xs font-semibold uppercase tracking-[0.38em] text-slate-400">
            Berlin Gallery
          </p>
          <h1
            id="welcome-entrance-title"
            className="mt-5 text-4xl font-semibold tracking-tight text-white sm:text-5xl"
          >
            Enter the gallery your way.
          </h1>
          <p className="mt-4 max-w-lg text-sm leading-6 text-slate-300 sm:text-base">
            Browse freely as a guest, or sign in to unlock uploads and mock
            favorites without leaving the gallery view.
          </p>

          <div className="mt-10 grid gap-3 sm:grid-cols-3">
            <button
              type="button"
              onClick={(event) => onAuthChoice("sign-in", event.currentTarget)}
              className="rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-slate-200"
            >
              Sign in
            </button>
            <button
              type="button"
              onClick={(event) => onAuthChoice("sign-up", event.currentTarget)}
              className="rounded-2xl border border-white/20 bg-white/5 px-4 py-3 text-sm font-semibold text-white transition hover:border-white/35 hover:bg-white/10"
            >
              Create account
            </button>
            <button
              type="button"
              onClick={onContinueAsGuest}
              className="rounded-2xl border border-slate-700 bg-transparent px-4 py-3 text-sm font-semibold text-slate-200 transition hover:border-slate-500 hover:text-white"
            >
              Continue as guest
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
