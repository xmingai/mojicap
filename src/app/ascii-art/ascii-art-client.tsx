"use client";

import { useState, useMemo } from "react";
import asciiData from "@/data/ascii-art-data.json";
import { copyToClipboard } from "@/lib/clipboard";
import { SearchBar } from "@/components/search-bar";
import { SizeSlider, FANCY_TEXT_SIZE_PRESETS } from "@/components/size-slider";
import { cn } from "@/lib/utils";
import { Copy } from "lucide-react";

type Art = { content: string };
type Category = { category: string; art: Art[] };

export function AsciiArtClient() {
  const categories = asciiData as Category[];
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
          art: cat.art.filter(
            (a) =>
              a.content.toLowerCase().includes(q) ||
              cat.category.toLowerCase().includes(q)
          ),
        }))
        .filter((cat) => cat.art.length > 0);
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
          <h1 className="text-2xl font-bold mb-1">ASCII Art / Text Images</h1>
          <p className="text-sm text-muted-foreground">
            Copy and paste retro text art, one-line weapons, and text scenes.
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
        placeholder="Search ascii art... (e.g. weapons, bear, multi-line)"
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
            {cat.category}
          </button>
        ))}
      </div>

      {/* Art */}
      <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-4">
        {filteredCategories.map((cat) => (
          cat.art.map((a, i) => (
            <div key={`${cat.category}-${i}`} className="break-inside-avoid">
              <button
                onClick={() => copyToClipboard(a.content, "ASCII Art")}
                className="w-full group flex flex-col p-4 rounded-xl border border-border/50 hover:border-border hover:bg-muted/50 transition-all cursor-pointer text-left relative overflow-hidden"
              >
                <div className="flex justify-between items-start mb-2 w-full">
                  <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">{cat.category}</span>
                  <Copy className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <pre 
                  className="font-mono bg-transparent w-full overflow-x-auto whitespace-pre text-foreground/90" 
                  style={{ fontSize: `${currentSize.value}px`, lineHeight: 1.2 }}
                >
                  {a.content}
                </pre>
              </button>
            </div>
          ))
        ))}
      </div>

      {filteredCategories.length === 0 && (
        <div className="text-center py-16 text-muted-foreground">
          <p className="text-4xl mb-3">🔍</p>
          <p className="text-sm">No ASCII art found for &quot;{searchQuery}&quot;</p>
        </div>
      )}
    </div>
  );
}
