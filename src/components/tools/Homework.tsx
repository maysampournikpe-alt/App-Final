"use client";
import { useMemo, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { diffDays, formatDay, isValidISO, today } from "@/lib/dates";
import { bucketOf, HOMEWORK_KEY, NO_ASSIGNMENTS, sortByDue, type Assignment, type Bucket } from "@/lib/homework";
import { useLang } from "@/lib/i18n";
import { useLocalDoc } from "@/lib/local-doc";
import { useCopy } from "@/lib/use-copy";
import { EmptyTrail } from "../art";
import { buttonClass, Field, inputClass, Page } from "../ui";

const copy = {
  en: {
    title: "Homework tracker", lead: "Everything due, by class, with the closest deadline first.",
    add: "Add assignment", what: "What is it?", whatPh: "Chapter 4 questions", cls: "Class", clsPh: "Biology", due: "Due",
    buckets: { overdue: "Overdue", today: "Due today", week: "This week", later: "Later", done: "Done" } as Record<Bucket, string>,
    all: "All classes", empty: "Nothing due. Add your first assignment above, or enjoy it.",
    emptyFilter: "Nothing for this class.", remove: "Remove", clearDone: "Clear finished", needTitle: "Write what it is.", needDate: "Pick a due date.",
    days: (n: number) => (n === 0 ? "today" : n === 1 ? "tomorrow" : n === -1 ? "yesterday" : n < 0 ? `${-n} days ago` : `in ${n} days`),
    mark: "Mark done", unmark: "Mark not done",
  },
  es: {
    title: "Registro de tarea", lead: "Todo lo que hay que entregar, por clase, con la fecha más cercana primero.",
    add: "Agregar tarea", what: "¿Qué es?", whatPh: "Preguntas del capítulo 4", cls: "Clase", clsPh: "Biología", due: "Fecha de entrega",
    buckets: { overdue: "Atrasadas", today: "Para hoy", week: "Esta semana", later: "Más adelante", done: "Terminadas" } as Record<Bucket, string>,
    all: "Todas las clases", empty: "No hay nada pendiente. Agrega tu primera tarea arriba, o disfruta el descanso.",
    emptyFilter: "No hay nada de esta clase.", remove: "Quitar", clearDone: "Borrar terminadas", needTitle: "Escribe qué es.", needDate: "Elige una fecha.",
    days: (n: number) => (n === 0 ? "hoy" : n === 1 ? "mañana" : n === -1 ? "ayer" : n < 0 ? `hace ${-n} días` : `en ${n} días`),
    mark: "Marcar como terminada", unmark: "Marcar como pendiente",
  },
};

const ORDER: Bucket[] = ["overdue", "today", "week", "later", "done"];

export function HomeworkTool() {
  const c = useCopy(copy);
  const lang = useLang();
  const [items, setItems] = useLocalDoc<Assignment[]>(HOMEWORK_KEY, NO_ASSIGNMENTS);
  const [title, setTitle] = useState("");
  const [cls, setCls] = useState("");
  const [due, setDue] = useState(today());
  const [err, setErr] = useState<"title" | "date" | null>(null);
  const [filter, setFilter] = useState("");

  const classes = useMemo(() => [...new Set(items.map((i) => i.cls).filter(Boolean))].sort(), [items]);
  const grouped = useMemo(() => {
    const out: Record<Bucket, Assignment[]> = { overdue: [], today: [], week: [], later: [], done: [] };
    for (const a of sortByDue(items)) if (!filter || a.cls === filter) out[bucketOf(a)].push(a);
    return out;
  }, [items, filter]);
  const shown = ORDER.reduce((n, b) => n + grouped[b].length, 0);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return setErr("title");
    if (!isValidISO(due)) return setErr("date");
    setErr(null);
    setItems([...items, { id: crypto.randomUUID(), title: title.trim(), cls: cls.trim(), due, done: false }]);
    setTitle("");
  };
  const toggle = (id: string) => setItems(items.map((a) => (a.id === id ? { ...a, done: !a.done } : a)));

  return (
    <Page wide>
      <h1 className="text-3xl sm:text-4xl">{c.title}</h1>
      <p className="mt-2 max-w-prose text-muted">{c.lead}</p>

      <form onSubmit={submit} className="guide-card mt-6 grid gap-x-4 p-5 sm:grid-cols-[2fr_1fr_1fr_auto] sm:items-start" noValidate>
        <Field label={c.what} error={err === "title" ? c.needTitle : null}>{(p) => <input {...p} value={title} onChange={(e) => setTitle(e.target.value)} placeholder={c.whatPh} className={inputClass} />}</Field>
        <Field label={c.cls}>{(p) => <input {...p} list="hw-classes" value={cls} onChange={(e) => setCls(e.target.value)} placeholder={c.clsPh} className={inputClass} />}</Field>
        <Field label={c.due} error={err === "date" ? c.needDate : null}>{(p) => <input {...p} type="date" value={due} onChange={(e) => setDue(e.target.value)} className={inputClass} />}</Field>
        <div className="sm:pt-7"><button className={buttonClass.primary}><Plus size={18} />{c.add}</button></div>
        <datalist id="hw-classes">{classes.map((k) => <option key={k} value={k} />)}</datalist>
      </form>

      {classes.length > 1 ? (
        <div className="mt-6 flex flex-wrap gap-2" role="group" aria-label={c.cls}>
          {["", ...classes].map((k) => (
            <button key={k || "all"} onClick={() => setFilter(k)} aria-pressed={filter === k}
              className={`rounded-full border-[1.5px] border-ink px-4 py-1.5 font-bold ${filter === k ? "bg-ink text-paper" : "bg-surface hover:bg-sunken"}`}>{k || c.all}</button>
          ))}
        </div>
      ) : null}

      {items.length === 0 ? (
        <div className="guide-card mt-8 flex max-w-xl items-center gap-5 p-5"><EmptyTrail className="h-24 w-36 shrink-0 text-ink" /><p className="text-lg">{c.empty}</p></div>
      ) : shown === 0 ? <p className="mt-8">{c.emptyFilter}</p> : (
        <div className="mt-8 space-y-8">
          {ORDER.filter((b) => grouped[b].length).map((b) => (
            <section key={b} aria-labelledby={`hw-${b}`}>
              <div className="flex items-baseline justify-between border-b-[1.5px] border-ink pb-1">
                <h2 id={`hw-${b}`} className={`text-2xl ${b === "overdue" ? "text-ruby" : ""}`}>{c.buckets[b]} <span className="text-base text-muted">({grouped[b].length})</span></h2>
                {b === "done" ? <button onClick={() => setItems(items.filter((a) => !a.done))} className="font-bold text-teal underline underline-offset-4">{c.clearDone}</button> : null}
              </div>
              <ul className="divide-y-2 divide-dotted divide-line">
                {grouped[b].map((a) => (
                  <li key={a.id} className="flex items-center gap-3 py-2.5">
                    <input type="checkbox" checked={a.done} onChange={() => toggle(a.id)} aria-label={`${a.done ? c.unmark : c.mark}: ${a.title}`} className="h-6 w-6 shrink-0 accent-[var(--c-teal)]" />
                    <div className="min-w-0 flex-1">
                      <p className={`font-bold ${a.done ? "text-muted line-through decoration-2" : ""}`}>{a.title}</p>
                      <p className="text-sm text-muted">{a.cls ? `${a.cls} · ` : ""}{formatDay(a.due, lang)} · {c.days(diffDays(today(), a.due))}</p>
                    </div>
                    <button onClick={() => setItems(items.filter((x) => x.id !== a.id))} aria-label={`${c.remove}: ${a.title}`} className="grid h-10 w-10 place-items-center rounded-md hover:bg-sunken"><Trash2 size={18} strokeWidth={1.75} /></button>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </Page>
  );
}
