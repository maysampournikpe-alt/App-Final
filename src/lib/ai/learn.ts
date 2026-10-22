// Prompts and shapes for the study path: unit notes. Quizzes reuse the checked generator in lib/exam/verify.
// The browser sends only ids from our own lists, never text, so there is nothing for a student to inject.
import { z } from "zod";

export type Track = "ap" | "sat" | "act" | "tsi";
export const TRACKS: Track[] = ["ap", "sat", "act", "tsi"];

export const notesSchema = z.object({
  summary: z.string().min(40).max(1000),
  keyIdeas: z.array(z.string().min(8).max(320)).min(3).max(8),
  terms: z.array(z.object({ term: z.string().min(1).max(90), meaning: z.string().min(5).max(320) })).min(3).max(12),
  example: z.object({ title: z.string().max(120), body: z.string().min(20).max(900) }).nullish(),
  mistakes: z.array(z.string().min(8).max(300)).min(1).max(5),
  selfCheck: z.array(z.string().min(8).max(300)).min(2).max(5),
});
export type Notes = z.infer<typeof notesSchema>;

const EXAM_NAME: Record<Track, string> = { ap: "the College Board AP course named below", sat: "the digital SAT", act: "the ACT", tsi: "the Texas TSIA2 college-readiness test" };

export const termsSchema = z.object({ terms: z.array(z.object({ term: z.string().min(1).max(90), meaning: z.string().min(5).max(300) })).min(6).max(24) });
export const cramSchema = z.object({
  mustKnow: z.array(z.string().min(8).max(320)).min(4).max(12),
  terms: z.array(z.object({ term: z.string().min(1).max(90), meaning: z.string().min(5).max(300) })).min(4).max(16),
  numbers: z.array(z.string().min(3).max(260)).max(12).default([]),
  traps: z.array(z.string().min(8).max(300)).min(2).max(8),
  examTips: z.array(z.string().min(8).max(300)).min(2).max(6),
});
export type Cram = z.infer<typeof cramSchema>;

export interface LessonRef { section: string; skill: string; topic?: string; topicNum?: string }
const where = (r: LessonRef) => `Course or test: ${r.section}\nUnit or skill: ${r.skill}${r.topic ? `\nTopic ${r.topicNum}: ${r.topic}` : ""}`;
const BASE = (track: Track, lang: "en" | "es") => [
  "You are Rumbo's study-path tutor for students aged 13 to 18 in South Texas.",
  "Be accurate. If you are not sure of a date, number or fact, leave it out instead of guessing. Do not quote copyrighted text. Explain in clear, friendly language.",
  "Math and science: put formulas in LaTeX between dollar signs, like $v = d/t$.",
  `Write everything in ${lang === "es" ? "Spanish (natural South Texas Spanish; keep standard English or subject terms in parentheses when that helps)" : "English"}.`,
  `Subject: ${EXAM_NAME[track]}.`,
];

export function termsMessages(track: Track, ref: LessonRef, lang: "en" | "es") {
  const system = [...BASE(track, lang), "TERMS_JSON", "List 12 to 18 key vocabulary terms a student must know for this unit, each with a short, clear meaning in plain words.", "Return ONLY JSON: {\"terms\":[{\"term\":\"\",\"meaning\":\"\"}]}"].join("\n");
  return [{ role: "system" as const, content: system }, { role: "user" as const, content: where(ref) }];
}

export function cramMessages(track: Track, ref: LessonRef, lang: "en" | "es") {
  const system = [...BASE(track, lang), "CRAM_JSON", "Write a one-page cram sheet for the night before the test on this unit: the ideas that matter most, key terms, important numbers, dates or formulas (use an empty list if none apply), common traps, and test-taking tips.", "Return ONLY JSON: {\"mustKnow\":[\"\"],\"terms\":[{\"term\":\"\",\"meaning\":\"\"}],\"numbers\":[\"\"],\"traps\":[\"\"],\"examTips\":[\"\"]}"].join("\n");
  return [{ role: "system" as const, content: system }, { role: "user" as const, content: where(ref) }];
}

export function notesMessages(track: Track, topic: LessonRef, lang: "en" | "es") {
  const system = [
    "You are Rumbo's study-path tutor for students aged 13 to 18 in South Texas. NOTES_JSON",
    `Write original study notes for one lesson of ${EXAM_NAME[track]}.`,
    topic.topic ? "The lesson covers ONE topic of the unit. Write notes for that topic only, not the whole unit." : "The lesson covers a whole unit or skill, so give a clear overview.",
    track === "ap" ? "Follow the unit as described in that course's College Board Course and Exam Description (CED). Cover the ideas a student needs for the multiple-choice and free-response sections." : "Teach the skill that the test measures and the kinds of questions it asks.",
    "Be accurate. If you are not sure of a date, number or fact, leave it out instead of guessing. Do not quote copyrighted text. Explain in clear, friendly language.",
    "Math and science: put formulas in LaTeX between dollar signs, like $v = d/t$.",
    `Write everything in ${lang === "es" ? "Spanish (natural South Texas Spanish; keep standard English or subject terms in parentheses when that helps)" : "English"}.`,
    "Return ONLY JSON with this shape: {\"summary\":\"2 to 4 sentences\",\"keyIdeas\":[\"3 to 8 short sentences\"],\"terms\":[{\"term\":\"\",\"meaning\":\"\"}],\"example\":{\"title\":\"\",\"body\":\"a worked example or a short case that shows the idea\"},\"mistakes\":[\"common mistakes students make\"],\"selfCheck\":[\"2 to 5 questions a student can ask themselves\"]}",
  ].join("\n");
  const user = where(topic);
  return [{ role: "system" as const, content: system }, { role: "user" as const, content: user }];
}
