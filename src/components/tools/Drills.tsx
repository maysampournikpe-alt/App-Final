"use client";
import { useEffect, useRef, useState } from "react";
import { today } from "@/lib/dates";
import { bestFor, DRILL_KEY, makeQuestions, NO_SCORES, type DrillOp, type DrillScore, type Question } from "@/lib/drills";
import { useLocalDoc } from "@/lib/local-doc";
import { useCopy } from "@/lib/use-copy";
import { buttonClass, inputClass, Page } from "../ui";

const copy = {
  en: {
    title: "Math facts drills", lead: "Twenty quick questions. Beat your best time, with every answer right.", op: "Practice", upTo: "Numbers up to", start: "Start",
    ops: { "+": "Add", "-": "Subtract", "×": "Multiply", "÷": "Divide" } as Record<DrillOp, string>, q: (n: number, t: number) => `Question ${n} of ${t}`, answer: "Your answer", check: "Check", correct: "Correct!", wrong: (a: number) => `Not quite. The answer is ${a}.`,
    next: "Next", finish: "See my score", score: (r: number, t: number) => `${r} of ${t} right`, time: (s: number) => `${s} seconds`, best: (s: number) => `Your best perfect run: ${s} seconds`, newBest: "New best time!", missed: "Missed", again: "Go again", back: "Change settings", noBest: "No perfect run yet at this level.",
  },
  es: {
    title: "Práctica de operaciones", lead: "Veinte preguntas rápidas. Mejora tu tiempo, con todas las respuestas bien.", op: "Practicar", upTo: "Números hasta", start: "Empezar",
    ops: { "+": "Sumar", "-": "Restar", "×": "Multiplicar", "÷": "Dividir" } as Record<DrillOp, string>, q: (n: number, t: number) => `Pregunta ${n} de ${t}`, answer: "Tu respuesta", check: "Revisar", correct: "¡Correcto!", wrong: (a: number) => `Casi. La respuesta es ${a}.`,
    next: "Siguiente", finish: "Ver mi resultado", score: (r: number, t: number) => `${r} de ${t} bien`, time: (s: number) => `${s} segundos`, best: (s: number) => `Tu mejor intento perfecto: ${s} segundos`, newBest: "¡Nuevo mejor tiempo!", missed: "Falladas", again: "Otra vez", back: "Cambiar opciones", noBest: "Todavía no hay un intento perfecto en este nivel.",
  },
};
const COUNT = 20;
const OPS: DrillOp[] = ["+", "-", "×", "÷"];

export function DrillsTool() {
  const c = useCopy(copy);
  const [scores, setScores] = useLocalDoc<DrillScore[]>(DRILL_KEY, NO_SCORES);
  const [op, setOp] = useState<DrillOp>("×");
  const [max, setMax] = useState(12);
  const [qs, setQs] = useState<Question[] | null>(null);
  const [i, setI] = useState(0);
  const [text, setText] = useState("");
  const [feedback, setFeedback] = useState<null | boolean>(null);
  const [right, setRight] = useState(0);
  const [missed, setMissed] = useState<Question[]>([]);
  const [done, setDone] = useState<null | { seconds: number; newBest: boolean }>(null);
  const t0 = useRef(0);
  const input = useRef<HTMLInputElement>(null);
  useEffect(() => { input.current?.focus(); }, [i, qs, feedback]);

  const begin = () => { setQs(makeQuestions(op, max, COUNT)); setI(0); setRight(0); setMissed([]); setText(""); setFeedback(null); setDone(null); t0.current = Date.now(); };
  const q = qs?.[i];
  const check = (e: React.FormEvent) => {
    e.preventDefault();
    if (!q || feedback !== null || text.trim() === "") return;
    const ok = parseInt(text, 10) === q.answer;
    setFeedback(ok);
    if (ok) setRight((n) => n + 1); else setMissed((m) => [...m, q]);
  };
  const next = () => {
    if (!qs) return;
    if (i + 1 < qs.length) { setI(i + 1); setText(""); setFeedback(null); return; }
    const seconds = Math.round((Date.now() - t0.current) / 1000);
    const total = qs.length;
    const prior = bestFor(scores, op, max);
    const perfect = right === total;
    setScores((p) => [...p, { op, max, right, total, seconds, date: today() }].slice(-200));
    setDone({ seconds, newBest: perfect && (!prior || seconds < prior.seconds) });
  };
  const best = bestFor(scores, op, max);

  return (
    <Page>
      <h1 className="text-3xl sm:text-4xl">{c.title}</h1>
      <p className="mt-2 max-w-prose text-muted">{c.lead}</p>

      {!qs || done ? (
        <div className="mt-6">
          {done && qs ? (
            <section className="guide-card mb-6 p-5" aria-live="polite">
              <p className="font-display text-3xl font-semibold">{c.score(right, qs.length)} · {c.time(done.seconds)}</p>
              {done.newBest ? <p className="mt-1 font-bold text-teal">{c.newBest}</p> : null}
              {missed.length ? <p className="mt-3"><strong>{c.missed}:</strong> {missed.map((m, k) => <span key={k} className="mr-3 whitespace-nowrap">{m.a} {m.op} {m.b} = {m.answer}</span>)}</p> : null}
            </section>
          ) : null}
          <div className="guide-card p-5">
            <p className="font-bold">{c.op}</p>
            <div className="mt-2 flex flex-wrap gap-2" role="group" aria-label={c.op}>
              {OPS.map((o) => <button key={o} onClick={() => setOp(o)} aria-pressed={op === o} className={`rounded-full border-[1.5px] border-ink px-4 py-1.5 font-bold ${op === o ? "bg-ink text-paper" : "bg-surface hover:bg-sunken"}`}>{o} {c.ops[o]}</button>)}
            </div>
            <label className="mt-4 block font-bold">{c.upTo}
              <select value={max} onChange={(e) => setMax(Number(e.target.value))} className={`${inputClass} mt-1 !w-32`}>{[5, 10, 12, 20, 50, 100].map((n) => <option key={n} value={n}>{n}</option>)}</select></label>
            <p className="mt-3 text-sm text-muted">{best ? c.best(best.seconds) : c.noBest}</p>
            <button onClick={begin} className={`${buttonClass.primary} mt-4`}>{done ? c.again : c.start}</button>
          </div>
        </div>
      ) : q ? (
        <form onSubmit={check} className="mt-6">
          <p className="text-sm font-bold text-muted">{c.q(i + 1, qs.length)}</p>
          <div className="guide-card mt-2 p-6 text-center">
            <p className="font-display text-5xl font-semibold">{q.a} {q.op} {q.b} = ?</p>
            <label className="mt-5 block"><span className="sr-only">{c.answer}</span>
              <input ref={input} inputMode="numeric" value={text} onChange={(e) => setText(e.target.value.replace(/[^\d-]/g, ""))} disabled={feedback !== null} placeholder={c.answer} className={`${inputClass} mx-auto !w-48 text-center text-2xl`} /></label>
            <div aria-live="polite" className="mt-4 min-h-8 text-lg font-bold">{feedback === null ? "" : feedback ? <span className="text-teal">{c.correct}</span> : <span className="text-ruby">{c.wrong(q.answer)}</span>}</div>
            {feedback === null ? <button className={`${buttonClass.primary} mt-2`}>{c.check}</button>
              : <button type="button" onClick={next} autoFocus className={`${buttonClass.secondary} mt-2`}>{i + 1 === qs.length ? c.finish : c.next}</button>}
          </div>
        </form>
      ) : null}
    </Page>
  );
}
