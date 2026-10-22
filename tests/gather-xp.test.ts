import { describe, expect, it } from "vitest";
import { gather, localPool } from "@/lib/exam/gather";
import { addXp, lessonXp, NO_XP, streakOf } from "@/lib/xp";
import { youtubeSearch, khanSearch, lessonQuery } from "@/lib/links";
import type { Question } from "@/lib/exam/types";

const mk = (id: string, o: Partial<Question> = {}): Question => ({ id, exam: "ap", section: "ap-biology", skill: "u1", difficulty: 2, type: "mc", stem: "Stem " + id + " which is long enough", choices: ["a", "b", "c", "d"], answer: "A", explanation: "Because A is right.", source: "generated", ...o });
const identity = <T,>(a: T[]) => a;

describe("gathering quiz questions", () => {
  it("uses the checked bank first and only asks the server for the shortfall", async () => {
    const calls: object[] = [];
    const r = await gather({ exam: "ap", section: "apstats", needs: [{ skill: "u1", n: 5 }], lang: "en", shuffle: identity,
      fetchQuiz: async (b) => { calls.push(b); return { ok: true, questions: [mk("ai-1", { section: "apstats" }), mk("ai-2", { section: "apstats" }), mk("ai-3", { section: "apstats" })] }; } });
    expect(r.questions).toHaveLength(5);
    expect(new Set(r.questions.map((q) => q.id)).size).toBe(5);
    expect(calls).toHaveLength(1);
    expect((calls[0] as { count: number }).count).toBe(2); // apstats unit 1 has 3 starter questions
    expect(r.missing).toBe(0);
  });
  it("never asks the server for fewer than 2 questions, but still returns only what was needed", async () => {
    const counts: number[] = [];
    const r = await gather({ exam: "ap", section: "ap-biology", needs: [{ skill: "u3", n: 1 }], lang: "en", shuffle: identity,
      fetchQuiz: async (b) => { counts.push((b as { count: number }).count); return { ok: true, questions: [mk("ai-a", { skill: "u3" }), mk("ai-b", { skill: "u3" })] }; } });
    expect(counts).toEqual([2]); expect(r.questions).toHaveLength(1);
  });
  it("makes no request when the device already has enough", async () => {
    let n = 0;
    const r = await gather({ exam: "ap", section: "apstats", needs: [{ skill: "u1", n: 3 }], lang: "en", shuffle: identity, fetchQuiz: async () => { n++; return { ok: false, error: "x" }; } });
    expect(n).toBe(0); expect(r.questions).toHaveLength(3);
  });
  it("reports what is missing when the AI fails, and keeps what it has", async () => {
    const r = await gather({ exam: "ap", section: "ap-biology", needs: [{ skill: "u1", n: 4 }, { skill: "u2", n: 4 }], lang: "en", shuffle: identity, fetchQuiz: async () => ({ ok: false, error: "unavailable" }) });
    expect(r.questions).toHaveLength(0); expect(r.missing).toBe(8); expect(r.error).toBe("unavailable");
  });
  it("topic lessons ask for the topic and ignore untagged unit questions", async () => {
    const bodies: Record<string, unknown>[] = [];
    await gather({ exam: "ap", section: "apstats", needs: [{ skill: "u1", topic: "u1-3", n: 3 }], lang: "es", shuffle: identity, fetchQuiz: async (b) => { bodies.push(b as Record<string, unknown>); return { ok: true, questions: [] }; } });
    expect(bodies[0]).toMatchObject({ topic: "u1-3", kind: "quiz", lang: "es", section: "apstats", skill: "u1", count: 3 });
    expect(localPool({ exam: "ap", section: "apstats", skill: "u1", topic: "u1-3" })).toHaveLength(0);
  });
  it("never repeats a question across lessons and drops bad shapes", async () => {
    const dup = mk("ai-dup", { section: "ap-chemistry", skill: "u1" });
    const bad = { ...mk("ai-bad", { section: "ap-chemistry", skill: "u1" }), choices: ["only", "two"] };
    const r = await gather({ exam: "ap", section: "ap-chemistry", needs: [{ skill: "u1", n: 2 }, { skill: "u1", n: 2 }], lang: "en", shuffle: identity, fetchQuiz: async () => ({ ok: true, questions: [dup, bad as Question] }) });
    expect(r.questions.map((q) => q.id)).toEqual(["ai-dup"]);
  });
});

describe("xp and streaks", () => {
  it("awards points for notes, right answers, passing and mastering once", () => {
    expect(lessonXp({ firstNotes: true, right: 4, n: 5, wasPassed: false, nowPassed: true, wasMastered: false, nowMastered: false })).toBe(10 + 20 + 20);
    expect(lessonXp({ firstNotes: false, right: 5, n: 5, wasPassed: true, nowPassed: true, wasMastered: false, nowMastered: true })).toBe(25 + 15);
    expect(lessonXp({ firstNotes: false, right: 0, n: 5, wasPassed: false, nowPassed: false, wasMastered: false, nowMastered: false })).toBe(0);
  });
  it("adds xp, records each active day once and counts the streak", () => {
    let d = addXp(NO_XP, 30, "2026-10-20"); d = addXp(d, 10, "2026-10-21"); d = addXp(d, 5, "2026-10-22"); d = addXp(d, 5, "2026-10-22");
    expect(d.xp).toBe(50); expect(d.days).toEqual(["2026-10-20", "2026-10-21", "2026-10-22"]);
    expect(streakOf(d.days, "2026-10-22")).toBe(3);
    expect(streakOf(d.days, "2026-10-23")).toBe(3); // yesterday still counts until tonight
    expect(streakOf(d.days, "2026-10-25")).toBe(0);
    expect(addXp(NO_XP, -5, "2026-10-22").xp).toBe(0);
  });
});

describe("video links", () => {
  it("builds search links, not made-up video addresses", () => {
    const q = lessonQuery("AP Biology", "Structure of Water and Hydrogen Bonding");
    expect(q).toBe("AP Biology Structure of Water and Hydrogen Bonding");
    expect(youtubeSearch(q)).toBe("https://www.youtube.com/results?search_query=AP%20Biology%20Structure%20of%20Water%20and%20Hydrogen%20Bonding");
    expect(khanSearch(q)).toMatch(/^https:\/\/www\.khanacademy\.org\/search\?page_search_query=/);
  });
});
