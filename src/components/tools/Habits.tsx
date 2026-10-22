"use client";
import { useState } from "react";
import { Check, Flame, Plus, Trash2 } from "lucide-react";
import { today, weekdayShort } from "@/lib/dates";
import { bestStreak, currentStreak, HABITS_KEY, lastDays, NO_HABITS, toggleDay, type Habit } from "@/lib/habits";
import { useLang } from "@/lib/i18n";
import { useLocalDoc } from "@/lib/local-doc";
import { useCopy } from "@/lib/use-copy";
import { EmptyTrail } from "../art";
import { buttonClass, inputClass, Page } from "../ui";

const copy = {
  en: {
    title: "Habit tracker", lead: "Tap a day to check it off. Streaks count days in a row.",
    name: "New habit", ph: "Read 20 minutes", add: "Add habit", empty: "No habits yet. Start with one small thing you can do every day.",
    streak: (n: number) => `${n}-day streak`, best: (n: number) => `Best: ${n}`, today: "Today", remove: "Remove", mark: "Mark", unmark: "Unmark",
    month: (n: number) => `${n} of the last 28 days`,
  },
  es: {
    title: "Registro de hábitos", lead: "Toca un día para marcarlo. La racha cuenta días seguidos.",
    name: "Nuevo hábito", ph: "Leer 20 minutos", add: "Agregar hábito", empty: "Todavía no hay hábitos. Empieza con algo pequeño que puedas hacer cada día.",
    streak: (n: number) => `Racha de ${n} día${n === 1 ? "" : "s"}`, best: (n: number) => `Mejor: ${n}`, today: "Hoy", remove: "Quitar", mark: "Marcar", unmark: "Desmarcar",
    month: (n: number) => `${n} de los últimos 28 días`,
  },
};

export function HabitsTool() {
  const c = useCopy(copy);
  const lang = useLang();
  const [habits, setHabits] = useLocalDoc<Habit[]>(HABITS_KEY, NO_HABITS);
  const [name, setName] = useState("");
  const now = today();
  const days = lastDays(now, 7);

  const add = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setHabits((p) => [...p, { id: crypto.randomUUID(), name: name.trim(), done: [], created: now }]);
    setName("");
  };
  const toggle = (id: string, day: string) => setHabits((p) => p.map((h) => (h.id === id ? toggleDay(h, day) : h)));

  return (
    <Page wide>
      <h1 className="text-3xl sm:text-4xl">{c.title}</h1>
      <p className="mt-2 max-w-prose text-muted">{c.lead}</p>

      <form onSubmit={add} className="guide-card mt-6 flex flex-wrap items-end gap-3 p-5">
        <label className="min-w-0 flex-1"><span className="block font-bold">{c.name}</span>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder={c.ph} maxLength={60} className={`${inputClass} mt-1`} /></label>
        <button className={buttonClass.primary}><Plus size={18} />{c.add}</button>
      </form>

      {habits.length === 0 ? (
        <div className="guide-card mt-8 flex max-w-xl items-center gap-5 p-5"><EmptyTrail className="h-24 w-36 shrink-0 text-ink" /><p className="text-lg">{c.empty}</p></div>
      ) : (
        <ul className="mt-8 space-y-4">
          {habits.map((h) => {
            const streak = currentStreak(h.done, now);
            const last28 = lastDays(now, 28).filter((d) => h.done.includes(d)).length;
            return (
              <li key={h.id} className="guide-card p-4">
                <div className="flex items-start gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="font-display text-xl font-semibold">{h.name}</p>
                    <p className="mt-0.5 flex flex-wrap items-center gap-x-3 text-sm text-muted">
                      <span className={`inline-flex items-center gap-1 font-bold ${streak ? "text-terracotta" : ""}`}><Flame size={16} />{c.streak(streak)}</span>
                      <span>{c.best(bestStreak(h.done))}</span><span>{c.month(last28)}</span>
                    </p>
                  </div>
                  <button onClick={() => setHabits((p) => p.filter((x) => x.id !== h.id))} aria-label={`${c.remove}: ${h.name}`} className="grid h-10 w-10 shrink-0 place-items-center rounded-md hover:bg-sunken"><Trash2 size={18} strokeWidth={1.75} /></button>
                </div>
                <div className="mt-3 grid grid-cols-7 gap-1.5 sm:gap-2">
                  {days.map((d) => {
                    const on = h.done.includes(d);
                    return (
                      <button key={d} onClick={() => toggle(h.id, d)} aria-pressed={on} aria-label={`${d === now ? c.today : weekdayShort(d, lang)} ${d.slice(8)}: ${on ? c.unmark : c.mark} ${h.name}`}
                        className={`flex flex-col items-center rounded-md border-[1.5px] border-ink py-2 ${on ? "bg-teal text-on-teal" : "bg-surface hover:bg-sunken"} ${d === now ? "ring-2 ring-marigold ring-offset-2 ring-offset-paper" : ""}`}>
                        <span className="text-xs font-bold">{d === now ? c.today : weekdayShort(d, lang)}</span>{" "}
                        <span className="text-lg font-bold">{on ? <Check size={20} strokeWidth={3} aria-hidden /> : d.slice(8)}</span>
                      </button>
                    );
                  })}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </Page>
  );
}
