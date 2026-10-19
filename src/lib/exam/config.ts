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

const ACT_SECTIONS = [
  { id: "english", en: "English", es: "Inglés", questions: 75, minutes: 45, skills: [
    sk("production-of-writing", "Production of writing", "Producción escrita"),
    sk("knowledge-of-language", "Knowledge of language", "Conocimiento del lenguaje"),
    sk("conventions", "Conventions of standard English", "Reglas del inglés estándar")] },
  { id: "math", en: "Math", es: "Matemáticas", questions: 60, minutes: 60, skills: [
    sk("algebra", "Algebra", "Álgebra"), sk("functions", "Functions", "Funciones"),
    sk("geometry", "Geometry", "Geometría"), sk("statistics-probability", "Statistics and probability", "Estadística y probabilidad")] },
  { id: "reading", en: "Reading", es: "Lectura", questions: 40, minutes: 35, skills: [
    sk("key-ideas", "Key ideas and details", "Ideas clave y detalles"), sk("craft-structure", "Craft and structure", "Técnica y estructura"),
    sk("integration", "Integration of ideas", "Integración de ideas")] },
  { id: "science", en: "Science (optional)", es: "Ciencias (opcional)", questions: 40, minutes: 40, skills: [
    sk("interpretation-of-data", "Interpretation of data", "Interpretación de datos"), sk("scientific-investigation", "Scientific investigation", "Investigación científica"),
    sk("evaluation-of-models", "Evaluation of models", "Evaluación de modelos")] },
];

const TSI_SECTIONS = [
  { id: "math", en: "Mathematics", es: "Matemáticas", questions: 20, minutes: 60, skills: [
    sk("quantitative", "Quantitative reasoning", "Razonamiento cuantitativo"), sk("algebraic", "Algebraic reasoning", "Razonamiento algebraico"),
    sk("geometric", "Geometric and spatial reasoning", "Razonamiento geométrico y espacial"), sk("statistical", "Statistical reasoning", "Razonamiento estadístico")] },
  { id: "elar", en: "Reading and Writing (ELAR)", es: "Lectura y escritura (ELAR)", questions: 48, minutes: 90, skills: [
    sk("reading-ideas", "Reading: ideas and evidence", "Lectura: ideas y evidencia"), sk("reading-craft", "Reading: language and purpose", "Lectura: lenguaje y propósito"),
    sk("revision-logic", "Revision and sentence logic", "Revisión y lógica de las oraciones"), sk("conventions", "Conventions of English", "Reglas del inglés")] },
];

export const EXAMS: Record<ExamId, ExamConfig> = {
  sat: { id: "sat", bank: "sat", en: "SAT", es: "SAT", sections: SAT_SECTIONS, sectionScale: { min: 200, max: 800, step: 10 }, totalMode: "sum" },
  // The PSAT is built like the digital SAT and scored 160 to 760 per section, so it practices from the same bank (easier questions first).
  psat: { id: "psat", bank: "sat", en: "PSAT", es: "PSAT", sections: SAT_SECTIONS, sectionScale: { min: 160, max: 760, step: 10 }, totalMode: "sum", maxDifficulty: 2 },
  act: { id: "act", bank: "act", en: "ACT", es: "ACT", sections: ACT_SECTIONS, sectionScale: { min: 1, max: 36, step: 1 }, totalMode: "average" },
  tsi: { id: "tsi", bank: "tsi", en: "TSI", es: "TSI", sections: TSI_SECTIONS, sectionScale: { min: 910, max: 990, step: 1 }, totalMode: "none" },
};

/** Texas colleges use these as the "college ready" lines on the TSIA2. Check your college, rules can change. */
export const TSI_READY = { math: 950, elar: 945 } as const;

export const sectionOf = (exam: ExamId, id: string) => EXAMS[exam].sections.find((s) => s.id === id);
export const minutesPerQuestion = (exam: ExamId, sectionId: string) => {
  const s = sectionOf(exam, sectionId);
  return s ? s.minutes / s.questions : 1.5;
};
