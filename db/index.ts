import "server-only";

import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import { env } from "../lib/env";
import * as schema from "./schema";

type DbInstance = ReturnType<typeof drizzle>;

const globalForDb = globalThis as typeof globalThis & {
  postgresSql?: postgres.Sql;
  drizzleDb?: DbInstance;
};

const client = globalForDb.postgresSql ?? postgres(env.databaseUrl, { max: 1 });

globalForDb.postgresSql = client;

export const db = globalForDb.drizzleDb ?? drizzle(client, { schema });
globalForDb.drizzleDb = db;
