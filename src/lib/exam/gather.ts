import { BANK, registerQuestions, runtimeQuestions } from "./bank";
import { matchesLevel, type Level } from "./levels";
import type { Question } from "./types";

export interface Need { skill: string; topic?: string; n: number }
export interface GatherOpts {
  exam: "ap" | "sat" | "act" | "tsi";
  section: string;
  needs: Need[];
  lang: "en" | "es";
  hidden?: string[];
  maxDifficulty?: number;
  level?: Level;
  onProgress?: (done: number, total: number) => void;
  /** Injected so tests can run without a network. */
  fetchQuiz?: (body: object) => Promise<{ ok: true; questions: Question[] } | { ok: false; error: string }>;
  shuffle?: <T>(a: T[]) => T[];
}

const defaultShuffle = <T,>(a: T[]) => { const b = [...a]; for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } return b; };

async function defaultFetch(body: object) {
  if (typeof navigator !== "undefined" && !navigator.onLine) return { ok: false as const, error: "offline" };
  try {
    const res = await fetch("/api/learn", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    const j = await res.json().catch(() => null);
    return res.ok && j?.ok ? { ok: true as const, questions: j.questions as Question[] } : { ok: false as const, error: (j?.error as string) ?? "failed" };
  } catch { return { ok: false as const, error: "failed" }; }
}

/** Questions we already have for a lesson: the checked bank, plus questions made earlier on this device. Topic lessons use only topic-tagged questions. */
export function localPool(o: { exam: string; section: string; skill: string; topic?: string; hidden?: string[]; maxDifficulty?: number; level?: Level }): Question[] {
  const ok = (q: Question) => q.exam === o.exam && q.section === o.section && q.skill === o.skill && q.type === "mc" && q.choices?.length === 4 && !(o.hidden ?? []).includes(q.id)
    && (!o.maxDifficulty || q.difficulty <= o.maxDifficulty) && (!o.topic || q.topic === o.topic) && matchesLevel(q, o.level);
  const seen = new Set<string>();
  return [...BANK, ...runtimeQuestions()].filter((q) => ok(q) && !seen.has(q.id) && seen.add(q.id));
}

/**
 * Gets the questions a quiz needs. For each need it first uses what is already on the device, then asks the server
 * (which serves the shared bank and writes new, double-checked questions). New questions are kept on the device.
 * It never returns the same question twice, and returns fewer than asked if the AI could not supply more.
 */
export async function gather(opts: GatherOpts): Promise<{ questions: Question[]; missing: number; error?: string }> {
  const shuffle = opts.shuffle ?? defaultShuffle;
  const fetchQuiz = opts.fetchQuiz ?? defaultFetch;
  const total = opts.needs.reduce((n, x) => n + x.n, 0);
  const used = new Set<string>();
  const out: Question[] = [];
  let done = 0, error: string | undefined;
  const take = (q: Question) => { if (used.has(q.id)) return false; used.add(q.id); out.push(q); done++; opts.onProgress?.(done, total); return true; };

  const remaining: { need: Need; short: number }[] = [];
  for (const need of opts.needs) {
    const pool = shuffle(localPool({ exam: opts.exam, section: opts.section, skill: need.skill, topic: need.topic, hidden: opts.hidden, maxDifficulty: opts.maxDifficulty, level: opts.level }));
    let got = 0;
    for (const q of pool) { if (got >= need.n) break; if (take(q)) got++; }
    if (got < need.n) remaining.push({ need, short: need.n - got });
  }
  // Ask the server for what is still missing, one request per lesson, a few at a time.
  const jobs = remaining.map(({ need, short }) => async () => {
    let got = 0;
    // The AI drops questions the checker disagrees with, so ask again (at most twice more) while it is still making progress.
    for (let round = 0; round < 3 && got < short; round++) {
      const seen = [...used, ...runtimeQuestions().map((q) => q.id)].slice(0, 120);
      const r = await fetchQuiz({ track: opts.exam, section: opts.section, skill: need.skill, ...(need.topic ? { topic: need.topic } : {}), kind: "quiz", lang: opts.lang, level: opts.level ?? "mixed", count: Math.max(2, Math.min(10, short - got)), seen });
      if (!r.ok) { error = r.error; return; }
      registerQuestions(r.questions);
      const before = got;
      for (const q of r.questions) { if (got >= short) break; if (q.type === "mc" && q.choices?.length === 4 && take(q)) got++; }
      if (got === before) return;
    }
  });
  for (let i = 0; i < jobs.length; i += 4) await Promise.all(jobs.slice(i, i + 4).map((j) => j()));
  return { questions: shuffle(out), missing: Math.max(0, total - out.length), error };
}
