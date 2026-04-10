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
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-1">Emoji Copy & Paste</h1>
        <p className="text-sm text-muted-foreground">
          Click any emoji to copy it to your clipboard. {emojis.length.toLocaleString()} emojis available.
        </p>
      </div>

      <EmojiGrid emojis={emojis} categories={categories} />
    </div>
  );
}
