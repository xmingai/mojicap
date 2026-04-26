'use client';
import Link from 'next/link';
import { usePathname, useParams } from 'next/navigation';
import { useRef, useEffect, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { useDict } from '@/i18n/context';

export function TextToolsTabs() {
  const pathname = usePathname();
  const params = useParams();
  const locale = params.locale as string;
  const dict = useDict();
  const activeRef = useRef<HTMLAnchorElement>(null);
  
  const tabs = [
    { name: dict.textToolsNav.fancyText, path: `/${locale}/fancy-text` },
    { name: dict.textToolsNav.glitchText, path: `/${locale}/glitch-text` },
    { name: dict.textToolsNav.vaporwaveText, path: `/${locale}/vaporwave-text` },
    { name: dict.textToolsNav.tinyText, path: `/${locale}/tiny-text` },
    { name: dict.textToolsNav.morseCode, path: `/${locale}/morse-code` },
    { name: dict.textToolsNav.cursiveText, path: `/${locale}/cursive-text` },
    { name: dict.textToolsNav.oldEnglishText, path: `/${locale}/old-english-text` },
    { name: dict.textToolsNav.boldText, path: `/${locale}/bold-text` },
    { name: dict.textToolsNav.italicText, path: `/${locale}/italic-text` },
    { name: dict.textToolsNav.bubbleText, path: `/${locale}/bubble-text` },
    { name: dict.textToolsNav.squareText, path: `/${locale}/square-text` },
    { name: dict.textToolsNav.upsideDownText, path: `/${locale}/upside-down-text` },
    { name: dict.textToolsNav.strikethroughText, path: `/${locale}/strikethrough-text` },
    { name: dict.textToolsNav.leetSpeak, path: `/${locale}/leet-speak` },
    { name: dict.textToolsNav.weirdText, path: `/${locale}/weird-text` },
  ];

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
            const isActive = pathname === tab.path || pathname === tab.path + '/';
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

