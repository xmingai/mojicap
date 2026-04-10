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
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface EmojiGridProps {
  emojis: Emoji[];
  categories: Category[];
}

export function EmojiGrid({ emojis, categories }: EmojiGridProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [selected, setSelected] = useState<string[]>([]);
  const { recent, addRecent } = useRecent();

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
                className="text-2xl p-1.5 rounded-lg hover:bg-muted transition-colors active:scale-90"
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
          <Tooltip key={emoji.id}>
            <TooltipTrigger
              onClick={() => handleCopy(emoji)}
              className="group relative flex items-center justify-center text-2xl sm:text-3xl p-2 rounded-lg hover:bg-muted transition-all active:scale-90 cursor-pointer"
            >
              <span className="group-hover:scale-110 transition-transform">
                {emoji.emoji}
              </span>
            </TooltipTrigger>
            <TooltipContent side="top" className="text-xs max-w-48">
              <p className="font-medium">{emoji.name}</p>
              <p className="text-muted-foreground mt-0.5">
                Click to copy ·{" "}
                <Link
                  href={`/emoji/${emoji.slug}`}
                  className="text-primary hover:underline"
                  onClick={(e) => e.stopPropagation()}
                >
                  Details
                </Link>
              </p>
            </TooltipContent>
          </Tooltip>
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
