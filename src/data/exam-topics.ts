// Sub-skills (topics) for the SAT, ACT and TSI, so each skill can be studied and quizzed in small steps (1.1, 1.2, ...).
// The skills and their order come from src/lib/exam/config.ts. The names follow the content areas each test publishes.
// Each topic also has a "cover" brief: what the notes and the practice questions must include. It is sent to the AI so
// the lessons stay on what the test really asks. Names are in English and Spanish. All of this is outline-level, so
// compare it with the test maker's own guide.
type T = [en: string, es: string, cover: string];
type Outline = Record<string, Record<string, T[]>>;

export const SAT_TOPICS: Outline = {
  rw: {
    "craft-structure": [
      ["Words in context", "Palabras en contexto", "Fill-in-the-blank questions where one word must fit the meaning and tone of the sentence. Teach: read the sentence and predict the word before looking at the choices; find the clue words (contrast clues like 'although', cause clues, definition clues); precise meaning versus a close but wrong connotation; words with several meanings; eliminate choices that are too extreme or change the tone. Give a list of high-value words with meanings."],
      ["Text structure and purpose", "Estructura y propósito del texto", "Questions on the function of a sentence or the overall purpose of a short text. Teach: summarize each sentence in a few words; common functions (introduce a claim, give evidence, give an example, contrast, qualify, counter, conclude); purpose verbs (to propose, to critique, to explain, to compare); typical wrong answers that are too narrow, too broad or reversed."],
      ["Cross-text connections", "Conexiones entre textos", "Two short texts, Text 1 and Text 2. Teach: state each author's main claim first; then decide how they relate (agree, disagree, qualify, give an example, offer a cause); how a person in Text 2 would respond to Text 1; stay inside what the texts say; avoid choices that only mention shared topics."],
      ["Poetry and literary passages", "Poesía y pasajes literarios", "Short fiction or poetry excerpts. Teach: who is speaking, what changes in the passage, figurative language and its effect, character feelings and motives, tone words, how a detail supports a theme; avoid over-reading or importing outside ideas."],
    ],
    "information-ideas": [
      ["Central ideas and details", "Ideas centrales y detalles", "Questions on the main idea or a stated detail. Teach: the main idea covers the whole text, not one detail; paraphrase the text in one sentence before the choices; spot details that are too narrow, extreme or unstated; science, history and literary passages; keyword matching without being fooled by repeated words."],
      ["Command of evidence: text", "Dominio de la evidencia: texto", "Choose the quotation or finding that best supports (or would weaken) a claim or hypothesis. Teach: restate the claim in your own words and mark each part; the right choice supports every part directly, not loosely; strengthen versus weaken versus complete-the-text; watch for choices that sound related but support something else."],
      ["Command of evidence: data", "Dominio de la evidencia: datos", "A short text with a table or graph described in words. Teach: read the title, labels, units and key first; find the exact values the claim needs; pick the choice that is accurate AND supports the claim; typical traps: right numbers but wrong claim, wrong category or year, overclaiming; compare values carefully."],
      ["Inferences", "Inferencias", "Complete the text logically. Teach: the answer must be supported by the text, not just possible; use signal words (therefore, thus, so, because); do not use outside knowledge; reject extreme words like 'always' or 'never' unless the text supports them."],
    ],
    "standard-english": [
      ["Sentence boundaries: fragments and run-ons", "Límites de la oración: fragmentos y oraciones corridas", "Independent versus dependent clauses; fragments, comma splices and run-ons; the four ways to join or separate clauses (period, semicolon, comma plus FANBOYS conjunction, subordinating conjunction); colon and dash use after a complete sentence; how to test whether each side can stand alone."],
      ["Commas, semicolons and colons", "Comas, punto y coma y dos puntos", "Comma rules the test uses: items in a list, introductory phrases, nonessential (extra) information set off by a pair of commas, dashes or parentheses, coordinate adjectives; never a single comma between a subject and its verb; semicolons join two complete sentences; colons follow a complete sentence and introduce a list or explanation."],
      ["Subject-verb agreement", "Concordancia del sujeto y el verbo", "Find the true subject and ignore prepositional phrases and interrupters; singular and plural verbs; compound subjects (and versus or); collective nouns; sentences that begin with 'there is/are' or put the verb first; each, every, neither, either; verb agreement after long modifiers."],
      ["Verb tense and form", "Tiempo y forma del verbo", "Keep tense consistent with time clues; simple past versus present perfect versus past perfect; irregular verbs (went, gone, began, begun); infinitives and participles; conditional and subjunctive ('if I were'); when a tense change is correct."],
      ["Pronouns: agreement and clarity", "Pronombres: concordancia y claridad", "Pronouns must agree in number with the noun they replace; clear antecedent versus ambiguous 'it/they/this'; subject versus object (who/whom, I/me); its versus it's, their/there/they're; that versus which; avoiding shifts between 'you', 'one' and 'they'."],
      ["Modifiers and parallel structure", "Modificadores y estructura paralela", "A modifier must touch the word it describes (dangling and misplaced modifiers); the subject after an introductory phrase must be what the phrase describes; parallel structure in lists and comparisons; 'not only ... but also', 'either ... or'."],
      ["Possessives and plurals", "Posesivos y plurales", "Apostrophe rules: singular possessive (the dog's), plural possessive (the dogs'), irregular plurals (children's); plural versus possessive confusion; contractions versus possessive pronouns."],
      ["Comparisons, idioms and noun agreement", "Comparaciones, modismos y concordancia de sustantivos", "Logical comparisons (compare like with like); fewer versus less, between versus among; prepositions in standard idioms; noun agreement when several things each have one of something."],
    ],
    "expression-of-ideas": [
      ["Rhetorical synthesis", "Síntesis retórica", "A set of bullet-point notes and a stated goal (introduce, compare, emphasize, explain to an audience). Teach: read the goal first; find the choice that uses only information in the notes and accomplishes exactly that goal; eliminate choices that are accurate but off-goal, too detailed, or add outside facts."],
      ["Transitions", "Transiciones", "Choose the transition word or phrase. Teach: decide the relationship between the previous idea and the next (contrast, addition, cause and effect, example, sequence, concession, emphasis) before looking at the choices; lists of transitions by relationship; common mix-ups such as 'however' versus 'therefore'."],
      ["Concision and redundancy", "Concisión y redundancia", "Choose the clearest, most concise wording that does not repeat an idea; remove redundancy ('past history', 'revert back'); keep needed meaning; formal register; when a longer choice is actually right."],
    ],
  },
  math: {
    algebra: [
      ["Linear equations in one variable", "Ecuaciones lineales con una variable", "Solve equations with variables on both sides, fractions and distribution; equations with no solution or infinitely many solutions (compare coefficients and constants); word problems translated into one equation; checking answers; solving for one variable in terms of others."],
      ["Linear functions and graphs", "Funciones lineales y gráficas", "y = mx + b; finding slope from two points or a graph; intercepts; writing an equation from a graph or table; parallel lines (same slope) and perpendicular lines (negative reciprocal slopes); function notation f(x); using the built-in Desmos graphing calculator to check."],
      ["Linear equations in two variables", "Ecuaciones lineales con dos variables", "Standard form Ax + By = C; finding intercepts; what each number means in a real situation (a cost per item and a total); building an equation from a word problem; points that satisfy an equation."],
      ["Systems of two linear equations", "Sistemas de dos ecuaciones lineales", "Substitution and elimination; the intersection of two lines; one solution, no solution (parallel lines) or infinitely many (same line) and how to see it from the equations; setting up a system from a word problem; checking with Desmos."],
      ["Linear inequalities", "Desigualdades lineales", "Solve and graph inequalities; flip the sign when multiplying or dividing by a negative; compound inequalities; one- and two-variable inequalities; shaded regions; systems of inequalities and which points satisfy both; word problems with minimums and maximums."],
      ["Interpreting linear models", "Interpretar modelos lineales", "What the slope and the y-intercept mean in context ('for each additional hour...'); predicted values; changing units; comparing two linear models; identifying the equation that models a described situation."],
    ],
    "advanced-math": [
      ["Equivalent expressions", "Expresiones equivalentes", "Rewrite expressions: distribute, combine like terms, factor out a common factor; exponent rules (product, quotient, power, negative and fractional exponents); radical simplification; adding and multiplying rational expressions; testing equivalence by substituting a number."],
      ["Polynomials and factoring", "Polinomios y factorización", "Factoring quadratics and the difference of squares; perfect-square trinomials; zeros of a polynomial from factored form; the factor and remainder ideas (if f(a) = 0 then x - a is a factor); simple polynomial division; end behavior."],
      ["Quadratic functions and equations", "Funciones y ecuaciones cuadráticas", "Standard, factored and vertex forms and what each shows; vertex, axis of symmetry, maximum or minimum; solving by factoring, the quadratic formula and completing the square; the discriminant and the number of real solutions; projectile word problems; using Desmos to find zeros and the vertex."],
      ["Exponential functions and growth", "Funciones exponenciales y crecimiento", "f(x) = a * b^x; growth versus decay (b > 1 or 0 < b < 1); percent change as a growth factor; compound interest; doubling and half-life; reading the starting value and growth rate; choosing an exponential versus a linear model."],
      ["Nonlinear equations in one variable", "Ecuaciones no lineales con una variable", "Radical equations and checking for extraneous solutions; rational equations and excluded values; absolute value equations (two cases); equations with exponents; when an equation has no real solution."],
      ["Systems with a nonlinear equation", "Sistemas con una ecuación no lineal", "A line and a parabola or circle: substitute and solve; the number of intersection points and the discriminant; reading intersections on a graph; setting up and using Desmos."],
      ["Function notation and transformations", "Notación de funciones y transformaciones", "Evaluate f(x) from equations, tables and graphs; f(x) + k, f(x + h), -f(x) and what they do to a graph; composition f(g(x)); domain and range; interpreting a function in context."],
    ],
    "problem-solving": [
      ["Ratios, rates and proportions", "Razones, tasas y proporciones", "Set up and solve proportions; unit rates; scale drawings and maps; rates in word problems (speed, price per item, work); direct and inverse variation basics."],
      ["Percentages", "Porcentajes", "Percent of a number; percent change and percent difference; successive percent changes (not additive); discounts, tax and tips; finding the original value; a percent as a decimal or fraction."],
      ["Units and unit conversion", "Unidades y conversión de unidades", "Dimensional analysis; converting between units step by step; squared and cubed units for area and volume; rates with mixed units (miles per hour to feet per second)."],
      ["One-variable data: center and spread", "Datos de una variable: centro y dispersión", "Mean, median, mode, range; standard deviation as a measure of spread (compare data sets without calculating); the effect of outliers and of adding or removing a value; histograms, dot plots and box plots; frequency tables."],
      ["Two-variable data and scatterplots", "Datos de dos variables y diagramas de dispersión", "Line of best fit and its equation; positive and negative association; interpolation versus extrapolation; residuals; choosing a linear or an exponential model; reading predicted values."],
      ["Reading tables, graphs and charts", "Leer tablas, gráficas y diagramas", "Extract values accurately from tables, bar graphs, line graphs and two-way tables; compare quantities; compute with values read from a graph; common traps such as the wrong axis, wrong units or a truncated scale."],
      ["Probability and conditional probability", "Probabilidad y probabilidad condicional", "Probability as favorable over total; two-way tables; conditional probability ('given that'); independent events and multiplying probabilities; the complement; simple expected value."],
      ["Sample statistics and margin of error", "Estadísticas de muestras y margen de error", "Population versus sample; random sampling and bias; to which population a result can be generalized; the meaning of a margin of error and a confidence interval; larger samples and smaller margins."],
      ["Evaluating statistical claims", "Evaluar afirmaciones estadísticas", "Observational study versus experiment; random assignment and causation; correlation does not prove causation; what conclusion the design of a study justifies and what it does not."],
    ],
    "geometry-trig": [
      ["Area and volume", "Área y volumen", "The reference sheet formulas (area of rectangle, triangle, circle; volume of prism, cylinder, cone, sphere, pyramid); composite shapes; how scaling a length changes area and volume; surface area and word problems with containers."],
      ["Lines, angles and triangles", "Rectas, ángulos y triángulos", "Angles on a line and around a point; parallel lines cut by a transversal; the triangle angle sum and exterior angle; isosceles and equilateral triangles; the triangle inequality; similar triangles and proportional sides; congruence."],
      ["Right triangles and trigonometry", "Triángulos rectángulos y trigonometría", "The Pythagorean theorem and common triples (3-4-5, 5-12-13, 8-15-17); special right triangles (45-45-90 and 30-60-90); sine, cosine and tangent (SOH-CAH-TOA); sin of an angle equals cos of its complement; radians and degrees."],
      ["Circles: equations, arcs and angles", "Círculos: ecuaciones, arcos y ángulos", "The circle equation (x - h)^2 + (y - k)^2 = r^2 and completing the square to find the center and radius; arc length and sector area as a fraction of the circle; central and inscribed angles; tangent lines."],
      ["Coordinate geometry: distance, midpoint and slope", "Geometría de coordenadas: distancia, punto medio y pendiente", "Distance and midpoint between two points; slope of a segment; equations of lines through points; finding a missing endpoint; area of shapes on a coordinate plane."],
    ],
  },
};

export const ACT_TOPICS: Outline = {
  english: {
    "production-of-writing": [
      ["Topic development", "Desarrollo del tema", "Questions on whether a sentence or detail should be added, kept or deleted, and what a sentence accomplishes in the paragraph or essay. Teach: check the writer's stated goal and relevance; 'Yes' versus 'No' answer pairs and why the reason must be accurate."],
      ["Organization, unity and cohesion", "Organización, unidad y cohesión", "Order of sentences inside a paragraph and of paragraphs in an essay; where a sentence best fits; unity (everything supports the main point); logical flow and signal words."],
      ["Introductions, conclusions and transitions", "Introducciones, conclusiones y transiciones", "What a good opening or closing sentence does; transition words by relationship (contrast, addition, cause, example); choosing the transition between sentences or paragraphs."],
    ],
    "knowledge-of-language": [
      ["Word choice and precision", "Elección de palabras y precisión", "Choose the most precise, appropriate word; connotation; consistent tone; avoid vague words; matching the word to the context."],
      ["Concision and redundancy", "Concisión y redundancia", "The shortest choice that keeps the full meaning is usually right; remove repeated ideas and wordy phrases; when 'NO CHANGE' is correct."],
      ["Style and tone", "Estilo y tono", "Match formal or informal style; keep a consistent point of view; choose phrasing that fits the audience and purpose."],
    ],
    conventions: [
      ["Sentence structure and boundaries", "Estructura y límites de la oración", "Fragments, run-ons and comma splices; joining clauses with a semicolon, a comma plus conjunction, or a period; subordination; complete sentences."],
      ["Punctuation", "Puntuación", "Commas (lists, introductory elements, nonessential information), semicolons, colons, dashes, apostrophes; the rule that a single comma should not separate a subject from its verb."],
      ["Agreement, pronouns and verbs", "Concordancia, pronombres y verbos", "Subject-verb agreement; pronoun agreement and clear antecedents; verb tense consistency; who versus whom; its versus it's; commonly confused words."],
      ["Modifiers and parallelism", "Modificadores y paralelismo", "Dangling and misplaced modifiers; parallel structure in lists and comparisons; idioms and prepositions; logical comparisons."],
    ],
  },
  math: {
    algebra: [
      ["Linear equations and inequalities", "Ecuaciones y desigualdades lineales", "Solve one-variable equations and inequalities; word problems; absolute value equations; flipping the inequality sign; slope-intercept form and graphs of lines."],
      ["Systems of equations", "Sistemas de ecuaciones", "Substitution and elimination; word problems that make two equations; number of solutions; linear systems on a graph."],
      ["Exponents, radicals and absolute value", "Exponentes, radicales y valor absoluto", "Exponent rules; simplifying radicals; rational exponents; scientific notation; absolute value expressions."],
      ["Expressions and factoring", "Expresiones y factorización", "Multiply and factor polynomials; special products; quadratic equations by factoring and the quadratic formula; simplify rational expressions; the ACT-style 'which expression is equivalent'."],
    ],
    functions: [
      ["Function notation and evaluation", "Notación de funciones y evaluación", "Evaluate f(x) at a value; composite functions; domain and range; reading values from a table or a graph."],
      ["Linear, quadratic and exponential functions", "Funciones lineales, cuadráticas y exponenciales", "Features of each function type; vertex of a parabola; growth and decay; logarithm basics; matching an equation to a situation."],
      ["Graphs and transformations", "Gráficas y transformaciones", "Shifts, reflections and stretches; identify a graph from its equation; intercepts and asymptotes; trigonometric graphs (amplitude and period)."],
      ["Sequences and patterns", "Sucesiones y patrones", "Arithmetic and geometric sequences; finding the nth term; sums of sequences; pattern problems."],
    ],
    geometry: [
      ["Angles, triangles and polygons", "Ángulos, triángulos y polígonos", "Angle relationships with parallel lines; triangle properties; similar triangles; interior angles of polygons; the Pythagorean theorem and special right triangles."],
      ["Perimeter, area and volume", "Perímetro, área y volumen", "Formulas for common shapes and solids; composite figures; scale changes; circles (arc, sector, chord)."],
      ["Coordinate geometry", "Geometría de coordenadas", "Distance, midpoint and slope; equations of lines and circles; transformations on the plane."],
      ["Trigonometry", "Trigonometría", "SOH-CAH-TOA; trigonometric ratios in right triangles; the unit circle basics; radians; law of sines and cosines basics."],
    ],
    "statistics-probability": [
      ["Mean, median and mode", "Media, mediana y moda", "Compute and compare averages; weighted averages; the effect of adding a value; range and spread; data in tables."],
      ["Probability and counting", "Probabilidad y conteo", "Simple and compound probability; independent versus dependent events; permutations and combinations basics; the fundamental counting principle."],
      ["Data displays and scatterplots", "Gráficas de datos y diagramas de dispersión", "Read histograms, box plots, tables and scatterplots; line of best fit; association; reading the graph correctly."],
      ["Ratios, percents and number sense", "Razones, porcentajes y sentido numérico", "Percent change, ratios and proportions, rates, unit conversion, fractions and decimals, number properties (even/odd, factors, multiples)."],
    ],
  },
  reading: {
    "key-ideas": [
      ["Main idea and theme", "Idea principal y tema", "Find the central idea of a passage or paragraph; fiction themes; summarize before choosing; avoid answers that are too narrow or broad."],
      ["Details and summaries", "Detalles y resúmenes", "Locate specific details quickly by line reference; paraphrase; choose the accurate summary; the answer is stated in the passage."],
      ["Relationships and inferences", "Relaciones e inferencias", "Cause and effect, sequence and comparison; draw conclusions that the text supports; character motives; do not go beyond the passage."],
    ],
    "craft-structure": [
      ["Word meaning in context", "Significado de palabras en contexto", "Choose the meaning a word has in this sentence; replace the word with each choice; connotation and tone."],
      ["Point of view and purpose", "Punto de vista y propósito", "Identify the author's or narrator's attitude and purpose; tone words; why a detail or paragraph is included."],
      ["Text structure", "Estructura del texto", "How the passage is organized (chronological, problem-solution, compare-contrast); the function of a paragraph or sentence."],
    ],
    integration: [
      ["Evaluating claims and evidence", "Evaluar afirmaciones y evidencia", "Distinguish claim from evidence; which detail supports a claim; reasoning in an argument."],
      ["Comparing passages", "Comparar pasajes", "Paired passages: find each author's main idea, then compare similarities and differences; Passage A versus Passage B questions."],
      ["Information shown in numbers", "Información en números y datos", "Passages that include numbers, tables or percentages; interpret and relate them to the text."],
    ],
  },
  science: {
    "interpretation-of-data": [
      ["Reading tables and graphs", "Leer tablas y gráficas", "Read values from tables, line graphs and bar graphs; units and axes; interpolation and extrapolation between points; the ACT Science habit of answering from the figure first."],
      ["Trends and relationships", "Tendencias y relaciones", "Direct and inverse relationships; increasing and decreasing trends; compare variables across trials; describing patterns in words."],
      ["Figures with several variables", "Figuras con varias variables", "Graphs or tables with two or more independent variables; hold one constant and compare; scatterplots and multiple curves."],
    ],
    "scientific-investigation": [
      ["Experimental design and variables", "Diseño experimental y variables", "Independent, dependent and controlled variables; the purpose of a control; how an experiment was set up; how to change a design to test a different idea."],
      ["Evaluating results", "Evaluar resultados", "Reading results and drawing conclusions; accuracy and sources of error; whether the data support a conclusion."],
      ["Predicting what changes", "Predecir qué cambia", "Use a trend to predict a new value; what happens to the result when a variable changes; reasoning about new trials."],
    ],
    "evaluation-of-models": [
      ["Comparing conflicting viewpoints", "Comparar puntos de vista opuestos", "Conflicting viewpoints passages (two or three scientists): summarize each view, find where they agree and disagree, and how each explains the data."],
      ["Supporting or weakening a hypothesis", "Apoyar o debilitar una hipótesis", "Which new finding would strengthen or weaken a viewpoint; how data fit each hypothesis."],
      ["Applying a model", "Aplicar un modelo", "Use a described model or theory to predict an outcome; check consistency with data."],
    ],
  },
};

export const TSI_TOPICS: Outline = {
  math: {
    quantitative: [
      ["Fractions, decimals and percents", "Fracciones, decimales y porcentajes", "Operations with fractions and mixed numbers; converting among fractions, decimals and percents; ordering numbers; percent of a number, percent change; order of operations; estimation."],
      ["Ratios, rates and proportions", "Razones, tasas y proporciones", "Ratios and unit rates; solving proportions; scale; direct and inverse variation; rate word problems."],
      ["Exponents, roots and number sense", "Exponentes, raíces y sentido numérico", "Integer exponents and rules; square roots and simplifying radicals; scientific notation; absolute value; number lines; factors, multiples, primes."],
      ["Word problems and units", "Problemas con palabras y unidades", "Translate words into math; multi-step problems; unit conversion; reading tables and simple formulas; estimation and checking answers."],
    ],
    algebraic: [
      ["Linear equations and inequalities", "Ecuaciones y desigualdades lineales", "Solve and graph linear equations and inequalities; literal equations (solve for a variable); slope and intercepts; writing an equation from a situation."],
      ["Systems of equations", "Sistemas de ecuaciones", "Solve by substitution, elimination or graphing; word problems; number of solutions."],
      ["Polynomials and factoring", "Polinomios y factorización", "Add, subtract and multiply polynomials; factoring (common factor, trinomials, difference of squares); simplifying rational expressions."],
      ["Quadratic equations", "Ecuaciones cuadráticas", "Solve by factoring, the quadratic formula and completing the square; the discriminant; applications and graphs of parabolas."],
      ["Functions and graphs", "Funciones y gráficas", "Function notation and evaluation; domain and range; reading graphs; linear, quadratic and exponential patterns; transformations."],
    ],
    geometric: [
      ["Perimeter, area and volume", "Perímetro, área y volumen", "Formulas for rectangles, triangles, circles, prisms, cylinders, cones and spheres; composite figures; units."],
      ["Angles, triangles and the Pythagorean theorem", "Ángulos, triángulos y el teorema de Pitágoras", "Angle relationships, parallel lines, triangle sums; right triangles and the Pythagorean theorem; special triangles."],
      ["Coordinate geometry and transformations", "Geometría de coordenadas y transformaciones", "Distance, midpoint, slope; graphing figures; reflections, translations, rotations and dilations."],
      ["Similarity and circles", "Semejanza y círculos", "Similar figures and scale factors; circle parts (radius, diameter, chord, arc); circumference and area; arc length and sector."],
    ],
    statistical: [
      ["Mean, median, mode and range", "Media, mediana, moda y rango", "Compute and compare measures of center and spread; the effect of outliers; weighted averages."],
      ["Data displays", "Gráficas de datos", "Read and interpret bar graphs, histograms, line graphs, box plots, dot plots and tables; choose a suitable display."],
      ["Probability", "Probabilidad", "Simple and compound probability; independent and dependent events; counting outcomes; expected outcomes."],
      ["Scatterplots and linear models", "Diagramas de dispersión y modelos lineales", "Association, trend line, predictions from a model, interpreting slope and intercept in context."],
    ],
  },
  elar: {
    "reading-ideas": [
      ["Main idea and supporting details", "Idea principal y detalles de apoyo", "Find the main idea of a passage; separate main ideas from details; summarize; locate stated details."],
      ["Inferences and conclusions", "Inferencias y conclusiones", "Draw conclusions supported by the text; make inferences across one or two texts; avoid unsupported leaps."],
      ["Evidence and claims", "Evidencia y afirmaciones", "Identify the author's claim and the evidence and reasoning used; judge whether evidence supports the claim."],
      ["Summarizing", "Resumir", "Condense a text accurately; choose the best summary; spot summaries that are too narrow or add opinion."],
    ],
    "reading-craft": [
      ["Vocabulary in context", "Vocabulario en contexto", "Meaning of a word or phrase from its context; context clues; prefixes, roots and suffixes; multiple meanings."],
      ["Author's purpose and point of view", "Propósito del autor y punto de vista", "Why the author wrote the text; audience; perspective and attitude; bias."],
      ["Text structure", "Estructura del texto", "Patterns of organization (cause and effect, compare and contrast, sequence, problem and solution); the role of a section."],
      ["Tone and rhetorical devices", "Tono y recursos retóricos", "Tone and mood words; figurative language; appeals (logic, emotion, credibility); effect of word choice."],
    ],
    "revision-logic": [
      ["Organization and transitions", "Organización y transiciones", "Order sentences and ideas logically; choose transitions by relationship; topic sentences and conclusions."],
      ["Combining sentences", "Combinar oraciones", "Combine short sentences with conjunctions, clauses or phrases; avoid run-ons; keep the meaning."],
      ["Concision and relevance", "Concisión y relevancia", "Delete redundant or off-topic words and sentences; choose the clearest wording."],
      ["Sentence logic", "Lógica de las oraciones", "Logical relationships between ideas; parallel structure; consistent tone and style."],
    ],
    conventions: [
      ["Sentence boundaries", "Límites de la oración", "Fragments, run-ons, comma splices; ways to join and separate sentences; complete sentences."],
      ["Punctuation", "Puntuación", "Commas, semicolons, colons, apostrophes, quotation marks; punctuating lists and interrupters."],
      ["Agreement", "Concordancia", "Subject-verb and pronoun-antecedent agreement; collective nouns; confusing words."],
      ["Verb tense, pronouns and modifiers", "Tiempo verbal, pronombres y modificadores", "Consistent verb tense; pronoun case and clarity; misplaced and dangling modifiers; parallel structure."],
    ],
  },
};
