import { describe, expect, it } from "vitest";
import { ACT_SEED } from "../src/data/bank/act-seed";
import { TSI_SEED } from "../src/data/bank/tsi-seed";
import { EXAMS } from "../src/lib/exam/config";
import { buildTest, estimate, grade, parseNumeric } from "../src/lib/exam/engine";
import type { Question, Session } from "../src/lib/exam/types";

const plain = (s: string) => s.replace(/\\\$/g, "").replace(/\$/g, "").replace(/\\/g, "");
function suite(name: "act" | "tsi", seed: Question[]) {
  const byId = new Map(seed.map((x) => [x.id, x]));
  const q = (id: string) => byId.get(`${name}-${id}`)!;
  const right = (id: string) => plain(q(id).choices![q(id).answer.charCodeAt(0) - 65]);
  describe(`${name} starter bank`, () => {
    it("is well formed and covers every skill", () => {
      expect(new Set(seed.map((x) => x.id)).size).toBe(seed.length);
      for (const x of seed) {
        const sec = EXAMS[name].sections.find((s) => s.id === x.section);
        expect(sec, x.id).toBeTruthy();
        expect(sec!.skills.map((s) => s.id), x.id).toContain(x.skill);
        if (x.type === "mc") { expect(x.choices, x.id).toHaveLength(4); expect(new Set(x.choices).size, x.id).toBe(4); expect("ABCD", x.id).toContain(x.answer); }
        else expect(parseNumeric(x.answer), x.id).not.toBeNull();
        expect(x.explanation.length, x.id).toBeGreaterThan(15);
        expect(x.explanation, x.id).not.toMatch(/\b[Cc]hoices? [A-D]\b/);
      }
      for (const sec of EXAMS[name].sections) for (const s of sec.skills)
        expect(seed.filter((x) => x.section === sec.id && x.skill === s.id).length, `${sec.id}/${s.id}`).toBeGreaterThanOrEqual(2);
    });
    it("builds a test that covers every section and can be scored", () => {
      const ids = buildTest(seed, { exam: name, mode: "diagnostic", seed: 1 });
      expect(new Set(ids.map((i) => byId.get(i)!.section)).size).toBe(EXAMS[name].sections.length);
      const session: Session = { exam: name, mode: "diagnostic", qids: ids, answers: Object.fromEntries(ids.map((i) => [i, byId.get(i)!.answer])), flags: [], startedAt: 1, endsAt: null, timed: false };
      const e = estimate(name, grade(byId, session).items);
      expect(e.sections.every((s) => s.pct === 1)).toBe(true);
      return e;
    });
  });
  return { q, right, byId };
}

describe("ACT", () => {
  const { q, right } = suite("act", ACT_SEED);
  it("math answer keys, recomputed", () => {
    expect(Number(right("m1"))).toBe((15 + 9) / 4);
    expect(Number(right("m2"))).toBe((-9 - 6) / (2 - 5));
    const f = (x: number) => 3 * x ** 2 - 2 * x; expect(Number(right("m3"))).toBe(f(2));
    expect(Number(right("m4"))).toBe((10 - 2) / (5 - 1));
    expect(right("m5").replace(/\s/g, "")).toBe("x=3andx=4"); expect(3 ** 2 - 21 + 12).toBe(0); expect(4 ** 2 - 28 + 12).toBe(0);
    expect(Number(right("m6"))).toBe(2 * (8 + 5));
    expect(Number(right("m7"))).toBe(0.5 * 10 * 7);
    expect(Number(right("m8"))).toBe(Math.sqrt(25 ** 2 - 7 ** 2));
    expect(Number(right("m9"))).toBe((12 + 15 + 18 + 21 + 24) / 5);
    expect(right("m10")).toBe("frac{2}{5}"); expect(6 / 15).toBeCloseTo(2 / 5, 9);
    expect(q("m1").section).toBe("math");
  });
  it("science: the pattern answers follow from the data", () => {
    expect((22 + 26) / 2).toBe(24);
    expect(Math.round(225 * 1.5)).toBe(338); expect(150 / 100).toBe(1.5); expect(225 / 150).toBe(1.5);
    expect(right("s1")).toBe("24 g"); expect(right("s6")).toBe("338");
  });
  it("has the current ACT shape: science is optional and does not block a composite", () => {
    const items = ACT_SEED.filter((x) => x.section !== "science").map((x) => ({ qid: x.id, section: x.section, skill: x.skill, answer: x.answer, correct: true }));
    const e = estimate("act", items);
    expect(e.total).toBe(36); expect(e.sections.map((s) => s.section)).not.toContain("science");
    expect(EXAMS.act.totalMode).toBe("average");
  });
});

describe("TSI", () => {
  const { right } = suite("tsi", TSI_SEED);
  it("math answer keys, recomputed", () => {
    expect(right("m1")).toBe("frac{7}{8}"); expect(3 / 4 + 1 / 8).toBe(7 / 8);
    expect(Number(right("m2"))).toBe(60 - 0.15 * 60);
    expect(parseNumeric(TSI_SEED.find((x) => x.id === "tsi-m3")!.answer)).toBe(2.5 * 60);
    expect(Number(right("m4"))).toBe((30 + 5) / 7);
    expect(parseNumeric(TSI_SEED.find((x) => x.id === "tsi-m5")!.answer)).toBe((12 - 2 * 3) / 3);
    expect(right("m6").replace(/\s/g, "")).toBe("(x+4)(x-4)"); for (const x of [-3, 0, 2, 9]) expect((x + 4) * (x - 4)).toBe(x * x - 16);
    expect(right("m7").replace(/\s/g, "")).toBe("y=-2x+4");
    expect(right("m8")).toBe("25pi");
    expect(parseNumeric(TSI_SEED.find((x) => x.id === "tsi-m9")!.answer)).toBe(4 ** 3);
    expect(parseNumeric(TSI_SEED.find((x) => x.id === "tsi-m10")!.answer)).toBe(180 - 50 - 60);
    expect(parseNumeric(TSI_SEED.find((x) => x.id === "tsi-m11")!.answer)).toBe((7 + 9) / 2);
    expect(right("m12")).toBe("frac{1}{4}"); expect(0.5 * 0.5).toBe(0.25);
  });
  it("has no total and is untimed by default", () => {
    expect(EXAMS.tsi.totalMode).toBe("none"); expect(EXAMS.tsi.realTimed).toBe(false);
  });
});
