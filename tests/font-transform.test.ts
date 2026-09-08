import test from "node:test";
import assert from "node:assert/strict";
import { transformText, getToolResults } from "../src/lib/font-transform.ts";

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
