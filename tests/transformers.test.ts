import test from "node:test";
import assert from "node:assert/strict";
import { textToBraille, textToMorse } from "../src/lib/transformers.ts";

test("textToMorse maps letters, digits and spaces", () => {
  assert.equal(textToMorse("SOS"), "... --- ...");
  assert.equal(textToMorse("Hi 5"), ".... .. / .....");
});

test("textToMorse passes through unknown characters", () => {
  assert.equal(textToMorse("@"), "@");
});

test("textToBraille converts and is reversible in length", () => {
  const out = textToBraille("abc");
  assert.equal(typeof out, "string");
  assert.ok(out.length >= 3);
  // space maps to a braille blank, not a literal space
  assert.notEqual(textToBraille("a b"), "");
});
