"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { Sun, Moon, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const MAIN_LINKS = [
  { href: "/emoji", label: "Emoji", icon: "😀" },
  { href: "/symbols", label: "Symbols", icon: "★" },
  { href: "/fancy-text", label: "Fonts", icon: "𝓐" },
  { href: "/combos", label: "Combos", icon: "🎭" },
];

const MORE_LINKS = [
  { href: "/kaomoji", label: "Kaomoji", icon: "(·ω·)" },
  { href: "/dividers", label: "Lines", icon: "───" },
  { href: "/invisible", label: "Invisible", icon: "⠀" },
  { href: "/braille", label: "Braille", icon: "⠓" },
  { href: "/ascii-art", label: "Art", icon: "╱╲" },
];

export function Navbar() {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();

  return (
    <header className="sticky top-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 font-semibold text-xl tracking-tight">
          <Image src="/logo.png" alt="EmojiKit Logo" width={44} height={44} className="rounded-md" />
          <span>EmojiKit</span>
        </Link>

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
              <span>More</span>
            </button>

            {/* Dropdown Menu */}
            <div className="absolute top-full right-0 mt-1 w-48 p-2 rounded-xl border border-border/50 bg-background/95 backdrop-blur-xl shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all grid gap-1">
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
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="h-8 w-8"
          >
            <Sun className="h-4 w-4 rotate-0 scale-100 transition-transform dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-transform dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
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
