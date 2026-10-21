"use client";
import { useState } from "react";
import { measure, SHAPES, type ShapeId } from "@/lib/geometry";
import { niceNumber } from "@/lib/units";
import { useLang } from "@/lib/i18n";
import { useCopy } from "@/lib/use-copy";
import { inputClass, Page } from "../ui";

const copy = {
  en: { title: "Geometry shape calculator", lead: "Area, perimeter and volume, with the formula for each.", shape: "Pick a shape", sizes: "Sizes (same unit for all)", formula: "Formula", fill: "Fill in every size with a number above 0.", impossible: "Those three sides cannot make a triangle: the two shorter sides must add up to more than the longest.", flat: "Flat shapes", solid: "Solids", cubic: "cubic units", square: "square units", unit: "units" },
  es: { title: "Calculadora de figuras", lead: "Área, perímetro y volumen, con la fórmula de cada una.", shape: "Elige una figura", sizes: "Medidas (la misma unidad para todas)", formula: "Fórmula", fill: "Llena todas las medidas con un número mayor que 0.", impossible: "Esos tres lados no forman un triángulo: los dos lados más cortos deben sumar más que el más largo.", flat: "Figuras planas", solid: "Cuerpos", cubic: "unidades cúbicas", square: "unidades cuadradas", unit: "unidades" },
};

/** Simple outline of each shape, labelled with the size names used in the form. */
function Diagram({ id }: { id: ShapeId }) {
  const t = (x: number, y: number, s: string) => <text x={x} y={y} textAnchor="middle" className="fill-current" fontSize="13" fontWeight="700">{s}</text>;
  const stroke = { fill: "none", stroke: "currentColor", strokeWidth: 2.5, strokeLinejoin: "round" as const };
  const dash = { ...stroke, strokeDasharray: "5 4", strokeWidth: 1.5 };
  return (
    <svg viewBox="0 0 200 130" role="img" aria-label={id} className="mx-auto h-36 w-full max-w-xs text-ink">
      {id === "rectangle" ? <><rect x="30" y="25" width="140" height="75" {...stroke} />{t(100, 18, "l")}{t(18, 66, "w")}</> : null}
      {id === "square" ? <><rect x="55" y="20" width="90" height="90" {...stroke} />{t(100, 14, "s")}{t(43, 68, "s")}</> : null}
      {id === "triangle" ? <><path d="M30 105 L170 105 L120 25 Z" {...stroke} />{t(100, 122, "b")}{t(66, 58, "a")}{t(158, 58, "c")}</> : null}
      {id === "circle" ? <><circle cx="100" cy="65" r="48" {...stroke} /><path d="M100 65 L148 65" {...dash} />{t(124, 59, "r")}</> : null}
      {id === "trapezoid" ? <><path d="M60 30 L140 30 L175 105 L25 105 Z" {...stroke} /><path d="M60 30 L60 105" {...dash} />{t(100, 22, "a")}{t(100, 122, "b")}{t(52, 70, "h")}{t(34, 62, "c")}{t(166, 62, "e")}</> : null}
      {id === "parallelogram" ? <><path d="M55 30 L175 30 L145 105 L25 105 Z" {...stroke} /><path d="M55 30 L55 105" {...dash} />{t(100, 122, "b")}{t(46, 70, "h")}{t(168, 70, "s")}</> : null}
      {id === "box" ? <><path d="M30 50 L130 50 L130 110 L30 110 Z M30 50 L65 22 L165 22 L130 50 M165 22 L165 82 L130 110" {...stroke} />{t(80, 126, "l")}{t(158, 106, "w")}{t(20, 82, "h")}</> : null}
      {id === "cube" ? <><path d="M35 50 L115 50 L115 115 L35 115 Z M35 50 L65 22 L145 22 L115 50 M145 22 L145 87 L115 115" {...stroke} />{t(75, 128, "s")}</> : null}
      {id === "cylinder" ? <><ellipse cx="100" cy="30" rx="50" ry="14" {...stroke} /><path d="M50 30 L50 100 A50 14 0 0 0 150 100 L150 30" {...stroke} /><path d="M100 30 L150 30" {...dash} />{t(126, 24, "r")}{t(166, 70, "h")}</> : null}
      {id === "sphere" ? <><circle cx="100" cy="65" r="48" {...stroke} /><ellipse cx="100" cy="65" rx="48" ry="14" {...dash} /><path d="M100 65 L148 65" {...stroke} strokeWidth={1.5} />{t(124, 58, "r")}</> : null}
      {id === "cone" ? <><path d="M100 14 L50 100 A50 14 0 0 0 150 100 Z" {...stroke} /><path d="M100 14 L100 100 L150 100" {...dash} />{t(92, 60, "h")}{t(126, 94, "r")}</> : null}
    </svg>
  );
}

export function GeometryTool() {
  const c = useCopy(copy);
  const lang = useLang();
  const [id, setId] = useState<ShapeId>("rectangle");
  const [vals, setVals] = useState<Record<string, string>>({});
  const shape = SHAPES.find((s) => s.id === id)!;
  const nums = Object.fromEntries(shape.dims.map((d) => [d.key, parseFloat((vals[d.key] ?? "").replace(",", "."))]));
  const result = measure(id, nums);
  const filled = shape.dims.every((d) => nums[d.key] > 0);
  const unitOf = (k: string) => (k === "volume" ? c.cubic : k === "area" || k === "surface" ? c.square : c.unit);
  const group = (solid: boolean, label: string) => (
    <div className="mt-3"><p className="text-sm font-bold text-muted">{label}</p>
      <div className="mt-1 flex flex-wrap gap-2">
        {SHAPES.filter((s) => s.solid === solid).map((s) => (
          <button key={s.id} onClick={() => { setId(s.id); setVals({}); }} aria-pressed={id === s.id}
            className={`rounded-full border-[1.5px] border-ink px-4 py-1.5 font-bold ${id === s.id ? "bg-ink text-paper" : "bg-surface hover:bg-sunken"}`}>{s[lang]}</button>
        ))}
      </div></div>
  );

  return (
    <Page>
      <h1 className="text-3xl sm:text-4xl">{c.title}</h1>
      <p className="mt-2 max-w-prose text-muted">{c.lead}</p>
      <div className="mt-4" role="group" aria-label={c.shape}>{group(false, c.flat)}{group(true, c.solid)}</div>
      <div className="mt-6 grid gap-6 md:grid-cols-2">
        <div className="guide-card p-5">
          <Diagram id={id} />
          <h2 className="mt-3 text-lg">{c.sizes}</h2>
          <div className="mt-2 grid grid-cols-2 gap-3">
            {shape.dims.map((d) => (
              <label key={d.key}><span className="block text-sm font-bold"><span className="mr-1 rounded-sm border border-ink px-1 font-mono">{d.key}</span>{d[lang]}</span>
                <input inputMode="decimal" value={vals[d.key] ?? ""} onChange={(e) => setVals({ ...vals, [d.key]: e.target.value })} className={`${inputClass} mt-1`} /></label>
            ))}
          </div>
        </div>
        <div className="guide-card p-5" aria-live="polite">
          {result ? (
            <dl className="space-y-4">
              {result.map((r) => (
                <div key={r.key}><dt className="text-sm font-bold text-muted">{r[lang]}</dt>
                  <dd className="font-display text-3xl font-semibold text-teal">{niceNumber(Math.round(r.value * 1e6) / 1e6)} <span className="text-base font-normal text-muted">{unitOf(r.key)}</span></dd>
                  <dd className="text-sm text-muted">{c.formula}: <span className="font-mono">{r.formula}</span></dd></div>
              ))}
            </dl>
          ) : <p className="font-bold text-ruby">{filled && id === "triangle" ? c.impossible : c.fill}</p>}
        </div>
      </div>
    </Page>
  );
}
