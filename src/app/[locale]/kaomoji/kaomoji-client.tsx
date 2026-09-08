"use client";
import { useDict } from "@/i18n/context";

import { useState, useMemo } from "react";
import kaomojiData from "@/data/kaomoji-data.json";
import { copyToClipboard } from "@/lib/clipboard";
import { SearchBar } from "@/components/search-bar";
import { SizeSlider, FANCY_TEXT_SIZE_PRESETS } from "@/components/size-slider";
import { CategoryFilterBar } from "@/components/category-filter-bar";

type Kaomoji = { char: string; name: string };
type Category = { id: string; name: string; icon: string; kaomojis: Kaomoji[] };

export function KaomojiClient() {
  const dict = useDict();
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
          <h1 className="text-2xl font-bold mb-1">{dict.kaomoji.title}</h1>
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
        placeholder={dict.kaomoji.searchPlaceholder}
      />

      {/* Category filter */}
      <CategoryFilterBar
        categories={categories.map((c) => ({ key: c.name, name: c.name, icon: c.icon }))}
        activeKey={searchQuery ? null : activeCategory}
        onSelect={(key) => {
          setActiveCategory(key);
          setSearchQuery("");
        }}
      />

      {/* Combos */}
      {filteredCategories.map((cat) => (
        <div key={cat.id}>
          <h2 className="text-lg font-semibold mb-3">
            {cat.icon} {dict.categories?.[cat.name as keyof typeof dict.categories] || cat.name}
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
          <p className="text-sm">{dict.kaomoji.noResults} &quot;{searchQuery}&quot;</p>
        </div>
      )}
    </div>
  );
}
