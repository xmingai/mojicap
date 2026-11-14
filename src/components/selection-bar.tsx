"use client";

import { Copy, X } from "lucide-react";
import { copyToClipboard } from "@/lib/clipboard";
import { useDict } from "@/i18n/context";

/** Bottom bar for bulk selection: copy everything selected at once. */
export function SelectionBar({ selected, onClear, onDone }: { selected: string[]; onClear: () => void; onDone: () => void }) {
  const dict = useDict();
  const t = dict.selection;
  const content = selected.join("");

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
        <button type="button" disabled={selected.length === 0} onClick={onClear} className={`${icon} text-muted-foreground hover:bg-muted hover:text-foreground`}>
          {t.clear}
        </button>
      </div>

      <button type="button" onClick={onDone} aria-label={t.done} className="grid h-9 w-9 place-items-center rounded-lg text-muted-foreground transition hover:bg-muted hover:text-foreground">
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
