"use client";

import { useState, useMemo } from "react";
import { textToBraille, textToMorse } from "@/lib/transformers";
import { copyToClipboard } from "@/lib/clipboard";
import { Copy } from "lucide-react";
import { SizeSlider, FANCY_TEXT_SIZE_PRESETS } from "@/components/size-slider";

export function BrailleClient() {
  const [text, setText] = useState("Hello World");
  const [sizeIndex, setSizeIndex] = useState(2); // Default to L
  const currentSize = FANCY_TEXT_SIZE_PRESETS[sizeIndex];

  const braille = useMemo(() => textToBraille(text), [text]);
  const morse = useMemo(() => textToMorse(text), [text]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold mb-1">Braille & Morse Translator</h1>
          <p className="text-sm text-muted-foreground">
            Type text below to convert it into Braille dots or Morse code.
          </p>
        </div>
        <div className="shrink-0 mt-2 sm:mt-0">
          <SizeSlider sizeIndex={sizeIndex} setSizeIndex={setSizeIndex} presets={FANCY_TEXT_SIZE_PRESETS} />
        </div>
      </div>

      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        className="w-full min-h-[120px] p-4 rounded-xl border bg-background text-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-ring resize-y"
        placeholder="Type something here..."
      />

      <div className="space-y-4">
        <div className="p-5 rounded-xl border border-border/50 bg-card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-lg">Braille</h2>
            <button
              onClick={() => copyToClipboard(braille, "Braille text")}
              className="px-3 py-1.5 text-xs font-medium bg-foreground text-background rounded-lg hover:bg-foreground/90 transition-colors flex items-center gap-1.5"
            >
              <Copy className="h-3.5 w-3.5" /> Copy
            </button>
          </div>
          <p className="tracking-[0.2em] break-all min-h-[60px]" style={{ fontSize: `${currentSize.value}px` }}>
            {braille || "⠀"}
          </p>
        </div>

        <div className="p-5 rounded-xl border border-border/50 bg-card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-lg">Morse Code</h2>
            <button
              onClick={() => copyToClipboard(morse, "Morse code")}
              className="px-3 py-1.5 text-xs font-medium bg-foreground text-background rounded-lg hover:bg-foreground/90 transition-colors flex items-center gap-1.5"
            >
              <Copy className="h-3.5 w-3.5" /> Copy
            </button>
          </div>
          <p className="tracking-widest break-all font-mono min-h-[60px]" style={{ fontSize: `${currentSize.value}px` }}>
            {morse || "..."}
          </p>
        </div>
      </div>
    </div>
  );
}
