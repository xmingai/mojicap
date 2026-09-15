/**
 * Client-safe feature switch for accounts + MojiCap Plus.
 * Server-side readiness checks live in config-server.ts (they touch the database module).
 *
 * Production stays exactly as it is until every piece is configured:
 *   NEXT_PUBLIC_MEMBERSHIP_ENABLED=true   shows sign-in, pricing and member UI (inlined at build)
 *   TURSO_DATABASE_URL / TURSO_AUTH_TOKEN database
 *   BETTER_AUTH_SECRET / BETTER_AUTH_URL  auth
 *   WAFFO_*                               checkout (see lib/membership/waffo.ts)
 *   RESEND_API_KEY / EMAIL_FROM           sign-in codes (dev logs them instead)
 */

export const MEMBERSHIP_UI_ENABLED = process.env.NEXT_PUBLIC_MEMBERSHIP_ENABLED === "true";
