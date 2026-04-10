import type { Metadata } from "next";
import { KaomojiClient } from "./kaomoji-client";

export const metadata: Metadata = {
  title: "Kaomoji — Japanese Emoticons Copy & Paste",
  description:
    "Browse 3,000+ Japanese emoticons and kaomoji. Copy cute text faces for any emotion: happy, sad, angry, table flip, animals and more.",
};

export default function KaomojiPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <KaomojiClient />
    </div>
  );
}
