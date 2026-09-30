"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import type { Category } from "@/lib/emoji";
import { useDict, useLocale } from "@/i18n/context";
import { localePath } from "@/lib/seo";

interface CategoryTabsProps {
  categories: Category[];
  activeCategory: string | null;
}

/**
 * Category tabs are links to /emoji/<category>/ pages (and "All" to /emoji/),
 * so each category has a URL of its own that search engines can crawl.
 */
export function CategoryTabs({ categories, activeCategory }: CategoryTabsProps) {
  const dict = useDict();
  const locale = useLocale();
  const tab = (active: boolean) =>
    cn(
      "shrink-0 px-3 py-1.5 rounded-lg text-sm font-medium transition-all",
      active ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground hover:bg-muted"
    );
  return (
    <ScrollArea className="w-full whitespace-nowrap">
      <nav className="flex items-center gap-1 pb-2">
        <Link href={localePath(locale, "/emoji")} aria-current={activeCategory === null ? "page" : undefined} className={tab(activeCategory === null)}>
          {dict.common.all}
        </Link>
        {categories.map((cat) => (
          <Link
            key={cat.slug}
            href={localePath(locale, `/emoji/${cat.slug}`)}
            aria-current={activeCategory === cat.slug ? "page" : undefined}
            className={tab(activeCategory === cat.slug)}
          >
            <span className="mr-1">{cat.icon}</span>
            {dict.categories?.[cat.name as keyof typeof dict.categories] || cat.name}
          </Link>
        ))}
      </nav>
      <ScrollBar orientation="horizontal" className="invisible" />
    </ScrollArea>
  );
}
