import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getAllSlugs, getEmojiBySlug, getRelatedEmojis, getSkinToneVariants } from "@/lib/emoji";
import { CopyButton } from "./copy-button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft } from "lucide-react";
import { getDictionary } from "@/i18n/dictionaries";
import { locales, type Locale } from "@/i18n/config";

interface Props {
  params: Promise<{ locale: string; slug: string }>;
}

// Only pre-render the default locale (en) at build time.
// Other locales are generated on-demand via ISR at first visit, then cached.
// This cuts build from ~22,700 pages to ~3,800 pages (10min → ~2min).
export async function generateStaticParams() {
  const slugs = getAllSlugs();
  return slugs.map((slug) => ({ locale: "en", slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const emoji = getEmojiBySlug(slug);
  if (!emoji) return { title: "Emoji Not Found" };

  return {
    title: `${emoji.emoji} ${emoji.name} Emoji — Copy & Paste`,
    description: `Copy the ${emoji.name} emoji ${emoji.emoji}. Learn its meaning, Unicode code (${emoji.unicode}), and find related emojis.`,
    openGraph: {
      title: `${emoji.emoji} ${emoji.name} Emoji`,
      description: `Copy the ${emoji.name} emoji ${emoji.emoji}. Unicode: ${emoji.unicode}`,
    },
  };
}

export default async function EmojiDetailPage({ params }: Props) {
  const { locale, slug } = await params;
  const dict = await getDictionary(locale as Locale);
  const emoji = getEmojiBySlug(slug);

  if (!emoji) notFound();

  const related = getRelatedEmojis(emoji, 20);
  const skinToneVariants = getSkinToneVariants(emoji);
  const t = dict.emoji;
  const prefix = locale === "en" ? "" : `/${locale}`;

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      {/* Back */}
      <Link
        href={`${prefix}/emoji`}
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        {t.allEmojis}
      </Link>

      {/* Hero */}
      <div className="text-center mb-8">
        <span className="text-8xl sm:text-9xl block mb-4">{emoji.emoji}</span>
        <h1 className="text-2xl font-bold mb-2">{emoji.name}</h1>
        <CopyButton emoji={emoji.emoji} name={emoji.name} />
      </div>

      <Separator className="my-8" />

      {/* Info */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
        <InfoBlock title={t.category}>
          <Link
            href={`${prefix}/emoji?category=${emoji.groupSlug}`}
            className="text-sm hover:underline"
          >
            {emoji.group}
          </Link>
        </InfoBlock>

        <InfoBlock title={t.unicode}>
          <code className="text-sm font-mono bg-muted px-2 py-0.5 rounded">
            {emoji.unicode}
          </code>
        </InfoBlock>

        <InfoBlock title={t.shortcode}>
          <code className="text-sm font-mono bg-muted px-2 py-0.5 rounded break-all inline-block">
            :{emoji.slug.replace(/-/g, "_")}:
          </code>
        </InfoBlock>

        <InfoBlock title={t.skinToneSupport}>
          <span className="text-sm">{emoji.skinToneSupport ? t.skinToneYes : t.skinToneNo}</span>
        </InfoBlock>

        <InfoBlock title={t.emojiVersion}>
          <Badge variant="secondary" className="text-xs">
            {emoji.emojiVersion} · {emoji.year}
          </Badge>
        </InfoBlock>

        <InfoBlock title={t.subgroup}>
          <span className="text-sm">{emoji.subgroup}</span>
        </InfoBlock>
      </div>

      {/* Keywords */}
      <div className="mb-8">
        <h2 className="text-sm font-medium text-muted-foreground mb-2">{t.keywords}</h2>
        <div className="flex flex-wrap gap-1.5">
          {emoji.keywords.map((kw) => (
            <Badge key={kw} variant="secondary" className="text-xs">
              {kw}
            </Badge>
          ))}
        </div>
      </div>

      {/* Skin Tone Variants */}
      {skinToneVariants.length > 0 && (
        <>
          <Separator className="my-8" />
          <div className="mb-8">
            <h2 className="text-lg font-semibold mb-4">{t.skinToneVariants}</h2>
            <div className="flex flex-wrap gap-2">
              <Link
                href={`${prefix}/emoji/${emoji.slug}`}
                className="text-4xl p-3 rounded-xl bg-muted/50 border border-border/50"
                title={emoji.name}
              >
                {emoji.emoji}
              </Link>
              {skinToneVariants.map((v) => (
                <Link
                  key={v.id}
                  href={`${prefix}/emoji/${v.slug}`}
                  className="text-4xl p-3 rounded-xl hover:bg-muted transition-all"
                  title={v.name}
                >
                  {v.emoji}
                </Link>
              ))}
            </div>
          </div>
        </>
      )}

      <Separator className="my-8" />

      {/* Related */}
      {related.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-4">{t.relatedEmojis}</h2>
          <div className="flex flex-wrap gap-1">
            {related.map((r) => (
              <Link
                key={r.id}
                href={`${prefix}/emoji/${r.slug}`}
                className="text-3xl p-2 rounded-xl hover:bg-muted transition-all"
                title={r.name}
              >
                {r.emoji}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function InfoBlock({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="min-w-0">
      <p className="text-xs font-medium text-muted-foreground mb-1">{title}</p>
      {children}
    </div>
  );
}
