/**
 * Copy quota — the conversion gate on the one action everyone comes for.
 *
 *   anonymous          3 copies per rolling 24 hours, then the sign-in dialog
 *   signed in, free   10 copies per rolling 24 hours, then the Plus dialog
 *   Plus member       unlimited, nothing is recorded
 *
 * The count lives in localStorage: copying happens in the browser, so this can
 * always be reset by clearing site data or opening a private window. It is a
 * nudge, not an entitlement check — the real guards are the server-side ones on
 * sync, combos and checkout.
 */

export type CopyStatus = "anonymous" | "free" | "member";

export const COPY_WINDOW_MS = 24 * 60 * 60 * 1000;
export const COPY_LIMITS: Record<Exclude<CopyStatus, "member">, number> = { anonymous: 3, free: 10 };
export const COPY_LOG_KEY = "mojicap-copy-log";

/** Copy timestamps still inside the window, oldest first. */
export function withinWindow(log: number[], now: number): number[] {
  return log.filter((at) => Number.isFinite(at) && now - at < COPY_WINDOW_MS && at <= now);
}

export function limitFor(status: CopyStatus): number {
  return status === "member" ? Infinity : COPY_LIMITS[status];
}

/** What a copy attempt should do, given the copies already made. */
export function evaluate(log: number[], status: CopyStatus, now: number): { allowed: boolean; used: number; remaining: number } {
  if (status === "member") return { allowed: true, used: 0, remaining: Infinity };
  const used = withinWindow(log, now).length;
  const remaining = Math.max(0, limitFor(status) - used);
  return { allowed: remaining > 0, used, remaining };
}

/** When the oldest copy in the window expires, i.e. when one more becomes free. */
export function resetsAt(log: number[], now: number): number | null {
  const [oldest] = withinWindow(log, now);
  return oldest === undefined ? null : oldest + COPY_WINDOW_MS;
}

export function readLog(now: number = Date.now()): number[] {
  try {
    const raw = localStorage.getItem(COPY_LOG_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? withinWindow(parsed.map(Number), now) : [];
  } catch {
    return [];
  }
}

export function writeLog(log: number[]) {
  try {
    localStorage.setItem(COPY_LOG_KEY, JSON.stringify(log));
  } catch {}
}
