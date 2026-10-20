import type { ISODate } from "./dates";

export const ROUTINES_KEY = "routines";
export type RoutineId = "morning" | "evening";
export interface RoutineStep { id: string; text: string }
export interface RoutineDoc { steps: Record<RoutineId, RoutineStep[]>; done: Record<ISODate, string[]> }
export const NO_ROUTINES: RoutineDoc = { steps: { morning: [], evening: [] }, done: {} };

/** Steps checked today for one routine. Each day starts fresh because `done` is keyed by date. */
export const doneToday = (doc: RoutineDoc, id: RoutineId, now: ISODate) => {
  const mine = new Set(doc.steps[id].map((s) => s.id));
  return (doc.done[now] ?? []).filter((x) => mine.has(x));
};
export const progress = (doc: RoutineDoc, id: RoutineId, now: ISODate) =>
  doc.steps[id].length ? Math.round((doneToday(doc, id, now).length / doc.steps[id].length) * 100) : 0;

export const toggleStep = (doc: RoutineDoc, stepId: string, now: ISODate): RoutineDoc => {
  const cur = doc.done[now] ?? [];
  const next = cur.includes(stepId) ? cur.filter((x) => x !== stepId) : [...cur, stepId];
  // Keep only the last 60 days so the saved data stays small.
  const keep = Object.keys(doc.done).filter((d) => d !== now).sort().slice(-59);
  return { ...doc, done: { ...Object.fromEntries(keep.map((d) => [d, doc.done[d]])), [now]: next } };
};
