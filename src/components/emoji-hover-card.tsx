"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowRight, Check, Copy, Heart, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useFavorites } from "@/hooks/use-favorites";
import { MEMBERSHIP_UI_ENABLED } from "@/lib/membership/config";
import type { EmojiLite } from "@/lib/emoji";
import { useDict, useLocale } from "@/i18n/context";
import { defaultLocale } from "@/i18n/config";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";

interface EmojiHoverCardProps {
  emoji: EmojiLite;
  onCopy: (emoji: EmojiLite) => void;
  sizeValue?: number;
  /** Bulk-select mode: clicking toggles selection instead of copying. */
  selectMode?: boolean;
  selected?: boolean;
}

export function EmojiHoverCard({ emoji, onCopy, sizeValue, selectMode = false, selected = false }: EmojiHoverCardProps) {
  const dict = useDict();
  const locale = useLocale();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const prefix = locale === defaultLocale ? "" : `/${locale}`;
  const { isFavorite, toggleFavorite } = useFavorites();
  const favorite = isFavorite(emoji.emoji);
  return (
    <HoverCard>
      <HoverCardTrigger
        onClick={() => onCopy(emoji)}
        aria-pressed={selectMode ? selected : undefined}
        className={cn(
          "group relative flex items-center justify-center rounded-lg hover:bg-muted transition-all active:scale-90 cursor-pointer",
          selectMode && selected && "bg-muted ring-2 ring-foreground",
        )}
        style={sizeValue ? { 
          fontSize: `${sizeValue}px`, 
          padding: `${Math.max(4, sizeValue * 0.2)}px`,
          lineHeight: 1.1 
        } : { fontSize: "1.875rem", padding: "0.5rem" }} // Default to roughly text-3xl p-2
      >
        <span className="group-hover:scale-110 transition-transform">
          {emoji.emoji}
        </span>
        {selectMode && selected && (
          <span className="absolute right-0.5 top-0.5 grid h-4 w-4 place-items-center rounded-full bg-foreground text-background">
            <Check className="h-3 w-3" />
          </span>
        )}
      </HoverCardTrigger>
      <HoverCardContent 
        side="top" 
        className="w-56 p-3 shadow-xl"
      >
        {/* Header: emoji name + large preview */}
        <div className="flex justify-between items-start gap-3 mb-3">
          <div className="space-y-0.5 overflow-hidden min-w-0">
            <h4 className="text-sm font-semibold capitalize leading-tight">{emoji.name}</h4>
            <p className="text-[11px] text-muted-foreground font-mono">
              {emoji.unicode}
            </p>
          </div>
          <div className="flex flex-shrink-0 items-start gap-1">
            {MEMBERSHIP_UI_ENABLED && (
              <button
                type="button"
                aria-pressed={favorite}
                aria-label={favorite ? dict.favorites.remove : dict.favorites.add}
                onClick={(e) => {
                  e.stopPropagation();
                  const added = toggleFavorite(emoji.emoji);
                  toast.success(added ? dict.favorites.added : dict.favorites.removed, { duration: 1200 });
                }}
                className="grid h-7 w-7 place-items-center rounded-md text-muted-foreground transition hover:bg-muted hover:text-foreground"
              >
                <Heart className={cn("h-4 w-4", favorite && "fill-current text-foreground")} />
              </button>
            )}
            <div className="text-4xl leading-none">{emoji.emoji}</div>
          </div>
        </div>
        
        {/* Action buttons */}
        <div className="flex gap-2">
          <button 
            className="flex-1 inline-flex items-center justify-center h-8 px-3 text-xs font-medium rounded-md border border-border bg-background hover:bg-muted transition-colors cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
              onCopy(emoji);
            }}
          >
            <Copy className="mr-1.5 h-3 w-3" />
            {dict.common.copy}
          </button>
          <button 
            className="flex-1 inline-flex items-center justify-center h-8 px-3 text-xs font-medium rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={(e) => {
              e.stopPropagation();
              setIsLoading(true);
              router.push(`${prefix}/emoji/${emoji.slug}`);
            }}
            disabled={isLoading}
          >
            {dict.common.details}
            {isLoading ? (
              <Loader2 className="ml-1 h-3 w-3 animate-spin" />
            ) : (
              <ArrowRight className="ml-1 h-3 w-3" />
            )}
          </button>
        </div>
      </HoverCardContent>
    </HoverCard>
  );
}
