import type { Metadata } from "next";
import { getAllEmojis, getBaseEmojis, getCategories, getEmojiVersions } from "@/lib/emoji";
import { EmojiGrid } from "@/components/emoji-grid";

export const metadata: Metadata = {
  title: "Emoji Copy & Paste — All 3,700+ Emojis (Unicode 16.0)",
  description:
    "Browse and copy all 3,700+ emojis including skin tone variants. Full Unicode 16.0 support. Click to instantly copy any emoji to your clipboard.",
};

export default function EmojiPage() {
  const allEmojis = getAllEmojis();
  const baseEmojis = getBaseEmojis();
  const categories = getCategories();
  const versions = getEmojiVersions();

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <EmojiGrid emojis={baseEmojis} allEmojis={allEmojis} categories={categories} versions={versions} />
    </div>
  );
}

