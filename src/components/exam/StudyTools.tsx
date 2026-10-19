"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { bankById } from "@/lib/exam/bank";
import { EXAMS, examPath } from "@/lib/exam/config";
import type { ExamId } from "@/lib/exam/types";
import { buildTest, newSession, openMistakes, skillStats } from "@/lib/exam/engine";
import { useLang } from "@/lib/i18n";
import { useCopy } from "@/lib/use-copy";
import { EmptyTrail } from "../art";
import { buttonClass, Page } from "../ui";
import { MathText } from "./MathText";
import { useExamData } from "./useExam";

const copy = {
  en: {
    mistakesTitle: "Mistake notebook", mistakesLead: "Every question you missed and have not gotten right since. Read why, then try them again.",
    empty: "No mistakes to review. Take a practice test and the questions you miss land here.", right: "Correct answer", why: "Why", gotIt: "I understand this one", practice: "Practice my mistakes",
    weakTitle: "Weak spot finder", weakLead: "Your skills from weakest to strongest, across all your practice. A skill needs at least 2 answers to show up.", none: "No data yet. Take the diagnostic first.",
    practiceSkill: "Practice this skill", sat: "SAT", answered: "answered",
  },
  es: {
    mistakesTitle: "Cuaderno de errores", mistakesLead: "Cada pregunta que fallaste y que no has acertado desde entonces. Lee por qué y vuelve a intentarlas.",
    empty: "No hay errores por revisar. Haz un examen de práctica y las preguntas que falles llegan aquí.", right: "Respuesta correcta", why: "Por qué", gotIt: "Ya entendí esta", practice: "Practicar mis errores",
    weakTitle: "Tus puntos débiles", weakLead: "Tus habilidades de la más débil a la más fuerte, con toda tu práctica. Una habilidad necesita al menos 2 respuestas para aparecer.", none: "Todavía no hay datos. Haz primero el diagnóstico.",
    practiceSkill: "Practicar esta habilidad", sat: "SAT", answered: "contestadas",
  },
};

function useStart() {
  const { setSession } = useExamData();
  const router = useRouter();
  const bank = bankById();
  return (qids: string[]) => {
    // A practice set stays inside one exam: the exam of the first question.
    const exam = bank.get(qids[0])?.exam;
    const same = qids.filter((id) => bank.get(id)?.exam === exam);
    if (!exam || !same.length) return;
    setSession(newSession(exam, "section", same, null));
    router.push(`${examPath(exam, "sections")}?go`);
  };
}

export function MistakesTool() {
  const c = useCopy(copy);
  const { attempts, dismissed, setDismissed } = useExamData();
  const bank = bankById();
  const start = useStart();
  const ids = openMistakes(attempts).filter((id) => !dismissed.includes(id) && bank.has(id));
  return (
    <Page>
      <h1 className="text-3xl sm:text-4xl">{c.mistakesTitle}</h1>
      <p className="mt-2 max-w-prose text-muted">{c.mistakesLead}</p>
      {ids.length === 0 ? (
        <div className="guide-card mt-6 flex max-w-xl items-center gap-5 p-5"><EmptyTrail className="h-24 w-36 shrink-0 text-ink" /><p className="text-lg">{c.empty}</p></div>
      ) : (
        <>
          <button onClick={() => start(ids.slice(0, 20))} className={`${buttonClass.primary} mt-5`}>{c.practice} ({Math.min(ids.length, 20)})</button>
          <ol className="mt-6 space-y-5">
            {ids.map((id) => {
              const q = bank.get(id)!;
              return (
                <li key={id} className="guide-card p-4 sm:p-5">
                  {q.passage ? <MathText text={q.passage} className="mb-2 text-muted" /> : null}
                  <MathText text={q.stem} />
                  <div className="mt-2"><b>{c.right}:</b> {q.type === "mc" ? <MathText text={`${q.answer}. ${q.choices![q.answer.charCodeAt(0) - 65]}`} className="inline" /> : q.answer}</div>
                  <div className="notebook mt-3 py-3 pr-3"><b>{c.why}</b><MathText text={q.explanation} /></div>
                  <button onClick={() => setDismissed([...dismissed, id])} className="mt-3 font-bold text-teal underline underline-offset-4">{c.gotIt}</button>
                </li>
              );
            })}
          </ol>
        </>
      )}
    </Page>
  );
}

export function WeakSpotsTool() {
  const c = useCopy(copy);
  const lang = useLang();
  const { attempts } = useExamData();
  const router = useRouter();
  const { setSession } = useExamData();
  const bank = bankById();
  const stats = skillStats(attempts);
  const practice = (exam: ExamId, section: string, skill: string) => {
    const qids = buildTest([...bank.values()], { exam, mode: "section", section, skill, count: 8 });
    if (!qids.length) return;
    setSession(newSession(exam, "section", qids, null));
    router.push(`${examPath(exam, "sections")}?go`);
  };
  return (
    <Page>
      <h1 className="text-3xl sm:text-4xl">{c.weakTitle}</h1>
      <p className="mt-2 max-w-prose text-muted">{c.weakLead}</p>
      {stats.length === 0 ? (
        <div className="guide-card mt-6 flex max-w-xl items-center gap-5 p-5"><EmptyTrail className="h-24 w-36 shrink-0 text-ink" />
          <div><p className="text-lg">{c.none}</p><Link href="/t/sat/diagnostic" className={`${buttonClass.primary} mt-3`}>{c.sat}</Link></div></div>
      ) : (
        <ul className="mt-6 max-w-2xl space-y-4">
          {stats.map((s) => {
            const name = `${EXAMS[s.exam].en} · ${EXAMS[s.exam].sections.find((x) => x.id === s.section)?.skills.find((x) => x.id === s.skill)?.[lang] ?? s.skill}`;
            return (
              <li key={`${s.exam}/${s.section}/${s.skill}`}>
                <div className="flex flex-wrap items-center justify-between gap-2 font-bold"><span>{name} <span className="font-normal text-muted">· {s.correct}/{s.total} {c.answered}</span></span>
                  <button onClick={() => practice(s.exam, s.section, s.skill)} className={`${buttonClass.quiet} !py-1`}>{c.practiceSkill}</button></div>
                <div className="mt-1 h-3 overflow-hidden rounded-full border-[1.5px] border-ink bg-sunken" aria-hidden="true">
                  <div className={`h-full ${s.pct >= 0.7 ? "bg-palm" : s.pct >= 0.4 ? "bg-marigold" : "bg-ruby"}`} style={{ width: `${Math.round(s.pct * 100)}%` }} />
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </Page>
  );
}
