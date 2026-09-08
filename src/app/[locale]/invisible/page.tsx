import type { Metadata } from "next";
import { type Locale } from "@/i18n/config";
import { buildAlternates } from "@/lib/seo";
import { InvisibleClient } from "./invisible-client";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: "Invisible Characters — Blank Text Copy & Paste",
    description:
      "Copy & paste invisible characters, zero-width spaces, and blank text. Perfect for empty names in Among Us, Discord, PUBG, and more.",
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
