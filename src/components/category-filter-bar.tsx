"use client";

import { cn } from "@/lib/utils";
import { useDict } from "@/i18n/context";

export interface FilterCategory {
  /** Stable key used for selection (id, name, or category label). */
  key: string;
  /** Raw category name used to look up a translation in dict.categories. */
  name: string;
  icon?: string;
}

interface CategoryFilterBarProps {
  categories: FilterCategory[];
  activeKey: string | null;
  onSelect: (key: string | null) => void;
}

/**
 * "All" + one pill per category. Shared by the combos, kaomoji, dividers and
 * ascii-art pages, which previously each hand-rolled an identical block.
 */
export function CategoryFilterBar({ categories, activeKey, onSelect }: CategoryFilterBarProps) {
  const dict = useDict();
  return (
    <div className="flex flex-wrap gap-1">
      <button
        onClick={() => onSelect(null)}
        className={cn(
          "px-3 py-1.5 rounded-lg text-sm font-medium transition-all",
          activeKey === null
            ? "bg-foreground text-background"
            : "text-muted-foreground hover:text-foreground hover:bg-muted"
        )}
      >
        {dict.common.all}
      </button>
      {categories.map((cat) => (
        <button
          key={cat.key}
          onClick={() => onSelect(cat.key)}
          className={cn(
            "px-3 py-1.5 rounded-lg text-sm font-medium transition-all",
            activeKey === cat.key
              ? "bg-foreground text-background"
              : "text-muted-foreground hover:text-foreground hover:bg-muted"
          )}
        >
          {cat.icon && <span className="mr-1">{cat.icon}</span>}
          {dict.categories?.[cat.name as keyof typeof dict.categories] || cat.name}
        </button>
      ))}
    </div>
  );
}
