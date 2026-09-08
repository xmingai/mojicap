/**
 * Cross-promotion config for the Vormly AI sister site.
 *
 * Everything an editor might want to change lives here: the campaign window,
 * dismissal memory, the UTM scheme and the excluded routes. Copy lives in the
 * dictionaries under `ads.vormly`.
 */

export type AdPlacement = "top_banner" | "corner_popup" | "footer_link";

export const VORMLY_AD = {
  enabled: true,
  /** Fixed campaign deadline. Every visitor counts down to the same instant. */
  offerEndsAt: "2026-09-22T23:59:59+08:00",
  /** How long a unit stays hidden after the visitor closes it (in days; 0.5 = 12 hours). */
  bannerDismissDays: 0.5,
  popupDismissDays: 7,
  /** Days to keep the popup hidden after the visitor clicks its CTA. */
  popupClickDays: 30,
  /** Popup appears this long after the page loads (time-based only; not tied to any user action). */
  popupDelayMs: 5000,
  /** Route prefixes (locale-free) where no promotion is shown. */
  excludedRoutes: ["/privacy", "/terms", "/about"],
  /** Copy variants in the A/B test. Each visitor is assigned one at random and keeps it. */
  variants: ["b", "c"] as const,
  storageKeys: {
    banner: "mojicap-ad-vormly-banner",
    popup: "mojicap-ad-vormly-popup",
    popupSession: "mojicap-ad-vormly-popup-session",
    variant: "mojicap-ad-vormly-variant",
  },
} as const;

export type AdVariant = (typeof VORMLY_AD.variants)[number];

/** Sticky 50/50 assignment so a visitor always sees the same copy and events stay comparable. */
export function getAssignedVariant(): AdVariant {
  const variants = VORMLY_AD.variants;
  try {
    const stored = localStorage.getItem(VORMLY_AD.storageKeys.variant);
    if (stored && (variants as readonly string[]).includes(stored)) return stored as AdVariant;
    const picked = variants[Math.floor(Math.random() * variants.length)];
    localStorage.setItem(VORMLY_AD.storageKeys.variant, picked);
    return picked;
  } catch {
    return variants[0];
  }
}

const UTM = {
  source: "mojicap",
  medium: "referral",
  campaign: "mojicap_partnership_2026q3",
} as const;

/** Vormly landing URL with the standard UTM set; only utm_content varies per placement. */
export function vormlyUrl(placement: AdPlacement): string {
  const params = new URLSearchParams({
    utm_source: UTM.source,
    utm_medium: UTM.medium,
    utm_campaign: UTM.campaign,
    utm_content: placement,
  });
  return `https://vormly.ai/?${params.toString()}`;
}

export function offerEndsAtMs(): number {
  return new Date(VORMLY_AD.offerEndsAt).getTime();
}

/** True while the campaign window is open. */
export function isOfferActive(now: number = Date.now()): boolean {
  return now < offerEndsAtMs();
}

export function isExcludedRoute(localeFreePath: string): boolean {
  return VORMLY_AD.excludedRoutes.some((r) => localeFreePath === r || localeFreePath.startsWith(`${r}/`));
}

/** Expiry timestamp for a dismissal that should last `days`. */
export function dismissalExpiry(days: number, now: number = Date.now()): number {
  return now + days * 864e5;
}

/** Read a stored dismissal; returns true if it is still in force. */
export function isDismissed(key: string, now: number = Date.now()): boolean {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return false;
    const until = Number(raw);
    return Number.isFinite(until) && until > now;
  } catch {
    return false;
  }
}

export function rememberDismissal(key: string, days: number) {
  try {
    localStorage.setItem(key, String(dismissalExpiry(days)));
  } catch {}
}

/** Split a remaining duration into d/h/m/s for the countdown. */
export function splitCountdown(msLeft: number) {
  const left = Math.max(0, msLeft);
  return {
    days: Math.floor(left / 864e5),
    hours: Math.floor((left % 864e5) / 3600e3),
    minutes: Math.floor((left % 3600e3) / 60e3),
    seconds: Math.floor((left % 60e3) / 1000),
  };
}
