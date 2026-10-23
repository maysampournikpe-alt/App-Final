import "server-only";
import { hasSupabaseServer } from "@/lib/supabase/server";

/** How many Claude calls the whole site may make per day. Claude is billed per use, so this caps the worst-case bill. 0 turns Claude off. */
export const claudeDailyCap = (): number => {
  const n = Number(process.env.CLAUDE_DAILY_CALLS);
  return Number.isFinite(n) && n >= 0 && process.env.CLAUDE_DAILY_CALLS !== undefined && process.env.CLAUDE_DAILY_CALLS !== "" ? Math.floor(n) : 1500;
};

/**
 * Counts every Claude call in Supabase, shared by all serverless functions, and says no once the day's cap is used.
 * When it says no, the app uses Groq (free) instead. If the counter itself is broken it also says no, so a problem
 * on our side can never turn into a surprise bill. Local work without a database is not limited.
 */
export async function claudeBudgetOk(): Promise<boolean> {
  const cap = claudeDailyCap();
  if (cap === 0) return false;
  if (!hasSupabaseServer()) return true;
  const { allow } = await import("@/lib/rate-limit");
  return allow("claude:day", cap, 86400, false);
}
