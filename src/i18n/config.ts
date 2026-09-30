export const locales = ["en", "zh", "ja", "ko", "es", "ru", "fr", "pt"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "en";

/**
 * Locales with translated emoji names and meanings (src/data/emoji-i18n). In the
 * others (fr, pt) an emoji detail page shows English content under translated
 * chrome — a near-duplicate of the English page — so those pages are noindexed
 * and left out of the sitemap and of hreflang until the content is translated.
 */
export const emojiContentLocales: readonly Locale[] = ["en", "zh", "ja", "ko", "es", "ru"];

export function hasEmojiContent(locale: Locale): boolean {
  return emojiContentLocales.includes(locale);
}

export const localeNames: Record<Locale, string> = {
  en: "English",
  zh: "中文",
  ja: "日本語",
  ko: "한국어",
  es: "Español",
  ru: "Русский",
  fr: "Français",
  pt: "Português",
};

export const localeFlags: Record<Locale, string> = {
  en: "🇺🇸",
  zh: "🇨🇳",
  ja: "🇯🇵",
  ko: "🇰🇷",
  es: "🇪🇸",
  ru: "🇷🇺",
  fr: "🇫🇷",
  pt: "🇧🇷",
};
