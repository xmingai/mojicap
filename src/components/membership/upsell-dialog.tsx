"use client";

import Link from "next/link";
import { Check } from "lucide-react";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { useDict, useLocale } from "@/i18n/context";
import { defaultLocale } from "@/i18n/config";
import { getPlan } from "@/lib/membership/plans";
import { formatUsd } from "@/lib/membership/format";

export type UpsellFeature = "sync" | "fonts" | "bulk";

const ALL_BENEFITS = ["sync", "fonts", "bulk", "noPromo"] as const;

/**
 * Shown when a free visitor reaches for a Plus feature. The feature they tried
 * is the headline; the list only names what else Plus adds, so nothing repeats.
 */
export function UpsellDialog({ feature, onClose }: { feature: UpsellFeature | null; onClose: () => void }) {
  const dict = useDict();
  const locale = useLocale();
  const t = dict.plus;
  const prefix = locale === defaultLocale ? "" : `/${locale}`;
  const copy = feature ? t.upsell[feature] : null;
  const monthly = getPlan("plus_monthly")!;

  return (
    <Dialog open={feature !== null} onOpenChange={(open) => !open && onClose()}>
      <DialogContent closeLabel={dict.auth.close}>
        {copy && feature && (
          <>
            <DialogTitle>{copy.title}</DialogTitle>
            <DialogDescription>{copy.desc}</DialogDescription>
            <p className="mt-5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">{t.upsell.alsoIncluded}</p>
            <ul className="mt-2 grid gap-2">
              {ALL_BENEFITS.filter((b) => b !== feature).map((b) => (
                <li key={b} className="flex items-start gap-2 text-sm">
                  <Check className="mt-0.5 h-4 w-4 shrink-0" />
                  {t.benefits[b].title}
                </li>
              ))}
            </ul>
            <div className="mt-6 grid gap-2">
              <Link
                href={`${prefix}/pricing/`}
                onClick={onClose}
                className="inline-flex h-11 items-center justify-center rounded-xl bg-foreground font-semibold text-background transition hover:bg-foreground/90"
              >
                {t.upsell.seePlans}
              </Link>
              <p className="text-center text-xs text-muted-foreground">
                {t.upsell.priceFrom.replace("{price}", formatUsd(monthly.priceUsd, locale))}
              </p>
              <DialogClose className="h-9 text-sm text-muted-foreground hover:text-foreground">{t.upsell.notNow}</DialogClose>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
