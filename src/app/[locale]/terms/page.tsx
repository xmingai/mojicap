import type { Metadata } from "next";
import { type Locale } from "@/i18n/config";
import { buildAlternates } from "@/lib/seo";
import {
  CN_PLANS,
  GLOBAL_PLANS,
  GOVERNING_LAW,
  LEGAL_NAME,
  LEGAL_UPDATED,
  MERCHANT_OF_RECORD,
  REFUND_DAYS,
  SUPPORT_EMAIL,
} from "@/lib/legal";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: "Terms of Service",
    description:
      "The agreement for using MojiCap and MojiCap Plus: accounts, prices, automatic renewal, cancellation, refunds and who processes payments.",
    alternates: buildAlternates(locale as Locale, "/terms"),
  };
}

const money = (amount: number, currency: string) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency }).format(amount);

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
            www.mojicap.com (&ldquo;MojiCap&rdquo;, &ldquo;we&rdquo;, &ldquo;us&rdquo;). By using the site or buying MojiCap
            Plus you agree to them. If you do not agree, please stop using the site.
          </p>
        </section>

        <Section n={1} title="What MojiCap is">
          <p>
            MojiCap is a browser tool for copying emoji, symbols, kaomoji, emoji combos, text dividers, invisible characters,
            Braille and ASCII art, and for converting text into Unicode styles. The tools run in your browser and are free to
            use. MojiCap Plus is an optional paid upgrade, described in section 3.
          </p>
          <p>
            We may change, suspend or discontinue parts of the service. If a change removes something you have paid for, you
            may cancel and ask for a refund of the unused time under section 6.
          </p>
        </Section>

        <Section n={2} title="Accounts">
          <p>
            An account is optional and is created by entering your email address: we send a six-digit code, and there is no
            password. You are responsible for keeping access to that mailbox, and for everything done through your account.
            One person may hold one account.
          </p>
          <p>
            You can sign out at any time. Write to <a href={mailto} className="text-primary hover:underline">{SUPPORT_EMAIL}</a>{" "}
            to delete your account and the data attached to it. We may suspend an account that abuses the service, as described
            in section 8.
          </p>
        </Section>

        <Section n={3} title="MojiCap Plus, prices and billing">
          <p>
            MojiCap Plus adds cloud sync for favorites and recently used emoji, premium text styles, bulk copying with saved
            combos, and removes ads and the promotional units. Prices include tax.
          </p>
          <p className="font-medium text-foreground">Subscription (outside mainland China)</p>
          <p>
            MojiCap Plus costs {money(GLOBAL_PLANS.monthly.price, GLOBAL_PLANS.monthly.currency)} per month or{" "}
            {money(GLOBAL_PLANS.yearly.price, GLOBAL_PLANS.yearly.currency)} per year. There is no free trial. The subscription
            renews automatically at the end of each billing period until you cancel, and{" "}
            <span className="text-foreground">
              you expressly authorize {LEGAL_NAME} to charge your payment method on a recurring basis
            </span>{" "}
            for the plan you chose, at the price shown at checkout, on each renewal date. If we ever change the price of a
            running subscription we will email you at least 14 days before the change takes effect, and you may cancel before
            then.
          </p>
          <p className="font-medium text-foreground">One-time purchase (mainland China)</p>
          <p>
            In mainland China, MojiCap Plus is sold as a one-time purchase paid with WeChat Pay:{" "}
            {money(CN_PLANS.monthly.price, CN_PLANS.monthly.currency)} for {CN_PLANS.monthly.periodDays} days or{" "}
            {money(CN_PLANS.yearly.price, CN_PLANS.yearly.currency)} for {CN_PLANS.yearly.periodDays} days. Nothing renews
            automatically and no payment method is stored. Buying again while your access is still running adds the new days on
            top of the days you already have.
          </p>
          <p>
            Which of the two applies is decided by the country your connection comes from at the time of purchase. The price
            you see before you pay is the price you pay.
          </p>
        </Section>

        <Section n={4} title="Who processes your payment">
          <p>
            Payments are processed by {MERCHANT_OF_RECORD}, our online reseller and merchant of record. Waffo Pancake sells
            MojiCap Plus to you, collects the payment, issues the receipt, applies any taxes, and handles order inquiries,
            refunds and returns together with us. Your card details are entered on Waffo Pancake&rsquo;s payment page and are
            never stored on our servers.
          </p>
          <p>
            The charge on your statement is shown by Waffo. If you do not recognise a charge, contact us at{" "}
            <a href={mailto} className="text-primary hover:underline">{SUPPORT_EMAIL}</a> before disputing it with your bank —
            we can usually resolve it the same day.
          </p>
        </Section>

        <Section n={5} title="Cancelling">
          <p>
            You can cancel a subscription yourself at any time: open your account page and choose{" "}
            <span className="text-foreground">Cancel subscription</span>. Cancellation takes effect immediately in the sense
            that nothing further will be charged; your Plus access continues until the end of the period you have already paid
            for, and you can undo the cancellation from the same page until then.
          </p>
          <p>
            You can also cancel by writing to <a href={mailto} className="text-primary hover:underline">{SUPPORT_EMAIL}</a>{" "}
            from the address on your account; we will action it within one business day.
          </p>
          <p>
            One-time purchases in mainland China have nothing to cancel: they are not recurring, and access simply ends on the
            date shown on your account page.
          </p>
        </Section>

        <Section n={6} title="Refunds">
          <p className="text-foreground">
            First-time customers can have a full refund within {REFUND_DAYS} days of the first charge — subscription or
            one-time purchase, no reason needed.
          </p>
          <p>
            After that window, renewal charges are not refundable, except where the law of your country gives you a right to
            one, or where MojiCap Plus was unavailable for an extended period through our fault. If you cancel mid-period, you
            keep access until the period ends; we do not pro-rate unused days.
          </p>
          <p>
            To request a refund, email <a href={mailto} className="text-primary hover:underline">{SUPPORT_EMAIL}</a> from the
            address on your account with the order number from your receipt. We reply within two business days. Approved
            refunds are issued by Waffo Pancake to the original payment method, and typically appear within 5–10 business days
            depending on your bank or WeChat Pay.
          </p>
        </Section>

        <Section n={7} title="Your content and Unicode characters">
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

        <Section n={8} title="Acceptable use">
          <p>
            Do not use MojiCap to harass, threaten or impersonate anyone, to send spam, to break the law, or to interfere with
            the site — for example by scraping at a rate that degrades it for others, circumventing the limits on free use, or
            reselling access to MojiCap Plus. We may suspend or close an account that does any of this; where we do, we refund
            the unused time unless the abuse itself caused the loss.
          </p>
        </Section>

        <Section n={9} title="The site is provided as is">
          <p>
            MojiCap is provided &ldquo;as is&rdquo; and &ldquo;as available&rdquo;. We do not promise that it will be
            uninterrupted or error-free, and we give no warranties beyond those that cannot be excluded by law. Nothing here
            limits your statutory rights as a consumer.
          </p>
        </Section>

        <Section n={10} title="Limitation of liability">
          <p>
            To the extent permitted by law, our total liability to you for any claim connected with MojiCap is limited to the
            amount you paid us in the twelve months before the claim arose. We are not liable for indirect or consequential
            loss, or for loss of data you did not keep a copy of elsewhere.
          </p>
        </Section>

        <Section n={11} title="Changes to these Terms">
          <p>
            We may update these Terms. If a change materially affects your rights — pricing, billing, cancellation or refunds —
            we will email account holders at least 14 days before it takes effect, and the new version applies from the date
            shown at the top of this page. Continuing to use MojiCap after that date means you accept the change.
          </p>
        </Section>

        <Section n={12} title="Governing law">
          <p>
            These Terms are governed by {GOVERNING_LAW}. Disputes will be submitted to the court with jurisdiction at the
            operator&rsquo;s place of residence, without affecting any mandatory consumer protection you have where you live.
          </p>
        </Section>

        <Section n={13} title="Contact">
          <p>
            {LEGAL_NAME} — <a href={mailto} className="text-primary hover:underline">{SUPPORT_EMAIL}</a>. We answer within two
            business days. For questions about a payment, please include the order number from your receipt.
          </p>
        </Section>
      </div>
    </div>
  );
}
