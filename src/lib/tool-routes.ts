/**
 * Single source of truth for the text-tool routes.
 *
 * Previously the same list was duplicated across the tabs, the [textTool]
 * page, the sitemap and the footer. Adding a tool now means editing only this
 * file (plus the matching dictionary keys and the transform in font-transform).
 *
 * `navKey` indexes dict.textToolsNav; `descKey` (the slug) indexes
 * dict.textToolsDesc. "fancy-text" has its own page; the other slugs are served
 * by the [textTool] dynamic route.
 */
export const TEXT_TOOLS = [
  { slug: "fancy-text", navKey: "fancyText" },
  { slug: "glitch-text", navKey: "glitchText" },
  { slug: "vaporwave-text", navKey: "vaporwaveText" },
  { slug: "tiny-text", navKey: "tinyText" },
  { slug: "morse-code", navKey: "morseCode" },
  { slug: "cursive-text", navKey: "cursiveText" },
  { slug: "old-english-text", navKey: "oldEnglishText" },
  { slug: "bold-text", navKey: "boldText" },
  { slug: "italic-text", navKey: "italicText" },
  { slug: "bubble-text", navKey: "bubbleText" },
  { slug: "square-text", navKey: "squareText" },
  { slug: "upside-down-text", navKey: "upsideDownText" },
  { slug: "strikethrough-text", navKey: "strikethroughText" },
  { slug: "leet-speak", navKey: "leetSpeak" },
  { slug: "weird-text", navKey: "weirdText" },
] as const;

export type TextToolNavKey = (typeof TEXT_TOOLS)[number]["navKey"];

/** Slugs served by the [textTool] dynamic route (everything except fancy-text). */
export const DYNAMIC_TEXT_TOOL_SLUGS = TEXT_TOOLS.filter(
  (t) => t.slug !== "fancy-text"
).map((t) => t.slug);

export function isDynamicTextTool(slug: string): boolean {
  return (DYNAMIC_TEXT_TOOL_SLUGS as readonly string[]).includes(slug);
}
