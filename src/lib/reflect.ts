import { startOfWeek, monthKey } from "./calendar";
import { diffDays, type ISODate } from "./dates";

export const REFLECT_KEY = "reflections";
export type ReflectKind = "weekly" | "monthly" | "journal";
export interface Entry { answers: Record<string, string>; rating?: number; updated: number }
export type Reflections = Record<string, Entry>;
export const NO_REFLECTIONS: Reflections = {};

/** One entry per period: the Monday of the week, or the month. */
export const periodKey = (kind: ReflectKind, now: ISODate) => `${kind}:${kind === "monthly" ? monthKey(now) : startOfWeek(now)}`;

export const FIELDS: Record<ReflectKind, string[]> = {
  weekly: ["wins", "hard", "next"],
  monthly: ["worked", "didnt", "change", "proud"],
  journal: ["entry"],
};

/** A new journal prompt each week, in a fixed order. */
export const JOURNAL_PROMPT_COUNT = 8;
export const journalPromptIndex = (now: ISODate) => {
  const weeks = Math.floor(diffDays("2026-01-05", startOfWeek(now)) / 7);
  return ((weeks % JOURNAL_PROMPT_COUNT) + JOURNAL_PROMPT_COUNT) % JOURNAL_PROMPT_COUNT; // also correct for dates before the start
};

export const isFilled = (e: Entry | undefined) => !!e && Object.values(e.answers).some((v) => v.trim().length > 0);
export const pastKeys = (r: Reflections, kind: ReflectKind, current: string) =>
  Object.keys(r).filter((k) => k.startsWith(`${kind}:`) && k !== current && isFilled(r[k])).sort().reverse();
