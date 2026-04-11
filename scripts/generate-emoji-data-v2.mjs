#!/usr/bin/env node
/**
 * EmojiKit v2 Data Generator
 * Parses the official Unicode emoji-test.txt (v16.0) to produce a comprehensive
 * emoji database with:
 *   - ALL fully-qualified emojis (including skin tone + gender variants)
 *   - Emoji version metadata (E0.6 → E16.0) for "Browse by Era" feature
 *   - Group & subgroup categorization
 */
import { writeFileSync, mkdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = join(__dirname, "..", "src", "data");

const EMOJI_TEST_URL = "https://unicode.org/Public/emoji/16.0/emoji-test.txt";

const GROUP_ICONS = {
  "Smileys & Emotion": "😀",
  "People & Body": "👋",
  "Animals & Nature": "🐻",
  "Food & Drink": "🍔",
  "Travel & Places": "🚗",
  "Activities": "⚽",
  "Objects": "💡",
  "Symbols": "♥️",
  "Flags": "🏁",
  "Component": "🔧",
};

// Map emoji version to release year for "Browse by Era"
const VERSION_YEARS = {
  "E0.6": 2014, "E0.7": 2014,
  "E1.0": 2015,
  "E2.0": 2015,
  "E3.0": 2016,
  "E4.0": 2016,
  "E5.0": 2017,
  "E11.0": 2018,
  "E12.0": 2019, "E12.1": 2019,
  "E13.0": 2020, "E13.1": 2020,
  "E14.0": 2021,
  "E15.0": 2022, "E15.1": 2023,
  "E16.0": 2024,
};

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function groupSlugify(text) {
  return text
    .toLowerCase()
    .replace(/\s*&\s*/g, "-")
    .replace(/\s+/g, "-");
}

async function main() {
  mkdirSync(DATA_DIR, { recursive: true });

  console.log("Fetching emoji-test.txt from Unicode 16.0...");
  const resp = await fetch(EMOJI_TEST_URL);
  const text = await resp.text();

  const lines = text.split("\n");

  let currentGroup = "";
  let currentSubgroup = "";
  const allEmojis = [];
  const usedSlugs = new Set();
  const categories = new Map();
  const versionBuckets = {};  // { "E16.0": [...emoji ids] }
  let id = 0;

  for (const line of lines) {
    // Parse group headers: # group: Smileys & Emotion
    const groupMatch = line.match(/^# group:\s*(.+)$/);
    if (groupMatch) {
      currentGroup = groupMatch[1].trim();
      continue;
    }

    // Parse subgroup headers: # subgroup: face-smiling
    const subgroupMatch = line.match(/^# subgroup:\s*(.+)$/);
    if (subgroupMatch) {
      currentSubgroup = subgroupMatch[1].trim();
      continue;
    }

    // Skip non-data lines
    if (line.startsWith("#") || line.trim() === "" || line.startsWith("Source:") || line.startsWith("---")) continue;

    // Parse emoji lines:
    // 1F600 ; fully-qualified # 😀 E1.0 grinning face
    const emojiMatch = line.match(
      /^([0-9A-F ]+?)\s*;\s*(fully-qualified|minimally-qualified|unqualified|component)\s*#\s*(\S+)\s+(E\d+\.\d+)\s+(.+)$/
    );

    if (!emojiMatch) continue;

    const [, codePointsRaw, status, emoji, version, name] = emojiMatch;

    // Only include fully-qualified emojis
    if (status !== "fully-qualified") continue;

    // Skip Component group (skin tone modifiers themselves)
    if (currentGroup === "Component") continue;

    // Generate slug
    let emojiSlug = slugify(name);
    if (!emojiSlug) emojiSlug = `emoji-${id}`;
    if (usedSlugs.has(emojiSlug)) {
      emojiSlug = `${emojiSlug}-${id}`;
    }
    usedSlugs.add(emojiSlug);

    // Build code points string
    const codePoints = codePointsRaw
      .trim()
      .split(/\s+/)
      .map((cp) => "U+" + cp)
      .join(" ");

    // Detect if this is a skin tone variant
    const isSkinToneVariant = /1F3F[B-F]/.test(codePointsRaw);

    const groupSlug = groupSlugify(currentGroup);

    // Build keywords
    const keywords = [
      ...new Set(
        name
          .toLowerCase()
          .split(/[\s-:,]+/)
          .filter((w) => w.length > 1)
      ),
    ];

    const entry = {
      id: id,
      emoji: emoji,
      name: name,
      slug: emojiSlug,
      group: currentGroup,
      groupSlug: groupSlug,
      subgroup: currentSubgroup,
      skinToneSupport: false, // will be set below
      skinToneVariant: isSkinToneVariant,
      emojiVersion: version,
      year: VERSION_YEARS[version] || null,
      unicode: codePoints,
      keywords: keywords,
    };

    allEmojis.push(entry);

    // Track categories
    if (!categories.has(groupSlug)) {
      categories.set(groupSlug, {
        slug: groupSlug,
        name: currentGroup,
        icon: GROUP_ICONS[currentGroup] || "📦",
      });
    }

    // Track version buckets
    if (!versionBuckets[version]) {
      versionBuckets[version] = [];
    }
    versionBuckets[version].push(id);

    id++;
  }

  // Mark base emojis that have skin tone support
  // A base emoji has skin tone support if there exists a variant with skin tone
  const baseEmojiMap = new Map(); // name-without-skin → first id
  for (const e of allEmojis) {
    if (!e.skinToneVariant) {
      baseEmojiMap.set(e.name, e.id);
    }
  }
  for (const e of allEmojis) {
    if (e.skinToneVariant) {
      // Find base name: "waving hand: light skin tone" → "waving hand"
      const baseName = e.name.replace(/:\s*(light|medium-light|medium|medium-dark|dark)\s+skin\s+tone.*$/, "").trim();
      const baseId = baseEmojiMap.get(baseName);
      if (baseId !== undefined) {
        allEmojis[baseId].skinToneSupport = true;
      }
    }
  }

  // Write main emoji data (compact, no pretty print for perf)
  writeFileSync(join(DATA_DIR, "emoji-data.json"), JSON.stringify(allEmojis));
  console.log(`  → emoji-data.json: ${allEmojis.length} emojis`);

  // Write categories
  const categoriesArr = Array.from(categories.values());
  writeFileSync(join(DATA_DIR, "categories.json"), JSON.stringify(categoriesArr, null, 2));
  console.log(`  → categories.json: ${categoriesArr.length} categories`);

  // Write slug map
  const slugMap = {};
  for (const e of allEmojis) slugMap[e.slug] = e.id;
  writeFileSync(join(DATA_DIR, "slug-map.json"), JSON.stringify(slugMap));
  console.log(`  → slug-map.json: ${Object.keys(slugMap).length} slugs`);

  // Write version index for "Browse by Era" feature
  const versionIndex = Object.entries(versionBuckets)
    .map(([version, ids]) => ({
      version,
      year: VERSION_YEARS[version] || null,
      count: ids.length,
      // Only store the count and sample emojis (first 8) to keep it lightweight
      sample: ids.slice(0, 8).map((id) => allEmojis[id].emoji),
    }))
    .sort((a, b) => {
      const va = parseFloat(a.version.replace("E", ""));
      const vb = parseFloat(b.version.replace("E", ""));
      return va - vb;
    });

  writeFileSync(join(DATA_DIR, "emoji-versions.json"), JSON.stringify(versionIndex, null, 2));
  console.log(`  → emoji-versions.json: ${versionIndex.length} versions`);

  // Summary
  const baseCount = allEmojis.filter((e) => !e.skinToneVariant).length;
  const variantCount = allEmojis.filter((e) => e.skinToneVariant).length;
  console.log(`\n✅ Done! Total: ${allEmojis.length} emojis (${baseCount} base + ${variantCount} variants)`);
  console.log(`   Versions: ${versionIndex.map((v) => `${v.version}(${v.count})`).join(", ")}`);
}

main().catch(console.error);
