"use client";

import { useEffect } from "react";
import { ADSENSE_SRC } from "@/lib/adsense";

/**
 * Loads the AdSense Auto ads script once, after hydration.
 *
 * Injected by hand rather than through next/script: AdSense flags the
 * data-nscript attribute next/script adds.
 */
export function AdSenseScript() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") return;
    if (document.querySelector(`script[src="${ADSENSE_SRC}"]`)) return;
    const script = document.createElement("script");
    script.async = true;
    script.src = ADSENSE_SRC;
    script.crossOrigin = "anonymous";
    document.head.appendChild(script);
  }, []);

  return null;
}
