"use client";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { BookOpen, Check, Crown, ExternalLink, Flame, Layers, RotateCcw, Star, Zap } from "lucide-react";
import { type ApCourse } from "@/lib/exam/ap";
import { EXAMS } from "@/lib/exam/config";
import { gather } from "@/lib/exam/gather";
import type { ExamId, Question } from "@/lib/exam/types";
import { NOTES_VERSION, type Notes } from "@/lib/ai/learn";
import { today } from "@/lib/dates";
import { useLang } from "@/lib/i18n";
import { khanSearch, lessonQuery, youtubeSearch } from "@/lib/links";
import { useLocalDoc } from "@/lib/local-doc";
import { levelName, levelOf } from "@/lib/progress";
import { FLASHCARDS_KEY, newCard, NO_CARDS, type Card } from "@/lib/srs";
import { useCopy } from "@/lib/use-copy";
import { errorText, useAiLimitText } from "@/lib/ai-limit";
import { lessonXp, streakOf } from "@/lib/xp";
import { buttonClass, inputClass, Page } from "../ui";
import { MathText } from "./MathText";
import { TrademarkNote } from "./TrademarkNote";
import { GOLD, levelOfProg, PASS, useCourse, usePathProgress, useXp, type Prog } from "./useAp";
import { useExamData } from "./useExam";

const copy = {
  en: {
    titles: { ap: "AP study path", sat: "SAT study path", psat: "PSAT study path", act: "ACT study path", tsi: "TSI study path" } as Record<string, string>,
    lead: "Go topic by topic. Each lesson has videos to watch, short notes, then a quiz. Pass the quiz to climb to the next level and earn XP.",
    course: "AP course", section: "Section", pick: "Pick AP courses", noPicked: "Showing all AP courses. Pick yours on the course picker to see only those.", upNext: "Up next",
    lvl: ["Not started", "Notes read", "Quiz passed", "Mastered"], done: (d: number, n: number) => `${d} of ${n} lessons passed`, unit: "Unit", skillWord: "Skill", unitReview: (u: string) => `${u} review`,
    topicsDone: (d: number, n: number) => `${d} of ${n} topics`, reviewHint: "Overview of the whole unit, then a mixed quiz", cram: "Cram sheet", back: "Back to the path",
    learn: "Learn", quiz: "Quiz", watch: "Watch and learn", watchLead: "Short videos are a great way to start. These links open a search on another site in a new tab, and you pick the video.", yt: "Search YouTube", khan: "Search Khan Academy", opens: "(opens in a new tab)",
    notesLoading: "Writing your notes…", retry: "Try again", toQuiz: "Go to the quiz", summary: "The big picture", ideas: "Key ideas", terms: "Key terms", example: "Example", mistakes: "Common mistakes", selfCheck: "Ask yourself", howTested: "How it is tested", memory: "Memory tips",
    notesNote: "These notes were written by an AI from the course outline and can have mistakes. Compare them with your class notes and the official course guide.", addTerms: "Add these terms to my flashcards", termsAdded: (n: number) => `${n} flashcards added.`, termsDup: "These terms are already in your flashcards.",
    quizLoading: "Getting your questions…", qOf: (i: number, n: number) => `Question ${i} of ${n}`, check: "Check answer", next: "Next question", finish: "See my result", right: "Correct.", wrong: (a: string) => `Not quite. The answer is ${a}.`, explain: "Why",
    verified: "Checked question", aiChecked: "AI question, checked by a second AI. It can still be wrong.", choose: "Choose an answer",
    score: (a: number, b: number) => `You got ${a} of ${b}`, passed: "Lesson passed. Nice work.", tryAgain: "Not yet. Read the notes again and give it another try.", gold: "Mastered this lesson.", nextLesson: "Next lesson", again: "Do it again", xpGain: (n: number) => `+${n} XP`, level: (l: number, n: string) => `Level ${l}: ${n}`, streak: (n: number) => `${n}-day streak`,
    short: (n: number) => `Only ${n} questions could be made this time.`,
    errors: { rate_limited: "You have used a lot of lessons this hour. Take a break and try again in a few minutes.", busy: "The AI is busy. Try again in a minute.", slow: "That took too long. Try again.", unavailable: "AI lessons are not switched on in this version yet.", failed: "Something went wrong on our side. Try again in a minute.", offline: "You are offline. Lessons you opened before still work.", empty: "No questions are available for this lesson yet." } as Record<string, string>,
    source: "Practice questions come from our checked bank first. If a lesson needs more, an AI writes new original ones and a second AI checks them.", official: "Official course guides (CED)", numbering: "Topic names follow the usual course outline. Numbers can differ slightly from your course guide.",
  },
  es: {
    titles: { ap: "Ruta de estudio AP", sat: "Ruta de estudio SAT", psat: "Ruta de estudio PSAT", act: "Ruta de estudio ACT", tsi: "Ruta de estudio TSI" } as Record<string, string>,
    lead: "Avanza tema por tema. Cada lección tiene videos para ver, apuntes cortos y un cuestionario. Pasa el cuestionario para subir de nivel y ganar XP.",
    course: "Curso AP", section: "Sección", pick: "Elegir cursos AP", noPicked: "Se muestran todos los cursos AP. Elige los tuyos en el selector de cursos para ver solo esos.", upNext: "Sigue",
    lvl: ["Sin empezar", "Apuntes leídos", "Cuestionario aprobado", "Dominado"], done: (d: number, n: number) => `${d} de ${n} lecciones aprobadas`, unit: "Unidad", skillWord: "Habilidad", unitReview: (u: string) => `Repaso de ${u}`,
    topicsDone: (d: number, n: number) => `${d} de ${n} temas`, reviewHint: "Resumen de toda la unidad y luego un cuestionario mixto", cram: "Hoja de repaso", back: "Volver a la ruta",
    learn: "Aprender", quiz: "Cuestionario", watch: "Mira y aprende", watchLead: "Los videos cortos son una buena forma de empezar. Estos enlaces abren una búsqueda en otro sitio en una pestaña nueva, y tú eliges el video.", yt: "Buscar en YouTube", khan: "Buscar en Khan Academy", opens: "(se abre en una pestaña nueva)",
    notesLoading: "Escribiendo tus apuntes…", retry: "Intentar otra vez", toQuiz: "Ir al cuestionario", summary: "Visión general", ideas: "Ideas clave", terms: "Términos clave", example: "Ejemplo", mistakes: "Errores comunes", selfCheck: "Pregúntate", howTested: "Cómo se evalúa", memory: "Trucos para recordar",
    notesNote: "Estos apuntes los escribió una IA a partir del temario del curso y pueden tener errores. Compáralos con tus apuntes de clase y la guía oficial del curso.", addTerms: "Agregar estos términos a mis tarjetas", termsAdded: (n: number) => `${n} tarjetas agregadas.`, termsDup: "Estos términos ya están en tus tarjetas.",
    quizLoading: "Preparando tus preguntas…", qOf: (i: number, n: number) => `Pregunta ${i} de ${n}`, check: "Revisar respuesta", next: "Siguiente pregunta", finish: "Ver mi resultado", right: "Correcto.", wrong: (a: string) => `No exactamente. La respuesta es ${a}.`, explain: "Por qué",
    verified: "Pregunta revisada", aiChecked: "Pregunta de IA, revisada por una segunda IA. Aun así puede estar mal.", choose: "Elige una respuesta",
    score: (a: number, b: number) => `Lograste ${a} de ${b}`, passed: "Lección aprobada. Buen trabajo.", tryAgain: "Todavía no. Lee otra vez los apuntes y vuelve a intentarlo.", gold: "Dominaste esta lección.", nextLesson: "Siguiente lección", again: "Hacerlo otra vez", xpGain: (n: number) => `+${n} XP`, level: (l: number, n: string) => `Nivel ${l}: ${n}`, streak: (n: number) => `Racha de ${n} días`,
    short: (n: number) => `Esta vez solo se pudieron hacer ${n} preguntas.`,
    errors: { rate_limited: "Has usado muchas lecciones esta hora. Descansa y vuelve a intentar en unos minutos.", busy: "La IA está ocupada. Intenta de nuevo en un minuto.", slow: "Tardó demasiado. Intenta de nuevo.", unavailable: "Las lecciones con IA todavía no están activadas en esta versión.", failed: "Algo falló de nuestra parte. Intenta de nuevo en un minuto.", offline: "No tienes internet. Las lecciones que abriste antes siguen funcionando.", empty: "Todavía no hay preguntas para esta lección." } as Record<string, string>,
    source: "Las preguntas de práctica salen primero de nuestro banco revisado. Si una lección necesita más, una IA escribe preguntas originales nuevas y una segunda IA las revisa.", official: "Guías oficiales del curso (CED)", numbering: "Los nombres de los temas siguen el temario habitual del curso. Los números pueden diferir un poco de tu guía del curso.",
  },
};

/** One lesson on the path: a topic (AP), a unit review (AP) or a skill (SAT, ACT, TSI). */
export interface LessonRef {
  key: string; track: ExamId; section: string; sectionLabel: string; sectionEn: string; skill: string; skillLabel: string; skillEn: string;
  topic?: string; topicNum?: string; topicLabel?: string; review?: boolean; groupNo?: number;
}
interface Group { id: string; title: string; no: number; items: LessonRef[]; review?: LessonRef }

const apGroup = (track: ExamId, course: ApCourse, lang: "en" | "es", unitIdx: number): Group => {
  const u = course.units[unitIdx];
  const base = { track, section: course.id, sectionLabel: course[lang], sectionEn: course.en, skill: u.id, skillLabel: u[lang], skillEn: u.en, groupNo: u.no };
  return {
    id: u.id, title: u[lang], no: u.no,
    items: u.topics.map((t) => ({ ...base, key: `${track}/${course.id}/${t.id}`, topic: t.id, topicNum: t.num, topicLabel: t[lang] })),
    review: { ...base, key: `${track}/${course.id}/${u.id}`, review: true },
  };
};

export function StudyPathTool({ track }: { track: ExamId }) {
  const c = useCopy(copy);
  const lang = useLang();
  const params = useSearchParams();
  const wantCourse = params.get("course"), wantUnit = params.get("unit"), wantTopic = params.get("topic");
  const { course, list, hasPicked, setCurrent } = useCourse(track, wantCourse);
  const { prog, update } = usePathProgress();
  const xp = useXp();

  const groups: Group[] = useMemo(() => course.units.map((_, i) => apGroup(track, course, lang, i)), [track, course, lang]);
  const flat = useMemo(() => groups.flatMap((g) => [...g.items, ...(g.review ? [g.review] : [])]), [groups]);

  const [open, setOpen] = useState<LessonRef | null>(() => {
    if (wantTopic) return flat.find((r) => r.topic === wantTopic) ?? null;
    if (wantUnit) return flat.find((r) => r.skill === wantUnit && !r.review) ?? null;
    return null;
  });

  const lessons = flat.filter((r) => !r.review);
  const passedCount = lessons.filter((r) => levelOfProg(prog[r.key]) >= 2).length;
  const next = lessons.find((r) => levelOfProg(prog[r.key]) < 2)?.key;
  const rows = [0, 2.2, 3.5, 2.2, 0, -2.2, -3.5, -2.2];
  const lvl = levelOf(xp.xp);
  const uw = track === "ap" ? c.unit : c.skillWord;

  if (open) {
    const i = flat.findIndex((r) => r.key === open.key);
    return <Lesson key={open.key} lessonRef={open} prog={prog[open.key]} lang={lang} xpTotal={xp.xp} onAward={xp.award} days={xp.days}
      onProg={(p) => update(open.key, p)} onBack={() => setOpen(null)} onNext={i >= 0 && i < flat.length - 1 ? () => setOpen(flat[i + 1]) : null} />;
  }

  let n = 0;
  return (
    <Page>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0"><h1 className="text-3xl sm:text-4xl">{c.titles[track]}</h1><p className="mt-2 max-w-prose text-muted">{c.lead}</p></div>
        <div className="flex flex-wrap gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full border-[1.5px] border-ink bg-surface px-3 py-1 font-bold"><Zap size={16} aria-hidden />{xp.xp} XP</span>
          <span className="inline-flex items-center gap-1.5 rounded-full border-[1.5px] border-ink bg-surface px-3 py-1 font-bold"><Crown size={16} aria-hidden />{lvl.level}</span>
          <span className="inline-flex items-center gap-1.5 rounded-full border-[1.5px] border-ink bg-surface px-3 py-1 font-bold"><Flame size={16} aria-hidden />{streakOf(xp.days, today())}</span>
        </div>
      </div>
      <div className="mt-5 flex flex-wrap items-end gap-4">
        <label className="min-w-0 max-w-md flex-1"><span className="block font-bold">{track === "ap" ? c.course : c.section}</span>
          <select value={course.id} onChange={(e) => setCurrent(e.target.value)} className={`${inputClass} mt-1`}>{list.map((x) => <option key={x.id} value={x.id}>{x[lang]}</option>)}</select></label>
        <p className="pb-3 font-bold text-teal" aria-live="polite">{c.done(passedCount, lessons.length)}</p></div>
      {track === "ap" && !hasPicked ? <p className="mt-2 text-sm text-muted">{c.noPicked} <Link href="/t/ap/courses" className="font-bold text-teal underline underline-offset-4">{c.pick}</Link></p> : null}
      {track === "ap" ? <p className="mt-2 flex flex-wrap items-center gap-x-4 text-sm text-muted">{c.numbering} <a href="https://apcentral.collegeboard.org/courses" target="_blank" rel="noopener noreferrer" className="font-bold text-teal underline underline-offset-4">{c.official}<span className="sr-only"> {c.opens}</span></a></p> : null}
      <p className="mt-1 text-sm text-muted">{c.source}</p>

      <div className="mx-auto mt-8 max-w-2xl space-y-10">
        {groups.map((g, gi) => {
          const done = g.items.filter((r) => levelOfProg(prog[r.key]) >= 2).length;
          const tone = ["bg-ruby text-on-ruby", "bg-teal text-on-teal", "bg-marigold text-on-marigold", "bg-sage text-ink"][gi % 4];
          const all = [...g.items, ...(g.review ? [g.review] : [])];
          return (
            <section key={g.id} aria-labelledby={`g-${g.id}`}>
              {(
                <div className={`rounded-xl border-[1.5px] border-ink p-4 ${tone}`}>
                  <p className="text-sm font-bold uppercase tracking-wide">{uw} {g.no}</p>
                  <h2 id={`g-${g.id}`} className="font-display text-2xl font-semibold leading-tight">{g.title.replace(/^(Unit|Unidad) \d+:\s*/, "")}</h2>
                  <p className="mt-1 text-sm font-bold">{c.topicsDone(done, g.items.length)}</p>
                </div>
              )}
              <ol className="mt-4">
                {all.map((it, i) => {
                  const lv = levelOfProg(prog[it.key]);
                  const isNext = it.key === next;
                  const Icon = it.review ? Layers : lv === 3 ? Crown : lv === 2 ? Check : lv === 1 ? BookOpen : Star;
                  const off = rows[n++ % rows.length];
                  const label = it.review ? c.unitReview(`${uw} ${it.groupNo}`) : it.topicNum ? `${it.topicNum} ${it.topicLabel}` : it.skillLabel;
                  return (
                    <li key={it.key} className="relative" style={{ paddingLeft: `${Math.max(0, off) * 1.5}rem`, paddingRight: `${Math.max(0, -off) * 1.5}rem`, textAlign: off < 0 ? "right" : "left" }}>
                      <button onClick={() => { setOpen(it); setCurrent(it.section); }} className={`group inline-flex max-w-full items-center gap-4 rounded-full py-2 ${off < 0 ? "flex-row-reverse text-right" : "text-left"}`}>
                        <span className={`grid h-16 w-16 shrink-0 place-items-center rounded-full border-[2px] border-ink shadow-[0_4px_0_0_var(--c-ink)] group-hover:translate-y-[1px] ${lv === 3 ? "bg-marigold text-on-marigold" : lv === 2 ? "bg-teal text-on-teal" : lv === 1 ? "bg-sage text-ink" : isNext ? "bg-ruby text-on-ruby" : "bg-sunken text-ink"}`}><Icon size={26} strokeWidth={2} aria-hidden /></span>
                        <span className="min-w-0"><span className="block font-bold group-hover:underline">{label}</span><span className="block text-sm text-muted">{isNext ? <span className="font-bold text-ruby">{c.upNext}</span> : it.review ? c.reviewHint : c.lvl[lv]}</span></span>
                      </button>
                      {i < all.length - 1 ? <span aria-hidden className="mx-8 my-1 block h-6 w-[4px] trail-dots" /> : null}
                    </li>
                  );
                })}
              </ol>
              {g.review ? <p className="mt-2"><Link href={`/t/${track}/cram?course=${course.id}&unit=${g.id}`} className="font-bold text-teal underline underline-offset-4">{c.cram}: {uw} {g.no}</Link></p> : null}
            </section>
          );
        })}
      </div>
      <p className="mt-8 text-center text-sm text-muted">{levelName(lvl.level)[lang]} · {lvl.toNext} XP</p>
    <TrademarkNote />
    </Page>
  );
}

function Lesson({ lessonRef: r, prog, lang, xpTotal, days, onAward, onProg, onBack, onNext }: {
  lessonRef: LessonRef; prog?: Prog; lang: "en" | "es"; xpTotal: number; days: string[];
  onAward: (n: number) => void; onProg: (p: Prog) => void; onBack: () => void; onNext: (() => void) | null;
}) {
  const c = useCopy(copy);
  const [tab, setTab] = useState<"learn" | "quiz" | "result">("learn");
  const [attempt, setAttempt] = useState(0);
  const [result, setResult] = useState<{ right: number; n: number; gained: number; xpAfter: number } | null>(null);
  const title = r.review ? c.unitReview(r.skillLabel.replace(/:.*/, "")) : r.topicNum ? `${r.topicNum} ${r.topicLabel}` : r.skillLabel;
  const finish = (right: number, n: number) => {
    const pct = right / n;
    const before = levelOfProg(prog);
    const nowBest = Math.max(prog?.best ?? 0, pct);
    const gained = lessonXp({ firstNotes: !prog?.notes, right, n, wasPassed: before >= 2, nowPassed: nowBest >= PASS, wasMastered: before >= 3, nowMastered: nowBest >= GOLD });
    onProg({ best: nowBest, tries: (prog?.tries ?? 0) + 1, at: today(), notes: true });
    onAward(gained);
    setResult({ right, n, gained, xpAfter: xpTotal + gained });
    setTab("result");
  };
  const q = lessonQuery(r.track === "ap" ? r.sectionEn : `${EXAMS[r.track].en} ${r.sectionEn}`, r.review ? r.skillEn.replace(/^Unit \d+:\s*/, "") : r.topicLabel ? r.topicLabel : r.skillEn);
  const lv = result ? levelOf(result.xpAfter) : null;
  return (
    <Page>
      <button onClick={onBack} className={buttonClass.quiet}>← {c.back}</button>
      <p className="mt-4 text-sm font-bold text-terracotta">{r.sectionLabel}{r.review || r.topic ? ` · ${r.skillLabel}` : ""}</p>
      <h1 className="text-3xl sm:text-4xl">{title}</h1>
      <div className="mt-4 flex gap-2" role="tablist" aria-label={title}>
        {(["learn", "quiz"] as const).map((s) => { const on = tab === s || (s === "quiz" && tab === "result"); return <button key={s} role="tab" aria-selected={on} onClick={() => setTab(s)} className={`rounded-full border-[1.5px] border-ink px-4 py-1.5 font-bold ${on ? "bg-ink text-paper" : "bg-surface hover:bg-sunken"}`}>{s === "learn" ? c.learn : c.quiz}</button>; })}
      </div>
      {tab === "learn" ? (
        <>
          <section className="guide-card mt-6 p-5" aria-labelledby="watch-h"><h2 id="watch-h" className="text-xl">{c.watch}</h2><p className="mt-1 text-sm text-muted">{c.watchLead}</p>
            <div className="mt-3 flex flex-wrap gap-3">
              <a href={youtubeSearch(q)} target="_blank" rel="noopener noreferrer" className={buttonClass.secondary}>{c.yt} <ExternalLink size={15} aria-hidden /><span className="sr-only"> {c.opens}</span></a>
              <a href={khanSearch(q)} target="_blank" rel="noopener noreferrer" className={buttonClass.secondary}>{c.khan} <ExternalLink size={15} aria-hidden /><span className="sr-only"> {c.opens}</span></a></div></section>
          <NotesView r={r} lang={lang} onRead={() => { if (!prog?.notes) onProg({ notes: true }); setTab("quiz"); }} />
        </>
      ) : null}
      {tab === "quiz" ? <QuizView key={attempt} r={r} lang={lang} onDone={finish} /> : null}
      {tab === "result" && result ? (
        <section className="guide-card mt-6 p-6" aria-live="polite">
          <p className="font-display text-3xl font-semibold">{c.score(result.right, result.n)}</p>
          <p className={`mt-2 text-lg font-bold ${result.right / result.n >= PASS ? "text-teal" : "text-ruby"}`}>{result.right / result.n >= GOLD ? c.gold : result.right / result.n >= PASS ? c.passed : c.tryAgain}</p>
          <p className="mt-3 flex flex-wrap items-center gap-3 font-bold"><span className="inline-flex items-center gap-1 rounded-full bg-marigold px-3 py-1 text-on-marigold"><Zap size={15} aria-hidden />{c.xpGain(result.gained)}</span>
            {lv ? <span>{c.level(lv.level, levelName(lv.level)[lang])}</span> : null}<span className="inline-flex items-center gap-1"><Flame size={15} aria-hidden />{c.streak(streakOf([...days, today()], today()))}</span></p>
          <div className="mt-4 flex flex-wrap gap-3">
            <button onClick={() => { setAttempt(attempt + 1); setTab("quiz"); }} className={buttonClass.secondary}><RotateCcw size={16} /> {c.again}</button>
            {result.right / result.n >= PASS && onNext ? <button onClick={onNext} className={buttonClass.primary}>{c.nextLesson}</button> : null}
            <button onClick={onBack} className={buttonClass.secondary}>{c.back}</button></div>
        </section>
      ) : null}
    </Page>
  );
}

const NO_NOTES: Record<string, Notes> = {};
function NotesView({ r, lang, onRead }: { r: LessonRef; lang: "en" | "es"; onRead: () => void }) {
  const c = useCopy(copy);
  const limit = useAiLimitText();
  const apiTrack = r.track === "psat" ? "sat" : r.track;
  const [cache, setCache] = useLocalDoc<Record<string, Notes>>(`learn-notes-${apiTrack}-${r.section}`, NO_NOTES);
  const [cards, setCards] = useLocalDoc<Card[]>(FLASHCARDS_KEY, NO_CARDS);
  const key = `${NOTES_VERSION}/${r.skill}/${r.topic ?? ""}/${lang}`;
  const have = cache[key];
  const [err, setErr] = useState<string | null>(null);
  const [tick, setTick] = useState(0);
  const [msg, setMsg] = useState("");
  useEffect(() => {
    if (have) return;
    let live = true;
    fetch("/api/learn", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ track: apiTrack, section: r.section, skill: r.skill, ...(r.topic ? { topic: r.topic } : {}), kind: "notes", lang }) })
      .then((res) => res.json().then((j) => ({ res, j })).catch(() => ({ res, j: null })))
      .then(({ res, j }) => {
        if (!live) return;
        if (res.ok && j?.ok) setCache((p) => { const keep = Object.keys(p).slice(-60); return { ...Object.fromEntries(keep.map((k) => [k, p[k]])), [key]: j.notes as Notes }; });
        else setErr(j?.error ?? "failed");
      })
      .catch(() => { if (live) setErr(navigator.onLine ? "failed" : "offline"); });
    return () => { live = false; };
  }, [key, tick]); // eslint-disable-line react-hooks/exhaustive-deps
  if (!have && !err) return <p className="mt-6 text-lg text-muted" role="status">{c.notesLoading}</p>;
  if (!have) return <div className="mt-6"><p role="alert" className="font-bold text-ruby">{errorText(c.errors, err!, limit)}</p><button onClick={() => { setErr(null); setTick(tick + 1); }} className={`${buttonClass.secondary} mt-3`}>{c.retry}</button></div>;
  const n = have;
  const deck = `${r.sectionEn}: ${r.topicNum ? `${r.topicNum} ` : ""}${r.topicLabel ?? r.skillEn}`.slice(0, 80);
  const addTerms = () => {
    const fresh = n.terms.filter((t) => !cards.some((k) => k.deck === deck && k.front.toLowerCase() === t.term.toLowerCase()));
    if (!fresh.length) return setMsg(c.termsDup);
    setCards((p) => [...p, ...fresh.map((t) => newCard(t.term, t.meaning, deck, today()))]);
    setMsg(c.termsAdded(fresh.length));
  };
  const H = (text: string) => <h2 className="border-b-[1.5px] border-ink pb-1 text-2xl">{text}</h2>;
  const bullets = (items: string[]) => <ul className="mt-2 list-disc space-y-1.5 pl-6 text-lg">{items.map((k, i) => <li key={i}><MathText text={k} /></li>)}</ul>;
  return (
    <article className="mt-6 space-y-7">
      <section className="guide-card p-5"><h2 className="text-xl">{c.summary}</h2><MathText text={n.summary} className="mt-1 text-lg" /></section>
      {n.sections.map((sec, i) => <section key={i}>{H(sec.heading)}<MathText text={sec.body} className="mt-2 text-lg leading-relaxed" /></section>)}
      <section>{H(c.ideas)}{bullets(n.keyIdeas)}</section>
      <section>{H(c.terms)}<dl className="mt-2 grid gap-x-6 gap-y-2 sm:grid-cols-2">{n.terms.map((t, i) => <div key={i} className="guide-card p-3"><dt className="font-bold">{t.term}</dt><dd><MathText text={t.meaning} /></dd></div>)}</dl>
        <div className="mt-3 flex flex-wrap items-center gap-3"><button onClick={addTerms} className={buttonClass.secondary}>{c.addTerms}</button><span className="font-bold text-teal" role="status">{msg}</span></div></section>
      {n.examples.map((ex, i) => <section key={i} className="guide-card border-l-[6px] border-l-marigold p-5"><h2 className="text-xl">{c.example}: {ex.title}</h2><MathText text={ex.body} className="mt-1 text-lg" /></section>)}
      <section>{H(c.mistakes)}{bullets(n.mistakes)}</section>
      <section>{H(c.howTested)}{bullets(n.howTested)}</section>
      {n.memoryTips?.length ? <section>{H(c.memory)}{bullets(n.memoryTips)}</section> : null}
      <section>{H(c.selfCheck)}{bullets(n.selfCheck)}</section>
      <p className="text-sm text-muted">{c.notesNote}</p>
      <button onClick={onRead} className={buttonClass.primary}>{c.toQuiz}</button>
    </article>
  );
}

function QuizView({ r, lang, onDone }: { r: LessonRef; lang: "en" | "es"; onDone: (right: number, n: number) => void }) {
  const c = useCopy(copy);
  const limit = useAiLimitText();
  const { hidden } = useExamData();
  const [qs, setQs] = useState<Question[] | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [tick, setTick] = useState(0);
  const [i, setI] = useState(0);
  const [pick, setPick] = useState<string | null>(null);
  const [checked, setChecked] = useState(false);
  const [right, setRight] = useState(0);
  const cfg = EXAMS[r.track];
  const want = r.review ? 10 : 5;
  useEffect(() => {
    let live = true;
    gather({ exam: cfg.bank, section: r.section, needs: [{ skill: r.skill, topic: r.topic, n: want }], lang, hidden, maxDifficulty: cfg.maxDifficulty }).then((g) => {
      if (!live) return;
      if (g.questions.length >= 2) setQs(g.questions); else setErr(g.error ?? "empty");
    });
    return () => { live = false; };
  }, [r.key, tick]); // eslint-disable-line react-hooks/exhaustive-deps
  if (err) return <div className="mt-6"><p role="alert" className="font-bold text-ruby">{errorText(c.errors, err, limit)}</p><button onClick={() => { setErr(null); setQs(null); setTick(tick + 1); }} className={`${buttonClass.secondary} mt-3`}>{c.retry}</button></div>;
  if (!qs) return <p className="mt-6 text-lg text-muted" role="status">{c.quizLoading}</p>;
  const q = qs[i];
  const letter = (k: number) => "ABCD"[k];
  const last = i === qs.length - 1;
  const submit = () => { if (!pick) return; setChecked(true); if (pick === q.answer) setRight((x) => x + 1); };
  const advance = () => { if (last) onDone(right, qs.length); else { setI(i + 1); setPick(null); setChecked(false); } };
  return (
    <section className="mt-6" aria-label={c.quiz}>
      <p className="font-bold text-teal">{c.qOf(i + 1, qs.length)}{qs.length < want ? ` · ${c.short(qs.length)}` : ""}</p>
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
