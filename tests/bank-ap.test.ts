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
    expect(units).toEqual({ apstats: 9, apush: 9, aphug: 7 });
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
    expect(Number(right("ap-apstats-u2-2"))).toBe(2 + 3 * 4);
    expect(Number(right("ap-apstats-u2-3"))).toBe(17 - 14);
    expect(Number(right("ap-apstats-u4-1"))).toBeCloseTo(0.3 * 0.4, 9);
    expect(Number(right("ap-apstats-u4-2"))).toBeCloseTo(1 * 0.2 + 2 * 0.5 + 3 * 0.3, 9);
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
    expect(EXAMS.ap.sections.map((s) => s.id)).toEqual(["apstats", "apush", "aphug"]);
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

import { AP_CED } from "../src/data/ap-ced";
import { AP_COURSES, AP_SECTIONS, hasQuestions } from "../src/lib/exam/ap";
describe("AP course units from the CED list", () => {
  it("every CED course name matches a real course, and every course gets numbered units", () => {
    const names = new Set(AP_ALL_COURSES.map((c) => c.en));
    for (const n of Object.keys(AP_CED)) expect(names.has(n), n).toBe(true);
    for (const c of AP_COURSES) { expect(c.units.length, c.id).toBeGreaterThanOrEqual(4); expect(new Set(c.units.map((u) => u.id)).size).toBe(c.units.length); }
    expect(AP_COURSES.length).toBeGreaterThanOrEqual(25);
  });
  it("mock exams only list courses that have questions", () => {
    expect(AP_SECTIONS.map((s) => s.id).sort()).toEqual(["apstats", "apush", "aphug"].sort());
    expect(hasQuestions("ap-biology")).toBe(false);
  });
});
