"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, ExternalLink } from "lucide-react";
import { collectItems, monthGrid, reminderFor, type CalItem, type Reminder } from "@/lib/calendar";
import { diffDays, formatDay, today, weekdayShort } from "@/lib/dates";
import { HOMEWORK_KEY, NO_ASSIGNMENTS, type Assignment } from "@/lib/homework";
import { useLang } from "@/lib/i18n";
import { useLocalDoc } from "@/lib/local-doc";
import type { SavedListing } from "@/lib/saved";
import { useCopy } from "@/lib/use-copy";
import { EmptyTrail } from "../art";
import { Page } from "../ui";

interface Countdown { id: string; name: string; date: string }
const NO_SAVED: SavedListing[] = [];
const NO_COUNTS: Countdown[] = [];

const copy = {
  en: {
    calTitle: "Deadline calendar", calLead: "Saved opportunities, homework and countdowns on one calendar.",
    remTitle: "Reminders", remLead: "What is due today, tomorrow and this week. Open the app to see it, since this app does not send alerts.",
    prev: "Previous month", next: "Next month", upcoming: "Coming up", nothing: "Nothing is scheduled for this day.", nothingSoon: "Nothing coming up.", pickDay: "Tap a day to see what is due.",
    kinds: { opportunity: "Opportunity", homework: "Homework", countdown: "Countdown" } as Record<CalItem["kind"], string>,
    groups: { today: "Due today", tomorrow: "Due tomorrow", week: "This week" } as Record<Reminder, string>,
    emptyAll: "Nothing due in the next week. Save opportunities with deadlines in Find, and add homework, and they will show up here.", openSource: "Open the source", find: "Find opportunities", hw: "Add homework",
    days: (n: number) => (n === 0 ? "today" : n === 1 ? "tomorrow" : `in ${n} days`), dueOn: (d: string) => `Due ${d}`,
    note: "Dates come from each listing's deadline text. If a deadline is vague (like “rolling”), it will not appear here. Always check the source.",
  },
  es: {
    calTitle: "Calendario de fechas límite", calLead: "Oportunidades guardadas, tarea y cuentas regresivas en un solo calendario.",
    remTitle: "Recordatorios", remLead: "Lo que vence hoy, mañana y esta semana. Abre la app para verlo, porque no envía alertas.",
    prev: "Mes anterior", next: "Mes siguiente", upcoming: "Próximamente", nothing: "No hay nada programado para este día.", nothingSoon: "No hay nada próximo.", pickDay: "Toca un día para ver lo que vence.",
    kinds: { opportunity: "Oportunidad", homework: "Tarea", countdown: "Cuenta regresiva" } as Record<CalItem["kind"], string>,
    groups: { today: "Vence hoy", tomorrow: "Vence mañana", week: "Esta semana" } as Record<Reminder, string>,
    emptyAll: "No vence nada en la próxima semana. Guarda oportunidades con fecha límite en Buscar, y agrega tarea, y aparecerán aquí.", openSource: "Abrir la fuente", find: "Buscar oportunidades", hw: "Agregar tarea",
    days: (n: number) => (n === 0 ? "hoy" : n === 1 ? "mañana" : `en ${n} días`), dueOn: (d: string) => `Vence el ${d}`,
    note: "Las fechas salen del texto de la fecha límite de cada listado. Si es vaga (como “continuo”), no aparece aquí. Revisa siempre la fuente.",
  },
};
type C = typeof copy.en;

const KIND_DOT: Record<CalItem["kind"], string> = { opportunity: "bg-teal", homework: "bg-ruby", countdown: "bg-marigold" };

function useItems() {
  const [saved] = useLocalDoc<SavedListing[]>("saved-opportunities", NO_SAVED);
  const [homework] = useLocalDoc<Assignment[]>(HOMEWORK_KEY, NO_ASSIGNMENTS);
  const [countdowns] = useLocalDoc<Countdown[]>("countdowns", NO_COUNTS);
  const now = today();
  return { now, items: useMemo(() => collectItems({ saved, homework, countdowns, now }), [saved, homework, countdowns, now]) };
}

function ItemRow({ i, now, c, lang }: { i: CalItem; now: string; c: C; lang: "en" | "es" }) {
  return (
    <li className="flex items-center gap-3 py-2.5">
      <span className={`h-3 w-3 shrink-0 rounded-full ${KIND_DOT[i.kind]}`} aria-hidden />
      <div className="min-w-0 flex-1"><p className="font-bold">{i.title}</p><p className="text-sm text-muted">{c.kinds[i.kind]} · {formatDay(i.date, lang)} · {c.days(diffDays(now, i.date))}</p></div>
      {i.href ? <a href={i.href} target="_blank" rel="noopener noreferrer" aria-label={`${c.openSource}: ${i.title}`} className="grid h-10 w-10 shrink-0 place-items-center rounded-md hover:bg-sunken"><ExternalLink size={18} strokeWidth={1.75} /></a> : null}
    </li>
  );
}

export function CalendarTool({ view }: { view: "deadlines" | "reminders" }) {
  const c = useCopy(copy);
  const lang = useLang();
  const { now, items } = useItems();
  return view === "deadlines" ? <Deadlines c={c} lang={lang} now={now} items={items} /> : <Reminders c={c} lang={lang} now={now} items={items} />;
}

type P = { c: C; lang: "en" | "es"; now: string; items: CalItem[] };

function Deadlines({ c, lang, now, items }: P) {
  const [ym, setYm] = useState(() => ({ y: Number(now.slice(0, 4)), m: Number(now.slice(5, 7)) - 1 }));
  const [sel, setSel] = useState<string | null>(null);
  const grid = useMemo(() => monthGrid(ym.y, ym.m), [ym]);
  const byDay = useMemo(() => { const m = new Map<string, CalItem[]>(); items.forEach((i) => m.set(i.date, [...(m.get(i.date) ?? []), i])); return m; }, [items]);
  const shift = (n: number) => setYm(({ y, m }) => { const d = new Date(y, m + n, 1); return { y: d.getFullYear(), m: d.getMonth() }; });
  const title = new Intl.DateTimeFormat(lang === "es" ? "es-US" : "en-US", { month: "long", year: "numeric" }).format(new Date(ym.y, ym.m, 1));
  const comingUp = items.filter((i) => i.date >= now).slice(0, 12);
  const shown = sel ? byDay.get(sel) ?? [] : comingUp;
  const heads = grid[0].map((d) => weekdayShort(d.date, lang));

  return (
    <Page wide>
      <h1 className="text-3xl sm:text-4xl">{c.calTitle}</h1>
      <p className="mt-2 max-w-prose text-muted">{c.calLead}</p>
      <div className="mt-6 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <section className="guide-card p-4" aria-label={title}>
          <div className="flex items-center justify-between">
            <button onClick={() => shift(-1)} aria-label={c.prev} className="grid h-10 w-10 place-items-center rounded-md hover:bg-sunken"><ChevronLeft size={22} /></button>
            <h2 className="font-display text-2xl capitalize" aria-live="polite">{title}</h2>
            <button onClick={() => shift(1)} aria-label={c.next} className="grid h-10 w-10 place-items-center rounded-md hover:bg-sunken"><ChevronRight size={22} /></button>
          </div>
          <div className="mt-3 grid grid-cols-7 gap-1 text-center text-xs font-bold text-muted">{heads.map((h) => <span key={h}>{h}</span>)}</div>
          <div className="mt-1 grid grid-cols-7 gap-1">
            {grid.flat().map(({ date, inMonth }) => {
              const here = byDay.get(date) ?? [];
              return (
                <button key={date} onClick={() => setSel(sel === date ? null : date)} aria-pressed={sel === date} aria-label={`${formatDay(date, lang)}${here.length ? `, ${here.length}` : ""}`}
                  className={`flex min-h-14 flex-col items-center rounded-md border-[1.5px] p-1 sm:min-h-16 ${sel === date ? "border-ink bg-marigold text-on-marigold" : date === now ? "border-ink" : "border-transparent hover:bg-sunken"} ${inMonth ? "" : "text-muted"}`}>
                  <span className="text-sm font-bold">{Number(date.slice(8))}</span>
                  <span className="mt-1 flex flex-wrap justify-center gap-0.5" aria-hidden>{here.slice(0, 4).map((i) => <span key={i.id} className={`h-2 w-2 rounded-full ${KIND_DOT[i.kind]}`} />)}</span>
                </button>
              );
            })}
          </div>
          <p className="mt-3 flex flex-wrap gap-x-4 text-xs text-muted">{(Object.keys(KIND_DOT) as CalItem["kind"][]).map((k) => <span key={k} className="inline-flex items-center gap-1"><span className={`h-2.5 w-2.5 rounded-full ${KIND_DOT[k]}`} />{c.kinds[k]}</span>)}</p>
        </section>
        <section className="guide-card p-4" aria-live="polite">
          <h2 className="text-xl">{sel ? formatDay(sel, lang) : c.upcoming}</h2>
          {shown.length ? <ul className="divide-y-2 divide-dotted divide-line">{shown.map((i) => <ItemRow key={i.id} i={i} now={now} c={c} lang={lang} />)}</ul>
            : <div className="mt-3 flex items-center gap-3"><EmptyTrail className="h-14 w-20 shrink-0 text-ink" /><p className="text-muted">{sel ? c.nothing : items.length ? c.nothingSoon : c.emptyAll}</p></div>}
          {!sel && !items.length ? null : <p className="mt-3 text-sm text-muted">{c.pickDay}</p>}
        </section>
      </div>
      <p className="mt-4 max-w-prose text-sm text-muted">{c.note}</p>
    </Page>
  );
}

function Reminders({ c, lang, now, items }: P) {
  const groups = (["today", "tomorrow", "week"] as Reminder[]).map((g) => ({ g, list: items.filter((i) => reminderFor(i.date, now) === g) })).filter((x) => x.list.length);
  return (
    <Page>
      <h1 className="text-3xl sm:text-4xl">{c.remTitle}</h1>
      <p className="mt-2 max-w-prose text-muted">{c.remLead}</p>
      {groups.length === 0 ? (
        <div className="guide-card mt-6 flex max-w-xl items-center gap-5 p-5"><EmptyTrail className="hidden h-24 w-36 shrink-0 text-ink sm:block" />
          <div className="min-w-0"><p className="text-lg">{c.emptyAll}</p><p className="mt-3 flex flex-wrap gap-x-4 gap-y-1 font-bold"><Link href="/t/find/search" className="text-teal underline underline-offset-4">{c.find}</Link><Link href="/t/homework/tracker" className="text-teal underline underline-offset-4">{c.hw}</Link></p></div></div>
      ) : groups.map(({ g, list }) => (
        <section key={g} className="mt-6" aria-labelledby={`r-${g}`}>
          <h2 id={`r-${g}`} className={`border-b-[1.5px] border-ink pb-1 text-2xl ${g === "today" ? "text-ruby" : ""}`}>{c.groups[g]} <span className="text-base text-muted">({list.length})</span></h2>
          <ul className="divide-y-2 divide-dotted divide-line">{list.map((i) => <ItemRow key={i.id} i={i} now={now} c={c} lang={lang} />)}</ul>
        </section>
      ))}
      <p className="mt-6 max-w-prose text-sm text-muted">{c.note}</p>
    </Page>
  );
}
