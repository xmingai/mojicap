import type { Metadata } from "next";
import { type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { buildAlternates } from "@/lib/seo";
import { BrailleClient } from "./braille-client";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const dict = await getDictionary(locale as Locale);
  return {
    title: dict.braille.metaTitle,
    description: dict.braille.metaDesc,
    alternates: buildAlternates(locale as Locale, "/braille"),
  };
}

export default function BraillePage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <BrailleClient />
    </div>
  );
}
