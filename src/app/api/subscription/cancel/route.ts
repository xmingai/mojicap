import { getDB } from "@/lib/db";
import { getMembership } from "@/lib/membership/process-event";
import { cancelWaffoSubscription } from "@/lib/membership/waffo";
import { json, requireUser } from "@/lib/membership/server";

/**
 * Cancel at period end. The membership row changes when Waffo's
 * `subscription.canceling` webhook arrives, so the account page reflects the
 * provider's truth rather than an optimistic local write.
 */
export async function POST(request: Request) {
  const guard = await requireUser(request);
  if (!guard.ok) return guard.response;
  const row = await getMembership(getDB(), guard.value.id);
  if (!row?.orderId || (row.status !== "active" && row.status !== "past_due")) {
    return json({ error: "No active subscription to cancel", code: "NOT_CANCELLABLE" }, 400);
  }
  try {
    await cancelWaffoSubscription(row.orderId);
    return json({ ok: true });
  } catch (error) {
    console.error("[api/subscription/cancel] Waffo cancel failed", error);
    return json({ error: "Could not cancel the subscription", code: "CANCEL_FAILED" }, 502);
  }
}
