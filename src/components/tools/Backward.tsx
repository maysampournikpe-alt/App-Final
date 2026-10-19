"use client";
import { useMemo, useState } from "react";
import { Check, ListPlus, Plus, Trash2 } from "lucide-react";
import { diffDays, formatDay, isValidISO, today } from "@/lib/dates";
import { DEFAULT_STEPS, planBackward, type PlanStep } from "@/lib/backward";
import { HOMEWORK_KEY, NO_ASSIGNMENTS, type Assignment } from "@/lib/homework";
import { useLang } from "@/lib/i18n";
import { useLocalDoc } from "@/lib/local-doc";
import { useCopy } from "@/lib/use-copy";
import { CheckpointTrail } from "../cards";
import { buttonClass, Field, inputClass, Page } from "../ui";

const copy = {
  en: {
    title: "Backward planner", lead: "Give it a due date. It works backward and tells you what to finish and when.",
    project: "Project", projectPh: "History research paper", due: "Due date", cls: "Class (optional)", clsPh: "World History",
    steps: "Steps", stepsHelp: "Change, remove or add steps. A bigger weight means more time.", weight: "Time", stepName: "Step",
    addStep: "Add step", resetSteps: "Back to the starter steps", needName: "Name the project.", needDate: "Pick a due date.", past: "That date has passed. Pick one that is still ahead.",
    plan: "Your plan", daysLeft: (n: number) => `${n} day${n === 1 ? "" : "s"} until it is due`, dueToday: "Due today. Do the steps in order and keep going.",
    finishBy: "finish by", addToHw: "Add these steps to my homework tracker", added: "Added to your homework tracker",
    remove: "Remove step",
  },
  es: {
    title: "Planeador hacia atrás", lead: "Dale una fecha de entrega. Él trabaja hacia atrás y te dice qué terminar y cuándo.",
    project: "Proyecto", projectPh: "Trabajo de investigación de historia", due: "Fecha de entrega", cls: "Clase (opcional)", clsPh: "Historia Mundial",
    steps: "Pasos", stepsHelp: "Cambia, quita o agrega pasos. Un peso más grande significa más tiempo.", weight: "Tiempo", stepName: "Paso",
    addStep: "Agregar paso", resetSteps: "Volver a los pasos de inicio", needName: "Ponle nombre al proyecto.", needDate: "Elige una fecha de entrega.", past: "Esa fecha ya pasó. Elige una que todavía no llegue.",
    plan: "Tu plan", daysLeft: (n: number) => `Faltan ${n} día${n === 1 ? "" : "s"} para entregarlo`, dueToday: "Es para hoy. Haz los pasos en orden y sigue adelante.",
    finishBy: "terminar para el", addToHw: "Agregar estos pasos a mi registro de tarea", added: "Se agregaron a tu registro de tarea",
    remove: "Quitar paso",
  },
};

export function BackwardTool() {
  const c = useCopy(copy);
  const lang = useLang();
  const starter = (l: "en" | "es"): PlanStep[] => DEFAULT_STEPS[l].map(([label, weight], i) => ({ id: `s${i}`, label, weight }));
  const [project, setProject] = useState("");
  const [cls, setCls] = useState("");
  const [due, setDue] = useState("");
  const [steps, setSteps] = useState<PlanStep[]>(() => starter(lang));
  const [err, setErr] = useState<"name" | "date" | "past" | null>(null);
  const [made, setMade] = useState<string | null>(null);
  const [added, setAdded] = useState(false);
  const [homework, setHomework] = useLocalDoc<Assignment[]>(HOMEWORK_KEY, NO_ASSIGNMENTS);

  const valid = isValidISO(due) && diffDays(today(), due) >= 0;
  const dated = useMemo(() => (made && valid ? planBackward(steps.filter((s) => s.label.trim()), today(), due) : []), [made, valid, steps, due]);

  const build = (e: React.FormEvent) => {
    e.preventDefault();
    if (!project.trim()) return setErr("name");
    if (!isValidISO(due)) return setErr("date");
    if (diffDays(today(), due) < 0) return setErr("past");
    setErr(null); setAdded(false); setMade(project.trim());
  };
  const addToHomework = () => {
    const rows: Assignment[] = dated.map((s) => ({ id: crypto.randomUUID(), title: `${made}: ${s.label}`, cls: cls.trim(), due: s.date, done: false }));
    setHomework([...homework, ...rows]);
    setAdded(true);
  };
  const span = valid ? diffDays(today(), due) : 0;

  return (
    <Page wide>
      <h1 className="text-3xl sm:text-4xl">{c.title}</h1>
      <p className="mt-2 max-w-prose text-muted">{c.lead}</p>

      <form onSubmit={build} noValidate className="mt-6 max-w-3xl">
        <div className="grid gap-x-4 sm:grid-cols-3">
          <Field label={c.project} error={err === "name" ? c.needName : null}>{(p) => <input {...p} value={project} onChange={(e) => setProject(e.target.value)} placeholder={c.projectPh} className={inputClass} />}</Field>
          <Field label={c.due} error={err === "date" ? c.needDate : err === "past" ? c.past : null}>{(p) => <input {...p} type="date" min={today()} value={due} onChange={(e) => { setDue(e.target.value); setMade(null); }} className={inputClass} />}</Field>
          <Field label={c.cls}>{(p) => <input {...p} value={cls} onChange={(e) => setCls(e.target.value)} placeholder={c.clsPh} className={inputClass} />}</Field>
        </div>

        <fieldset className="mb-5">
          <legend className="font-display text-xl font-semibold">{c.steps}</legend>
          <p className="mb-3 text-sm text-muted">{c.stepsHelp}</p>
          <ul className="space-y-2">
            {steps.map((s, i) => (
              <li key={s.id} className="flex items-center gap-2">
                <label className="min-w-0 flex-1"><span className="sr-only">{c.stepName} {i + 1}</span>
                  <input value={s.label} onChange={(e) => setSteps(steps.map((x) => (x.id === s.id ? { ...x, label: e.target.value } : x)))} className={inputClass} /></label>
                <label className="w-24 shrink-0"><span className="sr-only">{c.weight}</span>
                  <select value={s.weight} onChange={(e) => setSteps(steps.map((x) => (x.id === s.id ? { ...x, weight: Number(e.target.value) } : x)))} className={inputClass}>
                    {[1, 2, 3, 4, 5].map((w) => <option key={w} value={w}>{"▮".repeat(w)}</option>)}
                  </select></label>
                <button type="button" onClick={() => setSteps(steps.filter((x) => x.id !== s.id))} aria-label={`${c.remove}: ${s.label}`} className="grid h-10 w-10 shrink-0 place-items-center rounded-md hover:bg-sunken"><Trash2 size={18} strokeWidth={1.75} /></button>
              </li>
            ))}
          </ul>
          <div className="mt-3 flex flex-wrap gap-4">
            <button type="button" onClick={() => setSteps([...steps, { id: crypto.randomUUID(), label: "", weight: 2 }])} className={buttonClass.quiet}><Plus size={18} />{c.addStep}</button>
            <button type="button" onClick={() => setSteps(starter(lang))} className="font-bold text-teal underline underline-offset-4">{c.resetSteps}</button>
          </div>
        </fieldset>
        <button className={buttonClass.primary}>{c.plan}</button>
      </form>

      {dated.length ? (
        <section className="mt-10 max-w-2xl" aria-live="polite">
          <h2 className="text-2xl sm:text-3xl">{made}</h2>
          <p className="mb-6 text-muted">{span === 0 ? c.dueToday : c.daysLeft(span)} · {formatDay(due, lang)}</p>
          <CheckpointTrail steps={dated.map((s) => `${s.label} (${c.finishBy} ${formatDay(s.date, lang)})`)} done={0} />
          <div className="mt-6 flex flex-wrap items-center gap-4">
            <button onClick={addToHomework} disabled={added} className={buttonClass.secondary}>{added ? <Check size={18} /> : <ListPlus size={18} />}{added ? c.added : c.addToHw}</button>
          </div>
        </section>
      ) : null}
    </Page>
  );
}
