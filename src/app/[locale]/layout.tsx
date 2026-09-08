import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { notFound } from "next/navigation";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/theme-provider";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { ScrollToTop } from "@/components/scroll-to-top";
import { I18nProvider } from "@/i18n/context";
import { locales, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { SITE_URL } from "@/lib/seo";
import { GoogleAnalytics } from "@next/third-parties/google";
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
    keywords: [
      "emoji",
      "emoji copy paste",
      "emoji keyboard",
      "special symbols",
      "fancy text generator",
      "emoji combos",
      "unicode symbols",
      "text symbols",
    ],
    openGraph: {
      title: dict.meta.title,
      description: dict.meta.description,
      type: "website",
      locale: locale,
      siteName: "MojiCap",
    },
    twitter: {
      card: "summary_large_image",
      title: dict.meta.title,
      description: dict.meta.description,
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
              <Navbar />
              <main className="flex-1">{children}</main>
              <Footer />
              <ScrollToTop />
              <Toaster />
            </TooltipProvider>
          </I18nProvider>
        </ThemeProvider>
        {process.env.NEXT_PUBLIC_GA_ID && <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID} />}
      </body>
    </html>
  );
}
