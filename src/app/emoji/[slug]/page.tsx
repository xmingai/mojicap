import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getAllSlugs, getEmojiBySlug, getRelatedEmojis, getSkinToneVariants } from "@/lib/emoji";
import { CopyButton } from "./copy-button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft } from "lucide-react";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const slugs = getAllSlugs();
  return slugs.map((slug) => ({ slug }));
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
  const { slug } = await params;
  const emoji = getEmojiBySlug(slug);

  if (!emoji) notFound();

  const related = getRelatedEmojis(emoji, 20);
  const skinToneVariants = getSkinToneVariants(emoji);

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      {/* Back */}
      <Link
        href="/emoji"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        All Emojis
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
        <InfoBlock title="Category">
          <Link
            href={`/emoji?category=${emoji.groupSlug}`}
            className="text-sm hover:underline"
          >
            {emoji.group}
          </Link>
        </InfoBlock>

        <InfoBlock title="Unicode">
          <code className="text-sm font-mono bg-muted px-2 py-0.5 rounded">
            {emoji.unicode}
          </code>
        </InfoBlock>

        <InfoBlock title="Shortcode">
          <code className="text-sm font-mono bg-muted px-2 py-0.5 rounded">
            :{emoji.slug.replace(/-/g, "_")}:
          </code>
        </InfoBlock>

        <InfoBlock title="Skin Tone Support">
          <span className="text-sm">{emoji.skinToneSupport ? "✅ Yes" : "❌ No"}</span>
        </InfoBlock>

        <InfoBlock title="Emoji Version">
          <Badge variant="secondary" className="text-xs">
            {emoji.emojiVersion} · {emoji.year}
          </Badge>
        </InfoBlock>

        <InfoBlock title="Subgroup">
          <span className="text-sm">{emoji.subgroup}</span>
        </InfoBlock>
      </div>

      {/* Keywords */}
      <div className="mb-8">
        <h2 className="text-sm font-medium text-muted-foreground mb-2">Keywords</h2>
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
            <h2 className="text-lg font-semibold mb-4">Skin Tone Variants</h2>
            <div className="flex flex-wrap gap-2">
              <Link
                href={`/emoji/${emoji.slug}`}
                className="text-4xl p-3 rounded-xl bg-muted/50 border border-border/50"
                title={emoji.name}
              >
                {emoji.emoji}
              </Link>
              {skinToneVariants.map((v) => (
                <Link
                  key={v.id}
                  href={`/emoji/${v.slug}`}
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
          <h2 className="text-lg font-semibold mb-4">Related Emojis</h2>
          <div className="flex flex-wrap gap-1">
            {related.map((r) => (
              <Link
                key={r.id}
                href={`/emoji/${r.slug}`}
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
    <div>
      <p className="text-xs font-medium text-muted-foreground mb-1">{title}</p>
      {children}
    </div>
  );
}
