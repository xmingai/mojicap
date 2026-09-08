"use client";

import { useEffect, useState } from "react";
import { useDict } from "@/i18n/context";
import { isOfferActive, offerEndsAtMs, splitCountdown } from "@/lib/ads";

/**
 * Live "Ends in 14d 05:31:30" countdown to the fixed campaign deadline.
 * Shared by the top banner and the corner popup; renders nothing once the
 * offer has ended.
 */
export function OfferCountdown({ className = "" }: { className?: string }) {
  const dict = useDict();
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!isOfferActive()) return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  if (!isOfferActive(now)) return null;

  const t = dict.ads.vormly;
  const { days, hours, minutes, seconds } = splitCountdown(offerEndsAtMs() - now);
  const pad = (n: number) => String(n).padStart(2, "0");

  return (
    <span
      className={`inline-flex shrink-0 items-center gap-0.5 whitespace-nowrap font-semibold tabular-nums ${className}`}
      aria-live="off"
    >
      <span className="mr-1 whitespace-nowrap">
        {t.endsIn} {days}
        {t.day}
      </span>
      {[hours, minutes, seconds].map((n, i) => (
        <span key={i} className="inline-flex gap-0.5">
          {i > 0 && <b className="opacity-60">:</b>}
          <span className="min-w-5 rounded bg-foreground px-1 text-center text-background">{pad(n)}</span>
        </span>
      ))}
    </span>
  );
}
