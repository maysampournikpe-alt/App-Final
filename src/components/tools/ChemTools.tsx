"use client";
import { useMemo, useState } from "react";
import { BY_SYMBOL, ELEMENTS, FormulaError, balance, groupOf, molarMass, periodOf, position, stateOf, type Category } from "@/lib/chem";
import { useLang } from "@/lib/i18n";
import { useCopy } from "@/lib/use-copy";
import { inputClass, Page } from "../ui";

const copy = {
  en: {
    ptTitle: "Periodic table", ptLead: "Tap any element to see its details.", search: "Find an element", searchPh: "Name, symbol or number", noMatch: "No element matches that.",
    cats: { nonmetal: "Nonmetal", noble: "Noble gas", alkali: "Alkali metal", alkaline: "Alkaline earth metal", metalloid: "Metalloid", halogen: "Halogen", post: "Post-transition metal", transition: "Transition metal", lanthanide: "Lanthanide", actinide: "Actinide" } as Record<Category, string>,
    number: "Atomic number", mass: "Atomic mass", group: "Group", period: "Period", state: "At room temperature", states: { solid: "Solid", liquid: "Liquid", gas: "Gas", unknown: "Not known" } as Record<string, string>, category: "Type",
    massNote: "Masses are standard values. For elements with no stable form, the mass number of the longest-lived type is shown.", pick: "Pick an element.", fblock: "Lanthanides and actinides",
    mmTitle: "Molar mass calculator", mmLead: "Type a formula to get its mass and what percent each element makes up.", formula: "Chemical formula", mmPh: "Ca(OH)2", examples: "Try:", total: "Molar mass", per: "g/mol", element: "Element", count: "Atoms", massCol: "Mass (g/mol)", percent: "Percent",
    conv: "Grams and moles", grams: "Grams", moles: "Moles", mmNote: "Use capital letters correctly: Co is cobalt, CO is carbon monoxide. Brackets and hydrates like CuSO4·5H2O work.",
    errs: { empty: "Type a formula.", brackets: "Check your brackets: every one needs a match.", unknown: (s: string) => `“${s}” is not an element symbol. Remember capital then small letter, like Na.`, char: (s: string) => `The character “${s}” is not allowed in a formula.` },
    balTitle: "Equation balancer", balLead: "Type an unbalanced equation. Use + between things and an arrow (->) in the middle.", equation: "Equation", balPh: "H2 + O2 -> H2O", balanced: "Balanced equation",
    balErrs: { format: "Write it like H2 + O2 -> H2O, with one arrow in the middle.", formula: "One of the formulas is not valid. Check capital letters and numbers.", impossible: "This cannot be balanced as written. Check that the same elements are on both sides.", many: "There is more than one way to balance this, so it is probably missing something." } as Record<string, string>,
    balNote: "Ions and charges are not supported yet.",
  },
  es: {
    ptTitle: "Tabla periódica", ptLead: "Toca cualquier elemento para ver sus detalles.", search: "Buscar un elemento", searchPh: "Nombre, símbolo o número", noMatch: "Ningún elemento coincide.",
    cats: { nonmetal: "No metal", noble: "Gas noble", alkali: "Metal alcalino", alkaline: "Metal alcalinotérreo", metalloid: "Metaloide", halogen: "Halógeno", post: "Metal postransicional", transition: "Metal de transición", lanthanide: "Lantánido", actinide: "Actínido" } as Record<Category, string>,
    number: "Número atómico", mass: "Masa atómica", group: "Grupo", period: "Periodo", state: "A temperatura ambiente", states: { solid: "Sólido", liquid: "Líquido", gas: "Gas", unknown: "No se sabe" } as Record<string, string>, category: "Tipo",
    massNote: "Las masas son valores estándar. En los elementos sin forma estable, se muestra el número de masa del tipo de vida más larga.", pick: "Elige un elemento.", fblock: "Lantánidos y actínidos",
    mmTitle: "Calculadora de masa molar", mmLead: "Escribe una fórmula para ver su masa y qué porcentaje es cada elemento.", formula: "Fórmula química", mmPh: "Ca(OH)2", examples: "Prueba:", total: "Masa molar", per: "g/mol", element: "Elemento", count: "Átomos", massCol: "Masa (g/mol)", percent: "Porcentaje",
    conv: "Gramos y moles", grams: "Gramos", moles: "Moles", mmNote: "Usa bien las mayúsculas: Co es cobalto, CO es monóxido de carbono. Funcionan los paréntesis y los hidratos como CuSO4·5H2O.",
    errs: { empty: "Escribe una fórmula.", brackets: "Revisa los paréntesis: cada uno necesita su pareja.", unknown: (s: string) => `“${s}” no es un símbolo de elemento. Recuerda mayúscula y luego minúscula, como Na.`, char: (s: string) => `El carácter “${s}” no se permite en una fórmula.` },
    balTitle: "Balanceo de ecuaciones", balLead: "Escribe una ecuación sin balancear. Usa + entre las sustancias y una flecha (->) en medio.", equation: "Ecuación", balPh: "H2 + O2 -> H2O", balanced: "Ecuación balanceada",
    balErrs: { format: "Escríbela como H2 + O2 -> H2O, con una flecha en medio.", formula: "Una de las fórmulas no es válida. Revisa las mayúsculas y los números.", impossible: "No se puede balancear así. Revisa que los mismos elementos estén en los dos lados.", many: "Hay más de una forma de balancearla, así que probablemente falta algo." } as Record<string, string>,
    balNote: "Todavía no se aceptan iones ni cargas.",
  },
};

const TINT: Record<Category, string> = {
  nonmetal: "bg-teal/25", noble: "bg-marigold/40", alkali: "bg-ruby/25", alkaline: "bg-terracotta/30", metalloid: "bg-sunken", halogen: "bg-teal/45", post: "bg-surface", transition: "bg-paper", lanthanide: "bg-marigold/20", actinide: "bg-ruby/15",
};

/** H2O -> H₂O with real subscripts, for readable equations. */
export function Chem({ formula }: { formula: string }) {
  return <>{formula.split(/(\d+)/).map((p, i) => (i % 2 ? <sub key={i}>{p}</sub> : p))}</>;
}

export function PeriodicTool() {
  const c = useCopy(copy);
  const lang = useLang();
  const [sel, setSel] = useState(26);
  const [q, setQ] = useState("");
  const e = ELEMENTS[sel - 1];
  const norm = q.trim().toLowerCase();
  const hits = useMemo(() => (norm ? new Set(ELEMENTS.filter((x) => x.name.toLowerCase().includes(norm) || x.sym.toLowerCase() === norm || String(x.z) === norm).map((x) => x.z)) : null), [norm]);
  const g = groupOf(e.z);
  return (
    <Page wide>
      <h1 className="text-3xl sm:text-4xl">{c.ptTitle}</h1>
      <p className="mt-2 max-w-prose text-muted">{c.ptLead}</p>
      <label className="mt-4 block max-w-sm"><span className="block font-bold">{c.search}</span><input value={q} onChange={(ev) => { setQ(ev.target.value); const m = ELEMENTS.find((x) => x.name.toLowerCase().startsWith(ev.target.value.trim().toLowerCase()) || x.sym.toLowerCase() === ev.target.value.trim().toLowerCase() || String(x.z) === ev.target.value.trim()); if (m && ev.target.value.trim()) setSel(m.z); }} placeholder={c.searchPh} className={`${inputClass} mt-1`} /></label>
      {hits && hits.size === 0 ? <p className="mt-2 font-bold text-ruby" role="status">{c.noMatch}</p> : null}
      <div className="mt-5 overflow-x-auto pb-2">
        <div className="grid min-w-[44rem] gap-[3px]" style={{ gridTemplateColumns: "repeat(18, minmax(0, 1fr))", gridTemplateRows: "repeat(7, auto) 0.6rem repeat(2, auto)" }} role="group" aria-label={c.ptTitle}>
          {ELEMENTS.map((x) => {
            const p = position(x.z);
            const dim = hits && !hits.has(x.z);
            return (
              <button key={x.z} onClick={() => setSel(x.z)} aria-pressed={sel === x.z} aria-label={`${x.z} ${x.sym} ${x.name}, ${c.cats[x.cat]}`}
                className={`flex flex-col items-center rounded-[4px] border border-ink px-0 py-1 leading-none ${TINT[x.cat]} ${sel === x.z ? "ring-2 ring-ink ring-offset-1 ring-offset-paper" : ""} ${dim ? "opacity-25" : ""}`}
                style={{ gridColumn: p.col, gridRow: p.row >= 8 ? p.row + 1 : p.row }}>
                <span className="text-[0.55rem]">{x.z}</span>{" "}<span className="text-sm font-bold sm:text-base">{x.sym}</span>
              </button>
            );
          })}
        </div>
      </div>
      <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs">{(Object.keys(c.cats) as Category[]).map((k) => <li key={k} className="inline-flex items-center gap-1"><span className={`h-3 w-3 rounded-sm border border-ink ${TINT[k]}`} />{c.cats[k]}</li>)}</ul>
      <section className="guide-card mt-5 grid gap-4 p-5 sm:grid-cols-[auto_1fr]" aria-live="polite" aria-label={e.name}>
        <div className={`grid h-28 w-28 place-items-center rounded-md border-[1.5px] border-ink ${TINT[e.cat]}`}><div className="text-center"><p className="text-sm">{e.z}</p><p className="font-display text-5xl font-semibold leading-none">{e.sym}</p></div></div>
        <div><h2 className="text-3xl">{e.name}</h2>
          <dl className="mt-2 grid grid-cols-2 gap-x-6 gap-y-1 sm:grid-cols-3">
            {([[c.number, e.z], [c.mass, e.mass], [c.category, c.cats[e.cat]], [c.group, g ?? "—"], [c.period, periodOf(e.z)], [c.state, c.states[stateOf(e.z)]]] as const).map(([k, v]) => <div key={k}><dt className="text-sm font-bold text-muted">{k}</dt><dd className="font-bold">{v}</dd></div>)}
          </dl></div>
      </section>
      <p className="mt-3 max-w-prose text-sm text-muted">{c.massNote} <span className="sr-only">{lang}</span></p>
    </Page>
  );
}

function errText(c: typeof copy.en, e: unknown): string {
  const m = e instanceof FormulaError ? e.message : "";
  if (m.startsWith("unknown:")) return c.errs.unknown(m.slice(8));
  if (m.startsWith("char:")) return c.errs.char(m.slice(5));
  return m === "brackets" ? c.errs.brackets : c.errs.empty;
}

export function MolarTool() {
  const c = useCopy(copy);
  const [formula, setFormula] = useState("Ca(OH)2");
  const [grams, setGrams] = useState("");
  const [moles, setMoles] = useState("");
  let result: ReturnType<typeof molarMass> | null = null, error = "";
  try { result = molarMass(formula); } catch (e) { error = errText(c, e); }
  const mm = result?.total ?? 0;
  const g = parseFloat(grams.replace(",", ".")), n = parseFloat(moles.replace(",", "."));
  const r = (x: number) => String(Math.round(x * 10000) / 10000);
  return (
    <Page>
      <h1 className="text-3xl sm:text-4xl">{c.mmTitle}</h1>
      <p className="mt-2 max-w-prose text-muted">{c.mmLead}</p>
      <div className="guide-card mt-6 p-5">
        <label className="block"><span className="block font-bold">{c.formula}</span><input value={formula} onChange={(e) => setFormula(e.target.value)} placeholder={c.mmPh} maxLength={60} aria-invalid={!!error} className={`${inputClass} mt-1 font-mono`} /></label>
        <p className="mt-2 text-sm text-muted">{c.examples} {["H2O", "NaCl", "C6H12O6", "Ca(OH)2", "CuSO4·5H2O"].map((x) => <button key={x} onClick={() => setFormula(x)} className="mr-3 font-bold text-teal underline underline-offset-4"><Chem formula={x} /></button>)}</p>
      </div>
      <section className="guide-card mt-6 p-5" aria-live="polite">
        {error ? <p className="font-bold text-ruby">{error}</p> : result ? (
          <>
            <p className="text-lg">{c.total} <strong className="font-display text-3xl text-teal">{result.total}</strong> {c.per}</p>
            <table className="mt-3 w-full text-left"><thead><tr className="border-b-[1.5px] border-ink text-sm"><th className="py-1">{c.element}</th><th>{c.count}</th><th>{c.massCol}</th><th>{c.percent}</th></tr></thead>
              <tbody>{result.parts.map((p) => <tr key={p.sym} className="border-b-2 border-dotted border-line"><td className="py-1.5 font-bold">{p.sym} <span className="font-normal text-muted">{BY_SYMBOL.get(p.sym)!.name}</span></td><td>{p.count}</td><td className="tabular-nums">{p.mass}</td>
                <td><span className="inline-flex items-center gap-2"><span className="inline-block h-3 w-16 rounded-sm bg-sunken" aria-hidden><span className="block h-full rounded-sm bg-teal" style={{ width: `${p.percent}%` }} /></span><span className="tabular-nums">{p.percent}%</span></span></td></tr>)}</tbody></table>
          </>
        ) : null}
      </section>
      {result ? (
        <section className="guide-card mt-6 p-5"><h2 className="text-xl">{c.conv}</h2>
          <div className="mt-3 grid gap-4 sm:grid-cols-2">
            <label><span className="block font-bold">{c.grams}</span><input inputMode="decimal" value={grams} onChange={(e) => { setGrams(e.target.value); setMoles(""); }} className={`${inputClass} mt-1`} />
              <span className="mt-1 block text-sm text-muted" aria-live="polite">{grams && Number.isFinite(g) ? `= ${r(g / mm)} ${c.moles.toLowerCase()}` : ""}</span></label>
            <label><span className="block font-bold">{c.moles}</span><input inputMode="decimal" value={moles} onChange={(e) => { setMoles(e.target.value); setGrams(""); }} className={`${inputClass} mt-1`} />
              <span className="mt-1 block text-sm text-muted" aria-live="polite">{moles && Number.isFinite(n) ? `= ${r(n * mm)} ${c.grams.toLowerCase()}` : ""}</span></label>
          </div></section>
      ) : null}
      <p className="mt-4 max-w-prose text-sm text-muted">{c.mmNote}</p>
    </Page>
  );
}

export function BalancerTool() {
  const c = useCopy(copy);
  const [eq, setEq] = useState("C3H8 + O2 -> CO2 + H2O");
  const res = balance(eq);
  const side = (items: { formula: string; coeff: number }[]) => items.map((x, i) => <span key={i}>{i ? " + " : ""}{x.coeff > 1 ? `${x.coeff} ` : ""}<Chem formula={x.formula} /></span>);
  return (
    <Page>
      <h1 className="text-3xl sm:text-4xl">{c.balTitle}</h1>
      <p className="mt-2 max-w-prose text-muted">{c.balLead}</p>
      <div className="guide-card mt-6 p-5">
        <label className="block"><span className="block font-bold">{c.equation}</span><input value={eq} onChange={(e) => setEq(e.target.value)} placeholder={c.balPh} maxLength={120} className={`${inputClass} mt-1 font-mono`} /></label>
        <p className="mt-2 text-sm text-muted">{c.examples} {["H2 + O2 -> H2O", "Fe + O2 -> Fe2O3", "Al + HCl -> AlCl3 + H2", "KMnO4 + HCl -> KCl + MnCl2 + H2O + Cl2"].map((x) => <button key={x} onClick={() => setEq(x)} className="mr-3 inline-block font-bold text-teal underline underline-offset-4"><Chem formula={x.split(" -> ")[0]} /></button>)}</p>
      </div>
      <section className="guide-card mt-6 p-5" aria-live="polite">
        {res.ok ? (<><p className="text-sm font-bold text-muted">{c.balanced}</p><p className="mt-1 font-display text-2xl font-semibold text-teal sm:text-3xl">{side(res.value.reactants)} → {side(res.value.products)}</p></>)
          : <p className="font-bold text-ruby">{eq.trim() ? c.balErrs[res.reason] : c.balErrs.format}</p>}
      </section>
      <p className="mt-4 max-w-prose text-sm text-muted">{c.balNote}</p>
    </Page>
  );
}
