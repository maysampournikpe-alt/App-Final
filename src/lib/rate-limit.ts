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
 * Fails closed for sign-in style routes (`failOpen: false`) and open for gentle ones.
 */
export async function allow(key: string, max: number, windowSeconds: number, failOpen = false): Promise<boolean> {
  try {
    const { data, error } = await supabaseAdmin().rpc("hit_rate_limit", {
      p_key: key,
      p_max: max,
      p_window_seconds: windowSeconds,
    });
    if (error) throw error;
    return data === true;
  } catch {
    return failOpen;
  }
}
