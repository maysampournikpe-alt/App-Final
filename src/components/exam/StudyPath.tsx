"use client";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { BookOpen, Check, Crown, RotateCcw, Star } from "lucide-react";
import { AP_COURSES, hasQuestions } from "@/lib/exam/ap";
import { BANK } from "@/lib/exam/bank";
import { EXAMS } from "@/lib/exam/config";
import type { ExamId, Question } from "@/lib/exam/types";
import type { Notes } from "@/lib/ai/learn";
import { today } from "@/lib/dates";
import { useLang } from "@/lib/i18n";
import { useLocalDoc } from "@/lib/local-doc";
import { useCopy } from "@/lib/use-copy";
import { buttonClass, inputClass, Page } from "../ui";
import { MathText } from "./MathText";
import { useExamData } from "./useExam";

type Prog = { notes?: boolean; best?: number; tries?: number; at?: string };
const NO_PROG: Record<string, Prog> = {};
const NO_PICKED: string[] = [];
const PASS = 0.6, GOLD = 0.9, QUIZ_N = 5;

const copy = {
  en: {
    titles: { ap: "AP study path", sat: "SAT study path", psat: "PSAT study path", act: "ACT study path", tsi: "TSI study path" } as Record<string, string>,
    lead: "Work down the path one lesson at a time. Each lesson has short notes, then a quiz. Pass the quiz to climb to the next level.",
    course: "AP course", section: "Section", pick: "Pick AP courses", noPicked: "Showing all AP courses. Pick yours on the course picker to see only those.", upNext: "Up next", start: "Start", again: "Do it again",
    lvl: ["Not started", "Notes read", "Quiz passed", "Mastered"], units: (d: number, n: number) => `${d} of ${n} lessons passed`,
    back: "Back to the path", notes: "Notes", quiz: "Quiz", notesLoading: "Writing your notes…", quizLoading: "Getting your questions…", retry: "Try again", toQuiz: "Go to the quiz", summary: "The big picture", ideas: "Key ideas", terms: "Key terms", example: "Example", mistakes: "Common mistakes", selfCheck: "Ask yourself",
    notesNote: "These notes were written by an AI from the course outline and can have mistakes. Compare them with your class notes and the official course guide.", realNote: "Check the official guide for the full list of what is tested.", official: "Official course guides (CED)",
    qOf: (i: number, n: number) => `Question ${i} of ${n}`, check: "Check answer", next: "Next question", finish: "See my result", right: "Correct.", wrong: (a: string) => `Not quite. The answer is ${a}.`, explain: "Why",
    verified: "Checked question", aiChecked: "AI question, checked by a second AI. It can still be wrong.", choose: "Choose an answer",
    score: (a: number, b: number) => `You got ${a} of ${b}`, passed: "Lesson passed. Nice work.", tryAgain: "Not yet. Read the notes again and give it another try.", gold: "Mastered this lesson.", nextLesson: "Next lesson", errors: { rate_limited: "You have used a lot of lessons this hour. Take a break and try again in a few minutes.", busy: "The AI is busy. Try again in a minute.", slow: "That took too long. Try again.", unavailable: "AI lessons are not switched on in this version yet.", failed: "Something went wrong on our side. Try again in a minute.", offline: "You are offline. Lessons you opened before still work.", empty: "No questions are available for this lesson yet." } as Record<string, string>,
    source: "Practice questions come from our checked bank first. If a lesson needs more, an AI writes new original ones and a second AI checks them.",
  },
  es: {
    titles: { ap: "Ruta de estudio AP", sat: "Ruta de estudio SAT", psat: "Ruta de estudio PSAT", act: "Ruta de estudio ACT", tsi: "Ruta de estudio TSI" } as Record<string, string>,
    lead: "Avanza por la ruta una lección a la vez. Cada lección tiene apuntes cortos y luego un cuestionario. Pasa el cuestionario para subir al siguiente nivel.",
    course: "Curso AP", section: "Sección", pick: "Elegir cursos AP", noPicked: "Se muestran todos los cursos AP. Elige los tuyos en el selector de cursos para ver solo esos.", upNext: "Sigue", start: "Empezar", again: "Hacerlo otra vez",
    lvl: ["Sin empezar", "Apuntes leídos", "Cuestionario aprobado", "Dominado"], units: (d: number, n: number) => `${d} de ${n} lecciones aprobadas`,
    back: "Volver a la ruta", notes: "Apuntes", quiz: "Cuestionario", notesLoading: "Escribiendo tus apuntes…", quizLoading: "Preparando tus preguntas…", retry: "Intentar otra vez", toQuiz: "Ir al cuestionario", summary: "Visión general", ideas: "Ideas clave", terms: "Términos clave", example: "Ejemplo", mistakes: "Errores comunes", selfCheck: "Pregúntate",
    notesNote: "Estos apuntes los escribió una IA a partir del temario del curso y pueden tener errores. Compáralos con tus apuntes de clase y la guía oficial del curso.", realNote: "Consulta la guía oficial para ver todo lo que se evalúa.", official: "Guías oficiales del curso (CED)",
    qOf: (i: number, n: number) => `Pregunta ${i} de ${n}`, check: "Revisar respuesta", next: "Siguiente pregunta", finish: "Ver mi resultado", right: "Correcto.", wrong: (a: string) => `No exactamente. La respuesta es ${a}.`, explain: "Por qué",
    verified: "Pregunta revisada", aiChecked: "Pregunta de IA, revisada por una segunda IA. Aun así puede estar mal.", choose: "Elige una respuesta",
    score: (a: number, b: number) => `Lograste ${a} de ${b}`, passed: "Lección aprobada. Buen trabajo.", tryAgain: "Todavía no. Lee otra vez los apuntes y vuelve a intentarlo.", gold: "Dominaste esta lección.", nextLesson: "Siguiente lección", errors: { rate_limited: "Has usado muchas lecciones esta hora. Descansa y vuelve a intentar en unos minutos.", busy: "La IA está ocupada. Intenta de nuevo en un minuto.", slow: "Tardó demasiado. Intenta de nuevo.", unavailable: "Las lecciones con IA todavía no están activadas en esta versión.", failed: "Algo falló de nuestra parte. Intenta de nuevo en un minuto.", offline: "No tienes internet. Las lecciones que abriste antes siguen funcionando.", empty: "Todavía no hay preguntas para esta lección." } as Record<string, string>,
    source: "Las preguntas de práctica salen primero de nuestro banco revisado. Si una lección necesita más, una IA escribe preguntas originales nuevas y una segunda IA las revisa.",
  },
};

const levelOf = (p?: Prog) => (!p ? 0 : (p.best ?? 0) >= GOLD ? 3 : (p.best ?? 0) >= PASS ? 2 : p.notes ? 1 : 0);
const shuffle = <T,>(a: T[]) => { const b = [...a]; for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } return b; };

async function ask<T>(body: object): Promise<{ ok: true; data: T } | { ok: false; error: string }> {
  if (typeof navigator !== "undefined" && !navigator.onLine) return { ok: false, error: "offline" };
  try {
    const res = await fetch("/api/learn", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    const j = await res.json().catch(() => null);
    return res.ok && j?.ok ? { ok: true, data: j as T } : { ok: false, error: j?.error ?? "failed" };
  } catch { return { ok: false, error: navigator.onLine ? "failed" : "offline" }; }
}

export function StudyPathTool({ track }: { track: ExamId }) {
  const c = useCopy(copy);
  const lang = useLang();
  const cfg = EXAMS[track];
  const apiTrack = track === "psat" ? "sat" : track;
  const [picked] = useLocalDoc<string[]>("ap-courses", NO_PICKED);
  const [prog, setProg] = useLocalDoc<Record<string, Prog>>("path-progress", NO_PROG);
  const params = useSearchParams();
  const wantCourse = params.get("course"), wantUnit = params.get("unit");
  const apList = useMemo(() => { const mine = AP_COURSES.filter((x) => picked.includes(x.id) || x.id === wantCourse); return mine.length ? mine : AP_COURSES; }, [picked, wantCourse]);
  const sections = track === "ap" ? apList.map((x) => ({ id: x.id, label: x[lang], items: x.units.map((u) => ({ id: u.id, label: u[lang] })) })) : cfg.sections.map((x) => ({ id: x.id, label: x[lang], items: x.skills.map((k) => ({ id: k.id, label: k[lang] })) }));
  const [secId, setSecId] = useState(wantCourse ?? "");
  const sec = sections.find((s) => s.id === secId) ?? sections[0];
  const [open, setOpen] = useState<string | null>(wantUnit);
  const keyOf = (skill: string) => `${track}/${sec.id}/${skill}`;
  const done = sec.items.filter((i) => levelOf(prog[keyOf(i.id)]) >= 2).length;
  const next = sec.items.find((i) => levelOf(prog[keyOf(i.id)]) < 2)?.id;
  const rows = [0, 2.2, 3.5, 2.2, 0, -2.2, -3.5, -2.2];
  const item = open ? sec.items.find((i) => i.id === open) : undefined;
  if (open && item) {
    return <Lesson key={`${sec.id}/${open}`} track={track} apiTrack={apiTrack} section={sec.id} sectionLabel={sec.label} skill={item.id} label={item.label} prog={prog[keyOf(item.id)]} lang={lang}
      onProg={(p) => setProg((all) => ({ ...all, [keyOf(item.id)]: { ...all[keyOf(item.id)], ...p } }))} onBack={() => setOpen(null)}
      onNext={(() => { const i = sec.items.findIndex((x) => x.id === open); return i >= 0 && i < sec.items.length - 1 ? () => setOpen(sec.items[i + 1].id) : null; })()} />;
  }
  return (
    <Page>
      <h1 className="text-3xl sm:text-4xl">{c.titles[track]}</h1>
      <p className="mt-2 max-w-prose text-muted">{c.lead}</p>
      <div className="mt-5 flex flex-wrap items-end gap-4">
        <label className="min-w-0 max-w-md flex-1"><span className="block font-bold">{track === "ap" ? c.course : c.section}</span>
          <select value={sec.id} onChange={(e) => setSecId(e.target.value)} className={`${inputClass} mt-1`}>{sections.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}</select></label>
        <p className="pb-3 font-bold text-teal" aria-live="polite">{c.units(done, sec.items.length)}</p></div>
      {track === "ap" && !picked.length ? <p className="mt-2 text-sm text-muted">{c.noPicked} <Link href="/t/ap/courses" className="font-bold text-teal underline underline-offset-4">{c.pick}</Link></p> : null}
      {track === "ap" ? <p className="mt-2 text-sm"><a href="https://apcentral.collegeboard.org/courses" target="_blank" rel="noopener noreferrer" className="font-bold text-teal underline underline-offset-4">{c.official}<span className="sr-only"> (opens in a new tab)</span></a></p> : null}
      {track === "ap" && !hasQuestions(sec.id) ? <p className="mt-2 text-sm text-muted">{c.source}</p> : null}
      <ol className="mx-auto mt-8 max-w-xl">
        {sec.items.map((it, i) => {
          const lvl = levelOf(prog[keyOf(it.id)]);
          const Icon = lvl === 3 ? Crown : lvl === 2 ? Check : lvl === 1 ? BookOpen : Star;
          const isNext = it.id === next;
          return (
            <li key={it.id} className="relative" style={{ paddingLeft: `${Math.max(0, rows[i % rows.length]) * 1.5}rem`, paddingRight: `${Math.max(0, -rows[i % rows.length]) * 1.5}rem`, textAlign: rows[i % rows.length] < 0 ? "right" : "left" }}>
              <button onClick={() => setOpen(it.id)}
                className={`group inline-flex max-w-full items-center gap-4 rounded-full py-2 ${rows[i % rows.length] < 0 ? "flex-row-reverse text-right" : "text-left"}`}>
                <span className={`grid h-16 w-16 shrink-0 place-items-center rounded-full border-[2px] border-ink shadow-[0_4px_0_0_var(--c-ink)] group-hover:translate-y-[1px] ${lvl === 3 ? "bg-marigold text-on-marigold" : lvl === 2 ? "bg-teal text-on-teal" : lvl === 1 ? "bg-sage text-ink" : isNext ? "bg-ruby text-on-ruby" : "bg-sunken text-ink"}`}><Icon size={26} strokeWidth={2} aria-hidden /></span>
                <span className="min-w-0"><span className="block font-bold group-hover:underline">{it.label}</span><span className="block text-sm text-muted">{isNext ? <span className="font-bold text-ruby">{c.upNext}</span> : c.lvl[lvl]}</span></span>
              </button>
              {i < sec.items.length - 1 ? <span aria-hidden className="mx-8 my-1 block h-6 w-[4px] trail-dots" /> : null}
            </li>
          );
        })}
      </ol>
    </Page>
  );
}

function Lesson({ track, apiTrack, section, sectionLabel, skill, label, prog, lang, onProg, onBack, onNext }: {
  track: ExamId; apiTrack: string; section: string; sectionLabel: string; skill: string; label: string; prog?: Prog; lang: "en" | "es";
  onProg: (p: Prog) => void; onBack: () => void; onNext: (() => void) | null;
}) {
  const c = useCopy(copy);
  const [step, setStep] = useState<"notes" | "quiz" | "result">("notes");
  const [score, setScore] = useState<{ right: number; n: number } | null>(null);
  return (
    <Page>
      <button onClick={onBack} className={buttonClass.quiet}>← {c.back}</button>
      <p className="mt-4 text-sm font-bold text-terracotta">{sectionLabel}</p>
      <h1 className="text-3xl sm:text-4xl">{label}</h1>
      <div className="mt-4 flex gap-2" role="tablist" aria-label={label}>
        {(["notes", "quiz"] as const).map((s) => <button key={s} role="tab" aria-selected={step === s || (s === "quiz" && step === "result")} onClick={() => setStep(s)} className={`rounded-full border-[1.5px] border-ink px-4 py-1.5 font-bold ${step === s || (s === "quiz" && step === "result") ? "bg-ink text-paper" : "bg-surface hover:bg-sunken"}`}>{s === "notes" ? c.notes : c.quiz}</button>)}
      </div>
      {step === "notes" ? <NotesView apiTrack={apiTrack} section={section} skill={skill} lang={lang} onRead={() => { if (!prog?.notes) onProg({ notes: true }); setStep("quiz"); }} /> : null}
      {step === "quiz" ? <QuizView track={track} apiTrack={apiTrack} section={section} skill={skill} lang={lang} onDone={(right, n) => { setScore({ right, n }); setStep("result"); onProg({ best: Math.max(prog?.best ?? 0, right / n), tries: (prog?.tries ?? 0) + 1, at: today(), notes: true }); }} /> : null}
      {step === "result" && score ? (
        <section className="guide-card mt-6 p-6" aria-live="polite">
          <p className="font-display text-3xl font-semibold">{c.score(score.right, score.n)}</p>
          <p className={`mt-2 text-lg font-bold ${score.right / score.n >= PASS ? "text-teal" : "text-ruby"}`}>{score.right / score.n >= GOLD ? c.gold : score.right / score.n >= PASS ? c.passed : c.tryAgain}</p>
          <div className="mt-4 flex flex-wrap gap-3">
            <button onClick={() => setStep("quiz")} className={buttonClass.secondary}><RotateCcw size={16} /> {c.again}</button>
            {score.right / score.n >= PASS && onNext ? <button onClick={onNext} className={buttonClass.primary}>{c.nextLesson}</button> : null}
            <button onClick={onBack} className={buttonClass.secondary}>{c.back}</button></div>
        </section>
      ) : null}
    </Page>
  );
}

const NO_NOTES: Record<string, Notes> = {};
function NotesView({ apiTrack, section, skill, lang, onRead }: { apiTrack: string; section: string; skill: string; lang: "en" | "es"; onRead: () => void }) {
  const c = useCopy(copy);
  const [cache, setCache] = useLocalDoc<Record<string, Notes>>(`learn-notes-${apiTrack}`, NO_NOTES);
  const key = `${section}/${skill}/${lang}`;
  const [state, setState] = useState<"loading" | "ready" | "error">("loading");
  const [err, setErr] = useState("failed");
  const [tick, setTick] = useState(0);
  const have = cache[key];
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- reading browser state or resetting for a retry; not derivable during render
    if (have) { setState("ready"); return; }
    let live = true;
    setState("loading");
    ask<{ notes: Notes }>({ track: apiTrack, section, skill, kind: "notes", lang }).then((r) => {
      if (!live) return;
      if (r.ok) { setCache((p) => { const keep = Object.keys(p).slice(-30); return { ...Object.fromEntries(keep.map((k) => [k, p[k]])), [key]: r.data.notes }; }); setState("ready"); } else { setErr(r.error); setState("error"); }
    });
    return () => { live = false; };
  }, [key, tick]); // eslint-disable-line react-hooks/exhaustive-deps
  if (state === "loading" && !have) return <p className="mt-6 text-lg text-muted" role="status">{c.notesLoading}</p>;
  if (state === "error" && !have) return <div className="mt-6"><p role="alert" className="font-bold text-ruby">{c.errors[err] ?? c.errors.failed}</p><button onClick={() => setTick(tick + 1)} className={`${buttonClass.secondary} mt-3`}>{c.retry}</button></div>;
  const n = have!;
  return (
    <article className="mt-6 space-y-6">
      <section className="guide-card p-5"><h2 className="text-xl">{c.summary}</h2><MathText text={n.summary} className="mt-1 text-lg" /></section>
      <section><h2 className="border-b-[1.5px] border-ink pb-1 text-2xl">{c.ideas}</h2><ul className="mt-2 list-disc space-y-1.5 pl-6 text-lg">{n.keyIdeas.map((k, i) => <li key={i}><MathText text={k} /></li>)}</ul></section>
      <section><h2 className="border-b-[1.5px] border-ink pb-1 text-2xl">{c.terms}</h2><dl className="mt-2 grid gap-x-6 gap-y-2 sm:grid-cols-2">{n.terms.map((t, i) => <div key={i} className="guide-card p-3"><dt className="font-bold">{t.term}</dt><dd><MathText text={t.meaning} /></dd></div>)}</dl></section>
      {n.example ? <section className="guide-card border-l-[6px] border-l-marigold p-5"><h2 className="text-xl">{c.example}: {n.example.title}</h2><MathText text={n.example.body} className="mt-1 text-lg" /></section> : null}
      <section><h2 className="border-b-[1.5px] border-ink pb-1 text-2xl">{c.mistakes}</h2><ul className="mt-2 list-disc space-y-1.5 pl-6 text-lg">{n.mistakes.map((k, i) => <li key={i}><MathText text={k} /></li>)}</ul></section>
      <section><h2 className="border-b-[1.5px] border-ink pb-1 text-2xl">{c.selfCheck}</h2><ul className="mt-2 list-disc space-y-1.5 pl-6 text-lg">{n.selfCheck.map((k, i) => <li key={i}><MathText text={k} /></li>)}</ul></section>
      <p className="text-sm text-muted">{c.notesNote} {c.realNote}</p>
      <button onClick={onRead} className={buttonClass.primary}>{c.toQuiz}</button>
    </article>
  );
}

const NO_QS: Record<string, Question[]> = {};
function QuizView({ track, apiTrack, section, skill, lang, onDone }: { track: ExamId; apiTrack: string; section: string; skill: string; lang: "en" | "es"; onDone: (right: number, n: number) => void }) {
  const c = useCopy(copy);
  const { hidden } = useExamData();
  const [cache, setCache] = useLocalDoc<Record<string, Question[]>>(`learn-qs-${apiTrack}`, NO_QS);
  const [qs, setQs] = useState<Question[] | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [tick, setTick] = useState(0);
  const [i, setI] = useState(0);
  const [pick, setPick] = useState<string | null>(null);
  const [checked, setChecked] = useState(false);
  const [right, setRight] = useState(0);
  const cfg = EXAMS[track];
  const key = `${section}/${skill}`;
  useEffect(() => {
    let live = true;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- reading browser state or resetting for a retry; not derivable during render
    setQs(null); setErr(null); setI(0); setPick(null); setChecked(false); setRight(0);
    const bank = shuffle(BANK.filter((q) => q.exam === cfg.bank && q.section === section && q.skill === skill && !hidden.includes(q.id) && q.type === "mc" && (!cfg.maxDifficulty || q.difficulty <= cfg.maxDifficulty))).slice(0, QUIZ_N);
    const need = QUIZ_N - bank.length;
    if (need <= 0) { setQs(bank); return; }
    const cached = shuffle(cache[key] ?? []).slice(0, need);
    const still = need - cached.length;
    const fill = () => { if (live) setQs(shuffle([...bank, ...cached])); };
    if (still <= 0 || (bank.length + cached.length >= 3 && !navigator.onLine)) { fill(); return () => { live = false; }; }
    ask<{ questions: Question[] }>({ track: apiTrack, section, skill, kind: "quiz", lang, count: Math.min(6, Math.max(3, still + 1)) }).then((r) => {
      if (!live) return;
      if (r.ok) {
        const fresh = r.data.questions.filter((q) => q.type === "mc" && q.choices?.length === 4);
        setCache((p) => ({ ...p, [key]: [...fresh, ...(p[key] ?? [])].slice(0, 12) }));
        const all = shuffle([...bank, ...cached, ...fresh.slice(0, still)]);
        if (all.length) setQs(all); else setErr("empty");
      } else if (bank.length + cached.length >= 2) setQs(shuffle([...bank, ...cached]));
      else setErr(r.error);
    });
    return () => { live = false; };
  }, [key, tick]); // eslint-disable-line react-hooks/exhaustive-deps
  if (err) return <div className="mt-6"><p role="alert" className="font-bold text-ruby">{c.errors[err] ?? c.errors.failed}</p><button onClick={() => setTick(tick + 1)} className={`${buttonClass.secondary} mt-3`}>{c.retry}</button></div>;
  if (!qs) return <p className="mt-6 text-lg text-muted" role="status">{c.quizLoading}</p>;
  const q = qs[i];
  const letter = (k: number) => "ABCD"[k];
  const last = i === qs.length - 1;
  const submit = () => { if (!pick) return; setChecked(true); if (pick === q.answer) setRight((r) => r + 1); };
  const advance = () => { if (last) onDone(right, qs.length); else { setI(i + 1); setPick(null); setChecked(false); } };
  return (
    <section className="mt-6" aria-label={c.quiz}>
      <p className="font-bold text-teal">{c.qOf(i + 1, qs.length)}</p>
      <div className="guide-card mt-2 p-5">
        {q.passage ? <MathText text={q.passage} className="mb-3 rounded-md border-l-[5px] border-l-line bg-sunken p-3 text-lg" /> : null}
        <MathText text={q.stem} className="text-xl font-semibold" />
        <fieldset className="mt-4"><legend className="sr-only">{c.choose}</legend>
          <div className="grid gap-2">{q.choices!.map((ch, k) => {
            const sel = pick === letter(k), correct = checked && letter(k) === q.answer, wrong = checked && sel && !correct;
            return <label key={k} className={`flex cursor-pointer items-start gap-3 rounded-md border-[1.5px] p-3 ${correct ? "border-palm bg-palm/15" : wrong ? "border-ruby bg-ruby/10" : sel ? "border-ink bg-sunken" : "border-line bg-surface hover:bg-sunken"}`}>
              <input type="radio" name={`q-${q.id}`} disabled={checked} checked={sel} onChange={() => setPick(letter(k))} className="mt-1.5 h-5 w-5 accent-[var(--c-teal)]" />
              <span className="font-bold">{letter(k)}.</span><MathText text={ch} className="min-w-0 flex-1" />{correct ? <Check size={18} aria-label={c.right} /> : null}</label>;
          })}</div></fieldset>
        {checked ? <div className="mt-4" aria-live="polite"><p className={`text-lg font-bold ${pick === q.answer ? "text-teal" : "text-ruby"}`}>{pick === q.answer ? c.right : c.wrong(q.answer)}</p><p className="mt-1 text-sm font-bold text-muted">{c.explain}</p><MathText text={q.explanation} className="text-lg" /></div> : null}
        <p className="mt-3 text-xs text-muted">{q.id.startsWith("ai-") ? c.aiChecked : c.verified}</p>
      </div>
      <div className="mt-4">{!checked ? <button disabled={!pick} onClick={submit} className={buttonClass.primary}>{c.check}</button> : <button onClick={advance} className={buttonClass.primary}>{last ? c.finish : c.next}</button>}</div>
    </section>
  );
}
