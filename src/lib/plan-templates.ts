import type { Plan } from "./plan";

type Lang = "en" | "es";
interface T { id: string; goal: Record<Lang, string>; title: Record<Lang, string>; summary: Record<Lang, string>; search: Record<Lang, string[]>; week: Record<Lang, string[]>; month: Record<Lang, string[]>; year: Record<Lang, string[]> }

// Ready-made plans. They work with no internet and no AI. They stay general on purpose: rules and dates change.
export const TEMPLATES: T[] = [
  {
    id: "eagle",
    goal: { en: "Become an Eagle Scout", es: "Llegar a Eagle Scout" },
    title: { en: "Road to Eagle Scout", es: "El camino a Eagle Scout" },
    summary: { en: "Eagle takes years of steady steps. Start with the next rank and keep your handbook close.", es: "Llegar a Eagle toma años de pasos constantes. Empieza con el siguiente rango y ten tu manual a la mano." },
    search: { en: ["Eagle Scout requirements", "merit badge counselors near me", "Eagle service project ideas"], es: ["requisitos para Eagle Scout", "consejeros de insignias de mérito cerca de mí", "ideas de proyecto de servicio Eagle"] },
    week: { en: ["Check which rank you are working on and what is left for it", "Pick one requirement and do it this week", "Ask your Scoutmaster who your next merit badge counselor could be", "Write down the date you must finish everything by (before your 18th birthday)"], es: ["Revisa en qué rango vas y qué te falta", "Escoge un requisito y cúmplelo esta semana", "Pregúntale a tu Scoutmaster quién podría ser tu próximo consejero de insignia", "Anota la fecha límite para terminar todo (antes de cumplir 18 años)"] },
    month: { en: ["Finish one merit badge, or make real progress on a big one", "Go to every troop meeting and one outing", "Take on a leadership role if you do not have one", "Start a list of service project ideas that help your community"], es: ["Termina una insignia de mérito, o avanza mucho en una grande", "Ve a todas las reuniones de la tropa y a una salida", "Toma un puesto de liderazgo si todavía no tienes uno", "Empieza una lista de ideas de proyectos de servicio para tu comunidad"] },
    year: { en: ["Reach your next rank, step by step, until Life", "Earn the required merit badges, plus ones you love", "Hold your leadership position for the required time", "Plan, lead and finish your Eagle service project", "Schedule your board of review and ask for your letters in time"], es: ["Sube de rango, paso a paso, hasta Life", "Gana las insignias de mérito obligatorias y otras que te gusten", "Cumple el tiempo requerido en tu puesto de liderazgo", "Planea, dirige y termina tu proyecto de servicio Eagle", "Agenda tu junta de revisión y pide tus cartas con tiempo"] },
  },
  {
    id: "chess",
    goal: { en: "Prepare for a state chess tournament", es: "Prepararme para un torneo estatal de ajedrez" },
    title: { en: "Chess tournament prep", es: "Preparación para un torneo de ajedrez" },
    summary: { en: "Play a lot, study a little every day, and learn from every loss.", es: "Juega mucho, estudia un poco cada día y aprende de cada partida perdida." },
    search: { en: ["chess tournaments near me for students", "how to qualify for state chess", "chess clubs in the Rio Grande Valley"], es: ["torneos de ajedrez para estudiantes cerca de mí", "cómo clasificar al estatal de ajedrez", "clubes de ajedrez en el Valle del Río Grande"] },
    week: { en: ["Solve 10 tactics puzzles a day for 5 days", "Play 3 longer games and save them", "Look at one of your losses and find the first mistake", "Find out how and when qualifying works for your region"], es: ["Resuelve 10 problemas de tácticas al día por 5 días", "Juega 3 partidas largas y guárdalas", "Revisa una de tus derrotas y encuentra el primer error", "Averigua cómo y cuándo es la clasificación en tu región"] },
    month: { en: ["Learn one opening as White and one defense as Black, deeply", "Study basic endgames: king and pawn, rook endings", "Play in at least one local tournament or club night", "Practice with a clock so time pressure feels normal"], es: ["Aprende bien una apertura con blancas y una defensa con negras", "Estudia finales básicos: rey y peón, finales de torre", "Juega en al menos un torneo local o noche de club", "Practica con reloj para que la presión de tiempo se sienta normal"] },
    year: { en: ["Play in several rated or official events", "Keep a journal of your games and your biggest mistakes", "Find a coach, older player or study partner", "Register for the qualifier before the deadline", "Rest and eat well the week before a big event"], es: ["Juega en varios eventos oficiales o con rating", "Lleva un diario de tus partidas y tus errores más grandes", "Busca un entrenador, un jugador mayor o un compañero de estudio", "Inscríbete al clasificatorio antes de la fecha límite", "Descansa y come bien la semana antes de un evento grande"] },
  },
  {
    id: "job",
    goal: { en: "Get my first job", es: "Conseguir mi primer trabajo" },
    title: { en: "Getting a first job", es: "Cómo conseguir tu primer trabajo" },
    summary: { en: "Start small, ask in person, and learn the rules for your age before you apply.", es: "Empieza poco a poco, pregunta en persona y aprende las reglas para tu edad antes de aplicar." },
    search: { en: ["Texas child labor laws teen work hours", "teen jobs hiring near me", "Workforce Solutions youth program Rio Grande Valley"], es: ["leyes de trabajo para menores en Texas horarios", "trabajos para jóvenes cerca de mí", "Workforce Solutions programa para jóvenes Valle del Río Grande"] },
    week: { en: ["Read the Texas rules on how many hours people your age may work", "Ask a parent or guardian to talk through what kind of job fits", "Write a short list of 5 places near you that hire teens", "Practice saying hello and why you want the job, out loud"], es: ["Lee las reglas de Texas sobre cuántas horas puede trabajar alguien de tu edad", "Habla con tus papás o tutor sobre qué tipo de trabajo te conviene", "Haz una lista de 5 lugares cerca de ti que contratan jóvenes", "Practica en voz alta cómo saludar y por qué quieres el trabajo"] },
    month: { en: ["Make a simple resume with school, activities and volunteering", "Ask 2 adults (teacher, coach) if they would be a reference", "Apply or ask in person at 5 places, and follow up after a week", "Practice a mock interview with the Coach", "Get any papers you need (ask what documents the employer requires)"], es: ["Haz un currículum sencillo con escuela, actividades y voluntariado", "Pídele a 2 adultos (maestro, entrenador) que sean tu referencia", "Aplica o pregunta en persona en 5 lugares y da seguimiento a la semana", "Practica una entrevista con el entrenador", "Reúne los documentos que necesites (pregunta qué pide el empleador)"] },
    year: { en: ["Show up on time and learn names, tasks and the rules", "Set a savings goal for your first paychecks", "Balance work hours with homework and sleep", "Ask for feedback and take on more once you are ready"], es: ["Llega a tiempo y aprende los nombres, las tareas y las reglas", "Ponte una meta de ahorro para tus primeros cheques", "Equilibra las horas de trabajo con la tarea y el sueño", "Pide comentarios y toma más responsabilidad cuando estés listo"] },
  },
  {
    id: "college",
    goal: { en: "Apply to college", es: "Aplicar a la universidad" },
    title: { en: "Applying to college", es: "Aplicar a la universidad" },
    summary: { en: "Keep your grades up, find places that fit and your budget, and do each deadline one at a time.", es: "Mantén tus calificaciones, encuentra lugares que te queden y que puedas pagar, y cumple cada fecha límite una por una." },
    search: { en: ["Texas college application deadlines", "scholarships for Rio Grande Valley students", "FAFSA help in Spanish"], es: ["fechas límite de solicitud a universidades de Texas", "becas para estudiantes del Valle del Río Grande", "ayuda con FAFSA en español"] },
    week: { en: ["Check your GPA and your class rank", "Write down 3 colleges or programs you want to look into", "Make an account for the Texas common application and look around", "Ask your counselor what the school's deadlines are"], es: ["Revisa tu GPA y tu posición en la clase", "Anota 3 universidades o programas que quieras investigar", "Crea tu cuenta en la solicitud común de Texas y échale un vistazo", "Pregúntale a tu consejero cuáles son las fechas límite de la escuela"] },
    month: { en: ["Visit or take a virtual tour of 2 colleges", "Start a list of scholarships with deadlines", "Plan for the SAT, ACT or TSI and book a date", "Draft a list of activities, volunteering and awards", "Ask 2 teachers about recommendation letters, politely and early"], es: ["Visita o haz un recorrido virtual de 2 universidades", "Empieza una lista de becas con sus fechas límite", "Planea el SAT, ACT o TSI y reserva una fecha", "Haz un borrador con tus actividades, voluntariado y reconocimientos", "Pídele a 2 maestros cartas de recomendación, con respeto y con tiempo"] },
    year: { en: ["Take the tests and send scores where needed", "Write and rewrite your essays, and ask someone to read them", "Submit every application before its deadline", "Fill out FAFSA or the Texas financial aid application as soon as it opens", "Compare offers and costs, then decide with your family"], es: ["Presenta los exámenes y manda los resultados donde se necesiten", "Escribe y reescribe tus ensayos, y pídele a alguien que los lea", "Entrega cada solicitud antes de su fecha límite", "Llena el FAFSA o la solicitud de ayuda financiera de Texas en cuanto abra", "Compara ofertas y costos, y decide con tu familia"] },
  },
];

export function templatePlan(t: T, lang: Lang, hoursPerWeek = 5): Plan {
  const mk = (h: "week" | "month" | "year", texts: string[]) => ({ horizon: h, steps: texts.map((text, i) => ({ id: `${h}-${i}`, text, done: false })) });
  return {
    id: crypto.randomUUID(), title: t.title[lang], goal: t.goal[lang], summary: t.summary[lang], hoursPerWeek,
    searchIdeas: t.search[lang], horizons: [mk("week", t.week[lang]), mk("month", t.month[lang]), mk("year", t.year[lang])],
    createdAt: Date.now(), source: "template",
  };
}
