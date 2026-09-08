"use client";

import { copyToClipboard } from "@/lib/clipboard";

export function ComboButton({ name, combo }: { name: string; combo: string }) {
  return (
    <button
      className="flex items-center justify-between p-4 rounded-xl border border-border/50 hover:border-border hover:bg-muted/50 transition-all cursor-pointer text-left w-full"
      onClick={() => copyToClipboard(combo, name)}
    >
      <div>
        <p className="text-xs text-muted-foreground mb-1">{name}</p>
        <p className="text-4xl tracking-wide">{combo}</p>
      </div>
    </button>
  );
}
