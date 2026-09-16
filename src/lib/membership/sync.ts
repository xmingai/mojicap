/**
 * Validation for member cloud data. Everything a client sends is untrusted:
 * cap list sizes and string lengths so one account can't bloat the database.
 */

export const LIMITS = {
  favorites: 500,
  /** A free account syncs this many favorites; Plus raises it to `favorites`. */
  freeFavorites: 20,
  recents: 50,
  combos: 200,
  itemChars: 64,
  comboNameChars: 60,
  comboContentChars: 500,
} as const;

/** Keep the first occurrence of each non-empty string, trimmed and capped. */
export function sanitizeItems(value: unknown, maxItems: number): string[] | null {
  if (!Array.isArray(value)) return null;
  const out: string[] = [];
  const seen = new Set<string>();
  for (const raw of value) {
    if (typeof raw !== "string") continue;
    const item = raw.trim();
    if (!item || item.length > LIMITS.itemChars || seen.has(item)) continue;
    seen.add(item);
    out.push(item);
    if (out.length >= maxItems) break;
  }
  return out;
}

/** Merge two ordered lists: `primary` order wins, then unseen items from `secondary`. */
export function mergeOrdered(primary: string[], secondary: string[], max: number): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const item of [...primary, ...secondary]) {
    if (seen.has(item)) continue;
    seen.add(item);
    out.push(item);
    if (out.length >= max) break;
  }
  return out;
}

export function sanitizeCombo(value: unknown): { name: string; content: string } | null {
  const v = (value ?? {}) as Record<string, unknown>;
  const name = typeof v.name === "string" ? v.name.trim() : "";
  const content = typeof v.content === "string" ? v.content.trim() : "";
  if (!name || !content) return null;
  if (name.length > LIMITS.comboNameChars || content.length > LIMITS.comboContentChars) return null;
  return { name, content };
}
