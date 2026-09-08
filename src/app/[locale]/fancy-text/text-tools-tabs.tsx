'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { useDict, useLocale } from '@/i18n/context';
import { defaultLocale } from '@/i18n/config';
import { pathWithoutLocale } from '@/lib/seo';
import { TEXT_TOOLS } from '@/lib/tool-routes';

export function TextToolsTabs() {
  const pathname = usePathname();
  const locale = useLocale();
  const dict = useDict();
  const prefix = locale === defaultLocale ? "" : `/${locale}`;
  const currentRoute = pathWithoutLocale(pathname);
  const activeRef = useRef<HTMLAnchorElement>(null);
  
  const tabs = TEXT_TOOLS.map((tool) => ({
    name: dict.textToolsNav[tool.navKey],
    path: `${prefix}/${tool.slug}`,
  }));

  useEffect(() => {
    if (activeRef.current) {
      activeRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
  }, [pathname]);

  return (
    <div className="mb-10 pb-6 border-b border-border/40">
      <div className="w-full overflow-x-auto scrollbar-none">
        <div className="flex w-max space-x-2 p-1 mx-auto">
          {tabs.map(tab => {
            const isActive = currentRoute === pathWithoutLocale(tab.path);
            return (
              <Link 
                key={tab.path} 
                href={tab.path}
                ref={isActive ? activeRef : undefined}
                className={cn(
                  "px-5 py-2 rounded-full text-sm font-semibold transition-all duration-200 shrink-0",
                  isActive 
                    ? "bg-primary text-primary-foreground shadow-sm scale-105" 
                    : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground hover:scale-105"
                )}
              >
                {tab.name}
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}

