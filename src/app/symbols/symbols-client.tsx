"use client";

import { useState, useMemo } from "react";
import symbolsData from "@/data/symbols-data.json";
import { copyToClipboard } from "@/lib/clipboard";
import { SearchBar } from "@/components/search-bar";
import { SizeSlider, COMMON_SIZE_PRESETS } from "@/components/size-slider";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type SymbolObj = { char: string; name: string };
type SymbolCategory = {
  id: string;
  name: string;
  icon?: string;
  symbols: SymbolObj[];
};

export function SymbolsClient() {
  const categories = symbolsData as SymbolCategory[];
  const [activeCategory, setActiveCategory] = useState<string>(categories[0]?.name || "");
  const [searchQuery, setSearchQuery] = useState("");
  const [sizeIndex, setSizeIndex] = useState(2); // Default to L
  const currentSize = COMMON_SIZE_PRESETS[sizeIndex];

  const displayedSymbols = useMemo(() => {
    if (searchQuery) {
      // Search across all categories
      const q = searchQuery.toLowerCase();
      const results: { category: string; symbol: string }[] = [];
      for (const cat of categories) {
        for (const sym of cat.symbols) {
          if (cat.name.toLowerCase().includes(q) || sym.char.includes(q)) {
            results.push({ category: cat.name, symbol: sym.char });
          }
        }
      }
      return results;
    }
    const cat = categories.find((c) => c.name === activeCategory);
    return cat ? cat.symbols.map((s) => ({ category: cat.name, symbol: s.char })) : [];
  }, [categories, activeCategory, searchQuery]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold mb-1">Special Symbols & Characters</h1>
          <p className="text-sm text-muted-foreground">
            Click any symbol to copy it to your clipboard. Browse by category or search.
          </p>
        </div>
        <div className="shrink-0 mt-2 sm:mt-0">
          <SizeSlider sizeIndex={sizeIndex} setSizeIndex={setSizeIndex} />
        </div>
      </div>

      <SearchBar
        value={searchQuery}
        onChange={setSearchQuery}
        placeholder="Search symbols... (e.g. arrow, heart, star)"
      />

      {/* Category sidebar + content */}
      <div className="flex gap-6">
        {/* Category list */}
        <div className="hidden md:flex flex-col gap-0.5 min-w-48 shrink-0">
          {categories.map((cat) => (
            <button
              key={cat.name}
              onClick={() => {
                setActiveCategory(cat.name);
                setSearchQuery("");
              }}
              className={cn(
                "flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-left transition-colors",
                activeCategory === cat.name && !searchQuery
                  ? "bg-foreground text-background font-medium"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              )}
            >
              {cat.icon && <span className="text-base">{cat.icon}</span>}
              {cat.name}
              <span className="ml-auto text-xs opacity-60">{cat.symbols.length}</span>
            </button>
          ))}
        </div>

        {/* Mobile category bar */}
        <div className="flex md:hidden overflow-x-auto gap-1 pb-2 -mx-4 px-4 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat.name}
              onClick={() => {
                setActiveCategory(cat.name);
                setSearchQuery("");
              }}
              className={cn(
                "shrink-0 px-3 py-1.5 rounded-lg text-sm transition-colors",
                activeCategory === cat.name && !searchQuery
                  ? "bg-foreground text-background font-medium"
                  : "text-muted-foreground hover:bg-muted"
              )}
            >
              {cat.icon && <span>{cat.icon} </span>}{cat.name}
            </button>
          ))}
        </div>

        {/* Symbol grid */}
        <div className="flex-1">
          <div className="flex items-center justify-between mb-3">
            {searchQuery ? (
              <p className="text-xs text-muted-foreground">
                {displayedSymbols.length} results for &quot;{searchQuery}&quot;
              </p>
            ) : (
              <div /> // Placeholder
            )}
          </div>
          <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 gap-1">
            {displayedSymbols.map(({ symbol }, i) => (
              <Tooltip key={`${symbol}-${i}`}>
                <TooltipTrigger
                  onClick={() => copyToClipboard(symbol)}
                  className="flex items-center justify-center rounded-lg hover:bg-muted transition-all active:scale-90 cursor-pointer aspect-square"
                  style={{ fontSize: `${currentSize.value}px` }}
                >
                  {symbol}
                </TooltipTrigger>
                <TooltipContent side="top" className="text-xs">
                  Click to copy
                </TooltipContent>
              </Tooltip>
            ))}
          </div>

          {displayedSymbols.length === 0 && (
            <div className="text-center py-16 text-muted-foreground">
              <p className="text-4xl mb-3">🔍</p>
              <p className="text-sm">No symbols found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
