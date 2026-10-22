import { createHash } from "node:crypto";
import { NextResponse } from "next/server";
import { z } from "zod";
import { AI } from "@/config/ai";
import { AiError, groqChat } from "@/lib/ai/groq";
import { extractJson } from "@/lib/ai/finder";
import { specFor } from "@/lib/exam/levels";
import { ID_MAX, cramMessages, cramSchema, notesMessages, notesSchema, termsMessages, termsSchema, TRACKS } from "@/lib/ai/learn";
import { fromBank, toBank } from "@/lib/ai/qbank";
import { buildGenPrompt, buildScopePrompt, buildSolvePrompt, genBatch, parseScope, parseSolved, topicOf, verifyQuestion, type GenSpec } from "@/lib/exam/verify";
import type { Question } from "@/lib/exam/types";
import { allow, clientIp } from "@/lib/rate-limit";
import { hasSupabaseServer, supabaseServer } from "@/lib/supabase/server";

export const maxDuration = 60;
export const dynamic = "force-dynamic";

const schema = z.object({
  track: z.enum(TRACKS as [string, ...string[]]),
  section: z.string().max(ID_MAX.section),
  skill: z.string().max(ID_MAX.skill),
  topic: z.string().max(ID_MAX.topic).optional(),
  kind: z.enum(["notes", "quiz", "terms", "cram"]),
  lang: z.enum(["en", "es"]).default("en"),
  level: z.enum(["mixed", "easy", "medium", "hard", "exam"]).default("mixed"),
  count: z.number().int().min(1).max(10).default(5),
  seen: z.array(z.string().max(80)).max(120).default([]),
});
const headers = { "Cache-Control": "no-store" };
const err = (error: string, status: number) => NextResponse.json({ ok: false, error }, { status, headers });
const codeOf = (e: unknown) => { const c = e instanceof AiError ? e.code : "upstream"; return c === "rate" ? err("busy", 429) : c === "unavailable" || c === "auth" || c === "model" ? err("unavailable", 503) : err(c === "timeout" ? "slow" : "failed", 502); };

async function jsonOf<T>(messages: { role: "system" | "user"; content: string }[], parse: (j: unknown) => T | null, maxTokens: number, timeoutSeconds: number = AI.chatTimeoutSeconds): Promise<T | null> {
  for (let attempt = 0; attempt < 2; attempt++) {
    const r = await groqChat({ model: AI.models.chat, timeoutSeconds, temperature: 0.3, maxTokens, messages });
    const j = extractJson(r.content), v = j ? parse(j) : null;
    if (v) return v;
  }
  return null;
}

export async function POST(request: Request) {
  let json: unknown;
  try { json = await request.json(); } catch { return err("bad_request", 400); }
  const parsed = schema.safeParse(json);
  if (!parsed.success) return err("bad_request", 400);
  const { track, section, skill, topic, kind, lang, count, seen, level } = parsed.data;
  const exam = track as GenSpec["exam"];
  const ref = topicOf(exam, section, skill, topic);
  if (!ref) return err("bad_request", 400);

  if (hasSupabaseServer()) {
    let who = `ip:${await clientIp()}`, perHour = 60;
    const { data } = await (await supabaseServer()).auth.getUser();
    if (data.user) { who = `user:${data.user.id}`; perHour = 180; }
    if (!(await allow(`learn:${who}`, perHour, 3600))) return err("rate_limited", 429);
  }

  try {
    if (kind === "notes") {
      const notes = await jsonOf(notesMessages(exam, ref, lang), (j) => { const r = notesSchema.safeParse(j); return r.success ? r.data : null; }, 7000, 58);
      return notes ? NextResponse.json({ ok: true, notes }, { headers }) : err("failed", 502);
    }
    if (kind === "terms") {
      const t = await jsonOf(termsMessages(exam, ref, lang), (j) => { const r = termsSchema.safeParse(j); return r.success ? r.data : null; }, 1500);
      return t ? NextResponse.json({ ok: true, terms: t.terms }, { headers }) : err("failed", 502);
    }
    if (kind === "cram") {
      const c = await jsonOf(cramMessages(exam, ref, lang), (j) => { const r = cramSchema.safeParse(j); return r.success ? r.data : null; }, 1800);
      return c ? NextResponse.json({ ok: true, cram: c }, { headers }) : err("failed", 502);
    }

    // Quiz. First the shared bank of questions that were already checked, then write the rest fresh.
    const key = { exam, section, skill, topic, lang, level };
    const questions: Question[] = await fromBank(key, seen, count);
    const need = count - questions.length;
    if (need > 0) {
      const spec: GenSpec = { exam, section, skill, topic, count: Math.min(6, need + 1), ...specFor(level, Math.floor(Math.random() * 4)) };
      const { system, user } = buildGenPrompt(spec);
      const gen = await groqChat({ model: AI.models.chat, timeoutSeconds: AI.chatTimeoutSeconds, temperature: 0.8, maxTokens: spec.style ? 3600 : 2600, messages: [{ role: "system", content: system }, { role: "user", content: user }] });
      const j = extractJson(gen.content), batch = j ? genBatch.safeParse(j) : null;
      if (batch?.success) {
        // A second call solves each question without seeing the key. Only questions where both agree are kept.
        const checked = await Promise.all(batch.data.questions.slice(0, spec.count).map(async (item) => {
          const solve = buildSolvePrompt({ stem: item.stem, passage: item.passage, type: item.type, choices: item.choices });
          const reply = await groqChat({ model: AI.models.chat, timeoutSeconds: AI.chatTimeoutSeconds, temperature: 0, maxTokens: 700, messages: [{ role: "system", content: solve.system }, { role: "user", content: solve.user }] }).catch(() => null);
          const id = `ai-${exam}-${section}-${createHash("sha1").update(item.stem).digest("hex").slice(0, 10)}`;
          // A third call checks that the question really belongs to this course and topic.
          const sp = buildScopePrompt(spec, item);
          const scope = await groqChat({ model: AI.models.chat, timeoutSeconds: AI.chatTimeoutSeconds, temperature: 0, maxTokens: 500, messages: [{ role: "system", content: sp.system }, { role: "user", content: sp.user }] }).catch(() => null);
          return verifyQuestion(item, spec, reply ? parseSolved(reply.content) : null, id, scope ? parseScope(scope.content) : null);
        }));
        const fresh: Question[] = [];
        const have = new Set([...seen, ...questions.map((q) => q.id)]);
        for (const v of checked) if (v.ok && !have.has(v.question.id)) { have.add(v.question.id); fresh.push(v.question); }
        await toBank(key, fresh);
        questions.push(...fresh.slice(0, need));
      }
    }
    if (!questions.length) return err("failed", 502);
    return NextResponse.json({ ok: true, questions }, { headers });
  } catch (e) { return codeOf(e); }
}
