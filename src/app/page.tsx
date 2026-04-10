import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { EmojiButton, ComboButton } from "@/components/copy-buttons";

const MODULES = [
  {
    href: "/emoji",
    icon: "😀",
    title: "Emoji",
    desc: "1,900+ emojis",
    gradient: "from-amber-500/10 to-orange-500/10",
  },
  {
    href: "/symbols",
    icon: "★",
    title: "Symbols",
    desc: "500+ special characters",
    gradient: "from-blue-500/10 to-cyan-500/10",
  },
  {
    href: "/fancy-text",
    icon: "𝓐",
    title: "Fancy Text",
    desc: "20+ font styles",
    gradient: "from-purple-500/10 to-pink-500/10",
  },
  {
    href: "/combos",
    icon: "🎭",
    title: "Combos",
    desc: "100+ combinations",
    gradient: "from-emerald-500/10 to-teal-500/10",
  },
];

const POPULAR_EMOJIS = [
  "😂", "❤️", "🤣", "👍", "😭", "🙏", "😘", "🥰", "😍", "😊",
  "🎉", "🔥", "🥺", "💕", "😁", "💜", "😢", "👏", "😉", "💗",
  "✨", "🤗", "🤩", "💯", "🙌", "🫶", "😎", "🥳", "💪", "🤭",
];

const TRENDING_COMBOS = [
  { name: "Coquette", combo: "🎀🌷🫧🧸🩰" },
  { name: "Summer Vibes", combo: "☀️🏖️🌊🍹🌴" },
  { name: "Dark Academia", combo: "📚🖋️🕯️🏛️🤎" },
  { name: "Party", combo: "🎉🥳🎊✨🎈" },
  { name: "Nature Core", combo: "🍄🌿🐚🍃🪵" },
  { name: "Sad Hours", combo: "😢💔🥺😞🌧" },
];

export default function HomePage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      {/* Hero */}
      <section className="text-center mb-16">
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4">
          Copy & Paste <span className="inline-block animate-bounce">⚡</span> Instantly
        </h1>
        <p className="text-lg text-muted-foreground max-w-xl mx-auto">
          The fastest emoji, symbols, and fancy text tool on the web.
          Click to copy. No sign up. No ads.
        </p>
      </section>

      {/* Module Cards */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-16">
        {MODULES.map((mod) => (
          <Link
            key={mod.href}
            href={mod.href}
            className={`group relative flex flex-col items-center gap-3 p-6 rounded-2xl border border-border/50 bg-gradient-to-br ${mod.gradient} hover:border-border hover:shadow-lg transition-all`}
          >
            <span className="text-4xl">{mod.icon}</span>
            <div className="text-center">
              <p className="font-semibold">{mod.title}</p>
              <p className="text-xs text-muted-foreground">{mod.desc}</p>
            </div>
            <ArrowRight className="absolute top-3 right-3 h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
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
        <div className="flex flex-wrap gap-1">
          {POPULAR_EMOJIS.map((emoji, i) => (
            <EmojiButton key={i} emoji={emoji} />
          ))}
        </div>
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
    </div>
  );
}
