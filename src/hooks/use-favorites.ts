"use client";

import { useState, useEffect, useCallback } from "react";

const STORAGE_KEY = "emojikit-favorites";

export function useFavorites() {
  const [favorites, setFavorites] = useState<string[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) setFavorites(JSON.parse(stored));
    } catch {}
  }, []);

  const toggleFavorite = useCallback((emoji: string) => {
    setFavorites((prev) => {
      const next = prev.includes(emoji) ? prev.filter((e) => e !== emoji) : [...prev, emoji];
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {}
      return next;
    });
  }, []);

  const isFavorite = useCallback(
    (emoji: string) => favorites.includes(emoji),
    [favorites]
  );

  return { favorites, toggleFavorite, isFavorite };
}
