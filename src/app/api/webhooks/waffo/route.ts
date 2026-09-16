/**
 * POST /api/webhooks/waffo — Waffo event intake.
 *
 * There is no webhook secret: Waffo signs with RSA and the SDK embeds both
 * environments' public keys. The mode guard below is what drops a test-mode
 * event on a production deployment (and vice versa). All state changes live
 * in processWaffoEvent(); an unsigned POST answers 401.
 */

import { databaseUrl, getDB } from "@/lib/db";
import { processWaffoEvent } from "@/lib/membership/process-event";
import { verifyWaffoWebhook, waffoEnvironment, type WaffoEvent } from "@/lib/membership/waffo";

export async function POST(request: Request) {
  const rawBody = await request.text();

  let event: WaffoEvent;
  try {
    event = verifyWaffoWebhook(rawBody, request.headers.get("x-waffo-signature"));
  } catch {
    return Response.json({ error: "Invalid signature" }, { status: 401 });
  }

  const expectProd = waffoEnvironment() === "production";
  const logFields = { deliveryId: event.id, eventType: event.eventType, mode: event.mode };
  if ((event.mode === "prod") !== expectProd) {
    console.info("[webhook:waffo]", { ...logFields, outcome: "ignored:mode" });
    return Response.json({ received: true, ignored: true, mode: event.mode });
  }

  // Without a database we can't record the grant; a 503 makes Waffo retry later.
  if (!databaseUrl()) return Response.json({ error: "Database not configured" }, { status: 503 });

  try {
    const result = await processWaffoEvent(getDB(), event);
    console.info("[webhook:waffo]", { ...logFields, outcome: result.outcome });
    return Response.json({ received: true, ...result });
  } catch (error) {
    console.error("[webhook:waffo] processing failed", { eventId: event.id, eventType: event.eventType, error });
    return Response.json({ error: "Webhook handler failed" }, { status: 500 });
  }
}
