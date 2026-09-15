import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { buildAlternates } from "@/lib/seo";
import { MEMBERSHIP_UI_ENABLED } from "@/lib/membership/config";
import { FAQSection } from "@/components/faq-section";
import { PricingClient } from "./pricing-client";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  if (!MEMBERSHIP_UI_ENABLED) return {};
  const { locale } = await params;
  const dict = await getDictionary(locale as Locale);
  return {
    title: dict.plus.metaTitle,
    description: dict.plus.metaDesc,
    openGraph: { title: dict.plus.metaTitle, description: dict.plus.metaDesc },
    twitter: { title: dict.plus.metaTitle, description: dict.plus.metaDesc },
    alternates: buildAlternates(locale as Locale, "/pricing"),
  };
}

export default async function PricingPage({ params }: { params: Promise<{ locale: string }> }) {
  // Never publish a page that sells a feature this deployment hasn't switched on.
  if (!MEMBERSHIP_UI_ENABLED) notFound();
  const { locale } = await params;
  const dict = await getDictionary(locale as Locale);
  return (
    <div className="mx-auto max-w-5xl px-4 py-12 md:py-16">
      <PricingClient />
      <FAQSection title={dict.plus.faqTitle} faqs={dict.plus.faq} />
    </div>
  );
}
