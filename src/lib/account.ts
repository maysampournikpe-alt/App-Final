"use client";
// Who is signed in on this device. Fetched from /api/me and shared across components.
import { useSyncExternalStore } from "react";

export interface AccountProfile {
  username: string;
  grade: number | null;
  school: string | null;
  lang: "en" | "es";
  interests: string[];
  why: string | null;
}
export type Account =
  | { status: "loading" }
  | { status: "guest" }
  | { status: "unavailable" }
  | { status: "signed-in"; profile: AccountProfile };

const LOADING: Account = { status: "loading" };
const listeners = new Set<() => void>();
let state: Account = LOADING;
let started = false;

export async function refreshAccount() {
  try {
    const res = await fetch("/api/me", { cache: "no-store" });
    const json = await res.json();
    state = json.status === "signed-in" && json.profile ? { status: "signed-in", profile: json.profile } : { status: json.status === "unavailable" ? "unavailable" : "guest" };
  } catch {
    // Offline: keep whatever we knew, defaulting to guest so every tool still works.
    if (state.status === "loading") state = { status: "guest" };
  }
  listeners.forEach((l) => l());
}

export function useAccount(): Account {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      if (!started) {
        started = true;
        void refreshAccount();
      }
      return () => listeners.delete(cb);
    },
    () => state,
    () => LOADING, // one shared object: React requires the server snapshot to be the same value each call
  );
}
