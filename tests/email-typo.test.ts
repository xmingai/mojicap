import test from "node:test";
import assert from "node:assert/strict";
import { suggestEmailFix } from "../src/lib/email-typo.ts";

test("suggests the domain behind a common misspelling", () => {
  assert.equal(suggestEmailFix("a@gmial.com"), "a@gmail.com");
  assert.equal(suggestEmailFix("a@gmail.con"), "a@gmail.com");
  assert.equal(suggestEmailFix("a@hotmial.com"), "a@hotmail.com");
  assert.equal(suggestEmailFix("a@outlook.cm"), "a@outlook.com");
  assert.equal(suggestEmailFix("a@qq.con"), "a@qq.com");
  assert.equal(suggestEmailFix("a@163.co"), "a@163.com");
  assert.equal(suggestEmailFix("a@yandeks.ru"), "a@yandex.ru");
});

test("leaves correct and unknown domains alone", () => {
  for (const email of ["a@gmail.com", "a@qq.com", "a@mojicap.com", "a@my-company.co.uk", "a@163.com"]) {
    assert.equal(suggestEmailFix(email), null, email);
  }
});

test("never guesses from something that is not an address", () => {
  for (const value of ["", "gmail.com", "a@", "@gmail.com", "a@b"]) {
    assert.equal(suggestEmailFix(value), null, JSON.stringify(value));
  }
});

test("a short unusual domain is not bent into a common one", () => {
  // One edit from "me.com", but far too little to go on.
  assert.equal(suggestEmailFix("a@we.com"), null);
});
