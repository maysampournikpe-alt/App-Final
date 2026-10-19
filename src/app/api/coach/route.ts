import { NextResponse } from "next/server";
import { z } from "zod";
import { AI } from "@/config/ai";
import { AiError, groqStream } from "@/lib/ai/groq";
import { COACH_MODES, CRISIS_REPLY, needsCrisisReply, systemPrompt, trimHistory } from "@/lib/ai/coach";
import { allow, clientIp } from "@/lib/rate-limit";
import { hasSupabaseServer, supabaseServer } from "@/lib/supabase/server";

export const maxDuration = 60;
export const dynamic = "force-dynamic";

const schema = z.object({
  mode: z.enum(COACH_MODES as [string, ...string[]]).default("chat"),
  lang: z.enum(["en", "es"]).default("en"),
  grade: z.number().int().min(5).max(12).nullable().default(null),
  interests: z.array(z.string().trim().max(40)).max(10).default([]),
  messages: z.array(z.object({ role: z.enum(["user", "assistant"]), content: z.string().max(4000) })).min(1).max(60),
});

const textHeaders = { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store", "X-Accel-Buffering": "no" };
const err = (error: string, status: number) => NextResponse.json({ ok: false, error }, { status, headers: { "Cache-Control": "no-store" } });

export async function POST(request: Request) {
  let json: unknown;
  try { json = await request.json(); } catch { return err("bad_request", 400); }
  const parsed = schema.safeParse(json);
  if (!parsed.success || parsed.data.messages.at(-1)?.role !== "user") return err("bad_request", 400);
  const req = parsed.data;
  const last = req.messages.at(-1)!.content;

  // Crisis messages get a fixed, caring answer with real help lines. No AI, no limit, always instant.
  if (needsCrisisReply(last)) return new Response(CRISIS_REPLY[req.lang], { headers: { ...textHeaders, "X-Rumbo-Crisis": "1" } });

  if (hasSupabaseServer()) {
    let who = `ip:${await clientIp()}`, perHour = 30;
    const { data } = await (await supabaseServer()).auth.getUser();
    if (data.user) { who = `user:${data.user.id}`; perHour = 80; }
    if (!(await allow(`coach:${who}`, perHour, 3600))) return err("rate_limited", 429);
  }

  try {
    const stream = await groqStream({
      model: AI.models.chat,
      timeoutSeconds: AI.chatTimeoutSeconds,
      maxTokens: 700,
      messages: [
        { role: "system", content: systemPrompt(req.mode as never, req.lang, { grade: req.grade, interests: req.interests }) },
        ...trimHistory(req.messages),
      ],
    });
    return new Response(stream, { headers: textHeaders });
  } catch (e) {
    const code = e instanceof AiError ? e.code : "upstream";
    if (code === "rate") return err("busy", 429);
    if (code === "unavailable" || code === "auth" || code === "model") return err("unavailable", 503);
    return err(code === "timeout" ? "slow" : "failed", 502);
  }
}
