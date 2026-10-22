"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Eye, EyeOff, Printer } from "lucide-react";
import { bankById } from "@/lib/exam/bank";
import { gather } from "@/lib/exam/gather";
import { grade, newSession } from "@/lib/exam/engine";
import type { Cram } from "@/lib/ai/learn";
import { today } from "@/lib/dates";
import { useLang } from "@/lib/i18n";
import { useLocalDoc } from "@/lib/local-doc";
import { FLASHCARDS_KEY, newCard, NO_CARDS, type Card } from "@/lib/srs";
import { useCopy } from "@/lib/use-copy";
import { POINTS } from "@/lib/xp";
import { buttonClass, inputClass, Page } from "../ui";
import { MathText } from "./MathText";
import { Results } from "./Results";
import { Runner } from "./Runner";
import { TrademarkNote } from "./TrademarkNote";
import { useApCourse, useXp } from "./useAp";
import { useExamData } from "./useExam";

const copy = {
  en: {
    course: "AP course", unit: "Unit", whole: "The whole course", how: "How many questions", timing: "Timing", timed: "Timed", untimed: "No clock", start: "Start", resume: "Resume your test", resumeLead: "You have a test in progress.", discard: "Throw it away",
    quizTitle: "Practice quizzes", quizLead: "Pick a course, pick the whole course or one unit, and go. Every answer has an explanation.",
    mockTitle: "Mock exams", mockLead: "A multiple choice mock exam for one course. The questions come from all the units and the clock runs at about the real pace.",
    mockFull: (n: number, m: number) => `Full length: ${n} questions, about ${m} minutes`, mockHalf: (n: number, m: number) => `Half length: ${n} questions, about ${m} minutes`,
    mcOnly: "Practice here is multiple choice. The real exam also has free-response questions, which this app does not grade. Use the official free-response questions and scoring guides for those.",
    making: (a: number, b: number) => `Getting your questions… ${a} of ${b}`, noPicked: "Showing all AP courses. Pick yours on the course picker to see only those.",
    errors: { rate_limited: "You have used a lot of AI this hour. Take a break and try again in a few minutes.", busy: "The AI is busy. Try again in a minute.", slow: "That took too long. Try again.", unavailable: "AI question writing is not switched on in this version yet.", failed: "Something went wrong on our side. Try again in a minute.", offline: "You are offline. Questions already on this device still work.", empty: "Not enough questions are ready for this yet." } as Record<string, string>,
    short: (n: number, w: number) => `Only ${n} of ${w} questions could be made this time, so your test is shorter.`, aiNote: "Questions come from our checked bank first. Extra ones are written by an AI and checked by a second AI, so a few may still have mistakes. Report any you see.",
    vocabTitle: "Vocabulary", vocabLead: "The key terms for a unit. Hide the meanings and test yourself, then send them to your flashcards.", hide: "Hide meanings", show: "Show meanings", reveal: "Show meaning", addAll: "Add all to my flashcards", added: (n: number) => `${n} flashcards added.`, dup: "These terms are already in your flashcards.", loading: "Writing your list…", retry: "Try again",
    cramTitle: "Cram sheet", cramLead: "One page for the night before: what to know, the terms, the traps and the tips.", mustKnow: "Must know", terms: "Key terms", numbers: "Numbers, dates and formulas", traps: "Common traps", tips: "Exam tips", print: "Print this sheet", cramNote: "Written by an AI from the course outline. It can have mistakes, so compare it with your class notes and the official course guide.",
  },
  es: {
    course: "Curso AP", unit: "Unidad", whole: "Todo el curso", how: "Cuántas preguntas", timing: "Tiempo", timed: "Con tiempo", untimed: "Sin reloj", start: "Empezar", resume: "Seguir con tu examen", resumeLead: "Tienes un examen en progreso.", discard: "Tirarlo",
    quizTitle: "Cuestionarios de práctica", quizLead: "Elige un curso, elige todo el curso o una unidad, y listo. Cada respuesta tiene una explicación.",
    mockTitle: "Exámenes de práctica", mockLead: "Un examen de práctica de opción múltiple para un curso. Las preguntas vienen de todas las unidades y el reloj va a un ritmo parecido al real.",
    mockFull: (n: number, m: number) => `Largo completo: ${n} preguntas, unos ${m} minutos`, mockHalf: (n: number, m: number) => `Medio largo: ${n} preguntas, unos ${m} minutos`,
    mcOnly: "La práctica aquí es de opción múltiple. El examen real también tiene preguntas de respuesta escrita, que esta app no califica. Para esas, usa las preguntas oficiales y sus guías de calificación.",
    making: (a: number, b: number) => `Preparando tus preguntas… ${a} de ${b}`, noPicked: "Se muestran todos los cursos AP. Elige los tuyos en el selector de cursos para ver solo esos.",
    errors: { rate_limited: "Has usado mucha IA esta hora. Descansa y vuelve a intentar en unos minutos.", busy: "La IA está ocupada. Intenta de nuevo en un minuto.", slow: "Tardó demasiado. Intenta de nuevo.", unavailable: "La escritura de preguntas con IA todavía no está activada en esta versión.", failed: "Algo falló de nuestra parte. Intenta de nuevo en un minuto.", offline: "No tienes internet. Las preguntas que ya están en este dispositivo siguen funcionando.", empty: "Todavía no hay suficientes preguntas listas para esto." } as Record<string, string>,
    short: (n: number, w: number) => `Esta vez solo se pudieron hacer ${n} de ${w} preguntas, así que tu examen es más corto.`, aiNote: "Las preguntas salen primero de nuestro banco revisado. Las extra las escribe una IA y las revisa una segunda IA, así que algunas todavía pueden tener errores. Reporta las que veas.",
    vocabTitle: "Vocabulario", vocabLead: "Los términos clave de una unidad. Oculta los significados y ponte a prueba, y luego mándalos a tus tarjetas.", hide: "Ocultar significados", show: "Mostrar significados", reveal: "Mostrar significado", addAll: "Agregar todo a mis tarjetas", added: (n: number) => `${n} tarjetas agregadas.`, dup: "Estos términos ya están en tus tarjetas.", loading: "Escribiendo tu lista…", retry: "Intentar otra vez",
    cramTitle: "Hoja de repaso", cramLead: "Una página para la noche anterior: lo que debes saber, los términos, las trampas y los consejos.", mustKnow: "Lo que debes saber", terms: "Términos clave", numbers: "Números, fechas y fórmulas", traps: "Trampas comunes", tips: "Consejos para el examen", print: "Imprimir esta hoja", cramNote: "Escrita por una IA a partir del temario del curso. Puede tener errores, así que compárala con tus apuntes y la guía oficial del curso.",
  },
};

function useCourseUnit() {
  const params = useSearchParams();
  const wantUnit = params.get("unit");
  const ac = useApCourse(params.get("course"));
  const [unitId, setUnitId] = useState(() => (ac.course.units.some((u) => u.id === wantUnit) ? wantUnit! : ""));
  const unit = ac.course.units.find((u) => u.id === unitId);
  return { ...ac, unitId, unit, setUnitId };
}

function CourseSelect({ ac, withWhole, c }: { ac: ReturnType<typeof useCourseUnit>; withWhole: boolean; c: typeof copy.en }) {
  const lang = useLang();
  return (
    <div className="mt-5 grid max-w-2xl gap-4 sm:grid-cols-2">
      <label><span className="block font-bold">{c.course}</span>
        <select value={ac.course.id} onChange={(e) => { ac.setCurrent(e.target.value); ac.setUnitId(withWhole ? "" : (ac.list.find((x) => x.id === e.target.value)?.units[0].id ?? "")); }} className={`${inputClass} mt-1`}>{ac.list.map((x) => <option key={x.id} value={x.id}>{x[lang]}</option>)}</select></label>
      <label><span className="block font-bold">{c.unit}</span>
        <select value={ac.unitId || (withWhole ? "" : ac.course.units[0].id)} onChange={(e) => ac.setUnitId(e.target.value)} className={`${inputClass} mt-1`}>{withWhole ? <option value="">{c.whole}</option> : null}{ac.course.units.map((u) => <option key={u.id} value={u.id}>{u[lang]}</option>)}</select></label>
    </div>
  );
}

/** Practice quizzes and mock exams for every AP course. Questions come from the bank first, then from the AI (checked by a second AI). */
export function ApPracticeTool({ kind }: { kind: "quiz" | "mock" }) {
  const c = useCopy(copy);
  const lang = useLang();
  const router = useRouter();
  const ac = useCourseUnit();
  const xp = useXp();
  const { session, setSession, attempts, hidden } = useExamData();
  const [count, setCount] = useState(kind === "mock" ? 55 : 10);
  const [timed, setTimed] = useState(kind === "mock");
  const [open, setOpen] = useState(false);
  const [resultId, setResultId] = useState<string | null>(null);
  const [auto, setAuto] = useState(false);
  const [busy, setBusy] = useState<{ done: number; total: number } | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [note, setNote] = useState<string | null>(null);
  const perQ = 80 / 55;

  const begin = async () => {
    setErr(null); setNote(null);
    const units = kind === "quiz" && ac.unitId ? [ac.unitId] : ac.course.units.map((u) => u.id);
    const base = Math.floor(count / units.length), extra = count % units.length;
    const needs = units.map((skill, i) => ({ skill, n: base + (i < extra ? 1 : 0) })).filter((x) => x.n > 0);
    setBusy({ done: 0, total: count });
    const g = await gather({ exam: "ap", section: ac.course.id, needs, lang, hidden, onProgress: (done, total) => setBusy({ done, total }) });
    setBusy(null);
    if (g.questions.length < 3) return setErr(g.error ?? "empty");
    if (g.questions.length < count) setNote(c.short(g.questions.length, count));
    const qids = g.questions.map((q) => q.id);
    setResultId(null);
    setSession(newSession("ap", kind === "mock" ? "full" : "section", qids, timed ? Math.max(1, Math.round(qids.length * perQ)) : null));
    setOpen(true);
  };

  if (session && session.exam === "ap" && open) {
    return <Runner session={session} onExit={() => router.push("/t/ap/dashboard")}
      onFinish={(id, wasAuto) => {
        const a = grade(bankById(), session);
        xp.award(a.items.filter((i) => i.correct).length * POINTS.mock);
        setAuto(wasAuto); setResultId(id); setOpen(false);
      }} />;
  }
  const result = resultId ? attempts.find((a) => a.id === resultId) : undefined;
  if (result) return <Results attempt={result} auto={auto} onAgain={() => setResultId(null)} onScores={() => router.push("/t/ap/score")} />;

  const half = Math.round(55 / 2);
  return (
    <Page>
      <h1 className="text-3xl sm:text-4xl">{kind === "mock" ? c.mockTitle : c.quizTitle}</h1>
      <p className="mt-2 max-w-prose text-muted">{kind === "mock" ? c.mockLead : c.quizLead}</p>
      {session && session.exam === "ap" ? (
        <div role="region" aria-label={c.resume} className="guide-card mt-4 flex flex-wrap items-center gap-3 p-4">
          <p className="font-bold">{c.resumeLead}</p>
          <button onClick={() => setOpen(true)} className={buttonClass.primary}>{c.resume}</button>
          <button onClick={() => setSession(null)} className="font-bold text-teal underline underline-offset-4">{c.discard}</button>
        </div>
      ) : null}
      {!ac.hasPicked ? <p className="mt-2 text-sm text-muted">{c.noPicked}</p> : null}
      {kind === "quiz" ? <CourseSelect ac={ac} withWhole c={c} /> : (
        <label className="mt-5 block max-w-md"><span className="block font-bold">{c.course}</span>
          <select value={ac.course.id} onChange={(e) => ac.setCurrent(e.target.value)} className={`${inputClass} mt-1`}>{ac.list.map((x) => <option key={x.id} value={x.id}>{x[lang]}</option>)}</select></label>
      )}
      <fieldset className="mt-5"><legend className="font-bold">{c.how}</legend>
        <div className="mt-2 flex flex-wrap gap-2">
          {(kind === "mock" ? [55, half] : [10, 20, 30]).map((n) => (
            <label key={n} className="cursor-pointer"><input type="radio" name="count" checked={count === n} onChange={() => setCount(n)} className="peer sr-only" />
              <span className="inline-block rounded-md border-[1.5px] border-ink bg-surface px-4 py-2 font-bold peer-checked:bg-ink peer-checked:text-paper peer-focus-visible:outline peer-focus-visible:outline-[3px] peer-focus-visible:outline-offset-2 peer-focus-visible:outline-[var(--c-focus)]">{kind === "mock" ? (n === 55 ? c.mockFull(n, Math.round(n * perQ)) : c.mockHalf(n, Math.round(n * perQ))) : n}</span></label>
          ))}
        </div></fieldset>
      <fieldset className="mt-5"><legend className="font-bold">{c.timing}</legend>
        <div className="mt-2 flex flex-wrap gap-2">
          {[true, false].map((v) => (
            <label key={String(v)} className="cursor-pointer"><input type="radio" name="timed" checked={timed === v} onChange={() => setTimed(v)} className="peer sr-only" />
              <span className="inline-block rounded-md border-[1.5px] border-ink bg-surface px-4 py-2 font-bold peer-checked:bg-ink peer-checked:text-paper peer-focus-visible:outline peer-focus-visible:outline-[3px] peer-focus-visible:outline-offset-2 peer-focus-visible:outline-[var(--c-focus)]">{v ? c.timed : c.untimed}</span></label>
          ))}
        </div></fieldset>
      <p className="mt-4 max-w-prose text-sm text-muted">{c.mcOnly}</p>
      <p className="mt-1 max-w-prose text-sm text-muted">{c.aiNote}</p>
      <button disabled={!!busy} onClick={begin} className={`${buttonClass.primary} mt-6`}>{c.start}</button>
      {busy ? <p role="status" className="mt-4 font-bold text-teal">{c.making(busy.done, busy.total)}</p> : null}
      {err ? <p role="alert" className="mt-4 font-bold text-ruby">{c.errors[err] ?? c.errors.failed}</p> : null}
      {note ? <p role="status" className="mt-4 font-bold">{note}</p> : null}
    <TrademarkNote />
    </Page>
  );
}

const NO_CACHE: Record<string, never> = {};

/** Gets a unit-level AI document once, keeps it on the device, and lets the student retry on errors. */
function useLearned<T>(doc: string, key: string, body: object, field: "terms" | "cram") {
  const [cache, setCache] = useLocalDoc<Record<string, T>>(doc, NO_CACHE as Record<string, T>);
  const [err, setErr] = useState<string | null>(null);
  const [tick, setTick] = useState(0);
  const have = cache[key];
  useEffect(() => {
    if (have) return;
    let live = true;
    fetch("/api/learn", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) })
      .then((res) => res.json().then((j) => ({ res, j })).catch(() => ({ res, j: null })))
      .then(({ res, j }) => {
        if (!live) return;
        if (res.ok && j?.ok) setCache((p) => { const keep = Object.keys(p).slice(-40); return { ...Object.fromEntries(keep.map((k) => [k, p[k]])), [key]: j[field] as T }; });
        else setErr(j?.error ?? "failed");
      })
      .catch(() => { if (live) setErr(navigator.onLine ? "failed" : "offline"); });
    return () => { live = false; };
  }, [key, tick]); // eslint-disable-line react-hooks/exhaustive-deps
  return { data: have as T | undefined, err, retry: () => { setErr(null); setTick((t) => t + 1); } };
}

type Term = { term: string; meaning: string };

export function ApVocabTool() {
  const c = useCopy(copy);
  const lang = useLang();
  const ac = useCourseUnit();
  const unit = ac.unit ?? ac.course.units[0];
  const [hideAll, setHideAll] = useState(false);
  const [shown, setShown] = useState<string[]>([]);
  const [cards, setCards] = useLocalDoc<Card[]>(FLASHCARDS_KEY, NO_CARDS);
  const [msg, setMsg] = useState("");
  const { data, err, retry } = useLearned<Term[]>("ap-vocab", `${ac.course.id}/${unit.id}/${lang}`, { track: "ap", section: ac.course.id, skill: unit.id, kind: "terms", lang }, "terms");
  const deck = `${ac.course.en}: ${unit.en}`.slice(0, 80);
  const addAll = () => {
    const fresh = (data ?? []).filter((t) => !cards.some((k) => k.deck === deck && k.front.toLowerCase() === t.term.toLowerCase()));
    if (!fresh.length) return setMsg(c.dup);
    setCards((p) => [...p, ...fresh.map((t) => newCard(t.term, t.meaning, deck, today()))]);
    setMsg(c.added(fresh.length));
  };
  return (
    <Page>
      <h1 className="text-3xl sm:text-4xl">{c.vocabTitle}</h1>
      <p className="mt-2 max-w-prose text-muted">{c.vocabLead}</p>
      {!ac.hasPicked ? <p className="mt-2 text-sm text-muted">{c.noPicked}</p> : null}
      <CourseSelect ac={ac} withWhole={false} c={c} />
      {!data && !err ? <p className="mt-6 text-lg text-muted" role="status">{c.loading}</p> : null}
      {err && !data ? <div className="mt-6"><p role="alert" className="font-bold text-ruby">{c.errors[err] ?? c.errors.failed}</p><button onClick={retry} className={`${buttonClass.secondary} mt-3`}>{c.retry}</button></div> : null}
      {data ? (
        <>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button onClick={() => { setHideAll(!hideAll); setShown([]); }} className={buttonClass.secondary}>{hideAll ? <Eye size={16} aria-hidden /> : <EyeOff size={16} aria-hidden />} {hideAll ? c.show : c.hide}</button>
            <button onClick={addAll} className={buttonClass.secondary}>{c.addAll}</button><span className="font-bold text-teal" role="status">{msg}</span>
          </div>
          <dl className="mt-4 grid gap-3 sm:grid-cols-2">
            {data.map((t) => {
              const open = !hideAll || shown.includes(t.term);
              return (
                <div key={t.term} className="guide-card p-4"><dt className="text-lg font-bold">{t.term}</dt>
                  <dd className="mt-1">{open ? <MathText text={t.meaning} /> : <button onClick={() => setShown((s) => [...s, t.term])} className="font-bold text-teal underline underline-offset-4">{c.reveal}<span className="sr-only"> {t.term}</span></button>}</dd></div>
              );
            })}
          </dl>
        </>
      ) : null}
    </Page>
  );
}

export function ApCramTool() {
  const c = useCopy(copy);
  const lang = useLang();
  const ac = useCourseUnit();
  const unit = ac.unit ?? ac.course.units[0];
  const { data, err, retry } = useLearned<Cram>("ap-cram", `${ac.course.id}/${unit.id}/${lang}`, { track: "ap", section: ac.course.id, skill: unit.id, kind: "cram", lang }, "cram");
  const list = (items: string[]) => <ul className="mt-2 list-disc space-y-1.5 pl-6 text-lg">{items.map((x, i) => <li key={i}><MathText text={x} /></li>)}</ul>;
  return (
    <Page>
      <h1 className="text-3xl sm:text-4xl">{c.cramTitle}</h1>
      <p className="mt-2 max-w-prose text-muted print:hidden">{c.cramLead}</p>
      {!ac.hasPicked ? <p className="mt-2 text-sm text-muted print:hidden">{c.noPicked}</p> : null}
      <div className="print:hidden"><CourseSelect ac={ac} withWhole={false} c={c} /></div>
      {!data && !err ? <p className="mt-6 text-lg text-muted" role="status">{c.loading}</p> : null}
      {err && !data ? <div className="mt-6"><p role="alert" className="font-bold text-ruby">{c.errors[err] ?? c.errors.failed}</p><button onClick={retry} className={`${buttonClass.secondary} mt-3`}>{c.retry}</button></div> : null}
      {data ? (
        <article className="mt-6 space-y-6">
          <p className="text-xl font-bold">{ac.course[lang]}: {unit[lang]}</p>
          <section><h2 className="border-b-[1.5px] border-ink pb-1 text-2xl">{c.mustKnow}</h2>{list(data.mustKnow)}</section>
          <section><h2 className="border-b-[1.5px] border-ink pb-1 text-2xl">{c.terms}</h2><dl className="mt-2 grid gap-x-6 gap-y-2 sm:grid-cols-2">{data.terms.map((t, i) => <div key={i} className="guide-card p-3"><dt className="font-bold">{t.term}</dt><dd><MathText text={t.meaning} /></dd></div>)}</dl></section>
          {data.numbers?.length ? <section><h2 className="border-b-[1.5px] border-ink pb-1 text-2xl">{c.numbers}</h2>{list(data.numbers)}</section> : null}
          <section><h2 className="border-b-[1.5px] border-ink pb-1 text-2xl">{c.traps}</h2>{list(data.traps)}</section>
          <section><h2 className="border-b-[1.5px] border-ink pb-1 text-2xl">{c.tips}</h2>{list(data.examTips)}</section>
          <p className="text-sm text-muted">{c.cramNote}</p>
          <button onClick={() => window.print()} className={`${buttonClass.secondary} print:hidden`}><Printer size={16} aria-hidden /> {c.print}</button>
        </article>
      ) : null}
    </Page>
  );
}
