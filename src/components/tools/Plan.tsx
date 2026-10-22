"use client";
import Link from "next/link";
import { useState } from "react";
import { Check, Search, Trash2, Wand2 } from "lucide-react";
import { useLang } from "@/lib/i18n";
import { useLocalDoc } from "@/lib/local-doc";
import { useProfile } from "@/lib/profile";
import { HORIZONS, keepProgress, NO_PLANS, PLANS_KEY, planForModel, progress, toggleStep, type Horizon, type Plan } from "@/lib/plan";
import { TEMPLATES, templatePlan } from "@/lib/plan-templates";
import { useCopy } from "@/lib/use-copy";
import { EmptyTrail } from "../art";
import { buttonClass, Field, inputClass, Page } from "../ui";

type View = "builder" | "templates" | "checklists" | "adjust";

const copy = {
  en: {
    titles: { builder: "Plan builder", templates: "Goal templates", checklists: "Plan checklists", adjust: "Adjust my plan" } as Record<View, string>,
    leads: {
      builder: "Tell me your goal. I will turn it into steps for this week, this month and this year.",
      templates: "Ready-made plans you can start right now, even with no internet.",
      checklists: "Check off steps and watch your trail fill in.",
      adjust: "Pick a plan and tell me what should change.",
    } as Record<View, string>,
    goal: "Your goal", goalPh: "Make varsity soccer", hours: "Hours a week you can give", hoursOpt: (h: number) => `${h} hour${h === 1 ? "" : "s"}`,
    build: "Build my plan", building: "Building your plan…", slow: "This takes about 20 seconds.",
    horizon: { week: "This week", month: "This month", year: "This year" } as Record<Horizon, string>,
    done: (d: number, t: number) => `${d} of ${t} steps done`, find: "Find opportunities for this goal", ideas: "Search ideas",
    adjustTitle: "Change this plan", adjustPh: "Make it easier, I only have 3 hours a week", adjustGo: "Update plan", adjusting: "Updating…",
    delete: "Delete plan", confirm: "Delete this plan?", yes: "Yes, delete", no: "Keep it", yourPlans: "Your plans", empty: "No plans yet. Make one above, or start from a template.",
    start: "Start this plan", started: "Added to your plans", open: "Open it", fromTemplate: "Made from a template", byAi: "Made by AI. It can be wrong, so check details.",
    errors: { rate_limited: "You have made a lot of plans this hour. Try again in a little while, or start from a template.", busy: "The AI is busy. Try again in a minute.", slow: "That took too long. Try again.", unavailable: "Plan building is not turned on in this version yet. Templates still work.", failed: "Something went wrong on our side. Try again in a minute.", offline: "You are offline. Templates and your saved plans still work.", bad_request: "Write your goal first (a few words)." } as Record<string, string>,
    pick: "Plan",
  },
  es: {
    titles: { builder: "Armar un plan", templates: "Plantillas de metas", checklists: "Listas del plan", adjust: "Ajustar mi plan" } as Record<View, string>,
    leads: {
      builder: "Cuéntame tu meta. La convierto en pasos para esta semana, este mes y este año.",
      templates: "Planes listos para empezar ahorita, hasta sin internet.",
      checklists: "Marca los pasos y mira cómo avanza tu camino.",
      adjust: "Elige un plan y dime qué debe cambiar.",
    } as Record<View, string>,
    goal: "Tu meta", goalPh: "Quedar en el equipo de fútbol", hours: "Horas por semana que puedes dedicar", hoursOpt: (h: number) => `${h} hora${h === 1 ? "" : "s"}`,
    build: "Armar mi plan", building: "Armando tu plan…", slow: "Tarda como 20 segundos.",
    horizon: { week: "Esta semana", month: "Este mes", year: "Este año" } as Record<Horizon, string>,
    done: (d: number, t: number) => `${d} de ${t} pasos listos`, find: "Buscar oportunidades para esta meta", ideas: "Ideas para buscar",
    adjustTitle: "Cambiar este plan", adjustPh: "Hazlo más fácil, solo tengo 3 horas a la semana", adjustGo: "Actualizar plan", adjusting: "Actualizando…",
    delete: "Borrar plan", confirm: "¿Borrar este plan?", yes: "Sí, borrar", no: "Conservarlo", yourPlans: "Tus planes", empty: "Todavía no tienes planes. Haz uno arriba, o empieza con una plantilla.",
    start: "Empezar este plan", started: "Agregado a tus planes", open: "Abrirlo", fromTemplate: "Hecho con una plantilla", byAi: "Lo hizo una IA. Puede equivocarse, así que revisa los detalles.",
    errors: { rate_limited: "Has hecho muchos planes esta hora. Intenta de nuevo en un rato, o empieza con una plantilla.", busy: "La IA está ocupada. Intenta de nuevo en un minuto.", slow: "Tardó demasiado. Intenta de nuevo.", unavailable: "Armar planes todavía no está activado en esta versión. Las plantillas sí funcionan.", failed: "Algo falló de nuestra parte. Intenta de nuevo en un minuto.", offline: "No tienes internet. Las plantillas y tus planes guardados sí funcionan.", bad_request: "Escribe tu meta primero (unas palabras)." } as Record<string, string>,
    pick: "Plan",
  },
};

export function PlanTool({ view }: { view: View }) {
  const c = useCopy(copy);
  const lang = useLang();
  const [profile] = useProfile();
  const [plans, setPlans] = useLocalDoc<Plan[]>(PLANS_KEY, NO_PLANS);
  const [selected, setSelected] = useState<string | null>(null);
  const [goal, setGoal] = useState("");
  const [hours, setHours] = useState(5);
  const [busy, setBusy] = useState<"build" | "adjust" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [justStarted, setJustStarted] = useState<string | null>(null);

  const current = plans.find((p) => p.id === selected) ?? plans[0] ?? null;
  const update = (next: Plan) => setPlans(plans.map((p) => (p.id === next.id ? next : p)));

  const ask = async (body: Record<string, unknown>): Promise<Plan | null> => {
    setError(null);
    if (!navigator.onLine) { setError("offline"); return null; }
    try {
      const res = await fetch("/api/plan", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ lang, grade: profile.grade, ...body }) });
      const j = await res.json().catch(() => null);
      if (j?.ok) return j.plan as Plan;
      setError(j?.error ?? "failed");
    } catch { setError(navigator.onLine ? "failed" : "offline"); }
    return null;
  };

  const build = async (e: React.FormEvent) => {
    e.preventDefault();
    if (goal.trim().length < 3) return setError("bad_request");
    setBusy("build");
    const plan = await ask({ goal: goal.trim(), hoursPerWeek: hours });
    setBusy(null);
    if (plan) { setPlans([plan, ...plans]); setSelected(plan.id); setGoal(""); }
  };
  const adjust = async (instruction: string): Promise<boolean> => {
    if (!current) return false;
    setBusy("adjust");
    const next = await ask({ goal: current.goal, hoursPerWeek: current.hoursPerWeek, adjust: { instruction, plan: planForModel(current) } });
    setBusy(null);
    if (next) update(keepProgress(next, current));
    return !!next;
  };

  return (
    <Page wide>
      <h1 className="text-3xl sm:text-4xl">{c.titles[view]}</h1>
      <p className="mt-2 max-w-prose text-muted">{c.leads[view]}</p>

      {view === "builder" ? (
        <form onSubmit={build} className="guide-card mt-6 grid max-w-2xl gap-x-4 p-5 sm:grid-cols-[1fr_11rem]" noValidate>
          <Field label={c.goal} error={error === "bad_request" ? c.errors.bad_request : null}>{(p) => <input {...p} value={goal} maxLength={200} onChange={(e) => setGoal(e.target.value)} placeholder={c.goalPh} className={inputClass} />}</Field>
          <Field label={c.hours}>{(p) => <select {...p} value={hours} onChange={(e) => setHours(Number(e.target.value))} className={inputClass}>{[1, 2, 3, 5, 8, 12, 20].map((h) => <option key={h} value={h}>{c.hoursOpt(h)}</option>)}</select>}</Field>
          <div className="sm:col-span-2">
            <button disabled={busy !== null} className={buttonClass.primary}><Wand2 size={18} />{busy === "build" ? c.building : c.build}</button>
            {busy === "build" ? <span className="ml-3 text-muted" role="status">{c.slow}</span> : null}
          </div>
        </form>
      ) : null}

      {error && error !== "bad_request" ? <p role="alert" className="guide-card mt-5 max-w-2xl p-4 font-bold">{c.errors[error] ?? c.errors.failed}</p> : null}

      {view === "templates" ? (
        <ul className="mt-6 grid gap-5 md:grid-cols-2">
          {TEMPLATES.map((t) => (
            <li key={t.id} className="guide-card flex flex-col p-5">
              <h2 className="text-2xl">{t.title[lang]}</h2>
              <p className="mt-2 flex-1">{t.summary[lang]}</p>
              {justStarted === t.id ? (
                <p className="mt-4 font-bold text-palm"><Check size={16} className="mr-1 inline" />{c.started} · <Link href="/t/plan/checklists" className="text-teal underline underline-offset-4">{c.open}</Link></p>
              ) : <button onClick={() => { const p = templatePlan(t, lang, hours); setPlans([p, ...plans]); setSelected(p.id); setJustStarted(t.id); }} className={`${buttonClass.secondary} mt-4 self-start`}>{c.start}</button>}
            </li>
          ))}
        </ul>
      ) : (
        <>
          {plans.length > 1 ? (
            <div className="mt-8" role="group" aria-label={c.yourPlans}>
              <h2 className="mb-2 text-xl">{c.yourPlans}</h2>
              <div className="flex flex-wrap gap-2">
                {plans.map((p) => {
                  const pr = progress(p);
                  return <button key={p.id} onClick={() => setSelected(p.id)} aria-pressed={current?.id === p.id} className={`rounded-md border-[1.5px] border-ink px-3 py-2 text-left font-bold ${current?.id === p.id ? "bg-ink text-paper" : "bg-surface hover:bg-sunken"}`}>{p.title} <span className="font-normal">· {pr.pct}%</span></button>;
                })}
              </div>
            </div>
          ) : null}
          {current ? (
            <PlanView key={current.id} plan={current} c={c} busy={busy === "adjust"} autoAdjust={view === "adjust"}
              onChange={update} onAdjust={adjust} onDelete={() => { setPlans(plans.filter((p) => p.id !== current.id)); setSelected(null); }} />
          ) : view !== "builder" || true ? (
            <div className="guide-card mt-8 flex max-w-xl items-center gap-5 p-5"><EmptyTrail className="h-24 w-36 shrink-0 text-ink" /><p className="text-lg">{c.empty}</p></div>
          ) : null}
        </>
      )}
    </Page>
  );
}

function PlanView({ plan, c, busy, autoAdjust, onChange, onAdjust, onDelete }: {
  plan: Plan; c: typeof copy.en; busy: boolean; autoAdjust: boolean;
  onChange: (p: Plan) => void; onAdjust: (instruction: string) => Promise<boolean>; onDelete: () => void;
}) {
  const [text, setText] = useState("");
  const [confirm, setConfirm] = useState(false);
  const pr = progress(plan);
  return (
    <section className="mt-8 max-w-3xl" aria-label={plan.title}>
      <h2 className="text-2xl sm:text-3xl">{plan.title}</h2>
      {plan.summary ? <p className="mt-1 max-w-prose text-lg">{plan.summary}</p> : null}
      <p className="mt-3 font-bold" aria-live="polite">{c.done(pr.done, pr.total)} · {pr.pct}%</p>
      <div className="mt-1 h-3 overflow-hidden rounded-full border-[1.5px] border-ink bg-sunken" aria-hidden="true"><div className="h-full bg-palm transition-[width]" style={{ width: `${pr.pct}%` }} /></div>

      <div className="mt-8 space-y-9">
        {HORIZONS.map((h) => plan.horizons.find((x) => x.horizon === h)).filter((x): x is NonNullable<typeof x> => !!x).map((h) => (
          <div key={h.horizon}>
            <h3 className="mb-3 border-b-[1.5px] border-ink pb-1 text-xl">{c.horizon[h.horizon]}</h3>
            <ol className="relative">
              {h.steps.map((s, i) => (
                <li key={s.id} className="relative flex gap-4 pb-5 last:pb-0">
                  {i < h.steps.length - 1 ? <span aria-hidden className={`absolute left-[1.05rem] top-9 h-[calc(100%-2rem)] w-[4px] ${s.done ? "bg-palm" : "trail-dots"}`} /> : null}
                  <button onClick={() => onChange(toggleStep(plan, s.id))} aria-pressed={s.done} aria-label={`${i + 1}. ${s.text}`}
                    className={`z-10 grid h-[2.2rem] w-[2.2rem] shrink-0 place-items-center rounded-full border-2 border-ink font-bold ${s.done ? "checkpoint-done bg-palm text-surface" : "bg-surface hover:bg-sunken"}`}>
                    {s.done ? <Check size={18} strokeWidth={3} aria-hidden /> : i + 1}
                  </button>
                  <span className={`pt-1 ${s.done ? "text-muted line-through decoration-2" : "font-bold"}`}>{s.text}</span>
                </li>
              ))}
            </ol>
          </div>
        ))}
      </div>

      {plan.searchIdeas.length ? (
        <div className="mt-8">
          <h3 className="mb-2 text-xl">{c.ideas}</h3>
          <ul className="flex flex-wrap gap-2">
            {plan.searchIdeas.map((q) => <li key={q}><Link href={`/t/find/search?q=${encodeURIComponent(q)}`} className="inline-flex items-center gap-1.5 rounded-full border-[1.5px] border-ink bg-surface px-4 py-1.5 font-bold hover:bg-sunken"><Search size={15} />{q}</Link></li>)}
          </ul>
        </div>
      ) : null}

      <details open={autoAdjust} className="guide-card mt-8 p-4">
        <summary className="cursor-pointer font-display text-xl font-semibold">{c.adjustTitle}</summary>
        <form className="mt-3" onSubmit={async (e) => { e.preventDefault(); if (text.trim().length < 3) return; if (await onAdjust(text.trim())) setText(""); }}>
          <label><span className="sr-only">{c.adjustTitle}</span><textarea rows={2} value={text} maxLength={300} onChange={(e) => setText(e.target.value)} placeholder={c.adjustPh} className={inputClass} /></label>
          <button disabled={busy || text.trim().length < 3} className={`${buttonClass.secondary} mt-3`}>{busy ? c.adjusting : c.adjustGo}</button>
        </form>
      </details>

      <p className="mt-6 text-sm text-muted">{plan.source === "template" ? c.fromTemplate : c.byAi}</p>
      <div className="mt-4">
        {confirm ? (
          <span className="flex flex-wrap items-center gap-3"><b>{c.confirm}</b><button onClick={onDelete} className={buttonClass.danger}>{c.yes}</button><button onClick={() => setConfirm(false)} className={buttonClass.quiet}>{c.no}</button></span>
        ) : <button onClick={() => setConfirm(true)} className="inline-flex items-center gap-1.5 font-bold text-teal underline underline-offset-4"><Trash2 size={16} />{c.delete}</button>}
      </div>
    </section>
  );
}
