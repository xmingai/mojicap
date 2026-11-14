import type { Metadata } from "next";
import { type Locale } from "@/i18n/config";
import { buildAlternates } from "@/lib/seo";
import { LEGAL_NAME, LEGAL_UPDATED, SUPPORT_EMAIL } from "@/lib/legal";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: "Privacy Policy",
    description:
      "What MojiCap collects, what stays in your browser, how analytics and advertising cookies are used, how long data is kept, and the rights you have over it.",
    alternates: buildAlternates(locale as Locale, "/privacy"),
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

const row = "border-t border-border/60 align-top [&>td]:py-2 [&>td]:pr-4";

export default function PrivacyPage() {
  const mailto = `mailto:${SUPPORT_EMAIL}`;
  const link = "text-primary hover:underline";

  return (
    <div className="mx-auto max-w-3xl px-4 py-16">
      <h1 className="text-3xl font-bold mb-8">Privacy Policy</h1>

      <div className="space-y-6 text-muted-foreground">
        <section>
          <p>Last updated: {LEGAL_UPDATED}</p>
          <p className="mt-4">
            MojiCap is built so that what you do here does not reach us: the tools run in your browser, there are no accounts,
            and the text you type is not sent anywhere. This policy explains the parts that do involve data — analytics,
            advertising, and the emails you send us.
          </p>
        </section>

        <Section n={1} title="Who is responsible for your data">
          <p>
            The controller is {LEGAL_NAME}, an individual trader operating MojiCap at www.mojicap.com. Privacy questions and
            requests go to <a href={mailto} className={link}>{SUPPORT_EMAIL}</a>, which is monitored. We are not required to
            appoint a data protection officer and have not appointed one; the address above reaches the person responsible.
          </p>
        </Section>

        <Section n={2} title="What we collect">
          <p className="font-medium text-foreground">Using the tools</p>
          <p>
            Nothing about the text you type or copy is sent to us. Your recently used emoji, favorites and interface
            preferences are stored in your own browser (see section 5) and can be cleared at any time from your browser
            settings.
          </p>
          <p className="font-medium text-foreground">Automatically</p>
          <p>
            Standard server and analytics data: pages visited, approximate (non-precise) location derived from your IP address,
            browser and device type, and referring site. Visitors also receive cookies from Google AdSense, described in
            section 5.
          </p>
          <p className="font-medium text-foreground">If you email us</p>
          <p>Your email address and whatever you write, used only to answer you.</p>
          <p className="font-medium text-foreground">Former accounts</p>
          <p>
            MojiCap used to offer optional accounts. They were discontinued in November 2026, and the email addresses and
            synced lists held for them are being deleted.
          </p>
        </Section>

        <Section n={3} title="Why we use it, and on what basis">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-foreground">
                <th className="pb-2 pr-4 font-medium">Purpose</th>
                <th className="pb-2 pr-4 font-medium">Data</th>
                <th className="pb-2 font-medium">Legal basis</th>
              </tr>
            </thead>
            <tbody>
              <tr className={row}>
                <td>Keeping the service secure and preventing abuse</td>
                <td>Server logs</td>
                <td>Our legitimate interest in a working service</td>
              </tr>
              <tr className={row}>
                <td>Understanding which tools are used</td>
                <td>Aggregate analytics events</td>
                <td>Our legitimate interest in improving MojiCap</td>
              </tr>
              <tr className={row}>
                <td>Showing ads, which fund the free site</td>
                <td>Cookies and device identifiers set by Google AdSense</td>
                <td>
                  Your consent where the law requires it (for example in the EEA and UK); otherwise our legitimate interest in
                  funding the free site
                </td>
              </tr>
              <tr className={row}>
                <td>Answering your emails</td>
                <td>Your email address and message</td>
                <td>Our legitimate interest in replying to you</td>
              </tr>
            </tbody>
          </table>
          <p>
            We make no automated decisions about you. Personalized ads, where you allow them, are chosen by Google, not by us.
          </p>
        </Section>

        <Section n={4} title="Who we share it with">
          <p className="text-foreground">
            We do not sell your personal information. The only advertising data is what Google AdSense collects through its own
            cookies, described in section 5.
          </p>
          <p>We use these processors, each only for the purpose listed:</p>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-foreground">
                <th className="pb-2 pr-4 font-medium">Processor</th>
                <th className="pb-2 font-medium">What it does for us</th>
              </tr>
            </thead>
            <tbody>
              <tr className={row}>
                <td>Google</td>
                <td>Google Analytics, and Google AdSense, which shows the ads on the site</td>
              </tr>
              <tr className={row}>
                <td>Cloudflare</td>
                <td>
                  Hosting the site, DNS, protection against attacks, and forwarding mail sent to our support address
                </td>
              </tr>
            </tbody>
          </table>
          <p>We also disclose data where the law requires it, or to establish or defend a legal claim.</p>
        </Section>

        <Section n={5} title="Cookies and browser storage">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-foreground">
                <th className="pb-2 pr-4 font-medium">Name</th>
                <th className="pb-2 pr-4 font-medium">Purpose</th>
                <th className="pb-2 font-medium">Kept</th>
              </tr>
            </thead>
            <tbody>
              <tr className={row}>
                <td>NEXT_LOCALE</td>
                <td>Remembers the language you chose</td>
                <td>A year</td>
              </tr>
              <tr className={row}>
                <td>Browser storage: favorites, recents, dismissed promotions, theme</td>
                <td>Your own settings and lists; never leaves your device</td>
                <td>Until you clear your browser data</td>
              </tr>
              <tr className={row}>
                <td>Analytics cookies (Google Analytics)</td>
                <td>Aggregate usage statistics</td>
                <td>Per Google&rsquo;s retention settings</td>
              </tr>
              <tr className={row}>
                <td>Advertising cookies (Google AdSense)</td>
                <td>Serving ads, measuring them, and, where you allow it, personalizing them</td>
                <td>Per Google&rsquo;s retention settings</td>
              </tr>
            </tbody>
          </table>
          <p>
            Google and its partners use cookies to serve ads based on your visits to this and other websites. You can turn off
            personalized ads in{" "}
            <a className={link} href="https://adssettings.google.com" target="_blank" rel="noopener noreferrer">
              Google&rsquo;s Ad Settings
            </a>
            , or opt out of other vendors&rsquo; personalized ads at{" "}
            <a className={link} href="https://www.aboutads.info/choices/" target="_blank" rel="noopener noreferrer">
              aboutads.info
            </a>
            . See{" "}
            <a className={link} href="https://policies.google.com/technologies/partner-sites" target="_blank" rel="noopener noreferrer">
              how Google uses data from sites that use its services
            </a>
            . In the EEA, the UK and Switzerland we ask for your consent before ads are personalized.
          </p>
        </Section>

        <Section n={6} title="Security">
          <p>
            Traffic is served over HTTPS. We hold no account data, passwords or payment details. No system is perfectly secure,
            but if a breach affects your personal data we will notify the relevant supervisory authority within 72 hours of
            becoming aware of it.
          </p>
        </Section>

        <Section n={7} title="How long we keep it">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-foreground">
                <th className="pb-2 pr-4 font-medium">Data</th>
                <th className="pb-2 font-medium">Kept</th>
              </tr>
            </thead>
            <tbody>
              <tr className={row}>
                <td>Favorites, recents and preferences</td>
                <td>In your browser, until you clear it</td>
              </tr>
              <tr className={row}>
                <td>Server logs</td>
                <td>Kept briefly by our host for security, then deleted</td>
              </tr>
              <tr className={row}>
                <td>Analytics</td>
                <td>Aggregated; not tied to you by name</td>
              </tr>
              <tr className={row}>
                <td>Support emails</td>
                <td>As long as needed to answer you</td>
              </tr>
            </tbody>
          </table>
        </Section>

        <Section n={8} title="Your rights">
          <p>
            Wherever you live, you can ask us to: confirm what we hold about you and give you a copy; correct it; delete it;
            restrict how we use it; object to use based on our legitimate interests; receive it in a portable format; withdraw
            consent you gave (without affecting what we did before); and not be subject to automated decisions — which we do
            not make.
          </p>
          <p>
            Write to <a href={mailto} className={link}>{SUPPORT_EMAIL}</a> and we will respond within 30 days. If you are in the
            EEA or the UK and are unhappy with our answer, you may complain to your local data protection authority.
          </p>
        </Section>

        <Section n={9} title="Children">
          <p>MojiCap is not directed at children under 13, and we do not knowingly collect their data.</p>
        </Section>

        <Section n={10} title="Where your data is processed">
          <p>
            Our hosting and analytics providers process data in the United States and other countries. Where data leaves the
            EEA or the UK, transfers rely on the European Commission&rsquo;s standard contractual clauses or an equivalent
            safeguard in our agreements with those providers.
          </p>
        </Section>

        <Section n={11} title="Changes to this policy">
          <p>We may update this policy. The date at the top of this page always shows the current version.</p>
        </Section>

        <Section n={12} title="Contact">
          <p>
            {LEGAL_NAME} — <a href={mailto} className={link}>{SUPPORT_EMAIL}</a>.
          </p>
        </Section>
      </div>
    </div>
  );
}
