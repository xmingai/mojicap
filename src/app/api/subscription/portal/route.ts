import { WAFFO_CUSTOMER_PORTAL_URL } from "@/lib/membership/waffo";
import { json, requireUser } from "@/lib/membership/server";

/** Waffo hosts payment methods, receipts and invoices; we just link to it. */
export async function GET(request: Request) {
  const guard = await requireUser(request);
  if (!guard.ok) return guard.response;
  return json({ url: WAFFO_CUSTOMER_PORTAL_URL });
}
