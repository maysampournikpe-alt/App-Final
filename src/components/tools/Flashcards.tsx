"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import { Plus, RotateCcw, Trash2 } from "lucide-react";
import { today } from "@/lib/dates";
import { useLocalDoc } from "@/lib/local-doc";
import { deckStats, dueCards, FLASHCARDS_KEY, GRADES, newCard, NO_CARDS, parseCards, review, type Card, type Grade } from "@/lib/srs";
import { useCopy } from "@/lib/use-copy";
import { EmptyTrail } from "../art";
import { buttonClass, Field, inputClass, Page } from "../ui";

const copy = {
  en: {
    makeTitle: "Flashcard maker", makeLead: "Make cards one at a time, or paste a whole list.",
    reviewTitle: "Spaced repetition review", reviewLead: "Cards you know come back later. Cards you miss come back sooner.",
    deck: "Deck", deckPh: "Biology unit 3", front: "Front", frontPh: "Mitochondria", back: "Back", backPh: "Makes energy for the cell", add: "Add card",
    needBoth: "Write both sides.", paste: "Or paste many cards", pasteHelp: "One card per line: front :: back (or press Tab between the two sides).",
    pastePh: "mitochondria :: makes energy\nnucleus :: holds the DNA", addAll: "Add these cards", added: (n: number, s: number) => `Added ${n} card${n === 1 ? "" : "s"}.${s ? ` Skipped ${s} line${s === 1 ? "" : "s"} with no “::”.` : ""}`,
    yourCards: "Your cards", none: "No cards yet. Add your first one above.", remove: "Remove", dueNow: (n: number) => `${n} due today`,
    stats: (t: number, d: number, f: number, m: number) => `${t} cards · ${d} due · ${f} new · ${m} well learned`,
    allDecks: "All decks", start: (n: number) => `Study ${n} card${n === 1 ? "" : "s"}`, nothingDue: "Nothing is due. Come back tomorrow, or add more cards.",
    makeLink: "Make cards", reveal: "Show answer", left: (n: number) => `${n} left`,
    grades: { again: "Again", hard: "Hard", good: "Good", easy: "Easy" } as Record<Grade, string>,
    next: (d: number) => (d === 0 ? "soon" : d === 1 ? "1 day" : `${d} days`),
    done: "Session finished.", doneLead: (n: number) => `You went through ${n} card${n === 1 ? "" : "s"}.`, again: "Study again", back2: "Back to decks",
    resume: "Cards you answer Again return before the end of the session.",
  },
  es: {
    makeTitle: "Tarjetas de estudio", makeLead: "Haz tarjetas una por una, o pega una lista completa.",
    reviewTitle: "Repaso espaciado", reviewLead: "Las tarjetas que sabes vuelven más tarde. Las que fallas vuelven antes.",
    deck: "Mazo", deckPh: "Biología unidad 3", front: "Frente", frontPh: "Mitocondria", back: "Reverso", backPh: "Produce energía para la célula", add: "Agregar tarjeta",
    needBoth: "Escribe los dos lados.", paste: "O pega muchas tarjetas", pasteHelp: "Una tarjeta por línea: frente :: reverso (o presiona Tab entre los dos lados).",
    pastePh: "mitocondria :: produce energía\nnúcleo :: guarda el ADN", addAll: "Agregar estas tarjetas", added: (n: number, s: number) => `Se agregaron ${n} tarjeta${n === 1 ? "" : "s"}.${s ? ` Se saltaron ${s} línea${s === 1 ? "" : "s"} sin “::”.` : ""}`,
    yourCards: "Tus tarjetas", none: "Todavía no hay tarjetas. Agrega la primera arriba.", remove: "Quitar", dueNow: (n: number) => `${n} para hoy`,
    stats: (t: number, d: number, f: number, m: number) => `${t} tarjetas · ${d} para hoy · ${f} nuevas · ${m} bien aprendidas`,
    allDecks: "Todos los mazos", start: (n: number) => `Estudiar ${n} tarjeta${n === 1 ? "" : "s"}`, nothingDue: "No hay nada para hoy. Vuelve mañana, o agrega más tarjetas.",
    makeLink: "Hacer tarjetas", reveal: "Mostrar respuesta", left: (n: number) => `Faltan ${n}`,
    grades: { again: "Otra vez", hard: "Difícil", good: "Bien", easy: "Fácil" } as Record<Grade, string>,
    next: (d: number) => (d === 0 ? "pronto" : d === 1 ? "1 día" : `${d} días`),
    done: "Sesión terminada.", doneLead: (n: number) => `Repasaste ${n} tarjeta${n === 1 ? "" : "s"}.`, again: "Estudiar otra vez", back2: "Volver a los mazos",
    resume: "Las tarjetas que marcas “Otra vez” vuelven antes de que termine la sesión.",
  },
};

export function FlashcardsTool({ view }: { view: "make" | "review" }) {
  const c = useCopy(copy);
  const [cards, setCards] = useLocalDoc<Card[]>(FLASHCARDS_KEY, NO_CARDS);
  return view === "make" ? <Make c={c} cards={cards} setCards={setCards} /> : <Review c={c} cards={cards} setCards={setCards} />;
}

type C = typeof copy.en;
type Props = { c: C; cards: Card[]; setCards: (n: Card[] | ((p: Card[]) => Card[])) => void };

function Make({ c, cards, setCards }: Props) {
  const [deck, setDeck] = useState("");
  const [front, setFront] = useState("");
  const [back, setBack] = useState("");
  const [bulk, setBulk] = useState("");
  const [err, setErr] = useState(false);
  const [note, setNote] = useState("");
  const decks = useMemo(() => [...new Set(cards.map((x) => x.deck).filter(Boolean))].sort(), [cards]);
  const now = today();

  const add = (e: React.FormEvent) => {
    e.preventDefault();
    if (!front.trim() || !back.trim()) return setErr(true);
    setErr(false); setNote("");
    setCards((p) => [...p, newCard(front, back, deck, now)]);
    setFront(""); setBack("");
  };
  const addBulk = () => {
    const { pairs, skipped } = parseCards(bulk);
    setCards((p) => [...p, ...pairs.map((x) => newCard(x.front, x.back, deck, now))]);
    setNote(c.added(pairs.length, skipped));
    if (pairs.length) setBulk("");
  };
  const grouped = decks.concat(cards.some((x) => !x.deck) ? [""] : []).map((d) => ({ d, items: cards.filter((x) => x.deck === d) }));

  return (
    <Page wide>
      <h1 className="text-3xl sm:text-4xl">{c.makeTitle}</h1>
      <p className="mt-2 max-w-prose text-muted">{c.makeLead}</p>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <form onSubmit={add} className="guide-card p-5" noValidate>
          <Field label={c.deck}>{(p) => <input {...p} list="deck-list" value={deck} onChange={(e) => setDeck(e.target.value)} placeholder={c.deckPh} className={inputClass} />}</Field>
          <datalist id="deck-list">{decks.map((d) => <option key={d} value={d} />)}</datalist>
          <Field label={c.front} error={err && !front.trim() ? c.needBoth : null}>{(p) => <input {...p} value={front} onChange={(e) => setFront(e.target.value)} placeholder={c.frontPh} className={inputClass} />}</Field>
          <Field label={c.back} error={err && !back.trim() ? c.needBoth : null}>{(p) => <input {...p} value={back} onChange={(e) => setBack(e.target.value)} placeholder={c.backPh} className={inputClass} />}</Field>
          <button className={buttonClass.primary}><Plus size={18} />{c.add}</button>
        </form>
        <div className="guide-card p-5">
          <Field label={c.paste} help={c.pasteHelp}>{(p) => <textarea {...p} value={bulk} onChange={(e) => setBulk(e.target.value)} rows={6} placeholder={c.pastePh} className={inputClass} />}</Field>
          <button type="button" onClick={addBulk} disabled={!bulk.trim()} className={buttonClass.secondary}>{c.addAll}</button>
          {note ? <p role="status" className="mt-3 font-bold">{note}</p> : null}
        </div>
      </div>

      <h2 className="mt-10 border-b-[1.5px] border-ink pb-1 text-2xl">{c.yourCards}</h2>
      {cards.length === 0 ? (
        <div className="mt-4 flex max-w-xl items-center gap-5"><EmptyTrail className="h-20 w-32 shrink-0 text-ink" /><p className="text-lg">{c.none}</p></div>
      ) : grouped.map(({ d, items }) => (
        <section key={d || "none"} className="mt-6">
          <h3 className="font-display text-xl font-semibold">{d || "—"} <span className="text-base font-normal text-muted">({items.length})</span></h3>
          <ul className="divide-y-2 divide-dotted divide-line">
            {items.map((x) => (
              <li key={x.id} className="flex items-center gap-3 py-2">
                <p className="min-w-0 flex-1"><span className="font-bold">{x.front}</span><span className="text-muted"> — {x.back}</span></p>
                <button onClick={() => setCards((p) => p.filter((y) => y.id !== x.id))} aria-label={`${c.remove}: ${x.front}`} className="grid h-10 w-10 shrink-0 place-items-center rounded-xl hover:bg-sunken"><Trash2 size={18} strokeWidth={1.75} /></button>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </Page>
  );
}

function Review({ c, cards, setCards }: Props) {
  const now = today();
  const [deck, setDeck] = useState("");
  const [queue, setQueue] = useState<string[] | null>(null);
  const [shown, setShown] = useState(false);
  const [seen, setSeen] = useState(0);
  const [finished, setFinished] = useState(false);
  const decks = useMemo(() => [...new Set(cards.map((x) => x.deck).filter(Boolean))].sort(), [cards]);
  const pool = cards.filter((x) => !deck || x.deck === deck);
  const stats = deckStats(pool, now);
  const byId = useMemo(() => new Map(cards.map((x) => [x.id, x])), [cards]);

  const start = () => { setQueue(dueCards(pool, now).map((x) => x.id)); setShown(false); setSeen(0); setFinished(false); };
  const current = queue && queue.length ? byId.get(queue[0]) : undefined;

  const grade = (g: Grade) => {
    if (!current || !queue) return;
    const updated = review(current, g, now);
    setCards((p) => p.map((x) => (x.id === current.id ? updated : x)));
    const rest = queue.slice(1);
    const next = g === "again" ? [...rest.slice(0, 4), current.id, ...rest.slice(4)] : rest; // a missed card returns a few cards later
    setSeen((n) => n + 1);
    setShown(false);
    if (next.length === 0) setFinished(true);
    setQueue(next);
  };

  return (
    <Page>
      <h1 className="text-3xl sm:text-4xl">{c.reviewTitle}</h1>
      <p className="mt-2 max-w-prose text-muted">{c.reviewLead}</p>

      {!queue || (finished && !current) ? (
        <div className="mt-6">
          {finished ? (
            <div className="guide-card mb-6 p-5"><p className="font-display text-2xl font-semibold">{c.done}</p><p className="mt-1">{c.doneLead(seen)}</p></div>
          ) : null}
          {cards.length === 0 ? (
            <div className="guide-card flex items-center gap-5 p-5"><EmptyTrail className="h-20 w-32 shrink-0 text-ink" /><div><p className="text-lg">{c.none}</p><Link href="/t/notes/flashcards" className="mt-2 inline-block font-bold text-teal underline underline-offset-4">{c.makeLink}</Link></div></div>
          ) : (
            <div className="guide-card p-5">
              {decks.length > 0 ? (
                <div className="mb-4 flex flex-wrap gap-2" role="group" aria-label={c.deck}>
                  {["", ...decks].map((d) => (
                    <button key={d || "all"} onClick={() => setDeck(d)} aria-pressed={deck === d}
                      className={`rounded-full border-[1.5px] border-ink px-4 py-1.5 font-bold ${deck === d ? "bg-ink text-paper" : "bg-surface hover:bg-sunken"}`}>{d || c.allDecks}</button>
                  ))}
                </div>
              ) : null}
              <p className="text-muted">{c.stats(stats.total, stats.due, stats.fresh, stats.mature)}</p>
              {stats.due ? <button onClick={start} className={`${buttonClass.primary} mt-4`}>{finished ? <RotateCcw size={18} /> : null}{c.start(stats.due)}</button> : <p className="mt-4 text-lg">{c.nothingDue}</p>}
              <p className="mt-4 text-sm text-muted">{c.resume}</p>
            </div>
          )}
        </div>
      ) : current ? (
        <div className="mt-6">
          <p className="mb-2 text-sm font-bold text-muted" aria-live="polite">{c.left(queue.length)}</p>
          <div className="guide-card min-h-48 p-6 text-center">
            <p className="font-display text-2xl font-semibold sm:text-3xl">{current.front}</p>
            {shown ? <p className="mt-6 border-t-2 border-dotted border-line pt-6 text-xl">{current.back}</p> : null}
          </div>
          {!shown ? (
            <button onClick={() => setShown(true)} autoFocus className={`${buttonClass.primary} mt-4 w-full`}>{c.reveal}</button>
          ) : (
            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {GRADES.map((g) => (
                <button key={g} onClick={() => grade(g)} className={`${g === "again" ? buttonClass.danger : buttonClass.quiet} flex-col !gap-0 border-[1.5px] border-ink`}>
                  <span>{c.grades[g]}</span><span className="text-sm font-normal text-muted">{c.next(review(current, g, now).interval)}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      ) : null}
    </Page>
  );
}
