"use client";
import Link from "next/link";
import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { planUnits } from "@/lib/apPlan";
import { cite, citeText, EMPTY_SOURCE, type Kind, type Source, type Style } from "@/lib/citation";
import { diffDays, formatDay, isValidISO, today } from "@/lib/dates";
import { AP_COURSES } from "@/lib/exam/ap";
import { HOMEWORK_KEY, NO_ASSIGNMENTS, type Assignment } from "@/lib/homework";
import { useLang } from "@/lib/i18n";
import { useLocalDoc } from "@/lib/local-doc";
import { FLASHCARDS_KEY, newCard, NO_CARDS, parseCards, type Card } from "@/lib/srs";
import { useCopy } from "@/lib/use-copy";
import { buttonClass, inputClass } from "../ui";
import { Callout, Chips, Empty, Ext, Head } from "./shared";

const copy = {
  en: {
    add: "Add", remove: "Remove", copy: "Copy to clipboard", copied: "Copied.",
    ciTitle: "Citation generator", ciLead: "Type the details from your source and get a citation in MLA 9 or APA 7. You type the details, so it never makes anything up.", style: "Style", type: "Source type", web: "Web page", book: "Book", article: "Journal or magazine article", author: "Author", first: "First name", last: "Last name", addAuthor: "Add a second author", title: "Title", site: "Website name", publisher: "Publisher", url: "Web address", year: "Year", month: "Month", day: "Day", container: "Journal or magazine name", volume: "Volume", issue: "Issue", pages: "Pages", result: "Your citation", needTitle: "Type the title to see your citation.", ciNote: "Check which style your teacher wants. For three or more authors, MLA uses 'et al.' and APA lists them all, so check the style guide. Copied text has no italics, so italicize the titles in your document.", months: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"], noMonth: "(none)", ciSources: "Style guides", ciPlain: "Plain text copy", ciMax: "This tool supports up to 2 authors. For more, use only the first two and check the guide.",
    atTitle: "Application tracker", atLead: "Keep every college, scholarship and program application in one list, with deadlines and a checklist for each.", name: "Name", namePh: "UTRGV honors program", kind: "Type", kinds: { college: "College", scholarship: "Scholarship", program: "Program or camp" }, deadline: "Deadline", status: "Status", statuses: { planning: "Planning", working: "Working on it", submitted: "Submitted", accepted: "Accepted", waitlisted: "Waitlisted", declined: "Not accepted" }, checklist: ["Application form", "Essay or personal statement", "Recommendation letters", "Transcript", "Test scores (if required)", "Financial aid forms or fee waiver"], atNeed: "Write the name of the application.", atEmpty: "No applications yet. Add the first one above.", daysLeft: (n: number) => (n < 0 ? `${-n} days past due` : n === 0 ? "Due today" : `${n} ${n === 1 ? "day" : "days"} left`), done: (a: number, b: number) => `${a} of ${b} parts done`, notes: "Notes", counts: (s: number, t: number) => `${s} submitted of ${t}`, opens: "Open checklist", closes: "Hide checklist",
    anTitle: "Unit notes", anLead: "A notebook for each unit of your AP courses. Write what you learn in your own words. Writing 'term: meaning' lines lets you turn them into flashcards.", course: "AP course", unit: "Unit", noCourse: "Pick your AP courses first.", pick: "Pick AP courses", notesPh: "Write key terms, main ideas and examples.\nTerm: meaning", hint: "Tip: a line like 'standard deviation: how spread out the data are' can become a flashcard.", flash: "Make flashcards from term lines", made: (n: number) => `${n} flashcards made.`, none: "No 'term: meaning' lines found.", noteCount: (n: number) => `${n} notes written`,
    afTitle: "AP flashcards", afLead: "Flashcards for each AP unit. Add your own, or turn your unit notes into cards. They come back on a spaced schedule.", front: "Front", back: "Back", addCard: "Add card", afNeed: "Write both sides.", afCount: (n: number) => `${n} cards in this unit`, review: "Review my cards", afNote: "Cards are saved in your deck for this unit.",
    apTitle: "AP study plan", apLead: "One tap spreads every unit of a course between today and your exam date, with a few days left to review. The sessions go into your homework list with due dates.", examDate: "Exam date", noDate: "Set the exam date in the AP dashboard first.", plan: "Build my plan", apAdded: (n: number) => `${n} study sessions added to your homework list.`, apTight: "That is a tight timeline. Some units are only a day or two apart.", apSession: (c: string, u: string) => `Study ${c}: ${u}`, apFinal: (c: string) => `Final review: ${c}`, dash: "Open the AP dashboard", preview: "Preview", apPast: "The exam date has passed or is today.", apDays: (n: number) => `${n} days until the exam`,
  },
  es: {
    add: "Agregar", remove: "Quitar", copy: "Copiar", copied: "Copiado.",
    ciTitle: "Generador de citas", ciLead: "Escribe los datos de tu fuente y recibe una cita en MLA 9 o APA 7. Tú escribes los datos, así que nunca inventa nada.", style: "Estilo", type: "Tipo de fuente", web: "Página web", book: "Libro", article: "Artículo de revista", author: "Autor", first: "Nombre", last: "Apellido", addAuthor: "Agregar un segundo autor", title: "Título", site: "Nombre del sitio", publisher: "Editorial", url: "Dirección web", year: "Año", month: "Mes", day: "Día", container: "Nombre de la revista", volume: "Volumen", issue: "Número", pages: "Páginas", result: "Tu cita", needTitle: "Escribe el título para ver tu cita.", ciNote: "Revisa qué estilo pide tu maestro. Con tres o más autores, MLA usa 'et al.' y APA los lista todos, así que consulta la guía de estilo. El texto copiado no tiene cursivas, así que pon los títulos en cursiva en tu documento.", months: ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"], noMonth: "(ninguno)", ciSources: "Guías de estilo", ciPlain: "Copia en texto simple", ciMax: "Esta herramienta acepta hasta 2 autores. Si hay más, usa solo los dos primeros y consulta la guía.",
    atTitle: "Seguimiento de solicitudes", atLead: "Guarda todas tus solicitudes de universidades, becas y programas en una lista, con fechas límite y una lista de pendientes para cada una.", name: "Nombre", namePh: "Programa de honores de UTRGV", kind: "Tipo", kinds: { college: "Universidad", scholarship: "Beca", program: "Programa o campamento" }, deadline: "Fecha límite", status: "Estado", statuses: { planning: "Planeando", working: "Trabajando en ella", submitted: "Enviada", accepted: "Aceptado", waitlisted: "En lista de espera", declined: "No aceptado" }, checklist: ["Formulario de solicitud", "Ensayo o declaración personal", "Cartas de recomendación", "Expediente académico", "Resultados de exámenes (si piden)", "Formularios de ayuda financiera o exención de cuota"], atNeed: "Escribe el nombre de la solicitud.", atEmpty: "Todavía no hay solicitudes. Agrega la primera arriba.", daysLeft: (n: number) => (n < 0 ? `${-n} días de atraso` : n === 0 ? "Vence hoy" : `${n} ${n === 1 ? "día" : "días"}`), done: (a: number, b: number) => `${a} de ${b} partes listas`, notes: "Notas", counts: (s: number, t: number) => `${s} enviadas de ${t}`, opens: "Abrir lista", closes: "Ocultar lista",
    anTitle: "Apuntes por unidad", anLead: "Un cuaderno para cada unidad de tus cursos AP. Escribe lo que aprendes con tus palabras. Si escribes líneas 'término: significado' puedes convertirlas en tarjetas.", course: "Curso AP", unit: "Unidad", noCourse: "Primero elige tus cursos AP.", pick: "Elegir cursos AP", notesPh: "Escribe términos clave, ideas principales y ejemplos.\nTérmino: significado", hint: "Consejo: una línea como 'desviación estándar: qué tan dispersos están los datos' puede volverse tarjeta.", flash: "Hacer tarjetas con las líneas de término", made: (n: number) => `${n} tarjetas creadas.`, none: "No se encontraron líneas 'término: significado'.", noteCount: (n: number) => `${n} apuntes escritos`,
    afTitle: "Tarjetas de AP", afLead: "Tarjetas para cada unidad de AP. Agrega las tuyas o convierte tus apuntes de la unidad en tarjetas. Regresan en un calendario espaciado.", front: "Frente", back: "Reverso", addCard: "Agregar tarjeta", afNeed: "Escribe los dos lados.", afCount: (n: number) => `${n} tarjetas en esta unidad`, review: "Repasar mis tarjetas", afNote: "Las tarjetas se guardan en tu mazo de esta unidad.",
    apTitle: "Plan de estudio de AP", apLead: "Con un toque se reparten todas las unidades de un curso entre hoy y la fecha de tu examen, dejando unos días para repasar. Las sesiones van a tu lista de tareas con fecha.", examDate: "Fecha del examen", noDate: "Primero pon la fecha del examen en el panel de AP.", plan: "Armar mi plan", apAdded: (n: number) => `${n} sesiones de estudio agregadas a tu lista de tareas.`, apTight: "Es poco tiempo. Algunas unidades quedan a solo uno o dos días.", apSession: (c: string, u: string) => `Estudiar ${c}: ${u}`, apFinal: (c: string) => `Repaso final: ${c}`, dash: "Abrir el panel de AP", preview: "Vista previa", apPast: "La fecha del examen ya pasó o es hoy.", apDays: (n: number) => `${n} días para el examen`,
  },
};

const clip = async (text: string) => { try { await navigator.clipboard.writeText(text); return true; } catch { return false; } };
const rm = (label: string, text: string, fn: () => void) => <button onClick={fn} aria-label={`${text}: ${label}`} className="grid h-10 w-10 shrink-0 place-items-center rounded-md hover:bg-sunken"><Trash2 size={18} strokeWidth={1.75} /></button>;

export function CitationTool() {
  const c = useCopy(copy);
  const [style, setStyle] = useState<Style>("mla");
  const [kind, setKind] = useState<Kind>("web");
  const [s, setS] = useState<Source>(EMPTY_SOURCE);
  const [note, setNote] = useState("");
  const parts = s.title.trim() ? cite(style, kind, s) : [];
  const set = (k: keyof Source, v: string) => setS({ ...s, [k]: v });
  const f = (k: keyof Source, label: string, extra = "") => <label className={extra}><span className="block font-bold">{label}</span><input value={s[k] as string} onChange={(e) => set(k, e.target.value)} maxLength={200} className={`${inputClass} mt-1`} /></label>;
  const setAuthor = (i: number, k: "first" | "last", v: string) => setS({ ...s, authors: s.authors.map((a, j) => (j === i ? { ...a, [k]: v } : a)) });
  return (
    <Head title={c.ciTitle} lead={c.ciLead}>
      <div className="mt-5 flex flex-wrap gap-5">
        <Chips<Style> value={style} onChange={setStyle} label={c.style} options={[{ id: "mla", label: "MLA 9" }, { id: "apa", label: "APA 7" }]} />
        <Chips<Kind> value={kind} onChange={setKind} label={c.type} options={[{ id: "web", label: c.web }, { id: "book", label: c.book }, { id: "article", label: c.article }]} /></div>
      <div className="guide-card mt-5 grid gap-4 p-5 md:grid-cols-2">
        {s.authors.map((a, i) => <fieldset key={i} className="grid grid-cols-2 gap-3 md:col-span-2"><legend className="font-bold">{c.author} {i + 1}</legend>
          <label><span className="block text-sm">{c.first}</span><input value={a.first} onChange={(e) => setAuthor(i, "first", e.target.value)} maxLength={60} className={`${inputClass} mt-1`} /></label>
          <label><span className="block text-sm">{c.last}</span><input value={a.last} onChange={(e) => setAuthor(i, "last", e.target.value)} maxLength={60} className={`${inputClass} mt-1`} /></label></fieldset>)}
        {s.authors.length < 2 ? <button type="button" onClick={() => setS({ ...s, authors: [...s.authors, { first: "", last: "" }] })} className={`${buttonClass.secondary} justify-self-start md:col-span-2`}><Plus size={18} />{c.addAuthor}</button> : <p className="text-sm text-muted md:col-span-2">{c.ciMax}</p>}
        {f("title", c.title, "md:col-span-2")}
        {kind === "web" ? <>{f("site", c.site)}{f("publisher", c.publisher)}{f("url", c.url, "md:col-span-2")}</> : null}
        {kind === "book" ? f("publisher", c.publisher) : null}
        {kind === "article" ? <>{f("container", c.container, "md:col-span-2")}{f("volume", c.volume)}{f("issue", c.issue)}{f("pages", c.pages)}{f("url", c.url)}</> : null}
        <div className="grid grid-cols-3 gap-3 md:col-span-2">{f("year", c.year)}
          <label><span className="block font-bold">{c.month}</span><select value={s.month} onChange={(e) => set("month", e.target.value)} className={`${inputClass} mt-1`}><option value="">{c.noMonth}</option>{c.months.map((m, i) => <option key={m} value={String(i + 1)}>{m}</option>)}</select></label>
          {f("day", c.day)}</div></div>
      <section className="guide-card mt-5 p-5" aria-live="polite"><h2 className="text-xl">{c.result}</h2>
        {parts.length ? <><p className="mt-2 text-lg leading-relaxed" style={{ paddingLeft: "2rem", textIndent: "-2rem" }}>{parts.map((p, i) => (p.i ? <i key={i}>{p.t}</i> : <span key={i}>{p.t}</span>))}</p>
          <div className="mt-3 flex items-center gap-3"><button onClick={async () => setNote((await clip(citeText(parts))) ? c.copied : "")} className={buttonClass.secondary}>{c.ciPlain}</button><span className="font-bold text-teal" role="status">{note}</span></div></> : <p className="mt-2 text-muted">{c.needTitle}</p>}</section>
      <p className="mt-4 max-w-prose text-sm text-muted">{c.ciNote}</p>
      <p className="mt-2 flex flex-wrap items-center gap-4 text-sm">{c.ciSources}: <Ext href="https://owl.purdue.edu/owl/research_and_citation/mla_style/mla_formatting_and_style_guide/mla_formatting_and_style_guide.html">MLA (Purdue OWL)</Ext><Ext href="https://owl.purdue.edu/owl/research_and_citation/apa_style/apa_formatting_and_style_guide/general_format.html">APA (Purdue OWL)</Ext></p>
    </Head>
  );
}

type Status = "planning" | "working" | "submitted" | "accepted" | "waitlisted" | "declined";
type App = { id: string; name: string; kind: "college" | "scholarship" | "program"; deadline: string; status: Status; done: boolean[]; notes: string };
const NO_APPS: App[] = [];
export function AppTrackerTool() {
  const c = useCopy(copy);
  const lang = useLang();
  const [apps, setApps] = useLocalDoc<App[]>("applications", NO_APPS);
  const [f, setF] = useState({ name: "", kind: "college" as App["kind"], deadline: "" });
  const [err, setErr] = useState<string | null>(null);
  const [open, setOpen] = useState<string | null>(null);
  const now = today();
  const sorted = [...apps].sort((a, b) => (a.deadline || "9999").localeCompare(b.deadline || "9999"));
  const upd = (id: string, patch: Partial<App>) => setApps((p) => p.map((a) => (a.id === id ? { ...a, ...patch } : a)));
  return (
    <Head title={c.atTitle} lead={c.atLead}>
      <form className="guide-card mt-5 grid gap-x-4 gap-y-3 p-5 sm:grid-cols-2 lg:grid-cols-[2fr_1.2fr_1fr_auto] lg:items-end" noValidate onSubmit={(e) => { e.preventDefault(); if (!f.name.trim()) return setErr(c.atNeed); setErr(null); setApps((p) => [...p, { id: crypto.randomUUID(), name: f.name.trim(), kind: f.kind, deadline: isValidISO(f.deadline) ? f.deadline : "", status: "planning", done: c.checklist.map(() => false), notes: "" }]); setF({ ...f, name: "" }); }}>
        <label><span className="block font-bold">{c.name}</span><input value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} placeholder={c.namePh} maxLength={80} className={`${inputClass} mt-1`} /></label>
        <label><span className="block font-bold">{c.kind}</span><select value={f.kind} onChange={(e) => setF({ ...f, kind: e.target.value as App["kind"] })} className={`${inputClass} mt-1`}>{(Object.keys(c.kinds) as App["kind"][]).map((k) => <option key={k} value={k}>{c.kinds[k]}</option>)}</select></label>
        <label><span className="block font-bold">{c.deadline}</span><input type="date" value={f.deadline} onChange={(e) => setF({ ...f, deadline: e.target.value })} className={`${inputClass} mt-1`} /></label>
        <button className={buttonClass.primary}><Plus size={18} />{c.add}</button>{err ? <p role="alert" className="font-bold text-ruby sm:col-span-2 lg:col-span-4">{err}</p> : null}</form>
      {apps.length === 0 ? <Empty>{c.atEmpty}</Empty> : <>
        <p className="mt-4 font-bold text-teal" aria-live="polite">{c.counts(apps.filter((a) => ["submitted", "accepted", "waitlisted", "declined"].includes(a.status)).length, apps.length)}</p>
        <ul className="mt-3 space-y-3">{sorted.map((a) => { const left = a.deadline ? diffDays(now, a.deadline) : null; const nd = a.done.filter(Boolean).length; return (
          <li key={a.id} className={`guide-card p-4 ${left !== null && left < 0 && a.status !== "submitted" && a.status !== "accepted" ? "border-l-[6px] border-l-ruby" : ""}`}>
            <div className="flex flex-wrap items-start gap-3"><div className="min-w-0 flex-1"><h2 className="text-xl">{a.name}</h2><p className="text-sm text-muted">{c.kinds[a.kind]}{a.deadline ? ` · ${formatDay(a.deadline, lang)}` : ""}{left !== null ? ` · ${c.daysLeft(left)}` : ""}</p><p className="text-sm font-bold">{c.done(nd, c.checklist.length)}</p></div>
              <label><span className="sr-only">{c.status}: {a.name}</span><select value={a.status} onChange={(e) => upd(a.id, { status: e.target.value as Status })} className="rounded-md border-[1.5px] border-ink bg-surface px-2 py-1.5 font-bold">{(Object.keys(c.statuses) as Status[]).map((s) => <option key={s} value={s}>{c.statuses[s]}</option>)}</select></label>
              {rm(a.name, c.remove, () => setApps((p) => p.filter((x) => x.id !== a.id)))}</div>
            <button onClick={() => setOpen(open === a.id ? null : a.id)} aria-expanded={open === a.id} className="mt-2 font-bold text-teal underline underline-offset-4">{open === a.id ? c.closes : c.opens}: {a.name}</button>
            {open === a.id ? <div className="mt-2"><ul>{c.checklist.map((it, i) => <li key={it}><label className="flex items-center gap-3 py-1.5"><input type="checkbox" checked={a.done[i] ?? false} onChange={() => upd(a.id, { done: c.checklist.map((_, j) => (j === i ? !(a.done[j] ?? false) : a.done[j] ?? false)) })} className="h-5 w-5 accent-[var(--c-teal)]" /><span className={a.done[i] ? "text-muted line-through" : ""}>{it}</span></label></li>)}</ul>
              <label className="mt-2 block"><span className="block font-bold">{c.notes}</span><textarea value={a.notes} onChange={(e) => upd(a.id, { notes: e.target.value.slice(0, 1000) })} rows={3} className="mt-1 w-full rounded-md border-[1.5px] border-ink bg-surface p-2" /></label></div> : null}</li>); })}</ul></>}
    </Head>
  );
}

const NO_PICKED: string[] = [];
const NO_NOTES: Record<string, string> = {};
function useUnit() {
  const lang = useLang();
  const [picked] = useLocalDoc<string[]>("ap-courses", NO_PICKED);
  const courses = AP_COURSES.filter((x) => picked.includes(x.id));
  const [cid, setCid] = useState("");
  const course = courses.find((x) => x.id === cid) ?? courses[0];
  const [uid, setUid] = useState("");
  const unit = course?.units.find((u) => u.id === uid) ?? course?.units[0];
  return { lang, courses, course, unit, setCid: (v: string) => { setCid(v); setUid(""); }, setUid };
}
function UnitPickers({ c, u }: { c: typeof copy.en; u: ReturnType<typeof useUnit> }) {
  return (
    <div className="mt-5 grid gap-4 sm:grid-cols-2">
      <label><span className="block font-bold">{c.course}</span><select value={u.course?.id ?? ""} onChange={(e) => u.setCid(e.target.value)} className={`${inputClass} mt-1`}>{u.courses.map((x) => <option key={x.id} value={x.id}>{x[u.lang]}</option>)}</select></label>
      <label><span className="block font-bold">{c.unit}</span><select value={u.unit?.id ?? ""} onChange={(e) => u.setUid(e.target.value)} className={`${inputClass} mt-1`}>{u.course?.units.map((x) => <option key={x.id} value={x.id}>{x[u.lang]}</option>)}</select></label></div>
  );
}
const NoCourses = ({ c }: { c: typeof copy.en }) => <><Empty>{c.noCourse}</Empty><Link href="/t/ap/courses" className={`${buttonClass.primary} mt-3 inline-flex`}>{c.pick}</Link></>;

export function ApNotesTool() {
  const c = useCopy(copy);
  const u = useUnit();
  const [notes, setNotes] = useLocalDoc<Record<string, string>>("ap-notes", NO_NOTES);
  const [, setCards] = useLocalDoc<Card[]>(FLASHCARDS_KEY, NO_CARDS);
  const [msg, setMsg] = useState<string | null>(null);
  const key = u.course && u.unit ? `${u.course.id}/${u.unit.id}` : "";
  const text = notes[key] ?? "";
  const written = Object.values(notes).filter((x) => x.trim()).length;
  const make = () => {
    const { pairs } = parseCards(text.replace(/^[\s\-•*]+/gm, "").replace(/^([^:\n]+?)\s*:\s*/gm, "$1\t"));
    if (!pairs.length) return setMsg(c.none);
    const deck = `AP ${u.course![u.lang]}: ${u.unit![u.lang]}`;
    setCards((p) => [...p, ...pairs.filter((x) => !p.some((k) => k.deck === deck && k.front === x.front)).map((x) => newCard(x.front, x.back, deck, today()))]);
    setMsg(c.made(pairs.length));
  };
  return (
    <Head title={c.anTitle} lead={c.anLead}>
      {u.courses.length === 0 ? <NoCourses c={c} /> : <>
        <UnitPickers c={c} u={u} />
        <label className="mt-4 block"><span className="sr-only">{c.anTitle}</span><textarea value={text} onChange={(e) => setNotes({ ...notes, [key]: e.target.value.slice(0, 20000) })} placeholder={c.notesPh} rows={14} className="w-full rounded-md border-[1.5px] border-ink bg-surface p-3 text-lg placeholder:text-muted" /></label>
        <p className="mt-2 text-sm text-muted">{c.hint}</p>
        <div className="mt-3 flex flex-wrap items-center gap-3"><button onClick={make} className={buttonClass.secondary}>{c.flash}</button><span className="font-bold text-teal" role="status">{msg}</span><span className="text-sm text-muted">{c.noteCount(written)}</span></div></>}
    </Head>
  );
}

export function ApFlashTool() {
  const c = useCopy(copy);
  const u = useUnit();
  const [cards, setCards] = useLocalDoc<Card[]>(FLASHCARDS_KEY, NO_CARDS);
  const [f, setF] = useState({ front: "", back: "" });
  const [err, setErr] = useState<string | null>(null);
  const deck = u.course && u.unit ? `AP ${u.course[u.lang]}: ${u.unit[u.lang]}` : "";
  const mine = cards.filter((x) => x.deck === deck);
  return (
    <Head title={c.afTitle} lead={c.afLead}>
      {u.courses.length === 0 ? <NoCourses c={c} /> : <>
        <UnitPickers c={c} u={u} />
        <form className="guide-card mt-5 grid gap-4 p-5 md:grid-cols-[1fr_1fr_auto] md:items-end" noValidate onSubmit={(e) => { e.preventDefault(); if (!f.front.trim() || !f.back.trim()) return setErr(c.afNeed); setErr(null); setCards((p) => [...p, newCard(f.front.trim(), f.back.trim(), deck, today())]); setF({ front: "", back: "" }); }}>
          <label><span className="block font-bold">{c.front}</span><input value={f.front} onChange={(e) => setF({ ...f, front: e.target.value })} maxLength={200} className={`${inputClass} mt-1`} /></label>
          <label><span className="block font-bold">{c.back}</span><input value={f.back} onChange={(e) => setF({ ...f, back: e.target.value })} maxLength={400} className={`${inputClass} mt-1`} /></label>
          <button className={buttonClass.primary}><Plus size={18} />{c.addCard}</button>{err ? <p role="alert" className="font-bold text-ruby md:col-span-3">{err}</p> : null}</form>
        <p className="mt-4 font-bold text-teal" aria-live="polite">{c.afCount(mine.length)}</p>
        <ul className="mt-2 divide-y-2 divide-dotted divide-line">{mine.slice(0, 30).map((k) => <li key={k.id} className="flex items-center gap-3 py-2"><p className="min-w-0 flex-1"><span className="font-bold">{k.front}</span> <span className="text-muted">→ {k.back}</span></p>{rm(k.front, c.remove, () => setCards((p) => p.filter((x) => x.id !== k.id)))}</li>)}</ul>
        <Link href="/t/notes/spaced" className={`${buttonClass.secondary} mt-3 inline-flex`}>{c.review}</Link>
        <p className="mt-3 text-sm text-muted">{c.afNote}</p></>}
    </Head>
  );
}

export function ApPlanTool() {
  const c = useCopy(copy);
  const lang = useLang();
  const [picked] = useLocalDoc<string[]>("ap-courses", NO_PICKED);
  const [dates] = useLocalDoc<Record<string, string>>("ap-exam-dates", NO_NOTES);
  const [, setHw] = useLocalDoc<Assignment[]>(HOMEWORK_KEY, NO_ASSIGNMENTS);
  const [msg, setMsg] = useState<Record<string, string>>({});
  const now = today();
  const courses = AP_COURSES.filter((x) => picked.includes(x.id));
  const build = (id: string) => {
    const course = courses.find((x) => x.id === id)!;
    const exam = dates[id], p = isValidISO(exam) ? planUnits(course.units.length, now, exam) : null;
    if (!p) return;
    const items: Assignment[] = course.units.map((un, i) => ({ id: crypto.randomUUID(), title: c.apSession(course[lang], un[lang]), cls: course[lang], due: p.dates[i], done: false }));
    const finalDay = diffDays(now, exam) > 1 ? exam : now;
    items.push({ id: crypto.randomUUID(), title: c.apFinal(course[lang]), cls: course[lang], due: finalDay, done: false });
    setHw((prev) => [...prev, ...items.filter((it) => !prev.some((o) => o.title === it.title))]);
    setMsg({ ...msg, [id]: c.apAdded(items.length) });
  };
  return (
    <Head title={c.apTitle} lead={c.apLead}>
      {courses.length === 0 ? <NoCourses c={c} /> : <ul className="mt-6 space-y-4">{courses.map((course) => {
        const exam = dates[course.id] ?? "", valid = isValidISO(exam) && exam > now, p = valid ? planUnits(course.units.length, now, exam) : null;
        return <li key={course.id} className="guide-card p-5"><h2 className="text-2xl">{course[lang]}</h2>
          {!isValidISO(exam) ? <><p className="mt-2 text-muted">{c.noDate}</p><Link href="/t/ap/dashboard" className={`${buttonClass.secondary} mt-2 inline-flex`}>{c.dash}</Link></> : !valid ? <p className="mt-2 text-ruby">{c.apPast}</p> : p ? <>
            <p className="mt-1 font-bold text-teal">{c.examDate}: {formatDay(exam, lang)} · {c.apDays(diffDays(now, exam))}</p>
            <h3 className="mt-3 text-lg">{c.preview}</h3><ol className="mt-1 list-decimal pl-6">{course.units.map((un, i) => <li key={un.id}>{un[lang]} <span className="text-muted">· {formatDay(p.dates[i], lang)}</span></li>)}</ol>
            {p.tight ? <Callout tone="warn">{c.apTight}</Callout> : null}
            <div className="mt-3 flex flex-wrap items-center gap-3"><button onClick={() => build(course.id)} className={buttonClass.primary}>{c.plan}</button><span className="font-bold text-teal" role="status">{msg[course.id]}</span></div></> : null}</li>; })}</ul>}
    </Head>
  );
}
