"use client";
// Storage for every [LOCAL] tool. Data lives on the device, works offline, and is
// mirrored to the student's account (table user_data) when they are signed in.
// Newest write wins. Guests keep everything on the device until they sign in.
import { useCallback, useSyncExternalStore } from "react";
import { supabaseBrowser } from "./supabase/browser";

const PREFIX = "rumbo:data:";
interface DocRow { key: string; value: unknown; updated_at: string }
interface Stored<T> { v: T; t: number }
const listeners = new Map<string, Set<() => void>>();
const memo = new Map<string, { raw: string | null; parsed: Stored<unknown> | null }>();

function read<T>(key: string): Stored<T> | null {
  let raw: string | null = null;
  try { raw = localStorage.getItem(PREFIX + key); } catch { /* blocked */ }
  const hit = memo.get(key);
  if (hit && hit.raw === raw) return hit.parsed as Stored<T> | null;
  let parsed: Stored<T> | null = null;
  try { parsed = raw ? (JSON.parse(raw) as Stored<T>) : null; } catch { /* corrupt: treat as empty */ }
  memo.set(key, { raw, parsed });
  return parsed;
}
function notify(key: string) { listeners.get(key)?.forEach((l) => l()); }

const pushTimers = new Map<string, ReturnType<typeof setTimeout>>();
async function push(key: string, doc: Stored<unknown>) {
  const sb = supabaseBrowser();
  if (!sb) return;
  const { data } = await sb.auth.getUser();
  if (!data.user) return;
  await sb.from("user_data").upsert({ user_id: data.user.id, key, value: doc.v, updated_at: new Date(doc.t).toISOString() });
}

export function writeDoc<T>(key: string, value: T) {
  const doc: Stored<T> = { v: value, t: Date.now() };
  try { localStorage.setItem(PREFIX + key, JSON.stringify(doc)); } catch { /* storage full or blocked */ }
  notify(key);
  clearTimeout(pushTimers.get(key));
  pushTimers.set(key, setTimeout(() => void push(key, doc).catch(() => {}), 1500));
}

/** One-off read for non-React code. */
export const readDocValue = <T,>(key: string): T | undefined => read<T>(key)?.v;

/** Read and write one document. `fallback` must be a stable reference (define it outside the component). */
export function useLocalDoc<T>(key: string, fallback: T): [T, (next: T | ((prev: T) => T)) => void] {
  const value = useSyncExternalStore(
    (cb) => {
      const set = listeners.get(key) ?? listeners.set(key, new Set()).get(key)!;
      set.add(cb);
      return () => set.delete(cb);
    },
    () => read<T>(key)?.v ?? fallback,
    () => fallback,
  );
  const set = useCallback(
    (next: T | ((prev: T) => T)) => {
      const prev = read<T>(key)?.v ?? fallback;
      writeDoc(key, typeof next === "function" ? (next as (p: T) => T)(prev) : next);
    },
    [key, fallback],
  );
  return [value, set];
}

/**
 * Call after sign-in or sign-up. Moves guest data into the account and pulls newer
 * account data onto this device, so nothing is lost either way.
 */
export async function syncAllDocs(): Promise<void> {
  const sb = supabaseBrowser();
  if (!sb) return;
  const { data: auth } = await sb.auth.getUser();
  if (!auth.user) return;
  const { data: remote } = await sb.from("user_data").select("key, value, updated_at");
  const remoteMap = new Map(((remote ?? []) as DocRow[]).map((r) => [r.key, r]));

  const localKeys: string[] = [];
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k?.startsWith(PREFIX)) localKeys.push(k.slice(PREFIX.length));
    }
  } catch { /* blocked */ }

  const uploads: { user_id: string; key: string; value: unknown; updated_at: string }[] = [];
  for (const key of localKeys) {
    const local = read<unknown>(key);
    const r = remoteMap.get(key);
    if (!local) continue;
    if (!r || new Date(r.updated_at).getTime() < local.t) {
      uploads.push({ user_id: auth.user.id, key, value: local.v, updated_at: new Date(local.t).toISOString() });
    }
  }
  for (const [key, r] of remoteMap) {
    const local = read<unknown>(key);
    const t = new Date(r.updated_at).getTime();
    if (!local || local.t < t) {
      try { localStorage.setItem(PREFIX + key, JSON.stringify({ v: r.value, t })); } catch { /* ignore */ }
      notify(key);
    }
  }
  if (uploads.length) await sb.from("user_data").upsert(uploads);
}
