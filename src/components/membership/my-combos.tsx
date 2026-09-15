"use client";

import { useEffect, useState } from "react";
import { Copy, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { copyToClipboard } from "@/lib/clipboard";
import { useDict } from "@/i18n/context";
import { MEMBERSHIP_UI_ENABLED } from "@/lib/membership/config";
import { useMembership } from "./membership-provider";

type SavedCombo = { id: string; name: string; content: string };

/** A member's saved combos (made with bulk select on the Emoji page), shown above the built-in ones. */
export function MyCombos({ fontSize }: { fontSize: number }) {
  const dict = useDict();
  const t = dict.myCombos;
  const { ready, me } = useMembership();
  const active = MEMBERSHIP_UI_ENABLED && ready && me.isMember;
  const [items, setItems] = useState<SavedCombo[] | null>(null);

  useEffect(() => {
    if (!active) return;
    let cancelled = false;
    fetch("/api/combos/")
      .then((res) => (res.ok ? res.json() : { items: [] }))
      .then((data: { items: SavedCombo[] }) => {
        if (!cancelled) setItems(data.items);
      })
      .catch(() => {
        if (!cancelled) setItems([]);
      });
    return () => {
      cancelled = true;
    };
  }, [active]);

  if (!active || items === null) return null;

  const remove = async (combo: SavedCombo) => {
    setItems((prev) => prev?.filter((c) => c.id !== combo.id) ?? null);
    const res = await fetch(`/api/combos/?id=${encodeURIComponent(combo.id)}`, { method: "DELETE" });
    if (res.ok) {
      toast.success(t.deleted);
    } else {
      setItems((prev) => (prev ? [combo, ...prev] : prev));
      toast.error(dict.account.actionError);
    }
  };

  return (
    <section>
      <h2 className="text-lg font-semibold mb-3">{t.title}</h2>
      {items.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border p-4 text-sm text-muted-foreground">{t.empty}</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
          {items.map((combo) => (
            <div
              key={combo.id}
              className="group flex items-center gap-2 rounded-xl border border-border/50 p-2 pl-0 transition-all hover:border-border hover:bg-muted/50"
            >
              <button
                type="button"
                onClick={() => copyToClipboard(combo.content, combo.name)}
                className="flex min-w-0 flex-1 cursor-pointer items-center justify-between gap-3 p-2 pl-4 text-left"
              >
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground mb-1.5 truncate">{combo.name}</p>
                  <p className="tracking-wide truncate" style={{ fontSize: `${fontSize}px` }}>
                    {combo.content}
                  </p>
                </div>
                <Copy className="h-4 w-4 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
              </button>
              <button
                type="button"
                onClick={() => remove(combo)}
                aria-label={`${t.delete}: ${combo.name}`}
                className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-muted-foreground opacity-0 transition hover:bg-muted hover:text-foreground focus-visible:opacity-100 group-hover:opacity-100 max-sm:opacity-100"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
