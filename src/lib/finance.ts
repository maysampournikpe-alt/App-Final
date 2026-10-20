import { diffDays, type ISODate } from "./dates";

export const round2 = (n: number) => Math.round(n * 100) / 100;

/** Savings that grow with interest. Interest is added monthly, and each month's deposit goes in at the end of the month. */
export function compound(o: { principal: number; monthly: number; annualPct: number; years: number }) {
  const r = o.annualPct / 100 / 12;
  let balance = o.principal;
  const byYear: { year: number; balance: number; contributed: number }[] = [{ year: 0, balance: round2(balance), contributed: round2(o.principal) }];
  for (let m = 1; m <= Math.round(o.years * 12); m++) {
    balance = balance * (1 + r) + o.monthly;
    if (m % 12 === 0) byYear.push({ year: m / 12, balance: round2(balance), contributed: round2(o.principal + o.monthly * m) });
  }
  const contributed = o.principal + o.monthly * Math.round(o.years * 12);
  return { balance: round2(balance), contributed: round2(contributed), interest: round2(balance - contributed), byYear };
}

export interface Goal { id: string; name: string; target: number; saved: number; by: ISODate }
export const SAVINGS_KEY = "savings-goals";
export const NO_GOALS: Goal[] = [];

export function goalPlan(g: Goal, now: ISODate) {
  const left = Math.max(0, round2(g.target - g.saved));
  const daysLeft = diffDays(now, g.by);
  const weeks = Math.max(1, Math.ceil(daysLeft / 7));
  const months = Math.max(1, Math.ceil(daysLeft / 30));
  return {
    left, daysLeft,
    done: left === 0,
    late: left > 0 && daysLeft <= 0,
    perWeek: round2(left / weeks), perMonth: round2(left / months),
    percent: g.target > 0 ? Math.min(100, Math.round((g.saved / g.target) * 100)) : 0,
  };
}

/** Paycheck estimate. Social Security and Medicare are fixed by law; income tax withholding is the student's own guess. */
export function paycheck(o: { wage: number; hours: number; fedPct: number }) {
  const gross = round2(o.wage * o.hours);
  const socialSecurity = round2(gross * 0.062);
  const medicare = round2(gross * 0.0145);
  const federal = round2(gross * (o.fedPct / 100));
  return { gross, socialSecurity, medicare, federal, net: round2(gross - socialSecurity - medicare - federal) };
}
