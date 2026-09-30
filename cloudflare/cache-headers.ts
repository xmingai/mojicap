/**
 * Browser-facing Cache-Control for a Next response, or null to leave it as is.
 *
 * Next and OpenNext stamp prerendered pages and their RSC payloads with
 * `s-maxage=31536000, stale-while-revalidate=2592000`, written for Vercel's
 * CDN, which swapped it for `public, max-age=0, must-revalidate` before it
 * reached a browser. Here the Worker is the edge and the header goes out
 * as is - and `stale-while-revalidate` is honoured by browsers. With no
 * max-age the page is stale on arrival, so for thirty days the browser shows
 * its old copy first; after a deploy that copy names JS chunks the new
 * version no longer has, and client navigation breaks (PixFlow, 2026-08-23).
 *
 * Documents and RSC payloads only: they keep their ETag, so an unchanged page
 * still answers 304. Kept free of Worker APIs so it can be unit-tested.
 */
const BUILD_BOUND = /^text\/(html|x-component)\b/i;

export function browserCacheControl(cacheControl: string | null, contentType: string | null): string | null {
  if (!cacheControl || !/stale-while-revalidate/i.test(cacheControl)) return null;
  if (!contentType || !BUILD_BOUND.test(contentType)) return null;
  return "public, max-age=0, must-revalidate";
}
