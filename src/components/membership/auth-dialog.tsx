"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Loader2 } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { EmojiWall } from "./emoji-wall";
import { suggestEmailFix } from "@/lib/email-typo";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import Link from "next/link";
import { useDict, useLocale } from "@/i18n/context";
import { defaultLocale } from "@/i18n/config";

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

/** The agreement line, with the two policies as real links. */
function LegalLine({ t, prefix }: { t: ReturnType<typeof useDict>["auth"]; prefix: string }) {
  const link = "underline underline-offset-2 hover:text-foreground";
  const parts = t.legal.split(/(\{terms\}|\{privacy\})/);
  return (
    <p className="text-center text-xs text-muted-foreground">
      {parts.map((part, i) =>
        part === "{terms}" ? (
          <Link key={i} href={`${prefix}/terms/`} target="_blank" className={link}>
            {t.termsLink}
          </Link>
        ) : part === "{privacy}" ? (
          <Link key={i} href={`${prefix}/privacy/`} target="_blank" className={link}>
            {t.privacyLink}
          </Link>
        ) : (
          part
        ),
      )}
    </p>
  );
}

export function AuthDialog({ open, onOpenChange, reason = null, google, onSignedIn }: Props) {
  const dict = useDict();
  const t = dict.auth;
  const locale = useLocale();
  const prefix = locale === defaultLocale ? "" : `/${locale}`;
  const [step, setStep] = useState<"email" | "code">("email");
  const limit = reason === "copies" && step === "email" ? t.limit : null;
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);
  // A code sent to a misspelt domain fails silently, so offer the fix before sending.
  const [suggestion, setSuggestion] = useState<string | null>(null);
  const codeRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (cooldown <= 0) return;
    const id = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(id);
  }, [cooldown]);

  const reset = () => {
    setStep("email");
    setSuggestion(null);
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
    setSuggestion(null);
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
      <DialogContent closeLabel={t.close} className="max-w-[760px] overflow-hidden p-0 md:grid md:min-h-[440px] md:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]">
        <EmojiWall />
        <div className="p-6 md:flex md:flex-col md:justify-center md:p-8">
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
                onChange={(e) => {
                  setEmail(e.target.value);
                  setSuggestion(null);
                }}
                onBlur={(e) => setSuggestion(suggestEmailFix(e.target.value))}
                placeholder={t.emailPlaceholder}
                className="h-11 rounded-xl border border-border bg-background px-3 text-base outline-none transition focus-visible:ring-2 focus-visible:ring-ring"
              />
            </label>
            {suggestion && (
              <p className="text-sm text-muted-foreground">
                {t.typoQuestion.split("{email}")[0]}
                <button
                  type="button"
                  onClick={() => {
                    setEmail(suggestion);
                    setSuggestion(null);
                  }}
                  className="font-medium text-foreground underline underline-offset-2"
                >
                  {suggestion}
                </button>
                {t.typoQuestion.split("{email}")[1]}
              </p>
            )}
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
                  <svg aria-hidden="true" viewBox="0 0 48 48" className="h-4 w-4">
                    <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.2-.1-2.4-.4-3.5z" />
                    <path fill="#FF3D00" d="m6.3 14.7 6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
                    <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z" />
                    <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.2-.1-2.4-.4-3.5z" />
                  </svg>
                  {t.google}
                </button>
              </>
            )}
            <LegalLine t={t} prefix={prefix} />
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
            <p className="text-xs text-muted-foreground">{t.noCode}</p>
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
        </div>
      </DialogContent>
    </Dialog>
  );
}
