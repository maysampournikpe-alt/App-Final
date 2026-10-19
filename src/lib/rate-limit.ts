import "server-only";
import { headers } from "next/headers";
import { supabaseAdmin } from "./supabase/server";

/** Best guess at the caller's address behind Vercel's proxy. Used only to count requests. */
export async function clientIp(): Promise<string> {
  const h = await headers();
  return h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip") || "unknown";
}

/**
 * Counts live in Supabase because serverless functions share no memory.
 * Returns false only when the student really is over the limit. If the check itself breaks (database
 * down, function missing), it logs the reason on the server and lets the request through, so a
 * problem on our side never shows up to a student as "you sent too many messages".
 */
export async function allow(key: string, max: number, windowSeconds: number, failOpen = true): Promise<boolean> {
  try {
    const { data, error } = await supabaseAdmin().rpc("hit_rate_limit", {
      p_key: key,
      p_max: max,
      p_window_seconds: windowSeconds,
    });
    if (error) throw error;
    return data === true;
  } catch (e) {
    console.error("rate limit check failed (letting the request through):", (e as { message?: string })?.message ?? e);
    return failOpen;
  }
}
