import type { Metadata } from "next";
import { type Locale } from "@/i18n/config";
import { buildAlternates } from "@/lib/seo";
import { LEGAL_NAME, LEGAL_UPDATED, MERCHANT_OF_RECORD, SUPPORT_EMAIL } from "@/lib/legal";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: "Privacy Policy",
    description:
      "What MojiCap collects, what stays in your browser, who processes payments and analytics, how long data is kept, and the rights you have over it.",
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

  return (
    <div className="mx-auto max-w-3xl px-4 py-16">
      <h1 className="text-3xl font-bold mb-8">Privacy Policy</h1>

      <div className="space-y-6 text-muted-foreground">
        <section>
          <p>Last updated: {LEGAL_UPDATED}</p>
          <p className="mt-4">
            MojiCap is built so that most of what you do here never reaches us: the tools run in your browser, and the text you
            type is not sent anywhere. This policy explains the parts that do involve data — an account, a payment, and basic
            analytics.
          </p>
        </section>

        <Section n={1} title="Who is responsible for your data">
          <p>
            The controller is {LEGAL_NAME}, an individual trader operating MojiCap at www.mojicap.com. Privacy questions and
            requests go to <a href={mailto} className="text-primary hover:underline">{SUPPORT_EMAIL}</a>, which is monitored.
            We are not required to appoint a data protection officer and have not appointed one; the address above reaches the
            person responsible.
          </p>
        </Section>

        <Section n={2} title="What we collect">
          <p className="font-medium text-foreground">Using the tools without an account</p>
          <p>
            Nothing about the text you type or copy is sent to us. Your recently used emoji, favorites, the count of free
            copies and your interface preferences are stored in your own browser (see section 5) and can be cleared at any time
            from your browser settings.
          </p>
          <p className="font-medium text-foreground">If you create an account</p>
          <p>
            Your email address; the sign-in codes we email you, stored hashed and only until they expire; your sessions; and,
            if you sign in with Google, the name, email address and profile picture Google shares with us. If you turn on
            syncing, the favorites, recently used emoji and custom combos you choose to sync.
          </p>
          <p className="font-medium text-foreground">If you buy MojiCap Plus</p>
          <p>
            Your plan, its status and renewal or expiry date, and the order and payment identifiers with the amount charged.{" "}
            <span className="text-foreground">
              Full card numbers are not stored by us — card data is processed by our payment processor
            </span>{" "}
            on its own payment page, and never reaches our servers.
          </p>
          <p className="font-medium text-foreground">Automatically</p>
          <p>
            Standard server and analytics data: pages visited, approximate (non-precise) location derived from your IP address,
            browser and device type, and referring site. We also use the country your connection comes from to decide which
            price list to show you.
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
                <td>Signing you in and keeping you signed in</td>
                <td>Email, sign-in codes, sessions</td>
                <td>Performance of our contract with you</td>
              </tr>
              <tr className={row}>
                <td>Providing MojiCap Plus and syncing your lists</td>
                <td>Plan and payment records, favorites, recents, combos</td>
                <td>Performance of our contract with you</td>
              </tr>
              <tr className={row}>
                <td>Taking payment, issuing receipts, handling refunds</td>
                <td>Order and payment identifiers, amount, email</td>
                <td>Contract, and legal obligation for tax records</td>
              </tr>
              <tr className={row}>
                <td>Keeping the service secure and preventing abuse</td>
                <td>Rate-limit counters, server logs</td>
                <td>Our legitimate interest in a working service</td>
              </tr>
              <tr className={row}>
                <td>Understanding which tools are used</td>
                <td>Aggregate analytics events</td>
                <td>Our legitimate interest in improving MojiCap</td>
              </tr>
            </tbody>
          </table>
          <p>We do not use your data for automated decision-making or profiling.</p>
        </Section>

        <Section n={4} title="Who we share it with">
          <p className="text-foreground">We do not sell your personal information, and we do not share it for advertising.</p>
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
                <td>{MERCHANT_OF_RECORD}</td>
                <td>
                  Merchant of record: takes the payment and issues receipts. It is PCI-DSS certified, and card data is not
                  stored on our servers.
                </td>
              </tr>
              <tr className={row}>
                <td>Vercel</td>
                <td>Hosting and privacy-friendly web analytics</td>
              </tr>
              <tr className={row}>
                <td>Turso</td>
                <td>The database holding accounts and synced lists</td>
              </tr>
              <tr className={row}>
                <td>Resend</td>
                <td>Sending sign-in codes and service emails</td>
              </tr>
              <tr className={row}>
                <td>Google</td>
                <td>Google Analytics, and Google sign-in if you choose it</td>
              </tr>
              <tr className={row}>
                <td>Cloudflare</td>
                <td>DNS, protection against attacks, and forwarding mail sent to our support address</td>
              </tr>
            </tbody>
          </table>
          <p>
            We also disclose data where the law requires it, or to establish or defend a legal claim. If MojiCap is ever
            transferred to someone else, we will tell account holders by email before their data moves.
          </p>
        </Section>

        <Section n={5} title="Cookies and browser storage">
          <p>
            MojiCap sets no advertising cookies. What we store is either required for the site to work or kept only in your own
            browser:
          </p>
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
                <td>Session cookie</td>
                <td>Keeps you signed in</td>
                <td>Up to a year, or until you sign out</td>
              </tr>
              <tr className={row}>
                <td>NEXT_LOCALE</td>
                <td>Remembers the language you chose</td>
                <td>A year</td>
              </tr>
              <tr className={row}>
                <td>Browser storage: favorites, recents, free-copy count, dismissed promotions, theme</td>
                <td>Your own settings and lists; stays on your device unless you sync</td>
                <td>Until you clear your browser data</td>
              </tr>
              <tr className={row}>
                <td>Analytics cookies (Google Analytics)</td>
                <td>Aggregate usage statistics</td>
                <td>Per Google&rsquo;s retention settings</td>
              </tr>
            </tbody>
          </table>
        </Section>

        <Section n={6} title="Security">
          <p>
            Traffic is served over HTTPS. Sign-in codes are stored hashed and expire after ten minutes, with a limit on attempts
            and on how often a code can be requested. Sessions are held in a signed, HTTP-only cookie. Access to the database is
            limited to the service itself. No system is perfectly secure, but if a breach affects your personal data we will
            notify the relevant supervisory authority within 72 hours of becoming aware of it, and tell you directly where the
            risk to you is high.
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
                <td>Account, favorites, recents, combos</td>
                <td>Until you delete your account, then removed</td>
              </tr>
              <tr className={row}>
                <td>Sign-in codes</td>
                <td>Ten minutes, then deleted</td>
              </tr>
              <tr className={row}>
                <td>Sessions</td>
                <td>Up to a year, or until you sign out</td>
              </tr>
              <tr className={row}>
                <td>Payment and order records</td>
                <td>Up to seven years, as tax and accounting rules require, then deleted</td>
              </tr>
              <tr className={row}>
                <td>Analytics</td>
                <td>Aggregated; not tied to your account</td>
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
            Write to <a href={mailto} className="text-primary hover:underline">{SUPPORT_EMAIL}</a> from the address on your
            account and we will respond within 30 days. If you are in the EEA or the UK and are unhappy with our answer, you may
            complain to your local data protection authority.
          </p>
        </Section>

        <Section n={9} title="Children">
          <p>
            MojiCap is not directed at children under 13, and we do not knowingly collect their data. If you believe a child has
            created an account, write to <a href={mailto} className="text-primary hover:underline">{SUPPORT_EMAIL}</a> and we
            will delete it.
          </p>
        </Section>

        <Section n={10} title="Where your data is processed">
          <p>
            Our hosting, database and email providers process data in the United States and other countries. Where data leaves
            the EEA or the UK, transfers rely on the European Commission&rsquo;s standard contractual clauses or an equivalent
            safeguard in our agreements with those providers.
          </p>
        </Section>

        <Section n={11} title="Changes to this policy">
          <p>
            We may update this policy. Material changes are announced to account holders by email at least 30 days before they
            take effect, and the date at the top of this page always shows the current version.
          </p>
        </Section>

        <Section n={12} title="Contact">
          <p>
            {LEGAL_NAME} — <a href={mailto} className="text-primary hover:underline">{SUPPORT_EMAIL}</a>. Payment questions are
            also handled by {MERCHANT_OF_RECORD}, which issued your receipt.
          </p>
        </Section>
      </div>
    </div>
  );
}
