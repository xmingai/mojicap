import emojiData from "@/data/emoji-data.json";
import categoriesData from "@/data/categories.json";
import emojiVersionsData from "@/data/emoji-versions.json";

export type Emoji = {
  id: number;
  emoji: string;
  name: string;
  slug: string;
  group: string;
  groupSlug: string;
  subgroup: string;
  skinToneSupport: boolean;
  skinToneVariant: boolean;
  emojiVersion: string;
  year: number | null;
  unicode: string;
  keywords: string[];
  meaning?: string;
};

export type Category = {
  slug: string;
  name: string;
  icon: string;
};

export type EmojiVersion = {
  version: string;
  year: number | null;
  count: number;
  sample: string[];
};

export function getAllEmojis(): Emoji[] {
  return emojiData as Emoji[];
}

/**
 * Minimal emoji shape the client grid needs to render a cell + hover card.
 * Dropping keywords/meaning/etc. cuts the initial /emoji payload from ~3.4MB to a fraction;
 * the full dataset is lazy-loaded on the client only for search and version browsing.
 */
export type EmojiLite = Pick<Emoji, "id" | "emoji" | "name" | "slug" | "groupSlug" | "unicode">;

export function getBaseEmojisLite(): EmojiLite[] {
  return (emojiData as Emoji[])
    .filter((e) => !e.skinToneVariant)
    .map((e) => ({ id: e.id, emoji: e.emoji, name: e.name, slug: e.slug, groupSlug: e.groupSlug, unicode: e.unicode }));
}

/** Get only base emojis (no skin tone variants) for the main grid */
export function getBaseEmojis(): Emoji[] {
  return (emojiData as Emoji[]).filter((e) => !e.skinToneVariant);
}

export function getCategories(): Category[] {
  return categoriesData as Category[];
}

export function getEmojiVersions(): EmojiVersion[] {
  return emojiVersionsData as EmojiVersion[];
}

export function getEmojiBySlug(slug: string): Emoji | undefined {
  return (emojiData as Emoji[]).find((e) => e.slug === slug);
}

export function getEmojisByGroup(groupSlug: string): Emoji[] {
  return (emojiData as Emoji[]).filter((e) => e.groupSlug === groupSlug);
}

/** Get skin tone variants of a base emoji */
export function getSkinToneVariants(emoji: Emoji): Emoji[] {
  if (!emoji.skinToneSupport) return [];
  const baseName = emoji.name;
  return (emojiData as Emoji[]).filter(
    (e) =>
      e.skinToneVariant &&
      e.name.startsWith(baseName + ":") &&
      e.id !== emoji.id
  );
}

export function getRelatedEmojis(emoji: Emoji, limit = 12): Emoji[] {
  return (emojiData as Emoji[])
    .filter((e) => e.groupSlug === emoji.groupSlug && e.id !== emoji.id && !e.skinToneVariant)
    .slice(0, limit);
}

export function getAllSlugs(): string[] {
  return (emojiData as Emoji[]).map((e) => e.slug);
}
