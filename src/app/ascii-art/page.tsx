import type { Metadata } from "next";
import { AsciiArtClient } from "./ascii-art-client";

export const metadata: Metadata = {
  title: "ASCII Art — Text Art Copy & Paste",
  description:
    "Copy and paste large text pictures, one-line ascii weapons, animals, and retro text art for comments and chat.",
};

export default function AsciiArtPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <AsciiArtClient />
    </div>
  );
}
