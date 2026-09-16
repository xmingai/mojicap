import test from "node:test";
import assert from "node:assert/strict";
import { emailLocale, signInCodeEmail } from "../src/lib/email";

const headers = (init: Record<string, string>) => new Headers(init);

test("the page's language wins over the saved switcher choice", () => {
  assert.equal(emailLocale(headers({ "x-mojicap-locale": "ja", cookie: "NEXT_LOCALE=zh" })), "ja");
});

test("falls back to the switcher cookie, then English", () => {
  assert.equal(emailLocale(headers({ cookie: "theme=dark; NEXT_LOCALE=ko" })), "ko");
  assert.equal(emailLocale(headers({})), "en");
  assert.equal(emailLocale(undefined), "en");
});

test("ignores languages without email copy", () => {
  assert.equal(emailLocale(headers({ "x-mojicap-locale": "de", cookie: "NEXT_LOCALE=fr" })), "fr");
  assert.equal(emailLocale(headers({ "x-mojicap-locale": "<script>" })), "en");
});

test("the Japanese email is Japanese", () => {
  assert.match(signInCodeEmail("123456", "ja").subject, /サインインコード/);
});
