"use client";

import { toast } from "sonner";
import { track } from "@vercel/analytics";
import { COPY_EVENT } from "@/lib/ads";

/**
 * Track copy events in Google Analytics.
 * Only fires if gtag is loaded (NEXT_PUBLIC_GA_ID is set).
 */
function trackCopyEvent(text: string, label?: string) {
  // Vercel Web Analytics custom event (no-ops outside the browser / when not enabled).
  track("copy", { label: label || text, text });
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(COPY_EVENT, { detail: { text } }));
  }

  if (typeof window !== "undefined" && window.gtag) {
    // GA4 "value" must be numeric, so the copied glyph goes in event_label / item_id.
    window.gtag("event", "copy_emoji", {
      event_category: "engagement",
      event_label: label || text,
      item_id: text,
      content_type: "emoji",
    });
  }
}

export async function copyToClipboard(text: string, label?: string) {
  try {
    await navigator.clipboard.writeText(text);
    toast.success(`Copied ${label || text}`, {
      duration: 1500,
    });
    trackCopyEvent(text, label);
    return true;
  } catch {
    // Fallback for older browsers
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.style.position = "fixed";
    textarea.style.opacity = "0";
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand("copy");
    document.body.removeChild(textarea);
    toast.success(`Copied ${label || text}`, {
      duration: 1500,
    });
    trackCopyEvent(text, label);
    return true;
  }
}
