// Calendar dates as "YYYY-MM-DD" strings in the student's own time zone. Avoids the
// classic bug where new Date("2026-10-26") is parsed as UTC and shows as the day before.
export type ISODate = string;

export const toISO = (d: Date): ISODate =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

export const parseISO = (s: ISODate): Date => {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, m - 1, d);
};

export const today = (): ISODate => toISO(new Date());

export const addDays = (s: ISODate, n: number): ISODate => {
  const d = parseISO(s);
  d.setDate(d.getDate() + n);
  return toISO(d);
};

/** Whole days from a to b (positive when b is later). Immune to daylight saving shifts. */
export const diffDays = (a: ISODate, b: ISODate): number => {
  const [ay, am, ad] = a.split("-").map(Number);
  const [by, bm, bd] = b.split("-").map(Number);
  return Math.round((Date.UTC(by, bm - 1, bd) - Date.UTC(ay, am - 1, ad)) / 86_400_000);
};

export const isValidISO = (s: string): boolean => /^\d{4}-\d{2}-\d{2}$/.test(s) && toISO(parseISO(s)) === s;

export function formatDay(s: ISODate, lang: "en" | "es", withWeekday = true): string {
  return new Intl.DateTimeFormat(lang === "es" ? "es-US" : "en-US", {
    ...(withWeekday ? { weekday: "short" as const } : {}),
    month: "short",
    day: "numeric",
  }).format(parseISO(s));
}

/** "Tue" / "mar", for chart axes. */
export const weekdayShort = (s: ISODate, lang: "en" | "es"): string =>
  new Intl.DateTimeFormat(lang === "es" ? "es-US" : "en-US", { weekday: "short" }).format(parseISO(s)).replace(".", "");
