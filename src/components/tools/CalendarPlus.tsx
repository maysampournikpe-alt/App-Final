"use client";
import Link from "next/link";
import { useMemo, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { collectItems, startOfWeek, type CalItem } from "@/lib/calendar";
import { addDays, diffDays, formatDay, isValidISO, today } from "@/lib/dates";
import { HOMEWORK_KEY, NO_ASSIGNMENTS, type Assignment } from "@/lib/homework";
import { buildICS } from "@/lib/ics";
import { useLang } from "@/lib/i18n";
import { levelOf, weekScore, type Level } from "@/lib/load";
import { useLocalDoc } from "@/lib/local-doc";
import type { SavedListing } from "@/lib/saved";
import { abDayFor, BLOCK_KINDS, BLOCKS_KEY, blockHours, classesOn, dayIndex, DAY_KEYS, EVENT_KINDS, EVENTS_KEY, findConflicts, fmtTime, NO_BLOCKS, NO_EVENTS, NO_SCHEDULE, SCHEDULE_KEY, toMin, validRange,
  type AB, type Block, type BlockKind, type ClassItem, type EventKind, type ScheduleDoc, type SchoolEvent, type Slot } from "@/lib/schedule";
import { NO_TASKS, TASKS_KEY, type Task } from "@/lib/tasks";
import { useCopy } from "@/lib/use-copy";
import { buttonClass, inputClass } from "../ui";
import { Callout, Chips, Empty, Head } from "./shared";

const NO_SAVED: SavedListing[] = [];
const NO_COUNTS: { id: string; name: string; date: string }[] = [];

const copy = {
  en: {
    eventKinds: { holiday: "Holiday", early: "Early release", testing: "Testing day", test: "Big test", project: "Project due", break: "Break", other: "Other" } as Record<EventKind, string>,
    syTitle: "School year calendar", syLead: "Holidays, early release days and testing days, in one list. They also show up on your Deadline calendar.", smTitle: "Semester at a glance", smLead: "Big tests, projects and breaks, week by week, so you can see crunch time coming.",
    what: "What is it?", whatPh: "Fall break", kind: "Type", date: "Date", endDate: "Last day (optional)", add: "Add", needTitle: "Write what it is.", needDate: "Pick a date.", badEnd: "The last day cannot be before the first day.", remove: "Remove", all: "All", empty: "Nothing yet. Check your school's calendar and add the dates that matter to you.",
    nextBreak: (n: number, t: string) => `${t} is in ${n} ${n === 1 ? "day" : "days"}.`, weekOf: (d: string) => `Week of ${d}`, thisWeek: "This week", crunch: "Heavy week", noWeeks: "Nothing big coming up. Add tests, projects and breaks above.", items: (n: number) => `${n} ${n === 1 ? "thing" : "things"}`,
    scTitle: "Class schedule", scLead: "Your classes, with room and times. It works for weekday schedules and A/B (alternating) days.", scKind: "Schedule type", weekdays: "Same every weekday", ab: "A and B days", todayIs: "Today is…", aDay: "An A day", bDay: "A B day", abNote: "Alternating schedules skip weekends. If your school has a holiday, set today's letter again.",
    className: "Class", classPh: "Algebra I", room: "Room", start: "Start", end: "End", meets: "Meets on", bring: "Bring (optional)", bringPh: "calculator, binder", addClass: "Add class", needClass: "Write the class name.", needTime: "The end time must be after the start time.", needDays: "Pick at least one day.",
    todayH: "Today", tomorrowH: "Tomorrow", noClasses: "No classes.", setAb: "Tell me if today is an A or B day to see your classes.", days: { mon: "Mon", tue: "Tue", wed: "Wed", thu: "Thu", fri: "Fri", sat: "Sat", sun: "Sun" } as Record<string, string>, dayFull: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
    wkTitle: "Weekly schedule builder", wkLead: "Fit school, practice, work and study into a real week, and see where it is too full.", spTitle: "Sports and practice schedule", spLead: "Practices and games on their own color layer, next to the rest of your week.",
    blockKinds: { school: "School", practice: "Practice or game", work: "Work", study: "Study", other: "Other" } as Record<BlockKind, string>, titleL: "Title", titlePh: "Soccer practice", daysL: "Days", addBlock: "Add to my week", needBlock: "Write a title and pick at least one day.", hoursWeek: (h: number) => `${Math.round(h * 10) / 10} hours a week`, conflictsFound: (n: number) => `${n} overlap${n === 1 ? "" : "s"} found. Open the Time conflict checker.`, noBlocks: "Nothing in your week yet.", showClasses: "Show my classes too",
    cfTitle: "Time conflict checker", cfLead: "Looks at your classes and weekly plans for the next two weeks, and warns you when two things happen at the same time.", cfNone: "No conflicts in the next two weeks.", cfNothing: "Add classes or weekly plans first, then check again.", vs: "overlaps with", scanned: (n: number) => `Checked ${n} days.`,
    tbTitle: "Time blocking planner", tbLead: "Give each hour of your day a job. Pick a task from your lists, or type your own.", dateL: "Day", hour: "Hour", slotPh: "Study biology", fromList: "Add from my lists", pick: "Pick a task…", clearDay: "Clear this day", fills: (n: number) => `${n} of 17 hours planned`,
    ovTitle: "Overload detector", ovLead: "Warns when a week has too many tests, projects and deadlines for the time you have.", ovWeek: "Week", levels: { light: "Light", medium: "Busy", heavy: "Heavy" } as Record<Level, string>, hw: "homework", ts: "tests", pj: "projects", cm: "hours of activities", score: "Load",
    ovAdvice: (w: string) => `This is your heaviest week. Start early, and spread the work over the days before. The lightest coming week starts ${w}, so move anything flexible there.`, ovAllLight: "Your next weeks look manageable. Keep it up.", ovHow: "How it is counted: a test counts 3, a project 2, each homework 1, and each hour of weekly activities a half.",
    exTitle: "Send to my calendar", exLead: "Download your deadlines as a file. Google Calendar, Apple Calendar and Outlook can all import it.", include: "What to include", kindsEx: { opportunity: "Saved opportunity deadlines", homework: "Homework due dates", countdown: "Countdowns", event: "School calendar events" } as Record<CalItem["kind"], string>, count: (n: number) => `${n} ${n === 1 ? "event" : "events"} in the file`, download: "Download calendar file", none: "Nothing to export yet. Add homework, saved opportunities or school events first.",
    how: "How to add it to Google Calendar", steps: ["Download the file above.", "On a computer, open calendar.google.com.", "Click the gear, then Settings, then Import and export.", "Choose the file you downloaded and click Import.", "On Apple Calendar or Outlook, just open the file."], exNote: "This sends a copy once. It does not update by itself, so download again after you add new deadlines.",
  },
  es: {
    eventKinds: { holiday: "Feriado", early: "Salida temprano", testing: "Día de exámenes", test: "Examen importante", project: "Entrega de proyecto", break: "Vacaciones", other: "Otro" } as Record<EventKind, string>,
    syTitle: "Calendario del año escolar", syLead: "Feriados, salidas temprano y días de exámenes, en una lista. También aparecen en tu Calendario de fechas límite.", smTitle: "El semestre de un vistazo", smLead: "Exámenes importantes, proyectos y vacaciones, semana por semana, para ver venir los momentos difíciles.",
    what: "¿Qué es?", whatPh: "Vacaciones de otoño", kind: "Tipo", date: "Fecha", endDate: "Último día (opcional)", add: "Agregar", needTitle: "Escribe qué es.", needDate: "Elige una fecha.", badEnd: "El último día no puede ser antes del primero.", remove: "Quitar", all: "Todos", empty: "Todavía no hay nada. Revisa el calendario de tu escuela y agrega las fechas que te importan.",
    nextBreak: (n: number, t: string) => `${t} es en ${n} ${n === 1 ? "día" : "días"}.`, weekOf: (d: string) => `Semana del ${d}`, thisWeek: "Esta semana", crunch: "Semana pesada", noWeeks: "No hay nada importante próximamente. Agrega exámenes, proyectos y vacaciones arriba.", items: (n: number) => `${n} ${n === 1 ? "cosa" : "cosas"}`,
    scTitle: "Horario de clases", scLead: "Tus clases, con salón y horarios. Sirve para horarios de lunes a viernes y para días A/B (alternados).", scKind: "Tipo de horario", weekdays: "Igual todos los días", ab: "Días A y B", todayIs: "Hoy es…", aDay: "Un día A", bDay: "Un día B", abNote: "Los horarios alternados se saltan los fines de semana. Si tu escuela tiene un feriado, pon de nuevo la letra de hoy.",
    className: "Clase", classPh: "Álgebra I", room: "Salón", start: "Inicio", end: "Fin", meets: "Se reúne los", bring: "Llevar (opcional)", bringPh: "calculadora, carpeta", addClass: "Agregar clase", needClass: "Escribe el nombre de la clase.", needTime: "La hora de fin debe ser después de la de inicio.", needDays: "Elige al menos un día.",
    todayH: "Hoy", tomorrowH: "Mañana", noClasses: "No hay clases.", setAb: "Dime si hoy es día A o B para ver tus clases.", days: { mon: "Lun", tue: "Mar", wed: "Mié", thu: "Jue", fri: "Vie", sat: "Sáb", sun: "Dom" } as Record<string, string>, dayFull: ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"],
    wkTitle: "Creador de horario semanal", wkLead: "Acomoda escuela, práctica, trabajo y estudio en una semana real, y mira dónde está muy llena.", spTitle: "Horario de deportes y prácticas", spLead: "Prácticas y juegos en su propia capa de color, junto al resto de tu semana.",
    blockKinds: { school: "Escuela", practice: "Práctica o juego", work: "Trabajo", study: "Estudio", other: "Otro" } as Record<BlockKind, string>, titleL: "Título", titlePh: "Práctica de fútbol", daysL: "Días", addBlock: "Agregar a mi semana", needBlock: "Escribe un título y elige al menos un día.", hoursWeek: (h: number) => `${Math.round(h * 10) / 10} horas por semana`, conflictsFound: (n: number) => `Se encontraron ${n} choque${n === 1 ? "" : "s"}. Abre el Revisor de choques de horario.`, noBlocks: "Todavía no hay nada en tu semana.", showClasses: "Mostrar también mis clases",
    cfTitle: "Revisor de choques de horario", cfLead: "Mira tus clases y planes semanales de las próximas dos semanas, y te avisa cuando dos cosas pasan a la misma hora.", cfNone: "No hay choques en las próximas dos semanas.", cfNothing: "Primero agrega clases o planes semanales, y luego revisa otra vez.", vs: "choca con", scanned: (n: number) => `Se revisaron ${n} días.`,
    tbTitle: "Planificador por bloques de tiempo", tbLead: "Dale un trabajo a cada hora de tu día. Elige una tarea de tus listas, o escribe la tuya.", dateL: "Día", hour: "Hora", slotPh: "Estudiar biología", fromList: "Agregar de mis listas", pick: "Elige una tarea…", clearDay: "Borrar este día", fills: (n: number) => `${n} de 17 horas planeadas`,
    ovTitle: "Detector de sobrecarga", ovLead: "Avisa cuando una semana tiene demasiados exámenes, proyectos y fechas límite para el tiempo que tienes.", ovWeek: "Semana", levels: { light: "Ligera", medium: "Ocupada", heavy: "Pesada" } as Record<Level, string>, hw: "tareas", ts: "exámenes", pj: "proyectos", cm: "horas de actividades", score: "Carga",
    ovAdvice: (w: string) => `Esta es tu semana más pesada. Empieza temprano y reparte el trabajo en los días anteriores. La semana más ligera que viene empieza el ${w}, así que mueve ahí lo que sea flexible.`, ovAllLight: "Tus próximas semanas se ven manejables. Sigue así.", ovHow: "Cómo se cuenta: un examen vale 3, un proyecto 2, cada tarea 1, y cada hora de actividades semanales media.",
    exTitle: "Enviar a mi calendario", exLead: "Descarga tus fechas límite como un archivo. Google Calendar, Apple Calendar y Outlook pueden importarlo.", include: "Qué incluir", kindsEx: { opportunity: "Fechas límite de oportunidades guardadas", homework: "Fechas de entrega de tareas", countdown: "Cuentas regresivas", event: "Eventos del calendario escolar" } as Record<CalItem["kind"], string>, count: (n: number) => `${n} ${n === 1 ? "evento" : "eventos"} en el archivo`, download: "Descargar archivo de calendario", none: "Todavía no hay nada para exportar. Primero agrega tareas, oportunidades guardadas o eventos escolares.",
    how: "Cómo agregarlo a Google Calendar", steps: ["Descarga el archivo de arriba.", "En una computadora, abre calendar.google.com.", "Haz clic en el engranaje, luego en Configuración, luego en Importar y exportar.", "Elige el archivo que descargaste y haz clic en Importar.", "En Apple Calendar u Outlook, solo abre el archivo."], exNote: "Esto envía una copia una vez. No se actualiza solo, así que descárgalo otra vez cuando agregues fechas nuevas.",
  },
};
type C = typeof copy.en;

const monthLabel = (d: string, lang: string) => new Intl.DateTimeFormat(lang === "es" ? "es-US" : "en-US", { month: "long", year: "numeric" }).format(new Date(Number(d.slice(0, 4)), Number(d.slice(5, 7)) - 1, 1));
const del = (label: string, remove: string, onClick: () => void) => <button onClick={onClick} aria-label={`${remove}: ${label}`} className="grid h-10 w-10 shrink-0 place-items-center rounded-md hover:bg-sunken"><Trash2 size={18} strokeWidth={1.75} /></button>;

function EventForm({ c, kinds, onAdd }: { c: C; kinds: EventKind[]; onAdd: (e: SchoolEvent) => void }) {
  const [f, setF] = useState({ title: "", kind: kinds[0], date: "", end: "" });
  const [err, setErr] = useState<string | null>(null);
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!f.title.trim()) return setErr(c.needTitle);
    if (!isValidISO(f.date)) return setErr(c.needDate);
    if (f.end && (!isValidISO(f.end) || f.end < f.date)) return setErr(c.badEnd);
    setErr(null);
    onAdd({ id: crypto.randomUUID(), title: f.title.trim(), kind: f.kind, date: f.date, end: f.end || undefined });
    setF({ ...f, title: "" });
  };
  return (
    <form onSubmit={submit} className="guide-card mt-5 grid gap-x-4 gap-y-3 p-5 sm:grid-cols-2 lg:grid-cols-[2fr_1.2fr_1fr_1fr_auto] lg:items-end" noValidate>
      <label><span className="block font-bold">{c.what}</span><input value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} placeholder={c.whatPh} maxLength={80} className={`${inputClass} mt-1`} /></label>
      <label><span className="block font-bold">{c.kind}</span><select value={f.kind} onChange={(e) => setF({ ...f, kind: e.target.value as EventKind })} className={`${inputClass} mt-1`}>{kinds.map((k) => <option key={k} value={k}>{c.eventKinds[k]}</option>)}</select></label>
      <label><span className="block font-bold">{c.date}</span><input type="date" value={f.date} onChange={(e) => setF({ ...f, date: e.target.value })} className={`${inputClass} mt-1`} /></label>
      <label><span className="block font-bold">{c.endDate}</span><input type="date" value={f.end} min={f.date} onChange={(e) => setF({ ...f, end: e.target.value })} className={`${inputClass} mt-1`} /></label>
      <button className={buttonClass.primary}><Plus size={18} />{c.add}</button>
      {err ? <p role="alert" className="font-bold text-ruby sm:col-span-2 lg:col-span-5">{err}</p> : null}
    </form>
  );
}

const rangeText = (e: SchoolEvent, lang: "en" | "es") => (e.end && e.end !== e.date ? `${formatDay(e.date, lang)} – ${formatDay(e.end, lang)}` : formatDay(e.date, lang));

export function SchoolYearTool() {
  const c = useCopy(copy);
  const lang = useLang();
  const [events, setEvents] = useLocalDoc<SchoolEvent[]>(EVENTS_KEY, NO_EVENTS);
  const [filter, setFilter] = useState<EventKind | "">("");
  const now = today();
  const sorted = [...events].filter((e) => !filter || e.kind === filter).sort((a, b) => a.date.localeCompare(b.date));
  const next = [...events].filter((e) => e.kind === "break" && (e.end ?? e.date) >= now).sort((a, b) => a.date.localeCompare(b.date))[0];
  const months = [...new Set(sorted.map((e) => e.date.slice(0, 7)))];
  return (
    <Head title={c.syTitle} lead={c.syLead} wide>
      <EventForm c={c} kinds={["holiday", "early", "testing", "break", "other", "test", "project"]} onAdd={(e) => setEvents((p) => [...p, e])} />
      {next ? <p className="mt-3 font-bold text-teal">{c.nextBreak(Math.max(0, diffDays(now, next.date)), next.title)}</p> : null}
      {events.length ? <div className="mt-4"><Chips<EventKind | ""> value={filter} onChange={setFilter} label={c.kind} options={[{ id: "", label: c.all }, ...EVENT_KINDS.map((k) => ({ id: k, label: c.eventKinds[k] }))]} /></div> : null}
      {events.length === 0 ? <Empty>{c.empty}</Empty> : months.map((m) => (
        <section key={m} className="mt-6"><h2 className="border-b-[1.5px] border-ink pb-1 text-2xl capitalize">{monthLabel(m + "-01", lang)}</h2>
          <ul className="divide-y-2 divide-dotted divide-line">{sorted.filter((e) => e.date.startsWith(m)).map((e) => (
            <li key={e.id} className="flex items-center gap-3 py-2.5"><div className="min-w-0 flex-1"><p className="font-bold">{e.title}</p><p className="text-sm text-muted">{c.eventKinds[e.kind]} · {rangeText(e, lang)}</p></div>{del(e.title, c.remove, () => setEvents((p) => p.filter((x) => x.id !== e.id)))}</li>))}</ul></section>))}
    </Head>
  );
}

export function SemesterTool() {
  const c = useCopy(copy);
  const lang = useLang();
  const [events, setEvents] = useLocalDoc<SchoolEvent[]>(EVENTS_KEY, NO_EVENTS);
  const [homework] = useLocalDoc<Assignment[]>(HOMEWORK_KEY, NO_ASSIGNMENTS);
  const now = today();
  const big = events.filter((e) => ["test", "project", "break"].includes(e.kind));
  const weeks = useMemo(() => {
    const start = startOfWeek(now);
    return Array.from({ length: 18 }, (_, i) => addDays(start, i * 7)).map((w) => {
      const end = addDays(w, 6);
      const ev = big.filter((e) => e.date <= end && (e.end ?? e.date) >= w);
      const hw = homework.filter((h) => !h.done && h.due >= w && h.due <= end);
      return { w, ev, hw, n: ev.filter((e) => e.kind !== "break").length + hw.length };
    }).filter((x) => x.ev.length || x.hw.length);
  }, [big, homework, now]);
  return (
    <Head title={c.smTitle} lead={c.smLead} wide>
      <EventForm c={c} kinds={["test", "project", "break"]} onAdd={(e) => setEvents((p) => [...p, e])} />
      {weeks.length === 0 ? <Empty>{c.noWeeks}</Empty> : <ol className="mt-6 space-y-3">{weeks.map(({ w, ev, hw, n }) => (
        <li key={w} className={`guide-card p-4 ${n >= 4 ? "border-l-[6px] border-l-ruby" : ""}`}>
          <div className="flex flex-wrap items-baseline justify-between gap-2"><h2 className="text-xl">{w === startOfWeek(now) ? c.thisWeek : c.weekOf(formatDay(w, lang, false))}</h2><span className="text-sm font-bold text-muted">{c.items(n)}{n >= 4 ? ` · ${c.crunch}` : ""}</span></div>
          <ul className="mt-2 flex flex-wrap gap-2">{ev.map((e) => <li key={e.id} className={`rounded-md border-[1.5px] border-ink px-2 py-1 text-sm font-bold ${e.kind === "test" ? "bg-ruby text-on-ruby" : e.kind === "project" ? "bg-marigold text-on-marigold" : "bg-teal text-on-teal"}`}>{c.eventKinds[e.kind]}: {e.title} · {rangeText(e, lang)}</li>)}
            {hw.map((h) => <li key={h.id} className="rounded-md border-[1.5px] border-ink bg-surface px-2 py-1 text-sm">{h.title}{h.cls ? ` (${h.cls})` : ""} · {formatDay(h.due, lang)}</li>)}</ul>
        </li>))}</ol>}
    </Head>
  );
}

function ClassForm({ c, kind, onAdd }: { c: C; kind: ScheduleDoc["kind"]; onAdd: (x: ClassItem) => void }) {
  const [f, setF] = useState({ name: "", room: "", start: "08:00", end: "08:50", bring: "" });
  const [days, setDays] = useState<string[]>([]);
  const [err, setErr] = useState<string | null>(null);
  const opts = kind === "ab" ? ["A", "B"] : DAY_KEYS.slice(0, 5);
  const toggle = (d: string) => setDays((p) => (p.includes(d) ? p.filter((x) => x !== d) : [...p, d]));
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!f.name.trim()) return setErr(c.needClass);
    if (!validRange(f.start, f.end)) return setErr(c.needTime);
    if (!days.length) return setErr(c.needDays);
    setErr(null);
    onAdd({ id: crypto.randomUUID(), name: f.name.trim(), room: f.room.trim(), start: f.start, end: f.end, days: [...days], bring: f.bring.trim() });
    setF({ ...f, name: "", room: "", bring: "" });
  };
  return (
    <form onSubmit={submit} className="guide-card mt-5 p-5" noValidate>
      <div className="grid gap-x-4 gap-y-3 sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_1fr]">
        <label><span className="block font-bold">{c.className}</span><input value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} placeholder={c.classPh} maxLength={60} className={`${inputClass} mt-1`} /></label>
        <label><span className="block font-bold">{c.room}</span><input value={f.room} onChange={(e) => setF({ ...f, room: e.target.value })} maxLength={20} className={`${inputClass} mt-1`} /></label>
        <label><span className="block font-bold">{c.start}</span><input type="time" value={f.start} onChange={(e) => setF({ ...f, start: e.target.value })} className={`${inputClass} mt-1`} /></label>
        <label><span className="block font-bold">{c.end}</span><input type="time" value={f.end} onChange={(e) => setF({ ...f, end: e.target.value })} className={`${inputClass} mt-1`} /></label>
      </div>
      <fieldset className="mt-3"><legend className="font-bold">{c.meets}</legend><div className="mt-1 flex flex-wrap gap-2">{opts.map((d) => <button type="button" key={d} onClick={() => toggle(d)} aria-pressed={days.includes(d)} className={`rounded-full border-[1.5px] border-ink px-4 py-1.5 font-bold ${days.includes(d) ? "bg-ink text-paper" : "bg-surface hover:bg-sunken"}`}>{kind === "ab" ? d : c.days[d]}</button>)}</div></fieldset>
      <label className="mt-3 block"><span className="block font-bold">{c.bring}</span><input value={f.bring} onChange={(e) => setF({ ...f, bring: e.target.value })} placeholder={c.bringPh} maxLength={80} className={`${inputClass} mt-1`} /></label>
      {err ? <p role="alert" className="mt-2 font-bold text-ruby">{err}</p> : null}
      <button className={`${buttonClass.primary} mt-4`}><Plus size={18} />{c.addClass}</button>
    </form>
  );
}

export function ScheduleTool() {
  const c = useCopy(copy);
  const lang = useLang();
  const [s, setS] = useLocalDoc<ScheduleDoc>(SCHEDULE_KEY, NO_SCHEDULE);
  const now = today(), tomorrow = addDays(now, 1);
  const letter = (d: string): AB | null => (s.anchor ? abDayFor(d, s.anchor) : null);
  const dayList = (d: string, label: string) => {
    const list = classesOn(d, s);
    return <section className="guide-card p-4"><h2 className="text-xl">{label}{s.kind === "ab" && letter(d) ? ` · ${letter(d)}` : ""}</h2>
      {list.length ? <ul className="mt-2 divide-y-2 divide-dotted divide-line">{list.map((x) => <li key={x.id} className="py-2"><p className="font-bold">{x.name}{x.room ? ` · ${x.room}` : ""}</p><p className="text-sm text-muted">{fmtTime(x.start, lang)} – {fmtTime(x.end, lang)}</p></li>)}</ul> : <p className="mt-2 text-muted">{s.kind === "ab" && !s.anchor ? c.setAb : c.noClasses}</p>}</section>;
  };
  return (
    <Head title={c.scTitle} lead={c.scLead} wide>
      <div className="mt-5 flex flex-wrap items-center gap-4">
        <Chips<ScheduleDoc["kind"]> value={s.kind} onChange={(kind) => setS((p) => ({ ...p, kind, classes: kind === p.kind ? p.classes : [] }))} label={c.scKind} options={[{ id: "weekdays", label: c.weekdays }, { id: "ab", label: c.ab }]} />
        {s.kind === "ab" ? <div className="flex items-center gap-2" role="group" aria-label={c.todayIs}><span className="font-bold">{c.todayIs}</span>{(["A", "B"] as const).map((d) => <button key={d} onClick={() => setS((p) => ({ ...p, anchor: { date: now, day: d } }))} aria-pressed={s.anchor?.date === now && s.anchor.day === d} className={`rounded-full border-[1.5px] border-ink px-4 py-1.5 font-bold ${s.anchor?.date === now && s.anchor.day === d ? "bg-ink text-paper" : "bg-surface hover:bg-sunken"}`}>{d === "A" ? c.aDay : c.bDay}</button>)}</div> : null}
      </div>
      {s.kind === "ab" ? <p className="mt-2 text-sm text-muted">{c.abNote}</p> : null}
      <ClassForm c={c} kind={s.kind} onAdd={(x) => setS((p) => ({ ...p, classes: [...p.classes, x] }))} />
      <div className="mt-6 grid gap-4 md:grid-cols-2">{dayList(now, c.todayH)}{dayList(tomorrow, c.tomorrowH)}</div>
      {s.classes.length ? <ul className="mt-6 divide-y-2 divide-dotted divide-line">{[...s.classes].sort((a, b) => toMin(a.start) - toMin(b.start)).map((x) => (
        <li key={x.id} className="flex items-center gap-3 py-2.5"><div className="min-w-0 flex-1"><p className="font-bold">{x.name}{x.room ? ` · ${x.room}` : ""}</p><p className="text-sm text-muted">{x.days.map((d) => (s.kind === "ab" ? d : c.days[d])).join(", ")} · {fmtTime(x.start, lang)} – {fmtTime(x.end, lang)}{x.bring ? ` · ${x.bring}` : ""}</p></div>{del(x.name, c.remove, () => setS((p) => ({ ...p, classes: p.classes.filter((y) => y.id !== x.id) })))}</li>))}</ul> : null}
    </Head>
  );
}

export function WeeklyTool({ layer }: { layer: "all" | "sports" }) {
  const c = useCopy(copy);
  const lang = useLang();
  const [blocks, setBlocks] = useLocalDoc<Block[]>(BLOCKS_KEY, NO_BLOCKS);
  const [sched] = useLocalDoc<ScheduleDoc>(SCHEDULE_KEY, NO_SCHEDULE);
  const [showClasses, setShowClasses] = useState(false);
  const [f, setF] = useState({ title: "", kind: (layer === "sports" ? "practice" : "study") as BlockKind, start: "16:00", end: "17:30" });
  const [days, setDays] = useState<number[]>([]);
  const [err, setErr] = useState<string | null>(null);
  const shown = blocks.filter((b) => layer === "all" || b.kind === "practice");
  const slots: Slot[] = blocks.map((b) => ({ id: b.id, label: b.title, day: b.day, start: b.start, end: b.end }));
  const conflicts = findConflicts(slots).length;
  const add = (e: React.FormEvent) => {
    e.preventDefault();
    if (!f.title.trim() || !days.length) return setErr(c.needBlock);
    if (!validRange(f.start, f.end)) return setErr(c.needTime);
    setErr(null);
    setBlocks((p) => [...p, ...days.map((day) => ({ id: crypto.randomUUID(), title: f.title.trim(), day, start: f.start, end: f.end, kind: (layer === "sports" ? "practice" : f.kind) as BlockKind }))]);
    setF({ ...f, title: "" });
  };
  const KIND_BG: Record<BlockKind, string> = { school: "bg-teal/25", practice: "bg-ruby/20", work: "bg-marigold/30", study: "bg-surface", other: "bg-sunken" };
  const totalHours = shown.reduce((n, b) => n + blockHours(b), 0);
  return (
    <Head title={layer === "sports" ? c.spTitle : c.wkTitle} lead={layer === "sports" ? c.spLead : c.wkLead} wide>
      <form onSubmit={add} className="guide-card mt-5 p-5" noValidate>
        <div className="grid gap-x-4 gap-y-3 sm:grid-cols-2 lg:grid-cols-[2fr_1.3fr_1fr_1fr]">
          <label><span className="block font-bold">{c.titleL}</span><input value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} placeholder={c.titlePh} maxLength={60} className={`${inputClass} mt-1`} /></label>
          {layer === "all" ? <label><span className="block font-bold">{c.kind}</span><select value={f.kind} onChange={(e) => setF({ ...f, kind: e.target.value as BlockKind })} className={`${inputClass} mt-1`}>{BLOCK_KINDS.map((k) => <option key={k} value={k}>{c.blockKinds[k]}</option>)}</select></label> : <span />}
          <label><span className="block font-bold">{c.start}</span><input type="time" value={f.start} onChange={(e) => setF({ ...f, start: e.target.value })} className={`${inputClass} mt-1`} /></label>
          <label><span className="block font-bold">{c.end}</span><input type="time" value={f.end} onChange={(e) => setF({ ...f, end: e.target.value })} className={`${inputClass} mt-1`} /></label>
        </div>
        <fieldset className="mt-3"><legend className="font-bold">{c.daysL}</legend><div className="mt-1 flex flex-wrap gap-2">{DAY_KEYS.map((d, i) => <button type="button" key={d} onClick={() => setDays((p) => (p.includes(i) ? p.filter((x) => x !== i) : [...p, i]))} aria-pressed={days.includes(i)} className={`rounded-full border-[1.5px] border-ink px-4 py-1.5 font-bold ${days.includes(i) ? "bg-ink text-paper" : "bg-surface hover:bg-sunken"}`}>{c.days[d]}</button>)}</div></fieldset>
        {err ? <p role="alert" className="mt-2 font-bold text-ruby">{err}</p> : null}
        <button className={`${buttonClass.primary} mt-4`}><Plus size={18} />{c.addBlock}</button>
      </form>
      <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2"><p className="font-bold text-teal">{c.hoursWeek(totalHours)}</p>
        {conflicts ? <Link href="/t/calendar/conflicts" className="font-bold text-ruby underline underline-offset-4">{c.conflictsFound(conflicts)}</Link> : null}
        {sched.classes.length ? <label className="flex items-center gap-2 font-bold"><input type="checkbox" checked={showClasses} onChange={(e) => setShowClasses(e.target.checked)} className="h-5 w-5 accent-[var(--c-teal)]" />{c.showClasses}</label> : null}</div>
      {shown.length === 0 ? <Empty>{c.noBlocks}</Empty> : null}
      <div className="mt-4 grid gap-3 md:grid-cols-2 lg:grid-cols-4">{c.dayFull.map((name, i) => {
        const dayBlocks = shown.filter((b) => b.day === i).sort((a, b) => toMin(a.start) - toMin(b.start));
        const dayClasses = showClasses && i < 5 ? sched.classes.filter((x) => (sched.kind === "weekdays" ? x.days.includes(DAY_KEYS[i]) : true)) : [];
        return <section key={name} className="guide-card p-3" aria-label={name}><h2 className="text-lg">{name}</h2>
          <ul className="mt-2 space-y-1.5">{dayClasses.map((x) => <li key={x.id} className="rounded-md border border-dashed border-ink px-2 py-1 text-sm text-muted">{fmtTime(x.start, lang)} {x.name}</li>)}
            {dayBlocks.map((b) => <li key={b.id} className={`flex items-start gap-1 rounded-md border-[1.5px] border-ink px-2 py-1 ${KIND_BG[b.kind]}`}><div className="min-w-0 flex-1"><p className="font-bold leading-tight">{b.title}</p><p className="text-xs">{fmtTime(b.start, lang)} – {fmtTime(b.end, lang)} · {c.blockKinds[b.kind]}</p></div>
              <button onClick={() => setBlocks((p) => p.filter((x) => x.id !== b.id))} aria-label={`${c.remove}: ${b.title}, ${name}`} className="grid h-8 w-8 shrink-0 place-items-center rounded hover:bg-sunken"><Trash2 size={15} /></button></li>)}</ul></section>;
      })}</div>
    </Head>
  );
}

export function ConflictsTool() {
  const c = useCopy(copy);
  const lang = useLang();
  const [blocks] = useLocalDoc<Block[]>(BLOCKS_KEY, NO_BLOCKS);
  const [sched] = useLocalDoc<ScheduleDoc>(SCHEDULE_KEY, NO_SCHEDULE);
  const now = today();
  const found = useMemo(() => {
    const out: { date: string; a: Slot; b: Slot }[] = [];
    for (let i = 0; i < 14; i++) {
      const date = addDays(now, i), di = dayIndex(date);
      const slots: Slot[] = [...classesOn(date, sched).map((x) => ({ id: "c" + x.id, label: x.name, day: di, start: x.start, end: x.end })), ...blocks.filter((b) => b.day === di).map((b) => ({ id: b.id, label: b.title, day: di, start: b.start, end: b.end }))];
      findConflicts(slots).forEach(([a, b]) => out.push({ date, a, b }));
    }
    return out;
  }, [blocks, sched, now]);
  const hasData = blocks.length > 0 || sched.classes.length > 0;
  return (
    <Head title={c.cfTitle} lead={c.cfLead}>
      {!hasData ? <Empty>{c.cfNothing}</Empty> : found.length === 0 ? <section className="guide-card mt-6 p-5"><p className="font-display text-2xl font-semibold text-teal" role="status">{c.cfNone}</p><p className="text-sm text-muted">{c.scanned(14)}</p></section> : (
        <ul className="mt-6 space-y-3" aria-live="polite">{found.map(({ date, a, b }, i) => <li key={i} className="guide-card border-l-[6px] border-l-ruby p-4"><p className="font-bold">{formatDay(date, lang)}</p><p>{a.label} ({fmtTime(a.start, lang)}–{fmtTime(a.end, lang)}) {c.vs} {b.label} ({fmtTime(b.start, lang)}–{fmtTime(b.end, lang)})</p></li>)}</ul>
      )}
    </Head>
  );
}

type TimeBlocks = Record<string, Record<string, string>>;
const NO_TB: TimeBlocks = {};
export function TimeBlockTool() {
  const c = useCopy(copy);
  const [tb, setTb] = useLocalDoc<TimeBlocks>("timeblocks", NO_TB);
  const [tasks] = useLocalDoc<Task[]>(TASKS_KEY, NO_TASKS);
  const [homework] = useLocalDoc<Assignment[]>(HOMEWORK_KEY, NO_ASSIGNMENTS);
  const [date, setDate] = useState(today());
  const day = tb[date] ?? {};
  const set = (h: number, text: string) => setTb((p) => {
    const next = { ...(p[date] ?? {}) }; if (text) next[String(h)] = text; else delete next[String(h)];
    const keep = Object.keys(p).filter((k) => k !== date).sort().slice(-59);
    return { ...Object.fromEntries(keep.map((k) => [k, p[k]])), ...(Object.keys(next).length ? { [date]: next } : {}) };
  });
  const options = [...tasks.filter((t) => !t.done).map((t) => t.title), ...homework.filter((h) => !h.done).map((h) => (h.cls ? `${h.title} (${h.cls})` : h.title))];
  const hours = Array.from({ length: 17 }, (_, i) => i + 6);
  const fmt = (h: number) => fmtTime(`${h}:00`);
  return (
    <Head title={c.tbTitle} lead={c.tbLead}>
      <div className="mt-5 flex flex-wrap items-end gap-4"><label><span className="block font-bold">{c.dateL}</span><input type="date" value={date} onChange={(e) => e.target.value && setDate(e.target.value)} className={`${inputClass} mt-1`} /></label>
        <p className="pb-3 font-bold text-teal" aria-live="polite">{c.fills(Object.keys(day).length)}</p>
        {Object.keys(day).length ? <button onClick={() => setTb((p) => { const n = { ...p }; delete n[date]; return n; })} className="pb-3 font-bold text-ruby underline underline-offset-4">{c.clearDay}</button> : null}</div>
      <ol className="mt-4 divide-y-2 divide-dotted divide-line">{hours.map((h) => (
        <li key={h} className="flex flex-wrap items-center gap-3 py-1.5"><span className="w-20 shrink-0 font-bold tabular-nums">{fmt(h)}</span>
          <label className="min-w-0 flex-1"><span className="sr-only">{c.hour} {fmt(h)}</span><input value={day[String(h)] ?? ""} onChange={(e) => set(h, e.target.value)} placeholder={c.slotPh} maxLength={80} className={`${inputClass} !py-1.5`} /></label>
          {options.length ? <label><span className="sr-only">{c.fromList} {fmt(h)}</span><select value="" onChange={(e) => e.target.value && set(h, e.target.value)} className="rounded-md border-[1.5px] border-ink bg-surface px-2 py-1.5"><option value="">{c.fromList}</option>{options.map((o) => <option key={o}>{o}</option>)}</select></label> : null}</li>))}</ol>
    </Head>
  );
}

export function OverloadTool() {
  const c = useCopy(copy);
  const lang = useLang();
  const [events] = useLocalDoc<SchoolEvent[]>(EVENTS_KEY, NO_EVENTS);
  const [homework] = useLocalDoc<Assignment[]>(HOMEWORK_KEY, NO_ASSIGNMENTS);
  const [blocks] = useLocalDoc<Block[]>(BLOCKS_KEY, NO_BLOCKS);
  const now = today();
  const commit = blocks.filter((b) => b.kind !== "study").reduce((n, b) => n + blockHours(b), 0);
  const weeks = Array.from({ length: 6 }, (_, i) => addDays(startOfWeek(now), i * 7)).map((w) => {
    const end = addDays(w, 6);
    const tests = events.filter((e) => e.kind === "test" && e.date >= w && e.date <= end).length, projects = events.filter((e) => e.kind === "project" && e.date >= w && e.date <= end).length;
    const hw = homework.filter((h) => !h.done && h.due >= w && h.due <= end).length;
    const score = weekScore({ tests, projects, homework: hw, commitmentHours: commit });
    return { w, tests, projects, hw, score, level: levelOf(score) };
  });
  const max = Math.max(...weeks.map((x) => x.score), 1);
  const heaviest = [...weeks].sort((a, b) => b.score - a.score)[0], lightest = [...weeks].filter((x) => x.w > now).sort((a, b) => a.score - b.score)[0];
  return (
    <Head title={c.ovTitle} lead={c.ovLead}>
      <ol className="mt-6 space-y-3">{weeks.map((x) => (
        <li key={x.w} className="guide-card p-4"><div className="flex flex-wrap items-baseline justify-between gap-2"><h2 className="text-lg">{c.ovWeek}: {formatDay(x.w, lang, false)}</h2>
          <span className={`rounded-full border-[1.5px] border-ink px-3 py-0.5 text-sm font-bold ${x.level === "heavy" ? "bg-ruby text-on-ruby" : x.level === "medium" ? "bg-marigold text-on-marigold" : "bg-teal text-on-teal"}`}>{c.levels[x.level]}</span></div>
          <div className="mt-2 h-3 overflow-hidden rounded-full border-[1.5px] border-ink bg-sunken" role="img" aria-label={`${c.score}: ${Math.round(x.score)}`}><div className={`h-full ${x.level === "heavy" ? "bg-ruby" : x.level === "medium" ? "bg-marigold" : "bg-teal"}`} style={{ width: `${(x.score / max) * 100}%` }} /></div>
          <p className="mt-2 text-sm text-muted">{x.tests} {c.ts} · {x.projects} {c.pj} · {x.hw} {c.hw} · {Math.round(commit * 10) / 10} {c.cm}</p></li>))}</ol>
      <Callout>{heaviest.level === "heavy" && lightest ? c.ovAdvice(formatDay(lightest.w, lang, false)) : c.ovAllLight}</Callout>
      <p className="mt-3 max-w-prose text-sm text-muted">{c.ovHow}</p>
    </Head>
  );
}

const ALL_KINDS: CalItem["kind"][] = ["opportunity", "homework", "countdown", "event"];
export function ExportTool() {
  const c = useCopy(copy);
  const [saved] = useLocalDoc<SavedListing[]>("saved-opportunities", NO_SAVED);
  const [homework] = useLocalDoc<Assignment[]>(HOMEWORK_KEY, NO_ASSIGNMENTS);
  const [countdowns] = useLocalDoc<{ id: string; name: string; date: string }[]>("countdowns", NO_COUNTS);
  const [events] = useLocalDoc<SchoolEvent[]>(EVENTS_KEY, NO_EVENTS);
  const [on, setOn] = useState<Record<string, boolean>>({ opportunity: true, homework: true, countdown: true, event: true });
  const now = today();
  const items = collectItems({ saved, homework, countdowns, events, now }).filter((i) => on[i.kind] && i.date >= now);
  const download = () => {
    const ics = buildICS(items.map((i) => ({ uid: i.id.replace(/[^a-z0-9-]/gi, "").slice(0, 60) + "-" + i.date, date: i.date, title: i.title, description: i.href })), { name: "Rumbo deadlines" });
    const url = URL.createObjectURL(new Blob([ics], { type: "text/calendar;charset=utf-8" }));
    const a = document.createElement("a"); a.href = url; a.download = "rumbo-deadlines.ics"; document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(url), 1000);
  };
  return (
    <Head title={c.exTitle} lead={c.exLead}>
      <section className="guide-card mt-5 p-5"><h2 className="text-xl">{c.include}</h2>
        <div className="mt-2 grid gap-2 sm:grid-cols-2">{ALL_KINDS.map((k) => <label key={k} className="flex items-center gap-2 font-bold"><input type="checkbox" checked={on[k]} onChange={(e) => setOn({ ...on, [k]: e.target.checked })} className="h-5 w-5 accent-[var(--c-teal)]" />{c.kindsEx[k]}</label>)}</div>
        <p className="mt-3 font-bold text-teal" aria-live="polite">{c.count(items.length)}</p>
        <button onClick={download} disabled={!items.length} className={`${buttonClass.primary} mt-3`}>{c.download}</button>
        {!items.length ? <p className="mt-2 text-muted">{c.none}</p> : null}</section>
      <h2 className="mt-8 border-b-[1.5px] border-ink pb-1 text-2xl">{c.how}</h2>
      <ol className="mt-3 list-decimal space-y-2 pl-6 text-lg">{c.steps.map((s) => <li key={s} className="max-w-prose">{s}</li>)}</ol>
      <Callout>{c.exNote}</Callout>
    </Head>
  );
}
