// Single source of truth for every feature in the app.
// The sidebar, tab home screens, "Coming soon" previews, and FEATURES.md are all
// generated from this file. To ship a feature, add its key to BUILT.
import type { IconName } from "./icons";

export type Lang = "en" | "es";
export type L10n = Record<Lang, string>;
export type Status = "built" | "soon";

export interface Tool {
  id: string;
  key: string; // "tab/tool"
  icon: IconName;
  name: L10n;
  desc: L10n;
  phase: number;
  status: Status;
  local: boolean; // runs fully on the device, no AI, no database
}
export interface Tab {
  id: string;
  icon: IconName;
  name: L10n;
  tools: Tool[];
}
export interface Group {
  id: string;
  name: L10n;
  tabs: Tab[];
}

/** Features that are finished. Everything else shows a "Coming soon" preview. */
export const BUILT = new Set<string>([
  "settings/appearance",
  "settings/language",
  "settings/account",
  "settings/privacy",
  "settings/transparency",
  "profile/profile",
  "profile/interests",
  "coach/chat",
  "coach/homework",
  "coach/eli12",
  "coach/practice",
  "plan/builder",
  "plan/templates",
  "plan/checklists",
  "plan/adjust",
  "sat/overview",
  "sat/diagnostic",
  "sat/sections",
  "sat/full",
  "sat/scores",
  "sat/resources",
  "psat/overview",
  "psat/diagnostic",
  "psat/sections",
  "psat/full",
  "psat/scores",
  "psat/resources",
  "study/mistakes",
  "study/weak",
  "act/overview",
  "act/diagnostic",
  "act/sections",
  "act/full",
  "act/scores",
  "act/resources",
  "tsi/overview",
  "tsi/diagnostic",
  "tsi/sections",
  "tsi/full",
  "tsi/scores",
  "tsi/resources",
  "ap/courses",
  "ap/dashboard",
  "ap/quizzes",
  "ap/exam",
  "ap/score",
  "ap/weak",
  "ap/resources",
  "find/search",
  "find/saved",
  "find/scams",
  "grades/gpa",
  "grades/grade",
  "focus/pomodoro",
  "homework/tracker",
  "homework/backward",
  "notes/cornell",
  "notes/flashcards",
  "notes/spaced",
  "habits/tracker",
  "calendar/countdown",
  "math/units",
  "money/compound",
  "money/savings",
  "money/paycheck",
  "homework/todo",
  "homework/eisenhower",
  "math/fractions",
  "math/geometry",
  "math/drills",
  "habits/smart",
  "calendar/deadlines",
  "calendar/reminders",
  "focus/logger",
  "focus/stats",
  "habits/weekly",
  "habits/monthly",
  "habits/journal",
  "habits/routines",
  "habits/stacking",
  "college/cost",
  "college/converter",
  "grades/rank",
  "grades/credits",
  "achievements/tracker",
  "achievements/volunteer",
  "achievements/certificates",
  "achievements/brag",
  "achievements/resume",
  "wellbeing/mood",
  "wellbeing/sleep",
  "wellbeing/contacts",
  "profile/why",
  "money/budget",
  "profile/progress",
  "profile/levels",
  "profile/streaks",
  "profile/avatar",
  "achievements/badges",
  "math/periodic",
  "math/molar",
  "math/balancer",
  "math/formulas",
  "math/scientific",
  "math/graphing",
  "college/careers",
  "college/quiz",
  "college/dayinlife",
  "college/majors",
  "college/colleges",
  "college/scholarships",
  "college/fafsa",
  "college/dual",
  "college/trades",
  "college/military",
  "grades/txgrad",
  "grades/txadmit",
  "money/laborlaw",
  "local/map",
  "local/bus",
  "local/tutoring",
  "local/events",
  "local/wifi",
  "local/gear",
  "local/feewaiver",
  "wellbeing/stress",
  "wellbeing/breaks",
  "find/seasonal",
  "foryou/quote",
  "study/courses",
  "focus/playlist",
  "calendar/schoolyear",
  "calendar/semester",
  "calendar/schedule",
  "calendar/timeblock",
  "calendar/conflicts",
  "calendar/overload",
  "calendar/gcal",
  "plan/catchup",
  "plan/studyplanner",
  "plan/packing",
  "calendar/autoschedule",
  "homework/backpack",
  "homework/frog",
  "homework/twominute",
  "homework/kanban",
  "homework/groupproject",
  "homework/inbox",
  "homework/groupplanner",
  "focus/focusmode",
  "focus/distraction",
  "focus/braingames",
  "habits/ladder",
  "habits/vision",
  "habits/audit",
  "habits/estimator",
  "wellbeing/energy",
  "wellbeing/screen",
  "wellbeing/burnout",
  "wellbeing/balance",
  "calendar/weekly",
  "calendar/sports",
  "writing/outline",
  "writing/thesis",
  "writing/counter",
  "writing/readlevel",
  "writing/paraphrase",
  "writing/readlog",
  "writing/readspeed",
  "writing/typing",
  "writing/vocabbuilder",
  "writing/vocabctx",
  "notes/mindmap",
  "notes/outline",
  "notes/palace",
  "math/labreport",
  "math/datagraph",
  "languages/conjugation",
  "languages/transcards",
  "languages/pronunciation",
  "study/methods",
  "study/testday",
  "study/timed",
  "study/daily",
  "study/speaking",
  "study/debate",
  "study/sciencefair",
]);

/** Tools marked [LOCAL] in the plan: no AI, no database, work offline. */
const LOCAL = new Set<string>([
  "grades/gpa", "grades/grade", "grades/rank", "grades/credits", "grades/txgrad", "grades/txadmit",
  "homework/tracker", "homework/backward", "homework/backpack", "homework/todo", "homework/eisenhower",
  "homework/frog", "homework/twominute", "homework/kanban", "homework/groupproject", "homework/inbox",
  "focus/pomodoro", "focus/focusmode", "focus/logger", "focus/stats", "focus/distraction",
  "focus/braingames", "focus/playlist",
  "habits/tracker", "habits/stacking", "habits/smart", "habits/ladder", "habits/vision", "habits/routines",
  "habits/journal", "habits/weekly", "habits/monthly", "habits/audit", "habits/estimator",
  "notes/cornell", "notes/mindmap", "notes/outline", "notes/spaced", "notes/palace",
  "math/scientific", "math/graphing", "math/fractions", "math/geometry", "math/units", "math/formulas",
  "math/periodic", "math/balancer", "math/molar", "math/drills", "math/labreport", "math/datagraph",
  "writing/outline", "writing/thesis", "writing/counter", "writing/readlog", "writing/readspeed",
  "writing/typing", "languages/conjugation", "languages/transcards",
  "study/methods", "study/testday", "study/timed",
  "calendar/countdown", "calendar/schoolyear", "calendar/schedule", "calendar/semester",
  "calendar/timeblock", "calendar/sports", "plan/packing",
  "money/paycheck", "money/savings", "money/compound", "college/cost", "college/converter",
  "wellbeing/mood", "wellbeing/sleep", "wellbeing/energy", "wellbeing/screen", "wellbeing/breaks",
  "profile/why", "foryou/quote",
]);

const t = (
  tab: string, id: string, icon: IconName, en: string, es: string,
  den: string, des: string, phase: number,
): Tool => {
  const key = `${tab}/${id}`;
  return {
    id, key, icon, phase,
    name: { en, es },
    desc: { en: den, es: des },
    status: BUILT.has(key) ? "built" : "soon",
    local: LOCAL.has(key),
  };
};
const tab = (id: string, icon: IconName, en: string, es: string, tools: Tool[]): Tab => ({
  id, icon, name: { en, es }, tools,
});
const group = (id: string, en: string, es: string, tabs: Tab[]): Group => ({
  id, name: { en, es }, tabs,
});

export const GROUPS: Group[] = [
  group("explore", "Explore", "Explorar", [
    tab("foryou", "flag", "For You", "Para ti", [
      t("foryou", "feed", "star", "Recommendation feed", "Recomendaciones para ti", "A feed of opportunities, tools and plans picked from your interests, grade and area, each with a reason.", "Una lista de oportunidades, herramientas y planes según tus intereses, tu grado y tu zona, cada uno con su razón.", 1),
      t("foryou", "weekly", "calendar-check", "Picked for you this week", "Lo mejor de tu semana", "A short weekly summary of the best matches for you.", "Un resumen corto cada semana con lo que más te conviene.", 3),
      t("foryou", "trynew", "shuffle", "Try something new", "Prueba algo nuevo", "One in five picks sits outside your usual interests so you can discover more.", "Una de cada cinco recomendaciones sale de tus intereses de siempre para que descubras más.", 3),
      t("foryou", "quote", "quote", "Quote of the day", "Frase del día", "A short quote in English and Spanish to start the day.", "Una frase corta en inglés y español para empezar el día.", 9),
      t("foryou", "challenge", "target", "Challenge of the month", "Reto del mes", "A monthly goal, like volunteering five hours, with your progress.", "Una meta cada mes, como hacer cinco horas de voluntariado, con tu avance.", 9),
    ]),
    tab("find", "search", "Find", "Buscar", [
      t("find", "search", "search", "Opportunity search", "Buscar oportunidades", "Describe what you want in plain words and get real listings near you, each with its source link.", "Cuenta lo que buscas con tus palabras y recibe oportunidades reales cerca de ti, cada una con su enlace.", 1),
      t("find", "saved", "bookmark", "My Saved", "Mis guardados", "Everything you saved, with dates, costs and deadlines.", "Todo lo que guardaste, con fechas, costos y fechas límite.", 1),
      t("find", "scams", "shield-alert", "Scam warning guide", "Guía para detectar fraudes", "How to spot listings that ask for money upfront or private information.", "Cómo reconocer ofertas que piden dinero por adelantado o datos privados.", 1),
      t("find", "map", "map", "Map view", "Vista de mapa", "See opportunities on a map around you.", "Mira las oportunidades en un mapa cerca de ti.", 3),
      t("find", "surprise", "shuffle", "Surprise me", "Sorpréndeme", "One random opportunity you might never think to search for.", "Una oportunidad al azar que quizás nunca pensaste buscar.", 3),
      t("find", "trending", "trending", "Trending near you", "Lo que más se guarda cerca", "What nearby students save most, as anonymous counts only.", "Lo que más guardan estudiantes cerca de ti, solo en cantidades anónimas.", 3),
      t("find", "similar", "layers", "Similar opportunities", "Oportunidades parecidas", "If you liked one, see more like it.", "Si te gustó una, mira más como esa.", 3),
      t("find", "seasonal", "calendar-days", "Seasonal suggestions", "Ideas de temporada", "Summer programs in spring, volunteering in November, scholarships in fall.", "Programas de verano en primavera, voluntariado en noviembre, becas en otoño.", 3),
      t("find", "history", "history", "Search history", "Historial de búsquedas", "Run an earlier search again with one tap.", "Repite una búsqueda anterior con un toque.", 3),
      t("find", "alerts", "bell", "Saved searches and alerts", "Búsquedas guardadas y avisos", "Get told when something new matches a search you saved.", "Entérate cuando aparezca algo nuevo para una búsqueda guardada.", 3),
      t("find", "reviews", "message", "Student reviews", "Opiniones de estudiantes", "Short tips from students who went, moderated.", "Consejos cortos de estudiantes que ya fueron, con moderación.", 3),
      t("find", "flyer", "printer", "Printable flyers", "Volantes para imprimir", "Turn any opportunity into a flyer to post at school.", "Convierte cualquier oportunidad en un volante para pegar en tu escuela.", 9),
    ]),
    tab("college", "graduation", "College and Career", "Universidad y carrera", [
      t("college", "careers", "briefcase", "Career explorer", "Explorador de carreras", "Pay, schooling needed and a typical day for each career.", "Sueldo, estudios necesarios y un día típico de cada carrera.", 3),
      t("college", "quiz", "puzzle", "Interest quiz", "Cuestionario de intereses", "A short quiz that suggests careers and matching opportunities.", "Un cuestionario corto que sugiere carreras y oportunidades.", 3),
      t("college", "dayinlife", "video", "Day in the life videos", "Un día en la vida", "Links to videos of what the job is really like.", "Enlaces a videos de cómo es realmente el trabajo.", 3),
      t("college", "colleges", "school", "College finder", "Buscador de universidades", "Colleges that fit your interests and budget, including UTRGV and South Texas College.", "Universidades que van con tus intereses y presupuesto, incluyendo UTRGV y South Texas College.", 3),
      t("college", "majors", "book", "Major explorer", "Explorador de carreras universitarias", "What you study, where it leads, and which Texas colleges offer it.", "Qué se estudia, a dónde lleva y qué universidades de Texas la ofrecen.", 3),
      t("college", "cost", "calculator", "College cost calculator", "Calculadora de costo universitario", "Tuition, housing and books, minus scholarships and an estimated Pell Grant.", "Colegiatura, vivienda y libros, menos becas y una Beca Pell estimada.", 3),
      t("college", "converter", "repeat", "SAT and ACT converter", "Conversor de SAT y ACT", "Convert a score from one test to the other.", "Convierte un puntaje de una prueba a la otra.", 3),
      t("college", "scholarships", "award", "Scholarship matcher", "Buscador de becas", "Scholarships filtered by grade, interests, location and first-generation status.", "Becas filtradas por grado, intereses, lugar y si eres el primero de tu familia en ir a la universidad.", 3),
      t("college", "fafsa", "file-check", "FAFSA helper", "Ayuda con FAFSA", "A plain-language guide to financial aid, in English and Spanish.", "Una guía sencilla de ayuda financiera, en español e inglés.", 3),
      t("college", "dual", "calendar-clock", "Dual enrollment info", "Inscripción doble", "How to earn college credit while still in high school.", "Cómo ganar créditos universitarios mientras sigues en la prepa.", 3),
      t("college", "trades", "wrench", "Trade and certification paths", "Oficios y certificaciones", "Welding, HVAC, nursing assistant, coding and more.", "Soldadura, aire acondicionado, asistente de enfermería, programación y más.", 3),
      t("college", "military", "shield-check", "Military and ROTC info", "Militar y ROTC", "Straight information on service and ROTC paths.", "Información clara sobre el servicio militar y ROTC.", 3),
      t("college", "apptracker", "list-checks", "College application tracker", "Seguimiento de solicitudes", "Status, essays and letters for each application.", "Estado, ensayos y cartas de cada solicitud.", 2),
      t("college", "reclett", "mail", "Recommendation letter helper", "Cartas de recomendación", "Track who you asked and send a polite reminder.", "Lleva la cuenta de a quién se la pediste y manda un recordatorio amable.", 2),
      t("college", "emailhelper", "pen", "Email and application helper", "Ayuda con correos y solicitudes", "Learn to write inquiry emails and short statements, with guidance instead of a ghostwriter.", "Aprende a escribir correos y textos cortos, con guía en vez de que te lo escriban.", 2),
      t("college", "essayfeedback", "file-text", "Essay feedback", "Comentarios sobre tu ensayo", "Comments on your essay without rewriting it for you.", "Comentarios sobre tu ensayo sin reescribirlo por ti.", 2),
    ]),
    tab("local", "map-pin", "Local Resources", "Recursos locales", [
      t("local", "map", "map-pin", "Local resource map", "Mapa de recursos", "Libraries, free WiFi, Workforce Solutions and community centers.", "Bibliotecas, WiFi gratis, Workforce Solutions y centros comunitarios.", 8),
      t("local", "bus", "bus", "Bus route helper", "Rutas de autobús", "Valley Metro routes to the places you want to go.", "Rutas de Valley Metro a los lugares que quieres visitar.", 8),
      t("local", "tutoring", "users", "Free tutoring finder", "Tutorías gratis", "Library, school and free online tutoring.", "Tutorías gratis en bibliotecas, escuelas y en línea.", 8),
      t("local", "events", "ticket", "Local events feed", "Eventos locales", "City, library and university events in the Valley.", "Eventos de la ciudad, bibliotecas y universidades del Valle.", 8),
      t("local", "wifi", "wifi", "Free WiFi and library access", "WiFi gratis y bibliotecas", "Where to get online for free.", "Dónde conectarte gratis.", 8),
      t("local", "gear", "gift", "Free gear and supplies", "Equipo y útiles gratis", "Laptops, sports equipment and school supplies programs.", "Programas de laptops, equipo deportivo y útiles escolares.", 8),
      t("local", "feewaiver", "ticket", "Fee waiver finder", "Exención de cuotas", "Waivers for tests, applications and competitions.", "Exenciones para exámenes, solicitudes y competencias.", 8),
    ]),
  ]),

  group("learn", "Learn", "Aprender", [
    tab("coach", "message", "Coach", "Entrenador", [
      t("coach", "chat", "message", "Coach chat", "Chat con tu entrenador", "Talk through goals, homework, applications or anything else.", "Habla de tus metas, tarea, solicitudes o lo que quieras.", 1),
      t("coach", "homework", "lightbulb", "Homework mode", "Modo tarea", "Teaches step by step and asks guiding questions instead of just giving answers.", "Te enseña paso a paso y hace preguntas en vez de solo dar la respuesta.", 1),
      t("coach", "practice", "swords", "Practice modes", "Modos de práctica", "Mock interview, debate opponent, or quiz me.", "Entrevista de práctica, rival de debate o preguntas de repaso.", 1),
      t("coach", "interview", "briefcase", "Interview practice for an opportunity", "Entrevista para una oportunidad", "Practice for a specific saved opportunity.", "Practica para una oportunidad que guardaste.", 2),
      t("coach", "eli12", "lightbulb", "Explain like I'm 12", "Explícamelo fácil", "Simplifies any concept.", "Explica cualquier tema de forma sencilla.", 4),
    ]),
    tab("study", "brain", "Study", "Estudiar", [
      t("study", "methods", "list-tree", "Study method picker", "Elige cómo estudiar", "Suggests active recall, the Feynman technique or practice testing.", "Sugiere repaso activo, la técnica Feynman o exámenes de práctica.", 4),
      t("study", "feynman", "lightbulb", "Feynman explainer", "Explícalo con tus palabras", "Explain a topic simply and find the gaps.", "Explica un tema con palabras sencillas y descubre lo que te falta.", 4),
      t("study", "mistakes", "notebook", "Mistake notebook", "Cuaderno de errores", "Every question you missed, brought back later.", "Cada pregunta que fallaste, para repasarla después.", 1),
      t("study", "weak", "target", "Weak spot finder", "Tus puntos débiles", "Which topics you miss most.", "Los temas que más se te dificultan.", 1),
      t("study", "staar", "file-check", "STAAR practice", "Práctica de STAAR", "STAAR-style questions by subject and grade.", "Preguntas estilo STAAR por materia y grado.", 4),
      t("study", "testday", "list-checks", "Test day checklist", "Lista para el día del examen", "What to bring, when to sleep, what to eat.", "Qué llevar, cuándo dormir y qué comer.", 4),
      t("study", "timed", "timer", "Timed practice", "Práctica con tiempo", "Practice under real test timing.", "Practica con el tiempo de un examen real.", 4),
      t("study", "courses", "graduation", "Skill courses", "Cursos de habilidades", "Free courses matched to your goals.", "Cursos gratis que van con tus metas.", 4),
      t("study", "daily", "flame", "Daily challenge", "Reto diario", "A chess puzzle, debate prompt, math problem or vocabulary word.", "Un problema de ajedrez, un tema de debate, un problema de mates o una palabra nueva.", 4),
      t("study", "speaking", "mic", "Public speaking coach", "Entrenador para hablar en público", "Record yourself and get tips on pace and clarity.", "Grábate y recibe consejos sobre ritmo y claridad.", 4),
      t("study", "chess", "puzzle", "Chess opening trainer", "Entrenador de aperturas de ajedrez", "Practice an opening move by move.", "Practica una apertura jugada por jugada.", 4),
      t("study", "debate", "scale", "Debate case builder", "Armador de casos de debate", "Claim, evidence and rebuttal.", "Argumento, evidencia y refutación.", 4),
      t("study", "sciencefair", "flask", "Science fair helper", "Ayuda para la feria de ciencias", "Idea generator, hypothesis builder and timeline.", "Ideas, hipótesis y calendario de trabajo.", 4),
    ]),
    tab("notes", "notebook", "Notes and Flashcards", "Apuntes y tarjetas", [
      t("notes", "cornell", "notebook", "Cornell notes", "Notas Cornell", "Cue column, notes area and summary box.", "Columna de pistas, notas y resumen.", 4),
      t("notes", "mindmap", "network", "Mind map maker", "Mapas mentales", "Add branches and details and the map draws itself.", "Agrega ramas y detalles y el mapa se dibuja solo.", 4),
      t("notes", "outline", "list-tree", "Outline builder", "Armar un esquema", "Turn messy notes into headings and subpoints.", "Convierte apuntes desordenados en títulos y puntos.", 4),
      t("notes", "summarizer", "file-text", "Note summarizer", "Resumen de apuntes", "Paste notes and get a short summary and key terms.", "Pega tus apuntes y recibe un resumen y los términos clave.", 4),
      t("notes", "notestoquiz", "puzzle", "Notes to quiz", "De apuntes a examen", "Practice questions made from your notes.", "Preguntas de práctica hechas con tus apuntes.", 4),
      t("notes", "photonotes", "camera", "Photo to notes", "De foto a apuntes", "Snap the whiteboard or textbook and get the text.", "Toma una foto del pizarrón o el libro y obtén el texto.", 4),
      t("notes", "recorder", "mic", "Lecture recorder", "Grabadora de clases", "Record class, only with teacher permission, and get searchable text.", "Graba la clase, solo con permiso del maestro, y obtén texto para buscar.", 4),
      t("notes", "flashcards", "layers", "Flashcard maker", "Tarjetas de estudio", "Turn notes into flashcards.", "Convierte tus apuntes en tarjetas.", 4),
      t("notes", "spaced", "repeat", "Spaced repetition review", "Repaso espaciado", "Cards come back on a schedule based on what you miss.", "Las tarjetas regresan según lo que fallas.", 4),
      t("notes", "palace", "landmark", "Memory palace trainer", "Palacio de la memoria", "Guided practice for memorizing lists.", "Práctica guiada para memorizar listas.", 4),
      t("notes", "mnemonic", "lightbulb", "Mnemonic generator", "Reglas mnemotécnicas", "Acronyms and memory phrases.", "Siglas y frases para recordar.", 4),
    ]),
    tab("math", "sigma", "Math and Science", "Matemáticas y ciencias", [
      t("math", "scientific", "calculator", "Scientific calculator", "Calculadora científica", "With a history of past calculations.", "Con historial de cálculos.", 4),
      t("math", "graphing", "chart-line", "Graphing calculator", "Calculadora gráfica", "Plot equations and see intercepts.", "Grafica ecuaciones y ve las intersecciones.", 4),
      t("math", "fractions", "percent", "Fraction and percent helper", "Fracciones y porcentajes", "Shows the steps, not just the answer.", "Muestra los pasos, no solo la respuesta.", 4),
      t("math", "geometry", "shapes", "Geometry shape calculator", "Calculadora de figuras", "Area, perimeter and volume with diagrams.", "Área, perímetro y volumen con dibujos.", 4),
      t("math", "units", "ruler", "Unit converter", "Conversor de unidades", "Convert between units.", "Convierte entre unidades.", 4),
      t("math", "formulas", "square-function", "Formula sheets", "Hojas de fórmulas", "Algebra, geometry, chemistry and physics.", "Álgebra, geometría, química y física.", 4),
      t("math", "periodic", "atom", "Periodic table", "Tabla periódica", "Tap any element for details.", "Toca un elemento para ver sus datos.", 4),
      t("math", "balancer", "scale", "Equation balancer", "Balanceo de ecuaciones", "Balance chemistry equations.", "Balancea ecuaciones químicas.", 4),
      t("math", "molar", "flask", "Molar mass calculator", "Masa molar", "Type a formula, get the mass.", "Escribe una fórmula y obtén la masa.", 4),
      t("math", "drills", "binary", "Math facts drills", "Práctica de operaciones", "Multiplication and other basics.", "Multiplicación y otras bases.", 4),
      t("math", "labreport", "file-text", "Lab report template", "Plantilla de reporte de laboratorio", "Question, hypothesis, materials, procedure, data and conclusion.", "Pregunta, hipótesis, materiales, procedimiento, datos y conclusión.", 4),
      t("math", "datagraph", "chart-bar", "Data table and graph maker", "Tablas y gráficas de datos", "Enter lab data, get a bar or line chart.", "Escribe tus datos y obtén una gráfica de barras o líneas.", 4),
      t("math", "stepchecker", "list-checks", "Math step checker", "Revisor de pasos", "Enter your work and find which step went wrong.", "Escribe tu procedimiento y encuentra el paso donde te equivocaste.", 4),
    ]),
    tab("writing", "pen", "Reading and Writing", "Lectura y escritura", [
      t("writing", "outline", "list-tree", "Essay outline template", "Esquema de ensayo", "Intro, body paragraphs and conclusion.", "Introducción, desarrollo y conclusión.", 4),
      t("writing", "thesis", "pen", "Thesis statement builder", "Armador de tesis", "Fill in the blanks to form a strong claim.", "Completa los espacios para formar una tesis sólida.", 4),
      t("writing", "counter", "type", "Word and character counter", "Contador de palabras", "With warnings for essay limits.", "Con avisos de límite de palabras.", 4),
      t("writing", "citation", "link", "Citation generator", "Generador de citas", "MLA, APA and Chicago from a link or title.", "MLA, APA y Chicago desde un enlace o título.", 4),
      t("writing", "grammar", "spell-check", "Grammar coach", "Entrenador de gramática", "Explains why something is wrong instead of silently fixing it.", "Explica por qué algo está mal en vez de corregirlo sin decirte.", 4),
      t("writing", "paraphrase", "copy", "Paraphrase practice", "Práctica de parafraseo", "Checks if your rewrite is too close to the original.", "Revisa si tu versión se parece demasiado al original.", 4),
      t("writing", "readlevel", "glasses", "Reading level checker", "Nivel de lectura", "Tells you if your essay reads at your grade level.", "Te dice si tu ensayo está al nivel de tu grado.", 4),
      t("writing", "vocabctx", "book", "Vocabulary in context", "Vocabulario en contexto", "Tap a word in your text to open a trusted dictionary, in English or Spanish.", "Toca una palabra de tu texto para abrir un diccionario confiable, en inglés o español.", 4),
      t("writing", "vocabbuilder", "layers", "Vocabulary builder", "Más vocabulario", "Practice words from your own reading.", "Practica palabras de tus propias lecturas.", 4),
      t("writing", "readlog", "book", "Reading log", "Registro de lectura", "Books, pages per day and minutes read.", "Libros, páginas por día y minutos leídos.", 4),
      t("writing", "readspeed", "gauge", "Reading speed test", "Velocidad de lectura", "Words per minute with a comprehension check.", "Palabras por minuto con una revisión de comprensión.", 4),
      t("writing", "typing", "keyboard", "Typing speed test", "Prueba de mecanografía", "A useful skill and a fun challenge.", "Una habilidad útil y un reto divertido.", 9),
    ]),
    tab("languages", "languages", "Languages", "Idiomas", [
      t("languages", "conversation", "messages", "Conversation practice", "Práctica de conversación", "Practice Spanish or English with the Coach.", "Practica español o inglés con el entrenador.", 4),
      t("languages", "bilingual", "languages", "Bilingual homework help", "Tarea en dos idiomas", "Explanations in one language, answers in the other.", "Explicaciones en un idioma y respuestas en el otro.", 4),
      t("languages", "conjugation", "repeat", "Verb conjugation drills", "Práctica de verbos", "Spanish verbs in three tenses and English irregular verbs.", "Verbos en español en tres tiempos y verbos irregulares del inglés.", 4),
      t("languages", "transcards", "layers", "Translation flashcards", "Tarjetas de traducción", "English and Spanish side by side.", "Inglés y español lado a lado.", 4),
      t("languages", "pronunciation", "mic", "Pronunciation practice", "Práctica de pronunciación", "Say a word and get feedback.", "Di una palabra y recibe comentarios.", 4),
    ]),
  ]),

  group("testprep", "Test Prep", "Preparación para exámenes", [
    tab("ap", "trophy", "AP Prep", "Preparación AP", [
      t("ap", "courses", "list-checks", "Course picker", "Elige tus cursos AP", "Pick the AP courses you take. Each gets its own dashboard.", "Elige los cursos AP que llevas. Cada uno tiene su propio panel.", 1),
      t("ap", "dashboard", "chart-bar", "Course dashboard", "Panel del curso", "Units in official order, progress and a countdown to the May exam.", "Unidades en el orden oficial, tu avance y la cuenta regresiva para el examen de mayo.", 1),
      t("ap", "notes", "notebook", "Unit notes", "Apuntes por unidad", "Key terms, main ideas and examples for each unit.", "Términos clave, ideas principales y ejemplos de cada unidad.", 1),
      t("ap", "quizzes", "puzzle", "Practice quizzes", "Cuestionarios de práctica", "Exam-style questions with an explanation for every answer.", "Preguntas estilo examen con explicación de cada respuesta.", 1),
      t("ap", "exam", "timer", "Full practice exams", "Exámenes completos de práctica", "A timed exam with the real section structure.", "Un examen con tiempo y la estructura real.", 1),
      t("ap", "frq", "pen", "Free response feedback", "Comentarios en respuestas escritas", "Scored against a rubric with feedback on each point.", "Calificación con rúbrica y comentarios en cada punto.", 1),
      t("ap", "flash", "layers", "Flashcards", "Tarjetas", "Made from each unit's notes.", "Hechas con los apuntes de cada unidad.", 1),
      t("ap", "weak", "target", "Weak spot report", "Reporte de puntos débiles", "Which units and skills to review next.", "Qué unidades y habilidades repasar después.", 1),
      t("ap", "score", "gauge", "Score estimate", "Calificación estimada", "A 1 to 5 range. Estimate only, not an official score.", "Un rango de 1 a 5. Solo es un estimado, no un puntaje oficial.", 1),
      t("ap", "plan", "calendar-check", "Study plan", "Plan de estudio", "One tap schedules every unit before exam day.", "Un toque programa todas las unidades antes del examen.", 1),
      t("ap", "resources", "link", "Official resources", "Recursos oficiales", "Links to AP Classroom and released free-response questions.", "Enlaces a AP Classroom y a preguntas oficiales publicadas.", 1),
    ]),
    ...(["sat", "psat", "act", "tsi"] as const).map((id) => {
      const names = {
        sat: ["SAT", "SAT"], psat: ["PSAT", "PSAT"], act: ["ACT", "ACT"], tsi: ["TSI", "TSI"],
      }[id];
      return tab(id, "file-check", names[0], names[1], [
        t(id, "overview", "info", "Test overview", "Sobre el examen", "What the test is, who takes it, sections, timing and scoring.", "Qué es el examen, quién lo presenta, secciones, tiempo y puntaje.", 1),
        t(id, "diagnostic", "target", "Diagnostic test", "Examen de diagnóstico", "A short starting test to find your level and weak areas.", "Un examen corto para ver tu nivel y tus puntos débiles.", 1),
        t(id, "sections", "puzzle", "Section practice", "Práctica por sección", "Quizzes by section and skill, with explanations.", "Cuestionarios por sección y habilidad, con explicaciones.", 1),
        t(id, "full", "timer", "Full practice tests", "Exámenes completos", "Timed tests that follow the real structure.", "Exámenes con tiempo que siguen la estructura real.", 1),
        t(id, "strategy", "lightbulb", "Strategy lessons", "Estrategias", "Short lessons on question types and time management.", "Lecciones cortas sobre tipos de preguntas y manejo del tiempo.", 1),
        t(id, "review", "book", "Vocabulary and formulas", "Vocabulario y fórmulas", "Review tied to this test.", "Repaso para este examen.", 1),
        t(id, "scores", "chart-line", "Score tracker", "Seguimiento de puntajes", "Practice scores over time. Estimates only.", "Tus puntajes de práctica con el tiempo. Solo estimados.", 1),
        t(id, "countdown", "calendar-clock", "Test date and reminders", "Fecha del examen y avisos", "Countdown plus registration deadlines.", "Cuenta regresiva y fechas de inscripción.", 2),
        t(id, "plan", "calendar-check", "Study plan", "Plan de estudio", "A weekly schedule up to test day.", "Un horario semanal hasta el día del examen.", 1),
        t(id, "resources", "link", "Official free prep", "Preparación oficial gratis", "Links to the official free practice for this test.", "Enlaces a la práctica oficial gratis de este examen.", 1),
      ]);
    }),
  ]),

  group("organize", "Organize", "Organizar", [
    tab("plan", "route", "Plan", "Plan", [
      t("plan", "builder", "route", "Plan builder", "Armar un plan", "Turn a goal into weekly, monthly and yearly steps.", "Convierte una meta en pasos por semana, mes y año.", 1),
      t("plan", "templates", "flag", "Goal templates", "Plantillas de metas", "Ready-made plans like Eagle Scout, state chess or a first job.", "Planes listos, como Eagle Scout, ajedrez estatal o tu primer trabajo.", 1),
      t("plan", "checklists", "list-checks", "Plan checklists", "Listas del plan", "Check off steps and watch the trail fill in.", "Marca pasos y mira cómo avanza tu camino.", 1),
      t("plan", "adjust", "sliders", "Adjust my plan", "Ajustar mi plan", "Ask the Coach to change your plan.", "Pídele al entrenador que cambie tu plan.", 1),
      t("plan", "catchup", "rocket", "Catch-up plan", "Plan para ponerte al día", "A realistic recovery plan if you fall behind.", "Un plan realista si te atrasas.", 5),
      t("plan", "studyplanner", "calendar-days", "Smart study planner", "Planeador de estudio", "Enter test dates and get sessions spread over the days before.", "Escribe las fechas de exámenes y recibe sesiones repartidas en los días anteriores.", 5),
      t("plan", "shared", "users", "Shared plans", "Planes compartidos", "Follow the same plan as friends and cheer each other on.", "Sigue el mismo plan que tus amigos y anímense.", 6),
      t("plan", "packing", "backpack", "Packing lists", "Listas de equipaje", "For tournaments, camps and trips.", "Para torneos, campamentos y viajes.", 5),
    ]),
    tab("calendar", "calendar", "Calendar", "Calendario", [
      t("calendar", "deadlines", "calendar", "Deadline calendar", "Calendario de fechas límite", "Your saved opportunities on a calendar.", "Tus oportunidades guardadas en un calendario.", 2),
      t("calendar", "reminders", "bell", "Reminders", "Recordatorios", "A week and a day before each deadline.", "Una semana y un día antes de cada fecha límite.", 2),
      t("calendar", "countdown", "hourglass", "Countdown widgets", "Cuentas regresivas", "Days until a deadline, tournament or test.", "Días que faltan para una fecha límite, torneo o examen.", 2),
      t("calendar", "schoolyear", "calendar-days", "School year calendar", "Calendario escolar", "Holidays, early release and testing days.", "Días festivos, salidas temprano y días de exámenes.", 2),
      t("calendar", "schedule", "clock", "Class schedule", "Horario de clases", "Supports A/B days and block schedules.", "Funciona con días A/B y horarios por bloques.", 5),
      t("calendar", "semester", "calendar-check", "Semester at a glance", "Semestre de un vistazo", "Big tests, projects and breaks on one screen.", "Exámenes grandes, proyectos y descansos en una pantalla.", 5),
      t("calendar", "timeblock", "calendar-clock", "Time blocking planner", "Bloques de tiempo", "Drag tasks into hourly slots.", "Arrastra tareas a horas del día.", 5),
      t("calendar", "weekly", "calendar-days", "Weekly schedule builder", "Horario semanal", "Fit school, practice, work and study into a real week.", "Acomoda escuela, práctica, trabajo y estudio en una semana real.", 5),
      t("calendar", "sports", "dumbbell", "Sports and practice schedule", "Horario de deportes", "A separate color layer on the calendar.", "Una capa de otro color en el calendario.", 5),
      t("calendar", "conflicts", "siren", "Time conflict checker", "Choques de horario", "Warns when saved events overlap.", "Avisa cuando se empalman eventos guardados.", 2),
      t("calendar", "gcal", "share", "Send to my calendar", "Enviar a mi calendario", "Download your deadlines as a file that Google Calendar, Apple Calendar and Outlook can import.", "Descarga tus fechas límite como un archivo que Google Calendar, Apple Calendar y Outlook pueden importar.", 2),
      t("calendar", "autoschedule", "rocket", "Auto schedule", "Horario automático", "Enter tasks and free time, get a built week.", "Escribe tareas y tiempo libre y recibe una semana armada.", 5),
      t("calendar", "overload", "gauge", "Overload detector", "Detector de sobrecarga", "Warns when a week has too many tests and deadlines.", "Avisa cuando una semana tiene demasiados exámenes y entregas.", 5),
    ]),
    tab("homework", "backpack", "Homework", "Tarea", [
      t("homework", "tracker", "list-checks", "Homework tracker", "Registro de tarea", "Assignments by class with due dates and checkboxes.", "Tareas por clase con fechas de entrega y casillas.", 1),
      t("homework", "backward", "route", "Backward planner", "Planeador hacia atrás", "Enter a project and due date, get steps working back from the deadline.", "Escribe un proyecto y su fecha y recibe los pasos desde la entrega hacia atrás.", 1),
      t("homework", "backpack", "backpack", "Backpack checklist", "Lista de la mochila", "What to bring each day, based on your schedule.", "Qué llevar cada día según tu horario.", 5),
      t("homework", "todo", "list-checks", "Daily to-do list", "Lista de pendientes", "With your top 3 priorities for the day.", "Con tus 3 prioridades del día.", 5),
      t("homework", "eisenhower", "table", "Eisenhower matrix", "Matriz de Eisenhower", "Sorts tasks into urgent and important.", "Ordena tareas en urgentes e importantes.", 5),
      t("homework", "frog", "flag", "Eat the frog", "Lo difícil primero", "Highlights the hardest task to do first.", "Resalta la tarea más difícil para hacerla primero.", 5),
      t("homework", "twominute", "timer", "2-minute rule list", "Regla de los 2 minutos", "Quick tasks to knock out right away.", "Tareas rápidas para terminar de inmediato.", 5),
      t("homework", "kanban", "kanban", "Kanban board", "Tablero Kanban", "To do, doing and done columns for projects.", "Columnas de pendiente, en proceso y terminado.", 5),
      t("homework", "groupproject", "users", "Group project tracker", "Seguimiento de proyectos en equipo", "Who does what and when.", "Quién hace qué y cuándo.", 5),
      t("homework", "inbox", "pen", "Quick capture inbox", "Anotar rápido", "Jot down any task or idea and sort it later.", "Apunta cualquier tarea o idea y ordénala después.", 5),
      t("homework", "taskbreaker", "list-tree", "Task breaker", "Dividir una tarea", "A big project becomes small, doable steps.", "Un proyecto grande se vuelve pasos pequeños.", 5),
      t("homework", "groupplanner", "users", "Group project planner", "Planeador de proyectos en equipo", "Splits a project fairly among teammates.", "Reparte un proyecto de forma justa entre el equipo.", 5),
    ]),
    tab("focus", "timer", "Focus", "Concentración", [
      t("focus", "pomodoro", "timer", "Pomodoro timer", "Temporizador Pomodoro", "Custom work and break lengths, alerts and a weekly study chart.", "Tiempos de trabajo y descanso a tu medida, alertas y una gráfica semanal.", 1),
      t("focus", "focusmode", "headphones", "Focus mode", "Modo de concentración", "A calm timer with rain-like, white or soft rumble sound made on your device.", "Un temporizador tranquilo con sonido como lluvia, ruido blanco o retumbo suave hecho en tu dispositivo.", 4),
      t("focus", "logger", "notebook", "Study session logger", "Registro de sesiones", "Subject, minutes and how focused you felt.", "Materia, minutos y qué tan concentrado estuviste.", 4),
      t("focus", "stats", "chart-bar", "Study stats", "Estadísticas de estudio", "Hours per subject per week.", "Horas por materia por semana.", 4),
      t("focus", "distraction", "smartphone", "Distraction reminder", "Aviso contra distracciones", "A nudge to put your phone across the room.", "Un recordatorio para dejar el celular lejos.", 4),
      t("focus", "studywithme", "users", "Study with me", "Estudia conmigo", "A shared timer inside study group rooms.", "Un temporizador compartido en los grupos de estudio.", 6),
      t("focus", "braingames", "gamepad", "Brain break games", "Juegos para descansar", "Two-minute puzzles between sessions.", "Acertijos de dos minutos entre sesiones.", 9),
      t("focus", "playlist", "music", "Study playlists", "Música para estudiar", "Playlist suggestions.", "Sugerencias de listas de música.", 9),
    ]),
    tab("habits", "sprout", "Habits and Goals", "Hábitos y metas", [
      t("habits", "tracker", "flame", "Habit tracker", "Registro de hábitos", "Reading, practice and exercise with a streak calendar.", "Lectura, práctica y ejercicio con calendario de rachas.", 5),
      t("habits", "stacking", "layers", "Habit stacking helper", "Hábitos encadenados", "After I eat breakfast, I will review flashcards for 5 minutes.", "Después de desayunar, voy a repasar tarjetas 5 minutos.", 5),
      t("habits", "smart", "target", "SMART goal builder", "Metas SMART", "Make goals specific, measurable and time-bound.", "Haz metas específicas, medibles y con fecha.", 5),
      t("habits", "ladder", "milestone", "Goal ladder", "Escalera de metas", "Big goal on top, small steps as rungs.", "La meta grande arriba y pasos pequeños como escalones.", 5),
      t("habits", "vision", "eye", "Vision board", "Tablero de visión", "Images and words for long-term goals.", "Imágenes y palabras para tus metas a largo plazo.", 5),
      t("habits", "routines", "sunrise", "Morning and evening routines", "Rutinas de mañana y noche", "A checklist you follow every day.", "Una lista que sigues cada día.", 5),
      t("habits", "journal", "notebook", "Goal journal", "Diario de metas", "Short weekly reflection prompts.", "Preguntas cortas de reflexión cada semana.", 5),
      t("habits", "weekly", "calendar-check", "Weekly review", "Revisión semanal", "Every Sunday, check off wins and plan next week.", "Cada domingo, marca logros y planea la siguiente semana.", 5),
      t("habits", "monthly", "calendar-days", "Monthly reflection", "Reflexión del mes", "What worked, what did not and what to change.", "Qué funcionó, qué no y qué cambiar.", 5),
      t("habits", "audit", "clock", "Time audit", "Auditoría de tiempo", "Log a week and see where the hours went.", "Anota una semana y mira a dónde se fueron las horas.", 5),
      t("habits", "estimator", "hourglass", "Task time estimator", "Estimador de tiempo", "Guess, log the real time and get better at estimating.", "Adivina, anota el tiempo real y mejora tus cálculos.", 5),
    ]),
  ]),

  group("track", "Track", "Seguimiento", [
    tab("grades", "chart-bar", "Grades", "Calificaciones", [
      t("grades", "gpa", "calculator", "GPA calculator", "Calculadora de GPA", "Weighted and unweighted, with AP, IB, dual credit and honors, plus a what-if mode.", "Con y sin peso, con AP, IB, crédito doble y honores, y un modo para probar \"qué pasaría si\".", 1),
      t("grades", "grade", "percent", "Grade calculator", "Calculadora de calificación", "What score do I need on the final to get a B?", "¿Qué calificación necesito en el examen final para sacar B?", 1),
      t("grades", "rank", "trending", "Class rank estimator", "Posición en la clase", "A rough percentile from GPA and class size.", "Un percentil aproximado según tu GPA y el tamaño de tu clase.", 3),
      t("grades", "credits", "graduation", "Credit hour tracker", "Horas de crédito", "Dual enrollment credits earned toward a degree.", "Créditos de inscripción doble hacia un título.", 3),
      t("grades", "txgrad", "list-checks", "Texas graduation requirements", "Requisitos para graduarte en Texas", "Foundation High School Program and endorsements.", "Programa Fundamental de Preparatoria y especializaciones.", 3),
      t("grades", "txadmit", "landmark", "Texas automatic admission", "Admisión automática en Texas", "The top 10 percent rule (top 6 percent at UT Austin), explained simply.", "La regla del 10 por ciento (6 por ciento en UT Austin), explicada fácil.", 3),
    ]),
    tab("achievements", "award", "Achievements", "Logros", [
      t("achievements", "tracker", "award", "Accomplishments tracker", "Registro de logros", "Awards, activities and results in one place.", "Premios, actividades y resultados en un solo lugar.", 2),
      t("achievements", "volunteer", "heart", "Volunteer hour log", "Horas de voluntariado", "Date, organization, hours and supervisor contact.", "Fecha, organización, horas y contacto del supervisor.", 2),
      t("achievements", "certificates", "file-check", "Certificate tracker", "Certificados", "CPR, Microsoft Office, coding and more.", "RCP, Microsoft Office, programación y más.", 2),
      t("achievements", "portfolio", "briefcase", "Digital portfolio", "Portafolio digital", "A shareable page with privacy controls you set.", "Una página para compartir con la privacidad que tú elijas.", 2),
      t("achievements", "radar", "activity", "Skills radar", "Radar de habilidades", "Strengths across leadership, academics, service, arts and athletics.", "Tus fortalezas en liderazgo, estudios, servicio, artes y deportes.", 2),
      t("achievements", "brag", "star", "Brag sheet", "Hoja de logros", "A summary counselors can use for recommendation letters.", "Un resumen que los consejeros pueden usar para cartas de recomendación.", 2),
      t("achievements", "resume", "file-text", "Resume builder", "Armar tu currículum", "Turn accomplishments into a student resume you can download as PDF.", "Convierte tus logros en un currículum que puedes bajar en PDF.", 2),
      t("achievements", "badges", "medal", "Badges", "Insignias", "Patches you earn for finishing things.", "Parches que ganas al terminar cosas.", 9),
      t("achievements", "challenges", "target", "Monthly challenges", "Retos del mes", "Goals like volunteering five hours this month.", "Metas como hacer cinco horas de voluntariado este mes.", 9),
      t("achievements", "leaderboard", "trophy", "School volunteer totals", "Voluntariado por escuela", "School totals only, never individual students.", "Solo totales por escuela, nunca de estudiantes individuales.", 9),
      t("achievements", "yearreview", "calendar-days", "Year in review", "Resumen del año", "Your accomplishments from the year.", "Tus logros del año.", 9),
    ]),
    tab("money", "wallet", "Money", "Dinero", [
      t("money", "budget", "wallet", "Budget planner", "Presupuesto", "Track earnings and savings if you have a job.", "Lleva tus ingresos y ahorros si trabajas.", 5),
      t("money", "paycheck", "dollar", "Paycheck calculator", "Calculadora de cheque", "Hourly wage times hours, minus estimated taxes.", "Pago por hora por horas trabajadas, menos impuestos estimados.", 5),
      t("money", "savings", "piggy", "Savings goal tracker", "Meta de ahorro", "I want $400 for a laptop by March.", "Quiero $400 para una laptop en marzo.", 5),
      t("money", "compound", "chart-line", "Compound interest", "Interés compuesto", "See why saving early matters.", "Mira por qué conviene ahorrar temprano.", 5),
      t("money", "laborlaw", "scale", "Teen work law guide", "Guía de trabajo para menores", "What hours 14 and 15 year olds can legally work in Texas.", "Cuántas horas pueden trabajar legalmente jóvenes de 14 y 15 años en Texas.", 5),
    ]),
  ]),

  group("grow", "Grow", "Crecer", [
    tab("wellbeing", "heart", "Wellbeing", "Bienestar", [
      t("wellbeing", "mood", "heart", "Mood check-in", "Cómo te sientes", "A quick check-in that links to tips when you feel stressed.", "Un chequeo rápido con consejos cuando te sientes estresado.", 7),
      t("wellbeing", "sleep", "moon", "Sleep tracker", "Registro de sueño", "Bedtime and wake time. Teens need 8 to 10 hours.", "Hora de dormir y de despertar. Los jóvenes necesitan de 8 a 10 horas.", 5),
      t("wellbeing", "energy", "battery", "Energy planner", "Planeador de energía", "Mark when you focus best and put hard tasks there.", "Marca cuándo te concentras mejor y pon ahí lo difícil.", 5),
      t("wellbeing", "screen", "smartphone", "Screen time goal", "Meta de pantalla", "A daily target you set yourself.", "Una meta diaria que tú pones.", 5),
      t("wellbeing", "breaks", "coffee", "Break ideas", "Ideas para descansar", "Stretch, drink water, take a walk or breathe.", "Estírate, toma agua, camina o respira.", 5),
      t("wellbeing", "stress", "lifebuoy", "Stress tips", "Consejos contra el estrés", "Short tips and break reminders.", "Consejos cortos y recordatorios de descanso.", 7),
      t("wellbeing", "burnout", "gauge", "Burnout check", "Chequeo de agotamiento", "Gently suggests easing up when your schedule is overloaded.", "Te sugiere bajarle cuando tu horario está muy cargado.", 7),
      t("wellbeing", "balance", "scale", "Balance meter", "Medidor de equilibrio", "Mix of school, activities, rest and friends.", "La mezcla de escuela, actividades, descanso y amigos.", 7),
      t("wellbeing", "contacts", "phone", "Counselor contacts and help lines", "Consejeros y líneas de ayuda", "Trusted people and numbers to call.", "Personas de confianza y números a los que llamar.", 7),
    ]),
    tab("people", "users", "People", "Personas", [
      t("people", "team", "users", "Team finder", "Buscar equipo", "Find teammates for robotics, app and academic competitions.", "Encuentra compañeros para robótica, apps y competencias académicas.", 6),
      t("people", "groups", "messages", "Study group rooms", "Grupos de estudio", "Moderated rooms by subject, group-based only.", "Salas con moderación por materia, solo en grupo.", 6),
      t("people", "mentor", "handshake", "Mentor Q&A", "Preguntas a mentores", "Verified college students and professionals answer in moderated groups.", "Universitarios y profesionales verificados responden en grupos con moderación.", 6),
      t("people", "alumni", "graduation", "Alumni stories", "Historias de exalumnos", "Local graduates share how they got there.", "Graduados locales cuentan cómo llegaron.", 6),
      t("people", "clubs", "flag", "Club directory", "Directorio de clubes", "Clubs at each school.", "Clubes de cada escuela.", 6),
      t("people", "buddy", "users", "Event buddy", "Compañero de evento", "See which classmates in your school group are going.", "Mira qué compañeros de tu grupo escolar van al mismo evento.", 6),
      t("people", "carpool", "bus", "Parent carpool board", "Viajes compartidos (padres)", "For parents to coordinate rides to events.", "Para que los padres coordinen viajes a eventos.", 6),
    ]),
  ]),

  group("me", "Me", "Yo", [
    tab("profile", "user-round", "Profile and Progress", "Perfil y avance", [
      t("profile", "profile", "user-round", "Profile", "Perfil", "Grade, school, skills, goals and language.", "Grado, escuela, habilidades, metas e idioma.", 1),
      t("profile", "interests", "star", "Interests", "Intereses", "Pick 3 to 10 interests, or take the quiz if you are not sure.", "Elige de 3 a 10 intereses, o haz el cuestionario si no estás seguro.", 1),
      t("profile", "why", "heart", "My why", "Mi razón", "Write your reason for your goals and see it on your home screen.", "Escribe por qué tienes tus metas y velo en tu pantalla de inicio.", 2),
      t("profile", "progress", "chart-line", "Progress dashboard", "Panel de avance", "Applications, hours logged and plan steps done.", "Solicitudes, horas registradas y pasos del plan completados.", 2),
      t("profile", "levels", "trophy", "Levels and XP", "Niveles y puntos", "Points for applying, attending and finishing goals.", "Puntos por aplicar, asistir y cumplir metas.", 9),
      t("profile", "streaks", "flame", "Streaks", "Rachas", "Days in a row you showed up.", "Días seguidos que cumpliste.", 9),
      t("profile", "avatar", "user", "Avatar", "Avatar", "Customize it with things you unlock.", "Personalízalo con lo que desbloqueas.", 9),
      t("profile", "celebrations", "award", "Celebrations", "Celebraciones", "Revisit the screens from when you got in.", "Vuelve a ver las pantallas de cuando lo lograste.", 9),
    ]),
    tab("family", "house", "Family and School", "Familia y escuela", [
      t("family", "parent", "house", "Parent view", "Vista para padres", "A summary in English or Spanish of what a student saved, with dates and costs.", "Un resumen en español o inglés de lo que guardó el estudiante, con fechas y costos.", 2),
      t("family", "approvals", "file-check", "Parent approvals", "Aprobación de padres", "Younger students send an opportunity to a parent for yes or no.", "Los más jóvenes le mandan una oportunidad a sus padres para un sí o un no.", 2),
      t("family", "teacher", "school", "Teacher dashboard", "Panel para maestros", "See which students are engaged and recommend opportunities.", "Mira qué estudiantes participan y recomiéndales oportunidades.", 2),
      t("family", "counselorpost", "signpost", "Counselor posting", "Publicaciones de consejeros", "Verified school staff post local opportunities.", "El personal escolar verificado publica oportunidades locales.", 2),
      t("family", "counselorreports", "chart-bar", "Counselor reports", "Reportes para consejeros", "Which opportunity types students search for most.", "Qué tipos de oportunidades buscan más los estudiantes.", 2),
      t("family", "parentalcontrols", "lock", "Parental controls", "Controles para padres", "Extra protections for users under 13.", "Protecciones adicionales para menores de 13 años.", 10),
    ]),
    tab("settings", "settings", "Settings", "Ajustes", [
      t("settings", "language", "globe", "Language", "Idioma", "Switch between English and Spanish. More languages can be added later.", "Cambia entre español e inglés. Se pueden agregar más idiomas después.", 1),
      t("settings", "appearance", "palette", "Appearance and access", "Apariencia y accesibilidad", "Light or dark mode, dyslexia-friendly font, large text, low data mode and reduced motion.", "Modo claro u oscuro, letra para dislexia, texto grande, ahorro de datos y menos movimiento.", 1),
      t("settings", "sidebar", "sliders", "Pinned and hidden tabs", "Pestañas fijas y ocultas", "Choose your favorite features and hide the ones you do not use.", "Elige tus funciones favoritas y oculta las que no usas.", 1),
      t("settings", "notifications", "bell", "Notifications", "Notificaciones", "Choose what you get reminded about.", "Elige de qué quieres recordatorios.", 2),
      t("settings", "account", "user", "Account", "Cuenta", "Sign out, sign out everywhere, download your data or delete your account.", "Cierra sesión, ciérrala en todos lados, baja tus datos o borra tu cuenta.", 1),
      t("settings", "privacy", "lock", "Privacy", "Privacidad", "What we collect and what we do not, in plain words.", "Qué guardamos y qué no, en palabras sencillas.", 1),
      t("settings", "transparency", "info", "How the AI works", "Cómo funciona la IA", "How results are found and what the limits are.", "Cómo se encuentran los resultados y cuáles son sus límites.", 1),
      t("settings", "voice", "mic", "Voice input", "Entrada por voz", "Speak your search or question.", "Di tu búsqueda o pregunta en voz alta.", 10),
      t("settings", "readaloud", "volume", "Read aloud", "Leer en voz alta", "Hear results, plans and answers read to you.", "Escucha resultados, planes y respuestas.", 10),
      t("settings", "offline", "wifi-off", "Offline mode", "Sin conexión", "Saved items and local tools keep working without internet.", "Lo guardado y las herramientas locales siguen sirviendo sin internet.", 10),
      t("settings", "export", "download", "Download my data", "Descargar mis datos", "A readable summary and a data file.", "Un resumen legible y un archivo de datos.", 10),
    ]),
  ]),
];

/**
 * What the sidebar shows: seven hubs instead of 28 tabs. Each hub groups related tabs.
 * Tool keys and routes (/t/tab/tool) do not change, so saved links and bookmarks keep working.
 */
export interface Hub { id: string; icon: IconName; name: L10n; blurb: L10n; tabs: string[] }
export const HUBS: Hub[] = [
  { id: "discover", icon: "compass", name: { en: "Discover", es: "Descubrir" }, blurb: { en: "Opportunities, picks for you and local help", es: "Oportunidades, recomendaciones y ayuda local" }, tabs: ["find", "foryou", "local"] },
  { id: "learn", icon: "book", name: { en: "Learn", es: "Aprender" }, blurb: { en: "Coach, study tools, notes, math, writing and languages", es: "Entrenador, estudio, apuntes, mates, escritura e idiomas" }, tabs: ["coach", "study", "notes", "math", "writing", "languages"] },
  { id: "testprep", icon: "file-check", name: { en: "Test Prep", es: "Exámenes" }, blurb: { en: "SAT, PSAT, ACT, TSI and AP practice", es: "Práctica de SAT, PSAT, ACT, TSI y AP" }, tabs: ["sat", "psat", "act", "tsi", "ap"] },
  { id: "plan", icon: "route", name: { en: "Plan and Do", es: "Planear y hacer" }, blurb: { en: "Plans, homework, calendar, focus timer and habits", es: "Planes, tarea, calendario, concentración y hábitos" }, tabs: ["plan", "homework", "calendar", "focus", "habits"] },
  { id: "career", icon: "graduation", name: { en: "College and Career", es: "Universidad y carrera" }, blurb: { en: "Colleges, careers, grades and achievements", es: "Universidades, carreras, calificaciones y logros" }, tabs: ["college", "grades", "achievements"] },
  { id: "life", icon: "heart", name: { en: "Life", es: "Vida" }, blurb: { en: "Money, wellbeing and people", es: "Dinero, bienestar y personas" }, tabs: ["money", "wellbeing", "people"] },
  { id: "me", icon: "user-round", name: { en: "Me", es: "Yo" }, blurb: { en: "Profile, family and school, settings", es: "Perfil, familia y escuela, ajustes" }, tabs: ["profile", "family", "settings"] },
];
export const findHub = (id: string) => HUBS.find((h) => h.id === id);
export const hubOfTab = (tabId: string) => HUBS.find((h) => h.tabs.includes(tabId));

export const ALL_TABS: Tab[] = GROUPS.flatMap((g) => g.tabs);
export const ALL_TOOLS: Tool[] = ALL_TABS.flatMap((t) => t.tools);

export function findTab(id: string): { group: Group; tab: Tab } | undefined {
  for (const group of GROUPS) {
    const tab = group.tabs.find((t) => t.id === id);
    if (tab) return { group, tab };
  }
}
export function findTool(tabId: string, toolId: string) {
  const hit = findTab(tabId);
  const tool = hit?.tab.tools.find((t) => t.id === toolId);
  return hit && tool ? { ...hit, tool } : undefined;
}

/** Which of the student's tabs sit in the phone bottom bar by default. */
export const DEFAULT_BOTTOM_TABS = ["discover", "learn", "testprep", "plan"] as const;
