import { addDays, diffDays, type ISODate } from "./dates";

export interface XpDoc { xp: number; days: ISODate[] }
export const NO_XP: XpDoc = { xp: 0, days: [] };

/** Points for what a student did. Reading notes and passing a lesson count, and each right answer counts a little. */
export const POINTS = { notes: 10, correct: 5, passed: 20, mastered: 15, mock: 2 } as const;

export function lessonXp(o: { firstNotes: boolean; right: number; n: number; wasPassed: boolean; nowPassed: boolean; wasMastered: boolean; nowMastered: boolean }): number {
  return (o.firstNotes ? POINTS.notes : 0) + o.right * POINTS.correct + (!o.wasPassed && o.nowPassed ? POINTS.passed : 0) + (!o.wasMastered && o.nowMastered ? POINTS.mastered : 0);
}

export const addXp = (doc: XpDoc, points: number, now: ISODate): XpDoc => ({ xp: doc.xp + Math.max(0, Math.round(points)), days: doc.days.includes(now) ? doc.days : [...doc.days, now].slice(-90) });

/** Days in a row with some activity, counting back from today (or from yesterday, so the streak is not lost before tonight's study). */
export function streakOf(days: ISODate[], now: ISODate): number {
  const set = new Set(days);
  let day = set.has(now) ? now : addDays(now, -1);
  let n = 0;
  while (set.has(day)) { n++; day = addDays(day, -1); }
  return n;
}
export const daysSince = (last: ISODate | undefined, now: ISODate) => (last ? diffDays(last, now) : null);
