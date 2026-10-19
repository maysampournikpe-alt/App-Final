import { describe, expect, it } from "vitest";
import { addDays, diffDays, formatDay, isValidISO, parseISO, toISO } from "../src/lib/dates";
import { gpa, parseCredits, type Course } from "../src/lib/gpa";
import { neededOnFinal } from "../src/lib/grades";
import { planBackward } from "../src/lib/backward";

const c = (grade: Course["grade"], level: Course["level"] = "regular", credits = 1, planned = false): Course =>
  ({ id: Math.random().toString(), name: "x", grade, credits, level, planned });

describe("dates", () => {
  it("round-trips without time zone drift", () => {
    expect(toISO(parseISO("2026-10-26"))).toBe("2026-10-26");
    expect(addDays("2026-10-31", 1)).toBe("2026-11-01");
    expect(addDays("2026-03-07", 2)).toBe("2026-03-09"); // across US daylight saving
    expect(diffDays("2026-10-13", "2026-10-26")).toBe(13);
    expect(diffDays("2026-03-07", "2026-03-09")).toBe(2);
  });
  it("validates", () => {
    expect(isValidISO("2026-02-30")).toBe(false);
    expect(isValidISO("2026-10-26")).toBe(true);
    expect(formatDay("2026-10-26", "en")).toMatch(/Oct 26/);
    expect(formatDay("2026-10-26", "es")).toMatch(/26/);
  });
});

describe("gpa", () => {
  it("is null with no courses", () => expect(gpa([], { weighted: false, includePlanned: true })).toBeNull());
  it("averages unweighted by credits", () => {
    const list = [c("A"), c("B"), c("C", "regular", 0.5)];
    expect(gpa(list, { weighted: false, includePlanned: true })).toBe(3.2); // (4*1 + 3*1 + 2*0.5) / 2.5
  });
  it("adds weight for honors and AP but not for an F", () => {
    const list = [c("A", "ap"), c("B", "honors"), c("F", "ap")];
    // (5 + 3.5 + 0) / 3 = 2.83
    expect(gpa(list, { weighted: true, includePlanned: true })).toBe(2.83);
    expect(gpa(list, { weighted: false, includePlanned: true })).toBe(2.33);
  });
  it("what-if courses count only when asked", () => {
    const list = [c("A"), c("F", "regular", 1, true)];
    expect(gpa(list, { weighted: false, includePlanned: false })).toBe(4);
    expect(gpa(list, { weighted: false, includePlanned: true })).toBe(2);
  });
  it("rejects silly credit values", () => {
    expect(parseCredits("0.5")).toBe(0.5);
    expect(parseCredits("0")).toBeNull();
    expect(parseCredits("abc")).toBeNull();
    expect(parseCredits("-1")).toBeNull();
  });
});

describe("what do I need on the final", () => {
  it("computes the classic case", () => {
    // 82 now, final is 20%, want 90: (90 - 82*0.8) / 0.2 = 122, more than a 100
    expect(neededOnFinal(82, 20, 90)).toEqual({ kind: "impossible", needed: 122 });
    // 88 now, final 25%, want 90: (90 - 66) / 0.25 = 96
    expect(neededOnFinal(88, 25, 90)).toEqual({ kind: "possible", needed: 96 });
  });
  it("reports when the target is already safe", () => {
    expect(neededOnFinal(95, 20, 70)).toEqual({ kind: "already", needed: 0 });
  });
  it("rejects bad input", () => {
    expect(neededOnFinal(88, 0, 90)).toBeNull();
    expect(neededOnFinal(88, 150, 90)).toBeNull();
    expect(neededOnFinal(NaN, 20, 90)).toBeNull();
  });
});

describe("backward planner", () => {
  const steps = [1, 3, 1, 3, 2, 1].map((w, i) => ({ id: String(i), label: `s${i}`, weight: w }));
  it("keeps steps in order, inside the window, and ends the day before due", () => {
    const out = planBackward(steps, "2026-10-13", "2026-10-26");
    expect(out).toHaveLength(6);
    const days = out.map((s) => s.date);
    expect([...days].sort()).toEqual(days);
    expect(days[0] >= "2026-10-13").toBe(true);
    expect(days.at(-1)).toBe("2026-10-25");
  });
  it("squeezes into one day when due today or tomorrow", () => {
    expect(planBackward(steps, "2026-10-13", "2026-10-13").every((s) => s.date === "2026-10-13")).toBe(true);
    expect(planBackward(steps, "2026-10-13", "2026-10-14").every((s) => s.date <= "2026-10-14")).toBe(true);
  });
  it("returns nothing when the due date has passed", () => {
    expect(planBackward(steps, "2026-10-13", "2026-10-01")).toEqual([]);
  });
});
