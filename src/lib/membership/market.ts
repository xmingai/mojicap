import type { Market } from "./plans";

/**
 * Which price list a buyer sees, decided by the request's country — never by
 * the interface language, because a Chinese-reading visitor in Singapore still
 * pays with a card, and anyone can switch the language.
 *
 * Mainland China gets the one-time WeChat plans; everywhere else the card
 * subscription. Vercel sets x-vercel-ip-country; without it (local dev, other
 * hosts) everyone is "global".
 *
 * Outside production a `mojicap_market` cookie overrides the country, so the
 * China flow can be exercised without a Chinese IP. It is ignored in
 * production: the market decides what may be bought, not just what is shown.
 */
export function marketFromRequest(request: Request): Market {
  if (process.env.NODE_ENV !== "production" || process.env.VERCEL_ENV === "preview") {
    const override = request.headers.get("cookie")?.match(/(?:^|;\s*)mojicap_market=(cn|global)/)?.[1];
    if (override) return override as Market;
  }
  const country = request.headers.get("x-vercel-ip-country")?.trim().toUpperCase();
  return country === "CN" ? "cn" : "global";
}
