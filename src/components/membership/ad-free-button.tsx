"use client";

import { Sparkles } from "lucide-react";
import { MEMBERSHIP_UI_ENABLED } from "@/lib/membership/config";
import { useDict } from "@/i18n/context";
import { useMembership } from "./membership-provider";

/**
 * Header entry to Plus, beside the language switcher: the one benefit every
 * visitor notices is the promo units, so the pitch is "go ad-free" and the
 * click opens the upsell dialog with that as the headline. Members never see it.
 */
export function AdFreeButton() {
  const dict = useDict();
  const { ready, me, openUpsell } = useMembership();
  if (!MEMBERSHIP_UI_ENABLED || !ready || me.isMember) return null;

  const label = dict.plus.adFreeButton;
  return (
    <button
      type="button"
      onClick={() => openUpsell("noPromo")}
      aria-label={label}
      className="inline-flex h-8 items-center gap-1.5 rounded-full bg-amber-400/15 px-2 text-sm font-medium text-amber-700 ring-1 ring-amber-500/30 transition hover:bg-amber-400/25 hover:ring-amber-500/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:px-3 dark:text-amber-300"
    >
      <Sparkles className="h-3.5 w-3.5" aria-hidden />
      <span className="hidden whitespace-nowrap sm:inline">{label}</span>
    </button>
  );
}
