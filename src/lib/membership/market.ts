import type { Market } from "./plans";

/**
 * Which price list a buyer sees, decided by the request's country — never by
 * the interface language, because a Chinese-reading visitor in Singapore still
 * pays with a card, and anyone can switch the language.
 *
 * Mainland China gets the one-time WeChat plans; everywhere else the card
 * subscription. The country is Cloudflare's cf-ipcountry, set from the
 * visitor's own address. (On Vercel behind Cloudflare's proxy,
 * x-vercel-ip-country described Cloudflare's edge, not the visitor.) Without
 * it — local dev — everyone is "global".
 *
 * Outside production a `mojicap_market` cookie overrides the country, so the
 * China flow can be exercised without a Chinese IP. It is ignored in
 * production: the market decides what may be bought, not just what is shown.
 */
export function marketFromRequest(request: Request): Market {
  if (process.env.NODE_ENV !== "production") {
    const override = request.headers.get("cookie")?.match(/(?:^|;\s*)mojicap_market=(cn|global)/)?.[1];
    if (override) return override as Market;
  }
  const country = request.headers.get("cf-ipcountry")?.trim().toUpperCase();
  return country === "CN" ? "cn" : "global";
}
