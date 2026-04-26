import type { Locale } from "./config";

// Use dynamic imports for code splitting
const dictionaries = {
  en: () => import("./dictionaries/en.json").then((m) => m.default),
  zh: () => import("./dictionaries/zh.json").then((m) => m.default),
  ja: () => import("./dictionaries/ja.json").then((m) => m.default),
  ko: () => import("./dictionaries/ko.json").then((m) => m.default),
  es: () => import("./dictionaries/es.json").then((m) => m.default),
  ru: () => import("./dictionaries/ru.json").then((m) => m.default),
  fr: () => import("./dictionaries/fr.json").then((m) => m.default),
  pt: () => import("./dictionaries/pt.json").then((m) => m.default),
};

export type Dictionary = Awaited<ReturnType<(typeof dictionaries)["en"]>>;

export async function getDictionary(locale: Locale): Promise<Dictionary> {
  return dictionaries[locale]();
}

// Synchronous version for client components — pre-loaded
import en from "./dictionaries/en.json";
import zh from "./dictionaries/zh.json";
import ja from "./dictionaries/ja.json";
import ko from "./dictionaries/ko.json";
import es from "./dictionaries/es.json";
import ru from "./dictionaries/ru.json";
import fr from "./dictionaries/fr.json";
import pt from "./dictionaries/pt.json";

const syncDictionaries: Record<Locale, Dictionary> = { en, zh, ja, ko, es, ru, fr, pt };

export function getDictionarySync(locale: Locale): Dictionary {
  return syncDictionaries[locale] || syncDictionaries.en;
}
