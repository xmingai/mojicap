import type { Metadata } from "next";
import { getAllEmojis, getCategories } from "@/lib/emoji";
import { EmojiGrid } from "@/components/emoji-grid";

export const metadata: Metadata = {
  title: "Emoji Copy & Paste — All Emojis in One Place",
  description:
    "Browse and copy all 1,900+ emojis. Click to instantly copy any emoji to your clipboard. Search by name or browse by category.",
};

export default function EmojiPage() {
  const emojis = getAllEmojis();
  const categories = getCategories();

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <EmojiGrid emojis={emojis} categories={categories} />
    </div>
  );
}
