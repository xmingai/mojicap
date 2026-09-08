import { locales, defaultLocale, type Locale } from "@/i18n/config";

export const SITE_URL = "https://www.mojicap.com";

function normalizePath(path: string): string {
  const withLeading = path.startsWith("/") ? path : `/${path}`;
  // next.config.ts sets trailingSlash: true, so every canonical/sitemap URL must end with "/"
  return withLeading.endsWith("/") ? withLeading : `${withLeading}/`;
}

/**
 * Locale-free route for comparisons: "/en/emoji/", "/zh/emoji/", "/emoji/" → "/emoji"; "/", "/zh/" → "/".
 * Needed because usePathname() returns the proxy-rewritten path ("/en/emoji/") on a
 * fresh load of an unprefixed URL, but the browser path ("/emoji/") after client navigation.
 */
export function pathWithoutLocale(pathname: string): string {
  let path = pathname;
  for (const locale of locales) {
    if (path === `/${locale}` || path.startsWith(`/${locale}/`)) {
      path = path.slice(locale.length + 1);
      break;
    }
  }
  if (path.length > 1 && path.endsWith("/")) path = path.slice(0, -1);
  return path || "/";
}

/** Locale-prefixed path without origin. en → "/emoji/", zh → "/zh/emoji/" */
export function localePath(locale: Locale, path = "/"): string {
  const normalized = normalizePath(path);
  return locale === defaultLocale ? normalized : `/${locale}${normalized}`;
}

/** Absolute URL for a locale + path. */
export function absoluteUrl(locale: Locale, path = "/"): string {
  return `${SITE_URL}${localePath(locale, path)}`;
}

/** hreflang map for a path across all locales, plus x-default → English. */
export function hreflangLanguages(path = "/"): Record<string, string> {
  return {
    ...Object.fromEntries(locales.map((l) => [l, absoluteUrl(l, path)])),
    "x-default": absoluteUrl(defaultLocale, path),
  };
}

/**
 * `alternates` block for generateMetadata. Every page must call this itself:
 * Next.js replaces `alternates` as a whole object, so a layout-level canonical
 * would otherwise be inherited verbatim by every child page.
 */
export function buildAlternates(locale: Locale, path = "/") {
  return {
    canonical: absoluteUrl(locale, path),
    languages: hreflangLanguages(path),
  };
}
