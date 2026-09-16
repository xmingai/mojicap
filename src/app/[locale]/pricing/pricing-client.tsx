"use client";

import { useState } from "react";
import Link from "next/link";
import { Cloud, Layers, Loader2, Type, EyeOff } from "lucide-react";
import { useDict, useLocale } from "@/i18n/context";
import { defaultLocale } from "@/i18n/config";
import { cn } from "@/lib/utils";
import { planFor, yearlySavings, yearlySavingsPercent, type PlanInterval } from "@/lib/membership/plans";
import { formatMoney } from "@/lib/membership/format";
import { useMembership } from "@/components/membership/membership-provider";

const BENEFITS = [
  { key: "sync", Icon: Cloud },
  { key: "fonts", Icon: Type },
  { key: "bulk", Icon: Layers },
  { key: "noPromo", Icon: EyeOff },
] as const;

export function PricingClient() {
  const dict = useDict();
  const locale = useLocale();
  const t = dict.plus;
  const { ready, me, startCheckout, checkoutPending } = useMembership();
  const [interval, setBilling] = useState<PlanInterval>("yearly");
  const prefix = locale === defaultLocale ? "" : `/${locale}`;

  // In mainland China these are one-time WeChat purchases; elsewhere card subscriptions.
  const market = me.market;
  const plan = planFor(market, interval);
  const pending = checkoutPending === plan.sku;

  return (
    <section className="grid gap-10">
      <header className="mx-auto max-w-xl text-center">
        <h1 className="text-4xl font-extrabold tracking-tight text-balance md:text-5xl">{t.name}</h1>
        <p className="mt-3 text-lg text-muted-foreground text-balance">{t.pricingSubtitle}</p>
      </header>

      <div className="grid items-start gap-6 md:grid-cols-[minmax(0,22rem)_minmax(0,1fr)] md:gap-10">
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <div role="radiogroup" aria-label={t.name} className="grid grid-cols-2 rounded-xl bg-muted p-1 text-sm font-medium">
            {/* Yearly first and preselected: it is the plan we recommend. */}
            {(["yearly", "monthly"] as const).map((value) => (
              <button
                key={value}
                type="button"
                role="radio"
                aria-checked={interval === value}
                onClick={() => setBilling(value)}
                className={cn(
                  "flex h-9 items-center justify-center gap-1.5 rounded-lg transition",
                  interval === value ? "bg-foreground text-background shadow-sm" : "text-muted-foreground hover:text-foreground",
                )}
              >
                {value === "monthly" ? t.monthly : t.yearly}
                {value === "yearly" && (
                  <span className={cn("text-xs font-semibold", interval === "yearly" ? "text-background/80" : "text-muted-foreground")}>
                    −{yearlySavingsPercent(market)}%
                  </span>
                )}
              </button>
            ))}
          </div>

          <div className="mt-6">
            <p className="flex items-baseline gap-1">
              <span className="text-5xl font-extrabold tracking-tight tabular-nums">{formatMoney(plan.price, plan.currency, locale)}</span>
              <span className="text-muted-foreground">{interval === "monthly" ? t.perMonth : t.perYear}</span>
            </p>
            <p className="mt-1 h-5 text-sm text-muted-foreground tabular-nums">
              {/* The percentage is already on the Yearly toggle; the per-month price and the money saved are new information. */}
              {interval === "yearly"
                ? `${t.yearlyEquivalent.replace("{price}", formatMoney(Math.floor((plan.price / 12) * 100) / 100, plan.currency, locale))} · ${t.saveAmount.replace("{amount}", formatMoney(yearlySavings(market), plan.currency, locale))}`
                : t.monthlyNote.replace("{percent}", String(yearlySavingsPercent(market)))}
            </p>
          </div>

          {ready && me.isMember ? (
            <div className="mt-6 grid gap-2">
              <p className="text-sm font-semibold">{t.memberTitle}</p>
              <Link
                href={`${prefix}/account/`}
                className="inline-flex h-11 items-center justify-center rounded-xl border border-border font-semibold transition hover:bg-muted"
              >
                {t.manage}
              </Link>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => startCheckout(plan.sku, "pricing")}
              disabled={!ready || checkoutPending !== null}
              className="mt-6 inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-foreground font-semibold text-background transition hover:bg-foreground/90 disabled:opacity-60"
            >
              {pending && <Loader2 className="h-4 w-4 animate-spin" />}
              {pending ? t.ctaLoading : t.cta}
            </button>
          )}
          <p className="mt-3 text-center text-xs text-muted-foreground">
            {plan.kind === "onetime" ? `${t.onetimeNote} · ${t.wechatOnly}` : t.fineprint}
          </p>
        </div>

        <ul className="grid gap-5 sm:grid-cols-2 md:gap-6 md:pt-2">
          {BENEFITS.map(({ key, Icon }) => (
            <li key={key} className="grid grid-cols-[2.25rem_1fr] gap-3">
              <span className="grid h-9 w-9 place-items-center rounded-lg bg-muted">
                <Icon className="h-4 w-4" />
              </span>
              <span>
                <span className="block font-semibold">{t.benefits[key].title}</span>
                <span className="mt-0.5 block text-sm text-muted-foreground">{t.benefits[key].desc}</span>
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
