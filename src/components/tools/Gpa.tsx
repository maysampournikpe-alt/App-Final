"use client";
import { useMemo, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { useLocalDoc } from "@/lib/local-doc";
import { gpa, LETTERS, parseCredits, type Course, type Letter, type Level } from "@/lib/gpa";
import { useCopy } from "@/lib/use-copy";
import { buttonClass, inputClass, Page } from "../ui";

const EMPTY: Course[] = [];

const copy = {
  en: {
    title: "GPA calculator",
    lead: "Add your classes and see your GPA two ways. Your school may count weights differently, so check your handbook.",
    weighted: "Weighted", unweighted: "Unweighted", now: "Now", ifPlan: "If you plan these", outOf: "scale",
    empty: "No classes yet. Add one below and your GPA shows up here.",
    name: "Class", grade: "Grade", credits: "Credits", level: "Type",
    levels: { regular: "Regular", honors: "Honors (+0.5)", ap: "AP or IB (+1)", dual: "Dual credit (+1)" } as Record<Level, string>,
    add: "Add class", addWhatIf: "Add as what-if", whatIf: "What-if", remove: "Remove",
    creditsHelp: "1 for a year, 0.5 for a semester", namePh: "Biology",
    whatIfNote: "What-if classes are ones you have not finished. They change the second number, not the first.",
    badCredits: "Credits must be a number above 0.",
    clear: "Clear all", sure: "Remove every class?", yes: "Yes, clear",
  },
  es: {
    title: "Calculadora de GPA",
    lead: "Agrega tus clases y mira tu GPA de dos maneras. Tu escuela puede contar los puntos extra distinto, así que revisa tu manual.",
    weighted: "Con peso", unweighted: "Sin peso", now: "Ahora", ifPlan: "Si llevas estas", outOf: "escala",
    empty: "Todavía no hay clases. Agrega una abajo y aquí aparece tu GPA.",
    name: "Clase", grade: "Calificación", credits: "Créditos", level: "Tipo",
    levels: { regular: "Regular", honors: "Honores (+0.5)", ap: "AP o IB (+1)", dual: "Crédito doble (+1)" } as Record<Level, string>,
    add: "Agregar clase", addWhatIf: "Agregar como \"qué pasaría si\"", whatIf: "Qué pasaría si", remove: "Quitar",
    creditsHelp: "1 si es el año completo, 0.5 si es un semestre", namePh: "Biología",
    whatIfNote: "Las clases de \"qué pasaría si\" son las que todavía no terminas. Cambian el segundo número, no el primero.",
    badCredits: "Los créditos deben ser un número mayor que 0.",
    clear: "Borrar todo", sure: "¿Quitar todas las clases?", yes: "Sí, borrar",
  },
};

const fmt = (n: number | null) => (n === null ? "–" : n.toFixed(2));

export function GpaTool() {
  const c = useCopy(copy);
  const [courses, setCourses] = useLocalDoc<Course[]>("gpa-courses", EMPTY);
  const [name, setName] = useState("");
  const [grade, setGrade] = useState<Letter>("A");
  const [credits, setCredits] = useState("1");
  const [level, setLevel] = useState<Level>("regular");
  const [error, setError] = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);

  const stats = useMemo(() => ({
    nowW: gpa(courses, { weighted: true, includePlanned: false }),
    nowU: gpa(courses, { weighted: false, includePlanned: false }),
    planW: gpa(courses, { weighted: true, includePlanned: true }),
    planU: gpa(courses, { weighted: false, includePlanned: true }),
  }), [courses]);
  const hasPlanned = courses.some((x) => x.planned);

  const add = (planned: boolean) => {
    const cr = parseCredits(credits);
    if (cr === null) return setError(true);
    setError(false);
    setCourses([...courses, { id: crypto.randomUUID(), name: name.trim() || (planned ? c.whatIf : "—"), grade, credits: cr, level, planned }]);
    setName("");
  };
  const update = (id: string, patch: Partial<Course>) => setCourses(courses.map((x) => (x.id === id ? { ...x, ...patch } : x)));

  return (
    <Page wide>
      <h1 className="text-3xl sm:text-4xl">{c.title}</h1>
      <p className="mt-2 max-w-prose text-muted">{c.lead}</p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2" aria-live="polite">
        <Score label={c.weighted} now={fmt(stats.nowW)} plan={hasPlanned ? fmt(stats.planW) : null} c={c} />
        <Score label={c.unweighted} now={fmt(stats.nowU)} plan={hasPlanned ? fmt(stats.planU) : null} c={c} />
      </div>
      {hasPlanned ? <p className="mt-3 max-w-prose text-sm text-muted">{c.whatIfNote}</p> : null}

      <section className="mt-8">
        {courses.length === 0 ? (
          <p className="guide-card max-w-xl p-5">{c.empty}</p>
        ) : (
          <ul className="divide-y-2 divide-dotted divide-line border-y-[1.5px] border-ink">
            {courses.map((x) => (
              <li key={x.id} className={`grid grid-cols-[1fr_auto] items-center gap-x-3 gap-y-2 py-3 sm:grid-cols-[1.4fr_6rem_5rem_11rem_auto_auto] ${x.planned ? "bg-sunken/60" : ""}`}>
                <label className="col-span-2 sm:col-span-1">
                  <span className="sr-only">{c.name}</span>
                  <input value={x.name} onChange={(e) => update(x.id, { name: e.target.value })} className={inputClass} />
                </label>
                <label>
                  <span className="sr-only">{c.grade}</span>
                  <select value={x.grade} onChange={(e) => update(x.id, { grade: e.target.value as Letter })} className={inputClass}>
                    {LETTERS.map((l) => <option key={l}>{l}</option>)}
                  </select>
                </label>
                <label>
                  <span className="sr-only">{c.credits}</span>
                  <input inputMode="decimal" value={x.credits} onChange={(e) => { const v = parseCredits(e.target.value); if (v !== null) update(x.id, { credits: v }); }} className={inputClass} />
                </label>
                <label className="col-span-2 sm:col-span-1">
                  <span className="sr-only">{c.level}</span>
                  <select value={x.level} onChange={(e) => update(x.id, { level: e.target.value as Level })} className={inputClass}>
                    {(Object.keys(c.levels) as Level[]).map((l) => <option key={l} value={l}>{c.levels[l]}</option>)}
                  </select>
                </label>
                <label className="flex items-center gap-2 font-bold">
                  <input type="checkbox" checked={x.planned} onChange={(e) => update(x.id, { planned: e.target.checked })} className="h-5 w-5 accent-[var(--c-teal)]" />
                  {c.whatIf}
                </label>
                <button onClick={() => setCourses(courses.filter((y) => y.id !== x.id))} aria-label={`${c.remove}: ${x.name}`} className="grid h-10 w-10 place-items-center rounded-md hover:bg-sunken">
                  <Trash2 size={18} strokeWidth={1.75} />
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <form onSubmit={(e) => { e.preventDefault(); add(false); }} className="guide-card mt-6 grid gap-4 p-5 sm:grid-cols-[1.4fr_6rem_6rem_11rem]">
        <label><span className="block font-bold">{c.name}</span><input value={name} onChange={(e) => setName(e.target.value)} placeholder={c.namePh} className={`${inputClass} mt-1`} /></label>
        <label><span className="block font-bold">{c.grade}</span>
          <select value={grade} onChange={(e) => setGrade(e.target.value as Letter)} className={`${inputClass} mt-1`}>{LETTERS.map((l) => <option key={l}>{l}</option>)}</select></label>
        <label><span className="block font-bold">{c.credits}</span>
          <input inputMode="decimal" value={credits} onChange={(e) => setCredits(e.target.value)} aria-invalid={error || undefined} className={`${inputClass} mt-1`} /></label>
        <label><span className="block font-bold">{c.level}</span>
          <select value={level} onChange={(e) => setLevel(e.target.value as Level)} className={`${inputClass} mt-1`}>
            {(Object.keys(c.levels) as Level[]).map((l) => <option key={l} value={l}>{c.levels[l]}</option>)}</select></label>
        <p className="text-sm text-muted sm:col-span-4">{error ? <b role="alert" className="text-ruby">{c.badCredits}</b> : c.creditsHelp}</p>
        <div className="flex flex-wrap gap-3 sm:col-span-4">
          <button className={buttonClass.primary}><Plus size={18} />{c.add}</button>
          <button type="button" onClick={() => add(true)} className={buttonClass.quiet}>{c.addWhatIf}</button>
        </div>
      </form>

      {courses.length ? (
        <div className="mt-6">
          {confirmClear ? (
            <span className="flex flex-wrap items-center gap-3"><b>{c.sure}</b>
              <button onClick={() => { setCourses([]); setConfirmClear(false); }} className={buttonClass.danger}>{c.yes}</button>
              <button onClick={() => setConfirmClear(false)} className={buttonClass.quiet}>✕</button></span>
          ) : <button onClick={() => setConfirmClear(true)} className="font-bold text-teal underline underline-offset-4">{c.clear}</button>}
        </div>
      ) : null}
    </Page>
  );
}

function Score({ label, now, plan, c }: { label: string; now: string; plan: string | null; c: typeof copy.en }) {
  return (
    <div className="guide-card p-5">
      <h2 className="text-xl">{label}</h2>
      <div className="mt-2 flex flex-wrap items-end gap-x-8 gap-y-2">
        <p><span className="block text-sm text-muted">{c.now}</span><span className="font-display text-5xl font-semibold tabular-nums">{now}</span></p>
        {plan ? <p><span className="block text-sm text-muted">{c.ifPlan}</span><span className="font-display text-5xl font-semibold tabular-nums text-teal">{plan}</span></p> : null}
      </div>
    </div>
  );
}
