"use client";

import { X, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { copyToClipboard } from "@/lib/clipboard";

interface SelectionBarProps {
  selected: string[];
  onClear: () => void;
}

export function SelectionBar({ selected, onClear }: SelectionBarProps) {
  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-4 py-2.5 rounded-xl bg-foreground text-background shadow-2xl">
      <span className="text-lg">{selected.join("")}</span>

      <Button
        size="sm"
        variant="secondary"
        className="h-7 text-xs"
        onClick={() => copyToClipboard(selected.join(""), "selection")}
      >
        <Copy className="h-3 w-3 mr-1" />
        Copy
      </Button>

      <button onClick={onClear} className="p-0.5 rounded hover:bg-background/20 transition-colors">
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
