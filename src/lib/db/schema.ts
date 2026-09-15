/**
 * Database schema (Turso / libSQL, SQLite dialect).
 *
 * Two groups of tables:
 *  - better-auth core tables (user, session, account, verification, rateLimit).
 *    Column names follow better-auth's defaults; dates are Date objects stored
 *    as epoch milliseconds, which is what the drizzle adapter round-trips.
 *  - MojiCap tables: membership (one row per user), billing_event (webhook
 *    idempotency + audit), and the member benefits' storage (favorites,
 *    synced recents, custom combos).
 *
 * Migrations are generated from this file: `npm run db:generate`.
 */

import { sql } from "drizzle-orm";
import { index, integer, primaryKey, sqliteTable, text } from "drizzle-orm/sqlite-core";

const createdAt = () =>
  integer("createdAt", { mode: "timestamp_ms" }).notNull().default(sql`(unixepoch() * 1000)`);
const updatedAt = () =>
  integer("updatedAt", { mode: "timestamp_ms" }).notNull().default(sql`(unixepoch() * 1000)`);

// ── better-auth ─────────────────────────────────────────────────────────

export const user = sqliteTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: integer("emailVerified", { mode: "boolean" }).notNull().default(false),
  image: text("image"),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
});

export const session = sqliteTable(
  "session",
  {
    id: text("id").primaryKey(),
    expiresAt: integer("expiresAt", { mode: "timestamp_ms" }).notNull(),
    token: text("token").notNull().unique(),
    ipAddress: text("ipAddress"),
    userAgent: text("userAgent"),
    userId: text("userId")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [index("session_userId_idx").on(t.userId)],
);

export const account = sqliteTable(
  "account",
  {
    id: text("id").primaryKey(),
    accountId: text("accountId").notNull(),
    providerId: text("providerId").notNull(),
    userId: text("userId")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    accessToken: text("accessToken"),
    refreshToken: text("refreshToken"),
    idToken: text("idToken"),
    accessTokenExpiresAt: integer("accessTokenExpiresAt", { mode: "timestamp_ms" }),
    refreshTokenExpiresAt: integer("refreshTokenExpiresAt", { mode: "timestamp_ms" }),
    scope: text("scope"),
    password: text("password"),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [index("account_userId_idx").on(t.userId)],
);

export const verification = sqliteTable(
  "verification",
  {
    id: text("id").primaryKey(),
    identifier: text("identifier").notNull(),
    value: text("value").notNull(),
    expiresAt: integer("expiresAt", { mode: "timestamp_ms" }).notNull(),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [index("verification_identifier_idx").on(t.identifier)],
);

/** Database-backed rate limiting: in-memory limits don't survive serverless instances. */
export const rateLimit = sqliteTable("rateLimit", {
  id: text("id").primaryKey(),
  key: text("key").notNull().unique(),
  count: integer("count").notNull(),
  lastRequest: integer("lastRequest").notNull(),
});

// ── Membership ─────────────────────────────────────────────────────────

/**
 * One row per user who has ever bought a plan. Entitlement is derived, never
 * stored: see isMemberNow() in lib/membership/entitlement.ts.
 *
 * status:
 *   active    — paid and renewing
 *   canceling — cancel requested; access continues until currentPeriodEnd
 *   past_due  — renewal charge failed; access continues until currentPeriodEnd
 *   canceled  — subscription ended
 *   refunded  — money returned; access revoked immediately
 */
export const membership = sqliteTable("membership", {
  userId: text("userId")
    .primaryKey()
    .references(() => user.id, { onDelete: "cascade" }),
  sku: text("sku").notNull(),
  status: text("status", { enum: ["active", "canceling", "past_due", "canceled", "refunded"] }).notNull(),
  provider: text("provider").notNull().default("waffo"),
  /** Waffo identifies a subscription by its ORDER id (ORD_…). */
  orderId: text("orderId"),
  /** Real (or best-estimate) end of the paid period; access adds a small grace on top. */
  currentPeriodEnd: integer("currentPeriodEnd", { mode: "timestamp_ms" }).notNull(),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
});

/**
 * Every processed webhook event, keyed by provider event id. Makes webhook
 * handling idempotent (Waffo retries deliveries) and leaves an audit trail.
 */
export const billingEvent = sqliteTable(
  "billing_event",
  {
    id: text("id").primaryKey(),
    provider: text("provider").notNull(),
    eventType: text("eventType").notNull(),
    userId: text("userId"),
    sku: text("sku"),
    orderId: text("orderId"),
    paymentId: text("paymentId"),
    amountCents: integer("amountCents"),
    outcome: text("outcome").notNull(),
    createdAt: createdAt(),
  },
  (t) => [index("billing_event_userId_idx").on(t.userId)],
);

// ── Member benefits: cloud storage ─────────────────────────────────────

export const favorite = sqliteTable(
  "favorite",
  {
    userId: text("userId")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    emoji: text("emoji").notNull(),
    createdAt: createdAt(),
  },
  (t) => [primaryKey({ columns: [t.userId, t.emoji] })],
);

/** Recently used emojis, synced as one ordered list per user. */
export const recentList = sqliteTable("recent_list", {
  userId: text("userId")
    .primaryKey()
    .references(() => user.id, { onDelete: "cascade" }),
  /** JSON array of emoji strings, most recent first. */
  items: text("items").notNull().default("[]"),
  updatedAt: updatedAt(),
});

export const customCombo = sqliteTable(
  "custom_combo",
  {
    id: text("id").primaryKey(),
    userId: text("userId")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    /** The combo's text exactly as the user copies it. */
    content: text("content").notNull(),
    createdAt: createdAt(),
  },
  (t) => [index("custom_combo_userId_idx").on(t.userId)],
);
