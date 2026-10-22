// Sub-skills (topics) for the SAT, ACT and TSI, so each skill can be studied and quizzed in smaller steps (1.1, 1.2, ...).
// The skills and their order come from src/lib/exam/config.ts. These names follow the content areas each test publishes,
// and are written here in English and Spanish. They are outline-level: compare with the test maker's own guide.
type T = [en: string, es: string];
type Outline = Record<string, Record<string, T[]>>;

export const SAT_TOPICS: Outline = {
  rw: {
    "craft-structure": [
      ["Words in context", "Palabras en contexto"], ["Text structure and purpose", "Estructura y propósito del texto"],
      ["Cross-text connections", "Conexiones entre textos"], ["Tone and word choice", "Tono y elección de palabras"],
    ],
    "information-ideas": [
      ["Central ideas and details", "Ideas centrales y detalles"], ["Command of evidence: text", "Dominio de la evidencia: texto"],
      ["Command of evidence: data", "Dominio de la evidencia: datos"], ["Inferences", "Inferencias"],
    ],
    "standard-english": [
      ["Sentence boundaries: fragments and run-ons", "Límites de la oración: fragmentos y oraciones corridas"], ["Commas, semicolons and colons", "Comas, punto y coma y dos puntos"],
      ["Subject-verb agreement", "Concordancia del sujeto y el verbo"], ["Verb tense and form", "Tiempo y forma del verbo"],
      ["Pronouns: agreement and clarity", "Pronombres: concordancia y claridad"], ["Modifiers and parallel structure", "Modificadores y estructura paralela"],
      ["Possessives and plurals", "Posesivos y plurales"],
    ],
    "expression-of-ideas": [
      ["Rhetorical synthesis", "Síntesis retórica"], ["Transitions", "Transiciones"], ["Organizing and revising sentences", "Organizar y revisar oraciones"],
    ],
  },
  math: {
    algebra: [
      ["Linear equations in one variable", "Ecuaciones lineales con una variable"], ["Linear functions and graphs", "Funciones lineales y gráficas"],
      ["Systems of two linear equations", "Sistemas de dos ecuaciones lineales"], ["Linear inequalities", "Desigualdades lineales"],
      ["Interpreting linear models", "Interpretar modelos lineales"],
    ],
    "advanced-math": [
      ["Equivalent expressions", "Expresiones equivalentes"], ["Polynomials and factoring", "Polinomios y factorización"],
      ["Quadratic functions and equations", "Funciones y ecuaciones cuadráticas"], ["Exponential functions and growth", "Funciones exponenciales y crecimiento"],
      ["Nonlinear equations in one variable", "Ecuaciones no lineales con una variable"], ["Systems with a nonlinear equation", "Sistemas con una ecuación no lineal"],
    ],
    "problem-solving": [
      ["Ratios, rates and proportions", "Razones, tasas y proporciones"], ["Percentages", "Porcentajes"], ["Units and unit conversion", "Unidades y conversión de unidades"],
      ["One-variable data: center and spread", "Datos de una variable: centro y dispersión"], ["Two-variable data and scatterplots", "Datos de dos variables y diagramas de dispersión"],
      ["Probability and conditional probability", "Probabilidad y probabilidad condicional"], ["Sample statistics and margin of error", "Estadísticas de muestras y margen de error"],
      ["Evaluating statistical claims", "Evaluar afirmaciones estadísticas"],
    ],
    "geometry-trig": [
      ["Area and volume", "Área y volumen"], ["Lines, angles and triangles", "Rectas, ángulos y triángulos"],
      ["Right triangles and trigonometry", "Triángulos rectángulos y trigonometría"], ["Circles: equations, arcs and angles", "Círculos: ecuaciones, arcos y ángulos"],
    ],
  },
};

export const ACT_TOPICS: Outline = {
  english: {
    "production-of-writing": [
      ["Topic development", "Desarrollo del tema"], ["Organization, unity and cohesion", "Organización, unidad y cohesión"], ["Introductions, conclusions and transitions", "Introducciones, conclusiones y transiciones"],
    ],
    "knowledge-of-language": [
      ["Word choice and precision", "Elección de palabras y precisión"], ["Concision and redundancy", "Concisión y redundancia"], ["Style and tone", "Estilo y tono"],
    ],
    conventions: [
      ["Sentence structure and boundaries", "Estructura y límites de la oración"], ["Punctuation", "Puntuación"], ["Agreement, pronouns and verbs", "Concordancia, pronombres y verbos"], ["Modifiers and parallelism", "Modificadores y paralelismo"],
    ],
  },
  math: {
    algebra: [
      ["Linear equations and inequalities", "Ecuaciones y desigualdades lineales"], ["Systems of equations", "Sistemas de ecuaciones"], ["Exponents, radicals and absolute value", "Exponentes, radicales y valor absoluto"], ["Expressions and factoring", "Expresiones y factorización"],
    ],
    functions: [
      ["Function notation and evaluation", "Notación de funciones y evaluación"], ["Linear, quadratic and exponential functions", "Funciones lineales, cuadráticas y exponenciales"], ["Graphs and transformations", "Gráficas y transformaciones"], ["Sequences and patterns", "Sucesiones y patrones"],
    ],
    geometry: [
      ["Angles, triangles and polygons", "Ángulos, triángulos y polígonos"], ["Perimeter, area and volume", "Perímetro, área y volumen"], ["Coordinate geometry", "Geometría de coordenadas"], ["Trigonometry", "Trigonometría"],
    ],
    "statistics-probability": [
      ["Mean, median and mode", "Media, mediana y moda"], ["Probability and counting", "Probabilidad y conteo"], ["Data displays and scatterplots", "Gráficas de datos y diagramas de dispersión"], ["Ratios, percents and number sense", "Razones, porcentajes y sentido numérico"],
    ],
  },
  reading: {
    "key-ideas": [
      ["Main idea and theme", "Idea principal y tema"], ["Details and summaries", "Detalles y resúmenes"], ["Relationships and inferences", "Relaciones e inferencias"],
    ],
    "craft-structure": [
      ["Word meaning in context", "Significado de palabras en contexto"], ["Point of view and purpose", "Punto de vista y propósito"], ["Text structure", "Estructura del texto"],
    ],
    integration: [
      ["Evaluating claims and evidence", "Evaluar afirmaciones y evidencia"], ["Comparing passages", "Comparar pasajes"], ["Information shown in numbers", "Información en números y datos"],
    ],
  },
  science: {
    "interpretation-of-data": [
      ["Reading tables and graphs", "Leer tablas y gráficas"], ["Trends and relationships", "Tendencias y relaciones"], ["Figures with several variables", "Figuras con varias variables"],
    ],
    "scientific-investigation": [
      ["Experimental design and variables", "Diseño experimental y variables"], ["Evaluating results", "Evaluar resultados"], ["Predicting what changes", "Predecir qué cambia"],
    ],
    "evaluation-of-models": [
      ["Comparing conflicting viewpoints", "Comparar puntos de vista opuestos"], ["Supporting or weakening a hypothesis", "Apoyar o debilitar una hipótesis"], ["Applying a model", "Aplicar un modelo"],
    ],
  },
};

export const TSI_TOPICS: Outline = {
  math: {
    quantitative: [
      ["Fractions, decimals and percents", "Fracciones, decimales y porcentajes"], ["Ratios, rates and proportions", "Razones, tasas y proporciones"], ["Exponents, roots and number sense", "Exponentes, raíces y sentido numérico"], ["Word problems and units", "Problemas con palabras y unidades"],
    ],
    algebraic: [
      ["Linear equations and inequalities", "Ecuaciones y desigualdades lineales"], ["Systems of equations", "Sistemas de ecuaciones"], ["Polynomials and factoring", "Polinomios y factorización"], ["Quadratic equations", "Ecuaciones cuadráticas"], ["Functions and graphs", "Funciones y gráficas"],
    ],
    geometric: [
      ["Perimeter, area and volume", "Perímetro, área y volumen"], ["Angles, triangles and the Pythagorean theorem", "Ángulos, triángulos y el teorema de Pitágoras"], ["Coordinate geometry and transformations", "Geometría de coordenadas y transformaciones"], ["Similarity and circles", "Semejanza y círculos"],
    ],
    statistical: [
      ["Mean, median, mode and range", "Media, mediana, moda y rango"], ["Data displays", "Gráficas de datos"], ["Probability", "Probabilidad"], ["Scatterplots and linear models", "Diagramas de dispersión y modelos lineales"],
    ],
  },
  elar: {
    "reading-ideas": [
      ["Main idea and supporting details", "Idea principal y detalles de apoyo"], ["Inferences and conclusions", "Inferencias y conclusiones"], ["Evidence and claims", "Evidencia y afirmaciones"], ["Summarizing", "Resumir"],
    ],
    "reading-craft": [
      ["Vocabulary in context", "Vocabulario en contexto"], ["Author's purpose and point of view", "Propósito del autor y punto de vista"], ["Text structure", "Estructura del texto"], ["Tone and rhetorical devices", "Tono y recursos retóricos"],
    ],
    "revision-logic": [
      ["Organization and transitions", "Organización y transiciones"], ["Combining sentences", "Combinar oraciones"], ["Concision and relevance", "Concisión y relevancia"], ["Sentence logic", "Lógica de las oraciones"],
    ],
    conventions: [
      ["Sentence boundaries", "Límites de la oración"], ["Punctuation", "Puntuación"], ["Agreement", "Concordancia"], ["Verb tense, pronouns and modifiers", "Tiempo verbal, pronombres y modificadores"],
    ],
  },
};
