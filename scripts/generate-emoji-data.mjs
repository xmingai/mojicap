#!/usr/bin/env node
import { writeFileSync, mkdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = join(__dirname, "..", "src", "data");

const CATEGORY_ICONS = {
  "smileys-emotion": "😀",
  "people-body": "👋",
  "animals-nature": "🐻",
  "food-drink": "🍔",
  "travel-places": "🚗",
  "activities": "⚽",
  "objects": "💡",
  "symbols": "♥️",
  "flags": "🏁",
  "component": "🔧",
};

async function main() {
  mkdirSync(DATA_DIR, { recursive: true });

  console.log("Fetching emoji data...");
  const resp = await fetch(
    "https://raw.githubusercontent.com/muan/unicode-emoji-json/main/data-by-group.json"
  );
  const raw = await resp.json();

  const categories = [];
  const allEmojis = [];
  const usedSlugs = new Set();
  let id = 0;

  // raw is indexed object { "0": { name, slug, emojis: [...] }, ... }
  const groups = Object.values(raw);

  for (const group of groups) {
    const groupName = group.name;
    const groupSlug = group.slug;

    // Skip "component" group (skin tones, hair styles)
    if (groupSlug === "component") continue;

    categories.push({
      slug: groupSlug,
      name: groupName,
      icon: CATEGORY_ICONS[groupSlug] || "📦",
    });

    for (const e of group.emojis) {
      let emojiSlug = e.name
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "");

      if (!emojiSlug) emojiSlug = `emoji-${id}`;
      // Deduplicate slugs
      if (usedSlugs.has(emojiSlug)) {
        emojiSlug = `${emojiSlug}-${id}`;
      }
      usedSlugs.add(emojiSlug);

      const codePoints = [...e.emoji]
        .map((c) => "U+" + c.codePointAt(0).toString(16).toUpperCase().padStart(4, "0"))
        .join(" ");

      allEmojis.push({
        id: id++,
        emoji: e.emoji,
        name: e.name,
        slug: emojiSlug,
        group: groupName,
        groupSlug: groupSlug,
        skinToneSupport: e.skin_tone_support || false,
        unicode: codePoints,
        keywords: [...new Set(e.name.toLowerCase().split(/[\s-]+/).filter(Boolean))],
      });
    }
  }

  writeFileSync(join(DATA_DIR, "emoji-data.json"), JSON.stringify(allEmojis));
  writeFileSync(join(DATA_DIR, "categories.json"), JSON.stringify(categories, null, 2));

  const slugMap = {};
  for (const e of allEmojis) slugMap[e.slug] = e.id;
  writeFileSync(join(DATA_DIR, "slug-map.json"), JSON.stringify(slugMap));

  console.log(`Done! ${allEmojis.length} emojis, ${categories.length} categories.`);
}

main().catch(console.error);
