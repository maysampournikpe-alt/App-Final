import { addDays, type ISODate } from "./dates";
import { startOfWeek } from "./calendar";

export const SESSIONS_KEY = "study-sessions";
export interface Session { id: string; date: ISODate; subject: string; minutes: number; focus: 1 | 2 | 3 | 4 | 5 }
export const NO_SESSIONS: Session[] = [];

/** Minutes per subject in the week that contains `anyDayInWeek`, biggest first. */
export function weekBySubject(sessions: Session[], anyDayInWeek: ISODate): { subject: string; minutes: number }[] {
  const start = startOfWeek(anyDayInWeek), end = addDays(start, 6);
  const totals = new Map<string, number>();
  for (const s of sessions) if (s.date >= start && s.date <= end) totals.set(s.subject, (totals.get(s.subject) ?? 0) + s.minutes);
  return [...totals].map(([subject, minutes]) => ({ subject, minutes })).sort((a, b) => b.minutes - a.minutes || a.subject.localeCompare(b.subject));
}

/** Total minutes for each of the last `weeks` weeks, oldest first. */
export function weeklyTotals(sessions: Session[], now: ISODate, weeks: number): { start: ISODate; minutes: number }[] {
  const thisWeek = startOfWeek(now);
  return Array.from({ length: weeks }, (_, i) => {
    const start = addDays(thisWeek, -7 * (weeks - 1 - i)), end = addDays(start, 6);
    return { start, minutes: sessions.filter((s) => s.date >= start && s.date <= end).reduce((n, s) => n + s.minutes, 0) };
  });
}

export const averageFocus = (sessions: Session[]) => (sessions.length ? Math.round((sessions.reduce((n, s) => n + s.focus, 0) / sessions.length) * 10) / 10 : 0);
export const hoursText = (minutes: number) => (minutes < 60 ? `${minutes} min` : `${Math.floor(minutes / 60)} h ${minutes % 60 ? `${minutes % 60} min` : ""}`.trim());
