import test from "node:test";
import assert from "node:assert/strict";
import { COPY_LIMITS, COPY_WINDOW_MS, evaluate, limitFor, resetsAt, withinWindow } from "../src/lib/copy-quota.ts";

const NOW = Date.parse("2026-09-15T12:00:00Z");
const ago = (ms: number) => NOW - ms;

test("limits: 1 for a visitor, 4 once signed in, none for a member", () => {
  assert.equal(limitFor("anonymous"), 1);
  assert.equal(limitFor("free"), 4);
  assert.equal(limitFor("member"), Infinity);
  assert.deepEqual(COPY_LIMITS, { anonymous: 1, free: 4 });
});

test("a visitor's first copy passes and the second is blocked", () => {
  const log: number[] = [];
  assert.deepEqual(evaluate(log, "anonymous", NOW), { allowed: true, used: 0, remaining: 1 });
  log.push(NOW);
  assert.deepEqual(evaluate(log, "anonymous", NOW), { allowed: false, used: 1, remaining: 0 });
});

test("signing in after the visitor's copy gives exactly 3 more", () => {
  const log = [ago(1000)];
  assert.equal(evaluate(log, "anonymous", NOW).allowed, false);
  assert.deepEqual(evaluate(log, "free", NOW), { allowed: true, used: 1, remaining: 3 });
  log.push(ago(900), ago(800), ago(700));
  assert.deepEqual(evaluate(log, "free", NOW), { allowed: false, used: 4, remaining: 0 });
});

test("members are never counted or blocked", () => {
  const log = Array.from({ length: 50 }, () => NOW);
  assert.deepEqual(evaluate(log, "member", NOW), { allowed: true, used: 0, remaining: Infinity });
});

test("the window rolls: copies older than 24h stop counting", () => {
  const log = [ago(COPY_WINDOW_MS + 1), ago(COPY_WINDOW_MS - 1000), ago(60_000)];
  assert.deepEqual(withinWindow(log, NOW), [ago(COPY_WINDOW_MS - 1000), ago(60_000)]);
  assert.equal(evaluate(log, "free", NOW).remaining, 2);
  assert.equal(resetsAt(log, NOW), ago(COPY_WINDOW_MS - 1000) + COPY_WINDOW_MS);
  assert.equal(resetsAt([], NOW), null);
});

test("junk in storage never blocks copying", () => {
  const log = [NaN, Infinity, NOW + 60_000] as number[]; // corrupt, and a clock that jumped back
  assert.deepEqual(withinWindow(log, NOW), []);
  assert.equal(evaluate(log, "anonymous", NOW).allowed, true);
});
