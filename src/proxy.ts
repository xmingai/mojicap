import { NextRequest, NextResponse } from "next/server";
import { locales, defaultLocale, type Locale } from "@/i18n/config";

/**
 * URL strategy (must stay in sync with src/lib/seo.ts and the sitemap):
 *   /emoji/      → English, always. Internally rewritten to /en/emoji/.
 *   /zh/emoji/   → Chinese.
 *   /en/emoji/   → 308 to /emoji/ so the default locale has exactly one URL.
 *
 * Unprefixed URLs are never varied by Accept-Language: search engines and CDN
 * caches must see the same content for the same URL. The only automatic
 * redirect is for a visitor who explicitly picked another language in the
 * switcher (NEXT_LOCALE cookie), which crawlers never send.
 */
const CANONICAL_HOST = "www.mojicap.com";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const defaultPrefix = `/${defaultLocale}`;

  // On the production deployment only, collapse the *.vercel.app alias onto the
  // canonical host so search engines never index a duplicate origin. Gated to
  // VERCEL_ENV=production so preview deployments keep working on their own URLs.
  if (process.env.VERCEL_ENV === "production") {
    const host = request.headers.get("host") ?? "";
    if (host && host !== CANONICAL_HOST) {
      const url = request.nextUrl.clone();
      url.host = CANONICAL_HOST;
      url.port = "";
      url.protocol = "https:";
      return NextResponse.redirect(url, 308);
    }
  }

  // /en and /en/... → strip the prefix (permanent redirect)
  if (pathname === defaultPrefix || pathname.startsWith(`${defaultPrefix}/`)) {
    const url = request.nextUrl.clone();
    url.pathname = pathname.slice(defaultPrefix.length) || "/";
    return NextResponse.redirect(url, 308);
  }

  // Already prefixed with a supported non-default locale → serve as-is
  const hasLocalePrefix = locales.some(
    (locale) => pathname === `/${locale}` || pathname.startsWith(`/${locale}/`)
  );
  if (hasLocalePrefix) {
    return NextResponse.next();
  }

  // Visitor explicitly chose another language earlier → send them to it
  const cookieLocale = request.cookies.get("NEXT_LOCALE")?.value;
  if (
    cookieLocale &&
    cookieLocale !== defaultLocale &&
    locales.includes(cookieLocale as Locale)
  ) {
    const url = request.nextUrl.clone();
    url.pathname = `/${cookieLocale}${pathname}`;
    return NextResponse.redirect(url, 307);
  }

  // Unprefixed → English, URL unchanged
  const url = request.nextUrl.clone();
  url.pathname = `${defaultPrefix}${pathname}`;
  return NextResponse.rewrite(url);
}

export const config = {
  // Skip Next internals, API routes and anything with a file extension (sitemap.xml, robots.txt, images…)
  matcher: ["/((?!_next|api|.*\\..*).*)"],
};
