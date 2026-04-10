import Link from "next/link";
import Image from "next/image";
import { Separator } from "@/components/ui/separator";

export function Footer() {
  return (
    <footer className="mt-auto border-t border-border/40">
      <div className="mx-auto max-w-6xl px-4 py-8">
        <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-8">
          <div className="flex flex-col gap-3 max-w-xs">
            <div className="flex items-center gap-2.5">
              <Image src="/logo.png" alt="EmojiKit Logo" width={32} height={32} className="rounded-sm opacity-80" />
              <span className="font-semibold text-lg text-foreground">EmojiKit</span>
            </div>
            <p className="text-sm text-muted-foreground">The fastest and most beautiful emoji tool on the web. Instantly copy emojis, symbols, and text art.</p>
          </div>

          <div className="flex gap-12 sm:gap-24">
          <div className="space-y-3">
            <h4 className="font-semibold text-foreground">Tools</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/emoji" className="hover:text-foreground hover:underline transition-colors">🔥 Emoji Copy & Paste</Link></li>
              <li><Link href="/symbols" className="hover:text-foreground hover:underline transition-colors">★ Special Symbols</Link></li>
              <li><Link href="/fancy-text" className="hover:text-foreground hover:underline transition-colors">𝓐 Fancy Text Generator</Link></li>
              <li><Link href="/combos" className="hover:text-foreground hover:underline transition-colors">🎭 Emoji Combos</Link></li>
              <li><Link href="/kaomoji" className="hover:text-foreground hover:underline transition-colors">(·ω·) Kaomoji / Emoticons</Link></li>
            </ul>
          </div>
          
          <div className="space-y-3">
            <h4 className="font-semibold text-foreground">More Tools</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/dividers" className="hover:text-foreground hover:underline transition-colors">─── Text Dividers</Link></li>
              <li><Link href="/invisible" className="hover:text-foreground hover:underline transition-colors">⠀ Invisible Characters</Link></li>
              <li><Link href="/braille" className="hover:text-foreground hover:underline transition-colors">⠓ Braille Translator</Link></li>
              <li><Link href="/ascii-art" className="hover:text-foreground hover:underline transition-colors">╱╲ ASCII Art</Link></li>
            </ul>
          </div>
          </div>
        </div>

        <Separator className="my-8" />

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
