import { describe, expect, it } from "vitest";
import { DEMO_KEYS, demoDocs } from "../src/lib/demo";
import { BADGES, levelOf, streaks, totalXp, type Snapshot } from "../src/lib/progress";
import { collectItems, reminderFor } from "../src/lib/calendar";
import { dueCards } from "../src/lib/srs";
import { volunteerTotal, certStatus, monthSummary } from "../src/lib/career";
import { today } from "../src/lib/dates";

const docs = demoDocs("en");
const now = today();
const snap = (): Snapshot => ({
  now, homework: docs.homework as never, tasks: docs.todos as never, habits: docs.habits as never, focusLog: docs["focus-log"] as never, sessions: docs["study-sessions"] as never,
  routines: docs.routines as never, attempts: docs["exam-attempts"] as never, plans: docs.plans as never, savedCount: (docs["saved-opportunities"] as unknown[]).length,
  volunteer: docs["volunteer-hours"] as never, achievements: docs.achievements as never, certs: docs.certificates as never, moods: docs["mood-log"] as never, sleep: docs["sleep-log"] as never,
  reflections: docs.reflections as never, cards: docs.flashcards as never, drills: docs["math-drills"] as never,
});

describe("demo data", () => {
  it("has a document for every demo key, and each is small enough to sync (256 KB)", () => {
    for (const k of DEMO_KEYS) { expect(docs[k], k).toBeDefined(); expect(JSON.stringify(docs[k]).length, k).toBeLessThan(262144); }
    expect(Object.keys(docs).sort()).toEqual([...DEMO_KEYS].sort());
  });
  it("is the same every time it is built on the same day", () => {
    // The sample plan gets a fresh random id each time, so it is left out; everything else has fixed ids.
    const strip = (o: Record<string, unknown>) => JSON.stringify({ ...o, plans: undefined }, (k, v) => (k === "savedAt" || k === "startedAt" || k === "finishedAt" || k === "updated" ? 0 : v));
    expect(strip(demoDocs("en"))).toBe(strip(demoDocs("en")));
  });
  it("gives the progress tools something to show: a level above 2, a streak, and several badges", () => {
    const s = snap();
    expect(levelOf(totalXp(s)).level).toBeGreaterThanOrEqual(3);
    expect(streaks(s).current).toBeGreaterThanOrEqual(3);
    expect(BADGES.filter((b) => b.value(s) >= b.target).length).toBeGreaterThanOrEqual(6);
  });
  it("fills the calendar and reminders, with an opportunity deadline parsed from its text", () => {
    const items = collectItems({ saved: docs["saved-opportunities"] as never, homework: docs.homework as never, countdowns: docs.countdowns as never, now });
    expect(items.some((i) => i.kind === "opportunity")).toBe(true);
    expect(items.some((i) => i.kind === "homework") && items.some((i) => i.kind === "countdown")).toBe(true);
    expect(items.filter((i) => reminderFor(i.date, now)).length).toBeGreaterThanOrEqual(2);
  });
  it("flashcards have some due today and some later", () => {
    const cards = docs.flashcards as never as Parameters<typeof dueCards>[0];
    expect(dueCards(cards, now).length).toBeGreaterThan(0);
    expect(dueCards(cards, now).length).toBeLessThan(cards.length);
  });
  it("career and money samples add up sensibly", () => {
    expect(volunteerTotal(docs["volunteer-hours"] as never)).toBeGreaterThanOrEqual(10);
    expect((docs.certificates as never as Parameters<typeof certStatus>[0][]).map((c) => certStatus(c, now))).toEqual(["soon", "none"]);
    expect(monthSummary(docs.budget as never, now.slice(0, 7))).toMatchObject({ income: 220, spend: 55, save: 60, left: 105 });
  });
  it("every sample item is labeled so nobody mistakes it for real data", () => {
    for (const k of ["achievements", "certificates"] as const) for (const x of docs[k] as { title?: string; name?: string }[]) expect((x.title ?? x.name)!.startsWith("Sample:"), k).toBe(true);
    for (const x of docs["saved-opportunities"] as { title: string }[]) expect(x.title.startsWith("Sample:")).toBe(true);
  });
});
