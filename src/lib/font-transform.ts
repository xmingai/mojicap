// Unicode font transformation maps
// Each map transforms ASCII a-z, A-Z, 0-9 into Unicode variants

type FontMap = {
  name: string;
  slug: string;
  map: Record<string, string>;
};

function buildMap(lower: string[], upper: string[], digits?: string[]): Record<string, string> {
  const m: Record<string, string> = {};
  const alpha = "abcdefghijklmnopqrstuvwxyz";
  const ALPHA = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const nums = "0123456789";

  for (let i = 0; i < 26; i++) {
    if (lower[i]) m[alpha[i]] = lower[i];
    if (upper[i]) m[ALPHA[i]] = upper[i];
  }
  if (digits) {
    for (let i = 0; i < 10; i++) {
      if (digits[i]) m[nums[i]] = digits[i];
    }
  }
  return m;
}

function rangeMap(lowerStart: number, upperStart: number, digitStart?: number): Record<string, string> {
  const lower = Array.from({ length: 26 }, (_, i) => String.fromCodePoint(lowerStart + i));
  const upper = Array.from({ length: 26 }, (_, i) => String.fromCodePoint(upperStart + i));
  const digits = digitStart
    ? Array.from({ length: 10 }, (_, i) => String.fromCodePoint(digitStart + i))
    : undefined;
  return buildMap(lower, upper, digits);
}

export const FONT_MAPS: FontMap[] = [
  { name: "Bold", slug: "bold", map: rangeMap(0x1d41a, 0x1d400, 0x1d7ce) },
  { name: "Italic", slug: "italic", map: rangeMap(0x1d44e, 0x1d434) },
  { name: "Bold Italic", slug: "bold-italic", map: rangeMap(0x1d482, 0x1d468) },
  {
    name: "Script",
    slug: "script",
    map: (() => {
      const m = rangeMap(0x1d4b6, 0x1d49c);
      // Fix Script uppercase exceptions (Unicode reserved replacements)
      m["B"] = "ℬ"; m["E"] = "ℰ"; m["F"] = "ℱ"; m["H"] = "ℋ";
      m["I"] = "ℐ"; m["L"] = "ℒ"; m["M"] = "ℳ"; m["R"] = "ℛ";
      // Fix Script lowercase exceptions
      m["e"] = "ℯ"; m["g"] = "ℊ"; m["o"] = "ℴ";
      return m;
    })(),
  },
  { name: "Bold Script", slug: "bold-script", map: rangeMap(0x1d4ea, 0x1d4d0) },
  { name: "Fraktur", slug: "fraktur", map: rangeMap(0x1d51e, 0x1d504) },
  { name: "Bold Fraktur", slug: "bold-fraktur", map: rangeMap(0x1d586, 0x1d56c) },
  { name: "Double-Struck", slug: "double-struck", map: rangeMap(0x1d552, 0x1d538, 0x1d7d8) },
  { name: "Sans-Serif", slug: "sans-serif", map: rangeMap(0x1d5ba, 0x1d5a0, 0x1d7e2) },
  { name: "Sans Bold", slug: "sans-bold", map: rangeMap(0x1d5ee, 0x1d5d4, 0x1d7ec) },
  { name: "Sans Italic", slug: "sans-italic", map: rangeMap(0x1d622, 0x1d608) },
  { name: "Sans Bold Italic", slug: "sans-bold-italic", map: rangeMap(0x1d656, 0x1d63c) },
  { name: "Monospace", slug: "monospace", map: rangeMap(0x1d68a, 0x1d670, 0x1d7f6) },
  {
    name: "Circled",
    slug: "circled",
    map: buildMap(
      Array.from({ length: 26 }, (_, i) => String.fromCodePoint(0x24d0 + i)),
      Array.from({ length: 26 }, (_, i) => String.fromCodePoint(0x24b6 + i)),
      ["⓪", "①", "②", "③", "④", "⑤", "⑥", "⑦", "⑧", "⑨"]
    ),
  },
  {
    name: "Squared",
    slug: "squared",
    map: buildMap(
      Array.from({ length: 26 }, (_, i) => String.fromCodePoint(0x1f130 + i)),
      Array.from({ length: 26 }, (_, i) => String.fromCodePoint(0x1f130 + i))
    ),
  },
  {
    name: "Negative Squared",
    slug: "negative-squared",
    map: buildMap(
      Array.from({ length: 26 }, (_, i) => String.fromCodePoint(0x1f170 + i)),
      Array.from({ length: 26 }, (_, i) => String.fromCodePoint(0x1f170 + i))
    ),
  },
  {
    name: "Small Caps",
    slug: "small-caps",
    map: buildMap(
      "ᴀʙᴄᴅᴇғɢʜɪᴊᴋʟᴍɴᴏᴘǫʀsᴛᴜᴠᴡxʏᴢ".split(""),
      "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("")
    ),
  },
  {
    name: "Superscript",
    slug: "superscript",
    map: buildMap(
      "ᵃᵇᶜᵈᵉᶠᵍʰⁱʲᵏˡᵐⁿᵒᵖqʳˢᵗᵘᵛʷˣʸᶻ".split(""),
      "ᴬᴮᶜᴰᴱᶠᴳᴴᴵᴶᴷᴸᴹᴺᴼᴾQᴿˢᵀᵁⱽᵂˣʸᶻ".split(""),
      ["⁰", "¹", "²", "³", "⁴", "⁵", "⁶", "⁷", "⁸", "⁹"]
    ),
  },
  {
    name: "Upside Down",
    slug: "upside-down",
    map: buildMap(
      "ɐqɔpǝɟƃɥᴉɾʞlɯuodbɹsʇnʌʍxʎz".split(""),
      "ɐqɔpǝɟƃɥᴉɾʞlɯuodbɹsʇnʌʍxʎz".split("")
    ),
  },
  {
    name: "Strikethrough",
    slug: "strikethrough",
    map: {}, // handled specially
  },
  {
    name: "Underline",
    slug: "underline",
    map: {}, // handled specially
  },
];

export function transformText(text: string, fontSlug: string): string {
  const font = FONT_MAPS.find((f) => f.slug === fontSlug);
  if (!font) return text;

  if (fontSlug === "strikethrough") {
    return [...text].map((c) => c + "\u0336").join("");
  }
  if (fontSlug === "underline") {
    return [...text].map((c) => c + "\u0332").join("");
  }
  if (fontSlug === "upside-down") {
    const result = [...text]
      .map((c) => font.map[c] || c)
      .reverse()
      .join("");
    return result;
  }

  return [...text].map((c) => font.map[c] || c).join("");
}

export function transformAllFonts(text: string): { name: string; slug: string; result: string }[] {
  return FONT_MAPS.map((font) => ({
    name: font.name,
    slug: font.slug,
    result: transformText(text, font.slug),
  }));
}
