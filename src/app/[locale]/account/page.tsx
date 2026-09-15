import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { MEMBERSHIP_UI_ENABLED } from "@/lib/membership/config";
import { AccountClient } from "./account-client";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const dict = await getDictionary(locale as Locale);
  // A personal page: never indexed, never in the sitemap.
  return { title: dict.account.metaTitle, robots: { index: false, follow: false } };
}

export default function AccountPage() {
  if (!MEMBERSHIP_UI_ENABLED) notFound();
  return (
    <div className="mx-auto max-w-2xl px-4 py-12 md:py-16">
      <AccountClient />
    </div>
  );
}
