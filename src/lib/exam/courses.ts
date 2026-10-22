import { ACT_TOPICS, SAT_TOPICS, TSI_TOPICS } from "@/data/exam-topics";
import { AP_COURSES, type ApCourse } from "./ap";
import { EXAMS } from "./config";
import type { ExamId } from "./types";

const OUTLINES = { sat: SAT_TOPICS, psat: SAT_TOPICS, act: ACT_TOPICS, tsi: TSI_TOPICS } as const;

/**
 * Every test is shaped like an AP course for the study screens: a section is a "course", a skill is a "unit",
 * and the sub-skills are numbered topics (1.1, 1.2, ...). AP courses come from the AP outline.
 */
function buildCourses(exam: Exclude<ExamId, "ap">): ApCourse[] {
  const outline = OUTLINES[exam];
  return EXAMS[exam].sections.map((sec) => ({
    id: sec.id, en: sec.en, es: sec.es,
    units: sec.skills.map((sk, i) => {
      const no = i + 1;
      const names = outline[sec.id]?.[sk.id] ?? [];
      return { id: sk.id, en: sk.en, es: sk.es, no, topics: names.map(([en, es, cover], j) => ({ id: `${sk.id}-${j + 1}`, num: `${no}.${j + 1}`, en, es, cover })) };
    }),
  }));
}

const cache: Partial<Record<ExamId, ApCourse[]>> = {};
export const coursesFor = (exam: ExamId): ApCourse[] => (exam === "ap" ? AP_COURSES : (cache[exam] ??= buildCourses(exam)));
export const courseFor = (exam: ExamId, id: string) => coursesFor(exam).find((c) => c.id === id);

/** The PSAT practices from the SAT, so the AI and the shared bank treat it as the SAT. */
export const apiTrack = (t: ExamId): "ap" | "sat" | "act" | "tsi" => (t === "psat" ? "sat" : t);
