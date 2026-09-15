/**
 * Waffo Pancake adapter — checkout sessions, subscription operations and
 * webhook payload parsing. Ported from PixFlow's lib/waffo-billing.ts, minus
 * the credits ledger, trials and prompt moderation MojiCap doesn't have.
 *
 * Waffo facts the rest of the app relies on:
 *  - A subscription's identity is its ORDER id (ORD_…): cancel and reactivate
 *    take orderId, so that is what membership.orderId stores.
 *  - Checkouts are AUTHENTICATED (buyerIdentity = our user id). That lets the
 *    resume route act as the customer, and ties orders to accounts.
 *  - Checkout metadata (userId, sku) comes back as `orderMetadata` on EVERY
 *    event — first payment, renewals and refunds — so no lookup table is needed.
 *  - Webhook signatures are RSA with public keys embedded in the SDK: there is
 *    no webhook secret. Test vs production is decided by WAFFO_ENV plus the
 *    route's mode guard.
 *
 * Env: WAFFO_MERCHANT_ID, WAFFO_PRIVATE_KEY_BASE64 (or WAFFO_PRIVATE_KEY),
 * WAFFO_STORE_ID, WAFFO_ENV=production to leave test mode.
 */

import { WaffoPancake, verifyWebhook, type CashierLanguage, type WebhookEvent } from "@waffo/pancake-ts";
import { WAFFO_PRODUCT_IDS } from "./waffo-catalog.generated";
import { getPlan, type Plan } from "./plans";

// ── Client ─────────────────────────────────────────────────────────────

export function waffoEnvironment(): "test" | "production" {
  return process.env.WAFFO_ENV === "production" ? "production" : "test";
}

function waffoPrivateKey(): string | null {
  // WAFFO_PRIVATE_KEY_BASE64 accepts both encodings people actually paste:
  // base64 of the whole PEM, or the PEM's own base64 body without its header
  // (which decodes to binary DER — the SDK normalizes raw base64 itself).
  const b64 = process.env.WAFFO_PRIVATE_KEY_BASE64?.trim();
  if (b64) {
    try {
      const decoded = atob(b64);
      return decoded.includes("PRIVATE KEY") ? decoded : b64;
    } catch {
      return b64;
    }
  }
  const raw = process.env.WAFFO_PRIVATE_KEY;
  return raw && raw.trim() ? raw : null;
}

export function isWaffoConfigured(): boolean {
  return Boolean(process.env.WAFFO_MERCHANT_ID?.trim() && waffoPrivateKey() && process.env.WAFFO_STORE_ID?.trim());
}

let cachedClient: WaffoPancake | null = null;

export function getWaffoClient(): WaffoPancake {
  if (cachedClient) return cachedClient;
  const merchantId = process.env.WAFFO_MERCHANT_ID?.trim();
  const privateKey = waffoPrivateKey();
  if (!merchantId || !privateKey) throw new Error("Missing WAFFO_MERCHANT_ID / WAFFO_PRIVATE_KEY");
  cachedClient = new WaffoPancake({
    merchantId,
    privateKey,
    environment: waffoEnvironment() === "production" ? "prod" : "test",
  });
  return cachedClient;
}

// ── Checkout ───────────────────────────────────────────────────────────

export function waffoProductForSku(sku: string): string | null {
  const id = WAFFO_PRODUCT_IDS[sku];
  return id && id.trim() ? id : null;
}

/** Map our site locale to the closest checkout language Waffo supports. */
export function cashierLanguage(locale: string): CashierLanguage | undefined {
  const map: Record<string, CashierLanguage> = {
    en: "en",
    zh: "zh-Hans",
    ja: "ja-JP",
    ko: "ko-KR",
    es: "es-MX",
    ru: "ru-RU",
    pt: "pt-BR",
  };
  return map[locale];
}

export async function createWaffoCheckout(input: {
  plan: Plan;
  userId: string;
  email: string | null;
  locale: string;
  successUrl: string;
  source: string | null;
}): Promise<{ url: string }> {
  const productId = waffoProductForSku(input.plan.sku);
  if (!productId) {
    throw new Error(`No Waffo product for SKU ${input.plan.sku} — run scripts/waffo-setup.mjs --write`);
  }
  const language = cashierLanguage(input.locale);
  const session = await getWaffoClient().checkout.authenticated.create({
    productId,
    currency: "USD",
    buyerIdentity: input.userId,
    ...(input.email ? { buyerEmail: input.email } : {}),
    // We sell no trials. Say so explicitly: the platform can otherwise apply a
    // product-level trial to an eligible buyer on its own.
    withTrial: false,
    successUrl: input.successUrl,
    ...(language ? { language } : {}),
    metadata: {
      userId: input.userId,
      sku: input.plan.sku,
      ...(input.source ? { source: input.source } : {}),
    },
  });
  if (!session?.checkoutUrl) throw new Error("Waffo checkout session missing url");
  return { url: session.checkoutUrl };
}

// ── Subscription operations ────────────────────────────────────────────

/** Waffo's only cancellation semantic is "at period end" (active → canceling). */
export async function cancelWaffoSubscription(orderId: string): Promise<void> {
  await getWaffoClient().orders.cancelSubscription({ orderId });
}

/**
 * Withdraw a pending cancellation (canceling → active). Merchant keys can't do
 * this directly — reactivation is a customer action — so mint a session token
 * for the buyerIdentity stamped at checkout and act as the customer.
 */
export async function resumeWaffoSubscription(orderId: string, userId: string): Promise<void> {
  const client = getWaffoClient();
  const storeId = process.env.WAFFO_STORE_ID?.trim();
  if (!storeId) throw new Error("Missing WAFFO_STORE_ID");
  const { token } = await client.auth.issueSessionToken({ buyerIdentity: userId, storeId });
  await client.buyer(token).reactivateSubscription({ orderId });
}

/** Waffo's hosted customer portal (payment method, receipts, invoices). */
export const WAFFO_CUSTOMER_PORTAL_URL = "https://pancake.waffo.ai/consumer/portal/login";

// ── Webhooks ───────────────────────────────────────────────────────────

export type WaffoEvent = WebhookEvent<Record<string, unknown>>;

/** Verify signature and timestamp against both environments' embedded keys. Throws when invalid. */
export function verifyWaffoWebhook(rawBody: string, signature: string | null): WaffoEvent {
  return verifyWebhook(rawBody, signature) as WaffoEvent;
}

export type WaffoEventData = {
  userId: string;
  sku: string;
  plan: Plan;
  orderId: string | null;
  paymentId: string | null;
  /** Exact period end when the event carries one (activated). */
  periodEnd: Date | null;
  /** Payment day, the stable anchor for estimating a period when no end is sent. */
  paymentDate: Date | null;
  amountCents: number | null;
  /** Signals that the platform applied a trial we never offered. */
  looksLikeTrial: boolean;
};

function str(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function date(value: unknown): Date | null {
  const s = str(value);
  if (!s) return null;
  const ms = Date.parse(s);
  return Number.isFinite(ms) ? new Date(ms) : null;
}

/** Waffo amounts are display strings ("2.99") — convert without float drift. */
export function displayAmountToCents(value: unknown): number | null {
  if (typeof value !== "string" || !/^\d+(\.\d{1,2})?$/.test(value.trim())) return null;
  const [whole, frac = ""] = value.trim().split(".");
  return Number(whole) * 100 + Number((frac + "00").slice(0, 2));
}

/**
 * Pull what we need out of any Waffo event. Returns null when the event did not
 * come from our checkout (no userId/sku metadata) or names a SKU we don't sell.
 */
export function extractWaffoEventData(event: WaffoEvent): WaffoEventData | null {
  const data = (event.data ?? {}) as Record<string, unknown>;
  const metadata = (data.orderMetadata ?? {}) as Record<string, unknown>;
  const userId = str(metadata.userId) ?? str(data.merchantProvidedBuyerIdentity);
  const sku = str(metadata.sku);
  if (!userId || !sku) return null;
  const plan = getPlan(sku);
  if (!plan) return null;

  const periodStart = date(data.currentPeriodStart);
  const periodEnd = date(data.currentPeriodEnd);
  const spanDays = periodStart && periodEnd ? (periodEnd.getTime() - periodStart.getTime()) / 86_400_000 : null;

  return {
    userId,
    sku,
    plan,
    orderId: str(data.orderId),
    paymentId: str(data.paymentId),
    periodEnd,
    paymentDate: date(data.paymentDate),
    amountCents: displayAmountToCents(data.amount),
    // PixFlow observed the platform applying product trials unprompted. A trial
    // window is days, a real cycle is a month or a year.
    looksLikeTrial: str(data.orderStatus) === "trialing" || (spanDays !== null && spanDays <= 7),
  };
}
