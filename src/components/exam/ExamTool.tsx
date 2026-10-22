"use client";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { ExternalLink } from "lucide-react";
import { BANK, bankById } from "@/lib/exam/bank";
import { EXAMS, examPath } from "@/lib/exam/config";
import { buildTest, estimate, minutesFor, newSession, skillStats, type TestSpec } from "@/lib/exam/engine";
import type { Attempt, ExamId, Question } from "@/lib/exam/types";
import { formatDay } from "@/lib/dates";
import { useLang } from "@/lib/i18n";
import { useCopy } from "@/lib/use-copy";
import { buttonClass, inputClass, Page } from "../ui";
import { examCopy, type ExamCopy } from "./copy";
import { Results } from "./Results";
import { Runner } from "./Runner";
import { TrademarkNote } from "./TrademarkNote";
import { useExamData } from "./useExam";

export type ExamView = "overview" | "diagnostic" | "sections" | "full" | "scores" | "resources";

export function ExamTool({ exam, view }: { exam: ExamId; view: ExamView }) {
  const c = useCopy(examCopy);
  const lang = useLang();
  const cfg = EXAMS[exam];
  const { session, setSession, attempts, hidden } = useExamData();
  const [resultId, setResultId] = useState<string | null>(null);
  const [auto, setAuto] = useState(false);
  // The test is shown only after Start or Resume, so a paused test never blocks the other pages.
  const params = useSearchParams();
  const [open, setOpen] = useState(() => params.has("go")); // ?go means "a test was just started for you"
  const [notice, setNotice] = useState<string | null>(null);
  const router = useRouter();

  const usable = useMemo(() => BANK.filter((q) => q.exam === cfg.bank && !hidden.includes(q.id) && (!cfg.maxDifficulty || q.difficulty <= cfg.maxDifficulty)), [cfg, hidden]);
  const bank = bankById();

  const start = (spec: Omit<TestSpec, "exam">, timed: boolean) => {
    const qids = buildTest(usable, { ...spec, exam });
    if (!qids.length) return setNotice(c.bankEmpty);
    const minutes = minutesFor(exam, qids.map((id) => bank.get(id)!));
    setNotice(null);
    setResultId(null);
    setOpen(true);
    setSession(newSession(exam, spec.mode, qids, timed ? minutes : null));
  };

  if (session && session.exam === exam && open) {
    return <Runner session={session} onFinish={(id, wasAuto) => { setAuto(wasAuto); setResultId(id); setOpen(false); }} onExit={() => router.push(examPath(exam, "overview"))} />;
  }
  const result = resultId ? attempts.find((a) => a.id === resultId) : undefined;
  if (result) return <Results attempt={result} auto={auto} onAgain={() => setResultId(null)} onScores={() => { setResultId(null); router.push(examPath(exam, "scores")); }} />;

  if (!cfg.sections.length) return <Page><h1 className="text-3xl sm:text-4xl">{cfg[lang]}</h1><p className="mt-3 text-lg">{c.notReady}</p></Page>;

  return (
    <Page>
      <h1 className="text-3xl sm:text-4xl">{cfg[lang]}: {c[view]}</h1>
      {session && session.exam !== exam ? <p className="mt-3 font-bold">{c.resumeLead} <Link className="text-teal underline underline-offset-4" href={examPath(session.exam, "overview")}>{c.resume}</Link></p> : null}
      {session && session.exam === exam ? (
        <div role="region" aria-label={c.resume} className="guide-card mt-4 flex flex-wrap items-center gap-3 p-4">
          <p className="font-bold">{c.resumeLead}</p>
          <button onClick={() => setOpen(true)} className={buttonClass.primary}>{c.resume}</button>
          <button onClick={() => setSession(null)} className="font-bold text-teal underline underline-offset-4">{c.discard}</button>
        </div>
      ) : null}
      {notice ? <p role="alert" className="guide-card mt-4 p-4 font-bold">{notice}</p> : null}
      {view === "overview" ? <Overview exam={exam} c={c} total={usable.length} /> : null}
      {exam === "tsi" && view !== "overview" && view !== "scores" && view !== "resources" ? <p className="mt-3 text-muted">{c.realUntimed}</p> : null}
      {view === "diagnostic" ? <DiagnosticSetup c={c} total={usable.length} onStart={(timed) => start({ mode: "diagnostic" }, timed)} /> : null}
      {view === "sections" ? <SectionSetup exam={exam} c={c} onStart={(spec, timed) => start(spec, timed)} /> : null}
      {view === "full" ? <FullSetup exam={exam} c={c} usable={usable} onStart={(timed, section) => start({ mode: "full", section }, timed)} /> : null}
      {view === "scores" ? <Scores exam={exam} c={c} attempts={attempts.filter((a) => a.exam === exam)} onPractice={(section, skill) => start({ mode: "section", section, skill, count: 8 }, false)} onOpen={setResultId} /> : null}
      {view === "resources" ? <Resources c={c} exam={exam} /> : null}
    <TrademarkNote />
    </Page>
  );
}

function Overview({ exam, c, total }: { exam: ExamId; c: ExamCopy; total: number }) {
  return (
    <section className="mt-4">
      <h2 className="text-2xl">{c.factsTitle}</h2>
      <ul className="mt-3 max-w-prose list-disc space-y-2 pl-6 text-lg marker:text-terracotta">{(c.facts[exam] ?? []).map((f) => <li key={f}>{f}</li>)}</ul>
      <p className="mt-4 text-muted">{total ? c.bankNote(total) : c.bankEmpty}</p>
      <div className="mt-6 flex flex-wrap gap-3">
        <Link href={examPath(exam, "diagnostic")} className={buttonClass.primary}>{c.diagStart}</Link>
        <Link href={examPath(exam, "sections")} className={buttonClass.quiet}>{c.sections}</Link>
        <Link href={examPath(exam, "scores")} className={buttonClass.quiet}>{c.scores}</Link>
      </div>
    </section>
  );
}

function TimedChoice({ timed, setTimed, c }: { timed: boolean; setTimed: (v: boolean) => void; c: ExamCopy }) {
  return (
    <fieldset className="mt-5">
      <legend className="font-bold">{c.timing}</legend>
      <div className="mt-2 flex flex-wrap gap-2">
        {[true, false].map((v) => (
          <label key={String(v)} className="cursor-pointer">
            <input type="radio" name="timed" checked={timed === v} onChange={() => setTimed(v)} className="peer sr-only" />
            <span className="inline-block rounded-md border-[1.5px] border-ink bg-surface px-4 py-2 font-bold peer-checked:bg-ink peer-checked:text-paper peer-focus-visible:outline peer-focus-visible:outline-[3px] peer-focus-visible:outline-offset-2 peer-focus-visible:outline-[var(--c-focus)]">{v ? c.timed : c.untimed}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

function DiagnosticSetup({ c, total, onStart }: { c: ExamCopy; total: number; onStart: (timed: boolean) => void }) {
  const [timed, setTimed] = useState(false);
  return (
    <section className="mt-4 max-w-xl">
      <p className="text-lg">{c.diagLead}</p>
      <p className="mt-2 text-muted">{c.madeByAi}</p>
      <TimedChoice timed={timed} setTimed={setTimed} c={c} />
      <button disabled={!total} onClick={() => onStart(timed)} className={`${buttonClass.primary} mt-6`}>{c.diagStart}</button>
    </section>
  );
}

function SectionSetup({ exam, c, onStart }: { exam: ExamId; c: ExamCopy; onStart: (spec: Omit<TestSpec, "exam">, timed: boolean) => void }) {
  const lang = useLang();
  const cfg = EXAMS[exam];
  const [section, setSection] = useState(cfg.sections[0].id);
  const [skill, setSkill] = useState("");
  const [count, setCount] = useState(10);
  const [timed, setTimed] = useState(false);
  const sec = cfg.sections.find((s) => s.id === section)!;
  return (
    <section className="mt-4 max-w-xl">
      <p className="text-lg">{c.sectionLead}</p>
      <div className="mt-5 grid gap-4 sm:grid-cols-3">
        <label><span className="block font-bold">{c.section}</span>
          <select value={section} onChange={(e) => { setSection(e.target.value); setSkill(""); }} className={`${inputClass} mt-1`}>{cfg.sections.map((s) => <option key={s.id} value={s.id}>{s[lang]}</option>)}</select></label>
        <label><span className="block font-bold">{c.skill}</span>
          <select value={skill} onChange={(e) => setSkill(e.target.value)} className={`${inputClass} mt-1`}><option value="">{c.anySkill}</option>{sec.skills.map((s) => <option key={s.id} value={s.id}>{s[lang]}</option>)}</select></label>
        <label><span className="block font-bold">{c.howMany}</span>
          <select value={count} onChange={(e) => setCount(Number(e.target.value))} className={`${inputClass} mt-1`}>{[5, 10, 20, 999].map((n) => <option key={n} value={n}>{n === 999 ? c.all : n}</option>)}</select></label>
      </div>
      <TimedChoice timed={timed} setTimed={setTimed} c={c} />
      <button onClick={() => onStart({ mode: "section", section, skill: skill || undefined, count }, timed)} className={`${buttonClass.primary} mt-6`}>{c.start}</button>
    </section>
  );
}

function FullSetup({ exam, c, usable, onStart }: { exam: ExamId; c: ExamCopy; usable: Question[]; onStart: (timed: boolean, section?: string) => void }) {
  const lang = useLang();
  const cfg = EXAMS[exam];
  const [timed, setTimed] = useState(cfg.realTimed !== false);
  const [course, setCourse] = useState(cfg.sections[0]?.id ?? "");
  const pool = exam === "ap" ? usable.filter((q) => q.section === course) : usable;
  const n = exam === "ap" ? Math.min(pool.length, cfg.sections.find((s) => s.id === course)?.questions ?? pool.length) : pool.length;
  const perQ = exam === "ap" ? 80 / 55 : cfg.sections.reduce((m, s) => m + s.minutes, 0) / cfg.sections.reduce((m, s) => m + s.questions, 0);
  const minutes = Math.round(n * perQ);
  return (
    <section className="mt-4 max-w-xl">
      <p className="text-lg">{exam === "ap" ? c.ap.fullLead : c.fullLead}</p>
      {exam === "ap" ? (
        <label className="mt-4 block"><span className="block font-bold">{c.ap.course}</span>
          <select value={course} onChange={(e) => setCourse(e.target.value)} className={`${inputClass} mt-1`}>{cfg.sections.map((s) => <option key={s.id} value={s.id}>{s[lang]}</option>)}</select></label>
      ) : null}
      <p className="mt-2 text-muted">{c.fullNote(n)} {c.questionsN(n)} · {c.minutesN(minutes)}.</p>
      {exam === "ap" ? <p className="mt-2 text-sm text-muted">{c.ap.mcOnly}</p> : null}
      <TimedChoice timed={timed} setTimed={setTimed} c={c} />
      <button disabled={!n} onClick={() => onStart(timed, exam === "ap" ? course : undefined)} className={`${buttonClass.primary} mt-6`}>{c.start}</button>
    </section>
  );
}

function Scores({ exam, c, attempts, onPractice, onOpen }: { exam: ExamId; c: ExamCopy; attempts: Attempt[]; onPractice: (section: string, skill: string) => void; onOpen: (id: string) => void }) {
  const lang = useLang();
  const cfg = EXAMS[exam];
  const weak = skillStats(attempts).slice(0, 3);
  if (!attempts.length) return <p className="guide-card mt-6 max-w-xl p-5 text-lg">{c.noAttempts}</p>;
  const rows = [...attempts].sort((a, b) => a.finishedAt - b.finishedAt).map((a) => ({ a, e: estimate(exam, a.items), pct: a.items.filter((i) => i.correct).length / Math.max(1, a.items.length) }));
  const W = 320, H = 120, pad = 14;
  const pts = rows.map((r, i) => [pad + (rows.length === 1 ? (W - 2 * pad) / 2 : (i * (W - 2 * pad)) / (rows.length - 1)), H - pad - r.pct * (H - 2 * pad)] as const);
  return (
    <section className="mt-4">
      <h2 className="text-2xl">{c.trend}</h2>
      <svg viewBox={`0 0 ${W} ${H}`} className="mt-2 w-full max-w-md" role="img" aria-label={c.trend}>
        <line x1={pad} x2={W - pad} y1={H - pad} y2={H - pad} className="stroke-ink" strokeWidth="1.5" />
        <polyline points={pts.map((p) => p.join(",")).join(" ")} fill="none" className="stroke-teal" strokeWidth="3" strokeLinejoin="round" />
        {pts.map(([x, y], i) => <circle key={i} cx={x} cy={y} r="5" className="fill-surface stroke-ink" strokeWidth="2" />)}
      </svg>
      <p className="text-sm text-muted">{c.estimateOnly}</p>

      {weak.length ? (
        <div className="mt-8">
          <h2 className="text-2xl">{c.weakTitle}</h2>
          <p className="text-muted">{c.weakLead}</p>
          <ul className="mt-3 space-y-2">
            {weak.map((w) => (
              <li key={`${w.section}/${w.skill}`} className="flex flex-wrap items-center justify-between gap-3 border-b-2 border-dotted border-line pb-2">
                <span className="font-bold">{cfg.sections.find((s) => s.id === w.section)?.skills.find((s) => s.id === w.skill)?.[lang] ?? w.skill} <span className="font-normal text-muted">· {w.correct}/{w.total}</span></span>
                <button onClick={() => onPractice(w.section, w.skill)} className={`${buttonClass.quiet} !py-1.5`}>{c.practiceSkill}</button>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <h2 className="mt-8 text-2xl">{c.history}</h2>
      <ul className="mt-3 divide-y-2 divide-dotted divide-line border-y-[1.5px] border-ink">
        {[...rows].reverse().map(({ a, e }) => (
          <li key={a.id}>
            <button onClick={() => onOpen(a.id)} className="flex w-full flex-wrap items-center justify-between gap-2 py-3 text-left hover:bg-sunken sm:px-2">
              <span className="font-bold">{c.mode[a.mode]} <span className="font-normal text-muted">· {formatDay(new Date(a.finishedAt).toISOString().slice(0, 10), lang, false)}</span></span>
              <span className="tabular-nums">{a.items.filter((i) => i.correct).length}/{a.items.length}{e.total ? ` · ${e.total}` : ""}</span>
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}

function Resources({ c, exam }: { c: ExamCopy; exam: ExamId }) {
  return (
    <section className="mt-4 max-w-2xl">
      <p className="text-lg">{c.resourcesLead}</p>
      <ul className="mt-4 space-y-3">
        {(c.linksBy[exam] ?? []).map((l) => (
          <li key={l.href}><a href={l.href} target="_blank" rel="noopener noreferrer" className="guide-card flex items-center justify-between gap-3 p-4 font-bold text-teal hover:underline">{l.label}<ExternalLink size={18} className="shrink-0" /></a></li>
        ))}
      </ul>
    </section>
  );
}

