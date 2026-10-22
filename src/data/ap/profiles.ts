// Course profiles: what each AP course is about, and what must never be tested in it.
// They keep AI-written notes and questions inside the right course (for example, no AP Chemistry
// ideas in an AP Biology question). Written from the published course structure and checked against
// public study guides; they are outline-level, so compare them with the official Course and Exam Description (CED).
export interface Profile { about: string; avoid: string; /** How real questions in this course are built. */ style?: string }

const lang = (name: string, extra = ""): Profile => ({
  about: `Interpretive, interpersonal and presentational communication in ${name}, across six themes: families and communities, personal and public identities, beauty and aesthetics, science and technology, contemporary life, and global challenges. Text-only questions give a short written passage, message, email, article or chart entirely in ${name} (written in the prompt) and ask for the main idea, details, purpose, tone, inference, and vocabulary or grammar in context. Everything the student reads is in ${name}.${extra}`,
  avoid: `Audio-only items, English-language stimulus passages, slang that is not explained by the context, and regional idioms that most students would not know.`,
});

export const PROFILES: Record<string, Profile> = {
  "AP Statistics": {
    about: "High school statistics: exploring one-variable and two-variable data, collecting data (sampling and experiments), probability and random variables, sampling distributions, and inference (confidence intervals and significance tests for proportions, means, chi-square and slopes). Questions give a short context or data summary and ask students to describe, check conditions, calculate with a calculator, and interpret results in context.",
    avoid: "Calculus-based probability, matrix algebra, Bayesian methods, regression with more than one predictor, and any formula that is not taught in the course.",
  },
  "AP US History": {
    about: "United States history from 1491 to the present in nine periods, using themes such as identity, work and exchange, politics and power, America in the world, environment and geography, and culture and society. Questions give a short primary or secondary source excerpt, image or data (written in the prompt) and test historical thinking: contextualization, comparison, causation, continuity and change, and argumentation.",
    avoid: "World history beyond what shaped the United States, college-level historiography debates, and obscure names or dates outside the framework.",
  },
  "AP Human Geography": {
    about: "Human geography: thinking geographically, population and migration, cultural patterns and processes, political patterns, agriculture and rural land use, cities and urban land use, and industrial and economic development. Questions use maps, tables, graphs, and models (for example the demographic transition model, Von Thünen, Burgess, Hoyt, Christaller) described in words.",
    avoid: "Physical geography detail (geology, climate science) except as context, technical GIS programming, and memorizing country capitals.",
  },
  "AP African American Studies": {
    about: "Interdisciplinary study of African American history, culture and ideas in four units: origins of the African diaspora, freedom, enslavement and resistance, the practice of freedom, and movements and debates. Questions use short primary sources, texts, art, music and data described in words, and ask students to analyze sources, context and perspectives.",
    avoid: "Current partisan political opinions and content outside the course framework.",
  },
  "AP Art History": {
    about: "Global art history from prehistory to the present, built around required works. Questions describe a work in words (title, culture, date, medium, subject, form) and ask students to identify context, function, form and content, and to compare works.",
    avoid: "Studio technique, and questions that depend on seeing an image the prompt does not describe.",
  },
  "AP Biology": {
    about: "College-level introductory biology in eight units: chemistry of life, cell structure and function, cellular energetics, cell communication and the cell cycle, heredity, gene expression and regulation, natural selection, and ecology. The exam stresses the science practices: explain concepts, analyze visual representations, design and critique experiments, describe and analyze data (including simple statistics such as chi-square and error bars), and argue a claim with evidence and reasoning. Chemistry appears only as far as biology needs it, for example water's polarity, hydrogen bonds and functional groups.",
    avoid: "AP Chemistry content: enthalpy and Gibbs free energy calculations, vapor pressure, colligative properties, bond energies, pH and equilibrium calculations, and comparing biological molecules with non-biological compounds such as HF or ammonia. Also avoid physics-level treatments and detailed organic reaction mechanisms.",
  },
  "AP Calculus AB": {
    about: "Limits and continuity, derivatives, integrals and the Fundamental Theorem of Calculus, with applications such as related rates, optimization, accumulation, differential equations and slope fields. Functions are given by equations, graphs, tables or a verbal context, and students justify answers with theorems and interpret results in context.",
    avoid: "Series, parametric, polar and vector topics (those are Calculus BC), multivariable calculus, and formal epsilon-delta proofs.",
  },
  "AP Calculus BC": {
    about: "Everything in Calculus AB plus integration by parts and partial fractions, improper integrals, Euler's method, logistic growth, parametric, polar and vector-valued functions, and infinite sequences and series (convergence tests, Taylor and Maclaurin series, error bounds). Functions are given by equations, graphs, tables or a context.",
    avoid: "Multivariable calculus, differential equations beyond separable, Euler and logistic, and proofs beyond the course.",
  },
  "AP Chemistry": {
    about: "General chemistry in nine units: atomic structure, molecular and ionic structure, intermolecular forces and properties, chemical reactions, kinetics, thermodynamics, equilibrium, acids and bases, and applications of thermodynamics (entropy, free energy, electrochemistry). Questions use data tables, particulate diagrams described in words, graphs and calculations, and ask students to justify answers with chemical principles.",
    avoid: "Organic reaction mechanisms, biochemistry detail, quantum mechanics beyond the course, and derivations.",
  },
  "AP Comparative Government and Politics": {
    about: "Comparative politics of six countries (the United Kingdom, Russia, China, Mexico, Iran and Nigeria) across political systems and regimes, political institutions, political culture and participation, party and electoral systems, and political and economic change. Questions give a short scenario or data table and ask students to define concepts, compare countries and explain.",
    avoid: "United States government content, other countries except as a brief comparison, and current-events trivia.",
  },
  "AP Computer Science A": {
    about: "Programming in Java: primitive types, using objects, boolean expressions and if statements, iteration, writing classes, arrays, ArrayList, 2D arrays, inheritance, recursion, searching and sorting. Questions show Java code in the prompt and ask students to trace it, predict output, find errors, and complete or analyze methods.",
    avoid: "Other programming languages, Java features outside the AP Java subset (lambdas, streams, generics definitions, threads), GUI programming and external libraries.",
  },
  "AP Computer Science Principles": {
    about: "Computing in five big ideas: creative development, data, algorithms and programming, computer systems and networks, and the impact of computing. Questions use the AP reference-style pseudocode (not a specific language), short scenarios and data, and ask students to analyze algorithms, data, networks and the effects of computing on people.",
    avoid: "Syntax of a specific language such as Python or Java, advanced algorithms beyond the course, and hardware engineering.",
  },
  "AP English Language and Composition": {
    about: "Rhetoric and argument: analyzing nonfiction prose (rhetorical situation, claims, evidence, reasoning, organization and style) and writing arguments. Multiple-choice questions include the passage in the prompt and ask about rhetorical choices, claims, evidence, organization, tone, and revising sentences; free response asks for rhetorical analysis, argument and synthesis essays.",
    avoid: "Fiction and poetry analysis as the main task (that is AP Literature), grammar drills unrelated to rhetoric, and obscure literary terms.",
  },
  "AP English Literature and Composition": {
    about: "Literary analysis of short fiction, poetry and drama: character, setting, structure, narration, figurative language and literary argument. Questions include a short passage of fiction, poetry or drama in the prompt and ask about meaning, devices, structure, tone and effect.",
    avoid: "Nonfiction rhetorical analysis as the main task (that is AP Language), plot recall of long works that are not given in the prompt, and obscure criticism.",
  },
  "AP Environmental Science": {
    about: "Interdisciplinary environmental science in nine units: ecosystems, biodiversity, populations, earth systems and resources, land and water use, energy resources, atmospheric pollution, aquatic and terrestrial pollution, and global change. Questions use scenarios, data tables and graphs and simple calculations (percent change, rates, unit conversion, the 10% rule), and ask students to analyze human impacts and propose and evaluate solutions.",
    avoid: "Detailed organic chemistry, advanced thermodynamics, college-level ecology models beyond the course, and political opinions or current-events trivia.",
  },
  "AP European History": {
    about: "European history from about 1450 to the present in nine units, using themes such as interaction of Europe and the world, economic and commercial developments, cultural and intellectual developments, states and other institutions of power, social organization, and national and European identity. Questions give a short source excerpt, image or data in the prompt and test historical thinking skills.",
    avoid: "United States or other non-European history except as context, obscure names and dates, and historiographical debates beyond the framework.",
  },
  "AP Macroeconomics": {
    about: "Macroeconomics: basic economic concepts, economic indicators and the business cycle (GDP, unemployment, inflation), national income and price determination (aggregate demand and supply), the financial sector (money, banking, interest rates, the loanable funds market), long-run consequences of stabilization policies (the Phillips curve, fiscal and monetary policy), and the open economy (exchange rates and the balance of payments). Questions use graphs described in words, scenarios and simple calculations.",
    avoid: "Firm-level microeconomic theory except as needed, econometrics, and calculus-based models.",
  },
  "AP Microeconomics": {
    about: "Microeconomics: basic economic concepts, supply and demand, elasticity, consumer and producer surplus and taxes, costs of production, market structures (perfect competition, monopoly, oligopoly and monopolistic competition), factor markets, and market failure and the role of government. Questions use graphs described in words, scenarios and simple calculations.",
    avoid: "Macroeconomic aggregates (GDP, aggregate demand and supply, fiscal and monetary policy), game theory beyond a basic payoff matrix, and calculus-based optimization.",
  },
  "AP Music Theory": {
    about: "Written music theory and aural skills: pitch, rhythm and meter, scales and keys, intervals, triads and seventh chords, harmonic progressions and cadences, part writing, form, texture and melodic ideas. This is a text-only quiz, so questions describe notation in words (note names, scale degrees, Roman numerals, rhythm values) and never depend on audio.",
    avoid: "Audio-dependent questions, music history trivia and instrument technique.",
  },
  "AP Physics 1": {
    about: "Algebra-based mechanics: kinematics, forces and Newton's laws, work, energy and power, linear momentum, torque and rotation, oscillations, and fluids. Questions use experimental setups, graphs and free-body diagrams described in words, and ask for qualitative reasoning, short justifications and algebraic calculations.",
    avoid: "Calculus, electricity and magnetism, thermodynamics, optics and modern physics (those belong to Physics 2 or Physics C).",
  },
  "AP Physics 2": {
    about: "Algebra-based thermodynamics, electric force, field and potential, circuits, magnetism and electromagnetic induction, geometric optics, waves, sound and physical optics, and modern physics. Questions use experimental scenarios, circuit and ray diagrams described in words, graphs and calculations, and ask for qualitative and quantitative reasoning.",
    avoid: "Calculus, mechanics-only questions (those belong to Physics 1) and college-level derivations.",
  },
  "AP Physics C: Mechanics": {
    about: "Calculus-based mechanics: kinematics, Newton's laws, work, energy and power, systems of particles and linear momentum, rotation, oscillations and gravitation. Problems use derivatives and integrals, for example force as a function of position or time.",
    avoid: "Electricity and magnetism, thermodynamics, fluids, optics and modern physics.",
  },
  "AP Physics C: Electricity and Magnetism": {
    about: "Calculus-based electricity and magnetism: electrostatics and Gauss's law, conductors, capacitors and dielectrics, circuits including RC circuits, magnetic fields (Biot-Savart and Ampere's law), and electromagnetic induction and inductance.",
    avoid: "Mechanics, thermodynamics, optics and modern physics.",
  },
  "AP Precalculus": {
    about: "Functions and modeling: polynomial and rational functions, exponential and logarithmic functions, trigonometric and polar functions, and functions involving parameters, vectors and matrices. Questions use graphs, tables, equations and rates of change, and ask students to analyze and model with functions.",
    avoid: "Calculus (limits, derivatives, integrals) beyond rates of change, and formal proofs.",
  },
  "AP Psychology": {
    about: "Psychology: scientific foundations and research methods, biological bases of behavior, sensation and perception, cognition, learning and development, social psychology and personality, and mental and physical health. Questions give a short scenario or study description and ask students to apply terms, interpret research designs, and tell similar concepts apart. Diagnosing real people is never the task.",
    avoid: "Medical neuroscience beyond the course, college-level statistics beyond basic descriptive and inferential ideas, and pop-psychology claims that research does not support.",
  },
  "AP Spanish Language and Culture": lang("Spanish"),
  "AP Spanish Literature and Culture": {
    about: "Reading and analysis of required Spanish-language literary works and genres from Spain and Latin America across literary periods. Questions give a short excerpt in Spanish in the prompt and ask about themes, literary devices, context and structure. Everything the student reads is in Spanish.",
    avoid: "Works that are not on the course reading list unless the excerpt is given in full in the prompt, and plot recall of whole works.",
  },
  "AP United States Government and Politics": {
    about: "United States government and politics: foundations of American democracy, interactions among branches of government, civil liberties and civil rights, American political ideologies and beliefs, and political participation. The course includes required Supreme Court cases and foundational documents. Questions use scenarios, data and short excerpts, and ask students to apply concepts.",
    avoid: "Comparative politics, current partisan opinions, and cases that are not required except as brief examples.",
  },
  "AP World History: Modern": {
    about: "World history from about 1200 to the present in nine units: the global tapestry, networks of exchange, land-based empires, transoceanic interconnections, revolutions, industrialization, global conflict, the Cold War and decolonization, and globalization. Questions give a short source excerpt, map or data in the prompt and test historical thinking skills.",
    avoid: "Ancient history before about 1200, United States-only detail, and obscure dates.",
  },
  "AP Seminar": {
    about: "Interdisciplinary inquiry: analyzing a stimulus text, understanding and evaluating arguments, perspectives, evidence and reasoning, synthesizing sources, and communicating an argument. Questions give a short stimulus and ask about claims, evidence, reasoning, perspective and bias.",
    avoid: "Subject-specific content knowledge from a single discipline.",
  },
  "AP Research": {
    about: "Independent academic research: forming a research question, methods and design, ethics, collecting and analyzing data, and writing and presenting an academic paper. Questions give a short research scenario and ask students to evaluate methods, design, evidence and ethics.",
    avoid: "Content from a single subject and statistical tests beyond a basic level.",
  },
  "AP Studio Art": {
    about: "A portfolio course (2-D, 3-D or drawing) built around a sustained investigation, selected works and the art-making process. A text-only quiz can ask about the elements and principles of design, processes, and how to describe and write about a sustained investigation.",
    avoid: "Judging an image the prompt does not describe, and art history trivia.",
  },
  "AP Chinese Language and Culture": lang("Chinese", " Use simplified characters and add pinyin only when the question is about pronunciation."),
  "AP French Language and Culture": lang("French"),
  "AP German Language and Culture": lang("German"),
  "AP Italian Language and Culture": lang("Italian"),
  "AP Japanese Language and Culture": lang("Japanese", " Use standard Japanese script (kanji, hiragana and katakana) and add furigana only when needed."),
  "AP Latin": {
    about: "Reading and translating Latin from Vergil's Aeneid and Caesar's Gallic War. Questions include a Latin passage in the prompt and ask about grammar, syntax, vocabulary, translation, context and literary analysis.",
    avoid: "Passages that are not in the prompt, and writing Latin prose.",
  },
};
