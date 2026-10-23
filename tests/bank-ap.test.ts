import { describe, expect, it } from "vitest";
import { AP_ALL_COURSES, AP_PRACTICE_COURSES, apScore } from "../src/lib/exam/ap";
import { AP_SEED } from "../src/data/bank/ap-seed";
import { EXAMS } from "../src/lib/exam/config";
import { buildTest, estimate, grade } from "../src/lib/exam/engine";
import type { Session } from "../src/lib/exam/types";

const byId = new Map(AP_SEED.map((x) => [x.id, x]));
const right = (id: string) => { const x = byId.get(id)!; return x.choices![x.answer.charCodeAt(0) - 65].replace(/\$/g, "").replace(/\\/g, ""); };

describe("AP starter bank", () => {
  it("is well formed and every question belongs to a real course and unit", () => {
    expect(new Set(AP_SEED.map((x) => x.id)).size).toBe(AP_SEED.length);
    for (const x of AP_SEED) {
      const course = AP_PRACTICE_COURSES.find((c) => c.id === x.section);
      expect(course, x.id).toBeTruthy();
      expect(course!.units.map((u) => u.id), x.id).toContain(x.skill);
      expect(x.choices, x.id).toHaveLength(4); expect(new Set(x.choices).size, x.id).toBe(4);
      expect(x.explanation.length, x.id).toBeGreaterThan(20);
      expect(x.explanation, x.id).not.toMatch(/\b[Cc]hoices? [A-D]\b/);
    }
  });
  it("has the official number of units for each practice course", () => {
    const units = Object.fromEntries(AP_PRACTICE_COURSES.map((c) => [c.id, c.units.length]));
    expect(units).toEqual({ apstats: 5, apush: 9, aphug: 7 });
  });
  it("has at least 3 questions in each unit that has questions, and 9 per course", () => {
    for (const c of AP_PRACTICE_COURSES) {
      const per = new Map<string, number>();
      AP_SEED.filter((x) => x.section === c.id).forEach((x) => per.set(x.skill, (per.get(x.skill) ?? 0) + 1));
      for (const [u, n] of per) expect(n, `${c.id}/${u}`).toBeGreaterThanOrEqual(3);
      expect(AP_SEED.filter((x) => x.section === c.id).length, c.id).toBeGreaterThanOrEqual(9);
    }
  });
  it("statistics answer keys, recomputed", () => {
    expect(Number(right("ap-apstats-u1-1"))).toBe(22 - 10);
    expect(Number(right("ap-apstats-u1-3"))).toBe(30 + 1.5 * (30 - 20));
    expect(Number(right("ap-apstats-u5-2"))).toBe(2 + 3 * 4);
    expect(Number(right("ap-apstats-u5-3"))).toBe(17 - 14);
    expect(Number(right("ap-apstats-u2-1"))).toBeCloseTo(0.3 * 0.4, 9);
    expect(Number(right("ap-apstats-u2-2"))).toBeCloseTo(1 * 0.2 + 2 * 0.5 + 3 * 0.3, 9);
    expect(0.2 + 0.5 + 0.3).toBeCloseTo(1, 9); // the probabilities in the question add to 1
  });
  it("maps percent correct to a 1 to 5 estimate", () => {
    expect([0, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 1].map(apScore)).toEqual([1, 1, 2, 3, 4, 4, 5, 5]);
  });
  it("lists the full course menu, and every practice course is on it", () => {
    expect(AP_ALL_COURSES.length).toBeGreaterThanOrEqual(35);
    for (const c of AP_PRACTICE_COURSES) expect(AP_ALL_COURSES.map((x) => x.id)).toContain(c.id);
    expect(new Set(AP_ALL_COURSES.map((x) => x.id)).size).toBe(AP_ALL_COURSES.length);
  });
  it("builds and scores a unit quiz", () => {
    const ids = buildTest(AP_SEED, { exam: "ap", mode: "section", section: "apush", skill: "p5", count: 10, seed: 1 });
    expect(ids).toHaveLength(3);
    const session: Session = { exam: "ap", mode: "section", qids: ids, answers: Object.fromEntries(ids.map((i) => [i, byId.get(i)!.answer])), flags: [], startedAt: 1, endsAt: null, timed: false };
    const e = estimate("ap", grade(byId, session).items);
    expect(e.sections[0]).toMatchObject({ section: "apush", pct: 1, score: 5 });
    expect(e.total).toBeNull();
    expect(EXAMS.ap.sections.slice(0, 3).map((s) => s.id)).toEqual(["apstats", "apush", "aphug"]);
  });
});

import { examPath } from "../src/lib/exam/config";
describe("exam page addresses", () => {
  it("only point at pages that exist", async () => {
    const { findTool } = await import("../src/config/features");
    for (const exam of ["sat", "psat", "act", "tsi", "ap"] as const)
      for (const page of ["overview", "diagnostic", "sections", "full", "scores", "resources"] as const) {
        const [, , tab, tool] = examPath(exam, page).split("/");
        expect(findTool(tab, tool), `${exam} ${page} -> ${examPath(exam, page)}`).toBeTruthy();
      }
  });
});

import { AP_ALL_COURSES as ALL, AP_COURSES, AP_SECTIONS, hasQuestions } from "../src/lib/exam/ap";
describe("AP outlines", () => {
  it("every AP course has units, and every unit has numbered topics", () => {
    expect(AP_COURSES.map((c) => c.id).sort()).toEqual(ALL.map((c) => c.id).sort());
    for (const c of AP_COURSES) {
      expect(c.units.length, c.id).toBeGreaterThanOrEqual(4);
      expect(new Set(c.units.map((u) => u.id)).size).toBe(c.units.length);
      for (const u of c.units) {
        expect(u.topics.length, `${c.id} ${u.id}`).toBeGreaterThanOrEqual(3);
        expect(new Set(u.topics.map((t) => t.id)).size).toBe(u.topics.length);
        u.topics.forEach((t, i) => { expect(t.num).toBe(`${u.no}.${i + 1}`); expect(t.en.length).toBeGreaterThan(3); });
      }
    }
  });
  it("keeps the old unit ids for the courses with starter questions and numbers Physics 2 from Unit 9", () => {
    expect(AP_COURSES.find((c) => c.id === "apush")!.units[0].id).toBe("p1");
    expect(AP_COURSES.find((c) => c.id === "apstats")!.units[4].topics[0].num).toBe("5.1");
    expect(AP_COURSES.find((c) => c.id === "ap-physics-2")!.units[0].no).toBe(9);
    expect(AP_COURSES.find((c) => c.id === "ap-calculus-bc")!.units.length).toBe(10);
    expect(AP_COURSES.find((c) => c.id === "ap-calculus-ab")!.units.length).toBe(8);
  });
  it("every course is an exam section, and only some have a hand-written or generated bank", () => {
    expect(AP_SECTIONS.length).toBe(AP_COURSES.length);
    expect(hasQuestions("apush")).toBe(true);
    expect(hasQuestions("ap-biology")).toBe(false);
  });
});
