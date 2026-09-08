import type { Metadata } from "next";
import { type Locale } from "@/i18n/config";
import { buildAlternates } from "@/lib/seo";
import { BrailleClient } from "./braille-client";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: "Braille & Morse Code Translator — Text to Braille Generator",
    description:
      "Convert regular text into Braille dots or Morse code dots and dashes instantly. Copy and paste the results anywhere.",
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
