import { type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const dict = await getDictionary(locale as Locale);
  return {
    title: `${dict.footer.about} | MojiCap`,
    description: dict.footer.description,
  };
}

export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const dict = await getDictionary(locale as Locale);

  return (
    <div className="mx-auto max-w-4xl px-4 py-16 md:py-24">
      <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-8 text-center">
        {dict.footer.about}
      </h1>
      
      <div className="prose prose-neutral dark:prose-invert max-w-none space-y-8">
        <section className="bg-muted/30 p-8 rounded-2xl border border-border/50">
          <h2 className="text-2xl font-bold mt-0 mb-4">What is MojiCap?</h2>
          <p className="text-muted-foreground leading-relaxed">
            MojiCap is a comprehensive suite of text styling tools and symbol generators designed for the modern internet. Our goal is to make it incredibly easy to copy, paste, and express yourself with unique typography across any platform—whether it's Discord, TikTok, Instagram, Twitter, or your favorite online games.
          </p>
        </section>

        <section className="bg-muted/30 p-8 rounded-2xl border border-border/50">
          <h2 className="text-2xl font-bold mt-0 mb-4">What Do We Offer?</h2>
          <ul className="space-y-3 text-muted-foreground list-disc list-inside">
            <li><strong>Text Generators:</strong> From Vaporwave and Glitch text to Cursive and Old English, our text transformers instantly convert your standard input into aesthetic Unicode characters that can be pasted anywhere.</li>
            <li><strong>Emoji & Kaomoji:</strong> Access thousands of neatly categorized standard emojis, cute Japanese text emoticons (Kaomoji), and creative emoji combos perfect for social media bios.</li>
            <li><strong>Special Symbols:</strong> A curated library of arrows, stars, math symbols, bullet points, and aesthetic dividers to make your profiles stand out.</li>
            <li><strong>Utility Tools:</strong> Need to translate Morse code, generate invisible characters, or create ASCII art? We have dedicated tools for that, all entirely free and client-side.</li>
          </ul>
        </section>

        <section className="bg-muted/30 p-8 rounded-2xl border border-border/50">
          <h2 className="text-2xl font-bold mt-0 mb-4">Why Use Unicode?</h2>
          <p className="text-muted-foreground leading-relaxed">
            Unlike traditional fonts (.ttf or .otf files) that need to be installed on a device to be visible, our text generators use specific ranges of the Unicode character standard. This means the <em>styles</em> are inherently baked into the characters themselves. As long as a website or app supports Unicode (which almost all modern platforms do), your styled text will appear exactly as generated, no matter who is viewing it.
          </p>
        </section>
      </div>
    </div>
  );
}
