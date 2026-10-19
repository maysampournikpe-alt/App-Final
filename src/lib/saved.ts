"use client";
import type { Listing } from "./ai/finder";
import { useLocalDoc } from "./local-doc";

export interface SavedListing extends Listing { savedAt: number }
const NONE: SavedListing[] = [];

/** My Saved. Lives on the device and syncs to the account like every other tool. */
export function useSaved() {
  const [saved, setSaved] = useLocalDoc<SavedListing[]>("saved-opportunities", NONE);
  return {
    saved,
    isSaved: (l: Listing) => saved.some((s) => s.sourceUrl === l.sourceUrl),
    toggle: (l: Listing) =>
      setSaved(saved.some((s) => s.sourceUrl === l.sourceUrl) ? saved.filter((s) => s.sourceUrl !== l.sourceUrl) : [{ ...l, savedAt: Date.now() }, ...saved]),
  };
}
