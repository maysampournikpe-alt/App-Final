"use client";
import { useState } from "react";
import { checkWork, gradProgress, GRAD_KEY, hourLabel, NO_GRAD, workLimits, type GradArea, type GradDoc, type GradPlan, type Period } from "@/lib/laborlaw";
import { rankInfo } from "@/lib/career";
import { useLang } from "@/lib/i18n";
import { useLocalDoc } from "@/lib/local-doc";
import { useCopy } from "@/lib/use-copy";
import { buttonClass, inputClass } from "../ui";
import { GuideTool } from "./GuideTool";
import { Callout, Chips, Ext, Head } from "./shared";

const copy = {
  en: {
    gTitle: "Texas graduation requirements", gLead: "Track the credits you need to graduate under the Foundation High School Program.", planL: "Your plan", plans: { foundation: "Foundation (22 credits)", endorsement: "With an endorsement (26 credits)" } as Record<GradPlan, string>,
    areas: { english: "English", math: "Math", science: "Science", social: "Social studies", language: "Language other than English", pe: "Physical education", arts: "Fine arts", electives: "Electives" } as Record<GradArea, string>,
    have: "Credits earned", of: (a: number, b: number) => `${a} of ${b}`, total: (a: number, b: number, p: number) => `${a} of ${b} credits (${p}%)`, left: (n: number) => (n === 0 ? "You have every credit. Check with your counselor to confirm." : `${n} to go`),
    about: "How it works", points: ["A credit is usually one full-year class. The Foundation plan needs 22 credits. Adding an endorsement raises the total to 26.", "There are five endorsements: STEM, Business and Industry, Public Services, Arts and Humanities, and Multidisciplinary Studies.", "The Distinguished Level of Achievement needs an endorsement plus four credits of math (including Algebra II) and four of science. It is one way to qualify for Texas automatic admission.", "You also have state test requirements. Ask your counselor how they apply to you."],
    gNote: "Graduation rules are updated over time. This tracker is a helper. Your counselor and the Texas Education Agency have the official rules.", tea: "Texas Education Agency",
    aRank: "Check your rank", rank: "My class rank", size: "Students in my class", result: (p: number) => `You are in the top ${p}%.`, bad: "Enter a rank between 1 and your class size.", cut10: "Top 10%: automatic admission to Texas public universities (UT Austin may use a lower cutoff).", cut5: "Top 5%: the cutoff UT Austin announced for the 2027 entering class.", in: "Within the cutoff", out: "Outside the cutoff",
    lTitle: "Teen work law guide", lLead: "What the rules say about when and how long Texas teens can work. This follows the Texas Workforce Commission's summary.", ageL: "Your age", periodL: "What kind of day?", periods: { "school-day": "A school day", "non-school-day": "A day off during the school year", summer: "Summer (June 1 to Labor Day)" } as Record<Period, string>,
    weekL: "Is school in session this week?", yes: "Yes", no: "No", hToday: "Hours you would work today", hWeek: "Total hours you would work this week", from: "Start time", to: "End time", check: "Check my schedule", okMsg: "That fits the rules for your age.", under14: "Most jobs are not allowed under age 14. There are a few exceptions, like delivering newspapers or acting. Ask the Texas Workforce Commission.",
    issues: { dayHours: (n: number) => `That is more than ${n} hours in one day.`, weekHours: (n: number) => `That is more than ${n} hours in one week.`, tooEarly: (t: string) => `Work cannot start before ${t}.`, tooLate: (t: string) => `Work must end by ${t}.` },
    hazard: "Teens under 18 are not allowed to do jobs the government calls hazardous, such as using certain power machinery. Ask the employer what the job involves.", hardship: "If you need to work to support yourself or your family, the Texas Workforce Commission can sometimes waive the hour limits.", school: "This tool cannot tell if a shift falls during your school hours. Work is not allowed during school hours.",
    ageNote: "The rules below describe ages 14 and 15. At 16 and 17 there are no hour limits, but hazardous jobs are still off limits.", limits: "Limits for ages 14 and 15", lim: (d: number, w: number, a: string, b: string) => `Up to ${d} hours a day and ${w} hours a week, between ${a} and ${b}.`, twc: "Texas Workforce Commission: child labor", lNote: "Rules can change and some jobs have special rules. The Texas Workforce Commission has the official answer.", pay: "Estimate your pay with the Paycheck calculator.",
  },
  es: {
    gTitle: "Requisitos de graduación de Texas", gLead: "Lleva la cuenta de los créditos que necesitas para graduarte con el Programa Fundamental de Preparatoria.", planL: "Tu plan", plans: { foundation: "Fundamental (22 créditos)", endorsement: "Con una especialización (26 créditos)" } as Record<GradPlan, string>,
    areas: { english: "Inglés", math: "Matemáticas", science: "Ciencias", social: "Estudios sociales", language: "Idioma que no sea inglés", pe: "Educación física", arts: "Bellas artes", electives: "Optativas" } as Record<GradArea, string>,
    have: "Créditos ganados", of: (a: number, b: number) => `${a} de ${b}`, total: (a: number, b: number, p: number) => `${a} de ${b} créditos (${p}%)`, left: (n: number) => (n === 0 ? "Tienes todos los créditos. Confirma con tu consejero." : `Faltan ${n}`),
    about: "Cómo funciona", points: ["Un crédito suele ser una clase de un año completo. El plan Fundamental necesita 22 créditos. Agregar una especialización sube el total a 26.", "Hay cinco especializaciones: STEM, Negocios e Industria, Servicios Públicos, Artes y Humanidades, y Estudios Multidisciplinarios.", "El Nivel Distinguido de Logro necesita una especialización más cuatro créditos de matemáticas (incluido Álgebra II) y cuatro de ciencias. Es una forma de calificar para la admisión automática de Texas.", "También hay requisitos de exámenes estatales. Pregúntale a tu consejero cómo se aplican a ti."],
    gNote: "Las reglas de graduación se actualizan con el tiempo. Este registro es una ayuda. Tu consejero y la Agencia de Educación de Texas tienen las reglas oficiales.", tea: "Agencia de Educación de Texas",
    aRank: "Revisa tu lugar", rank: "Mi lugar en la clase", size: "Estudiantes en mi clase", result: (p: number) => `Estás en el ${p}% superior.`, bad: "Escribe un lugar entre 1 y el tamaño de tu clase.", cut10: "10% superior: admisión automática a las universidades públicas de Texas (UT Austin puede usar un límite menor).", cut5: "5% superior: el límite que UT Austin anunció para la clase de 2027.", in: "Dentro del límite", out: "Fuera del límite",
    lTitle: "Guía de leyes de trabajo para menores", lLead: "Lo que dicen las reglas sobre cuándo y cuánto pueden trabajar los jóvenes de Texas. Sigue el resumen de la Comisión de la Fuerza Laboral de Texas.", ageL: "Tu edad", periodL: "¿Qué tipo de día?", periods: { "school-day": "Un día de escuela", "non-school-day": "Un día libre durante el año escolar", summer: "Verano (del 1 de junio al Día del Trabajo)" } as Record<Period, string>,
    weekL: "¿Hay clases esta semana?", yes: "Sí", no: "No", hToday: "Horas que trabajarías hoy", hWeek: "Total de horas que trabajarías esta semana", from: "Hora de inicio", to: "Hora de fin", check: "Revisar mi horario", okMsg: "Eso cumple las reglas para tu edad.", under14: "La mayoría de los trabajos no se permiten antes de los 14 años. Hay pocas excepciones, como repartir periódicos o actuar. Pregunta a la Comisión de la Fuerza Laboral de Texas.",
    issues: { dayHours: (n: number) => `Eso es más de ${n} horas en un día.`, weekHours: (n: number) => `Eso es más de ${n} horas en una semana.`, tooEarly: (t: string) => `El trabajo no puede empezar antes de las ${t}.`, tooLate: (t: string) => `El trabajo debe terminar a las ${t}.` },
    hazard: "Los menores de 18 años no pueden hacer trabajos que el gobierno considera peligrosos, como usar cierta maquinaria. Pregunta al empleador qué incluye el trabajo.", hardship: "Si necesitas trabajar para mantenerte o ayudar a tu familia, la Comisión de la Fuerza Laboral de Texas a veces puede eximir los límites de horas.", school: "Esta herramienta no puede saber si un turno cae en tu horario de clases. No se permite trabajar durante el horario escolar.",
    ageNote: "Las reglas de abajo describen las edades de 14 y 15 años. A los 16 y 17 no hay límites de horas, pero los trabajos peligrosos siguen prohibidos.", limits: "Límites para 14 y 15 años", lim: (d: number, w: number, a: string, b: string) => `Hasta ${d} horas al día y ${w} horas a la semana, entre las ${a} y las ${b}.`, twc: "Comisión de la Fuerza Laboral de Texas: trabajo infantil", lNote: "Las reglas pueden cambiar y algunos trabajos tienen reglas especiales. La Comisión de la Fuerza Laboral de Texas tiene la respuesta oficial.", pay: "Calcula tu pago con la Calculadora de cheque.",
  },
};

export function TxGradTool() {
  const c = useCopy(copy);
  const [doc, setDoc] = useLocalDoc<GradDoc>(GRAD_KEY, NO_GRAD);
  const r = gradProgress(doc);
  return (
    <Head title={c.gTitle} lead={c.gLead}>
      <div className="mt-5"><Chips<GradPlan> value={doc.plan} onChange={(plan) => setDoc((d) => ({ ...d, plan }))} label={c.planL} options={(Object.keys(c.plans) as GradPlan[]).map((p) => ({ id: p, label: c.plans[p] }))} /></div>
      <section className="guide-card mt-5 p-5" aria-live="polite">
        <p className="font-display text-2xl font-semibold text-teal">{c.total(r.have, r.total, r.pct)}</p><p className="text-muted">{c.left(r.left)}</p>
        <div className="mt-2 h-3 overflow-hidden rounded-full border-[1.5px] border-ink bg-sunken" role="progressbar" aria-valuenow={r.pct} aria-valuemin={0} aria-valuemax={100} aria-label={c.gTitle}><div className="h-full bg-teal" style={{ width: `${r.pct}%` }} /></div>
      </section>
      <ul className="mt-5 grid gap-3 sm:grid-cols-2">{r.per.map((p) => (
        <li key={p.area} className="guide-card flex items-center gap-3 p-3"><div className="min-w-0 flex-1"><p className="font-bold">{c.areas[p.area]}</p><p className="text-sm text-muted">{c.of(p.have, p.need)}</p></div>
          <label className="text-sm font-bold">{c.have}<input type="number" min={0} max={20} step={0.5} value={doc.earned[p.area] ?? 0} onChange={(e) => setDoc((d) => ({ ...d, earned: { ...d.earned, [p.area]: Math.max(0, Math.min(20, Number(e.target.value) || 0)) } }))} className={`${inputClass} mt-1 !w-20 !py-1.5`} /></label></li>))}</ul>
      <h2 className="mt-8 border-b-[1.5px] border-ink pb-1 text-2xl">{c.about}</h2>
      <ul className="mt-3 list-disc space-y-2 pl-6 text-lg">{c.points.map((x) => <li key={x} className="max-w-prose">{x}</li>)}</ul>
      <p className="mt-4"><Ext href="https://tea.texas.gov/">{c.tea}</Ext></p>
      <Callout>{c.gNote}</Callout>
    </Head>
  );
}

export function TxAdmitTool() {
  const c = useCopy(copy);
  const [rank, setRank] = useState(""), [size, setSize] = useState("");
  const r = rankInfo(parseInt(rank, 10), parseInt(size, 10));
  return (
    <GuideTool id="grades/txadmit">
      <section className="guide-card mt-6 p-5" aria-labelledby="rk-h"><h2 id="rk-h" className="text-xl">{c.aRank}</h2>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <label><span className="block font-bold">{c.rank}</span><input inputMode="numeric" value={rank} onChange={(e) => setRank(e.target.value)} className={`${inputClass} mt-1`} /></label>
          <label><span className="block font-bold">{c.size}</span><input inputMode="numeric" value={size} onChange={(e) => setSize(e.target.value)} className={`${inputClass} mt-1`} /></label>
        </div>
        <div className="mt-3" aria-live="polite">{r ? (<><p className="font-display text-2xl font-semibold text-teal">{c.result(r.topPercent)}</p>
          <ul className="mt-2 space-y-1"><li>{c.cut10} <strong className={r.topPercent <= 10 ? "text-teal" : "text-terracotta"}>{r.topPercent <= 10 ? c.in : c.out}</strong></li><li>{c.cut5} <strong className={r.topPercent <= 5 ? "text-teal" : "text-terracotta"}>{r.topPercent <= 5 ? c.in : c.out}</strong></li></ul></>) : rank || size ? <p className="font-bold text-ruby">{c.bad}</p> : null}</div>
      </section>
    </GuideTool>
  );
}

export function LaborLawTool() {
  const c = useCopy(copy);
  const lang = useLang();
  const [age, setAge] = useState(15);
  const [period, setPeriod] = useState<Period>("school-day");
  const [schoolWeek, setSchoolWeek] = useState(true);
  const [hToday, setHToday] = useState("3"), [hWeek, setHWeek] = useState("12");
  const [start, setStart] = useState("16:00"), [end, setEnd] = useState("19:00");
  const [ran, setRan] = useState(false);
  const toH = (s: string) => { const [h, m] = s.split(":").map(Number); return (h || 0) + (m || 0) / 60; };
  const res = checkWork({ age, period, schoolWeek, hoursToday: parseFloat(hToday) || 0, hoursWeek: parseFloat(hWeek) || 0, start: toH(start), end: toH(end) });
  const lim = workLimits(period, schoolWeek);
  const msg = (i: (typeof res.issues)[number]) => i.kind === "under14" ? c.under14 : i.kind === "dayHours" ? c.issues.dayHours(i.max) : i.kind === "weekHours" ? c.issues.weekHours(i.max) : i.kind === "tooEarly" ? c.issues.tooEarly(hourLabel(i.from, lang)) : c.issues.tooLate(hourLabel(i.until, lang));
  return (
    <Head title={c.lTitle} lead={c.lLead}>
      <div className="guide-card mt-5 p-5"><div className="grid gap-4 sm:grid-cols-2">
        <label><span className="block font-bold">{c.ageL}</span><select value={age} onChange={(e) => { setAge(Number(e.target.value)); setRan(false); }} className={`${inputClass} mt-1`}>{[13, 14, 15, 16, 17].map((a) => <option key={a} value={a}>{a}</option>)}</select></label>
        <label><span className="block font-bold">{c.periodL}</span><select value={period} onChange={(e) => { setPeriod(e.target.value as Period); setRan(false); }} className={`${inputClass} mt-1`}>{(Object.keys(c.periods) as Period[]).map((p) => <option key={p} value={p}>{c.periods[p]}</option>)}</select></label>
        <fieldset><legend className="font-bold">{c.weekL}</legend><div className="mt-1 flex gap-2">{[true, false].map((v) => <button type="button" key={String(v)} onClick={() => { setSchoolWeek(v); setRan(false); }} aria-pressed={schoolWeek === v} className={`rounded-full border-[1.5px] border-ink px-4 py-1.5 font-bold ${schoolWeek === v ? "bg-ink text-paper" : "bg-surface"}`}>{v ? c.yes : c.no}</button>)}</div></fieldset>
        <span />
        <label><span className="block font-bold">{c.hToday}</span><input inputMode="decimal" value={hToday} onChange={(e) => { setHToday(e.target.value); setRan(false); }} className={`${inputClass} mt-1`} /></label>
        <label><span className="block font-bold">{c.hWeek}</span><input inputMode="decimal" value={hWeek} onChange={(e) => { setHWeek(e.target.value); setRan(false); }} className={`${inputClass} mt-1`} /></label>
        <label><span className="block font-bold">{c.from}</span><input type="time" value={start} onChange={(e) => { setStart(e.target.value); setRan(false); }} className={`${inputClass} mt-1`} /></label>
        <label><span className="block font-bold">{c.to}</span><input type="time" value={end} onChange={(e) => { setEnd(e.target.value); setRan(false); }} className={`${inputClass} mt-1`} /></label>
      </div><button onClick={() => setRan(true)} className={`${buttonClass.primary} mt-4`}>{c.check}</button></div>
      <div aria-live="polite">{ran ? (
        <section className="guide-card mt-4 p-5">{res.ok ? <p className="font-display text-2xl font-semibold text-teal">{c.okMsg}</p> : <ul className="space-y-1 font-bold text-ruby">{res.issues.map((i, k) => <li key={k}>{msg(i)}</li>)}</ul>}
          {age >= 16 ? <p className="mt-2">{c.ageNote}</p> : null}{res.hazardNote ? <p className="mt-2">{c.hazard}</p> : null}<p className="mt-2 text-sm text-muted">{c.school}</p></section>) : null}</div>
      <h2 className="mt-8 border-b-[1.5px] border-ink pb-1 text-2xl">{c.limits}</h2>
      <p className="mt-3 max-w-prose text-lg">{c.lim(lim.dayMax, lim.weekMax, hourLabel(lim.from, lang), hourLabel(lim.until, lang))} ({c.periods[period]})</p>
      <p className="mt-3 max-w-prose">{c.hardship}</p><p className="mt-3"><Ext href="https://efte.twc.texas.gov/child_labor.html">{c.twc}</Ext></p><p className="mt-2 text-sm"><a href="/t/money/paycheck" className="font-bold text-teal underline underline-offset-4">{c.pay}</a></p>
      <Callout>{c.lNote}</Callout>
    </Head>
  );
}
