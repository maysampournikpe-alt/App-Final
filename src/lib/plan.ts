import { z } from "zod";

export type Horizon = "week" | "month" | "year";
export const HORIZONS: Horizon[] = ["week", "month", "year"];

export interface PlanStep { id: string; text: string; done: boolean }
export interface Plan {
  id: string;
  title: string;
  goal: string;
  summary: string;
  hoursPerWeek: number;
  searchIdeas: string[];
  horizons: { horizon: Horizon; steps: PlanStep[] }[];
  createdAt: number;
  source: "ai" | "template";
}
export const NO_PLANS: Plan[] = [];
export const PLANS_KEY = "plans";

export const planRequestSchema = z.object({
  goal: z.string().trim().min(3).max(200),
  hoursPerWeek: z.number().min(1).max(40).default(5),
  grade: z.number().int().min(5).max(12).nullable().default(null),
  lang: z.enum(["en", "es"]).default("en"),
  adjust: z.object({ instruction: z.string().trim().min(3).max(300), plan: z.string().max(8000) }).optional(),
});
export type PlanRequest = z.infer<typeof planRequestSchema>;

const modelPlan = z.object({
  title: z.string().min(2).max(120),
  summary: z.string().max(400).default(""),
  searchIdeas: z.array(z.string().max(80)).max(5).default([]),
  horizons: z.array(z.object({ horizon: z.enum(["week", "month", "year"]), steps: z.array(z.string().min(2).max(220)).min(1).max(8) })).min(1).max(3),
});

export function buildPlanPrompt(req: PlanRequest): { system: string; user: string } {
  const system = [
    "You make realistic, encouraging goal plans for students aged 11 to 18 in the Rio Grande Valley of South Texas.",
    "A plan has up to three horizons: week (what to do in the next 7 days), month (the next 4 weeks), year (the next 12 months).",
    "Each step is one concrete action a student can do and check off, written in plain words, under 30 words.",
    "Give 3 to 6 steps per horizon. Fit the work to the hours per week the student has. Do not overload them.",
    "Never invent specific events, dates, deadlines, organizations or links. When a step needs one, tell the student to search for it, and put a short search phrase in searchIdeas (3 to 5 phrases).",
    "Everything must be safe and appropriate for minors. Do not suggest anything illegal or unsafe.",
    "Reply with ONLY one JSON object, no markdown: " +
      '{"title":"","summary":"","searchIdeas":[""],"horizons":[{"horizon":"week","steps":[""]},{"horizon":"month","steps":[""]},{"horizon":"year","steps":[""]}]}',
  ].join("\n");
  const base = [
    `Goal: ${req.goal}`,
    `Hours per week available: ${req.hoursPerWeek}`,
    req.grade ? `Grade: ${req.grade}` : "",
    `Write in ${req.lang === "es" ? "Spanish (natural, South Texas)" : "English"}.`,
  ].filter(Boolean);
  if (req.adjust) base.push("CURRENT PLAN (JSON):", req.adjust.plan, `The student asks to change it: "${req.adjust.instruction}". Return the full updated plan in the same JSON shape. Keep steps that still make sense.`);
  return { system, user: base.join("\n") };
}

/** Validates the model's JSON, caps sizes, and keeps ticked steps ticked when the text is unchanged. */
export function toPlan(raw: unknown, req: { goal: string; hoursPerWeek: number }, previous?: Plan): Plan | null {
  const p = modelPlan.safeParse(raw);
  if (!p.success) return null;
  const done = new Set(previous?.horizons.flatMap((h) => h.steps.filter((s) => s.done).map((s) => s.text.trim().toLowerCase())) ?? []);
  const seen = new Set<Horizon>();
  const horizons = p.data.horizons
    .filter((h) => !seen.has(h.horizon) && seen.add(h.horizon))
    .sort((a, b) => HORIZONS.indexOf(a.horizon) - HORIZONS.indexOf(b.horizon))
    .map((h) => ({
      horizon: h.horizon,
      steps: h.steps.map((text, i) => ({ id: `${h.horizon}-${i}`, text: text.trim(), done: done.has(text.trim().toLowerCase()) })),
    }));
  return {
    id: previous?.id ?? crypto.randomUUID(),
    title: p.data.title.trim(), goal: req.goal, summary: p.data.summary.trim(), hoursPerWeek: req.hoursPerWeek,
    searchIdeas: p.data.searchIdeas.map((s) => s.trim()).filter(Boolean).slice(0, 5),
    horizons, createdAt: previous?.createdAt ?? Date.now(), source: previous?.source ?? "ai",
  };
}

export function progress(plan: Plan): { done: number; total: number; pct: number } {
  const steps = plan.horizons.flatMap((h) => h.steps);
  const done = steps.filter((s) => s.done).length;
  return { done, total: steps.length, pct: steps.length ? Math.round((done / steps.length) * 100) : 0 };
}

export function toggleStep(plan: Plan, stepId: string): Plan {
  return { ...plan, horizons: plan.horizons.map((h) => ({ ...h, steps: h.steps.map((s) => (s.id === stepId ? { ...s, done: !s.done } : s)) })) };
}

/** Compact copy of a plan to send back to the model when adjusting. */
export const planForModel = (plan: Plan) =>
  JSON.stringify({ title: plan.title, summary: plan.summary, searchIdeas: plan.searchIdeas, horizons: plan.horizons.map((h) => ({ horizon: h.horizon, steps: h.steps.map((s) => s.text) })) });

/** Carries ticked steps from the old plan to a new version of it (matched by step text). */
export function keepProgress(next: Plan, prev: Plan): Plan {
  const done = new Set(prev.horizons.flatMap((h) => h.steps.filter((s) => s.done).map((s) => s.text.trim().toLowerCase())));
  return {
    ...next, id: prev.id, createdAt: prev.createdAt, source: prev.source,
    horizons: next.horizons.map((h) => ({ ...h, steps: h.steps.map((s) => ({ ...s, done: done.has(s.text.trim().toLowerCase()) })) })),
  };
}
