"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { X } from "lucide-react";
import { useDict } from "@/i18n/context";
import { pathWithoutLocale } from "@/lib/seo";
import {
  VORMLY_AD,
  vormlyUrl,
  isExcludedRoute,
  isDismissed,
  rememberDismissal,
  getAssignedVariant,
  type AdVariant,
} from "@/lib/ads";
import { trackAd } from "./track";
import { OfferCountdown } from "./offer-countdown";

const PLACEMENT = "corner_popup" as const;
const MODELS = ["Seedance", "Veo", "Kling", "Grok Video", "Midjourney", "Suno"];

/**
 * Bottom-right promotion card for the Vormly sister site.
 *
 * Appears a few seconds after the page loads (time-based only, so it never sits
 * between the visitor and a copy), at most once per session, never full-screen.
 * Closing hides it for a week; clicking the CTA hides it for a month.
 */
export function VormlyPopup() {
  const dict = useDict();
  const pathname = usePathname();
  const excluded = isExcludedRoute(pathWithoutLocale(pathname));
  const [open, setOpen] = useState<{ variant: AdVariant } | null>(null);

  useEffect(() => {
    if (!VORMLY_AD.enabled || excluded) return;
    if (isDismissed(VORMLY_AD.storageKeys.popup)) return;
    try {
      if (sessionStorage.getItem(VORMLY_AD.storageKeys.popupSession)) return;
    } catch {}

    const timer = setTimeout(() => {
      const variant = getAssignedVariant();
      try {
        sessionStorage.setItem(VORMLY_AD.storageKeys.popupSession, "1");
      } catch {}
      setOpen({ variant });
      trackAd("ad_impression", PLACEMENT, variant);
    }, VORMLY_AD.popupDelayMs);
    return () => clearTimeout(timer);
  }, [excluded]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") dismiss();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  if (!open) return null;

  const t = dict.ads.vormly;
  const copy = t[open.variant];

  function dismiss() {
    rememberDismissal(VORMLY_AD.storageKeys.popup, VORMLY_AD.popupDismissDays);
    if (open) trackAd("ad_dismiss", PLACEMENT, open.variant);
    setOpen(null);
  }

  function clickCta() {
    rememberDismissal(VORMLY_AD.storageKeys.popup, VORMLY_AD.popupClickDays);
    if (open) trackAd("ad_click", PLACEMENT, open.variant);
  }

  return (
    <div
      role="dialog"
      aria-labelledby="vormly-popup-title"
      className="fixed bottom-3 left-3 right-3 z-50 overflow-hidden rounded-2xl border border-border bg-card text-card-foreground shadow-2xl motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-3 sm:bottom-4 sm:left-auto sm:right-4 sm:w-[340px]"
    >
      <button
        type="button"
        onClick={dismiss}
        aria-label={t.close}
        className="absolute right-2.5 top-2.5 z-10 grid h-7 w-7 place-items-center rounded-full bg-black/30 text-white transition hover:bg-black/50"
      >
        <X className="h-4 w-4" />
      </button>
      <div className="relative flex h-20 items-center bg-zinc-900 px-4 text-white dark:bg-zinc-800">
        <div className="flex items-center gap-2">
          <Image src="/logo.png" alt="MojiCap" width={22} height={22} className="rounded-md" />
          <span className="text-[13px] font-bold opacity-80">×</span>
          <Image src="/brand/vormly-logotype-white.svg" alt="Vormly AI" width={86} height={20} className="h-5 w-auto" />
        </div>
      </div>
      <div className="grid gap-2.5 p-4">
        <h3 id="vormly-popup-title" className="text-balance text-lg font-bold leading-tight">
          {copy.title}
        </h3>
        <p className="text-[13.5px] text-muted-foreground">{copy.body}</p>
        <div className="flex flex-wrap gap-1.5">
          {MODELS.map((m) => (
            <span key={m} className="rounded-full bg-muted px-2 py-0.5 text-[11px] text-muted-foreground">
              {m}
            </span>
          ))}
        </div>
        <div className="flex justify-center rounded-lg bg-muted px-3 py-2 text-[13px]">
          <OfferCountdown />
        </div>
        <a
          href={vormlyUrl(PLACEMENT)}
          target="_blank"
          rel="noopener"
          onClick={clickCta}
          className="mt-0.5 block rounded-xl bg-foreground px-4 py-2.5 text-center font-semibold text-background transition hover:bg-foreground/90"
        >
          {t.ctaPopup}
        </a>
        <div className="text-center text-[11px] text-muted-foreground">{t.fine}</div>
      </div>
    </div>
  );
}
