import { describe, expect, it } from "vitest";
import { reviewQueue } from "@/lib/review";
import { topicStats } from "@/lib/exam/engine";
import type { Attempt } from "@/lib/exam/types";

const att = (items: { topic?: string; ok: boolean }[]): Attempt => ({
  id: "a", exam: "ap", mode: "section", startedAt: 0, finishedAt: 1,
  items: items.map((i, n) => ({ qid: `q${n}`, section: "bio", skill: "u1", topic: i.topic, answer: "A", correct: i.ok })),
} as unknown as Attempt);

describe("topicStats", () => {
  it("groups by topic, needs 2 questions, weakest first", () => {
    const s = topicStats([att([{ topic: "u1-1", ok: true }, { topic: "u1-1", ok: false }, { topic: "u1-2", ok: false }, { topic: "u1-3", ok: false }, { topic: "u1-3", ok: false }, { ok: true }])]);
    expect(s.map((x) => x.topic)).toEqual(["u1-3", "u1-1"]);
    expect(s[1].pct).toBe(0.5);
  });
});

describe("reviewQueue", () => {
  const ids = ["u1-1", "u1-2", "u1-3", "u1-4"];
  const prog: Record<string, { best?: number; tries?: number; at?: string }> = {
    "u1-1": { best: 0.4, tries: 2, at: "2026-10-22" },
    "u1-3": { best: 0.9, tries: 1, at: "2026-10-01" },
    "u1-4": { best: 0.8, tries: 1, at: "2026-10-22" },
  };
  it("orders retry, weak, then refresh without duplicates", () => {
    const stats = [{ exam: "ap" as const, section: "bio", skill: "u1", topic: "u1-2", correct: 1, total: 4, pct: 0.25 }, { exam: "ap" as const, section: "bio", skill: "u1", topic: "u1-1", correct: 0, total: 3, pct: 0 }];
    const q = reviewQueue({ topicIds: ids, progOf: (i) => prog[i], stats, today: "2026-10-23" });
    expect(q.map((x) => [x.topicId, x.kind])).toEqual([["u1-1", "retry"], ["u1-2", "weak"], ["u1-3", "refresh"]]);
    expect(q[2].days).toBe(22);
  });
  it("is empty for a new student and ignores topics outside the course", () => {
    expect(reviewQueue({ topicIds: ids, progOf: () => undefined, stats: [], today: "2026-10-23" })).toEqual([]);
    const stats = [{ exam: "ap" as const, section: "bio", skill: "u9", topic: "u9-1", correct: 0, total: 3, pct: 0 }];
    expect(reviewQueue({ topicIds: ids, progOf: () => undefined, stats, today: "2026-10-23" })).toEqual([]);
  });
});
