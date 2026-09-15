import test, { before, beforeEach } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import { migrate } from "drizzle-orm/libsql/migrator";
import { sql } from "drizzle-orm";
import * as schema from "../src/lib/db/schema";
import type { DB } from "../src/lib/db";
import { processWaffoEvent, getMembership } from "../src/lib/membership/process-event";
import { isMemberNow, accessUntil, RENEWAL_GRACE_MS } from "../src/lib/membership/entitlement";
import { displayAmountToCents, extractWaffoEventData, type WaffoEvent } from "../src/lib/membership/waffo";
import { getPlan, listPriceCents, yearlySavingsPercent } from "../src/lib/membership/plans";

const DAY = 86_400_000;
let db: DB;
let seq = 0;

before(async () => {
  const dir = mkdtempSync(join(tmpdir(), "mojicap-membership-"));
  const client = createClient({ url: `file:${join(dir, "test.db")}` });
  db = drizzle(client, { schema });
  await migrate(db, { migrationsFolder: "./drizzle" });
});

beforeEach(async () => {
  await db.run(sql`DELETE FROM billing_event`);
  await db.run(sql`DELETE FROM membership`);
  await db.run(sql`DELETE FROM user`);
  await db.insert(schema.user).values({ id: "u1", name: "Test", email: "u1@example.com" });
});

function ev(eventType: string, data: Record<string, unknown>, id?: string): WaffoEvent {
  return {
    id: id ?? `evt-${++seq}`,
    timestamp: new Date().toISOString(),
    eventType,
    eventId: "PAY_x",
    storeId: "STO_x",
    storeName: "MojiCap",
    mode: "test",
    data: { orderMetadata: { userId: "u1", sku: "plus_monthly" }, orderId: "ORD_1", currency: "USD", ...data },
  };
}

const NOW = new Date("2026-09-15T00:00:00Z");

test("plans: prices, list price cents and yearly saving", () => {
  assert.equal(getPlan("plus_monthly")?.priceUsd, 2.99);
  assert.equal(getPlan("plus_yearly")?.priceUsd, 19.99);
  assert.equal(listPriceCents("plus_monthly"), 299);
  assert.equal(listPriceCents("nope"), null);
  assert.equal(yearlySavingsPercent(), 44);
});

test("amounts: display strings convert without float drift", () => {
  assert.equal(displayAmountToCents("2.99"), 299);
  assert.equal(displayAmountToCents("19.9"), 1990);
  assert.equal(displayAmountToCents("20"), 2000);
  assert.equal(displayAmountToCents("abc"), null);
  assert.equal(displayAmountToCents(2.99), null);
});

test("extract: requires our metadata and a SKU we sell", () => {
  assert.equal(extractWaffoEventData(ev("x", { orderMetadata: {} })), null);
  assert.equal(extractWaffoEventData(ev("x", { orderMetadata: { userId: "u1", sku: "pack-s" } })), null);
  assert.equal(extractWaffoEventData(ev("x", {}))?.plan.sku, "plus_monthly");
});

test("first payment grants a membership for one period", async () => {
  const r = await processWaffoEvent(db, ev("subscription.payment_succeeded", { amount: "2.99", paymentId: "PAY_1", paymentDate: "2026-09-15" }), { now: NOW });
  assert.equal(r.outcome, "granted");
  const m = await getMembership(db, "u1");
  assert.equal(m?.status, "active");
  assert.equal(m?.orderId, "ORD_1");
  assert.equal(m?.currentPeriodEnd.getTime(), Date.parse("2026-09-15") + 31 * DAY);
  assert.equal(isMemberNow(m, NOW.getTime()), true);
});

test("activated with an exact period end, then the charge: end never moves backwards", async () => {
  await processWaffoEvent(db, ev("subscription.activated", { amount: "2.99", currentPeriodStart: "2026-09-15", currentPeriodEnd: "2026-10-15" }), { now: NOW });
  const r = await processWaffoEvent(db, ev("subscription.payment_succeeded", { amount: "2.99", paymentDate: "2026-09-15" }), { now: NOW });
  assert.equal(r.outcome, "extended");
  const m = await getMembership(db, "u1");
  assert.equal(m?.currentPeriodEnd.getTime(), Date.parse("2026-09-15") + 31 * DAY);
});

test("redelivered event is a no-op", async () => {
  const e = ev("subscription.payment_succeeded", { amount: "2.99", paymentDate: "2026-09-15" }, "same-id");
  assert.equal((await processWaffoEvent(db, e, { now: NOW })).outcome, "granted");
  assert.equal((await processWaffoEvent(db, e, { now: NOW })).outcome, "duplicate");
});

test("a charge below list price never grants", async () => {
  const r = await processWaffoEvent(db, ev("subscription.payment_succeeded", { amount: "0.00", paymentDate: "2026-09-15" }), { now: NOW });
  assert.equal(r.outcome, "ignored:underpaid");
  assert.equal(await getMembership(db, "u1"), null);
});

test("a platform-applied trial window never grants", async () => {
  const r = await processWaffoEvent(db, ev("subscription.activated", { currentPeriodStart: "2026-09-15", currentPeriodEnd: "2026-09-18" }), { now: NOW });
  assert.equal(r.outcome, "ignored:trial");
});

test("events without our metadata are recorded and ignored", async () => {
  const r = await processWaffoEvent(db, ev("subscription.payment_succeeded", { orderMetadata: {} }), { now: NOW });
  assert.equal(r.outcome, "ignored:no_metadata");
});

test("renewal extends from the new payment date", async () => {
  await processWaffoEvent(db, ev("subscription.payment_succeeded", { amount: "2.99", paymentDate: "2026-08-15" }), { now: NOW });
  const r = await processWaffoEvent(db, ev("subscription.payment_succeeded", { amount: "2.99", paymentDate: "2026-09-15" }), { now: NOW });
  assert.equal(r.outcome, "extended");
  assert.equal((await getMembership(db, "u1"))?.currentPeriodEnd.getTime(), Date.parse("2026-09-15") + 31 * DAY);
});

test("cancel keeps access to period end; uncancel restores; late activated keeps the cancel", async () => {
  await processWaffoEvent(db, ev("subscription.payment_succeeded", { amount: "2.99", paymentDate: "2026-09-15" }), { now: NOW });
  assert.equal((await processWaffoEvent(db, ev("subscription.canceling", {}), { now: NOW })).outcome, "canceling");
  let m = await getMembership(db, "u1");
  assert.equal(isMemberNow(m, NOW.getTime()), true);
  assert.equal(accessUntil(m)?.getTime(), m?.currentPeriodEnd.getTime(), "no renewal grace once canceling");

  await processWaffoEvent(db, ev("subscription.activated", { currentPeriodStart: "2026-09-15", currentPeriodEnd: "2026-10-15" }), { now: NOW });
  assert.equal((await getMembership(db, "u1"))?.status, "canceling");

  assert.equal((await processWaffoEvent(db, ev("subscription.uncanceled", {}), { now: NOW })).outcome, "uncanceled");
  m = await getMembership(db, "u1");
  assert.equal(m?.status, "active");
  assert.equal(accessUntil(m)?.getTime(), m!.currentPeriodEnd.getTime() + RENEWAL_GRACE_MS);
});

test("invalid transitions are ignored", async () => {
  await processWaffoEvent(db, ev("subscription.payment_succeeded", { amount: "2.99", paymentDate: "2026-09-15" }), { now: NOW });
  assert.equal((await processWaffoEvent(db, ev("subscription.uncanceled", {}), { now: NOW })).outcome, "ignored:invalid_transition");
  assert.equal((await processWaffoEvent(db, ev("subscription.canceling", {}, "no-row-check"), { now: NOW })).outcome, "canceling");
  assert.equal((await processWaffoEvent(db, ev("subscription.past_due", {}), { now: NOW })).outcome, "ignored:invalid_transition");
});

test("past due keeps access; canceled ends at period end", async () => {
  await processWaffoEvent(db, ev("subscription.payment_succeeded", { amount: "2.99", paymentDate: "2026-09-15" }), { now: NOW });
  assert.equal((await processWaffoEvent(db, ev("subscription.past_due", { amount: "2.99" }), { now: NOW })).outcome, "past_due");
  assert.equal(isMemberNow(await getMembership(db, "u1"), NOW.getTime()), true);
  assert.equal((await processWaffoEvent(db, ev("subscription.canceled", {}), { now: NOW })).outcome, "canceled");
  const m = await getMembership(db, "u1");
  assert.equal(isMemberNow(m, m!.currentPeriodEnd.getTime() - 1), true);
  assert.equal(isMemberNow(m, m!.currentPeriodEnd.getTime() + 1), false);
});

test("refund revokes immediately", async () => {
  await processWaffoEvent(db, ev("subscription.payment_succeeded", { amount: "2.99", paymentDate: "2026-09-15" }), { now: NOW });
  assert.equal((await processWaffoEvent(db, ev("refund.succeeded", { amount: "2.99", total: "2.99" }), { now: NOW })).outcome, "refunded");
  const m = await getMembership(db, "u1");
  assert.equal(isMemberNow(m, NOW.getTime()), false);
  assert.equal(accessUntil(m), null);
});

test("events for an older order don't touch a newer subscription", async () => {
  await processWaffoEvent(db, ev("subscription.payment_succeeded", { amount: "2.99", paymentDate: "2026-09-15", orderId: "ORD_NEW" }), { now: NOW });
  const r = await processWaffoEvent(db, ev("refund.succeeded", { orderId: "ORD_OLD" }), { now: NOW });
  assert.equal(r.outcome, "ignored:other_order");
  assert.equal((await getMembership(db, "u1"))?.status, "active");
});

test("resubscribing after a lapse starts a fresh period", async () => {
  await processWaffoEvent(db, ev("subscription.payment_succeeded", { amount: "19.99", paymentDate: "2025-01-01", orderMetadata: { userId: "u1", sku: "plus_yearly" } }), { now: NOW });
  await processWaffoEvent(db, ev("subscription.canceled", {}), { now: NOW });
  const r = await processWaffoEvent(db, ev("subscription.payment_succeeded", { amount: "2.99", paymentDate: "2026-09-15", orderId: "ORD_2" }), { now: NOW });
  assert.equal(r.outcome, "granted");
  const m = await getMembership(db, "u1");
  assert.equal(m?.sku, "plus_monthly");
  assert.equal(m?.status, "active");
  assert.equal(m?.orderId, "ORD_2");
});

test("unknown event types are acknowledged and ignored", async () => {
  assert.equal((await processWaffoEvent(db, ev("order.completed", {}), { now: NOW })).outcome, "ignored:event_type");
});
