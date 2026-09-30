import test from "node:test";
import assert from "node:assert/strict";
import { browserCacheControl } from "../cloudflare/cache-headers.ts";

const VERCEL_STYLE = "s-maxage=31536000, stale-while-revalidate=2592000";

test("pages and RSC payloads lose stale-while-revalidate", () => {
  assert.equal(browserCacheControl(VERCEL_STYLE, "text/html; charset=utf-8"), "public, max-age=0, must-revalidate");
  assert.equal(browserCacheControl(VERCEL_STYLE, "text/x-component"), "public, max-age=0, must-revalidate");
  // First render of an on-demand page: s-maxage alone.
  assert.equal(browserCacheControl("s-maxage=31536000", "text/html; charset=utf-8"), "public, max-age=0, must-revalidate");
});

test("everything else keeps its own header", () => {
  assert.equal(browserCacheControl(VERCEL_STYLE, "application/xml"), null);
  assert.equal(browserCacheControl("public, max-age=60, stale-while-revalidate=30", "application/json"), null);
  assert.equal(browserCacheControl("private, no-cache, no-store", "text/html"), null);
  assert.equal(browserCacheControl(null, "text/html"), null);
});
