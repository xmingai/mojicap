const CANONICAL_HOST = "www.mojicap.com";

/**
 * Where a request should be sent instead, or null to serve it.
 *
 * The bare domain and plain http go to https://www with path and query intact -
 * what Vercel's domain settings used to do (with a 307; this is permanent).
 * Only our own hostnames are touched, so localhost and workers.dev pass.
 * Kept free of Worker APIs so it can be unit-tested (tests/canonical.test.ts):
 * `wrangler dev` rewrites request URLs to the route host, so it cannot show
 * what production will do.
 */
export function canonicalRedirect(requestUrl: string): string | null {
  const url = new URL(requestUrl);
  const bare = url.hostname === "mojicap.com";
  const insecure = url.protocol === "http:" && url.hostname === CANONICAL_HOST;
  if (!bare && !insecure) return null;
  url.protocol = "https:";
  url.hostname = CANONICAL_HOST;
  url.port = "";
  return url.toString();
}
