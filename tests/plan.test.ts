import { describe, expect, it } from "vitest";
import { buildPlanPrompt, planForModel, planRequestSchema, progress, toggleStep, toPlan } from "../src/lib/plan";
import { TEMPLATES, templatePlan } from "../src/lib/plan-templates";

const raw = {
  title: "Win the debate tournament", summary: "Practice a little every day.", searchIdeas: ["debate tournaments near me"],
  horizons: [{ horizon: "month", steps: ["Research the topic", "Write a case"] }, { horizon: "week", steps: ["Pick a partner", "Watch one round"] }],
};

describe("plan building", () => {
  it("validates the request and applies defaults", () => {
    const r = planRequestSchema.parse({ goal: "make varsity soccer" });
    expect(r.hoursPerWeek).toBe(5);
    expect(planRequestSchema.safeParse({ goal: "x" }).success).toBe(false);
    expect(planRequestSchema.safeParse({ goal: "make varsity", hoursPerWeek: 99 }).success).toBe(false);
  });
  it("turns model output into a plan, ordered week, month, year", () => {
    const p = toPlan(raw, { goal: "debate", hoursPerWeek: 4 })!;
    expect(p.horizons.map((h) => h.horizon)).toEqual(["week", "month"]);
    expect(p.horizons[0].steps[0]).toMatchObject({ id: "week-0", done: false });
  });
  it("rejects output that is not a plan", () => {
    expect(toPlan({ title: "x" }, { goal: "g", hoursPerWeek: 3 })).toBeNull();
    expect(toPlan({ title: "ok plan", horizons: [{ horizon: "decade", steps: ["a step"] }] }, { goal: "g", hoursPerWeek: 3 })).toBeNull();
  });
  it("keeps ticked steps ticked when adjusting, if the text is unchanged", () => {
    const first = toPlan(raw, { goal: "debate", hoursPerWeek: 4 })!;
    const ticked = toggleStep(first, "week-0");
    const adjusted = toPlan(raw, { goal: "debate", hoursPerWeek: 4 }, ticked)!;
    expect(adjusted.id).toBe(first.id);
    expect(adjusted.horizons[0].steps[0].done).toBe(true);
    expect(adjusted.horizons[0].steps[1].done).toBe(false);
  });
  it("counts progress", () => {
    let p = toPlan(raw, { goal: "debate", hoursPerWeek: 4 })!;
    expect(progress(p)).toEqual({ done: 0, total: 4, pct: 0 });
    p = toggleStep(toggleStep(p, "week-0"), "month-1");
    expect(progress(p)).toEqual({ done: 2, total: 4, pct: 50 });
  });
  it("asks the model not to invent events, and carries an adjustment", () => {
    const base = planRequestSchema.parse({ goal: "debate", adjust: { instruction: "make it easier", plan: planForModel(toPlan(raw, { goal: "d", hoursPerWeek: 3 })!) } });
    const { system, user } = buildPlanPrompt(base);
    expect(system).toMatch(/Never invent specific events/);
    expect(user).toMatch(/make it easier/);
  });
});

describe("templates", () => {
  it("exist in both languages with the same shape and real steps", () => {
    expect(TEMPLATES).toHaveLength(4);
    for (const t of TEMPLATES) for (const k of ["week", "month", "year"] as const) {
      expect(t[k].en.length, `${t.id} ${k}`).toBeGreaterThanOrEqual(3);
      expect(t[k].es.length, `${t.id} ${k}`).toBe(t[k].en.length);
    }
  });
  it("make a ready plan", () => {
    const p = templatePlan(TEMPLATES[0], "es");
    expect(p.horizons).toHaveLength(3);
    expect(p.source).toBe("template");
    expect(p.title).toMatch(/Eagle/);
  });
});

import { keepProgress } from "../src/lib/plan";
describe("keepProgress", () => {
  it("moves ticks to the new version by text, and keeps the id", () => {
    const old = toggleStep(toPlan(raw, { goal: "d", hoursPerWeek: 3 })!, "week-1");
    const fresh = toPlan({ ...raw, horizons: [{ horizon: "week", steps: ["Watch one round", "Brand new step"] }] }, { goal: "d", hoursPerWeek: 3 })!;
    const merged = keepProgress(fresh, old);
    expect(merged.id).toBe(old.id);
    expect(merged.horizons[0].steps.map((s) => s.done)).toEqual([true, false]);
  });
});
