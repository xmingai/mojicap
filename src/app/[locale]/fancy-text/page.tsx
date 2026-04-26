import type { Metadata } from "next";
import { FancyTextClient } from "./fancy-text-client";
import { getDictionary } from "@/i18n/dictionaries";
import { type Locale } from "@/i18n/config";
import { TextToolsTabs } from "./text-tools-tabs";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const dict = await getDictionary(locale as Locale);
  return {
    title: dict.fancyText.metaTitle || dict.fancyText.title,
    description: dict.fancyText.metaDesc,
  };
}

export default async function FancyTextPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const dict = await getDictionary(locale as Locale);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <TextToolsTabs />
      <div className="space-y-4 text-center mb-10">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
          {dict.fancyText.title}
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          {dict.fancyText.metaDesc}
        </p>
      </div>
      <FancyTextClient />

      {/* SEO Article inspired by LingoJam strategy */}
      {dict.fancyText.seoArticle && (
        <article className="mt-16 max-w-4xl mx-auto space-y-10 text-muted-foreground bg-muted/30 p-8 rounded-2xl border border-border/50">
          {(dict.fancyText.seoArticle as any).sections.map((section: any, index: number) => (
            <section key={index} className="space-y-4">
              <h2 className="text-2xl font-bold text-foreground tracking-tight">{section.title}</h2>
              <div className="space-y-4 text-base leading-relaxed">
                {section.paragraphs.map((p: string, i: number) => (
                  <p key={i}>{p}</p>
                ))}
              </div>
            </section>
          ))}
        </article>
      )}
    </div>
  );
}
