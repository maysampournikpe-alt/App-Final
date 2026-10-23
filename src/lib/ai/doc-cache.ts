import "server-only";
import { hasSupabaseServer, supabaseAdmin } from "@/lib/supabase/server";

/**
 * A shared cache for study documents (notes, vocabulary, cram sheets). The first student who opens a topic pays for the AI
 * call, and everyone after gets the saved copy instantly. It uses the same table as the Finder cache (search_cache) with a
 * "doc:" key. A broken or missing table just means no cache: everything still works, only slower and more expensive.
 */
export interface CachedDoc<T> { value: T; compact: boolean; ageMs: number }

export async function docGet<T>(key: string): Promise<CachedDoc<T> | null> {
  if (!hasSupabaseServer()) return null;
  try {
    const { data } = await supabaseAdmin().from("search_cache").select("result, created_at").eq("key", key).maybeSingle();
    const r = data?.result as { value?: T; compact?: boolean } | undefined;
    if (!r || r.value === undefined) return null;
    return { value: r.value, compact: !!r.compact, ageMs: Date.now() - new Date(data!.created_at as string).getTime() };
  } catch (e) {
    console.error("doc cache read failed (generating instead):", (e as { message?: string })?.message ?? e);
    return null;
  }
}

export async function docPut(key: string, value: unknown, compact: boolean): Promise<void> {
  if (!hasSupabaseServer()) return;
  try {
    const { error } = await supabaseAdmin().from("search_cache").upsert({ key, result: { value, compact }, created_at: new Date().toISOString() });
    if (error) throw error;
  } catch (e) {
    console.error("doc cache write failed (ignored):", (e as { message?: string })?.message ?? e);
  }
}

/** A saved copy is used for 30 days, but a shortened copy (written while Claude was off) only for 2 days. */
export const DOC_FULL_TTL_MS = 30 * 24 * 3600_000;
export const DOC_COMPACT_TTL_MS = 2 * 24 * 3600_000;
export const docFresh = (d: CachedDoc<unknown>, wantFull: boolean): boolean => d.ageMs < (d.compact ? DOC_COMPACT_TTL_MS : DOC_FULL_TTL_MS) && !(wantFull && d.compact && d.ageMs > 5 * 60_000);
