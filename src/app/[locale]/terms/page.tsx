import type { Metadata } from "next";
import { type Locale } from "@/i18n/config";
import { buildAlternates } from "@/lib/seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: "Terms of Service | MojiCap",
    description: "Terms and conditions of using MojiCap web application interfaces and tools.",
    alternates: buildAlternates(locale as Locale, "/terms"),
  };
}

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16">
      <h1 className="text-3xl font-bold mb-8">Terms of Service</h1>
      
      <div className="space-y-6 text-muted-foreground">
        <section>
          <p>Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
          <p className="mt-4">
            Welcome to MojiCap. By accessing or using our website and tools, you agree to be bound by these Terms of Service. If you disagree with any part of these terms, you may not access the service.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-foreground">1. Use of the Service</h2>
          <p>
            MojiCap provides online text manipulation tools, including but not limited to emoji copying, text combination, font generation, and braille translation. You are free to use the tools provided for personal, educational, or commercial projects.
          </p>
          <p>
            You agree not to use our services in any way that causes, or may cause, damage to the website or impairment of the availability or accessibility of the website. 
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-foreground">2. &ldquo;As Is&rdquo; Disclaimer</h2>
          <p>
            MojiCap is provided on an &ldquo;AS IS&rdquo; and &ldquo;AS AVAILABLE&rdquo; basis. We make no representations or warranties of any kind, express or implied, as to the operation of the services, the accuracy of the tools, or the information and content included within it. 
          </p>
          <p>
            We do not warrant that the service will be uninterrupted, secure, or completely error-free. Data generated (such as text combinations, translated strings, and code snippets) are for utility purposes and users are responsible for verifying their appropriateness and correctness.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-foreground">3. User Responsibility</h2>
          <p>
            The emojis, kaomojis, and text art displayed on MojiCap utilize Unicode standards. The appearance of these symbols relies heavily on the operating system, device, and font software of the end-user. We are not responsible for how copied symbols are rendered on third-party platforms.
          </p>
          <p>
            Users are strictly prohibited from using MojiCap workflows to actively generate malicious content, spam, or abusive messages targeting others.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-foreground">4. Intellectual Property</h2>
          <p>
            The original website design, UI components, code structure, and written content are the intellectual property of MojiCap unless otherwise specified. Standard Unicode emojis and standard text symbols belong to their respective standard bodies or foundries. Free usage of our output content does not imply ownership of the website&apos;s source code or brand assets.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-foreground">5. Modifications</h2>
          <p>
            We reserve the right, at our sole discretion, to modify or replace these Terms at any time. Any changes become effective immediately upon posting to this page. Your continued use of the service after any such changes constitutes your acceptance of the new Terms.
          </p>
        </section>
      </div>
    </div>
  );
}
