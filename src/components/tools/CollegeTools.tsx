"use client";
import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { actToSat, collegeCost, creditTotal, CREDITS_KEY, NO_CREDITS, rankInfo, satToAct, type CreditCourse } from "@/lib/career";
import { useLang } from "@/lib/i18n";
import { useLocalDoc } from "@/lib/local-doc";
import { useCopy } from "@/lib/use-copy";
import { EmptyTrail } from "../art";
import { buttonClass, Field, inputClass, Page } from "../ui";

const num = (s: string) => { const n = parseFloat(s.replace(/[$,]/g, "").replace(",", ".")); return Number.isFinite(n) && n >= 0 ? n : 0; };
const money = (n: number, lang: string) => new Intl.NumberFormat(lang === "es" ? "es-US" : "en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);

const copy = {
  en: {
    costTitle: "College cost calculator", costLead: "Add up one year of costs, subtract what you will not have to pay back, and see the total and a loan payment.",
    tuition: "Tuition and fees per year ($)", housing: "Housing and food ($)", books: "Books and supplies ($)", transport: "Transportation ($)", other: "Other costs ($)", sch: "Scholarships per year ($)", grants: "Grants per year, like Pell ($)", years: "Years", rate: "Loan interest (%)", loanYears: "Years to pay back",
    note: "Get the real numbers from each college's net price calculator and your FAFSA results. These boxes start empty on purpose, because costs differ a lot from college to college.",
    sticker: "Cost per year", aid: "Free money per year", net: "You pay per year", total: (y: number) => `You pay over ${y} years`, loan: "If you borrow all of it, per month", covered: (p: number) => `Scholarships and grants cover ${p}% of the cost.`, fill: "Fill in the costs above to see your total.",
    convTitle: "SAT and ACT converter", convLead: "Find the matching score on the other test.", sat: "SAT total (400 to 1600)", act: "ACT composite (1 to 36)", satIs: (a: number) => `An SAT of ${a} is about`, actIs: "An ACT of", about: "is about an SAT of", outAct: (a: number) => `ACT ${a}`, none: "That score is outside the table (SAT 590 to 1600, ACT 9 to 36).",
    convNote: "This uses the 2018 College Board and ACT concordance. Scores are comparable, not identical, so treat it as an estimate.", source: "See the official ACT table",
    rankTitle: "Class rank estimator", rankLead: "Enter your rank and how many students are in your class.", rank: "My rank", size: "Students in my class", top: (p: number) => `You are in the top ${p}%.`, pct: (p: number) => `That is the ${p}th percentile.`,
    top10: "Many Texas public universities offer automatic admission to students in the top 10% of their class. Rules differ by college, and some use a lower cutoff, so check each college's page.", notTop10: "Automatic admission rules differ by college. Check each college's page.", badRank: "Enter a rank between 1 and the class size.",
    credTitle: "Credit hour tracker", credLead: "Keep track of college credits you earn, like dual enrollment, toward a degree.", name: "Course", namePh: "College Algebra", hours: "Credit hours", term: "Term", termPh: "Fall 2026", provider: "College or program", sourcePh: "South Texas College", add: "Add course", need: "Write the course and hours.",
    credTotal: (n: number) => `${n} credit hours earned`, goal: (n: number, g: number) => `${Math.min(100, Math.round((n / g) * 100))}% of the ${g} hours in an associate degree`, empty: "No courses yet. Add your first one.", remove: "Remove",
  },
  es: {
    costTitle: "Calculadora del costo universitario", costLead: "Suma los costos de un año, resta lo que no tendrás que devolver, y mira el total y un pago de préstamo.",
    tuition: "Matrícula y cuotas por año ($)", housing: "Vivienda y comida ($)", books: "Libros y materiales ($)", transport: "Transporte ($)", other: "Otros costos ($)", sch: "Becas por año ($)", grants: "Subvenciones por año, como Pell ($)", years: "Años", rate: "Interés del préstamo (%)", loanYears: "Años para pagar",
    note: "Consigue los números reales en la calculadora de precio neto de cada universidad y en los resultados de tu FAFSA. Estas casillas empiezan vacías a propósito, porque los costos cambian mucho de una universidad a otra.",
    sticker: "Costo por año", aid: "Dinero gratis por año", net: "Tú pagas por año", total: (y: number) => `Tú pagas en ${y} años`, loan: "Si pides prestado todo, por mes", covered: (p: number) => `Las becas y subvenciones cubren el ${p}% del costo.`, fill: "Llena los costos de arriba para ver tu total.",
    convTitle: "Conversor de SAT y ACT", convLead: "Encuentra la puntuación equivalente en el otro examen.", sat: "Total de SAT (400 a 1600)", act: "Compuesto de ACT (1 a 36)", satIs: (a: number) => `Un SAT de ${a} equivale más o menos a`, actIs: "Un ACT de", about: "equivale más o menos a un SAT de", outAct: (a: number) => `ACT ${a}`, none: "Esa puntuación está fuera de la tabla (SAT 590 a 1600, ACT 9 a 36).",
    convNote: "Usa la tabla de concordancia de 2018 de College Board y ACT. Las puntuaciones son comparables, no idénticas, así que tómalo como un cálculo aproximado.", source: "Ver la tabla oficial de ACT",
    rankTitle: "Calculadora de rango de clase", rankLead: "Escribe tu lugar y cuántos estudiantes hay en tu clase.", rank: "Mi lugar", size: "Estudiantes en mi clase", top: (p: number) => `Estás en el ${p}% superior.`, pct: (p: number) => `Es el percentil ${p}.`,
    top10: "Muchas universidades públicas de Texas ofrecen admisión automática a los estudiantes del 10% superior de su clase. Las reglas cambian según la universidad, y algunas usan un límite menor, así que revisa la página de cada una.", notTop10: "Las reglas de admisión automática cambian según la universidad. Revisa la página de cada una.", badRank: "Escribe un lugar entre 1 y el tamaño de la clase.",
    credTitle: "Registro de créditos", credLead: "Lleva la cuenta de los créditos universitarios que ganas, como en inscripción doble, para un título.", name: "Curso", namePh: "Álgebra universitaria", hours: "Horas de crédito", term: "Periodo", termPh: "Otoño 2026", provider: "Universidad o programa", sourcePh: "South Texas College", add: "Agregar curso", need: "Escribe el curso y las horas.",
    credTotal: (n: number) => `${n} horas de crédito ganadas`, goal: (n: number, g: number) => `${Math.min(100, Math.round((n / g) * 100))}% de las ${g} horas de un título asociado`, empty: "Todavía no hay cursos. Agrega el primero.", remove: "Quitar",
  },
};

export function CostTool() {
  const c = useCopy(copy);
  const lang = useLang();
  const [v, setV] = useState({ tuition: "", housing: "", books: "", transport: "", other: "", scholarships: "", grants: "" });
  const [years, setYears] = useState("4"), [rate, setRate] = useState("6"), [loanYears, setLoanYears] = useState("10");
  const r = collegeCost({ tuition: num(v.tuition), housing: num(v.housing), books: num(v.books), transport: num(v.transport), other: num(v.other), scholarships: num(v.scholarships), grants: num(v.grants) },
    Math.min(8, Math.max(1, Math.round(num(years)))), Math.min(30, num(rate)), Math.min(30, Math.max(1, Math.round(num(loanYears)))));
  const field = (k: keyof typeof v, label: string) => <Field label={label}>{(p) => <input {...p} inputMode="decimal" value={v[k]} onChange={(e) => setV({ ...v, [k]: e.target.value })} className={inputClass} />}</Field>;
  return (
    <Page>
      <h1 className="text-3xl sm:text-4xl">{c.costTitle}</h1>
      <p className="mt-2 max-w-prose text-muted">{c.costLead}</p>
      <div className="guide-card mt-6 grid gap-x-4 p-5 sm:grid-cols-2">
        {field("tuition", c.tuition)}{field("housing", c.housing)}{field("books", c.books)}{field("transport", c.transport)}{field("other", c.other)}
        {field("scholarships", c.sch)}{field("grants", c.grants)}
        <Field label={c.years}>{(p) => <input {...p} inputMode="numeric" value={years} onChange={(e) => setYears(e.target.value)} className={inputClass} />}</Field>
        <Field label={c.rate}>{(p) => <input {...p} inputMode="decimal" value={rate} onChange={(e) => setRate(e.target.value)} className={inputClass} />}</Field>
        <Field label={c.loanYears}>{(p) => <input {...p} inputMode="numeric" value={loanYears} onChange={(e) => setLoanYears(e.target.value)} className={inputClass} />}</Field>
      </div>
      <p className="mt-3 max-w-prose text-sm text-muted">{c.note}</p>
      <section className="guide-card mt-6 p-5" aria-live="polite">
        {r.sticker === 0 ? <p className="text-lg">{c.fill}</p> : (
          <dl className="grid gap-3 sm:grid-cols-2">
            <div><dt className="text-sm font-bold text-muted">{c.sticker}</dt><dd className="font-display text-2xl font-semibold">{money(r.sticker, lang)}</dd></div>
            <div><dt className="text-sm font-bold text-muted">{c.aid}</dt><dd className="font-display text-2xl font-semibold">{money(r.aid, lang)}</dd></div>
            <div><dt className="text-sm font-bold text-muted">{c.net}</dt><dd className="font-display text-2xl font-semibold">{money(r.net, lang)}</dd></div>
            <div><dt className="text-sm font-bold text-muted">{c.total(Math.min(8, Math.max(1, Math.round(num(years)))))}</dt><dd className="font-display text-3xl font-semibold text-teal">{money(r.total, lang)}</dd></div>
            <div className="sm:col-span-2"><dt className="text-sm font-bold text-muted">{c.loan}</dt><dd className="font-display text-2xl font-semibold">{money(r.monthlyLoan, lang)}</dd><dd className="mt-1 text-sm text-muted">{c.covered(r.covered)}</dd></div>
          </dl>
        )}
      </section>
    </Page>
  );
}

export function ConverterTool() {
  const c = useCopy(copy);
  const [sat, setSat] = useState("1210"), [act, setAct] = useState("25");
  const a = satToAct(parseInt(sat, 10)), s = actToSat(parseInt(act, 10));
  return (
    <Page>
      <h1 className="text-3xl sm:text-4xl">{c.convTitle}</h1>
      <p className="mt-2 max-w-prose text-muted">{c.convLead}</p>
      <div className="mt-6 grid gap-6 md:grid-cols-2">
        <section className="guide-card p-5" aria-live="polite">
          <Field label={c.sat}>{(p) => <input {...p} inputMode="numeric" value={sat} onChange={(e) => setSat(e.target.value)} className={inputClass} />}</Field>
          {a ? <p className="text-lg">{c.satIs(parseInt(sat, 10))} <strong className="font-display text-3xl text-teal">{c.outAct(a)}</strong></p> : <p className="font-bold text-ruby">{c.none}</p>}
        </section>
        <section className="guide-card p-5" aria-live="polite">
          <Field label={c.act}>{(p) => <input {...p} inputMode="numeric" value={act} onChange={(e) => setAct(e.target.value)} className={inputClass} />}</Field>
          {s ? <p className="text-lg">{c.actIs} {parseInt(act, 10)} {c.about} <strong className="font-display text-3xl text-teal">{s}</strong></p> : <p className="font-bold text-ruby">{c.none}</p>}
        </section>
      </div>
      <p className="mt-4 max-w-prose text-sm text-muted">{c.convNote} <a href="https://www.act.org/content/act/en/products-and-services/the-act/scores/act-sat-concordance.html" target="_blank" rel="noopener noreferrer" className="font-bold text-teal underline underline-offset-4">{c.source}</a></p>
    </Page>
  );
}

export function RankTool() {
  const c = useCopy(copy);
  const [rank, setRank] = useState(""), [size, setSize] = useState("");
  const r = rankInfo(parseInt(rank, 10), parseInt(size, 10));
  return (
    <Page>
      <h1 className="text-3xl sm:text-4xl">{c.rankTitle}</h1>
      <p className="mt-2 max-w-prose text-muted">{c.rankLead}</p>
      <div className="guide-card mt-6 grid gap-x-4 p-5 sm:grid-cols-2">
        <Field label={c.rank}>{(p) => <input {...p} inputMode="numeric" value={rank} onChange={(e) => setRank(e.target.value)} className={inputClass} />}</Field>
        <Field label={c.size}>{(p) => <input {...p} inputMode="numeric" value={size} onChange={(e) => setSize(e.target.value)} className={inputClass} />}</Field>
      </div>
      <section className="guide-card mt-6 p-5" aria-live="polite">
        {r ? (<><p className="font-display text-3xl font-semibold text-teal">{c.top(r.topPercent)}</p><p className="mt-1 text-muted">{c.pct(r.percentile)}</p><p className="mt-3 max-w-prose">{r.inTop10 ? c.top10 : c.notTop10}</p></>)
          : <p className={rank || size ? "font-bold text-ruby" : "text-muted"}>{rank || size ? c.badRank : c.rankLead}</p>}
      </section>
    </Page>
  );
}

const ASSOCIATE_HOURS = 60;
export function CreditsTool() {
  const c = useCopy(copy);
  const [list, setList] = useLocalDoc<CreditCourse[]>(CREDITS_KEY, NO_CREDITS);
  const [f, setF] = useState({ name: "", hours: "3", term: "", source: "" });
  const [err, setErr] = useState(false);
  const add = (e: React.FormEvent) => {
    e.preventDefault();
    const h = num(f.hours);
    if (!f.name.trim() || !(h > 0 && h <= 12)) return setErr(true);
    setErr(false);
    setList((p) => [...p, { id: crypto.randomUUID(), name: f.name.trim(), hours: h, term: f.term.trim(), source: f.source.trim() }]);
    setF({ ...f, name: "" });
  };
  const total = creditTotal(list);
  return (
    <Page wide>
      <h1 className="text-3xl sm:text-4xl">{c.credTitle}</h1>
      <p className="mt-2 max-w-prose text-muted">{c.credLead}</p>
      <form onSubmit={add} className="guide-card mt-6 grid gap-x-4 p-5 sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_2fr_auto] lg:items-start" noValidate>
        <Field label={c.name}>{(p) => <input {...p} value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} placeholder={c.namePh} maxLength={60} className={inputClass} />}</Field>
        <Field label={c.hours}>{(p) => <input {...p} inputMode="decimal" value={f.hours} onChange={(e) => setF({ ...f, hours: e.target.value })} className={inputClass} />}</Field>
        <Field label={c.term}>{(p) => <input {...p} value={f.term} onChange={(e) => setF({ ...f, term: e.target.value })} placeholder={c.termPh} maxLength={30} className={inputClass} />}</Field>
        <Field label={c.provider}>{(p) => <input {...p} value={f.source} onChange={(e) => setF({ ...f, source: e.target.value })} placeholder={c.sourcePh} maxLength={60} className={inputClass} />}</Field>
        <div className="lg:pt-7"><button className={buttonClass.primary}><Plus size={18} />{c.add}</button></div>
        {err ? <p role="alert" className="font-bold text-ruby sm:col-span-2 lg:col-span-5">{c.need}</p> : null}
      </form>
      {list.length === 0 ? <div className="guide-card mt-8 flex max-w-xl items-center gap-5 p-5"><EmptyTrail className="h-24 w-36 shrink-0 text-ink" /><p className="text-lg">{c.empty}</p></div> : (
        <>
          <section className="guide-card mt-6 p-5"><p className="font-display text-2xl font-semibold text-teal">{c.credTotal(total)}</p><p className="text-sm text-muted">{c.goal(total, ASSOCIATE_HOURS)}</p>
            <div className="mt-2 h-3 overflow-hidden rounded-full border-[1.5px] border-ink bg-sunken" role="progressbar" aria-valuenow={Math.min(100, Math.round((total / ASSOCIATE_HOURS) * 100))} aria-valuemin={0} aria-valuemax={100} aria-label={c.credTitle}><div className="h-full bg-teal" style={{ width: `${Math.min(100, (total / ASSOCIATE_HOURS) * 100)}%` }} /></div></section>
          <ul className="mt-4 divide-y-2 divide-dotted divide-line">{list.map((x) => (
            <li key={x.id} className="flex items-center gap-3 py-2.5"><div className="min-w-0 flex-1"><p className="font-bold">{x.name} · {x.hours}</p><p className="text-sm text-muted">{[x.term, x.source].filter(Boolean).join(" · ")}</p></div>
              <button onClick={() => setList((p) => p.filter((y) => y.id !== x.id))} aria-label={`${c.remove}: ${x.name}`} className="grid h-10 w-10 shrink-0 place-items-center rounded-md hover:bg-sunken"><Trash2 size={18} strokeWidth={1.75} /></button></li>))}</ul>
        </>
      )}
    </Page>
  );
}
