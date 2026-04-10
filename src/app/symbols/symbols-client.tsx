"use client";

import { useState, useMemo } from "react";
import symbolsData from "@/data/symbols-data.json";
import { copyToClipboard } from "@/lib/clipboard";
import { SearchBar } from "@/components/search-bar";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type SymbolCategory = {
  name: string;
  icon: string;
  symbols: string[];
};

export function SymbolsClient() {
  const categories = symbolsData as SymbolCategory[];
  const [activeCategory, setActiveCategory] = useState<string>(categories[0]?.name || "");
  const [searchQuery, setSearchQuery] = useState("");

  const displayedSymbols = useMemo(() => {
    if (searchQuery) {
      // Search across all categories
      const q = searchQuery.toLowerCase();
      const results: { category: string; symbol: string }[] = [];
      for (const cat of categories) {
        for (const sym of cat.symbols) {
          if (cat.name.toLowerCase().includes(q) || sym.includes(q)) {
            results.push({ category: cat.name, symbol: sym });
          }
        }
      }
      return results;
    }
    const cat = categories.find((c) => c.name === activeCategory);
    return cat ? cat.symbols.map((s) => ({ category: cat.name, symbol: s })) : [];
  }, [categories, activeCategory, searchQuery]);

  return (
    <div className="space-y-4">
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
              <span className="text-base">{cat.icon}</span>
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
              {cat.icon} {cat.name}
            </button>
          ))}
        </div>

        {/* Symbol grid */}
        <div className="flex-1">
          {searchQuery && (
            <p className="text-xs text-muted-foreground mb-3">
              {displayedSymbols.length} results for &quot;{searchQuery}&quot;
            </p>
          )}
          <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 gap-1">
            {displayedSymbols.map(({ symbol }, i) => (
              <Tooltip key={`${symbol}-${i}`}>
                <TooltipTrigger
                  onClick={() => copyToClipboard(symbol)}
                  className="flex items-center justify-center text-2xl p-3 rounded-lg hover:bg-muted transition-all active:scale-90 cursor-copy aspect-square"
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
