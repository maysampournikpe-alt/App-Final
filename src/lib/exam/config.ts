import type { ExamConfig, ExamId } from "./types";

const sk = (id: string, en: string, es: string) => ({ id, en, es });

const SAT_SECTIONS = [
  {
    id: "rw", en: "Reading and Writing", es: "Lectura y escritura", questions: 54, minutes: 64,
    skills: [
      sk("craft-structure", "Craft and structure", "Vocabulario y estructura"),
      sk("information-ideas", "Information and ideas", "Información e ideas"),
      sk("standard-english", "Standard English conventions", "Reglas del inglés estándar"),
      sk("expression-of-ideas", "Expression of ideas", "Expresión de ideas"),
    ],
  },
  {
    id: "math", en: "Math", es: "Matemáticas", questions: 44, minutes: 70,
    skills: [
      sk("algebra", "Algebra", "Álgebra"),
      sk("advanced-math", "Advanced math", "Matemáticas avanzadas"),
      sk("problem-solving", "Problem solving and data", "Resolución de problemas y datos"),
      sk("geometry-trig", "Geometry and trigonometry", "Geometría y trigonometría"),
    ],
  },
];

export const EXAMS: Record<ExamId, ExamConfig> = {
  sat: { id: "sat", bank: "sat", en: "SAT", es: "SAT", sections: SAT_SECTIONS, sectionScale: { min: 200, max: 800, step: 10 } },
  // The PSAT is built like the digital SAT and scored 160 to 760 per section, so it practices from the same bank (easier questions first).
  psat: { id: "psat", bank: "sat", en: "PSAT", es: "PSAT", sections: SAT_SECTIONS, sectionScale: { min: 160, max: 760, step: 10 }, maxDifficulty: 2 },
  act: { id: "act", bank: "act", en: "ACT", es: "ACT", sectionScale: { min: 1, max: 36, step: 1 }, sections: [] },
  tsi: { id: "tsi", bank: "tsi", en: "TSI", es: "TSI", sectionScale: { min: 910, max: 990, step: 1 }, sections: [] },
};

export const sectionOf = (exam: ExamId, id: string) => EXAMS[exam].sections.find((s) => s.id === id);
export const minutesPerQuestion = (exam: ExamId, sectionId: string) => {
  const s = sectionOf(exam, sectionId);
  return s ? s.minutes / s.questions : 1.5;
};
