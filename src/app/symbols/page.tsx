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
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-1">Special Symbols & Characters</h1>
        <p className="text-sm text-muted-foreground">
          Click any symbol to copy it to your clipboard. Browse by category or search.
        </p>
      </div>

      <SymbolsClient />
    </div>
  );
}
