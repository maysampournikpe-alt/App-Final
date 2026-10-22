import { z } from "zod";
import { AP_COURSES } from "./ap";
import { EXAMS, sectionOf } from "./config";
import { isCorrect, parseNumeric } from "./engine";
import type { ExamId, Question } from "./types";

export interface GenSpec { exam: "sat" | "act" | "tsi" | "ap"; section: string; skill: string; count: number; difficulty: 1 | 2 | 3 }

/** Readable names for a section and skill. AP courses come from the full CED list, so a course can be generated before it has any questions. */
export function topicOf(exam: GenSpec["exam"], section: string, skill: string): { section: string; skill: string } | null {
  if (exam === "ap") {
    const c = AP_COURSES.find((x) => x.id === section), u = c?.units.find((x) => x.id === skill);
    return c && u ? { section: c.en, skill: u.en } : null;
  }
  const sec = sectionOf(exam as ExamId, section), sk = sec?.skills.find((x) => x.id === skill);
  return sec && sk ? { section: sec.en, skill: sk.en } : null;
}

const STYLE: Record<GenSpec["exam"], string> = {
  sat: "the digital SAT for students in grades 8 to 11",
  act: "the ACT for students in grades 9 to 12. Use exactly 4 answer choices",
  tsi: "the Texas TSIA2 college-readiness test, for students heading to college in Texas",
  ap: "College Board AP multiple-choice questions, aligned with the unit named below in the course's Course and Exam Description. Use realistic stimulus (a short passage, scenario or data described in words or a small text table) when it fits. Text only: never refer to an image, graph or map the student cannot see",
};

const genItem = z.object({
  stem: z.string().min(15).max(900),
  passage: z.string().max(900).nullish(),
  type: z.enum(["mc", "grid"]).default("mc"),
  choices: z.array(z.string().min(1).max(200)).length(4).nullish(),
  answer: z.string().min(1).max(20),
  accept: z.array(z.string().max(20)).max(5).nullish(),
  explanation: z.string().min(20).max(900),
});
export const genBatch = z.object({ questions: z.array(genItem).min(1).max(12) });

export function buildGenPrompt(spec: GenSpec): { system: string; user: string } {
  const topic = topicOf(spec.exam, spec.section, spec.skill)!;
  const sec = { en: topic.section }, skill = { en: topic.skill };
  return {
    system: [
      `You write ORIGINAL practice questions in the style of ${STYLE[spec.exam]}.`,
      "Never copy or closely imitate real released questions or any published test, textbook or website. Invent new passages, numbers and situations.",
      "Every question must have exactly ONE correct answer, an answer key that is right, and a clear explanation that shows why.",
      "Math and science: use LaTeX between dollar signs, like $3x+7=25$. Write a literal dollar sign as \\$. Use \"type\":\"grid\" for questions whose answer is a number the student types (no choices). Otherwise \"type\":\"mc\" with exactly 4 choices and answer \"A\", \"B\", \"C\" or \"D\".",
      "Reading, writing and all non-numeric subjects: always \"type\":\"mc\". Put any short passage (1 to 4 sentences) in \"passage\" and the question in \"stem\".",
      "Content must be appropriate for ages 13 to 18. Teach history, government and social science accurately and neutrally.",
      "Return ONLY JSON: {\"questions\":[{\"stem\":\"\",\"passage\":null,\"type\":\"mc\",\"choices\":[\"\",\"\",\"\",\"\"],\"answer\":\"A\",\"accept\":null,\"explanation\":\"\"}]}",
    ].join("\n"),
    user: `Write ${spec.count} questions.\nSection: ${sec.en}\nSkill: ${skill.en}\nDifficulty: ${spec.difficulty} on a 1 to 3 scale (1 easiest). Vary the position of the correct answer.`,
  };
}

/** The checker never sees the answer key. It must solve the question on its own. */
export function buildSolvePrompt(q: { stem: string; passage?: string | null; type: "mc" | "grid"; choices?: string[] | null }): { system: string; user: string } {
  return {
    system: q.type === "mc"
      ? "Solve the question carefully. Think step by step, then end with a final line exactly like: ANSWER: X where X is A, B, C or D."
      : "Solve the question carefully. Think step by step, then end with a final line exactly like: ANSWER: N where N is a number or fraction.",
    user: [q.passage ?? "", q.stem, q.type === "mc" ? (q.choices ?? []).map((c, i) => `${"ABCD"[i]}. ${c}`).join("\n") : ""].filter(Boolean).join("\n\n"),
  };
}

export const parseSolved = (text: string): string | null => /ANSWER:\s*([^\n]+?)\s*$/im.exec(text)?.[1]?.replace(/[`*$]/g, "").replace(/\.+$/, "").trim() ?? null;

export type Verdict = { ok: true; question: Question } | { ok: false; reason: string };

/** Structural checks, then agreement with an independent solve. Both must pass. */
export function verifyQuestion(item: z.infer<typeof genItem>, spec: GenSpec, solved: string | null, id: string): Verdict {
  if (item.type === "mc") {
    if (!item.choices || new Set(item.choices.map((c) => c.trim().toLowerCase())).size !== 4) return { ok: false, reason: "choices missing or duplicated" };
    if (!/^[ABCD]$/.test(item.answer)) return { ok: false, reason: "answer is not A to D" };
  } else if (parseNumeric(item.answer) === null) return { ok: false, reason: "grid answer is not a number" };
  if (/\b(all of the above|none of the above)\b/i.test(item.choices?.join(" ") ?? "")) return { ok: false, reason: "all/none of the above" };

  const q: Question = {
    id, exam: spec.exam, section: spec.section, skill: spec.skill, difficulty: spec.difficulty, type: item.type,
    stem: item.stem.trim(), ...(item.passage ? { passage: item.passage.trim() } : {}),
    ...(item.type === "mc" ? { choices: item.choices!.map((c) => c.trim()) } : { accept: item.accept ?? [] }),
    answer: item.answer.trim(), explanation: item.explanation.trim(), source: "generated",
  };
  if (!solved) return { ok: false, reason: "checker gave no answer" };
  if (!isCorrect(q, solved)) return { ok: false, reason: `checker disagreed (key ${q.answer}, checker ${solved})` };
  return { ok: true, question: q };
}

export const normalizeStem = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
export { EXAMS };
