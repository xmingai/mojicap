"use client";

import { track } from "@vercel/analytics";
import type { AdPlacement, AdVariant } from "@/lib/ads";

type AdEvent = "ad_impression" | "ad_click" | "ad_dismiss";

/** Send an ad event to both Vercel Analytics and GA4 (when loaded). */
export function trackAd(name: AdEvent, placement: AdPlacement, variant?: AdVariant) {
  const data = variant ? { placement, variant } : { placement };
  track(name, data);
  if (typeof window !== "undefined" && window.gtag) {
    window.gtag("event", name, { event_category: "promo", event_label: variant ? `${placement}:${variant}` : placement, ...data });
  }
}
