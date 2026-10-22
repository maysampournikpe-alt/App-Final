import { createHash } from "node:crypto";
import { NextResponse } from "next/server";
import { z } from "zod";
import { AI } from "@/config/ai";
import { AiError, groqChat } from "@/lib/ai/groq";
import { extractJson } from "@/lib/ai/finder";
import { notesMessages, notesSchema, TRACKS } from "@/lib/ai/learn";
import { buildGenPrompt, buildSolvePrompt, genBatch, parseSolved, topicOf, verifyQuestion, type GenSpec } from "@/lib/exam/verify";
import type { Question } from "@/lib/exam/types";
import { allow, clientIp } from "@/lib/rate-limit";
import { hasSupabaseServer, supabaseServer } from "@/lib/supabase/server";

export const maxDuration = 60;
export const dynamic = "force-dynamic";

const schema = z.object({
  track: z.enum(TRACKS as [string, ...string[]]),
  section: z.string().max(60),
  skill: z.string().max(20),
  kind: z.enum(["notes", "quiz"]),
  lang: z.enum(["en", "es"]).default("en"),
  count: z.number().int().min(2).max(6).default(5),
});
const headers = { "Cache-Control": "no-store" };
const err = (error: string, status: number) => NextResponse.json({ ok: false, error }, { status, headers });
const codeOf = (e: unknown) => { const c = e instanceof AiError ? e.code : "upstream"; return c === "rate" ? err("busy", 429) : c === "unavailable" || c === "auth" || c === "model" ? err("unavailable", 503) : err(c === "timeout" ? "slow" : "failed", 502); };

export async function POST(request: Request) {
  let json: unknown;
  try { json = await request.json(); } catch { return err("bad_request", 400); }
  const parsed = schema.safeParse(json);
  if (!parsed.success) return err("bad_request", 400);
  const { track, section, skill, kind, lang, count } = parsed.data;
  const exam = track as GenSpec["exam"];
  const topic = topicOf(exam, section, skill);
  if (!topic) return err("bad_request", 400);

  if (hasSupabaseServer()) {
    let who = `ip:${await clientIp()}`, perHour = 40;
    const { data } = await (await supabaseServer()).auth.getUser();
    if (data.user) { who = `user:${data.user.id}`; perHour = 120; }
    if (!(await allow(`learn:${who}`, perHour, 3600))) return err("rate_limited", 429);
  }

  try {
    if (kind === "notes") {
      for (let attempt = 0; attempt < 2; attempt++) {
        const r = await groqChat({ model: AI.models.chat, timeoutSeconds: AI.chatTimeoutSeconds, temperature: 0.3, maxTokens: 1400, messages: notesMessages(exam, topic, lang) });
        const j = extractJson(r.content), ok = j ? notesSchema.safeParse(j) : null;
        if (ok?.success) return NextResponse.json({ ok: true, notes: ok.data }, { headers });
      }
      return err("failed", 502);
    }

    // Quiz: write a few questions, have a second call solve each one blind, keep only those where the two agree.
    const spec: GenSpec = { exam, section, skill, count, difficulty: 2 };
    const { system, user } = buildGenPrompt(spec);
    const gen = await groqChat({ model: AI.models.chat, timeoutSeconds: AI.chatTimeoutSeconds, temperature: 0.8, maxTokens: 2200, messages: [{ role: "system", content: system }, { role: "user", content: user }] });
    const j = extractJson(gen.content), batch = j ? genBatch.safeParse(j) : null;
    if (!batch?.success) return err("failed", 502);
    const checked = await Promise.all(batch.data.questions.slice(0, count).map(async (item) => {
      const solve = buildSolvePrompt({ stem: item.stem, passage: item.passage, type: item.type, choices: item.choices });
      const reply = await groqChat({ model: AI.models.chat, timeoutSeconds: AI.chatTimeoutSeconds, temperature: 0, maxTokens: 700, messages: [{ role: "system", content: solve.system }, { role: "user", content: solve.user }] }).catch(() => null);
      const id = `ai-${exam}-${section}-${createHash("sha1").update(item.stem).digest("hex").slice(0, 8)}`;
      return verifyQuestion(item, spec, reply ? parseSolved(reply.content) : null, id);
    }));
    const seen = new Set<string>();
    const questions: Question[] = [];
    for (const v of checked) if (v.ok && !seen.has(v.question.id)) { seen.add(v.question.id); questions.push(v.question); }
    if (!questions.length) return err("failed", 502);
    return NextResponse.json({ ok: true, questions }, { headers });
  } catch (e) { return codeOf(e); }
}
