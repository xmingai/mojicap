/**
 * Feature switch for accounts + MojiCap Plus.
 *
 * Production stays exactly as it is until every piece is configured:
 *   NEXT_PUBLIC_MEMBERSHIP_ENABLED=true   shows sign-in, pricing and member UI (inlined at build)
 *   TURSO_DATABASE_URL / TURSO_AUTH_TOKEN database
 *   BETTER_AUTH_SECRET / BETTER_AUTH_URL  auth
 *   WAFFO_*                               checkout (see lib/membership/waffo.ts)
 *   RESEND_API_KEY / EMAIL_FROM           sign-in codes (dev logs them instead)
 *
 * Server routes check `membershipBackendReady()` and answer 503 when it's
 * false, so a half-configured deployment degrades to "feature off" rather than
 * throwing on every request.
 */

import { databaseUrl } from "../db";

/** Client-safe: whether member UI renders at all. */
export const MEMBERSHIP_UI_ENABLED = process.env.NEXT_PUBLIC_MEMBERSHIP_ENABLED === "true";

export function authSecretConfigured(): boolean {
  if (process.env.BETTER_AUTH_SECRET?.trim()) return true;
  // better-auth ships a dev default; never allow it in production.
  return process.env.NODE_ENV !== "production";
}

export function membershipBackendReady(): boolean {
  return MEMBERSHIP_UI_ENABLED && databaseUrl() !== null && authSecretConfigured();
}
