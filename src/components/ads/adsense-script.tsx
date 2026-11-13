"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { useMembership } from "@/components/membership/membership-provider";
import { MEMBERSHIP_UI_ENABLED } from "@/lib/membership/config";
import { pathWithoutLocale } from "@/lib/seo";
import { ADSENSE_SRC, isAdSenseExcluded } from "@/lib/adsense";

/**
 * Loads the AdSense Auto ads script for everyone except Plus members.
 *
 * Injected by hand rather than through next/script: AdSense flags the
 * data-nscript attribute next/script adds. The script stays for the rest of the
 * visit once loaded (it cannot be unloaded), so the check runs before it.
 */
export function AdSenseScript() {
  const pathname = usePathname();
  const { me, ready } = useMembership();
  const pending = MEMBERSHIP_UI_ENABLED && !ready;
  const skip = me.isMember || isAdSenseExcluded(pathWithoutLocale(pathname));

  useEffect(() => {
    if (pending || skip || process.env.NODE_ENV !== "production") return;
    if (document.querySelector(`script[src="${ADSENSE_SRC}"]`)) return;
    const script = document.createElement("script");
    script.async = true;
    script.src = ADSENSE_SRC;
    script.crossOrigin = "anonymous";
    document.head.appendChild(script);
  }, [pending, skip]);

  return null;
}
