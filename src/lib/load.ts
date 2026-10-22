// A simple, explainable measure of how heavy a week is, and gentle signs of burnout. These are nudges, not diagnoses.
export interface WeekItems { tests: number; projects: number; homework: number; commitmentHours: number }
export type Level = "light" | "medium" | "heavy";

export const weekScore = (w: WeekItems) => w.tests * 3 + w.projects * 2 + w.homework + w.commitmentHours * 0.5;
export const levelOf = (score: number): Level => (score <= 6 ? "light" : score <= 12 ? "medium" : "heavy");

export interface BurnoutInput { avgSleep: number | null; lowMoodDays: number; weekLevel: Level; studyHours: number; restDays: number }
export type Signal = "sleep" | "sleepLow" | "mood" | "load" | "study" | "rest";
/** Counts warning signs. Each one is shown to the student, so they can see why. */
export function burnoutSignals(i: BurnoutInput): { signals: Signal[]; level: Level } {
  const s: Signal[] = [];
  if (i.avgSleep !== null && i.avgSleep < 7) s.push("sleepLow"); else if (i.avgSleep !== null && i.avgSleep < 8) s.push("sleep");
  if (i.lowMoodDays >= 3) s.push("mood");
  if (i.weekLevel === "heavy") s.push("load");
  if (i.studyHours > 25) s.push("study");
  if (i.restDays === 0) s.push("rest");
  const points = s.reduce((n, x) => n + (x === "sleepLow" || x === "mood" || x === "load" ? 2 : 1), 0);
  return { signals: s, level: points >= 4 ? "heavy" : points >= 2 ? "medium" : "light" };
}

export const BALANCE_AREAS = ["school", "activities", "rest", "friends"] as const;
export type BalanceArea = (typeof BALANCE_AREAS)[number];
/** Shares of the week in each area, as percents that add up to 100. */
export function balanceShares(hours: Record<BalanceArea, number>): Record<BalanceArea, number> {
  const total = BALANCE_AREAS.reduce((n, a) => n + Math.max(0, hours[a]), 0);
  if (total === 0) return { school: 0, activities: 0, rest: 0, friends: 0 };
  const raw = BALANCE_AREAS.map((a) => (Math.max(0, hours[a]) / total) * 100);
  const floor = raw.map(Math.floor);
  let rem = 100 - floor.reduce((n, x) => n + x, 0);
  raw.map((r, i) => [r - floor[i], i] as const).sort((a, b) => b[0] - a[0]).forEach(([, i]) => { if (rem > 0) { floor[i]++; rem--; } });
  return Object.fromEntries(BALANCE_AREAS.map((a, i) => [a, floor[i]])) as Record<BalanceArea, number>;
}
