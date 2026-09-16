"use client";

import Link from "next/link";
import { Menu } from "@base-ui/react/menu";
import { ChevronDown, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { MEMBERSHIP_UI_ENABLED } from "@/lib/membership/config";
import { useDict, useLocale } from "@/i18n/context";
import { defaultLocale } from "@/i18n/config";
import { useMembership } from "./membership-provider";

export function AccountButton() {
  const dict = useDict();
  const locale = useLocale();
  const { ready, me, openAuth, signOut } = useMembership();
  if (!MEMBERSHIP_UI_ENABLED) return null;

  const prefix = locale === defaultLocale ? "" : `/${locale}`;

  // Same footprint while loading so the header doesn't shift.
  if (!ready) return <span aria-hidden="true" className="block h-8 w-20" />;

  if (!me.user) {
    return (
      <button
        type="button"
        onClick={() => openAuth()}
        className="h-8 rounded-lg px-3 text-sm font-medium text-muted-foreground transition hover:bg-foreground/5 hover:text-foreground"
      >
        {dict.auth.signIn}
      </button>
    );
  }

  const initial = (me.user.name || me.user.email).trim().charAt(0).toUpperCase();
  const item =
    "flex w-full cursor-pointer items-center justify-between gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground outline-none data-[highlighted]:bg-muted data-[highlighted]:text-foreground";

  return (
    <Menu.Root>
      {/* Account, Plus and sign-out live behind this, so it has to read as a
          control: same pill shape and chevron as the language switcher beside it. */}
      <Menu.Trigger
        aria-label={dict.nav.account}
        className={cn(
          "group inline-flex h-8 items-center gap-1.5 rounded-full border border-border/70 py-0.5 pl-0.5 pr-2 outline-none transition",
          "hover:border-border hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring",
          "data-[popup-open]:border-border data-[popup-open]:bg-muted",
        )}
      >
        <span className="grid h-6 w-6 place-items-center rounded-full bg-foreground text-[11px] font-semibold text-background">
          {initial}
        </span>
        {me.isMember && (
          <span className="hidden items-center gap-1 text-[10px] font-semibold uppercase leading-4 tracking-[0.08em] text-foreground sm:inline-flex">
            <Sparkles className="h-2.5 w-2.5" aria-hidden />
            {dict.plus.badge}
          </span>
        )}
        <ChevronDown className="h-3.5 w-3.5 text-muted-foreground transition-transform group-data-[popup-open]:rotate-180" />
      </Menu.Trigger>
      <Menu.Portal>
        <Menu.Positioner side="bottom" align="end" sideOffset={8} className="z-[70]">
          <Menu.Popup className="w-56 rounded-xl border border-border/50 bg-background/95 p-1.5 shadow-[0_8px_32px_rgba(0,0,0,0.12)] outline-none backdrop-blur-xl">
            <div className="px-3 py-2">
              <span className="block truncate text-xs text-muted-foreground">{me.user.email}</span>
            </div>
            <Menu.Item render={<Link href={`${prefix}/account/`} />} className={item}>
              {dict.nav.account}
            </Menu.Item>
            {!me.isMember && (
              <Menu.Item render={<Link href={`${prefix}/pricing/`} />} className={item}>
                {dict.plus.name}
              </Menu.Item>
            )}
            <Menu.Item onClick={() => signOut()} className={item}>
              {dict.auth.signOut}
            </Menu.Item>
          </Menu.Popup>
        </Menu.Positioner>
      </Menu.Portal>
    </Menu.Root>
  );
}
