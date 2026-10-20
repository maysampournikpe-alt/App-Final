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
