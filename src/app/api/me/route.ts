import { getSessionUser, googleSignInAvailable } from "@/lib/auth";
import { marketFromRequest } from "@/lib/membership/market";
import { membershipBackendReady } from "@/lib/membership/config-server";
import { json, membershipSummary } from "@/lib/membership/server";

/** Current account + entitlement. Read by the client after mount so static pages stay static. */
export async function GET(request: Request) {
  const market = marketFromRequest(request);
  if (!membershipBackendReady()) return json({ enabled: false, user: null, isMember: false, plan: null, google: false, market });
  const user = await getSessionUser(request);
  if (!user) return json({ enabled: true, user: null, isMember: false, plan: null, google: googleSignInAvailable(), market });
  return json({ enabled: true, user, google: googleSignInAvailable(), market, ...(await membershipSummary(user.id)) });
}
