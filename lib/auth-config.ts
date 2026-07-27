import { betterAuth } from "better-auth";
import { drizzleAdapter } from "@better-auth/drizzle-adapter";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import { accounts, sessions, users, verifications } from "../db/schema";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL is required when generating Better Auth schema.");
}

const client = postgres(databaseUrl, { max: 1 });
const db = drizzle(client, { schema: { users, sessions, accounts, verifications } });

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
  secret: process.env.BETTER_AUTH_SECRET ?? "",
  baseURL: process.env.BETTER_AUTH_URL ?? "",
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
