import emojiData from "@/data/emoji-data.json";
import categoriesData from "@/data/categories.json";

export type Emoji = {
  id: number;
  emoji: string;
  name: string;
  slug: string;
  group: string;
  groupSlug: string;
  skinToneSupport: boolean;
  unicode: string;
  keywords: string[];
};

export type Category = {
  slug: string;
  name: string;
  icon: string;
};

export function getAllEmojis(): Emoji[] {
  return emojiData as Emoji[];
}

export function getCategories(): Category[] {
  return categoriesData as Category[];
}

export function getEmojiBySlug(slug: string): Emoji | undefined {
  return (emojiData as Emoji[]).find((e) => e.slug === slug);
}

export function getEmojisByGroup(groupSlug: string): Emoji[] {
  return (emojiData as Emoji[]).filter((e) => e.groupSlug === groupSlug);
}

export function getRelatedEmojis(emoji: Emoji, limit = 12): Emoji[] {
  return (emojiData as Emoji[])
    .filter((e) => e.groupSlug === emoji.groupSlug && e.id !== emoji.id)
    .slice(0, limit);
}

export function getAllSlugs(): string[] {
  return (emojiData as Emoji[]).map((e) => e.slug);
}
