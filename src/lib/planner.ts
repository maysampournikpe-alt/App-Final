import { addDays, diffDays, type ISODate } from "./dates";

export interface PlanTask { id: string; title: string; minutes: number; due?: ISODate | null; priority?: number }
export interface Session { date: ISODate; taskId: string; title: string; minutes: number }
export interface ScheduleResult {
  sessions: Session[];
  unscheduled: { taskId: string; title: string; minutes: number; reason: "no-time" | "overdue" }[];
}

/**
 * Builds a week (or more) of study and work sessions. Earliest deadline first, then higher priority.
 * A task is never scheduled after its due date, and one task gets at most `maxSession` minutes on a single day.
 * Whatever does not fit is reported instead of being squeezed in or dropped silently.
 */
export function autoSchedule(tasks: PlanTask[], capacity: (d: ISODate) => number, start: ISODate, days: number, maxSession = 90): ScheduleResult {
  const order = [...tasks].filter((t) => t.minutes > 0).sort((a, b) => (a.due ?? "9999-12-31").localeCompare(b.due ?? "9999-12-31") || (b.priority ?? 0) - (a.priority ?? 0) || a.title.localeCompare(b.title));
  const left = new Map(order.map((t) => [t.id, t.minutes]));
  const sessions: Session[] = [];
  for (let i = 0; i < days; i++) {
    const date = addDays(start, i);
    let cap = capacity(date);
    if (cap <= 0) continue;
    for (const t of order) {
      if (cap <= 0) break;
      const rem = left.get(t.id)!;
      if (rem <= 0 || (t.due && date > t.due)) continue;
      const take = Math.min(rem, maxSession, cap);
      sessions.push({ date, taskId: t.id, title: t.title, minutes: take });
      left.set(t.id, rem - take);
      cap -= take;
    }
  }
  const unscheduled = order.filter((t) => left.get(t.id)! > 0).map((t) => ({ taskId: t.id, title: t.title, minutes: left.get(t.id)!, reason: (t.due && t.due < start ? "overdue" : "no-time") as "overdue" | "no-time" }));
  return { sessions, unscheduled };
}

export interface StudyTest { id: string; name: string; date: ISODate; minutes: number }
/** Spreads each test's study time over the days before it (not all on the last night), within each day's free time. */
export function spreadStudy(tests: StudyTest[], capacity: (d: ISODate) => number, start: ISODate): { sessions: Session[]; short: { id: string; name: string; minutes: number }[] } {
  const used = new Map<ISODate, number>();
  const free = (d: ISODate) => capacity(d) - (used.get(d) ?? 0);
  const sessions: Session[] = [];
  const short: { id: string; name: string; minutes: number }[] = [];
  for (const t of [...tests].sort((a, b) => a.date.localeCompare(b.date))) {
    const span = diffDays(start, t.date);
    const days = Array.from({ length: Math.max(0, span) }, (_, i) => addDays(start, i)).filter((d) => capacity(d) > 0);
    let left = t.minutes;
    const per = days.length ? Math.max(5, Math.ceil(t.minutes / days.length / 5) * 5) : 0;
    const given = new Map<ISODate, number>();
    for (let pass = 0; pass < 6 && left > 0 && days.length; pass++) {
      for (const d of days) {
        const take = Math.min(pass === 0 ? per : 15, left, free(d));
        if (take <= 0) continue;
        used.set(d, (used.get(d) ?? 0) + take); given.set(d, (given.get(d) ?? 0) + take); left -= take;
        if (left <= 0) break;
      }
    }
    for (const [date, minutes] of [...given].sort(([a], [b]) => a.localeCompare(b))) sessions.push({ date, taskId: t.id, title: t.name, minutes });
    if (left > 0) short.push({ id: t.id, name: t.name, minutes: left });
  }
  return { sessions: sessions.sort((a, b) => a.date.localeCompare(b.date) || a.title.localeCompare(b.title)), short };
}

/** Splits project tasks among teammates so the total effort is as even as possible (biggest task first, to the least loaded person). */
export function splitFairly(tasks: { id: string; title: string; points: number }[], people: string[]) {
  const loads = people.map(() => 0);
  const assigned: Record<string, { id: string; title: string; points: number }[]> = Object.fromEntries(people.map((p) => [p, []]));
  for (const t of [...tasks].sort((a, b) => b.points - a.points || a.title.localeCompare(b.title))) {
    let best = 0;
    loads.forEach((l, i) => { if (l < loads[best]) best = i; });
    loads[best] += t.points; assigned[people[best]].push(t);
  }
  return { assigned, loads: Object.fromEntries(people.map((p, i) => [p, loads[i]])) as Record<string, number> };
}
