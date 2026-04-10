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
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-1">Fancy Text Generator</h1>
        <p className="text-sm text-muted-foreground">
          Type your text below and copy any style. Works on Instagram, Twitter, Discord, and more.
        </p>
      </div>

      <FancyTextClient />
    </div>
  );
}
