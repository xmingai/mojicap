import type { Metadata } from "next";
import { getBaseEmojisLite, getCategories, getEmojiVersions } from "@/lib/emoji";
import { EmojiGrid } from "@/components/emoji-grid";
import { FAQSection } from "@/components/faq-section";
import { getDictionary } from "@/i18n/dictionaries";
import { type Locale } from "@/i18n/config";
import { buildAlternates } from "@/lib/seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const dict = await getDictionary(locale as Locale);
  return {
    title: dict.emoji.metaTitle,
    description: dict.emoji.metaDesc,
    alternates: buildAlternates(locale as Locale, "/emoji"),
  };
}

export default async function EmojiPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const dict = await getDictionary(locale as Locale);
  const baseEmojis = getBaseEmojisLite();
  const categories = getCategories();
  const versions = getEmojiVersions();

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <EmojiGrid emojis={baseEmojis} categories={categories} versions={versions} />
      {dict.emoji.faq && dict.emoji.faq.length > 0 && (
        <FAQSection title={dict.emoji.faqTitle} faqs={dict.emoji.faq} />
      )}
    </div>
  );
}
