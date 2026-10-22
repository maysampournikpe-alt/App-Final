import { addDays, diffDays, type ISODate } from "./dates";

/** Spreads `units` study days between `start` and the exam, leaving `buffer` days for a final review. */
export function planUnits(units: number, start: ISODate, exam: ISODate, buffer = 5): { dates: ISODate[]; tight: boolean } | null {
  if (units < 1) return null;
  const total = diffDays(start, exam);
  if (total < 1) return null;
  const avail = Math.max(1, total - Math.min(buffer, Math.floor(total / 3)));
  const tight = avail < units * 2;
  const dates = Array.from({ length: units }, (_, i) => addDays(start, Math.min(avail - 1, Math.floor((i * avail) / units))));
  return { dates, tight };
}
