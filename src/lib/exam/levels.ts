import type { Question } from "./types";

/** How hard a practice set should be. "exam" means real-exam style: a stimulus and application questions. */
export type Level = "mixed" | "easy" | "medium" | "hard" | "exam";
export const LEVELS: Level[] = ["mixed", "easy", "medium", "hard", "exam"];

export const levelOfQuestion = (q: Pick<Question, "difficulty" | "style">): Exclude<Level, "mixed"> =>
  q.style === "exam" ? "exam" : q.difficulty === 1 ? "easy" : q.difficulty === 2 ? "medium" : "hard";

export const matchesLevel = (q: Pick<Question, "difficulty" | "style">, level: Level | undefined) => !level || level === "mixed" || levelOfQuestion(q) === level;

/** What to ask the question writer for. Mixed sets cycle through easy, medium, medium and hard. */
export function specFor(level: Level, i = 0): { difficulty: 1 | 2 | 3; style?: "exam" } {
  if (level === "easy") return { difficulty: 1 };
  if (level === "medium") return { difficulty: 2 };
  if (level === "hard") return { difficulty: 3 };
  if (level === "exam") return { difficulty: 3, style: "exam" };
  return { difficulty: ([1, 2, 2, 3] as const)[i % 4] };
}
