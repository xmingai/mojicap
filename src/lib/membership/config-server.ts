import "server-only";
import { databaseUrl } from "../db";
import { MEMBERSHIP_UI_ENABLED } from "./config";

export function authSecretConfigured(): boolean {
  if (process.env.BETTER_AUTH_SECRET?.trim()) return true;
  // better-auth ships a dev default; never allow it in production.
  return process.env.NODE_ENV !== "production";
}

/**
 * Server routes answer 503 while this is false, so a half-configured deployment
 * degrades to "feature off" instead of throwing on every request.
 */
export function membershipBackendReady(): boolean {
  return MEMBERSHIP_UI_ENABLED && databaseUrl() !== null && authSecretConfigured();
}
