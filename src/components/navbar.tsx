"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { Sun, Moon, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { useDict, useLocale } from "@/i18n/context";
import { locales, localeNames, localeFlags, defaultLocale, type Locale } from "@/i18n/config";
import { useState, useRef, useEffect } from "react";

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const dict = useDict();
  const locale = useLocale();
  const [langOpen, setLangOpen] = useState(false);
  const langRef = useRef<HTMLDivElement>(null);

  const prefix = locale === defaultLocale ? "" : `/${locale}`;

  const MAIN_LINKS = [
    { href: `${prefix}/emoji`, label: dict.nav.emoji, icon: "😀" },
    { href: `${prefix}/symbols`, label: dict.nav.symbols, icon: "★" },
    { href: `${prefix}/fancy-text`, label: dict.nav.fonts, icon: "𝓐" },
    { href: `${prefix}/combos`, label: dict.nav.combos, icon: "🎭" },
  ];

  const MORE_LINKS = [
    { href: `${prefix}/kaomoji`, label: dict.nav.kaomoji, icon: "(·ω·)" },
    { href: `${prefix}/dividers`, label: dict.nav.lines, icon: "───" },
    { href: `${prefix}/invisible`, label: dict.nav.invisible, icon: "⠀" },
    { href: `${prefix}/braille`, label: dict.nav.braille, icon: "⠓" },
    { href: `${prefix}/ascii-art`, label: dict.nav.art, icon: "╱╲" },
  ];

  // Close language dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (langRef.current && !langRef.current.contains(e.target as Node)) {
        setLangOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function switchLocale(newLocale: Locale) {
    // Remove current locale prefix, add new one
    let path = pathname;
    // Strip current locale prefix
    for (const l of locales) {
      if (path.startsWith(`/${l}/`)) {
        path = path.slice(`/${l}`.length);
        break;
      }
      if (path === `/${l}`) {
        path = "/";
        break;
      }
    }
    const newPath = newLocale === defaultLocale ? (path || "/") : `/${newLocale}${path || "/"}`;

    // Set cookie for middleware
    document.cookie = `NEXT_LOCALE=${newLocale};path=/;max-age=31536000`;
    setLangOpen(false);
    router.push(newPath);
  }

  return (
    <header className="sticky top-0 z-50 border-b border-white/20 dark:border-white/10 bg-background/40 backdrop-blur-2xl backdrop-saturate-150 shadow-sm">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        {/* Logo */}
        <Tooltip>
          <TooltipTrigger className="cursor-pointer" render={<div />}>
            <Link href={prefix || "/"} className="flex items-center gap-3 font-semibold text-xl tracking-tight">
              <Image src="/logo.png" alt="MojiCap Logo" width={44} height={44} className="rounded-md" />
              <span>MojiCap</span>
            </Link>
          </TooltipTrigger>
          <TooltipContent side="bottom" sideOffset={14}>
            <p className="flex items-center gap-1.5"><span className="text-[10px] px-1 py-0.5 bg-background text-foreground rounded">Cmd/Ctrl + D</span>{dict.nav.bookmarkTip}</p>
          </TooltipContent>
        </Tooltip>

        {/* Nav Links - Desktop */}
        <nav className="hidden lg:flex items-center gap-1">
          {MAIN_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "px-3 py-1.5 rounded-lg text-sm font-medium transition-colors",
                pathname.startsWith(link.href)
                  ? "bg-foreground/10 text-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-foreground/5"
              )}
            >
              <span className="mr-1.5 opacity-80">{link.icon}</span>
              <span className="whitespace-nowrap">{link.label}</span>
            </Link>
          ))}

          {/* More Dropdown */}
          <div className="relative group">
            <button className={cn(
              "flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors",
              MORE_LINKS.some(l => pathname.startsWith(l.href))
                ? "bg-foreground/10 text-foreground"
                : "text-muted-foreground hover:text-foreground hover:bg-foreground/5"
            )}>
              <span>•••</span>
              <span>{dict.nav.more}</span>
            </button>

            <div className="absolute top-full right-0 mt-2 w-48 p-2 rounded-2xl border border-border/50 bg-background/95 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.12)] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all grid gap-1 z-50">
              {MORE_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors hover:bg-muted",
                    pathname.startsWith(link.href) ? "bg-muted text-foreground" : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <span className="opacity-80 w-5 text-center">{link.icon}</span>
                  <span>{link.label}</span>
                </Link>
              ))}
            </div>
          </div>
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {/* Language Switcher */}
          <div className="relative" ref={langRef}>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setLangOpen(!langOpen)}
              className="h-8 w-8"
              title="Language"
            >
              <Globe className="h-4 w-4" />
            </Button>

            {langOpen && (
              <div className="absolute top-full right-0 mt-2 w-44 p-1.5 rounded-xl border border-border/50 bg-background/95 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.12)] z-50">
                {locales.map((l) => (
                  <button
                    key={l}
                    onClick={() => switchLocale(l)}
                    className={cn(
                      "w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors",
                      locale === l
                        ? "bg-foreground/10 text-foreground font-medium"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted"
                    )}
                  >
                    <span>{localeFlags[l]}</span>
                    <span>{localeNames[l]}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Theme Toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="h-8 w-8"
          >
            <Sun className="h-4 w-4 rotate-0 scale-100 transition-transform dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-transform dark:rotate-0 dark:scale-100" />
            <span className="sr-only">{dict.nav.toggleTheme}</span>
          </Button>
        </div>
      </div>

      {/* Nav Links - Mobile/Tablet */}
      <nav className="flex lg:hidden items-center gap-1 px-4 pb-2 pt-1 border-t border-border/20 overflow-x-auto scrollbar-none">
        {[...MAIN_LINKS, ...MORE_LINKS].map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "shrink-0 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors",
              pathname.startsWith(link.href)
                ? "bg-foreground/10 text-foreground"
                : "text-muted-foreground hover:text-foreground hover:bg-foreground/5"
            )}
          >
            <span className="mr-1 opacity-80">{link.icon}</span>
            <span className="whitespace-nowrap">{link.label}</span>
          </Link>
        ))}
      </nav>
    </header>
  );
}
