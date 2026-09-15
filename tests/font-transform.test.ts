import test from "node:test";
import assert from "node:assert/strict";
import { transformText, getToolResults } from "../src/lib/font-transform.ts";
import { getPremiumResults, PREMIUM_STYLES } from "../src/lib/premium-fonts.ts";

test("transformText bold maps ASCII letters to the bold Unicode block", () => {
  assert.equal(transformText("A", "bold"), "\u{1D400}");
  assert.equal(transformText("hi", "bold"), "\u{1D421}\u{1D422}");
});

test("transformText leaves unmapped characters untouched", () => {
  assert.equal(transformText("A!", "bold"), "\u{1D400}!");
});

test("getToolResults morse-code returns a single morse result", () => {
  const res = getToolResults("SOS", "morse-code");
  assert.equal(res.length, 1);
  assert.equal(res[0].result, "... --- ...");
});

test("getToolResults falls back to all fonts for an unknown tool", () => {
  const res = getToolResults("Hi", "not-a-real-tool");
  assert.ok(res.length > 5);
  assert.ok(res.every((r) => typeof r.result === "string"));
});

test("premium styles have unique slugs that do not collide with free styles", () => {
  const free = new Set(getToolResults("x", "all").map((r) => r.slug));
  const slugs = PREMIUM_STYLES.map((s) => s.slug);
  assert.equal(new Set(slugs).size, slugs.length);
  for (const s of slugs) assert.ok(!free.has(s), s);
});

test("premium transforms map letters and digits", () => {
  const by = Object.fromEntries(getPremiumResults("Ab 1").map((r) => [r.slug, r.result]));
  assert.equal(by["negative-circled"], "\u{1F150}\u{1F151} ❶");
  assert.equal(by["parenthesized"], "\u{1F110}⒝ ⑴");
  assert.equal(by["regional-letters"], "\u{1F1E6}​\u{1F1E7}​ 1");
  assert.equal(by["lenticular"], "【A】【b】 【1】");
  assert.equal(by["hearts"], "A♡b 1");
  assert.equal(by["double-underline"], "A̳b̳ 1̳");
  assert.equal(by["sparkles"], "✧･ﾟ: Ab 1 :･ﾟ✧");
});

test("premium transforms leave empty input empty", () => {
  for (const r of getPremiumResults("")) assert.equal(r.result, "", r.slug);
});
