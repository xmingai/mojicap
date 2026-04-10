import type { Metadata } from "next";
import { CombosClient } from "./combos-client";

export const metadata: Metadata = {
  title: "Emoji Combos & Kaomoji — Copy & Paste Combinations",
  description:
    "Browse 100+ curated emoji combinations, aesthetic combos, and kaomoji text faces. Perfect for Instagram, TikTok, and Discord. Copy & paste instantly.",
};

export default function CombosPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-1">Emoji Combos & Kaomoji</h1>
        <p className="text-sm text-muted-foreground">
          Curated emoji combinations and text faces. Click to copy.
        </p>
      </div>

      <CombosClient />
    </div>
  );
}
