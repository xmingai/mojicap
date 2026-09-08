import type { Metadata } from "next";
import { KaomojiClient } from "./kaomoji-client";
import { getDictionary } from "@/i18n/dictionaries";
import { type Locale } from "@/i18n/config";
import { buildAlternates } from "@/lib/seo";
import { FAQSection } from "@/components/faq-section";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const dict = await getDictionary(locale as Locale);
  return {
    title: dict.kaomoji.metaTitle || dict.kaomoji.title,
    description: dict.kaomoji.metaDesc,
    alternates: buildAlternates(locale as Locale, "/kaomoji"),
  };
}

export default async function KaomojiPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const dict = await getDictionary(locale as Locale);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <KaomojiClient />
      {dict.kaomoji.faq && dict.kaomoji.faq.length > 0 && (
        <FAQSection title={dict.kaomoji.faqTitle} faqs={dict.kaomoji.faq} />
      )}
    </div>
  );
}
