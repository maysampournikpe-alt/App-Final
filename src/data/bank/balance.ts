import type { Question } from "@/lib/exam/types";

/**
 * Spreads the correct answer evenly over A to D so guessing a letter never helps. Choices that are just
 * numbers keep their ascending order, as on the real tests. Explanations never mention a letter, so
 * reordering is safe. The result is the same every time (no randomness).
 */
const NUMERIC = /^[\\$]*-?[\d.,]+%?\$?$/;
const PATTERN = ["C", "A", "D", "B", "B", "D", "A", "C"];

export function balance(list: Question[]): Question[] {
  let n = 0;
  return list.map((q) => {
    if (q.type !== "mc" || !q.choices || q.choices.every((c) => NUMERIC.test(c.trim()))) return q;
    const target = "ABCD".indexOf(PATTERN[n++ % PATTERN.length]);
    const right = "ABCD".indexOf(q.answer);
    const others = q.choices.filter((_, i) => i !== right);
    const choices = [...others.slice(0, target), q.choices[right], ...others.slice(target)];
    return { ...q, choices, answer: "ABCD"[target] };
  });
}
