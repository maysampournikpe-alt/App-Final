import { createHash } from "node:crypto";
import { NextResponse } from "next/server";
import { AI } from "@/config/ai";
import { AiError, groqChat, type AiErrorCode } from "@/lib/ai/groq";
import { buildPrompt, cacheKeyParts, extractJson, finalize, findRequestSchema, type FindResult } from "@/lib/ai/finder";
import { CRISIS_REPLY, needsCrisisReply } from "@/lib/ai/coach";
import { allow, clientIp } from "@/lib/rate-limit";
import { hasSupabaseServer, supabaseAdmin, supabaseServer } from "@/lib/supabase/server";

// Web search can take a while. Students see a progress message meanwhile.
export const maxDuration = 60;
export const dynamic = "force-dynamic";

type ApiError = "bad_request" | "crisis" | "rate_limited" | "unavailable" | "busy" | "slow" | "no_results" | "failed";
const fail = (error: ApiError, status: number, extra?: Record<string, unknown>) =>
  NextResponse.json({ ok: false, error, ...extra }, { status, headers: { "Cache-Control": "no-store" } });

const aiToApi = (c: AiErrorCode): ApiError =>
  c === "unavailable" || c === "auth" || c === "model" ? "unavailable" : c === "rate" ? "busy" : c === "timeout" ? "slow" : "failed";

const TTL_MS = 24 * 60 * 60 * 1000;

export async function POST(request: Request) {
  let json: unknown;
  try { json = await request.json(); } catch { return fail("bad_request", 400); }
  const parsed = findRequestSchema.safeParse(json);
  if (!parsed.success) return fail("bad_request", 400);
  const req = parsed.data;

  // Same rule as the Coach: a search about self-harm or abuse gets the fixed, caring answer and real help lines.
  if (needsCrisisReply(`${req.query} ${req.place}`)) return fail("crisis", 200, { text: CRISIS_REPLY[req.lang] });

  const hasDb = hasSupabaseServer();
  // Signed-in students get a bit more room than guests, counted per account instead of per address.
  let who = `ip:${await clientIp()}`, perHour = 10;
  if (hasDb) {
    const { data } = await (await supabaseServer()).auth.getUser();
    if (data.user) { who = `user:${data.user.id}`; perHour = 25; }
  }
  const key = createHash("sha256").update(cacheKeyParts(req)).digest("hex");

  // 1) Shared cache first. A cache hit costs nothing, so it does not count against the limit.
  if (hasDb) {
    try {
      const { data } = await supabaseAdmin().from("search_cache").select("result, created_at").eq("key", key).maybeSingle();
      if (data && Date.now() - new Date(data.created_at as string).getTime() < TTL_MS) {
        return NextResponse.json({ ok: true, cached: true, result: data.result as FindResult }, { headers: { "Cache-Control": "no-store" } });
      }
    } catch { /* cache is an optimization only */ }
    if (!(await allow(`find:${who}`, perHour, 3600))) return fail("rate_limited", 429);
  }

  // 2) Ask the AI. One retry to repair broken JSON, then a friendly error.
  const { system, user } = buildPrompt(req);
  const model = req.filters.category || req.query.split(/\s+/).length <= 6 ? AI.models.searchFast : AI.models.search;
  try {
    const first = await groqChat({
      model, timeoutSeconds: AI.searchTimeoutSeconds, excludeDomains: AI.excludeDomains,
      messages: [{ role: "system", content: system }, { role: "user", content: user }],
    });
    let result = (() => { const j = extractJson(first.content); return j ? finalize(j, first.searched, req) : null; })();
    if (!result) {
      const repaired = await groqChat({
        model: AI.models.chat, timeoutSeconds: AI.chatTimeoutSeconds, temperature: 0,
        messages: [
          { role: "system", content: "Convert the text into ONE valid JSON object with keys listings, notConfirmed, emailScript, phoneScript. Keep the content. Output only JSON." },
          { role: "user", content: first.content.slice(0, 12000) },
        ],
      });
      const j = extractJson(repaired.content);
      result = j ? finalize(j, first.searched, req) : null; // still checked against the real search results
    }
    if (!result) return fail("failed", 502);
    if (!result.listings.length && !result.notConfirmed.length) return fail("no_results", 200);

    if (hasDb) {
      try { await supabaseAdmin().from("search_cache").upsert({ key, result, created_at: new Date().toISOString() }); } catch { /* ignore */ }
    }
    return NextResponse.json({ ok: true, cached: false, result }, { headers: { "Cache-Control": "no-store" } });
  } catch (e) {
    const code = e instanceof AiError ? e.code : "upstream";
    return fail(aiToApi(code), code === "rate" ? 429 : code === "unavailable" || code === "auth" || code === "model" ? 503 : 502);
  }
}
