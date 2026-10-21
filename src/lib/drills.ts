export type DrillOp = "+" | "-" | "×" | "÷";
export interface Question { a: number; b: number; op: DrillOp; answer: number }
export const DRILL_KEY = "math-drills";

export const answerOf = (a: number, b: number, op: DrillOp) => (op === "+" ? a + b : op === "-" ? a - b : op === "×" ? a * b : a / b);

/** Questions with whole-number answers that are never negative. `rng` is injectable so tests are repeatable. */
export function makeQuestions(op: DrillOp, max: number, count: number, rng: () => number = Math.random): Question[] {
  const pick = (hi: number, lo = 0) => lo + Math.floor(rng() * (hi - lo + 1));
  return Array.from({ length: count }, () => {
    let a: number, b: number;
    if (op === "+") { a = pick(max); b = pick(max); }
    else if (op === "-") { a = pick(max); b = pick(a); }
    else if (op === "×") { a = pick(max, 1); b = pick(max, 1); }
    else { b = pick(max, 1); const q = pick(max, 1); a = b * q; }
    return { a, b, op, answer: answerOf(a, b, op) };
  });
}

export interface DrillScore { op: DrillOp; max: number; right: number; total: number; seconds: number; date: string }
export const NO_SCORES: DrillScore[] = [];
export const bestFor = (scores: DrillScore[], op: DrillOp, max: number) =>
  scores.filter((s) => s.op === op && s.max === max && s.right === s.total).sort((a, b) => a.seconds - b.seconds)[0];
