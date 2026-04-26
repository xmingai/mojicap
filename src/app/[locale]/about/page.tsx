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
          <h2 className="text-2xl font-bold mt-0 mb-4">{dict.aboutPage.section1Title}</h2>
          <p className="text-muted-foreground leading-relaxed">
            {dict.aboutPage.section1Desc}
          </p>
        </section>

        <section className="bg-muted/30 p-8 rounded-2xl border border-border/50">
          <h2 className="text-2xl font-bold mt-0 mb-4">{dict.aboutPage.section2Title}</h2>
          <ul className="space-y-3 text-muted-foreground list-disc list-inside">
            <li>{dict.aboutPage.section2List1}</li>
            <li>{dict.aboutPage.section2List2}</li>
            <li>{dict.aboutPage.section2List3}</li>
            <li>{dict.aboutPage.section2List4}</li>
          </ul>
        </section>

        <section className="bg-muted/30 p-8 rounded-2xl border border-border/50">
          <h2 className="text-2xl font-bold mt-0 mb-4">{dict.aboutPage.section3Title}</h2>
          <p className="text-muted-foreground leading-relaxed">
            {dict.aboutPage.section3Desc}
          </p>
        </section>
      </div>
    </div>
  );
}
