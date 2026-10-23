"use client";
import { useMemo, useState } from "react";
import { COLLEGES, SCHOLARSHIPS } from "@/data/explore";
import { INTEREST_TAGS, type Tag } from "@/data/guides";
import { useLang } from "@/lib/i18n";
import { useProfile } from "@/lib/profile";
import { useCopy } from "@/lib/use-copy";
import { Callout, Chips, Empty, Ext, FindLink, Head, pick } from "./shared";

const copy = {
  en: {
    cTitle: "College finder", cLead: "Texas colleges to look at, starting with the Valley. Pick what matters to you.", all: "All colleges", near: "In the Valley", fit: "Fits my interests", none: "No colleges match. Try a different filter.", visit: "Visit the college's website",
    costNote: "Prices change every year, so this list does not show any. Use the College Scorecard to compare real costs and graduation rates, and ask each college for its net price.", scorecard: "Open College Scorecard", navigator: "Open College Navigator", where: "Where", more: "This list is a starting point, not every college. Your counselor can help you add more.",
    sTitle: "Scholarship matcher", sLead: "Scholarships that may fit you. Always read the rules on the official site before you apply.", gradeL: "Your grade", anyGrade: "Any grade", need: "Based on financial need", hisp: "For Hispanic and Latino students", tx: "Texas students", who: "Who it is for", fits: (g: number) => `Open to grade ${g}`, local: "Local scholarships",
    localLead: "Many scholarships come from local groups, like community foundations, clubs and employers. The Finder can search for them near you.", localFind: "Search for local scholarships", sNone: "No scholarships match those choices. Clear a filter, or try the local search.", official: "Official site",
    sNote: "This is a short list of well-known scholarships, not all of them. Rules and deadlines change every year. Never pay to apply for a scholarship.", fasfa: "Many need the FAFSA. See the FAFSA helper.",
  },
  es: {
    cTitle: "Buscador de universidades", cLead: "Universidades de Texas para mirar, empezando por el Valle. Elige lo que te importa.", all: "Todas las universidades", near: "En el Valle", fit: "Según mis intereses", none: "Ninguna universidad coincide. Prueba otro filtro.", visit: "Visita el sitio de la universidad",
    costNote: "Los precios cambian cada año, así que esta lista no muestra ninguno. Usa el College Scorecard para comparar costos y tasas de graduación reales, y pídele a cada universidad su precio neto.", scorecard: "Abrir College Scorecard", navigator: "Abrir College Navigator", where: "Dónde", more: "Esta lista es un punto de partida, no todas las universidades. Tu consejero te puede ayudar a agregar más.",
    sTitle: "Buscador de becas", sLead: "Becas que pueden irte bien. Lee siempre las reglas en el sitio oficial antes de solicitar.", gradeL: "Tu grado", anyGrade: "Cualquier grado", need: "Basadas en necesidad económica", hisp: "Para estudiantes hispanos y latinos", tx: "Estudiantes de Texas", who: "Para quién es", fits: (g: number) => `Abierta al grado ${g}`, local: "Becas locales",
    localLead: "Muchas becas vienen de grupos locales, como fundaciones comunitarias, clubes y empleadores. El Buscador puede encontrarlas cerca de ti.", localFind: "Buscar becas locales", sNone: "Ninguna beca coincide con esas opciones. Quita un filtro o prueba la búsqueda local.", official: "Sitio oficial",
    sNote: "Esta es una lista corta de becas conocidas, no de todas. Las reglas y fechas límite cambian cada año. Nunca pagues para solicitar una beca.", fasfa: "Muchas piden la FAFSA. Mira la Ayuda con la FAFSA.",
  },
};

export function CollegesTool() {
  const c = useCopy(copy);
  const lang = useLang();
  const [profile] = useProfile();
  const mine = useMemo(() => new Set<Tag>(profile.interests.flatMap((i) => INTEREST_TAGS[i] ?? [])), [profile.interests]);
  const [mode, setMode] = useState<"all" | "near" | "fit">("all");
  const shown = COLLEGES.filter((k) => mode === "all" || (mode === "near" ? k.local : k.tags.some((t) => mine.has(t))));
  return (
    <Head title={c.cTitle} lead={c.cLead} wide>
      <div className="mt-5"><Chips value={mode} onChange={setMode} label={c.cTitle} options={[{ id: "all", label: c.all }, { id: "near", label: c.near }, ...(mine.size ? [{ id: "fit" as const, label: c.fit }] : [])]} /></div>
      {shown.length === 0 ? <Empty>{c.none}</Empty> : <ul className="mt-6 grid gap-4 md:grid-cols-2">{shown.map((k) => (
        <li key={k.id} className="guide-card p-4"><h2 className="text-xl">{k.name}</h2><p className="text-sm font-bold text-terracotta">{pick(k.kind, lang)} · {k.city}</p><p className="mt-2">{pick(k.note, lang)}</p><p className="mt-3"><Ext href={k.url}>{c.visit}</Ext></p></li>))}</ul>}
      <Callout>{c.costNote} <span className="mt-2 flex flex-wrap gap-4"><Ext href="https://collegescorecard.ed.gov/">{c.scorecard}</Ext><Ext href="https://nces.ed.gov/collegenavigator/">{c.navigator}</Ext></span></Callout>
      <p className="mt-4 max-w-prose text-sm text-muted">{c.more}</p>
    </Head>
  );
}

export function ScholarshipsTool() {
  const c = useCopy(copy);
  const lang = useLang();
  const [profile] = useProfile();
  const [grade, setGrade] = useState<number>(profile.grade ?? 0);
  const [need, setNeed] = useState(false), [hisp, setHisp] = useState(false), [tx, setTx] = useState(false);
  const shown = SCHOLARSHIPS.filter((s) => (!grade || (grade >= s.grades[0] && grade <= s.grades[1])) && (!need || s.need) && (!hisp || s.hispanic) && (!tx || s.texas));
  const box = (v: boolean, set: (b: boolean) => void, label: string) => <label className="flex items-center gap-2 font-bold"><input type="checkbox" checked={v} onChange={(e) => set(e.target.checked)} className="h-5 w-5 accent-[var(--c-teal)]" />{label}</label>;
  return (
    <Head title={c.sTitle} lead={c.sLead} wide>
      <div className="guide-card mt-5 flex flex-wrap items-end gap-x-6 gap-y-3 p-4">
        <label><span className="block font-bold">{c.gradeL}</span><select value={grade} onChange={(e) => setGrade(Number(e.target.value))} className="mt-1 rounded-xl border-[1.5px] border-ink bg-surface px-3 py-2 text-lg"><option value={0}>{c.anyGrade}</option>{[7, 8, 9, 10, 11, 12].map((g) => <option key={g} value={g}>{g}</option>)}</select></label>
        {box(need, setNeed, c.need)}{box(hisp, setHisp, c.hisp)}{box(tx, setTx, c.tx)}
      </div>
      {shown.length === 0 ? <Empty>{c.sNone}</Empty> : <ul className="mt-6 grid gap-4 md:grid-cols-2">{shown.map((s) => (
        <li key={s.id} className="guide-card p-4"><h2 className="text-xl">{s.name}</h2><p className="mt-1"><span className="font-bold">{c.who}: </span>{pick(s.who, lang)}</p><p className="mt-1 text-muted">{pick(s.note, lang)}</p>
          <p className="mt-2 flex flex-wrap items-center gap-x-4 text-sm"><span className="font-bold text-terracotta">{c.fits(Math.max(s.grades[0], 1))}{s.grades[1] !== s.grades[0] ? `–${s.grades[1]}` : ""}</span><Ext href={s.url}>{c.official}</Ext></p></li>))}</ul>}
      <section className="guide-card mt-6 p-5"><h2 className="text-xl">{c.local}</h2><p className="mt-1 max-w-prose">{c.localLead}</p><p className="mt-2"><FindLink q="local scholarships for high school students">{c.localFind}</FindLink></p></section>
      <Callout>{c.sNote} {c.fasfa}</Callout>
    </Head>
  );
}
