import { NextResponse } from "next/server";
import { z } from "zod";
import { AI } from "@/config/ai";
import { AiError, groqChat } from "@/lib/ai/groq";
import { assistMessages, ASSIST_TASKS, extraKeys, maxInput, maxTokens } from "@/lib/ai/assist";
import { CRISIS_REPLY, needsCrisisReply } from "@/lib/ai/coach";
import { allow, clientIp } from "@/lib/rate-limit";
import { hasSupabaseServer, supabaseServer } from "@/lib/supabase/server";

export const maxDuration = 60;
export const dynamic = "force-dynamic";

const schema = z.object({
  task: z.enum(ASSIST_TASKS),
  lang: z.enum(["en", "es"]).default("en"),
  grade: z.number().int().min(5).max(12).nullable().default(null),
  input: z.string().trim().min(1).max(6000),
  extra: z.record(z.string(), z.string().max(300)).default({}),
});

const headers = { "Cache-Control": "no-store" };
const err = (error: string, status: number) => NextResponse.json({ ok: false, error }, { status, headers });

export async function POST(request: Request) {
  let json: unknown;
  try { json = await request.json(); } catch { return err("bad_request", 400); }
  const parsed = schema.safeParse(json);
  if (!parsed.success) return err("bad_request", 400);
  const { task, lang, grade, input, extra } = parsed.data;
  if (input.length > maxInput(task)) return err("bad_request", 400);
  const allowed = Object.fromEntries(Object.entries(extra).filter(([k]) => extraKeys(task).includes(k)));

  // Same rule as the Coach: a message about self-harm or abuse gets a fixed, caring answer and real help lines, never AI output.
  if (needsCrisisReply([input, ...Object.values(allowed)].join(" "))) return NextResponse.json({ ok: true, text: CRISIS_REPLY[lang], crisis: true }, { headers });

  if (hasSupabaseServer()) {
    let who = `ip:${await clientIp()}`, perHour = 25;
    const { data } = await (await supabaseServer()).auth.getUser();
    if (data.user) { who = `user:${data.user.id}`; perHour = 60; }
    if (!(await allow(`assist:${who}`, perHour, 3600))) return err("rate_limited", 429);
  }

  try {
    const reply = await groqChat({
      model: AI.models.chat,
      timeoutSeconds: AI.chatTimeoutSeconds,
      temperature: 0.4,
      maxTokens: maxTokens(task),
      messages: assistMessages(task, lang, input, allowed, { grade }),
    });
    return NextResponse.json({ ok: true, text: reply.content.trim() }, { headers });
  } catch (e) {
    const code = e instanceof AiError ? e.code : "upstream";
    if (code === "rate") return err("busy", 429);
    if (code === "unavailable" || code === "auth" || code === "model") return err("unavailable", 503);
    return err(code === "timeout" ? "slow" : "failed", 502);
  }
}
