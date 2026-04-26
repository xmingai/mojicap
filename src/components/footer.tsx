"use client";

import Link from "next/link";
import Image from "next/image";
import { Separator } from "@/components/ui/separator";
import { useDict, useLocale } from "@/i18n/context";
import { defaultLocale } from "@/i18n/config";

export function Footer() {
  const dict = useDict();
  const locale = useLocale();
  const t = dict.footer;
  const prefix = locale === defaultLocale ? "" : `/${locale}`;

  return (
    <footer className="mt-auto border-t border-border/40">
      <div className="mx-auto max-w-6xl px-4 py-8">
        <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-8">
          <div className="flex flex-col gap-3 max-w-xs">
            <div className="flex items-center gap-2.5">
              <Image src="/logo.png" alt="MojiCap Logo" width={32} height={32} className="rounded-sm opacity-80" />
              <span className="font-semibold text-lg text-foreground">MojiCap</span>
            </div>
            <p className="text-sm text-muted-foreground">{t.description}</p>
          </div>

          <div className="flex gap-12 sm:gap-24">
            <div className="space-y-3">
              <h4 className="font-semibold text-foreground">{t.tools}</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href={`${prefix}/emoji`} className="hover:text-foreground hover:underline transition-colors">{t.emojiCopyPaste}</Link></li>
                <li><Link href={`${prefix}/symbols`} className="hover:text-foreground hover:underline transition-colors">{t.specialSymbols}</Link></li>
                <li><Link href={`${prefix}/combos`} className="hover:text-foreground hover:underline transition-colors">{t.emojiCombos}</Link></li>
                <li><Link href={`${prefix}/kaomoji`} className="hover:text-foreground hover:underline transition-colors">{t.kaomojiEmoticons}</Link></li>
              </ul>
            </div>

            <div className="space-y-3">
              <h4 className="font-semibold text-foreground">{dict.textToolsNav.title}</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href={`${prefix}/fancy-text`} className="hover:text-foreground hover:underline transition-colors">{dict.textToolsNav.fancyText}</Link></li>
                <li><Link href={`${prefix}/glitch-text`} className="hover:text-foreground hover:underline transition-colors">{dict.textToolsNav.glitchText}</Link></li>
                <li><Link href={`${prefix}/vaporwave-text`} className="hover:text-foreground hover:underline transition-colors">{dict.textToolsNav.vaporwaveText}</Link></li>
                <li><Link href={`${prefix}/tiny-text`} className="hover:text-foreground hover:underline transition-colors">{dict.textToolsNav.tinyText}</Link></li>
                <li><Link href={`${prefix}/morse-code`} className="hover:text-foreground hover:underline transition-colors">{dict.textToolsNav.morseCode}</Link></li>
                <li><Link href={`${prefix}/cursive-text`} className="hover:text-foreground hover:underline transition-colors">{dict.textToolsNav.cursiveText}</Link></li>
              </ul>
            </div>
            
            <div className="space-y-3">
              <h4 className="font-semibold text-foreground">{t.moreTools}</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href={`${prefix}/dividers`} className="hover:text-foreground hover:underline transition-colors">{t.textDividers}</Link></li>
                <li><Link href={`${prefix}/invisible`} className="hover:text-foreground hover:underline transition-colors">{t.invisibleCharacters}</Link></li>
                <li><Link href={`${prefix}/braille`} className="hover:text-foreground hover:underline transition-colors">{t.brailleTranslator}</Link></li>
                <li><Link href={`${prefix}/ascii-art`} className="hover:text-foreground hover:underline transition-colors">{t.asciiArt}</Link></li>
              </ul>
            </div>
            
            <div className="space-y-3">
              <h4 className="font-semibold text-foreground">{t.company}</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href={`${prefix}/about`} className="hover:text-foreground hover:underline transition-colors">{t.about}</Link></li>
                <li><a href="https://discord.gg/J62YvPcrzB" target="_blank" rel="noopener noreferrer" className="hover:text-foreground hover:underline transition-colors">Discord</a></li>
              </ul>
            </div>
          </div>
        </div>

        <Separator className="my-8" />

        <div className="flex flex-col md:flex-row items-center justify-between gap-2 text-xs text-muted-foreground">
          <p>{t.copyright.replace("{year}", new Date().getFullYear().toString())}</p>
          <div className="flex gap-4">
            <Link href={`${prefix}/privacy`} className="hover:text-foreground transition-colors">
              {t.privacy}
            </Link>
            <Link href={`${prefix}/terms`} className="hover:text-foreground transition-colors">
              {t.terms}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
