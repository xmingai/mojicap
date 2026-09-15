import { getSessionUser, googleSignInAvailable } from "@/lib/auth";
import { membershipBackendReady } from "@/lib/membership/config";
import { json, membershipSummary } from "@/lib/membership/server";

/** Current account + entitlement. Read by the client after mount so static pages stay static. */
export async function GET(request: Request) {
  if (!membershipBackendReady()) return json({ enabled: false, user: null, isMember: false, plan: null, google: false });
  const user = await getSessionUser(request);
  if (!user) return json({ enabled: true, user: null, isMember: false, plan: null, google: googleSignInAvailable() });
  return json({ enabled: true, user, google: googleSignInAvailable(), ...(await membershipSummary(user.id)) });
}
