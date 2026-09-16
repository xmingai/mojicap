/**
 * GET /api/cron/daily-report/ — emails the owner yesterday's sign-ups and
 * payments (see lib/reports/daily.ts). Vercel Cron calls it every morning per
 * vercel.json and sends `Authorization: Bearer $CRON_SECRET`; without that
 * secret configured the route refuses to run.
 *
 * `?preview=1` returns the rendered report instead of sending it.
 * Env: CRON_SECRET, DAILY_REPORT_TO (defaults to the support address).
 */

import { databaseUrl, getDB } from "@/lib/db";
import { sendEmail } from "@/lib/email";
import { SUPPORT_EMAIL } from "@/lib/legal";
import { buildDailyReport, renderDailyReport } from "@/lib/reports/daily";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET?.trim();
  if (!secret) return Response.json({ error: "CRON_SECRET not configured" }, { status: 503 });
  if (request.headers.get("authorization") !== `Bearer ${secret}`) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!databaseUrl()) return Response.json({ error: "Database not configured" }, { status: 503 });

  const report = await buildDailyReport(getDB());
  const email = renderDailyReport(report);

  if (new URL(request.url).searchParams.get("preview")) {
    return new Response(email.html, { headers: { "Content-Type": "text/html; charset=utf-8" } });
  }

  const to = process.env.DAILY_REPORT_TO?.trim() || SUPPORT_EMAIL;
  await sendEmail({ to, ...email });
  console.info("[cron:daily-report]", { date: report.date, signups: report.signups.count, newPaying: report.newPaying });
  return Response.json({ sent: true, date: report.date, signups: report.signups.count, newPaying: report.newPaying });
}
