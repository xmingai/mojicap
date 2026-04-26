import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { FancyTextClient } from "../fancy-text/fancy-text-client";
import { getDictionary } from "@/i18n/dictionaries";
import { type Locale } from "@/i18n/config";
import { FAQSection } from "@/components/faq-section";
import { TextToolsTabs } from "../fancy-text/text-tools-tabs";

const tools = [
  "glitch-text", "vaporwave-text", "tiny-text", "morse-code", 
  "cursive-text", "old-english-text", "bold-text", "italic-text", 
  "bubble-text", "square-text", "upside-down-text", "strikethrough-text", 
  "leet-speak", "weird-text"
] as const;

function kebabToCamel(str: string) {
  return str.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
}

export async function generateStaticParams() {
  const { locales } = await import("@/i18n/config");
  const params = [];
  for (const locale of locales) {
    for (const textTool of tools) {
      params.push({ locale, textTool });
    }
  }
  return params;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string, textTool: string }>;
}): Promise<Metadata> {
  const { locale, textTool } = await params;
  if (!tools.includes(textTool as any)) return {};
  
  const dict = await getDictionary(locale as Locale);
  const camelKey = kebabToCamel(textTool);
  
  // Safe fallback to English for dictionary values if type is incomplete
  const toolName = (dict.textToolsNav as Record<string, string>)[camelKey] || textTool;
  const toolDesc = (dict.textToolsDesc as Record<string, string>)[textTool] || "";
  
  return {
    title: `${toolName} Generator`,
    description: toolDesc ? `Generate ${toolDesc}.` : "Convert and transform your text.",
  };
}

export default async function SpecificToolPage({
  params,
}: {
  params: Promise<{ locale: string, textTool: string }>;
}) {
  const { locale, textTool } = await params;
  if (!tools.includes(textTool as any)) return notFound();
  
  const dict = await getDictionary(locale as Locale);
  const camelKey = kebabToCamel(textTool);
  
  // Get localized tool name and description
  const toolName = (dict.textToolsNav as Record<string, string>)[camelKey] || textTool;
  const toolDesc = (dict.textToolsDesc as Record<string, string>)[textTool] || "";
  
  // Format the SEO strings using the dictionary templates
  const seo = dict.textToolSeo as any;
  const q1 = seo.q1.replace("{toolName}", toolName);
  const p1_1 = seo.p1_1.replace("{desc}", toolDesc);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <TextToolsTabs />
      
      <div className="space-y-4 text-center mb-10">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
          {toolName} Generator
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Generate {toolDesc}.
        </p>
      </div>

      <FancyTextClient toolMode={textTool} />
      
      {/* Dynamic SEO Article section */}
      <article className="mt-16 max-w-4xl mx-auto space-y-10 text-muted-foreground bg-muted/30 p-8 rounded-2xl border border-border/50">
        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-foreground tracking-tight">{q1}</h2>
          <div className="space-y-4 text-base leading-relaxed">
            <p>{p1_1}</p>
            <p>{seo.p1_2}</p>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-foreground tracking-tight">{seo.q2}</h2>
          <div className="space-y-4 text-base leading-relaxed">
            <p>{seo.p2_1}</p>
            <p>{seo.p2_2}</p>
          </div>
        </section>
      </article>
    </div>
  );
}
