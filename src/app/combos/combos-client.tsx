"use client";

import { useState, useMemo } from "react";
import combosData from "@/data/combos-data.json";
import { copyToClipboard } from "@/lib/clipboard";
import { SearchBar } from "@/components/search-bar";
import { SizeSlider, FANCY_TEXT_SIZE_PRESETS } from "@/components/size-slider";
import { cn } from "@/lib/utils";
import { Copy } from "lucide-react";

type Combo = { name: string; combo: string };
type ComboCategory = { category: string; icon: string; combos: Combo[] };

export function CombosClient() {
  const categories = combosData as ComboCategory[];
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sizeIndex, setSizeIndex] = useState(1); // Default to M (20px)
  const currentSize = FANCY_TEXT_SIZE_PRESETS[sizeIndex];

  const filteredCategories = useMemo(() => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return categories
        .map((cat) => ({
          ...cat,
          combos: cat.combos.filter(
            (c) =>
              c.name.toLowerCase().includes(q) ||
              c.combo.toLowerCase().includes(q) ||
              cat.category.toLowerCase().includes(q)
          ),
        }))
        .filter((cat) => cat.combos.length > 0);
    }

    if (activeCategory) {
      return categories.filter((c) => c.category === activeCategory);
    }

    return categories;
  }, [categories, activeCategory, searchQuery]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 -mb-2">
        <div>
          <h1 className="text-2xl font-bold mb-1">Emoji Combos & Kaomoji</h1>
          <p className="text-sm text-muted-foreground">
            Curated emoji combinations and text faces. Click to copy.
          </p>
        </div>
        <div className="shrink-0 mt-2 sm:mt-0">
          <SizeSlider sizeIndex={sizeIndex} setSizeIndex={setSizeIndex} presets={FANCY_TEXT_SIZE_PRESETS} />
        </div>
      </div>

      <SearchBar
        value={searchQuery}
        onChange={(v) => {
          setSearchQuery(v);
          if (v) setActiveCategory(null);
        }}
        placeholder="Search combos... (e.g. love, party, aesthetic)"
      />

      {/* Category filter */}
      <div className="flex flex-wrap gap-1">
        <button
          onClick={() => {
            setActiveCategory(null);
            setSearchQuery("");
          }}
          className={cn(
            "px-3 py-1.5 rounded-lg text-sm font-medium transition-all",
            activeCategory === null && !searchQuery
              ? "bg-foreground text-background"
              : "text-muted-foreground hover:text-foreground hover:bg-muted"
          )}
        >
          All
        </button>
        {categories.map((cat) => (
          <button
            key={cat.category}
            onClick={() => {
              setActiveCategory(cat.category);
              setSearchQuery("");
            }}
            className={cn(
              "px-3 py-1.5 rounded-lg text-sm font-medium transition-all",
              activeCategory === cat.category
                ? "bg-foreground text-background"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            )}
          >
            {cat.icon} {cat.category}
          </button>
        ))}
      </div>

      {/* Combos */}
      {filteredCategories.map((cat) => (
        <div key={cat.category}>
          <h2 className="text-lg font-semibold mb-3">
            {cat.icon} {cat.category}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
            {cat.combos.map((combo) => (
              <button
                key={combo.name}
                onClick={() => copyToClipboard(combo.combo, combo.name)}
                className="group flex items-center justify-between gap-3 p-4 rounded-xl border border-border/50 hover:border-border hover:bg-muted/50 transition-all cursor-pointer text-left"
              >
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground mb-1.5">{combo.name}</p>
                  <p className="tracking-wide truncate" style={{ fontSize: `${currentSize.value}px` }}>{combo.combo}</p>
                </div>
                <Copy className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
              </button>
            ))}
          </div>
        </div>
      ))}

      {filteredCategories.length === 0 && (
        <div className="text-center py-16 text-muted-foreground">
          <p className="text-4xl mb-3">🔍</p>
          <p className="text-sm">No combos found for &quot;{searchQuery}&quot;</p>
        </div>
      )}
    </div>
  );
}
