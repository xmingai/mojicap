import { and, asc, eq, notInArray } from "drizzle-orm";
import { getDB } from "@/lib/db";
import { favorite } from "@/lib/db/schema";
import { LIMITS, sanitizeItems } from "@/lib/membership/sync";
import { json, requireUserWithTier } from "@/lib/membership/server";

/** Favorites sync is the one cloud feature a free account gets, capped at LIMITS.freeFavorites. */
const capFor = (isMember: boolean) => (isMember ? LIMITS.favorites : LIMITS.freeFavorites);

export async function GET(request: Request) {
  const guard = await requireUserWithTier(request);
  if (!guard.ok) return guard.response;
  const rows = await getDB()
    .select({ emoji: favorite.emoji })
    .from(favorite)
    .where(eq(favorite.userId, guard.value.id))
    .orderBy(asc(favorite.createdAt));
  return json({ items: rows.map((r) => r.emoji).slice(0, capFor(guard.value.isMember)), cap: capFor(guard.value.isMember) });
}

/** PUT { items } replaces the full set (the client has already merged local and remote). */
export async function PUT(request: Request) {
  const guard = await requireUserWithTier(request);
  if (!guard.ok) return guard.response;
  const cap = capFor(guard.value.isMember);
  const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
  const items = sanitizeItems(body.items, cap);
  if (!items) return json({ error: "items must be an array", code: "BAD_REQUEST" }, 400);

  const userId = guard.value.id;
  const db = getDB();
  await db.transaction(async (tx) => {
    if (items.length === 0) {
      await tx.delete(favorite).where(eq(favorite.userId, userId));
      return;
    }
    await tx.delete(favorite).where(and(eq(favorite.userId, userId), notInArray(favorite.emoji, items)));
    const base = Date.now();
    await tx
      .insert(favorite)
      .values(items.map((emoji, i) => ({ userId, emoji, createdAt: new Date(base + i) })))
      .onConflictDoNothing();
  });
  return json({ items, cap });
}
