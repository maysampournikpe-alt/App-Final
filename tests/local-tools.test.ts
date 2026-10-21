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
