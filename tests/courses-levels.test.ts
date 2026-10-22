import { describe, expect, it } from "vitest";
import { coursesFor } from "@/lib/exam/courses";
import { EXAMS } from "@/lib/exam/config";
import { LEVELS, levelOfQuestion, matchesLevel, specFor } from "@/lib/exam/levels";
import { buildGenPrompt, buildReviewPrompt, parseReview, topicOf, verifyQuestion } from "@/lib/exam/verify";
import { AP_COURSES } from "@/lib/exam/ap";
import { AP_PROFILES, AP_TOPIC_BRIEFS, AP_UNIT_BRIEFS } from "@/data/ap/briefs";
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
        for (const t of u.topics) expect((t.cover ?? "").length).toBeGreaterThan(60); // every test-prep topic has a "must cover" brief
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
    const v = verifyQuestion({ stem: "A long enough question stem here?", passage: "Stimulus.", type: "mc", choices: ["a", "b", "c", "d"], answer: "B", explanation: "Because B is right, for this reason." }, spec, "B", "x", "in");
    expect(v.ok && v.question.style).toBe("exam");
    expect(v.ok && v.question.scoped).toBe(true);
  });
  it("a level filter applies to what is already on the device", () => {
    expect(localPool({ exam: "sat", section: "math", skill: "algebra", level: "exam" })).toHaveLength(0);
    expect(localPool({ exam: "sat", section: "math", skill: "algebra", level: "easy" }).every((x) => x.difficulty === 1)).toBe(true);
  });
});

describe("review keeps questions on their course and topic, and correct", () => {
  const item = { stem: "A long enough question stem here?", passage: "Stimulus.", type: "mc" as const, choices: ["a", "b", "c", "d"], answer: "B", explanation: "Because B is right, for this reason." };
  const spec = { exam: "ap" as const, section: "ap-biology", skill: "u1", topic: "u1-1", count: 2, difficulty: 2 as const };
  it("rejects out-of-scope, inaccurate, unanswered and unchecked questions, and accepts good ones", () => {
    expect(verifyQuestion(item, spec, "B", "x", "in").ok).toBe(true);
    const out = verifyQuestion(item, spec, "B", "x", "out"); expect(!out.ok && out.reason).toMatch(/out of scope/);
    const bad = verifyQuestion(item, spec, "B", "x", "inaccurate"); expect(!bad.ok && bad.reason).toMatch(/error or an unfair/);
    const none = verifyQuestion(item, spec, "B", "x", null); expect(!none.ok && none.reason).toMatch(/no answer/);
  });
  it("the reviewer prompt names the course, unit and topic, the course profile and the key", () => {
    const p = buildReviewPrompt(spec, item);
    expect(p.user).toMatch(/AP Biology/); expect(p.user).toMatch(/Topic 1\.1/); expect(p.user).toMatch(/Key: B/);
    expect(p.user).toMatch(/Never in this course: AP Chemistry content/); expect(p.user).toMatch(/hydrogen bonds/);
    expect(p.system).toMatch(/no ideas from another course/); expect(p.system).toMatch(/ACCURATE/);
  });
  it("reads both verdict lines, and either one can reject", () => {
    expect(parseReview("fine\nSCOPE: IN\nACCURATE: YES")).toBe("in");
    expect(parseReview("uses colligative properties\nSCOPE: OUT\nACCURATE: YES")).toBe("out");
    expect(parseReview("the sign is wrong\nSCOPE: IN\nACCURATE: NO")).toBe("inaccurate");
    expect(parseReview("SCOPE: IN")).toBeNull(); expect(parseReview("no verdict")).toBeNull();
    expect(parseReview("SCOPE: IN maybe\nSCOPE: OUT\nACCURATE: YES")).toBe("out");
  });
  it("the writer is told to stay in scope, be accurate, avoid what the course excludes and skip sibling topics", () => {
    const u = buildGenPrompt(spec);
    expect(u.system).toMatch(/STAY IN SCOPE/); expect(u.system).toMatch(/SCIENCE AND FACT ACCURACY/); expect(u.system).toMatch(/enthalpy of vaporization is positive/);
    expect(u.user).toMatch(/NEVER use or test: AP Chemistry content/); expect(u.user).toMatch(/must NOT test: .*1\.2/); expect(u.user).toMatch(/What this topic covers.*hydrogen bonds/s);
  });
});

describe("every AP course has a profile and every unit has a brief", () => {
  it("profiles exist for all courses", () => { for (const c of AP_COURSES) { expect(AP_PROFILES[c.en]?.about.length, c.en).toBeGreaterThan(80); expect(AP_PROFILES[c.en]?.avoid.length, c.en).toBeGreaterThan(20); } });
  it("unit briefs line up with the units and each topic gets a brief", () => {
    for (const c of AP_COURSES) {
      expect(AP_UNIT_BRIEFS[c.en]?.length, c.en).toBe(c.units.length);
      for (const u of c.units) {
        const unit = topicOf("ap", c.id, u.id)!; expect(unit.cover?.length, `${c.en} unit ${u.no}`).toBeGreaterThan(60); expect(unit.about?.length, c.en).toBeGreaterThan(80);
        for (const t of u.topics) { const r = topicOf("ap", c.id, u.id, t.id)!; expect(r.cover?.length, `${c.en} ${t.num}`).toBeGreaterThan(60); expect(r.avoid?.length, c.en).toBeGreaterThan(20); }
      }
    }
  });
  it("topic briefs line up topic for topic in the science courses", () => {
    for (const [name, units] of Object.entries(AP_TOPIC_BRIEFS)) {
      const c = AP_COURSES.find((x) => x.en === name)!; expect(units.length, name).toBe(c.units.length);
      c.units.forEach((u, i) => expect(units[i].length, `${name} unit ${u.no}`).toBe(u.topics.length));
    }
  });
  it("AP biology 1.1 is held to biology, not chemistry", () => {
    const t = topicOf("ap", "ap-biology", "u1", "u1-1")!;
    expect(t.cover).toMatch(/cohesion/i); expect(t.cover).toMatch(/Not tested: enthalpy/); expect(t.avoid).toMatch(/enthalpy/i); expect(t.avoid).toMatch(/HF/);
  });
});

describe("detailed notes", () => {
  const good = { summary: "x".repeat(60), sections: [1, 2, 3].map((i) => ({ heading: `H${i}`, body: "y".repeat(80) })), keyIdeas: ["idea one", "idea two", "idea three", "idea four"].map((s) => s + " is here"), terms: [1, 2, 3, 4].map((i) => ({ term: `t${i}`, meaning: "meaning here" })), examples: [{ title: "e", body: "z".repeat(40) }], mistakes: ["mistake one here", "mistake two here"], howTested: ["tested one here", "tested two here"], selfCheck: ["check one here", "check two here", "check three here"] };
  it("accepts the full shape and rejects thin notes", () => {
    expect(notesSchema.safeParse(good).success).toBe(true);
    expect(notesSchema.safeParse({ ...good, sections: good.sections.slice(0, 1) }).success).toBe(false);
    expect(notesSchema.safeParse({ ...good, howTested: undefined }).success).toBe(false);
  });
  it("sends the must-cover brief and the unit's topic list to the AI", () => {
    const ref = topicOf("sat", "rw", "standard-english", "standard-english-1")!;
    const topicMsg = notesMessages("sat", ref, "en");
    expect(topicMsg[1].content).toMatch(/The notes must cover: .*comma splices/);
    expect(topicMsg[0].content).toMatch(/Test-prep rules/); expect(topicMsg[0].content).toMatch(/3 or 4 worked examples/);
    const unit = notesMessages("sat", topicOf("sat", "math", "algebra")!, "en");
    expect(unit[1].content).toMatch(/walk through all of them: 1\.1 Linear equations in one variable/);
    expect(buildGenPrompt({ exam: "sat", section: "rw", skill: "standard-english", topic: "standard-english-1", count: 3, difficulty: 2 }).user).toMatch(/What this topic covers/);
  });
  it("asks for a 5 on AP and for strategy on the other tests", () => {
    const ap = notesMessages("ap", { section: "AP Biology", skill: "Unit 1", topic: "Water", topicNum: "1.2" }, "en")[0].content;
    const sat = notesMessages("sat", { section: "Math", skill: "Algebra" }, "es")[0].content;
    expect(ap).toMatch(/earn a 5/); expect(ap).toMatch(/free-response/);
    expect(sat).toMatch(/exact numbered method/); expect(sat).toMatch(/Spanish/);
  });
});
