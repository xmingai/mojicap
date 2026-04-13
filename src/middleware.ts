import { NextRequest, NextResponse } from "next/server";
import { locales, defaultLocale, type Locale } from "@/i18n/config";

function getLocaleFromHeaders(request: NextRequest): Locale {
  const acceptLanguage = request.headers.get("accept-language") || "";
  const languages = acceptLanguage
    .split(",")
    .map((lang) => {
      const [code, q] = lang.trim().split(";q=");
      return { code: code.split("-")[0].toLowerCase(), quality: q ? parseFloat(q) : 1 };
    })
    .sort((a, b) => b.quality - a.quality);

  for (const lang of languages) {
    if (locales.includes(lang.code as Locale)) {
      return lang.code as Locale;
    }
  }
  return defaultLocale;
}

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Skip static files, api routes, and Next.js internals
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // Check if pathname already has a locale prefix
  const pathnameHasLocale = locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );

  if (pathnameHasLocale) {
    return NextResponse.next();
  }

  // No locale prefix — determine which locale to use
  const cookieLocale = request.cookies.get("NEXT_LOCALE")?.value as Locale | undefined;
  const locale = cookieLocale && locales.includes(cookieLocale)
    ? cookieLocale
    : getLocaleFromHeaders(request);

  // Rewrite to the locale path (not redirect, preserving clean URLs for default locale)
  if (locale === defaultLocale) {
    // For default locale: rewrite /emoji → /en/emoji internally
    const newUrl = new URL(`/${defaultLocale}${pathname}`, request.url);
    newUrl.search = request.nextUrl.search;
    return NextResponse.rewrite(newUrl);
  }

  // For non-default locales: rewrite (not redirect) to preserve clean URLs
  // This prevents Google from seeing 302 redirects on sitemap-declared URLs
  const newUrl = new URL(`/${locale}${pathname}`, request.url);
  newUrl.search = request.nextUrl.search;
  return NextResponse.rewrite(newUrl);
}

export const config = {
  matcher: ["/((?!_next|api|.*\\..*).*)"],
};
