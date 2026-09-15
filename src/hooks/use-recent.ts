"use client";

import { useCallback, useSyncExternalStore } from "react";
import { recentList } from "@/lib/local-list";

export function useRecent() {
  const recent = useSyncExternalStore(recentList.subscribe, recentList.get, recentList.getServerSnapshot);
  const addRecent = useCallback((emoji: string) => {
    recentList.set([emoji, ...recentList.get().filter((e) => e !== emoji)]);
  }, []);
  return { recent, addRecent };
}
