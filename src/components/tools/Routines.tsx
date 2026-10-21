"use client";
import { useState } from "react";
import { Moon, Plus, Sun, Trash2 } from "lucide-react";
import { today } from "@/lib/dates";
import { useLocalDoc } from "@/lib/local-doc";
import { doneToday, NO_ROUTINES, progress, ROUTINES_KEY, toggleStep, type RoutineDoc, type RoutineId } from "@/lib/routines";
import { useCopy } from "@/lib/use-copy";
import { buttonClass, inputClass, Page } from "../ui";

const copy = {
  en: {
    title: "Morning and evening routines", lead: "A short checklist you follow every day. It resets each morning.", morning: "Morning", evening: "Evening",
    add: "Add step", ph: "Pack my bag", done: (a: number, b: number) => `${a} of ${b} done`, empty: "No steps yet. Add your own, or start with ideas.", ideas: "Add ideas",
    seed: { morning: ["Drink water", "Eat breakfast", "Check today's homework", "Pack my bag"], evening: ["Pack my bag for tomorrow", "Write tomorrow's top 3", "Phone on the charger", "Lights out on time"] } as Record<RoutineId, string[]>, remove: "Remove", complete: "Routine complete. Nice work!",
  },
  es: {
    title: "Rutinas de mañana y noche", lead: "Una lista corta que sigues todos los días. Se reinicia cada mañana.", morning: "Mañana", evening: "Noche",
    add: "Agregar paso", ph: "Empacar mi mochila", done: (a: number, b: number) => `${a} de ${b} listos`, empty: "Todavía no hay pasos. Agrega los tuyos, o empieza con ideas.", ideas: "Agregar ideas",
    seed: { morning: ["Tomar agua", "Desayunar", "Revisar la tarea de hoy", "Empacar mi mochila"], evening: ["Empacar mi mochila para mañana", "Escribir mis 3 prioridades de mañana", "Celular en el cargador", "Apagar la luz a tiempo"] } as Record<RoutineId, string[]>, remove: "Quitar", complete: "¡Rutina completa! Buen trabajo.",
  },
};

export function RoutinesTool() {
  const c = useCopy(copy);
  const [doc, setDoc] = useLocalDoc<RoutineDoc>(ROUTINES_KEY, NO_ROUTINES);
  const [tab, setTab] = useState<RoutineId>("morning");
  const [text, setText] = useState("");
  const now = today();
  const steps = doc.steps[tab], done = new Set(doneToday(doc, tab, now));
  const setSteps = (next: RoutineDoc["steps"][RoutineId]) => setDoc((d) => ({ ...d, steps: { ...d.steps, [tab]: next } }));

  return (
    <Page>
      <h1 className="text-3xl sm:text-4xl">{c.title}</h1>
      <p className="mt-2 max-w-prose text-muted">{c.lead}</p>
      <div className="mt-6 flex gap-2" role="group">
        {(["morning", "evening"] as const).map((r) => (
          <button key={r} onClick={() => setTab(r)} aria-pressed={tab === r} className={`inline-flex items-center gap-2 rounded-full border-[1.5px] border-ink px-5 py-2 font-bold ${tab === r ? "bg-ink text-paper" : "bg-surface hover:bg-sunken"}`}>
            {r === "morning" ? <Sun size={18} /> : <Moon size={18} />}{c[r]} <span className="text-sm opacity-80">{progress(doc, r, now)}%</span></button>))}
      </div>
      <section className="guide-card mt-4 p-5" aria-label={c[tab]}>
        <div className="h-3 overflow-hidden rounded-full border-[1.5px] border-ink bg-sunken" role="progressbar" aria-valuenow={progress(doc, tab, now)} aria-valuemin={0} aria-valuemax={100} aria-label={c[tab]}><div className="h-full bg-teal" style={{ width: `${progress(doc, tab, now)}%` }} /></div>
        <p className="mt-2 text-sm font-bold text-muted" aria-live="polite">{c.done(done.size, steps.length)}{steps.length > 0 && done.size === steps.length ? ` · ${c.complete}` : ""}</p>
        {steps.length === 0 ? (
          <div className="mt-3"><p className="text-lg">{c.empty}</p>
            <button onClick={() => setSteps(c.seed[tab].map((t) => ({ id: crypto.randomUUID(), text: t })))} className={`${buttonClass.secondary} mt-3`}>{c.ideas}</button></div>
        ) : (
          <ul className="mt-2 divide-y-2 divide-dotted divide-line">{steps.map((s) => (
            <li key={s.id} className="flex items-center gap-3 py-2.5">
              <input type="checkbox" checked={done.has(s.id)} onChange={() => setDoc((d) => toggleStep(d, s.id, now))} aria-label={s.text} className="h-6 w-6 shrink-0 accent-[var(--c-teal)]" />
              <span className={`min-w-0 flex-1 text-lg font-bold ${done.has(s.id) ? "text-muted line-through decoration-2" : ""}`}>{s.text}</span>
              <button onClick={() => setSteps(steps.filter((x) => x.id !== s.id))} aria-label={`${c.remove}: ${s.text}`} className="grid h-10 w-10 shrink-0 place-items-center rounded-md hover:bg-sunken"><Trash2 size={18} strokeWidth={1.75} /></button>
            </li>))}</ul>
        )}
        <form className="mt-3 flex gap-2" onSubmit={(e) => { e.preventDefault(); if (text.trim()) { setSteps([...steps, { id: crypto.randomUUID(), text: text.trim() }]); setText(""); } }}>
          <label className="min-w-0 flex-1"><span className="sr-only">{c.add}</span><input value={text} onChange={(e) => setText(e.target.value)} placeholder={c.ph} maxLength={80} className={inputClass} /></label>
          <button className={buttonClass.primary}><Plus size={18} />{c.add}</button>
        </form>
      </section>
    </Page>
  );
}
