import type { Metadata } from "next";
import { type Locale } from "@/i18n/config";
import { buildAlternates } from "@/lib/seo";
import { AsciiArtClient } from "./ascii-art-client";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: "ASCII Art — Text Art Copy & Paste",
    description:
      "Copy and paste large text pictures, one-line ascii weapons, animals, and retro text art for comments and chat.",
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
