import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { notFound } from "next/navigation";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/theme-provider";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { ScrollToTop } from "@/components/scroll-to-top";
import { VormlyBanner } from "@/components/ads/vormly-banner";
import { VormlyPopup } from "@/components/ads/vormly-popup";
import { I18nProvider } from "@/i18n/context";
import { locales, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { SITE_URL } from "@/lib/seo";
import { GoogleAnalytics } from "@next/third-parties/google";
import { Analytics } from "@vercel/analytics/next";
import "../globals.css";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin", "cyrillic", "latin-ext"],
});

export async function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const dict = await getDictionary(locale as Locale);

  return {
    metadataBase: new URL(SITE_URL),
    title: {
      default: dict.meta.title,
      template: "%s | MojiCap",
    },
    description: dict.meta.description,
    // No `keywords`: Google has ignored the meta keywords tag since 2009, and a
    // single site-wide list only publishes the keyword strategy to competitors.
    openGraph: {
      // No `title`/`description` here on purpose — Next.js would apply them to
      // every child page, so each page's own title would never reach og:title.
      // Pages set their own; the site name and type are safe to inherit.
      type: "website",
      locale: locale,
      siteName: "MojiCap",
    },
    twitter: {
      // Card type only; per-page title/description come from each page's metadata.
      card: "summary_large_image",
    },
    robots: {
      index: true,
      follow: true,
    },
    // No `alternates` here on purpose: Next.js replaces that object wholesale,
    // so a layout-level canonical would be inherited by every page. Each page
    // sets its own via buildAlternates() in src/lib/seo.ts.
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  // Validate locale
  if (!locales.includes(locale as Locale)) {
    notFound();
  }

  const dict = await getDictionary(locale as Locale);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "MojiCap",
    "url": `${SITE_URL}/`,
    "potentialAction": {
      "@type": "SearchAction",
      "target": `${SITE_URL}/emoji/?q={search_term_string}`,
      "query-input": "required name=search_term_string"
    }
  };

  return (
    <html lang={locale} suppressHydrationWarning className={`${inter.variable} h-full`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-full flex flex-col font-sans antialiased">
        <ThemeProvider>
          <I18nProvider locale={locale as Locale} dict={dict}>
            <TooltipProvider>
              <div className="sticky top-0 z-50">
                <VormlyBanner />
                <Navbar />
              </div>
              <main className="flex-1">{children}</main>
              <Footer />
              <ScrollToTop />
              <Toaster />
              <VormlyPopup />
            </TooltipProvider>
          </I18nProvider>
        </ThemeProvider>
        {process.env.NEXT_PUBLIC_GA_ID && <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID} />}
        {/* Vercel Web Analytics: cookieless page views + custom events; independent cross-check for GA4 */}
        <Analytics />
      </body>
    </html>
  );
}
