// Plus-only text styles, shown after the free styles on the Fancy Text page.
// Kept separate from font-transform so the free set (and its SEO pages) never changes.

type PremiumStyle = {
  name: string;
  slug: string;
  transform: (text: string) => string;
};

const LOWER = "abcdefghijklmnopqrstuvwxyz";
const UPPER = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

/** Map a-z/A-Z (and optionally 0-9) through code point tables; everything else passes through. */
function mapChars(
  text: string,
  lower: (i: number) => string | undefined,
  upper: (i: number) => string | undefined,
  digit?: (i: number) => string | undefined,
): string {
  return [...text]
    .map((c) => {
      let i = LOWER.indexOf(c);
      if (i >= 0) return lower(i) ?? c;
      i = UPPER.indexOf(c);
      if (i >= 0) return upper(i) ?? c;
      if (digit && c >= "0" && c <= "9") return digit(c.charCodeAt(0) - 48) ?? c;
      return c;
    })
    .join("");
}

const cp = (n: number) => String.fromCodePoint(n);

/** Add a combining mark after every visible character (spaces stay clean). */
const combine = (mark: string) => (text: string) =>
  [...text].map((c) => (/\s/.test(c) ? c : c + mark)).join("");

export const PREMIUM_STYLES: PremiumStyle[] = [
  {
    name: "Negative Circled",
    slug: "negative-circled",
    transform: (t) =>
      mapChars(
        t,
        (i) => cp(0x1f150 + i),
        (i) => cp(0x1f150 + i),
        (i) => (i === 0 ? "⓿" : cp(0x2775 + i)),
      ),
  },
  {
    name: "Parenthesized",
    slug: "parenthesized",
    transform: (t) =>
      mapChars(
        t,
        (i) => cp(0x249c + i),
        (i) => cp(0x1f110 + i),
        (i) => (i === 0 ? undefined : cp(0x2473 + i)),
      ),
  },
  {
    name: "Regional Letters",
    slug: "regional-letters",
    // Adjacent regional indicators would fuse into flags, so separate them with a zero-width space.
    transform: (t) =>
      [...t]
        .map((c) => {
          const i = LOWER.indexOf(c.toLowerCase());
          return i >= 0 ? cp(0x1f1e6 + i) + "​" : c;
        })
        .join(""),
  },
  {
    name: "Lenticular Brackets",
    slug: "lenticular",
    transform: (t) => [...t].map((c) => (/\s/.test(c) ? c : `【${c}】`)).join(""),
  },
  {
    name: "Sparkles",
    slug: "sparkles",
    transform: (t) => (t.trim() ? `✧･ﾟ: ${t} :･ﾟ✧` : t),
  },
  {
    name: "Hearts",
    slug: "hearts",
    transform: (t) =>
      t
        .split(/(\s+)/)
        .map((part) => (/^\s+$/.test(part) || !part ? part : [...part].join("♡")))
        .join(""),
  },
  { name: "Double Underline", slug: "double-underline", transform: combine("̳") },
  { name: "Overline", slug: "overline", transform: combine("̅") },
  { name: "Wavy Underline", slug: "wavy-underline", transform: combine("̰") },
  { name: "Stinky", slug: "stinky", transform: combine("̾") },
];

export function getPremiumResults(text: string): { name: string; slug: string; result: string }[] {
  return PREMIUM_STYLES.map((s) => ({ name: s.name, slug: s.slug, result: s.transform(text) }));
}
