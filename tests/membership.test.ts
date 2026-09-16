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
import { applyProviderStatus, processWaffoEvent, getMembership } from "../src/lib/membership/process-event";
import { isMemberNow, accessUntil, RENEWAL_GRACE_MS, type MembershipStatus } from "../src/lib/membership/entitlement";
import { displayAmountToCents, extractWaffoEventData, type WaffoEvent } from "../src/lib/membership/waffo";
import { getPlan, listPriceCents, plansFor, yearlySavings, yearlySavingsPercent } from "../src/lib/membership/plans";

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

test("yearly is the cheaper plan in both markets, and the advertised saving is the real one", () => {
  for (const market of ["global", "cn"] as const) {
    const { monthly, yearly } = plansFor(market);
    assert.equal(monthly.currency, yearly.currency, market);
    assert.ok(yearly.price < monthly.price * 12, `a year costs less than twelve months (${market})`);
    assert.equal(yearlySavings(market), Math.round((monthly.price * 12 - yearly.price) * 100) / 100);
  }
  assert.equal(yearlySavings("global"), 15.89);
  assert.equal(yearlySavingsPercent("global"), 44);
  assert.equal(yearlySavings("cn"), 58.9);
  assert.equal(yearlySavingsPercent("cn"), 50);
});

test("China is sold one-time CNY plans, everywhere else a USD subscription", () => {
  const cn = plansFor("cn");
  assert.deepEqual([cn.monthly.sku, cn.yearly.sku], ["plus_monthly_cn", "plus_yearly_cn"]);
  for (const plan of [cn.monthly, cn.yearly]) {
    assert.equal(plan.kind, "onetime");
    assert.equal(plan.currency, "CNY");
  }
  assert.deepEqual([cn.monthly.price, cn.yearly.price], [9.9, 59.9]);
  const global = plansFor("global");
  for (const plan of [global.monthly, global.yearly]) {
    assert.equal(plan.kind, "subscription");
    assert.equal(plan.currency, "USD");
  }
  assert.equal(listPriceCents("plus_yearly_cn"), 5990);
});

test("plans: prices, list price cents and yearly saving", () => {
  assert.equal(getPlan("plus_monthly")?.price, 2.99);
  assert.equal(getPlan("plus_yearly")?.price, 19.99);
  assert.equal(listPriceCents("plus_monthly"), 299);
  assert.equal(listPriceCents("nope"), null);
  assert.equal(yearlySavingsPercent("global"), 44);
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

test("a one-time purchase grants days, and buying again stacks on what is left", async () => {
  const cn = (amount: string, id?: string) =>
    ({ ...ev("order.completed", { orderMetadata: { userId: "u1", sku: "plus_yearly_cn" }, currency: "CNY", amount, orderId: "ORD_CN1" }, id) });

  assert.equal((await processWaffoEvent(db, cn("59.90"), { now: NOW })).outcome, "granted");
  const first = await getMembership(db, "u1");
  assert.equal(first?.status, "active");
  assert.equal(first?.currentPeriodEnd.getTime(), NOW.getTime() + 366 * DAY);
  // No renewal is coming, so no renewal grace on top.
  assert.equal(accessUntil(first)?.getTime(), first?.currentPeriodEnd.getTime());

  const later = new Date(NOW.getTime() + 30 * DAY);
  assert.equal((await processWaffoEvent(db, cn("59.90"), { now: later })).outcome, "extended");
  const second = await getMembership(db, "u1");
  assert.equal(second?.currentPeriodEnd.getTime(), first!.currentPeriodEnd.getTime() + 366 * DAY, "days are added, not reset");
});

test("a one-time purchase is checked against its own currency", async () => {
  const short = ev("order.completed", { orderMetadata: { userId: "u1", sku: "plus_yearly_cn" }, currency: "CNY", amount: "9.90" }, "cn-short");
  assert.equal((await processWaffoEvent(db, short, { now: NOW })).outcome, "ignored:underpaid");
  // 59.90 of the wrong currency is not 59.90 yuan.
  const wrongCurrency = ev("order.completed", { orderMetadata: { userId: "u1", sku: "plus_yearly_cn" }, currency: "USD", amount: "59.90" }, "cn-usd");
  assert.equal((await processWaffoEvent(db, wrongCurrency, { now: NOW })).outcome, "ignored:underpaid");
  assert.equal(await getMembership(db, "u1"), null);
});

test("order.completed for a subscription SKU is ignored", async () => {
  const wrongKind = ev("order.completed", { amount: "19.99", orderMetadata: { userId: "u1", sku: "plus_yearly" } }, "onetime-for-sub");
  assert.equal((await processWaffoEvent(db, wrongKind, { now: NOW })).outcome, "ignored:event_type");
});

test("lifecycle events on one order share Waffo's id and are still all processed", async () => {
  // Observed in test mode: activated and canceling both arrive with id = the order id.
  const activated = ev("subscription.activated", { currentPeriodStart: "2026-09-15", currentPeriodEnd: "2026-10-15", amount: "2.99" }, "ORD_1");
  assert.equal((await processWaffoEvent(db, activated, { now: NOW })).outcome, "granted");
  const canceling = { ...ev("subscription.canceling", {}, "ORD_1"), timestamp: "2026-09-16T00:00:00Z" };
  assert.equal((await processWaffoEvent(db, canceling, { now: NOW })).outcome, "canceling");
  assert.equal((await processWaffoEvent(db, canceling, { now: NOW })).outcome, "duplicate");
  assert.equal((await getMembership(db, "u1"))?.status, "canceling");
});

test("cancel and resume apply Waffo's returned status to the same order only", async () => {
  await processWaffoEvent(db, ev("subscription.payment_succeeded", { amount: "2.99", paymentDate: "2026-09-15" }), { now: NOW });
  const cancel = { userId: "u1", orderId: "ORD_1", from: ["active", "past_due"] as MembershipStatus[], to: "canceling" as const };
  assert.equal(await applyProviderStatus(db, { ...cancel, orderId: "ORD_old" }), false, "another order is untouched");
  assert.equal(await applyProviderStatus(db, cancel), true);
  assert.equal((await getMembership(db, "u1"))?.status, "canceling");
  assert.equal(await applyProviderStatus(db, cancel), false, "not from canceling");
  assert.equal(await applyProviderStatus(db, { userId: "u1", orderId: "ORD_1", from: ["canceling"], to: "active" }), true);
  assert.equal((await getMembership(db, "u1"))?.status, "active");
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
