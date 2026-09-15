import { getDB } from "@/lib/db";
import { applyProviderStatus, getMembership } from "@/lib/membership/process-event";
import { cancelWaffoSubscription } from "@/lib/membership/waffo";
import { getPlan } from "@/lib/membership/plans";
import { json, requireUser } from "@/lib/membership/server";

/**
 * Cancel at period end. The row takes the status Waffo returns from the call
 * right away; the `subscription.canceling` webhook that follows is a no-op.
 */
export async function POST(request: Request) {
  const guard = await requireUser(request);
  if (!guard.ok) return guard.response;
  const row = await getMembership(getDB(), guard.value.id);
  // A one-time purchase has nothing to cancel: it simply runs out.
  if (row && getPlan(row.sku)?.kind === "onetime") {
    return json({ error: "One-time purchases expire on their own", code: "NOT_CANCELLABLE" }, 400);
  }
  if (!row?.orderId || (row.status !== "active" && row.status !== "past_due")) {
    return json({ error: "No active subscription to cancel", code: "NOT_CANCELLABLE" }, 400);
  }
  try {
    const status = await cancelWaffoSubscription(row.orderId, guard.value.id);
    if (status === "canceling" || status === "canceled") {
      await applyProviderStatus(getDB(), { userId: guard.value.id, orderId: row.orderId, from: ["active", "past_due"], to: status });
    }
    return json({ ok: true, status });
  } catch (error) {
    console.error("[api/subscription/cancel] Waffo cancel failed", error);
    return json({ error: "Could not cancel the subscription", code: "CANCEL_FAILED" }, 502);
  }
}
