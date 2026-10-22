/** Turns indented notes into a numbered outline: I., A., 1., a., then (1), (a). Pure, so it can be tested. */

const BULLET = /^[-*•·]\s+|^\d+[.)]\s+|^[a-zA-Z][.)]\s+/;
const ROMAN = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII", "XIII", "XIV", "XV", "XVI", "XVII", "XVIII", "XIX", "XX"];

const label = (level: number, n: number): string => {
  const letter = (i: number) => String.fromCharCode(97 + ((i - 1) % 26));
  switch (level) {
    case 0: return (ROMAN[n - 1] ?? String(n)) + ".";
    case 1: return String.fromCharCode(65 + ((n - 1) % 26)) + ".";
    case 2: return n + ".";
    case 3: return letter(n) + ".";
    case 4: return `(${n})`;
    default: return `(${letter(n)})`;
  }
};

export interface OutlineLine { level: number; label: string; text: string }

export function buildOutline(raw: string): OutlineLine[] {
  const rows = raw.split(/\r?\n/).map((line) => {
    const m = line.match(/^[\t ]*/)![0];
    const width = [...m].reduce((n, ch) => n + (ch === "\t" ? 4 : 1), 0);
    return { width, text: line.slice(m.length).replace(BULLET, "").trim() };
  }).filter((r) => r.text);
  const stack: number[] = [];
  const counts: number[] = [];
  const out: OutlineLine[] = [];
  for (const r of rows) {
    while (stack.length && r.width < stack[stack.length - 1]) stack.pop();
    if (!stack.length || r.width > stack[stack.length - 1]) stack.push(r.width);
    const level = Math.min(stack.length - 1, 5);
    counts.length = level + 1;
    counts[level] = (counts[level] ?? 0) + 1;
    out.push({ level, label: label(level, counts[level]), text: r.text });
  }
  return out;
}

export const outlineText = (lines: OutlineLine[]) => lines.map((l) => `${"    ".repeat(l.level)}${l.label} ${l.text}`).join("\n");
