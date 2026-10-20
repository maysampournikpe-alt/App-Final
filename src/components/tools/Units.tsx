"use client";
import { useState } from "react";
import { ArrowLeftRight } from "lucide-react";
import { CATEGORIES, convert, findCategory, niceNumber } from "@/lib/units";
import { useLang } from "@/lib/i18n";
import { useCopy } from "@/lib/use-copy";
import { inputClass, Page } from "../ui";

const copy = {
  en: { title: "Unit converter", lead: "Type a number and pick the units.", kind: "What are you measuring?", from: "From", to: "To", value: "Amount", swap: "Swap the two units", result: "Result", bad: "Type a number." },
  es: { title: "Conversor de unidades", lead: "Escribe un número y elige las unidades.", kind: "¿Qué estás midiendo?", from: "De", to: "A", value: "Cantidad", swap: "Cambiar las dos unidades", result: "Resultado", bad: "Escribe un número." },
};

export function UnitsTool() {
  const c = useCopy(copy);
  const lang = useLang();
  const [cat, setCat] = useState("length");
  const units = findCategory(cat).units;
  const [from, setFrom] = useState("mi");
  const [to, setTo] = useState("km");
  const [text, setText] = useState("1");

  const pick = (id: string) => { const u = findCategory(id).units; setCat(id); setFrom(u[0].id); setTo(u[1]?.id ?? u[0].id); };
  const n = parseFloat(text.replace(",", "."));
  const ok = text.trim() !== "" && Number.isFinite(n);
  const out = ok ? niceNumber(convert(n, cat, from, to)) : "";
  const name = (id: string) => units.find((x) => x.id === id)?.[lang] ?? id;

  return (
    <Page>
      <h1 className="text-3xl sm:text-4xl">{c.title}</h1>
      <p className="mt-2 max-w-prose text-muted">{c.lead}</p>
      <div className="mt-6 flex flex-wrap gap-2" role="group" aria-label={c.kind}>
        {CATEGORIES.map((k) => (
          <button key={k.id} onClick={() => pick(k.id)} aria-pressed={cat === k.id}
            className={`rounded-full border-[1.5px] border-ink px-4 py-1.5 font-bold ${cat === k.id ? "bg-ink text-paper" : "bg-surface hover:bg-sunken"}`}>{k[lang]}</button>
        ))}
      </div>
      <div className="guide-card mt-6 grid gap-4 p-5 sm:grid-cols-[1fr_auto_1fr] sm:items-end">
        <label><span className="block font-bold">{c.from}</span>
          <input inputMode="decimal" value={text} onChange={(e) => setText(e.target.value)} aria-label={c.value} aria-invalid={!ok} className={`${inputClass} mt-1`} />
          <select value={from} onChange={(e) => setFrom(e.target.value)} className={`${inputClass} mt-2`}>{units.map((x) => <option key={x.id} value={x.id}>{x[lang]}</option>)}</select></label>
        <button onClick={() => { setFrom(to); setTo(from); }} aria-label={c.swap} title={c.swap} className="grid h-11 w-11 place-items-center self-center rounded-full border-[1.5px] border-ink bg-surface hover:bg-sunken"><ArrowLeftRight size={20} strokeWidth={1.75} /></button>
        <label><span className="block font-bold">{c.to}</span>
          <output className={`${inputClass} mt-1 block min-h-[3rem] font-bold`} aria-live="polite">{out || (text.trim() ? c.bad : "")}</output>
          <select value={to} onChange={(e) => setTo(e.target.value)} className={`${inputClass} mt-2`}>{units.map((x) => <option key={x.id} value={x.id}>{x[lang]}</option>)}</select></label>
      </div>
      {ok ? <p className="mt-4 text-lg" aria-live="polite">{niceNumber(n)} {name(from)} = <strong>{out}</strong> {name(to)}</p> : null}
    </Page>
  );
}
