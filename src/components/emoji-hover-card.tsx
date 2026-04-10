"use client";

import Link from "next/link";
import { ArrowRight, Copy } from "lucide-react";
import type { Emoji } from "@/lib/emoji";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";

interface EmojiHoverCardProps {
  emoji: Emoji;
  onCopy: (emoji: Emoji) => void;
  sizeValue?: number;
}

export function EmojiHoverCard({ emoji, onCopy, sizeValue }: EmojiHoverCardProps) {
  return (
    <HoverCard>
      <HoverCardTrigger
        onClick={() => onCopy(emoji)}
        className="group relative flex items-center justify-center rounded-lg hover:bg-muted transition-all active:scale-90 cursor-pointer"
        style={sizeValue ? { 
          fontSize: `${sizeValue}px`, 
          padding: `${Math.max(4, sizeValue * 0.2)}px`,
          lineHeight: 1.1 
        } : { fontSize: "1.875rem", padding: "0.5rem" }} // Default to roughly text-3xl p-2
      >
        <span className="group-hover:scale-110 transition-transform">
          {emoji.emoji}
        </span>
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
          <div className="text-4xl leading-none flex-shrink-0">
            {emoji.emoji}
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
            Copy
          </button>
          <Link 
            href={`/emoji/${emoji.slug}`}
            className="flex-1 inline-flex items-center justify-center h-8 px-3 text-xs font-medium rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
            onClick={(e) => e.stopPropagation()}
          >
            Details
            <ArrowRight className="ml-1 h-3 w-3" />
          </Link>
        </div>
      </HoverCardContent>
    </HoverCard>
  );
}
