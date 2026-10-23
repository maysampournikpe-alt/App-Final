"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Eye, EyeOff, Printer } from "lucide-react";
import { AP_UNASSESSED } from "@/lib/exam/ap";
import { bankById } from "@/lib/exam/bank";
import { apiTrack } from "@/lib/exam/courses";
import { EXAMS, examPath, sectionOf } from "@/lib/exam/config";
import { grade, newSession } from "@/lib/exam/engine";
import { gather } from "@/lib/exam/gather";
import { PICKABLE_LEVELS, type Level } from "@/lib/exam/levels";
import type { ExamId } from "@/lib/exam/types";
import type { Cram } from "@/lib/ai/learn";
import { today } from "@/lib/dates";
import { useLang } from "@/lib/i18n";
import { useLocalDoc } from "@/lib/local-doc";
import { FLASHCARDS_KEY, newCard, NO_CARDS, type Card } from "@/lib/srs";
import { useCopy } from "@/lib/use-copy";
import { errorText, useAiLimitText } from "@/lib/ai-limit";
import { POINTS } from "@/lib/xp";
import { buttonClass, inputClass, Page } from "../ui";
import { MathText } from "./MathText";
import { Results } from "./Results";
import { Runner } from "./Runner";
import { TrademarkNote } from "./TrademarkNote";
import { useCourse, useXp } from "./useAp";
import { useExamData } from "./useExam";

const copy = {
  en: {
    course: "AP course", section: "Section", unit: "Unit", skill: "Skill", whole: "The whole course", wholeSection: "The whole section", wholeUnit: "The whole unit", wholeSkill: "The whole skill", topic: "Topic (sub-unit)", how: "How many questions", timing: "Timing", timed: "Timed", untimed: "No clock", start: "Start", resume: "Resume your test", resumeLead: "You have a test in progress.", discard: "Throw it away",
    level: "Difficulty", levels: { easy: "Easy", medium: "Medium", hard: "Hard" } as Record<string, string>,
    levelHelp: { easy: "One idea and one step. Good for learning a topic.", medium: "Typical test questions.", hard: "Multi-step questions with close wrong choices." } as Record<string, string>,
    quizTitle: "Practice quizzes", quizLead: "Pick a section or course, then the whole thing, one unit or one topic. Choose how hard you want it. Every answer has an explanation.",
    mockTitle: "Mock exams", mockLead: "A mock exam for one section or course, at the real length and pace. The questions come from every unit.",
    mockFull: (n: number, m: number) => `Full length: ${n} questions, about ${m} minutes`, mockHalf: (n: number, m: number) => `Half length: ${n} questions, about ${m} minutes`,
    mcOnly: "Practice here is multiple choice. The real exam also has free-response questions, which this app does not grade. Use the official free-response questions and scoring guides for those.",
    making: (a: number, b: number) => `Getting your questions… ${a} of ${b}. Hard questions can take a moment.`, noPicked: "Showing all AP courses. Pick yours on the course picker to see only those.",
    errors: { rate_limited: "You have used a lot of AI this hour. Take a break and try again in a few minutes.", busy: "The AI is busy. Try again in a minute.", slow: "That took too long. Try again.", unavailable: "AI question writing is not switched on in this version yet.", failed: "Something went wrong on our side. Try again in a minute.", offline: "You are offline. Questions already on this device still work.", empty: "Not enough questions are ready for this yet." } as Record<string, string>,
    short: (n: number, w: number) => `Only ${n} of ${w} questions could be made this time, so your test is shorter.`, aiNote: "Questions come from our checked bank first. Extra ones are written by an AI and checked by a second AI, so a few may still have mistakes. Report any you see.",
    vocabTitle: "Vocabulary", vocabLead: "The key terms for a unit or a topic. Hide the meanings and test yourself, then send them to your flashcards.", hide: "Hide meanings", show: "Show meanings", reveal: "Show meaning", addAll: "Add all to my flashcards", added: (n: number) => `${n} flashcards added.`, dup: "These terms are already in your flashcards.", loading: "Writing your list…", retry: "Try again",
    cramTitle: "Cram sheet", cramLead: "One page for the night before: what to know, the terms, the traps and the tips.", mustKnow: "Must know", terms: "Key terms", numbers: "Numbers, dates and formulas", traps: "Common traps", tips: "Exam tips", print: "Print this sheet", cramNote: "Written by an AI from the course outline. It can have mistakes, so compare it with your class notes and the official guide.",
  },
  es: {
    course: "Curso AP", section: "Sección", unit: "Unidad", skill: "Habilidad", whole: "Todo el curso", wholeSection: "Toda la sección", wholeUnit: "Toda la unidad", wholeSkill: "Toda la habilidad", topic: "Tema (subunidad)", how: "Cuántas preguntas", timing: "Tiempo", timed: "Con tiempo", untimed: "Sin reloj", start: "Empezar", resume: "Seguir con tu examen", resumeLead: "Tienes un examen en progreso.", discard: "Tirarlo",
    level: "Dificultad", levels: { easy: "Fácil", medium: "Media", hard: "Difícil" } as Record<string, string>,
    levelHelp: { easy: "Una idea y un paso. Buena para aprender un tema.", medium: "Preguntas típicas del examen.", hard: "Preguntas de varios pasos con opciones muy parecidas." } as Record<string, string>,
    quizTitle: "Cuestionarios de práctica", quizLead: "Elige una sección o curso, y luego todo, una unidad o un tema. Elige qué tan difícil lo quieres. Cada respuesta tiene una explicación.",
    mockTitle: "Exámenes de práctica", mockLead: "Un examen de práctica de una sección o curso, con la duración y el ritmo reales. Las preguntas vienen de todas las unidades.",
    mockFull: (n: number, m: number) => `Largo completo: ${n} preguntas, unos ${m} minutos`, mockHalf: (n: number, m: number) => `Medio largo: ${n} preguntas, unos ${m} minutos`,
    mcOnly: "La práctica aquí es de opción múltiple. El examen real también tiene preguntas de respuesta escrita, que esta app no califica. Para esas, usa las preguntas oficiales y sus guías de calificación.",
    making: (a: number, b: number) => `Preparando tus preguntas… ${a} de ${b}. Las preguntas difíciles pueden tardar un poco.`, noPicked: "Se muestran todos los cursos AP. Elige los tuyos en el selector de cursos para ver solo esos.",
    errors: { rate_limited: "Has usado mucha IA esta hora. Descansa y vuelve a intentar en unos minutos.", busy: "La IA está ocupada. Intenta de nuevo en un minuto.", slow: "Tardó demasiado. Intenta de nuevo.", unavailable: "La escritura de preguntas con IA todavía no está activada en esta versión.", failed: "Algo falló de nuestra parte. Intenta de nuevo en un minuto.", offline: "No tienes internet. Las preguntas que ya están en este dispositivo siguen funcionando.", empty: "Todavía no hay suficientes preguntas listas para esto." } as Record<string, string>,
    short: (n: number, w: number) => `Esta vez solo se pudieron hacer ${n} de ${w} preguntas, así que tu examen es más corto.`, aiNote: "Las preguntas salen primero de nuestro banco revisado. Las extra las escribe una IA y las revisa una segunda IA, así que algunas todavía pueden tener errores. Reporta las que veas.",
    vocabTitle: "Vocabulario", vocabLead: "Los términos clave de una unidad o un tema. Oculta los significados y ponte a prueba, y luego mándalos a tus tarjetas.", hide: "Ocultar significados", show: "Mostrar significados", reveal: "Mostrar significado", addAll: "Agregar todo a mis tarjetas", added: (n: number) => `${n} tarjetas agregadas.`, dup: "Estos términos ya están en tus tarjetas.", loading: "Escribiendo tu lista…", retry: "Intentar otra vez",
    cramTitle: "Hoja de repaso", cramLead: "Una página para la noche anterior: lo que debes saber, los términos, las trampas y los consejos.", mustKnow: "Lo que debes saber", terms: "Términos clave", numbers: "Números, fechas y fórmulas", traps: "Trampas comunes", tips: "Consejos para el examen", print: "Imprimir esta hoja", cramNote: "Escrita por una IA a partir del temario. Puede tener errores, así que compárala con tus apuntes y la guía oficial.",
  },
};
type C = typeof copy.en;

/** Course, unit and topic pickers shared by the quiz, vocabulary and cram screens. A topic is a sub-unit (1.1, 1.2, ...). */
function useScope(track: ExamId, needUnit = false) {
  const params = useSearchParams();
  const ac = useCourse(track, params.get("course"));
  const [rawUnit, setUnitId] = useState(() => { const w = params.get("unit"); const t = params.get("topic"); const byTopic = t ? ac.course.units.find((u) => u.topics.some((x) => x.id === t))?.id : undefined; return byTopic ?? (ac.course.units.some((u) => u.id === w) ? w! : ""); });
  const [topicId, setTopicId] = useState(() => { const t = params.get("topic"); return t && ac.course.units.some((u) => u.topics.some((x) => x.id === t)) ? t : ""; });
  const unitId = rawUnit || (needUnit ? ac.course.units[0].id : "");
  const unit = ac.course.units.find((u) => u.id === unitId);
  const topic = unit?.topics.find((t) => t.id === topicId);
  return { ...ac, unitId, unit, topicId, topic, setUnitId: (id: string) => { setUnitId(id); setTopicId(""); }, setTopicId };
}
type Scope = ReturnType<typeof useScope>;

function Pickers({ track, sc, c, needUnit, withTopic = true }: { track: ExamId; sc: Scope; c: C; needUnit: boolean; withTopic?: boolean }) {
  const lang = useLang();
  const ap = track === "ap";
  const wholeLabel = ap ? c.whole : c.wholeSection;
  const unitWord = ap ? c.unit : c.skill;
  const unitValue = sc.unitId;
  const unit = sc.unit;
  return (
    <div className="mt-5 grid max-w-3xl gap-4 sm:grid-cols-3">
      <label><span className="block font-bold">{ap ? c.course : c.section}</span>
        <select value={sc.course.id} onChange={(e) => { sc.setCurrent(e.target.value); sc.setUnitId(""); }} className={`${inputClass} mt-1`}>{sc.list.map((x) => <option key={x.id} value={x.id}>{x[lang]}</option>)}</select></label>
      <label><span className="block font-bold">{unitWord}</span>
        <select value={unitValue} onChange={(e) => sc.setUnitId(e.target.value)} className={`${inputClass} mt-1`}>{needUnit ? null : <option value="">{wholeLabel}</option>}{sc.course.units.map((u) => <option key={u.id} value={u.id}>{u[lang]}</option>)}</select></label>
      {withTopic ? (
        <label><span className="block font-bold">{c.topic}</span>
          <select value={sc.topicId} disabled={!unit} onChange={(e) => sc.setTopicId(e.target.value)} className={`${inputClass} mt-1`}><option value="">{ap ? c.wholeUnit : c.wholeSkill}</option>{(unit?.topics ?? []).map((t) => <option key={t.id} value={t.id}>{t.num} {t[lang]}</option>)}</select></label>
      ) : null}
    </div>
  );
}

const Radio = ({ name, checked, onChange, children, title }: { name: string; checked: boolean; onChange: () => void; children: React.ReactNode; title?: string }) => (
  <label className="cursor-pointer" title={title}><input type="radio" name={name} checked={checked} onChange={onChange} className="peer sr-only" />
    <span className="inline-block rounded-xl border-[1.5px] border-ink bg-surface px-4 py-2 font-bold peer-checked:bg-ink peer-checked:text-paper peer-focus-visible:outline peer-focus-visible:outline-[3px] peer-focus-visible:outline-offset-2 peer-focus-visible:outline-[var(--c-focus)]">{children}</span></label>
);

/** Practice quizzes and mock exams for every test and AP course. Questions come from the bank first, then the AI (checked by a second AI). */
export function PracticeTool({ track, kind }: { track: ExamId; kind: "quiz" | "mock" }) {
  const c = useCopy(copy);
  const limit = useAiLimitText();
  const lang = useLang();
  const router = useRouter();
  const cfg = EXAMS[track];
  const sc = useScope(track);
  const xp = useXp();
  const { session, setSession, attempts, hidden } = useExamData();
  const params = useSearchParams();
  const sec = sectionOf(track, sc.course.id);
  const real = sec?.questions ?? 55;
  const [count, setCount] = useState(kind === "mock" ? -1 : 10); // -1 means "the real length"
  const [level, setLevel] = useState<Level>(PICKABLE_LEVELS.includes(params.get("level") as Level) ? (params.get("level") as Level) : "medium");
  const [timed, setTimed] = useState(kind === "mock" && cfg.realTimed !== false);
  const [open, setOpen] = useState(false);
  const [resultId, setResultId] = useState<string | null>(null);
  const [auto, setAuto] = useState(false);
  const [busy, setBusy] = useState<{ done: number; total: number } | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [note, setNote] = useState<string | null>(null);
  const levels = PICKABLE_LEVELS.filter((l) => !cfg.maxDifficulty || cfg.maxDifficulty >= 3 || l !== "hard");
  const perQ = sec ? sec.minutes / sec.questions : 1.5;
  const want = kind === "mock" ? (count === -1 ? real : count) : count;

  const begin = async () => {
    setErr(null); setNote(null);
    const needs = sc.topic && kind === "quiz" ? [{ skill: sc.unit!.id, topic: sc.topic.id, n: want }]
      : sc.unit && kind === "quiz" ? [{ skill: sc.unit.id, n: want }]
      : (() => { const units = sc.course.units.filter((x) => !(AP_UNASSESSED[sc.course.id] ?? []).includes(x.id));  const base = Math.floor(want / units.length), extra = want % units.length; return units.map((u, i) => ({ skill: u.id, n: base + (i < extra ? 1 : 0) })).filter((x) => x.n > 0); })();
    setBusy({ done: 0, total: want });
    const g = await gather({ exam: cfg.bank, section: sc.course.id, needs, lang, hidden, level: kind === "mock" ? "mixed" : level, maxDifficulty: cfg.maxDifficulty, onProgress: (done, total) => setBusy({ done, total }) });
    setBusy(null);
    if (g.questions.length < 3) return setErr(g.error ?? "empty");
    if (g.questions.length < want) setNote(c.short(g.questions.length, want));
    const qids = g.questions.map((q) => q.id);
    setResultId(null);
    setSession(newSession(track, kind === "mock" ? "full" : "section", qids, timed ? Math.max(1, Math.round(qids.length * perQ)) : null));
    setOpen(true);
  };

  if (session && session.exam === track && open) {
    return <Runner session={session} onExit={() => router.push(examPath(track, "overview"))}
      onFinish={(id, wasAuto) => {
        const a = grade(bankById(), session);
        xp.award(a.items.filter((i) => i.correct).length * POINTS.mock);
        setAuto(wasAuto); setResultId(id); setOpen(false);
      }} />;
  }
  const result = resultId ? attempts.find((a) => a.id === resultId) : undefined;
  if (result) return <Results attempt={result} auto={auto} onAgain={() => setResultId(null)} onScores={() => router.push(examPath(track, "scores"))} />;

  return (
    <Page>
      <h1 className="text-3xl sm:text-4xl">{cfg[lang]}: {kind === "mock" ? c.mockTitle : c.quizTitle}</h1>
      <p className="mt-2 max-w-prose text-muted">{kind === "mock" ? c.mockLead : c.quizLead}</p>
      {session && session.exam === track ? (
        <div role="region" aria-label={c.resume} className="guide-card mt-4 flex flex-wrap items-center gap-3 p-4">
          <p className="font-bold">{c.resumeLead}</p>
          <button onClick={() => setOpen(true)} className={buttonClass.primary}>{c.resume}</button>
          <button onClick={() => setSession(null)} className="font-bold text-teal underline underline-offset-4">{c.discard}</button>
        </div>
      ) : null}
      {track === "ap" && !sc.hasPicked ? <p className="mt-2 text-sm text-muted">{c.noPicked}</p> : null}
      {kind === "quiz"
        ? <Pickers track={track} sc={sc} c={c} needUnit={false} />
        : <label className="mt-5 block max-w-md"><span className="block font-bold">{track === "ap" ? c.course : c.section}</span>
          <select value={sc.course.id} onChange={(e) => { sc.setCurrent(e.target.value); setCount(-1); }} className={`${inputClass} mt-1`}>{sc.list.map((x) => <option key={x.id} value={x.id}>{x[lang]}</option>)}</select></label>}
      {kind === "quiz" ? <fieldset className="mt-5"><legend className="font-bold">{c.level}</legend>
        <div className="mt-2 flex flex-wrap gap-2">{levels.map((l) => <Radio key={l} name="level" checked={level === l} onChange={() => setLevel(l)} title={c.levelHelp[l]}>{c.levels[l]}</Radio>)}</div>
        <p className="mt-2 text-sm text-muted" aria-live="polite">{c.levelHelp[level]}</p></fieldset> : null}
      <fieldset className="mt-5"><legend className="font-bold">{c.how}</legend>
        <div className="mt-2 flex flex-wrap gap-2">
          {kind === "mock"
            ? [-1, Math.round(real / 2)].map((n) => <Radio key={n} name="count" checked={count === n} onChange={() => setCount(n)}>{n === -1 ? c.mockFull(real, Math.round(real * perQ)) : c.mockHalf(n, Math.round(n * perQ))}</Radio>)
            : [10, 20, 30].map((n) => <Radio key={n} name="count" checked={count === n} onChange={() => setCount(n)}>{n}</Radio>)}
        </div></fieldset>
      <fieldset className="mt-5"><legend className="font-bold">{c.timing}</legend>
        <div className="mt-2 flex flex-wrap gap-2">{[true, false].map((v) => <Radio key={String(v)} name="timed" checked={timed === v} onChange={() => setTimed(v)}>{v ? c.timed : c.untimed}</Radio>)}</div></fieldset>
      {track === "ap" ? <p className="mt-4 max-w-prose text-sm text-muted">{c.mcOnly}</p> : null}
      <p className="mt-2 max-w-prose text-sm text-muted">{c.aiNote}</p>
      <button disabled={!!busy} onClick={begin} className={`${buttonClass.primary} mt-6`}>{c.start}</button>
      {busy ? <p role="status" className="mt-4 font-bold text-teal">{c.making(busy.done, busy.total)}</p> : null}
      {err ? <p role="alert" className="mt-4 font-bold text-ruby">{errorText(c.errors, err, limit)}</p> : null}
      {note ? <p role="status" className="mt-4 font-bold">{note}</p> : null}
      <TrademarkNote />
    </Page>
  );
}

const NO_CACHE: Record<string, never> = {};

/** Gets a unit- or topic-level AI document once, keeps it on the device, and lets the student retry on errors. */
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
        if (res.ok && j?.ok) setCache((p) => { const keep = Object.keys(p).slice(-60); return { ...Object.fromEntries(keep.map((k) => [k, p[k]])), [key]: j[field] as T }; });
        else setErr(j?.error ?? "failed");
      })
      .catch(() => { if (live) setErr(navigator.onLine ? "failed" : "offline"); });
    return () => { live = false; };
  }, [key, tick]); // eslint-disable-line react-hooks/exhaustive-deps
  return { data: have as T | undefined, err, retry: () => { setErr(null); setTick((t) => t + 1); } };
}

type Term = { term: string; meaning: string };
const Loading = ({ text }: { text: string }) => <p className="mt-6 text-lg text-muted" role="status">{text}</p>;
function Failed({ c, err, retry }: { c: C; err: string; retry: () => void }) {
  const limit = useAiLimitText();
  return <div className="mt-6"><p role="alert" className="font-bold text-ruby">{errorText(c.errors, err, limit)}</p><button onClick={retry} className={`${buttonClass.secondary} mt-3`}>{c.retry}</button></div>;
}

export function VocabTool({ track }: { track: ExamId }) {
  const c = useCopy(copy);
  const lang = useLang();
  const sc = useScope(track, true);
  const unit = sc.unit ?? sc.course.units[0];
  const [hideAll, setHideAll] = useState(false);
  const [shown, setShown] = useState<string[]>([]);
  const [cards, setCards] = useLocalDoc<Card[]>(FLASHCARDS_KEY, NO_CARDS);
  const [msg, setMsg] = useState("");
  const api = apiTrack(track);
  const topic = sc.unit ? sc.topic : undefined;
  const { data, err, retry } = useLearned<Term[]>("learn-vocab", `${api}/${sc.course.id}/${unit.id}/${topic?.id ?? ""}/${lang}`, { track: api, section: sc.course.id, skill: unit.id, ...(topic ? { topic: topic.id } : {}), kind: "terms", lang }, "terms");
  const deck = `${sc.course.en}: ${topic ? `${topic.num} ${topic.en}` : unit.en}`.slice(0, 80);
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
      {track === "ap" && !sc.hasPicked ? <p className="mt-2 text-sm text-muted">{c.noPicked}</p> : null}
      <Pickers track={track} sc={sc} c={c} needUnit />
      {!data && !err ? <Loading text={c.loading} /> : null}
      {err && !data ? <Failed c={c} err={err} retry={retry} /> : null}
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
      <TrademarkNote />
    </Page>
  );
}

export function CramTool({ track }: { track: ExamId }) {
  const c = useCopy(copy);
  const lang = useLang();
  const sc = useScope(track, true);
  const unit = sc.unit ?? sc.course.units[0];
  const api = apiTrack(track);
  const topic = sc.unit ? sc.topic : undefined;
  const { data, err, retry } = useLearned<Cram>("learn-cram", `${api}/${sc.course.id}/${unit.id}/${topic?.id ?? ""}/${lang}`, { track: api, section: sc.course.id, skill: unit.id, ...(topic ? { topic: topic.id } : {}), kind: "cram", lang }, "cram");
  const list = (items: string[]) => <ul className="mt-2 list-disc space-y-1.5 pl-6 text-lg">{items.map((x, i) => <li key={i}><MathText text={x} /></li>)}</ul>;
  const head = (text: string) => <h2 className="border-b-[1.5px] border-ink pb-1 text-2xl">{text}</h2>;
  return (
    <Page>
      <h1 className="text-3xl sm:text-4xl">{c.cramTitle}</h1>
      <p className="mt-2 max-w-prose text-muted print:hidden">{c.cramLead}</p>
      {track === "ap" && !sc.hasPicked ? <p className="mt-2 text-sm text-muted print:hidden">{c.noPicked}</p> : null}
      <div className="print:hidden"><Pickers track={track} sc={sc} c={c} needUnit /></div>
      {!data && !err ? <Loading text={c.loading} /> : null}
      {err && !data ? <Failed c={c} err={err} retry={retry} /> : null}
      {data ? (
        <article className="mt-6 space-y-6">
          <p className="text-xl font-bold">{sc.course[lang]}: {unit[lang]}{topic ? ` · ${topic.num} ${topic[lang]}` : ""}</p>
          <section>{head(c.mustKnow)}{list(data.mustKnow)}</section>
          <section>{head(c.terms)}<dl className="mt-2 grid gap-x-6 gap-y-2 sm:grid-cols-2">{data.terms.map((t, i) => <div key={i} className="guide-card p-3"><dt className="font-bold">{t.term}</dt><dd><MathText text={t.meaning} /></dd></div>)}</dl></section>
          {data.numbers?.length ? <section>{head(c.numbers)}{list(data.numbers)}</section> : null}
          <section>{head(c.traps)}{list(data.traps)}</section>
          <section>{head(c.tips)}{list(data.examTips)}</section>
          <p className="text-sm text-muted">{c.cramNote}</p>
          <button onClick={() => window.print()} className={`${buttonClass.secondary} print:hidden`}><Printer size={16} aria-hidden /> {c.print}</button>
        </article>
      ) : null}
      <TrademarkNote />
    </Page>
  );
}
