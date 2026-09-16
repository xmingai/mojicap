/**
 * MojiCap Plus plans — the single source of truth for SKUs, prices and markets.
 * scripts/waffo-setup.mjs reads this file to create the Waffo products, and the
 * webhook uses it to validate what a charge actually collected.
 *
 * Two markets, because Waffo only offers WeChat Pay on one-time products in
 * CNY: everywhere else Plus is a card subscription in USD, and in mainland
 * China it is a one-time purchase that simply adds days of access.
 */

export type PlanInterval = "monthly" | "yearly";
export type PlanKind = "subscription" | "onetime";
export type Market = "global" | "cn";

export type Plan = {
  sku: "plus_monthly" | "plus_yearly" | "plus_monthly_cn" | "plus_yearly_cn";
  market: Market;
  kind: PlanKind;
  interval: PlanInterval;
  /** ISO 4217 code the buyer is charged in. */
  currency: "USD" | "CNY";
  /** List price in `currency`, tax included (Waffo is merchant of record). */
  price: number;
  /** Days of access one payment buys (also the fallback when an event carries no period end). */
  periodDays: number;
  /** Product name shown on Waffo's checkout page and receipts. */
  productName: string;
};

export const PLANS: readonly Plan[] = [
  { sku: "plus_monthly", market: "global", kind: "subscription", interval: "monthly", currency: "USD", price: 2.99, periodDays: 31, productName: "MojiCap Plus (Monthly)" },
  { sku: "plus_yearly", market: "global", kind: "subscription", interval: "yearly", currency: "USD", price: 19.99, periodDays: 366, productName: "MojiCap Plus (Yearly)" },
  { sku: "plus_monthly_cn", market: "cn", kind: "onetime", interval: "monthly", currency: "CNY", price: 9.9, periodDays: 31, productName: "MojiCap Plus 会员 (1 个月)" },
  { sku: "plus_yearly_cn", market: "cn", kind: "onetime", interval: "yearly", currency: "CNY", price: 59.9, periodDays: 366, productName: "MojiCap Plus 会员 (1 年)" },
] as const;

export type PlanSku = Plan["sku"];

export function getPlan(sku: string): Plan | null {
  return PLANS.find((p) => p.sku === sku) ?? null;
}

/** The monthly and yearly plan a buyer in this market is offered. */
export function plansFor(market: Market): { monthly: Plan; yearly: Plan } {
  const monthly = PLANS.find((p) => p.market === market && p.interval === "monthly")!;
  const yearly = PLANS.find((p) => p.market === market && p.interval === "yearly")!;
  return { monthly, yearly };
}

export function planFor(market: Market, interval: PlanInterval): Plan {
  return plansFor(market)[interval];
}

/** List price in the smallest unit of the plan's own currency. */
export function listPriceCents(sku: string): number | null {
  const plan = getPlan(sku);
  return plan ? Math.round(plan.price * 100) : null;
}

/** Yearly saving versus twelve monthly payments in that market, in its currency. */
export function yearlySavings(market: Market): number {
  const { monthly, yearly } = plansFor(market);
  return Math.round((monthly.price * 12 - yearly.price) * 100) / 100;
}

/** Yearly saving versus twelve monthly payments, as a whole percentage. */
export function yearlySavingsPercent(market: Market): number {
  const { monthly, yearly } = plansFor(market);
  return Math.round((1 - yearly.price / (monthly.price * 12)) * 100);
}
