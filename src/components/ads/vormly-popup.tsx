"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { X } from "lucide-react";
import { useDict, useLocale } from "@/i18n/context";
import { pathWithoutLocale } from "@/lib/seo";
import {
  VORMLY_AD,
  COPY_EVENT,
  vormlyUrl,
  isExcludedRoute,
  isDismissed,
  rememberDismissal,
  offerEndsAtMs,
  getAssignedVariant,
  type AdVariant,
} from "@/lib/ads";
import { trackAd } from "./track";

const PLACEMENT = "corner_popup" as const;
const MODELS = ["Seedance", "Veo", "Kling", "Grok Video", "Midjourney", "Suno"];

/**
 * Bottom-right promotion card for the Vormly sister site.
 *
 * Appears shortly after the visitor's first copy (or after a fallback delay),
 * at most once per session, never full-screen. Closing hides it for a week;
 * clicking the CTA hides it for a month.
 */
export function VormlyPopup() {
  const dict = useDict();
  const locale = useLocale();
  const pathname = usePathname();
  const excluded = isExcludedRoute(pathWithoutLocale(pathname));
  const [open, setOpen] = useState<{ variant: AdVariant } | null>(null);

  useEffect(() => {
    if (!VORMLY_AD.enabled || excluded) return;
    if (isDismissed(VORMLY_AD.storageKeys.popup)) return;
    try {
      if (sessionStorage.getItem(VORMLY_AD.storageKeys.popupSession)) return;
    } catch {}

    let timer: ReturnType<typeof setTimeout> | null = null;
    let shown = false;
    const show = () => {
      if (shown) return;
      shown = true;
      const variant = getAssignedVariant();
      try {
        sessionStorage.setItem(VORMLY_AD.storageKeys.popupSession, "1");
      } catch {}
      setOpen({ variant });
      trackAd("ad_impression", PLACEMENT, variant);
    };
    const onCopy = () => {
      if (timer) clearTimeout(timer);
      timer = setTimeout(show, VORMLY_AD.popupAfterCopyMs);
    };
    window.addEventListener(COPY_EVENT, onCopy);
    timer = setTimeout(show, VORMLY_AD.popupFallbackMs);
    return () => {
      window.removeEventListener(COPY_EVENT, onCopy);
      if (timer) clearTimeout(timer);
    };
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
  // Same whole-day count as the banner countdown (floor), never shown as 0.
  const daysLeft = Math.max(1, Math.floor((offerEndsAtMs() - Date.now()) / 864e5));
  const endDate = new Intl.DateTimeFormat(locale, { month: "short", day: "numeric" }).format(offerEndsAtMs());

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
      <div className="relative flex h-24 flex-col justify-end bg-gradient-to-r from-[#14365e] to-[#2f6bb0] p-4 text-white sm:h-28">
        <div className="absolute left-4 top-3 flex items-center gap-2">
          <Image src="/logo.png" alt="MojiCap" width={22} height={22} className="rounded-md" />
          <span className="text-[13px] font-bold opacity-80">×</span>
          <Image src="/brand/vormly-logotype-white.svg" alt="Vormly AI" width={86} height={20} className="h-5 w-auto" />
        </div>
        <div className="text-[11px] font-bold uppercase tracking-[.14em] opacity-85">{t.eyebrow}</div>
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
        <div className="flex items-center gap-2 rounded-lg bg-sky-500/10 px-3 py-2 text-[13px] font-semibold">
          <span className="min-w-0 leading-snug">{t.offer}</span>
          <span className="ml-auto shrink-0 whitespace-nowrap text-[11.5px] font-medium tabular-nums text-muted-foreground">
            {t.endsIn} {daysLeft}{t.day}
          </span>
        </div>
        <a
          href={vormlyUrl(PLACEMENT)}
          target="_blank"
          rel="noopener"
          onClick={clickCta}
          className="mt-0.5 block rounded-xl bg-[#1f5fbf] px-4 py-2.5 text-center font-semibold text-white transition hover:bg-[#1a52a6]"
        >
          {t.ctaPopup}
        </a>
        <div className="text-center text-[11px] text-muted-foreground">{t.fine.replace("{date}", endDate)}</div>
      </div>
    </div>
  );
}
