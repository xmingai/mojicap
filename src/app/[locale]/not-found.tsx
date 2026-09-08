"use client";

import Link from "next/link";
import { Home } from "lucide-react";
import { useDict, useLocale } from "@/i18n/context";
import { defaultLocale } from "@/i18n/config";

export default function NotFound() {
  const dict = useDict();
  const locale = useLocale();
  const prefix = locale === defaultLocale ? "" : `/${locale}`;
  const t = dict.notFound;

  return (
    <div className="mx-auto max-w-2xl px-4 py-24 text-center">
      <p className="text-8xl mb-6 select-none">🫥</p>
      <h1 className="text-4xl font-bold tracking-tight mb-3">{t.title}</h1>
      <p className="text-lg text-muted-foreground mb-8">{t.description}</p>
      <Link
        href={prefix || "/"}
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-foreground text-background text-sm font-semibold hover:bg-foreground/90 transition-colors"
      >
        <Home className="h-4 w-4" />
        {t.backHome}
      </Link>
    </div>
  );
}
