import { diffDays, parseISO, type ISODate } from "./dates";

/** "14:30" -> 870 minutes after midnight. NaN for anything else. */
export const toMin = (t: string): number => { const m = /^(\d{1,2}):(\d{2})$/.exec(t); return m ? Number(m[1]) * 60 + Number(m[2]) : NaN; };
export const fmtTime = (t: string, lang: "en" | "es" = "en"): string => {
  const m = toMin(t); if (Number.isNaN(m)) return t;
  const h = Math.floor(m / 60), mm = m % 60;
  if (lang === "es") return `${h}:${String(mm).padStart(2, "0")}`;
  return `${h % 12 === 0 ? 12 : h % 12}:${String(mm).padStart(2, "0")} ${h < 12 ? "AM" : "PM"}`;
};
export const validRange = (start: string, end: string) => { const a = toMin(start), b = toMin(end); return !Number.isNaN(a) && !Number.isNaN(b) && b > a; };

/** Two time ranges on the same day overlap if one starts before the other ends. Touching end-to-start is fine. */
export const overlaps = (a: { start: string; end: string }, b: { start: string; end: string }) => toMin(a.start) < toMin(b.end) && toMin(b.start) < toMin(a.end);

export interface Slot { id: string; label: string; day: number; start: string; end: string }
/** Every pair of slots that are on the same day and overlap. `day` is 0 for Monday through 6 for Sunday. */
export function findConflicts(slots: Slot[]): [Slot, Slot][] {
  const out: [Slot, Slot][] = [];
  for (let i = 0; i < slots.length; i++) for (let j = i + 1; j < slots.length; j++) if (slots[i].day === slots[j].day && overlaps(slots[i], slots[j])) out.push([slots[i], slots[j]]);
  return out;
}

/** Monday = 0 ... Sunday = 6 for an ISO date. */
export const dayIndex = (d: ISODate) => (parseISO(d).getDay() + 6) % 7;
export const DAY_KEYS = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"] as const;

export type AB = "A" | "B";
/** A running count of school days (Monday to Friday only), the same for every date. Weekends return null. */
const schoolDayNumber = (d: ISODate): number | null => {
  if (dayIndex(d) > 4) return null;
  const days = diffDays("1970-01-05", d); // 1970-01-05 was a Monday
  return Math.floor(days / 7) * 5 + dayIndex(d);
};
/** Which letter day a school day is, given one known date and its letter. Weekends have no letter. Holidays are not known, so the student can reset the anchor. */
export function abDayFor(date: ISODate, anchor: { date: ISODate; day: AB }): AB | null {
  const n = schoolDayNumber(date), a = schoolDayNumber(anchor.date);
  if (n === null || a === null) return null;
  return (n - a) % 2 === 0 ? anchor.day : anchor.day === "A" ? "B" : "A";
}

export interface ClassItem { id: string; name: string; room: string; start: string; end: string; days: string[]; bring: string }
export interface ScheduleDoc { kind: "weekdays" | "ab"; anchor: { date: ISODate; day: AB } | null; classes: ClassItem[] }
export const SCHEDULE_KEY = "class-schedule";
export const NO_SCHEDULE: ScheduleDoc = { kind: "weekdays", anchor: null, classes: [] };

/** The classes meeting on a date, in time order. */
export function classesOn(date: ISODate, s: ScheduleDoc): ClassItem[] {
  let key: string | null;
  if (s.kind === "ab") key = s.anchor ? abDayFor(date, s.anchor) : null; else key = dayIndex(date) <= 4 ? DAY_KEYS[dayIndex(date)] : null;
  if (!key) return [];
  return s.classes.filter((c) => c.days.includes(key!)).sort((a, b) => toMin(a.start) - toMin(b.start));
}

export type EventKind = "holiday" | "early" | "testing" | "test" | "project" | "break" | "other";
export const EVENT_KINDS: EventKind[] = ["holiday", "early", "testing", "test", "project", "break", "other"];
export interface SchoolEvent { id: string; date: ISODate; end?: ISODate; title: string; kind: EventKind }
export const EVENTS_KEY = "school-events";
export const NO_EVENTS: SchoolEvent[] = [];

export type BlockKind = "school" | "practice" | "work" | "study" | "other";
export const BLOCK_KINDS: BlockKind[] = ["school", "practice", "work", "study", "other"];
export interface Block { id: string; title: string; day: number; start: string; end: string; kind: BlockKind }
export const BLOCKS_KEY = "weekly-blocks";
export const NO_BLOCKS: Block[] = [];
export const blockHours = (b: Block) => Math.max(0, (toMin(b.end) - toMin(b.start)) / 60);

/** Free minutes per weekday (Monday first) that the planners may use. */
export const FREE_KEY = "free-minutes";
export const DEFAULT_FREE = [60, 60, 60, 60, 60, 120, 120];
export const freeOn = (free: number[], d: ISODate) => Math.max(0, free[dayIndex(d)] ?? 0);
