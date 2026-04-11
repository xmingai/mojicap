"use client";
import { useDict } from "@/i18n/context";

import invisibleData from "@/data/invisible-data.json";
import { copyToClipboard } from "@/lib/clipboard";
import { Copy } from "lucide-react";
import { useState } from "react";

type InvisibleChar = {
  unicode: string;
  name: string;
  char: string;
  description: string;
  compatibility: string[];
  slug: string;
};

export function InvisibleClient() {
  const dict = useDict();
  const characters = invisibleData as InvisibleChar[];
  const [testText, setTestText] = useState("");

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold mb-1">{dict.invisible.title}</h1>
        </div>
      </div>

      {/* Test Area */}
      <div className="p-4 rounded-xl border bg-muted/30 space-y-3">
        <h2 className="text-sm font-semibold">Test Area</h2>
        <p className="text-xs text-muted-foreground">Paste your invisible character between the brackets below to test its width.</p>
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground font-mono">[</span>
          <input 
            type="text" 
            value={testText}
            onChange={(e) => setTestText(e.target.value)}
            className="flex-1 bg-transparent border-b outline-none text-center"
            placeholder="Paste here..."
          />
          <span className="text-muted-foreground font-mono">]</span>
        </div>
      </div>

      {/* Characters List */}
      <div className="flex flex-col gap-4">
        {characters.map((char) => (
          <div key={char.unicode} className="flex flex-col sm:flex-row gap-4 p-5 rounded-xl border border-border/50 bg-card hover:border-border transition-colors">
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-lg">{char.name}</h3>
                <span className="px-2 py-0.5 rounded-md bg-muted text-xs font-mono">{char.unicode}</span>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">{char.description}</p>
              
              <div className="pt-2 flex flex-wrap gap-2">
                <span className="text-xs text-muted-foreground pt-0.5">Works on:</span>
                {char.compatibility.map(plat => (
                  <span key={plat} className="px-2.5 py-0.5 rounded-full border bg-muted/50 text-[10px] uppercase font-medium tracking-wider">
                    {plat}
                  </span>
                ))}
              </div>
            </div>
            
            <div className="shrink-0 flex sm:flex-col items-center justify-center gap-2 border-t sm:border-t-0 sm:border-l pt-4 sm:pt-0 sm:pl-4 border-border/50">
              <button
                onClick={() => copyToClipboard(char.char, char.name)}
                className="w-full sm:w-auto py-2 px-4 rounded-lg bg-foreground text-background text-sm font-medium hover:bg-foreground/90 transition-colors flex items-center justify-center gap-2"
              >
                <Copy className="h-3.5 w-3.5" />
                <span>Copy</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
