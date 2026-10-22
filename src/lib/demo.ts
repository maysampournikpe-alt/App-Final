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
import type { Achievement, BudgetLine, Certificate, CreditCourse, Mood, Sleep, VolunteerEntry } from "./career";
import type { DrillScore } from "./drills";
import type { Goal } from "./finance";
import type { Habit } from "./habits";
import { periodKey, type Reflections } from "./reflect";
import type { RoutineDoc } from "./routines";
import type { SmartGoal } from "./smart";
import type { Card } from "./srs";
import type { Session as StudySession } from "./study";
import type { Task } from "./tasks";

export const DEMO_KEYS = [
  "profile", "saved-opportunities", "plans", "gpa-courses", "homework", "focus-log", "exam-attempts",
  "coach-chat", "finder-place", "prefs",
  "habits", "study-sessions", "volunteer-hours", "achievements", "certificates", "flashcards", "todos", "countdowns", "routines", "reflections",
  "mood-log", "sleep-log", "budget", "savings-goals", "my-why", "college-credits", "math-drills", "smart-goals", "cornell-notes", "avatar",
  "school-events", "weekly-blocks", "class-schedule", "reading-log", "applications", "monthly-challenges", "skills-radar", "time-audit", "finder-history", "saved-searches", "goal-ladder", "kanban",
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


/** Sample data for the tools added after the first demo: habits, study log, volunteering, flashcards, budget and more. All of it is labeled "Sample". */
function moreDocs(t: string): Record<string, unknown> {
  const ago = (n: number) => addDays(t, -n);
  const habit = (id: string, name: string, missed: number[]): Habit => ({ id, name, created: ago(30), done: Array.from({ length: 12 }, (_, i) => ago(i)).filter((_, i) => !missed.includes(i)).sort() });
  const sessions: StudySession[] = [
    [0, "Algebra", 45, 4], [0, "Biology", 30, 5], [1, "English", 40, 3], [2, "Algebra", 35, 4], [3, "Biology", 50, 4], [5, "Spanish", 25, 3],
    [6, "Algebra", 60, 5], [8, "English", 30, 4], [9, "Biology", 45, 3], [11, "Algebra", 40, 4], [13, "Spanish", 20, 3],
  ].map(([d, subject, minutes, focus], i) => ({ id: `demo-ses-${i}`, date: ago(d as number), subject: subject as string, minutes: minutes as number, focus: focus as 1 | 2 | 3 | 4 | 5 }));
  const volunteer: VolunteerEntry[] = [
    { id: "demo-v1", date: ago(20), org: "Sample Food Bank", hours: 4.5, supervisor: "Sample Supervisor", contact: "555-0100" },
    { id: "demo-v2", date: ago(9), org: "Sample Public Library", hours: 3, supervisor: "", contact: "" },
    { id: "demo-v3", date: ago(2), org: "Sample Food Bank", hours: 4.5, supervisor: "Sample Supervisor", contact: "555-0100" },
  ];
  const achievements: Achievement[] = [
    { id: "demo-a1", kind: "award", title: "Sample: 2nd place, district chess tournament", date: ago(40), note: "Won 5 of 6 rounds." },
    { id: "demo-a2", kind: "activity", title: "Sample: Robotics club member", date: ago(120), note: "Built and programmed a sorting robot with a team of four." },
    { id: "demo-a3", kind: "leadership", title: "Sample: Student council representative", date: ago(75), note: "" },
    { id: "demo-a4", kind: "result", title: "Sample: A honor roll, fall semester", date: ago(60), note: "" },
    { id: "demo-a5", kind: "project", title: "Sample: School recycling program", date: ago(15), note: "Set up bins in 12 classrooms." },
  ];
  const certificates: Certificate[] = [
    { id: "demo-c1", name: "Sample: CPR and First Aid", issuer: "Sample Red Cross chapter", earned: ago(300), expires: addDays(t, 40) },
    { id: "demo-c2", name: "Sample: Microsoft Office Specialist", issuer: "Sample Testing Center", earned: ago(90), expires: "" },
  ];
  const card = (i: number, front: string, back: string, reps: number, dueIn: number): Card => ({ id: `demo-card-${i}`, front, back, deck: "Biology", due: addDays(t, dueIn), interval: reps ? Math.max(1, dueIn + 1) : 0, ease: 2.5, reps, lapses: 0 });
  const flashcards: Card[] = [
    card(1, "Mitochondria", "Makes energy (ATP) for the cell", 4, 6), card(2, "Nucleus", "Holds the cell's DNA", 3, 3), card(3, "Ribosome", "Builds proteins", 2, 0), card(4, "Chloroplast", "Where photosynthesis happens", 1, 0),
    card(5, "Cell membrane", "Controls what enters and leaves", 5, 12), card(6, "Osmosis", "Water moving across a membrane", 0, 0), card(7, "Diffusion", "Movement from high to low concentration", 0, 0), card(8, "Enzyme", "A protein that speeds up a reaction", 2, 2),
  ];
  const task = (i: number, title: string, urgent: boolean, important: boolean, top = false, done = false): Task => ({ id: `demo-t${i}`, title, urgent, important, top, done, created: ago(2) });
  const routines: RoutineDoc = {
    steps: { morning: [{ id: "m1", text: "Drink water" }, { id: "m2", text: "Eat breakfast" }, { id: "m3", text: "Check today's homework" }, { id: "m4", text: "Pack my bag" }], evening: [{ id: "e1", text: "Pack my bag for tomorrow" }, { id: "e2", text: "Write tomorrow's top 3" }, { id: "e3", text: "Phone on the charger" }] },
    done: { [t]: ["m1", "m2", "m3"], [ago(1)]: ["m1", "m2", "m3", "m4", "e1", "e2", "e3"] },
  };
  const reflections: Reflections = {
    [periodKey("weekly", ago(7))]: { answers: { wins: "Finished my biology lab report early.\nPracticed SAT math three times.", hard: "Stayed up too late twice.", next: "Study for the Spanish quiz\nSubmit the robotics camp application\nVolunteer on Saturday" }, rating: 4, updated: Date.now() },
  };
  const moods: Mood[] = [[0, 4], [1, 3], [2, 4], [3, 5], [5, 3]].map(([d, m]) => ({ date: ago(d), mood: m as Mood["mood"], note: "" }));
  const sleep: Sleep[] = [[1, "22:30", "06:30"], [2, "23:00", "06:30"], [3, "22:15", "06:30"], [4, "23:30", "06:45"]].map(([d, bed, wake]) => ({ date: ago(d as number), bed: bed as string, wake: wake as string }));
  const month = t.slice(0, 7);
  const budget: BudgetLine[] = [
    { id: "demo-b1", month, kind: "income", label: "Sample: weekend job", amount: 180 }, { id: "demo-b2", month, kind: "income", label: "Sample: birthday gift", amount: 40 },
    { id: "demo-b3", month, kind: "spend", label: "Sample: snacks and movies", amount: 55 }, { id: "demo-b4", month, kind: "save", label: "Sample: laptop fund", amount: 60 },
  ];
  const goals: Goal[] = [{ id: "demo-g1", name: "Sample: laptop for school", target: 400, saved: 175, by: addDays(t, 75) }];
  const credits: CreditCourse[] = [{ id: "demo-cr1", name: "Sample: College Algebra", hours: 3, term: "Fall", source: "Sample Community College" }, { id: "demo-cr2", name: "Sample: English Composition I", hours: 3, term: "Fall", source: "Sample Community College" }];
  const drills: DrillScore[] = [{ op: "×", max: 12, right: 18, total: 20, seconds: 74, date: ago(4) }, { op: "×", max: 12, right: 20, total: 20, seconds: 66, date: ago(1) }];
  const smart: SmartGoal[] = [{ id: "demo-s1", specific: "raise my SAT math score by 60 points", measurable: "I score 650 or higher on the full practice test", achievable: "I already practice three times a week", relevant: "it helps me get into the programs I want", by: addDays(t, 60), created: ago(5) }];

  return {
    habits: [habit("demo-h1", "Sample: read 20 minutes", [4, 9]), habit("demo-h2", "Sample: review flashcards", [1, 2, 6, 10])],
    "study-sessions": sessions, "volunteer-hours": volunteer, achievements, certificates, flashcards,
    todos: [task(1, "Finish the lab report", true, true, true), task(2, "Study for the Spanish quiz", false, true, true), task(3, "Email the robotics coach", true, false), task(4, "Organize my backpack", false, false), task(5, "Read chapter 6", false, true, false, true)],
    countdowns: [{ id: "demo-cd1", name: "Sample: SAT test day", date: addDays(t, 45) }, { id: "demo-cd2", name: "Sample: robotics camp deadline", date: addDays(t, 12) }],
    routines, reflections, "mood-log": moods, "sleep-log": sleep, budget, "savings-goals": goals,
    "my-why": "I want to be the first in my family to finish college so I can help my community.",
    "college-credits": credits, "math-drills": drills, "smart-goals": smart,
    "cornell-notes": [{ id: "demo-cn1", title: "Sample: Photosynthesis", cls: "Biology", date: ago(3), cues: "What are the two stages?\nWhere does each happen?", notes: "Light reactions happen in the thylakoids.\nThe Calvin cycle happens in the stroma and makes sugar.", summary: "Plants turn light energy into sugar in two connected stages." }],
    "school-events": [
      { id: "demo-ev1", title: "Sample: Fall break", kind: "break", date: addDays(t, 14), end: addDays(t, 18) },
      { id: "demo-ev2", title: "Sample: Biology unit test", kind: "test", date: addDays(t, 6) },
      { id: "demo-ev3", title: "Sample: Science project due", kind: "project", date: addDays(t, 9) },
      { id: "demo-ev4", title: "Sample: Early release day", kind: "early", date: addDays(t, 3) },
    ],
    "weekly-blocks": [
      { id: "demo-b1", title: "Sample: Chess club", day: 1, start: "16:00", end: "17:30", kind: "practice" },
      { id: "demo-b2", title: "Sample: Chess club", day: 3, start: "16:00", end: "17:30", kind: "practice" },
      { id: "demo-b3", title: "Sample: Study block", day: 2, start: "18:00", end: "19:00", kind: "study" },
    ],
    "class-schedule": { kind: "weekdays", anchor: null, classes: [
      { id: "demo-c1", name: "Sample: Algebra I", room: "204", start: "08:00", end: "08:50", days: ["mon", "tue", "wed", "thu", "fri"], bring: "calculator, binder" },
      { id: "demo-c2", name: "Sample: Biology", room: "112", start: "09:00", end: "09:50", days: ["mon", "tue", "wed", "thu", "fri"], bring: "lab notebook" },
    ] },
    "reading-log": [{ id: "demo-r1", date: ago(1), book: "Sample: Holes", pages: 25, minutes: 30 }, { id: "demo-r2", date: ago(3), book: "Sample: Holes", pages: 30, minutes: 35 }],
    applications: [{ id: "demo-ap1", name: "Sample: Summer robotics camp", kind: "program", deadline: addDays(t, 12), status: "working", done: [true, false, false, true, false, false], notes: "" }],
    "monthly-challenges": [{ id: "demo-mc1", kind: "volunteer", target: 8 }, { id: "demo-mc2", kind: "study", target: 12 }],
    "skills-radar": { leadership: 3, academics: 4, service: 3, arts: 1, athletics: 2 },
    "time-audit": [{ id: "demo-ta1", date: ago(1), act: "Sample: homework", cat: "homework", min: 90 }, { id: "demo-ta2", date: ago(1), act: "Sample: video games", cat: "screens", min: 60 }, { id: "demo-ta3", date: ago(2), act: "Sample: chess club", cat: "activities", min: 90 }],
    "finder-history": [{ q: "chess clubs", place: "Edinburg, TX", at: 2 }, { q: "robotics camps", place: "Edinburg, TX", at: 1 }],
    "saved-searches": [{ id: "demo-ss1", q: "teen volunteer opportunities" }],
    "goal-ladder": { goal: "Sample: study medicine", rungs: [{ id: "demo-l1", text: "Raise my science grade to an A", done: true }, { id: "demo-l2", text: "Join a health science club", done: false }] },
    kanban: [{ id: "demo-k1", text: "Sample: pick a topic", col: 2 }, { id: "demo-k2", text: "Sample: make the poster", col: 1 }, { id: "demo-k3", text: "Sample: practice the talk", col: 0 }],
    avatar: { emblem: "mountain", tint: "marigold" },
  };
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
    { ...listing(3, "Sample: Teen hospital volunteers", "Sample Health Center", "volunteer", "free", { grades: "9-12", deadline: addDays(t, 6), whyFits: "Good first step toward medicine." }), savedAt: Date.now() - 50 * 3_600_000 },
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
    ...moreDocs(t),
  };
}

/** Quick sanity numbers shown on the /demo page. */
export const demoSummary = () => {
  const a = sampleAttempts().at(-1)!;
  return { score: estimate("sat", a.items).total, attempts: 3 };
};
