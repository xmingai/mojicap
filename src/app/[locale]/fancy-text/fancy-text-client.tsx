"use client";
import { useDict } from "@/i18n/context";

import { useState, useMemo } from "react";
import { getToolResults } from "@/lib/font-transform";
import { copyToClipboard } from "@/lib/clipboard";
import { Input } from "@/components/ui/input";
import { SizeSlider, FANCY_TEXT_SIZE_PRESETS } from "@/components/size-slider";
import { Copy } from "lucide-react";

export function FancyTextClient({ toolMode = 'all' }: { toolMode?: string }) {
  const dict = useDict();
  const [text, setText] = useState("Hello World");
  const [sizeIndex, setSizeIndex] = useState(2); // Default to L (32px)
  const currentSize = FANCY_TEXT_SIZE_PRESETS[sizeIndex];

  const results = useMemo(() => getToolResults(text, toolMode), [text, toolMode]);

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <div className="shrink-0">
          <SizeSlider sizeIndex={sizeIndex} setSizeIndex={setSizeIndex} presets={FANCY_TEXT_SIZE_PRESETS} />
        </div>
      </div>

      {/* Main Content: Two Columns on large screens */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 items-start">
        {/* Left Column: Input */}
        <div className="sticky top-24 z-10">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={dict.fancyText.inputPlaceholder}
            className="flex min-h-[160px] lg:min-h-[400px] w-full rounded-xl border border-input bg-muted/50 px-4 py-4 text-lg ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-y"
            autoFocus
          />
        </div>

        {/* Right Column: Results */}
        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">{dict.common.results}</h2>
          </div>

          {/* Results List */}
          <div className="space-y-1">
        {results.map((font) => (
          <button
            key={font.slug}
            onClick={() => copyToClipboard(font.result, font.name)}
            className="group w-full flex items-center justify-between gap-4 p-4 rounded-xl hover:bg-muted transition-all text-left cursor-pointer"
          >
            <div className="min-w-0 flex-1">
              <p className="text-xs text-muted-foreground mb-1">{font.name}</p>
              <p className="whitespace-pre-wrap break-words" style={{ fontSize: `${currentSize.value}px` }}>{font.result}</p>
            </div>
            <div className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
              <Copy className="h-4 w-4 text-muted-foreground" />
            </div>
          </button>
        ))}
          </div>
        </div>
      </div>
    </div>
  );
}
