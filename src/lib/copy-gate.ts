"use client";

import { evaluate, readLog, writeLog, type CopyStatus } from "./copy-quota";

/**
 * Module-level gate consulted by copyToClipboard, so every copy button on the
 * site is covered without threading membership state through 17 call sites.
 * MembershipProvider configures it; it stays open until then (and whenever the
 * membership feature is switched off), so copying never breaks.
 */
type Gate = {
  enabled: boolean;
  status: CopyStatus;
  /** `retry` re-runs the copy that was blocked, once the visitor signs in. */
  onBlocked: (status: CopyStatus, retry: () => void) => void;
};

let gate: Gate = { enabled: false, status: "anonymous", onBlocked: () => {} };

export function configureCopyGate(next: Partial<Gate>) {
  gate = { ...gate, ...next };
}

/** Records a copy and reports whether it may go ahead. */
export function consumeCopy(retry: () => void = () => {}, now: number = Date.now()): boolean {
  if (!gate.enabled || gate.status === "member") return true;
  const log = readLog(now);
  const { allowed } = evaluate(log, gate.status, now);
  if (!allowed) {
    gate.onBlocked(gate.status, retry);
    return false;
  }
  writeLog([...log, now]);
  return true;
}
