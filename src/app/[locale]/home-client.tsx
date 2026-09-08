"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ComboButton } from "@/components/copy-buttons";
import { PopularEmojiGrid } from "@/components/popular-emoji-grid";
import { TypewriterText } from "@/components/typewriter-text";
import { FAQSection } from "@/components/faq-section";
import type { Dictionary } from "@/i18n/dictionaries";
import type { Locale } from "@/i18n/config";

interface HomeClientProps {
  dict: Dictionary;
  locale: Locale;
}

const POPULAR_EMOJIS = [
  "😂", "❤️", "🤣", "👍", "😭", "🙏", "😘", "🥰", "😍", "😊",
  "🎉", "🔥", "🥺", "💕", "😁", "💜", "😢", "👏", "😉", "💗",
  "✨", "🤗", "🤩", "💯", "🙌", "🫶", "😎", "🥳", "💪", "🤭",
  "🥲", "💀", "😈", "🤡", "👻", "🤯", "🫠", "😤", "🫡", "🤑",
  "🫣", "🫢", "😻", "💝", "🌟", "⭐", "🌈", "🍀", "🦋", "🐱",
  "🐶", "🌸", "🌹", "🍕", "☕", "🎶", "💎", "👀", "🙈", "❄️",
];

export function HomeClient({ dict, locale }: HomeClientProps) {
  const t = dict.home;
  const prefix = locale === "en" ? "" : `/${locale}`;

  const TRENDING_COMBOS = [
    { name: t.preview_coquette, combo: "🎀🌷🫧🧸🩰" },
    { name: t.preview_summerVibes, combo: "☀️🏖️🌊🍹🌴" },
    { name: t.preview_darkAcademia, combo: "📚🖋️🕯️🏛️🤎" },
    { name: t.preview_party, combo: "🎉🥳🎊✨🎈" },
    { name: t.preview_natureCore, combo: "🍄🌿🐚🍃🪵" },
    { name: t.preview_sadHours, combo: "😢💔🥺😞🌧" },
  ];

  const PREVIEW_KAOMOJI = [
    { name: t.preview_tableFlip, text: "(╯°□°)╯︵ ┻━┻" },
    { name: t.preview_sparkles, text: "(ﾉ◕ヮ◕)ﾉ*:･ﾟ✧" },
    { name: t.preview_bear, text: "ʕ•ᴥ•ʔ" },
    { name: t.preview_fight, text: "(ง'̀-'́)ง" },
  ];

  const PREVIEW_DIVIDERS = [
    { name: t.preview_stars, text: "────── ⋆⋅☆⋅⋆ ──────" },
    { name: t.preview_flowers, text: "⋆┈┈｡ﾟ❃ུ۪ ❀ུ۪ ❁ུ۪ ❃ུ۪ ❀ུ۪ ﾟ｡┈┈⋆" },
  ];

  const PREVIEW_ASCII_ART = [
    { name: t.preview_sniper, text: "︻デ═一" },
    { name: t.preview_spider, text: "/╲/\\╭ºoº╮/\\╱\\" },
  ];



  const MODULES = [
    {
      href: `${prefix}/emoji`,
      icon: "😀",
      bgEmojis: ["😂", "❤️", "🔥", "✨", "🎉", "💯", "🥳", "💕"],
      title: t.moduleEmoji,
      desc: t.moduleEmojiDesc,
      bg: "bg-amber-400",
      text: "text-amber-950",
      hoverBg: "hover:bg-amber-500",
    },
    {
      href: `${prefix}/symbols`,
      icon: "★",
      bgEmojis: ["→", "♠", "©", "∞", "♫", "△", "◆", "✓"],
      title: t.moduleSymbols,
      desc: t.moduleSymbolsDesc,
      bg: "bg-sky-400",
      text: "text-sky-950",
      hoverBg: "hover:bg-sky-500",
    },
    {
      href: `${prefix}/fancy-text`,
      icon: "𝓐",
      bgEmojis: ["𝔹", "ℝ", "𝕂", "𝓧", "ℂ", "ℍ", "𝕊", "𝓩"],
      title: t.moduleFancyText,
      desc: t.moduleFancyTextDesc,
      bg: "bg-violet-400",
      text: "text-violet-950",
      hoverBg: "hover:bg-violet-500",
    },
    {
      href: `${prefix}/combos`,
      icon: "🎭",
      bgEmojis: ["🎀", "☀️", "🍄", "📚", "🌊", "💔", "🌿", "🥳"],
      title: t.moduleCombos,
      desc: t.moduleCombosDesc,
      bg: "bg-emerald-400",
      text: "text-emerald-950",
      hoverBg: "hover:bg-emerald-500",
    },
  ];

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      {/* Hero */}
      <section className="text-center mb-16">
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4 flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3">
          <span>{t.heroTitle}</span>
          <TypewriterText words={t.typewriterWords as string[]} />
        </h1>
        <p className="text-lg text-muted-foreground max-w-xl mx-auto">
          {t.heroSubtitle}
        </p>
      </section>

      {/* Module Cards */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">
        {MODULES.map((mod) => (
          <Link
            key={mod.href}
            href={mod.href}
            className={`group relative overflow-hidden rounded-2xl ${mod.bg} ${mod.hoverBg} ${mod.text} transition-all duration-300 hover:shadow-xl hover:-translate-y-1`}
          >
            <div className="absolute inset-0 opacity-15 select-none pointer-events-none overflow-hidden">
              <div className="absolute -top-2 -left-2 text-5xl rotate-[-15deg]">{mod.bgEmojis[0]}</div>
              <div className="absolute top-1 right-3 text-3xl rotate-[20deg]">{mod.bgEmojis[1]}</div>
              <div className="absolute top-10 left-6 text-4xl rotate-[10deg]">{mod.bgEmojis[2]}</div>
              <div className="absolute bottom-8 right-1 text-5xl rotate-[-25deg]">{mod.bgEmojis[3]}</div>
              <div className="absolute bottom-1 left-2 text-3xl rotate-[30deg]">{mod.bgEmojis[4]}</div>
              <div className="absolute top-16 right-8 text-2xl rotate-[-10deg]">{mod.bgEmojis[5]}</div>
              <div className="absolute bottom-14 left-10 text-2xl rotate-[15deg]">{mod.bgEmojis[6]}</div>
              <div className="absolute -bottom-1 right-10 text-4xl rotate-[-5deg]">{mod.bgEmojis[7]}</div>
            </div>
            <div className="relative z-10 flex flex-col items-center justify-center p-8 pt-10 pb-6 min-h-[180px]">
              <span className="text-6xl mb-4 drop-shadow-sm group-hover:scale-110 transition-transform duration-300">
                {mod.icon}
              </span>
              <p className="font-bold text-lg">{mod.title}</p>
              <p className="text-sm opacity-75">{mod.desc}</p>
              <ArrowRight className="mt-3 h-4 w-4 opacity-0 group-hover:opacity-75 translate-x-0 group-hover:translate-x-1 transition-all duration-300" />
            </div>
          </Link>
        ))}
      </section>

      {/* Popular Emojis */}
      <section className="mb-16">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">{t.popularEmojis}</h2>
          <Link
            href={`${prefix}/emoji`}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
          >
            {t.viewAll} <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
        <PopularEmojiGrid emojis={POPULAR_EMOJIS} />
      </section>

      {/* Trending Combos Preview */}
      <section className="mb-16">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">{t.trendingCombos}</h2>
          <Link
            href={`${prefix}/combos`}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
          >
            {t.viewAll} <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {TRENDING_COMBOS.map((combo) => (
            <ComboButton key={combo.name} name={combo.name} combo={combo.combo} />
          ))}
        </div>
      </section>

      {/* Kaomoji Preview */}
      <section className="mb-16">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">{t.popularKaomoji}</h2>
          <Link
            href={`${prefix}/kaomoji`}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
          >
            {t.viewAll} <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {PREVIEW_KAOMOJI.map((k) => (
            <ComboButton key={k.name} name={k.name} combo={k.text} />
          ))}
        </div>
      </section>

      {/* Dividers Preview */}
      <section className="mb-16">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">{t.aestheticDividers}</h2>
          <Link
            href={`${prefix}/dividers`}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
          >
            {t.viewAll} <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {PREVIEW_DIVIDERS.map((d) => (
            <ComboButton key={d.name} name={d.name} combo={d.text} />
          ))}
        </div>
      </section>

      {/* ASCII Art Preview */}
      <section className="mb-16">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">{t.oneLineAsciiArt}</h2>
          <Link
            href={`${prefix}/ascii-art`}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
          >
            {t.viewAll} <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {PREVIEW_ASCII_ART.map((a) => (
            <ComboButton key={a.name} name={a.name} combo={a.text} />
          ))}
        </div>
      </section>

      {/* Utility Preview */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">{t.invisibleCharacters}</h2>
            <Link href={`${prefix}/invisible`} className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1">
              {t.viewAll} <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <ComboButton name={t.preview_zwspName as string} combo="[​]" />
          <p className="text-xs text-muted-foreground mt-2 px-1">{t.invisibleHint}</p>
        </div>
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">{t.brailleTranslator}</h2>
            <Link href={`${prefix}/braille`} className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1">
              {t.tryIt} <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <ComboButton name={t.preview_helloWorld as string} combo="⠓⠑⠇⠇⠕⠀⠺⠕⠗⠇⠙" />
        </div>
      </section>

      {/* FAQ Section */}
      {t.faq && t.faq.length > 0 && (
        <FAQSection title={t.faqTitle} faqs={t.faq} />
      )}
    </div>
  );
}
