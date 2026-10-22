"use client";
import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { diffDays, formatDay, isValidISO, today } from "@/lib/dates";
import { HOMEWORK_KEY, NO_ASSIGNMENTS, type Assignment } from "@/lib/homework";
import { useLang } from "@/lib/i18n";
import { useLocalDoc } from "@/lib/local-doc";
import { autoSchedule, spreadStudy, type PlanTask, type Session, type StudyTest } from "@/lib/planner";
import { dayIndex, FREE_KEY, DEFAULT_FREE } from "@/lib/schedule";
import { NO_TASKS, TASKS_KEY, type Task } from "@/lib/tasks";
import { useCopy } from "@/lib/use-copy";
import { buttonClass, inputClass } from "../ui";
import { Callout, Empty, Head } from "./shared";

const copy = {
  en: {
    freeH: "Free study minutes each day", freeLead: "How many minutes can you really study each day? Be honest. Less is better than a plan you will not follow.", days: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"], min: "minutes",
    asTitle: "Auto schedule", asLead: "Add what you need to do and how long it will take. You get a week built around your free time, with the earliest deadline first.",
    task: "Task", taskPh: "Read chapter 4", mins: "Minutes needed", due: "Due date (optional)", add: "Add task", needTask: "Write the task.", needMin: "Minutes must be between 5 and 600.", remove: "Remove", build: "Days to plan", sessionsH: "Your plan", noPlan: "Add a task to see your plan.", unH: "These did not fit", noTime: "Not enough free time before it is due.", overdue: "Already past its due date.", allFit: "Everything fits. Nice.", total: (n: number) => `${n} minutes planned`, fromHw: "Add my homework", fromHwDone: "Homework added.", shortMsg: "Try adding more free minutes above, or ask your teacher for more time on the biggest one.",
    spTitle: "Smart study planner", spLead: "Enter your test dates. You get study sessions spread over the days before each test, not crammed into the night before.", test: "Test or quiz", testPh: "Biology unit 3", date: "Test date", addTest: "Add test", needTest: "Write the test name.", needDate: "Pick a date in the future.", sessionsFor: "Sessions", shortH: "Not enough days for", shortNote: (n: number) => `${n} minutes still missing. Add free minutes, or start earlier next time.`, todoBtn: "Add today's sessions to my to-do list", todoDone: "Added to your to-do list.", noToday: "No sessions today.", spNote: "Short sessions on many days work better than one long night, because your brain needs time between them.",
    cuTitle: "Catch-up plan", cuLead: "Behind? Take a breath. This turns your late and soon-due homework into a plan you can really do.", cuNone: "You are not behind on anything. Nice work.", lateH: "Late", soonH: "Due in the next 3 days", cuSteps: ["Do the oldest late item first. Ask your teacher if late work still counts. Most will take it.", "Work in short blocks, 25 minutes with a 5 minute break.", "After each one, check it off in the Homework tracker.", "Tell a teacher or counselor if you are more than a week behind. Asking early is a strength."], daysLate: (n: number) => `${n} ${n === 1 ? "day" : "days"} late`, dueIn: (n: number) => (n === 0 ? "due today" : `due in ${n} ${n === 1 ? "day" : "days"}`), cuHint: "Your plan for today",
    pkTitle: "Packing lists", pkLead: "For tournaments, camps and trips. Start from a list, change it, and check things off as you pack.", trip: "Trip type", items: "Items", addItem: "Add item", itemPh: "Phone charger", packed: (a: number, b: number) => `${a} of ${b} packed`, reset: "Uncheck all", kinds: { tournament: "Tournament or meet", camp: "Camp", trip: "Overnight trip", day: "Day trip" }, lists: {
      tournament: ["Uniform and spare uniform", "Shoes or gear", "Water bottle", "Snacks", "Permission slip", "Phone charger", "Cash for entry or food"], camp: ["Clothes for each day", "Sunscreen", "Water bottle", "Toiletries", "Medicines (with a parent's note)", "Sleeping bag", "Emergency contact card"], trip: ["Clothes and pajamas", "Toothbrush", "Charger", "Medicines", "ID or school card", "Snacks", "Book or something to do"], day: ["Water", "Snacks", "Sunscreen", "Hat", "Phone and charger", "Cash", "Light jacket"] },
  },
  es: {
    freeH: "Minutos libres de estudio cada día", freeLead: "¿Cuántos minutos puedes estudiar de verdad cada día? Sé honesto. Es mejor poco que un plan que no vas a seguir.", days: ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"], min: "minutos",
    asTitle: "Horario automático", asLead: "Agrega lo que tienes que hacer y cuánto tardará. Recibes una semana armada con tu tiempo libre, primero la fecha más cercana.",
    task: "Tarea", taskPh: "Leer el capítulo 4", mins: "Minutos necesarios", due: "Fecha de entrega (opcional)", add: "Agregar tarea", needTask: "Escribe la tarea.", needMin: "Los minutos deben estar entre 5 y 600.", remove: "Quitar", build: "Días a planear", sessionsH: "Tu plan", noPlan: "Agrega una tarea para ver tu plan.", unH: "Estas no cupieron", noTime: "No hay suficiente tiempo libre antes de la entrega.", overdue: "Ya pasó la fecha de entrega.", allFit: "Todo cabe. Muy bien.", total: (n: number) => `${n} minutos planeados`, fromHw: "Agregar mi tarea", fromHwDone: "Tarea agregada.", shortMsg: "Prueba agregar más minutos libres arriba, o pide más tiempo al maestro para la más grande.",
    spTitle: "Planeador de estudio", spLead: "Escribe las fechas de tus exámenes. Recibes sesiones de estudio repartidas en los días anteriores, no todo la noche antes.", test: "Examen o quiz", testPh: "Biología unidad 3", date: "Fecha del examen", addTest: "Agregar examen", needTest: "Escribe el nombre del examen.", needDate: "Elige una fecha futura.", sessionsFor: "Sesiones", shortH: "No hay suficientes días para", shortNote: (n: number) => `Todavía faltan ${n} minutos. Agrega minutos libres, o empieza antes la próxima vez.`, todoBtn: "Agregar las sesiones de hoy a mis pendientes", todoDone: "Agregado a tus pendientes.", noToday: "Hoy no hay sesiones.", spNote: "Sesiones cortas en muchos días funcionan mejor que una noche larga, porque tu cerebro necesita tiempo entre ellas.",
    cuTitle: "Plan para ponerte al día", cuLead: "¿Atrasado? Respira. Esto convierte tu tarea atrasada y la que vence pronto en un plan que sí puedes hacer.", cuNone: "No estás atrasado en nada. Buen trabajo.", lateH: "Atrasadas", soonH: "Vencen en los próximos 3 días", cuSteps: ["Haz primero lo más viejo. Pregunta al maestro si aún cuenta la tarea tarde. La mayoría la recibe.", "Trabaja en bloques cortos, 25 minutos con 5 de descanso.", "Al terminar cada una, márcala en el Registro de tarea.", "Dile a un maestro o consejero si llevas más de una semana atrasado. Pedir ayuda a tiempo es una fortaleza."], daysLate: (n: number) => `${n} ${n === 1 ? "día" : "días"} de atraso`, dueIn: (n: number) => (n === 0 ? "vence hoy" : `vence en ${n} ${n === 1 ? "día" : "días"}`), cuHint: "Tu plan para hoy",
    pkTitle: "Listas de equipaje", pkLead: "Para torneos, campamentos y viajes. Empieza con una lista, cámbiala y marca lo que ya empacaste.", trip: "Tipo de viaje", items: "Cosas", addItem: "Agregar", itemPh: "Cargador del celular", packed: (a: number, b: number) => `${a} de ${b} empacadas`, reset: "Desmarcar todo", kinds: { tournament: "Torneo o competencia", camp: "Campamento", trip: "Viaje con noche", day: "Viaje de un día" }, lists: {
      tournament: ["Uniforme y uno de repuesto", "Zapatos o equipo", "Botella de agua", "Bocadillos", "Permiso firmado", "Cargador del celular", "Efectivo para entrada o comida"], camp: ["Ropa para cada día", "Protector solar", "Botella de agua", "Artículos de aseo", "Medicinas (con nota de un padre)", "Bolsa de dormir", "Tarjeta de contacto de emergencia"], trip: ["Ropa y pijama", "Cepillo de dientes", "Cargador", "Medicinas", "Identificación o credencial escolar", "Bocadillos", "Un libro o algo que hacer"], day: ["Agua", "Bocadillos", "Protector solar", "Gorra", "Celular y cargador", "Efectivo", "Chamarra ligera"] },
  },
};
type C = typeof copy.en;

export function FreeTimeEditor({ c, free, setFree }: { c: Pick<C, "freeH" | "freeLead" | "days" | "min">; free: number[]; setFree: (f: number[]) => void }) {
  return (
    <section className="guide-card mt-5 p-5"><h2 className="text-xl">{c.freeH}</h2><p className="text-muted">{c.freeLead}</p>
      <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">{c.days.map((d, i) => (
        <label key={d}><span className="block font-bold">{d}</span><input type="number" min={0} max={600} step={15} value={free[i]} onChange={(e) => setFree(free.map((x, j) => (j === i ? Math.max(0, Math.min(600, Number(e.target.value) || 0)) : x)))} aria-label={`${d} ${c.min}`} className={`${inputClass} mt-1`} /></label>))}</div></section>
  );
}

const useFree = () => {
  const [free, setFree] = useLocalDoc<number[]>(FREE_KEY, DEFAULT_FREE);
  const cap = (d: string) => free[dayIndex(d)] ?? 0;
  return { free, setFree, cap };
};

const byDay = (sessions: Session[]) => {
  const m = new Map<string, Session[]>();
  sessions.forEach((s) => m.set(s.date, [...(m.get(s.date) ?? []), s]));
  return [...m.entries()].sort((a, b) => a[0].localeCompare(b[0]));
};

type AutoTask = PlanTask & { due: string | null };
const NO_AUTO: AutoTask[] = [];
export function AutoScheduleTool() {
  const c = useCopy(copy);
  const lang = useLang();
  const { free, setFree, cap } = useFree();
  const [tasks, setTasks] = useLocalDoc<AutoTask[]>("auto-tasks", NO_AUTO);
  const [homework] = useLocalDoc<Assignment[]>(HOMEWORK_KEY, NO_ASSIGNMENTS);
  const [f, setF] = useState({ title: "", minutes: "30", due: "" });
  const [days, setDays] = useState(7);
  const [err, setErr] = useState<string | null>(null);
  const [note, setNote] = useState<string | null>(null);
  const now = today();
  const res = autoSchedule(tasks, cap, now, days);
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const m = Number(f.minutes);
    if (!f.title.trim()) return setErr(c.needTask);
    if (!Number.isFinite(m) || m < 5 || m > 600) return setErr(c.needMin);
    setErr(null);
    setTasks((p) => [...p, { id: crypto.randomUUID(), title: f.title.trim(), minutes: Math.round(m), due: f.due && isValidISO(f.due) ? f.due : null }]);
    setF({ ...f, title: "" });
  };
  const importHw = () => {
    setTasks((p) => [...p, ...homework.filter((h) => !h.done && !p.some((t) => t.title === h.title)).slice(0, 20).map((h) => ({ id: crypto.randomUUID(), title: h.cls ? `${h.title} (${h.cls})` : h.title, minutes: 30, due: h.due }))]);
    setNote(c.fromHwDone);
  };
  return (
    <Head title={c.asTitle} lead={c.asLead} wide>
      <FreeTimeEditor c={c} free={free} setFree={setFree} />
      <form onSubmit={submit} className="guide-card mt-5 grid gap-x-4 gap-y-3 p-5 sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_auto] lg:items-end" noValidate>
        <label><span className="block font-bold">{c.task}</span><input value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} placeholder={c.taskPh} maxLength={80} className={`${inputClass} mt-1`} /></label>
        <label><span className="block font-bold">{c.mins}</span><input type="number" min={5} max={600} value={f.minutes} onChange={(e) => setF({ ...f, minutes: e.target.value })} className={`${inputClass} mt-1`} /></label>
        <label><span className="block font-bold">{c.due}</span><input type="date" value={f.due} onChange={(e) => setF({ ...f, due: e.target.value })} className={`${inputClass} mt-1`} /></label>
        <button className={buttonClass.primary}><Plus size={18} />{c.add}</button>
        {err ? <p role="alert" className="font-bold text-ruby sm:col-span-2 lg:col-span-4">{err}</p> : null}
      </form>
      <div className="mt-3 flex flex-wrap items-center gap-4">
        {homework.some((h) => !h.done) ? <button onClick={importHw} className={buttonClass.secondary}>{c.fromHw}</button> : null}
        <label className="flex items-center gap-2 font-bold">{c.build}<select value={days} onChange={(e) => setDays(Number(e.target.value))} className="rounded-md border-[1.5px] border-ink bg-surface px-2 py-1.5">{[7, 14].map((n) => <option key={n} value={n}>{n}</option>)}</select></label>
        <span className="font-bold text-teal" role="status">{note}</span></div>
      {tasks.length ? <ul className="mt-4 divide-y-2 divide-dotted divide-line">{tasks.map((t) => <li key={t.id} className="flex items-center gap-3 py-2"><p className="min-w-0 flex-1"><span className="font-bold">{t.title}</span> <span className="text-muted">· {t.minutes} {c.min}{t.due ? ` · ${formatDay(t.due, lang)}` : ""}</span></p>
        <button onClick={() => setTasks((p) => p.filter((x) => x.id !== t.id))} aria-label={`${c.remove}: ${t.title}`} className="grid h-10 w-10 place-items-center rounded-md hover:bg-sunken"><Trash2 size={18} /></button></li>)}</ul> : null}
      <h2 className="mt-8 border-b-[1.5px] border-ink pb-1 text-2xl">{c.sessionsH}</h2>
      {res.sessions.length === 0 && res.unscheduled.length === 0 ? <Empty>{c.noPlan}</Empty> : (
        <>
          <p className="mt-2 font-bold text-teal">{c.total(res.sessions.reduce((n, s) => n + s.minutes, 0))}</p>
          <div className="mt-3 grid gap-3 md:grid-cols-2 lg:grid-cols-3">{byDay(res.sessions).map(([d, list]) => <section key={d} className="guide-card p-4"><h3 className="text-lg">{formatDay(d, lang)}</h3><ul className="mt-1">{list.map((s, i) => <li key={i} className="py-0.5"><span className="font-bold">{s.title}</span> · {s.minutes} {c.min}</li>)}</ul></section>)}</div>
          {res.unscheduled.length ? <Callout tone="warn"><h3 className="text-lg">{c.unH}</h3><ul className="mt-1 list-disc pl-5">{res.unscheduled.map((u) => <li key={u.taskId}>{u.title} ({u.minutes} {c.min}): {u.reason === "overdue" ? c.overdue : c.noTime}</li>)}</ul><p className="mt-2">{c.shortMsg}</p></Callout> : <p className="mt-4 font-bold text-teal">{c.allFit}</p>}
        </>
      )}
    </Head>
  );
}

const NO_TESTS: StudyTest[] = [];
export function StudyPlannerTool() {
  const c = useCopy(copy);
  const lang = useLang();
  const { free, setFree, cap } = useFree();
  const [tests, setTests] = useLocalDoc<StudyTest[]>("study-tests", NO_TESTS);
  const [, setTodo] = useLocalDoc<Task[]>(TASKS_KEY, NO_TASKS);
  const [f, setF] = useState({ name: "", date: "", minutes: "180" });
  const [err, setErr] = useState<string | null>(null);
  const [note, setNote] = useState<string | null>(null);
  const now = today();
  const live = tests.filter((t) => t.date >= now);
  const { sessions, short } = spreadStudy(live, cap, now);
  const todays = sessions.filter((s) => s.date === now);
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const m = Number(f.minutes);
    if (!f.name.trim()) return setErr(c.needTest);
    if (!isValidISO(f.date) || f.date < now) return setErr(c.needDate);
    if (!Number.isFinite(m) || m < 15 || m > 600) return setErr(c.needMin);
    setErr(null);
    setTests((p) => [...p, { id: crypto.randomUUID(), name: f.name.trim(), date: f.date, minutes: Math.round(m) }]);
    setF({ ...f, name: "" });
  };
  const addToday = () => {
    setTodo((p) => [...p, ...todays.filter((s) => !p.some((t) => t.title === `${s.title}: ${s.minutes} min`)).map((s) => ({ id: crypto.randomUUID(), title: `${s.title}: ${s.minutes} min`, done: false, urgent: false, important: true, top: false, created: now }))]);
    setNote(c.todoDone);
  };
  return (
    <Head title={c.spTitle} lead={c.spLead} wide>
      <FreeTimeEditor c={c} free={free} setFree={setFree} />
      <form onSubmit={submit} className="guide-card mt-5 grid gap-x-4 gap-y-3 p-5 sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_auto] lg:items-end" noValidate>
        <label><span className="block font-bold">{c.test}</span><input value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} placeholder={c.testPh} maxLength={80} className={`${inputClass} mt-1`} /></label>
        <label><span className="block font-bold">{c.date}</span><input type="date" min={now} value={f.date} onChange={(e) => setF({ ...f, date: e.target.value })} className={`${inputClass} mt-1`} /></label>
        <label><span className="block font-bold">{c.mins}</span><input type="number" min={15} max={600} step={15} value={f.minutes} onChange={(e) => setF({ ...f, minutes: e.target.value })} className={`${inputClass} mt-1`} /></label>
        <button className={buttonClass.primary}><Plus size={18} />{c.addTest}</button>
        {err ? <p role="alert" className="font-bold text-ruby sm:col-span-2 lg:col-span-4">{err}</p> : null}
      </form>
      {live.length ? <ul className="mt-4 divide-y-2 divide-dotted divide-line">{live.map((t) => <li key={t.id} className="flex items-center gap-3 py-2"><p className="min-w-0 flex-1"><span className="font-bold">{t.name}</span> <span className="text-muted">· {formatDay(t.date, lang)} · {t.minutes} {c.min}</span></p>
        <button onClick={() => setTests((p) => p.filter((x) => x.id !== t.id))} aria-label={`${c.remove}: ${t.name}`} className="grid h-10 w-10 place-items-center rounded-md hover:bg-sunken"><Trash2 size={18} /></button></li>)}</ul> : null}
      {sessions.length ? <div className="mt-6">
        <div className="flex flex-wrap items-center gap-4"><h2 className="text-2xl">{c.sessionsFor}</h2>{todays.length ? <button onClick={addToday} className={buttonClass.secondary}>{c.todoBtn}</button> : <span className="text-muted">{c.noToday}</span>}<span className="font-bold text-teal" role="status">{note}</span></div>
        <div className="mt-3 grid gap-3 md:grid-cols-2 lg:grid-cols-3">{byDay(sessions).map(([d, list]) => <section key={d} className="guide-card p-4"><h3 className="text-lg">{formatDay(d, lang)}{d === now ? "" : ""}</h3><ul>{list.map((s, i) => <li key={i} className="py-0.5"><span className="font-bold">{s.title}</span> · {s.minutes} {c.min}</li>)}</ul></section>)}</div></div> : null}
      {short.length ? <Callout tone="warn"><h3 className="text-lg">{c.shortH}</h3><ul className="mt-1 list-disc pl-5">{short.map((s) => <li key={s.id}>{s.name}: {c.shortNote(s.minutes)}</li>)}</ul></Callout> : null}
      <p className="mt-4 max-w-prose text-sm text-muted">{c.spNote}</p>
    </Head>
  );
}

export function CatchUpTool() {
  const c = useCopy(copy);
  const lang = useLang();
  const [homework] = useLocalDoc<Assignment[]>(HOMEWORK_KEY, NO_ASSIGNMENTS);
  const now = today();
  const open = homework.filter((h) => !h.done).sort((a, b) => a.due.localeCompare(b.due));
  const late = open.filter((h) => h.due < now), soon = open.filter((h) => h.due >= now && diffDays(now, h.due) <= 3);
  return (
    <Head title={c.cuTitle} lead={c.cuLead}>
      {late.length + soon.length === 0 ? <Empty>{c.cuNone}</Empty> : (
        <>
          {late.length ? <section className="mt-6"><h2 className="border-b-[1.5px] border-ink pb-1 text-2xl">{c.lateH}</h2><ol className="mt-2 list-decimal space-y-1 pl-6">{late.map((h) => <li key={h.id}><span className="font-bold">{h.title}</span>{h.cls ? ` (${h.cls})` : ""} · <span className="text-ruby">{c.daysLate(diffDays(h.due, now))}</span></li>)}</ol></section> : null}
          {soon.length ? <section className="mt-6"><h2 className="border-b-[1.5px] border-ink pb-1 text-2xl">{c.soonH}</h2><ul className="mt-2 list-disc space-y-1 pl-6">{soon.map((h) => <li key={h.id}><span className="font-bold">{h.title}</span>{h.cls ? ` (${h.cls})` : ""} · {c.dueIn(diffDays(now, h.due))} · {formatDay(h.due, lang)}</li>)}</ul></section> : null}
          <h2 className="mt-8 border-b-[1.5px] border-ink pb-1 text-2xl">{c.cuHint}</h2>
          <ol className="mt-3 list-decimal space-y-2 pl-6 text-lg">{c.cuSteps.map((s) => <li key={s} className="max-w-prose">{s}</li>)}</ol>
        </>
      )}
    </Head>
  );
}

type Pack = { kind: keyof C["lists"]; items: { id: string; text: string; done: boolean }[] };
const NO_PACK: Pack = { kind: "tournament", items: [] };
export function PackingTool() {
  const c = useCopy(copy);
  const [p, setP] = useLocalDoc<Pack>("packing", NO_PACK);
  const [text, setText] = useState("");
  const kinds = Object.keys(c.kinds) as (keyof C["lists"])[];
  const load = (kind: keyof C["lists"]) => setP({ kind, items: c.lists[kind].map((t, i) => ({ id: `${kind}-${i}`, text: t, done: false })) });
  const done = p.items.filter((i) => i.done).length;
  return (
    <Head title={c.pkTitle} lead={c.pkLead}>
      <div className="mt-5 flex flex-wrap gap-2" role="group" aria-label={c.trip}>{kinds.map((k) => <button key={k} onClick={() => load(k)} aria-pressed={p.kind === k && p.items.length > 0} className={`rounded-full border-[1.5px] border-ink px-4 py-1.5 font-bold ${p.kind === k && p.items.length > 0 ? "bg-ink text-paper" : "bg-surface hover:bg-sunken"}`}>{c.kinds[k]}</button>)}</div>
      {p.items.length ? <>
        <p className="mt-4 font-bold text-teal" aria-live="polite">{c.packed(done, p.items.length)}</p>
        <ul className="mt-2 divide-y-2 divide-dotted divide-line">{p.items.map((i) => <li key={i.id} className="flex items-center gap-3 py-2"><label className="flex min-w-0 flex-1 items-center gap-3"><input type="checkbox" checked={i.done} onChange={() => setP({ ...p, items: p.items.map((x) => (x.id === i.id ? { ...x, done: !x.done } : x)) })} className="h-5 w-5 accent-[var(--c-teal)]" /><span className={i.done ? "line-through text-muted" : ""}>{i.text}</span></label>
          <button onClick={() => setP({ ...p, items: p.items.filter((x) => x.id !== i.id) })} aria-label={`${c.remove}: ${i.text}`} className="grid h-10 w-10 place-items-center rounded-md hover:bg-sunken"><Trash2 size={18} /></button></li>)}</ul>
        <button onClick={() => setP({ ...p, items: p.items.map((x) => ({ ...x, done: false })) })} className="mt-2 font-bold underline underline-offset-4">{c.reset}</button></> : null}
      <form className="mt-5 flex flex-wrap items-end gap-3" onSubmit={(e) => { e.preventDefault(); if (text.trim()) { setP({ ...p, items: [...p.items, { id: crypto.randomUUID(), text: text.trim(), done: false }] }); setText(""); } }}>
        <label className="min-w-0 flex-1"><span className="block font-bold">{c.items}</span><input value={text} onChange={(e) => setText(e.target.value)} placeholder={c.itemPh} maxLength={80} className={`${inputClass} mt-1`} /></label>
        <button className={buttonClass.primary}><Plus size={18} />{c.addItem}</button></form>
    </Head>
  );
}
