"use client";
import { useState } from "react";
import { neededOnFinal } from "@/lib/grades";
import { useCopy } from "@/lib/use-copy";
import { Field, inputClass, Page } from "../ui";

const copy = {
  en: {
    title: "Grade calculator", lead: "What do you need on the final to get the grade you want?",
    current: "Your grade now (%)", weight: "How much the final counts (%)", weightHelp: "Look in your syllabus. Often 10 to 25.",
    target: "Grade you want (%)", quick: "What you would need for each grade",
    letters: [["A", 90], ["B", 80], ["C", 70], ["D", 60]] as [string, number][],
    need: (n: number) => `You need about ${n}% on the final.`,
    already: "You already have it. Even a 0 on the final keeps you at or above that grade.",
    impossible: (n: number) => `That would take ${n}%, more than a 100. Talk to your teacher about extra credit, or aim for the next grade down.`,
    fill: "Fill in the three numbers to see it.", note: "Your teacher's rounding and extra credit can change this a little.",
    needFor: (l: string, n: string) => `${l}: ${n}`, none: "Not reachable", safe: "Already safe",
  },
  es: {
    title: "Calculadora de calificación", lead: "¿Cuánto necesitas en el examen final para sacar la calificación que quieres?",
    current: "Tu calificación ahora (%)", weight: "Cuánto vale el examen final (%)", weightHelp: "Búscalo en el programa de la clase. Casi siempre es de 10 a 25.",
    target: "Calificación que quieres (%)", quick: "Lo que necesitarías para cada calificación",
    letters: [["A", 90], ["B", 80], ["C", 70], ["D", 60]] as [string, number][],
    need: (n: number) => `Necesitas más o menos ${n}% en el examen final.`,
    already: "Ya la tienes. Aunque saques 0 en el final, te quedas en esa calificación o mejor.",
    impossible: (n: number) => `Eso requeriría ${n}%, más de 100. Habla con tu maestro sobre puntos extra, o apunta a la calificación de abajo.`,
    fill: "Escribe los tres números para verlo.", note: "El redondeo de tu maestro y los puntos extra pueden cambiar esto un poco.",
    needFor: (l: string, n: string) => `${l}: ${n}`, none: "No se alcanza", safe: "Ya está segura",
  },
};

const num = (s: string) => (s.trim() === "" ? NaN : Number(s.replace(",", ".")));

export function GradeCalcTool() {
  const c = useCopy(copy);
  const [cur, setCur] = useState("");
  const [w, setW] = useState("20");
  const [tgt, setTgt] = useState("90");
  const res = neededOnFinal(num(cur), num(w), num(tgt));

  return (
    <Page>
      <h1 className="text-3xl sm:text-4xl">{c.title}</h1>
      <p className="mt-2 max-w-prose text-lg">{c.lead}</p>
      <div className="mt-6 grid max-w-xl gap-x-6 sm:grid-cols-3">
        <Field label={c.current}>{(p) => <input {...p} inputMode="decimal" value={cur} onChange={(e) => setCur(e.target.value)} className={inputClass} />}</Field>
        <Field label={c.weight} help={c.weightHelp}>{(p) => <input {...p} inputMode="decimal" value={w} onChange={(e) => setW(e.target.value)} className={inputClass} />}</Field>
        <Field label={c.target}>{(p) => <input {...p} inputMode="decimal" value={tgt} onChange={(e) => setTgt(e.target.value)} className={inputClass} />}</Field>
      </div>

      <div className="guide-card max-w-xl p-6" aria-live="polite">
        {!res ? <p>{c.fill}</p> : res.kind === "possible" ? (
          <p className="font-display text-3xl font-semibold">{c.need(res.needed)}</p>
        ) : res.kind === "already" ? <p className="font-display text-2xl font-semibold text-palm">{c.already}</p>
          : <p className="text-lg font-bold text-ruby">{c.impossible(res.needed)}</p>}
      </div>

      {Number.isFinite(num(cur)) && num(w) > 0 && num(w) <= 100 ? (
        <section className="mt-8 max-w-xl">
          <h2 className="mb-2 text-2xl">{c.quick}</h2>
          <ul className="divide-y-2 divide-dotted divide-line border-y-[1.5px] border-ink">
            {c.letters.map(([l, t]) => {
              const r = neededOnFinal(num(cur), num(w), t);
              return (
                <li key={l} className="flex items-baseline justify-between py-2.5">
                  <span className="font-display text-xl font-semibold">{l} <span className="text-base text-muted">({t}%)</span></span>
                  <span className={`font-bold tabular-nums ${r?.kind === "impossible" ? "text-muted" : r?.kind === "already" ? "text-palm" : ""}`}>
                    {!r ? "–" : r.kind === "impossible" ? c.none : r.kind === "already" ? c.safe : `${r.needed}%`}
                  </span>
                </li>
              );
            })}
          </ul>
        </section>
      ) : null}
      <p className="mt-6 max-w-prose text-sm text-muted">{c.note}</p>
    </Page>
  );
}
