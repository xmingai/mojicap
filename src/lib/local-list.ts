/**
 * A small localStorage-backed ordered list shared by every component that
 * reads it (useSyncExternalStore), kept in step across browser tabs.
 *
 * The server snapshot is always empty, so static HTML never depends on a
 * visitor's storage and hydration can't mismatch.
 */

const EMPTY: readonly string[] = Object.freeze([]);

export type LocalList = {
  get: () => readonly string[];
  getServerSnapshot: () => readonly string[];
  set: (next: readonly string[]) => void;
  subscribe: (listener: () => void) => () => void;
};

export function createLocalList(key: string, max: number): LocalList {
  let cache: readonly string[] | null = null;
  const listeners = new Set<() => void>();

  const read = (): readonly string[] => {
    if (cache) return cache;
    try {
      const parsed: unknown = JSON.parse(localStorage.getItem(key) ?? "[]");
      cache = Array.isArray(parsed) ? parsed.filter((x): x is string => typeof x === "string").slice(0, max) : EMPTY;
    } catch {
      cache = EMPTY;
    }
    return cache;
  };

  return {
    get: () => (typeof window === "undefined" ? EMPTY : read()),
    getServerSnapshot: () => EMPTY,
    set(next) {
      cache = Object.freeze(next.slice(0, max));
      try {
        localStorage.setItem(key, JSON.stringify(cache));
      } catch {}
      listeners.forEach((l) => l());
    },
    subscribe(listener) {
      listeners.add(listener);
      const onStorage = (e: StorageEvent) => {
        if (e.key !== key) return;
        cache = null;
        listener();
      };
      window.addEventListener("storage", onStorage);
      return () => {
        listeners.delete(listener);
        window.removeEventListener("storage", onStorage);
      };
    },
  };
}

export const recentList = createLocalList("mojicap-recent", 50);
export const favoriteList = createLocalList("mojicap-favorites", 500);
