"use client";

import { useState, useEffect, useCallback } from "react";

const STORAGE_KEY = "emojikit-recent";
const MAX_RECENT = 50;

export function useRecent() {
  const [recent, setRecent] = useState<string[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) setRecent(JSON.parse(stored));
    } catch {}
  }, []);

  const addRecent = useCallback((emoji: string) => {
    setRecent((prev) => {
      const next = [emoji, ...prev.filter((e) => e !== emoji)].slice(0, MAX_RECENT);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {}
      return next;
    });
  }, []);

  return { recent, addRecent };
}
