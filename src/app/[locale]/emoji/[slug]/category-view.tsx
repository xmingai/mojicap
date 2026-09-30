import { getBaseEmojisLite, getCategories, getEmojiVersions, type Category } from "@/lib/emoji";
import { EmojiGrid } from "@/components/emoji-grid";
import type { Dictionary } from "@/i18n/dictionaries";
import type { Locale } from "@/i18n/config";
import { absoluteUrl, localePath } from "@/lib/seo";
import { getEmojiTranslation } from "@/lib/emoji-i18n";
import { capitalize } from "@/lib/utils";

type CategoryCopy = { title: string; h1: string; desc: string };

export function categoryCopy(dict: Dictionary, category: Category): CategoryCopy {
  const copy = (dict.emojiCategories as Record<string, CategoryCopy>)[category.slug];
  const count = String(getBaseEmojisLite().filter((e) => e.groupSlug === category.slug).length);
  const fill = (s: string) => s.replace("{count}", count);
  return { title: fill(copy.title), h1: fill(copy.h1), desc: fill(copy.desc) };
}

/**
 * /emoji/<category>/: the emoji grid limited to one Unicode group, with its own
 * heading and intro. Only that group's emoji are sent, so the page is a fraction
 * of the full /emoji/ list.
 */
export function CategoryView({ locale, dict, category }: { locale: Locale; dict: Dictionary; category: Category }) {
  const copy = categoryCopy(dict, category);
  const emojis = getBaseEmojisLite().filter((e) => e.groupSlug === category.slug);

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "MojiCap", item: absoluteUrl(locale, "/") },
      { "@type": "ListItem", position: 2, name: dict.emoji.allEmojis, item: absoluteUrl(locale, "/emoji") },
      { "@type": "ListItem", position: 3, name: copy.h1, item: absoluteUrl(locale, `/emoji/${category.slug}`) },
    ],
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />
      <EmojiGrid
        emojis={emojis}
        categories={getCategories()}
        versions={getEmojiVersions()}
        category={category.slug}
        heading={{ title: copy.h1, intro: copy.desc }}
      />

      {/* The grid copies on click and opens details from a hover card, so this
          list is where each emoji's page is actually linked — and it gives the
          category page the names people search for ("flag emoji with names"). */}
      <section className="mt-12">
        <h2 className="text-lg font-semibold mb-4">
          {dict.emoji.categoryListTitle.replace("{count}", String(emojis.length))}
        </h2>
        {/* Styled from the list so each of the (up to ~400) entries stays a bare
            <a>, which keeps the page's HTML and RSC payload small. */}
        <ul className="grid grid-cols-1 gap-x-6 gap-y-1 text-sm sm:grid-cols-2 lg:grid-cols-3 [&_a]:flex [&_a]:items-center [&_a]:gap-2 [&_a]:truncate [&_a]:rounded-md [&_a]:px-2 [&_a]:py-1 [&_a]:text-muted-foreground [&_a]:transition [&_a:hover]:bg-muted [&_a:hover]:text-foreground [&_span]:text-xl [&_span]:leading-none">
          {emojis.map((e) => (
            <li key={e.id}>
              <a href={localePath(locale, `/emoji/${e.slug}`)}>
                <span>{e.emoji}</span>
                {capitalize(getEmojiTranslation(e.slug, locale)?.name || e.name, locale)}
              </a>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
