import type { Question } from "./types";

/** How hard a practice set should be. "mixed" is only used where a student does not pick (the study path). */
export type Level = "mixed" | "easy" | "medium" | "hard";
export const LEVELS: Level[] = ["mixed", "easy", "medium", "hard"];
/** The levels a student can choose. */
export const PICKABLE_LEVELS: Level[] = ["easy", "medium", "hard"];

export const levelOfQuestion = (q: Pick<Question, "difficulty">): Exclude<Level, "mixed"> => (q.difficulty === 1 ? "easy" : q.difficulty === 2 ? "medium" : "hard");

/** Older saved questions were written in a "real exam style" that is no longer offered. They are skipped everywhere. */
const isLegacyExamStyle = (q: object) => (q as { style?: string }).style === "exam";

export const matchesLevel = (q: Pick<Question, "difficulty">, level: Level | undefined) => !isLegacyExamStyle(q) && (!level || level === "mixed" || levelOfQuestion(q) === level);

/** What to ask the question writer for. Mixed sets cycle through easy, medium, medium and hard. */
export function specFor(level: Level, i = 0): { difficulty: 1 | 2 | 3 } {
  if (level === "easy") return { difficulty: 1 };
  if (level === "medium") return { difficulty: 2 };
  if (level === "hard") return { difficulty: 3 };
  return { difficulty: ([1, 2, 2, 3] as const)[i % 4] };
}
