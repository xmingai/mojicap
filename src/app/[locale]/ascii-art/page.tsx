import type { Metadata } from "next";
import { type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { buildAlternates } from "@/lib/seo";
import { AsciiArtClient } from "./ascii-art-client";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const dict = await getDictionary(locale as Locale);
  return {
    title: dict.asciiArt.metaTitle,
    description: dict.asciiArt.metaDesc,
    alternates: buildAlternates(locale as Locale, "/ascii-art"),
  };
}

export default function AsciiArtPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <AsciiArtClient />
    </div>
  );
}
