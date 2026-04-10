import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/theme-provider";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import "./globals.css";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "EmojiKit — Copy & Paste Emojis, Symbols & Fancy Text",
    template: "%s | EmojiKit",
  },
  description:
    "The fastest and most beautiful emoji tool on the web. Copy and paste emojis, special symbols, fancy text, and emoji combos instantly.",
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
    title: "EmojiKit — Copy & Paste Emojis, Symbols & Fancy Text",
    description:
      "The fastest and most beautiful emoji tool on the web. Copy and paste emojis, special symbols, fancy text, and emoji combos instantly.",
    type: "website",
    locale: "en_US",
    siteName: "EmojiKit",
  },
  twitter: {
    card: "summary_large_image",
    title: "EmojiKit — Copy & Paste Emojis, Symbols & Fancy Text",
    description:
      "The fastest and most beautiful emoji tool on the web.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={`${inter.variable} h-full`}>
      <body className="min-h-full flex flex-col font-sans antialiased">
        <ThemeProvider>
          <TooltipProvider>
            <Navbar />
            <main className="flex-1">{children}</main>
            <Footer />
            <Toaster />
          </TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
