"use client";

import { useState } from "react";
import { Minus, Plus } from "lucide-react";
import { copyToClipboard } from "@/lib/clipboard";

const SIZE_PRESETS = [
  { label: "S", value: 28 },
  { label: "M", value: 36 },
  { label: "L", value: 44 },
  { label: "XL", value: 56 },
];

interface PopularEmojiGridProps {
  emojis: string[];
}

export function PopularEmojiGrid({ emojis }: PopularEmojiGridProps) {
  const [sizeIndex, setSizeIndex] = useState(2); // Default to "L"
  const currentSize = SIZE_PRESETS[sizeIndex];

  return (
    <div className="space-y-3">
      {/* Size control bar */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setSizeIndex((i) => Math.max(0, i - 1))}
          disabled={sizeIndex === 0}
          className="p-1.5 rounded-lg hover:bg-muted disabled:opacity-30 transition-colors"
          aria-label="Smaller"
        >
          <Minus className="h-3.5 w-3.5" />
        </button>

        <div className="flex gap-1">
          {SIZE_PRESETS.map((preset, i) => (
            <button
              key={preset.label}
              onClick={() => setSizeIndex(i)}
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition-all ${
                i === sizeIndex
                  ? "bg-foreground text-background shadow-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
              {preset.label}
            </button>
          ))}
        </div>

        <button
          onClick={() => setSizeIndex((i) => Math.min(SIZE_PRESETS.length - 1, i + 1))}
          disabled={sizeIndex === SIZE_PRESETS.length - 1}
          className="p-1.5 rounded-lg hover:bg-muted disabled:opacity-30 transition-colors"
          aria-label="Larger"
        >
          <Plus className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Emoji grid */}
      <div className="flex flex-wrap gap-1">
        {emojis.map((emoji, i) => (
          <button
            key={`${emoji}-${i}`}
            className="rounded-xl hover:bg-muted transition-all active:scale-90 cursor-pointer hover:scale-105"
            style={{
              fontSize: `${currentSize.value}px`,
              padding: `${Math.max(4, currentSize.value * 0.2)}px`,
              lineHeight: 1.1,
            }}
            onClick={() => copyToClipboard(emoji)}
          >
            {emoji}
          </button>
        ))}
      </div>
    </div>
  );
}
