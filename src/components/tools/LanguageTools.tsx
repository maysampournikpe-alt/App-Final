"use client";
import { useEffect, useRef, useState } from "react";
import { Plus } from "lucide-react";
import { today } from "@/lib/dates";
import { useLocalDoc } from "@/lib/local-doc";
import { FLASHCARDS_KEY, newCard, NO_CARDS, type Card } from "@/lib/srs";
import { conjugate, ENGLISH_IRREGULAR, PERSONS, sameForm, SPANISH_VERBS, type Tense } from "@/lib/verbs";
import { useCopy } from "@/lib/use-copy";
import { buttonClass, inputClass } from "../ui";
import { Callout, Chips, Head } from "./shared";

const copy = {
  en: {
    cjTitle: "Verb conjugation drills", cjLead: "Practice Spanish verbs in three tenses and English irregular verbs. Study the table, then quiz yourself.", lang: "Language", sp: "Spanish", en: "English", mode: "Mode", table: "Study table", quiz: "Quiz", tense: "Tense", tenses: { present: "Present", preterite: "Past (preterite)", future: "Future" } as Record<Tense, string>, verb: "Verb", persons: ["yo", "tú", "él / ella / usted", "nosotros", "ellos / ellas / ustedes"], only: "Irregular verbs only", irregularTag: "irregular", accents: "Accept answers without accents", accentNote: "Accents count on real tests, so turn this off when you are ready.", askSp: (v: string, t: string, p: string) => `${v}: ${t}, ${p}`, askEn: (b: string, f: string) => `${b}: give the ${f}`, past: "past tense", participle: "past participle", answer: "Your answer", check: "Check", right: "Correct.", wrong: (a: string) => `Not quite. The answer is: ${a}`, next: "Next question", score: (a: number, b: number) => `${a} correct of ${b}`, base: "Base", pastCol: "Past", partCol: "Past participle", note: "These tables show the forms used across Latin America and the Valley. Spain also uses a 'vosotros' form, which is left out here.",
    tcTitle: "Translation flashcards", tcLead: "Save English and Spanish pairs. Each pair becomes two flashcards, one in each direction, that return on a spaced schedule.", enW: "English", esW: "Español", tcAdd: "Save pair", tcSaved: (n: number) => `${n} translation cards saved.`, tcReview: "Review my cards", tcNeed: "Write both words.", tcDup: "That pair is already saved.", tcSide: "Side by side", tcEmpty: "No pairs yet.",
    prTitle: "Pronunciation practice", prLead: "Listen to a word, then say it out loud. If your browser supports speech recognition, it tells you whether it understood the word.", prLang: "Language", prWords: "Word", prListen: "Listen", prSay: "Say it", prStop: "Stop", prHeard: (w: string) => `I heard: "${w}"`, prMatch: "Matches. Nice.", prNo: "Not quite. Listen again and try once more.", prNoSpeech: "Your browser cannot listen. You can still listen to the word and practice out loud.", prNoVoice: "Your browser cannot read words aloud.", prPrivacy: "When you tap Say it, your browser may send the sound to its speech service (for example Google in Chrome, Apple in Safari). Nothing is saved by this app.", prNext: "Another word",
  },
  es: {
    cjTitle: "Práctica de verbos", cjLead: "Practica verbos en español en tres tiempos y los verbos irregulares del inglés. Estudia la tabla y luego ponte a prueba.", lang: "Idioma", sp: "Español", en: "Inglés", mode: "Modo", table: "Tabla de estudio", quiz: "Examen", tense: "Tiempo", tenses: { present: "Presente", preterite: "Pasado (pretérito)", future: "Futuro" } as Record<Tense, string>, verb: "Verbo", persons: ["yo", "tú", "él / ella / usted", "nosotros", "ellos / ellas / ustedes"], only: "Solo verbos irregulares", irregularTag: "irregular", accents: "Aceptar respuestas sin acentos", accentNote: "Los acentos cuentan en los exámenes de verdad, así que apaga esto cuando estés listo.", askSp: (v: string, t: string, p: string) => `${v}: ${t}, ${p}`, askEn: (b: string, f: string) => `${b}: escribe el ${f}`, past: "pasado simple", participle: "participio pasado", answer: "Tu respuesta", check: "Revisar", right: "Correcto.", wrong: (a: string) => `No exactamente. La respuesta es: ${a}`, next: "Siguiente pregunta", score: (a: number, b: number) => `${a} correctas de ${b}`, base: "Base", pastCol: "Pasado", partCol: "Participio pasado", note: "Estas tablas muestran las formas usadas en Latinoamérica y el Valle. En España también se usa 'vosotros', que aquí se omite.",
    tcTitle: "Tarjetas de traducción", tcLead: "Guarda pares de inglés y español. Cada par se vuelve dos tarjetas, una en cada dirección, que regresan en un calendario espaciado.", enW: "Inglés", esW: "Español", tcAdd: "Guardar par", tcSaved: (n: number) => `${n} tarjetas de traducción guardadas.`, tcReview: "Repasar mis tarjetas", tcNeed: "Escribe las dos palabras.", tcDup: "Ese par ya está guardado.", tcSide: "Lado a lado", tcEmpty: "Todavía no hay pares.",
    prTitle: "Práctica de pronunciación", prLead: "Escucha una palabra y luego dila en voz alta. Si tu navegador reconoce voz, te dice si entendió la palabra.", prLang: "Idioma", prWords: "Palabra", prListen: "Escuchar", prSay: "Decirla", prStop: "Parar", prHeard: (w: string) => `Escuché: "${w}"`, prMatch: "Coincide. Muy bien.", prNo: "No exactamente. Escucha otra vez e inténtalo de nuevo.", prNoSpeech: "Tu navegador no puede escuchar. Aun así puedes escuchar la palabra y practicar en voz alta.", prNoVoice: "Tu navegador no puede leer palabras en voz alta.", prPrivacy: "Cuando tocas Decirla, tu navegador puede enviar el sonido a su servicio de voz (por ejemplo Google en Chrome, Apple en Safari). Esta app no guarda nada.", prNext: "Otra palabra",
  },
};
type C = typeof copy.en;
const strip = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().trim();
const pickRand = <T,>(a: T[]) => a[Math.floor(Math.random() * a.length)];

export function ConjugationTool() {
  const c = useCopy(copy);
  const [lang, setLang] = useState<"sp" | "en">("sp");
  const [mode, setMode] = useState<"table" | "quiz">("table");
  const [tense, setTense] = useState<Tense>("present");
  const [irrOnly, setIrrOnly] = useState(false);
  const [verb, setVerb] = useState("hablar");
  const [loose, setLoose] = useState(true);
  const pool = SPANISH_VERBS.filter((v) => !irrOnly || v.irregular);
  const [q, setQ] = useState<{ v: string; p: number; en?: { base: string; form: "past" | "participle" } } | null>(null);
  const [ans, setAns] = useState("");
  const [res, setRes] = useState<{ ok: boolean; a: string } | null>(null);
  const [tally, setTally] = useState({ ok: 0, n: 0 });
  const nextQ = () => {
    setAns(""); setRes(null);
    if (lang === "sp") setQ({ v: pickRand(pool).inf, p: Math.floor(Math.random() * 5) });
    else setQ({ v: "", p: 0, en: { base: pickRand(ENGLISH_IRREGULAR).base, form: Math.random() < 0.5 ? "past" : "participle" } });
  };
  useEffect(() => { if (mode === "quiz") { setTally({ ok: 0, n: 0 }); nextQ(); } }, [mode, lang, tense, irrOnly]); // eslint-disable-line react-hooks/exhaustive-deps
  const forms = conjugate(verb, tense);
  const check = (e: React.FormEvent) => {
    e.preventDefault(); if (!q || res) return;
    let correct: string, ok: boolean;
    if (q.en) { const row = ENGLISH_IRREGULAR.find((x) => x.base === q.en!.base)!; correct = q.en.form === "past" ? row.past : row.participle; ok = sameForm(ans, correct); }
    else { correct = conjugate(q.v, tense)![q.p]; ok = loose ? strip(ans) === strip(correct) : ans.trim().toLowerCase() === correct; }
    setRes({ ok, a: correct }); setTally((t) => ({ ok: t.ok + (ok ? 1 : 0), n: t.n + 1 }));
  };
  return (
    <Head title={c.cjTitle} lead={c.cjLead}>
      <div className="mt-5 flex flex-wrap gap-5">
        <Chips<"sp" | "en"> value={lang} onChange={setLang} label={c.lang} options={[{ id: "sp", label: c.sp }, { id: "en", label: c.en }]} />
        <Chips<"table" | "quiz"> value={mode} onChange={setMode} label={c.mode} options={[{ id: "table", label: c.table }, { id: "quiz", label: c.quiz }]} /></div>
      {lang === "sp" ? <div className="mt-4 flex flex-wrap items-end gap-5"><Chips<Tense> value={tense} onChange={setTense} label={c.tense} options={(["present", "preterite", "future"] as Tense[]).map((t) => ({ id: t, label: c.tenses[t] }))} />
        {mode === "table" ? <label className="font-bold">{c.verb}<select value={verb} onChange={(e) => setVerb(e.target.value)} className={`${inputClass} mt-1`}>{SPANISH_VERBS.map((v) => <option key={v.inf} value={v.inf}>{v.inf} ({v.en}){v.irregular ? ` · ${c.irregularTag}` : ""}</option>)}</select></label>
          : <><label className="flex items-center gap-2 font-bold"><input type="checkbox" checked={irrOnly} onChange={(e) => setIrrOnly(e.target.checked)} className="h-5 w-5 accent-[var(--c-teal)]" />{c.only}</label><label className="flex items-center gap-2 font-bold"><input type="checkbox" checked={loose} onChange={(e) => setLoose(e.target.checked)} className="h-5 w-5 accent-[var(--c-teal)]" />{c.accents}</label></>}</div> : null}
      {mode === "table" ? (lang === "sp" ? (forms ? <table className="guide-card mt-5 w-full max-w-xl border-collapse text-lg"><caption className="p-2 text-left text-xl font-bold">{verb} · {c.tenses[tense]}</caption><tbody>{forms.map((f, i) => <tr key={i} className="border-t-2 border-dotted border-line"><th scope="row" className="p-2 text-left font-normal text-muted">{c.persons[i]}</th><td className="p-2 font-bold">{f}</td></tr>)}</tbody></table> : null)
        : <table className="guide-card mt-5 w-full max-w-xl border-collapse text-lg"><thead><tr className="text-left"><th scope="col" className="p-2">{c.base}</th><th scope="col" className="p-2">{c.pastCol}</th><th scope="col" className="p-2">{c.partCol}</th></tr></thead><tbody>{ENGLISH_IRREGULAR.map((v) => <tr key={v.base} className="border-t-2 border-dotted border-line"><th scope="row" className="p-2 text-left">{v.base}</th><td className="p-2">{v.past}</td><td className="p-2">{v.participle}</td></tr>)}</tbody></table>)
        : q ? <form onSubmit={check} className="guide-card mt-5 p-6"><p className="font-display text-2xl font-semibold">{q.en ? c.askEn(q.en.base, q.en.form === "past" ? c.past : c.participle) : c.askSp(q.v, c.tenses[tense], c.persons[q.p])}</p>
          <label className="mt-3 block"><span className="sr-only">{c.answer}</span><input value={ans} onChange={(e) => setAns(e.target.value)} disabled={!!res} autoFocus autoCapitalize="off" autoCorrect="off" spellCheck={false} className={`${inputClass} max-w-sm`} /></label>
          {res ? <><p role="status" className={`mt-3 text-lg font-bold ${res.ok ? "text-teal" : "text-ruby"}`}>{res.ok ? c.right : c.wrong(res.a)}</p><button type="button" onClick={nextQ} className={`${buttonClass.primary} mt-3`}>{c.next}</button></> : <button className={`${buttonClass.primary} mt-3`}>{c.check}</button>}
          <p className="mt-3 font-bold text-teal">{c.score(tally.ok, tally.n)}</p></form> : null}
      {lang === "sp" && mode === "quiz" ? <p className="mt-2 text-sm text-muted">{c.accentNote}</p> : null}
      <p className="mt-4 max-w-prose text-sm text-muted">{c.note}</p>
    </Head>
  );
}

export function TransCardsTool() {
  const c = useCopy(copy);
  const [cards, setCards] = useLocalDoc<Card[]>(FLASHCARDS_KEY, NO_CARDS);
  const [f, setF] = useState({ en: "", es: "" });
  const [err, setErr] = useState<string | null>(null);
  const tr = cards.filter((x) => x.deck === "Translations");
  const pairs = tr.filter((x) => x.front.startsWith("EN: ")).map((x) => ({ en: x.front.slice(4), es: x.back }));
  const add = (e: React.FormEvent) => {
    e.preventDefault();
    const en = f.en.trim(), es = f.es.trim();
    if (!en || !es) return setErr(c.tcNeed);
    if (pairs.some((p) => p.en.toLowerCase() === en.toLowerCase())) return setErr(c.tcDup);
    setErr(null);
    setCards((p) => [...p, newCard("EN: " + en, es, "Translations", today()), newCard("ES: " + es, en, "Translations", today())]);
    setF({ en: "", es: "" });
  };
  return (
    <Head title={c.tcTitle} lead={c.tcLead}>
      <form onSubmit={add} className="guide-card mt-5 grid gap-x-4 gap-y-3 p-5 sm:grid-cols-[1fr_1fr_auto] sm:items-end" noValidate>
        <label><span className="block font-bold">{c.enW}</span><input value={f.en} onChange={(e) => setF({ ...f, en: e.target.value })} lang="en" maxLength={60} className={`${inputClass} mt-1`} /></label>
        <label><span className="block font-bold">{c.esW}</span><input value={f.es} onChange={(e) => setF({ ...f, es: e.target.value })} lang="es" maxLength={60} className={`${inputClass} mt-1`} /></label>
        <button className={buttonClass.primary}><Plus size={18} />{c.tcAdd}</button>{err ? <p role="alert" className="font-bold text-ruby sm:col-span-3">{err}</p> : null}</form>
      <p className="mt-4 font-bold text-teal" aria-live="polite">{c.tcSaved(tr.length)}</p>
      <a href="/t/notes/spaced" className={`${buttonClass.secondary} mt-3 inline-flex`}>{c.tcReview}</a>
      <h2 className="mt-6 border-b-[1.5px] border-ink pb-1 text-2xl">{c.tcSide}</h2>
      {pairs.length === 0 ? <p className="mt-2 text-muted">{c.tcEmpty}</p> : <table className="mt-2 w-full max-w-xl border-collapse text-lg"><thead><tr className="text-left"><th scope="col" className="p-2">{c.enW}</th><th scope="col" className="p-2">{c.esW}</th></tr></thead><tbody>{pairs.map((p, i) => <tr key={i} className="border-t-2 border-dotted border-line"><td className="p-2" lang="en">{p.en}</td><td className="p-2" lang="es">{p.es}</td></tr>)}</tbody></table>}
    </Head>
  );
}

const WORDS = { en: ["library", "through", "comfortable", "vegetable", "February", "choir", "world", "thought", "schedule", "beautiful"], es: ["biblioteca", "refrigerador", "murciélago", "desarrollo", "jirafa", "ferrocarril", "ciudadanía", "escuela", "mariposa"] };
type SR = { new (): { lang: string; interimResults: boolean; maxAlternatives: number; onresult: ((e: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null; onend: (() => void) | null; onerror: (() => void) | null; start(): void; stop(): void } };
export function PronunciationTool() {
  const c = useCopy(copy);
  const [lang, setLang] = useState<"en" | "es">("es");
  const [i, setI] = useState(0);
  const [heard, setHeard] = useState<string | null>(null);
  const [listening, setListening] = useState(false);
  const [support, setSupport] = useState<{ speech: boolean; voice: boolean }>({ speech: true, voice: true });
  const rec = useRef<InstanceType<SR> | null>(null);
  useEffect(() => { const w = window as unknown as { SpeechRecognition?: SR; webkitSpeechRecognition?: SR }; setSupport({ speech: !!(w.SpeechRecognition ?? w.webkitSpeechRecognition), voice: "speechSynthesis" in window }); return () => rec.current?.stop(); }, []);
  const word = WORDS[lang][i % WORDS[lang].length];
  const listen = () => { try { speechSynthesis.cancel(); const u = new SpeechSynthesisUtterance(word); u.lang = lang === "es" ? "es-MX" : "en-US"; u.rate = 0.85; speechSynthesis.speak(u); } catch {} };
  const say = () => {
    const w = window as unknown as { SpeechRecognition?: SR; webkitSpeechRecognition?: SR };
    const Ctor = w.SpeechRecognition ?? w.webkitSpeechRecognition; if (!Ctor) return;
    try { const r = new Ctor(); r.lang = lang === "es" ? "es-MX" : "en-US"; r.interimResults = false; r.maxAlternatives = 3; r.onresult = (e) => { setHeard(Array.from(e.results[0]).map((a) => a.transcript).join(" | ")); }; r.onend = () => setListening(false); r.onerror = () => setListening(false); rec.current = r; setHeard(null); setListening(true); r.start(); } catch { setListening(false); }
  };
  const match = heard !== null && heard.split(" | ").some((h) => strip(h).replace(/[^a-zñ ]/g, "") === strip(word));
  return (
    <Head title={c.prTitle} lead={c.prLead}>
      <div className="mt-5"><Chips<"en" | "es"> value={lang} onChange={(l) => { setLang(l); setI(0); setHeard(null); }} label={c.prLang} options={[{ id: "es", label: "Español" }, { id: "en", label: "English" }]} /></div>
      <section className="guide-card mt-5 p-6 text-center"><p className="text-sm text-muted">{c.prWords}</p><p className="font-display text-5xl font-semibold" lang={lang}>{word}</p>
        <div className="mt-4 flex flex-wrap justify-center gap-3">{support.voice ? <button onClick={listen} className={buttonClass.secondary}>{c.prListen}</button> : null}{support.speech ? (listening ? <button onClick={() => rec.current?.stop()} className={buttonClass.primary}>{c.prStop}</button> : <button onClick={say} className={buttonClass.primary}>{c.prSay}</button>) : null}<button onClick={() => { setI(i + 1); setHeard(null); }} className={buttonClass.secondary}>{c.prNext}</button></div>
        <div aria-live="polite" className="mt-4 min-h-12">{heard !== null ? <><p className="text-muted">{c.prHeard(heard.split(" | ")[0])}</p><p className={`text-xl font-bold ${match ? "text-teal" : "text-ruby"}`}>{match ? c.prMatch : c.prNo}</p></> : null}</div></section>
      {!support.speech ? <Callout>{c.prNoSpeech}</Callout> : null}{!support.voice ? <Callout>{c.prNoVoice}</Callout> : null}
      <p className="mt-4 max-w-prose text-sm text-muted">{c.prPrivacy}</p>
    </Head>
  );
}
