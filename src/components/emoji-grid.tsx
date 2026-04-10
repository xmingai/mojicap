"use client";

import { useState, useMemo, useCallback } from "react";
import Link from "next/link";
import type { Emoji, Category } from "@/lib/emoji";
import { copyToClipboard } from "@/lib/clipboard";
import { searchEmojis } from "@/lib/search";
import { SearchBar } from "@/components/search-bar";
import { CategoryTabs } from "@/components/category-tabs";
import { SelectionBar } from "@/components/selection-bar";
import { useRecent } from "@/hooks/use-recent";
import { EmojiHoverCard } from "@/components/emoji-hover-card";
import { SizeSlider, COMMON_SIZE_PRESETS } from "@/components/size-slider";

interface EmojiGridProps {
  emojis: Emoji[];
  categories: Category[];
}

export function EmojiGrid({ emojis, categories }: EmojiGridProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [selected, setSelected] = useState<string[]>([]);
  const { recent, addRecent } = useRecent();
  const [sizeIndex, setSizeIndex] = useState(3); // Default to XL
  const currentSize = COMMON_SIZE_PRESETS[sizeIndex];

  const filteredEmojis = useMemo(() => {
    let result = emojis;
    if (searchQuery) {
      result = searchEmojis(emojis, searchQuery);
    } else if (activeCategory) {
      result = emojis.filter((e) => e.groupSlug === activeCategory);
    }
    return result;
  }, [emojis, searchQuery, activeCategory]);

  const handleCopy = useCallback(
    (emoji: Emoji) => {
      copyToClipboard(emoji.emoji, emoji.name);
      addRecent(emoji.emoji);
    },
    [addRecent]
  );

  const handleSelect = useCallback((emoji: string) => {
    setSelected((prev) =>
      prev.includes(emoji) ? prev.filter((e) => e !== emoji) : [...prev, emoji]
    );
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold mb-1">Emoji Copy & Paste</h1>
          <p className="text-sm text-muted-foreground">
            Click any emoji to copy it to your clipboard. {emojis.length.toLocaleString()} emojis available.
          </p>
        </div>
        <div className="shrink-0 mt-2 sm:mt-0">
          <SizeSlider sizeIndex={sizeIndex} setSizeIndex={setSizeIndex} />
        </div>
      </div>

      <SearchBar
        value={searchQuery}
        onChange={(v) => {
          setSearchQuery(v);
          if (v) setActiveCategory(null);
        }}
        placeholder="Search emojis... (e.g. fire, heart, smile)"
      />

      {!searchQuery && (
        <CategoryTabs
          categories={categories}
          activeCategory={activeCategory}
          onSelect={(slug) => {
            setActiveCategory(slug);
            setSearchQuery("");
          }}
        />
      )}

      {/* Recent */}
      {!searchQuery && !activeCategory && recent.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Recently Used
          </h3>
          <div className="flex flex-wrap gap-1">
            {recent.slice(0, 20).map((emoji, i) => (
              <button
                key={`${emoji}-${i}`}
                onClick={() => copyToClipboard(emoji)}
                className="rounded-lg hover:bg-muted transition-colors active:scale-90"
                style={{ 
                  fontSize: `${currentSize.value}px`, 
                  padding: `${Math.max(4, currentSize.value * 0.2)}px`,
                  lineHeight: 1.1 
                }}
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Grid */}
      <div className="grid grid-cols-8 sm:grid-cols-10 md:grid-cols-12 lg:grid-cols-14 gap-0.5">
        {filteredEmojis.map((emoji) => (
          <EmojiHoverCard 
            key={emoji.id} 
            emoji={emoji} 
            onCopy={handleCopy} 
            sizeValue={currentSize.value}
          />
        ))}
      </div>

      {filteredEmojis.length === 0 && (
        <div className="text-center py-16 text-muted-foreground">
          <p className="text-4xl mb-3">🔍</p>
          <p className="text-sm">No emojis found for &quot;{searchQuery}&quot;</p>
        </div>
      )}

      {selected.length > 0 && (
        <SelectionBar selected={selected} onClear={() => setSelected([])} />
      )}
    </div>
  );
}
