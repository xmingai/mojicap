import type { MetadataRoute } from "next";
import { getBaseEmojis } from "@/lib/emoji";
import { locales } from "@/i18n/config";
import { absoluteUrl, hreflangLanguages } from "@/lib/seo";
import { TEXT_TOOLS } from "@/lib/tool-routes";

/**
 * Split sitemaps (Google caps a single file at 50,000 URLs / 50 MB):
 *   id 0      → home + tool pages, all locales
 *   id 1..N   → emoji detail pages, one file per locale
 * The index that lists them lives at /sitemap.xml (src/app/sitemap.xml/route.ts).
 */
export function generateSitemaps() {
  return [{ id: 0 }, ...locales.map((_, i) => ({ id: i + 1 }))];
}

const TOOL_PATHS: { path: string; changeFrequency: "weekly" | "monthly" | "yearly"; priority: number }[] = [
  { path: "/emoji", changeFrequency: "weekly", priority: 0.9 },
  { path: "/symbols", changeFrequency: "monthly", priority: 0.8 },
  ...TEXT_TOOLS.map((t) => ({ path: `/${t.slug}`, changeFrequency: "monthly" as const, priority: 0.8 })),
  { path: "/combos", changeFrequency: "weekly", priority: 0.8 },
  { path: "/kaomoji", changeFrequency: "monthly", priority: 0.8 },
  { path: "/dividers", changeFrequency: "monthly", priority: 0.7 },
  { path: "/invisible", changeFrequency: "monthly", priority: 0.7 },
  { path: "/braille", changeFrequency: "monthly", priority: 0.7 },
  { path: "/ascii-art", changeFrequency: "monthly", priority: 0.7 },
  { path: "/about", changeFrequency: "yearly", priority: 0.6 },
  { path: "/privacy", changeFrequency: "yearly", priority: 0.3 },
  { path: "/terms", changeFrequency: "yearly", priority: 0.3 },
];

// No lastModified: a build-time "now" on every URL tells crawlers nothing useful.
export default async function sitemap({ id }: { id: Promise<string> }): Promise<MetadataRoute.Sitemap> {
  const index = Number(await id);

  if (index === 0) {
    const entries: MetadataRoute.Sitemap = [];
    for (const locale of locales) {
      entries.push({
        url: absoluteUrl(locale, "/"),
        changeFrequency: "weekly",
        priority: locale === "en" ? 1.0 : 0.9,
        alternates: { languages: hreflangLanguages("/") },
      });
    }
    for (const tool of TOOL_PATHS) {
      for (const locale of locales) {
        entries.push({
          url: absoluteUrl(locale, tool.path),
          changeFrequency: tool.changeFrequency,
          priority: locale === "en" ? tool.priority : tool.priority - 0.1,
          alternates: { languages: hreflangLanguages(tool.path) },
        });
      }
    }
    return entries;
  }

  const locale = locales[index - 1];
  if (!locale) return [];

  // Skin-tone variants canonicalise to their base emoji, so listing them here
  // would advertise ~1,875 non-canonical URLs per locale and waste crawl budget.
  return getBaseEmojis().map((emoji) => {
    const path = `/emoji/${emoji.slug}`;
    return {
      url: absoluteUrl(locale, path),
      changeFrequency: "monthly" as const,
      priority: locale === "en" ? 0.6 : 0.5,
      alternates: { languages: hreflangLanguages(path) },
    };
  });
}
