"use client";
import { Check, X, Minus } from "lucide-react";
import { bankById } from "@/lib/exam/bank";
import { EXAMS, TSI_READY } from "@/lib/exam/config";
import { estimate, skillStats } from "@/lib/exam/engine";
import type { Attempt } from "@/lib/exam/types";
import { useLang } from "@/lib/i18n";
import { useCopy } from "@/lib/use-copy";
import { Stamp } from "../art";
import { buttonClass } from "../ui";
import { examCopy } from "./copy";
import { MathText } from "./MathText";
import { useExamData } from "./useExam";

/** Tells the server too, so a question two students flag leaves the shared bank. Best effort. */
function reportToBank(id: string) {
  if (!id.startsWith("ai-")) return;
  fetch("/api/report", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) }).catch(() => {});
}

export function Results({ attempt, auto = false, onAgain, onScores }: { attempt: Attempt; auto?: boolean; onAgain: () => void; onScores: () => void }) {
  const c = useCopy(examCopy);
  const lang = useLang();
  const { hidden, setHidden } = useExamData();
  const bank = bankById();
  const cfg = EXAMS[attempt.exam];
  const est = estimate(attempt.exam, attempt.items);
  const correct = attempt.items.filter((i) => i.correct).length;
  const stats = skillStats([attempt]);
  const skillName = (sec: string, id: string) => {
    const s = cfg.sections.find((x) => x.id === sec)?.skills.find((x) => x.id === id);
    return s ? s[lang] : id;
  };

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-6 sm:px-8 sm:py-10">
      <h1 className="text-3xl sm:text-4xl">{c.results}</h1>
      <p className="mt-1 text-muted">{c.mode[attempt.mode]} · {cfg[lang]}</p>
      {auto ? <p role="status" className="mt-3 font-bold text-ruby">{c.timesUp}</p> : null}

      <section className="guide-card contours mt-6 p-6" aria-live="polite">
        <p className="text-lg font-bold">{c.correctN(correct, attempt.items.length)}</p>
        <div className="mt-3 flex flex-wrap items-end gap-x-10 gap-y-3">
          {est.total !== null ? (
            <p><span className="block text-sm text-muted">{c.estScore} · {attempt.exam === "act" ? c.composite : c.total}</span><span className="font-display text-6xl font-semibold tabular-nums">{est.total}</span></p>
          ) : null}
          {est.sections.map((s) => (
            <p key={s.section}><span className="block text-sm text-muted">{cfg.sections.find((x) => x.id === s.section)?.[lang] ?? s.section} · {attempt.exam === "ap" ? c.ap.apScore : c.sectionScore}</span>
              <span className="font-display text-5xl font-semibold tabular-nums text-teal">{s.score}</span>
              <span className="ml-2 text-sm text-muted">{s.correct}/{s.total}</span></p>
          ))}
        </div>
        {attempt.exam === "tsi" && est.sections.length ? (
          <div className="mt-4">
            <ul className="flex flex-wrap gap-x-6 gap-y-1 font-bold">
              {est.sections.map((s) => { const line = TSI_READY[s.section as keyof typeof TSI_READY]; return <li key={s.section} className={s.score >= line ? "text-palm" : "text-terracotta"}>{cfg.sections.find((x) => x.id === s.section)?.[lang]}: {s.score >= line ? c.above : c.below} ({line})</li>; })}
            </ul>
            <p className="mt-1 max-w-prose text-sm text-muted">{c.tsiLine(TSI_READY.math, TSI_READY.elar)}</p>
          </div>
        ) : null}
        <p className="mt-4"><Stamp tone="terracotta">{c.estimateOnly}</Stamp></p>
      </section>

      {stats.length ? (
        <section className="mt-8">
          <h2 className="mb-3 text-2xl">{c.bySkill}</h2>
          <ul className="space-y-3">
            {[...stats].sort((a, b) => a.pct - b.pct).map((s) => (
              <li key={`${s.section}/${s.skill}`}>
                <div className="flex justify-between gap-3 font-bold"><span>{skillName(s.section, s.skill)}</span><span className="tabular-nums">{s.correct}/{s.total}</span></div>
                <div className="mt-1 h-3 overflow-hidden rounded-full border-[1.5px] border-ink bg-sunken" aria-hidden="true">
                  <div className={`h-full ${s.pct >= 0.7 ? "bg-palm" : s.pct >= 0.4 ? "bg-marigold" : "bg-ruby"}`} style={{ width: `${Math.round(s.pct * 100)}%` }} />
                </div>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <div className="mt-8 flex flex-wrap gap-3">
        <button onClick={onAgain} className={buttonClass.primary}>{c.again}</button>
        <button onClick={onScores} className={buttonClass.quiet}>{c.seeScores}</button>
      </div>

      <section className="mt-10">
        <h2 className="mb-1 text-2xl">{c.review}</h2>
        <p className="mb-4 text-sm text-muted">{c.madeByAi}</p>
        <ol className="space-y-6">
          {attempt.items.map((it, n) => {
            const q = bank.get(it.qid);
            if (!q) return null;
            const mine = it.answer;
            const status = !mine ? "skipped" : it.correct ? "correct" : "wrong";
            return (
              <li key={it.qid} className="guide-card p-4 sm:p-5">
                <p className={`flex items-center gap-2 font-bold ${status === "correct" ? "text-palm" : status === "wrong" ? "text-ruby" : "text-muted"}`}>
                  {status === "correct" ? <Check size={18} /> : status === "wrong" ? <X size={18} /> : <Minus size={18} />}
                  {n + 1}. {c[status]} <span className="font-normal text-muted">· {skillName(q.section, q.skill)}</span>
                </p>
                {q.passage ? <MathText text={q.passage} className="mt-2 text-muted" /> : null}
                <MathText text={q.stem} className="mt-2" />
                <p className="mt-3"><b>{c.yourAnswer}:</b> {q.type === "mc" ? (mine ? `${mine}. ${q.choices![mine.charCodeAt(0) - 65] ?? ""}` : c.unanswered) : mine || c.unanswered}</p>
                <div className="mt-1"><b>{c.correctAnswer}:</b> {q.type === "mc" ? <MathText text={`${q.answer}. ${q.choices![q.answer.charCodeAt(0) - 65]}`} className="inline" /> : q.answer}</div>
                <div className="notebook mt-3 py-3 pr-3"><b>{c.why}</b><MathText text={q.explanation} /></div>
                <div className="mt-3 text-sm">
                  {hidden.includes(q.id) ? <span className="text-muted">{c.reported}</span>
                    : <button onClick={() => { setHidden([...hidden, q.id]); reportToBank(q.id); }} className="font-bold text-teal underline underline-offset-4">{c.report}</button>}
                </div>
              </li>
            );
          })}
        </ol>
      </section>
    </div>
  );
}
