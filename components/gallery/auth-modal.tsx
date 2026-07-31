"use client";

import {
  type FormEvent,
  type KeyboardEvent as ReactKeyboardEvent,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";
import { authClient } from "@/lib/auth-client";

export type AuthModalMode = "sign-in" | "sign-up";

type AuthModalProps = {
  mode: AuthModalMode;
  message?: string;
  onClose: () => void;
  onModeChange: (mode: AuthModalMode) => void;
  onSuccess: () => Promise<void> | void;
  returnFocusTo?: HTMLElement | null;
};

type FieldErrors = Partial<
  Record<"email" | "password" | "confirmPassword", string>
>;

const MIN_PASSWORD_LENGTH = 8;

function getFocusableElements(container: HTMLElement) {
  return Array.from(
    container.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
    ),
  ).filter((element) => !element.hasAttribute("disabled"));
}

function getAuthErrorMessage(
  error: { message?: string; status?: number } | null,
) {
  if (!error) {
    return "Authentication failed. Please try again.";
  }

  if (error.message) {
    return error.message;
  }

  if (error.status === 401) {
    return "Incorrect email or password.";
  }

  return "Authentication failed. Please try again.";
}

export default function AuthModal({
  mode,
  message,
  onClose,
  onModeChange,
  onSuccess,
  returnFocusTo,
}: AuthModalProps) {
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const emailRef = useRef<HTMLInputElement | null>(null);
  const nameRef = useRef<HTMLInputElement | null>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const titleId = useId();
  const descriptionId = useId();
  const errorId = useId();
  const emailErrorId = useId();
  const passwordErrorId = useId();
  const confirmPasswordErrorId = useId();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [submitError, setSubmitError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    previousFocusRef.current = document.activeElement as HTMLElement | null;

    return () => {
      const target =
        returnFocusTo && document.contains(returnFocusTo)
          ? returnFocusTo
          : previousFocusRef.current &&
              document.contains(previousFocusRef.current)
            ? previousFocusRef.current
            : null;

      target?.focus();
    };
  }, [returnFocusTo]);

  useEffect(() => {
    const nextFocusTarget =
      mode === "sign-up" ? nameRef.current : emailRef.current;
    nextFocusTarget?.focus();
  }, [mode]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const handleTabKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (event.key !== "Tab" || !dialogRef.current) {
      return;
    }

    const focusable = getFocusableElements(dialogRef.current);
    if (focusable.length === 0) {
      return;
    }

    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    const activeElement = document.activeElement;

    if (event.shiftKey && activeElement === first) {
      event.preventDefault();
      last.focus();
      return;
    }

    if (!event.shiftKey && activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  };

  const resetErrors = () => {
    setFieldErrors({});
    setSubmitError("");
  };

  const validate = () => {
    const nextErrors: FieldErrors = {};
    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      nextErrors.email = "Email is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      nextErrors.email = "Enter a valid email address.";
    }

    if (!password) {
      nextErrors.password = "Password is required.";
    } else if (password.length < MIN_PASSWORD_LENGTH) {
      nextErrors.password = `Use at least ${MIN_PASSWORD_LENGTH} characters.`;
    }

    if (mode === "sign-up") {
      if (!confirmPassword) {
        nextErrors.confirmPassword = "Please confirm your password.";
      } else if (password !== confirmPassword) {
        nextErrors.confirmPassword = "Passwords do not match.";
      }
    }

    setFieldErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    resetErrors();

    if (!validate()) {
      return;
    }

    setIsSubmitting(true);

    const trimmedName = name.trim();
    const trimmedEmail = email.trim().toLowerCase();

    const response =
      mode === "sign-in"
        ? await authClient.signIn.email({
            email: trimmedEmail,
            password,
          })
        : await authClient.signUp.email({
            name: trimmedName,
            email: trimmedEmail,
            password,
          });

    setIsSubmitting(false);

    if (response.error) {
      setSubmitError(getAuthErrorMessage(response.error));
      return;
    }

    await onSuccess();
  };

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
      onClick={onClose}
      role="presentation"
    >
      <div
        ref={dialogRef}
        onClick={(event) => event.stopPropagation()}
        onKeyDown={handleTabKeyDown}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={message ? descriptionId : undefined}
        className="w-full max-w-md rounded-3xl border border-slate-800 bg-slate-950 p-6 text-slate-100 shadow-2xl"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-500">
              Berlin Gallery
            </p>
            <h2 id={titleId} className="mt-3 text-2xl font-semibold text-white">
              {mode === "sign-in" ? "Sign in" : "Create account"}
            </h2>
            <p className="mt-2 text-sm text-slate-400" id={descriptionId}>
              {message ??
                (mode === "sign-in"
                  ? "Use your email and password to continue without leaving the gallery."
                  : "Create an account to unlock uploads and saved favorites.")}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-slate-700 p-2 text-slate-300 transition hover:border-slate-500 hover:text-white"
            aria-label="Close authentication modal"
          >
            <svg
              viewBox="0 0 24 24"
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
            >
              <path d="m6 6 12 12M18 6 6 18" />
            </svg>
          </button>
        </div>

        <form className="mt-6 space-y-4" onSubmit={handleSubmit} noValidate>
          {mode === "sign-up" ? (
            <div>
              <label
                htmlFor="auth-name"
                className="block text-sm font-medium text-slate-200"
              >
                Name <span className="text-slate-500">(optional)</span>
              </label>
              <input
                id="auth-name"
                ref={nameRef}
                type="text"
                autoComplete="name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                className="mt-2 w-full rounded-2xl border border-slate-800 bg-slate-900 px-4 py-3 text-sm text-white outline-none transition focus:border-slate-600"
              />
            </div>
          ) : null}

          <div>
            <label
              htmlFor="auth-email"
              className="block text-sm font-medium text-slate-200"
            >
              Email
            </label>
            <input
              id="auth-email"
              ref={emailRef}
              type="email"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              aria-invalid={Boolean(fieldErrors.email)}
              aria-describedby={fieldErrors.email ? emailErrorId : undefined}
              className="mt-2 w-full rounded-2xl border border-slate-800 bg-slate-900 px-4 py-3 text-sm text-white outline-none transition focus:border-slate-600"
            />
            {fieldErrors.email ? (
              <p id={emailErrorId} className="mt-2 text-sm text-rose-300">
                {fieldErrors.email}
              </p>
            ) : null}
          </div>

          <div>
            <label
              htmlFor="auth-password"
              className="block text-sm font-medium text-slate-200"
            >
              Password
            </label>
            <input
              id="auth-password"
              type="password"
              autoComplete={
                mode === "sign-in" ? "current-password" : "new-password"
              }
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              aria-invalid={Boolean(fieldErrors.password)}
              aria-describedby={
                fieldErrors.password ? passwordErrorId : undefined
              }
              className="mt-2 w-full rounded-2xl border border-slate-800 bg-slate-900 px-4 py-3 text-sm text-white outline-none transition focus:border-slate-600"
            />
            {fieldErrors.password ? (
              <p id={passwordErrorId} className="mt-2 text-sm text-rose-300">
                {fieldErrors.password}
              </p>
            ) : null}
          </div>

          {mode === "sign-up" ? (
            <div>
              <label
                htmlFor="auth-confirm-password"
                className="block text-sm font-medium text-slate-200"
              >
                Confirm password
              </label>
              <input
                id="auth-confirm-password"
                type="password"
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                aria-invalid={Boolean(fieldErrors.confirmPassword)}
                aria-describedby={
                  fieldErrors.confirmPassword
                    ? confirmPasswordErrorId
                    : undefined
                }
                className="mt-2 w-full rounded-2xl border border-slate-800 bg-slate-900 px-4 py-3 text-sm text-white outline-none transition focus:border-slate-600"
              />
              {fieldErrors.confirmPassword ? (
                <p
                  id={confirmPasswordErrorId}
                  className="mt-2 text-sm text-rose-300"
                >
                  {fieldErrors.confirmPassword}
                </p>
              ) : null}
            </div>
          ) : null}

          <div aria-live="assertive" aria-atomic="true">
            {submitError ? (
              <p
                id={errorId}
                role="alert"
                className="rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200"
              >
                {submitError}
              </p>
            ) : null}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isSubmitting
              ? mode === "sign-in"
                ? "Signing in..."
                : "Creating account..."
              : mode === "sign-in"
                ? "Sign in"
                : "Create account"}
          </button>
        </form>

        <p className="mt-5 text-sm text-slate-400">
          {mode === "sign-in" ? "Need an account?" : "Already have an account?"}{" "}
          <button
            type="button"
            onClick={() => {
              resetErrors();
              onModeChange(mode === "sign-in" ? "sign-up" : "sign-in");
            }}
            className="font-medium text-white underline underline-offset-4"
          >
            {mode === "sign-in" ? "Create account" : "Sign in"}
          </button>
        </p>
      </div>
    </div>
  );
}
