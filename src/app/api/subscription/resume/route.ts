import { getDB } from "@/lib/db";
import { getMembership } from "@/lib/membership/process-event";
import { isMemberNow } from "@/lib/membership/entitlement";
import { resumeWaffoSubscription } from "@/lib/membership/waffo";
import { json, requireUser } from "@/lib/membership/server";

/** Withdraw a pending cancellation before the paid period ends. */
export async function POST(request: Request) {
  const guard = await requireUser(request);
  if (!guard.ok) return guard.response;
  const row = await getMembership(getDB(), guard.value.id);
  if (!row?.orderId || row.status !== "canceling" || !isMemberNow(row)) {
    return json({ error: "No cancelling subscription to resume", code: "NOT_RESUMABLE" }, 400);
  }
  try {
    await resumeWaffoSubscription(row.orderId, guard.value.id);
    return json({ ok: true });
  } catch (error) {
    console.error("[api/subscription/resume] Waffo reactivate failed", error);
    return json({ error: "Could not resume the subscription", code: "RESUME_FAILED" }, 502);
  }
}
