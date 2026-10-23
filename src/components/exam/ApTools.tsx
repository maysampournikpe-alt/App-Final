"use client";
import Link from "next/link";
import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { CalendarCheck, Check, ClipboardCheck, Crown, ExternalLink, FileText, Flame, Gauge, Languages, Layers, Lightbulb, ListChecks, Route, Target, Timer, Zap } from "lucide-react";
import { diffDays, formatDay, isValidISO, today } from "@/lib/dates";
import { AP_ALL_COURSES, apScore } from "@/lib/exam/ap";
import { EXAMS, examPath } from "@/lib/exam/config";
import type { ExamId } from "@/lib/exam/types";
import { skillStats, topicStats } from "@/lib/exam/engine";
import { reviewQueue } from "@/lib/review";
import { useLang } from "@/lib/i18n";
import { useLocalDoc } from "@/lib/local-doc";
import { levelName, levelOf } from "@/lib/progress";
import { useCopy } from "@/lib/use-copy";
import { streakOf } from "@/lib/xp";
import { buttonClass, inputClass, Page } from "../ui";
import { examCopy } from "./copy";
import { TrademarkNote } from "./TrademarkNote";
import { levelOfProg, usePathProgress, useCourse, useXp } from "./useAp";
import { useExamData } from "./useExam";

const NO_COURSES: string[] = [];
const NO_DATES: Record<string, string> = {};

/** Pick your AP courses. Saved on the device and synced to the account. */
export function ApCoursesTool() {
  const c = useCopy(examCopy);
  const lang = useLang();
  const [picked, setPicked] = useLocalDoc<string[]>("ap-courses", NO_COURSES);
  const toggle = (id: string) => setPicked(picked.includes(id) ? picked.filter((x) => x !== id) : [...picked, id]);
  const [find, setFind] = useState("");
  const needle = find.trim().toLowerCase();
  const shown = AP_ALL_COURSES.filter((course) => !needle || course.en.toLowerCase().includes(needle) || course.es.toLowerCase().includes(needle));
  return (
    <Page>
      <h1 className="text-3xl sm:text-4xl">{c.ap.picked}</h1>
      <p className="mt-2 max-w-prose text-muted">{c.ap.pickLead}</p>
      <label className="mt-5 block max-w-md"><span className="block font-bold">{lang === "es" ? "Buscar un curso" : "Find a course"}</span>
        <input type="search" value={find} onChange={(e) => setFind(e.target.value)} className={`${inputClass} mt-1`} placeholder={lang === "es" ? "Por ejemplo: Biología" : "For example: Biology"} /></label>
      <p className="sr-only" aria-live="polite">{lang === "es" ? `${shown.length} cursos` : `${shown.length} courses`}</p>
      {!shown.length ? <p className="mt-4 text-muted">{lang === "es" ? "Ningún curso coincide." : "No course matches."}</p> : null}
      <ul className="mt-4 grid gap-2 sm:grid-cols-2">
        {shown.map((course) => {
          const on = picked.includes(course.id);
          return (
            <li key={course.id}>
              <label className={`flex cursor-pointer items-center gap-3 rounded-md border-[1.5px] border-ink p-3 ${on ? "bg-teal text-on-teal" : "bg-surface hover:bg-sunken"}`}>
                <input type="checkbox" checked={on} onChange={() => toggle(course.id)} className="peer sr-only" />
                <span aria-hidden className={`grid h-6 w-6 shrink-0 place-items-center rounded border-2 border-current peer-focus-visible:outline peer-focus-visible:outline-[3px] peer-focus-visible:outline-offset-2 peer-focus-visible:outline-[var(--c-focus)]`}>{on ? <Check size={16} strokeWidth={3} /> : null}</span>
                <span className="min-w-0 flex-1 font-bold">{course[lang]}</span>
              </label>
            </li>
          );
        })}
      </ul>
      {picked.length ? <Link href="/t/ap/dashboard" className={`${buttonClass.primary} mt-6`}>{c.ap.dashTitle}</Link> : null}
    </Page>
  );
}

const hub = {
  en: {
    course: "Course", section: "Section", cont: "Continue", allDone: "You passed every topic. Try a mock exam.", reviewH: "Review next", reviewLead: "The topics that will help you most right now.", noPicked: "Showing all AP courses. Pick yours on the course picker to see only those.",
    why: { retry: (p: number) => `You tried the quiz and scored ${p}%. Try again.`, weak: (p: number) => `Only ${p}% right in your practice.`, refresh: (d: number) => `Passed ${d} days ago. See it again so it sticks.` }, start: "Start the path", overall: (d: number, n: number) => `${d} of ${n} topics passed`, mastered: (n: number) => `${n} mastered`,
    tools: { path: "Study path", pathD: "Topic by topic, with videos, notes and a quiz", quiz: "Practice quizzes", quizD: "Any unit or topic, easy to hard", mock: "Mock exams", mockD: "Real length and pace", diag: "Diagnostic test", diagD: "Find your level and weak areas", strat: "Strategy guide", stratD: "Pacing, methods and test day", vocab: "Vocabulary", vocabD: "Key terms to test yourself", cram: "Cram sheet", cramD: "One page for the night before", flash: "Flashcards", flashD: "Your cards, on a spaced schedule", weak: "Weak spots", weakD: "What to review next", score: "Score estimate", scoreD: "Estimate only", plan: "Study plan", planD: "Spread every unit before exam day", res: "Official free prep", resD: "Links from the test makers" },
    units: "Units", skills: "Skills", unitDone: (d: number, n: number) => `${d} of ${n} topics`, study: "Study", quiz: "Quiz", topics: "Topics", recent: "Recent practice", noRecent: "No practice yet. Take a quiz or a mock exam and your results show up here.", pct: (a: number, b: number) => `${a} of ${b} right`,
    xpWord: "XP", dayStreak: (n: number) => `${n}-day streak`, estimate: "Estimate only, not an official score.", testDate: "Your test date", about: "About this test",
    lv: ["Not started", "Notes read", "Passed", "Mastered"], opens: "(opens in a new tab)",
  },
  es: {
    course: "Curso", section: "Sección", cont: "Continuar", allDone: "Aprobaste todos los temas. Prueba un examen de práctica.", reviewH: "Repasa después", reviewLead: "Los temas que más te ayudan ahora.", noPicked: "Se muestran todos los cursos AP. Elige los tuyos en el selector de cursos para ver solo esos.",
    why: { retry: (p: number) => `Hiciste el cuestionario y sacaste ${p}%. Inténtalo otra vez.`, weak: (p: number) => `Solo ${p}% correctas en tu práctica.`, refresh: (d: number) => `Lo aprobaste hace ${d} días. Vuélvelo a ver para que se quede.` }, start: "Empezar la ruta", overall: (d: number, n: number) => `${d} de ${n} temas aprobados`, mastered: (n: number) => `${n} dominados`,
    tools: { path: "Ruta de estudio", pathD: "Tema por tema, con videos, apuntes y cuestionario", quiz: "Cuestionarios de práctica", quizD: "Cualquier unidad o tema, de fácil a difícil", mock: "Exámenes de práctica", mockD: "Con la duración y el ritmo reales", diag: "Examen de diagnóstico", diagD: "Descubre tu nivel y tus puntos débiles", strat: "Guía de estrategia", stratD: "Ritmo, métodos y día del examen", vocab: "Vocabulario", vocabD: "Términos clave para ponerte a prueba", cram: "Hoja de repaso", cramD: "Una página para la noche anterior", flash: "Tarjetas", flashD: "Tus tarjetas, en un calendario espaciado", weak: "Puntos débiles", weakD: "Qué repasar después", score: "Puntaje estimado", scoreD: "Solo un estimado", plan: "Plan de estudio", planD: "Reparte cada unidad antes del examen", res: "Preparación oficial gratis", resD: "Enlaces de quienes hacen el examen" },
    units: "Unidades", skills: "Habilidades", unitDone: (d: number, n: number) => `${d} de ${n} temas`, study: "Estudiar", quiz: "Cuestionario", topics: "Temas", recent: "Práctica reciente", noRecent: "Todavía no has practicado. Haz un cuestionario o un examen de práctica y tus resultados aparecen aquí.", pct: (a: number, b: number) => `${a} de ${b} correctas`,
    xpWord: "XP", dayStreak: (n: number) => `Racha de ${n} días`, estimate: "Es solo un estimado, no un puntaje oficial.", testDate: "La fecha de tu examen", about: "Sobre este examen",
    lv: ["Sin empezar", "Apuntes leídos", "Aprobado", "Dominado"], opens: "(se abre en una pestaña nueva)",
  },
};

/** The home of each test: where you are, what to do next, and every study tool. Used for AP, SAT, PSAT, ACT and TSI. */
export function ExamHubTool({ track }: { track: ExamId }) {
  const c = useCopy(examCopy);
  const h = useCopy(hub);
  const lang = useLang();
  const params = useSearchParams();
  const ap = track === "ap";
  const cfg = EXAMS[track];
  const { course, list, hasPicked, setCurrent } = useCourse(track, params.get("course"));
  const { attempts } = useExamData();
  const { prog } = usePathProgress();
  const xp = useXp();
  const [apDates, setApDates] = useLocalDoc<Record<string, string>>("ap-exam-dates", NO_DATES);
  const [testDates, setTestDates] = useLocalDoc<Record<string, string>>("exam-dates", NO_DATES);
  const dates = ap ? apDates : testDates, setDates = ap ? setApDates : setTestDates;
  const dateKey = ap ? course.id : track;
  const mine = attempts.filter((a) => a.exam === track);
  const stats = skillStats(mine);
  const date = dates[dateKey] ?? "";
  const left = isValidISO(date) ? diffDays(today(), date) : null;
  const key = (id: string) => `${track}/${course.id}/${id}`;
  const topics = course.units.flatMap((u) => u.topics.map((t) => ({ u, t })));
  const passed = topics.filter(({ t }) => levelOfProg(prog[key(t.id)]) >= 2).length;
  const gold = topics.filter(({ t }) => levelOfProg(prog[key(t.id)]) >= 3).length;
  const next = topics.find(({ t }) => levelOfProg(prog[key(t.id)]) < 2);
  const tStats = topicStats(mine).filter((x) => x.section === course.id);
  const review = reviewQueue({ topicIds: topics.map(({ t }) => t.id), progOf: (id) => prog[key(id)], stats: tStats, today: today() });
  const lvl = levelOf(xp.xp);
  const recent = [...mine].filter((a) => a.items[0]?.section === course.id).sort((a, b) => b.finishedAt - a.finishedAt).slice(0, 5);
  const q = `?course=${course.id}`, base = `/t/${track}`;
  const tools = [
    { href: `${base}/path${q}`, Icon: Route, t: h.tools.path, d: h.tools.pathD },
    { href: `${base}/${ap ? "quizzes" : "sections"}${q}`, Icon: ListChecks, t: h.tools.quiz, d: h.tools.quizD },
    { href: `${base}/${ap ? "exam" : "full"}${q}`, Icon: Timer, t: h.tools.mock, d: h.tools.mockD },
    ...(ap ? [] : [{ href: `${base}/diagnostic`, Icon: ClipboardCheck, t: h.tools.diag, d: h.tools.diagD }, { href: `${base}/strategy`, Icon: Lightbulb, t: h.tools.strat, d: h.tools.stratD }]),
    { href: `${base}/vocab${q}`, Icon: Languages, t: h.tools.vocab, d: h.tools.vocabD },
    { href: `${base}/cram${q}`, Icon: FileText, t: h.tools.cram, d: h.tools.cramD },
    { href: ap ? "/t/ap/flash" : "/t/notes/flashcards", Icon: Layers, t: h.tools.flash, d: h.tools.flashD },
    { href: ap ? "/t/ap/weak" : examPath(track, "scores"), Icon: Target, t: h.tools.weak, d: h.tools.weakD },
    { href: ap ? "/t/ap/score" : examPath(track, "scores"), Icon: Gauge, t: h.tools.score, d: h.tools.scoreD },
    ...(ap ? [{ href: "/t/ap/plan", Icon: CalendarCheck, t: h.tools.plan, d: h.tools.planD }] : []),
    { href: examPath(track, "resources"), Icon: ExternalLink, t: h.tools.res, d: h.tools.resD },
  ];
  return (
    <Page>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <h1 className="text-3xl sm:text-4xl">{cfg[lang]}</h1>
        <div className="flex flex-wrap gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full border-[1.5px] border-ink bg-surface px-3 py-1 font-bold"><Zap size={16} aria-hidden />{xp.xp} {h.xpWord}</span>
          <span className="inline-flex items-center gap-1.5 rounded-full border-[1.5px] border-ink bg-surface px-3 py-1 font-bold"><Crown size={16} aria-hidden />{levelName(lvl.level)[lang]}</span>
          <span className="inline-flex items-center gap-1.5 rounded-full border-[1.5px] border-ink bg-surface px-3 py-1 font-bold"><Flame size={16} aria-hidden />{h.dayStreak(streakOf(xp.days, today()))}</span>
        </div>
      </div>
      {ap && !hasPicked ? <p className="mt-3 max-w-xl text-sm text-muted">{h.noPicked} <Link href="/t/ap/courses" className="font-bold text-teal underline underline-offset-4">{c.ap.picked}</Link></p> : null}

      <div className="mt-5 flex flex-wrap items-end gap-4">
        <label className="min-w-0 max-w-md flex-1"><span className="block font-bold">{ap ? h.course : h.section}</span>
          <select value={course.id} onChange={(e) => setCurrent(e.target.value)} className={`${inputClass} mt-1`}>{list.map((x) => <option key={x.id} value={x.id}>{x[lang]}</option>)}</select></label>
        <label className="text-sm"><span className="block font-bold">{ap ? c.ap.examDate : h.testDate}</span>
          <input type="date" value={date} onChange={(e) => setDates({ ...dates, [dateKey]: e.target.value })} className={`${inputClass} !w-auto !py-1.5`} /></label>
        {left !== null ? <p className="pb-2 font-bold text-terracotta" aria-live="polite">{c.ap.daysTo(left)}</p> : null}
      </div>

      <section className="guide-card mt-6 p-5" aria-labelledby="cont-h">
        <h2 id="cont-h" className="text-2xl">{course[lang]}</h2>
        <div className="mt-3 flex items-center gap-3">
          <div className="h-4 flex-1 overflow-hidden rounded-full border-[1.5px] border-ink bg-sunken" aria-hidden="true"><div className="h-full bg-teal" style={{ width: `${Math.round((passed / Math.max(1, topics.length)) * 100)}%` }} /></div>
          <p className="shrink-0 font-bold tabular-nums">{h.overall(passed, topics.length)}{gold ? ` · ${h.mastered(gold)}` : ""}</p>
        </div>
        <div className="mt-4">
          {next
            ? <Link href={`${base}/path?course=${course.id}&topic=${next.t.id}`} className={buttonClass.primary}>{passed ? h.cont : h.start}: {next.t.num} {next.t[lang]}</Link>
            : <p className="font-bold text-teal">{h.allDone}</p>}
        </div>
      </section>

      {review.length ? (
        <section className="mt-6" aria-labelledby="review-h">
          <h2 id="review-h" className="text-2xl">{h.reviewH}</h2>
          <p className="text-muted">{h.reviewLead}</p>
          <ul className="mt-3 grid gap-3 sm:grid-cols-2">
            {review.map((r) => {
              const t = topics.find((x) => x.t.id === r.topicId)!.t;
              const pct = Math.round(r.score * 100);
              const why = r.kind === "refresh" ? h.why.refresh(r.days ?? 7) : r.kind === "retry" ? h.why.retry(pct) : h.why.weak(pct);
              return (
                <li key={r.topicId} className="guide-card flex flex-col justify-between gap-2 p-4">
                  <p><span className="font-bold"><span className="mr-2 tabular-nums text-terracotta">{t.num}</span>{t[lang]}</span><span className="block text-sm text-muted">{why}</span></p>
                  <p className="flex gap-3">
                    <Link href={`${base}/path?course=${course.id}&topic=${t.id}`} className="font-bold text-teal underline underline-offset-4"><span aria-hidden>{h.study}</span><span className="sr-only">{h.study} {t.num} {t[lang]}</span></Link>
                    <Link href={`${base}/${ap ? "quizzes" : "sections"}?course=${course.id}&topic=${t.id}`} className="font-bold text-teal underline underline-offset-4"><span aria-hidden>{h.quiz}</span><span className="sr-only">{h.quiz} {t.num} {t[lang]}</span></Link>
                  </p>
                </li>
              );
            })}
          </ul>
        </section>
      ) : null}

      <ul className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {tools.map(({ href, Icon, t, d }) => (
          <li key={t}><Link href={href} className="guide-card flex h-full items-start gap-3 p-4 hover:bg-sunken"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-md border-[1.5px] border-ink bg-marigold text-on-marigold"><Icon size={20} aria-hidden /></span><span className="min-w-0"><span className="block font-bold">{t}</span><span className="block text-sm text-muted">{d}</span></span></Link></li>
        ))}
      </ul>

      <section className="mt-10" aria-labelledby="units-h">
        <h2 id="units-h" className="border-b-[1.5px] border-ink pb-1 text-2xl">{ap ? h.units : h.skills}</h2>
        <ol className="mt-3 divide-y-2 divide-dotted divide-line">
          {course.units.map((unit) => {
            const done = unit.topics.filter((t) => levelOfProg(prog[key(t.id)]) >= 2).length;
            const st = stats.find((x) => x.section === course.id && x.skill === unit.id);
            const uq = `?course=${course.id}&unit=${unit.id}`;
            return (
              <li key={unit.id} className="py-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="min-w-0 font-bold"><span className="mr-2 tabular-nums text-terracotta">{unit.no}</span>{unit[lang].replace(/^(Unit|Unidad) \d+:\s*/, "")}</p>
                  <div className="flex flex-wrap gap-2">
                    <Link href={`${base}/path${uq}`} className={`${buttonClass.quiet} !py-1`}><span aria-hidden>{h.study}</span><span className="sr-only">{h.study}: {unit[lang]}</span></Link>
                    <Link href={`${base}/${ap ? "quizzes" : "sections"}${uq}`} className={`${buttonClass.quiet} !py-1`}><span aria-hidden>{h.quiz}</span><span className="sr-only">{h.quiz}: {unit[lang]}</span></Link>
                  </div>
                </div>
                <div className="mt-2 flex items-center gap-3">
                  <div className="h-3 flex-1 overflow-hidden rounded-full border-[1.5px] border-ink bg-sunken" aria-hidden="true">
                    <div className="h-full bg-teal" style={{ width: `${Math.round((done / Math.max(1, unit.topics.length)) * 100)}%` }} /></div>
                  <span className="w-44 shrink-0 text-right text-sm text-muted">{h.unitDone(done, unit.topics.length)}{st ? ` · ${c.ap.acc}: ${st.correct}/${st.total}` : ""}</span>
                </div>
                <details className="mt-2">
                  <summary className="cursor-pointer font-bold text-teal">{h.topics} ({unit.topics.length})</summary>
                  <ul className="mt-2 space-y-1">
                    {unit.topics.map((t) => (
                      <li key={t.id} className="flex flex-wrap items-center justify-between gap-2 rounded-md px-1 py-1 hover:bg-sunken">
                        <span className="min-w-0"><span className="mr-2 tabular-nums text-terracotta">{t.num}</span>{t[lang]} <span className="text-sm text-muted">· {h.lv[levelOfProg(prog[key(t.id)])]}</span></span>
                        <span className="flex gap-2">
                          <Link href={`${base}/path?course=${course.id}&topic=${t.id}`} className="font-bold text-teal underline underline-offset-4"><span aria-hidden>{h.study}</span><span className="sr-only">{h.study} {t.num} {t[lang]}</span></Link>
                          <Link href={`${base}/${ap ? "quizzes" : "sections"}?course=${course.id}&topic=${t.id}`} className="font-bold text-teal underline underline-offset-4"><span aria-hidden>{h.quiz}</span><span className="sr-only">{h.quiz} {t.num} {t[lang]}</span></Link>
                        </span>
                      </li>
                    ))}
                  </ul>
                </details>
              </li>
            );
          })}
        </ol>
      </section>

      <section className="mt-10" aria-labelledby="recent-h">
        <h2 id="recent-h" className="border-b-[1.5px] border-ink pb-1 text-2xl">{h.recent}</h2>
        {recent.length ? (
          <ul className="mt-3 divide-y-2 divide-dotted divide-line">{recent.map((a) => {
            const ok = a.items.filter((i) => i.correct).length;
            return <li key={a.id} className="flex flex-wrap items-center justify-between gap-2 py-2"><span className="font-bold">{c.mode[a.mode]} <span className="font-normal text-muted">· {formatDay(new Date(a.finishedAt).toISOString().slice(0, 10), lang, false)}</span></span><span className="tabular-nums">{h.pct(ok, a.items.length)}{ap ? ` · AP ${apScore(ok / Math.max(1, a.items.length))}` : ""}</span></li>;
          })}</ul>
        ) : <p className="mt-3 max-w-prose text-muted">{h.noRecent}</p>}
        <p className="mt-2 text-sm text-muted">{h.estimate} {ap ? c.ap.mcOnly : ""}</p>
      </section>

      {!ap ? (
        <section className="mt-10" aria-labelledby="about-h"><h2 id="about-h" className="border-b-[1.5px] border-ink pb-1 text-2xl">{h.about}</h2>
          <ul className="mt-3 max-w-prose list-disc space-y-2 pl-6 text-lg marker:text-terracotta">{(c.facts[track] ?? []).map((f) => <li key={f}>{f}</li>)}</ul></section>
      ) : null}
      <TrademarkNote />
    </Page>
  );
}

export const ApDashboardTool = () => <ExamHubTool track="ap" />;
