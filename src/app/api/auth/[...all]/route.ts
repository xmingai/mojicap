import { getAuth } from "@/lib/auth";
import { membershipBackendReady } from "@/lib/membership/config";

function unavailable() {
  return Response.json({ error: "Accounts are not enabled" }, { status: 503 });
}

/**
 * next.config sets `trailingSlash: true` for SEO, so every /api/auth/... call
 * arrives here as /api/auth/.../ after a 308. better-auth's router matches
 * paths without the trailing slash and would answer 404, so strip it before
 * handing the request over. Only this route needs it; page URLs keep theirs.
 */
async function forAuth(request: Request): Promise<Request> {
  const url = new URL(request.url);
  if (url.pathname.length <= 1 || !url.pathname.endsWith("/")) return request;
  url.pathname = url.pathname.replace(/\/+$/, "");
  const hasBody = request.method !== "GET" && request.method !== "HEAD";
  return new Request(url, {
    method: request.method,
    headers: request.headers,
    body: hasBody ? await request.arrayBuffer() : undefined,
    redirect: "manual",
  });
}

export async function GET(request: Request) {
  if (!membershipBackendReady()) return unavailable();
  return getAuth().handler(await forAuth(request));
}

export async function POST(request: Request) {
  if (!membershipBackendReady()) return unavailable();
  return getAuth().handler(await forAuth(request));
}
