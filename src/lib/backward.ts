import { addDays, diffDays, type ISODate } from "./dates";

export interface PlanStep { id: string; label: string; weight: number }
export interface DatedStep extends PlanStep { date: ISODate }

/**
 * Spreads steps from `start` to `due`, working backward. Each step gets days in proportion to its
 * weight, the last working step lands the day before the due date when there is room, and the
 * due date itself is a buffer for turning it in. Never returns a date before `start`.
 */
export function planBackward(steps: PlanStep[], start: ISODate, due: ISODate): DatedStep[] {
  const span = diffDays(start, due);
  if (!steps.length || span < 0) return [];
  // Last working day: the day before due, or the due date itself when there is no room.
  const lastDay = span >= 2 ? span - 1 : span;
  const total = steps.reduce((s, x) => s + Math.max(x.weight, 0.1), 0);
  let acc = 0;
  return steps.map((step) => {
    acc += Math.max(step.weight, 0.1);
    // Position of this step's finish line along the timeline, counted from start.
    const offset = Math.max(0, Math.min(lastDay, Math.round((acc / total) * lastDay)));
    return { ...step, date: addDays(start, offset) };
  });
}

export const DEFAULT_STEPS = {
  en: [["Choose the topic or question", 1], ["Research and take notes", 3], ["Outline", 1], ["First draft", 3], ["Revise and fix", 2], ["Final check and turn in", 1]],
  es: [["Elegir el tema o la pregunta", 1], ["Investigar y tomar apuntes", 3], ["Hacer un esquema", 1], ["Primer borrador", 3], ["Revisar y corregir", 2], ["Revisión final y entrega", 1]],
} as const;
