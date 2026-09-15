import type { Metadata } from "next";
import { type Locale } from "@/i18n/config";
import { buildAlternates } from "@/lib/seo";
import { MEMBERSHIP_UI_ENABLED } from "@/lib/membership/config";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: "Privacy Policy",
    description: "Learn how MojiCap protects your privacy. We process text locally and do not store personal data.",
    alternates: buildAlternates(locale as Locale, "/privacy"),
  };
}

export default function PrivacyPage() {
  // Section 2 (accounts and payments) only exists while membership is switched on.
  const n = (k: number) => (MEMBERSHIP_UI_ENABLED && k >= 2 ? k + 1 : k);
  return (
    <div className="mx-auto max-w-3xl px-4 py-16">
      <h1 className="text-3xl font-bold mb-8">Privacy Policy</h1>
      
      <div className="space-y-6 text-muted-foreground">
        <section>
          <p>Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
          <p className="mt-4">
            At MojiCap, your privacy is our priority. As a pure utility application, we intentionally avoid collecting personal data wherever possible. This Privacy Policy outlines what information is collected and how it is used.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-foreground">1. Local Processing & Storage</h2>
          <p>
            MojiCap is designed as a client-side web application. When you copy emojis, use the text generators, or translate Braille, <strong>all text processing happens locally within your web browser</strong>. We do not transmit your input text or copied content to our servers.
          </p>
          <p>
            We use your browser&apos;s Local Storage to save specific preferences (such as your chosen display theme, and your &ldquo;Recently Used&rdquo; emojis). This data stays on your device and is not accessible by us{MEMBERSHIP_UI_ENABLED ? ", unless you are a MojiCap Plus member and your favorites and recently used emoji sync to your account (see section 2)" : ""}.
          </p>
        </section>

        {MEMBERSHIP_UI_ENABLED && (
          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-foreground">2. Accounts and MojiCap Plus</h2>
            <p>
              You can use every free tool without an account. If you choose to sign in, we store your email address (or the name, email and profile picture your Google account shares with us), your sign-in sessions, and the time your account was created. One-time sign-in codes are sent by email through our email provider and stored only as a hash until they expire.
            </p>
            <p>
              If you subscribe to MojiCap Plus, the favorites, recently used emoji and custom combos you choose to sync are stored with your account so they appear on your other devices. Deleting a favorite or combo removes it from our database.
            </p>
            <p>
              Payments are processed by our payment provider, Waffo. We never see or store your card details. We keep only what we need to provide the subscription: your plan, its status and renewal date, and order and payment identifiers with the amount charged. You can manage or cancel your subscription from your account page at any time.
            </p>
          </section>
        )}

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-foreground">{n(2)}. Cookies and Advertising (Google AdSense)</h2>
          <p>
            We use third-party advertising companies, including Google, to serve ads when you visit our website. These companies may use cookies to serve ads based on your prior visits to our website or other websites.
          </p>
          <p>
            Specifically, Google&apos;s use of advertising cookies enables it and its partners to serve ads to you based on your visit to our site and/or other sites on the Internet.
          </p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Third party vendors, including Google, use cookies to serve ads based on a user&apos;s prior visits to your website or other websites.</li>
            <li>Google&apos;s use of advertising cookies enables it and its partners to serve ads to your users based on their visit to your sites and/or other sites on the Internet.</li>
            <li>Users may opt out of personalized advertising by visiting <a href="https://www.google.com/settings/ads" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Google Ads Settings</a>.</li>
          </ul>
          <p>
            Alternatively, you can opt out of a third-party vendor&apos;s use of cookies for personalized advertising by visiting <a href="https://www.aboutads.info" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">www.aboutads.info</a>.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-foreground">{n(3)}. Analytics</h2>
          <p>
            To understand how our website is performing and discover which tools are most useful to our visitors, we use privacy-friendly web analytics. These analytics platforms only collect standard, anonymous metadata, such as pages visited, browser type, and non-precise geographic location. We do not use tracking tools for advertising profiling outside of the standard AdSense integration.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-foreground">{n(4)}. Third-Party Links</h2>
          <p>
            Our website may contain links to third-party websites or services that are not owned or controlled by MojiCap. We have no control over, and assume no responsibility for, the content, privacy policies, or practices of any third party websites.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-foreground">{n(5)}. Changes to This Policy</h2>
          <p>
            We may update our Privacy Policy from time to time. Any changes will be reflected on this page with an updated &ldquo;Last updated&rdquo; date. We encourage you to review this Privacy Policy periodically for any changes.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-foreground">{n(6)}. Contact Us</h2>
          <p>
            If you have any questions or concerns about our Privacy Policy or data handling practices, please contact us via our main project repository on GitHub.
          </p>
        </section>
      </div>
    </div>
  );
}
