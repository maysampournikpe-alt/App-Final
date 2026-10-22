import generated from "@/data/bank/ap-generated.json";
import { AP_CED } from "@/data/ap-ced";
import type { SectionConfig } from "./types";

export interface ApUnit { id: string; en: string; es: string }
export interface ApCourse { id: string; en: string; es: string; units: ApUnit[] }
const u = (id: string, en: string, es = en): ApUnit => ({ id, en, es });

/** Courses with practice questions. Units follow the College Board framework for each course. */
export const AP_PRACTICE_COURSES: ApCourse[] = [
  { id: "apstats", en: "AP Statistics", es: "AP Estadística", units: [
    u("u1", "Unit 1: Exploring one-variable data", "Unidad 1: Datos de una variable"), u("u2", "Unit 2: Exploring two-variable data", "Unidad 2: Datos de dos variables"),
    u("u3", "Unit 3: Collecting data", "Unidad 3: Recolección de datos"), u("u4", "Unit 4: Probability and random variables", "Unidad 4: Probabilidad y variables aleatorias"),
    u("u5", "Unit 5: Sampling distributions", "Unidad 5: Distribuciones muestrales"), u("u6", "Unit 6: Inference for proportions", "Unidad 6: Inferencia para proporciones"),
    u("u7", "Unit 7: Inference for means", "Unidad 7: Inferencia para medias"), u("u8", "Unit 8: Chi-square inference", "Unidad 8: Inferencia con chi cuadrada"),
    u("u9", "Unit 9: Inference for slopes", "Unidad 9: Inferencia para pendientes")] },
  { id: "apush", en: "AP US History", es: "AP Historia de EE. UU.", units: [
    u("p1", "Period 1: 1491 to 1607", "Periodo 1: 1491 a 1607"), u("p2", "Period 2: 1607 to 1754", "Periodo 2: 1607 a 1754"), u("p3", "Period 3: 1754 to 1800", "Periodo 3: 1754 a 1800"),
    u("p4", "Period 4: 1800 to 1848", "Periodo 4: 1800 a 1848"), u("p5", "Period 5: 1844 to 1877", "Periodo 5: 1844 a 1877"), u("p6", "Period 6: 1865 to 1898", "Periodo 6: 1865 a 1898"),
    u("p7", "Period 7: 1890 to 1945", "Periodo 7: 1890 a 1945"), u("p8", "Period 8: 1945 to 1980", "Periodo 8: 1945 a 1980"), u("p9", "Period 9: 1980 to the present", "Periodo 9: 1980 al presente")] },
  { id: "aphug", en: "AP Human Geography", es: "AP Geografía Humana", units: [
    u("u1", "Unit 1: Thinking geographically", "Unidad 1: Pensar geográficamente"), u("u2", "Unit 2: Population and migration", "Unidad 2: Población y migración"),
    u("u3", "Unit 3: Cultural patterns", "Unidad 3: Patrones culturales"), u("u4", "Unit 4: Political patterns", "Unidad 4: Patrones políticos"),
    u("u5", "Unit 5: Agriculture and rural land use", "Unidad 5: Agricultura y uso rural del suelo"), u("u6", "Unit 6: Cities and urban land use", "Unidad 6: Ciudades y uso urbano del suelo"),
    u("u7", "Unit 7: Industrial and economic development", "Unidad 7: Desarrollo industrial y económico")] },
];

/** Every course a student can pick. */
export const AP_ALL_COURSES: { id: string; en: string; es: string }[] = [
  ...AP_PRACTICE_COURSES.map(({ id, en, es }) => ({ id, en, es })),
  ...[
    "AP African American Studies", "AP Art History", "AP Biology", "AP Calculus AB", "AP Calculus BC", "AP Chemistry", "AP Comparative Government and Politics",
    "AP Computer Science A", "AP Computer Science Principles", "AP English Language and Composition", "AP English Literature and Composition", "AP Environmental Science",
    "AP European History", "AP Macroeconomics", "AP Microeconomics", "AP Music Theory", "AP Physics 1", "AP Physics 2", "AP Physics C: Mechanics",
    "AP Physics C: Electricity and Magnetism", "AP Precalculus", "AP Psychology", "AP Spanish Language and Culture", "AP Spanish Literature and Culture",
    "AP United States Government and Politics", "AP World History: Modern", "AP Seminar", "AP Research", "AP Studio Art", "AP Chinese Language and Culture",
    "AP French Language and Culture", "AP German Language and Culture", "AP Italian Language and Culture", "AP Japanese Language and Culture", "AP Latin",
  ].map((en) => ({ id: en.toLowerCase().replace(/[^a-z0-9]+/g, "-"), en, es: en })),
];

/** A rough guess of the 1 to 5 AP score from the percent correct. Real scoring weights the free-response questions too. */
export function apScore(pct: number): 1 | 2 | 3 | 4 | 5 {
  return pct >= 0.72 ? 5 : pct >= 0.58 ? 4 : pct >= 0.45 ? 3 : pct >= 0.32 ? 2 : 1;
}

/** Every course that has a unit list: the ones with hand-written starter questions plus those from the CED list. Each gets a study path. */
export const AP_COURSES: ApCourse[] = [
  ...AP_PRACTICE_COURSES,
  ...AP_ALL_COURSES.filter((c) => AP_CED[c.en] && !AP_PRACTICE_COURSES.some((p) => p.id === c.id)).map((c) => ({
    ...c, units: AP_CED[c.en].map((t, i) => u(`u${i + 1}`, `Unit ${i + 1}: ${t}`, `Unidad ${i + 1}: ${t}`)),
  })),
];

/** Courses that can run a mock exam: starter questions, or at least 12 verified questions made by `npm run bank:generate`. */
const generatedCount = (id: string) => (generated as { section: string }[]).filter((q) => q.section === id).length;
export const hasQuestions = (id: string) => AP_PRACTICE_COURSES.some((c) => c.id === id) || generatedCount(id) >= 12;

export const AP_SECTIONS: SectionConfig[] = AP_COURSES.filter((c) => hasQuestions(c.id)).map((c) => ({
  id: c.id, en: c.en, es: c.es, questions: 55, minutes: 80, skills: c.units.map((x) => ({ id: x.id, en: x.en, es: x.es })),
}));
