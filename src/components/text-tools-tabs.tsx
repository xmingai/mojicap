"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { useDict, useLocale } from "@/i18n/context";
import { defaultLocale } from "@/i18n/config";
import { pathWithoutLocale } from "@/lib/seo";
import { TEXT_TOOLS } from "@/lib/tool-routes";

/**
 * Second-level navigation for the text tools, rendered in the layout right
 * under the navbar and sticking with it, so switching styles never means
 * scrolling back up. Renders nothing off the text-tool routes.
 */
export function TextToolsTabs() {
  const pathname = usePathname();
  const locale = useLocale();
  const dict = useDict();
  const prefix = locale === defaultLocale ? "" : `/${locale}`;
  const currentRoute = pathWithoutLocale(pathname);
  const activeRef = useRef<HTMLAnchorElement>(null);
  const scrollerRef = useRef<HTMLDivElement>(null);

  const tabs = TEXT_TOOLS.map((tool) => ({
    name: dict.textToolsNav[tool.navKey],
    path: `${prefix}/${tool.slug}`,
  }));

  const onTextTool = tabs.some((tab) => currentRoute === pathWithoutLocale(tab.path));

  useEffect(() => {
    const active = activeRef.current;
    const scroller = scrollerRef.current;
    if (!active || !scroller) return;
    // Centre the active tab in its own row; scrollIntoView would also scroll the page.
    scroller.scrollTo({ left: active.offsetLeft - (scroller.clientWidth - active.clientWidth) / 2, behavior: "smooth" });
  }, [pathname, onTextTool]);

  if (!onTextTool) return null;

  return (
    <div className="relative z-10 border-b border-white/20 dark:border-white/10 bg-background/40 backdrop-blur-2xl backdrop-saturate-150">
      <div ref={scrollerRef} className="mx-auto max-w-6xl overflow-x-auto scrollbar-none px-4">
        <div className="flex w-max gap-2 py-2">
          {tabs.map((tab) => {
            const isActive = currentRoute === pathWithoutLocale(tab.path);
            return (
              <Link
                key={tab.path}
                href={tab.path}
                ref={isActive ? activeRef : undefined}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-foreground text-background"
                    : "text-muted-foreground hover:bg-foreground/5 hover:text-foreground",
                )}
              >
                {tab.name}
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
