/**
 * Entitlement is derived from the membership row, never stored, so there is
 * no second copy of the truth to drift out of sync.
 */

import { getPlan } from "./plans";

export type MembershipStatus = "active" | "canceling" | "past_due" | "canceled" | "refunded";

export type MembershipRow = {
  sku: string;
  status: MembershipStatus;
  currentPeriodEnd: Date;
};

/**
 * Renewals are charged at the period boundary and the webhook can arrive
 * hours later, so a renewing member keeps access for a short grace window
 * instead of flickering to "free" at midnight.
 */
export const RENEWAL_GRACE_MS = 3 * 86_400_000;

/** The last instant this row grants access. Null means no access at all. */
export function accessUntil(row: MembershipRow | null | undefined): Date | null {
  if (!row) return null;
  const end = row.currentPeriodEnd.getTime();
  // Nothing renews a one-time purchase, so there is no late renewal to wait for.
  const renewing = getPlan(row.sku)?.kind !== "onetime";
  switch (row.status) {
    case "active":
    case "past_due":
      return new Date(renewing ? end + RENEWAL_GRACE_MS : end);
    // A cancel means "don't renew": access runs to the end of what was paid for.
    case "canceling":
    case "canceled":
      return new Date(end);
    case "refunded":
      return null;
  }
}

export function isMemberNow(row: MembershipRow | null | undefined, now: number = Date.now()): boolean {
  const until = accessUntil(row);
  return until !== null && until.getTime() > now;
}
