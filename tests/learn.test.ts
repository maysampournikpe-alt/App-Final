import { describe, expect, it } from "vitest";
import { notesMessages, notesSchema } from "@/lib/ai/learn";
import { buildGenPrompt, topicOf } from "@/lib/exam/verify";

describe("study path prompts", () => {
  it("resolves topics for every exam and rejects unknown ids", () => {
    expect(topicOf("ap", "ap-biology", "u3")).toEqual({ section: "AP Biology", skill: "Unit 3: Cellular Energetics" });
    expect(topicOf("ap", "apush", "p5")?.section).toBe("AP US History");
    expect(topicOf("sat", "math", "algebra")).toEqual({ section: "Math", skill: "Algebra" });
    expect(topicOf("act", "science", "interpretation-of-data")?.skill).toBe("Interpretation of data");
    expect(topicOf("tsi", "elar", "conventions")).not.toBeNull();
    expect(topicOf("ap", "ap-biology", "u99")).toBeNull();
    expect(topicOf("ap", "nope", "u1")).toBeNull();
    expect(topicOf("sat", "math", "u1")).toBeNull();
  });
  it("question prompts name the course and unit, ask for original work, and fit the exam", () => {
    const ap = buildGenPrompt({ exam: "ap", section: "ap-chemistry", skill: "u7", count: 4, difficulty: 2 });
    expect(ap.user).toMatch(/AP Chemistry/); expect(ap.user).toMatch(/Equilibrium/);
    expect(ap.system).toMatch(/ORIGINAL/); expect(ap.system).toMatch(/Course and Exam Description/); expect(ap.system).toMatch(/never refer to an image/i);
    expect(buildGenPrompt({ exam: "act", section: "math", skill: "algebra", count: 4, difficulty: 1 }).system).toMatch(/ACT/);
    expect(buildGenPrompt({ exam: "tsi", section: "math", skill: "algebraic", count: 4, difficulty: 1 }).system).toMatch(/TSIA2/);
    expect(buildGenPrompt({ exam: "sat", section: "rw", skill: "craft-structure", count: 4, difficulty: 1 }).system).toMatch(/digital SAT/);
  });
  it("notes prompts ask for JSON, the right language and honesty about uncertain facts", () => {
    const m = notesMessages("ap", { section: "AP Psychology", skill: "Unit 4: Learning" }, "es");
    expect(m[0].content).toMatch(/NOTES_JSON/); expect(m[0].content).toMatch(/Spanish/); expect(m[0].content).toMatch(/leave it out instead of guessing/);
    expect(m[1].content).toContain("AP Psychology"); expect(m[1].content).toContain("Unit 4: Learning");
    expect(notesMessages("sat", { section: "Math", skill: "Algebra" }, "en")[0].content).toMatch(/digital SAT/);
  });
  it("accepts well-formed notes and rejects thin ones", () => {
    const good = { summary: "A summary that is long enough to count as a real summary of the lesson.", keyIdeas: ["Idea one here.", "Idea two here.", "Idea three here."], terms: [{ term: "a", meaning: "meaning a" }, { term: "b", meaning: "meaning b" }, { term: "c", meaning: "meaning c" }], example: null, mistakes: ["A mistake students make."], selfCheck: ["Can I explain it?", "Can I give one example?"] };
    expect(notesSchema.safeParse(good).success).toBe(true);
    expect(notesSchema.safeParse({ ...good, keyIdeas: ["x"] }).success).toBe(false);
    expect(notesSchema.safeParse({ ...good, summary: "short" }).success).toBe(false);
  });
});
