import { getAllEmojis } from "@/lib/emoji";
import { locales } from "@/i18n/config";
import type { MetadataRoute } from "next";

const BASE_URL = "https://www.mojicap.com";

const TOOL_PATHS = [
  { path: "/emoji", changeFrequency: "weekly" as const, priority: 0.9 },
  { path: "/symbols", changeFrequency: "monthly" as const, priority: 0.8 },
  { path: "/fancy-text", changeFrequency: "monthly" as const, priority: 0.8 },
  { path: "/glitch-text", changeFrequency: "monthly" as const, priority: 0.8 },
  { path: "/vaporwave-text", changeFrequency: "monthly" as const, priority: 0.8 },
  { path: "/tiny-text", changeFrequency: "monthly" as const, priority: 0.8 },
  { path: "/morse-code", changeFrequency: "monthly" as const, priority: 0.8 },
  { path: "/cursive-text", changeFrequency: "monthly" as const, priority: 0.8 },
  { path: "/old-english-text", changeFrequency: "monthly" as const, priority: 0.8 },
  { path: "/bold-text", changeFrequency: "monthly" as const, priority: 0.8 },
  { path: "/italic-text", changeFrequency: "monthly" as const, priority: 0.8 },
  { path: "/bubble-text", changeFrequency: "monthly" as const, priority: 0.8 },
  { path: "/square-text", changeFrequency: "monthly" as const, priority: 0.8 },
  { path: "/upside-down-text", changeFrequency: "monthly" as const, priority: 0.8 },
  { path: "/strikethrough-text", changeFrequency: "monthly" as const, priority: 0.8 },
  { path: "/leet-speak", changeFrequency: "monthly" as const, priority: 0.8 },
  { path: "/weird-text", changeFrequency: "monthly" as const, priority: 0.8 },
  { path: "/combos", changeFrequency: "weekly" as const, priority: 0.8 },
  { path: "/kaomoji", changeFrequency: "monthly" as const, priority: 0.8 },
  { path: "/dividers", changeFrequency: "monthly" as const, priority: 0.7 },
  { path: "/invisible", changeFrequency: "monthly" as const, priority: 0.7 },
  { path: "/braille", changeFrequency: "monthly" as const, priority: 0.7 },
  { path: "/ascii-art", changeFrequency: "monthly" as const, priority: 0.7 },
  { path: "/about", changeFrequency: "yearly" as const, priority: 0.6 },
  { path: "/privacy", changeFrequency: "yearly" as const, priority: 0.3 },
  { path: "/terms", changeFrequency: "yearly" as const, priority: 0.3 },
];

/** Build hreflang alternates map for a given path */
function buildAlternates(path: string) {
  return {
    languages: Object.fromEntries(
      locales.map((l) => [l, `${BASE_URL}${l === "en" ? "" : `/${l}`}${path}`])
    ),
  };
}

export default function sitemap(): MetadataRoute.Sitemap {
  const emojis = getAllEmojis();
  const now = new Date();

  const entries: MetadataRoute.Sitemap = [];

  // Homepage for each locale
  for (const locale of locales) {
    const prefix = locale === "en" ? "" : `/${locale}`;
    entries.push({
      url: `${BASE_URL}${prefix || "/"}`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: locale === "en" ? 1.0 : 0.9,
      alternates: buildAlternates("/"),
    });
  }

  // Tool pages for each locale
  for (const tool of TOOL_PATHS) {
    for (const locale of locales) {
      const prefix = locale === "en" ? "" : `/${locale}`;
      entries.push({
        url: `${BASE_URL}${prefix}${tool.path}`,
        lastModified: now,
        changeFrequency: tool.changeFrequency,
        priority: locale === "en" ? tool.priority : tool.priority - 0.1,
        alternates: buildAlternates(tool.path),
      });
    }
  }

  // Emoji detail pages for each locale
  for (const emoji of emojis) {
    for (const locale of locales) {
      const prefix = locale === "en" ? "" : `/${locale}`;
      entries.push({
        url: `${BASE_URL}${prefix}/emoji/${emoji.slug}`,
        lastModified: now,
        changeFrequency: "monthly",
        priority: locale === "en" ? 0.6 : 0.5,
        alternates: buildAlternates(`/emoji/${emoji.slug}`),
      });
    }
  }

  return entries;
}
