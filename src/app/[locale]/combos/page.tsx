import type { Metadata } from "next";
import { CombosClient } from "./combos-client";
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
    title: dict.combos.metaTitle || dict.combos.title,
    description: dict.combos.metaDesc,
    alternates: buildAlternates(locale as Locale, "/combos"),
  };
}

export default async function CombosPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const dict = await getDictionary(locale as Locale);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <CombosClient />
      {dict.combos.faq && dict.combos.faq.length > 0 && (
        <FAQSection title={dict.combos.faqTitle} faqs={dict.combos.faq} />
      )}
    </div>
  );
}
