// Prompts and shapes for the study path: unit notes. Quizzes reuse the checked generator in lib/exam/verify.
// The browser sends only ids from our own lists, never text, so there is nothing for a student to inject.
import { z } from "zod";

export type Track = "ap" | "sat" | "act" | "tsi";
export const TRACKS: Track[] = ["ap", "sat", "act", "tsi"];
/** Longest ids the API accepts. A test checks every course, skill and topic id fits. */
export const ID_MAX = { section: 60, skill: 40, topic: 48 } as const;

const termList = z.array(z.object({ term: z.string().min(1).max(90), meaning: z.string().min(5).max(420) }));
export const notesSchema = z.object({
  summary: z.string().min(40).max(1300),
  sections: z.array(z.object({ heading: z.string().min(2).max(110), body: z.string().min(60).max(2200) })).min(3).max(9),
  keyIdeas: z.array(z.string().min(8).max(420)).min(4).max(14),
  terms: termList.min(4).max(20),
  examples: z.array(z.object({ title: z.string().max(140), body: z.string().min(30).max(1800) })).min(1).max(5),
  mistakes: z.array(z.string().min(8).max(400)).min(2).max(8),
  howTested: z.array(z.string().min(8).max(460)).min(2).max(8),
  memoryTips: z.array(z.string().min(8).max(300)).max(5).default([]),
  selfCheck: z.array(z.string().min(8).max(320)).min(3).max(8),
});
export type Notes = z.infer<typeof notesSchema>;
/** Bump when the shape changes, so notes saved on a device in the old shape are fetched again. */
export const NOTES_VERSION = "v3";
/** Bump when notes, vocabulary or cram prompts change a lot, so the shared saved copies are written again. */
export const DOC_VERSION = "d2";

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

export interface LessonRef { section: string; skill: string; topic?: string; topicNum?: string; cover?: string; unitTopics?: string[]; about?: string; avoid?: string }
const where = (r: LessonRef) => `Course or test: ${r.section}\nUnit or skill: ${r.skill}${r.topic ? `\nTopic ${r.topicNum}: ${r.topic}` : ""}${r.about ? `\nThe course is about: ${r.about}` : ""}${r.avoid ? `\nNever include in this course: ${r.avoid}` : ""}${r.cover ? `\n${r.topic ? "The notes must cover" : "The unit covers"}: ${r.cover}` : ""}${!r.topic && r.unitTopics?.length ? `\nThis unit has these topics, so the overview should walk through all of them: ${r.unitTopics.join("; ")}` : ""}`;
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

/** `compact` asks for shorter notes. It is used when only the free Groq models are available, whose per-minute limit cannot fit a full set. */
export function notesMessages(track: Track, topic: LessonRef, lang: "en" | "es", compact = false) {
  const ap = track === "ap";
  const system = [
    "You are Rumbo's study-path tutor for students aged 13 to 18 in South Texas. NOTES_JSON",
    `Write original, detailed study notes for one lesson of ${EXAM_NAME[track]}.`,
    topic.topic ? "The lesson covers ONE topic of the unit. Write notes for that topic only, not the whole unit." : "The lesson covers a whole unit or skill, so give a clear overview of every part of it.",
    ap
      ? "Goal: a student who studies these notes and practices can earn a 5 on the AP exam. Follow the topic as described in that course's College Board Course and Exam Description (CED), and teach everything the multiple-choice and free-response sections can ask about it. Be thorough, like a strong textbook section taught by a good tutor."
      : "Goal: a student who studies these notes and then practices can get every question of this kind right on test day and aim for a perfect score. Write like an expert test-prep coach who also teaches the underlying idea from the ground up, so a student who is weak at this skill can follow it. Teach the idea, then the exact numbered method for each question type, the rules the test uses, the shortcuts, the traps and the timing.",
    "Content rules: \"sections\" has " + (compact ? "3 to 5 sections, each with a heading and a body of 70 to 160 words" : "4 to 8 sections, each with a heading and a body of 100 to 300 words") + ". Cover definitions and clear explanations; processes step by step (write the steps inside the body as 1), 2), 3)); cause and effect; comparisons; and the specific people, events, dates, numbers, formulas, experiments, rules or examples that belong to this topic, but only those you are sure are correct; and how this topic connects to other parts of the course.",
    ap ? "" : "Test-prep rules for this lesson: (1) Include a section that shows what the question looks like and the kinds of wording it uses. (2) Include a section called a step-by-step method with numbered steps a student can follow every time, plus 'if you see X, do Y' patterns. (3) Include the rules, formulas or grammar and reading conventions the test uses, stated exactly. (4) Include a section on the most common wrong-answer traps and how to eliminate wrong choices. (5) Give a time target in seconds per question and when to skip and come back. (6) For the digital SAT and PSAT math, say when the built-in Desmos graphing calculator or the reference sheet saves time; for the ACT and TSI say which calculator rules apply only if you are sure, otherwise leave it out. (7) Give 3 or 4 worked examples with every step shown and the reason for each step, covering an easy, a medium and a hard version of the question type. (8) Use the 'must cover' brief below as a checklist and do not leave any part of it out.",
    "\"keyIdeas\": 5 to 10 short, complete statements a student could memorize. \"terms\": 6 to 14 key terms with precise meanings. \"examples\": " + (compact ? "2 to 3" : "2 to 4") + " worked examples or cases that show the idea in use: show every step for math, science and computer science; give a specific case with analysis for history, social science and arts; model an analysis of a short original sample for language and literature.",
    "\"mistakes\": 3 to 6 common mistakes and how to avoid them. \"howTested\": 3 to 5 points on how this topic shows up on the real test: question types, the skills or task verbs used, what a strong answer includes" + (ap ? ", for both the multiple-choice and free-response parts." : ", and how to approach them under time pressure."),
    "\"memoryTips\": 2 to 4 mnemonics, patterns or shortcuts that help recall (use an empty list if none fit). \"selfCheck\": 4 to 6 questions the student can ask themselves to test understanding.",
    "Stay inside this course. Teach only what its own course description requires for this topic, and never teach content that belongs to a different course (for example AP Chemistry ideas in AP Biology). If a brief says what the topic covers, cover it and stay within it.",
    "Be accurate. If you are not sure of a date, number or fact, leave it out instead of guessing. Do not quote copyrighted text. Explain in clear, friendly language.",
    "Math and science: put formulas in LaTeX between dollar signs, like $v = d/t$. Write a literal dollar sign as \\$.",
    `Write everything in ${lang === "es" ? "Spanish (natural South Texas Spanish; keep standard English or subject terms in parentheses when that helps)" : "English"}.`,
    "Return ONLY JSON with this shape: {\"summary\":\"3 to 5 sentences\",\"sections\":[{\"heading\":\"\",\"body\":\"\"}],\"keyIdeas\":[\"\"],\"terms\":[{\"term\":\"\",\"meaning\":\"\"}],\"examples\":[{\"title\":\"\",\"body\":\"\"}],\"mistakes\":[\"\"],\"howTested\":[\"\"],\"memoryTips\":[\"\"],\"selfCheck\":[\"\"]}",
  ].join("\n");
  return [{ role: "system" as const, content: system }, { role: "user" as const, content: where(topic) }];
}
