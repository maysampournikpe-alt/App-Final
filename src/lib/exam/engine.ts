import { EXAMS, minutesPerQuestion } from "./config";
import type { Answered, Attempt, ExamId, Question, Session } from "./types";

/** Small seeded random generator so a test can be rebuilt the same way. */
export function rng(seed: number) {
  let s = seed >>> 0 || 1;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const shuffle = <T,>(list: T[], rand: () => number) => {
  const a = [...list];
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rand() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
};

// ---- answer checking ------------------------------------------------------

/** "7.5", "15/2", " 7.50 ", "−3" and "1,000" all become numbers. Returns null if it is not a number. */
export function parseNumeric(raw: string): number | null {
  const s = raw.trim().replace(/[\s,]/g, "").replace(/[−–—]/g, "-").replace(/^\+/, "");
  if (!s) return null;
  const frac = /^(-?\d+(?:\.\d+)?)\/(-?\d+(?:\.\d+)?)$/.exec(s);
  if (frac) { const d = Number(frac[2]); return d === 0 ? null : Number(frac[1]) / d; }
  return /^-?(\d+\.?\d*|\.\d+)$/.test(s) ? Number(s) : null;
}

export function isCorrect(q: Question, given: string | undefined): boolean {
  if (!given) return false;
  if (q.type === "mc") return given.trim().toUpperCase() === q.answer;
  const g = parseNumeric(given);
  const accepted = [q.answer, ...(q.accept ?? [])];
  if (g === null) return accepted.some((a) => a.trim().toLowerCase() === given.trim().toLowerCase());
  return accepted.some((a) => { const n = parseNumeric(a); return n !== null && Math.abs(n - g) < 1e-9; });
}

// ---- building a test ------------------------------------------------------

export interface TestSpec { exam: ExamId; mode: Attempt["mode"]; section?: string; skill?: string; count?: number; seed?: number }

/** Picks questions balanced across skills, easiest first within the PSAT limit. */
export function buildTest(bank: Question[], spec: TestSpec): string[] {
  const cfg = EXAMS[spec.exam];
  const rand = rng(spec.seed ?? Math.floor(Math.random() * 1e9));
  const sections = spec.section ? cfg.sections.filter((s) => s.id === spec.section) : cfg.sections;
  const usable = bank.filter((q) => q.exam === cfg.bank && (!cfg.maxDifficulty || q.difficulty <= cfg.maxDifficulty));
  const out: string[] = [];
  for (const sec of sections) {
    const want = spec.mode === "full" ? sec.questions : spec.count ?? (spec.mode === "diagnostic" ? 8 : 10);
    const pools = (spec.skill ? sec.skills.filter((s) => s.id === spec.skill) : sec.skills)
      .map((s) => shuffle(usable.filter((q) => q.section === sec.id && q.skill === s.id), rand))
      .filter((p) => p.length);
    const picked: string[] = [];
    for (let round = 0; picked.length < want && pools.some((p) => p[round]); round++) {
      for (const pool of pools) if (pool[round] && picked.length < want) picked.push(pool[round].id);
    }
    out.push(...picked);
  }
  return out;
}

/** Minutes for a set of questions, at the real test's pace. */
export function minutesFor(exam: ExamId, qs: Question[]): number {
  const total = qs.reduce((m, q) => m + minutesPerQuestion(exam, q.section), 0);
  return Math.max(1, Math.round(total));
}

// ---- scoring --------------------------------------------------------------

export function grade(bank: Map<string, Question>, session: Session, finishedAt = Date.now()): Attempt {
  const items: Answered[] = [];
  let unanswered = 0;
  for (const qid of session.qids) {
    const q = bank.get(qid);
    if (!q) continue;
    const given = session.answers[qid];
    if (!given) unanswered++;
    items.push({ qid, section: q.section, skill: q.skill, answer: given ?? "", correct: isCorrect(q, given) });
  }
  return { id: `${session.startedAt}`, exam: session.exam, mode: session.mode, startedAt: session.startedAt, finishedAt, timed: session.timed, items, unanswered };
}

export interface SectionEstimate { section: string; correct: number; total: number; pct: number; score: number }
export interface Estimate { sections: SectionEstimate[]; total: number | null }

/**
 * A rough estimate from the percent correct. The real digital SAT adapts to the student,
 * so this is only a guide. The app always labels it "Estimate only, not an official score."
 */
export function estimate(exam: ExamId, items: Answered[]): Estimate {
  const { min, max, step } = EXAMS[exam].sectionScale;
  const sections: SectionEstimate[] = EXAMS[exam].sections.flatMap((sec) => {
    const mine = items.filter((i) => i.section === sec.id);
    if (!mine.length) return [];
    const correct = mine.filter((i) => i.correct).length;
    const pct = correct / mine.length;
    const score = Math.min(max, Math.max(min, Math.round((min + (max - min) * pct) / step) * step));
    return [{ section: sec.id, correct, total: mine.length, pct, score }];
  });
  const everySection = sections.length === EXAMS[exam].sections.length && sections.length > 0;
  return { sections, total: everySection ? sections.reduce((s, x) => s + x.score, 0) : null };
}

export interface SkillStat { skill: string; section: string; correct: number; total: number; pct: number }

/** Weak spots across every attempt, weakest first. Needs at least 2 answers in a skill to say anything. */
export function skillStats(attempts: Attempt[]): SkillStat[] {
  const map = new Map<string, SkillStat>();
  for (const a of attempts) for (const i of a.items) {
    if (!i.answer) continue;
    const key = `${i.section}/${i.skill}`;
    const s = map.get(key) ?? { skill: i.skill, section: i.section, correct: 0, total: 0, pct: 0 };
    s.total++; if (i.correct) s.correct++;
    map.set(key, s);
  }
  return [...map.values()].filter((s) => s.total >= 2).map((s) => ({ ...s, pct: s.correct / s.total })).sort((a, b) => a.pct - b.pct);
}

/** Question ids the student got wrong most recently and has not since answered correctly. */
export function openMistakes(attempts: Attempt[]): string[] {
  const state = new Map<string, boolean>();
  for (const a of [...attempts].sort((x, y) => x.finishedAt - y.finishedAt)) for (const i of a.items) if (i.answer) state.set(i.qid, i.correct);
  return [...state.entries()].filter(([, ok]) => !ok).map(([id]) => id);
}

/** A fresh session. `minutes` null means untimed. */
export function newSession(exam: ExamId, mode: Attempt["mode"], qids: string[], minutes: number | null): Session {
  const startedAt = Date.now();
  return { exam, mode, qids, answers: {}, flags: [], startedAt, endsAt: minutes ? startedAt + minutes * 60_000 : null, timed: minutes !== null };
}
