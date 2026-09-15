#!/usr/bin/env node
/**
 * Apply pending migrations from ./drizzle to the configured database.
 *
 *   node scripts/db-migrate.mjs                       # local .data/local.db
 *   TURSO_DATABASE_URL=libsql://… TURSO_AUTH_TOKEN=… node scripts/db-migrate.mjs
 */
import { mkdirSync } from "node:fs";
import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import { migrate } from "drizzle-orm/libsql/migrator";

const url = process.env.TURSO_DATABASE_URL || "file:.data/local.db";
if (url.startsWith("file:")) mkdirSync(".data", { recursive: true });

const client = createClient({ url, authToken: process.env.TURSO_AUTH_TOKEN || undefined });
await migrate(drizzle(client), { migrationsFolder: "./drizzle" });
console.log(`Migrations applied → ${url.startsWith("file:") ? url : url.replace(/\/\/.*@/, "//***@")}`);
client.close();
