/**
 * Request helpers shared by the membership API routes.
 */

import { getDB } from "../db";
import { getSessionUser } from "../auth";
import { membershipBackendReady } from "./config-server";
import { accessUntil, isMemberNow } from "./entitlement";
import { getMembership } from "./process-event";

export type SessionUser = { id: string; email: string; name: string };

export function json(body: unknown, status = 200) {
  return Response.json(body, { status, headers: { "Cache-Control": "no-store" } });
}

type Guard<T> = { ok: true; value: T } | { ok: false; response: Response };

export async function requireUser(request: Request): Promise<Guard<SessionUser>> {
  if (!membershipBackendReady()) return { ok: false, response: json({ error: "Accounts are not enabled", code: "DISABLED" }, 503) };
  const user = await getSessionUser(request);
  if (!user) return { ok: false, response: json({ error: "Sign in required", code: "UNAUTHORIZED" }, 401) };
  return { ok: true, value: user };
}

/** Signed in AND currently entitled — for member-only data (sync, combos). */
export async function requireMember(request: Request): Promise<Guard<SessionUser>> {
  const guard = await requireUser(request);
  if (!guard.ok) return guard;
  const row = await getMembership(getDB(), guard.value.id);
  if (!isMemberNow(row)) return { ok: false, response: json({ error: "MojiCap Plus required", code: "NOT_MEMBER" }, 403) };
  return guard;
}

export async function membershipSummary(userId: string) {
  const row = await getMembership(getDB(), userId);
  if (!row) return { isMember: false, plan: null };
  return {
    isMember: isMemberNow(row),
    plan: {
      sku: row.sku,
      status: row.status,
      currentPeriodEnd: row.currentPeriodEnd.toISOString(),
      accessUntil: accessUntil(row)?.toISOString() ?? null,
    },
  };
}

/** Where checkout returns and links point: the canonical site, not the request's host. */
export function siteOrigin(request: Request): string {
  const configured = process.env.BETTER_AUTH_URL?.trim().replace(/\/$/, "");
  if (configured) return configured;
  return new URL(request.url).origin;
}
