"use client";
import { useEffect, useRef, useState } from "react";
import type { AssistTask } from "@/lib/ai/assist";
import { useLang } from "@/lib/i18n";
import { useProfile } from "@/lib/profile";
import { useCopy } from "@/lib/use-copy";
import { errorText, useAiLimitText } from "@/lib/ai-limit";
import { buttonClass, inputClass } from "../ui";
import { Callout, Head, type L } from "./shared";

interface Extra { key: string; label: L; ph?: L; kind?: "text" | "select" | "date"; options?: { v: string; label: L }[]; def?: string }
interface Cfg { title: L; lead: L; input: L; ph: L; button: L; extras?: Extra[]; caution?: L; rows?: number }
const l = (en: string, es: string): L => ({ en, es });

const CFG: Record<AssistTask, Cfg> = {
  summarizer: { title: l("Note summarizer", "Resumen de apuntes"), lead: l("Paste your notes and get a short summary and key terms.", "Pega tus apuntes y recibe un resumen corto y términos clave."), input: l("Your notes", "Tus apuntes"), ph: l("Paste notes here", "Pega tus apuntes aquí"), button: l("Summarize", "Resumir"), rows: 10 },
  notestoquiz: { title: l("Notes to quiz", "De apuntes a examen"), lead: l("Practice questions made from your notes. Answers are at the bottom so you can try first.", "Preguntas de práctica hechas con tus apuntes. Las respuestas están al final para que lo intentes primero."), input: l("Your notes", "Tus apuntes"), ph: l("Paste notes here", "Pega tus apuntes aquí"), button: l("Make my quiz", "Crear mi examen"), rows: 10, extras: [{ key: "count", label: l("Number of questions", "Número de preguntas"), kind: "select", def: "5", options: ["3", "5", "8", "10"].map((v) => ({ v, label: l(v, v) })) }] },
  mnemonic: { title: l("Mnemonic generator", "Reglas mnemotécnicas"), lead: l("Give a list or an idea and get acronyms, phrases and picture stories to remember it.", "Escribe una lista o una idea y recibe siglas, frases e historias con imágenes para recordarla."), input: l("What do you need to remember?", "¿Qué necesitas recordar?"), ph: l("The planets in order: Mercury, Venus, Earth, Mars…", "Los planetas en orden: Mercurio, Venus, Tierra, Marte…"), button: l("Make memory aids", "Crear ayudas de memoria"), rows: 5 },
  feynman: { title: l("Feynman explainer", "Explícalo con tus palabras"), lead: l("Explain a topic in your own words. A curious 12-year-old points out what is unclear.", "Explica un tema con tus palabras. Un niño curioso de 12 años te señala lo que no se entiende."), input: l("Your explanation", "Tu explicación"), ph: l("Explain it as simply as you can", "Explícalo lo más sencillo que puedas"), button: l("Find the gaps", "Encontrar los huecos"), rows: 8, extras: [{ key: "topic", label: l("Topic", "Tema"), ph: l("Photosynthesis", "Fotosíntesis") }], caution: l("This points out gaps. It does not replace your notes or teacher, and it can be wrong.", "Esto señala huecos. No reemplaza tus apuntes ni a tu maestro, y puede equivocarse.") },
  stepchecker: { title: l("Math step checker", "Revisor de pasos"), lead: l("Enter the problem and your work. You find out which step went wrong, without getting the final answer.", "Escribe el problema y tu procedimiento. Descubres qué paso falló, sin recibir la respuesta final."), input: l("Problem and your work", "Problema y tu procedimiento"), ph: l("Problem: 2x + 6 = 14\nMy work:\n2x = 14 + 6\n2x = 20\nx = 10", "Problema: 2x + 6 = 14\nMi procedimiento:\n2x = 14 + 6\n2x = 20\nx = 10"), button: l("Check my steps", "Revisar mis pasos"), rows: 8, caution: l("The AI can make math mistakes. Double-check with your teacher or textbook.", "La IA puede cometer errores de matemáticas. Confirma con tu maestro o libro.") },
  grammar: { title: l("Grammar coach", "Entrenador de gramática"), lead: l("Explains why something is wrong instead of silently fixing it, so you learn the rule.", "Explica por qué algo está mal en vez de arreglarlo en silencio, para que aprendas la regla."), input: l("Your writing", "Tu escrito"), ph: l("Paste a paragraph", "Pega un párrafo"), button: l("Check my writing", "Revisar mi escrito"), rows: 8 },
  essayfeedback: { title: l("Essay feedback", "Comentarios sobre tu ensayo"), lead: l("Specific feedback on your thesis, organization and evidence. It does not rewrite your essay.", "Comentarios concretos sobre tu tesis, organización y evidencia. No reescribe tu ensayo."), input: l("Your essay", "Tu ensayo"), ph: l("Paste your essay", "Pega tu ensayo"), button: l("Get feedback", "Recibir comentarios"), rows: 12, extras: [{ key: "prompt", label: l("The prompt or assignment (optional)", "La pregunta o tarea (opcional)") }], caution: l("Your essay must stay your own work. Follow your school's rules about using AI.", "Tu ensayo debe seguir siendo tuyo. Sigue las reglas de tu escuela sobre usar IA.") },
  emailhelper: { title: l("Email help", "Ayuda con correos"), lead: l("Say what you need and get a polite draft you can edit. Brackets show what you still need to fill in.", "Di qué necesitas y recibe un borrador cortés que puedes editar. Los corchetes muestran lo que falta."), input: l("Key points", "Puntos clave"), ph: l("I missed Friday because I was sick and want to make up the quiz", "Falté el viernes por enfermedad y quiero reponer el quiz"), button: l("Draft my email", "Escribir mi correo"), rows: 5, extras: [{ key: "to", label: l("Who is it to?", "¿Para quién es?"), ph: l("My science teacher", "Mi maestro de ciencias") }, { key: "purpose", label: l("What is it for?", "¿Para qué es?"), ph: l("Ask to make up a quiz", "Pedir reponer un quiz") }] },
  reclett: { title: l("Recommendation letter helper", "Ayuda para cartas de recomendación"), lead: l("Draft a polite request to a teacher and a list of what to give them. It does not write the letter.", "Redacta una solicitud cortés para un maestro y una lista de lo que debes darle. No escribe la carta."), input: l("Your achievements and activities", "Tus logros y actividades"), ph: l("Honor roll, robotics club captain, 40 volunteer hours", "Cuadro de honor, capitán del club de robótica, 40 horas de voluntariado"), button: l("Draft my request", "Escribir mi solicitud"), rows: 5, extras: [{ key: "who", label: l("Who will you ask?", "¿A quién se lo pedirás?"), ph: l("Mr. Garza, my math teacher", "Sr. Garza, mi maestro de mate") }, { key: "for", label: l("What is the letter for?", "¿Para qué es la carta?"), ph: l("A scholarship", "Una beca") }, { key: "deadline", label: l("Deadline", "Fecha límite"), kind: "date" }] },
  taskbreaker: { title: l("Task breaker", "Dividir una tarea"), lead: l("A big project becomes small, doable steps with time estimates. It plans the work. It does not do it.", "Un proyecto grande se vuelve pasos pequeños con tiempos estimados. Planea el trabajo. No lo hace."), input: l("The big task", "La tarea grande"), ph: l("Research report on the Rio Grande, 3 pages", "Reporte sobre el Río Bravo, 3 páginas"), button: l("Break it down", "Dividirla"), rows: 4, extras: [{ key: "due", label: l("Due date (optional)", "Fecha de entrega (opcional)"), kind: "date" }] },
  bilingual: { title: l("Bilingual homework help", "Tarea en dos idiomas"), lead: l("Learn the idea in one language and the key words in the other. You get hints, not the final answer.", "Aprende la idea en un idioma y las palabras clave en el otro. Recibes pistas, no la respuesta final."), input: l("Your question", "Tu pregunta"), ph: l("What is the difference between area and perimeter?", "¿Cuál es la diferencia entre área y perímetro?"), button: l("Help me learn it", "Ayúdame a aprenderlo"), rows: 5, extras: [{ key: "explainIn", label: l("Explain it in", "Explícalo en"), kind: "select", def: "Spanish", options: [{ v: "Spanish", label: l("Spanish", "Español") }, { v: "English", label: l("English", "Inglés") }] }, { key: "answerIn", label: l("Key words also in", "Palabras clave también en"), kind: "select", def: "English", options: [{ v: "English", label: l("English", "Inglés") }, { v: "Spanish", label: l("Spanish", "Español") }] }] },
  frq: { title: l("Free response feedback", "Comentarios en respuestas escritas"), lead: l("Practice feedback on an AP written answer. It is not an official score.", "Comentarios de práctica sobre una respuesta escrita de AP. No es una calificación oficial."), input: l("Your answer", "Tu respuesta"), ph: l("Paste your written answer", "Pega tu respuesta escrita"), button: l("Get feedback", "Recibir comentarios"), rows: 12, extras: [{ key: "course", label: l("AP course", "Curso AP"), ph: l("AP Biology", "AP Biología") }, { key: "question", label: l("The question", "La pregunta") }], caution: l("This is practice feedback from an AI, not an official AP score. Use your teacher's rubric and the College Board's released questions to check.", "Esto es retroalimentación de práctica hecha por una IA, no una calificación oficial de AP. Usa la rúbrica de tu maestro y las preguntas publicadas por el College Board para comprobar.") },
};

const copy = {
  en: { working: "Working on it…", result: "Result", copy: "Copy to clipboard", copied: "Copied.", again: "Clear", note: "An AI wrote this and it can make mistakes. Check anything important with a teacher or your notes.", errors: { rate_limited: "You have used a lot of requests this hour. Rest a bit and try again in a minute.", busy: "The AI is busy. Try again in a minute.", slow: "That took too long. Try again.", unavailable: "This helper is not switched on in this version yet.", failed: "Something went wrong on our side. Try again in a minute.", offline: "You are offline. This one needs the internet, but your other tools still work.", bad_request: "Write something first." } as Record<string, string>, crisis: "A note from us:", long: (n: number) => `${n} characters left` },
  es: { working: "Trabajando en ello…", result: "Resultado", copy: "Copiar", copied: "Copiado.", again: "Borrar", note: "Esto lo escribió una IA y puede tener errores. Confirma lo importante con un maestro o con tus apuntes.", errors: { rate_limited: "Has usado muchas solicitudes esta hora. Descansa un ratito e intenta de nuevo en un minuto.", busy: "La IA está ocupada. Intenta de nuevo en un minuto.", slow: "Tardó demasiado. Intenta de nuevo.", unavailable: "Esta ayuda todavía no está activada en esta versión.", failed: "Algo falló de nuestra parte. Intenta de nuevo en un minuto.", offline: "No tienes internet. Esta herramienta la necesita, pero las demás sí funcionan.", bad_request: "Escribe algo primero." } as Record<string, string>, crisis: "Un mensaje de nuestra parte:", long: (n: number) => `Quedan ${n} caracteres` },
};

const MAX = 6000;
export function AssistTool({ task }: { task: AssistTask }) {
  const c = useCopy(copy);
  const limit = useAiLimitText();
  const lang = useLang();
  const [profile] = useProfile();
  const cfg = CFG[task];
  const [input, setInput] = useState("");
  const [extra, setExtra] = useState<Record<string, string>>(() => Object.fromEntries((cfg.extras ?? []).filter((e) => e.def).map((e) => [e.key, e.def!])));
  const [busy, setBusy] = useState(false);
  const [text, setText] = useState("");
  const [crisis, setCrisis] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const abort = useRef<AbortController | null>(null);
  useEffect(() => () => abort.current?.abort(), []);
  const run = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy) return;
    if (!input.trim()) return setError("bad_request");
    if (!navigator.onLine) return setError("offline");
    setError(null); setText(""); setCrisis(false); setBusy(true);
    const ctl = new AbortController(); abort.current = ctl;
    try {
      const res = await fetch("/api/assist", { method: "POST", headers: { "Content-Type": "application/json" }, signal: ctl.signal, body: JSON.stringify({ task, lang, grade: profile.grade, input: input.slice(0, MAX), extra }) });
      const j = await res.json().catch(() => null);
      if (!res.ok || !j?.ok) setError(j?.error ?? "failed");
      else { setText(j.text); setCrisis(!!j.crisis); }
    } catch (err) {
      if ((err as Error).name !== "AbortError") setError(navigator.onLine ? "failed" : "offline");
    } finally { setBusy(false); }
  };
  return (
    <Head title={cfg.title[lang]} lead={cfg.lead[lang]}>
      <form onSubmit={run} className="mt-5 grid gap-4" noValidate>
        {(cfg.extras ?? []).map((x) => (
          <label key={x.key} className="block max-w-xl"><span className="block font-bold">{x.label[lang]}</span>
            {x.kind === "select" ? <select value={extra[x.key] ?? ""} onChange={(e) => setExtra({ ...extra, [x.key]: e.target.value })} className={`${inputClass} mt-1`}>{x.options!.map((o) => <option key={o.v} value={o.v}>{o.label[lang]}</option>)}</select>
              : <input type={x.kind === "date" ? "date" : "text"} value={extra[x.key] ?? ""} onChange={(e) => setExtra({ ...extra, [x.key]: e.target.value })} placeholder={x.ph?.[lang]} maxLength={300} className={`${inputClass} mt-1`} />}</label>))}
        <label className="block"><span className="block font-bold">{cfg.input[lang]}</span>
          <textarea value={input} onChange={(e) => setInput(e.target.value.slice(0, MAX))} placeholder={cfg.ph[lang]} rows={cfg.rows ?? 8} className="mt-1 w-full rounded-md border-[1.5px] border-ink bg-surface p-3 text-lg placeholder:text-muted" />
          <span className="text-sm text-muted">{c.long(MAX - input.length)}</span></label>
        {error ? <p role="alert" className="font-bold text-ruby">{errorText(c.errors, error, limit)}</p> : null}
        <div className="flex flex-wrap gap-3"><button disabled={busy} className={buttonClass.primary}>{busy ? c.working : cfg.button[lang]}</button>{input || text ? <button type="button" onClick={() => { setInput(""); setText(""); setError(null); }} className={buttonClass.secondary}>{c.again}</button> : null}</div>
      </form>
      <div aria-live="polite">{text ? <section className="guide-card mt-6 p-5"><h2 className="text-xl">{crisis ? c.crisis : c.result}</h2><div className="mt-2 whitespace-pre-wrap text-lg leading-relaxed">{text}</div>
        {!crisis ? <div className="mt-4 flex flex-wrap items-center gap-3"><button onClick={async () => { try { await navigator.clipboard.writeText(text); setNote(c.copied); } catch { setNote(""); } }} className={buttonClass.secondary}>{c.copy}</button><span className="font-bold text-teal" role="status">{note}</span></div> : null}</section> : null}</div>
      {cfg.caution ? <Callout>{cfg.caution[lang]}</Callout> : null}
      <p className="mt-4 max-w-prose text-sm text-muted">{c.note}</p>
    </Head>
  );
}
