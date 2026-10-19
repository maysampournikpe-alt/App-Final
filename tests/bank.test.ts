import { describe, expect, it } from "vitest";
import { evaluate } from "mathjs";
import { SAT_SEED } from "../src/data/bank/sat-seed";
import { EXAMS } from "../src/lib/exam/config";
import { buildTest, estimate, grade, isCorrect, minutesFor, openMistakes, parseNumeric, skillStats } from "../src/lib/exam/engine";
import type { Question, Session } from "../src/lib/exam/types";

const byId = new Map(SAT_SEED.map((q) => [q.id, q]));
const q = (id: string) => byId.get(id)!;
const choice = (id: string, letter: string) => q(id).choices![letter.charCodeAt(0) - 65];
const plain = (s: string) => s.replace(/\$/g, "").replace(/\\cdot/g, "*").replace(/\^/g, "^").trim();

describe("seed bank structure", () => {
  it("has unique ids and uses real skills", () => {
    expect(new Set(SAT_SEED.map((x) => x.id)).size).toBe(SAT_SEED.length);
    for (const x of SAT_SEED) {
      const sec = EXAMS.sat.sections.find((s) => s.id === x.section);
      expect(sec, x.id).toBeTruthy();
      expect(sec!.skills.map((s) => s.id), x.id).toContain(x.skill);
      expect(x.explanation.length, x.id).toBeGreaterThan(20);
      expect(x.stem.length, x.id).toBeGreaterThan(10);
    }
  });
  it("multiple choice has four distinct choices and a valid key", () => {
    for (const x of SAT_SEED.filter((y) => y.type === "mc")) {
      expect(x.choices, x.id).toHaveLength(4);
      expect(new Set(x.choices).size, x.id).toBe(4);
      expect(["A", "B", "C", "D"], x.id).toContain(x.answer);
    }
  });
  it("grid-in answers are numbers", () => {
    for (const x of SAT_SEED.filter((y) => y.type === "grid")) {
      expect(parseNumeric(x.answer), x.id).not.toBeNull();
      for (const a of x.accept ?? []) expect(parseNumeric(a), x.id).toBeCloseTo(parseNumeric(x.answer)!, 9);
    }
  });
  it("covers every skill with at least 3 questions", () => {
    for (const sec of EXAMS.sat.sections) for (const s of sec.skills)
      expect(SAT_SEED.filter((x) => x.section === sec.id && x.skill === s.id).length, `${sec.id}/${s.id}`).toBeGreaterThanOrEqual(3);
  });
});

describe("math answer keys, recomputed independently", () => {
  it("algebra", () => {
    expect(3 * Number(choice("sat-math-a1", q("sat-math-a1").answer)) + 7).toBe(25);
    expect(parseNumeric(q("sat-math-a2").answer)).toBe(8); expect(2 * (8 - 3)).toBe(18 - 8);
    const pts = q("sat-math-a3").choices!.map((c) => (c.match(/-?\d+/g) ?? []).map(Number));
    const on = pts.map(([x, y]) => 3 * x - 4 === y);
    expect(on.filter(Boolean)).toHaveLength(1);
    expect("ABCD"[on.indexOf(true)]).toBe(q("sat-math-a3").answer);
    expect(choice("sat-math-a4", q("sat-math-a4").answer)).toContain("25m + 40");
    expect(parseNumeric(q("sat-math-a5").answer)).toBe(7); expect(7 + 3).toBe(10); expect(7 - 3).toBe(4);
  });
  it("advanced math", () => {
    const right = plain(choice("sat-math-v1", q("sat-math-v1").answer));
    for (const x of [-3, 0, 1, 5, 7.5]) expect(evaluate(right.replace(/x/g, `(${x})`))).toBeCloseTo((x + 3) * (x - 2), 9);
    expect(3 * 3 - 5 * 3 + 6).toBe(0); expect(parseNumeric(q("sat-math-v2").answer)).toBe(3);
    expect(Number(choice("sat-math-v3", q("sat-math-v3").answer))).toBe(2 * 4 ** 2 - 3);
    expect(parseNumeric(q("sat-math-v4").answer)).toBe(5 * 2 ** (9 / 3));
  });
  it("problem solving and data", () => {
    expect(Number(choice("sat-math-p1", q("sat-math-p1").answer))).toBe(0.4 * 80);
    expect(Number(choice("sat-math-p2", q("sat-math-p2").answer))).toBe((4 + 8 + 10 + 18) / 4);
    expect(parseNumeric(q("sat-math-p3").answer)).toBe((3 * 60) / 24);
    expect(Number(choice("sat-math-p4", q("sat-math-p4").answer))).toBe(150 / 2.5);
  });
  it("geometry and trig", () => {
    expect(Number(choice("sat-math-t1", q("sat-math-t1").answer))).toBe(Math.hypot(12, 5));
    expect(parseNumeric(q("sat-math-t2").answer)).toBe(10);
    expect(choice("sat-math-t3", q("sat-math-t3").answer)).toContain("\\frac{4}{5}"); expect(Math.hypot(6, 8)).toBe(10); expect(8 / 10).toBe(4 / 5);
    expect(Number(choice("sat-math-t4", q("sat-math-t4").answer))).toBe((180 / 6) * 3);
  });
});

describe("answer checking", () => {
  const grid: Question = { ...q("sat-math-p3") };
  it("accepts equal numbers written different ways", () => {
    for (const ok of ["7.5", " 7.50 ", "15/2", "+7.5", "7,5".replace(",", ".")]) expect(isCorrect(grid, ok), ok).toBe(true);
    for (const bad of ["7", "7.4", "", "seven", "15/3"]) expect(isCorrect(grid, bad), bad).toBe(false);
    expect(parseNumeric("−3")).toBe(-3); expect(parseNumeric("1,000")).toBe(1000); expect(parseNumeric("1/0")).toBeNull();
  });
  it("checks multiple choice by letter, any case", () => {
    expect(isCorrect(q("sat-math-a1"), "b")).toBe(true);
    expect(isCorrect(q("sat-math-a1"), "A")).toBe(false);
    expect(isCorrect(q("sat-math-a1"), undefined)).toBe(false);
  });
});

describe("building tests", () => {
  it("balances skills, never repeats a question and respects the count", () => {
    const ids = buildTest(SAT_SEED, { exam: "sat", mode: "section", section: "math", count: 8, seed: 1 });
    expect(ids).toHaveLength(8); expect(new Set(ids).size).toBe(8);
    expect(new Set(ids.map((i) => q(i).skill)).size).toBe(4); // 2 from each of 4 skills
  });
  it("is repeatable for the same seed and different for another", () => {
    const a = buildTest(SAT_SEED, { exam: "sat", mode: "diagnostic", seed: 7 });
    expect(buildTest(SAT_SEED, { exam: "sat", mode: "diagnostic", seed: 7 })).toEqual(a);
    expect(buildTest(SAT_SEED, { exam: "sat", mode: "diagnostic", seed: 8 })).not.toEqual(a);
  });
  it("a diagnostic covers both sections, and full uses everything available", () => {
    const d = buildTest(SAT_SEED, { exam: "sat", mode: "diagnostic", seed: 3 });
    expect(new Set(d.map((i) => q(i).section))).toEqual(new Set(["rw", "math"]));
    expect(buildTest(SAT_SEED, { exam: "sat", mode: "full", seed: 3 })).toHaveLength(SAT_SEED.length);
  });
  it("the PSAT only gets easier questions", () => {
    const ids = buildTest(SAT_SEED, { exam: "psat", mode: "full", seed: 1 });
    expect(ids.length).toBeGreaterThan(0);
    expect(ids.every((i) => q(i).difficulty <= 2)).toBe(true);
  });
  it("gives a sensible time at the real pace", () => {
    const qs = buildTest(SAT_SEED, { exam: "sat", mode: "section", section: "math", count: 10, seed: 1 }).map(q);
    expect(minutesFor("sat", qs)).toBe(Math.round(10 * (70 / 44)));
  });
});

describe("scoring and progress", () => {
  const ids = buildTest(SAT_SEED, { exam: "sat", mode: "diagnostic", seed: 2 });
  const session = (answer: (x: Question) => string | undefined): Session => ({
    exam: "sat", mode: "diagnostic", qids: ids, flags: [], startedAt: 1000, endsAt: null, timed: false,
    answers: Object.fromEntries(ids.flatMap((i) => { const a = answer(q(i)); return a ? [[i, a]] : []; })),
  });
  it("a perfect run gets the top score and a blank one the bottom", () => {
    const perfect = grade(byId, session((x) => x.answer));
    const e = estimate("sat", perfect.items);
    expect(e.sections.every((s) => s.score === 800)).toBe(true); expect(e.total).toBe(1600);
    const blank = grade(byId, session(() => undefined));
    expect(blank.unanswered).toBe(ids.length);
    expect(estimate("sat", blank.items).total).toBe(400);
  });
  it("one section alone gives a section score but no total", () => {
    const e = estimate("sat", grade(byId, session((x) => x.answer)).items.filter((i) => i.section === "math"));
    expect(e.sections).toHaveLength(1); expect(e.total).toBeNull();
  });
  it("the PSAT uses its own scale", () => {
    expect(estimate("psat", grade(byId, session((x) => x.answer)).items).total).toBe(1520);
  });
  it("finds weak skills and open mistakes, and clears a mistake once fixed", () => {
    const wrongMath = grade(byId, session((x) => (x.section === "math" ? "Z" : x.answer)));
    expect(skillStats([wrongMath])[0].pct).toBe(0);
    expect(skillStats([wrongMath]).every((s) => s.total >= 2)).toBe(true);
    const mistakes = openMistakes([wrongMath]);
    expect(mistakes.length).toBeGreaterThan(0);
    const later = { ...grade(byId, session((x) => x.answer)), finishedAt: wrongMath.finishedAt + 10 };
    expect(openMistakes([wrongMath, later])).toEqual([]);
  });
});

import { buildGenPrompt, buildSolvePrompt, normalizeStem, parseSolved, verifyQuestion } from "../src/lib/exam/verify";
describe("generation checks", () => {
  const spec = { exam: "sat" as const, section: "math", skill: "algebra", count: 4, difficulty: 2 as const };
  const mc = { stem: "If $2x + 3 = 11$, what is $x$?", type: "mc" as const, choices: ["2", "4", "6", "8"], answer: "B", explanation: "Subtract 3 to get 2x = 8, so x = 4." };
  it("accepts a question the checker solved the same way", () => {
    expect(verifyQuestion(mc, spec, "B", "id1").ok).toBe(true);
  });
  it("rejects when the checker disagrees, answered nothing, or the key is malformed", () => {
    expect(verifyQuestion(mc, spec, "C", "id1")).toMatchObject({ ok: false });
    expect(verifyQuestion(mc, spec, null, "id1")).toMatchObject({ ok: false });
    expect(verifyQuestion({ ...mc, answer: "E" }, spec, "E", "id1")).toMatchObject({ ok: false });
    expect(verifyQuestion({ ...mc, choices: ["2", "2", "6", "8"] }, spec, "B", "id1")).toMatchObject({ ok: false });
    expect(verifyQuestion({ ...mc, choices: ["2", "4", "6", "all of the above"] }, spec, "B", "id1")).toMatchObject({ ok: false });
  });
  it("checks grid answers numerically", () => {
    const grid = { stem: "What is $\\frac{15}{2}$ as a decimal?", type: "grid" as const, answer: "7.5", accept: ["15/2"], explanation: "Divide 15 by 2 to get 7.5." };
    expect(verifyQuestion(grid, spec, "15/2", "g1").ok).toBe(true);
    expect(verifyQuestion(grid, spec, "7", "g1").ok).toBe(false);
  });
  it("reads the checker's final line and ignores noise", () => {
    expect(parseSolved("Step 1...\nANSWER: **B**")).toBe("B");
    expect(parseSolved("so x = 4\nANSWER: $7.5$.")).toBe("7.5");
    expect(parseSolved("I am not sure")).toBeNull();
  });
  it("never shows the answer key to the checker, and dedupes by stem", () => {
    const p = buildSolvePrompt({ stem: mc.stem, type: "mc", choices: mc.choices });
    expect(p.user).not.toMatch(/explanation|Subtract 3/);
    expect(normalizeStem("If $2x+3=11$, what is x?")).toBe(normalizeStem("if 2x 3 11 what is X"));
    expect(buildGenPrompt(spec).system).toMatch(/ORIGINAL/);
  });
});
