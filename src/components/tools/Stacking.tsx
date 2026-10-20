"use client";
import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { useLocalDoc } from "@/lib/local-doc";
import { useCopy } from "@/lib/use-copy";
import { EmptyTrail } from "../art";
import { buttonClass, inputClass, Page } from "../ui";

interface Stack { id: string; anchor: string; habit: string }
const KEY = "habit-stacks";
const NONE: Stack[] = [];
const clean = (s: string) => s.trim().replace(/[.!]+$/, "");

const copy = {
  en: {
    title: "Habit stacking helper", lead: "Tie a new habit to something you already do every day. The old habit becomes the reminder.",
    anchor: "After I…", anchorPh: "eat breakfast", habit: "…I will", habitPh: "review my flashcards for 5 minutes", add: "Save", need: "Fill in both parts.",
    sentence: (a: string, h: string) => `After I ${clean(a)}, I will ${clean(h)}.`, yours: "Your stacks", empty: "No stacks yet. Try one of the ideas below.", remove: "Remove",
    tip: "Make the new habit small (about two minutes) and tie it to something that happens at the same time every day.", ideasTitle: "Ideas",
    ideas: [["get to my desk", "write down my top 3 tasks"], ["eat dinner", "tell someone one thing I learned today"], ["plug in my phone at night", "pack my bag for tomorrow"], ["sit on the bus", "review 10 flashcards"], ["finish a class", "write one question I still have"]] as [string, string][],
    use: "Use this",
  },
  es: {
    title: "Hábitos encadenados", lead: "Une un hábito nuevo a algo que ya haces todos los días. El hábito de siempre se vuelve el recordatorio.",
    anchor: "Después de…", anchorPh: "desayunar", habit: "…voy a", habitPh: "repasar mis tarjetas 5 minutos", add: "Guardar", need: "Llena las dos partes.",
    sentence: (a: string, h: string) => `Después de ${clean(a)}, voy a ${clean(h)}.`, yours: "Tus cadenas", empty: "Todavía no hay cadenas. Prueba una de las ideas de abajo.", remove: "Quitar",
    tip: "Haz el hábito nuevo pequeño (unos dos minutos) y únelo a algo que pase a la misma hora todos los días.", ideasTitle: "Ideas",
    ideas: [["llegar a mi escritorio", "escribir mis 3 tareas principales"], ["cenar", "contarle a alguien algo que aprendí hoy"], ["poner mi celular a cargar en la noche", "empacar mi mochila para mañana"], ["sentarme en el camión", "repasar 10 tarjetas"], ["terminar una clase", "escribir una pregunta que todavía tengo"]] as [string, string][],
    use: "Usar esta",
  },
};

export function StackingTool() {
  const c = useCopy(copy);
  const [stacks, setStacks] = useLocalDoc<Stack[]>(KEY, NONE);
  const [anchor, setAnchor] = useState("");
  const [habit, setHabit] = useState("");
  const [err, setErr] = useState(false);
  const save = (a: string, h: string) => { setStacks((p) => [{ id: crypto.randomUUID(), anchor: a.trim(), habit: h.trim() }, ...p]); };
  const submit = (e: React.FormEvent) => { e.preventDefault(); if (!anchor.trim() || !habit.trim()) return setErr(true); setErr(false); save(anchor, habit); setAnchor(""); setHabit(""); };

  return (
    <Page>
      <h1 className="text-3xl sm:text-4xl">{c.title}</h1>
      <p className="mt-2 max-w-prose text-muted">{c.lead}</p>
      <form onSubmit={submit} className="guide-card mt-6 p-5" noValidate>
        <label className="block"><span className="block font-bold">{c.anchor}</span><input value={anchor} onChange={(e) => setAnchor(e.target.value)} placeholder={c.anchorPh} maxLength={80} className={`${inputClass} mt-1`} /></label>
        <label className="mt-3 block"><span className="block font-bold">{c.habit}</span><input value={habit} onChange={(e) => setHabit(e.target.value)} placeholder={c.habitPh} maxLength={100} className={`${inputClass} mt-1`} /></label>
        {anchor.trim() && habit.trim() ? <p className="mt-3 font-display text-xl font-semibold text-teal">{c.sentence(anchor, habit)}</p> : null}
        {err ? <p role="alert" className="mt-2 font-bold text-ruby">{c.need}</p> : null}
        <button className={`${buttonClass.primary} mt-4`}><Plus size={18} />{c.add}</button>
      </form>
      <p className="mt-3 max-w-prose text-sm text-muted">{c.tip}</p>

      <h2 className="mt-8 border-b-[1.5px] border-ink pb-1 text-2xl">{c.yours}</h2>
      {stacks.length === 0 ? <div className="mt-4 flex max-w-xl items-center gap-5"><EmptyTrail className="h-20 w-32 shrink-0 text-ink" /><p className="text-lg">{c.empty}</p></div> : (
        <ul className="divide-y-2 divide-dotted divide-line">{stacks.map((s) => (
          <li key={s.id} className="flex items-center gap-3 py-3"><p className="min-w-0 flex-1 text-lg font-bold">{c.sentence(s.anchor, s.habit)}</p>
            <button onClick={() => setStacks((p) => p.filter((x) => x.id !== s.id))} aria-label={`${c.remove}: ${s.habit}`} className="grid h-10 w-10 shrink-0 place-items-center rounded-md hover:bg-sunken"><Trash2 size={18} strokeWidth={1.75} /></button></li>))}</ul>
      )}
      <h2 className="mt-8 border-b-[1.5px] border-ink pb-1 text-2xl">{c.ideasTitle}</h2>
      <ul className="mt-2 divide-y-2 divide-dotted divide-line">{c.ideas.map(([a, h]) => (
        <li key={a} className="flex items-center gap-3 py-2.5"><p className="min-w-0 flex-1">{c.sentence(a, h)}</p><button onClick={() => { setAnchor(a); setHabit(h); }} className="shrink-0 font-bold text-teal underline underline-offset-4">{c.use}</button></li>))}</ul>
    </Page>
  );
}
