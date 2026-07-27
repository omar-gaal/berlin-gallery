import "server-only";

import { betterAuth } from "better-auth";
import { drizzleAdapter } from "@better-auth/drizzle-adapter";

import { env } from "./env";
import { db } from "@/db/index";
import { accounts, sessions, users, verifications } from "@/db/schema";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      user: users,
      session: sessions,
      account: accounts,
      verification: verifications,
    },
  }),
  emailAndPassword: {
    enabled: true,
  },
  secret: env.betterAuthSecret,
  baseURL: env.betterAuthUrl,
  advanced: {
    database: {
      generateId: "uuid",
    },
  },
});

export async function getCurrentSession(request: Request) {
  return auth.api.getSession({
    headers: request.headers,
    query: {
      disableCookieCache: true,
    },
  });
}

export async function requireUser(request: Request) {
  const session = await getCurrentSession(request);

  if (!session || !session.session || !session.user) {
    throw new Error("Authentication required");
  }

  return session;
}
