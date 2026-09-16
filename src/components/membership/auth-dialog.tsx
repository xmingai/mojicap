"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Loader2 } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { useDict } from "@/i18n/context";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const RESEND_SECONDS = 60;

/** Why the dialog opened; "copies" means the free daily copies ran out. */
export type AuthReason = "copies" | null;

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reason?: AuthReason;
  google: boolean;
  onSignedIn: () => void;
};

function errorKey(error: { status?: number; code?: string } | null | undefined): "errorRate" | "errorCode" | "errorGeneric" {
  if (!error) return "errorGeneric";
  if (error.status === 429) return "errorRate";
  if (error.code && /OTP|ATTEMPT/i.test(error.code)) return "errorCode";
  if (error.status === 400 || error.status === 401 || error.status === 403) return "errorCode";
  return "errorGeneric";
}

export function AuthDialog({ open, onOpenChange, reason = null, google, onSignedIn }: Props) {
  const dict = useDict();
  const t = dict.auth;
  const [step, setStep] = useState<"email" | "code">("email");
  const limit = reason === "copies" && step === "email" ? t.limit : null;
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);
  const codeRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (cooldown <= 0) return;
    const id = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(id);
  }, [cooldown]);

  const reset = () => {
    setStep("email");
    setCode("");
    setError(null);
    setBusy(false);
  };

  const sendCode = async () => {
    const value = email.trim();
    if (!EMAIL_RE.test(value)) {
      setError(t.errorEmail);
      return;
    }
    setBusy(true);
    setError(null);
    const { error: err } = await authClient.emailOtp.sendVerificationOtp({ email: value, type: "sign-in" });
    setBusy(false);
    if (err) {
      setError(t[errorKey(err)]);
      return;
    }
    setEmail(value);
    setStep("code");
    setCooldown(RESEND_SECONDS);
    setTimeout(() => codeRef.current?.focus(), 50);
  };

  const verify = async (otp: string) => {
    setBusy(true);
    setError(null);
    const { error: err } = await authClient.signIn.emailOtp({ email, otp });
    setBusy(false);
    if (err) {
      setError(t[errorKey(err)]);
      return;
    }
    reset();
    onSignedIn();
  };

  const signInWithGoogle = async () => {
    setBusy(true);
    await authClient.signIn.social({ provider: "google", callbackURL: window.location.href });
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        onOpenChange(next);
        if (!next) reset();
      }}
    >
      <DialogContent closeLabel={t.close}>
        <DialogTitle>{limit ? limit.title : t.title}</DialogTitle>
        <DialogDescription>
          {limit ? limit.subtitle : step === "email" ? t.subtitle : t.codeSentTo.replace("{email}", email)}
        </DialogDescription>

        {limit && (
          <ul className="mt-4 grid gap-2 rounded-xl bg-muted/60 p-3 text-sm">
            {limit.benefits.map((benefit) => (
              <li key={benefit} className="flex items-start gap-2">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-foreground" />
                <span>{benefit}</span>
              </li>
            ))}
          </ul>
        )}

        {step === "email" ? (
          <form
            className="mt-5 grid gap-3"
            onSubmit={(e) => {
              e.preventDefault();
              sendCode();
            }}
          >
            <label className="grid gap-1.5 text-sm font-medium">
              {t.emailLabel}
              <input
                type="email"
                inputMode="email"
                autoComplete="email"
                autoFocus
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t.emailPlaceholder}
                className="h-11 rounded-xl border border-border bg-background px-3 text-base outline-none transition focus-visible:ring-2 focus-visible:ring-ring"
              />
            </label>
            {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
            <button
              type="submit"
              disabled={busy}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-foreground font-semibold text-background transition hover:bg-foreground/90 disabled:opacity-60"
            >
              {busy && <Loader2 className="h-4 w-4 animate-spin" />}
              {busy ? t.sending : t.sendCode}
            </button>
            {google && (
              <>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="h-px flex-1 bg-border" />
                  {t.or}
                  <span className="h-px flex-1 bg-border" />
                </div>
                <button
                  type="button"
                  onClick={signInWithGoogle}
                  disabled={busy}
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-border bg-background font-medium transition hover:bg-muted disabled:opacity-60"
                >
                  <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4">
                    <path fill="#EA4335" d="M12 10.2v3.9h5.5c-.2 1.3-1.6 3.9-5.5 3.9-3.3 0-6-2.7-6-6.1s2.7-6.1 6-6.1c1.9 0 3.1.8 3.8 1.5l2.6-2.5C16.8 3.3 14.6 2.4 12 2.4 6.7 2.4 2.4 6.7 2.4 12s4.3 9.6 9.6 9.6c5.5 0 9.2-3.9 9.2-9.4 0-.6-.1-1.1-.2-1.6H12z" />
                  </svg>
                  {t.google}
                </button>
              </>
            )}
            <p className="text-center text-xs text-muted-foreground">{t.legal}</p>
          </form>
        ) : (
          <form
            className="mt-5 grid gap-3"
            onSubmit={(e) => {
              e.preventDefault();
              if (code.length === 6) verify(code);
            }}
          >
            <label className="grid gap-1.5 text-sm font-medium">
              {t.codeLabel}
              <input
                ref={codeRef}
                inputMode="numeric"
                autoComplete="one-time-code"
                pattern="[0-9]*"
                maxLength={6}
                value={code}
                onChange={(e) => {
                  const next = e.target.value.replace(/\D/g, "").slice(0, 6);
                  setCode(next);
                  if (next.length === 6 && !busy) verify(next);
                }}
                className="h-12 rounded-xl border border-border bg-background px-3 text-center font-mono text-2xl tracking-[0.5em] tabular-nums outline-none transition focus-visible:ring-2 focus-visible:ring-ring"
              />
            </label>
            {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
            <button
              type="submit"
              disabled={busy || code.length !== 6}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-foreground font-semibold text-background transition hover:bg-foreground/90 disabled:opacity-60"
            >
              {busy && <Loader2 className="h-4 w-4 animate-spin" />}
              {busy ? t.verifying : t.verify}
            </button>
            <div className="flex items-center justify-between text-sm">
              <button type="button" onClick={reset} className="text-muted-foreground hover:text-foreground">
                {t.changeEmail}
              </button>
              <button
                type="button"
                onClick={sendCode}
                disabled={cooldown > 0 || busy}
                className="tabular-nums text-muted-foreground hover:text-foreground disabled:opacity-60 disabled:hover:text-muted-foreground"
              >
                {cooldown > 0 ? t.resendIn.replace("{seconds}", String(cooldown)) : t.resend}
              </button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
