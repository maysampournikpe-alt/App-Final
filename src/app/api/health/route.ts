import { NextResponse } from "next/server";
import { AI } from "@/config/ai";
import { groqChat, groqStream } from "@/lib/ai/groq";
import { hasSupabasePublic } from "@/lib/supabase/env";
import { hasSupabaseServer, supabaseAdmin } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

/**
 * Open /api/health on the live site to see what is configured and what is broken.
 * It reports only yes/no flags and short database error text, never a key or a value.
 */
export async function GET(request: Request) {
  const env = {
    supabaseUrlAndAnonKey: hasSupabasePublic(),
    supabaseServiceRoleKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    groqApiKey: !!process.env.GROQ_API_KEY,
    aiFixtureMode: process.env.AI_FIXTURES === "1",
  };
  const db: Record<string, string> = {};
  if (hasSupabaseServer()) {
    const admin = supabaseAdmin();
    for (const table of ["profiles", "user_data", "recovery_codes", "rate_limits", "search_cache"]) {
      const { error } = await admin.from(table).select("*", { head: true, count: "exact" }).limit(1);
      db[`table:${table}`] = error ? `MISSING OR BLOCKED: ${error.code ?? ""} ${error.message.slice(0, 140)}` : "ok";
    }
    const { data, error } = await admin.rpc("hit_rate_limit", { p_key: "health-check", p_max: 1000, p_window_seconds: 60 });
    db["function:hit_rate_limit"] = error ? `FAILED: ${error.code ?? ""} ${error.message.slice(0, 140)}` : data === true ? "ok" : "returned false";
  }
  let groq = "not tested";
  let groqModels: string[] = [];
  if (env.groqApiKey && !env.aiFixtureMode) {
    try {
      const res = await fetch(`${AI.baseUrl}/models`, { headers: { Authorization: `Bearer ${process.env.GROQ_API_KEY}` }, signal: AbortSignal.timeout(8000) });
      if (res.ok) {
        const ids: string[] = ((await res.json()).data ?? []).map((m: { id: string }) => m.id);
        groq = `ok (${ids.length} models). ` + Object.entries(AI.models).map(([k, m]) => `${k}: ${ids.includes(m) ? "found" : "NOT FOUND in your account"} (${m})`).join("; ");
        groqModels = ids.sort();
      } else groq = `Groq answered ${res.status}${res.status === 401 ? " (key rejected)" : ""}`;
    } catch (e) {
      groq = `could not reach Groq: ${(e as Error).name}`;
    }
  }
  // /api/health?ai=1 also asks the chat model one tiny question and shows what came back.
  let aiTest: string | undefined;
  if (new URL(request.url).searchParams.has("ai") && env.groqApiKey && !env.aiFixtureMode) {
    const ask = { model: AI.models.chat, timeoutSeconds: 20, maxTokens: 50, messages: [{ role: "user" as const, content: "Say hello in five words." }] };
    const timed = async (name: string, run: () => Promise<string>) => {
      const t0 = Date.now();
      try { return `${name}: ${await run()} (${Date.now() - t0} ms)`; }
      catch (e) { return `${name} FAILED: ${(e as Error).message} (${Date.now() - t0} ms)`; }
    };
    const results = await Promise.all([
      timed("chat", async () => `"${(await groqChat(ask)).content.slice(0, 80)}"`),
      timed("stream", async () => {
        const text = await new Response(await groqStream(ask)).text();
        return text.trim() ? `"${text.trim().slice(0, 80)}"` : "but returned NO TEXT";
      }),
    ]);
    aiTest = results.join(" | ");
  }
  const healthy = env.supabaseUrlAndAnonKey && env.supabaseServiceRoleKey && env.groqApiKey && Object.values(db).every((v) => v === "ok");
  return NextResponse.json({ healthy, env, db, groq, groqModels, ...(aiTest ? { aiTest } : {}) }, { headers: { "Cache-Control": "no-store" } });
}
