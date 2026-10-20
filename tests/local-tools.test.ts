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
