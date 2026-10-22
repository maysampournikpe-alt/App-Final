"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { today } from "@/lib/dates";
import { useLang } from "@/lib/i18n";
import { useLocalDoc } from "@/lib/local-doc";
import { useProfile } from "@/lib/profile";
import { FLASHCARDS_KEY, newCard, NO_CARDS, type Card } from "@/lib/srs";
import { charCount, copiedShare, fkGrade, sentences, typingResult, words, wpm } from "@/lib/text";
import { useCopy } from "@/lib/use-copy";
import { buttonClass, inputClass } from "../ui";
import { Callout, Chips, Empty, Ext, Head } from "./shared";

const copy = {
  en: {
    add: "Add", remove: "Remove", copy: "Copy to clipboard", copied: "Copied.", print: "Print", start: "Start", again: "Try again",
    olTitle: "Essay outline template", olLead: "Plan before you write. Fill in each part, then copy or print your outline.", intro: "Introduction", hook: "Hook (a surprising fact, question or short story)", bg: "Background (what the reader needs to know)", thesis: "Thesis (your main claim)", body: "Body paragraph", topic: "Topic sentence", evidence: "Evidence (a fact, quote or example)", explain: "Explanation (why the evidence proves your point)", concl: "Conclusion", restate: "Restate the thesis in new words", wrap: "Closing thought (why it matters)", addPara: "Add a body paragraph", olOut: "Your outline",
    thTitle: "Thesis statement builder", thLead: "A strong thesis makes a claim that someone could disagree with, and gives your reasons. Pick a pattern and fill in the blanks.", pat: "Pattern", p1: "Claim and two reasons", p2: "Although… (counterpoint)", p3: "Because… (reason first)", claim: "Your claim", r1: "Reason 1", r2: "Reason 2", counter: "The other side says…", reason: "Your main reason", thOut: "Your thesis", thCheck: "Check it", checks: ["It says something someone could disagree with", "It is one clear sentence", "It gives my reasons", "It answers the prompt"],
    ctTitle: "Word and character counter", ctLead: "Paste or type your writing. Your text stays on your device.", ctWords: "Words", ctChars: "Characters", ctNoSp: "Characters without spaces", ctSent: "Sentences", ctRead: "Reading time", ctMin: (n: number) => `${n} min`, ctLimit: "Word limit (optional)", ctPlace: "Type or paste here", ctUnder: (n: number) => `${n} words left`, ctNear: (n: number) => `Close to the limit. ${n} words left.`, ctOver: (n: number) => `${n} words over the limit.`, ctNote: "Common limits: 250 (short answer), 500, and 650 (Common App essay). Check each application's own rule.",
    rlTitle: "Reading level checker", rlLead: "Paste a few sentences of English writing. You get a reading grade level estimate, which is a rough guide, not a score.", rlNeed: "Paste at least 30 words.", rlGrade: (g: number) => `Reads at about grade ${g}`, rlYours: (g: number, d: number) => (d > 2 ? `That is ${Math.round(d)} grades above your grade (${g}). That can be right for an essay, but check it is clear.` : d < -3 ? `That is below your grade (${g}). Longer, more varied sentences may help.` : `That is close to your grade (${g}).`), rlStats: (w: number, s: number) => `${w} words in ${s} sentences`, rlNote: "It only measures sentence length and word length, so very short sentences can score low even when ideas are deep. It works for English text.",
    ppTitle: "Paraphrase practice", ppLead: "A good paraphrase uses your own words and sentence shape. Paste the original and your rewrite to see how close they are.", orig: "Original", mine: "Your rewrite", ppGood: "Good. Your rewrite is in your own words.", ppClose: "Some phrases are close to the original. Change the wording of the matching parts.", ppToo: "Too close. Too much is copied word for word. Put the original away and rewrite from memory.", ppShare: (n: number) => `${n}% of your words sit in phrases copied from the original`, ppNote: "This only finds copied phrases of 4+ words. Even a good paraphrase needs a citation for the idea.",
    lgTitle: "Reading log", lgLead: "Write down what you read. Pages and minutes add up faster than you think.", book: "Book or text", pages: "Pages", mins: "Minutes", day: "Day", lgWeek: "Last 7 days", lgPages: (n: number) => `${n} pages`, lgMin: (n: number) => `${n} minutes`, lgBooks: "By book", lgEmpty: "Log the first thing you read today.", lgNeed: "Write the title and pages or minutes.",
    rsTitle: "Reading speed test", rsLead: "Read the passage at your normal pace, then answer three questions. Speed means little if you do not understand, so both count.", rsPick: "Passage", rsRead: "Read the passage, then press Finished.", rsDone: "Finished reading", rsQs: "Answer without looking back.", rsSubmit: "See my result", rsResult: (w: number, ok: number) => `${w} words per minute, ${ok} of 3 correct`, rsGood: "You understood it. That speed counts.", rsLow: "Understanding was low, so this speed does not count. Slow down a little and try again.", rsBest: (n: number) => `Your best counted speed: ${n} words per minute`, rsAvg: "Many students in middle and high school read roughly 150 to 250 words per minute on easy text. Yours can be different.",
    tpTitle: "Typing speed test", tpLead: "Type the text exactly as shown. The timer starts when you type the first letter and stops after one minute or when you finish.", tpNew: "New text", tpRes: (w: number, a: number) => `${w} words per minute, ${a}% accurate`, tpBest: (n: number) => `Best: ${n} words per minute`, tpLeft: (n: number) => `${n} seconds left`, tpPh: "Start typing here", tpLang: "Language",
    vbTitle: "Vocabulary builder", vbLead: "Save new words from your own reading. They become flashcards that come back on a spaced schedule.", word: "Word", meaning: "Meaning", example: "Example sentence (optional)", vbAdd: "Save as flashcard", vbSaved: (n: number) => `${n} vocabulary cards saved.`, vbReview: "Review my cards", vbNeed: "Write the word and its meaning.", vbDup: "That word is already saved.",
    vcTitle: "Vocabulary in context", vcLead: "Paste a paragraph, then tap any word you do not know. A trusted dictionary opens in a new tab with the definition, and you can look up the Spanish too.", vcPh: "Paste a paragraph here", vcTap: "Tap a word", vcSel: "Selected word", vcDef: "English definition", vcEs: "Spanish translation", vcSave: "Save as a flashcard", vcMeaning: "Meaning in your own words", vcSaved: "Saved to your vocabulary cards.", vcNeed: "Write the meaning first.",
  },
  es: {
    add: "Agregar", remove: "Quitar", copy: "Copiar", copied: "Copiado.", print: "Imprimir", start: "Empezar", again: "Intentar otra vez",
    olTitle: "Esquema de ensayo", olLead: "Planea antes de escribir. Llena cada parte y luego copia o imprime tu esquema.", intro: "Introducción", hook: "Gancho (un dato sorprendente, una pregunta o una historia corta)", bg: "Contexto (lo que el lector necesita saber)", thesis: "Tesis (tu idea principal)", body: "Párrafo de desarrollo", topic: "Oración temática", evidence: "Evidencia (un dato, cita o ejemplo)", explain: "Explicación (por qué la evidencia prueba tu punto)", concl: "Conclusión", restate: "Repite la tesis con otras palabras", wrap: "Idea final (por qué importa)", addPara: "Agregar un párrafo de desarrollo", olOut: "Tu esquema",
    thTitle: "Armador de tesis", thLead: "Una tesis fuerte afirma algo con lo que alguien podría no estar de acuerdo y da tus razones. Elige un patrón y llena los espacios.", pat: "Patrón", p1: "Afirmación y dos razones", p2: "Aunque… (contrapunto)", p3: "Porque… (razón primero)", claim: "Tu afirmación", r1: "Razón 1", r2: "Razón 2", counter: "El otro lado dice…", reason: "Tu razón principal", thOut: "Tu tesis", thCheck: "Revísala", checks: ["Dice algo con lo que alguien podría no estar de acuerdo", "Es una sola oración clara", "Da mis razones", "Responde a la pregunta"],
    ctTitle: "Contador de palabras", ctLead: "Pega o escribe tu texto. Se queda en tu dispositivo.", ctWords: "Palabras", ctChars: "Caracteres", ctNoSp: "Caracteres sin espacios", ctSent: "Oraciones", ctRead: "Tiempo de lectura", ctMin: (n: number) => `${n} min`, ctLimit: "Límite de palabras (opcional)", ctPlace: "Escribe o pega aquí", ctUnder: (n: number) => `Te quedan ${n} palabras`, ctNear: (n: number) => `Cerca del límite. Te quedan ${n} palabras.`, ctOver: (n: number) => `${n} palabras de más.`, ctNote: "Límites comunes: 250 (respuesta corta), 500 y 650 (ensayo de Common App). Revisa la regla de cada solicitud.",
    rlTitle: "Nivel de lectura", rlLead: "Pega unas oraciones de texto en inglés. Recibes un nivel de lectura estimado, que es una guía aproximada, no una calificación.", rlNeed: "Pega al menos 30 palabras.", rlGrade: (g: number) => `Se lee como de grado ${g}`, rlYours: (g: number, d: number) => (d > 2 ? `Eso es ${Math.round(d)} grados arriba de tu grado (${g}). Puede estar bien para un ensayo, pero revisa que sea claro.` : d < -3 ? `Eso está debajo de tu grado (${g}). Oraciones más largas y variadas pueden ayudar.` : `Eso está cerca de tu grado (${g}).`), rlStats: (w: number, s: number) => `${w} palabras en ${s} oraciones`, rlNote: "Solo mide el largo de las oraciones y las palabras, así que oraciones muy cortas pueden salir bajas aunque las ideas sean profundas. Funciona con texto en inglés.",
    ppTitle: "Práctica de parafraseo", ppLead: "Un buen parafraseo usa tus palabras y tu propia forma de oración. Pega el original y tu versión para ver qué tan cerca están.", orig: "Original", mine: "Tu versión", ppGood: "Bien. Tu versión está en tus propias palabras.", ppClose: "Algunas frases están cerca del original. Cambia las palabras de las partes que coinciden.", ppToo: "Demasiado cerca. Hay mucho copiado palabra por palabra. Guarda el original y reescribe de memoria.", ppShare: (n: number) => `${n}% de tus palabras están en frases copiadas del original`, ppNote: "Solo encuentra frases copiadas de 4 o más palabras. Aun un buen parafraseo necesita citar la idea.",
    lgTitle: "Registro de lectura", lgLead: "Anota lo que lees. Las páginas y los minutos se suman más rápido de lo que piensas.", book: "Libro o texto", pages: "Páginas", mins: "Minutos", day: "Día", lgWeek: "Últimos 7 días", lgPages: (n: number) => `${n} páginas`, lgMin: (n: number) => `${n} minutos`, lgBooks: "Por libro", lgEmpty: "Anota lo primero que leíste hoy.", lgNeed: "Escribe el título y las páginas o los minutos.",
    rsTitle: "Velocidad de lectura", rsLead: "Lee el texto a tu ritmo normal y luego contesta tres preguntas. La velocidad vale poco si no entiendes, así que cuentan las dos.", rsPick: "Texto", rsRead: "Lee el texto y luego presiona Terminé.", rsDone: "Terminé de leer", rsQs: "Contesta sin volver a mirar.", rsSubmit: "Ver mi resultado", rsResult: (w: number, ok: number) => `${w} palabras por minuto, ${ok} de 3 correctas`, rsGood: "Entendiste el texto. Esa velocidad cuenta.", rsLow: "Entendiste poco, así que esta velocidad no cuenta. Ve un poco más despacio y vuelve a intentar.", rsBest: (n: number) => `Tu mejor velocidad válida: ${n} palabras por minuto`, rsAvg: "Muchos estudiantes de secundaria y preparatoria leen más o menos de 150 a 250 palabras por minuto en textos fáciles. La tuya puede ser distinta.",
    tpTitle: "Prueba de mecanografía", tpLead: "Escribe el texto tal como se ve. El tiempo empieza con la primera letra y termina después de un minuto o cuando acabes.", tpNew: "Texto nuevo", tpRes: (w: number, a: number) => `${w} palabras por minuto, ${a}% de precisión`, tpBest: (n: number) => `Mejor: ${n} palabras por minuto`, tpLeft: (n: number) => `Quedan ${n} segundos`, tpPh: "Empieza a escribir aquí", tpLang: "Idioma",
    vbTitle: "Más vocabulario", vbLead: "Guarda palabras nuevas de tus propias lecturas. Se vuelven tarjetas que regresan en un calendario espaciado.", word: "Palabra", meaning: "Significado", example: "Oración de ejemplo (opcional)", vbAdd: "Guardar como tarjeta", vbSaved: (n: number) => `${n} tarjetas de vocabulario guardadas.`, vbReview: "Repasar mis tarjetas", vbNeed: "Escribe la palabra y su significado.", vbDup: "Esa palabra ya está guardada.",
    vcTitle: "Vocabulario en contexto", vcLead: "Pega un párrafo y toca cualquier palabra que no conozcas. Se abre un diccionario confiable en una pestaña nueva con la definición, y también puedes buscar la traducción al español.", vcPh: "Pega un párrafo aquí", vcTap: "Toca una palabra", vcSel: "Palabra elegida", vcDef: "Definición en inglés", vcEs: "Traducción al español", vcSave: "Guardar como tarjeta", vcMeaning: "Significado en tus palabras", vcSaved: "Guardada en tus tarjetas de vocabulario.", vcNeed: "Escribe primero el significado.",
  },
};

const nowMs = () => Date.now();
const clip = async (text: string) => { try { await navigator.clipboard.writeText(text); return true; } catch { return false; } };
const rm = (label: string, text: string, fn: () => void) => <button onClick={fn} aria-label={`${text}: ${label}`} className="grid h-10 w-10 shrink-0 place-items-center rounded-md hover:bg-sunken"><Trash2 size={18} strokeWidth={1.75} /></button>;
const area = "min-h-32 w-full rounded-md border-[1.5px] border-ink bg-surface p-3 text-lg placeholder:text-muted";

type Outline = { hook: string; bg: string; thesis: string; paras: { topic: string; evidence: string; explain: string }[]; restate: string; wrap: string };
const NO_OUTLINE: Outline = { hook: "", bg: "", thesis: "", paras: [{ topic: "", evidence: "", explain: "" }, { topic: "", evidence: "", explain: "" }, { topic: "", evidence: "", explain: "" }], restate: "", wrap: "" };
export function EssayOutlineTool() {
  const c = useCopy(copy);
  const [o, setO] = useLocalDoc<Outline>("essay-outline", NO_OUTLINE);
  const [note, setNote] = useState("");
  const text = [`${c.intro}`, `  ${c.hook}: ${o.hook}`, `  ${c.bg}: ${o.bg}`, `  ${c.thesis}: ${o.thesis}`, ...o.paras.flatMap((p, i) => [`${c.body} ${i + 1}`, `  ${c.topic}: ${p.topic}`, `  ${c.evidence}: ${p.evidence}`, `  ${c.explain}: ${p.explain}`]), c.concl, `  ${c.restate}: ${o.restate}`, `  ${c.wrap}: ${o.wrap}`].join("\n");
  const f = (label: string, v: string, set: (s: string) => void) => <label className="mt-3 block"><span className="block font-bold">{label}</span><textarea value={v} onChange={(e) => set(e.target.value)} rows={2} maxLength={500} className={`${area} mt-1 !min-h-20`} /></label>;
  return (
    <Head title={c.olTitle} lead={c.olLead}>
      <section className="guide-card mt-5 p-5"><h2 className="text-2xl">{c.intro}</h2>{f(c.hook, o.hook, (s) => setO({ ...o, hook: s }))}{f(c.bg, o.bg, (s) => setO({ ...o, bg: s }))}{f(c.thesis, o.thesis, (s) => setO({ ...o, thesis: s }))}</section>
      {o.paras.map((p, i) => <section key={i} className="guide-card mt-4 p-5"><div className="flex items-center justify-between"><h2 className="text-2xl">{c.body} {i + 1}</h2>{o.paras.length > 1 ? rm(`${c.body} ${i + 1}`, c.remove, () => setO({ ...o, paras: o.paras.filter((_, j) => j !== i) })) : null}</div>
        {f(c.topic, p.topic, (s) => setO({ ...o, paras: o.paras.map((x, j) => (j === i ? { ...x, topic: s } : x)) }))}{f(c.evidence, p.evidence, (s) => setO({ ...o, paras: o.paras.map((x, j) => (j === i ? { ...x, evidence: s } : x)) }))}{f(c.explain, p.explain, (s) => setO({ ...o, paras: o.paras.map((x, j) => (j === i ? { ...x, explain: s } : x)) }))}</section>)}
      {o.paras.length < 6 ? <button onClick={() => setO({ ...o, paras: [...o.paras, { topic: "", evidence: "", explain: "" }] })} className={`${buttonClass.secondary} mt-4`}><Plus size={18} />{c.addPara}</button> : null}
      <section className="guide-card mt-4 p-5"><h2 className="text-2xl">{c.concl}</h2>{f(c.restate, o.restate, (s) => setO({ ...o, restate: s }))}{f(c.wrap, o.wrap, (s) => setO({ ...o, wrap: s }))}</section>
      <div className="mt-5 flex flex-wrap items-center gap-3"><button onClick={async () => setNote((await clip(text)) ? c.copied : "")} className={buttonClass.primary}>{c.copy}</button><button onClick={() => window.print()} className={buttonClass.secondary}>{c.print}</button><span className="font-bold text-teal" role="status">{note}</span></div>
    </Head>
  );
}

export function ThesisTool() {
  const c = useCopy(copy);
  const [pat, setPat] = useState<"p1" | "p2" | "p3">("p1");
  const [f, setF] = useState({ claim: "", r1: "", r2: "", counter: "", reason: "" });
  const [ok, setOk] = useState<boolean[]>([false, false, false, false]);
  const [note, setNote] = useState("");
  const lc = (s: string) => s.trim().replace(/[.]+$/, "");
  const out = pat === "p1" ? [f.claim && lc(f.claim), f.r1 && f.r2 ? ` because ${lc(f.r1)} and ${lc(f.r2)}` : ""].join("") : pat === "p2" ? [f.counter ? `Although ${lc(f.counter)}, ` : "", f.claim && lc(f.claim), f.reason ? ` because ${lc(f.reason)}` : ""].join("") : [f.reason ? `Because ${lc(f.reason)}, ` : "", f.claim && lc(f.claim)].join("");
  const sentence = out ? out.charAt(0).toUpperCase() + out.slice(1) + "." : "";
  const inp = (key: keyof typeof f, label: string) => <label><span className="block font-bold">{label}</span><input value={f[key]} onChange={(e) => setF({ ...f, [key]: e.target.value })} maxLength={160} className={`${inputClass} mt-1`} /></label>;
  return (
    <Head title={c.thTitle} lead={c.thLead}>
      <div className="mt-5"><Chips<"p1" | "p2" | "p3"> value={pat} onChange={setPat} label={c.pat} options={[{ id: "p1", label: c.p1 }, { id: "p2", label: c.p2 }, { id: "p3", label: c.p3 }]} /></div>
      <div className="guide-card mt-5 grid gap-4 p-5">{pat !== "p3" && pat === "p2" ? inp("counter", c.counter) : null}{inp("claim", c.claim)}{pat === "p1" ? <>{inp("r1", c.r1)}{inp("r2", c.r2)}</> : inp("reason", c.reason)}</div>
      <section className="guide-card mt-5 p-5"><h2 className="text-xl">{c.thOut}</h2><p className="mt-2 font-display text-2xl" aria-live="polite">{sentence || "…"}</p>
        <div className="mt-3 flex items-center gap-3"><button disabled={!sentence} onClick={async () => setNote((await clip(sentence)) ? c.copied : "")} className={buttonClass.secondary}>{c.copy}</button><span className="font-bold text-teal" role="status">{note}</span></div></section>
      <fieldset className="mt-5"><legend className="text-xl font-bold">{c.thCheck}</legend>{c.checks.map((x, i) => <label key={x} className="flex items-center gap-3 py-1.5"><input type="checkbox" checked={ok[i]} onChange={() => setOk(ok.map((v, j) => (j === i ? !v : v)))} className="h-5 w-5 accent-[var(--c-teal)]" />{x}</label>)}</fieldset>
    </Head>
  );
}

export function CounterTool() {
  const c = useCopy(copy);
  const [text, setText] = useLocalDoc<string>("counter-text", "");
  const [limit, setLimit] = useState("");
  const w = words(text).length, ch = charCount(text), lim = Number(limit) || 0;
  const mins = Math.max(1, Math.round(w / 200));
  const status = lim ? (w > lim ? { t: c.ctOver(w - lim), cls: "text-ruby" } : w >= lim * 0.9 ? { t: c.ctNear(lim - w), cls: "text-ink" } : { t: c.ctUnder(lim - w), cls: "text-teal" }) : null;
  return (
    <Head title={c.ctTitle} lead={c.ctLead}>
      <label className="mt-5 block"><span className="sr-only">{c.ctPlace}</span><textarea value={text} onChange={(e) => setText(e.target.value.slice(0, 50000))} placeholder={c.ctPlace} className={`${area} min-h-56`} /></label>
      <label className="mt-3 flex max-w-xs flex-col font-bold">{c.ctLimit}<input type="number" min={1} max={100000} value={limit} onChange={(e) => setLimit(e.target.value)} className={`${inputClass} mt-1 font-normal`} /></label>
      {status ? <p className={`mt-3 text-xl font-bold ${status.cls}`} role="status">{status.t}</p> : null}
      <dl className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-5">{[[c.ctWords, w], [c.ctChars, ch.withSpaces], [c.ctNoSp, ch.noSpaces], [c.ctSent, w ? sentences(text) : 0], [c.ctRead, w ? c.ctMin(mins) : "—"]].map(([k, v]) => <div key={String(k)} className="guide-card p-3"><dt className="text-sm text-muted">{k}</dt><dd className="font-display text-3xl font-semibold tabular-nums">{v}</dd></div>)}</dl>
      <p className="mt-4 max-w-prose text-sm text-muted">{c.ctNote}</p>
    </Head>
  );
}

export function ReadLevelTool() {
  const c = useCopy(copy);
  const [profile] = useProfile();
  const [text, setText] = useState("");
  const r = fkGrade(text);
  return (
    <Head title={c.rlTitle} lead={c.rlLead}>
      <label className="mt-5 block"><span className="sr-only">{c.rlTitle}</span><textarea value={text} onChange={(e) => setText(e.target.value.slice(0, 20000))} className={`${area} min-h-48`} /></label>
      {text.trim() && !r ? <p className="mt-3 text-muted">{c.rlNeed}</p> : null}
      {r ? <section className="guide-card mt-5 p-5" aria-live="polite"><p className="font-display text-3xl font-semibold text-teal">{c.rlGrade(r.grade)}</p><p className="text-muted">{c.rlStats(r.words, r.sentences)}</p>
        {profile.grade ? <p className="mt-2 text-lg">{c.rlYours(profile.grade, r.grade - profile.grade)}</p> : null}</section> : null}
      <p className="mt-4 max-w-prose text-sm text-muted">{c.rlNote}</p>
    </Head>
  );
}

export function ParaphraseTool() {
  const c = useCopy(copy);
  const [o, setO] = useState(""), [m, setM] = useState("");
  const share = copiedShare(o, m);
  const pct = Math.round(share * 100);
  const verdict = share >= 0.4 ? { t: c.ppToo, cls: "text-ruby" } : share >= 0.15 ? { t: c.ppClose, cls: "text-ink" } : { t: c.ppGood, cls: "text-teal" };
  return (
    <Head title={c.ppTitle} lead={c.ppLead}>
      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <label><span className="block font-bold">{c.orig}</span><textarea value={o} onChange={(e) => setO(e.target.value.slice(0, 10000))} className={`${area} mt-1`} /></label>
        <label><span className="block font-bold">{c.mine}</span><textarea value={m} onChange={(e) => setM(e.target.value.slice(0, 10000))} className={`${area} mt-1`} /></label></div>
      {o.trim() && m.trim() ? <section className="guide-card mt-5 p-5" aria-live="polite"><p className={`font-display text-2xl font-semibold ${verdict.cls}`}>{verdict.t}</p><p className="text-muted">{c.ppShare(pct)}</p></section> : null}
      <p className="mt-4 max-w-prose text-sm text-muted">{c.ppNote}</p>
    </Head>
  );
}

type Read = { id: string; date: string; book: string; pages: number; minutes: number };
const NO_READS: Read[] = [];
export function ReadLogTool() {
  const c = useCopy(copy);
  const [log, setLog] = useLocalDoc<Read[]>("reading-log", NO_READS);
  const [f, setF] = useState({ book: "", pages: "", minutes: "", date: today() });
  const [err, setErr] = useState<string | null>(null);
  const now = today();
  const week = Array.from({ length: 7 }, (_, i) => { const d = new Date(now + "T00:00:00"); d.setDate(d.getDate() - i); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`; });
  const wk = log.filter((r) => week.includes(r.date));
  const books = [...new Set(log.map((r) => r.book))].map((b) => ({ b, pages: log.filter((r) => r.book === b).reduce((n, r) => n + r.pages, 0) })).sort((a, b) => b.pages - a.pages);
  return (
    <Head title={c.lgTitle} lead={c.lgLead}>
      <form className="guide-card mt-5 grid gap-x-4 gap-y-3 p-5 sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_1fr_auto] lg:items-end" noValidate onSubmit={(e) => { e.preventDefault(); const p = Math.max(0, Math.round(Number(f.pages) || 0)), m = Math.max(0, Math.round(Number(f.minutes) || 0)); if (!f.book.trim() || (p === 0 && m === 0)) return setErr(c.lgNeed); setErr(null); setLog((l) => [{ id: crypto.randomUUID(), date: f.date || now, book: f.book.trim(), pages: Math.min(p, 2000), minutes: Math.min(m, 1440) }, ...l].slice(0, 500)); setF({ ...f, pages: "", minutes: "" }); }}>
        <label><span className="block font-bold">{c.book}</span><input value={f.book} onChange={(e) => setF({ ...f, book: e.target.value })} maxLength={80} className={`${inputClass} mt-1`} /></label>
        <label><span className="block font-bold">{c.pages}</span><input type="number" min={0} value={f.pages} onChange={(e) => setF({ ...f, pages: e.target.value })} className={`${inputClass} mt-1`} /></label>
        <label><span className="block font-bold">{c.mins}</span><input type="number" min={0} value={f.minutes} onChange={(e) => setF({ ...f, minutes: e.target.value })} className={`${inputClass} mt-1`} /></label>
        <label><span className="block font-bold">{c.day}</span><input type="date" max={now} value={f.date} onChange={(e) => setF({ ...f, date: e.target.value })} className={`${inputClass} mt-1`} /></label>
        <button className={buttonClass.primary}><Plus size={18} />{c.add}</button>{err ? <p role="alert" className="font-bold text-ruby sm:col-span-2 lg:col-span-5">{err}</p> : null}</form>
      {log.length === 0 ? <Empty>{c.lgEmpty}</Empty> : <>
        <h2 className="mt-6 border-b-[1.5px] border-ink pb-1 text-2xl">{c.lgWeek}</h2><p className="mt-2 font-display text-2xl font-semibold text-teal">{c.lgPages(wk.reduce((n, r) => n + r.pages, 0))} · {c.lgMin(wk.reduce((n, r) => n + r.minutes, 0))}</p>
        <h2 className="mt-6 border-b-[1.5px] border-ink pb-1 text-2xl">{c.lgBooks}</h2><ul className="mt-2">{books.map((b) => <li key={b.b} className="flex justify-between py-1"><span className="font-bold">{b.b}</span><span>{c.lgPages(b.pages)}</span></li>)}</ul>
        <ul className="mt-5 divide-y-2 divide-dotted divide-line">{log.slice(0, 12).map((r) => <li key={r.id} className="flex items-center gap-3 py-2"><p className="min-w-0 flex-1"><span className="font-bold">{r.book}</span> <span className="text-muted">· {r.date} · {c.lgPages(r.pages)} · {c.lgMin(r.minutes)}</span></p>{rm(r.book, c.remove, () => setLog((l) => l.filter((x) => x.id !== r.id)))}</li>)}</ul></>}
    </Head>
  );
}

const PASSAGES = [
  { id: "p1", title: { en: "The Lighthouse Keeper's Cat", es: "El gato del farero" }, text: "Mara lived with her grandfather at the edge of a small town by the sea. Every evening he climbed the winding stairs of the old lighthouse to light the great lamp, and every evening an orange cat named Pepper followed close behind. Nobody remembered where Pepper had come from. One stormy night the lamp flickered and went dark, and the whole harbor disappeared into the rain. Mara's grandfather fumbled for the matches, but his hands were cold and slow. Pepper leaped onto the table and knocked the box of matches to the floor, right at Mara's feet. She struck one, lit the lamp, and the beam swept across the waves again. A fishing boat that had been circling in the dark turned toward the light and reached the dock safely. The next morning the whole town gathered to thank them, and the fisherman who had been saved brought Pepper the biggest fish in his net.", qs: [{ q: "Who followed the grandfather up the stairs each evening?", o: ["A dog", "A cat named Pepper", "Mara's brother", "A fisherman"], a: 1 }, { q: "What went wrong on the stormy night?", o: ["The boat sank", "The lamp went dark", "The stairs broke", "The town lost power"], a: 1 }, { q: "How did Pepper help?", o: ["He caught a fish", "He rang a bell", "He knocked the matches to Mara's feet", "He lit the lamp himself"], a: 2 }] },
  { id: "p2", title: { en: "A Garden on the Roof", es: "Un jardín en el techo" }, text: "When the school's cafeteria needed new vegetables, a group of students had an idea: they would grow them on the flat roof of the gym. First they measured the roof and learned from an engineer how much weight it could safely hold. Then they built shallow wooden boxes, filled them with light soil, and planted tomatoes, peppers and herbs. Because the roof was hot in the afternoon, they added a simple system of tubes that dripped water slowly onto the roots, and they covered the tallest plants with thin cloth for shade. By midsummer the garden was producing more than the students had hoped. The cooks used the peppers in the Friday tacos and the basil in the soup. Best of all, the students kept notes on what worked, so next year's group would not have to start from zero.", qs: [{ q: "Where did the students grow the vegetables?", o: ["In the cafeteria", "On the gym roof", "In a park", "Behind the library"], a: 1 }, { q: "Why did they add tubes that dripped water?", o: ["The roof was hot in the afternoon", "The soil was too heavy", "The cooks asked for it", "It rained too much"], a: 0 }, { q: "Why did the students keep notes?", o: ["For a grade", "So next year's group would not start from zero", "To sell the plants", "To win a prize"], a: 1 }] },
];
const NO_BEST: { rs: number } = { rs: 0 };
export function ReadSpeedTool() {
  const c = useCopy(copy);
  const lang = useLang();
  const [best, setBest] = useLocalDoc<{ rs: number }>("readspeed-best", NO_BEST);
  const [pid, setPid] = useState(PASSAGES[0].id);
  const [phase, setPhase] = useState<"pick" | "read" | "quiz" | "done">("pick");
  const startRef = useRef(0);
  const [speed, setSpeed] = useState(0);
  const [ans, setAns] = useState<number[]>([-1, -1, -1]);
  const p = PASSAGES.find((x) => x.id === pid)!;
  const wc = words(p.text).length;
  const ok = ans.filter((a, i) => a === p.qs[i].a).length;
  const finish = () => { setSpeed(wpm(wc, (nowMs() - startRef.current) / 1000)); setPhase("quiz"); };
  const submit = () => { setPhase("done"); if (ok >= 2) setBest((b) => ({ rs: Math.max(b.rs, speed) })); };
  return (
    <Head title={c.rsTitle} lead={c.rsLead}>
      {phase === "pick" ? <section className="mt-5"><Chips<string> value={pid} onChange={setPid} label={c.rsPick} options={PASSAGES.map((x) => ({ id: x.id, label: x.title[lang] }))} /><button onClick={() => { startRef.current = nowMs(); setPhase("read"); }} className={`${buttonClass.primary} mt-4`}>{c.start}</button>{best.rs ? <p className="mt-3 font-bold text-teal">{c.rsBest(best.rs)}</p> : null}</section> : null}
      {phase === "read" ? <section className="mt-5"><p className="font-bold text-teal">{c.rsRead}</p><article className="guide-card mt-3 p-6 text-xl leading-relaxed"><h2 className="text-2xl">{p.title[lang]}</h2><p className="mt-2 max-w-prose">{p.text}</p></article><button onClick={finish} className={`${buttonClass.primary} mt-4`}>{c.rsDone}</button></section> : null}
      {phase === "quiz" ? <section className="mt-5"><p className="font-bold text-teal">{c.rsQs}</p>{p.qs.map((q, i) => <fieldset key={i} className="guide-card mt-3 p-4"><legend className="px-1 text-lg font-bold">{i + 1}. {q.q}</legend>{q.o.map((o, j) => <label key={o} className="flex items-center gap-3 py-1.5"><input type="radio" name={`q${i}`} checked={ans[i] === j} onChange={() => setAns(ans.map((x, k) => (k === i ? j : x)))} className="h-5 w-5 accent-[var(--c-teal)]" />{o}</label>)}</fieldset>)}<button disabled={ans.includes(-1)} onClick={submit} className={`${buttonClass.primary} mt-4`}>{c.rsSubmit}</button></section> : null}
      {phase === "done" ? <section className="guide-card mt-5 p-6" aria-live="polite"><p className="font-display text-3xl font-semibold">{c.rsResult(speed, ok)}</p><p className={`mt-2 text-lg font-bold ${ok >= 2 ? "text-teal" : "text-ruby"}`}>{ok >= 2 ? c.rsGood : c.rsLow}</p><p className="mt-2 text-muted">{c.rsAvg}</p><button onClick={() => { setAns([-1, -1, -1]); setPhase("pick"); }} className={`${buttonClass.secondary} mt-4`}>{c.again}</button></section> : null}
    </Head>
  );
}

const TYPING = { en: ["Practice makes progress. Type a little every day and your fingers will learn the keys without you even looking down.", "A good writer reads often, drafts quickly and edits carefully. The first version does not need to be perfect to be useful.", "Our community is full of people who care. Neighbors help neighbors, and students who ask questions often teach the whole class something new."], es: ["La práctica trae progreso. Escribe un poco cada día y tus dedos aprenderán las teclas sin que tengas que mirar el teclado.", "Un buen escritor lee seguido, escribe rápido y corrige con cuidado. La primera versión no tiene que ser perfecta para servir.", "Nuestra comunidad está llena de gente que se preocupa. Los vecinos se ayudan y los estudiantes que preguntan suelen enseñarle algo nuevo a toda la clase."] };
export function TypingTool() {
  const c = useCopy(copy);
  const lang = useLang();
  const [tl, setTl] = useState<"en" | "es">(lang);
  const [i, setI] = useState(0);
  const [typed, setTyped] = useState("");
  const [left, setLeft] = useState(60);
  const [state, setState] = useState<"idle" | "run" | "done">("idle");
  const t0 = useRef(0);
  const typedRef = useRef("");
  useEffect(() => { typedRef.current = typed; }, [typed]);
  const [best, setBest] = useLocalDoc<{ ty: number }>("typing-best", { ty: 0 });
  const target = TYPING[tl][i % 3];
  const [final, setFinal] = useState<{ wpm: number; accuracy: number } | null>(null);
  const end = (t: string, secs: number) => { setState("done"); const r = typingResult(target, t, Math.max(1, secs)); setFinal(r); if (r.accuracy >= 90) setBest((b) => ({ ty: Math.max(b.ty, r.wpm) })); };
  useEffect(() => { if (state !== "run") return; const id = setInterval(() => { const s = 60 - Math.floor((Date.now() - t0.current) / 1000); setLeft(Math.max(0, s)); if (s <= 0) { clearInterval(id); end(typedRef.current, 60); } }, 250); return () => clearInterval(id); }, [state]); // eslint-disable-line react-hooks/exhaustive-deps
  const onType = (v: string) => {
    if (state === "done") return;
    if (state === "idle") { t0.current = Date.now(); setState("run"); }
    setTyped(v);
    if (v.length >= target.length) end(v, (Date.now() - t0.current) / 1000);
  };
  const reset = (next: number) => { setI(next); setTyped(""); setLeft(60); setState("idle"); setFinal(null); };
  return (
    <Head title={c.tpTitle} lead={c.tpLead}>
      <div className="mt-5 flex flex-wrap items-center gap-4"><Chips<"en" | "es"> value={tl} onChange={(v) => { setTl(v); reset(0); }} label={c.tpLang} options={[{ id: "en", label: "English" }, { id: "es", label: "Español" }]} /><button onClick={() => reset(i + 1)} className={buttonClass.secondary}>{c.tpNew}</button>{best.ty ? <span className="font-bold text-teal">{c.tpBest(best.ty)}</span> : null}</div>
      <p className="guide-card mt-5 p-5 text-xl leading-relaxed" lang={tl}>{[...target].map((ch, k) => <span key={k} className={k < typed.length ? (typed[k] === ch ? "text-teal" : "bg-ruby text-on-ruby") : ""}>{ch}</span>)}</p>
      <label className="mt-4 block"><span className="sr-only">{c.tpPh}</span><textarea value={typed} onChange={(e) => onType(e.target.value)} placeholder={c.tpPh} disabled={state === "done"} lang={tl} spellCheck={false} autoCapitalize="off" autoCorrect="off" className={`${area} min-h-28`} /></label>
      {state === "run" ? <p className="mt-2 font-bold text-teal" aria-live="off">{c.tpLeft(left)}</p> : null}
      {final ? <section className="guide-card mt-4 p-5" aria-live="polite"><p className="font-display text-3xl font-semibold">{c.tpRes(final.wpm, final.accuracy)}</p><button onClick={() => reset(i)} className={`${buttonClass.secondary} mt-3`}>{c.again}</button></section> : null}
    </Head>
  );
}

function useVocab() {
  const [cards, setCards] = useLocalDoc<Card[]>(FLASHCARDS_KEY, NO_CARDS);
  const vocab = cards.filter((x) => x.deck === "Vocabulary");
  const save = (word: string, meaning: string, example: string): "dup" | "ok" => {
    if (vocab.some((x) => x.front.toLowerCase() === word.toLowerCase())) return "dup";
    setCards((p) => [...p, newCard(word, example ? `${meaning}\n${example}` : meaning, "Vocabulary", today())]);
    return "ok";
  };
  return { vocab, save };
}

export function VocabBuilderTool() {
  const c = useCopy(copy);
  const { vocab, save } = useVocab();
  const [f, setF] = useState({ word: "", meaning: "", example: "" });
  const [msg, setMsg] = useState<{ t: string; bad: boolean } | null>(null);
  return (
    <Head title={c.vbTitle} lead={c.vbLead}>
      <form className="guide-card mt-5 grid gap-4 p-5" noValidate onSubmit={(e) => { e.preventDefault(); if (!f.word.trim() || !f.meaning.trim()) return setMsg({ t: c.vbNeed, bad: true }); if (save(f.word.trim(), f.meaning.trim(), f.example.trim()) === "dup") return setMsg({ t: c.vbDup, bad: true }); setMsg(null); setF({ word: "", meaning: "", example: "" }); }}>
        <label><span className="block font-bold">{c.word}</span><input value={f.word} onChange={(e) => setF({ ...f, word: e.target.value })} maxLength={40} className={`${inputClass} mt-1`} /></label>
        <label><span className="block font-bold">{c.meaning}</span><input value={f.meaning} onChange={(e) => setF({ ...f, meaning: e.target.value })} maxLength={160} className={`${inputClass} mt-1`} /></label>
        <label><span className="block font-bold">{c.example}</span><input value={f.example} onChange={(e) => setF({ ...f, example: e.target.value })} maxLength={200} className={`${inputClass} mt-1`} /></label>
        {msg ? <p role="alert" className="font-bold text-ruby">{msg.t}</p> : null}<button className={`${buttonClass.primary} justify-self-start`}>{c.vbAdd}</button></form>
      <p className="mt-4 font-bold text-teal" aria-live="polite">{c.vbSaved(vocab.length)}</p>
      <Link href="/t/notes/spaced" className={`${buttonClass.secondary} mt-3 inline-flex`}>{c.vbReview}</Link>
    </Head>
  );
}

export function VocabCtxTool() {
  const c = useCopy(copy);
  const { save } = useVocab();
  const [text, setText] = useState("");
  const [sel, setSel] = useState<string | null>(null);
  const [meaning, setMeaning] = useState("");
  const [msg, setMsg] = useState<{ t: string; bad: boolean } | null>(null);
  const tokens = text.match(/[\p{L}'’-]+|[^\p{L}'’-]+/gu) ?? [];
  const enc = sel ? encodeURIComponent(sel.toLowerCase()) : "";
  return (
    <Head title={c.vcTitle} lead={c.vcLead}>
      <label className="mt-5 block"><span className="sr-only">{c.vcPh}</span><textarea value={text} onChange={(e) => { setText(e.target.value.slice(0, 5000)); setSel(null); }} placeholder={c.vcPh} className={area} /></label>
      {text.trim() ? <section className="guide-card mt-5 p-5"><h2 className="text-lg text-muted">{c.vcTap}</h2><p className="mt-2 text-xl leading-loose">{tokens.map((t, i) => /^[\p{L}]/u.test(t) && t.length > 2 ? <button key={i} onClick={() => { setSel(t.replace(/^['’-]+|['’-]+$/g, "")); setMsg(null); setMeaning(""); }} className={`rounded px-0.5 hover:bg-marigold hover:text-on-marigold ${sel && t.toLowerCase().includes(sel.toLowerCase()) ? "bg-marigold text-on-marigold" : ""}`}>{t}</button> : <span key={i}>{t}</span>)}</p></section> : null}
      {sel ? <section className="guide-card mt-4 p-5" aria-live="polite"><p className="text-sm text-muted">{c.vcSel}</p><p className="font-display text-3xl font-semibold">{sel}</p>
        <div className="mt-2 flex flex-wrap gap-5"><Ext href={`https://www.merriam-webster.com/dictionary/${enc}`}>{c.vcDef}</Ext><Ext href={`https://www.spanishdict.com/translate/${enc}`}>{c.vcEs}</Ext></div>
        <label className="mt-4 block"><span className="block font-bold">{c.vcMeaning}</span><input value={meaning} onChange={(e) => setMeaning(e.target.value)} maxLength={160} className={`${inputClass} mt-1`} /></label>
        <button onClick={() => { if (!meaning.trim()) return setMsg({ t: c.vcNeed, bad: true }); const r = save(sel, meaning.trim(), ""); setMsg({ t: r === "dup" ? c.vbDup : c.vcSaved, bad: r === "dup" }); }} className={`${buttonClass.secondary} mt-3`}>{c.vcSave}</button>
        {msg ? <p role="status" className={`mt-2 font-bold ${msg.bad ? "text-ruby" : "text-teal"}`}>{msg.t}</p> : null}</section> : null}
      <Callout>{c.vcEs}: SpanishDict. {c.vcDef}: Merriam-Webster.</Callout>
    </Head>
  );
}
