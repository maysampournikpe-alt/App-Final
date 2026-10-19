import { diffDays, today, type ISODate } from "./dates";

export interface Assignment { id: string; title: string; cls: string; due: ISODate; done: boolean }
export const NO_ASSIGNMENTS: Assignment[] = [];
export const HOMEWORK_KEY = "homework";

export type Bucket = "overdue" | "today" | "week" | "later" | "done";

export function bucketOf(a: Assignment, now: ISODate = today()): Bucket {
  if (a.done) return "done";
  const d = diffDays(now, a.due);
  if (d < 0) return "overdue";
  if (d === 0) return "today";
  return d <= 7 ? "week" : "later";
}

export const sortByDue = (list: Assignment[]) => [...list].sort((a, b) => a.due.localeCompare(b.due) || a.title.localeCompare(b.title));
