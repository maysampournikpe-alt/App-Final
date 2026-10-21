import type { Achievement, Certificate, Mood, Sleep, VolunteerEntry } from "./career";
import { diffDays, toISO, type ISODate } from "./dates";
import type { DrillScore } from "./drills";
import type { Attempt } from "./exam/types";
import { bestStreak, currentStreak, type Habit } from "./habits";
import type { Assignment } from "./homework";
import type { Plan } from "./plan";
import type { Reflections } from "./reflect";
import { isFilled } from "./reflect";
import type { RoutineDoc } from "./routines";
import type { Card } from "./srs";
import type { Session } from "./study";
import type { Task } from "./tasks";

/** Everything the progress tools read. All of it is already saved by the other tools; nothing new is tracked. */
export interface Snapshot {
  now: ISODate;
  homework: Assignment[]; tasks: Task[]; habits: Habit[]; focusLog: Record<string, number>; sessions: Session[]; routines: RoutineDoc;
  attempts: Attempt[]; plans: Plan[]; savedCount: number; volunteer: VolunteerEntry[]; achievements: Achievement[]; certs: Certificate[];
  moods: Mood[]; sleep: Sleep[]; reflections: Reflections; cards: Card[]; drills: DrillScore[];
}

const sum = (n: number[]) => n.reduce((a, b) => a + b, 0);
const dayOf = (ms: number) => toISO(new Date(ms));

export interface XpLine { key: string; count: number; points: number }

/** XP is a total of small, fixed amounts for things a student really did. Each line is shown to the student. */
export function xpBreakdown(s: Snapshot): XpLine[] {
  const planSteps = sum(s.plans.map((p) => sum(p.horizons.map((h) => h.steps.filter((x) => x.done).length))));
  const routineSteps = sum(Object.values(s.routines.done).map((d) => d.length));
  const lines: [string, number, number][] = [
    ["homework", s.homework.filter((h) => h.done).length, 5],
    ["tasks", s.tasks.filter((t) => t.done).length, 3],
    ["habits", sum(s.habits.map((h) => h.done.length)), 3],
    ["routines", routineSteps, 1],
    ["focus", Math.floor(sum(Object.values(s.focusLog)) / 10), 1],
    ["study", Math.floor(sum(s.sessions.map((x) => x.minutes)) / 15), 1],
    ["tests", s.attempts.length, 20],
    ["questions", sum(s.attempts.map((a) => a.items.filter((i) => i.correct).length)), 1],
    ["cards", sum(s.cards.map((c) => c.reps)), 1],
    ["drills", s.drills.length, 5],
    ["planSteps", planSteps, 5],
    ["saved", s.savedCount, 2],
    ["volunteer", Math.floor(sum(s.volunteer.map((v) => v.hours))), 10],
    ["achievements", s.achievements.length, 15],
    ["certs", s.certs.length, 15],
    ["checkins", s.moods.length + s.sleep.length, 1],
    ["reflections", Object.values(s.reflections).filter((e) => isFilled(e)).length, 10],
  ];
  return lines.map(([key, count, per]) => ({ key, count, points: count * per }));
}
export const totalXp = (s: Snapshot) => sum(xpBreakdown(s).map((l) => l.points));

/** Level L starts at 50 x (L-1)^2 XP: 0, 50, 200, 450, 800, 1250 ... */
export const levelStart = (level: number) => 50 * (level - 1) ** 2;
export function levelOf(xp: number) {
  const level = Math.max(1, Math.floor(Math.sqrt(Math.max(0, xp) / 50)) + 1);
  const start = levelStart(level), next = levelStart(level + 1);
  return { level, xpInto: xp - start, xpNeeded: next - start, toNext: next - xp, pct: Math.min(100, Math.round(((xp - start) / (next - start)) * 100)) };
}
export const LEVEL_NAMES = [
  { en: "Trailhead", es: "Inicio del sendero" }, { en: "Scout", es: "Explorador" }, { en: "Wayfinder", es: "Guía" }, { en: "Navigator", es: "Navegante" },
  { en: "Pathfinder", es: "Buscador de rutas" }, { en: "Trailblazer", es: "Abrecaminos" }, { en: "Ridge Walker", es: "Caminante de cumbres" }, { en: "Summit Seeker", es: "Buscador de cumbres" },
  { en: "Peak Guide", es: "Guía de la cima" }, { en: "Summit", es: "Cumbre" },
];
export const levelName = (level: number) => LEVEL_NAMES[Math.min(level, LEVEL_NAMES.length) - 1];

/** Every day the student did something that leaves a dated record. Homework and tasks have no completion date, so they do not count here. */
export function activeDays(s: Snapshot): Set<ISODate> {
  const days = new Set<ISODate>();
  s.habits.forEach((h) => h.done.forEach((d) => days.add(d)));
  Object.entries(s.focusLog).forEach(([d, m]) => m > 0 && days.add(d));
  s.sessions.forEach((x) => days.add(x.date));
  Object.entries(s.routines.done).forEach(([d, ids]) => ids.length > 0 && days.add(d));
  s.moods.forEach((m) => days.add(m.date));
  s.sleep.forEach((m) => days.add(m.date));
  s.volunteer.forEach((v) => days.add(v.date));
  s.attempts.forEach((a) => days.add(dayOf(a.finishedAt)));
  s.drills.forEach((d) => days.add(d.date));
  return days;
}
export function streaks(s: Snapshot) {
  const days = [...activeDays(s)];
  return { current: currentStreak(days, s.now), best: bestStreak(days), activeCount: days.length };
}

export interface BadgeDef { id: string; en: string; es: string; how: { en: string; es: string }; icon: "heart" | "flame" | "trophy" | "book" | "target" | "medal" | "star" | "mountain" | "award" | "timer" | "flag" | "sprout" | "layers" | "route"; value: (s: Snapshot) => number; target: number }
const hours = (s: Snapshot) => sum(s.volunteer.map((v) => v.hours));
const studyMinutes = (s: Snapshot) => sum(s.sessions.map((x) => x.minutes)) + sum(Object.values(s.focusLog));
const planDone = (s: Snapshot) => sum(s.plans.map((p) => sum(p.horizons.map((h) => h.steps.filter((x) => x.done).length))));
const planFinished = (s: Snapshot) => s.plans.filter((p) => { const steps = p.horizons.flatMap((h) => h.steps); return steps.length > 0 && steps.every((x) => x.done); }).length;
export const BADGES: BadgeDef[] = [
  { id: "first-save", en: "First save", es: "Primer guardado", how: { en: "Save an opportunity", es: "Guarda una oportunidad" }, icon: "heart", value: (s) => s.savedCount, target: 1 },
  { id: "five-saves", en: "Trail scout", es: "Explorador", how: { en: "Save 5 opportunities", es: "Guarda 5 oportunidades" }, icon: "flag", value: (s) => s.savedCount, target: 5 },
  { id: "streak-7", en: "Week on the trail", es: "Semana en el sendero", how: { en: "Show up 7 days in a row", es: "Cumple 7 días seguidos" }, icon: "flame", value: (s) => streaks(s).best, target: 7 },
  { id: "streak-30", en: "Month on the trail", es: "Mes en el sendero", how: { en: "Show up 30 days in a row", es: "Cumple 30 días seguidos" }, icon: "mountain", value: (s) => streaks(s).best, target: 30 },
  { id: "homework-10", en: "Homework hero", es: "Héroe de la tarea", how: { en: "Finish 10 assignments", es: "Termina 10 tareas" }, icon: "book", value: (s) => s.homework.filter((h) => h.done).length, target: 10 },
  { id: "study-10h", en: "Ten hours in", es: "Diez horas", how: { en: "Study for 10 hours (timer and log)", es: "Estudia 10 horas (temporizador y registro)" }, icon: "timer", value: (s) => Math.floor(studyMinutes(s) / 60), target: 10 },
  { id: "first-test", en: "Test taker", es: "Examen hecho", how: { en: "Finish a practice test", es: "Termina un examen de práctica" }, icon: "target", value: (s) => s.attempts.length, target: 1 },
  { id: "five-tests", en: "Practice makes progress", es: "Practicar da resultados", how: { en: "Finish 5 practice tests", es: "Termina 5 exámenes de práctica" }, icon: "trophy", value: (s) => s.attempts.length, target: 5 },
  { id: "cards-100", en: "Memory builder", es: "Constructor de memoria", how: { en: "Review 100 flashcards", es: "Repasa 100 tarjetas" }, icon: "layers", value: (s) => sum(s.cards.map((c) => c.reps)), target: 100 },
  { id: "plan-step", en: "First step", es: "Primer paso", how: { en: "Finish a plan step", es: "Termina un paso de un plan" }, icon: "route", value: planDone, target: 1 },
  { id: "plan-done", en: "Goal reached", es: "Meta lograda", how: { en: "Finish every step of a plan", es: "Termina todos los pasos de un plan" }, icon: "medal", value: planFinished, target: 1 },
  { id: "volunteer-10", en: "Giving back", es: "Dar de vuelta", how: { en: "Volunteer 10 hours", es: "Haz 10 horas de voluntariado" }, icon: "sprout", value: hours, target: 10 },
  { id: "volunteer-50", en: "Community pillar", es: "Pilar de la comunidad", how: { en: "Volunteer 50 hours", es: "Haz 50 horas de voluntariado" }, icon: "award", value: hours, target: 50 },
  { id: "achievements-5", en: "Record keeper", es: "Llevo mi historial", how: { en: "Log 5 accomplishments", es: "Anota 5 logros" }, icon: "star", value: (s) => s.achievements.length, target: 5 },
];

export interface Emblem { id: string; icon: "compass" | "mountain" | "tent" | "backpack" | "flame" | "star" | "trophy" | "rocket"; level: number; en: string; es: string }
export interface Tint { id: string; var: string; level: number; en: string; es: string }
export const EMBLEMS: Emblem[] = [
  { id: "compass", icon: "compass", level: 1, en: "Compass", es: "Brújula" }, { id: "mountain", icon: "mountain", level: 2, en: "Mountain", es: "Montaña" },
  { id: "tent", icon: "tent", level: 3, en: "Tent", es: "Tienda de campaña" }, { id: "backpack", icon: "backpack", level: 4, en: "Backpack", es: "Mochila" },
  { id: "flame", icon: "flame", level: 5, en: "Campfire", es: "Fogata" }, { id: "star", icon: "star", level: 6, en: "Star", es: "Estrella" },
  { id: "trophy", icon: "trophy", level: 8, en: "Trophy", es: "Trofeo" }, { id: "rocket", icon: "rocket", level: 10, en: "Rocket", es: "Cohete" },
];
export const TINTS: Tint[] = [
  { id: "teal", var: "bg-teal text-on-teal", level: 1, en: "Pine", es: "Pino" }, { id: "marigold", var: "bg-marigold text-on-marigold", level: 1, en: "Marigold", es: "Caléndula" },
  { id: "ruby", var: "bg-ruby text-on-ruby", level: 2, en: "Ruby", es: "Rubí" }, { id: "terracotta", var: "bg-terracotta text-on-terracotta", level: 3, en: "Clay", es: "Barro" },
  { id: "ink", var: "bg-ink text-paper", level: 4, en: "Night", es: "Noche" },
];
export interface AvatarChoice { emblem: string; tint: string }
export const AVATAR_KEY = "avatar";
export const DEFAULT_AVATAR: AvatarChoice = { emblem: "compass", tint: "teal" };
/** The choice the student made, or the default if they picked something they have not unlocked (for example after data was cleared). */
export function usableAvatar(choice: AvatarChoice, level: number): AvatarChoice {
  const e = EMBLEMS.find((x) => x.id === choice.emblem), t = TINTS.find((x) => x.id === choice.tint);
  return { emblem: e && e.level <= level ? e.id : DEFAULT_AVATAR.emblem, tint: t && t.level <= level ? t.id : DEFAULT_AVATAR.tint };
}
export const daysAgo = (a: ISODate, b: ISODate) => diffDays(a, b);
