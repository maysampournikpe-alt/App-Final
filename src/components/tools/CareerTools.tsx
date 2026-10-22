"use client";
import Link from "next/link";
import { useMemo, useState } from "react";
import { CAREERS, EDU_LABEL, MAJORS, QUIZ, RIASEC_NAMES, type Career, type Edu, type Riasec } from "@/data/explore";
import { INTEREST_TAGS, type Tag } from "@/data/guides";
import { useLang } from "@/lib/i18n";
import { useProfile } from "@/lib/profile";
import { buttonClass, inputClass } from "../ui";
import { Callout, Chips, Empty, Ext, FindLink, Head, pick, youtubeSearch } from "./shared";
import { useCopy } from "@/lib/use-copy";

const copy = {
  en: {
    cTitle: "Career explorer", cLead: "See what people in a job do, and what school or training it usually takes.", search: "Search careers", searchPh: "nurse, welder, coder…", allEdu: "Any schooling", forYou: "Matches my interests", none: "No careers match. Try a different filter.",
    needs: "Usually needs", day: "A typical day", pay: "Pay and job outlook", payNote: "Pay changes every year, so check the official numbers.", lookup: "Look up on O*NET", ooh: "Browse the Occupational Outlook Handbook", videos: "Watch what the job is like", find: "Find opportunities to try this",
    eduShort: { hs: "High school + training", cert: "Certificate", assoc: "Associate", bach: "Bachelor's", master: "Master's", doctoral: "Doctoral" } as Record<Edu, string>,
    qTitle: "Interest quiz", qLead: "Answer 18 quick questions. There are no right or wrong answers.", scale: ["Not me", "A little", "Sometimes", "Mostly", "Very much me"], progress: (a: number, b: number) => `${a} of ${b} answered`, see: "See my results", again: "Take it again",
    rTitle: "Your interest type", rLead: "These are the kinds of work you seem to enjoy most.", careersFor: "Careers to explore", moreCareers: "See all careers", quizNote: "This quiz is for exploring, not for deciding your future. Your interests can grow and change.",
    dTitle: "Day in the life videos", dLead: "Watch real people explain what their job is like. These links open a video search.", watch: "Watch videos",
    mTitle: "Major explorer", mLead: "A major is what you focus on in college. Here is what each one covers and where it can lead.", all: "All", study: "What you study", leads: "Where it can lead", where: "To see which colleges offer a major, search for it on College Navigator.", nav: "Open College Navigator",
    ints: "Interest areas", tags: { stem: "Science and math", health: "Health", arts: "Arts and media", business: "Business", law: "Law and government", trades: "Trades", service: "Helping others", teaching: "Teaching", outdoors: "Outdoors", language: "Languages and writing", sports: "Sports", tech: "Technology" } as Record<Tag, string>,
  },
  es: {
    cTitle: "Explorador de carreras", cLead: "Mira qué hace la gente en un trabajo y qué estudios o capacitación suele pedir.", search: "Buscar carreras", searchPh: "enfermero, soldador, programador…", allEdu: "Cualquier estudio", forYou: "Según mis intereses", none: "Ninguna carrera coincide. Prueba otro filtro.",
    needs: "Normalmente necesita", day: "Un día típico", pay: "Pago y perspectivas de empleo", payNote: "El pago cambia cada año, así que revisa los números oficiales.", lookup: "Buscar en O*NET", ooh: "Ver el Occupational Outlook Handbook", videos: "Mira cómo es el trabajo", find: "Busca oportunidades para probar esto",
    eduShort: { hs: "Preparatoria + capacitación", cert: "Certificado", assoc: "Asociado", bach: "Licenciatura", master: "Maestría", doctoral: "Doctorado" } as Record<Edu, string>,
    qTitle: "Cuestionario de intereses", qLead: "Contesta 18 preguntas rápidas. No hay respuestas correctas ni incorrectas.", scale: ["Nada", "Un poco", "A veces", "Casi siempre", "Totalmente yo"], progress: (a: number, b: number) => `${a} de ${b} contestadas`, see: "Ver mis resultados", again: "Hacerlo otra vez",
    rTitle: "Tu tipo de intereses", rLead: "Estos son los tipos de trabajo que más parece que disfrutas.", careersFor: "Carreras para explorar", moreCareers: "Ver todas las carreras", quizNote: "Este cuestionario es para explorar, no para decidir tu futuro. Tus intereses pueden crecer y cambiar.",
    dTitle: "Videos de un día en la vida", dLead: "Mira a personas reales explicar cómo es su trabajo. Estos enlaces abren una búsqueda de videos.", watch: "Ver videos",
    mTitle: "Explorador de carreras universitarias", mLead: "Una carrera universitaria es en lo que te enfocas en la universidad. Aquí ves qué cubre cada una y a dónde puede llevar.", all: "Todas", study: "Qué estudias", leads: "A dónde puede llevar", where: "Para ver qué universidades ofrecen una carrera, búscala en College Navigator.", nav: "Abrir College Navigator",
    ints: "Áreas de interés", tags: { stem: "Ciencias y matemáticas", health: "Salud", arts: "Artes y medios", business: "Negocios", law: "Derecho y gobierno", trades: "Oficios", service: "Ayudar a otros", teaching: "Enseñanza", outdoors: "Aire libre", language: "Idiomas y escritura", sports: "Deportes", tech: "Tecnología" } as Record<Tag, string>,
  },
};

const norm = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
const onet = (q: string) => `https://www.onetonline.org/find/quick?s=${encodeURIComponent(q)}`;

function useMyTags(): Set<Tag> {
  const [profile] = useProfile();
  return useMemo(() => new Set(profile.interests.flatMap((i) => INTEREST_TAGS[i] ?? [])), [profile.interests]);
}

export function CareersTool() {
  const c = useCopy(copy);
  const lang = useLang();
  const mine = useMyTags();
  const [q, setQ] = useState("");
  const [edu, setEdu] = useState<Edu | "">("");
  const [forMe, setForMe] = useState(false);
  const nq = norm(q.trim());
  const shown = CAREERS.filter((k) => (!edu || k.edu === edu) && (!forMe || k.tags.some((t) => mine.has(t))) && (!nq || norm(k.name.en).includes(nq) || norm(k.name.es).includes(nq)));
  return (
    <Head title={c.cTitle} lead={c.cLead} wide>
      <div className="mt-5 flex flex-wrap items-end gap-4">
        <label className="min-w-[14rem] flex-1"><span className="block font-bold">{c.search}</span><input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder={c.searchPh} className={`${inputClass} mt-1`} /></label>
        <label><span className="block font-bold">{c.needs}</span><select value={edu} onChange={(e) => setEdu(e.target.value as Edu | "")} className={`${inputClass} mt-1 !w-auto`}><option value="">{c.allEdu}</option>{(Object.keys(c.eduShort) as Edu[]).map((k) => <option key={k} value={k}>{c.eduShort[k]}</option>)}</select></label>
        {mine.size ? <label className="flex items-center gap-2 pb-3 font-bold"><input type="checkbox" checked={forMe} onChange={(e) => setForMe(e.target.checked)} className="h-5 w-5 accent-[var(--c-teal)]" />{c.forYou}</label> : null}
      </div>
      {shown.length === 0 ? <Empty>{c.none}</Empty> : (
        <ul className="mt-6 grid gap-4 md:grid-cols-2">{shown.map((k) => (
          <li key={k.id} className="guide-card p-4">
            <h2 className="text-xl">{pick(k.name, lang)}</h2>
            <p className="mt-1 text-sm font-bold text-terracotta">{c.needs}: {pick(EDU_LABEL[k.edu], lang)}</p>
            <p className="mt-2"><span className="font-bold">{c.day}: </span>{pick(k.day, lang)}</p>
            <p className="mt-2 text-sm text-muted">{c.pay}. {c.payNote}</p>
            <p className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm"><Ext href={onet(k.search)}>{c.lookup}</Ext><Ext href={youtubeSearch(`day in the life of a ${k.videos}`)}>{c.videos}</Ext></p>
            <p className="mt-2 text-sm"><FindLink q={`${k.name.en} internship job shadow volunteer for students`}>{c.find}</FindLink></p>
          </li>))}</ul>
      )}
      <p className="mt-6 text-sm"><Ext href="https://www.bls.gov/ooh/">{c.ooh}</Ext></p>
    </Head>
  );
}

export function QuizTool() {
  const c = useCopy(copy);
  const lang = useLang();
  const [ans, setAns] = useState<number[]>(() => Array(QUIZ.length).fill(0));
  const [done, setDone] = useState(false);
  const answered = ans.filter((x) => x > 0).length;
  const score = useMemo(() => { const s: Record<Riasec, number> = { R: 0, I: 0, A: 0, S: 0, E: 0, C: 0 }; QUIZ.forEach((q, i) => { s[q.code] += ans[i]; }); return s; }, [ans]);
  const top = (Object.keys(score) as Riasec[]).sort((a, b) => score[b] - score[a] || a.localeCompare(b)).slice(0, 3);
  const ranked = useMemo(() => [...CAREERS].map((k) => ({ k, s: (top.includes(k.codes[0]) ? score[k.codes[0]] * 2 : 0) + (top.includes(k.codes[1]) ? score[k.codes[1]] : 0) })).filter((x) => x.s > 0).sort((a, b) => b.s - a.s || a.k.id.localeCompare(b.k.id)).slice(0, 6), [score, top]);

  if (done) return (
    <Head title={c.rTitle} lead={c.rLead}>
      <ul className="mt-5 flex flex-wrap gap-3">{top.map((t) => <li key={t} className="guide-card px-4 py-3"><span className="font-display text-2xl font-semibold text-teal">{pick(RIASEC_NAMES[t], lang)}</span><span className="block text-sm text-muted">{score[t]} / 15</span></li>)}</ul>
      <h2 className="mt-8 border-b-[1.5px] border-ink pb-1 text-2xl">{c.careersFor}</h2>
      <ul className="mt-3 grid gap-3 md:grid-cols-2">{ranked.map(({ k }: { k: Career }) => <li key={k.id} className="guide-card p-4"><p className="font-bold">{pick(k.name, lang)}</p><p className="text-sm text-muted">{pick(EDU_LABEL[k.edu], lang)}</p><p className="mt-1 text-sm"><FindLink q={`${k.name.en} internship job shadow volunteer for students`}>{c.find}</FindLink></p></li>)}</ul>
      <p className="mt-4 flex flex-wrap gap-4"><Link href="/t/college/careers" className="font-bold text-teal underline underline-offset-4">{c.moreCareers}</Link><button onClick={() => { setDone(false); setAns(Array(QUIZ.length).fill(0)); }} className="font-bold text-teal underline underline-offset-4">{c.again}</button></p>
      <Callout>{c.quizNote}</Callout>
    </Head>
  );
  return (
    <Head title={c.qTitle} lead={c.qLead}>
      <p className="mt-3 font-bold" aria-live="polite">{c.progress(answered, QUIZ.length)}</p>
      <ol className="mt-4 space-y-4">{QUIZ.map((q, i) => (
        <li key={i}><fieldset className="guide-card p-4"><legend className="px-1 text-lg font-bold">{i + 1}. {pick(q.text, lang)}</legend>
          <div className="mt-2 flex flex-wrap gap-2">{c.scale.map((label, v) => <label key={v} className={`cursor-pointer rounded-md border-[1.5px] border-ink px-3 py-1.5 text-sm font-bold ${ans[i] === v + 1 ? "bg-ink text-paper" : "bg-surface hover:bg-sunken"}`}><input type="radio" name={`q${i}`} className="sr-only" checked={ans[i] === v + 1} onChange={() => setAns((a) => a.map((x, k) => (k === i ? v + 1 : x)))} />{label}</label>)}</div></fieldset></li>))}</ol>
      <button onClick={() => setDone(true)} disabled={answered < QUIZ.length} className={`${buttonClass.primary} mt-6`}>{c.see}</button>
    </Head>
  );
}

export function DayInLifeTool() {
  const c = useCopy(copy);
  const lang = useLang();
  const [q, setQ] = useState("");
  const nq = norm(q);
  return (
    <Head title={c.dTitle} lead={c.dLead}>
      <label className="mt-5 block max-w-sm"><span className="block font-bold">{c.search}</span><input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder={c.searchPh} className={`${inputClass} mt-1`} /></label>
      <ul className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{CAREERS.filter((k) => !nq || norm(k.name.en).includes(nq) || norm(k.name.es).includes(nq)).map((k) => <li key={k.id} className="guide-card flex items-center justify-between gap-3 p-3"><span className="font-bold">{pick(k.name, lang)}</span><Ext href={youtubeSearch(`day in the life of a ${k.videos}`)}>{c.watch}</Ext></li>)}</ul>
    </Head>
  );
}

export function MajorsTool() {
  const c = useCopy(copy);
  const lang = useLang();
  const [tag, setTag] = useState<Tag | "">("");
  const byId = new Map(CAREERS.map((k) => [k.id, k]));
  const shown = MAJORS.filter((m) => !tag || m.tags.includes(tag));
  return (
    <Head title={c.mTitle} lead={c.mLead} wide>
      <div className="mt-5"><Chips<Tag | ""> value={tag} onChange={setTag} label={c.ints} options={[{ id: "", label: c.all }, ...(Object.keys(c.tags) as Tag[]).map((t) => ({ id: t, label: c.tags[t] }))]} /></div>
      <ul className="mt-6 grid gap-4 md:grid-cols-2">{shown.map((m) => (
        <li key={m.id} className="guide-card p-4"><h2 className="text-xl">{pick(m.name, lang)}</h2><p className="mt-2"><span className="font-bold">{c.study}: </span>{pick(m.study, lang)}</p>
          <p className="mt-2 text-sm"><span className="font-bold">{c.leads}: </span>{m.leads.map((id) => byId.get(id)).filter((x): x is Career => !!x).map((k) => pick(k.name, lang)).join(", ")}</p></li>))}</ul>
      <p className="mt-6 max-w-prose text-sm text-muted">{c.where} <Ext href="https://nces.ed.gov/collegenavigator/">{c.nav}</Ext></p>
    </Head>
  );
}
