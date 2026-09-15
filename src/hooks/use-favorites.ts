"use client";

import { useCallback, useSyncExternalStore } from "react";
import { favoriteList } from "@/lib/local-list";

/** Favorites work for everyone on this device; MojiCap Plus syncs them across devices. */
export function useFavorites() {
  const favorites = useSyncExternalStore(favoriteList.subscribe, favoriteList.get, favoriteList.getServerSnapshot);
  const isFavorite = useCallback((emoji: string) => favorites.includes(emoji), [favorites]);
  const toggleFavorite = useCallback((emoji: string): boolean => {
    const current = favoriteList.get();
    const adding = !current.includes(emoji);
    favoriteList.set(adding ? [emoji, ...current] : current.filter((e) => e !== emoji));
    return adding;
  }, []);
  return { favorites, isFavorite, toggleFavorite };
}
