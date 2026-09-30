import test from "node:test";
import assert from "node:assert/strict";
import { SITEMAP_FILES, sitemapIndexXml, sitemapUrls, urlsetXml } from "../src/lib/sitemap.ts";
import { getAllEmojis, getBaseEmojis } from "../src/lib/emoji.ts";
import { buildEmojiAlternates, emojiDetailRobots } from "../src/lib/seo.ts";

const all = () => SITEMAP_FILES.flatMap((f) => sitemapUrls(f) ?? []);

test("index lists pages plus one emoji file per locale with translated emoji content", () => {
  assert.deepEqual(SITEMAP_FILES, ["pages.xml", "emoji-en.xml", "emoji-zh.xml", "emoji-ja.xml", "emoji-ko.xml", "emoji-es.xml", "emoji-ru.xml"]);
  const xml = sitemapIndexXml();
  for (const f of SITEMAP_FILES) assert.ok(xml.includes(`<loc>https://www.mojicap.com/sitemaps/${f}</loc>`), f);
  assert.equal(sitemapUrls("emoji-xx.xml"), null);
  // fr/pt emoji pages still show English content, so they are not listed.
  assert.equal(sitemapUrls("emoji-fr.xml"), null);
  assert.equal(sitemapUrls("emoji-pt.xml"), null);
  assert.equal(sitemapUrls("nope.xml"), null);
});

test("every URL is absolute, unique and ends with a slash (trailingSlash: true)", () => {
  const urls = all();
  assert.equal(new Set(urls).size, urls.length);
  for (const u of urls) assert.match(u, /^https:\/\/www\.mojicap\.com\/(.*\/)?$/);
  assert.ok(urls.length < 50_000 * SITEMAP_FILES.length);
  for (const f of SITEMAP_FILES) assert.ok((sitemapUrls(f) ?? []).length <= 50_000, `${f} under the 50k URL limit`);
});

test("English is unprefixed, /en/ never appears, /account never appears", () => {
  const urls = all();
  assert.ok(urls.includes("https://www.mojicap.com/"));
  assert.ok(urls.includes("https://www.mojicap.com/zh/fancy-text/"));
  assert.ok(!urls.some((u) => u.includes("/en/")));
  assert.ok(!urls.some((u) => u.includes("/account/")));
});

test("only base emoji are listed, never skin-tone variants", () => {
  const en = sitemapUrls("emoji-en.xml")!;
  assert.equal(en.length, getBaseEmojis().length);
  const variant = getAllEmojis().find((e) => e.skinToneVariant)!;
  assert.ok(!en.includes(`https://www.mojicap.com/emoji/${variant.slug}/`));
});

test("urlset carries only <loc>, escaped", () => {
  const xml = urlsetXml(["https://www.mojicap.com/a&b/"]);
  assert.ok(xml.includes("<loc>https://www.mojicap.com/a&amp;b/</loc>"));
  assert.ok(!/priority|changefreq|lastmod|xhtml:link/.test(xml));
});

test("fr/pt emoji detail pages are noindex and outside the language cluster", () => {
  assert.deepEqual(emojiDetailRobots("fr"), { index: false, follow: true });
  assert.deepEqual(emojiDetailRobots("pt"), { index: false, follow: true });
  assert.equal(emojiDetailRobots("ko"), undefined);

  const fr = buildEmojiAlternates("fr", "/emoji/coat");
  assert.deepEqual(fr, { canonical: "https://www.mojicap.com/fr/emoji/coat/" });

  const en = buildEmojiAlternates("en", "/emoji/coat");
  assert.equal(en.canonical, "https://www.mojicap.com/emoji/coat/");
  assert.deepEqual(Object.keys(en.languages!).sort(), ["en", "es", "ja", "ko", "ru", "x-default", "zh"]);
});

test("pages.xml still lists tool pages in every locale, fr and pt included", () => {
  const pages = sitemapUrls("pages.xml")!;
  assert.ok(pages.includes("https://www.mojicap.com/fr/fancy-text/"));
  assert.ok(pages.includes("https://www.mojicap.com/pt/emoji/"));
  // Category pages (/fr/emoji/flags/) stay; emoji detail pages in fr/pt do not.
  const detail = new Set(getAllEmojis().map((e) => e.slug));
  assert.ok(!all().some((u) => {
    const m = u.match(/\/(fr|pt)\/emoji\/([^/]+)\/$/);
    return m !== null && detail.has(m[2]);
  }));
});

test("each emoji category has its own page, listed in every locale", async () => {
  const { getCategories } = await import("../src/lib/emoji.ts");
  const pages = sitemapUrls("pages.xml")!;
  const emojiSlugs = new Set(getAllEmojis().map((e) => e.slug));
  for (const c of getCategories()) {
    // Category pages share the /emoji/[slug] route with emoji detail pages.
    assert.ok(!emojiSlugs.has(c.slug), `${c.slug} collides with an emoji slug`);
    assert.ok(pages.includes(`https://www.mojicap.com/emoji/${c.slug}/`), c.slug);
    assert.ok(pages.includes(`https://www.mojicap.com/ko/emoji/${c.slug}/`), c.slug);
  }
});

test("every locale has title, heading and description for every category", async () => {
  const { getCategories } = await import("../src/lib/emoji.ts");
  const { readFileSync } = await import("node:fs");
  for (const locale of ["en", "zh", "ja", "ko", "es", "ru", "fr", "pt"]) {
    const dict = JSON.parse(readFileSync(`src/i18n/dictionaries/${locale}.json`, "utf8"));
    for (const c of getCategories()) {
      const copy = dict.emojiCategories?.[c.slug];
      assert.ok(copy?.title && copy?.h1 && copy?.desc, `${locale} ${c.slug}`);
    }
  }
});
