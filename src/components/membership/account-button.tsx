"use client";

import Link from "next/link";
import { Menu } from "@base-ui/react/menu";
import { MEMBERSHIP_UI_ENABLED } from "@/lib/membership/config";
import { useDict, useLocale } from "@/i18n/context";
import { defaultLocale } from "@/i18n/config";
import { useMembership } from "./membership-provider";
import { PlusBadge } from "./plus-badge";

export function AccountButton() {
  const dict = useDict();
  const locale = useLocale();
  const { ready, me, openAuth, signOut } = useMembership();
  if (!MEMBERSHIP_UI_ENABLED) return null;

  const prefix = locale === defaultLocale ? "" : `/${locale}`;

  // Same footprint while loading so the header doesn't shift.
  if (!ready) return <span aria-hidden="true" className="block h-8 w-16" />;

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
      <Menu.Trigger
        aria-label={dict.nav.account}
        className="grid h-8 w-8 place-items-center rounded-full bg-foreground text-xs font-semibold text-background outline-none transition hover:opacity-90 focus-visible:ring-2 focus-visible:ring-ring"
      >
        {initial}
      </Menu.Trigger>
      <Menu.Portal>
        <Menu.Positioner side="bottom" align="end" sideOffset={8} className="z-[70]">
          <Menu.Popup className="w-56 rounded-xl border border-border/50 bg-background/95 p-1.5 shadow-[0_8px_32px_rgba(0,0,0,0.12)] outline-none backdrop-blur-xl">
            <div className="flex items-center justify-between gap-2 px-3 py-2">
              <span className="truncate text-xs text-muted-foreground">{me.user.email}</span>
              {me.isMember && <PlusBadge label={dict.plus.badge} />}
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
