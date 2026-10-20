"use client";
import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { diffDays, formatDay, isValidISO, today } from "@/lib/dates";
import { compound, goalPlan, NO_GOALS, paycheck, SAVINGS_KEY, type Goal } from "@/lib/finance";
import { useLang } from "@/lib/i18n";
import { useLocalDoc } from "@/lib/local-doc";
import { useCopy } from "@/lib/use-copy";
import { EmptyTrail } from "../art";
import { buttonClass, Field, inputClass, Page } from "../ui";

const num = (s: string) => { const n = parseFloat(s.replace(",", ".")); return Number.isFinite(n) && n >= 0 ? n : 0; };
const money = (n: number, lang: string) => new Intl.NumberFormat(lang === "es" ? "es-US" : "en-US", { style: "currency", currency: "USD" }).format(n);

const copy = {
  en: {
    compoundTitle: "Compound interest", compoundLead: "See what saving a little each month turns into.",
    start: "Money you start with ($)", monthly: "Added each month ($)", rate: "Yearly interest (%)", years: "Years", result: "After the time is up",
    final: "You will have", put: "You put in", earned: "Interest earned", year: "Year", balance: "Balance",
    rateNote: "Savings accounts often pay a few percent. Stocks vary a lot, so treat high numbers as a guess, not a promise.",
    earlyTitle: "Why start early?", early: (a: string, b: string) => `The same $50 a month for 10 years gives ${a}. For 20 years it gives ${b}.`,
    saveTitle: "Savings goal tracker", saveLead: "I want $400 for a laptop by March. How much each week?",
    goalName: "What are you saving for?", goalPh: "Laptop", target: "Goal ($)", saved: "Saved so far ($)", by: "By when", add: "Add goal",
    needName: "Write what it is.", needTarget: "Enter how much you need.", needDate: "Pick a date.", empty: "No goals yet. Add one above.", remove: "Remove",
    left: "Left to save", perWeek: "per week", perMonth: "per month", reached: "Goal reached!", late: "The date passed. Pick a new date, or keep saving.",
    addMoney: "I saved ($)", addBtn: "Add", daysLeft: (n: number) => `${n} days left`,
    payTitle: "Paycheck calculator", payLead: "Hourly pay times hours, minus the usual taxes.",
    wage: "Pay per hour ($)", hours: "Hours worked", fed: "Income tax withheld (%)", fedHelp: "Many teen jobs withhold 0%. Your first paycheck form (W-4) decides this.",
    gross: "Before taxes", ss: "Social Security (6.2%)", med: "Medicare (1.45%)", fedLine: "Income tax withheld", net: "Take-home pay",
    payNote: "This is an estimate. Texas has no state income tax. Check your pay stub, and see the Teen work law guide for how many hours you can work.",
  },
  es: {
    compoundTitle: "Interés compuesto", compoundLead: "Mira en qué se convierte ahorrar un poco cada mes.",
    start: "Dinero con el que empiezas ($)", monthly: "Lo que agregas cada mes ($)", rate: "Interés anual (%)", years: "Años", result: "Al terminar el tiempo",
    final: "Tendrás", put: "Tú pusiste", earned: "Interés ganado", year: "Año", balance: "Saldo",
    rateNote: "Las cuentas de ahorro suelen pagar unos pocos por ciento. Las acciones varían mucho, así que un número alto es una suposición, no una promesa.",
    earlyTitle: "¿Por qué empezar temprano?", early: (a: string, b: string) => `Los mismos $50 al mes durante 10 años dan ${a}. Durante 20 años dan ${b}.`,
    saveTitle: "Meta de ahorro", saveLead: "Quiero $400 para una laptop en marzo. ¿Cuánto por semana?",
    goalName: "¿Para qué estás ahorrando?", goalPh: "Laptop", target: "Meta ($)", saved: "Ahorrado hasta ahora ($)", by: "Para cuándo", add: "Agregar meta",
    needName: "Escribe qué es.", needTarget: "Escribe cuánto necesitas.", needDate: "Elige una fecha.", empty: "Todavía no hay metas. Agrega una arriba.", remove: "Quitar",
    left: "Falta ahorrar", perWeek: "por semana", perMonth: "por mes", reached: "¡Meta lograda!", late: "La fecha ya pasó. Elige una nueva, o sigue ahorrando.",
    addMoney: "Ahorré ($)", addBtn: "Agregar", daysLeft: (n: number) => `Faltan ${n} días`,
    payTitle: "Calculadora de cheque", payLead: "Pago por hora por las horas, menos los impuestos de siempre.",
    wage: "Pago por hora ($)", hours: "Horas trabajadas", fed: "Impuesto sobre ingresos retenido (%)", fedHelp: "Muchos trabajos de jóvenes retienen 0%. Lo decide tu primer formulario (W-4).",
    gross: "Antes de impuestos", ss: "Seguro Social (6.2%)", med: "Medicare (1.45%)", fedLine: "Impuesto sobre ingresos retenido", net: "Lo que te llevas",
    payNote: "Es un cálculo aproximado. Texas no tiene impuesto estatal sobre ingresos. Revisa tu talón de pago, y mira la Guía de trabajo para menores para saber cuántas horas puedes trabajar.",
  },
};
type C = typeof copy.en;

export function MoneyTool({ view }: { view: "compound" | "savings" | "paycheck" }) {
  const c = useCopy(copy);
  return view === "compound" ? <Compound c={c} /> : view === "savings" ? <Savings c={c} /> : <Paycheck c={c} />;
}

function Compound({ c }: { c: C }) {
  const lang = useLang();
  const [start, setStart] = useState("100");
  const [monthly, setMonthly] = useState("50");
  const [rate, setRate] = useState("5");
  const [years, setYears] = useState("10");
  const yrs = Math.min(60, Math.max(1, Math.round(num(years))));
  const r = compound({ principal: num(start), monthly: num(monthly), annualPct: Math.min(30, num(rate)), years: yrs });
  const a = compound({ principal: 0, monthly: 50, annualPct: Math.min(30, num(rate)), years: 10 }).balance;
  const b = compound({ principal: 0, monthly: 50, annualPct: Math.min(30, num(rate)), years: 20 }).balance;
  const max = Math.max(...r.byYear.map((x) => x.balance), 1);

  return (
    <Page>
      <h1 className="text-3xl sm:text-4xl">{c.compoundTitle}</h1>
      <p className="mt-2 max-w-prose text-muted">{c.compoundLead}</p>
      <div className="guide-card mt-6 grid gap-x-4 p-5 sm:grid-cols-2">
        <Field label={c.start}>{(p) => <input {...p} inputMode="decimal" value={start} onChange={(e) => setStart(e.target.value)} className={inputClass} />}</Field>
        <Field label={c.monthly}>{(p) => <input {...p} inputMode="decimal" value={monthly} onChange={(e) => setMonthly(e.target.value)} className={inputClass} />}</Field>
        <Field label={c.rate} help={c.rateNote}>{(p) => <input {...p} inputMode="decimal" value={rate} onChange={(e) => setRate(e.target.value)} className={inputClass} />}</Field>
        <Field label={c.years}>{(p) => <input {...p} inputMode="numeric" value={years} onChange={(e) => setYears(e.target.value)} className={inputClass} />}</Field>
      </div>
      <section className="guide-card mt-6 p-5" aria-live="polite">
        <h2 className="text-2xl">{c.result}</h2>
        <p className="mt-2 text-lg">{c.final}: <strong className="font-display text-3xl text-teal">{money(r.balance, lang)}</strong></p>
        <p className="mt-1 text-muted">{c.put}: {money(r.contributed, lang)} · {c.earned}: {money(r.interest, lang)}</p>
        <ol className="mt-4 space-y-1" aria-label={c.balance}>
          {r.byYear.filter((_, i, all) => all.length <= 12 || i % Math.ceil(all.length / 12) === 0 || i === all.length - 1).map((row) => (
            <li key={row.year} className="flex items-center gap-3 text-sm">
              <span className="w-16 shrink-0 text-muted">{c.year} {row.year}</span>
              <span className="relative h-5 flex-1 rounded-sm bg-sunken" aria-hidden>
                <span className="absolute inset-y-0 left-0 rounded-sm bg-teal" style={{ width: `${(row.contributed / max) * 100}%` }} />
                <span className="absolute inset-y-0 left-0 rounded-sm bg-marigold/80" style={{ width: `${(row.balance / max) * 100}%`, clipPath: `inset(0 0 0 ${(row.contributed / row.balance) * 100}%)` }} />
              </span>
              <span className="w-24 shrink-0 text-right font-bold tabular-nums">{money(row.balance, lang)}</span>
            </li>
          ))}
        </ol>
      </section>
      <p className="mt-6 max-w-prose"><strong>{c.earlyTitle}</strong> {c.early(money(a, lang), money(b, lang))}</p>
    </Page>
  );
}

function Savings({ c }: { c: C }) {
  const lang = useLang();
  const [goals, setGoals] = useLocalDoc<Goal[]>(SAVINGS_KEY, NO_GOALS);
  const [name, setName] = useState("");
  const [target, setTarget] = useState("");
  const [saved, setSaved] = useState("0");
  const [by, setBy] = useState("");
  const [err, setErr] = useState<"name" | "target" | "date" | null>(null);
  const [adds, setAdds] = useState<Record<string, string>>({});
  const now = today();

  const add = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return setErr("name");
    if (num(target) <= 0) return setErr("target");
    if (!isValidISO(by)) return setErr("date");
    setErr(null);
    setGoals((p) => [...p, { id: crypto.randomUUID(), name: name.trim(), target: num(target), saved: num(saved), by }]);
    setName(""); setTarget(""); setSaved("0"); setBy("");
  };
  const deposit = (id: string) => { const n = num(adds[id] ?? ""); if (n > 0) { setGoals((p) => p.map((g) => (g.id === id ? { ...g, saved: g.saved + n } : g))); setAdds((a) => ({ ...a, [id]: "" })); } };

  return (
    <Page wide>
      <h1 className="text-3xl sm:text-4xl">{c.saveTitle}</h1>
      <p className="mt-2 max-w-prose text-muted">{c.saveLead}</p>
      <form onSubmit={add} className="guide-card mt-6 grid gap-x-4 p-5 sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_1fr_auto] lg:items-start" noValidate>
        <Field label={c.goalName} error={err === "name" ? c.needName : null}>{(p) => <input {...p} value={name} onChange={(e) => setName(e.target.value)} placeholder={c.goalPh} maxLength={50} className={inputClass} />}</Field>
        <Field label={c.target} error={err === "target" ? c.needTarget : null}>{(p) => <input {...p} inputMode="decimal" value={target} onChange={(e) => setTarget(e.target.value)} className={inputClass} />}</Field>
        <Field label={c.saved}>{(p) => <input {...p} inputMode="decimal" value={saved} onChange={(e) => setSaved(e.target.value)} className={inputClass} />}</Field>
        <Field label={c.by} error={err === "date" ? c.needDate : null}>{(p) => <input {...p} type="date" value={by} onChange={(e) => setBy(e.target.value)} className={inputClass} />}</Field>
        <div className="lg:pt-7"><button className={buttonClass.primary}><Plus size={18} />{c.add}</button></div>
      </form>

      {goals.length === 0 ? (
        <div className="guide-card mt-8 flex max-w-xl items-center gap-5 p-5"><EmptyTrail className="h-24 w-36 shrink-0 text-ink" /><p className="text-lg">{c.empty}</p></div>
      ) : (
        <ul className="mt-8 space-y-4">
          {goals.map((g) => {
            const p = goalPlan(g, now);
            return (
              <li key={g.id} className="guide-card p-4">
                <div className="flex items-start gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="font-display text-xl font-semibold">{g.name}</p>
                    <p className="text-sm text-muted">{money(g.saved, lang)} / {money(g.target, lang)} · {formatDay(g.by, lang)} · {p.late ? "" : c.daysLeft(Math.max(0, diffDays(now, g.by)))}</p>
                  </div>
                  <button onClick={() => setGoals((q) => q.filter((x) => x.id !== g.id))} aria-label={`${c.remove}: ${g.name}`} className="grid h-10 w-10 shrink-0 place-items-center rounded-md hover:bg-sunken"><Trash2 size={18} strokeWidth={1.75} /></button>
                </div>
                <div className="mt-3 h-4 overflow-hidden rounded-full border-[1.5px] border-ink bg-sunken" role="progressbar" aria-valuenow={p.percent} aria-valuemin={0} aria-valuemax={100} aria-label={g.name}>
                  <div className="h-full bg-teal" style={{ width: `${p.percent}%` }} />
                </div>
                {p.done ? <p className="mt-3 font-bold text-teal">{c.reached}</p> : p.late ? <p className="mt-3 font-bold text-ruby">{c.late}</p> : (
                  <p className="mt-3"><strong>{c.left}: {money(p.left, lang)}</strong> — {money(p.perWeek, lang)} {c.perWeek} · {money(p.perMonth, lang)} {c.perMonth}</p>
                )}
                {!p.done ? (
                  <div className="mt-3 flex items-end gap-2">
                    <label className="w-36"><span className="block text-sm font-bold">{c.addMoney}</span>
                      <input inputMode="decimal" value={adds[g.id] ?? ""} onChange={(e) => setAdds((a) => ({ ...a, [g.id]: e.target.value }))} onKeyDown={(e) => e.key === "Enter" && deposit(g.id)} className={`${inputClass} !py-1.5`} /></label>
                    <button onClick={() => deposit(g.id)} className={buttonClass.secondary}>{c.addBtn}</button>
                  </div>
                ) : null}
              </li>
            );
          })}
        </ul>
      )}
    </Page>
  );
}

function Paycheck({ c }: { c: C }) {
  const lang = useLang();
  const [wage, setWage] = useState("10");
  const [hours, setHours] = useState("15");
  const [fed, setFed] = useState("0");
  const r = paycheck({ wage: num(wage), hours: Math.min(80, num(hours)), fedPct: Math.min(50, num(fed)) });
  const rows: [string, number][] = [[c.gross, r.gross], [`− ${c.ss}`, r.socialSecurity], [`− ${c.med}`, r.medicare], [`− ${c.fedLine}`, r.federal]];

  return (
    <Page>
      <h1 className="text-3xl sm:text-4xl">{c.payTitle}</h1>
      <p className="mt-2 max-w-prose text-muted">{c.payLead}</p>
      <div className="guide-card mt-6 grid gap-x-4 p-5 sm:grid-cols-3">
        <Field label={c.wage}>{(p) => <input {...p} inputMode="decimal" value={wage} onChange={(e) => setWage(e.target.value)} className={inputClass} />}</Field>
        <Field label={c.hours}>{(p) => <input {...p} inputMode="decimal" value={hours} onChange={(e) => setHours(e.target.value)} className={inputClass} />}</Field>
        <Field label={c.fed} help={c.fedHelp}>{(p) => <input {...p} inputMode="decimal" value={fed} onChange={(e) => setFed(e.target.value)} className={inputClass} />}</Field>
      </div>
      <dl className="guide-card mt-6 p-5" aria-live="polite">
        {rows.map(([k, v]) => (<div key={k} className="flex justify-between border-b-2 border-dotted border-line py-2"><dt>{k}</dt><dd className="font-bold tabular-nums">{money(v, lang)}</dd></div>))}
        <div className="flex items-baseline justify-between pt-3"><dt className="font-display text-xl font-semibold">{c.net}</dt><dd className="font-display text-3xl font-semibold text-teal tabular-nums">{money(r.net, lang)}</dd></div>
      </dl>
      <p className="mt-4 max-w-prose text-sm text-muted">{c.payNote}</p>
    </Page>
  );
}
