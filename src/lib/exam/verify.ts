import { z } from "zod";
import { EXAMS } from "./config";
import { apBriefs } from "./ap-briefs";
import { coursesFor } from "./courses";
import { isCorrect, parseNumeric } from "./engine";
import type { Question } from "./types";

export interface GenSpec { exam: "sat" | "act" | "tsi" | "ap"; section: string; skill: string; /** One topic inside the unit or skill, like 1.2. */ topic?: string; count: number; difficulty: 1 | 2 | 3; /** "exam" asks for real-exam-style questions. */ style?: "exam" }

/** Readable names for a section and skill. AP courses come from the full CED list, so a course can be generated before it has any questions. */
export interface TopicRef { section: string; skill: string; topic?: string; topicNum?: string; cover?: string; unitTopics?: string[]; others?: string[]; /** AP course profile: what the course is about, and what must never be tested in it. */ about?: string; avoid?: string }
export function topicOf(exam: GenSpec["exam"], section: string, skill: string, topic?: string): TopicRef | null {
  const c = coursesFor(exam).find((x) => x.id === section), u = c?.units.find((x) => x.id === skill);
  if (!c || !u) return null;
  const ui = c.units.indexOf(u);
  if (!topic) { const b = exam === "ap" ? apBriefs(c, ui) : {}; return { section: c.en, skill: u.en, ...b, unitTopics: u.topics.map((t) => `${t.num} ${t.en}`) }; }
  const t = u.topics.find((x) => x.id === topic);
  if (!t) return null;
  const b = exam === "ap" ? apBriefs(c, ui, u.topics.indexOf(t)) : (t.cover ? { cover: t.cover } : {});
  return { section: c.en, skill: u.en, topic: t.en, topicNum: t.num, ...b, others: u.topics.filter((x) => x.id !== t.id).map((x) => `${x.num} ${x.en}`) };
}

const STYLE: Record<GenSpec["exam"], string> = {
  sat: "the digital SAT for students in grades 8 to 11",
  act: "the ACT for students in grades 9 to 12. Use exactly 4 answer choices",
  tsi: "the Texas TSIA2 college-readiness test, for students heading to college in Texas",
  ap: "College Board AP multiple-choice questions, aligned with the unit named below in the course's Course and Exam Description. Use realistic stimulus (a short passage, scenario or data described in words or a small text table) when it fits. Text only: never refer to an image, graph or map the student cannot see",
};

const EXAM_STYLE: Record<GenSpec["exam"], string> = {
  ap: "REAL EXAM STYLE. Make each question look and feel like the real AP exam. Put a stimulus in \"passage\" (60 to 180 words): a source excerpt, an experiment or data described in words or a small text table, a scenario, a short argument or a code segment, whichever fits the course. The question must ask the student to APPLY course skills to the stimulus (analyze, interpret, compare, predict, justify, calculate, evaluate), never to recall a bare fact. Use the phrasing AP uses, such as \"Which of the following best explains...\", \"The data most directly support...\" or \"Which of the following would most likely...\". Make the three wrong choices plausible, each based on a real misconception.",
  sat: "REAL EXAM STYLE. Make each question look and feel like the digital SAT. Reading and writing questions have a short original passage (25 to 120 words) in \"passage\" and one question about it. Math questions use a realistic context, take two or more steps, and have close wrong choices that come from common mistakes.",
  act: "REAL EXAM STYLE. Make each question look and feel like the ACT: English questions sit in a short original passage with the part to fix, Reading and Science questions give a short passage or a described data table first, and Math questions are multi-step with common-mistake wrong choices.",
  tsi: "REAL EXAM STYLE. Make each question look and feel like the TSIA2: a short original passage or a practical problem first, then a question that asks the student to apply the skill.",
};
const LEVEL_TEXT = ["", "Easy: one clear idea, one step, direct wording.", "Medium: a typical test question that needs two steps or careful reading.", "Hard: multi-step reasoning with close wrong choices and little hand-holding, but still only content from this course and topic. Harder means harder thinking, never outside content."];

const genItem = z.object({
  stem: z.string().min(15).max(1200),
  passage: z.string().max(1600).nullish(),
  type: z.enum(["mc", "grid"]).default("mc"),
  choices: z.array(z.string().min(1).max(200)).length(4).nullish(),
  answer: z.string().min(1).max(20),
  accept: z.array(z.string().max(20)).max(5).nullish(),
  explanation: z.string().min(20).max(1200),
});
export const genBatch = z.object({ questions: z.array(genItem).min(1).max(12) });

export function buildGenPrompt(spec: GenSpec): { system: string; user: string } {
  const topic = topicOf(spec.exam, spec.section, spec.skill, spec.topic)!;
  const sec = { en: topic.section }, skill = { en: topic.skill };
  return {
    system: [
      `You write ORIGINAL practice questions in the style of ${STYLE[spec.exam]}.`,
      "Never copy or closely imitate real released questions or any published test, textbook or website. Invent new passages, numbers and situations.",
      "Every question must have exactly ONE correct answer, an answer key that is right, and a clear explanation that shows why.",
      "Math and science: use LaTeX between dollar signs, like $3x+7=25$. Write a literal dollar sign as \\$. Use \"type\":\"grid\" for questions whose answer is a number the student types (no choices). Otherwise \"type\":\"mc\" with exactly 4 choices and answer \"A\", \"B\", \"C\" or \"D\".",
      "Reading, writing and all non-numeric subjects: always \"type\":\"mc\". Put any short passage (1 to 4 sentences) in \"passage\" and the question in \"stem\".",
      "SCIENCE AND FACT ACCURACY. Every fact, sign, unit and number must be correct and consistent. If you give data, make it realistic: use signs and units that are right (for example, the enthalpy of vaporization is positive), prefer simple qualitative observations or clearly hypothetical lab results over real-world constants you are not certain of, and never state a number that contradicts reality. The stem must give everything needed to reach the answer; do not rely on a comparison or fact that the stem does not provide. Words like 'proves' are only right when the evidence really proves it.",
      "STAY IN SCOPE. Use only knowledge that this course's own description requires for the named topic. Never use content that belongs to a different course or to college-level courses (for example, do not use AP Chemistry ideas such as colligative properties in an AP Biology question). If a question would need outside knowledge to answer, do not write it. Keep the difficulty at the level of the real exam for this course, not harder content.",
      "Content must be appropriate for ages 13 to 18. Teach history, government and social science accurately and neutrally.",
      "Return ONLY JSON: {\"questions\":[{\"stem\":\"\",\"passage\":null,\"type\":\"mc\",\"choices\":[\"\",\"\",\"\",\"\"],\"answer\":\"A\",\"accept\":null,\"explanation\":\"\"}]}",
    ].join("\n"),
    user: `Write ${spec.count} questions.\nSection: ${sec.en}\nSkill: ${skill.en}\n${topic.topic ? `Topic ${topic.topicNum}: ${topic.topic}. Every question must be about this topic only.\n` : ""}${topic.about ? `Course: ${topic.about}\nNEVER use or test: ${topic.avoid ?? "ideas from other courses"}\n` : ""}${topic.others?.length ? `Other topics in this unit, which you must NOT test: ${topic.others.slice(0, 14).join("; ")}\n` : ""}${topic.cover ? `${topic.topic ? "What this topic covers" : "What this unit covers"} (draw the question content from this and stay inside it): ${topic.cover}\n` : ""}Difficulty: ${spec.difficulty} on a 1 to 3 scale (1 easiest). ${LEVEL_TEXT[spec.difficulty]}\n${spec.style === "exam" ? EXAM_STYLE[spec.exam] + "\n" : ""}Vary the position of the correct answer.`,
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

/** A third check: is the question on this course and topic, scientifically and factually correct, and fair? */
export function buildReviewPrompt(spec: GenSpec, q: { stem: string; passage?: string | null; choices?: string[] | null; answer: string; explanation?: string }): { system: string; user: string } {
  const t = topicOf(spec.exam, spec.section, spec.skill, spec.topic);
  const where = t ? [`Course or test: ${t.section}`, `Unit or skill: ${t.skill}`, t.topic ? `Topic ${t.topicNum}: ${t.topic}` : "", t.about ? `The course is about: ${t.about}` : "", t.avoid ? `Never in this course: ${t.avoid}` : "", t.cover ? `The ${t.topic ? "topic" : "unit"} covers: ${t.cover}` : ""].filter(Boolean).join("\n") : "";
  return {
    system: [
      "You are a strict content reviewer for practice questions. Review ONE question on two points.",
      "SCOPE is IN only if ALL of these are true: (1) it tests the named topic, not just a nearby idea or a different topic of the same unit; (2) a student who has learned only this course's content for that topic could answer it, with no ideas from another course or from college-level courses (for example no AP Chemistry or AP Physics ideas in an AP Biology topic, unless that course's own description includes them); (3) the content and difficulty fit the real exam for this course.",
      "ACCURATE is YES only if ALL of these are true: every fact, sign, unit and number in the stem, the choices and the explanation is correct and consistent with real science or history; exactly one choice is best, and the key is that choice; the stem gives everything needed (nothing relies on a comparison, fact or premise that is not given or that a student could not know); the stimulus really supports the answer and does not claim more than it shows; the three wrong choices are clearly wrong, not arguable.",
      "Check each choice, then reply with two final lines exactly like these (and nothing after them):",
      "SCOPE: IN or SCOPE: OUT",
      "ACCURATE: YES or ACCURATE: NO",
    ].join("\n"),
    user: [where, "", "Question:", q.passage ?? "", q.stem, (q.choices ?? []).map((c, i) => `${"ABCD"[i]}. ${c}`).join("\n"), `Key: ${q.answer}`, q.explanation ? `Explanation given: ${q.explanation}` : ""].filter((x) => x !== undefined).join("\n"),
  };
}
/** Reads the reviewer's two final lines. "in" means on scope and accurate. */
export function parseReview(text: string): "in" | "out" | "inaccurate" | null {
  const sc = [...text.matchAll(/SCOPE:\s*(IN|OUT)\b/gi)].pop()?.[1]?.toUpperCase();
  const ac = [...text.matchAll(/ACCURATE:\s*(YES|NO)\b/gi)].pop()?.[1]?.toUpperCase();
  if (sc === "OUT") return "out";
  if (ac === "NO") return "inaccurate";
  return sc === "IN" && ac === "YES" ? "in" : null;
}

export const parseSolved = (text: string): string | null => /ANSWER:\s*([^\n]+?)\s*$/im.exec(text)?.[1]?.replace(/[`*$]/g, "").replace(/\.+$/, "").trim() ?? null;

export type Verdict = { ok: true; question: Question } | { ok: false; reason: string };

/** Structural checks, then agreement with an independent solve. Both must pass. */
export function verifyQuestion(item: z.infer<typeof genItem>, spec: GenSpec, solved: string | null, id: string, review: "in" | "out" | "inaccurate" | null): Verdict {
  if (item.type === "mc") {
    if (!item.choices || new Set(item.choices.map((c) => c.trim().toLowerCase())).size !== 4) return { ok: false, reason: "choices missing or duplicated" };
    if (!/^[ABCD]$/.test(item.answer)) return { ok: false, reason: "answer is not A to D" };
  } else if (parseNumeric(item.answer) === null) return { ok: false, reason: "grid answer is not a number" };
  if (/\b(all of the above|none of the above)\b/i.test(item.choices?.join(" ") ?? "")) return { ok: false, reason: "all/none of the above" };

  const q: Question = {
    id, exam: spec.exam, section: spec.section, skill: spec.skill, ...(spec.topic ? { topic: spec.topic } : {}), difficulty: spec.difficulty, type: item.type,
    stem: item.stem.trim(), ...(item.passage ? { passage: item.passage.trim() } : {}),
    ...(item.type === "mc" ? { choices: item.choices!.map((c) => c.trim()) } : { accept: item.accept ?? [] }),
    answer: item.answer.trim(), explanation: item.explanation.trim(), ...(spec.style ? { style: spec.style } : {}), scoped: true, source: "generated",
  };
  if (!solved) return { ok: false, reason: "checker gave no answer" };
  if (!isCorrect(q, solved)) return { ok: false, reason: `checker disagreed (key ${q.answer}, checker ${solved})` };
  if (review !== "in") return { ok: false, reason: review === "out" ? "out of scope for this course or topic" : review === "inaccurate" ? "reviewer found an error or an unfair question" : "review gave no answer" };
  return { ok: true, question: q };
}

export const normalizeStem = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
export { EXAMS };
