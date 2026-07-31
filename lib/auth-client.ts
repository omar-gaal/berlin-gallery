import { createAuthClient } from "better-auth/react";

const baseURL =
  typeof window === "undefined"
    ? new URL("/api/auth", process.env.BETTER_AUTH_URL ?? "http://localhost:3000").toString()
    : new URL("/api/auth", window.location.origin).toString();

export const authClient = createAuthClient({
  baseURL,
});
