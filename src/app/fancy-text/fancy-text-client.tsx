"use client";

import { useState, useMemo } from "react";
import { transformAllFonts } from "@/lib/font-transform";
import { copyToClipboard } from "@/lib/clipboard";
import { Input } from "@/components/ui/input";
import { SizeSlider, FANCY_TEXT_SIZE_PRESETS } from "@/components/size-slider";
import { Copy } from "lucide-react";

export function FancyTextClient() {
  const [text, setText] = useState("Hello World");
  const [sizeIndex, setSizeIndex] = useState(2); // Default to L (32px)
  const currentSize = FANCY_TEXT_SIZE_PRESETS[sizeIndex];

  const results = useMemo(() => transformAllFonts(text), [text]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold mb-1">Fancy Text Generator</h1>
          <p className="text-sm text-muted-foreground">
            Type your text below and copy any style. Works on Instagram, Twitter, Discord, and more.
          </p>
        </div>
        <div className="shrink-0 mt-2 sm:mt-0">
          <SizeSlider sizeIndex={sizeIndex} setSizeIndex={setSizeIndex} presets={FANCY_TEXT_SIZE_PRESETS} />
        </div>
      </div>

      {/* Input */}
      <Input
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Type your text here..."
        className="h-14 text-lg px-4 bg-muted/50 border-border/50"
        autoFocus
      />

      <div className="flex items-center justify-between px-1">
        <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Results</h2>
      </div>

      {/* Results */}
      <div className="space-y-1">
        {results.map((font) => (
          <button
            key={font.slug}
            onClick={() => copyToClipboard(font.result, font.name)}
            className="group w-full flex items-center justify-between gap-4 p-4 rounded-xl hover:bg-muted transition-all text-left cursor-pointer"
          >
            <div className="min-w-0 flex-1">
              <p className="text-xs text-muted-foreground mb-1">{font.name}</p>
              <p className="truncate" style={{ fontSize: `${currentSize.value}px` }}>{font.result}</p>
            </div>
            <div className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
              <Copy className="h-4 w-4 text-muted-foreground" />
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
