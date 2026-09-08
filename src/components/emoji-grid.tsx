"use client";

import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import { Loader2 } from "lucide-react";
import type { Emoji, EmojiLite, Category, EmojiVersion } from "@/lib/emoji";
import { copyToClipboard } from "@/lib/clipboard";
import { searchEmojis } from "@/lib/search";
import { SearchBar } from "@/components/search-bar";
import { SearchParamsInit } from "@/components/search-params-init";
import { CategoryTabs } from "@/components/category-tabs";
import { useRecent } from "@/hooks/use-recent";
import { EmojiHoverCard } from "@/components/emoji-hover-card";
import { SizeSlider, COMMON_SIZE_PRESETS } from "@/components/size-slider";
import { cn } from "@/lib/utils";
import { useDict } from "@/i18n/context";

interface EmojiGridProps {
  emojis: EmojiLite[]; // base emojis (no skin variants), slim payload
  categories: Category[];
  versions: EmojiVersion[];
}

type ViewMode = "category" | "version";

export function EmojiGrid({ emojis, categories, versions }: EmojiGridProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [activeVersion, setActiveVersion] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("category");
  const { recent, addRecent } = useRecent();
  const [sizeIndex, setSizeIndex] = useState(2);
  const currentSize = COMMON_SIZE_PRESETS[sizeIndex];
  const dict = useDict();
  const t = dict.emoji;

  // Full dataset (keywords + skin-tone variants) is only needed for search and
  // version browsing, so it is fetched on demand as a separate chunk rather than
  // shipped in the initial page payload.
  const [fullEmojis, setFullEmojis] = useState<Emoji[] | null>(null);
  const loadStartedRef = useRef(false);

  const needsFull = Boolean(searchQuery) || (viewMode === "version" && activeVersion !== null);

  useEffect(() => {
    if (!needsFull || fullEmojis || loadStartedRef.current) return;
    loadStartedRef.current = true;
    let cancelled = false;
    import("@/data/emoji-data.json")
      .then((mod) => {
        if (!cancelled) setFullEmojis(mod.default as unknown as Emoji[]);
      })
      .catch(() => {
        // Allow a retry on the next trigger if the chunk failed to load.
        loadStartedRef.current = false;
      });
    return () => {
      cancelled = true;
    };
  }, [needsFull, fullEmojis]);

  const filteredEmojis = useMemo<EmojiLite[]>(() => {
    if (searchQuery) {
      if (!fullEmojis) return [];
      const base = fullEmojis.filter((e) => !e.skinToneVariant);
      return searchEmojis(base, searchQuery);
    }
    if (viewMode === "version" && activeVersion) {
      if (!fullEmojis) return [];
      return fullEmojis.filter((e) => e.emojiVersion === activeVersion);
    }
    if (viewMode === "category" && activeCategory) {
      return emojis.filter((e) => e.groupSlug === activeCategory);
    }
    return emojis;
  }, [emojis, fullEmojis, searchQuery, activeCategory, activeVersion, viewMode]);

  const isLoading = needsFull && !fullEmojis;

  const handleCopy = useCallback(
    (emoji: EmojiLite) => {
      copyToClipboard(emoji.emoji, emoji.name);
      addRecent(emoji.emoji);
    },
    [addRecent]
  );

  // Deep links: /emoji/?q=heart (site-search JSON-LD) and /emoji/?category=food-drink (detail pages)
  const applySearchParams = useCallback(
    (params: URLSearchParams) => {
      const q = params.get("q");
      const category = params.get("category");
      if (q) {
        setSearchQuery(q);
        setActiveCategory(null);
        setActiveVersion(null);
      } else if (category && categories.some((c) => c.slug === category)) {
        setViewMode("category");
        setActiveCategory(category);
        setActiveVersion(null);
        setSearchQuery("");
      }
    },
    [categories]
  );

  return (
    <div className="space-y-4">
      <SearchParamsInit onParams={applySearchParams} />
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold mb-1">{t.title}</h1>
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
        placeholder={t.searchPlaceholder}
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
              {t.byCategory}
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
              {t.byVersion}
            </button>
          </div>
          <span className="text-xs text-muted-foreground ml-2">
            {filteredEmojis.length.toLocaleString()} {t.shown}
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
              {t.allVersions}
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
                    {versions.find((v) => v.version === activeVersion)?.count} {t.emojiIntro}
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
            {t.recentlyUsed}
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
                  lineHeight: 1.1,
                }}
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Loading full dataset for search / version view */}
      {isLoading && (
        <div className="flex justify-center py-16 text-muted-foreground">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      )}

      {/* Grid */}
      {!isLoading && (
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
      )}

      {!isLoading && filteredEmojis.length === 0 && (
        <div className="text-center py-16 text-muted-foreground">
          <p className="text-4xl mb-3">🔍</p>
          <p className="text-sm">{t.noResults} &quot;{searchQuery}&quot;</p>
        </div>
      )}
    </div>
  );
}
