import type { Metadata } from "next";
import { type Locale } from "@/i18n/config";
import { buildAlternates } from "@/lib/seo";
import { DividersClient } from "./dividers-client";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: "Text Dividers & Borders — Copy & Paste Line Separators",
    description:
      "Aesthetic text dividers, line separators, and borders to copy & paste. Perfect for Notion, Tumblr, Amino, Instagram, and Discord formatting.",
    alternates: buildAlternates(locale as Locale, "/dividers"),
  };
}

export default function DividersPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <DividersClient />
    </div>
  );
}
