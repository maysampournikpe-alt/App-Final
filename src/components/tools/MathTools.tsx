"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { Minus, Plus, RotateCcw, ArrowLeft, ArrowRight, ArrowUp, ArrowDown, Delete } from "lucide-react";
import { evaluateExpression } from "@/lib/calc";
import { DEFAULT_VIEW, fmt, niceStep, pan, roots, segments, zoom, type Fn, type View } from "@/lib/graph";
import { useLocalDoc } from "@/lib/local-doc";
import { useCopy } from "@/lib/use-copy";
import { buttonClass, inputClass, Page } from "../ui";

const copy = {
  en: {
    calcTitle: "Scientific calculator", calcLead: "Type or tap. Press Enter or = to get the answer.", expr: "Expression", deg: "Degrees", rad: "Radians", mode: "Angle mode", clear: "Clear", back: "Backspace", equals: "Equals", error: "Check the expression", history: "History", noHistory: "Your past calculations show up here.", clearHistory: "Clear history", reuse: "Use the answer", tip: "Tip: sin, cos and tan use the angle mode above. Use ^ for powers and ! for factorials.",
    gTitle: "Graphing calculator", gLead: "Plot up to three equations. Use x as the variable, like x^2 - 4 or sin(x).", fn: (n: number) => `y${n} =`, ph: ["x^2 - 4", "2x + 1", "sin(x)"], bad: "Can't read this one yet.",
    zin: "Zoom in", zout: "Zoom out", reset: "Reset the view", left: "Move left", right: "Move right", up: "Move up", down: "Move down", intercepts: "Where it crosses", xi: "x-intercepts", yi: "y-intercept", none: "None in this view", at: "Value at x =", atPh: "3", summary: (n: number) => `A graph with ${n} equation${n === 1 ? "" : "s"}.`, view: "Window",
  },
  es: {
    calcTitle: "Calculadora científica", calcLead: "Escribe o toca. Presiona Enter o = para ver la respuesta.", expr: "Expresión", deg: "Grados", rad: "Radianes", mode: "Modo de ángulos", clear: "Borrar", back: "Retroceso", equals: "Igual", error: "Revisa la expresión", history: "Historial", noHistory: "Tus cálculos anteriores aparecen aquí.", clearHistory: "Borrar historial", reuse: "Usar la respuesta", tip: "Consejo: sin, cos y tan usan el modo de ángulos de arriba. Usa ^ para potencias y ! para factoriales.",
    gTitle: "Calculadora gráfica", gLead: "Grafica hasta tres ecuaciones. Usa x como variable, como x^2 - 4 o sin(x).", fn: (n: number) => `y${n} =`, ph: ["x^2 - 4", "2x + 1", "sin(x)"], bad: "Todavía no puedo leer esta.",
    zin: "Acercar", zout: "Alejar", reset: "Restablecer la vista", left: "Mover a la izquierda", right: "Mover a la derecha", up: "Mover arriba", down: "Mover abajo", intercepts: "Dónde cruza", xi: "Cortes con el eje x", yi: "Corte con el eje y", none: "Ninguno en esta vista", at: "Valor en x =", atPh: "3", summary: (n: number) => `Una gráfica con ${n} ecuación${n === 1 ? "" : "es"}.`, view: "Ventana",
  },
};

interface Row { e: string; r: string }
const NO_ROWS: Row[] = [];
const KEYS: [string, string][] = [
  ["sin", "sin("], ["cos", "cos("], ["tan", "tan("], ["ln", "ln("], ["log", "log("], ["√", "sqrt("], ["x²", "^2"], ["^", "^"], ["π", "π"], ["e", "e"], ["!", "!"], ["ans", "ans"],
  ["(", "("], [")", ")"], ["7", "7"], ["8", "8"], ["9", "9"], ["÷", "÷"], ["4", "4"], ["5", "5"], ["6", "6"], ["×", "×"], ["1", "1"], ["2", "2"], ["3", "3"], ["−", "−"], ["0", "0"], [".", "."], ["+", "+"],
];

export function ScientificTool() {
  const c = useCopy(copy);
  const [expr, setExpr] = useState("");
  const [deg, setDeg] = useState(true);
  const [ans, setAns] = useState<number | undefined>(undefined);
  const [err, setErr] = useState(false);
  const [rows, setRows] = useLocalDoc<Row[]>("calc-history", NO_ROWS);
  const input = useRef<HTMLInputElement>(null);
  const add = (s: string) => { setExpr((x) => x + s); setErr(false); input.current?.focus(); };
  const run = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!expr.trim()) return;
    const r = await evaluateExpression(expr, { deg, ans });
    if (!r.ok) return setErr(true);
    setErr(false);
    if (r.value !== null) setAns(r.value);
    setRows((p) => [{ e: expr, r: r.text }, ...p].slice(0, 30));
    setExpr("");
  };
  const last = rows[0];
  return (
    <Page>
      <h1 className="text-3xl sm:text-4xl">{c.calcTitle}</h1>
      <p className="mt-2 max-w-prose text-muted">{c.calcLead}</p>
      <form onSubmit={run} className="guide-card mt-6 p-4">
        <label><span className="sr-only">{c.expr}</span>
          <input ref={input} value={expr} onChange={(e) => { setExpr(e.target.value); setErr(false); }} autoComplete="off" spellCheck={false} aria-invalid={err} maxLength={200} className={`${inputClass} font-mono text-xl`} /></label>
        <p className="mt-1 min-h-6 text-right font-display text-3xl font-semibold text-teal" aria-live="polite">{err ? <span className="text-lg text-ruby">{c.error}</span> : last ? `= ${last.r}` : ""}</p>
        <div className="mt-2 flex items-center gap-2" role="group" aria-label={c.mode}>
          {([true, false] as const).map((d) => <button type="button" key={String(d)} onClick={() => setDeg(d)} aria-pressed={deg === d} className={`rounded-full border-[1.5px] border-ink px-3 py-1 text-sm font-bold ${deg === d ? "bg-ink text-paper" : "bg-surface"}`}>{d ? c.deg : c.rad}</button>)}
        </div>
        <div className="mt-3 grid grid-cols-6 gap-1.5">
          {KEYS.map(([label, ins]) => <button type="button" key={label} onClick={() => add(ins)} className="rounded-md border-[1.5px] border-ink bg-surface py-2.5 text-lg font-bold hover:bg-sunken">{label}</button>)}
          <button type="button" onClick={() => { setExpr(""); setErr(false); }} aria-label={c.clear} className="rounded-md border-[1.5px] border-ink bg-surface py-2.5 text-lg font-bold text-ruby hover:bg-sunken">C</button>
          <button type="button" onClick={() => setExpr((x) => x.slice(0, -1))} aria-label={c.back} className="grid place-items-center rounded-md border-[1.5px] border-ink bg-surface py-2.5 hover:bg-sunken"><Delete size={20} /></button>
          <button className={`${buttonClass.primary} col-span-4 !py-2.5`} aria-label={c.equals}>=</button>
        </div>
      </form>
      <h2 className="mt-8 border-b-[1.5px] border-ink pb-1 text-2xl">{c.history}</h2>
      {rows.length === 0 ? <p className="mt-3 text-muted">{c.noHistory}</p> : (
        <>
          <ul className="mt-2 divide-y-2 divide-dotted divide-line font-mono">{rows.slice(0, 12).map((x, i) => (
            <li key={i} className="flex justify-between gap-3 py-2"><span className="truncate text-muted">{x.e}</span><button onClick={() => { setExpr((p) => p + x.r); input.current?.focus(); }} title={c.reuse} className="font-bold text-teal underline underline-offset-4">= {x.r}</button></li>))}</ul>
          <button onClick={() => setRows([])} className="mt-2 font-bold text-teal underline underline-offset-4">{c.clearHistory}</button>
        </>
      )}
      <p className="mt-4 max-w-prose text-sm text-muted">{c.tip}</p>
    </Page>
  );
}

const W = 640, H = 420;
const COLORS = [{ cls: "stroke-teal", dot: "bg-teal" }, { cls: "stroke-ruby", dot: "bg-ruby" }, { cls: "stroke-marigold", dot: "bg-marigold" }];
interface Compiled { fn: Fn | null; error: boolean }

export function GraphingTool() {
  const c = useCopy(copy);
  const [exprs, setExprs] = useState(["x^2 - 4", "", ""]);
  const [compiled, setCompiled] = useState<Compiled[]>([{ fn: null, error: false }, { fn: null, error: false }, { fn: null, error: false }]);
  const [view, setView] = useState<View>(DEFAULT_VIEW);
  const [evalX, setEvalX] = useState("");
  const gen = useRef(0);

  useEffect(() => {
    const mine = ++gen.current;
    (async () => {
      const math = await import("mathjs");
      const next: Compiled[] = exprs.map((raw) => {
        const t = raw.trim();
        if (!t || t.length > 100) return { fn: null, error: t.length > 100 };
        try {
          const node = math.compile(t.replace(/π/g, "pi").replace(/−/g, "-").replace(/\^\s*(\d)/g, "^$1"));
          const probe = node.evaluate({ x: 1 });
          if (typeof probe !== "number" && typeof probe !== "object") return { fn: null, error: true };
          return { fn: (x: number) => { const v = node.evaluate({ x }); return typeof v === "number" ? v : NaN; }, error: false };
        } catch { return { fn: null, error: true }; }
      });
      if (gen.current === mine) setCompiled(next);
    })();
  }, [exprs]);

  const sx = (x: number) => ((x - view.xmin) / (view.xmax - view.xmin)) * W;
  const sy = (y: number) => H - ((y - view.ymin) / (view.ymax - view.ymin)) * H;
  const clampPx = (v: number) => Math.max(-1e4, Math.min(1e4, v));
  const paths = useMemo(() => compiled.map((f) => (f.fn ? segments(f.fn, view).map((seg) => seg.map((p, i) => `${i ? "L" : "M"}${sx(p.x).toFixed(1)} ${clampPx(sy(p.y)).toFixed(1)}`).join(" ")).join(" ") : "")), [compiled, view]); // eslint-disable-line react-hooks/exhaustive-deps
  const gx = niceStep(view.xmax - view.xmin), gy = niceStep(view.ymax - view.ymin);
  const xs = Array.from({ length: Math.ceil((view.xmax - view.xmin) / gx) + 2 }, (_, i) => (Math.floor(view.xmin / gx) + i) * gx).filter((x) => x >= view.xmin && x <= view.xmax);
  const ys = Array.from({ length: Math.ceil((view.ymax - view.ymin) / gy) + 2 }, (_, i) => (Math.floor(view.ymin / gy) + i) * gy).filter((y) => y >= view.ymin && y <= view.ymax);
  const active = compiled.filter((f) => f.fn).length;
  const ev = parseFloat(evalX.replace(",", "."));
  const btn = "grid h-11 w-11 place-items-center rounded-md border-[1.5px] border-ink bg-surface hover:bg-sunken";

  return (
    <Page wide>
      <h1 className="text-3xl sm:text-4xl">{c.gTitle}</h1>
      <p className="mt-2 max-w-prose text-muted">{c.gLead}</p>
      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_20rem]">
        <section className="guide-card self-start p-3">
          <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={c.summary(active)} className="w-full touch-none text-ink">
            <rect width={W} height={H} className="fill-surface" />
            {xs.map((x) => <g key={`x${x}`}><line x1={sx(x)} x2={sx(x)} y1={0} y2={H} className="stroke-line" strokeWidth={x === 0 ? 0 : 1} /><text x={sx(x) + 2} y={Math.min(H - 4, Math.max(12, sy(0) + 12))} fontSize="10" className="fill-muted">{x === 0 ? "" : fmt(x)}</text></g>)}
            {ys.map((y) => <g key={`y${y}`}><line y1={sy(y)} y2={sy(y)} x1={0} x2={W} className="stroke-line" strokeWidth={y === 0 ? 0 : 1} /><text y={sy(y) - 2} x={Math.min(W - 24, Math.max(2, sx(0) + 3))} fontSize="10" className="fill-muted">{y === 0 ? "" : fmt(y)}</text></g>)}
            {view.ymin <= 0 && view.ymax >= 0 ? <line x1={0} x2={W} y1={sy(0)} y2={sy(0)} stroke="currentColor" strokeWidth="1.5" /> : null}
            {view.xmin <= 0 && view.xmax >= 0 ? <line y1={0} y2={H} x1={sx(0)} x2={sx(0)} stroke="currentColor" strokeWidth="1.5" /> : null}
            {paths.map((d, i) => d ? <path key={i} d={d} fill="none" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" className={COLORS[i].cls} /> : null)}
          </svg>
          <div className="mt-3 flex flex-wrap items-center gap-2" role="group" aria-label={c.view}>
            <button onClick={() => setView((v) => zoom(v, 0.5))} aria-label={c.zin} title={c.zin} className={btn}><Plus size={20} /></button>
            <button onClick={() => setView((v) => zoom(v, 2))} aria-label={c.zout} title={c.zout} className={btn}><Minus size={20} /></button>
            <button onClick={() => setView((v) => pan(v, -0.2, 0))} aria-label={c.left} title={c.left} className={btn}><ArrowLeft size={20} /></button>
            <button onClick={() => setView((v) => pan(v, 0.2, 0))} aria-label={c.right} title={c.right} className={btn}><ArrowRight size={20} /></button>
            <button onClick={() => setView((v) => pan(v, 0, 0.2))} aria-label={c.up} title={c.up} className={btn}><ArrowUp size={20} /></button>
            <button onClick={() => setView((v) => pan(v, 0, -0.2))} aria-label={c.down} title={c.down} className={btn}><ArrowDown size={20} /></button>
            <button onClick={() => setView(DEFAULT_VIEW)} aria-label={c.reset} title={c.reset} className={btn}><RotateCcw size={20} /></button>
            <span className="ml-auto text-xs text-muted">x {fmt(view.xmin)} to {fmt(view.xmax)} · y {fmt(view.ymin)} to {fmt(view.ymax)}</span>
          </div>
        </section>
        <div>
          {exprs.map((x, i) => (
            <div key={i} className="mb-3"><label className="flex items-center gap-2 font-bold"><span className={`h-3 w-3 rounded-full ${COLORS[i].dot}`} aria-hidden />{c.fn(i + 1)}</label>
              <input value={x} onChange={(e) => setExprs((p) => p.map((v, k) => (k === i ? e.target.value : v)))} placeholder={c.ph[i]} maxLength={100} spellCheck={false} aria-invalid={compiled[i].error} className={`${inputClass} mt-1 font-mono`} />
              {compiled[i].error ? <p role="alert" className="mt-1 text-sm font-bold text-ruby">{c.bad}</p> : null}</div>
          ))}
          <div className="guide-card p-3" aria-live="polite"><h2 className="text-lg">{c.intercepts}</h2>
            {compiled.map((f, i) => { if (!f.fn) return null; const r = roots(f.fn, view.xmin, view.xmax); let y0 = NaN; try { y0 = f.fn(0); } catch { /* none */ } return (
              <div key={i} className="mt-2 text-sm"><p className="flex items-center gap-2 font-bold"><span className={`h-2.5 w-2.5 rounded-full ${COLORS[i].dot}`} />y{i + 1}</p>
                <p>{c.xi}: {r.length ? r.map(fmt).join(", ") : c.none}</p><p>{c.yi}: {Number.isFinite(y0) ? fmt(y0) : c.none}</p>
                {Number.isFinite(ev) ? <p>{c.at} {fmt(ev)}: <strong>{(() => { try { const v = f.fn!(ev); return Number.isFinite(v) ? fmt(v) : "—"; } catch { return "—"; } })()}</strong></p> : null}</div>); })}
            <label className="mt-3 block text-sm font-bold">{c.at}<input inputMode="decimal" value={evalX} onChange={(e) => setEvalX(e.target.value)} placeholder={c.atPh} className={`${inputClass} mt-1 !py-1.5`} /></label>
          </div>
        </div>
      </div>
    </Page>
  );
}
