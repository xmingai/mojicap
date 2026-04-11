"use client";

import { useState, useMemo } from "react";
import dividersData from "@/data/dividers-data.json";
import { copyToClipboard } from "@/lib/clipboard";
import { SearchBar } from "@/components/search-bar";
import { SizeSlider, FANCY_TEXT_SIZE_PRESETS } from "@/components/size-slider";
import { cn } from "@/lib/utils";
import { Copy } from "lucide-react";

type Divider = { divider: string };
type Category = { category: string; dividers: Divider[] };

export function DividersClient() {
  const categories = dividersData as Category[];
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sizeIndex, setSizeIndex] = useState(2); // Default to L
  const currentSize = FANCY_TEXT_SIZE_PRESETS[sizeIndex];

  const filteredCategories = useMemo(() => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return categories
        .map((cat) => ({
          ...cat,
          dividers: cat.dividers.filter(
            (d) =>
              d.divider.toLowerCase().includes(q) ||
              cat.category.toLowerCase().includes(q)
          ),
        }))
        .filter((cat) => cat.dividers.length > 0);
    }

    if (activeCategory) {
      return categories.filter((c) => c.category === activeCategory);
    }

    return categories;
  }, [categories, activeCategory, searchQuery]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold mb-1">Text Dividers & Borders</h1>
          <p className="text-sm text-muted-foreground">
            Copy aesthetic line separators for Notion, Tumblr, Instagram, and more.
          </p>
        </div>
        <div className="shrink-0 mt-2 sm:mt-0">
          <SizeSlider sizeIndex={sizeIndex} setSizeIndex={setSizeIndex} presets={FANCY_TEXT_SIZE_PRESETS} />
        </div>
      </div>

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
            {cat.category}
          </button>
        ))}
      </div>

      {/* Dividers */}
      {filteredCategories.map((cat) => (
        <div key={cat.category}>
          <h2 className="text-lg font-semibold mb-3">
            {cat.category}
          </h2>
          <div className="flex flex-col gap-2">
            {cat.dividers.map((d, i) => (
              <button
                key={i}
                onClick={() => copyToClipboard(d.divider, "Divider")}
                className="group flex flex-col items-center justify-center p-4 rounded-xl border border-border/50 hover:border-border hover:bg-muted/50 transition-all cursor-pointer text-center w-full"
              >
                <div className="tracking-wide w-full overflow-hidden text-ellipsis whitespace-nowrap" style={{ fontSize: `${currentSize.value}px` }}>{d.divider}</div>
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
