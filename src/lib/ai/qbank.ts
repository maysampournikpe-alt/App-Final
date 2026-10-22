import "server-only";
import { supabaseAdmin } from "@/lib/supabase/server";
import type { Question } from "@/lib/exam/types";

export interface BankKey { exam: string; section: string; skill: string; topic?: string; lang: string }

/** Questions other students already got, so a lesson loads instantly and costs no AI call. A broken or missing table just returns nothing. */
export async function fromBank(key: BankKey, exclude: string[], n: number): Promise<Question[]> {
  try {
    let q = supabaseAdmin().from("question_bank").select("id,data").eq("exam", key.exam).eq("section", key.section).eq("skill", key.skill).eq("lang", key.lang).limit(120);
    q = key.topic ? q.eq("topic", key.topic) : q;
    const { data, error } = await q;
    if (error) throw error;
    const skip = new Set(exclude);
    const pool = (data ?? []).filter((r) => !skip.has(r.id)).map((r) => r.data as Question);
    for (let i = pool.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [pool[i], pool[j]] = [pool[j], pool[i]]; }
    return pool.slice(0, n);
  } catch (e) {
    console.error("question bank read failed (generating instead):", (e as { message?: string })?.message ?? e);
    return [];
  }
}

export async function toBank(key: BankKey, questions: Question[]): Promise<void> {
  if (!questions.length) return;
  try {
    const rows = questions.map((q) => ({ id: q.id, exam: key.exam, section: key.section, skill: key.skill, topic: key.topic ?? null, lang: key.lang, data: q }));
    const { error } = await supabaseAdmin().from("question_bank").upsert(rows, { onConflict: "id" });
    if (error) throw error;
  } catch (e) {
    console.error("question bank write failed (ignored):", (e as { message?: string })?.message ?? e);
  }
}
