// Sample data for demos and the competition video. Pure: it only builds the documents.
// The /demo page writes them to the device, and scripts/seed-demo-account.ts writes them to a real account.
// Everything is clearly labeled "Sample". The AI-found listings in the real app are never faked.
import { addDays, today } from "./dates";
import { BANK } from "./exam/bank";
import { estimate } from "./exam/engine";
import type { Answered, Attempt } from "./exam/types";
import { templatePlan, TEMPLATES } from "./plan-templates";
import type { Plan } from "./plan";
import type { Listing } from "./ai/finder";

export const DEMO_KEYS = [
  "profile", "saved-opportunities", "plans", "gpa-courses", "homework", "focus-log", "exam-attempts",
  "coach-chat", "finder-place", "prefs",
] as const;

function sampleAttempts(): Attempt[] {
  // Deterministic: the same demo every time. `rightEvery` controls how often an answer is right.
  const make = (daysAgo: number, mode: Attempt["mode"], take: number, rightEvery: number): Attempt => {
    const qs = [...BANK].filter((q) => q.exam === "sat").sort((a, b) => a.id.localeCompare(b.id)).filter((_, i) => i % Math.max(1, Math.floor(33 / take)) === 0).slice(0, take);
    const items: Answered[] = qs.map((q, i) => ({ qid: q.id, section: q.section, skill: q.skill, answer: q.type === "mc" ? (i % rightEvery === 0 ? q.answer : q.answer === "A" ? "B" : "A") : (i % rightEvery === 0 ? q.answer : "0"), correct: i % rightEvery === 0 }));
    const t = Date.now() - daysAgo * 86_400_000;
    return { id: `demo-${daysAgo}`, exam: "sat", mode, startedAt: t - 900_000, finishedAt: t, timed: false, items, unanswered: 0 };
  };
  return [make(9, "diagnostic", 16, 2), make(4, "section", 10, 2), make(1, "diagnostic", 16, 3)];
}

export function demoDocs(lang: "en" | "es" = "en"): Record<string, unknown> {
  const t = today();
  const listing = (n: number, title: string, org: string, category: Listing["category"], cost: Listing["cost"], extra: Partial<Listing>): Listing => ({
    id: `demo-${n}`, title, organization: org, description: "Sample data for the demo. Search in Find to see real, sourced results.", category, cost,
    costNote: null, grades: "6-8", dates: null, deadline: null, location: "Edinburg, TX", online: false, distance: null, transit: null,
    sourceUrl: `https://example.org/sample-${n}`, whyFits: null, scam: [], ...extra,
  });
  const saved = [
    { ...listing(1, "Sample: Beginner chess club", "Sample Public Library", "club", "free", { whyFits: "You picked chess as an interest.", deadline: "Rolling" }), savedAt: Date.now() - 3 * 3_600_000 },
    { ...listing(2, "Sample: Summer robotics camp", "Sample University", "camp", "paid", { costNote: "Scholarships may be available", grades: "7-9", deadline: "Apr 15", whyFits: "You like robotics and coding." }), savedAt: Date.now() - 26 * 3_600_000 },
    { ...listing(3, "Sample: Teen hospital volunteers", "Sample Health Center", "volunteer", "free", { grades: "9-12", whyFits: "Good first step toward medicine." }), savedAt: Date.now() - 50 * 3_600_000 },
  ];

  const chess = templatePlan(TEMPLATES.find((x) => x.id === "chess")!, lang, 5);
  const tick = (plan: Plan, n: number): Plan => { let left = n; return { ...plan, horizons: plan.horizons.map((h) => ({ ...h, steps: h.steps.map((s) => (left-- > 0 ? { ...s, done: true } : s)) })) }; };

  const hw = (title: string, cls: string, due: number, done = false) => ({ id: `demo-hw-${title}`, title, cls, due: addDays(t, due), done });
  const days = Array.from({ length: 7 }, (_, i) => addDays(t, i - 6));
  const minutes = [25, 50, 0, 75, 50, 100, 45];

  return {
    profile: { grade: 8, school: "Sample Middle School", interests: ["chess", "coding", "robotics", "medicine", "volunteering"] },
    "saved-opportunities": saved,
    plans: [tick(chess, 5)],
    "gpa-courses": [
      { id: "g1", name: "Pre-AP English", grade: "A", credits: 1, level: "honors", planned: false },
      { id: "g2", name: "Algebra I", grade: "B+", credits: 1, level: "regular", planned: false },
      { id: "g3", name: "Biology", grade: "A-", credits: 1, level: "honors", planned: false },
      { id: "g4", name: "Spanish II", grade: "A", credits: 1, level: "regular", planned: false },
      { id: "g5", name: "Geometry (next year)", grade: "A", credits: 1, level: "honors", planned: true },
    ],
    homework: [
      hw("Chapter 5 questions", "Biology", -1), hw("Essay outline", "English", 0), hw("Worksheet 3.2", "Algebra", 2),
      hw("Lab report", "Biology", 5), hw("Vocabulary quiz prep", "Spanish", 9), hw("Reading log", "English", -2, true),
    ],
    "focus-log": Object.fromEntries(days.map((d, i) => [d, minutes[i]])),
    "exam-attempts": sampleAttempts(),
    "coach-chat": [
      { role: "user", content: "Help me plan my summer in the Valley." },
      { role: "assistant", content: "Great goal. A few questions first:\n\n- What do you enjoy most: chess, robotics, or helping people?\n- How many hours a week do you have?\n\nTell me and I will turn it into a short plan." },
    ],
    "finder-place": "Edinburg, TX",
    prefs: { pinned: ["find/search", "grades/gpa", "focus/pomodoro"] },
  };
}

/** Quick sanity numbers shown on the /demo page. */
export const demoSummary = () => {
  const a = sampleAttempts().at(-1)!;
  return { score: estimate("sat", a.items).total, attempts: 3 };
};
