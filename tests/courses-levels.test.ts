import { describe, expect, it } from "vitest";
import { coursesFor } from "@/lib/exam/courses";
import { EXAMS } from "@/lib/exam/config";
import { LEVELS, levelOfQuestion, matchesLevel, specFor } from "@/lib/exam/levels";
import { buildGenPrompt, topicOf, verifyQuestion } from "@/lib/exam/verify";
import { ID_MAX, notesMessages, notesSchema } from "@/lib/ai/learn";
import { localPool } from "@/lib/exam/gather";

describe("tests are shaped like AP courses for the study screens", () => {
  for (const exam of ["sat", "psat", "act", "tsi"] as const) {
    it(`${exam}: every skill has numbered topics with both languages and unique ids`, () => {
      const courses = coursesFor(exam);
      expect(courses.map((c) => c.id)).toEqual(EXAMS[exam].sections.map((s) => s.id));
      const ids = new Set<string>();
      for (const c of courses) for (const u of c.units) {
        expect(u.topics.length).toBeGreaterThanOrEqual(3);
        for (const [j, t] of u.topics.entries()) {
          expect(t.num).toBe(`${u.no}.${j + 1}`);
          expect(t.en.length).toBeGreaterThan(3); expect(t.es.length).toBeGreaterThan(3);
          expect(ids.has(`${c.id}/${t.id}`)).toBe(false); ids.add(`${c.id}/${t.id}`);
        }
      }
    });
  }
  it("the question writer resolves a SAT topic and refuses an unknown one", () => {
    expect(topicOf("sat", "math", "algebra", "algebra-3")).toMatchObject({ section: "Math", skill: "Algebra", topicNum: "1.3" });
    expect(topicOf("sat", "math", "algebra", "algebra-99")).toBeNull();
    expect(topicOf("act", "science", "evaluation-of-models")).not.toBeNull();
  });
});

describe("ids fit what the API accepts", () => {
  it("every course, skill and topic id is within the limits", () => {
    for (const exam of ["ap", "sat", "act", "tsi"] as const) for (const c of coursesFor(exam)) {
      expect(c.id.length).toBeLessThanOrEqual(ID_MAX.section);
      for (const u of c.units) { expect(u.id.length).toBeLessThanOrEqual(ID_MAX.skill); for (const t of u.topics) expect(t.id.length).toBeLessThanOrEqual(ID_MAX.topic); }
    }
  });
});

describe("difficulty levels", () => {
  const q = (difficulty: 1 | 2 | 3, style?: "exam") => ({ difficulty, style });
  it("matches by level, and exam style is its own level", () => {
    expect(levelOfQuestion(q(1))).toBe("easy"); expect(levelOfQuestion(q(2))).toBe("medium"); expect(levelOfQuestion(q(3))).toBe("hard"); expect(levelOfQuestion(q(3, "exam"))).toBe("exam");
    expect(matchesLevel(q(3, "exam"), "hard")).toBe(false); expect(matchesLevel(q(3, "exam"), "exam")).toBe(true);
    expect(matchesLevel(q(1), "mixed")).toBe(true); expect(matchesLevel(q(1), undefined)).toBe(true); expect(matchesLevel(q(2), "easy")).toBe(false);
    expect(LEVELS).toEqual(["mixed", "easy", "medium", "hard", "exam"]);
  });
  it("tells the writer what to make, and mixed sets cycle", () => {
    expect(specFor("easy")).toEqual({ difficulty: 1 }); expect(specFor("exam")).toEqual({ difficulty: 3, style: "exam" });
    expect([0, 1, 2, 3].map((i) => specFor("mixed", i).difficulty)).toEqual([1, 2, 2, 3]);
  });
  it("real exam style changes the prompt and is kept on the verified question", () => {
    const spec = { exam: "ap" as const, section: "ap-biology", skill: "u1", topic: "u1-2", count: 3, ...specFor("exam") };
    const p = buildGenPrompt(spec).user;
    expect(p).toMatch(/REAL EXAM STYLE/); expect(p).toMatch(/Topic 1\.2/);
    expect(buildGenPrompt({ ...spec, style: undefined, difficulty: 1 }).user).not.toMatch(/REAL EXAM STYLE/);
    const v = verifyQuestion({ stem: "A long enough question stem here?", passage: "Stimulus.", type: "mc", choices: ["a", "b", "c", "d"], answer: "B", explanation: "Because B is right, for this reason." }, spec, "B", "x");
    expect(v.ok && v.question.style).toBe("exam");
  });
  it("a level filter applies to what is already on the device", () => {
    expect(localPool({ exam: "sat", section: "math", skill: "algebra", level: "exam" })).toHaveLength(0);
    expect(localPool({ exam: "sat", section: "math", skill: "algebra", level: "easy" }).every((x) => x.difficulty === 1)).toBe(true);
  });
});

describe("detailed notes", () => {
  const good = { summary: "x".repeat(60), sections: [1, 2, 3].map((i) => ({ heading: `H${i}`, body: "y".repeat(80) })), keyIdeas: ["idea one", "idea two", "idea three", "idea four"].map((s) => s + " is here"), terms: [1, 2, 3, 4].map((i) => ({ term: `t${i}`, meaning: "meaning here" })), examples: [{ title: "e", body: "z".repeat(40) }], mistakes: ["mistake one here", "mistake two here"], howTested: ["tested one here", "tested two here"], selfCheck: ["check one here", "check two here", "check three here"] };
  it("accepts the full shape and rejects thin notes", () => {
    expect(notesSchema.safeParse(good).success).toBe(true);
    expect(notesSchema.safeParse({ ...good, sections: good.sections.slice(0, 1) }).success).toBe(false);
    expect(notesSchema.safeParse({ ...good, howTested: undefined }).success).toBe(false);
  });
  it("asks for a 5 on AP and for strategy on the other tests", () => {
    const ap = notesMessages("ap", { section: "AP Biology", skill: "Unit 1", topic: "Water", topicNum: "1.2" }, "en")[0].content;
    const sat = notesMessages("sat", { section: "Math", skill: "Algebra" }, "es")[0].content;
    expect(ap).toMatch(/earn a 5/); expect(ap).toMatch(/free-response/);
    expect(sat).toMatch(/steps to solve/); expect(sat).toMatch(/Spanish/);
  });
});
