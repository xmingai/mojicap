import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ComboButton } from "@/components/copy-buttons";
import { PopularEmojiGrid } from "@/components/popular-emoji-grid";
import { TypewriterText } from "@/components/typewriter-text";

const MODULES = [
  {
    href: "/emoji",
    icon: "😀",
    bgEmojis: ["😂", "❤️", "🔥", "✨", "🎉", "💯", "🥳", "💕"],
    title: "Emoji",
    desc: "1,900+ emojis",
    bg: "bg-amber-400",
    text: "text-amber-950",
    hoverBg: "hover:bg-amber-500",
  },
  {
    href: "/symbols",
    icon: "★",
    bgEmojis: ["→", "♠", "©", "∞", "♫", "△", "◆", "✓"],
    title: "Symbols",
    desc: "500+ special characters",
    bg: "bg-sky-400",
    text: "text-sky-950",
    hoverBg: "hover:bg-sky-500",
  },
  {
    href: "/fancy-text",
    icon: "𝓐",
    bgEmojis: ["𝔹", "ℝ", "𝕂", "𝓧", "ℂ", "ℍ", "𝕊", "𝓩"],
    title: "Fancy Text",
    desc: "20+ font styles",
    bg: "bg-violet-400",
    text: "text-violet-950",
    hoverBg: "hover:bg-violet-500",
  },
  {
    href: "/combos",
    icon: "🎭",
    bgEmojis: ["🎀", "☀️", "🍄", "📚", "🌊", "💔", "🌿", "🥳"],
    title: "Combos",
    desc: "100+ combinations",
    bg: "bg-emerald-400",
    text: "text-emerald-950",
    hoverBg: "hover:bg-emerald-500",
  },
];

const POPULAR_EMOJIS = [
  "😂", "❤️", "🤣", "👍", "😭", "🙏", "😘", "🥰", "😍", "😊",
  "🎉", "🔥", "🥺", "💕", "😁", "💜", "😢", "👏", "😉", "💗",
  "✨", "🤗", "🤩", "💯", "🙌", "🫶", "😎", "🥳", "💪", "🤭",
  "🥲", "💀", "😈", "🤡", "👻", "🤯", "🫠", "😤", "🫡", "🤑",
  "🫣", "🫢", "😻", "💝", "🌟", "⭐", "🌈", "🍀", "🦋", "🐱",
  "🐶", "🌸", "🌹", "🍕", "☕", "🎶", "💎", "👀", "🙈", "❄️",
];

const TRENDING_COMBOS = [
  { name: "Coquette", combo: "🎀🌷🫧🧸🩰" },
  { name: "Summer Vibes", combo: "☀️🏖️🌊🍹🌴" },
  { name: "Dark Academia", combo: "📚🖋️🕯️🏛️🤎" },
  { name: "Party", combo: "🎉🥳🎊✨🎈" },
  { name: "Nature Core", combo: "🍄🌿🐚🍃🪵" },
  { name: "Sad Hours", combo: "😢💔🥺😞🌧" },
];

const EXTRA_MODULES = [
  { href: "/kaomoji", title: "Kaomoji", desc: "Japanese Emoticons", icon: "(·ω·)" },
  { href: "/dividers", title: "Text Dividers", desc: "Aesthetic borders", icon: "───" },
  { href: "/invisible", title: "Invisible Characters", desc: "Blank text & ZWSP", icon: "⠀" },
  { href: "/braille", title: "Braille & Morse", desc: "Translate text to dots", icon: "⠓" },
  { href: "/ascii-art", title: "ASCII Art", desc: "Retro text pictures", icon: "╱╲" },
];

export default function HomePage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      {/* Hero */}
      <section className="text-center mb-16">
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4 flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3">
          <span>Copy & Paste</span>
          <TypewriterText />
        </h1>
        <p className="text-lg text-muted-foreground max-w-xl mx-auto">
          The fastest emoji, symbols, and fancy text tool on the web. Click to copy.
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
            {/* Background decorative emojis */}
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
            
            {/* Content */}
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
          <h2 className="text-xl font-semibold">🔥 Popular Emojis</h2>
          <Link
            href="/emoji"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
          >
            View all <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
        <PopularEmojiGrid emojis={POPULAR_EMOJIS} />
      </section>

      {/* Trending Combos Preview */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">✨ Trending Combos</h2>
          <Link
            href="/combos"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
          >
            View all <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {TRENDING_COMBOS.map((combo) => (
            <ComboButton key={combo.name} name={combo.name} combo={combo.combo} />
          ))}
        </div>
      </section>

      {/* Explore More Tools */}
      <section className="mt-16">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">🚀 Explore More Tools</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {EXTRA_MODULES.map((mod) => (
            <Link
              key={mod.href}
              href={mod.href}
              className="flex flex-col items-center justify-center p-4 rounded-xl border border-border/50 bg-card hover:bg-muted/50 hover:border-border transition-all group text-center"
            >
              <span className="text-2xl mb-2 group-hover:scale-110 transition-transform">{mod.icon}</span>
              <p className="font-semibold text-sm">{mod.title}</p>
              <p className="text-[10px] text-muted-foreground mt-1 opacity-80">{mod.desc}</p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
