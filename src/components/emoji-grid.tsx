"use client";

import { useState, useMemo, useCallback } from "react";
import Link from "next/link";
import type { Emoji, Category, EmojiVersion } from "@/lib/emoji";
import { copyToClipboard } from "@/lib/clipboard";
import { searchEmojis } from "@/lib/search";
import { SearchBar } from "@/components/search-bar";
import { CategoryTabs } from "@/components/category-tabs";
import { SelectionBar } from "@/components/selection-bar";
import { useRecent } from "@/hooks/use-recent";
import { EmojiHoverCard } from "@/components/emoji-hover-card";
import { SizeSlider, COMMON_SIZE_PRESETS } from "@/components/size-slider";
import { cn } from "@/lib/utils";

interface EmojiGridProps {
  emojis: Emoji[];       // base emojis (no skin variants)
  allEmojis: Emoji[];    // all emojis including variants
  categories: Category[];
  versions: EmojiVersion[];
}

type ViewMode = "category" | "version";

export function EmojiGrid({ emojis, allEmojis, categories, versions }: EmojiGridProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [activeVersion, setActiveVersion] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("category");
  const [selected, setSelected] = useState<string[]>([]);
  const { recent, addRecent } = useRecent();
  const [sizeIndex, setSizeIndex] = useState(2); // Default to L
  const currentSize = COMMON_SIZE_PRESETS[sizeIndex];

  const filteredEmojis = useMemo(() => {
    if (searchQuery) {
      return searchEmojis(emojis, searchQuery);
    }
    
    if (viewMode === "version" && activeVersion) {
      // Show ALL emojis (including variants) for that version
      return allEmojis.filter((e) => e.emojiVersion === activeVersion);
    }
    
    if (viewMode === "category" && activeCategory) {
      return emojis.filter((e) => e.groupSlug === activeCategory);
    }
    
    return emojis;
  }, [emojis, allEmojis, searchQuery, activeCategory, activeVersion, viewMode]);

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
            Click any emoji to copy it to your clipboard. {allEmojis.length.toLocaleString()} emojis available (Unicode 16.0).
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
          if (v) {
            setActiveCategory(null);
            setActiveVersion(null);
          }
        }}
        placeholder="Search emojis... (e.g. fire, heart, smile)"
      />

      {/* View Mode Toggle */}
      {!searchQuery && (
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-muted rounded-lg p-0.5">
            <button
              onClick={() => {
                setViewMode("category");
                setActiveVersion(null);
              }}
              className={cn(
                "px-3 py-1.5 rounded-md text-sm font-medium transition-all",
                viewMode === "category"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              By Category
            </button>
            <button
              onClick={() => {
                setViewMode("version");
                setActiveCategory(null);
              }}
              className={cn(
                "px-3 py-1.5 rounded-md text-sm font-medium transition-all",
                viewMode === "version"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              By Version / Era
            </button>
          </div>
          <span className="text-xs text-muted-foreground ml-2">
            {filteredEmojis.length.toLocaleString()} shown
          </span>
        </div>
      )}

      {/* Category tabs */}
      {!searchQuery && viewMode === "category" && (
        <CategoryTabs
          categories={categories}
          activeCategory={activeCategory}
          onSelect={(slug) => {
            setActiveCategory(slug);
            setSearchQuery("");
          }}
        />
      )}

      {/* Version browser */}
      {!searchQuery && viewMode === "version" && (
        <div className="space-y-3">
          <div className="flex flex-wrap gap-1.5">
            <button
              onClick={() => setActiveVersion(null)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-medium transition-all",
                activeVersion === null
                  ? "bg-foreground text-background"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              )}
            >
              All Versions
            </button>
            {versions.map((v) => (
              <button
                key={v.version}
                onClick={() => setActiveVersion(v.version)}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-xs font-medium transition-all",
                  activeVersion === v.version
                    ? "bg-foreground text-background"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                )}
              >
                {v.version} ({v.year}) · {v.count}
              </button>
            ))}
          </div>

          {/* Version info banner */}
          {activeVersion && (
            <div className="rounded-xl border border-border/50 bg-muted/30 p-4">
              <div className="flex items-center gap-3">
                <div className="text-2xl">
                  {versions.find((v) => v.version === activeVersion)?.sample.slice(0, 6).join(" ")}
                </div>
                <div>
                  <p className="text-sm font-medium">
                    Emoji {activeVersion} · {versions.find((v) => v.version === activeVersion)?.year}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {versions.find((v) => v.version === activeVersion)?.count} emojis introduced in this version
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Recent */}
      {!searchQuery && viewMode === "category" && !activeCategory && recent.length > 0 && (
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
