import { and, count, desc, eq } from "drizzle-orm";
import { getDB } from "@/lib/db";
import { customCombo } from "@/lib/db/schema";
import { LIMITS, sanitizeCombo } from "@/lib/membership/sync";
import { json, requireMember } from "@/lib/membership/server";

export async function GET(request: Request) {
  const guard = await requireMember(request);
  if (!guard.ok) return guard.response;
  const rows = await getDB()
    .select({ id: customCombo.id, name: customCombo.name, content: customCombo.content, createdAt: customCombo.createdAt })
    .from(customCombo)
    .where(eq(customCombo.userId, guard.value.id))
    .orderBy(desc(customCombo.createdAt));
  return json({ items: rows.map((r) => ({ ...r, createdAt: r.createdAt.toISOString() })) });
}

/** POST { name, content } → the saved combo. */
export async function POST(request: Request) {
  const guard = await requireMember(request);
  if (!guard.ok) return guard.response;
  const combo = sanitizeCombo(await request.json().catch(() => null));
  if (!combo) return json({ error: "A name and content are required", code: "BAD_REQUEST" }, 400);

  const db = getDB();
  const [{ value: existing }] = await db.select({ value: count() }).from(customCombo).where(eq(customCombo.userId, guard.value.id));
  if (existing >= LIMITS.combos) return json({ error: "Combo limit reached", code: "LIMIT" }, 409);

  const row = { id: crypto.randomUUID(), userId: guard.value.id, ...combo, createdAt: new Date() };
  await db.insert(customCombo).values(row);
  return json({ item: { id: row.id, name: row.name, content: row.content, createdAt: row.createdAt.toISOString() } }, 201);
}

/** DELETE ?id=… */
export async function DELETE(request: Request) {
  const guard = await requireMember(request);
  if (!guard.ok) return guard.response;
  const id = new URL(request.url).searchParams.get("id");
  if (!id) return json({ error: "id is required", code: "BAD_REQUEST" }, 400);
  await getDB().delete(customCombo).where(and(eq(customCombo.id, id), eq(customCombo.userId, guard.value.id)));
  return json({ ok: true });
}
