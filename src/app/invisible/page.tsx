import type { Metadata } from "next";
import { InvisibleClient } from "./invisible-client";

export const metadata: Metadata = {
  title: "Invisible Characters — Blank Text Copy & Paste",
  description:
    "Copy & paste invisible characters, zero-width spaces, and blank text. Perfect for empty names in Among Us, Discord, PUBG, and more.",
};

export default function InvisiblePage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <InvisibleClient />
    </div>
  );
}
