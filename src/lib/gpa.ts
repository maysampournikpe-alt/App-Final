// GPA math. Schools differ, so the scale is explicit and the weights are visible to the student.
export const LETTERS = ["A+", "A", "A-", "B+", "B", "B-", "C+", "C", "C-", "D+", "D", "D-", "F"] as const;
export type Letter = (typeof LETTERS)[number];

// Common 4.0 scale. A+ counts as 4.0, like most Texas districts.
export const POINTS: Record<Letter, number> = {
  "A+": 4.0, A: 4.0, "A-": 3.7, "B+": 3.3, B: 3.0, "B-": 2.7,
  "C+": 2.3, C: 2.0, "C-": 1.7, "D+": 1.3, D: 1.0, "D-": 0.7, F: 0,
};

export type Level = "regular" | "honors" | "ap" | "dual";
/** Extra points added to a passing grade on the weighted scale. Honors +0.5; AP, IB and dual credit +1.0. */
export const WEIGHT: Record<Level, number> = { regular: 0, honors: 0.5, ap: 1, dual: 1 };

export interface Course {
  id: string;
  name: string;
  grade: Letter;
  credits: number; // 0.5 for a semester, 1 for a year
  level: Level;
  planned: boolean; // true = "what if", not earned yet
}

const round2 = (n: number) => Math.round(n * 100) / 100;

export function gpa(courses: Course[], opts: { weighted: boolean; includePlanned: boolean }): number | null {
  const list = courses.filter((c) => c.credits > 0 && (opts.includePlanned || !c.planned));
  const credits = list.reduce((s, c) => s + c.credits, 0);
  if (!credits) return null;
  const total = list.reduce((s, c) => {
    const base = POINTS[c.grade];
    const bonus = opts.weighted && base > 0 ? WEIGHT[c.level] : 0; // no bonus for a failing grade
    return s + (base + bonus) * c.credits;
  }, 0);
  return round2(total / credits);
}

export const parseCredits = (raw: string): number | null => {
  const n = Number(raw);
  return Number.isFinite(n) && n > 0 && n <= 10 ? n : null;
};
