"use client";
import { useState } from "react";
import { Plus, Star, Trash2 } from "lucide-react";
import { today } from "@/lib/dates";
import { useLocalDoc } from "@/lib/local-doc";
import { canAddTop, MAX_TOP, NO_TASKS, quadrantOf, QUADRANTS, TASKS_KEY, topTasks, type Quadrant, type Task } from "@/lib/tasks";
import { useCopy } from "@/lib/use-copy";
import { EmptyTrail } from "../art";
import { buttonClass, inputClass, Page } from "../ui";

const copy = {
  en: {
    todoTitle: "Daily to-do list", todoLead: "Everything you need to do, with up to three top priorities for today.",
    matrixTitle: "Eisenhower matrix", matrixLead: "Sort your tasks by what is urgent and what is important, then do the top left first.",
    add: "Add task", ph: "Finish the lab report", urgent: "Urgent", important: "Important", empty: "Nothing on the list. Add your first task, or enjoy it.",
    top: "Top priorities today", topHelp: (n: number) => `Pick up to ${n} with the star.`, topNone: "No priorities picked yet.", others: "Everything else", done: "Done", clear: "Clear finished",
    star: "Make a top priority", unstar: "Remove from top priorities", full: `You already have ${MAX_TOP} top priorities. Finish one or un-star it first.`, remove: "Remove", mark: "Mark done", unmark: "Mark not done",
    q: { do: "Do first", plan: "Schedule it", quick: "Do it quickly", drop: "Drop or limit" } as Record<Quadrant, string>,
    qHelp: { do: "Urgent and important", plan: "Important, not urgent", quick: "Urgent, not important", drop: "Neither" } as Record<Quadrant, string>,
    flip: (k: string) => `Switch ${k}`, boxEmpty: "Nothing here.",
  },
  es: {
    todoTitle: "Lista de pendientes", todoLead: "Todo lo que tienes que hacer, con hasta tres prioridades para hoy.",
    matrixTitle: "Matriz de Eisenhower", matrixLead: "Ordena tus tareas por lo urgente y lo importante, y haz primero lo de arriba a la izquierda.",
    add: "Agregar tarea", ph: "Terminar el reporte de laboratorio", urgent: "Urgente", important: "Importante", empty: "No hay nada en la lista. Agrega tu primera tarea, o disfruta el descanso.",
    top: "Prioridades de hoy", topHelp: (n: number) => `Elige hasta ${n} con la estrella.`, topNone: "Todavía no elegiste prioridades.", others: "Todo lo demás", done: "Terminadas", clear: "Borrar terminadas",
    star: "Hacer prioridad", unstar: "Quitar de las prioridades", full: `Ya tienes ${MAX_TOP} prioridades. Termina una o quítale la estrella primero.`, remove: "Quitar", mark: "Marcar como terminada", unmark: "Marcar como pendiente",
    q: { do: "Hacer primero", plan: "Programarla", quick: "Hacerla rápido", drop: "Dejar o limitar" } as Record<Quadrant, string>,
    qHelp: { do: "Urgente e importante", plan: "Importante, no urgente", quick: "Urgente, no importante", drop: "Ninguna de las dos" } as Record<Quadrant, string>,
    flip: (k: string) => `Cambiar ${k}`, boxEmpty: "No hay nada aquí.",
  },
};
type C = typeof copy.en;

export function TasksTool({ view }: { view: "todo" | "matrix" }) {
  const c = useCopy(copy);
  const [tasks, setTasks] = useLocalDoc<Task[]>(TASKS_KEY, NO_TASKS);
  const [title, setTitle] = useState("");
  const [urgent, setUrgent] = useState(false);
  const [important, setImportant] = useState(false);
  const [warn, setWarn] = useState(false);

  const add = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    setTasks((p) => [...p, { id: crypto.randomUUID(), title: title.trim(), done: false, urgent, important, top: false, created: today() }]);
    setTitle(""); setUrgent(false); setImportant(false);
  };
  const patch = (id: string, change: Partial<Task>) => setTasks((p) => p.map((t) => (t.id === id ? { ...t, ...change } : t)));
  const toggleTop = (t: Task) => {
    if (!t.top && !canAddTop(tasks)) return setWarn(true);
    setWarn(false); patch(t.id, { top: !t.top });
  };
  const remove = (id: string) => setTasks((p) => p.filter((t) => t.id !== id));

  const open = tasks.filter((t) => !t.done), finished = tasks.filter((t) => t.done);

  return (
    <Page wide>
      <h1 className="text-3xl sm:text-4xl">{view === "todo" ? c.todoTitle : c.matrixTitle}</h1>
      <p className="mt-2 max-w-prose text-muted">{view === "todo" ? c.todoLead : c.matrixLead}</p>

      <form onSubmit={add} className="guide-card mt-6 p-5">
        <div className="flex flex-wrap items-end gap-3">
          <label className="min-w-0 flex-1"><span className="sr-only">{c.add}</span>
            <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder={c.ph} maxLength={120} className={inputClass} /></label>
          <button className={buttonClass.primary}><Plus size={18} />{c.add}</button>
        </div>
        <div className="mt-3 flex flex-wrap gap-x-6 gap-y-2">
          <label className="flex items-center gap-2 font-bold"><input type="checkbox" checked={urgent} onChange={(e) => setUrgent(e.target.checked)} className="h-5 w-5 accent-[var(--c-teal)]" />{c.urgent}</label>
          <label className="flex items-center gap-2 font-bold"><input type="checkbox" checked={important} onChange={(e) => setImportant(e.target.checked)} className="h-5 w-5 accent-[var(--c-teal)]" />{c.important}</label>
        </div>
      </form>

      {tasks.length === 0 ? (
        <div className="guide-card mt-8 flex max-w-xl items-center gap-5 p-5"><EmptyTrail className="h-24 w-36 shrink-0 text-ink" /><p className="text-lg">{c.empty}</p></div>
      ) : view === "todo" ? (
        <>
          <section className="mt-8" aria-labelledby="top-h">
            <h2 id="top-h" className="border-b-[1.5px] border-ink pb-1 text-2xl">{c.top}</h2>
            <p className="mt-1 text-sm text-muted">{c.topHelp(MAX_TOP)}</p>
            {warn ? <p role="alert" className="mt-2 font-bold text-ruby">{c.full}</p> : null}
            <ul className="mt-2">{topTasks(tasks).length ? topTasks(tasks).map((t) => <Row key={t.id} t={t} c={c} patch={patch} toggleTop={toggleTop} remove={remove} />) : <li className="py-2 text-muted">{c.topNone}</li>}</ul>
          </section>
          <section className="mt-8" aria-labelledby="rest-h">
            <h2 id="rest-h" className="border-b-[1.5px] border-ink pb-1 text-2xl">{c.others}</h2>
            <ul className="divide-y-2 divide-dotted divide-line">{open.filter((t) => !t.top).map((t) => <Row key={t.id} t={t} c={c} patch={patch} toggleTop={toggleTop} remove={remove} />)}</ul>
          </section>
        </>
      ) : (
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {QUADRANTS.map((q) => {
            const items = open.filter((t) => quadrantOf(t) === q);
            return (
              <section key={q} className={`guide-card p-4 ${q === "do" ? "border-l-[6px] border-l-ruby" : ""}`} aria-labelledby={`q-${q}`}>
                <h2 id={`q-${q}`} className="text-xl">{c.q[q]}</h2>
                <p className="text-sm text-muted">{c.qHelp[q]}</p>
                <ul className="mt-2 divide-y-2 divide-dotted divide-line">
                  {items.length ? items.map((t) => (
                    <li key={t.id} className="flex flex-wrap items-center gap-2 py-2">
                      <input type="checkbox" checked={t.done} onChange={() => patch(t.id, { done: true })} aria-label={`${c.mark}: ${t.title}`} className="h-5 w-5 accent-[var(--c-teal)]" />
                      <span className="min-w-0 flex-1 font-bold">{t.title}</span>
                      <button onClick={() => patch(t.id, { urgent: !t.urgent })} aria-pressed={t.urgent} className={`rounded-full border-[1.5px] border-ink px-2 text-xs font-bold ${t.urgent ? "bg-ruby text-on-ruby" : ""}`} title={c.flip(c.urgent)}>{c.urgent}</button>
                      <button onClick={() => patch(t.id, { important: !t.important })} aria-pressed={t.important} className={`rounded-full border-[1.5px] border-ink px-2 text-xs font-bold ${t.important ? "bg-teal text-on-teal" : ""}`} title={c.flip(c.important)}>{c.important}</button>
                    </li>
                  )) : <li className="py-2 text-muted">{c.boxEmpty}</li>}
                </ul>
              </section>
            );
          })}
        </div>
      )}

      {finished.length ? (
        <section className="mt-8" aria-labelledby="done-h">
          <div className="flex items-baseline justify-between border-b-[1.5px] border-ink pb-1">
            <h2 id="done-h" className="text-2xl">{c.done} <span className="text-base text-muted">({finished.length})</span></h2>
            <button onClick={() => setTasks((p) => p.filter((t) => !t.done))} className="font-bold text-teal underline underline-offset-4">{c.clear}</button>
          </div>
          <ul className="divide-y-2 divide-dotted divide-line">{finished.map((t) => <Row key={t.id} t={t} c={c} patch={patch} toggleTop={toggleTop} remove={remove} />)}</ul>
        </section>
      ) : null}
    </Page>
  );
}

function Row({ t, c, patch, toggleTop, remove }: { t: Task; c: C; patch: (id: string, p: Partial<Task>) => void; toggleTop: (t: Task) => void; remove: (id: string) => void }) {
  return (
    <li className="flex items-center gap-3 py-2.5">
      <input type="checkbox" checked={t.done} onChange={() => patch(t.id, { done: !t.done, top: t.done ? t.top : false })} aria-label={`${t.done ? c.unmark : c.mark}: ${t.title}`} className="h-6 w-6 shrink-0 accent-[var(--c-teal)]" />
      <p className={`min-w-0 flex-1 font-bold ${t.done ? "text-muted line-through decoration-2" : ""}`}>{t.title}</p>
      {!t.done ? (
        <button onClick={() => toggleTop(t)} aria-pressed={t.top} aria-label={`${t.top ? c.unstar : c.star}: ${t.title}`} title={t.top ? c.unstar : c.star} className="grid h-10 w-10 shrink-0 place-items-center rounded-xl hover:bg-sunken">
          <Star size={20} strokeWidth={1.75} className={t.top ? "fill-marigold text-ink" : ""} />
        </button>
      ) : null}
      <button onClick={() => remove(t.id)} aria-label={`${c.remove}: ${t.title}`} className="grid h-10 w-10 shrink-0 place-items-center rounded-xl hover:bg-sunken"><Trash2 size={18} strokeWidth={1.75} /></button>
    </li>
  );
}
