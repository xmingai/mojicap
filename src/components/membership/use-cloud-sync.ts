"use client";

import { useEffect } from "react";
import { favoriteList, recentList, type LocalList } from "@/lib/local-list";
import { LIMITS, mergeOrdered } from "@/lib/membership/sync";

const SYNCED_FLAG = "mojicap-cloud-synced";

async function getRemote(path: string): Promise<string[] | null> {
  const res = await fetch(path, { cache: "no-store" });
  if (!res.ok) return null;
  const body = (await res.json()) as { items?: string[] };
  return Array.isArray(body.items) ? body.items : null;
}

function putRemote(path: string, items: readonly string[]) {
  return fetch(path, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ items }),
  }).catch(() => undefined);
}

/**
 * Keeps favorites (and, for Plus, recents) in step with the account.
 *
 * First sync on a device merges local and remote (nothing picked before signing
 * in is lost). After that the account is the source of truth on load, so an
 * emoji removed on one device doesn't come back from another device's stale copy.
 * Local changes are pushed shortly after they happen.
 */
export function useCloudSync({ signedIn, isMember }: { signedIn: boolean; isMember: boolean }) {
  useEffect(() => {
    if (!signedIn) return;
    let cancelled = false;
    let applyingRemote = false;
    const timers = new Map<LocalList, ReturnType<typeof setTimeout>>();

    // Favorites sync on any account (capped for free ones by the API); recents are Plus.
    const lists: { list: LocalList; path: string; max: number }[] = [
      { list: favoriteList, path: "/api/sync/favorites/", max: isMember ? LIMITS.favorites : LIMITS.freeFavorites },
      ...(isMember ? [{ list: recentList, path: "/api/sync/recents/", max: LIMITS.recents }] : []),
    ];

    (async () => {
      let firstSync = true;
      try {
        firstSync = localStorage.getItem(SYNCED_FLAG) !== "1";
      } catch {}

      for (const { list, path, max } of lists) {
        const remote = await getRemote(path);
        if (cancelled || !remote) continue;
        const local = [...list.get()];
        const next = firstSync ? mergeOrdered(local, remote, max) : remote;
        applyingRemote = true;
        list.set(next);
        applyingRemote = false;
        if (firstSync) await putRemote(path, next);
      }
      try {
        if (!cancelled) localStorage.setItem(SYNCED_FLAG, "1");
      } catch {}
    })();

    const unsubscribes = lists.map(({ list, path }) =>
      list.subscribe(() => {
        if (applyingRemote) return;
        clearTimeout(timers.get(list));
        timers.set(list, setTimeout(() => putRemote(path, list.get()), 1200));
      }),
    );

    return () => {
      cancelled = true;
      unsubscribes.forEach((u) => u());
      timers.forEach((t) => clearTimeout(t));
    };
  }, [signedIn, isMember]);
}
