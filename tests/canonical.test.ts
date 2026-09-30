import test from "node:test";
import assert from "node:assert/strict";
import { canonicalRedirect } from "../cloudflare/canonical.ts";

test("the bare domain goes to www over https, path and query kept", () => {
  assert.equal(canonicalRedirect("https://mojicap.com/zh/emoji/?q=heart"), "https://www.mojicap.com/zh/emoji/?q=heart");
  assert.equal(canonicalRedirect("http://mojicap.com/"), "https://www.mojicap.com/");
});

test("plain http on www goes to https in one hop", () => {
  assert.equal(canonicalRedirect("http://www.mojicap.com/emoji/coat/"), "https://www.mojicap.com/emoji/coat/");
});

test("the canonical host, workers.dev and localhost are served as they are", () => {
  assert.equal(canonicalRedirect("https://www.mojicap.com/"), null);
  assert.equal(canonicalRedirect("https://mojicap.example.workers.dev/"), null);
  assert.equal(canonicalRedirect("http://localhost:8787/"), null);
});
