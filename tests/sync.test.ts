import test from "node:test";
import assert from "node:assert/strict";
import { LIMITS, mergeOrdered, sanitizeCombo, sanitizeItems } from "../src/lib/membership/sync";

test("sanitizeItems: trims, dedupes, drops junk and caps", () => {
  assert.deepEqual(sanitizeItems([" 😀", "😀", "", 3, "❤️"], 10), ["😀", "❤️"]);
  assert.deepEqual(sanitizeItems(["a", "b", "c"], 2), ["a", "b"]);
  assert.deepEqual(sanitizeItems(["x".repeat(LIMITS.itemChars + 1)], 5), []);
  assert.equal(sanitizeItems("nope", 5), null);
});

test("mergeOrdered: primary order wins and the result is capped", () => {
  assert.deepEqual(mergeOrdered(["a", "b"], ["b", "c", "d"], 3), ["a", "b", "c"]);
});

test("sanitizeCombo: needs both fields within limits", () => {
  assert.deepEqual(sanitizeCombo({ name: " Party ", content: "🎉🥳" }), { name: "Party", content: "🎉🥳" });
  assert.equal(sanitizeCombo({ name: "x", content: "" }), null);
  assert.equal(sanitizeCombo({ name: "x".repeat(LIMITS.comboNameChars + 1), content: "a" }), null);
  assert.equal(sanitizeCombo(null), null);
});
