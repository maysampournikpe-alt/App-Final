/** Small text measurements shared by the writing tools. Everything runs on the device. */

export const words = (s: string): string[] => s.match(/[\p{L}\p{N}]+(?:['’][\p{L}]+)?/gu) ?? [];

export function syllables(word: string): number {
  const w = word.toLowerCase().replace(/[^a-záéíóúüñ]/g, "");
  if (!w) return 0;
  if (w.length <= 3) return 1;
  let n = (w.replace(/(?:[^laeiouyáéíóú]es|ed|[^laeiouyáéíóú]e)$/, "").replace(/^y/, "").match(/[aeiouyáéíóúü]+/g) ?? []).length;
  if (n < 1) n = 1;
  return n;
}

export function sentences(s: string): number {
  const n = s.split(/[.!?¿¡]+(?:\s|$)/).filter((x) => words(x).length > 0).length;
  return Math.max(1, n);
}

/** Flesch-Kincaid grade level for English text. Returns null when there is too little text to say anything. */
export function fkGrade(text: string): { grade: number; words: number; sentences: number } | null {
  const ws = words(text);
  if (ws.length < 30) return null;
  const sc = sentences(text), syl = ws.reduce((n, w) => n + syllables(w), 0);
  const grade = 0.39 * (ws.length / sc) + 11.8 * (syl / ws.length) - 15.59;
  return { grade: Math.max(0, Math.round(grade * 10) / 10), words: ws.length, sentences: sc };
}

const norm = (s: string) => words(s.toLowerCase());

/** Share (0 to 1) of the rewrite's words that sit inside a run of `n` or more words copied from the original. */
export function copiedShare(original: string, rewrite: string, n = 4): number {
  const o = norm(original), r = norm(rewrite);
  if (r.length === 0) return 0;
  const grams = new Set<string>();
  for (let i = 0; i + n <= o.length; i++) grams.add(o.slice(i, i + n).join(" "));
  const covered = new Array<boolean>(r.length).fill(false);
  for (let i = 0; i + n <= r.length; i++) if (grams.has(r.slice(i, i + n).join(" "))) for (let j = i; j < i + n; j++) covered[j] = true;
  return covered.filter(Boolean).length / r.length;
}

export const wpm = (wordCount: number, seconds: number): number => (seconds > 0 ? Math.round((wordCount / seconds) * 60) : 0);

/** Typing result: accuracy counts characters that match the target at the same position. */
export function typingResult(target: string, typed: string, seconds: number): { wpm: number; accuracy: number } {
  let ok = 0;
  for (let i = 0; i < typed.length; i++) if (typed[i] === target[i]) ok++;
  const minutes = seconds / 60;
  return { wpm: minutes > 0 ? Math.round(ok / 5 / minutes) : 0, accuracy: typed.length ? Math.round((ok / typed.length) * 100) : 0 };
}

export const charCount = (s: string) => ({ withSpaces: [...s].length, noSpaces: [...s.replace(/\s/g, "")].length });
