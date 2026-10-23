"use client";
import { useState } from "react";
import { gcd, mixed, simplify, solve, toDecimal, toPercent, fromDecimal, type Frac, type Op } from "@/lib/fractions";
import { niceNumber } from "@/lib/units";
import { useCopy } from "@/lib/use-copy";
import { inputClass, Page } from "../ui";

const copy = {
  en: {
    title: "Fraction and percent helper", lead: "Shows the steps, not just the answer.",
    calc: "Fraction calculator", top: "top", bottom: "bottom", result: "Answer", steps: "Steps", bad: "Use whole numbers, and never 0 on the bottom.", mixedIs: "As a mixed number",
    convert: "Convert", conv: "Type a fraction, a decimal or a percent", asFrac: "Fraction", asDec: "Decimal", asPct: "Percent", convBad: "Type a number.",
    pick: { fraction: "Fraction", decimal: "Decimal", percent: "Percent" }, ofWhat: "Percent of a number", pctOf: (p: string, n: string, r: string) => `${p}% of ${n} is ${r}`, pctPh: "15", numPh: "80",
  },
  es: {
    title: "Fracciones y porcentajes", lead: "Muestra los pasos, no solo la respuesta.",
    calc: "Calculadora de fracciones", top: "numerador", bottom: "denominador", result: "Respuesta", steps: "Pasos", bad: "Usa números enteros, y nunca 0 abajo.", mixedIs: "Como número mixto",
    convert: "Convertir", conv: "Escribe una fracción, un decimal o un porcentaje", asFrac: "Fracción", asDec: "Decimal", asPct: "Porcentaje", convBad: "Escribe un número.",
    pick: { fraction: "Fracción", decimal: "Decimal", percent: "Porcentaje" }, ofWhat: "Porcentaje de un número", pctOf: (p: string, n: string, r: string) => `El ${p}% de ${n} es ${r}`, pctPh: "15", numPh: "80",
  },
};

const int = (s: string) => (/^-?\d+$/.test(s.trim()) ? parseInt(s, 10) : NaN);
const OPS: Op[] = ["+", "-", "×", "÷"];

function FracInput({ label, n, d, setN, setD, c }: { label: string; n: string; d: string; setN: (s: string) => void; setD: (s: string) => void; c: typeof copy.en }) {
  return (
    <fieldset className="text-center"><legend className="sr-only">{label}</legend>
      <input inputMode="numeric" value={n} onChange={(e) => setN(e.target.value)} aria-label={`${label} ${c.top}`} className={`${inputClass} w-20 text-center`} />
      <div className="my-1 h-0.5 bg-ink" aria-hidden />
      <input inputMode="numeric" value={d} onChange={(e) => setD(e.target.value)} aria-label={`${label} ${c.bottom}`} className={`${inputClass} w-20 text-center`} />
    </fieldset>
  );
}

export function FractionsTool() {
  const c = useCopy(copy);
  const [an, setAn] = useState("1"), [ad, setAd] = useState("2"), [bn, setBn] = useState("1"), [bd, setBd] = useState("3");
  const [op, setOp] = useState<Op>("+");
  const a: Frac = { n: int(an), d: int(ad) }, b: Frac = { n: int(bn), d: int(bd) };
  const solved = [a.n, a.d, b.n, b.d].every(Number.isFinite) ? solve(a, op, b) : null;
  const mix = solved ? mixed(solved.result) : null;

  const [kind, setKind] = useState<"fraction" | "decimal" | "percent">("fraction");
  const [cv, setCv] = useState("3/8");
  let asFrac: Frac | null = null;
  if (kind === "fraction") { const [x, y] = cv.split("/"); const f = { n: int(x ?? ""), d: int(y ?? "1") }; asFrac = Number.isFinite(f.n) && Number.isFinite(f.d) && f.d !== 0 ? simplify(f) : null; }
  else { const x = parseFloat(cv.replace(",", ".")); asFrac = Number.isFinite(x) ? fromDecimal(kind === "percent" ? x / 100 : x) : null; }

  const [p, setP] = useState("15"), [num, setNum] = useState("80");
  const pv = parseFloat(p), nv = parseFloat(num);

  return (
    <Page>
      <h1 className="text-3xl sm:text-4xl">{c.title}</h1>
      <p className="mt-2 max-w-prose text-muted">{c.lead}</p>

      <section className="guide-card mt-6 p-5" aria-labelledby="calc-h">
        <h2 id="calc-h" className="text-2xl">{c.calc}</h2>
        <div className="mt-4 flex flex-wrap items-center gap-4">
          <FracInput label="1" n={an} d={ad} setN={setAn} setD={setAd} c={c} />
          <select value={op} onChange={(e) => setOp(e.target.value as Op)} aria-label="operation" className={`${inputClass} !w-20 text-center text-2xl`}>{OPS.map((o) => <option key={o}>{o}</option>)}</select>
          <FracInput label="2" n={bn} d={bd} setN={setBn} setD={setBd} c={c} />
        </div>
        <div className="mt-5" aria-live="polite">
          {solved ? (
            <>
              <p className="text-lg">{c.result}: <strong className="font-display text-3xl text-teal">{solved.result.d === 1 ? solved.result.n : `${solved.result.n}/${solved.result.d}`}</strong>
                {mix?.rest && mix.whole !== 0 ? <span className="ml-3 text-muted">{c.mixedIs}: {mix.whole} {mix.rest.n}/{mix.rest.d}</span> : null}</p>
              <h3 className="mt-3 font-display text-lg font-semibold">{c.steps}</h3>
              <ol className="mt-1 list-decimal space-y-1 pl-6">{solved.steps.map((s, i) => <li key={i}>{s}</li>)}</ol>
              <p className="mt-2 text-sm text-muted">GCD: {gcd(solved.result.n, solved.result.d)}</p>
            </>
          ) : <p className="font-bold text-ruby">{c.bad}</p>}
        </div>
      </section>

      <section className="guide-card mt-6 p-5" aria-labelledby="conv-h">
        <h2 id="conv-h" className="text-2xl">{c.convert}</h2>
        <div className="mt-3 flex flex-wrap gap-2" role="group" aria-label={c.conv}>
          {(["fraction", "decimal", "percent"] as const).map((k) => (
            <button key={k} onClick={() => { setKind(k); setCv(k === "fraction" ? "3/8" : k === "decimal" ? "0.375" : "37.5"); }} aria-pressed={kind === k}
              className={`rounded-full border-[1.5px] border-ink px-4 py-1.5 font-bold ${kind === k ? "bg-ink text-paper" : "bg-surface hover:bg-sunken"}`}>{c.pick[k]}</button>
          ))}
        </div>
        <input value={cv} onChange={(e) => setCv(e.target.value)} aria-label={c.conv} className={`${inputClass} mt-3 max-w-xs`} />
        <dl className="mt-4 grid gap-2 sm:grid-cols-3" aria-live="polite">
          {asFrac ? ([[c.asFrac, asFrac.d === 1 ? `${asFrac.n}` : `${asFrac.n}/${asFrac.d}`], [c.asDec, niceNumber(toDecimal(asFrac))], [c.asPct, `${niceNumber(toPercent(asFrac))}%`]] as const).map(([k, v]) => (
            <div key={k} className="rounded-xl border-[1.5px] border-ink bg-surface p-3"><dt className="text-sm font-bold text-muted">{k}</dt><dd className="font-display text-2xl font-semibold">{v}</dd></div>
          )) : <p className="font-bold text-ruby sm:col-span-3">{c.convBad}</p>}
        </dl>
      </section>

      <section className="guide-card mt-6 p-5" aria-labelledby="pct-h">
        <h2 id="pct-h" className="text-2xl">{c.ofWhat}</h2>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <input inputMode="decimal" value={p} onChange={(e) => setP(e.target.value)} aria-label="%" placeholder={c.pctPh} className={`${inputClass} !w-28`} /><span className="text-xl font-bold">% of</span>
          <input inputMode="decimal" value={num} onChange={(e) => setNum(e.target.value)} aria-label="number" placeholder={c.numPh} className={`${inputClass} !w-28`} />
        </div>
        <p className="mt-3 text-lg" aria-live="polite">{Number.isFinite(pv) && Number.isFinite(nv) ? c.pctOf(niceNumber(pv), niceNumber(nv), niceNumber((pv / 100) * nv)) : ""}</p>
      </section>
    </Page>
  );
}
