import { getDB } from "@/lib/db";
import { locales, type Locale } from "@/i18n/config";
import { localePath } from "@/lib/seo";
import { getPlan } from "@/lib/membership/plans";
import { marketFromRequest } from "@/lib/membership/market";
import { isMemberNow } from "@/lib/membership/entitlement";
import { getMembership } from "@/lib/membership/process-event";
import { createWaffoCheckout, isWaffoConfigured } from "@/lib/membership/waffo";
import { json, requireUser, siteOrigin } from "@/lib/membership/server";

/** POST { sku, locale, source? } → { url } of a Waffo checkout for the signed-in user. */
export async function POST(request: Request) {
  const guard = await requireUser(request);
  if (!guard.ok) return guard.response;
  const user = guard.value;

  if (!isWaffoConfigured()) return json({ error: "Checkout is not configured", code: "CHECKOUT_DISABLED" }, 503);

  const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
  const plan = typeof body.sku === "string" ? getPlan(body.sku) : null;
  if (!plan) return json({ error: "Unknown plan", code: "BAD_PLAN" }, 400);
  const locale: Locale = locales.includes(body.locale as Locale) ? (body.locale as Locale) : "en";
  const source = typeof body.source === "string" && /^[\w:-]{1,64}$/.test(body.source) ? body.source : null;

  // Prices differ by market, so the market decides which SKUs may be bought —
  // the UI only decides what to show.
  if (plan.market !== marketFromRequest(request)) {
    return json({ error: "That plan is not available here", code: "BAD_MARKET" }, 403);
  }

  // Don't sell a second subscription on top of a live one. One-time purchases
  // are different: buying again is how a member extends, so it stays allowed.
  const row = await getMembership(getDB(), user.id);
  if (plan.kind === "subscription" && isMemberNow(row)) {
    const code = row?.status === "canceling" ? "CAN_RESUME" : "ALREADY_MEMBER";
    return json({ error: "Already a MojiCap Plus member", code }, 409);
  }

  try {
    const successUrl = `${siteOrigin(request)}${localePath(locale, "/account")}?checkout=success`;
    const { url } = await createWaffoCheckout({ plan, userId: user.id, email: user.email, locale, successUrl, source });
    return json({ url });
  } catch (error) {
    console.error("[api/checkout] Waffo checkout failed", error);
    return json({ error: "Could not start checkout", code: "CHECKOUT_FAILED" }, 502);
  }
}
