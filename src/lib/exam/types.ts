export type ExamId = "sat" | "psat" | "act" | "tsi";

/** One practice question. Math can use $...$ for LaTeX. Same shape for every exam. */
export interface Question {
  id: string;
  exam: "sat" | "act" | "tsi";   // which bank it belongs to (the PSAT reuses the SAT bank)
  section: string;               // e.g. "rw", "math"
  skill: string;                 // e.g. "algebra"
  difficulty: 1 | 2 | 3;
  type: "mc" | "grid";
  stem: string;
  passage?: string;              // short reading passage shown above the question
  choices?: string[];            // mc only: exactly 4, shown as A to D
  answer: string;                // mc: "A" to "D"; grid: the main accepted answer
  accept?: string[];             // grid: other accepted spellings, e.g. ["7.5", "15/2"]
  explanation: string;
  source?: "seed" | "generated";
}

export interface SkillInfo { id: string; en: string; es: string }
export interface SectionConfig {
  id: string;
  en: string;
  es: string;
  /** Real-test length, for the full-length shape and the pace. */
  questions: number;
  minutes: number;
  skills: SkillInfo[];
}
export interface ExamConfig {
  id: ExamId;
  bank: Question["exam"];
  en: string;
  es: string;
  sections: SectionConfig[];
  /** Section score range on the real scale, for the estimate. */
  sectionScale: { min: number; max: number; step: number };
  maxDifficulty?: 1 | 2 | 3;
}

export interface Answered { qid: string; section: string; skill: string; answer: string; correct: boolean }
export interface Attempt {
  id: string;
  exam: ExamId;
  mode: "diagnostic" | "section" | "full";
  startedAt: number;
  finishedAt: number;
  timed: boolean;
  items: Answered[];
  unanswered: number;
}
export interface Session {
  exam: ExamId;
  mode: Attempt["mode"];
  qids: string[];
  answers: Record<string, string>;
  flags: string[];
  startedAt: number;
  endsAt: number | null; // null when untimed or paused
  pausedRemainingMs?: number; // set while paused; time resumes from here
  timed: boolean;
}
