import { NextResponse } from "next/server";
import { AI } from "@/config/ai";
import { AiError, groqChat } from "@/lib/ai/groq";
import { extractJson } from "@/lib/ai/finder";
import { buildPlanPrompt, planRequestSchema, toPlan } from "@/lib/plan";
import { allow, clientIp } from "@/lib/rate-limit";
import { hasSupabaseServer, supabaseServer } from "@/lib/supabase/server";

export const maxDuration = 60;
export const dynamic = "force-dynamic";

const fail = (error: string, status: number) => NextResponse.json({ ok: false, error }, { status, headers: { "Cache-Control": "no-store" } });

export async function POST(request: Request) {
  let json: unknown;
  try { json = await request.json(); } catch { return fail("bad_request", 400); }
  const parsed = planRequestSchema.safeParse(json);
  if (!parsed.success) return fail("bad_request", 400);
  const req = parsed.data;

  if (hasSupabaseServer()) {
    let who = `ip:${await clientIp()}`, perHour = 8;
    const { data } = await (await supabaseServer()).auth.getUser();
    if (data.user) { who = `user:${data.user.id}`; perHour = 20; }
    if (!(await allow(`plan:${who}`, perHour, 3600))) return fail("rate_limited", 429);
  }

  const { system, user } = buildPlanPrompt(req);
  try {
    const first = await groqChat({ model: AI.models.chat, timeoutSeconds: AI.chatTimeoutSeconds, temperature: 0.4, messages: [{ role: "system", content: system }, { role: "user", content: user }] });
    let plan = (() => { const j = extractJson(first.content); return j ? toPlan(j, req) : null; })();
    if (!plan) {
      const fix = await groqChat({
        model: AI.models.chat, timeoutSeconds: AI.chatTimeoutSeconds, temperature: 0,
        messages: [{ role: "system", content: "Convert the text into ONE valid JSON object with keys title, summary, searchIdeas, horizons. Keep the content. Output only JSON." }, { role: "user", content: first.content.slice(0, 10000) }],
      });
      const j = extractJson(fix.content);
      plan = j ? toPlan(j, req) : null;
    }
    return plan ? NextResponse.json({ ok: true, plan }, { headers: { "Cache-Control": "no-store" } }) : fail("failed", 502);
  } catch (e) {
    const code = e instanceof AiError ? e.code : "upstream";
    if (code === "rate") return fail("busy", 429);
    if (code === "unavailable" || code === "auth" || code === "model") return fail("unavailable", 503);
    return fail(code === "timeout" ? "slow" : "failed", 502);
  }
}
