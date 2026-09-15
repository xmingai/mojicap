import { eq } from "drizzle-orm";
import { getDB } from "@/lib/db";
import { recentList } from "@/lib/db/schema";
import { LIMITS, sanitizeItems } from "@/lib/membership/sync";
import { json, requireMember } from "@/lib/membership/server";

export async function GET(request: Request) {
  const guard = await requireMember(request);
  if (!guard.ok) return guard.response;
  const rows = await getDB().select().from(recentList).where(eq(recentList.userId, guard.value.id)).limit(1);
  let items: string[] = [];
  try {
    items = sanitizeItems(JSON.parse(rows[0]?.items ?? "[]"), LIMITS.recents) ?? [];
  } catch {
    items = [];
  }
  return json({ items });
}

export async function PUT(request: Request) {
  const guard = await requireMember(request);
  if (!guard.ok) return guard.response;
  const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
  const items = sanitizeItems(body.items, LIMITS.recents);
  if (!items) return json({ error: "items must be an array", code: "BAD_REQUEST" }, 400);
  const now = new Date();
  await getDB()
    .insert(recentList)
    .values({ userId: guard.value.id, items: JSON.stringify(items), updatedAt: now })
    .onConflictDoUpdate({ target: recentList.userId, set: { items: JSON.stringify(items), updatedAt: now } });
  return json({ items });
}
