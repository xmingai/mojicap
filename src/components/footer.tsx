import Link from "next/link";
import { Separator } from "@/components/ui/separator";

export function Footer() {
  return (
    <footer className="mt-auto border-t border-border/40">
      <div className="mx-auto max-w-6xl px-4 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className="text-lg">⚡</span>
            <span className="font-medium text-foreground">EmojiKit</span>
            <span>— The fastest emoji tool on the web</span>
          </div>

          <nav className="flex items-center gap-4 text-sm text-muted-foreground">
            <Link href="/emoji" className="hover:text-foreground transition-colors">
              Emoji
            </Link>
            <Link href="/symbols" className="hover:text-foreground transition-colors">
              Symbols
            </Link>
            <Link href="/fancy-text" className="hover:text-foreground transition-colors">
              Fancy Text
            </Link>
            <Link href="/combos" className="hover:text-foreground transition-colors">
              Combos
            </Link>
          </nav>
        </div>

        <Separator className="my-4" />

        <div className="flex flex-col md:flex-row items-center justify-between gap-2 text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} EmojiKit. All emoji copyrights belong to their respective owners.</p>
          <div className="flex gap-4">
            <Link href="/privacy" className="hover:text-foreground transition-colors">
              Privacy
            </Link>
            <Link href="/terms" className="hover:text-foreground transition-colors">
              Terms
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
