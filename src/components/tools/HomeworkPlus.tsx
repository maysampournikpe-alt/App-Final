"use client";
import Link from "next/link";
import { useState } from "react";
import { ArrowLeft, ArrowRight, Plus, Trash2 } from "lucide-react";
import { addDays, formatDay, today } from "@/lib/dates";
import { useLang } from "@/lib/i18n";
import { useLocalDoc } from "@/lib/local-doc";
import { splitFairly } from "@/lib/planner";
import { classesOn, NO_SCHEDULE, SCHEDULE_KEY, type ScheduleDoc } from "@/lib/schedule";
import { NO_TASKS, TASKS_KEY, type Task } from "@/lib/tasks";
import { HOMEWORK_KEY, NO_ASSIGNMENTS, type Assignment } from "@/lib/homework";
import { useCopy } from "@/lib/use-copy";
import { buttonClass, inputClass } from "../ui";
import { Callout, Empty, Head } from "./shared";

const copy = {
  en: {
    add: "Add", remove: "Remove", taskPh: "What needs doing?", taskL: "Task",
    bpTitle: "Backpack checklist", bpLead: "What to bring tomorrow, based on your class schedule. Add what to bring on each class in the Class schedule.", bpNone: "Add classes to your Class schedule first.", bpDay: "Tomorrow", bpNoClass: "No classes tomorrow.", bpAlways: "Always", bpAlwaysItems: ["Charged phone and charger", "Water bottle", "Student ID", "Pens and pencils"], bpNothing: "(nothing listed for this class)", bpOpen: "Open Class schedule", bpDone: (a: number, b: number) => `${a} of ${b} packed`,
    frTitle: "Eat the frog", frLead: "The frog is your hardest or most dreaded task. Do it first, while your energy is high, and the rest of the day feels easier.", frPick: "Pick your frog for today", frNone: "Add tasks in the Daily to-do list first.", frNow: "Your frog today", frDone: "Done. The hardest part of your day is behind you.", frMark: "I did it", frClear: "Pick a different one", frTip: "Break it into a first step of 5 minutes if it feels too big.",
    tmTitle: "2-minute rule list", tmLead: "If a task takes under 2 minutes, do it right now instead of putting it on a list. Keep the quick ones here and knock them out together.", tmPh: "Reply to the teacher's email", tmEmpty: "No quick tasks. Add the little things you keep putting off.", tmLeft: (n: number) => `${n} left`, tmTimer: "Start 2 minutes", tmStop: "Stop", tmLeftT: (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")} left`, tmOver: "Time. Move on to the next one.",
    kbTitle: "Kanban board", kbLead: "Move each card from To do to Doing to Done. Seeing it move helps a big project feel doable.", cols: ["To do", "Doing", "Done"], kbPh: "Make the poster", kbEmpty: "Nothing here", back: "Move back", fwd: "Move forward",
    gpTitle: "Group project tracker", gpLead: "Who does what and when. Share this screen or read it out at your group meeting.", gpMembers: "Team (names, separated by commas)", gpMembersPh: "Ana, Luis, Marisol", gpWho: "Who", gpWhat: "Task", gpDue: "Due", gpAdd: "Add task", gpNone: "Add your team first, then tasks.", gpUnassigned: "Unassigned", gpDone: (a: number, b: number) => `${a} of ${b} done`, gpNeed: "Write the task and pick who does it.",
    ibTitle: "Quick capture inbox", ibLead: "Jot down anything, fast. Sort it later: send it to your to-do list or homework, or delete it.", ibPh: "Anything on your mind", ibEmpty: "Inbox is empty. Capture anything that pops into your head.", ibTodo: "To to-do", ibHw: "To homework (due tomorrow)", ibSent: "Moved.", ibDel: "Delete",
    gnTitle: "Group project planner", gnLead: "List the tasks with a size for each, add your teammates, and get a fair split. Bigger tasks count more.", gnPeople: "Teammates (names, separated by commas)", gnTask: "Task", gnPts: "Size (1 small to 5 big)", gnAdd: "Add task", gnSplit: "Fair split", gnLoad: (n: number) => `${n} points`, gnNeed2: "Add at least 2 teammates and 1 task.", gnNote: "Talk it over as a team. If someone is better at a task, trade, as long as the points stay fair.",
  },
  es: {
    add: "Agregar", remove: "Quitar", taskPh: "¿Qué hay que hacer?", taskL: "Tarea",
    bpTitle: "Lista de la mochila", bpLead: "Qué llevar mañana, según tu horario de clases. Agrega qué llevar en cada clase en el Horario de clases.", bpNone: "Primero agrega clases a tu Horario de clases.", bpDay: "Mañana", bpNoClass: "Mañana no hay clases.", bpAlways: "Siempre", bpAlwaysItems: ["Celular cargado y cargador", "Botella de agua", "Credencial escolar", "Plumas y lápices"], bpNothing: "(nada anotado para esta clase)", bpOpen: "Abrir Horario de clases", bpDone: (a: number, b: number) => `${a} de ${b} empacadas`,
    frTitle: "Lo difícil primero", frLead: "La rana es tu tarea más difícil o la que menos quieres hacer. Hazla primero, con tu energía alta, y el resto del día se siente más fácil.", frPick: "Elige tu rana de hoy", frNone: "Primero agrega tareas en la Lista de pendientes.", frNow: "Tu rana de hoy", frDone: "Listo. Lo más difícil de tu día ya pasó.", frMark: "Ya la hice", frClear: "Elegir otra", frTip: "Si se siente muy grande, empieza con un primer paso de 5 minutos.",
    tmTitle: "Regla de los 2 minutos", tmLead: "Si una tarea toma menos de 2 minutos, hazla ahora en vez de ponerla en una lista. Guarda aquí las rápidas y termínalas juntas.", tmPh: "Contestar el correo del maestro", tmEmpty: "No hay tareas rápidas. Agrega las cositas que sigues dejando para después.", tmLeft: (n: number) => `${n} pendientes`, tmTimer: "Empezar 2 minutos", tmStop: "Parar", tmLeftT: (s: number) => `Quedan ${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`, tmOver: "Se acabó el tiempo. Pasa a la siguiente.",
    kbTitle: "Tablero Kanban", kbLead: "Mueve cada tarjeta de Pendiente a En proceso a Terminado. Verlo avanzar ayuda a que un proyecto grande parezca posible.", cols: ["Pendiente", "En proceso", "Terminado"], kbPh: "Hacer el cartel", kbEmpty: "Aquí no hay nada", back: "Mover atrás", fwd: "Mover adelante",
    gpTitle: "Seguimiento de proyectos en equipo", gpLead: "Quién hace qué y cuándo. Comparte esta pantalla o léela en la junta de tu equipo.", gpMembers: "Equipo (nombres separados por comas)", gpMembersPh: "Ana, Luis, Marisol", gpWho: "Quién", gpWhat: "Tarea", gpDue: "Fecha", gpAdd: "Agregar tarea", gpNone: "Primero agrega a tu equipo y luego las tareas.", gpUnassigned: "Sin asignar", gpDone: (a: number, b: number) => `${a} de ${b} listas`, gpNeed: "Escribe la tarea y elige quién la hace.",
    ibTitle: "Anotar rápido", ibLead: "Apunta lo que sea, rápido. Ordénalo después: mándalo a tus pendientes o a tu tarea, o bórralo.", ibPh: "Lo que traigas en la cabeza", ibEmpty: "La bandeja está vacía. Anota todo lo que se te ocurra.", ibTodo: "A pendientes", ibHw: "A tarea (para mañana)", ibSent: "Movido.", ibDel: "Borrar",
    gnTitle: "Planeador de proyectos en equipo", gnLead: "Haz la lista de tareas con un tamaño para cada una, agrega a tus compañeros y recibe un reparto justo. Las tareas grandes valen más.", gnPeople: "Compañeros (nombres separados por comas)", gnTask: "Tarea", gnPts: "Tamaño (1 chica a 5 grande)", gnAdd: "Agregar tarea", gnSplit: "Reparto justo", gnLoad: (n: number) => `${n} puntos`, gnNeed2: "Agrega al menos 2 compañeros y 1 tarea.", gnNote: "Háblenlo como equipo. Si alguien es mejor en una tarea, cámbienla, mientras los puntos sigan siendo justos.",
  },
};

const rm = (label: string, text: string, fn: () => void) => <button onClick={fn} aria-label={`${text}: ${label}`} className="grid h-10 w-10 shrink-0 place-items-center rounded-xl hover:bg-sunken"><Trash2 size={18} strokeWidth={1.75} /></button>;
const names = (s: string) => [...new Set(s.split(",").map((x) => x.trim()).filter(Boolean))].slice(0, 8);

export function BackpackTool() {
  const c = useCopy(copy);
  const lang = useLang();
  const [sched] = useLocalDoc<ScheduleDoc>(SCHEDULE_KEY, NO_SCHEDULE);
  const [checked, setChecked] = useLocalDoc<Record<string, string[]>>("backpack-checked", {} as Record<string, string[]>);
  const date = addDays(today(), 1);
  const list = classesOn(date, sched);
  const items = [...new Set(list.flatMap((x) => x.bring.split(",").map((s) => s.trim()).filter(Boolean)))];
  const all = [...c.bpAlwaysItems, ...items];
  const done = checked[date] ?? [];
  const toggle = (it: string) => setChecked(() => ({ [date]: done.includes(it) ? done.filter((x) => x !== it) : [...done, it] }));
  return (
    <Head title={c.bpTitle} lead={c.bpLead}>
      {sched.classes.length === 0 ? <Empty>{c.bpNone}</Empty> : (
        <>
          <h2 className="mt-6 text-2xl">{c.bpDay}: {formatDay(date, lang)}</h2>
          {list.length === 0 ? <p className="mt-2 text-muted">{c.bpNoClass}</p> : <ul className="mt-2 list-disc pl-6">{list.map((x) => <li key={x.id}><span className="font-bold">{x.name}</span> {x.bring ? `: ${x.bring}` : <span className="text-muted">{c.bpNothing}</span>}</li>)}</ul>}
          <p className="mt-4 font-bold text-teal" aria-live="polite">{c.bpDone(all.filter((i) => done.includes(i)).length, all.length)}</p>
          <ul className="mt-2 divide-y-2 divide-dotted divide-line">{all.map((it) => <li key={it}><label className="flex items-center gap-3 py-2.5"><input type="checkbox" checked={done.includes(it)} onChange={() => toggle(it)} className="h-5 w-5 accent-[var(--c-teal)]" /><span className={done.includes(it) ? "text-muted line-through" : ""}>{it}</span></label></li>)}</ul>
        </>
      )}
      <Link href="/t/calendar/schedule" className={`${buttonClass.secondary} mt-5 inline-flex`}>{c.bpOpen}</Link>
    </Head>
  );
}

const NO_FROG: { date: string; id: string; done: boolean } | null = null;
export function FrogTool() {
  const c = useCopy(copy);
  const [tasks] = useLocalDoc<Task[]>(TASKS_KEY, NO_TASKS);
  const [frog, setFrog] = useLocalDoc<{ date: string; id: string; done: boolean } | null>("frog", NO_FROG);
  const now = today();
  const open = tasks.filter((t) => !t.done);
  const current = frog && frog.date === now ? frog : null;
  const title = current ? tasks.find((t) => t.id === current.id)?.title : null;
  return (
    <Head title={c.frTitle} lead={c.frLead}>
      {current && title ? (
        <section className="guide-card mt-6 p-6"><h2 className="text-lg text-muted">{c.frNow}</h2><p className="font-display text-3xl font-semibold">{title}</p>
          {current.done ? <p className="mt-3 font-bold text-teal" role="status">{c.frDone}</p> : <p className="mt-3 text-muted">{c.frTip}</p>}
          <div className="mt-4 flex flex-wrap gap-3">{!current.done ? <button onClick={() => setFrog({ ...current, done: true })} className={buttonClass.primary}>{c.frMark}</button> : null}<button onClick={() => setFrog(null)} className={buttonClass.secondary}>{c.frClear}</button></div></section>
      ) : open.length === 0 ? <Empty>{c.frNone}</Empty> : (
        <section className="mt-6"><h2 className="text-2xl">{c.frPick}</h2><ul className="mt-3 space-y-2">{open.map((t) => <li key={t.id}><button onClick={() => setFrog({ date: now, id: t.id, done: false })} className="guide-card w-full p-4 text-left font-bold hover:bg-sunken">{t.title}</button></li>)}</ul></section>
      )}
    </Head>
  );
}

type Quick = { id: string; text: string; done: boolean };
const NO_QUICK: Quick[] = [];
export function TwoMinuteTool() {
  const c = useCopy(copy);
  const [items, setItems] = useLocalDoc<Quick[]>("quick-tasks", NO_QUICK);
  const [text, setText] = useState("");
  const [left, setLeft] = useState<number | null>(null);
  const [timer, setTimer] = useState<ReturnType<typeof setInterval> | null>(null);
  const stop = () => { if (timer) clearInterval(timer); setTimer(null); setLeft(null); };
  const start = () => {
    stop(); setLeft(120);
    const id = setInterval(() => setLeft((s) => { if (s === null) return s; if (s <= 1) { clearInterval(id); setTimer(null); return 0; } return s - 1; }), 1000);
    setTimer(id);
  };
  const open = items.filter((i) => !i.done).length;
  return (
    <Head title={c.tmTitle} lead={c.tmLead}>
      <form className="mt-5 flex flex-wrap items-end gap-3" onSubmit={(e) => { e.preventDefault(); if (text.trim()) { setItems((p) => [...p, { id: crypto.randomUUID(), text: text.trim(), done: false }]); setText(""); } }}>
        <label className="min-w-0 flex-1"><span className="block font-bold">{c.taskL}</span><input value={text} onChange={(e) => setText(e.target.value)} placeholder={c.tmPh} maxLength={80} className={`${inputClass} mt-1`} /></label><button className={buttonClass.primary}><Plus size={18} />{c.add}</button></form>
      <div className="mt-4 flex flex-wrap items-center gap-4"><p className="font-bold text-teal" aria-live="polite">{c.tmLeft(open)}</p>
        {left === null ? <button onClick={start} className={buttonClass.secondary}>{c.tmTimer}</button> : <><span className="font-display text-2xl font-semibold tabular-nums" role="timer">{left > 0 ? c.tmLeftT(left) : c.tmOver}</span><button onClick={stop} className={buttonClass.secondary}>{c.tmStop}</button></>}</div>
      {items.length === 0 ? <Empty>{c.tmEmpty}</Empty> : <ul className="mt-3 divide-y-2 divide-dotted divide-line">{items.map((i) => <li key={i.id} className="flex items-center gap-3"><label className="flex min-w-0 flex-1 items-center gap-3 py-2.5"><input type="checkbox" checked={i.done} onChange={() => setItems((p) => p.map((x) => (x.id === i.id ? { ...x, done: !x.done } : x)))} className="h-5 w-5 accent-[var(--c-teal)]" /><span className={i.done ? "text-muted line-through" : ""}>{i.text}</span></label>{rm(i.text, c.remove, () => setItems((p) => p.filter((x) => x.id !== i.id)))}</li>)}</ul>}
    </Head>
  );
}

type Card = { id: string; text: string; col: 0 | 1 | 2 };
const NO_CARDS: Card[] = [];
export function KanbanTool() {
  const c = useCopy(copy);
  const [cards, setCards] = useLocalDoc<Card[]>("kanban", NO_CARDS);
  const [text, setText] = useState("");
  const move = (id: string, d: -1 | 1) => setCards((p) => p.map((x) => (x.id === id ? { ...x, col: Math.max(0, Math.min(2, x.col + d)) as 0 | 1 | 2 } : x)));
  return (
    <Head title={c.kbTitle} lead={c.kbLead} wide>
      <form className="mt-5 flex flex-wrap items-end gap-3" onSubmit={(e) => { e.preventDefault(); if (text.trim()) { setCards((p) => [...p, { id: crypto.randomUUID(), text: text.trim(), col: 0 }]); setText(""); } }}>
        <label className="min-w-0 flex-1"><span className="block font-bold">{c.taskL}</span><input value={text} onChange={(e) => setText(e.target.value)} placeholder={c.kbPh} maxLength={80} className={`${inputClass} mt-1`} /></label><button className={buttonClass.primary}><Plus size={18} />{c.add}</button></form>
      <div className="mt-5 grid gap-4 md:grid-cols-3">{c.cols.map((name, ci) => (
        <section key={name} aria-label={name} className="guide-card p-3"><h2 className="text-xl">{name} <span className="text-base text-muted">({cards.filter((x) => x.col === ci).length})</span></h2>
          <ul className="mt-2 space-y-2">{cards.filter((x) => x.col === ci).map((x) => (
            <li key={x.id} className="rounded-xl border-[1.5px] border-ink bg-surface p-2"><p className="font-bold">{x.text}</p>
              <div className="mt-1 flex items-center gap-1">{ci > 0 ? <button onClick={() => move(x.id, -1)} aria-label={`${c.back}: ${x.text}`} className="grid h-9 w-9 place-items-center rounded hover:bg-sunken"><ArrowLeft size={16} /></button> : null}{ci < 2 ? <button onClick={() => move(x.id, 1)} aria-label={`${c.fwd}: ${x.text}`} className="grid h-9 w-9 place-items-center rounded hover:bg-sunken"><ArrowRight size={16} /></button> : null}
                <span className="flex-1" />{rm(x.text, c.remove, () => setCards((p) => p.filter((y) => y.id !== x.id)))}</div></li>))}
            {cards.filter((x) => x.col === ci).length === 0 ? <li className="text-sm text-muted">{c.kbEmpty}</li> : null}</ul></section>))}</div>
    </Head>
  );
}

type GP = { members: string[]; tasks: { id: string; text: string; who: string; due: string; done: boolean }[] };
const NO_GP: GP = { members: [], tasks: [] };
export function GroupProjectTool() {
  const c = useCopy(copy);
  const lang = useLang();
  const [g, setG] = useLocalDoc<GP>("group-project", NO_GP);
  const [membersText, setMembersText] = useState("");
  const [f, setF] = useState({ text: "", who: "", due: "" });
  const [err, setErr] = useState<string | null>(null);
  const done = g.tasks.filter((t) => t.done).length;
  return (
    <Head title={c.gpTitle} lead={c.gpLead}>
      <form className="mt-5 flex flex-wrap items-end gap-3" onSubmit={(e) => { e.preventDefault(); const m = names(membersText); if (m.length) { setG((p) => ({ ...p, members: m })); setMembersText(""); } }}>
        <label className="min-w-0 flex-1"><span className="block font-bold">{c.gpMembers}</span><input value={membersText} onChange={(e) => setMembersText(e.target.value)} placeholder={g.members.join(", ") || c.gpMembersPh} maxLength={120} className={`${inputClass} mt-1`} /></label><button className={buttonClass.primary}>{c.add}</button></form>
      {g.members.length === 0 ? <Empty>{c.gpNone}</Empty> : (
        <>
          <form className="guide-card mt-5 grid gap-x-4 gap-y-3 p-5 sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_auto] lg:items-end" noValidate onSubmit={(e) => { e.preventDefault(); if (!f.text.trim() || !f.who) return setErr(c.gpNeed); setErr(null); setG((p) => ({ ...p, tasks: [...p.tasks, { id: crypto.randomUUID(), text: f.text.trim(), who: f.who, due: f.due, done: false }] })); setF({ ...f, text: "" }); }}>
            <label><span className="block font-bold">{c.gpWhat}</span><input value={f.text} onChange={(e) => setF({ ...f, text: e.target.value })} maxLength={80} className={`${inputClass} mt-1`} /></label>
            <label><span className="block font-bold">{c.gpWho}</span><select value={f.who} onChange={(e) => setF({ ...f, who: e.target.value })} className={`${inputClass} mt-1`}><option value="" /> {g.members.map((m) => <option key={m}>{m}</option>)}</select></label>
            <label><span className="block font-bold">{c.gpDue}</span><input type="date" value={f.due} onChange={(e) => setF({ ...f, due: e.target.value })} className={`${inputClass} mt-1`} /></label>
            <button className={buttonClass.primary}><Plus size={18} />{c.gpAdd}</button>{err ? <p role="alert" className="font-bold text-ruby sm:col-span-2 lg:col-span-4">{err}</p> : null}</form>
          <p className="mt-4 font-bold text-teal" aria-live="polite">{c.gpDone(done, g.tasks.length)}</p>
          <div className="mt-3 grid gap-3 md:grid-cols-2">{g.members.map((m) => <section key={m} className="guide-card p-4"><h2 className="text-xl">{m}</h2><ul className="mt-1">{g.tasks.filter((t) => t.who === m).map((t) => <li key={t.id} className="flex items-center gap-2"><label className="flex min-w-0 flex-1 items-center gap-2 py-1.5"><input type="checkbox" checked={t.done} onChange={() => setG((p) => ({ ...p, tasks: p.tasks.map((x) => (x.id === t.id ? { ...x, done: !x.done } : x)) }))} className="h-5 w-5 accent-[var(--c-teal)]" /><span className={t.done ? "text-muted line-through" : ""}>{t.text}{t.due ? ` · ${formatDay(t.due, lang)}` : ""}</span></label>{rm(t.text, c.remove, () => setG((p) => ({ ...p, tasks: p.tasks.filter((x) => x.id !== t.id) })))}</li>)}</ul></section>)}</div>
        </>
      )}
    </Head>
  );
}

type Inbox = { id: string; text: string };
const NO_INBOX: Inbox[] = [];
export function InboxTool() {
  const c = useCopy(copy);
  const [items, setItems] = useLocalDoc<Inbox[]>("inbox", NO_INBOX);
  const [, setTodo] = useLocalDoc<Task[]>(TASKS_KEY, NO_TASKS);
  const [, setHw] = useLocalDoc<Assignment[]>(HOMEWORK_KEY, NO_ASSIGNMENTS);
  const [text, setText] = useState("");
  const [note, setNote] = useState<string | null>(null);
  const drop = (id: string) => setItems((p) => p.filter((x) => x.id !== id));
  return (
    <Head title={c.ibTitle} lead={c.ibLead}>
      <form className="mt-5 flex flex-wrap items-end gap-3" onSubmit={(e) => { e.preventDefault(); if (text.trim()) { setItems((p) => [{ id: crypto.randomUUID(), text: text.trim() }, ...p].slice(0, 200)); setText(""); setNote(null); } }}>
        <label className="min-w-0 flex-1"><span className="block font-bold">{c.taskL}</span><input value={text} onChange={(e) => setText(e.target.value)} placeholder={c.ibPh} maxLength={120} className={`${inputClass} mt-1`} /></label><button className={buttonClass.primary}><Plus size={18} />{c.add}</button></form>
      <p className="mt-2 font-bold text-teal" role="status">{note}</p>
      {items.length === 0 ? <Empty>{c.ibEmpty}</Empty> : <ul className="mt-3 space-y-2">{items.map((i) => (
        <li key={i.id} className="guide-card p-3"><p className="font-bold">{i.text}</p>
          <div className="mt-2 flex flex-wrap gap-2"><button onClick={() => { setTodo((p) => [...p, { id: crypto.randomUUID(), title: i.text, done: false, urgent: false, important: false, top: false, created: today() }]); drop(i.id); setNote(c.ibSent); }} className={buttonClass.secondary}>{c.ibTodo}</button>
            <button onClick={() => { setHw((p) => [...p, { id: crypto.randomUUID(), title: i.text, cls: "", due: addDays(today(), 1), done: false }]); drop(i.id); setNote(c.ibSent); }} className={buttonClass.secondary}>{c.ibHw}</button>
            <button onClick={() => drop(i.id)} className="px-3 font-bold text-ruby underline underline-offset-4" aria-label={`${c.ibDel}: ${i.text}`}>{c.ibDel}</button></div></li>))}</ul>}
    </Head>
  );
}

type GPlan = { people: string; tasks: { id: string; title: string; points: number }[] };
const NO_GPLAN: GPlan = { people: "", tasks: [] };
export function GroupPlannerTool() {
  const c = useCopy(copy);
  const [g, setG] = useLocalDoc<GPlan>("group-plan", NO_GPLAN);
  const [f, setF] = useState({ title: "", points: "3" });
  const people = names(g.people);
  const ready = people.length >= 2 && g.tasks.length >= 1;
  const res = ready ? splitFairly(g.tasks, people) : null;
  return (
    <Head title={c.gnTitle} lead={c.gnLead}>
      <label className="mt-5 block"><span className="block font-bold">{c.gnPeople}</span><input value={g.people} onChange={(e) => setG((p) => ({ ...p, people: e.target.value }))} maxLength={120} className={`${inputClass} mt-1`} /></label>
      <form className="mt-4 flex flex-wrap items-end gap-3" onSubmit={(e) => { e.preventDefault(); if (f.title.trim()) { setG((p) => ({ ...p, tasks: [...p.tasks, { id: crypto.randomUUID(), title: f.title.trim(), points: Math.max(1, Math.min(5, Number(f.points) || 1)) }] })); setF({ ...f, title: "" }); } }}>
        <label className="min-w-0 flex-1"><span className="block font-bold">{c.gnTask}</span><input value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} maxLength={80} className={`${inputClass} mt-1`} /></label>
        <label><span className="block font-bold">{c.gnPts}</span><select value={f.points} onChange={(e) => setF({ ...f, points: e.target.value })} className={`${inputClass} mt-1`}>{[1, 2, 3, 4, 5].map((n) => <option key={n}>{n}</option>)}</select></label><button className={buttonClass.primary}><Plus size={18} />{c.gnAdd}</button></form>
      {g.tasks.length ? <ul className="mt-3 divide-y-2 divide-dotted divide-line">{g.tasks.map((t) => <li key={t.id} className="flex items-center gap-3 py-2"><p className="min-w-0 flex-1"><span className="font-bold">{t.title}</span> <span className="text-muted">· {t.points}</span></p>{rm(t.title, c.remove, () => setG((p) => ({ ...p, tasks: p.tasks.filter((x) => x.id !== t.id) })))}</li>)}</ul> : null}
      {!ready ? <p className="mt-4 text-muted">{c.gnNeed2}</p> : res ? (
        <><h2 className="mt-6 border-b-[1.5px] border-ink pb-1 text-2xl">{c.gnSplit}</h2>
          <div className="mt-3 grid gap-3 md:grid-cols-2">{people.map((p) => <section key={p} className="guide-card p-4"><h3 className="text-xl">{p} <span className="text-base text-muted">· {c.gnLoad(res.loads[p])}</span></h3><ul className="mt-1 list-disc pl-5">{res.assigned[p].map((t) => <li key={t.id}>{t.title}</li>)}</ul></section>)}</div>
          <Callout>{c.gnNote}</Callout></>
      ) : null}
    </Head>
  );
}
