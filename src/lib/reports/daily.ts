/**
 * The owner's daily numbers: sign-ups and paying customers for the previous
 * day in Beijing time, a seven-day trend, and running totals. Built from the
 * user, membership and billing_event tables; sent by the cron route in
 * app/api/cron/daily-report.
 *
 * A "charge" is money actually collected: a one-time order or a subscription
 * payment that granted or extended access. `subscription.activated` is left
 * out because it repeats the first payment (it carries no payment id).
 */

import { and, gte, inArray, isNotNull, lt } from "drizzle-orm";
import type { DB } from "@/lib/db";
import { billingEvent, membership, user } from "@/lib/db/schema";
import { getPlan } from "@/lib/membership/plans";
import { isMemberNow, type MembershipStatus } from "@/lib/membership/entitlement";

const DAY = 86_400_000;
const BEIJING_OFFSET = 8 * 3_600_000;
const CHARGE_EVENTS = ["order.completed", "subscription.payment_succeeded"];

export type Charge = {
  at: Date;
  email: string;
  sku: string;
  currency: string;
  amountCents: number;
  firstPurchase: boolean;
};

export type DayRow = { date: string; signups: number; newPaying: number; revenue: Record<string, number> };

export type DailyReport = {
  date: string;
  signups: { count: number; emails: { at: Date; email: string }[] };
  charges: Charge[];
  newPaying: number;
  renewals: number;
  revenue: Record<string, number>;
  refunds: { count: number; cents: Record<string, number> };
  cancellations: number;
  trend: DayRow[];
  totals: { users: number; activeMembers: number; bySku: Record<string, number> };
};

/** Start of the Beijing calendar day containing `at`, as a UTC instant. */
export function beijingDayStart(at: Date): Date {
  return new Date(Math.floor((at.getTime() + BEIJING_OFFSET) / DAY) * DAY - BEIJING_OFFSET);
}

/** YYYY-MM-DD of `at` in Beijing. */
export function beijingDate(at: Date): string {
  return new Date(at.getTime() + BEIJING_OFFSET).toISOString().slice(0, 10);
}

const add = (bucket: Record<string, number>, key: string, cents: number) => {
  bucket[key] = (bucket[key] ?? 0) + cents;
};

/** The report for the Beijing day before `now` (so a 09:00 run covers all of yesterday). */
export async function buildDailyReport(db: DB, now = new Date()): Promise<DailyReport> {
  const end = beijingDayStart(now);
  const start = new Date(end.getTime() - DAY);
  const trendStart = new Date(end.getTime() - 7 * DAY);

  const users = await db.select({ id: user.id, email: user.email, createdAt: user.createdAt }).from(user);
  const emailOf = new Map(users.map((u) => [u.id, u.email]));

  // Every charge ever, so "first purchase" means first for that user, not first this week.
  const chargeRows = await db
    .select()
    .from(billingEvent)
    .where(
      and(
        inArray(billingEvent.eventType, CHARGE_EVENTS),
        inArray(billingEvent.outcome, ["granted", "extended"]),
        isNotNull(billingEvent.paymentId),
      ),
    );
  chargeRows.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
  const seenPayer = new Set<string>();
  const allCharges: Charge[] = chargeRows.map((row) => {
    const firstPurchase = Boolean(row.userId) && !seenPayer.has(row.userId!);
    if (row.userId) seenPayer.add(row.userId);
    return {
      at: row.createdAt,
      email: (row.userId && emailOf.get(row.userId)) || "(deleted user)",
      sku: row.sku ?? "unknown",
      currency: getPlan(row.sku ?? "")?.currency ?? "USD",
      amountCents: row.amountCents ?? 0,
      firstPurchase,
    };
  });

  const inWindow = (at: Date, from: Date, to: Date) => at >= from && at < to;

  const trend: DayRow[] = [];
  for (let day = trendStart.getTime(); day < end.getTime(); day += DAY) {
    const from = new Date(day);
    const to = new Date(day + DAY);
    const revenue: Record<string, number> = {};
    const charges = allCharges.filter((c) => inWindow(c.at, from, to));
    for (const c of charges) add(revenue, c.currency, c.amountCents);
    trend.push({
      date: beijingDate(from),
      signups: users.filter((u) => inWindow(u.createdAt, from, to)).length,
      newPaying: charges.filter((c) => c.firstPurchase).length,
      revenue,
    });
  }

  const charges = allCharges.filter((c) => inWindow(c.at, start, end));
  const revenue: Record<string, number> = {};
  for (const c of charges) add(revenue, c.currency, c.amountCents);

  const lifecycle = await db
    .select({ outcome: billingEvent.outcome, sku: billingEvent.sku, amountCents: billingEvent.amountCents })
    .from(billingEvent)
    .where(
      and(
        inArray(billingEvent.outcome, ["refunded", "canceling"]),
        gte(billingEvent.createdAt, start),
        lt(billingEvent.createdAt, end),
      ),
    );
  const refunds = { count: 0, cents: {} as Record<string, number> };
  let cancellations = 0;
  for (const row of lifecycle) {
    if (row.outcome === "refunded") {
      refunds.count += 1;
      add(refunds.cents, getPlan(row.sku ?? "")?.currency ?? "USD", row.amountCents ?? 0);
    } else {
      cancellations += 1;
    }
  }

  const memberships = await db.select().from(membership);
  const bySku: Record<string, number> = {};
  let activeMembers = 0;
  for (const m of memberships) {
    if (!isMemberNow({ status: m.status as MembershipStatus, currentPeriodEnd: m.currentPeriodEnd, sku: m.sku }, now.getTime())) continue;
    activeMembers += 1;
    bySku[m.sku] = (bySku[m.sku] ?? 0) + 1;
  }

  const signups = users
    .filter((u) => inWindow(u.createdAt, start, end))
    .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
    .map((u) => ({ at: u.createdAt, email: u.email }));

  return {
    date: beijingDate(start),
    signups: { count: signups.length, emails: signups },
    charges,
    newPaying: charges.filter((c) => c.firstPurchase).length,
    renewals: charges.filter((c) => !c.firstPurchase).length,
    revenue,
    refunds,
    cancellations,
    trend,
    totals: { users: users.length, activeMembers, bySku },
  };
}

// ── Email ──────────────────────────────────────────────────────────────

const PLAN_LABEL: Record<string, string> = {
  plus_monthly: "月付订阅",
  plus_yearly: "年付订阅",
  plus_monthly_cn: "中国区 31 天",
  plus_yearly_cn: "中国区 366 天",
};

function money(cents: Record<string, number>): string {
  const parts = Object.entries(cents)
    .filter(([, value]) => value !== 0)
    .map(([currency, value]) =>
      new Intl.NumberFormat("zh-CN", { style: "currency", currency, currencyDisplay: "narrowSymbol" }).format(value / 100),
    );
  return parts.length ? parts.join(" + ") : "0";
}

const time = (at: Date) => new Date(at.getTime() + BEIJING_OFFSET).toISOString().slice(11, 16);

const escape = (value: string) =>
  value.replace(/[&<>"]/g, (ch) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[ch]!);

/** Names of the people in the lists are capped so a busy day stays a readable email. */
const LIST_CAP = 50;

export function renderDailyReport(r: DailyReport): { subject: string; html: string; text: string } {
  const subject = `MojiCap 日报 ${r.date}：新注册 ${r.signups.count}，新付费 ${r.newPaying}，收入 ${money(r.revenue)}`;

  const headline: [string, string][] = [
    ["新注册用户", String(r.signups.count)],
    ["新付费用户", String(r.newPaying)],
    ["续费 / 再次购买", String(r.renewals)],
    ["收入", money(r.revenue)],
    ["退款", r.refunds.count ? `${r.refunds.count} 笔，${money(r.refunds.cents)}` : "0"],
    ["取消自动续费", String(r.cancellations)],
  ];
  const totals: [string, string][] = [
    ["累计注册用户", String(r.totals.users)],
    ["当前有效会员", String(r.totals.activeMembers)],
    ...Object.entries(r.totals.bySku).map(([sku, n]): [string, string] => [`　${PLAN_LABEL[sku] ?? sku}`, String(n)]),
  ];

  const td = 'style="padding:6px 12px 6px 0;border-top:1px solid #e4e4e7;font-size:13px"';
  const th = 'style="padding:6px 12px 6px 0;text-align:left;font-size:12px;color:#71717a;font-weight:600"';
  const kv = (rows: [string, string][]) =>
    rows.map(([k, v]) => `<tr><td ${td}>${escape(k)}</td><td ${td}><b>${escape(v)}</b></td></tr>`).join("");
  const section = (title: string, body: string) =>
    `<tr><td style="padding-top:28px;font-size:15px;font-weight:700">${title}</td></tr><tr><td style="padding-top:8px">${body}</td></tr>`;
  const table = (head: string[], rows: string[][]) =>
    `<table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;border-collapse:collapse"><tr>${head
      .map((h) => `<th ${th}>${h}</th>`)
      .join("")}</tr>${rows.map((row) => `<tr>${row.map((c) => `<td ${td}>${escape(c)}</td>`).join("")}</tr>`).join("")}</table>`;
  const more = (n: number) => (n > LIST_CAP ? `<p style="font-size:12px;color:#71717a">另有 ${n - LIST_CAP} 条未列出</p>` : "");

  const chargeRows = r.charges
    .slice(0, LIST_CAP)
    .map((c) => [time(c.at), c.email, PLAN_LABEL[c.sku] ?? c.sku, money({ [c.currency]: c.amountCents }), c.firstPurchase ? "新付费" : "续费"]);
  const signupRows = r.signups.emails.slice(0, LIST_CAP).map((s) => [time(s.at), s.email]);
  const trendRows = r.trend.map((d) => [d.date.slice(5), String(d.signups), String(d.newPaying), money(d.revenue)]);

  const html = `<!doctype html><html><body style="margin:0;background:#f4f4f5;font-family:-apple-system,Segoe UI,Helvetica,Arial,sans-serif;color:#0a0a0a">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:24px 12px">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background:#ffffff;border-radius:16px;padding:28px">
<tr><td style="font-size:13px;color:#71717a">MojiCap 日报 · 北京时间 ${r.date}</td></tr>
${section("昨日", `<table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;border-collapse:collapse">${kv(headline)}</table>`)}
${section(`付费明细（${r.charges.length}）`, r.charges.length ? table(["时间", "邮箱", "方案", "金额", "类型"], chargeRows) + more(r.charges.length) : '<p style="font-size:13px;color:#71717a">昨日无付费</p>')}
${section(`新注册（${r.signups.count}）`, r.signups.count ? table(["时间", "邮箱"], signupRows) + more(r.signups.count) : '<p style="font-size:13px;color:#71717a">昨日无新注册</p>')}
${section("近 7 天", table(["日期", "注册", "新付费", "收入"], trendRows))}
${section("累计", `<table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;border-collapse:collapse">${kv(totals)}</table>`)}
</table></td></tr></table></body></html>`;

  const lines = [
    `MojiCap 日报 · 北京时间 ${r.date}`,
    "",
    ...headline.map(([k, v]) => `${k}：${v}`),
    "",
    `付费明细（${r.charges.length}）`,
    ...(chargeRows.length ? chargeRows.map((row) => row.join("  ")) : ["昨日无付费"]),
    "",
    `新注册（${r.signups.count}）`,
    ...(signupRows.length ? signupRows.map((row) => row.join("  ")) : ["昨日无新注册"]),
    "",
    "近 7 天（日期 注册 新付费 收入）",
    ...trendRows.map((row) => row.join("  ")),
    "",
    ...totals.map(([k, v]) => `${k.trim()}：${v}`),
  ];
  return { subject, html, text: lines.join("\n") };
}
