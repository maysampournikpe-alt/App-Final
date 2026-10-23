"use client";
import { useEffect, useMemo, useState } from "react";
import { Flag } from "lucide-react";
import { bankById } from "@/lib/exam/bank";
import { grade } from "@/lib/exam/engine";
import type { Question, Session } from "@/lib/exam/types";
import { useCopy } from "@/lib/use-copy";
import { buttonClass, inputClass } from "../ui";
import { Calculator } from "./Calculator";
import { examCopy } from "./copy";
import { MathText } from "./MathText";
import { useExamData } from "./useExam";

const mmss = (ms: number) => {
  const s = Math.max(0, Math.ceil(ms / 1000));
  const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60);
  return `${h ? `${h}:` : ""}${String(m).padStart(h ? 2 : 1, "0")}:${String(s % 60).padStart(2, "0")}`;
};

export function Runner({ session, onFinish, onExit }: { session: Session; onFinish: (attemptId: string, auto: boolean) => void; onExit: () => void }) {
  const c = useCopy(examCopy);
  const { setSession, attempts, setAttempts } = useExamData();
  const bank = bankById();
  const questions = useMemo(() => session.qids.map((id) => bank.get(id)).filter((q): q is Question => !!q), [session.qids, bank]);
  const [idx, setIdx] = useState(() => Math.max(0, questions.findIndex((q) => !session.answers[q.id])));
  const [now, setNow] = useState(() => Date.now());
  const [confirm, setConfirm] = useState(false);

  // Coming back to a paused test: the clock restarts from where it stopped.
  useEffect(() => {
    if (session.pausedRemainingMs != null) setSession({ ...session, endsAt: Date.now() + session.pausedRemainingMs, pausedRemainingMs: undefined });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const remaining = session.endsAt ? Math.max(0, session.endsAt - now) : null;
  const finish = (auto: boolean) => {
    const attempt = grade(bank, session);
    setAttempts([...attempts, attempt]);
    setSession(null);
    onFinish(attempt.id, auto);
  };

  useEffect(() => {
    if (!session.endsAt) return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [session.endsAt]);
  useEffect(() => {
    if (session.endsAt && now >= session.endsAt) finish(true); // auto-submit at zero
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [now, session.endsAt]);

  const q = questions[idx];
  if (!q) return null;
  const given = session.answers[q.id] ?? "";
  const flagged = session.flags.includes(q.id);
  const setAnswer = (v: string) => setSession({ ...session, answers: { ...session.answers, [q.id]: v } });
  const toggleFlag = () => setSession({ ...session, flags: flagged ? session.flags.filter((f) => f !== q.id) : [...session.flags, q.id] });
  const unanswered = questions.filter((x) => !session.answers[x.id]).length;
  const pause = () => {
    setSession({ ...session, endsAt: null, pausedRemainingMs: session.endsAt ? Math.max(0, session.endsAt - Date.now()) : undefined });
    onExit();
  };
  const low = remaining !== null && remaining <= 5 * 60_000;

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-5 sm:px-8">
      <div className="sticky top-14 z-20 -mx-4 flex flex-wrap items-center justify-between gap-3 border-b-[1.5px] border-ink bg-paper px-4 py-2 sm:-mx-8 sm:px-8 md:top-14">
        <p className="font-bold" aria-live="polite">{c.question} {idx + 1} {c.of} {questions.length}</p>
        <div className="flex items-center gap-3">
          {remaining !== null ? (
            <p role="timer" aria-label={c.timeLeft} className={`font-mono text-xl font-bold tabular-nums ${low ? "text-ruby" : ""}`}>
              {mmss(remaining)}{low ? <span className="sr-only"> {c.fiveMin}</span> : null}
            </p>
          ) : null}
          <button onClick={pause} className={`${buttonClass.quiet} !px-3 !py-1.5`}>{c.pauseExit}</button>
        </div>
      </div>
      {low ? <p role="status" className="mt-2 font-bold text-ruby">{c.fiveMin}</p> : null}

      <article className="mt-5" aria-labelledby="q-stem" data-qid={q.id}>
        {q.passage ? <MathText text={q.passage} className="guide-card mb-4 p-4 text-lg" /> : null}
        <MathText text={q.stem} className="text-lg sm:text-xl" />
        <div id="q-stem" className="sr-only">{c.question} {idx + 1}</div>

        {q.type === "mc" ? (
          <fieldset className="mt-5">
            <legend className="sr-only">{c.yourAnswer}</legend>
            <ul className="space-y-3">
              {q.choices!.map((choice, i) => {
                const letter = "ABCD"[i];
                const on = given === letter;
                return (
                  <li key={letter}>
                    <label className={`flex cursor-pointer items-start gap-3 rounded-xl border-[1.5px] border-ink p-3 ${on ? "bg-teal text-on-teal" : "bg-surface hover:bg-sunken"}`}>
                      <input type="radio" name={q.id} checked={on} onChange={() => setAnswer(letter)} className="peer sr-only" />
                      <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-full border-2 border-current font-bold peer-focus-visible:outline peer-focus-visible:outline-[3px] peer-focus-visible:outline-offset-2 peer-focus-visible:outline-[var(--c-focus)]`}>{letter}</span>
                      <MathText text={choice} className="min-w-0 flex-1 pt-0.5 text-lg" />
                    </label>
                  </li>
                );
              })}
            </ul>
          </fieldset>
        ) : (
          <div className="mt-5 max-w-sm">
            <label className="block font-bold" htmlFor="grid-in">{c.yourAnswer}</label>
            <input id="grid-in" value={given} onChange={(e) => setAnswer(e.target.value.slice(0, 12))} inputMode="decimal" autoComplete="off" className={`${inputClass} mt-1 font-mono text-xl`} />
            <p className="mt-1 text-sm text-muted">{c.gridHelp}</p>
          </div>
        )}
      </article>

      {q.section === "math" ? <div className="mt-6 max-w-md"><Calculator /></div> : null}

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
        <button onClick={toggleFlag} aria-pressed={flagged} className={`${buttonClass.quiet} ${flagged ? "bg-marigold text-on-marigold" : ""}`}><Flag size={18} />{flagged ? c.unflag : c.flag}</button>
        <div className="flex gap-3">
          <button onClick={() => setIdx(Math.max(0, idx - 1))} disabled={idx === 0} className={buttonClass.quiet}>{c.prev}</button>
          {idx < questions.length - 1
            ? <button onClick={() => setIdx(idx + 1)} className={buttonClass.secondary}>{c.next}</button>
            : <button onClick={() => setConfirm(true)} className={buttonClass.primary}>{c.finish}</button>}
        </div>
      </div>

      <nav aria-label={c.jump} className="mt-8 border-t-2 border-dotted border-line pt-4">
        <ol className="flex flex-wrap gap-2">
          {questions.map((x, i) => {
            const done = !!session.answers[x.id], fl = session.flags.includes(x.id);
            return (
              <li key={x.id}>
                <button onClick={() => setIdx(i)} aria-current={i === idx ? "step" : undefined}
                  aria-label={`${c.jump} ${i + 1}${done ? `, ${c.answered}` : ""}${fl ? `, ${c.flagged}` : ""}`}
                  className={`relative grid h-10 w-10 place-items-center rounded-xl border-[1.5px] border-ink font-bold ${i === idx ? "bg-ink text-paper" : done ? "bg-teal text-on-teal" : "bg-surface hover:bg-sunken"}`}>
                  {i + 1}{fl ? <span aria-hidden className="absolute -right-1 -top-1 h-3 w-3 rounded-full border-2 border-ink bg-marigold" /> : null}
                </button>
              </li>
            );
          })}
        </ol>
        <button onClick={() => setConfirm(true)} className="mt-4 font-bold text-teal underline underline-offset-4">{c.finish}</button>
      </nav>

      {confirm ? (
        <div role="dialog" aria-modal="true" aria-label={c.confirmFinish} className="fixed inset-0 z-50 grid place-items-center bg-ink/60 p-4">
          <div className="guide-card max-w-sm bg-surface p-6">
            <h2 className="text-2xl">{c.confirmFinish}</h2>
            <p className="mt-2">{c.unansweredN(unanswered)}</p>
            <div className="mt-5 flex flex-wrap gap-3">
              <button onClick={() => finish(false)} className={buttonClass.primary}>{c.yesFinish}</button>
              <button onClick={() => setConfirm(false)} className={buttonClass.quiet}>{c.keepGoing}</button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
