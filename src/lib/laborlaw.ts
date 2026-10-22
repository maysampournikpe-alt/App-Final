// Texas teen work-hour limits, from the Texas Workforce Commission's child labor summary (14 and 15 year olds):
//   school day: no work in school hours, at most 3 hours that day, at most 18 hours in a school week, only between 7 a.m. and 7 p.m.
//   non-school day: at most 8 hours, at most 40 hours in a non-school week
//   June 1 to Labor Day (not in summer school): work may run until 9 p.m.
// Everything else (jobs that are too dangerous, special exceptions, waivers) is left to the official page.
export type Period = "school-day" | "non-school-day" | "summer";
export interface Check { age: number; period: Period; schoolWeek: boolean; hoursToday: number; hoursWeek: number; start: number; end: number }
export type Issue =
  | { kind: "under14" }
  | { kind: "dayHours"; max: number }
  | { kind: "weekHours"; max: number }
  | { kind: "tooEarly"; from: number }
  | { kind: "tooLate"; until: number };

export function workLimits(p: Period, schoolWeek: boolean) {
  return { dayMax: p === "school-day" ? 3 : 8, weekMax: p === "summer" ? 40 : schoolWeek ? 18 : 40, from: 7, until: p === "summer" ? 21 : 19 };
}

export function checkWork(c: Check): { ok: boolean; issues: Issue[]; hazardNote: boolean } {
  if (c.age < 14) return { ok: false, issues: [{ kind: "under14" }], hazardNote: false };
  if (c.age >= 16) return { ok: true, issues: [], hazardNote: c.age < 18 }; // no hour limits, but dangerous jobs are off limits until 18
  const lim = workLimits(c.period, c.schoolWeek);
  const issues: Issue[] = [];
  if (c.hoursToday > lim.dayMax) issues.push({ kind: "dayHours", max: lim.dayMax });
  if (c.hoursWeek > lim.weekMax) issues.push({ kind: "weekHours", max: lim.weekMax });
  if (c.start < lim.from) issues.push({ kind: "tooEarly", from: lim.from });
  if (c.end > lim.until) issues.push({ kind: "tooLate", until: lim.until });
  return { ok: issues.length === 0, issues, hazardNote: true };
}

export const hourLabel = (h: number, lang: "en" | "es") => {
  const hh = Math.floor(h) % 24, mm = Math.round((h - Math.floor(h)) * 60);
  const t = `${hh % 12 === 0 ? 12 : hh % 12}${mm ? `:${String(mm).padStart(2, "0")}` : ""}`;
  return lang === "es" ? `${t} ${hh < 12 ? "a. m." : "p. m."}` : `${t} ${hh < 12 ? "a.m." : "p.m."}`;
};

/* ---------- Texas graduation credits (Foundation High School Program) ---------- */
export type GradPlan = "foundation" | "endorsement";
export const GRAD_AREAS = ["english", "math", "science", "social", "language", "pe", "arts", "electives"] as const;
export type GradArea = (typeof GRAD_AREAS)[number];
export const GRAD_REQUIRED: Record<GradPlan, Record<GradArea, number>> = {
  foundation: { english: 4, math: 3, science: 3, social: 3, language: 2, pe: 1, arts: 1, electives: 5 },
  endorsement: { english: 4, math: 4, science: 4, social: 3, language: 2, pe: 1, arts: 1, electives: 7 },
};
export const gradTotal = (p: GradPlan) => Object.values(GRAD_REQUIRED[p]).reduce((a, b) => a + b, 0);
export interface GradDoc { plan: GradPlan; earned: Partial<Record<GradArea, number>> }
export const GRAD_KEY = "tx-grad";
export const NO_GRAD: GradDoc = { plan: "endorsement", earned: {} };
/** Credits counted toward each area never exceed what the area needs; extra credits in one area do not make up for another. */
export function gradProgress(d: GradDoc) {
  const need = GRAD_REQUIRED[d.plan];
  const per = GRAD_AREAS.map((a) => ({ area: a, need: need[a], have: Math.min(need[a], Math.max(0, d.earned[a] ?? 0)) }));
  const have = per.reduce((n, x) => n + x.have, 0), total = gradTotal(d.plan);
  return { per, have, total, left: total - have, pct: Math.round((have / total) * 100) };
}
