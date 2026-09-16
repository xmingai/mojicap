import test from "node:test";
import assert from "node:assert/strict";
import { COPY_LIMITS, COPY_WINDOW_MS, evaluate, limitFor, resetsAt, withinWindow } from "../src/lib/copy-quota.ts";

const NOW = Date.parse("2026-09-15T12:00:00Z");
const ago = (ms: number) => NOW - ms;

test("limits: 3 for a visitor, 10 once signed in, none for a member", () => {
  assert.equal(limitFor("anonymous"), 3);
  assert.equal(limitFor("free"), 10);
  assert.equal(limitFor("member"), Infinity);
  assert.deepEqual(COPY_LIMITS, { anonymous: 3, free: 10 });
});

test("a visitor's first three copies pass and the fourth is blocked", () => {
  const log: number[] = [];
  for (let i = 1; i <= 3; i++) {
    const r = evaluate(log, "anonymous", NOW);
    assert.equal(r.allowed, true, `copy ${i}`);
    assert.equal(r.remaining, 4 - i);
    log.push(NOW);
  }
  assert.deepEqual(evaluate(log, "anonymous", NOW), { allowed: false, used: 3, remaining: 0 });
});

test("signing in raises the same log's allowance from 3 to 10", () => {
  const log = [ago(1000), ago(900), ago(800)];
  assert.equal(evaluate(log, "anonymous", NOW).allowed, false);
  assert.deepEqual(evaluate(log, "free", NOW), { allowed: true, used: 3, remaining: 7 });
});

test("members are never counted or blocked", () => {
  const log = Array.from({ length: 50 }, () => NOW);
  assert.deepEqual(evaluate(log, "member", NOW), { allowed: true, used: 0, remaining: Infinity });
});

test("the window rolls: copies older than 24h stop counting", () => {
  const log = [ago(COPY_WINDOW_MS + 1), ago(COPY_WINDOW_MS - 1000), ago(60_000)];
  assert.deepEqual(withinWindow(log, NOW), [ago(COPY_WINDOW_MS - 1000), ago(60_000)]);
  assert.equal(evaluate(log, "anonymous", NOW).remaining, 1);
  assert.equal(resetsAt(log, NOW), ago(COPY_WINDOW_MS - 1000) + COPY_WINDOW_MS);
  assert.equal(resetsAt([], NOW), null);
});

test("junk in storage never blocks copying", () => {
  const log = [NaN, Infinity, NOW + 60_000] as number[]; // corrupt, and a clock that jumped back
  assert.deepEqual(withinWindow(log, NOW), []);
  assert.equal(evaluate(log, "anonymous", NOW).allowed, true);
});
