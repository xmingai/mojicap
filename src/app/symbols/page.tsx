import type { Metadata } from "next";
import { SymbolsClient } from "./symbols-client";

export const metadata: Metadata = {
  title: "Special Symbols & Characters — Copy & Paste",
  description:
    "Browse 500+ special symbols and characters. Arrows, stars, hearts, math symbols, currency signs, and more. Click to copy instantly.",
};

export default function SymbolsPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <SymbolsClient />
    </div>
  );
}
