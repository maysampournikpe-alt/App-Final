"use client";
import Link from "next/link";
import { useLang } from "@/lib/i18n";
import { EXAMS } from "@/lib/exam/config";
import type { ExamId } from "@/lib/exam/types";
import { useCopy } from "@/lib/use-copy";
import { buttonClass, Page } from "../ui";
import { TrademarkNote } from "./TrademarkNote";

type Block = { h: string; items: string[] };
type Guide = { how: string[]; blocks: Block[] };

// Hand-written. Numbers (questions, minutes) match src/lib/exam/config.ts. Test makers change formats, so the page says to check their site.
const en: Record<"sat" | "act" | "tsi", Guide> = {
  sat: {
    how: [
      "The digital SAT is taken on a laptop or tablet in the free Bluebook app.",
      "There are two sections, Reading and Writing, then Math. Each section has two modules.",
      "Reading and Writing: 27 questions and 32 minutes per module. Math: 22 questions and 35 minutes per module.",
      "The second module of each section is easier or harder depending on how you did on the first. Do your best on both.",
      "Scores run from 400 to 1600. There is no penalty for a wrong answer, so never leave a question blank.",
      "A graphing calculator (Desmos) is built in for the whole Math section, and a reference sheet of formulas is available.",
      "You can flag a question and come back to it inside the same module, but you cannot go back to an earlier module.",
    ],
    blocks: [
      { h: "Pacing", items: ["Reading and Writing is about 70 seconds a question. Math is about 95 seconds a question.", "If a question is not moving after about a minute, pick your best guess, flag it, and move on. Come back if time is left.", "Do the questions you are sure of first. Easy points are worth the same as hard ones."] },
      { h: "Reading and Writing method", items: ["Read the whole short passage, then the question. Put the answer in your own words before you look at the choices.", "Grammar questions: decide which rule is being tested (sentence boundary, comma, agreement, tense, pronoun, modifier) and pick the choice that follows the rule, not the one that sounds nice.", "Command of evidence: restate the claim, then pick the choice that supports every part of it.", "Eliminate choices that are too extreme, off-topic, or only partly true."] },
      { h: "Math method", items: ["Underline what the question asks for before you calculate. Many wrong answers solve for the wrong thing.", "Graph it in Desmos when a problem has equations, a system or a function. Look for intersections, intercepts and the vertex.", "For grid-in (type your own answer) questions, any equivalent form is accepted. Check that your answer makes sense.", "Plug the answer choices back in when the algebra is slow."] },
      { h: "Test-day checklist", items: ["Charge your device and install Bluebook before test day. Bring the admission ticket and a photo ID your school or test center accepts.", "Sleep, eat breakfast, and arrive early.", "Between sections, take the break. Drink some water and stretch.", "Check collegeboard.org for current rules, dates and what you may bring."] },
      { h: "A plan to a top score", items: ["Week 1: take the diagnostic. List your three weakest skills.", "Each week: finish the study-path topics in your weakest skills, then take a practice quiz on each at Hard, and finish with Real exam style.", "Every two weeks: take a Mock exam under time. Review every miss and write one sentence on why it was wrong.", "Last week: review your cram sheets and flashcards, and do one more mock. Stop studying the night before."] },
    ],
  },
  act: {
    how: [
      "The ACT has English, Math and Reading, plus a Science test that is optional on the current ACT.",
      "English: 50 questions in 35 minutes. Math: 45 questions in 50 minutes. Reading: 36 questions in 40 minutes. Science: 40 questions in 40 minutes.",
      "Each test is scored from 1 to 36. Your composite is the average of English, Math and Reading.",
      "There is no penalty for a wrong answer, so answer every question.",
      "You may take it on a computer or on paper, depending on where you test. Check act.org for the current format.",
    ],
    blocks: [
      { h: "Pacing", items: ["English is about 42 seconds a question, Math about 67 seconds, Reading about 67 seconds and Science about 60 seconds.", "Skip a question that is stuck, mark your best guess, and return if time is left.", "In Reading, split your time evenly across the passages and do not spend too long on one."] },
      { h: "English method", items: ["Read the sentence around the underlined part. Decide what rule or skill the question tests.", "When the choices differ only in length, the most concise choice that keeps the meaning is usually right.", "'NO CHANGE' is correct about as often as any other choice. Do not avoid it."] },
      { h: "Math method", items: ["Write down what the question asks. Draw a figure if there is none.", "Try plugging in the answer choices or a simple number when the algebra is long.", "Know your formulas by heart: area, volume, slope, distance, the Pythagorean theorem and the basic trigonometric ratios."] },
      { h: "Reading and Science method", items: ["Reading: skim the passage for the main idea and structure, then use line references to find details. The answer is in the text.", "Science: look at the figures and tables first. Many questions can be answered from the data alone.", "On conflicting viewpoints passages, summarize each scientist in a few words before you read the questions."] },
      { h: "Test-day checklist", items: ["Bring your admission ticket, a photo ID, sharpened pencils and an approved calculator if you test on paper.", "Eat breakfast and arrive early.", "Check act.org for current rules and what is allowed."] },
      { h: "A plan to a top score", items: ["Week 1: take the diagnostic and list your weakest skills in each section.", "Each week: finish the study-path topics for your weakest skills, then do Hard and Real exam style quizzes.", "Every two weeks: take a timed mock section and review each miss.", "Last week: cram sheets, flashcards and one last mock. Rest the night before."] },
    ],
  },
  tsi: {
    how: [
      "The TSI Assessment (TSIA2) shows whether you are ready for college-level classes in Texas. It covers Mathematics and Reading and Writing (ELAR).",
      "It is adaptive: the questions you see depend on your answers. It has no time limit.",
      "Texas colleges commonly use 950 in Math and 945 in Reading and Writing as the college-ready lines, but your college sets its own rules.",
      "Some students are exempt because of SAT, ACT or STAAR scores or other rules. Ask your counselor before you test.",
      "The Reading and Writing test may include an essay in some cases. Ask your college what applies to you.",
    ],
    blocks: [
      { h: "Pacing", items: ["There is no clock, so do not rush. Read every question and every choice.", "Use scratch paper for every math problem. Write each step.", "If you are stuck, eliminate choices you know are wrong and pick the best of what is left."] },
      { h: "Math method", items: ["Underline what the question asks. Check units.", "Estimate first so you can tell when an answer is unreasonable.", "Practice fractions, percents, linear equations, systems, factoring and basic geometry. These come up often."] },
      { h: "Reading and Writing method", items: ["Reading: state the main idea in your own words, then find the choice that matches the text.", "Writing: decide what rule is tested (sentence boundary, punctuation, agreement, tense, transitions) and choose the answer that follows it.", "Choose the clearest, most concise wording that keeps the meaning."] },
      { h: "Test-day checklist", items: ["Bring a photo ID and check with your college about the testing rules and any approved calculator.", "Eat breakfast and arrive early.", "Ask your advisor what scores you need and whether you may retest."] },
      { h: "A plan to a top score", items: ["Week 1: take the diagnostic and list your weakest skills.", "Each week: finish the study-path topics for your weakest skills and take Medium, then Hard quizzes.", "Every two weeks: take a Mock exam without a time limit, then review each miss.", "Last week: cram sheets and flashcards. Rest the night before."] },
    ],
  },
};

const es: Record<"sat" | "act" | "tsi", Guide> = {
  sat: {
    how: [
      "El SAT digital se presenta en una laptop o tableta con la app gratis Bluebook.",
      "Tiene dos secciones, Lectura y escritura, y luego Matemáticas. Cada sección tiene dos módulos.",
      "Lectura y escritura: 27 preguntas y 32 minutos por módulo. Matemáticas: 22 preguntas y 35 minutos por módulo.",
      "El segundo módulo de cada sección es más fácil o más difícil según cómo te fue en el primero. Da lo mejor en los dos.",
      "El puntaje va de 400 a 1600. No hay castigo por una respuesta mala, así que nunca dejes una pregunta en blanco.",
      "Hay una calculadora graficadora (Desmos) integrada en toda la sección de Matemáticas, y una hoja de fórmulas.",
      "Puedes marcar una pregunta y volver a ella dentro del mismo módulo, pero no puedes regresar a un módulo anterior.",
    ],
    blocks: [
      { h: "Ritmo", items: ["En Lectura y escritura son unos 70 segundos por pregunta. En Matemáticas, unos 95 segundos.", "Si una pregunta no avanza después de un minuto, elige tu mejor respuesta, márcala y sigue. Vuelve si te sobra tiempo.", "Haz primero las preguntas que tienes seguras. Los puntos fáciles valen igual que los difíciles."] },
      { h: "Método para Lectura y escritura", items: ["Lee todo el pasaje corto y luego la pregunta. Piensa la respuesta con tus palabras antes de ver las opciones.", "Preguntas de gramática: decide qué regla se evalúa (límite de oración, coma, concordancia, tiempo, pronombre, modificador) y elige la opción que sigue la regla, no la que suena bonita.", "Dominio de la evidencia: repite la afirmación con tus palabras y elige la opción que apoya todas sus partes.", "Descarta opciones demasiado extremas, fuera de tema o solo parcialmente ciertas."] },
      { h: "Método para Matemáticas", items: ["Subraya lo que pide la pregunta antes de calcular. Muchas respuestas malas resuelven otra cosa.", "Grafica en Desmos cuando haya ecuaciones, un sistema o una función. Busca intersecciones, cortes con los ejes y el vértice.", "En las preguntas donde escribes tu respuesta, se acepta cualquier forma equivalente. Revisa que tenga sentido.", "Prueba las opciones en el problema cuando el álgebra sea lenta."] },
      { h: "Lista para el día del examen", items: ["Carga tu dispositivo e instala Bluebook antes del examen. Lleva tu boleto de admisión y una identificación con foto que acepten.", "Duerme bien, desayuna y llega temprano.", "Entre secciones, toma el descanso. Toma agua y estírate.", "Revisa collegeboard.org para ver las reglas, fechas y qué puedes llevar."] },
      { h: "Un plan para un puntaje alto", items: ["Semana 1: haz el diagnóstico. Anota tus tres habilidades más débiles.", "Cada semana: termina los temas de la ruta de tus habilidades más débiles, haz un cuestionario de cada una en Difícil y termina con Estilo del examen real.", "Cada dos semanas: haz un examen de práctica con tiempo. Revisa cada error y escribe una frase de por qué fallaste.", "Última semana: repasa tus hojas de repaso y tarjetas y haz un examen más. No estudies la noche anterior."] },
    ],
  },
  act: {
    how: [
      "El ACT tiene Inglés, Matemáticas y Lectura, y una prueba de Ciencias que es opcional en el ACT actual.",
      "Inglés: 50 preguntas en 35 minutos. Matemáticas: 45 preguntas en 50 minutos. Lectura: 36 preguntas en 40 minutos. Ciencias: 40 preguntas en 40 minutos.",
      "Cada prueba se califica de 1 a 36. Tu compuesto es el promedio de Inglés, Matemáticas y Lectura.",
      "No hay castigo por una respuesta mala, así que contesta todas las preguntas.",
      "Puedes presentarlo en computadora o en papel, según donde lo hagas. Revisa act.org para ver el formato actual.",
    ],
    blocks: [
      { h: "Ritmo", items: ["Inglés son unos 42 segundos por pregunta, Matemáticas unos 67, Lectura unos 67 y Ciencias unos 60.", "Salta una pregunta atorada, marca tu mejor respuesta y vuelve si te sobra tiempo.", "En Lectura, reparte tu tiempo en partes iguales entre los pasajes y no te quedes mucho en uno."] },
      { h: "Método para Inglés", items: ["Lee la oración alrededor de la parte subrayada. Decide qué regla o habilidad evalúa la pregunta.", "Cuando las opciones solo cambian en largo, la más concisa que conserva el significado suele ser la correcta.", "'NO CHANGE' es correcta tan seguido como cualquier otra opción. No la evites."] },
      { h: "Método para Matemáticas", items: ["Escribe lo que pide la pregunta. Dibuja una figura si no hay.", "Prueba las opciones o un número sencillo cuando el álgebra sea larga.", "Sabe de memoria las fórmulas: área, volumen, pendiente, distancia, el teorema de Pitágoras y las razones trigonométricas básicas."] },
      { h: "Método para Lectura y Ciencias", items: ["Lectura: hojea el pasaje para ver la idea principal y la estructura, y usa los números de línea para hallar detalles. La respuesta está en el texto.", "Ciencias: mira primero las figuras y tablas. Muchas preguntas se contestan solo con los datos.", "En pasajes de puntos de vista opuestos, resume a cada científico en pocas palabras antes de leer las preguntas."] },
      { h: "Lista para el día del examen", items: ["Lleva tu boleto de admisión, una identificación con foto, lápices afilados y una calculadora aprobada si lo haces en papel.", "Desayuna y llega temprano.", "Revisa act.org para ver las reglas y lo que se permite."] },
      { h: "Un plan para un puntaje alto", items: ["Semana 1: haz el diagnóstico y anota tus habilidades más débiles en cada sección.", "Cada semana: termina los temas de la ruta de tus habilidades más débiles y haz cuestionarios Difíciles y de Estilo del examen real.", "Cada dos semanas: haz una sección de práctica con tiempo y revisa cada error.", "Última semana: hojas de repaso, tarjetas y un último examen. Descansa la noche anterior."] },
    ],
  },
  tsi: {
    how: [
      "El examen TSI (TSIA2) muestra si estás listo para clases de nivel universitario en Texas. Cubre Matemáticas y Lectura y escritura (ELAR).",
      "Es adaptativo: las preguntas que ves dependen de tus respuestas. No tiene límite de tiempo.",
      "Las universidades de Texas suelen usar 950 en Matemáticas y 945 en Lectura y escritura como líneas de preparación, pero tu universidad pone sus propias reglas.",
      "Algunos estudiantes están exentos por puntajes del SAT, ACT o STAAR u otras reglas. Pregunta a tu consejero antes de presentarlo.",
      "La prueba de Lectura y escritura puede incluir un ensayo en algunos casos. Pregunta a tu universidad qué te aplica.",
    ],
    blocks: [
      { h: "Ritmo", items: ["No hay reloj, así que no te apures. Lee cada pregunta y cada opción.", "Usa hojas de borrador en cada problema de matemáticas. Escribe cada paso.", "Si te atoras, descarta las opciones que sabes que están mal y elige la mejor de las que quedan."] },
      { h: "Método para Matemáticas", items: ["Subraya lo que pide la pregunta. Revisa las unidades.", "Estima primero para notar cuándo una respuesta no es razonable.", "Practica fracciones, porcentajes, ecuaciones lineales, sistemas, factorización y geometría básica. Salen seguido."] },
      { h: "Método para Lectura y escritura", items: ["Lectura: di la idea principal con tus palabras y luego busca la opción que coincide con el texto.", "Escritura: decide qué regla se evalúa (límite de oración, puntuación, concordancia, tiempo, transiciones) y elige la respuesta que la sigue.", "Elige la redacción más clara y concisa que conserve el significado."] },
      { h: "Lista para el día del examen", items: ["Lleva una identificación con foto y pregunta a tu universidad sobre las reglas del examen y la calculadora aprobada.", "Desayuna y llega temprano.", "Pregunta a tu asesor qué puntajes necesitas y si puedes repetirlo."] },
      { h: "Un plan para un puntaje alto", items: ["Semana 1: haz el diagnóstico y anota tus habilidades más débiles.", "Cada semana: termina los temas de la ruta de tus habilidades más débiles y haz cuestionarios Medios y luego Difíciles.", "Cada dos semanas: haz un examen de práctica sin límite de tiempo y revisa cada error.", "Última semana: hojas de repaso y tarjetas. Descansa la noche anterior."] },
    ],
  },
};

const labels = {
  en: { title: "Strategy guide", how: "How the test works", check: "Check the official site for the newest rules, dates and formats.", start: "Start the study path", practice: "Practice quizzes" },
  es: { title: "Guía de estrategia", how: "Cómo funciona el examen", check: "Revisa el sitio oficial para ver las reglas, fechas y formatos más recientes.", start: "Empezar la ruta de estudio", practice: "Cuestionarios de práctica" },
};

/** Hand-written test-day and pacing guide for the SAT, PSAT, ACT and TSI. */
export function StrategyTool({ track }: { track: Exclude<ExamId, "ap"> }) {
  const lang = useLang();
  const t = useCopy(labels);
  const key = track === "psat" ? "sat" : track;
  const g = (lang === "es" ? es : en)[key];
  const how = track === "psat"
    ? (lang === "es"
      ? ["El PSAT está hecho como el SAT digital: mismas secciones, módulos, la app Bluebook y la calculadora Desmos integrada.", "Se califica de 160 a 760 por sección (320 a 1520 en total). En 11.º grado es el PSAT/NMSQT, que también sirve para calificar a la Beca Nacional al Mérito.", ...g.how.slice(2)]
      : ["The PSAT is built like the digital SAT: the same sections and modules, the Bluebook app and the built-in Desmos calculator.", "It is scored from 160 to 760 per section (320 to 1520 total). In 11th grade it is the PSAT/NMSQT, which also qualifies students for National Merit.", ...g.how.slice(2)])
    : g.how;
  return (
    <Page>
      <h1 className="text-3xl sm:text-4xl">{EXAMS[track][lang]}: {t.title}</h1>
      <section className="guide-card mt-6 p-5" aria-labelledby="how-h"><h2 id="how-h" className="text-2xl">{t.how}</h2>
        <ul className="mt-3 list-disc space-y-2 pl-6 text-lg marker:text-terracotta">{how.map((x) => <li key={x}>{x}</li>)}</ul></section>
      {g.blocks.map((b) => (
        <section key={b.h} className="mt-8" aria-labelledby={`b-${b.h}`}><h2 id={`b-${b.h}`} className="border-b-[1.5px] border-ink pb-1 text-2xl">{b.h}</h2>
          <ul className="mt-3 list-disc space-y-2 pl-6 text-lg marker:text-terracotta">{b.items.map((x) => <li key={x}>{x}</li>)}</ul></section>
      ))}
      <p className="mt-8 text-sm text-muted">{t.check}</p>
      <div className="mt-6 flex flex-wrap gap-3"><Link href={`/t/${track}/path`} className={buttonClass.primary}>{t.start}</Link><Link href={`/t/${track}/sections`} className={buttonClass.secondary}>{t.practice}</Link></div>
      <TrademarkNote />
    </Page>
  );
}
