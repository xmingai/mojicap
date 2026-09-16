/**
 * MojiCap Plus plans — the single source of truth for SKUs and prices.
 * scripts/waffo-setup.mjs reads this file to create the Waffo products, and
 * the webhook uses it to validate what a charge actually collected.
 */

export type PlanInterval = "monthly" | "yearly";

export type Plan = {
  sku: "plus_monthly" | "plus_yearly";
  interval: PlanInterval;
  /** List price in USD, tax included (Waffo is merchant of record). */
  priceUsd: number;
  /** Length of one paid period, used when an event carries no period end. */
  periodDays: number;
  /** Product name shown on Waffo's checkout page and receipts. */
  productName: string;
};

export const PLANS: readonly Plan[] = [
  { sku: "plus_monthly", interval: "monthly", priceUsd: 2.99, periodDays: 31, productName: "MojiCap Plus (Monthly)" },
  { sku: "plus_yearly", interval: "yearly", priceUsd: 19.99, periodDays: 366, productName: "MojiCap Plus (Yearly)" },
] as const;

export type PlanSku = Plan["sku"];

export function getPlan(sku: string): Plan | null {
  return PLANS.find((p) => p.sku === sku) ?? null;
}

export function listPriceCents(sku: string): number | null {
  const plan = getPlan(sku);
  return plan ? Math.round(plan.priceUsd * 100) : null;
}

/** Yearly saving versus twelve monthly payments, in dollars. */
export function yearlySavingsUsd(): number {
  const monthly = getPlan("plus_monthly")!.priceUsd;
  const yearly = getPlan("plus_yearly")!.priceUsd;
  return Math.round((monthly * 12 - yearly) * 100) / 100;
}

/** Yearly saving versus twelve monthly payments, as a whole percentage. */
export function yearlySavingsPercent(): number {
  const monthly = getPlan("plus_monthly")!.priceUsd;
  const yearly = getPlan("plus_yearly")!.priceUsd;
  return Math.round((1 - yearly / (monthly * 12)) * 100);
}
