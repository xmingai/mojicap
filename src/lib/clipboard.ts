"use client";

import { toast } from "sonner";

/**
 * Track copy events in Google Analytics.
 * Only fires if gtag is loaded (NEXT_PUBLIC_GA_ID is set).
 */
function trackCopyEvent(text: string, label?: string) {
  if (typeof window !== "undefined" && window.gtag) {
    window.gtag("event", "copy_emoji", {
      event_category: "engagement",
      event_label: label || text,
      value: text,
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
