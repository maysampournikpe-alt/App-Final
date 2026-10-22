import { addDays, diffDays, isValidISO, parseISO, toISO, type ISODate } from "./dates";
import type { Assignment } from "./homework";
import type { SavedListing } from "./saved";
import type { SchoolEvent } from "./schedule";

const MONTHS = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];
const MONTHS_ES = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];

/**
 * Finds a date inside the free text a listing gives ("March 15, 2027", "Due 3/15/27", "2027-03-15", "Apply by Feb 1").
 * Returns null for "Rolling", "Varies" and anything without a clear day. A month and day with no year means the next one coming.
 */
export function parseDeadline(text: string | null | undefined, now: ISODate): ISODate | null {
  if (!text) return null;
  const t = text.toLowerCase();
  const iso = t.match(/\b(\d{4})-(\d{2})-(\d{2})\b/);
  if (iso && isValidISO(iso[0])) return iso[0];

  const make = (y: number | null, m: number, d: number): ISODate | null => {
    if (m < 0 || m > 11 || d < 1 || d > 31) return null;
    const nowYear = Number(now.slice(0, 4));
    const build = (year: number) => { const dt = new Date(year, m, d); return dt.getMonth() === m && dt.getDate() === d ? toISO(dt) : null; };
    if (y !== null) return build(y < 100 ? 2000 + y : y);
    const thisYear = build(nowYear);
    return thisYear && thisYear >= now ? thisYear : build(nowYear + 1);
  };

  const slash = t.match(/\b(\d{1,2})\/(\d{1,2})(?:\/(\d{2,4}))?\b/);
  if (slash) return make(slash[3] ? Number(slash[3]) : null, Number(slash[1]) - 1, Number(slash[2]));

  const names = [...MONTHS, ...MONTHS_ES].map((m, i) => [m, i % 12] as const);
  for (const [abbr, idx] of names) {
    const re = new RegExp(`\\b${abbr}[a-z]*\\.?\\s+(\\d{1,2})(?:st|nd|rd|th)?(?:,?\\s+(\\d{4}))?`);
    const m = t.match(re);
    if (m) return make(m[2] ? Number(m[2]) : null, idx, Number(m[1]));
    const es = t.match(new RegExp(`\\b(\\d{1,2})\\s+de\\s+${abbr}[a-z]*(?:\\s+de\\s+(\\d{4}))?`));
    if (es) return make(es[2] ? Number(es[2]) : null, idx, Number(es[1]));
  }
  return null;
}

export interface CalItem { id: string; date: ISODate; title: string; kind: "opportunity" | "homework" | "countdown" | "event"; href?: string }

export function collectItems(o: {
  saved: Pick<SavedListing, "title" | "deadline" | "sourceUrl">[];
  homework: Assignment[];
  countdowns: { id: string; name: string; date: ISODate }[];
  events?: SchoolEvent[];
  now: ISODate;
}): CalItem[] {
  const items: CalItem[] = [];
  for (const s of o.saved) { const d = parseDeadline(s.deadline, o.now); if (d) items.push({ id: `o-${s.sourceUrl}`, date: d, title: s.title, kind: "opportunity", href: s.sourceUrl ?? undefined }); }
  for (const h of o.homework) if (!h.done) items.push({ id: `h-${h.id}`, date: h.due, title: h.cls ? `${h.title} (${h.cls})` : h.title, kind: "homework" });
  for (const c of o.countdowns) items.push({ id: `c-${c.id}`, date: c.date, title: c.name, kind: "countdown" });
  for (const e of o.events ?? []) items.push({ id: `e-${e.id}`, date: e.date, title: e.title, kind: "event" });
  return items.sort((a, b) => a.date.localeCompare(b.date) || a.title.localeCompare(b.title));
}

/** Weeks (Monday first) covering a month. Days outside the month are marked. */
export function monthGrid(year: number, month: number): { date: ISODate; inMonth: boolean }[][] {
  const first = new Date(year, month, 1);
  const lead = (first.getDay() + 6) % 7; // Monday = 0
  const start = addDays(toISO(first), -lead);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const weeks = Math.ceil((lead + daysInMonth) / 7);
  return Array.from({ length: weeks }, (_, w) =>
    Array.from({ length: 7 }, (_, d) => { const date = addDays(start, w * 7 + d); return { date, inMonth: parseISO(date).getMonth() === month }; }));
}

export type Reminder = "today" | "tomorrow" | "week";
/** What to remind about now: due today, due tomorrow, or due within seven days. Past items are skipped. */
export function reminderFor(date: ISODate, now: ISODate): Reminder | null {
  const d = diffDays(now, date);
  return d === 0 ? "today" : d === 1 ? "tomorrow" : d > 1 && d <= 7 ? "week" : null;
}

export const startOfWeek = (d: ISODate): ISODate => addDays(d, -((parseISO(d).getDay() + 6) % 7));
export const monthKey = (d: ISODate) => d.slice(0, 7);
