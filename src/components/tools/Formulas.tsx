"use client";
import { useState } from "react";
import { SHEETS } from "@/data/formulas";
import { useLang } from "@/lib/i18n";
import { useCopy } from "@/lib/use-copy";
import { MathText } from "../exam/MathText";
import { inputClass, Page } from "../ui";

const copy = {
  en: { title: "Formula sheets", lead: "Algebra, geometry, trigonometry, statistics, physics and chemistry, ready to use.", all: "All", search: "Search formulas", searchPh: "quadratic, circle, ohm…", none: "No formula matches that.", note: "Check which formulas your test or teacher gives you, since many exams hand out a reference sheet." },
  es: { title: "Hojas de fórmulas", lead: "Álgebra, geometría, trigonometría, estadística, física y química, listas para usar.", all: "Todas", search: "Buscar fórmulas", searchPh: "cuadrática, círculo, ohm…", none: "Ninguna fórmula coincide.", note: "Revisa qué fórmulas te dan en tu examen o con tu maestro, porque muchos exámenes entregan una hoja de referencia." },
};
const norm = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

export function FormulasTool() {
  const c = useCopy(copy);
  const lang = useLang();
  const [sheet, setSheet] = useState("");
  const [q, setQ] = useState("");
  const nq = norm(q.trim());
  const shown = SHEETS.filter((s) => !sheet || s.id === sheet).map((s) => ({ ...s, items: s.items.filter((it) => !nq || norm(it.en).includes(nq) || norm(it.es).includes(nq) || norm(it.tex).includes(nq)) })).filter((s) => s.items.length);
  return (
    <Page wide>
      <h1 className="text-3xl sm:text-4xl">{c.title}</h1>
      <p className="mt-2 max-w-prose text-muted">{c.lead}</p>
      <label className="mt-4 block max-w-sm"><span className="block font-bold">{c.search}</span><input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder={c.searchPh} className={`${inputClass} mt-1`} /></label>
      <div className="mt-4 flex flex-wrap gap-2" role="group" aria-label={c.title}>
        {[{ id: "", en: c.all, es: c.all }, ...SHEETS].map((s) => <button key={s.id || "all"} onClick={() => setSheet(s.id)} aria-pressed={sheet === s.id} className={`rounded-full border-[1.5px] border-ink px-4 py-1.5 font-bold ${sheet === s.id ? "bg-ink text-paper" : "bg-surface hover:bg-sunken"}`}>{s[lang]}</button>)}
      </div>
      {shown.length === 0 ? <p className="mt-6 text-lg" role="status">{c.none}</p> : shown.map((s) => (
        <section key={s.id} className="mt-8" aria-labelledby={`sh-${s.id}`}>
          <h2 id={`sh-${s.id}`} className="border-b-[1.5px] border-ink pb-1 text-2xl">{s[lang]}</h2>
          <ul className="mt-3 grid gap-3 md:grid-cols-2">
            {s.items.map((it) => (
              <li key={it.en} className="guide-card p-4"><p className="font-bold">{it[lang]}</p><div className="mt-1 overflow-x-auto text-lg"><MathText text={`$${it.tex}$`} /></div>{it.note ? <p className="mt-1 text-sm text-muted">{it.note[lang]}</p> : null}</li>
            ))}
          </ul>
        </section>
      ))}
      <p className="mt-8 max-w-prose text-sm text-muted">{c.note}</p>
    </Page>
  );
}
