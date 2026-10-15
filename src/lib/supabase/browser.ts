"use client";
import { createBrowserClient } from "@supabase/ssr";
import { SUPABASE_ANON_KEY, SUPABASE_URL, hasSupabasePublic } from "./env";

let client: ReturnType<typeof createBrowserClient> | null = null;

/** Null when Supabase is not configured. Callers must handle that. */
export function supabaseBrowser() {
  if (!hasSupabasePublic()) return null;
  client ??= createBrowserClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  return client;
}
