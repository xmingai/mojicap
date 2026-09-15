"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ExternalLink, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useDict, useLocale } from "@/i18n/context";
import { defaultLocale } from "@/i18n/config";
import { getPlan } from "@/lib/membership/plans";
import { formatDate } from "@/lib/membership/format";
import { useMembership } from "@/components/membership/membership-provider";
import { PlusBadge } from "@/components/membership/plus-badge";
import { SearchParamsInit } from "@/components/search-params-init";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";

type Activation = "idle" | "waiting" | "done" | "slow";

export function AccountClient() {
  const dict = useDict();
  const locale = useLocale();
  const t = dict.account;
  const { ready, me, refresh, openAuth, signOut } = useMembership();
  const prefix = locale === defaultLocale ? "" : `/${locale}`;
  const [activation, setActivation] = useState<Activation>("idle");
  const [busy, setBusy] = useState<"cancel" | "resume" | "billing" | null>(null);
  const [confirmCancel, setConfirmCancel] = useState(false);
  const polling = useRef(false);

  /** Webhooks land a moment after the provider confirms; poll until state catches up. */
  const pollUntil = useCallback(
    async (done: (m: Awaited<ReturnType<typeof refresh>>) => boolean, attempts: number) => {
      for (let i = 0; i < attempts; i++) {
        const m = await refresh();
        if (done(m)) return true;
        await new Promise((r) => setTimeout(r, 2000));
      }
      return false;
    },
    [refresh],
  );

  const onParams = useCallback((params: URLSearchParams) => {
    if (params.get("checkout") === "success") setActivation("waiting");
  }, []);

  useEffect(() => {
    if (activation !== "waiting" || polling.current) return;
    polling.current = true;
    pollUntil((m) => m.isMember, 15).then((ok) => {
      setActivation(ok ? "done" : "slow");
      // Drop ?checkout=success so a reload doesn't restart the wait.
      window.history.replaceState(null, "", window.location.pathname);
    });
  }, [activation, pollUntil]);

  const post = async (path: string) => {
    const res = await fetch(path, { method: "POST" });
    return res.ok;
  };

  const cancel = async () => {
    setBusy("cancel");
    setConfirmCancel(false);
    if (await post("/api/subscription/cancel/")) {
      toast.success(t.cancelDone);
      await pollUntil((m) => m.plan?.status === "canceling", 6);
    } else toast.error(t.actionError);
    setBusy(null);
  };

  const resume = async () => {
    setBusy("resume");
    if (await post("/api/subscription/resume/")) {
      toast.success(t.resumeDone);
      await pollUntil((m) => m.plan?.status === "active", 6);
    } else toast.error(t.actionError);
    setBusy(null);
  };

  const openBilling = async () => {
    setBusy("billing");
    const res = await fetch("/api/subscription/portal/");
    const body = (await res.json().catch(() => ({}))) as { url?: string };
    setBusy(null);
    if (body.url) window.open(body.url, "_blank", "noopener");
    else toast.error(t.actionError);
  };

  return (
    <section className="grid gap-6">
      <SearchParamsInit onParams={onParams} />
      <h1 className="text-3xl font-extrabold tracking-tight">{t.title}</h1>

      {activation !== "idle" && (
        <p
          role="status"
          className="flex items-center gap-2 rounded-xl border border-border bg-muted px-4 py-3 text-sm"
        >
          {activation === "waiting" && <Loader2 className="h-4 w-4 animate-spin" />}
          {activation === "waiting" ? t.activating : activation === "done" ? t.activated : t.activationSlow}
        </p>
      )}

      {!ready ? (
        <div className="grid gap-3" aria-hidden="true">
          <div className="h-20 animate-pulse rounded-2xl bg-muted" />
          <div className="h-32 animate-pulse rounded-2xl bg-muted" />
        </div>
      ) : !me.user ? (
        <div className="rounded-2xl border border-border p-6">
          <p className="text-muted-foreground">{t.signInPrompt}</p>
          <button
            type="button"
            onClick={() => openAuth()}
            className="mt-4 inline-flex h-10 items-center rounded-xl bg-foreground px-5 font-semibold text-background transition hover:bg-foreground/90"
          >
            {dict.auth.signIn}
          </button>
        </div>
      ) : (
        <>
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border p-5">
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground">{t.signedInAs}</p>
              <p className="truncate font-medium">{me.user.email}</p>
            </div>
            <button
              type="button"
              onClick={() => signOut()}
              className="h-9 rounded-lg border border-border px-3 text-sm font-medium transition hover:bg-muted"
            >
              {dict.auth.signOut}
            </button>
          </div>

          <PlanCard
            me={me}
            locale={locale}
            prefix={prefix}
            busy={busy}
            onCancel={() => setConfirmCancel(true)}
            onResume={resume}
            onBilling={openBilling}
          />
        </>
      )}

      <Dialog open={confirmCancel} onOpenChange={setConfirmCancel}>
        <DialogContent closeLabel={dict.auth.close}>
          <DialogTitle>{t.cancelTitle}</DialogTitle>
          <DialogDescription>
            {me.plan ? t.cancelDesc.replace("{date}", formatDate(me.plan.currentPeriodEnd, locale)) : null}
          </DialogDescription>
          <div className="mt-6 grid gap-2 sm:grid-cols-2">
            <DialogClose className="inline-flex h-10 items-center justify-center rounded-xl bg-foreground font-semibold text-background transition hover:bg-foreground/90">
              {t.keep}
            </DialogClose>
            <button
              type="button"
              onClick={cancel}
              className="inline-flex h-10 items-center justify-center rounded-xl border border-border font-medium text-destructive transition hover:bg-muted"
            >
              {t.cancelConfirm}
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
}

function PlanCard({
  me,
  locale,
  prefix,
  busy,
  onCancel,
  onResume,
  onBilling,
}: {
  me: ReturnType<typeof useMembership>["me"];
  locale: string;
  prefix: string;
  busy: "cancel" | "resume" | "billing" | null;
  onCancel: () => void;
  onResume: () => void;
  onBilling: () => void;
}) {
  const dict = useDict();
  const t = dict.account;
  const plan = me.plan;
  const current = me.isMember && plan ? getPlan(plan.sku) : null;

  const button = "inline-flex h-10 items-center justify-center gap-2 rounded-xl px-4 text-sm font-semibold transition disabled:opacity-60";

  return (
    <div className="rounded-2xl border border-border p-5">
      <p className="text-xs text-muted-foreground">{t.plan}</p>

      {!current || !plan ? (
        <div className="mt-1 flex flex-wrap items-center justify-between gap-3">
          <p className="text-lg font-semibold">{t.free}</p>
          <Link href={`${prefix}/pricing/`} className={`${button} bg-foreground text-background hover:bg-foreground/90`}>
            {t.upgrade}
          </Link>
        </div>
      ) : (
        <>
          <p className="mt-1 flex items-center gap-2 text-lg font-semibold">
            {dict.plus.name}
            <PlusBadge label={current.interval === "monthly" ? dict.plus.monthly : dict.plus.yearly} />
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            {plan.status === "canceling"
              ? t.canceling.replace("{date}", formatDate(plan.currentPeriodEnd, locale))
              : plan.status === "past_due"
                ? t.pastDue
                : t.active.replace("{date}", formatDate(plan.currentPeriodEnd, locale))}
          </p>

          <div className="mt-5 flex flex-wrap gap-2">
            {plan.status === "canceling" ? (
              <button type="button" onClick={onResume} disabled={busy !== null} className={`${button} bg-foreground text-background hover:bg-foreground/90`}>
                {busy === "resume" && <Loader2 className="h-4 w-4 animate-spin" />}
                {t.resume}
              </button>
            ) : null}
            <button type="button" onClick={onBilling} disabled={busy !== null} className={`${button} border border-border hover:bg-muted`}>
              {busy === "billing" ? <Loader2 className="h-4 w-4 animate-spin" /> : <ExternalLink className="h-4 w-4" />}
              {t.billing}
            </button>
            {plan.status === "active" || plan.status === "past_due" ? (
              <button type="button" onClick={onCancel} disabled={busy !== null} className={`${button} text-muted-foreground hover:bg-muted hover:text-foreground`}>
                {busy === "cancel" && <Loader2 className="h-4 w-4 animate-spin" />}
                {t.cancel}
              </button>
            ) : null}
          </div>
        </>
      )}
    </div>
  );
}
