"use client";

import { useState } from "react";
import { Copy, Loader2, Save, X } from "lucide-react";
import { toast } from "sonner";
import { copyToClipboard } from "@/lib/clipboard";
import { useDict, useLocale } from "@/i18n/context";
import { localePath } from "@/lib/seo";

/**
 * Bottom bar for bulk selection (a Plus feature): copy everything selected at
 * once, or save it as a named combo in the member's account.
 */
export function SelectionBar({ selected, onClear, onDone }: { selected: string[]; onClear: () => void; onDone: () => void }) {
  const dict = useDict();
  const locale = useLocale();
  const t = dict.selection;
  const [naming, setNaming] = useState(false);
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
  const content = selected.join("");

  const save = async () => {
    const trimmed = name.trim();
    if (!trimmed || !content) return;
    setSaving(true);
    const res = await fetch("/api/combos/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: trimmed, content }),
    });
    setSaving(false);
    if (!res.ok) {
      toast.error(dict.account.actionError);
      return;
    }
    setNaming(false);
    setName("");
    toast.success(t.saved, {
      action: { label: dict.myCombos.title, onClick: () => (window.location.href = localePath(locale, "/combos")) },
    });
  };

  const icon = "inline-flex h-9 items-center justify-center gap-1.5 rounded-lg px-3 text-sm font-semibold transition disabled:opacity-50";

  return (
    <div
      role="region"
      aria-label={t.selected.replace("{count}", String(selected.length))}
      className="fixed inset-x-3 bottom-3 z-40 mx-auto flex max-w-2xl flex-wrap items-center gap-2 rounded-2xl border border-border bg-background/95 p-2 shadow-2xl backdrop-blur-xl sm:bottom-5"
    >
      <span className="min-w-0 flex-1 truncate px-2 text-sm">
        {selected.length === 0 ? (
          <span className="text-muted-foreground">{t.hint}</span>
        ) : (
          <>
            <span className="mr-2 text-muted-foreground tabular-nums">{t.selected.replace("{count}", String(selected.length))}</span>
            <span className="text-lg leading-none">{content}</span>
          </>
        )}
      </span>

      {naming ? (
        <form
          className="flex w-full items-center gap-2 sm:w-auto"
          onSubmit={(e) => {
            e.preventDefault();
            save();
          }}
        >
          <input
            autoFocus
            value={name}
            maxLength={60}
            onChange={(e) => setName(e.target.value)}
            placeholder={t.namePlaceholder}
            className="h-9 min-w-0 flex-1 rounded-lg border border-border bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring sm:w-44"
          />
          <button type="submit" disabled={saving || !name.trim()} className={`${icon} bg-foreground text-background hover:bg-foreground/90`}>
            {saving && <Loader2 className="h-4 w-4 animate-spin" />}
            {t.saveConfirm}
          </button>
        </form>
      ) : (
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            disabled={selected.length === 0}
            onClick={() => copyToClipboard(content)}
            className={`${icon} bg-foreground text-background hover:bg-foreground/90`}
          >
            <Copy className="h-4 w-4" />
            {t.copy}
          </button>
          <button type="button" disabled={selected.length === 0} onClick={() => setNaming(true)} className={`${icon} border border-border hover:bg-muted`}>
            <Save className="h-4 w-4" />
            <span className="hidden sm:inline">{t.save}</span>
          </button>
          <button type="button" disabled={selected.length === 0} onClick={onClear} className={`${icon} text-muted-foreground hover:bg-muted hover:text-foreground`}>
            {t.clear}
          </button>
        </div>
      )}

      <button type="button" onClick={onDone} aria-label={t.done} className="grid h-9 w-9 place-items-center rounded-lg text-muted-foreground transition hover:bg-muted hover:text-foreground">
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
