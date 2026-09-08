"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { X } from "lucide-react";
import { useDict } from "@/i18n/context";
import { pathWithoutLocale } from "@/lib/seo";
import {
  VORMLY_AD,
  vormlyUrl,
  isOfferActive,
  isExcludedRoute,
  isDismissed,
  rememberDismissal,
  offerEndsAtMs,
  splitCountdown,
  getAssignedVariant,
  type AdVariant,
} from "@/lib/ads";
import { trackAd } from "./track";

const PLACEMENT = "top_banner" as const;

/**
 * Top promotion bar for the Vormly sister site.
 *
 * Server-rendered as an empty band (so the page doesn't jump when it fills in),
 * then populated on the client once the A/B variant and dismissal state are
 * known from localStorage.
 */
export function VormlyBanner() {
  const dict = useDict();
  const pathname = usePathname();
  const excluded = isExcludedRoute(pathWithoutLocale(pathname));
  const [ready, setReady] = useState<{ visible: boolean; variant: AdVariant } | null>(null);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!VORMLY_AD.enabled || excluded) return;
    const variant = getAssignedVariant();
    const visible = !isDismissed(VORMLY_AD.storageKeys.banner);
    // One-time read of localStorage after mount (unavailable during SSR).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setReady({ visible, variant });
    if (visible) trackAd("ad_impression", PLACEMENT, variant);
  }, [excluded]);

  useEffect(() => {
    if (!ready?.visible || !isOfferActive()) return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [ready?.visible]);

  if (!VORMLY_AD.enabled || excluded) return null;
  if (ready && !ready.visible) return null;

  const t = dict.ads.vormly;
  const copy = ready ? t[ready.variant] : null;
  const showClock = isOfferActive(now);
  const { days, hours, minutes, seconds } = splitCountdown(offerEndsAtMs() - now);
  const pad = (n: number) => String(n).padStart(2, "0");

  const dismiss = () => {
    rememberDismissal(VORMLY_AD.storageKeys.banner, VORMLY_AD.bannerDismissDays);
    if (ready) trackAd("ad_dismiss", PLACEMENT, ready.variant);
    setReady({ visible: false, variant: ready?.variant ?? VORMLY_AD.variants[0] });
  };

  return (
    <div
      role="region"
      aria-label={t.eyebrow}
      className="relative flex min-h-10 items-center justify-center gap-3 border-b border-sky-200/70 bg-sky-50 px-11 py-2 text-[13.5px] text-sky-950 dark:border-sky-900/60 dark:bg-[#13233a] dark:text-sky-100"
    >
      {copy && (
        <>
          {showClock && (
            <span className="hidden items-center gap-0.5 font-semibold tabular-nums sm:inline-flex" aria-live="off">
              <span className="mr-1">{t.endsIn} {days}{t.day}</span>
              {[hours, minutes, seconds].map((n, i) => (
                <span key={i} className="inline-flex gap-0.5">
                  {i > 0 && <b className="opacity-60">:</b>}
                  <span className="min-w-5 rounded bg-background px-1 text-center text-foreground">{pad(n)}</span>
                </span>
              ))}
            </span>
          )}
          <span className="text-balance">
            <strong className="font-semibold">{t.eyebrow}</strong>
            <span className="hidden sm:inline">：{copy.banner}</span>
          </span>
          <a
            href={vormlyUrl(PLACEMENT)}
            target="_blank"
            rel="noopener"
            onClick={() => ready && trackAd("ad_click", PLACEMENT, ready.variant)}
            className="whitespace-nowrap font-semibold underline underline-offset-[3px]"
          >
            {t.ctaBanner}
          </a>
          <button
            type="button"
            onClick={dismiss}
            aria-label={t.close}
            className="absolute right-2 top-1/2 grid h-7 w-7 -translate-y-1/2 place-items-center rounded-md opacity-70 transition hover:bg-black/5 hover:opacity-100 dark:hover:bg-white/10"
          >
            <X className="h-4 w-4" />
          </button>
        </>
      )}
    </div>
  );
}
