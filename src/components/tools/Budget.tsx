"use client";
import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { BUDGET_KEY, monthSummary, NO_BUDGET, type BudgetLine } from "@/lib/career";
import { today } from "@/lib/dates";
import { useLang } from "@/lib/i18n";
import { useLocalDoc } from "@/lib/local-doc";
import { useCopy } from "@/lib/use-copy";
import { EmptyTrail } from "../art";
import { buttonClass, inputClass, Page } from "../ui";

const copy = {
  en: {
    title: "Budget planner", lead: "Track what comes in, what goes out, and what you save, month by month.", month: "Month", kind: "Type", kinds: { income: "Money in", spend: "Spent", save: "Saved" } as Record<BudgetLine["kind"], string>,
    label: "What for?", labelPh: "Paycheck", amount: "Amount ($)", add: "Add", need: "Write what it is and an amount above 0.", income: "Money in", spend: "Spent", save: "Saved", left: "Left over", rate: (n: number) => `You saved ${n}% of what came in.`,
    over: "You spent more than came in this month.", empty: "Nothing for this month yet.", remove: "Remove", prev: "Previous month", next: "Next month",
  },
  es: {
    title: "Presupuesto", lead: "Lleva la cuenta de lo que entra, lo que sale y lo que ahorras, mes por mes.", month: "Mes", kind: "Tipo", kinds: { income: "Dinero que entra", spend: "Gastado", save: "Ahorrado" } as Record<BudgetLine["kind"], string>,
    label: "¿Para qué?", labelPh: "Cheque", amount: "Cantidad ($)", add: "Agregar", need: "Escribe qué es y una cantidad mayor que 0.", income: "Dinero que entra", spend: "Gastado", save: "Ahorrado", left: "Sobra", rate: (n: number) => `Ahorraste el ${n}% de lo que entró.`,
    over: "Gastaste más de lo que entró este mes.", empty: "Todavía no hay nada para este mes.", remove: "Quitar", prev: "Mes anterior", next: "Mes siguiente",
  },
};

export function BudgetTool() {
  const c = useCopy(copy);
  const lang = useLang();
  const [lines, setLines] = useLocalDoc<BudgetLine[]>(BUDGET_KEY, NO_BUDGET);
  const [month, setMonth] = useState(today().slice(0, 7));
  const [f, setF] = useState({ kind: "income" as BudgetLine["kind"], label: "", amount: "" });
  const [err, setErr] = useState(false);
  const money = (n: number) => new Intl.NumberFormat(lang === "es" ? "es-US" : "en-US", { style: "currency", currency: "USD" }).format(n);
  const shift = (n: number) => { const [y, m] = month.split("-").map(Number); const d = new Date(y, m - 1 + n, 1); setMonth(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`); };
  const add = (e: React.FormEvent) => {
    e.preventDefault();
    const a = parseFloat(f.amount.replace(",", "."));
    if (!f.label.trim() || !(a > 0)) return setErr(true);
    setErr(false);
    setLines((p) => [...p, { id: crypto.randomUUID(), month, kind: f.kind, label: f.label.trim(), amount: Math.round(a * 100) / 100 }]);
    setF({ ...f, label: "", amount: "" });
  };
  const s = monthSummary(lines, month), mine = lines.filter((l) => l.month === month);
  const title = new Intl.DateTimeFormat(lang === "es" ? "es-US" : "en-US", { month: "long", year: "numeric" }).format(new Date(Number(month.slice(0, 4)), Number(month.slice(5)) - 1, 1));
  return (
    <Page>
      <h1 className="text-3xl sm:text-4xl">{c.title}</h1>
      <p className="mt-2 max-w-prose text-muted">{c.lead}</p>
      <div className="mt-6 flex items-center gap-2"><button onClick={() => shift(-1)} aria-label={c.prev} className="rounded-xl border-[1.5px] border-ink px-3 py-1.5 font-bold hover:bg-sunken">‹</button>
        <h2 className="min-w-40 text-center font-display text-2xl capitalize" aria-live="polite">{title}</h2><button onClick={() => shift(1)} aria-label={c.next} className="rounded-xl border-[1.5px] border-ink px-3 py-1.5 font-bold hover:bg-sunken">›</button></div>
      <dl className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4" aria-live="polite">
        {([[c.income, s.income, ""], [c.spend, s.spend, ""], [c.save, s.save, ""], [c.left, s.left, s.left < 0 ? "text-ruby" : "text-teal"]] as const).map(([k, v, cls]) => (
          <div key={k} className="guide-card p-3"><dt className="text-sm font-bold text-muted">{k}</dt><dd className={`font-display text-2xl font-semibold ${cls}`}>{money(v)}</dd></div>))}</dl>
      {s.income > 0 ? <p className="mt-2 text-sm text-muted">{c.rate(s.saveRate)}{s.left < 0 ? ` ${c.over}` : ""}</p> : null}
      <form onSubmit={add} className="guide-card mt-6 grid gap-x-4 p-5 sm:grid-cols-2 lg:grid-cols-[1fr_2fr_1fr_auto] lg:items-end" noValidate>
        <label className="mb-3 block lg:mb-0"><span className="block font-bold">{c.kind}</span><select value={f.kind} onChange={(e) => setF({ ...f, kind: e.target.value as BudgetLine["kind"] })} className={`${inputClass} mt-1`}>{(["income", "spend", "save"] as const).map((k) => <option key={k} value={k}>{c.kinds[k]}</option>)}</select></label>
        <label className="mb-3 block lg:mb-0"><span className="block font-bold">{c.label}</span><input value={f.label} onChange={(e) => setF({ ...f, label: e.target.value })} placeholder={c.labelPh} maxLength={50} className={`${inputClass} mt-1`} /></label>
        <label className="mb-3 block lg:mb-0"><span className="block font-bold">{c.amount}</span><input inputMode="decimal" value={f.amount} onChange={(e) => setF({ ...f, amount: e.target.value })} className={`${inputClass} mt-1`} /></label>
        <button className={buttonClass.primary}><Plus size={18} />{c.add}</button>
        {err ? <p role="alert" className="mt-2 font-bold text-ruby sm:col-span-2 lg:col-span-4">{c.need}</p> : null}
      </form>
      {mine.length === 0 ? <div className="mt-6 flex max-w-xl items-center gap-5"><EmptyTrail className="h-20 w-32 shrink-0 text-ink" /><p className="text-lg">{c.empty}</p></div> : (
        <ul className="mt-4 divide-y-2 divide-dotted divide-line">{mine.map((l) => (
          <li key={l.id} className="flex items-center gap-3 py-2.5"><div className="min-w-0 flex-1"><p className="font-bold">{l.label}</p><p className="text-sm text-muted">{c.kinds[l.kind]}</p></div>
            <p className={`font-bold tabular-nums ${l.kind === "income" ? "text-teal" : ""}`}>{l.kind === "income" ? "+" : "−"}{money(l.amount)}</p>
            <button onClick={() => setLines((p) => p.filter((x) => x.id !== l.id))} aria-label={`${c.remove}: ${l.label}`} className="grid h-10 w-10 shrink-0 place-items-center rounded-xl hover:bg-sunken"><Trash2 size={18} strokeWidth={1.75} /></button></li>))}</ul>
      )}
    </Page>
  );
}
