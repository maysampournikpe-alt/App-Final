import { diffDays, type ISODate } from "./dates";

/* ---------- SAT and ACT converter ---------- */
// The College Board and ACT concordance (2018). Each ACT composite maps to one SAT total; a SAT total falls in a range of ACT scores.
export const ACT_TO_SAT: Record<number, number> = {
  36: 1590, 35: 1540, 34: 1500, 33: 1460, 32: 1430, 31: 1400, 30: 1370, 29: 1340, 28: 1310, 27: 1280, 26: 1240, 25: 1210, 24: 1180, 23: 1140,
  22: 1110, 21: 1080, 20: 1040, 19: 1010, 18: 970, 17: 930, 16: 890, 15: 850, 14: 800, 13: 760, 12: 710, 11: 670, 10: 630, 9: 590,
};
const SAT_RANGES: [number, number, number][] = [
  [1570, 1600, 36], [1530, 1560, 35], [1490, 1520, 34], [1450, 1480, 33], [1420, 1440, 32], [1390, 1410, 31], [1360, 1380, 30], [1330, 1350, 29], [1300, 1320, 28],
  [1260, 1290, 27], [1230, 1250, 26], [1200, 1220, 25], [1160, 1190, 24], [1130, 1150, 23], [1100, 1120, 22], [1060, 1090, 21], [1030, 1050, 20], [990, 1020, 19],
  [960, 980, 18], [920, 950, 17], [880, 910, 16], [830, 870, 15], [780, 820, 14], [730, 770, 13], [690, 720, 12], [650, 680, 11], [620, 640, 10], [590, 610, 9],
];
export const actToSat = (act: number) => (Number.isInteger(act) ? ACT_TO_SAT[act] ?? null : null);
/** SAT total (400 to 1600) to ACT composite. Totals between two table rows round down to the lower row. Under 590 has no match. */
export function satToAct(sat: number): number | null {
  if (!Number.isFinite(sat) || sat < 590 || sat > 1600) return null;
  const row = SAT_RANGES.find(([lo, hi]) => sat >= lo && sat <= hi) ?? [...SAT_RANGES].reverse().find(([, hi]) => hi <= sat);
  return row ? row[2] : null;
}

/* ---------- College cost ---------- */
export interface CostInput { tuition: number; housing: number; books: number; transport: number; other: number; scholarships: number; grants: number }
export function collegeCost(c: CostInput, years: number, loanRatePct: number, loanYears: number) {
  const sticker = c.tuition + c.housing + c.books + c.transport + c.other;
  const aid = c.scholarships + c.grants;
  const net = Math.max(0, sticker - aid);
  const total = net * years;
  const r = loanRatePct / 100 / 12, n = loanYears * 12;
  const monthly = total === 0 ? 0 : r === 0 ? total / n : (total * r) / (1 - (1 + r) ** -n);
  return { sticker, aid, net, total: Math.round(total * 100) / 100, monthlyLoan: Math.round(monthly * 100) / 100, covered: sticker > 0 ? Math.min(100, Math.round((aid / sticker) * 100)) : 0 };
}

/* ---------- Class rank ---------- */
export function rankInfo(rank: number, size: number) {
  if (!(rank >= 1 && size >= rank && Number.isInteger(rank) && Number.isInteger(size))) return null;
  const topPercent = Math.max(1, Math.ceil((rank / size) * 100)); // rank 1 of 400 is the top 1%
  return { topPercent, percentile: Math.max(0, Math.round((1 - (rank - 1) / size) * 100)), inTop10: rank / size <= 0.1 };
}

/* ---------- Credits ---------- */
export interface CreditCourse { id: string; name: string; hours: number; term: string; source: string }
export const CREDITS_KEY = "college-credits";
export const NO_CREDITS: CreditCourse[] = [];
export const creditTotal = (c: CreditCourse[]) => c.reduce((n, x) => n + x.hours, 0);

/* ---------- Achievements ---------- */
export type AchKind = "award" | "activity" | "leadership" | "result" | "project";
export const ACH_KINDS: AchKind[] = ["award", "activity", "leadership", "result", "project"];
export interface Achievement { id: string; kind: AchKind; title: string; date: ISODate; note: string }
export const ACH_KEY = "achievements";
export const NO_ACH: Achievement[] = [];
export const sortNewest = <T extends { date: string }>(l: T[]) => [...l].sort((a, b) => b.date.localeCompare(a.date));

export interface VolunteerEntry { id: string; date: ISODate; org: string; hours: number; supervisor: string; contact: string }
export const VOLUNTEER_KEY = "volunteer-hours";
export const NO_VOLUNTEER: VolunteerEntry[] = [];
export const volunteerTotal = (l: VolunteerEntry[]) => Math.round(l.reduce((n, x) => n + x.hours, 0) * 100) / 100;
export const volunteerByOrg = (l: VolunteerEntry[]) => {
  const m = new Map<string, number>();
  l.forEach((x) => m.set(x.org, (m.get(x.org) ?? 0) + x.hours));
  return [...m].map(([org, hours]) => ({ org, hours: Math.round(hours * 100) / 100 })).sort((a, b) => b.hours - a.hours);
};

export interface Certificate { id: string; name: string; issuer: string; earned: ISODate; expires: ISODate | "" }
export const CERTS_KEY = "certificates";
export const NO_CERTS: Certificate[] = [];
export type CertStatus = "none" | "ok" | "soon" | "expired";
export function certStatus(c: Certificate, now: ISODate): CertStatus {
  if (!c.expires) return "none";
  const d = diffDays(now, c.expires);
  return d < 0 ? "expired" : d <= 60 ? "soon" : "ok";
}

/* ---------- Wellbeing ---------- */
export interface Mood { date: ISODate; mood: 1 | 2 | 3 | 4 | 5; note: string }
export const MOOD_KEY = "mood-log";
export const NO_MOODS: Mood[] = [];
/** True when the last three check-ins in the last week were all low, which is the point to suggest talking to someone. */
export function needsSupportNudge(log: Mood[], now: ISODate): boolean {
  const recent = [...log].filter((m) => diffDays(m.date, now) >= 0 && diffDays(m.date, now) <= 7).sort((a, b) => b.date.localeCompare(a.date)).slice(0, 3);
  return recent.length === 3 && recent.every((m) => m.mood <= 2);
}

export interface Sleep { date: ISODate; bed: string; wake: string }
export const SLEEP_KEY = "sleep-log";
export const NO_SLEEP: Sleep[] = [];
/** Hours slept between a bedtime and wake time "HH:MM", across midnight if needed. */
export function sleepHours(bed: string, wake: string): number | null {
  const m = (s: string) => { const [h, mm] = s.split(":").map(Number); return Number.isFinite(h) && Number.isFinite(mm) ? h * 60 + mm : NaN; };
  const b = m(bed), w = m(wake);
  if (Number.isNaN(b) || Number.isNaN(w)) return null;
  const mins = w >= b ? w - b : w + 1440 - b;
  return Math.round((mins / 60) * 10) / 10;
}
export type SleepVerdict = "short" | "good" | "long";
export const sleepVerdict = (h: number): SleepVerdict => (h < 8 ? "short" : h > 10 ? "long" : "good");

/* ---------- Budget ---------- */
export interface BudgetLine { id: string; month: string; kind: "income" | "spend" | "save"; label: string; amount: number }
export const BUDGET_KEY = "budget";
export const NO_BUDGET: BudgetLine[] = [];
export function monthSummary(lines: BudgetLine[], month: string) {
  const sum = (k: BudgetLine["kind"]) => Math.round(lines.filter((l) => l.month === month && l.kind === k).reduce((n, l) => n + l.amount, 0) * 100) / 100;
  const income = sum("income"), spend = sum("spend"), save = sum("save");
  return { income, spend, save, left: Math.round((income - spend - save) * 100) / 100, saveRate: income > 0 ? Math.round((save / income) * 100) : 0 };
}
