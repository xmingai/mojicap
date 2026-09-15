import type { Metadata } from "next";
import { type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { buildAlternates } from "@/lib/seo";
import { InvisibleClient } from "./invisible-client";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const dict = await getDictionary(locale as Locale);
  return {
    title: dict.invisible.metaTitle,
    description: dict.invisible.metaDesc,
    alternates: buildAlternates(locale as Locale, "/invisible"),
  };
}

export default function InvisiblePage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <InvisibleClient />
    </div>
  );
}
