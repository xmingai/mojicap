"use client";

import { useState } from "react";
import { copyToClipboard } from "@/lib/clipboard";
import { SizeSlider, SizePreset } from "@/components/size-slider";

const POPULAR_SIZE_PRESETS: SizePreset[] = [
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
  const currentSize = POPULAR_SIZE_PRESETS[sizeIndex];

  return (
    <div className="space-y-3">
      {/* Size control bar */}
      <SizeSlider sizeIndex={sizeIndex} setSizeIndex={setSizeIndex} presets={POPULAR_SIZE_PRESETS} />

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
