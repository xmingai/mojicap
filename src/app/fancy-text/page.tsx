import type { Metadata } from "next";
import { FancyTextClient } from "./fancy-text-client";

export const metadata: Metadata = {
  title: "Fancy Text Generator — Cool Fonts Copy & Paste",
  description:
    "Transform your text into 20+ fancy Unicode font styles. Perfect for Instagram bios, Twitter names, Discord nicknames, and more. Copy & paste instantly.",
};

export default function FancyTextPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <FancyTextClient />
    </div>
  );
}
