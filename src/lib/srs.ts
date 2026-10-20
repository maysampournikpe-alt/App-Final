// Spaced repetition: a small version of the SM-2 schedule. Cards you know come back less often.
import { addDays, type ISODate } from "./dates";

export const FLASHCARDS_KEY = "flashcards";

export interface Card {
  id: string;
  front: string;
  back: string;
  deck: string;
  due: ISODate;
  /** Days until the next review after the last one. 0 means it is still being learned. */
  interval: number;
  ease: number;
  reps: number;
  lapses: number;
}
export type Grade = "again" | "hard" | "good" | "easy";
export const GRADES: Grade[] = ["again", "hard", "good", "easy"];
export const NO_CARDS: Card[] = [];

export const MATURE_DAYS = 21;

export function newCard(front: string, back: string, deck: string, now: ISODate): Card {
  return { id: crypto.randomUUID(), front: front.trim(), back: back.trim(), deck: deck.trim(), due: now, interval: 0, ease: 2.5, reps: 0, lapses: 0 };
}

/** The card after one review. "again" keeps it due today so it comes back in the same session. */
export function review(card: Card, grade: Grade, now: ISODate): Card {
  const clampEase = (e: number) => Math.max(1.3, Math.round(e * 100) / 100);
  if (grade === "again") return { ...card, interval: 0, reps: 0, lapses: card.lapses + 1, ease: clampEase(card.ease - 0.2), due: now };
  let interval: number;
  let ease = card.ease;
  if (grade === "hard") { interval = Math.max(1, Math.round(Math.max(card.interval, 1) * 1.2)); ease -= 0.15; }
  else if (card.reps === 0) interval = grade === "easy" ? 4 : 1;
  else if (card.reps === 1) interval = grade === "easy" ? 7 : 3;
  else { interval = Math.max(card.interval + 1, Math.round(card.interval * ease * (grade === "easy" ? 1.3 : 1))); if (grade === "easy") ease += 0.15; }
  return { ...card, interval, ease: clampEase(ease), reps: card.reps + 1, due: addDays(now, interval) };
}

export const isDue = (c: Card, now: ISODate) => c.due <= now;
export const dueCards = (cards: Card[], now: ISODate) => cards.filter((c) => isDue(c, now)).sort((a, b) => a.due.localeCompare(b.due));

export function deckStats(cards: Card[], now: ISODate) {
  return {
    total: cards.length,
    due: cards.filter((c) => isDue(c, now)).length,
    fresh: cards.filter((c) => c.reps === 0 && c.lapses === 0).length,
    mature: cards.filter((c) => c.interval >= MATURE_DAYS).length,
  };
}

/**
 * Turns pasted text into cards. One card per line: "front :: back" or "front<tab>back".
 * Lines without a separator are skipped and counted so the student can see what was missed.
 */
export function parseCards(text: string): { pairs: { front: string; back: string }[]; skipped: number } {
  const pairs: { front: string; back: string }[] = [];
  let skipped = 0;
  for (const raw of text.split(/\r?\n/)) {
    const line = raw.trim();
    if (!line) continue;
    const at = line.includes("::") ? line.indexOf("::") : line.indexOf("\t");
    const sep = line.includes("::") ? 2 : 1;
    const front = at > 0 ? line.slice(0, at).trim() : "";
    const back = at > 0 ? line.slice(at + sep).trim() : "";
    if (front && back) pairs.push({ front, back }); else skipped++;
  }
  return { pairs, skipped };
}
