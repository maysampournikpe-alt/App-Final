import { addDays, diffDays, type ISODate } from "./dates";

export const HABITS_KEY = "habits";
export interface Habit { id: string; name: string; done: ISODate[]; created: ISODate }
export const NO_HABITS: Habit[] = [];

export const toggleDay = (h: Habit, day: ISODate): Habit =>
  ({ ...h, done: h.done.includes(day) ? h.done.filter((d) => d !== day) : [...h.done, day].sort() });

/** Days in a row up to today. If today is not done yet, yesterday still counts so the streak is not lost mid-day. */
export function currentStreak(done: ISODate[], now: ISODate): number {
  const set = new Set(done);
  let day = set.has(now) ? now : addDays(now, -1);
  let n = 0;
  while (set.has(day)) { n++; day = addDays(day, -1); }
  return n;
}

export function bestStreak(done: ISODate[]): number {
  const days = [...new Set(done)].sort();
  let best = 0, run = 0;
  days.forEach((d, i) => { run = i > 0 && diffDays(days[i - 1], d) === 1 ? run + 1 : 1; best = Math.max(best, run); });
  return best;
}

/** The last `n` days ending today, oldest first. */
export const lastDays = (now: ISODate, n: number): ISODate[] => Array.from({ length: n }, (_, i) => addDays(now, i - (n - 1)));
