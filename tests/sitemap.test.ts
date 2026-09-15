import test from "node:test";
import assert from "node:assert/strict";
import { SITEMAP_FILES, sitemapIndexXml, sitemapUrls, urlsetXml } from "../src/lib/sitemap.ts";
import { getAllEmojis, getBaseEmojis } from "../src/lib/emoji.ts";

const all = () => SITEMAP_FILES.flatMap((f) => sitemapUrls(f) ?? []);

test("index lists pages plus one emoji file per locale", () => {
  assert.deepEqual(SITEMAP_FILES, ["pages.xml", "emoji-en.xml", "emoji-zh.xml", "emoji-ja.xml", "emoji-ko.xml", "emoji-es.xml", "emoji-ru.xml", "emoji-fr.xml", "emoji-pt.xml"]);
  const xml = sitemapIndexXml();
  for (const f of SITEMAP_FILES) assert.ok(xml.includes(`<loc>https://www.mojicap.com/sitemaps/${f}</loc>`), f);
  assert.equal(sitemapUrls("emoji-xx.xml"), null);
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
