"use client";

import { Minus, Plus } from "lucide-react";

export interface SizePreset {
  label: string;
  value: number;
}

export const COMMON_SIZE_PRESETS: SizePreset[] = [
  { label: "S", value: 24 },
  { label: "M", value: 32 },
  { label: "L", value: 40 },
  { label: "XL", value: 52 },
];

export const FANCY_TEXT_SIZE_PRESETS: SizePreset[] = [
  { label: "S", value: 16 },
  { label: "M", value: 20 },
  { label: "L", value: 24 },
  { label: "XL", value: 32 },
];

interface SizeSliderProps {
  sizeIndex: number;
  setSizeIndex: (index: number | ((prev: number) => number)) => void;
  presets?: SizePreset[];
}

export function SizeSlider({ 
  sizeIndex, 
  setSizeIndex, 
  presets = COMMON_SIZE_PRESETS 
}: SizeSliderProps) {
  return (
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
        {presets.map((preset, i) => (
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
        onClick={() => setSizeIndex((i) => Math.min(presets.length - 1, i + 1))}
        disabled={sizeIndex === presets.length - 1}
        className="p-1.5 rounded-lg hover:bg-muted disabled:opacity-30 transition-colors"
        aria-label="Larger"
      >
        <Plus className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
