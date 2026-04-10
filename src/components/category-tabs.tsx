"use client";

import { cn } from "@/lib/utils";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import type { Category } from "@/lib/emoji";

interface CategoryTabsProps {
  categories: Category[];
  activeCategory: string | null;
  onSelect: (slug: string | null) => void;
}

export function CategoryTabs({ categories, activeCategory, onSelect }: CategoryTabsProps) {
  return (
    <ScrollArea className="w-full whitespace-nowrap">
      <div className="flex items-center gap-1 pb-2">
        <button
          onClick={() => onSelect(null)}
          className={cn(
            "shrink-0 px-3 py-1.5 rounded-lg text-sm font-medium transition-all",
            activeCategory === null
              ? "bg-foreground text-background"
              : "text-muted-foreground hover:text-foreground hover:bg-muted"
          )}
        >
          All
        </button>
        {categories.map((cat) => (
          <button
            key={cat.slug}
            onClick={() => onSelect(cat.slug)}
            className={cn(
              "shrink-0 px-3 py-1.5 rounded-lg text-sm font-medium transition-all",
              activeCategory === cat.slug
                ? "bg-foreground text-background"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            )}
          >
            <span className="mr-1">{cat.icon}</span>
            {cat.name}
          </button>
        ))}
      </div>
      <ScrollBar orientation="horizontal" className="invisible" />
    </ScrollArea>
  );
}
