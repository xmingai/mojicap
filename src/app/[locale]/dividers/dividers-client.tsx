"use client";
import { useDict } from "@/i18n/context";

import { useState, useMemo } from "react";
import dividersData from "@/data/dividers-data.json";
import { copyToClipboard } from "@/lib/clipboard";
import { SizeSlider, FANCY_TEXT_SIZE_PRESETS } from "@/components/size-slider";
import { CategoryFilterBar } from "@/components/category-filter-bar";

type Divider = { divider: string };
type Category = { category: string; dividers: Divider[] };

export function DividersClient() {
  const dict = useDict();
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
          <h1 className="text-2xl font-bold mb-1">{dict.dividers.title}</h1>

        </div>
        <div className="shrink-0 mt-2 sm:mt-0">
          <SizeSlider sizeIndex={sizeIndex} setSizeIndex={setSizeIndex} presets={FANCY_TEXT_SIZE_PRESETS} />
        </div>
      </div>

      {/* Category filter */}
      <CategoryFilterBar
        categories={categories.map((c) => ({ key: c.category, name: c.category }))}
        activeKey={searchQuery ? null : activeCategory}
        onSelect={(key) => {
          setActiveCategory(key);
          setSearchQuery("");
        }}
      />

      {/* Dividers */}
      {filteredCategories.map((cat) => (
        <div key={cat.category}>
          <h2 className="text-lg font-semibold mb-3">
            {dict.categories?.[cat.category as keyof typeof dict.categories] || cat.category}
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
