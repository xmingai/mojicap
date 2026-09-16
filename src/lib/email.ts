/**
 * Transactional email via Resend's HTTP API (no SDK needed).
 *
 * Env: RESEND_API_KEY, EMAIL_FROM (e.g. "MojiCap <hello@mojicap.com>").
 * Outside production, an unconfigured sender logs the message instead so the
 * sign-in flow can be exercised locally.
 */

import { LOCALE_HEADER } from "./locale-header";

export async function sendEmail(params: { to: string; subject: string; html: string; text: string }): Promise<void> {
  const key = process.env.RESEND_API_KEY?.trim();
  const from = process.env.EMAIL_FROM?.trim();
  if (!key || !from) {
    if (process.env.NODE_ENV !== "production") {
      console.info(`[email:dev] to=${params.to} subject="${params.subject}"\n${params.text}`);
      return;
    }
    console.error("[email] RESEND_API_KEY / EMAIL_FROM not configured; dropped:", params.subject);
    return;
  }
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from, to: [params.to], subject: params.subject, html: params.html, text: params.text }),
  });
  if (!res.ok) {
    console.error("[email] Resend rejected the message", res.status, await res.text().catch(() => ""));
  }
}

/**
 * Language for the sign-in email: the page the visitor asked from, then the
 * language they last picked in the switcher (NEXT_LOCALE), then English.
 * Only languages we have copy for are accepted.
 */
export function emailLocale(headers: Headers | undefined): string {
  const known = (value: string | null | undefined) => (value && value in OTP_COPY ? value : null);
  const cookie = headers?.get("cookie")?.match(/(?:^|;\s*)NEXT_LOCALE=([a-z]{2})/)?.[1];
  return known(headers?.get(LOCALE_HEADER)) ?? known(cookie) ?? "en";
}

const OTP_COPY: Record<string, { subject: string; heading: string; body: string; ignore: string }> = {
  en: { subject: "Your MojiCap sign-in code", heading: "Your sign-in code", body: "Enter this code on MojiCap. It expires in 10 minutes.", ignore: "If you didn't try to sign in, you can ignore this email." },
  zh: { subject: "你的 MojiCap 登录验证码", heading: "登录验证码", body: "请在 MojiCap 输入此验证码，10 分钟内有效。", ignore: "如果不是你本人操作，请忽略这封邮件。" },
  ja: { subject: "MojiCap のサインインコード", heading: "サインインコード", body: "MojiCap でこのコードを入力してください。有効期限は 10 分です。", ignore: "心当たりがない場合は、このメールを無視してください。" },
  ko: { subject: "MojiCap 로그인 코드", heading: "로그인 코드", body: "MojiCap에 이 코드를 입력하세요. 10분 후 만료됩니다.", ignore: "로그인을 시도하지 않았다면 이 메일을 무시하세요." },
  es: { subject: "Tu código de acceso a MojiCap", heading: "Tu código de acceso", body: "Introduce este código en MojiCap. Caduca en 10 minutos.", ignore: "Si no intentaste iniciar sesión, ignora este correo." },
  ru: { subject: "Код входа в MojiCap", heading: "Код входа", body: "Введите этот код на MojiCap. Он действует 10 минут.", ignore: "Если вы не пытались войти, просто проигнорируйте это письмо." },
  fr: { subject: "Votre code de connexion MojiCap", heading: "Votre code de connexion", body: "Saisissez ce code sur MojiCap. Il expire dans 10 minutes.", ignore: "Si vous n'avez pas tenté de vous connecter, ignorez cet e-mail." },
  pt: { subject: "Seu código de acesso ao MojiCap", heading: "Seu código de acesso", body: "Digite este código no MojiCap. Ele expira em 10 minutos.", ignore: "Se você não tentou entrar, ignore este e-mail." },
};

export function signInCodeEmail(otp: string, locale: string) {
  const c = OTP_COPY[locale] ?? OTP_COPY.en;
  const html = `<!doctype html><html><body style="margin:0;background:#f4f4f5;font-family:-apple-system,Segoe UI,Helvetica,Arial,sans-serif;color:#0a0a0a">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:32px 16px">
<table role="presentation" width="100%" style="max-width:440px;background:#ffffff;border-radius:16px;padding:32px">
<tr><td style="font-size:14px;font-weight:600">MojiCap</td></tr>
<tr><td style="padding-top:24px;font-size:20px;font-weight:700">${c.heading}</td></tr>
<tr><td style="padding-top:8px;font-size:14px;color:#52525b">${c.body}</td></tr>
<tr><td style="padding-top:24px"><div style="font-size:32px;font-weight:700;letter-spacing:8px;font-family:ui-monospace,Menlo,monospace">${otp}</div></td></tr>
<tr><td style="padding-top:24px;font-size:12px;color:#71717a">${c.ignore}</td></tr>
</table></td></tr></table></body></html>`;
  const text = `${c.heading}: ${otp}\n\n${c.body}\n${c.ignore}`;
  return { subject: c.subject, html, text };
}
