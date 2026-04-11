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

  const prefix = locale === "en" ? "" : `/${locale}`;

  return {
    metadataBase: new URL("https://www.mojicap.com"),
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
    alternates: {
      canonical: prefix || "/",
      languages: Object.fromEntries(
        locales.map((l) => [l, l === "en" ? "/" : `/${l}`])
      ),
    },
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
  const prefix = locale === "en" ? "" : `/${locale}`;
  const baseUrl = `https://www.mojicap.com${prefix}`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "MojiCap",
    "url": "https://www.mojicap.com/",
    "potentialAction": {
      "@type": "SearchAction",
      "target": "https://www.mojicap.com/emoji?q={search_term_string}",
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
      </body>
    </html>
  );
}
