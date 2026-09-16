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
import { beijingDate, beijingDayStart, buildDailyReport, renderDailyReport } from "../src/lib/reports/daily";

const HOUR = 3_600_000;
const DAY = 24 * HOUR;
let db: DB;

// 2026-09-17 09:00 Beijing = 01:00 UTC: the report covers 2026-09-16 Beijing.
const NOW = new Date("2026-09-17T01:00:00Z");
const YESTERDAY = new Date("2026-09-15T16:00:00Z"); // 2026-09-16 00:00 Beijing

before(async () => {
  const dir = mkdtempSync(join(tmpdir(), "mojicap-report-"));
  db = drizzle(createClient({ url: `file:${join(dir, "test.db")}` }), { schema });
  await migrate(db, { migrationsFolder: "./drizzle" });
});

beforeEach(async () => {
  await db.run(sql`DELETE FROM billing_event`);
  await db.run(sql`DELETE FROM membership`);
  await db.run(sql`DELETE FROM user`);
});

const addUser = (id: string, createdAt: Date) =>
  db.insert(schema.user).values({ id, name: id, email: `${id}@example.com`, emailVerified: true, createdAt, updatedAt: createdAt });

let seq = 0;
const addEvent = (v: { userId: string; eventType: string; outcome: string; sku: string; amountCents: number; at: Date; paymentId?: string | null }) =>
  db.insert(schema.billingEvent).values({
    id: `evt_${++seq}`,
    provider: "waffo",
    eventType: v.eventType,
    userId: v.userId,
    sku: v.sku,
    orderId: `ORD_${v.userId}`,
    paymentId: v.paymentId === undefined ? `PAY_${seq}` : v.paymentId,
    amountCents: v.amountCents,
    outcome: v.outcome,
    createdAt: v.at,
  });

test("Beijing day boundaries", () => {
  assert.equal(beijingDayStart(NOW).toISOString(), "2026-09-16T16:00:00.000Z");
  assert.equal(beijingDate(new Date("2026-09-16T15:59:59Z")), "2026-09-16");
  assert.equal(beijingDate(new Date("2026-09-16T16:00:00Z")), "2026-09-17");
});

test("counts yesterday's sign-ups, first purchases, renewals and revenue by currency", async () => {
  await addUser("old", new Date(YESTERDAY.getTime() - 40 * DAY));
  await addUser("a", new Date(YESTERDAY.getTime() + 2 * HOUR));
  await addUser("b", new Date(YESTERDAY.getTime() + 23 * HOUR));
  await addUser("today", new Date(NOW.getTime() - HOUR)); // after the window

  // "old" paid a month ago and renewed yesterday: a renewal, not a new payer.
  await addEvent({ userId: "old", eventType: "subscription.payment_succeeded", outcome: "granted", sku: "plus_monthly", amountCents: 299, at: new Date(YESTERDAY.getTime() - 31 * DAY) });
  await addEvent({ userId: "old", eventType: "subscription.payment_succeeded", outcome: "extended", sku: "plus_monthly", amountCents: 299, at: new Date(YESTERDAY.getTime() + HOUR) });
  // "a" subscribed yearly; the activated event repeats the payment and must not count twice.
  await addEvent({ userId: "a", eventType: "subscription.payment_succeeded", outcome: "granted", sku: "plus_yearly", amountCents: 1999, at: new Date(YESTERDAY.getTime() + 3 * HOUR) });
  await addEvent({ userId: "a", eventType: "subscription.activated", outcome: "extended", sku: "plus_yearly", amountCents: 1999, at: new Date(YESTERDAY.getTime() + 3 * HOUR), paymentId: null });
  // "b" bought the China yearly pass, then had it refunded.
  await addEvent({ userId: "b", eventType: "order.completed", outcome: "granted", sku: "plus_yearly_cn", amountCents: 5990, at: new Date(YESTERDAY.getTime() + 23 * HOUR + 60_000) });
  await addEvent({ userId: "b", eventType: "refund.succeeded", outcome: "refunded", sku: "plus_yearly_cn", amountCents: 5990, at: new Date(YESTERDAY.getTime() + 23 * HOUR + 120_000), paymentId: null });
  // Ignored charge and an event outside the window.
  await addEvent({ userId: "a", eventType: "order.completed", outcome: "ignored:underpaid", sku: "plus_yearly_cn", amountCents: 100, at: new Date(YESTERDAY.getTime() + 5 * HOUR) });

  await db.insert(schema.membership).values([
    { userId: "old", sku: "plus_monthly", status: "canceling", currentPeriodEnd: new Date(NOW.getTime() + 20 * DAY) },
    { userId: "a", sku: "plus_yearly", status: "active", currentPeriodEnd: new Date(NOW.getTime() + 365 * DAY) },
    { userId: "b", sku: "plus_yearly_cn", status: "refunded", currentPeriodEnd: new Date(YESTERDAY.getTime() + 23 * HOUR) },
  ]);

  const r = await buildDailyReport(db, NOW);
  assert.equal(r.date, "2026-09-16");
  assert.deepEqual(r.signups.emails.map((s) => s.email), ["a@example.com", "b@example.com"]);
  assert.equal(r.newPaying, 2);
  assert.equal(r.renewals, 1);
  assert.deepEqual(r.revenue, { USD: 2298, CNY: 5990 });
  assert.deepEqual(r.refunds, { count: 1, cents: { CNY: 5990 } });
  assert.equal(r.trend.length, 7);
  assert.equal(r.trend.at(-1)!.date, "2026-09-16");
  assert.equal(r.trend.at(-1)!.signups, 2);
  assert.equal(r.totals.users, 4);
  assert.equal(r.totals.activeMembers, 2);
  assert.deepEqual(r.totals.bySku, { plus_monthly: 1, plus_yearly: 1 });

  const email = renderDailyReport(r);
  assert.match(email.subject, /2026-09-16/);
  assert.match(email.subject, /新注册 2，新付费 2/);
  assert.match(email.text, /a@example\.com/);
  assert.doesNotMatch(email.html, /today@example\.com/);
});

test("an empty day still renders", async () => {
  const email = renderDailyReport(await buildDailyReport(db, NOW));
  assert.match(email.text, /昨日无付费/);
  assert.match(email.subject, /收入 0/);
});
