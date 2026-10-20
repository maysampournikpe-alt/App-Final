"use client";
import { useMemo, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { formatDay, today } from "@/lib/dates";
import { useLocalDoc } from "@/lib/local-doc";
import { averageFocus, hoursText, NO_SESSIONS, SESSIONS_KEY, weekBySubject, weeklyTotals, type Session } from "@/lib/study";
import { useCopy } from "@/lib/use-copy";
import { useLang } from "@/lib/i18n";
import { EmptyTrail } from "../art";
import { buttonClass, inputClass, Page } from "../ui";

const copy = {
  en: {
    logTitle: "Study session logger", logLead: "Write down what you studied, how long, and how focused you felt.", statsTitle: "Study stats", statsLead: "Where your study time goes.",
    subject: "Subject", subjectPh: "Algebra", minutes: "Minutes", date: "Date", focus: "How focused?", add: "Log session", needSubject: "Write the subject.", needMin: "Enter minutes from 1 to 600.",
    focusNames: ["Distracted", "Low", "Okay", "Good", "Locked in"], recent: "Recent sessions", empty: "No sessions yet. Log your first one above.", remove: "Remove",
    thisWeek: "This week by subject", last8: "Last 8 weeks", total: "Total this week", avg: "Average focus", of5: "out of 5", sessions: "sessions logged", none: "Nothing logged this week.", weekOf: (d: string) => `Week of ${d}`,
    tip: "Short, focused sessions beat long, distracted ones. Notice which subjects get less time than you want.",
  },
  es: {
    logTitle: "Registro de sesiones", logLead: "Anota lo que estudiaste, cuánto tiempo y qué tan concentrado estabas.", statsTitle: "Estadísticas de estudio", statsLead: "A dónde se va tu tiempo de estudio.",
    subject: "Materia", subjectPh: "Álgebra", minutes: "Minutos", date: "Fecha", focus: "¿Qué tan concentrado?", add: "Anotar sesión", needSubject: "Escribe la materia.", needMin: "Escribe minutos de 1 a 600.",
    focusNames: ["Distraído", "Poco", "Normal", "Bien", "Muy concentrado"], recent: "Sesiones recientes", empty: "Todavía no hay sesiones. Anota la primera arriba.", remove: "Quitar",
    thisWeek: "Esta semana por materia", last8: "Últimas 8 semanas", total: "Total de esta semana", avg: "Concentración promedio", of5: "de 5", sessions: "sesiones anotadas", none: "No hay nada anotado esta semana.", weekOf: (d: string) => `Semana del ${d}`,
    tip: "Las sesiones cortas y concentradas valen más que las largas y distraídas. Fíjate en qué materias reciben menos tiempo del que quieres.",
  },
};

export function FocusLogTool({ view }: { view: "logger" | "stats" }) {
  const c = useCopy(copy);
  const lang = useLang();
  const [sessions, setSessions] = useLocalDoc<Session[]>(SESSIONS_KEY, NO_SESSIONS);
  const [subject, setSubject] = useState("");
  const [minutes, setMinutes] = useState("30");
  const [date, setDate] = useState(today());
  const [focus, setFocus] = useState<1 | 2 | 3 | 4 | 5>(4);
  const [err, setErr] = useState<"subject" | "min" | null>(null);
  const now = today();
  const subjects = useMemo(() => [...new Set(sessions.map((s) => s.subject))].sort(), [sessions]);

  const add = (e: React.FormEvent) => {
    e.preventDefault();
    const m = parseInt(minutes, 10);
    if (!subject.trim()) return setErr("subject");
    if (!(m >= 1 && m <= 600)) return setErr("min");
    setErr(null);
    setSessions((p) => [{ id: crypto.randomUUID(), date, subject: subject.trim(), minutes: m, focus }, ...p].slice(0, 1000));
    setSubject("");
  };

  if (view === "stats") {
    const week = weekBySubject(sessions, now), weeks = weeklyTotals(sessions, now, 8);
    const total = week.reduce((n, w) => n + w.minutes, 0), maxWeek = Math.max(...weeks.map((w) => w.minutes), 1), maxSub = Math.max(...week.map((w) => w.minutes), 1);
    return (
      <Page>
        <h1 className="text-3xl sm:text-4xl">{c.statsTitle}</h1>
        <p className="mt-2 max-w-prose text-muted">{c.statsLead}</p>
        {sessions.length === 0 ? <div className="guide-card mt-6 flex max-w-xl items-center gap-5 p-5"><EmptyTrail className="h-24 w-36 shrink-0 text-ink" /><p className="text-lg">{c.empty}</p></div> : (
          <>
            <dl className="mt-6 grid gap-3 sm:grid-cols-3">
              <div className="guide-card p-4"><dt className="text-sm font-bold text-muted">{c.total}</dt><dd className="font-display text-3xl font-semibold text-teal">{hoursText(total)}</dd></div>
              <div className="guide-card p-4"><dt className="text-sm font-bold text-muted">{c.avg}</dt><dd className="font-display text-3xl font-semibold">{averageFocus(sessions)} <span className="text-base font-normal text-muted">{c.of5}</span></dd></div>
              <div className="guide-card p-4"><dt className="text-sm font-bold text-muted">{sessions.length}</dt><dd className="font-display text-xl font-semibold">{c.sessions}</dd></div>
            </dl>
            <section className="guide-card mt-6 p-5" aria-labelledby="by-sub"><h2 id="by-sub" className="text-2xl">{c.thisWeek}</h2>
              {week.length ? <ul className="mt-3 space-y-2">{week.map((w) => (
                <li key={w.subject} className="flex items-center gap-3"><span className="w-28 shrink-0 truncate font-bold">{w.subject}</span>
                  <span className="h-5 flex-1 rounded-sm bg-sunken" aria-hidden><span className="block h-full rounded-sm bg-teal" style={{ width: `${(w.minutes / maxSub) * 100}%` }} /></span>
                  <span className="w-24 shrink-0 whitespace-nowrap text-right font-bold tabular-nums">{hoursText(w.minutes)}</span></li>))}</ul> : <p className="mt-2 text-muted">{c.none}</p>}
            </section>
            <section className="guide-card mt-6 p-5" aria-labelledby="by-wk"><h2 id="by-wk" className="text-2xl">{c.last8}</h2>
              <ol className="mt-3 flex h-40 items-end gap-2">{weeks.map((w) => (
                <li key={w.start} className="flex h-full flex-1 flex-col items-center justify-end" title={`${c.weekOf(formatDay(w.start, lang, false))}: ${hoursText(w.minutes)}`}>
                  <span className="text-xs font-bold tabular-nums">{w.minutes ? Math.round((w.minutes / 60) * 10) / 10 : ""}</span>
                  <span className="w-full rounded-t-sm bg-teal" style={{ height: `${(w.minutes / maxWeek) * 100}%`, minHeight: w.minutes ? 4 : 0 }} />
                  <span className="mt-1 text-[0.65rem] text-muted">{formatDay(w.start, lang, false)}</span></li>))}</ol>
            </section>
            <p className="mt-6 max-w-prose text-sm text-muted">{c.tip}</p>
          </>
        )}
      </Page>
    );
  }

  return (
    <Page wide>
      <h1 className="text-3xl sm:text-4xl">{c.logTitle}</h1>
      <p className="mt-2 max-w-prose text-muted">{c.logLead}</p>
      <form onSubmit={add} className="guide-card mt-6 grid gap-x-4 p-5 sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_auto] lg:items-start" noValidate>
        <label className="mb-4 block"><span className="block font-bold">{c.subject}</span>
          <input list="subjects" value={subject} onChange={(e) => setSubject(e.target.value)} placeholder={c.subjectPh} maxLength={40} aria-invalid={err === "subject"} className={`${inputClass} mt-1`} />
          {err === "subject" ? <span role="alert" className="mt-1 block text-sm font-bold text-ruby">{c.needSubject}</span> : null}</label>
        <datalist id="subjects">{subjects.map((s) => <option key={s} value={s} />)}</datalist>
        <label className="mb-4 block"><span className="block font-bold">{c.minutes}</span>
          <input inputMode="numeric" value={minutes} onChange={(e) => setMinutes(e.target.value)} aria-invalid={err === "min"} className={`${inputClass} mt-1`} />
          {err === "min" ? <span role="alert" className="mt-1 block text-sm font-bold text-ruby">{c.needMin}</span> : null}</label>
        <label className="mb-4 block"><span className="block font-bold">{c.date}</span><input type="date" value={date} max={now} onChange={(e) => setDate(e.target.value)} className={`${inputClass} mt-1`} /></label>
        <div className="lg:pt-7"><button className={buttonClass.primary}><Plus size={18} />{c.add}</button></div>
        <fieldset className="sm:col-span-2 lg:col-span-4"><legend className="font-bold">{c.focus}</legend>
          <div className="mt-1 flex flex-wrap gap-2">{([1, 2, 3, 4, 5] as const).map((n) => (
            <button type="button" key={n} onClick={() => setFocus(n)} aria-pressed={focus === n} className={`rounded-full border-[1.5px] border-ink px-3 py-1 font-bold ${focus === n ? "bg-ink text-paper" : "bg-surface hover:bg-sunken"}`}>{n} · {c.focusNames[n - 1]}</button>))}</div>
        </fieldset>
      </form>
      <h2 className="mt-10 border-b-[1.5px] border-ink pb-1 text-2xl">{c.recent}</h2>
      {sessions.length === 0 ? <div className="mt-4 flex max-w-xl items-center gap-5"><EmptyTrail className="h-20 w-32 shrink-0 text-ink" /><p className="text-lg">{c.empty}</p></div> : (
        <ul className="divide-y-2 divide-dotted divide-line">{sessions.slice(0, 25).map((s) => (
          <li key={s.id} className="flex items-center gap-3 py-2.5">
            <div className="min-w-0 flex-1"><p className="font-bold">{s.subject} · {hoursText(s.minutes)}</p><p className="text-sm text-muted">{formatDay(s.date, lang)} · {s.focus}/5 {c.focusNames[s.focus - 1]}</p></div>
            <button onClick={() => setSessions((p) => p.filter((x) => x.id !== s.id))} aria-label={`${c.remove}: ${s.subject}`} className="grid h-10 w-10 shrink-0 place-items-center rounded-md hover:bg-sunken"><Trash2 size={18} strokeWidth={1.75} /></button>
          </li>))}</ul>
      )}
    </Page>
  );
}
