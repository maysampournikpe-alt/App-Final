"use client";
// Device-level preferences. Stored in localStorage so they work offline and for
// guests. (Signed-in sync arrives with accounts in Step 1A.)
import { useSyncExternalStore } from "react";
import type { Lang } from "@/config/features";
import { DEFAULT_BOTTOM_TABS } from "@/config/features";
import { STORAGE_KEY } from "./prefs-boot";

export interface Prefs {
  lang: Lang;
  theme: "system" | "light" | "dark";
  text: "normal" | "large" | "xlarge";
  dyslexia: boolean;
  lowData: boolean;
  motion: "system" | "reduce";
  sidebarCollapsed: boolean;
  closedGroups: string[];
  openTabs: string[];
  pinned: string[]; // tool keys, "tab/tool"
  hidden: string[]; // tool keys
  bottomTabs: string[];
}

export const DEFAULT_PREFS: Prefs = {
  lang: "en",
  theme: "system",
  text: "normal",
  dyslexia: false,
  lowData: false,
  motion: "system",
  sidebarCollapsed: false,
  closedGroups: [],
  openTabs: [],
  pinned: [],
  hidden: [],
  bottomTabs: [...DEFAULT_BOTTOM_TABS],
};

const listeners = new Set<() => void>();
let cache: Prefs = DEFAULT_PREFS;
let loaded = false;

function load() {
  if (loaded) return;
  loaded = true;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) cache = { ...DEFAULT_PREFS, ...JSON.parse(raw) };
  } catch {
    /* storage can be blocked; fall back to defaults */
  }
}

/** Mirror prefs onto <html> so CSS can react without a React render. */
export function applyPrefs(p: Prefs) {
  const el = document.documentElement;
  el.lang = p.lang;
  if (p.theme === "system") el.removeAttribute("data-theme");
  else el.dataset.theme = p.theme;
  el.dataset.text = p.text;
  el.dataset.dyslexia = String(p.dyslexia);
  el.dataset.lowdata = String(p.lowData);
  if (p.motion === "reduce") el.dataset.motion = "reduce";
  else el.removeAttribute("data-motion");
}

export function setPrefs(patch: Partial<Prefs>) {
  load();
  cache = { ...cache, ...patch };
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cache));
  } catch {
    /* ignore */
  }
  applyPrefs(cache);
  listeners.forEach((l) => l());
}

export function togglePref(list: "pinned" | "hidden" | "openTabs" | "closedGroups", value: string) {
  load();
  const cur = cache[list];
  setPrefs({ [list]: cur.includes(value) ? cur.filter((v) => v !== value) : [...cur, value] });
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

export function usePrefs(): Prefs {
  return useSyncExternalStore(
    subscribe,
    () => {
      load();
      return cache;
    },
    () => DEFAULT_PREFS,
  );
}
