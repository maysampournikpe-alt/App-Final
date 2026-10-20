"use client";
import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { diffDays, formatDay, isValidISO, today } from "@/lib/dates";
import { useLang } from "@/lib/i18n";
import { useLocalDoc } from "@/lib/local-doc";
import { useCopy } from "@/lib/use-copy";
import { EmptyTrail } from "../art";
import { buttonClass, Field, inputClass, Page } from "../ui";

interface Event { id: string; name: string; date: string }
const KEY = "countdowns";
const NONE: Event[] = [];

const copy = {
  en: {
    title: "Countdown widgets", lead: "Days until the things you are working toward.", name: "What is it?", ph: "SAT test day", date: "Date", add: "Add countdown",
    needName: "Write what it is.", needDate: "Pick a date.", empty: "No countdowns yet. Add a test, a tournament or a deadline.", remove: "Remove",
    days: (n: number) => (n === 0 ? "Today" : n === 1 ? "Tomorrow" : `${n}`), unit: (n: number): string => (n === 0 || n === 1 ? "" : "days to go"), past: (n: number) => `${-n} day${n === -1 ? "" : "s"} ago`,
    weeks: (n: number) => (n >= 14 ? `about ${Math.round(n / 7)} weeks` : ""),
  },
  es: {
    title: "Cuentas regresivas", lead: "Los días que faltan para lo que estás preparando.", name: "¿Qué es?", ph: "Día del SAT", date: "Fecha", add: "Agregar cuenta",
    needName: "Escribe qué es.", needDate: "Elige una fecha.", empty: "Todavía no hay cuentas. Agrega un examen, un torneo o una fecha límite.", remove: "Quitar",
    days: (n: number) => (n === 0 ? "Hoy" : n === 1 ? "Mañana" : `${n}`), unit: (n: number): string => (n === 0 || n === 1 ? "" : "días restantes"), past: (n: number) => `hace ${-n} día${n === -1 ? "" : "s"}`,
    weeks: (n: number) => (n >= 14 ? `unas ${Math.round(n / 7)} semanas` : ""),
  },
};

export function CountdownTool() {
  const c = useCopy(copy);
  const lang = useLang();
  const [events, setEvents] = useLocalDoc<Event[]>(KEY, NONE);
  const [name, setName] = useState("");
  const [date, setDate] = useState("");
  const [err, setErr] = useState<"name" | "date" | null>(null);
  const now = today();
  const sorted = [...events].sort((a, b) => a.date.localeCompare(b.date));
  const upcoming = sorted.filter((e) => e.date >= now), past = sorted.filter((e) => e.date < now);

  const add = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return setErr("name");
    if (!isValidISO(date)) return setErr("date");
    setErr(null);
    setEvents((p) => [...p, { id: crypto.randomUUID(), name: name.trim(), date }]);
    setName(""); setDate("");
  };
  const row = (e: Event, n: number) => (
    <li key={e.id} className="guide-card flex items-center gap-4 p-4">
      <div className="w-24 shrink-0 text-center">
        <p className={`font-display text-4xl font-semibold leading-none ${n < 0 ? "text-muted" : n <= 7 ? "text-ruby" : "text-teal"}`}>{n < 0 ? "–" : c.days(n)}</p>
        <p className="mt-1 text-xs font-bold text-muted">{n < 0 ? c.past(n) : c.unit(n)}</p>
      </div>
      <div className="min-w-0 flex-1"><p className="font-bold">{e.name}</p><p className="text-sm text-muted">{formatDay(e.date, lang)}{n >= 14 ? ` · ${c.weeks(n)}` : ""}</p></div>
      <button onClick={() => setEvents((p) => p.filter((x) => x.id !== e.id))} aria-label={`${c.remove}: ${e.name}`} className="grid h-10 w-10 shrink-0 place-items-center rounded-md hover:bg-sunken"><Trash2 size={18} strokeWidth={1.75} /></button>
    </li>
  );

  return (
    <Page>
      <h1 className="text-3xl sm:text-4xl">{c.title}</h1>
      <p className="mt-2 max-w-prose text-muted">{c.lead}</p>
      <form onSubmit={add} className="guide-card mt-6 grid gap-x-4 p-5 sm:grid-cols-[2fr_1fr_auto] sm:items-start" noValidate>
        <Field label={c.name} error={err === "name" ? c.needName : null}>{(p) => <input {...p} value={name} onChange={(e) => setName(e.target.value)} placeholder={c.ph} maxLength={60} className={inputClass} />}</Field>
        <Field label={c.date} error={err === "date" ? c.needDate : null}>{(p) => <input {...p} type="date" value={date} onChange={(e) => setDate(e.target.value)} className={inputClass} />}</Field>
        <div className="sm:pt-7"><button className={buttonClass.primary}><Plus size={18} />{c.add}</button></div>
      </form>
      {events.length === 0 ? (
        <div className="guide-card mt-8 flex max-w-xl items-center gap-5 p-5"><EmptyTrail className="h-24 w-36 shrink-0 text-ink" /><p className="text-lg">{c.empty}</p></div>
      ) : (
        <>
          <ul className="mt-8 space-y-3">{upcoming.map((e) => row(e, diffDays(now, e.date)))}</ul>
          {past.length ? <ul className="mt-6 space-y-3 opacity-70">{past.map((e) => row(e, diffDays(now, e.date)))}</ul> : null}
        </>
      )}
    </Page>
  );
}
