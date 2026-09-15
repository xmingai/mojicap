/**
 * Sitemap contents, kept to what search engines actually use.
 *
 * Per the sitemaps.org protocol only <loc> is required. Google ignores
 * <priority> and <changefreq>, and only trusts <lastmod> when it reflects real
 * content changes — a build timestamp on every URL would not — so none of the
 * three are emitted. hreflang lives in each page's <head> (buildAlternates in
 * seo.ts, including x-default); repeating it here made the files ~10× larger
 * for no extra signal.
 *
 * Files: /sitemap.xml (index) → /sitemaps/pages.xml (home + tools, every
 * locale) and /sitemaps/emoji-<locale>.xml, one per language so Search Console
 * reports indexing coverage per locale.
 */

import { locales, type Locale } from "@/i18n/config";
import { getBaseEmojis } from "@/lib/emoji";
import { MEMBERSHIP_UI_ENABLED } from "@/lib/membership/config";
import { absoluteUrl, SITE_URL } from "@/lib/seo";
import { TEXT_TOOLS } from "@/lib/tool-routes";

// Everything indexable besides emoji detail pages. /account is private and never listed.
const PAGE_PATHS = [
  "/",
  "/emoji",
  "/symbols",
  ...TEXT_TOOLS.map((t) => `/${t.slug}`),
  "/combos",
  "/kaomoji",
  "/dividers",
  "/invisible",
  "/braille",
  "/ascii-art",
  "/about",
  "/privacy",
  "/terms",
  // /pricing exists only while membership is switched on.
  ...(MEMBERSHIP_UI_ENABLED ? ["/pricing"] : []),
];

export const SITEMAP_FILES = ["pages.xml", ...locales.map((l) => `emoji-${l}.xml`)];

export function sitemapUrls(file: string): string[] | null {
  if (file === "pages.xml") return PAGE_PATHS.flatMap((path) => locales.map((locale) => absoluteUrl(locale, path)));
  const locale = file.match(/^emoji-([a-z]{2})\.xml$/)?.[1] as Locale | undefined;
  if (!locale || !locales.includes(locale)) return null;
  // Skin-tone variants canonicalise to their base emoji, so only base emoji are listed.
  return getBaseEmojis().map((emoji) => absoluteUrl(locale, `/emoji/${emoji.slug}`));
}

const escapeXml = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");

export function urlsetXml(urls: string[]): string {
  const body = urls.map((url) => `<url><loc>${escapeXml(url)}</loc></url>`).join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>\n`;
}

export function sitemapIndexXml(): string {
  const body = SITEMAP_FILES.map((file) => `<sitemap><loc>${SITE_URL}/sitemaps/${file}</loc></sitemap>`).join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</sitemapindex>\n`;
}

export const XML_HEADERS = { "Content-Type": "application/xml; charset=utf-8" };
