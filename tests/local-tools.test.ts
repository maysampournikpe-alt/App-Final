import { describe, expect, it } from "vitest";
import { dueCards, newCard, parseCards, review, deckStats } from "../src/lib/srs";
import { bestStreak, currentStreak, lastDays, toggleDay } from "../src/lib/habits";
import { compound, goalPlan, paycheck } from "../src/lib/finance";
import { CATEGORIES, convert, niceNumber } from "../src/lib/units";

describe("spaced repetition", () => {
  const base = newCard("la mitocondria", "powerhouse", "bio", "2026-10-01");
  it("a new card is due today", () => expect(dueCards([base], "2026-10-01")).toHaveLength(1));
  it("good moves it out 1, then 3, then grows", () => {
    const a = review(base, "good", "2026-10-01");
    expect([a.interval, a.due]).toEqual([1, "2026-10-02"]);
    const b = review(a, "good", "2026-10-02");
    expect(b.interval).toBe(3);
    const c = review(b, "good", "2026-10-05");
    expect(c.interval).toBeGreaterThan(b.interval);
  });
  it("again keeps it due today and lowers ease, never below 1.3", () => {
    let c = base;
    for (let i = 0; i < 10; i++) c = review(c, "again", "2026-10-01");
    expect(c.due).toBe("2026-10-01");
    expect(c.ease).toBe(1.3);
    expect(c.lapses).toBe(10);
  });
  it("easy beats good", () => {
    expect(review(base, "easy", "2026-10-01").interval).toBeGreaterThan(review(base, "good", "2026-10-01").interval);
  });
  it("hard always moves forward at least one day", () => expect(review(base, "hard", "2026-10-01").interval).toBeGreaterThanOrEqual(1));
  it("counts decks", () => expect(deckStats([base], "2026-10-01")).toMatchObject({ total: 1, due: 1, fresh: 1, mature: 0 }));
  it("parses pasted cards and counts skipped lines", () => {
    const r = parseCards("hola :: hello\nadios\tgoodbye\n\nsin separador\n:: nada\nx::");
    expect(r.pairs).toEqual([{ front: "hola", back: "hello" }, { front: "adios", back: "goodbye" }]);
    expect(r.skipped).toBe(3);
  });
});

describe("habit streaks", () => {
  it("counts days in a row ending today", () => expect(currentStreak(["2026-10-17", "2026-10-18", "2026-10-19"], "2026-10-19")).toBe(3));
  it("keeps yesterday's streak until the day ends", () => expect(currentStreak(["2026-10-17", "2026-10-18"], "2026-10-19")).toBe(2));
  it("breaks after a missed day", () => expect(currentStreak(["2026-10-16"], "2026-10-19")).toBe(0));
  it("finds the best streak", () => expect(bestStreak(["2026-10-01", "2026-10-02", "2026-10-03", "2026-10-07", "2026-10-08"])).toBe(3));
  it("toggles a day on and off, sorted", () => {
    const h = { id: "1", name: "read", done: ["2026-10-02"], created: "2026-10-01" };
    const on = toggleDay(h, "2026-10-01");
    expect(on.done).toEqual(["2026-10-01", "2026-10-02"]);
    expect(toggleDay(on, "2026-10-01").done).toEqual(["2026-10-02"]);
  });
  it("lists the last seven days oldest first", () => {
    const d = lastDays("2026-10-19", 7);
    expect([d[0], d[6]]).toEqual(["2026-10-13", "2026-10-19"]);
  });
});

describe("money", () => {
  it("compound interest matches a known value", () => {
    // $1000 at 12% a year, monthly, 1 year, no deposits: 1000 * 1.01^12
    expect(compound({ principal: 1000, monthly: 0, annualPct: 12, years: 1 }).balance).toBeCloseTo(1126.83, 2);
  });
  it("with no interest it is just the deposits", () => {
    const r = compound({ principal: 100, monthly: 50, annualPct: 0, years: 2 });
    expect([r.balance, r.contributed, r.interest]).toEqual([1300, 1300, 0]);
    expect(r.byYear).toHaveLength(3);
  });
  it("plans a savings goal", () => {
    const p = goalPlan({ id: "g", name: "laptop", target: 400, saved: 100, by: "2026-11-30" }, "2026-10-19");
    expect(p.left).toBe(300);
    expect(p.perWeek).toBe(50); // 42 days -> 6 weeks, 300 / 6
    expect(p.perMonth).toBe(150); // 2 months
    expect(p.percent).toBe(25);
    expect(goalPlan({ id: "g", name: "x", target: 50, saved: 50, by: "2026-10-01" }, "2026-10-19").done).toBe(true);
    expect(goalPlan({ id: "g", name: "x", target: 50, saved: 10, by: "2026-10-01" }, "2026-10-19").late).toBe(true);
  });
  it("estimates a paycheck", () => {
    const p = paycheck({ wage: 10, hours: 20, fedPct: 0 });
    expect(p).toMatchObject({ gross: 200, socialSecurity: 12.4, medicare: 2.9, federal: 0, net: 184.7 });
  });
});

describe("unit converter", () => {
  it("converts known values", () => {
    expect(convert(1, "length", "mi", "km")).toBeCloseTo(1.609344, 6);
    expect(convert(12, "length", "in", "ft")).toBeCloseTo(1, 9);
    expect(convert(1, "mass", "lb", "oz")).toBeCloseTo(16, 6);
    expect(convert(1, "volume", "gal", "cup")).toBeCloseTo(16, 6);
    expect(convert(60, "speed", "mph", "kmh")).toBeCloseTo(96.56064, 4);
    expect(convert(2, "time", "h", "min")).toBe(120);
  });
  it("converts temperature, including the fixed points", () => {
    expect(convert(100, "temp", "C", "F")).toBeCloseTo(212, 9);
    expect(convert(32, "temp", "F", "C")).toBeCloseTo(0, 9);
    expect(convert(0, "temp", "C", "K")).toBeCloseTo(273.15, 9);
    expect(convert(-40, "temp", "C", "F")).toBeCloseTo(-40, 9);
  });
  it("round-trips every pair in every category", () => {
    for (const c of CATEGORIES) for (const a of c.units) for (const b of c.units) {
      expect(convert(convert(7.5, c.id, a.id, b.id), c.id, b.id, a.id)).toBeCloseTo(7.5, 6);
    }
  });
  it("formats numbers without long tails", () => {
    expect(niceNumber(0.1 + 0.2)).toBe("0.3");
    expect(niceNumber(1609.344)).toBe("1609.344");
    expect(niceNumber(NaN)).toBe("");
  });
});

import { cleanSupabaseUrl } from "../src/lib/supabase/env";
describe("supabase url", () => {
  it("tidies pasted addresses", () => {
    expect(cleanSupabaseUrl("https://abc.supabase.co")).toBe("https://abc.supabase.co");
    expect(cleanSupabaseUrl("https://abc.supabase.co/")).toBe("https://abc.supabase.co");
    expect(cleanSupabaseUrl(" https://abc.supabase.co/rest/v1/ ")).toBe("https://abc.supabase.co");
  });
});

import { gcd, solve, simplify, mixed, fromDecimal, toPercent } from "../src/lib/fractions";
import { measure, SHAPES } from "../src/lib/geometry";
import { makeQuestions, bestFor } from "../src/lib/drills";
import { quadrantOf, canAddTop, topTasks, type Task } from "../src/lib/tasks";
import { smartReady } from "../src/lib/smart";

describe("fractions", () => {
  it("adds with a common denominator and simplifies", () => {
    expect(solve({ n: 1, d: 2 }, "+", { n: 1, d: 3 })!.result).toEqual({ n: 5, d: 6 });
    expect(solve({ n: 1, d: 4 }, "+", { n: 1, d: 4 })!.result).toEqual({ n: 1, d: 2 });
  });
  it("subtracts, multiplies and divides", () => {
    expect(solve({ n: 3, d: 4 }, "-", { n: 1, d: 6 })!.result).toEqual({ n: 7, d: 12 });
    expect(solve({ n: 2, d: 3 }, "×", { n: 3, d: 4 })!.result).toEqual({ n: 1, d: 2 });
    expect(solve({ n: 1, d: 2 }, "÷", { n: 3, d: 4 })!.result).toEqual({ n: 2, d: 3 });
  });
  it("refuses impossible input", () => {
    expect(solve({ n: 1, d: 0 }, "+", { n: 1, d: 2 })).toBeNull();
    expect(solve({ n: 1, d: 2 }, "÷", { n: 0, d: 5 })).toBeNull();
  });
  it("shows steps", () => expect(solve({ n: 1, d: 2 }, "+", { n: 1, d: 3 })!.steps.join(" ")).toContain("Common denominator: 6"));
  it("gcd, mixed numbers, decimals, percent", () => {
    expect(gcd(12, 18)).toBe(6);
    expect(simplify({ n: 2, d: -4 })).toEqual({ n: -1, d: 2 });
    expect(mixed({ n: 7, d: 3 })).toEqual({ whole: 2, rest: { n: 1, d: 3 } });
    expect(fromDecimal(0.375)).toEqual({ n: 3, d: 8 });
    expect(toPercent({ n: 3, d: 8 })).toBe(37.5);
  });
});

describe("geometry", () => {
  const val = (id: Parameters<typeof measure>[0], v: Record<string, number>, key: string) => measure(id, v)!.find((x) => x.key === key)!.value;
  it("flat shapes", () => {
    expect(val("rectangle", { l: 5, w: 3 }, "area")).toBe(15);
    expect(val("rectangle", { l: 5, w: 3 }, "perimeter")).toBe(16);
    expect(val("circle", { r: 1 }, "area")).toBeCloseTo(Math.PI, 9);
    expect(val("triangle", { a: 3, b: 4, c: 5 }, "area")).toBeCloseTo(6, 9);
    expect(val("trapezoid", { a: 3, b: 5, h: 2, c: 2, e: 2 }, "area")).toBe(8);
    expect(val("parallelogram", { b: 4, h: 3, s: 5 }, "area")).toBe(12);
  });
  it("solids", () => {
    expect(val("box", { l: 2, w: 3, h: 4 }, "volume")).toBe(24);
    expect(val("box", { l: 2, w: 3, h: 4 }, "surface")).toBe(52);
    expect(val("cube", { s: 3 }, "volume")).toBe(27);
    expect(val("cylinder", { r: 1, h: 2 }, "volume")).toBeCloseTo(2 * Math.PI, 9);
    expect(val("sphere", { r: 3 }, "volume")).toBeCloseTo(36 * Math.PI, 9);
    expect(val("cone", { r: 3, h: 4 }, "volume")).toBeCloseTo(12 * Math.PI, 9);
    expect(val("cone", { r: 3, h: 4 }, "surface")).toBeCloseTo(24 * Math.PI, 9); // slant height 5
  });
  it("rejects missing, zero and impossible sizes", () => {
    expect(measure("rectangle", { l: 5 })).toBeNull();
    expect(measure("circle", { r: 0 })).toBeNull();
    expect(measure("triangle", { a: 1, b: 2, c: 10 })).toBeNull();
  });
  it("every shape has a measurement set", () => {
    for (const s of SHAPES) {
      const sizes = Object.fromEntries(s.dims.map((x) => [x.key, 3]));
      expect(measure(s.id, sizes), s.id).not.toBeNull();
    }
  });
});

describe("math drills", () => {
  const seeded = () => { let x = 7; return () => ((x = (x * 16807) % 2147483647) / 2147483647); };
  it("makes whole, non-negative answers for every operation", () => {
    for (const op of ["+", "-", "×", "÷"] as const) {
      for (const q of makeQuestions(op, 12, 200, seeded())) {
        expect(Number.isInteger(q.answer), `${q.a}${op}${q.b}`).toBe(true);
        expect(q.answer).toBeGreaterThanOrEqual(0);
        if (op === "÷") expect(q.b).toBeGreaterThan(0);
      }
    }
  });
  it("division questions divide evenly", () => { for (const q of makeQuestions("÷", 12, 100, seeded())) expect(q.a % q.b).toBe(0); });
  it("finds the fastest perfect run", () => {
    const s = [{ op: "×" as const, max: 12, right: 10, total: 10, seconds: 40, date: "d" }, { op: "×" as const, max: 12, right: 10, total: 10, seconds: 30, date: "d" }, { op: "×" as const, max: 12, right: 9, total: 10, seconds: 10, date: "d" }];
    expect(bestFor(s, "×", 12)!.seconds).toBe(30);
  });
});

describe("to-do and matrix", () => {
  const t = (o: Partial<Task>): Task => ({ id: "1", title: "x", done: false, urgent: false, important: false, top: false, created: "2026-10-01", ...o });
  it("sorts into the four boxes", () => {
    expect(quadrantOf(t({ urgent: true, important: true }))).toBe("do");
    expect(quadrantOf(t({ important: true }))).toBe("plan");
    expect(quadrantOf(t({ urgent: true }))).toBe("quick");
    expect(quadrantOf(t({}))).toBe("drop");
  });
  it("allows only three top priorities, ignoring finished ones", () => {
    const three = [t({ id: "a", top: true }), t({ id: "b", top: true }), t({ id: "c", top: true })];
    expect(canAddTop(three)).toBe(false);
    expect(canAddTop([...three.slice(0, 2), t({ id: "c", top: true, done: true })])).toBe(true);
    expect(topTasks(three)).toHaveLength(3);
  });
});

describe("smart goals", () => {
  it("needs every part and a date", () => {
    const ok = { specific: "Run a 5K", measurable: "3 runs a week", achievable: "I run twice now", relevant: "Soccer fitness", by: "2026-12-01" };
    expect(smartReady(ok)).toBe(true);
    expect(smartReady({ ...ok, specific: "a" })).toBe(false);
    expect(smartReady({ ...ok, by: "" })).toBe(false);
  });
});

import { parseDeadline, collectItems, monthGrid, reminderFor, startOfWeek } from "../src/lib/calendar";
import { addDays } from "../src/lib/dates";
import { weekBySubject, weeklyTotals, averageFocus, hoursText } from "../src/lib/study";
import { doneToday, progress, toggleStep, NO_ROUTINES } from "../src/lib/routines";

describe("deadline parsing", () => {
  const now = "2026-10-20";
  it("reads common formats", () => {
    expect(parseDeadline("March 15, 2027", now)).toBe("2027-03-15");
    expect(parseDeadline("Applications due 2027-03-15", now)).toBe("2027-03-15");
    expect(parseDeadline("Due 3/15/27", now)).toBe("2027-03-15");
    expect(parseDeadline("Deadline: Nov 1st", now)).toBe("2026-11-01");
    expect(parseDeadline("15 de marzo de 2027", now)).toBe("2027-03-15");
  });
  it("a month and day with no year means the next one coming", () => {
    expect(parseDeadline("Feb 1", now)).toBe("2027-02-01");
    expect(parseDeadline("October 20", now)).toBe("2026-10-20");
    expect(parseDeadline("October 19", now)).toBe("2027-10-19");
  });
  it("gives up on vague or invalid text", () => {
    for (const x of ["Rolling", "Varies", "", null, undefined, "February 31, 2027", "13/45/2027"]) expect(parseDeadline(x as string, now)).toBeNull();
  });
});

describe("calendar", () => {
  it("builds Monday-first weeks that cover the month", () => {
    const g = monthGrid(2026, 9); // October 2026 starts on a Thursday
    expect(g[0][0].date).toBe("2026-09-28");
    expect(g[0][3]).toEqual({ date: "2026-10-01", inMonth: true });
    expect(g.at(-1)![6].date >= "2026-10-31").toBe(true);
    expect(g.every((w) => w.length === 7)).toBe(true);
  });
  it("starts weeks on Monday", () => {
    expect(startOfWeek("2026-10-20")).toBe("2026-10-19"); // a Tuesday
    expect(startOfWeek("2026-10-25")).toBe("2026-10-19"); // Sunday belongs to the week before
  });
  it("collects items from saved, homework and countdowns, skipping done homework and vague deadlines", () => {
    const items = collectItems({
      saved: [{ title: "Chess open", deadline: "Nov 5, 2026", sourceUrl: "https://a.org" }, { title: "Rolling prog", deadline: "Rolling", sourceUrl: "https://b.org" }],
      homework: [{ id: "1", title: "Essay", cls: "Eng", due: "2026-10-22", done: false }, { id: "2", title: "Old", cls: "", due: "2026-10-21", done: true }],
      countdowns: [{ id: "c", name: "SAT", date: "2026-12-05" }], now: "2026-10-20",
    });
    expect(items.map((i) => i.title)).toEqual(["Essay (Eng)", "Chess open", "SAT"]);
  });
  it("reminds for today, tomorrow and the coming week only", () => {
    expect([reminderFor("2026-10-20", "2026-10-20"), reminderFor("2026-10-21", "2026-10-20"), reminderFor("2026-10-25", "2026-10-20")]).toEqual(["today", "tomorrow", "week"]);
    expect([reminderFor("2026-10-19", "2026-10-20"), reminderFor("2026-11-20", "2026-10-20")]).toEqual([null, null]);
  });
});

describe("study stats", () => {
  const s = (date: string, subject: string, minutes: number, focus: 1 | 2 | 3 | 4 | 5 = 4) => ({ id: date + subject, date, subject, minutes, focus });
  const list = [s("2026-10-19", "Math", 30), s("2026-10-20", "Math", 45), s("2026-10-21", "Bio", 60), s("2026-10-12", "Math", 100)];
  it("adds minutes per subject for one week, biggest first", () => expect(weekBySubject(list, "2026-10-22")).toEqual([{ subject: "Math", minutes: 75 }, { subject: "Bio", minutes: 60 }]));
  it("totals the last weeks, oldest first", () => expect(weeklyTotals(list, "2026-10-22", 2).map((w) => w.minutes)).toEqual([100, 135]));
  it("averages focus and formats time", () => {
    expect(averageFocus([s("a", "x", 1, 5), s("b", "x", 1, 4)])).toBe(4.5);
    expect(averageFocus([])).toBe(0);
    expect([hoursText(45), hoursText(60), hoursText(135)]).toEqual(["45 min", "1 h", "2 h 15 min"]);
  });
});

describe("routines", () => {
  const doc = { ...NO_ROUTINES, steps: { morning: [{ id: "a", text: "Make bed" }, { id: "b", text: "Eat" }], evening: [{ id: "c", text: "Pack bag" }] } };
  it("each day starts empty and progress is a percent", () => {
    expect(progress(doc, "morning", "2026-10-20")).toBe(0);
    const d1 = toggleStep(doc, "a", "2026-10-20");
    expect(progress(d1, "morning", "2026-10-20")).toBe(50);
    expect(progress(d1, "morning", "2026-10-21")).toBe(0);
    expect(doneToday(d1, "evening", "2026-10-20")).toEqual([]);
  });
  it("unchecks, and prunes old days", () => {
    const on = toggleStep(doc, "a", "2026-10-20");
    expect(doneToday(toggleStep(on, "a", "2026-10-20"), "morning", "2026-10-20")).toEqual([]);
    let d = doc;
    for (let i = 0; i < 100; i++) d = toggleStep(d, "a", addDays("2026-01-01", i)); // 100 different days
    expect(Object.keys(d.done)).toHaveLength(60);
    expect(d.done["2026-04-10"]).toEqual(["a"]); // the newest day (index 99) is kept
    expect(d.done["2026-01-01"]).toBeUndefined(); // the oldest is dropped
  });
});

import { periodKey, journalPromptIndex, pastKeys, isFilled, JOURNAL_PROMPT_COUNT } from "../src/lib/reflect";
describe("reflections", () => {
  it("one key per week (Monday) or month", () => {
    expect(periodKey("weekly", "2026-10-22")).toBe("weekly:2026-10-19");
    expect(periodKey("weekly", "2026-10-25")).toBe("weekly:2026-10-19");
    expect(periodKey("monthly", "2026-10-22")).toBe("monthly:2026-10");
    expect(periodKey("journal", "2026-10-26")).toBe("journal:2026-10-26");
  });
  it("journal prompt is steady within a week and always in range", () => {
    expect(journalPromptIndex("2026-10-19")).toBe(journalPromptIndex("2026-10-25"));
    expect(journalPromptIndex("2026-10-26")).not.toBe(journalPromptIndex("2026-10-19"));
    for (let i = 0; i < 400; i += 7) {
      const v = journalPromptIndex(addDays("2026-01-05", i));
      expect(v).toBeGreaterThanOrEqual(0); expect(v).toBeLessThan(JOURNAL_PROMPT_COUNT);
    }
    expect(journalPromptIndex("2025-12-01")).toBeGreaterThanOrEqual(0); // before the start date still works
  });
  it("lists only earlier, non-empty entries of the same kind, newest first", () => {
    const e = (v: string) => ({ answers: { x: v }, updated: 1 });
    const all = { "weekly:2026-10-05": e("a"), "weekly:2026-10-12": e("b"), "weekly:2026-10-19": e("c"), "weekly:2026-09-28": e("  "), "monthly:2026-09": e("m") };
    expect(pastKeys(all, "weekly", "weekly:2026-10-19")).toEqual(["weekly:2026-10-12", "weekly:2026-10-05"]);
    expect(isFilled(undefined)).toBe(false);
  });
});

import { actToSat, satToAct, ACT_TO_SAT, collegeCost, rankInfo, creditTotal, volunteerTotal, volunteerByOrg, certStatus, needsSupportNudge, sleepHours, sleepVerdict, monthSummary, sortNewest } from "../src/lib/career";
describe("SAT and ACT converter", () => {
  it("maps known scores both ways", () => {
    expect(actToSat(36)).toBe(1590); expect(actToSat(25)).toBe(1210); expect(actToSat(20)).toBe(1040); expect(actToSat(5)).toBeNull(); expect(actToSat(20.5)).toBeNull();
    expect(satToAct(1600)).toBe(36); expect(satToAct(1210)).toBe(25); expect(satToAct(1040)).toBe(20); expect(satToAct(590)).toBe(9);
  });
  it("rejects scores outside the table", () => { for (const x of [0, 400, 589, 1601, NaN]) expect(satToAct(x)).toBeNull(); });
  it("the table only goes up, and every ACT score converts back to itself", () => {
    const acts = Object.keys(ACT_TO_SAT).map(Number).sort((a, b) => a - b);
    for (let i = 1; i < acts.length; i++) expect(ACT_TO_SAT[acts[i]]).toBeGreaterThan(ACT_TO_SAT[acts[i - 1]]);
    for (const a of acts) expect(satToAct(ACT_TO_SAT[a]), `ACT ${a}`).toBe(a);
  });
  it("every SAT total from 590 to 1600 gives an ACT score that never goes down as the total goes up", () => {
    let last = 0;
    for (let s = 590; s <= 1600; s += 10) { const a = satToAct(s)!; expect(a).toBeGreaterThanOrEqual(last); last = a; }
  });
});
describe("college cost", () => {
  const c = { tuition: 8000, housing: 6000, books: 1000, transport: 500, other: 500, scholarships: 3000, grants: 2000 };
  it("subtracts aid and multiplies by years", () => {
    const r = collegeCost(c, 4, 5, 10);
    expect([r.sticker, r.aid, r.net, r.total, r.covered]).toEqual([16000, 5000, 11000, 44000, 31]);
    expect(r.monthlyLoan).toBeCloseTo(466.7, 1); // 44000 at 5% for 10 years
  });
  it("never goes negative, and zero cost means no loan", () => {
    const r = collegeCost({ ...c, scholarships: 99999 }, 4, 5, 10);
    expect([r.net, r.total, r.monthlyLoan, r.covered]).toEqual([0, 0, 0, 100]);
  });
  it("a zero-interest loan is just the total split evenly", () => expect(collegeCost(c, 4, 0, 10).monthlyLoan).toBeCloseTo(44000 / 120, 2));
});
describe("class rank", () => {
  it("computes top percent and percentile", () => {
    expect(rankInfo(1, 400)).toMatchObject({ topPercent: 1, percentile: 100, inTop10: true });
    expect(rankInfo(40, 400)).toMatchObject({ topPercent: 10, inTop10: true });
    expect(rankInfo(41, 400)).toMatchObject({ topPercent: 11, inTop10: false });
    expect(rankInfo(400, 400)!.percentile).toBe(0);
  });
  it("rejects impossible ranks", () => { for (const [r, s] of [[0, 10], [11, 10], [1.5, 10], [1, 0]]) expect(rankInfo(r, s)).toBeNull(); });
});
describe("credits, volunteering, certificates", () => {
  it("adds credit hours", () => expect(creditTotal([{ id: "1", name: "a", hours: 3, term: "", source: "" }, { id: "2", name: "b", hours: 4, term: "", source: "" }])).toBe(7));
  it("adds volunteer hours exactly and groups by organization", () => {
    const l = [{ id: "1", date: "2026-10-01", org: "Food bank", hours: 1.5, supervisor: "", contact: "" }, { id: "2", date: "2026-10-02", org: "Library", hours: 2.25, supervisor: "", contact: "" }, { id: "3", date: "2026-10-03", org: "Food bank", hours: 0.1, supervisor: "", contact: "" }];
    expect(volunteerTotal(l)).toBe(3.85);
    expect(volunteerByOrg(l)).toEqual([{ org: "Library", hours: 2.25 }, { org: "Food bank", hours: 1.6 }]);
  });
  it("flags certificates by expiry", () => {
    const c = (expires: string) => ({ id: "1", name: "CPR", issuer: "", earned: "2025-01-01", expires });
    expect([certStatus(c(""), "2026-10-20"), certStatus(c("2027-06-01"), "2026-10-20"), certStatus(c("2026-11-15"), "2026-10-20"), certStatus(c("2026-10-01"), "2026-10-20")]).toEqual(["none", "ok", "soon", "expired"]);
  });
  it("sorts newest first", () => expect(sortNewest([{ date: "2026-01-01" }, { date: "2026-05-01" }]).map((x) => x.date)).toEqual(["2026-05-01", "2026-01-01"]));
});
describe("wellbeing", () => {
  const m = (date: string, mood: 1 | 2 | 3 | 4 | 5) => ({ date, mood, note: "" });
  it("suggests talking to someone after three low check-ins in a week, and not otherwise", () => {
    expect(needsSupportNudge([m("2026-10-18", 2), m("2026-10-19", 1), m("2026-10-20", 2)], "2026-10-20")).toBe(true);
    expect(needsSupportNudge([m("2026-10-18", 2), m("2026-10-19", 4), m("2026-10-20", 2)], "2026-10-20")).toBe(false);
    expect(needsSupportNudge([m("2026-10-19", 1), m("2026-10-20", 1)], "2026-10-20")).toBe(false);
    expect(needsSupportNudge([m("2026-09-01", 1), m("2026-09-02", 1), m("2026-09-03", 1)], "2026-10-20")).toBe(false);
  });
  it("counts sleep across midnight", () => {
    expect(sleepHours("22:30", "06:30")).toBe(8); expect(sleepHours("23:45", "05:15")).toBe(5.5); expect(sleepHours("01:00", "09:00")).toBe(8); expect(sleepHours("", "06:00")).toBeNull();
    expect([sleepHours("23:00", "05:00"), sleepHours("22:00", "06:00"), sleepHours("20:00", "08:00")].map((h) => sleepVerdict(h!))).toEqual(["short", "good", "long"]);
  });
});
describe("budget", () => {
  it("summarizes one month", () => {
    const l = [{ id: "1", month: "2026-10", kind: "income" as const, label: "Job", amount: 200 }, { id: "2", month: "2026-10", kind: "spend" as const, label: "Food", amount: 60.5 }, { id: "3", month: "2026-10", kind: "save" as const, label: "Laptop", amount: 40 }, { id: "4", month: "2026-09", kind: "income" as const, label: "Old", amount: 999 }];
    expect(monthSummary(l, "2026-10")).toEqual({ income: 200, spend: 60.5, save: 40, left: 99.5, saveRate: 20 });
    expect(monthSummary(l, "2026-08")).toEqual({ income: 0, spend: 0, save: 0, left: 0, saveRate: 0 });
  });
});

import { xpBreakdown, totalXp, levelOf, levelStart, levelName, LEVEL_NAMES, activeDays, streaks, BADGES, EMBLEMS, TINTS, usableAvatar, type Snapshot } from "../src/lib/progress";
const emptySnap = (over: Partial<Snapshot> = {}): Snapshot => ({
  now: "2026-10-20", homework: [], tasks: [], habits: [], focusLog: {}, sessions: [], routines: { steps: { morning: [], evening: [] }, done: {} }, attempts: [], plans: [], savedCount: 0,
  volunteer: [], achievements: [], certs: [], moods: [], sleep: [], reflections: {}, cards: [], drills: [], ...over,
});
describe("xp, levels, streaks and badges", () => {
  it("a new student has 0 XP, level 1 and no streak", () => {
    expect(totalXp(emptySnap())).toBe(0);
    expect(levelOf(0)).toMatchObject({ level: 1, xpInto: 0, xpNeeded: 50, pct: 0 });
    expect(streaks(emptySnap())).toEqual({ current: 0, best: 0, activeCount: 0 });
  });
  it("adds XP for real work with the published amounts", () => {
    const s = emptySnap({
      homework: [{ id: "1", title: "a", cls: "", due: "2026-10-20", done: true }, { id: "2", title: "b", cls: "", due: "2026-10-20", done: false }],
      tasks: [{ id: "t", title: "x", done: true, urgent: false, important: false, top: false, created: "2026-10-01" }],
      habits: [{ id: "h", name: "read", done: ["2026-10-19", "2026-10-20"], created: "2026-10-01" }],
      focusLog: { "2026-10-20": 45 }, sessions: [{ id: "s", date: "2026-10-20", subject: "m", minutes: 40, focus: 4 }], savedCount: 3,
      volunteer: [{ id: "v", date: "2026-10-20", org: "o", hours: 2.5, supervisor: "", contact: "" }],
    });
    const by = Object.fromEntries(xpBreakdown(s).map((l) => [l.key, l.points]));
    expect(by).toMatchObject({ homework: 5, tasks: 3, habits: 6, focus: 4, study: 2, saved: 6, volunteer: 20 });
    expect(totalXp(s)).toBe(5 + 3 + 6 + 4 + 2 + 6 + 20);
  });
  it("level thresholds are 0, 50, 200, 450, 800 and each level maps back to itself", () => {
    expect([1, 2, 3, 4, 5].map(levelStart)).toEqual([0, 50, 200, 450, 800]);
    for (let l = 1; l <= 30; l++) { expect(levelOf(levelStart(l)).level).toBe(l); expect(levelOf(levelStart(l + 1) - 1).level).toBe(l); }
    expect(levelOf(49)).toMatchObject({ level: 1, toNext: 1 });
    expect(levelOf(125)).toMatchObject({ level: 2, xpInto: 75, xpNeeded: 150, pct: 50 });
  });
  it("level names exist for every level, even past the last name", () => {
    expect(levelName(1).en).toBe("Trailhead");
    expect(levelName(500)).toBe(LEVEL_NAMES[LEVEL_NAMES.length - 1]);
  });
  it("counts active days from dated records and builds streaks", () => {
    const s = emptySnap({ habits: [{ id: "h", name: "r", done: ["2026-10-18", "2026-10-19"], created: "" }], moods: [{ date: "2026-10-20", mood: 3, note: "" }], focusLog: { "2026-10-10": 25, "2026-10-11": 0 } });
    expect([...activeDays(s)].sort()).toEqual(["2026-10-10", "2026-10-18", "2026-10-19", "2026-10-20"]);
    expect(streaks(s)).toEqual({ current: 3, best: 3, activeCount: 4 });
  });
  it("badges start locked, with progress, and unlock at the target", () => {
    const b = (id: string) => BADGES.find((x) => x.id === id)!;
    expect(b("first-save").value(emptySnap())).toBe(0);
    expect(b("first-save").value(emptySnap({ savedCount: 1 }))).toBeGreaterThanOrEqual(b("first-save").target);
    const plan = { id: "p", title: "", goal: "", summary: "", hoursPerWeek: 1, searchIdeas: [], createdAt: 0, source: "ai" as const, horizons: [{ horizon: "week" as const, steps: [{ id: "a", text: "x", done: true }, { id: "b", text: "y", done: false }] }] };
    expect(b("plan-step").value(emptySnap({ plans: [plan] }))).toBe(1);
    expect(b("plan-done").value(emptySnap({ plans: [plan] }))).toBe(0);
    plan.horizons[0].steps[1].done = true;
    expect(b("plan-done").value(emptySnap({ plans: [plan] }))).toBe(1);
    expect(new Set(BADGES.map((x) => x.id)).size).toBe(BADGES.length);
  });
  it("avatar choices fall back to the default when not unlocked", () => {
    expect(usableAvatar({ emblem: "rocket", tint: "ink" }, 1)).toEqual({ emblem: "compass", tint: "teal" });
    expect(usableAvatar({ emblem: "mountain", tint: "ruby" }, 2)).toEqual({ emblem: "mountain", tint: "ruby" });
    expect(usableAvatar({ emblem: "nope", tint: "nope" }, 99)).toEqual({ emblem: "compass", tint: "teal" });
    expect(EMBLEMS.every((e) => e.level >= 1) && TINTS.every((t) => t.level >= 1)).toBe(true);
  });
});

import { ELEMENTS, BY_SYMBOL, position, periodOf, groupOf, stateOf, parseFormula, molarMass, balance, FormulaError } from "../src/lib/chem";
describe("periodic table data", () => {
  it("has 118 elements numbered in order with unique symbols and names", () => {
    expect(ELEMENTS).toHaveLength(118);
    ELEMENTS.forEach((e, i) => expect(e.z).toBe(i + 1));
    expect(new Set(ELEMENTS.map((e) => e.sym)).size).toBe(118);
    expect(new Set(ELEMENTS.map((e) => e.name)).size).toBe(118);
    for (const e of ELEMENTS) { expect(e.mass).toBeGreaterThan(0); expect(e.sym).toMatch(/^[A-Z][a-z]?$/); }
  });
  it("known elements are right", () => {
    expect(BY_SYMBOL.get("Fe")).toMatchObject({ z: 26, name: "Iron", mass: 55.845 });
    expect(BY_SYMBOL.get("Au")).toMatchObject({ z: 79, name: "Gold" });
    expect(BY_SYMBOL.get("Og")!.z).toBe(118);
    expect(BY_SYMBOL.get("Na")!.cat).toBe("alkali");
    expect(BY_SYMBOL.get("Ne")!.cat).toBe("noble");
  });
  it("mass rises with atomic number except at the six places where it really does not (K, Ni, I, Pa, Np, Am)", () => {
    const bad = ELEMENTS.slice(1).filter((e, i) => e.mass < ELEMENTS[i].mass).map((e) => e.sym).sort();
    expect(bad).toEqual(["Am", "I", "K", "Ni", "Np", "Pa"]);
  });
  it("grid positions are unique, inside 18 columns, and match groups", () => {
    const seen = new Set<string>();
    for (const e of ELEMENTS) { const p = position(e.z); expect(p.col).toBeGreaterThanOrEqual(1); expect(p.col).toBeLessThanOrEqual(18); const k = `${p.row},${p.col}`; expect(seen.has(k), e.sym).toBe(false); seen.add(k); }
    expect([2, 10, 18, 36, 54, 86, 118].every((z) => groupOf(z) === 18)).toBe(true);
    expect([1, 3, 11, 19, 37, 55, 87].every((z) => groupOf(z) === 1)).toBe(true);
    expect([periodOf(26), periodOf(57), periodOf(92), groupOf(57)]).toEqual([4, 6, 7, null]);
    expect(groupOf(26)).toBe(8); expect(groupOf(6)).toBe(14); expect(position(6)).toEqual({ row: 2, col: 14 });
  });
  it("states at room temperature", () => { expect([stateOf(1), stateOf(35), stateOf(80), stateOf(26), stateOf(118)]).toEqual(["gas", "liquid", "liquid", "solid", "unknown"]); });
});
describe("formulas and molar mass", () => {
  it("parses brackets, hydrates and multi-letter symbols", () => {
    expect([...parseFormula("Ca(OH)2")].sort()).toEqual([["Ca", 1], ["H", 2], ["O", 2]]);
    expect(parseFormula("Al2(SO4)3").get("O")).toBe(12);
    expect(parseFormula("CuSO4·5H2O").get("H")).toBe(10); expect(parseFormula("CuSO4.5H2O").get("O")).toBe(9);
    expect(parseFormula("Co").get("Co")).toBe(1); expect(parseFormula("CO").get("C")).toBe(1);
    expect(parseFormula("Mg(NO3)2").get("N")).toBe(2); expect(parseFormula("K4[Fe(CN)6]").get("C")).toBe(6);
  });
  it("rejects bad input", () => { for (const f of ["", "Xx2", "H2O)", "(H2O", "h2o", "H2O!"]) expect(() => parseFormula(f), f).toThrow(FormulaError); });
  it("molar masses match textbook values", () => {
    expect(molarMass("H2O").total).toBeCloseTo(18.015, 3);
    expect(molarMass("NaCl").total).toBeCloseTo(58.44, 2);
    expect(molarMass("CO2").total).toBeCloseTo(44.009, 3);
    expect(molarMass("C6H12O6").total).toBeCloseTo(180.156, 2);
    expect(molarMass("Ca(OH)2").total).toBeCloseTo(74.092, 2);
    expect(molarMass("H2SO4").total).toBeCloseTo(98.07, 1);
  });
  it("percent composition adds to about 100", () => { const m = molarMass("C6H12O6"); expect(m.parts.reduce((n, p) => n + p.percent, 0)).toBeCloseTo(100, 1); expect(m.parts.find((p) => p.sym === "O")!.percent).toBeCloseTo(53.28, 1); });
});
describe("equation balancer", () => {
  const show = (eq: string) => { const r = balance(eq); if (!r.ok) return r.reason; return [...r.value.reactants, ...r.value.products].map((x) => x.coeff); };
  it("balances classic equations", () => {
    expect(show("H2 + O2 -> H2O")).toEqual([2, 1, 2]);
    expect(show("Fe + O2 -> Fe2O3")).toEqual([4, 3, 2]);
    expect(show("C3H8 + O2 -> CO2 + H2O")).toEqual([1, 5, 3, 4]);
    expect(show("Al + HCl -> AlCl3 + H2")).toEqual([2, 6, 2, 3]);
    expect(show("KMnO4 + HCl -> KCl + MnCl2 + H2O + Cl2")).toEqual([2, 16, 2, 2, 8, 5]);
    expect(show("Ca(OH)2 + H3PO4 -> Ca3(PO4)2 + H2O")).toEqual([3, 2, 1, 6]);
  });
  it("accepts arrows, equals signs and already-balanced input", () => { expect(show("N2 + H2 → NH3")).toEqual([1, 3, 2]); expect(show("2H2 + O2 = 2H2O")).toEqual([2, 1, 2]); expect(show("H2 + Cl2 -> HCl")).toEqual([1, 1, 2]); });
  it("every balanced result really conserves atoms", () => {
    for (const eq of ["C6H12O6 + O2 -> CO2 + H2O", "Na + H2O -> NaOH + H2", "Fe2O3 + CO -> Fe + CO2", "NH3 + O2 -> NO + H2O", "C2H6 + O2 -> CO2 + H2O"]) {
      const r = balance(eq); expect(r.ok, eq).toBe(true); if (!r.ok) continue;
      const tally = (side: { formula: string; coeff: number }[]) => { const t = new Map<string, number>(); side.forEach((s) => parseFormula(s.formula).forEach((n, el) => t.set(el, (t.get(el) ?? 0) + n * s.coeff))); return t; };
      expect([...tally(r.value.reactants)].sort()).toEqual([...tally(r.value.products)].sort());
    }
  });
  it("reports what went wrong", () => { expect(show("H2 + O2")).toBe("format"); expect(show("H2 + Zz -> H2Zz")).toBe("formula"); expect(show("H2 -> O2")).toBe("impossible"); expect(show("H2 + O2 -> H2O + O2")).not.toBeNull(); });
});

import { segments, roots, niceStep, zoom, pan, DEFAULT_VIEW } from "../src/lib/graph";
import { evaluateExpression } from "../src/lib/calc";
describe("graphing", () => {
  it("samples a smooth curve in one piece", () => {
    const s = segments((x) => x * x, DEFAULT_VIEW);
    expect(s).toHaveLength(1);
    expect(s[0][0]).toEqual({ x: -10, y: 100 }); expect(s[0].length).toBe(601);
  });
  it("breaks the curve at a gap instead of drawing a line across it", () => {
    expect(segments((x) => 1 / x, { xmin: -5, xmax: 5, ymin: -5, ymax: 5 }).length).toBeGreaterThanOrEqual(2);
    expect(segments((x) => Math.tan(x), { xmin: -5, xmax: 5, ymin: -5, ymax: 5 }).length).toBeGreaterThan(2);
    expect(segments((x) => Math.sqrt(x), { xmin: -5, xmax: 5, ymin: -5, ymax: 5 })).toHaveLength(1);
  });
  it("finds roots exactly where they are", () => {
    expect(roots((x) => x * x - 4, -10, 10)).toEqual([-2, 2]);
    expect(roots((x) => 2 * x + 6, -10, 10)).toEqual([-3]);
    expect(roots((x) => Math.sin(x), -7, 7).map((r) => Math.round(r * 1e4) / 1e4)).toEqual([-6.2832, -3.1416, 0, 3.1416, 6.2832]);
    expect(roots((x) => x * x + 1, -10, 10)).toEqual([]);
    expect(roots((x) => (x - 1) * (x - 2) * (x + 3), -10, 10)).toEqual([-3, 1, 2]);
  });
  it("does not report the gap in 1/x as a root", () => expect(roots((x) => 1 / x, -5, 5)).toEqual([]));
  it("grid steps are 1, 2 or 5 times a power of ten; zoom and pan keep the shape", () => {
    expect([niceStep(20), niceStep(2), niceStep(100), niceStep(0.5)]).toEqual([2, 0.2, 10, 0.05]);
    expect(zoom(DEFAULT_VIEW, 0.5)).toEqual({ xmin: -5, xmax: 5, ymin: -5, ymax: 5 });
    expect(pan(DEFAULT_VIEW, 0.1, 0)).toEqual({ xmin: -8, xmax: 12, ymin: -10, ymax: 10 });
  });
});
describe("scientific calculator", () => {
  const ev = async (e: string, deg = false, ans?: number) => { const r = await evaluateExpression(e, { deg, ans }); return r.ok ? r.text : "ERR"; };
  it("does arithmetic with the right order of operations", async () => { expect(await ev("2+3*4")).toBe("14"); expect(await ev("(2+3)*4")).toBe("20"); expect(await ev("2^10")).toBe("1024"); expect(await ev("7×6÷3−1")).toBe("13"); });
  it("functions and constants", async () => { expect(await ev("sqrt(144)")).toBe("12"); expect(await ev("5!")).toBe("120"); expect(await ev("log(1000)")).toBe("3"); expect(await ev("ln(e)")).toBe("1"); expect(await ev("π*2")).toBe("6.28318530718"); });
  it("degrees and radians", async () => { expect(await ev("sin(30)", true)).toBe("0.5"); expect(await ev("cos(60)", true)).toBe("0.5"); expect(await ev("atan(1)", true)).toBe("45"); expect(await ev("sin(pi/6)", false)).toBe("0.5"); });
  it("uses the previous answer", async () => expect(await ev("ans*2", false, 21)).toBe("42"));
  it("shows ERR for nonsense, divide by zero and too-long input", async () => { for (const e of ["", "2+", "foo(", "1/0", "x+", "5 5 5", "a".repeat(300)]) expect(await ev(e), e).toBe("ERR"); });
});

import katex from "katex";
import { SHEETS } from "../src/data/formulas";
describe("formula sheets", () => {
  it("every formula is valid LaTeX that KaTeX can draw", () => {
    let n = 0;
    for (const s of SHEETS) for (const it of s.items) { n++; expect(() => katex.renderToString(it.tex, { throwOnError: true, strict: "ignore" }), `${s.id}: ${it.en}`).not.toThrow(); }
    expect(n).toBeGreaterThan(50);
  });
  it("every formula has English and Spanish names, and sheet ids are unique", () => {
    for (const s of SHEETS) { expect(s.en && s.es).toBeTruthy(); for (const it of s.items) expect(it.en.trim() && it.es.trim(), it.en).toBeTruthy(); }
    expect(new Set(SHEETS.map((s) => s.id)).size).toBe(SHEETS.length);
  });
});

import { checkWork, workLimits, hourLabel, gradProgress, gradTotal, GRAD_REQUIRED, GRAD_AREAS } from "../src/lib/laborlaw";
describe("Texas teen work rules", () => {
  const base = { age: 15, period: "school-day" as const, schoolWeek: true, hoursToday: 3, hoursWeek: 15, start: 16, end: 19 };
  it("allows a legal school-day shift", () => expect(checkWork(base)).toMatchObject({ ok: true, issues: [] }));
  it("school days: 3 hours a day, 18 a school week, 7 a.m. to 7 p.m.", () => {
    expect(checkWork({ ...base, hoursToday: 4 }).issues).toEqual([{ kind: "dayHours", max: 3 }]);
    expect(checkWork({ ...base, hoursWeek: 19 }).issues).toEqual([{ kind: "weekHours", max: 18 }]);
    expect(checkWork({ ...base, end: 19.5 }).issues).toEqual([{ kind: "tooLate", until: 19 }]);
    expect(checkWork({ ...base, start: 6 }).issues).toEqual([{ kind: "tooEarly", from: 7 }]);
  });
  it("summer allows 8 hours a day, 40 a week, until 9 p.m.", () => {
    expect(workLimits("summer", false)).toEqual({ dayMax: 8, weekMax: 40, from: 7, until: 21 });
    expect(checkWork({ ...base, period: "summer", hoursToday: 8, hoursWeek: 40, start: 12, end: 21 }).ok).toBe(true);
    expect(checkWork({ ...base, period: "summer", hoursToday: 9 }).ok).toBe(false);
  });
  it("a non-school day in the school year still ends at 7 p.m., and the weekly cap depends on the week", () => {
    expect(workLimits("non-school-day", true)).toEqual({ dayMax: 8, weekMax: 18, from: 7, until: 19 });
    expect(workLimits("non-school-day", false).weekMax).toBe(40);
  });
  it("reports every problem at once", () => expect(checkWork({ ...base, hoursToday: 6, hoursWeek: 30, start: 5, end: 22 }).issues).toHaveLength(4));
  it("under 14 is generally not allowed; 16 and 17 have no hour limits but a hazard note", () => {
    expect(checkWork({ ...base, age: 13 })).toMatchObject({ ok: false, issues: [{ kind: "under14" }] });
    expect(checkWork({ ...base, age: 16, hoursToday: 12, end: 23 })).toMatchObject({ ok: true, hazardNote: true });
    expect(checkWork({ ...base, age: 18 })).toMatchObject({ ok: true, hazardNote: false });
  });
  it("formats clock hours in both languages", () => { expect(hourLabel(19, "en")).toBe("7 p.m."); expect(hourLabel(7.5, "en")).toBe("7:30 a.m."); expect(hourLabel(12, "en")).toBe("12 p.m."); expect(hourLabel(0, "es")).toBe("12 a. m."); });
});
describe("graduation credits", () => {
  it("foundation is 22 credits and endorsement is 26", () => { expect(gradTotal("foundation")).toBe(22); expect(gradTotal("endorsement")).toBe(26); });
  it("every area is listed for both plans", () => { for (const p of ["foundation", "endorsement"] as const) expect(Object.keys(GRAD_REQUIRED[p]).sort()).toEqual([...GRAD_AREAS].sort()); });
  it("counts credits per area, never more than the area needs", () => {
    const r = gradProgress({ plan: "foundation", earned: { english: 6, math: 2, science: 0 } });
    expect(r.per.find((x) => x.area === "english")).toEqual({ area: "english", need: 4, have: 4 });
    expect(r.have).toBe(6); expect(r.left).toBe(16); expect(r.pct).toBe(27);
  });
  it("ignores negative numbers", () => expect(gradProgress({ plan: "endorsement", earned: { math: -3 } }).have).toBe(0));
});

import { autoSchedule, spreadStudy, splitFairly } from "../src/lib/planner";
import { buildICS } from "../src/lib/ics";
import { weekScore, levelOf as loadLevel, burnoutSignals, balanceShares } from "../src/lib/load";
describe("auto schedule", () => {
  const cap = (n: number) => () => n;
  it("fills days earliest-deadline first and never schedules after a due date", () => {
    const r = autoSchedule([{ id: "a", title: "Essay", minutes: 120, due: "2026-10-22" }, { id: "b", title: "Lab", minutes: 60, due: "2026-10-21" }], cap(90), "2026-10-20", 5);
    expect(r.sessions[0]).toMatchObject({ date: "2026-10-20", taskId: "b", minutes: 60 });
    expect(r.sessions.filter((s) => s.taskId === "a").every((s) => s.date <= "2026-10-22")).toBe(true);
    expect(r.unscheduled).toEqual([]);
    expect(r.sessions.reduce((n, s) => n + s.minutes, 0)).toBe(180);
  });
  it("never goes over a day's free time, and splits a long task across days", () => {
    const r = autoSchedule([{ id: "a", title: "Project", minutes: 240 }], cap(60), "2026-10-20", 10);
    expect(r.sessions.every((s) => s.minutes <= 60)).toBe(true);
    expect(r.sessions).toHaveLength(4);
    expect(new Set(r.sessions.map((s) => s.date)).size).toBe(4);
  });
  it("reports what does not fit, and what is already overdue", () => {
    const r = autoSchedule([{ id: "a", title: "Big", minutes: 300, due: "2026-10-21" }, { id: "o", title: "Old", minutes: 30, due: "2026-10-01" }], cap(60), "2026-10-20", 7);
    expect(r.unscheduled.find((u) => u.taskId === "a")).toMatchObject({ minutes: 180, reason: "no-time" });
    expect(r.unscheduled.find((u) => u.taskId === "o")).toMatchObject({ minutes: 30, reason: "overdue" });
  });
  it("skips days with no free time", () => {
    const r = autoSchedule([{ id: "a", title: "A", minutes: 30 }], (d) => (d === "2026-10-22" ? 60 : 0), "2026-10-20", 5);
    expect(r.sessions).toEqual([{ date: "2026-10-22", taskId: "a", title: "A", minutes: 30 }]);
  });
  it("priority breaks ties between the same due dates", () => {
    const r = autoSchedule([{ id: "lo", title: "A", minutes: 60, due: "2026-10-25", priority: 1 }, { id: "hi", title: "B", minutes: 60, due: "2026-10-25", priority: 3 }], cap(60), "2026-10-20", 1);
    expect(r.sessions[0].taskId).toBe("hi");
  });
});
describe("study planner", () => {
  it("spreads study time over the days before a test instead of cramming", () => {
    const r = spreadStudy([{ id: "t", name: "Bio test", date: "2026-10-25", minutes: 150 }], () => 120, "2026-10-20");
    expect(r.short).toEqual([]);
    expect(r.sessions).toHaveLength(5);
    expect(r.sessions.every((s) => s.minutes === 30)).toBe(true);
    expect(r.sessions.every((s) => s.date < "2026-10-25")).toBe(true);
  });
  it("shares each day's free time between tests and reports a shortfall", () => {
    const r = spreadStudy([{ id: "a", name: "A", date: "2026-10-22", minutes: 200 }, { id: "b", name: "B", date: "2026-10-23", minutes: 200 }], () => 60, "2026-10-20");
    const perDay = new Map<string, number>(); r.sessions.forEach((s) => perDay.set(s.date, (perDay.get(s.date) ?? 0) + s.minutes));
    expect([...perDay.values()].every((m) => m <= 60)).toBe(true);
    expect(r.short.length).toBe(2);
    expect(r.sessions.reduce((n, s) => n + s.minutes, 0) + r.short.reduce((n, s) => n + s.minutes, 0)).toBe(400);
  });
  it("a test today or in the past cannot be planned", () => expect(spreadStudy([{ id: "a", name: "A", date: "2026-10-20", minutes: 60 }], () => 60, "2026-10-20").short).toEqual([{ id: "a", name: "A", minutes: 60 }]));
});
describe("fair split of group work", () => {
  it("balances effort, biggest task first", () => {
    const r = splitFairly([{ id: "1", title: "Slides", points: 5 }, { id: "2", title: "Research", points: 8 }, { id: "3", title: "Poster", points: 3 }, { id: "4", title: "Practice", points: 2 }], ["Ana", "Ben"]);
    expect(r.loads).toEqual({ Ana: 10, Ben: 8 });
    expect(Object.values(r.assigned).flat()).toHaveLength(4);
  });
  it("gives everyone something when there are enough tasks, and works for one person", () => {
    const t = [1, 2, 3].map((i) => ({ id: String(i), title: `T${i}`, points: 1 }));
    expect(Object.values(splitFairly(t, ["A", "B", "C"]).assigned).every((x) => x.length === 1)).toBe(true);
    expect(splitFairly(t, ["Solo"]).loads).toEqual({ Solo: 3 });
  });
});
describe("calendar file (.ics)", () => {
  const ics = buildICS([{ uid: "a1", date: "2026-10-25", title: "Essay, due; final", description: "Line one\nLine two" }, { uid: "b2", date: "2026-12-31", title: "x".repeat(120) }], { name: "My deadlines", now: new Date(Date.UTC(2026, 9, 20, 12, 0, 0)) });
  it("is a valid calendar with CRLF line endings", () => { expect(ics.startsWith("BEGIN:VCALENDAR\r\n")).toBe(true); expect(ics.endsWith("END:VCALENDAR\r\n")).toBe(true); expect(ics.replace(/\r\n/g, "").includes("\n")).toBe(false); expect((ics.match(/BEGIN:VEVENT/g) ?? []).length).toBe(2); });
  it("uses all-day dates, ending the next day, even across a year change", () => { expect(ics).toContain("DTSTART;VALUE=DATE:20261025\r\nDTEND;VALUE=DATE:20261026"); expect(ics).toContain("DTSTART;VALUE=DATE:20261231\r\nDTEND;VALUE=DATE:20270101"); });
  it("escapes commas, semicolons and new lines", () => { expect(ics).toContain("SUMMARY:Essay\\, due\; final"); expect(ics).toContain("DESCRIPTION:Line one\\nLine two"); });
  it("folds long lines at 75 characters", () => { for (const line of ics.split("\r\n")) expect(line.length).toBeLessThanOrEqual(75); });
  it("stamps the creation time in UTC and gives each event a unique id", () => { expect(ics).toContain("DTSTAMP:20261020T120000Z"); expect(ics).toContain("UID:a1@rumbo.app"); expect(ics).toContain("X-WR-CALNAME:My deadlines"); });
});
describe("week load and burnout signs", () => {
  it("scores a week with weights, and levels it", () => {
    expect(weekScore({ tests: 2, projects: 1, homework: 4, commitmentHours: 6 })).toBe(15);
    expect([loadLevel(0), loadLevel(6), loadLevel(7), loadLevel(12), loadLevel(13)]).toEqual(["light", "light", "medium", "medium", "heavy"]);
  });
  it("lists the warning signs it found", () => {
    expect(burnoutSignals({ avgSleep: 8.5, lowMoodDays: 0, weekLevel: "light", studyHours: 8, restDays: 2 })).toEqual({ signals: [], level: "light" });
    const r = burnoutSignals({ avgSleep: 6, lowMoodDays: 4, weekLevel: "heavy", studyHours: 30, restDays: 0 });
    expect(r.signals.sort()).toEqual(["load", "mood", "rest", "sleepLow", "study"]);
    expect(r.level).toBe("heavy");
    expect(burnoutSignals({ avgSleep: 7.5, lowMoodDays: 0, weekLevel: "light", studyHours: 5, restDays: 1 })).toEqual({ signals: ["sleep"], level: "light" });
    expect(burnoutSignals({ avgSleep: null, lowMoodDays: 0, weekLevel: "light", studyHours: 0, restDays: 3 }).signals).toEqual([]);
  });
  it("balance shares always add up to exactly 100", () => {
    for (const h of [{ school: 35, activities: 10, rest: 56, friends: 7 }, { school: 1, activities: 1, rest: 1, friends: 0 }, { school: 3, activities: 3, rest: 3, friends: 3 }]) {
      const s = balanceShares(h); expect(Object.values(s).reduce((a, b) => a + b, 0)).toBe(100);
    }
    expect(balanceShares({ school: 0, activities: 0, rest: 0, friends: 0 })).toEqual({ school: 0, activities: 0, rest: 0, friends: 0 });
    expect(balanceShares({ school: 10, activities: 10, rest: 0, friends: 0 })).toEqual({ school: 50, activities: 50, rest: 0, friends: 0 });
  });
});

import { toMin, fmtTime, validRange, overlaps, findConflicts, dayIndex, abDayFor, classesOn, type ScheduleDoc } from "../src/lib/schedule";
describe("schedule helpers", () => {
  it("reads and formats times", () => { expect(toMin("14:30")).toBe(870); expect(toMin("9:05")).toBe(545); expect(Number.isNaN(toMin("25"))).toBe(true); expect(fmtTime("14:30")).toBe("2:30 PM"); expect(fmtTime("00:15")).toBe("12:15 AM"); expect(fmtTime("12:00")).toBe("12:00 PM"); expect(fmtTime("14:30", "es")).toBe("14:30"); expect(validRange("09:00", "10:00")).toBe(true); expect(validRange("10:00", "09:00")).toBe(false); expect(validRange("10:00", "10:00")).toBe(false); });
  it("overlap: touching is fine, crossing is not", () => { expect(overlaps({ start: "09:00", end: "10:00" }, { start: "10:00", end: "11:00" })).toBe(false); expect(overlaps({ start: "09:00", end: "10:30" }, { start: "10:00", end: "11:00" })).toBe(true); expect(overlaps({ start: "09:00", end: "12:00" }, { start: "10:00", end: "11:00" })).toBe(true); });
  it("finds conflicts only on the same day", () => {
    const s = [{ id: "a", label: "Math", day: 0, start: "09:00", end: "10:00" }, { id: "b", label: "Practice", day: 0, start: "09:30", end: "11:00" }, { id: "c", label: "Work", day: 1, start: "09:30", end: "11:00" }];
    expect(findConflicts(s).map(([x, y]) => x.id + y.id)).toEqual(["ab"]);
    expect(findConflicts([])).toEqual([]);
  });
  it("day index: Monday is 0", () => { expect(dayIndex("2026-10-19")).toBe(0); expect(dayIndex("2026-10-25")).toBe(6); });
  it("A/B days alternate on school days and skip weekends", () => {
    const anchor = { date: "2026-10-19", day: "A" as const }; // a Monday
    expect(["2026-10-19", "2026-10-20", "2026-10-21", "2026-10-22", "2026-10-23"].map((d) => abDayFor(d, anchor))).toEqual(["A", "B", "A", "B", "A"]);
    expect(abDayFor("2026-10-24", anchor)).toBeNull();
    expect(abDayFor("2026-10-26", anchor)).toBe("B"); // the Friday was A, so the next school day is B
    expect(abDayFor("2026-10-16", anchor)).toBe("B"); // the Friday before a Monday A day was B
    expect(abDayFor("2026-10-12", { date: "2026-10-19", day: "B" })).toBe("A"); // five school days earlier, an odd number, so the letter flips
    expect(abDayFor("2026-10-05", { date: "2026-10-19", day: "B" })).toBe("B"); // ten school days earlier
  });
  it("lists a day's classes in time order, for weekday and A/B schedules", () => {
    const c = (id: string, start: string, days: string[]) => ({ id, name: id, room: "", start, end: "23:00", days, bring: "" });
    const wk: ScheduleDoc = { kind: "weekdays", anchor: null, classes: [c("late", "13:00", ["mon", "wed"]), c("early", "08:00", ["mon"]), c("tue", "09:00", ["tue"])] };
    expect(classesOn("2026-10-19", wk).map((x) => x.id)).toEqual(["early", "late"]);
    expect(classesOn("2026-10-20", wk).map((x) => x.id)).toEqual(["tue"]);
    expect(classesOn("2026-10-24", wk)).toEqual([]);
    const ab: ScheduleDoc = { kind: "ab", anchor: { date: "2026-10-19", day: "A" }, classes: [c("a1", "08:00", ["A"]), c("b1", "08:00", ["B"]), c("both", "12:00", ["A", "B"])] };
    expect(classesOn("2026-10-19", ab).map((x) => x.id)).toEqual(["a1", "both"]);
    expect(classesOn("2026-10-20", ab).map((x) => x.id)).toEqual(["b1", "both"]);
    expect(classesOn("2026-10-20", { ...ab, anchor: null })).toEqual([]);
  });
});
