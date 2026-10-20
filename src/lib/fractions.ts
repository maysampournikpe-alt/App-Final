// Fraction helper that shows its work. Whole numbers only, so every step is exact.
export interface Frac { n: number; d: number }

export const gcd = (a: number, b: number): number => { a = Math.abs(a); b = Math.abs(b); while (b) [a, b] = [b, a % b]; return a || 1; };
export const lcm = (a: number, b: number) => Math.abs(a * b) / gcd(a, b);

export function simplify(f: Frac): Frac {
  const g = gcd(f.n, f.d);
  const sign = f.d < 0 ? -1 : 1;
  return { n: (sign * f.n) / g, d: (sign * f.d) / g };
}

export type Op = "+" | "-" | "×" | "÷";
export interface Solved { result: Frac; steps: string[] }

const show = (f: Frac) => (f.d === 1 ? `${f.n}` : `${f.n}/${f.d}`);

/** Returns the answer in lowest terms and the steps a teacher would write. Null if it cannot be done (zero denominator, divide by zero). */
export function solve(a: Frac, op: Op, b: Frac): Solved | null {
  if (a.d === 0 || b.d === 0 || !Number.isInteger(a.n + a.d + b.n + b.d)) return null;
  const steps: string[] = [];
  let raw: Frac;
  if (op === "+" || op === "-") {
    const common = lcm(a.d, b.d);
    const an = a.n * (common / a.d), bn = b.n * (common / b.d);
    steps.push(`Common denominator: ${common}`, `${show(a)} = ${an}/${common}   and   ${show(b)} = ${bn}/${common}`);
    raw = { n: op === "+" ? an + bn : an - bn, d: common };
    steps.push(`${an}/${common} ${op === "+" ? "+" : "−"} ${bn}/${common} = ${raw.n}/${common}`);
  } else if (op === "×") {
    raw = { n: a.n * b.n, d: a.d * b.d };
    steps.push(`Multiply the tops and the bottoms: (${a.n} × ${b.n}) / (${a.d} × ${b.d}) = ${raw.n}/${raw.d}`);
  } else {
    if (b.n === 0) return null;
    steps.push(`Flip the second fraction and multiply: ${show(a)} × ${b.d}/${b.n}`);
    raw = { n: a.n * b.d, d: a.d * b.n };
    steps.push(`(${a.n} × ${b.d}) / (${a.d} × ${b.n}) = ${raw.n}/${raw.d}`);
  }
  const result = simplify(raw);
  const g = gcd(raw.n, raw.d);
  if (g > 1 && raw.n !== 0) steps.push(`Simplify: divide the top and bottom by ${g} → ${show(result)}`);
  return { result, steps };
}

export function mixed(f: Frac): { whole: number; rest: Frac | null } {
  const s = simplify(f);
  const whole = Math.trunc(s.n / s.d);
  const rem = Math.abs(s.n % s.d);
  return { whole, rest: rem ? { n: rem, d: Math.abs(s.d) } : null };
}

export const toDecimal = (f: Frac) => f.n / f.d;
export const toPercent = (f: Frac) => (f.n / f.d) * 100;

/** A decimal like 0.375 as a fraction (up to 6 decimal places). */
export function fromDecimal(x: number): Frac | null {
  if (!Number.isFinite(x)) return null;
  const places = Math.min(6, (String(x).split(".")[1] ?? "").length);
  const d = 10 ** places;
  return simplify({ n: Math.round(x * d), d });
}
