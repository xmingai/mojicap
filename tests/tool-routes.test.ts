import test from "node:test";
import assert from "node:assert/strict";
import { TEXT_TOOLS, DYNAMIC_TEXT_TOOL_SLUGS, isDynamicTextTool } from "../src/lib/tool-routes.ts";

test("fancy-text is a text tool but not a dynamic [textTool] route", () => {
  assert.ok(TEXT_TOOLS.some((t) => t.slug === "fancy-text"));
  assert.ok(!DYNAMIC_TEXT_TOOL_SLUGS.includes("fancy-text"));
  assert.equal(isDynamicTextTool("fancy-text"), false);
});

test("dynamic tool slugs are recognised, unknown ones are not", () => {
  assert.equal(isDynamicTextTool("glitch-text"), true);
  assert.equal(isDynamicTextTool("nope"), false);
});

test("every dynamic slug has a nav key", () => {
  for (const slug of DYNAMIC_TEXT_TOOL_SLUGS) {
    const tool = TEXT_TOOLS.find((t) => t.slug === slug);
    assert.ok(tool && tool.navKey.length > 0);
  }
});
