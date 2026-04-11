"use client";

import { useState, useMemo } from "react";
import kaomojiData from "@/data/kaomoji-data.json";
import { copyToClipboard } from "@/lib/clipboard";
import { SearchBar } from "@/components/search-bar";
import { SizeSlider, FANCY_TEXT_SIZE_PRESETS } from "@/components/size-slider";
import { cn } from "@/lib/utils";
import { Copy } from "lucide-react";

type Kaomoji = { char: string; name: string };
type Category = { id: string; name: string; icon: string; kaomojis: Kaomoji[] };

export function KaomojiClient() {
  const categories = kaomojiData as Category[];
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
          kaomojis: cat.kaomojis.filter(
            (k) =>
              k.char.toLowerCase().includes(q) ||
              cat.name.toLowerCase().includes(q)
          ),
        }))
        .filter((cat) => cat.kaomojis.length > 0);
    }

    if (activeCategory) {
      return categories.filter((c) => c.name === activeCategory);
    }

    return categories;
  }, [categories, activeCategory, searchQuery]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold mb-1">Kaomoji — Japanese Emoticons</h1>
          <p className="text-sm text-muted-foreground">
            Copy cute Japanese text faces for any emotion. (ﾉ◕ヮ◕)ﾉ*:･ﾟ✧
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
        placeholder="Search kaomoji... (e.g. smile, sad, table flip)"
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
            key={cat.id}
            onClick={() => {
              setActiveCategory(cat.name);
              setSearchQuery("");
            }}
            className={cn(
              "px-3 py-1.5 rounded-lg text-sm font-medium transition-all",
              activeCategory === cat.name
                ? "bg-foreground text-background"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            )}
          >
            {cat.icon} {cat.name}
          </button>
        ))}
      </div>

      {/* Combos */}
      {filteredCategories.map((cat) => (
        <div key={cat.id}>
          <h2 className="text-lg font-semibold mb-3">
            {cat.icon} {cat.name}
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
            {cat.kaomojis.map((k, i) => (
              <button
                key={i}
                onClick={() => copyToClipboard(k.char, k.name)}
                className="group flex flex-col items-center justify-center p-4 rounded-xl border border-border/50 hover:border-border hover:bg-muted/50 transition-all cursor-pointer text-center relative overflow-hidden"
              >
                <div className="tracking-wide" style={{ fontSize: `${currentSize.value}px` }}>{k.char}</div>
              </button>
            ))}
          </div>
        </div>
      ))}

      {filteredCategories.length === 0 && (
        <div className="text-center py-16 text-muted-foreground">
          <p className="text-4xl mb-3">🔍</p>
          <p className="text-sm">No kaomoji found for &quot;{searchQuery}&quot;</p>
        </div>
      )}
    </div>
  );
}
