"use client";
import { useMemo, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { useLocalDoc } from "@/lib/local-doc";
import { buildOutline, outlineText } from "@/lib/outline";
import { useCopy } from "@/lib/use-copy";
import { buttonClass, inputClass } from "../ui";
import { Callout, Chips, Empty, Head } from "./shared";

const copy = {
  en: {
    add: "Add", remove: "Remove", copy: "Copy to clipboard", copied: "Copied.", print: "Print", start: "Start", again: "Try again",
    mmTitle: "Mind map maker", mmLead: "Put the main idea in the center, add branches, then add details to each branch. The map draws itself.", center: "Main idea", centerPh: "The water cycle", branch: "New branch", branchPh: "Evaporation", leaf: "Add detail", leafPh: "Sun heats the ocean", mmEmpty: "Write the main idea to start your map.", mmAlt: (c: string, n: number) => `Mind map with the main idea ${c} and ${n} branches. The same content is listed below.`,
    olTitle: "Outline builder", olLead: "Type or paste your notes. Indent a line (with spaces or the Tab key) to make it a sub-point. You get a numbered outline.", olIn: "Your notes", olPh: "Causes\n  Pollution\n  Habitat loss\nEffects\n  Rising heat", olOut: "Your outline", olNone: "Your outline will show here.", olExample: "Use an example",
    plTitle: "Memory palace trainer", plLead: "Walk a route you know well, like your home. Picture each item you must remember in its own spot along the route. Later, walk the route in your mind to recall them in order.", plPlaces: "Places on your route (one per line, in walking order)", plPlacesPh: "Front door\nCouch\nKitchen table\nFridge\nBed", plItems: "Things to remember (one per line, same order)", plItemsPh: "Mercury\nVenus\nEarth\nMars\nJupiter", plStep1: "1. Picture it", plStep1b: "Imagine each item in its place. Make the picture big, silly and full of action. The stranger it is, the better you remember it.", plStep2: "2. Recall it", plNeedBoth: "Add at least 2 places and 2 items.", plMore: (p: number, i: number) => `You have ${p} places and ${i} items. Only the first ${Math.min(p, i)} pairs are used.`, plTest: "Test myself", plWhat: (p: string) => `What is at: ${p}?`, plCheck: "Check", plRight: "Correct.", plWrong: (a: string) => `Not quite. It was: ${a}`, plNext: "Next place", plDone: (a: number, b: number) => `You recalled ${a} of ${b}. Walk the route again and picture the ones you missed.`, plAnswer: "Your answer",
    lrTitle: "Lab report template", lrLead: "Fill in each part of your report. Copy it into your document or print it.", lrParts: { question: "Question (what are you trying to find out?)", hypothesis: "Hypothesis (If… then… because…)", materials: "Materials", procedure: "Procedure (numbered steps)", data: "Data and observations", analysis: "Analysis (what do the data show?)", conclusion: "Conclusion (was your hypothesis supported? why?)" },
    dgTitle: "Data table and graph maker", dgLead: "Enter your labels and numbers. You get a bar or line graph you can print or copy into your report.", dgT: "Graph title", dgX: "Label for the items (x-axis)", dgY: "Label for the numbers (y-axis)", dgType: "Graph type", bar: "Bar", line: "Line", dgRow: "Label", dgVal: "Value", dgNeed: "Add at least 2 rows with numbers.", dgBad: "Values must be numbers.", dgAlt: (t: string, n: number) => `${t || "Graph"} with ${n} points. The same data is in the table.`, dgTable: "Data table", dgMax: "Highest", dgMin: "Lowest", dgAvg: "Average",
  },
  es: {
    add: "Agregar", remove: "Quitar", copy: "Copiar", copied: "Copiado.", print: "Imprimir", start: "Empezar", again: "Intentar otra vez",
    mmTitle: "Mapas mentales", mmLead: "Pon la idea principal en el centro, agrega ramas y luego detalles a cada rama. El mapa se dibuja solo.", center: "Idea principal", centerPh: "El ciclo del agua", branch: "Rama nueva", branchPh: "Evaporación", leaf: "Agregar detalle", leafPh: "El sol calienta el océano", mmEmpty: "Escribe la idea principal para empezar tu mapa.", mmAlt: (c: string, n: number) => `Mapa mental con la idea principal ${c} y ${n} ramas. El mismo contenido está en la lista de abajo.`,
    olTitle: "Armar un esquema", olLead: "Escribe o pega tus apuntes. Sangra una línea (con espacios o la tecla Tab) para hacerla un subpunto. Recibes un esquema numerado.", olIn: "Tus apuntes", olPh: "Causas\n  Contaminación\n  Pérdida de hábitat\nEfectos\n  Más calor", olOut: "Tu esquema", olNone: "Tu esquema aparecerá aquí.", olExample: "Usar un ejemplo",
    plTitle: "Palacio de la memoria", plLead: "Recorre una ruta que conozcas bien, como tu casa. Imagina cada cosa que debes recordar en su propio lugar de la ruta. Después, recorre la ruta en tu mente para recordarlas en orden.", plPlaces: "Lugares de tu ruta (uno por línea, en orden)", plPlacesPh: "Puerta de entrada\nSofá\nMesa de la cocina\nRefrigerador\nCama", plItems: "Cosas por recordar (una por línea, en el mismo orden)", plItemsPh: "Mercurio\nVenus\nTierra\nMarte\nJúpiter", plStep1: "1. Imagínalo", plStep1b: "Imagina cada cosa en su lugar. Haz la imagen grande, chistosa y llena de acción. Mientras más rara, mejor la recuerdas.", plStep2: "2. Recuérdalo", plNeedBoth: "Agrega al menos 2 lugares y 2 cosas.", plMore: (p: number, i: number) => `Tienes ${p} lugares y ${i} cosas. Solo se usan los primeros ${Math.min(p, i)} pares.`, plTest: "Ponerme a prueba", plWhat: (p: string) => `¿Qué hay en: ${p}?`, plCheck: "Revisar", plRight: "Correcto.", plWrong: (a: string) => `No exactamente. Era: ${a}`, plNext: "Siguiente lugar", plDone: (a: number, b: number) => `Recordaste ${a} de ${b}. Recorre la ruta otra vez e imagina las que fallaste.`, plAnswer: "Tu respuesta",
    lrTitle: "Plantilla de reporte de laboratorio", lrLead: "Llena cada parte de tu reporte. Cópialo a tu documento o imprímelo.", lrParts: { question: "Pregunta (¿qué quieres averiguar?)", hypothesis: "Hipótesis (Si… entonces… porque…)", materials: "Materiales", procedure: "Procedimiento (pasos numerados)", data: "Datos y observaciones", analysis: "Análisis (¿qué muestran los datos?)", conclusion: "Conclusión (¿se apoyó tu hipótesis? ¿por qué?)" },
    dgTitle: "Tablas y gráficas de datos", dgLead: "Escribe tus etiquetas y números. Recibes una gráfica de barras o de líneas que puedes imprimir o copiar a tu reporte.", dgT: "Título de la gráfica", dgX: "Etiqueta de los elementos (eje x)", dgY: "Etiqueta de los números (eje y)", dgType: "Tipo de gráfica", bar: "Barras", line: "Líneas", dgRow: "Etiqueta", dgVal: "Valor", dgNeed: "Agrega al menos 2 filas con números.", dgBad: "Los valores deben ser números.", dgAlt: (t: string, n: number) => `${t || "Gráfica"} con ${n} puntos. Los mismos datos están en la tabla.`, dgTable: "Tabla de datos", dgMax: "Más alto", dgMin: "Más bajo", dgAvg: "Promedio",
  },
};

const clip = async (text: string) => { try { await navigator.clipboard.writeText(text); return true; } catch { return false; } };
const rm = (label: string, text: string, fn: () => void) => <button onClick={fn} aria-label={`${text}: ${label}`} className="grid h-10 w-10 shrink-0 place-items-center rounded-xl hover:bg-sunken"><Trash2 size={18} strokeWidth={1.75} /></button>;
const area = "min-h-32 w-full rounded-xl border-[1.5px] border-ink bg-surface p-3 text-lg placeholder:text-muted";
const clamp = (s: string, n: number) => (s.length > n ? s.slice(0, n - 1) + "…" : s);

type Map = { center: string; branches: { id: string; text: string; leaves: { id: string; text: string }[] }[] };
const NO_MAP: Map = { center: "", branches: [] };
export function MindMapTool() {
  const c = useCopy(copy);
  const [m, setM] = useLocalDoc<Map>("mindmap", NO_MAP);
  const [b, setB] = useState("");
  const [leafs, setLeafs] = useState<Record<string, string>>({});
  const W = 760, H = 560, cx = W / 2, cy = H / 2;
  const n = m.branches.length;
  return (
    <Head title={c.mmTitle} lead={c.mmLead} wide>
      <label className="mt-5 block max-w-xl"><span className="block font-bold">{c.center}</span><input value={m.center} onChange={(e) => setM({ ...m, center: e.target.value })} placeholder={c.centerPh} maxLength={50} className={`${inputClass} mt-1`} /></label>
      <form className="mt-3 flex max-w-xl flex-wrap items-end gap-3" onSubmit={(e) => { e.preventDefault(); if (b.trim() && n < 8) { setM({ ...m, branches: [...m.branches, { id: crypto.randomUUID(), text: b.trim(), leaves: [] }] }); setB(""); } }}>
        <label className="min-w-0 flex-1"><span className="block font-bold">{c.branch}</span><input value={b} onChange={(e) => setB(e.target.value)} placeholder={c.branchPh} maxLength={40} className={`${inputClass} mt-1`} /></label><button className={buttonClass.primary}><Plus size={18} />{c.add}</button></form>
      {!m.center.trim() ? <Empty>{c.mmEmpty}</Empty> : (
        <div className="mt-5 grid gap-6 lg:grid-cols-[3fr_2fr]">
          <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={c.mmAlt(m.center, n)} className="w-full rounded-lg border-[1.5px] border-ink bg-surface">
            {m.branches.map((br, i) => {
              const ang = (i / Math.max(n, 1)) * Math.PI * 2 - Math.PI / 2, bx = cx + Math.cos(ang) * 150, by = cy + Math.sin(ang) * 130;
              return <g key={br.id}><line x1={cx} y1={cy} x2={bx} y2={by} stroke="currentColor" strokeWidth={2} />
                {br.leaves.map((lf, j) => { const spread = 0.55, la = ang + (br.leaves.length > 1 ? (j / (br.leaves.length - 1) - 0.5) * spread * 2 : 0), lx = cx + Math.cos(la) * 280, ly = cy + Math.sin(la) * 235; return <g key={lf.id}><line x1={bx} y1={by} x2={lx} y2={ly} stroke="currentColor" strokeWidth={1} strokeDasharray="3 3" /><text x={lx} y={ly} textAnchor="middle" fontSize={13} fill="currentColor" className="font-sans" dy="4" style={{ paintOrder: "stroke", stroke: "var(--c-surface, #fff)", strokeWidth: 4 }}>{clamp(lf.text, 22)}</text></g>; })}
                <ellipse cx={bx} cy={by} rx={64} ry={24} fill="var(--c-marigold, #f5b942)" stroke="currentColor" strokeWidth={1.5} /><text x={bx} y={by} textAnchor="middle" fontSize={14} fontWeight={700} dy="5" fill="var(--c-on-marigold, #000)">{clamp(br.text, 16)}</text></g>;
            })}
            <ellipse cx={cx} cy={cy} rx={78} ry={34} fill="var(--c-teal, #0f766e)" stroke="currentColor" strokeWidth={2} /><text x={cx} y={cy} textAnchor="middle" fontSize={16} fontWeight={700} dy="5" fill="var(--c-on-teal, #fff)">{clamp(m.center, 18)}</text>
          </svg>
          <ul className="space-y-3">{m.branches.map((br) => (
            <li key={br.id} className="guide-card p-3"><div className="flex items-center gap-2"><h2 className="min-w-0 flex-1 text-lg">{br.text}</h2>{rm(br.text, c.remove, () => setM({ ...m, branches: m.branches.filter((x) => x.id !== br.id) }))}</div>
              <ul className="mt-1 list-disc pl-5">{br.leaves.map((lf) => <li key={lf.id} className="py-0.5">{lf.text} <button onClick={() => setM({ ...m, branches: m.branches.map((x) => (x.id === br.id ? { ...x, leaves: x.leaves.filter((y) => y.id !== lf.id) } : x)) })} aria-label={`${c.remove}: ${lf.text}`} className="ml-1 text-muted underline">×</button></li>)}</ul>
              {br.leaves.length < 4 ? <form className="mt-2 flex gap-2" onSubmit={(e) => { e.preventDefault(); const t = (leafs[br.id] ?? "").trim(); if (t) { setM({ ...m, branches: m.branches.map((x) => (x.id === br.id ? { ...x, leaves: [...x.leaves, { id: crypto.randomUUID(), text: t }] } : x)) }); setLeafs({ ...leafs, [br.id]: "" }); } }}>
                <label className="min-w-0 flex-1"><span className="sr-only">{c.leaf}: {br.text}</span><input value={leafs[br.id] ?? ""} onChange={(e) => setLeafs({ ...leafs, [br.id]: e.target.value })} placeholder={c.leafPh} maxLength={40} className={`${inputClass} !py-1.5`} /></label><button className={buttonClass.secondary} aria-label={`${c.leaf}: ${br.text}`}>{c.add}</button></form> : null}</li>))}</ul>
        </div>
      )}
      <button onClick={() => window.print()} className={`${buttonClass.secondary} mt-5`}>{c.print}</button>
    </Head>
  );
}

const EXAMPLE_OUTLINE = "Causes of the Dust Bowl\n  Drought\n  Plowing of the grasslands\nEffects\n  Dust storms\n  Families moved west\nLessons\n  Soil conservation";
export function OutlineTool() {
  const c = useCopy(copy);
  const [raw, setRaw] = useLocalDoc<string>("outline-notes", "");
  const [note, setNote] = useState("");
  const lines = useMemo(() => buildOutline(raw), [raw]);
  return (
    <Head title={c.olTitle} lead={c.olLead} wide>
      <div className="mt-5 grid gap-5 md:grid-cols-2">
        <div><label><span className="block font-bold">{c.olIn}</span><textarea value={raw} onChange={(e) => setRaw(e.target.value.slice(0, 20000))} placeholder={c.olPh} spellCheck className={`${area} mt-1 min-h-72 font-mono text-base`} /></label><button onClick={() => setRaw(EXAMPLE_OUTLINE)} className={`${buttonClass.secondary} mt-2`}>{c.olExample}</button></div>
        <section aria-live="polite"><h2 className="font-bold">{c.olOut}</h2>{lines.length === 0 ? <p className="mt-2 text-muted">{c.olNone}</p> : <ol className="mt-2 guide-card p-4">{lines.map((l, i) => <li key={i} className="list-none py-0.5" style={{ paddingLeft: `${l.level * 1.5}rem` }}><span className="font-bold">{l.label}</span> {l.text}</li>)}</ol>}
          {lines.length ? <div className="mt-3 flex flex-wrap items-center gap-3"><button onClick={async () => setNote((await clip(outlineText(lines))) ? c.copied : "")} className={buttonClass.primary}>{c.copy}</button><button onClick={() => window.print()} className={buttonClass.secondary}>{c.print}</button><span className="font-bold text-teal" role="status">{note}</span></div> : null}</section></div>
    </Head>
  );
}

type Palace = { places: string; items: string };
const NO_PALACE: Palace = { places: "", items: "" };
const norm = (s: string) => s.trim().toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
export function PalaceTool() {
  const c = useCopy(copy);
  const [p, setP] = useLocalDoc<Palace>("memory-palace", NO_PALACE);
  const places = p.places.split("\n").map((x) => x.trim()).filter(Boolean), items = p.items.split("\n").map((x) => x.trim()).filter(Boolean);
  const n = Math.min(places.length, items.length);
  const [phase, setPhase] = useState<"build" | "test">("build");
  const [i, setI] = useState(0);
  const [ans, setAns] = useState("");
  const [res, setRes] = useState<boolean | null>(null);
  const [score, setScore] = useState(0);
  const begin = () => { setI(0); setAns(""); setRes(null); setScore(0); setPhase("test"); };
  const check = (e: React.FormEvent) => { e.preventDefault(); if (res !== null) return; const ok = norm(ans) === norm(items[i]); setRes(ok); if (ok) setScore((s) => s + 1); };
  return (
    <Head title={c.plTitle} lead={c.plLead}>
      {phase === "build" ? (
        <>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <label><span className="block font-bold">{c.plPlaces}</span><textarea value={p.places} onChange={(e) => setP({ ...p, places: e.target.value.slice(0, 2000) })} placeholder={c.plPlacesPh} className={`${area} mt-1`} /></label>
            <label><span className="block font-bold">{c.plItems}</span><textarea value={p.items} onChange={(e) => setP({ ...p, items: e.target.value.slice(0, 2000) })} placeholder={c.plItemsPh} className={`${area} mt-1`} /></label></div>
          {n < 2 ? <p className="mt-3 text-muted">{c.plNeedBoth}</p> : (
            <>
              {places.length !== items.length ? <p className="mt-3 text-muted">{c.plMore(places.length, items.length)}</p> : null}
              <section className="guide-card mt-5 p-5"><h2 className="text-2xl">{c.plStep1}</h2><p className="text-muted">{c.plStep1b}</p><ol className="mt-3 space-y-1.5">{Array.from({ length: n }, (_, k) => <li key={k} className="text-lg"><span className="font-bold">{places[k]}</span> → {items[k]}</li>)}</ol></section>
              <button onClick={begin} className={`${buttonClass.primary} mt-5`}>{c.plTest}</button>
            </>
          )}
        </>
      ) : i >= n ? (
        <section className="guide-card mt-5 p-6" aria-live="polite"><p className="font-display text-2xl font-semibold">{c.plDone(score, n)}</p><div className="mt-4 flex gap-3"><button onClick={begin} className={buttonClass.primary}>{c.again}</button><button onClick={() => setPhase("build")} className={buttonClass.secondary}>{c.plStep1.slice(3)}</button></div></section>
      ) : (
        <form onSubmit={check} className="guide-card mt-5 p-6"><h2 className="font-display text-2xl font-semibold">{c.plWhat(places[i])}</h2>
          <label className="mt-3 block"><span className="sr-only">{c.plAnswer}</span><input value={ans} onChange={(e) => setAns(e.target.value)} disabled={res !== null} autoFocus className={`${inputClass} max-w-md`} /></label>
          {res === null ? <button className={`${buttonClass.primary} mt-3`}>{c.plCheck}</button> : <><p className={`mt-3 text-lg font-bold ${res ? "text-teal" : "text-ruby"}`} role="status">{res ? c.plRight : c.plWrong(items[i])}</p><button type="button" onClick={() => { setI(i + 1); setAns(""); setRes(null); }} className={`${buttonClass.primary} mt-3`}>{c.plNext}</button></>}</form>
      )}
    </Head>
  );
}

const LAB_KEYS = ["question", "hypothesis", "materials", "procedure", "data", "analysis", "conclusion"] as const;
const NO_LAB: Record<string, string> = {};
export function LabReportTool() {
  const c = useCopy(copy);
  const [r, setR] = useLocalDoc<Record<string, string>>("lab-report", NO_LAB);
  const [title, setTitle] = useLocalDoc<string>("lab-title", "");
  const [note, setNote] = useState("");
  const text = [title, ...LAB_KEYS.map((k) => `${c.lrParts[k].split(" (")[0].toUpperCase()}\n${r[k] ?? ""}`)].join("\n\n");
  return (
    <Head title={c.lrTitle} lead={c.lrLead}>
      <label className="mt-5 block"><span className="block font-bold">{c.dgT}</span><input value={title} onChange={(e) => setTitle(e.target.value)} maxLength={100} className={`${inputClass} mt-1`} /></label>
      {LAB_KEYS.map((k) => <label key={k} className="mt-4 block"><span className="block font-bold">{c.lrParts[k]}</span><textarea value={r[k] ?? ""} onChange={(e) => setR({ ...r, [k]: e.target.value.slice(0, 5000) })} rows={4} className={`${area} mt-1`} /></label>)}
      <div className="mt-5 flex flex-wrap items-center gap-3"><button onClick={async () => setNote((await clip(text)) ? c.copied : "")} className={buttonClass.primary}>{c.copy}</button><button onClick={() => window.print()} className={buttonClass.secondary}>{c.print}</button><span className="font-bold text-teal" role="status">{note}</span></div>
    </Head>
  );
}

type DG = { title: string; x: string; y: string; type: "bar" | "line"; rows: { id: string; label: string; value: string }[] };
const NO_DG: DG = { title: "", x: "", y: "", type: "bar", rows: [{ id: "r1", label: "", value: "" }, { id: "r2", label: "", value: "" }, { id: "r3", label: "", value: "" }] };
export function DataGraphTool() {
  const c = useCopy(copy);
  const [d, setD] = useLocalDoc<DG>("datagraph", NO_DG);
  const pts = d.rows.filter((r) => r.label.trim() && r.value.trim() !== "").map((r) => ({ label: r.label.trim(), v: Number(r.value) }));
  const bad = pts.some((p) => !Number.isFinite(p.v));
  const ok = pts.length >= 2 && !bad;
  const vals = pts.map((p) => p.v);
  const max = Math.max(0, ...vals), min = Math.min(0, ...vals), span = max - min || 1;
  const W = 640, H = 380, L = 70, R = 20, T = 40, B = 80;
  const px = (i: number) => L + ((i + 0.5) / pts.length) * (W - L - R);
  const py = (v: number) => T + (1 - (v - min) / span) * (H - T - B);
  const ticks = Array.from({ length: 5 }, (_, i) => min + (span * i) / 4);
  const fmt = (n: number) => String(Math.round(n * 100) / 100);
  const setRow = (id: string, patch: Partial<DG["rows"][0]>) => setD({ ...d, rows: d.rows.map((r) => (r.id === id ? { ...r, ...patch } : r)) });
  return (
    <Head title={c.dgTitle} lead={c.dgLead} wide>
      <div className="mt-5 grid gap-4 md:grid-cols-3">
        <label><span className="block font-bold">{c.dgT}</span><input value={d.title} onChange={(e) => setD({ ...d, title: e.target.value })} maxLength={80} className={`${inputClass} mt-1`} /></label>
        <label><span className="block font-bold">{c.dgX}</span><input value={d.x} onChange={(e) => setD({ ...d, x: e.target.value })} maxLength={40} className={`${inputClass} mt-1`} /></label>
        <label><span className="block font-bold">{c.dgY}</span><input value={d.y} onChange={(e) => setD({ ...d, y: e.target.value })} maxLength={40} className={`${inputClass} mt-1`} /></label></div>
      <div className="mt-4"><Chips<"bar" | "line"> value={d.type} onChange={(type) => setD({ ...d, type })} label={c.dgType} options={[{ id: "bar", label: c.bar }, { id: "line", label: c.line }]} /></div>
      <div className="mt-5 grid gap-6 lg:grid-cols-[2fr_3fr]">
        <section><h2 className="text-xl">{c.dgTable}</h2><ul className="mt-2 space-y-2">{d.rows.map((r, i) => <li key={r.id} className="flex items-end gap-2">
          <label className="min-w-0 flex-1"><span className="sr-only">{c.dgRow} {i + 1}</span><input value={r.label} placeholder={c.dgRow} onChange={(e) => setRow(r.id, { label: e.target.value })} maxLength={30} className={`${inputClass} !py-1.5`} /></label>
          <label className="w-28"><span className="sr-only">{c.dgVal} {i + 1}</span><input value={r.value} inputMode="decimal" placeholder={c.dgVal} onChange={(e) => setRow(r.id, { value: e.target.value })} className={`${inputClass} !py-1.5`} /></label>
          {d.rows.length > 2 ? rm(`${i + 1}`, c.remove, () => setD({ ...d, rows: d.rows.filter((x) => x.id !== r.id) })) : null}</li>)}</ul>
          {d.rows.length < 20 ? <button onClick={() => setD({ ...d, rows: [...d.rows, { id: crypto.randomUUID(), label: "", value: "" }] })} className={`${buttonClass.secondary} mt-3`}><Plus size={18} />{c.add}</button> : null}
          {bad ? <p role="alert" className="mt-2 font-bold text-ruby">{c.dgBad}</p> : null}
          {ok ? <dl className="mt-4 grid grid-cols-3 gap-2 text-center">{[[c.dgMax, Math.max(...vals)], [c.dgMin, Math.min(...vals)], [c.dgAvg, vals.reduce((a, b) => a + b, 0) / vals.length]].map(([k, v]) => <div key={String(k)} className="guide-card p-2"><dt className="text-xs text-muted">{k}</dt><dd className="font-bold tabular-nums">{fmt(Number(v))}</dd></div>)}</dl> : null}</section>
        <section>{!ok ? <Empty>{c.dgNeed}</Empty> : (
          <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={c.dgAlt(d.title, pts.length)} className="w-full rounded-lg border-[1.5px] border-ink bg-surface text-ink">
            <text x={W / 2} y={22} textAnchor="middle" fontSize={17} fontWeight={700} fill="currentColor">{d.title}</text>
            {ticks.map((t, i) => <g key={i}><line x1={L} x2={W - R} y1={py(t)} y2={py(t)} stroke="currentColor" strokeOpacity={0.2} /><text x={L - 8} y={py(t)} textAnchor="end" fontSize={12} dy="4" fill="currentColor">{fmt(t)}</text></g>)}
            <line x1={L} x2={L} y1={T} y2={H - B} stroke="currentColor" /><line x1={L} x2={W - R} y1={py(0)} y2={py(0)} stroke="currentColor" />
            {d.type === "bar" ? pts.map((p, i) => { const bw = ((W - L - R) / pts.length) * 0.6; return <rect key={i} x={px(i) - bw / 2} width={bw} y={Math.min(py(p.v), py(0))} height={Math.abs(py(p.v) - py(0))} fill="var(--c-teal, #0f766e)" stroke="currentColor" />; })
              : <><polyline fill="none" stroke="var(--c-teal, #0f766e)" strokeWidth={3} points={pts.map((p, i) => `${px(i)},${py(p.v)}`).join(" ")} />{pts.map((p, i) => <circle key={i} cx={px(i)} cy={py(p.v)} r={5} fill="var(--c-marigold, #f5b942)" stroke="currentColor" />)}</>}
            {pts.map((p, i) => <text key={i} x={px(i)} y={H - B + 18} textAnchor="middle" fontSize={12} fill="currentColor">{clamp(p.label, 10)}</text>)}
            <text x={(L + W - R) / 2} y={H - 18} textAnchor="middle" fontSize={13} fill="currentColor">{d.x}</text>
            <text transform={`rotate(-90 16 ${(T + H - B) / 2})`} x={16} y={(T + H - B) / 2} textAnchor="middle" fontSize={13} fill="currentColor">{d.y}</text>
          </svg>)}
          {ok ? <button onClick={() => window.print()} className={`${buttonClass.secondary} mt-3`}>{c.print}</button> : null}</section></div>
      <Callout>{c.dgAlt(d.title, pts.length)}</Callout>
    </Head>
  );
}
