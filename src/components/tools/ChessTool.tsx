"use client";
import { Chess, type Square } from "chess.js";
import { useMemo, useState } from "react";
import { OPENINGS, type Opening } from "@/data/openings";
import { useLang } from "@/lib/i18n";
import { useCopy } from "@/lib/use-copy";
import { buttonClass } from "../ui";
import { Callout, Chips, Head } from "./shared";

const copy = {
  en: {
    title: "Chess opening trainer", lead: "Practice an opening move by move. Tap the piece you want to move, then tap where it goes. The other side answers automatically.", pick: "Opening", yourSide: (s: string) => `You play ${s}`, white: "White", black: "Black", move: (n: number, t: number) => `Move ${n} of ${t}`, yourTurn: "Your move.", good: "Right. That is the book move.", wrong: "That is not the book move for this opening. Try again, or use Show hint.", hint: "Show hint", hintIs: (m: string) => `The book move is ${m}.`, restart: "Start over", done: "You finished the line. Run it again from memory, and then play some real games with it.", idea: "The idea", pieces: { p: "pawn", n: "knight", b: "bishop", r: "rook", q: "queen", k: "king" } as Record<string, string>, colors: { w: "white", b: "black" } as Record<string, string>, empty: "empty", selected: "selected", legalTo: "can move here", board: "Chess board", note: "These are classic lines for learning. Strong players may play differently, and that is fine. Learn the ideas, not just the moves.",
  },
  es: {
    title: "Entrenador de aperturas de ajedrez", lead: "Practica una apertura jugada por jugada. Toca la pieza que quieres mover y luego toca a dónde va. El otro lado responde solo.", pick: "Apertura", yourSide: (s: string) => `Juegas con ${s}`, white: "Blancas", black: "Negras", move: (n: number, t: number) => `Jugada ${n} de ${t}`, yourTurn: "Te toca.", good: "Bien. Esa es la jugada del libro.", wrong: "Esa no es la jugada del libro para esta apertura. Intenta otra vez o usa Mostrar pista.", hint: "Mostrar pista", hintIs: (m: string) => `La jugada del libro es ${m}.`, restart: "Empezar de nuevo", done: "Terminaste la línea. Repítela de memoria y luego juega partidas de verdad con ella.", idea: "La idea", pieces: { p: "peón", n: "caballo", b: "alfil", r: "torre", q: "dama", k: "rey" } as Record<string, string>, colors: { w: "blanco", b: "negro" } as Record<string, string>, empty: "vacía", selected: "elegida", legalTo: "puede moverse aquí", board: "Tablero de ajedrez", note: "Son líneas clásicas para aprender. Los jugadores fuertes pueden jugar distinto y está bien. Aprende las ideas, no solo las jugadas.",
  },
};
const GLYPH: Record<string, string> = { wk: "♔", wq: "♕", wr: "♖", wb: "♗", wn: "♘", wp: "♙", bk: "♚", bq: "♛", br: "♜", bb: "♝", bn: "♞", bp: "♟" };
const FILES = "abcdefgh";

function Trainer({ o }: { o: Opening }) {
  const c = useCopy(copy);
  const lang = useLang();
  const [game, setGame] = useState(() => { const g = new Chess(); if (o.side === "b") g.move(o.moves[0]); return g; });
  const [sel, setSel] = useState<Square | null>(null);
  const [msg, setMsg] = useState<{ t: string; good: boolean } | null>(null);
  const [hint, setHint] = useState(false);
  const idx = game.history().length;
  const done = idx >= o.moves.length;
  const targets = useMemo(() => (sel ? game.moves({ square: sel, verbose: true }).map((m) => m.to as string) : []), [game, sel]);
  const reset = () => { const g = new Chess(); if (o.side === "b") g.move(o.moves[0]); setGame(g); setSel(null); setMsg(null); setHint(false); };
  const click = (sq: Square) => {
    if (done) return;
    const piece = game.get(sq);
    if (piece && piece.color === o.side) { setSel(sq); setMsg(null); return; }
    if (!sel || !targets.includes(sq)) return;
    const expected = o.moves[idx];
    const probe = new Chess(game.fen());
    const tried = probe.move({ from: sel, to: sq, promotion: "q" });
    const want = new Chess(game.fen()).move(expected);
    if (tried.san === want.san) {
      const g = new Chess(); game.history().forEach((m) => g.move(m)); g.move(expected);
      if (g.history().length < o.moves.length) g.move(o.moves[g.history().length]);
      setGame(g); setSel(null); setHint(false); setMsg({ t: g.history().length >= o.moves.length ? c.done : c.good, good: true });
    } else { setSel(null); setMsg({ t: c.wrong, good: false }); }
  };
  const flip = o.side === "b";
  const rows = flip ? [1, 2, 3, 4, 5, 6, 7, 8] : [8, 7, 6, 5, 4, 3, 2, 1];
  const cols = flip ? [...FILES].reverse() : [...FILES];
  return (
    <div className="mt-5 grid gap-6 lg:grid-cols-[minmax(0,28rem)_1fr]">
      <div role="group" aria-label={c.board} className="grid aspect-square w-full max-w-[28rem] grid-cols-8 overflow-hidden rounded-md border-[1.5px] border-ink">
        {rows.flatMap((r) => cols.map((f) => {
          const sq = `${f}${r}` as Square, p = game.get(sq), dark = (FILES.indexOf(f) + r) % 2 === 1;
          const label = `${sq}, ${p ? `${c.colors[p.color]} ${c.pieces[p.type]}` : c.empty}${sel === sq ? `, ${c.selected}` : ""}${targets.includes(sq) ? `, ${c.legalTo}` : ""}`;
          return <button key={sq} onClick={() => click(sq)} aria-label={label} aria-pressed={sel === sq}
            className={`relative grid aspect-square place-items-center text-[min(8vw,2.6rem)] leading-none ${dark ? "bg-sage text-ink" : "bg-surface text-ink"} ${sel === sq ? "outline outline-[3px] -outline-offset-[3px] outline-ruby" : ""}`}>
            {p ? <span aria-hidden>{GLYPH[p.color + p.type]}</span> : null}{targets.includes(sq) ? <span aria-hidden className="absolute h-3 w-3 rounded-full bg-teal" /> : null}</button>;
        }))}
      </div>
      <div>
        <p className="font-bold text-teal">{c.yourSide(o.side === "w" ? c.white : c.black)}</p>
        <p className="mt-1 text-lg" aria-live="polite">{done ? "" : `${c.move(Math.floor(idx / 2) + 1, Math.ceil(o.moves.length / 2))} · ${c.yourTurn}`}</p>
        <p className={`mt-2 min-h-12 text-lg font-bold ${msg?.good ? "text-teal" : "text-ruby"}`} role="status">{msg?.t}</p>
        {hint && !done ? <p className="mt-1 font-bold">{c.hintIs(o.moves[idx])}</p> : null}
        <div className="mt-3 flex flex-wrap gap-3">{!done ? <button onClick={() => setHint(true)} className={buttonClass.secondary}>{c.hint}</button> : null}<button onClick={reset} className={buttonClass.secondary}>{c.restart}</button></div>
        <h2 className="mt-6 text-xl">{c.idea}</h2><p className="mt-1 max-w-prose text-lg">{o.idea[lang]}</p>
        <p className="mt-3 font-mono text-sm text-muted">{o.moves.map((m, i) => (i % 2 === 0 ? `${i / 2 + 1}. ${m}` : m)).join(" ")}</p>
      </div>
    </div>
  );
}

export function ChessTool() {
  const c = useCopy(copy);
  const lang = useLang();
  const [id, setId] = useState(OPENINGS[0].id);
  const o = OPENINGS.find((x) => x.id === id)!;
  return (
    <Head title={c.title} lead={c.lead} wide>
      <div className="mt-5"><Chips<string> value={id} onChange={setId} label={c.pick} options={OPENINGS.map((x) => ({ id: x.id, label: x[lang] }))} /></div>
      <Trainer key={id} o={o} />
      <Callout>{c.note}</Callout>
    </Head>
  );
}
