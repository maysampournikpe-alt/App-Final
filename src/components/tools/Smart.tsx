"use client";
import { useState } from "react";
import { Trash2 } from "lucide-react";
import Link from "next/link";
import { diffDays, formatDay, today } from "@/lib/dates";
import { useLang } from "@/lib/i18n";
import { useLocalDoc } from "@/lib/local-doc";
import { NO_SMART, SMART_FIELDS, SMART_KEY, smartReady, type SmartGoal } from "@/lib/smart";
import { useCopy } from "@/lib/use-copy";
import { EmptyTrail } from "../art";
import { buttonClass, inputClass, Page } from "../ui";

const copy = {
  en: {
    title: "SMART goal builder", lead: "A goal is easier to reach when it is Specific, Measurable, Achievable, Relevant and Time-bound.",
    fields: {
      specific: { l: "Specific: what exactly will you do?", ph: "Run a 5K race", help: "Who, what and where. “Get fit” is too fuzzy." },
      measurable: { l: "Measurable: how will you know?", ph: "Run 3 times a week and finish in under 35 minutes", help: "A number you can count." },
      achievable: { l: "Achievable: why is this realistic?", ph: "I already run twice a week", help: "What you have now that makes it possible." },
      relevant: { l: "Relevant: why does it matter to you?", ph: "It will help me make the soccer team", help: "Your reason." },
    } as Record<string, { l: string; ph: string; help: string }>,
    by: "Time-bound: by when?", make: "Save my goal", needAll: "Fill in every box with a few words and pick a date.", yours: "Your goals", empty: "No goals yet.", remove: "Remove",
    sentence: (g: SmartGoal, d: string) => `By ${d}, I will ${g.specific.trim().replace(/^i will /i, "").replace(/[.!]$/, "")}. I will know I did it because ${g.measurable.trim().replace(/[.!]$/, "")}. This is realistic because ${g.achievable.trim().replace(/[.!]$/, "")}. It matters because ${g.relevant.trim().replace(/[.!]$/, "")}.`,
    days: (n: number) => (n < 0 ? "date passed" : n === 0 ? "today" : `${n} days left`), plan: "Turn this into a step-by-step plan",
  },
  es: {
    title: "Metas SMART", lead: "Una meta se alcanza más fácil cuando es Específica, Medible, Alcanzable, Relevante y con Tiempo.",
    fields: {
      specific: { l: "Específica: ¿qué vas a hacer exactamente?", ph: "Correr una carrera de 5 km", help: "Quién, qué y dónde. “Ponerme en forma” es muy vago." },
      measurable: { l: "Medible: ¿cómo sabrás que lo lograste?", ph: "Correr 3 veces por semana y terminar en menos de 35 minutos", help: "Un número que puedas contar." },
      achievable: { l: "Alcanzable: ¿por qué es realista?", ph: "Ya corro dos veces por semana", help: "Lo que ya tienes que lo hace posible." },
      relevant: { l: "Relevante: ¿por qué te importa?", ph: "Me ayudará a entrar al equipo de fútbol", help: "Tu razón." },
    } as Record<string, { l: string; ph: string; help: string }>,
    by: "Con tiempo: ¿para cuándo?", make: "Guardar mi meta", needAll: "Llena todas las casillas con unas palabras y elige una fecha.", yours: "Tus metas", empty: "Todavía no hay metas.", remove: "Quitar",
    sentence: (g: SmartGoal, d: string) => `Para el ${d}, voy a ${g.specific.trim().replace(/^voy a /i, "").replace(/[.!]$/, "")}. Sabré que lo logré porque ${g.measurable.trim().replace(/[.!]$/, "")}. Es realista porque ${g.achievable.trim().replace(/[.!]$/, "")}. Me importa porque ${g.relevant.trim().replace(/[.!]$/, "")}.`,
    days: (n: number) => (n < 0 ? "la fecha pasó" : n === 0 ? "hoy" : `faltan ${n} días`), plan: "Convertir esto en un plan paso a paso",
  },
};

export function SmartTool() {
  const c = useCopy(copy);
  const lang = useLang();
  const [goals, setGoals] = useLocalDoc<SmartGoal[]>(SMART_KEY, NO_SMART);
  const [f, setF] = useState({ specific: "", measurable: "", achievable: "", relevant: "", by: "" });
  const [err, setErr] = useState(false);
  const save = (e: React.FormEvent) => {
    e.preventDefault();
    if (!smartReady(f)) return setErr(true);
    setErr(false);
    setGoals((p) => [{ id: crypto.randomUUID(), ...f, created: today() }, ...p]);
    setF({ specific: "", measurable: "", achievable: "", relevant: "", by: "" });
  };

  return (
    <Page>
      <h1 className="text-3xl sm:text-4xl">{c.title}</h1>
      <p className="mt-2 max-w-prose text-muted">{c.lead}</p>
      <form onSubmit={save} className="guide-card mt-6 p-5" noValidate>
        {SMART_FIELDS.map((k) => (
          <label key={k} className="mb-4 block"><span className="block font-bold">{c.fields[k].l}</span>
            <input value={f[k]} onChange={(e) => setF({ ...f, [k]: e.target.value })} placeholder={c.fields[k].ph} maxLength={160} className={`${inputClass} mt-1`} />
            <span className="mt-1 block text-sm text-muted">{c.fields[k].help}</span></label>
        ))}
        <label className="mb-4 block"><span className="block font-bold">{c.by}</span>
          <input type="date" value={f.by} onChange={(e) => setF({ ...f, by: e.target.value })} className={`${inputClass} mt-1 !w-56`} /></label>
        {err ? <p role="alert" className="mb-3 font-bold text-ruby">{c.needAll}</p> : null}
        <button className={buttonClass.primary}>{c.make}</button>
      </form>

      <h2 className="mt-10 border-b-[1.5px] border-ink pb-1 text-2xl">{c.yours}</h2>
      {goals.length === 0 ? (
        <div className="mt-4 flex max-w-xl items-center gap-5"><EmptyTrail className="h-20 w-32 shrink-0 text-ink" /><p className="text-lg">{c.empty}</p></div>
      ) : (
        <ul className="mt-4 space-y-4">
          {goals.map((g) => (
            <li key={g.id} className="guide-card p-4">
              <div className="flex items-start gap-3">
                <p className="min-w-0 flex-1 text-lg">{c.sentence(g, formatDay(g.by, lang))}</p>
                <button onClick={() => setGoals((p) => p.filter((x) => x.id !== g.id))} aria-label={`${c.remove}: ${g.specific}`} className="grid h-10 w-10 shrink-0 place-items-center rounded-md hover:bg-sunken"><Trash2 size={18} strokeWidth={1.75} /></button>
              </div>
              <p className="mt-2 text-sm font-bold text-muted">{c.days(diffDays(today(), g.by))} · <Link href="/t/plan/builder" className="text-teal underline underline-offset-4">{c.plan}</Link></p>
            </li>
          ))}
        </ul>
      )}
    </Page>
  );
}
