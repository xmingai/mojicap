import type { Metadata } from "next";
import { type Locale } from "@/i18n/config";
import { buildAlternates } from "@/lib/seo";
import { GOVERNING_LAW, LEGAL_NAME, LEGAL_UPDATED, SUPPORT_EMAIL } from "@/lib/legal";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: "Terms of Service",
    description:
      "The agreement for using MojiCap: what the free tools are, acceptable use, warranties and liability.",
    alternates: buildAlternates(locale as Locale, "/terms"),
  };
}

function Section({ n, title, children }: { n: number; title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-3">
      <h2 className="text-xl font-semibold text-foreground">
        {n}. {title}
      </h2>
      {children}
    </section>
  );
}

export default function TermsPage() {
  const mailto = `mailto:${SUPPORT_EMAIL}`;

  return (
    <div className="mx-auto max-w-3xl px-4 py-16">
      <h1 className="text-3xl font-bold mb-8">Terms of Service</h1>

      <div className="space-y-6 text-muted-foreground">
        <section>
          <p>Last updated: {LEGAL_UPDATED}</p>
          <p className="mt-4">
            These Terms are an agreement between you and {LEGAL_NAME}, an individual trader operating MojiCap at
            www.mojicap.com (&ldquo;MojiCap&rdquo;, &ldquo;we&rdquo;, &ldquo;us&rdquo;). By using the site you agree to
            them. If you do not agree, please stop using the site.
          </p>
        </section>

        <Section n={1} title="What MojiCap is">
          <p>
            MojiCap is a browser tool for copying emoji, symbols, kaomoji, emoji combos, text dividers, invisible characters,
            Braille and ASCII art, and for converting text into Unicode styles. The tools run in your browser, are free to use
            and need no account. The site is funded by advertising.
          </p>
          <p>We may change, suspend or discontinue parts of the service.</p>
        </Section>

        <Section n={2} title="Your content and Unicode characters">
          <p>
            Text you type into the tools stays in your browser; we do not claim any rights over it. The emoji, kaomoji, symbols
            and text styles offered by MojiCap are Unicode characters, which nobody owns — you may use what you copy for any
            lawful purpose, personal or commercial, without crediting us.
          </p>
          <p>
            How a character looks depends on the font and platform where you paste it, and some apps replace or strip
            characters. We cannot guarantee a particular appearance anywhere outside MojiCap.
          </p>
        </Section>

        <Section n={3} title="Acceptable use">
          <p>
            Do not use MojiCap to harass, threaten or impersonate anyone, to send spam, to break the law, or to interfere with
            the site — for example by scraping at a rate that degrades it for others. We may block access from anyone who does
            any of this.
          </p>
        </Section>

        <Section n={4} title="The site is provided as is">
          <p>
            MojiCap is provided &ldquo;as is&rdquo; and &ldquo;as available&rdquo;. We do not promise that it will be
            uninterrupted or error-free, and we give no warranties beyond those that cannot be excluded by law. Nothing here
            limits your statutory rights as a consumer.
          </p>
        </Section>

        <Section n={5} title="Limitation of liability">
          <p>
            To the extent permitted by law, we are not liable for any claim connected with MojiCap beyond what cannot be excluded
            by law. We are not liable for indirect or consequential
            loss, or for loss of data you did not keep a copy of elsewhere.
          </p>
        </Section>

        <Section n={6} title="Changes to these Terms">
          <p>
            We may update these Terms. The new version applies from the date shown at the top of this page. Continuing to use MojiCap after that date means you accept the change.
          </p>
        </Section>

        <Section n={7} title="Governing law">
          <p>
            These Terms are governed by {GOVERNING_LAW}. Disputes will be submitted to the court with jurisdiction at the
            operator&rsquo;s place of residence, without affecting any mandatory consumer protection you have where you live.
          </p>
        </Section>

        <Section n={8} title="Contact">
          <p>
            {LEGAL_NAME} — <a href={mailto} className="text-primary hover:underline">{SUPPORT_EMAIL}</a>. We answer within two
            business days.
          </p>
        </Section>
      </div>
    </div>
  );
}
