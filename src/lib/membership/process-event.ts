/**
 * Waffo webhook → membership state machine.
 *
 * Kept separate from the HTTP route so it can be tested against a real
 * SQLite database with fixture events (Waffo signatures can't be forged in a
 * test, so verification stays in the route and everything after it lives here).
 *
 *   subscription.activated          first cycle; carries the exact period end
 *   subscription.payment_succeeded  every charge incl. renewals; carries the amount
 *   subscription.canceling          cancel requested → access to period end
 *   subscription.uncanceled         cancel withdrawn → active again
 *   subscription.past_due           renewal failed → keep access to period end
 *   subscription.canceled           subscription ended
 *   refund.succeeded                money back → revoke now
 *
 * Idempotency: every event id is recorded in billing_event; a redelivery is a
 * no-op. Out-of-order safety: period ends only ever move forward, and events
 * for an older order never touch a newer subscription.
 */

import { eq } from "drizzle-orm";
import type { DB } from "../db";
import { billingEvent, membership } from "../db/schema";
import type { MembershipStatus } from "./entitlement";
import { listPriceCents } from "./plans";
import { extractWaffoEventData, type WaffoEvent, type WaffoEventData } from "./waffo";

export type ProcessOutcome =
  | "duplicate"
  | "granted"
  | "extended"
  | "canceling"
  | "uncanceled"
  | "past_due"
  | "canceled"
  | "refunded"
  | "ignored:no_metadata"
  | "ignored:trial"
  | "ignored:underpaid"
  | "ignored:no_membership"
  | "ignored:other_order"
  | "ignored:invalid_transition"
  | "ignored:event_type";

export type ProcessResult = { outcome: ProcessOutcome; userId: string | null };

type Row = typeof membership.$inferSelect;

function addDays(from: Date, days: number): Date {
  return new Date(from.getTime() + days * 86_400_000);
}

/** An event for a previous order must not change the user's current subscription. */
function sameOrder(row: Row, data: WaffoEventData): boolean {
  return !row.orderId || !data.orderId || row.orderId === data.orderId;
}

export async function processWaffoEvent(
  db: DB,
  event: WaffoEvent,
  opts: { now?: Date } = {},
): Promise<ProcessResult> {
  const now = opts.now ?? new Date();
  const eventKey = `waffo:${event.id}`;

  return db.transaction(async (tx) => {
    const seen = await tx.select({ id: billingEvent.id }).from(billingEvent).where(eq(billingEvent.id, eventKey)).limit(1);
    if (seen.length > 0) return { outcome: "duplicate" as const, userId: null };

    const data = extractWaffoEventData(event);
    const record = async (outcome: ProcessOutcome) => {
      await tx
        .insert(billingEvent)
        .values({
          id: eventKey,
          provider: "waffo",
          eventType: event.eventType,
          userId: data?.userId ?? null,
          sku: data?.sku ?? null,
          orderId: data?.orderId ?? null,
          paymentId: data?.paymentId ?? null,
          amountCents: data?.amountCents ?? null,
          outcome,
          createdAt: now,
        })
        .onConflictDoNothing();
      return { outcome, userId: data?.userId ?? null };
    };

    if (!data) return record("ignored:no_metadata");

    const rows = await tx.select().from(membership).where(eq(membership.userId, data.userId)).limit(1);
    const row: Row | undefined = rows[0];

    const setStatus = async (status: MembershipStatus, extra: Partial<Row> = {}) => {
      await tx
        .update(membership)
        .set({ status, updatedAt: now, ...extra })
        .where(eq(membership.userId, data.userId));
    };

    switch (event.eventType) {
      case "subscription.activated":
      case "subscription.payment_succeeded": {
        // We sell no trials; a trial window here was applied by the platform
        // and must never be paid out as a full period.
        if (data.looksLikeTrial) return record("ignored:trial");
        // `activated` reports the LIST price, only the charge event reports what
        // was actually collected — so only that one is checked.
        if (event.eventType === "subscription.payment_succeeded") {
          const expected = listPriceCents(data.sku);
          if (expected !== null && (data.amountCents === null || data.amountCents < expected)) {
            return record("ignored:underpaid");
          }
        }

        const periodEnd = data.periodEnd ?? addDays(data.paymentDate ?? now, data.plan.periodDays);

        if (!row) {
          await tx.insert(membership).values({
            userId: data.userId,
            sku: data.sku,
            status: "active",
            provider: "waffo",
            orderId: data.orderId,
            currentPeriodEnd: periodEnd,
            createdAt: now,
            updatedAt: now,
          });
          return record("granted");
        }

        const isNewOrder = Boolean(data.orderId && row.orderId && data.orderId !== row.orderId);
        const lapsed = row.status === "canceled" || row.status === "refunded";
        const nextEnd =
          isNewOrder || lapsed
            ? periodEnd
            : new Date(Math.max(row.currentPeriodEnd.getTime(), periodEnd.getTime()));
        // A late `activated` must not undo a cancel the user already asked for on this order.
        const status: MembershipStatus = !isNewOrder && row.status === "canceling" ? "canceling" : "active";
        await setStatus(status, { sku: data.sku, orderId: data.orderId ?? row.orderId, currentPeriodEnd: nextEnd });
        return record(isNewOrder || lapsed ? "granted" : "extended");
      }

      case "subscription.canceling": {
        if (!row) return record("ignored:no_membership");
        if (!sameOrder(row, data)) return record("ignored:other_order");
        if (row.status !== "active" && row.status !== "past_due") return record("ignored:invalid_transition");
        await setStatus("canceling");
        return record("canceling");
      }

      case "subscription.uncanceled": {
        if (!row) return record("ignored:no_membership");
        if (!sameOrder(row, data)) return record("ignored:other_order");
        if (row.status !== "canceling") return record("ignored:invalid_transition");
        await setStatus("active");
        return record("uncanceled");
      }

      case "subscription.past_due": {
        if (!row) return record("ignored:no_membership");
        if (!sameOrder(row, data)) return record("ignored:other_order");
        if (row.status !== "active") return record("ignored:invalid_transition");
        await setStatus("past_due");
        return record("past_due");
      }

      case "subscription.canceled": {
        if (!row) return record("ignored:no_membership");
        if (!sameOrder(row, data)) return record("ignored:other_order");
        if (row.status === "refunded" || row.status === "canceled") return record("ignored:invalid_transition");
        await setStatus("canceled");
        return record("canceled");
      }

      case "refund.succeeded": {
        if (!row) return record("ignored:no_membership");
        if (!sameOrder(row, data)) return record("ignored:other_order");
        await setStatus("refunded", { currentPeriodEnd: now });
        return record("refunded");
      }

      default:
        // order.completed (we sell no one-time products), refund.failed,
        // subscription.updated, and any future event types.
        return record("ignored:event_type");
    }
  });
}

export async function getMembership(db: DB, userId: string): Promise<Row | null> {
  const rows = await db.select().from(membership).where(eq(membership.userId, userId)).limit(1);
  return rows[0] ?? null;
}
