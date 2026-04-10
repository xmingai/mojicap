import type { Metadata } from "next";
import { DividersClient } from "./dividers-client";

export const metadata: Metadata = {
  title: "Text Dividers & Borders — Copy & Paste Line Separators",
  description:
    "Aesthetic text dividers, line separators, and borders to copy & paste. Perfect for Notion, Tumblr, Amino, Instagram, and Discord formatting.",
};

export default function DividersPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <DividersClient />
    </div>
  );
}
