/**
 * Database client — Turso (libSQL) in production, a local SQLite file in dev.
 *
 * Env:
 *   TURSO_DATABASE_URL   libsql://<db>-<org>.turso.io
 *   TURSO_AUTH_TOKEN     database token
 * When TURSO_DATABASE_URL is unset outside production, a local file database
 * at .data/local.db is used so the whole membership flow runs locally.
 */

import { createClient, type Client } from "@libsql/client";
import { drizzle, type LibSQLDatabase } from "drizzle-orm/libsql";
import * as schema from "./schema";

export type DB = LibSQLDatabase<typeof schema>;

const LOCAL_DB_URL = "file:.data/local.db";

export function databaseUrl(): string | null {
  const url = process.env.TURSO_DATABASE_URL?.trim();
  if (url) return url;
  return process.env.NODE_ENV === "production" ? null : LOCAL_DB_URL;
}

let client: Client | null = null;
let db: DB | null = null;

/** Lazy singleton so importing this module never opens a connection at build time. */
export function getDB(): DB {
  if (db) return db;
  const url = databaseUrl();
  if (!url) throw new Error("Database is not configured (TURSO_DATABASE_URL)");
  client = createClient({ url, authToken: process.env.TURSO_AUTH_TOKEN?.trim() || undefined });
  db = drizzle(client, { schema });
  return db;
}

export { schema };
