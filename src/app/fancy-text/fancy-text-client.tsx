"use client";

import { useState, useMemo } from "react";
import { transformAllFonts } from "@/lib/font-transform";
import { copyToClipboard } from "@/lib/clipboard";
import { Input } from "@/components/ui/input";
import { Copy } from "lucide-react";

export function FancyTextClient() {
  const [text, setText] = useState("Hello World");

  const results = useMemo(() => transformAllFonts(text), [text]);

  return (
    <div className="space-y-6">
      {/* Input */}
      <Input
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Type your text here..."
        className="h-14 text-lg px-4 bg-muted/50 border-border/50"
        autoFocus
      />

      {/* Results */}
      <div className="space-y-1">
        {results.map((font) => (
          <button
            key={font.slug}
            onClick={() => copyToClipboard(font.result, font.name)}
            className="group w-full flex items-center justify-between gap-4 p-4 rounded-xl hover:bg-muted transition-all text-left cursor-copy"
          >
            <div className="min-w-0 flex-1">
              <p className="text-xs text-muted-foreground mb-1">{font.name}</p>
              <p className="text-lg truncate">{font.result}</p>
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
