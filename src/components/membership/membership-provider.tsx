"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";
import { MEMBERSHIP_UI_ENABLED } from "@/lib/membership/config";
import type { Market } from "@/lib/membership/plans";
import { useDict, useLocale } from "@/i18n/context";
import { defaultLocale } from "@/i18n/config";
import { AuthDialog, type AuthReason } from "./auth-dialog";
import { UpsellDialog, type UpsellFeature } from "./upsell-dialog";
import { useCloudSync } from "./use-cloud-sync";
import { configureCopyGate } from "@/lib/copy-gate";

export type Me = {
  enabled: boolean;
  user: { id: string; email: string; name: string } | null;
  /** Which price list applies, from the request's country. */
  market: Market;
  isMember: boolean;
  plan: { sku: string; status: string; currentPeriodEnd: string; accessUntil: string | null } | null;
  google: boolean;
};

type MembershipContextValue = {
  /** False until /api/me has answered once. */
  ready: boolean;
  me: Me;
  refresh: () => Promise<Me>;
  openAuth: (then?: () => void) => void;
  openUpsell: (feature: UpsellFeature) => void;
  signOut: () => Promise<void>;
  startCheckout: (sku: string, source: string) => Promise<void>;
  checkoutPending: string | null;
};

const SIGNED_OUT: Me = { enabled: MEMBERSHIP_UI_ENABLED, user: null, market: "global", isMember: false, plan: null, google: false };
const CACHE_KEY = "mojicap-me";

const MembershipContext = createContext<MembershipContextValue | null>(null);

export function useMembership(): MembershipContextValue {
  const ctx = useContext(MembershipContext);
  if (!ctx) throw new Error("useMembership must be used within MembershipProvider");
  return ctx;
}

async function fetchMe(): Promise<Me> {
  const res = await fetch("/api/me/", { cache: "no-store", credentials: "same-origin" });
  if (!res.ok) return SIGNED_OUT;
  return (await res.json()) as Me;
}

export function MembershipProvider({ children }: { children: React.ReactNode }) {
  const dict = useDict();
  const locale = useLocale();
  const router = useRouter();
  const [me, setMe] = useState<Me>(SIGNED_OUT);
  const [ready, setReady] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  // Set when the dialog opens because the free copies ran out, so it can lead
  // with what an account gives instead of a bare email field.
  const [authReason, setAuthReason] = useState<AuthReason>(null);
  const [upsell, setUpsell] = useState<UpsellFeature | null>(null);
  const [checkoutPending, setCheckoutPending] = useState<string | null>(null);
  const afterAuth = useRef<(() => void) | null>(null);

  const apply = useCallback((next: Me) => {
    setMe(next);
    setReady(true);
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify({ signedIn: Boolean(next.user), isMember: next.isMember }));
    } catch {}
  }, []);

  const refresh = useCallback(async () => {
    const next = await fetchMe().catch(() => SIGNED_OUT);
    apply(next);
    return next;
  }, [apply]);

  useEffect(() => {
    if (!MEMBERSHIP_UI_ENABLED) return;
    // Apply the last known state first so members don't see promotions flash in
    // while /api/me is in flight; the fetch below replaces it with the truth.
    try {
      const cached = JSON.parse(localStorage.getItem(CACHE_KEY) ?? "null") as { isMember?: boolean } | null;
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (cached?.isMember) setMe((m) => ({ ...m, isMember: true }));
    } catch {}
    refresh();
  }, [refresh]);

  useCloudSync({ signedIn: MEMBERSHIP_UI_ENABLED && ready && Boolean(me.user), isMember: me.isMember });

  // Free copies run out after COPY_LIMITS a day; the next attempt opens the
  // sign-in dialog for visitors and the Plus dialog for signed-in members.
  useEffect(() => {
    const status = me.isMember ? "member" : me.user ? "free" : "anonymous";
    configureCopyGate({
      enabled: MEMBERSHIP_UI_ENABLED && ready,
      status,
      onBlocked: (blocked, retry) => {
        if (blocked === "anonymous") {
          // Signing in finishes the copy they were trying to make.
          afterAuth.current = retry;
          setAuthReason("copies");
          setAuthOpen(true);
        } else {
          setUpsell("copies");
        }
      },
    });
  }, [ready, me.isMember, me.user]);

  const openAuth = useCallback((then?: () => void) => {
    afterAuth.current = then ?? null;
    setAuthReason(null);
    setAuthOpen(true);
  }, []);

  const onSignedIn = useCallback(async () => {
    setAuthOpen(false);
    await refresh();
    toast.success(dict.auth.signedIn, { duration: 1500 });
    const next = afterAuth.current;
    afterAuth.current = null;
    next?.();
  }, [refresh, dict.auth.signedIn]);

  const signOut = useCallback(async () => {
    await authClient.signOut();
    apply(SIGNED_OUT);
    toast.success(dict.auth.signedOut, { duration: 1500 });
  }, [apply, dict.auth.signedOut]);

  const prefix = locale === defaultLocale ? "" : `/${locale}`;

  const startCheckout = useCallback(
    async (sku: string, source: string) => {
      const run = async () => {
        setCheckoutPending(sku);
        try {
          const res = await fetch("/api/checkout/", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ sku, locale, source }),
          });
          const body = (await res.json().catch(() => ({}))) as { url?: string; code?: string };
          if (res.ok && body.url) {
            window.location.href = body.url;
            return; // keep the pending state while the browser navigates away
          }
          if (body.code === "ALREADY_MEMBER" || body.code === "CAN_RESUME") {
            router.push(`${prefix}/account/`);
          } else if (body.code === "UNAUTHORIZED") {
            openAuth(run);
          } else if (body.code === "CHECKOUT_DISABLED") {
            toast.error(dict.plus.checkoutUnavailable);
          } else {
            toast.error(dict.plus.checkoutError);
          }
        } catch {
          toast.error(dict.plus.checkoutError);
        }
        setCheckoutPending(null);
      };
      if (!me.user) openAuth(run);
      else await run();
    },
    [me.user, locale, prefix, router, openAuth, dict.plus.checkoutError, dict.plus.checkoutUnavailable],
  );

  const value = useMemo<MembershipContextValue>(
    () => ({ ready, me, refresh, openAuth, openUpsell: setUpsell, signOut, startCheckout, checkoutPending }),
    [ready, me, refresh, openAuth, signOut, startCheckout, checkoutPending],
  );

  return (
    <MembershipContext.Provider value={value}>
      {children}
      {MEMBERSHIP_UI_ENABLED && (
        <>
          <AuthDialog open={authOpen} onOpenChange={setAuthOpen} reason={authReason} google={me.google} onSignedIn={onSignedIn} />
          <UpsellDialog feature={upsell} onClose={() => setUpsell(null)} />
        </>
      )}
    </MembershipContext.Provider>
  );
}
