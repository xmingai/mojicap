import Fuse from "fuse.js";
import type { Emoji } from "./emoji";

let fuseInstance: Fuse<Emoji> | null = null;

export function getSearchEngine(emojis: Emoji[]): Fuse<Emoji> {
  if (!fuseInstance) {
    fuseInstance = new Fuse(emojis, {
      keys: [
        { name: "name", weight: 0.6 },
        { name: "keywords", weight: 0.3 },
        { name: "group", weight: 0.1 },
      ],
      threshold: 0.3,
      includeScore: true,
      minMatchCharLength: 1,
    });
  }
  return fuseInstance;
}

export function searchEmojis(emojis: Emoji[], query: string): Emoji[] {
  if (!query.trim()) return emojis;
  const fuse = getSearchEngine(emojis);
  return fuse.search(query, { limit: 100 }).map((r) => r.item);
}
