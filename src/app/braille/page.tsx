import type { Metadata } from "next";
import { BrailleClient } from "./braille-client";

export const metadata: Metadata = {
  title: "Braille & Morse Code Translator — Text to Braille Generator",
  description:
    "Convert regular text into Braille dots or Morse code dots and dashes instantly. Copy and paste the results anywhere.",
};

export default function BraillePage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <BrailleClient />
    </div>
  );
}
