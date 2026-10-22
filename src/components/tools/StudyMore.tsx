"use client";
import { useEffect, useRef, useState } from "react";
import { addDays, diffDays, formatDay, isValidISO, today } from "@/lib/dates";
import { useLang } from "@/lib/i18n";
import { useLocalDoc } from "@/lib/local-doc";
import { words, wpm } from "@/lib/text";
import { useCopy } from "@/lib/use-copy";
import { buttonClass, inputClass } from "../ui";
import { Callout, Chips, Head } from "./shared";

const copy = {
  en: {
    start: "Start", stop: "Stop", reset: "Start over", copy: "Copy to clipboard", copied: "Copied.", print: "Print",
    mtTitle: "Study method picker", mtLead: "Tell me what you are trying to do and get a method that fits, with steps.", mtAsk: "What are you studying for?", mtGoals: { facts: "Memorizing facts and vocabulary", concepts: "Understanding a hard idea", problems: "Math or science problems", essay: "Writing an essay", test: "A big test next week" }, mtSteps: "Steps", mtTry: "Try the tool",
    methods: {
      facts: { name: "Active recall with spaced repetition", why: "Pulling answers out of your head is stronger than rereading, and spacing the reviews makes them last.", steps: ["Make a flashcard for each fact.", "Look at the front and try to answer before you flip.", "Mark cards you missed. They come back sooner.", "Review a little every day, not all at once."], href: "/t/notes/flashcards" },
      concepts: { name: "Explain it in your own words", why: "If you cannot explain it simply, you have found the exact gap to fix. This is often called the Feynman technique.", steps: ["Write the idea at the top of a page.", "Explain it as if teaching a younger student.", "Notice where you get stuck or use big words.", "Go back to your notes, fix the gap, and explain again."], href: "/t/study/feynman" },
      problems: { name: "Practice problems, then check your steps", why: "You learn problem-solving by solving. Mixing problem types makes it stick better than doing one type in a row.", steps: ["Try a problem without looking at the example.", "Check each step against a worked solution.", "Write down the exact step where you went wrong.", "Mix in older problem types, not only today's."], href: "/t/study/mistakes" },
      essay: { name: "Outline first, then draft, then revise", why: "A plan makes drafting faster, and revising in a separate pass catches more than editing as you write.", steps: ["Write a one-sentence thesis.", "Outline your main points with evidence.", "Draft fast without fixing as you go.", "Take a break, then revise for ideas first and spelling last."], href: "/t/writing/outline" },
      test: { name: "Practice testing with a daily plan", why: "Testing yourself shows what you really know. Short sessions on several days beat one long night.", steps: ["List the topics that will be on the test.", "Spread them over the days you have left.", "Quiz yourself instead of rereading.", "Sleep well the night before. It helps memory."], href: "/t/plan/studyplanner" },
    },
    tdTitle: "Test day checklist", tdLead: "Check things off as you get ready. Ask your teacher what is allowed for your specific test.", tdGroups: { night: "The night before", morning: "In the morning", bring: "What to bring" }, tdItems: { night: ["Pack my bag", "Light review only, no cramming", "Lay out my clothes", "Go to bed on time (teens need 8 to 10 hours)", "Set two alarms"], morning: ["Eat a real breakfast", "Drink some water", "Leave early so I am not rushing", "Take 3 slow breaths before I start"], bring: ["Pencils or pens", "Charged calculator, if allowed", "Student ID", "Water bottle, if allowed", "Anything my teacher said to bring"] }, tdLeft: (n: number) => `${n} left`, tdDone: "You are ready. Good luck.", tdAsk: "Phones and smart watches are often not allowed in a test room. Ask first.",
    tmTitle: "Timed practice", tmLead: "Practice at test pace. Enter how long you have and how many questions, and get a pace plan with checkpoints.", tmMin: "Total minutes", tmQ: "Number of questions", tmPace: (s: number) => `About ${Math.floor(s / 60)} min ${s % 60} sec per question`, tmGo: "Start the clock", tmLeft: "Time left", tmShould: (n: number) => `You should be on question ${n} by now.`, tmDone: "Time is up. Put your pencil down.", tmNeed: "Enter minutes and questions.", tmCheck: "Checkpoints", tmAt: (p: number, m: number, q: number) => `${p}% of the time (${m} min): question ${q}`, tmTip: "If a question takes more than twice the pace, mark it, move on and come back.",
    dlTitle: "Daily challenge", dlLead: "A new one every day. Same challenge all day, a different one tomorrow.", dlKind: "Today's challenge", kinds: { math: "Math", word: "Word", debate: "Debate" }, answer: "Your answer", check: "Check", right: "Correct. Nice work.", wrong: (a: string) => `Not quite. The answer is ${a}.`, dlWordQ: "Which meaning fits this word?", dlDebateQ: "Pick a side and give two reasons. Then argue the other side. Pick whichever you disagree with to stretch your thinking.", dlMathQ: (a: number, b: number, c: number) => `What is ${a} × ${b} − ${c}?`,
    spTitle: "Public speaking coach", spLead: "Practice your speech out loud and check your pace. Nothing is recorded.", spText: "Your speech", spPh: "Paste or type your speech", spGo: "Start talking", spEnd: "I finished", spRes: (w: number, s: number, p: number) => `${w} words in ${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")} is ${p} words per minute`, spSlow: "That is on the slow side. Slow can be good for key points, but try picking up the pace a little.", spFast: "That is fast. Add pauses after important ideas.", spGood: "That is a comfortable speaking pace.", spRange: "Many speakers aim for roughly 120 to 160 words per minute.", spTips: ["Look up from your paper at the end of each sentence.", "Pause on purpose. A pause feels long to you and normal to the listener.", "Stand tall and breathe from your belly.", "Practice standing up, out loud, not in your head.", "Pick one friend in the room and speak to them."],
    dbTitle: "Debate case builder", dbLead: "Claim, evidence, and what the other side will say. Having the rebuttal ready is half the win.", dbSide: "Your side", claim: "Claim (your main argument)", evidence: "Evidence", ev: "Evidence", opp: "What the other side will say", rebut: "Your rebuttal", dbOut: "Case summary",
    sfTitle: "Science fair helper", sfLead: "Find a testable question, turn it into a hypothesis, and plan your timeline backward from the fair.", sfArea: "Area", areas: { plants: "Plants", food: "Food and kitchen", sports: "Sports and body", tech: "Technology", earth: "Water, weather and earth", people: "People and habits" }, sfIdeas: "Question ideas", sfPick: "Use this question", sfQ: "Your question", sfIf: "If I change…", sfThen: "then…", sfBecause: "because…", sfHyp: "Hypothesis", sfFair: "Date of the fair", sfPlan: "Timeline", sfNeed: "Pick a future date.", sfTight: "That is a short timeline. The steps are squeezed, so start now.", steps: ["Pick and narrow your question", "Research and write your hypothesis", "Get materials and plan the procedure", "Run the experiment and record data", "Make graphs and write conclusions", "Build your display and practice your talk"], sfNote: "A good experiment changes one thing at a time and repeats trials. Ask a teacher about safety rules before you start.",
    ideas: { plants: ["Does the color of light change how fast bean seeds sprout?", "Which type of soil holds the most water?", "Does music or silence change how plants grow?", "Which fertilizer-free method helps seeds sprout fastest?"], food: ["Which brand of popcorn pops the most kernels?", "Does temperature change how fast sugar dissolves?", "Which fruit browns slowest with lemon juice?", "Does the type of container change how fast ice melts?"], sports: ["Does stretching change how far people can jump?", "How does heart rate change after different exercises?", "Does the type of surface change how high a ball bounces?", "Does drinking water change reaction time?"], tech: ["Does the distance from the router change WiFi speed?", "Which paper airplane design flies farthest?", "Does battery temperature change how long it lasts?", "How does screen brightness change battery life?"], earth: ["Which material filters dirty water best?", "Does salt change how fast water freezes?", "How does slope change how much soil washes away?", "Which surface gets hottest in the sun?"], people: ["Does background noise change how many words people remember?", "Does handwriting or typing help students remember more?", "Do people react faster with their left or right hand?", "Does the time of day change how well people focus?"] },
  },
  es: {
    start: "Empezar", stop: "Parar", reset: "Empezar de nuevo", copy: "Copiar", copied: "Copiado.", print: "Imprimir",
    mtTitle: "Elige cómo estudiar", mtLead: "Dime qué quieres lograr y recibe un método que te sirva, con pasos.", mtAsk: "¿Para qué estudias?", mtGoals: { facts: "Memorizar datos y vocabulario", concepts: "Entender una idea difícil", problems: "Problemas de mate o ciencias", essay: "Escribir un ensayo", test: "Un examen importante la próxima semana" }, mtSteps: "Pasos", mtTry: "Probar la herramienta",
    methods: {
      facts: { name: "Recordar activamente con repaso espaciado", why: "Sacar las respuestas de tu cabeza es más fuerte que releer, y espaciar los repasos hace que duren.", steps: ["Haz una tarjeta por cada dato.", "Mira el frente e intenta contestar antes de voltearla.", "Marca las tarjetas que fallaste. Regresan antes.", "Repasa un poco cada día, no todo de golpe."], href: "/t/notes/flashcards" },
      concepts: { name: "Explícalo con tus palabras", why: "Si no puedes explicarlo sencillo, encontraste justo el hueco que hay que arreglar. A esto se le llama la técnica de Feynman.", steps: ["Escribe la idea arriba de una hoja.", "Explícala como si enseñaras a un estudiante más chico.", "Fíjate dónde te trabas o usas palabras grandes.", "Regresa a tus apuntes, arregla el hueco y explícala otra vez."], href: "/t/study/feynman" },
      problems: { name: "Practica problemas y revisa tus pasos", why: "Aprendes a resolver problemas resolviéndolos. Mezclar tipos de problemas ayuda más que hacer un solo tipo seguido.", steps: ["Intenta un problema sin mirar el ejemplo.", "Compara cada paso con una solución resuelta.", "Anota el paso exacto donde te equivocaste.", "Mezcla tipos de problemas anteriores, no solo los de hoy."], href: "/t/study/mistakes" },
      essay: { name: "Primero esquema, luego borrador, luego revisión", why: "Un plan hace más rápido el borrador, y revisar en otra pasada atrapa más que corregir mientras escribes.", steps: ["Escribe tu tesis en una oración.", "Haz un esquema de tus puntos con evidencia.", "Escribe el borrador rápido sin corregir.", "Descansa y luego revisa primero las ideas y al final la ortografía."], href: "/t/writing/outline" },
      test: { name: "Practica con exámenes y un plan diario", why: "Ponerte a prueba muestra lo que de verdad sabes. Sesiones cortas en varios días ganan a una noche larga.", steps: ["Haz la lista de temas del examen.", "Repártelos en los días que te quedan.", "Hazte preguntas en vez de releer.", "Duerme bien la noche anterior. Ayuda a la memoria."], href: "/t/plan/studyplanner" },
    },
    tdTitle: "Lista para el día del examen", tdLead: "Marca las cosas mientras te preparas. Pregunta a tu maestro qué se permite en tu examen.", tdGroups: { night: "La noche anterior", morning: "En la mañana", bring: "Qué llevar" }, tdItems: { night: ["Preparar mi mochila", "Solo un repaso ligero, sin memorizar de golpe", "Dejar lista mi ropa", "Acostarme a tiempo (los jóvenes necesitan de 8 a 10 horas)", "Poner dos alarmas"], morning: ["Desayunar bien", "Tomar agua", "Salir temprano para no ir con prisa", "Respirar lento 3 veces antes de empezar"], bring: ["Lápices o plumas", "Calculadora cargada, si se permite", "Credencial escolar", "Botella de agua, si se permite", "Lo que mi maestro dijo que llevara"] }, tdLeft: (n: number) => `Faltan ${n}`, tdDone: "Estás listo. Mucha suerte.", tdAsk: "Muchas veces no se permiten celulares ni relojes inteligentes en el salón del examen. Pregunta primero.",
    tmTitle: "Práctica con tiempo", tmLead: "Practica al ritmo del examen. Escribe cuánto tiempo tienes y cuántas preguntas, y recibe un plan de ritmo con puntos de control.", tmMin: "Minutos totales", tmQ: "Número de preguntas", tmPace: (s: number) => `Como ${Math.floor(s / 60)} min ${s % 60} seg por pregunta`, tmGo: "Empezar el reloj", tmLeft: "Tiempo restante", tmShould: (n: number) => `Ya deberías ir en la pregunta ${n}.`, tmDone: "Se acabó el tiempo. Deja el lápiz.", tmNeed: "Escribe los minutos y las preguntas.", tmCheck: "Puntos de control", tmAt: (p: number, m: number, q: number) => `${p}% del tiempo (${m} min): pregunta ${q}`, tmTip: "Si una pregunta tarda más del doble del ritmo, márcala, sigue y regresa después.",
    dlTitle: "Reto diario", dlLead: "Uno nuevo cada día. El mismo reto todo el día y otro mañana.", dlKind: "El reto de hoy", kinds: { math: "Mate", word: "Palabra", debate: "Debate" }, answer: "Tu respuesta", check: "Revisar", right: "Correcto. Buen trabajo.", wrong: (a: string) => `No exactamente. La respuesta es ${a}.`, dlWordQ: "¿Qué significado va con esta palabra?", dlDebateQ: "Elige un lado y da dos razones. Luego defiende el otro lado. Elige el que no compartes para estirar tu pensamiento.", dlMathQ: (a: number, b: number, c: number) => `¿Cuánto es ${a} × ${b} − ${c}?`,
    spTitle: "Entrenador para hablar en público", spLead: "Practica tu discurso en voz alta y revisa tu ritmo. No se graba nada.", spText: "Tu discurso", spPh: "Pega o escribe tu discurso", spGo: "Empezar a hablar", spEnd: "Terminé", spRes: (w: number, s: number, p: number) => `${w} palabras en ${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")} son ${p} palabras por minuto`, spSlow: "Va algo lento. Lento puede ser bueno para las ideas clave, pero intenta acelerar un poco.", spFast: "Va rápido. Agrega pausas después de las ideas importantes.", spGood: "Es un ritmo cómodo para hablar.", spRange: "Muchos oradores buscan más o menos de 120 a 160 palabras por minuto.", spTips: ["Levanta la vista del papel al final de cada oración.", "Haz pausas a propósito. Una pausa te parece larga a ti y normal a quien escucha.", "Párate derecho y respira con el estómago.", "Practica de pie y en voz alta, no en tu cabeza.", "Elige a un amigo en el salón y háblale a esa persona."],
    dbTitle: "Armador de casos de debate", dbLead: "Argumento, evidencia y lo que dirá el otro lado. Tener lista la refutación es la mitad de ganar.", dbSide: "Tu lado", claim: "Argumento (tu idea principal)", evidence: "Evidencia", ev: "Evidencia", opp: "Lo que dirá el otro lado", rebut: "Tu refutación", dbOut: "Resumen del caso",
    sfTitle: "Ayuda para la feria de ciencias", sfLead: "Encuentra una pregunta que se pueda probar, conviértela en hipótesis y planea tu calendario hacia atrás desde la feria.", sfArea: "Área", areas: { plants: "Plantas", food: "Comida y cocina", sports: "Deportes y cuerpo", tech: "Tecnología", earth: "Agua, clima y tierra", people: "Personas y hábitos" }, sfIdeas: "Ideas de preguntas", sfPick: "Usar esta pregunta", sfQ: "Tu pregunta", sfIf: "Si cambio…", sfThen: "entonces…", sfBecause: "porque…", sfHyp: "Hipótesis", sfFair: "Fecha de la feria", sfPlan: "Calendario", sfNeed: "Elige una fecha futura.", sfTight: "Es poco tiempo. Los pasos van apretados, así que empieza ya.", steps: ["Elegir y precisar tu pregunta", "Investigar y escribir tu hipótesis", "Conseguir materiales y planear el procedimiento", "Hacer el experimento y anotar datos", "Hacer gráficas y escribir conclusiones", "Armar tu exhibición y practicar tu presentación"], sfNote: "Un buen experimento cambia una sola cosa a la vez y repite las pruebas. Pregunta a un maestro sobre las reglas de seguridad antes de empezar.",
    ideas: { plants: ["¿El color de la luz cambia qué tan rápido brotan las semillas de frijol?", "¿Qué tipo de tierra retiene más agua?", "¿La música o el silencio cambian cómo crecen las plantas?", "¿Qué método sin fertilizante hace brotar más rápido las semillas?"], food: ["¿Qué marca de palomitas revienta más granos?", "¿La temperatura cambia qué tan rápido se disuelve el azúcar?", "¿Qué fruta se oscurece más lento con jugo de limón?", "¿El tipo de recipiente cambia qué tan rápido se derrite el hielo?"], sports: ["¿Estirarse cambia qué tan lejos saltan las personas?", "¿Cómo cambia el pulso después de distintos ejercicios?", "¿El tipo de superficie cambia qué tan alto rebota una pelota?", "¿Tomar agua cambia el tiempo de reacción?"], tech: ["¿La distancia al router cambia la velocidad del WiFi?", "¿Qué diseño de avión de papel vuela más lejos?", "¿La temperatura de la batería cambia cuánto dura?", "¿Cómo cambia el brillo de la pantalla la duración de la batería?"], earth: ["¿Qué material filtra mejor el agua sucia?", "¿La sal cambia qué tan rápido se congela el agua?", "¿Cómo cambia la pendiente cuánta tierra arrastra el agua?", "¿Qué superficie se calienta más al sol?"], people: ["¿El ruido de fondo cambia cuántas palabras recuerdan las personas?", "¿Escribir a mano o a computadora ayuda a recordar más?", "¿Las personas reaccionan más rápido con la mano izquierda o la derecha?", "¿La hora del día cambia qué tan bien se concentran las personas?"] },
  },
};

const clip = async (text: string) => { try { await navigator.clipboard.writeText(text); return true; } catch { return false; } };
const area = "min-h-28 w-full rounded-md border-[1.5px] border-ink bg-surface p-3 text-lg placeholder:text-muted";
type Goal = "facts" | "concepts" | "problems" | "essay" | "test";

export function MethodsTool() {
  const c = useCopy(copy);
  const [g, setG] = useState<Goal>("facts");
  const m = c.methods[g];
  return (
    <Head title={c.mtTitle} lead={c.mtLead}>
      <div className="mt-5"><Chips<Goal> value={g} onChange={setG} label={c.mtAsk} options={(Object.keys(c.mtGoals) as Goal[]).map((k) => ({ id: k, label: c.mtGoals[k] }))} /></div>
      <section className="guide-card mt-5 p-6" aria-live="polite"><h2 className="font-display text-3xl font-semibold">{m.name}</h2><p className="mt-2 max-w-prose text-lg">{m.why}</p><h3 className="mt-4 text-xl">{c.mtSteps}</h3><ol className="mt-1 list-decimal space-y-1 pl-6 text-lg">{m.steps.map((s) => <li key={s}>{s}</li>)}</ol><a href={m.href} className={`${buttonClass.primary} mt-4 inline-flex`}>{c.mtTry}</a></section>
    </Head>
  );
}

const NO_CHECKS: Record<string, boolean> = {};
export function TestDayTool() {
  const c = useCopy(copy);
  const [done, setDone] = useLocalDoc<Record<string, boolean>>("testday", NO_CHECKS);
  const keys = (Object.keys(c.tdItems) as (keyof typeof c.tdItems)[]).flatMap((g) => c.tdItems[g].map((_, i) => `${g}-${i}`));
  const left = keys.filter((k) => !done[k]).length;
  return (
    <Head title={c.tdTitle} lead={c.tdLead}>
      <p className="mt-4 font-display text-2xl font-semibold text-teal" role="status">{left === 0 ? c.tdDone : c.tdLeft(left)}</p>
      {(Object.keys(c.tdItems) as (keyof typeof c.tdItems)[]).map((g) => <section key={g} className="mt-5"><h2 className="border-b-[1.5px] border-ink pb-1 text-2xl">{c.tdGroups[g]}</h2><ul className="divide-y-2 divide-dotted divide-line">{c.tdItems[g].map((it, i) => <li key={it}><label className="flex items-center gap-3 py-2.5 text-lg"><input type="checkbox" checked={!!done[`${g}-${i}`]} onChange={() => setDone({ ...done, [`${g}-${i}`]: !done[`${g}-${i}`] })} className="h-5 w-5 accent-[var(--c-teal)]" /><span className={done[`${g}-${i}`] ? "text-muted line-through" : ""}>{it}</span></label></li>)}</ul></section>)}
      <button onClick={() => setDone({})} className={`${buttonClass.secondary} mt-4`}>{c.reset}</button>
      <Callout>{c.tdAsk}</Callout>
    </Head>
  );
}

export function TimedTool() {
  const c = useCopy(copy);
  const [mins, setMins] = useState("30"), [qs, setQs] = useState("20");
  const [left, setLeft] = useState<number | null>(null);
  const total = Math.round((Number(mins) || 0) * 60), n = Math.round(Number(qs) || 0);
  const ok = total >= 60 && n >= 1 && n <= 500;
  const pace = ok ? Math.round(total / n) : 0;
  const t0 = useRef(0);
  useEffect(() => { if (left === null || left <= 0) return; const id = setInterval(() => { const s = total - Math.floor((Date.now() - t0.current) / 1000); setLeft(Math.max(0, s)); }, 500); return () => clearInterval(id); }, [left === null, left === 0, total]); // eslint-disable-line react-hooks/exhaustive-deps
  const elapsed = left === null ? 0 : total - left;
  const should = Math.min(n, Math.floor(elapsed / Math.max(pace, 1)) + 1);
  const clock = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
  return (
    <Head title={c.tmTitle} lead={c.tmLead}>
      <div className="mt-5 grid max-w-md gap-4 sm:grid-cols-2">
        <label><span className="block font-bold">{c.tmMin}</span><input type="number" min={1} max={600} value={mins} onChange={(e) => { setMins(e.target.value); setLeft(null); }} className={`${inputClass} mt-1`} /></label>
        <label><span className="block font-bold">{c.tmQ}</span><input type="number" min={1} max={500} value={qs} onChange={(e) => { setQs(e.target.value); setLeft(null); }} className={`${inputClass} mt-1`} /></label></div>
      {!ok ? <p className="mt-3 text-muted">{c.tmNeed}</p> : <>
        <p className="mt-4 font-display text-2xl font-semibold text-teal">{c.tmPace(pace)}</p>
        <h2 className="mt-4 text-xl">{c.tmCheck}</h2><ul className="mt-1 list-disc pl-6">{[25, 50, 75, 100].map((p) => <li key={p}>{c.tmAt(p, Math.round((total * p) / 6000), Math.max(1, Math.round((n * p) / 100)))}</li>)}</ul>
        <section className="guide-card mt-5 p-6 text-center">{left === null ? <button onClick={() => { t0.current = Date.now(); setLeft(total); }} className={buttonClass.primary}>{c.tmGo}</button> : <><p className="text-muted">{c.tmLeft}</p><p className="font-display text-6xl font-semibold tabular-nums" role="timer">{clock(left)}</p>{left > 0 ? <p className="mt-2 text-lg font-bold">{c.tmShould(should)}</p> : <p className="mt-2 text-lg font-bold text-ruby" role="status">{c.tmDone}</p>}<button onClick={() => setLeft(null)} className={`${buttonClass.secondary} mt-4`}>{left > 0 ? c.stop : c.reset}</button></>}</section></>}
      <p className="mt-4 max-w-prose text-sm text-muted">{c.tmTip}</p>
    </Head>
  );
}

const DAILY_WORDS: { en: { w: string; m: string; wrong: string[] }; es: { w: string; m: string; wrong: string[] } }[] = [
  { en: { w: "meticulous", m: "very careful about small details", wrong: ["very angry", "very tired", "very fast"] }, es: { w: "meticuloso", m: "muy cuidadoso con los detalles", wrong: ["muy enojado", "muy cansado", "muy rápido"] } },
  { en: { w: "resilient", m: "able to recover quickly after trouble", wrong: ["easy to break", "very rich", "always late"] }, es: { w: "resiliente", m: "capaz de recuperarse rápido después de un problema", wrong: ["fácil de romper", "muy rico", "siempre tarde"] } },
  { en: { w: "abundant", m: "more than enough", wrong: ["very small", "hard to find", "slightly broken"] }, es: { w: "abundante", m: "más que suficiente", wrong: ["muy pequeño", "difícil de encontrar", "un poco roto"] } },
  { en: { w: "reluctant", m: "not wanting to do something", wrong: ["excited to start", "able to fly", "very generous"] }, es: { w: "reacio", m: "que no quiere hacer algo", wrong: ["emocionado por empezar", "capaz de volar", "muy generoso"] } },
  { en: { w: "inevitable", m: "certain to happen", wrong: ["impossible to see", "easy to forget", "very noisy"] }, es: { w: "inevitable", m: "seguro que va a pasar", wrong: ["imposible de ver", "fácil de olvidar", "muy ruidoso"] } },
  { en: { w: "candid", m: "honest and direct", wrong: ["sweet like sugar", "hidden", "very shy"] }, es: { w: "franco", m: "honesto y directo", wrong: ["dulce como el azúcar", "escondido", "muy tímido"] } },
  { en: { w: "diligent", m: "working hard and carefully", wrong: ["easily confused", "always joking", "very quiet"] }, es: { w: "diligente", m: "que trabaja con esfuerzo y cuidado", wrong: ["que se confunde fácil", "que siempre bromea", "muy callado"] } },
];
const DEBATES = { en: ["Should schools start later in the morning?", "Should students be allowed to use phones during lunch?", "Is homework helpful or harmful?", "Should the school year be shorter with longer days?", "Should every student learn a second language?", "Should students choose some of their own classes every year?", "Should community service be required to graduate?"], es: ["¿Deberían las escuelas empezar más tarde en la mañana?", "¿Deberían los estudiantes poder usar celulares a la hora del almuerzo?", "¿La tarea ayuda o perjudica?", "¿Debería el año escolar ser más corto con días más largos?", "¿Debería todo estudiante aprender un segundo idioma?", "¿Deberían los estudiantes elegir algunas de sus clases cada año?", "¿Debería ser obligatorio el servicio comunitario para graduarse?"] };
const dayNumber = (iso: string) => Math.floor(new Date(iso + "T00:00:00Z").getTime() / 86400000);
export function DailyTool() {
  const c = useCopy(copy);
  const lang = useLang();
  const [kind, setKind] = useState<"math" | "word" | "debate">("math");
  const [ans, setAns] = useState("");
  const [res, setRes] = useState<boolean | null>(null);
  const day = dayNumber(today());
  const a = 6 + (day % 9), b = 3 + ((day * 7) % 9), cc = 5 + ((day * 3) % 20);
  const word = DAILY_WORDS[day % DAILY_WORDS.length][lang];
  const options = [word.m, ...word.wrong].map((v, i) => ({ v, k: (i * 7 + day) % 4 + i * 4 })).sort((x, y) => x.k - y.k).map((x) => x.v);
  const check = (e: React.FormEvent) => { e.preventDefault(); setRes(Number(ans) === a * b - cc); };
  return (
    <Head title={c.dlTitle} lead={c.dlLead}>
      <div className="mt-5"><Chips<"math" | "word" | "debate"> value={kind} onChange={(k) => { setKind(k); setAns(""); setRes(null); }} label={c.dlKind} options={(["math", "word", "debate"] as const).map((k) => ({ id: k, label: c.kinds[k] }))} /></div>
      <section className="guide-card mt-5 p-6">
        {kind === "math" ? <form onSubmit={check}><p className="font-display text-3xl font-semibold">{c.dlMathQ(a, b, cc)}</p><label className="mt-3 block"><span className="sr-only">{c.answer}</span><input inputMode="numeric" value={ans} onChange={(e) => setAns(e.target.value)} className={`${inputClass} max-w-40`} /></label><button className={`${buttonClass.primary} mt-3`}>{c.check}</button>{res !== null ? <p role="status" className={`mt-3 text-lg font-bold ${res ? "text-teal" : "text-ruby"}`}>{res ? c.right : c.wrong(String(a * b - cc))}</p> : null}</form> : null}
        {kind === "word" ? <div><p className="text-muted">{c.dlWordQ}</p><p className="font-display text-4xl font-semibold" lang={lang}>{word.w}</p><div className="mt-3 grid gap-2">{options.map((o) => <button key={o} onClick={() => setRes(o === word.m)} className="rounded-md border-[1.5px] border-ink bg-surface p-3 text-left text-lg hover:bg-sunken">{o}</button>)}</div>{res !== null ? <p role="status" className={`mt-3 text-lg font-bold ${res ? "text-teal" : "text-ruby"}`}>{res ? c.right : c.wrong(word.m)}</p> : null}</div> : null}
        {kind === "debate" ? <div><p className="font-display text-3xl font-semibold">{DEBATES[lang][day % DEBATES[lang].length]}</p><p className="mt-3 max-w-prose text-lg">{c.dlDebateQ}</p></div> : null}</section>
    </Head>
  );
}

export function SpeakingTool() {
  const c = useCopy(copy);
  const [text, setText] = useLocalDoc<string>("speech-text", "");
  const [run, setRun] = useState(false);
  const [secs, setSecs] = useState(0);
  const [out, setOut] = useState<number | null>(null);
  const t0 = useRef(0);
  const wc = words(text).length;
  useEffect(() => { if (!run) return; const id = setInterval(() => setSecs(Math.floor((Date.now() - t0.current) / 1000)), 500); return () => clearInterval(id); }, [run]);
  const rate = out !== null ? wpm(wc, out) : 0;
  return (
    <Head title={c.spTitle} lead={c.spLead}>
      <label className="mt-5 block"><span className="block font-bold">{c.spText}</span><textarea value={text} onChange={(e) => setText(e.target.value.slice(0, 20000))} placeholder={c.spPh} className={`${area} mt-1 min-h-48`} /></label>
      <div className="mt-4 flex flex-wrap items-center gap-4">{!run ? <button disabled={wc < 10} onClick={() => { t0.current = Date.now(); setSecs(0); setOut(null); setRun(true); }} className={buttonClass.primary}>{c.spGo}</button> : <button onClick={() => { setOut(Math.max(1, Math.floor((Date.now() - t0.current) / 1000))); setRun(false); }} className={buttonClass.primary}>{c.spEnd}</button>}{run ? <span className="font-display text-2xl font-semibold tabular-nums" role="timer">{Math.floor(secs / 60)}:{String(secs % 60).padStart(2, "0")}</span> : null}</div>
      {out !== null ? <section className="guide-card mt-5 p-5" aria-live="polite"><p className="font-display text-2xl font-semibold">{c.spRes(wc, out, rate)}</p><p className={`mt-1 text-lg font-bold ${rate >= 110 && rate <= 170 ? "text-teal" : ""}`}>{rate < 110 ? c.spSlow : rate > 170 ? c.spFast : c.spGood}</p><p className="text-sm text-muted">{c.spRange}</p></section> : null}
      <ul className="mt-5 list-disc space-y-1 pl-6 text-lg">{c.spTips.map((t) => <li key={t}>{t}</li>)}</ul>
    </Head>
  );
}

type Debate = { side: string; claim: string; ev: string[]; opp: string; rebut: string };
const NO_DEBATE: Debate = { side: "", claim: "", ev: ["", "", ""], opp: "", rebut: "" };
export function DebateTool() {
  const c = useCopy(copy);
  const [d, setD] = useLocalDoc<Debate>("debate-case", NO_DEBATE);
  const [note, setNote] = useState("");
  const text = `${c.dbSide}: ${d.side}\n${c.claim}: ${d.claim}\n${d.ev.map((e, i) => `${c.ev} ${i + 1}: ${e}`).join("\n")}\n${c.opp}: ${d.opp}\n${c.rebut}: ${d.rebut}`;
  return (
    <Head title={c.dbTitle} lead={c.dbLead}>
      <label className="mt-5 block"><span className="block font-bold">{c.dbSide}</span><input value={d.side} onChange={(e) => setD({ ...d, side: e.target.value })} maxLength={150} className={`${inputClass} mt-1`} /></label>
      <label className="mt-4 block"><span className="block font-bold">{c.claim}</span><textarea value={d.claim} onChange={(e) => setD({ ...d, claim: e.target.value })} rows={2} className={`${area} mt-1 !min-h-20`} /></label>
      {d.ev.map((e, i) => <label key={i} className="mt-4 block"><span className="block font-bold">{c.ev} {i + 1}</span><textarea value={e} onChange={(ev) => setD({ ...d, ev: d.ev.map((x, j) => (j === i ? ev.target.value : x)) })} rows={2} className={`${area} mt-1 !min-h-20`} /></label>)}
      <label className="mt-4 block"><span className="block font-bold">{c.opp}</span><textarea value={d.opp} onChange={(e) => setD({ ...d, opp: e.target.value })} rows={2} className={`${area} mt-1 !min-h-20`} /></label>
      <label className="mt-4 block"><span className="block font-bold">{c.rebut}</span><textarea value={d.rebut} onChange={(e) => setD({ ...d, rebut: e.target.value })} rows={2} className={`${area} mt-1 !min-h-20`} /></label>
      <div className="mt-5 flex flex-wrap items-center gap-3"><button onClick={async () => setNote((await clip(text)) ? c.copied : "")} className={buttonClass.primary}>{c.copy}</button><button onClick={() => window.print()} className={buttonClass.secondary}>{c.print}</button><span className="font-bold text-teal" role="status">{note}</span></div>
    </Head>
  );
}

type Area = keyof typeof copy.en.areas;
type SF = { q: string; change: string; then: string; because: string; fair: string };
const NO_SF: SF = { q: "", change: "", then: "", because: "", fair: "" };
export function ScienceFairTool() {
  const c = useCopy(copy);
  const lang = useLang();
  const [area2, setArea] = useState<Area>("plants");
  const [s, setS] = useLocalDoc<SF>("science-fair", NO_SF);
  const now = today();
  const valid = isValidISO(s.fair) && s.fair > now;
  const span = valid ? diffDays(now, s.fair) : 0;
  const cuts = [0, 0.1, 0.25, 0.45, 0.75, 0.9];
  const hyp = s.change && s.then ? `If ${s.change.trim()}, then ${s.then.trim()}${s.because ? ` because ${s.because.trim()}` : ""}.` : "";
  const f = (k: keyof SF, label: string) => <label className="block"><span className="block font-bold">{label}</span><input value={s[k]} onChange={(e) => setS({ ...s, [k]: e.target.value })} maxLength={160} className={`${inputClass} mt-1`} /></label>;
  return (
    <Head title={c.sfTitle} lead={c.sfLead}>
      <div className="mt-5"><Chips<Area> value={area2} onChange={setArea} label={c.sfArea} options={(Object.keys(c.areas) as Area[]).map((k) => ({ id: k, label: c.areas[k] }))} /></div>
      <h2 className="mt-5 text-xl">{c.sfIdeas}</h2>
      <ul className="mt-2 space-y-2">{c.ideas[area2].map((q) => <li key={q} className="guide-card flex flex-wrap items-center gap-3 p-3"><span className="min-w-0 flex-1 text-lg">{q}</span><button onClick={() => setS({ ...s, q })} className={buttonClass.secondary} aria-label={`${c.sfPick}: ${q}`}>{c.sfPick}</button></li>)}</ul>
      <section className="guide-card mt-6 grid gap-4 p-5">{f("q", c.sfQ)}<div className="grid gap-4 md:grid-cols-3">{f("change", c.sfIf)}{f("then", c.sfThen)}{f("because", c.sfBecause)}</div>
        {hyp ? <p className="text-lg"><span className="font-bold">{c.sfHyp}:</span> {hyp}</p> : null}</section>
      <label className="mt-5 block max-w-xs"><span className="block font-bold">{c.sfFair}</span><input type="date" min={addDays(now, 1)} value={s.fair} onChange={(e) => setS({ ...s, fair: e.target.value })} className={`${inputClass} mt-1`} /></label>
      {s.fair && !valid ? <p role="alert" className="mt-2 font-bold text-ruby">{c.sfNeed}</p> : null}
      {valid ? <section className="mt-5"><h2 className="text-2xl">{c.sfPlan}</h2><ol className="mt-2 divide-y-2 divide-dotted divide-line">{c.steps.map((st, i) => <li key={st} className="flex flex-wrap justify-between gap-2 py-2 text-lg"><span>{i + 1}. {st}</span><span className="font-bold">{formatDay(addDays(now, Math.floor(span * cuts[i])), lang)}</span></li>)}</ol>{span < 21 ? <Callout tone="warn">{c.sfTight}</Callout> : null}</section> : null}
      <p className="mt-4 max-w-prose text-sm text-muted">{c.sfNote}</p>
    </Head>
  );
}
