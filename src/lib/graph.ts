export type Fn = (x: number) => number;
export interface View { xmin: number; xmax: number; ymin: number; ymax: number }
export const DEFAULT_VIEW: View = { xmin: -10, xmax: 10, ymin: -10, ymax: 10 };

/** Splits a curve into pieces wherever it is undefined or jumps across the screen (like 1/x or tan x), so no false line is drawn across the gap. */
export function segments(fn: Fn, view: View, steps = 600): { x: number; y: number }[][] {
  const out: { x: number; y: number }[][] = [];
  let cur: { x: number; y: number }[] = [];
  const span = view.ymax - view.ymin;
  const flush = () => { if (cur.length > 1) out.push(cur); cur = []; };
  let prev: number | null = null;
  for (let i = 0; i <= steps; i++) {
    const x = view.xmin + ((view.xmax - view.xmin) * i) / steps;
    let y = NaN;
    try { y = fn(x); } catch { /* undefined here */ }
    if (!Number.isFinite(y)) { flush(); prev = null; continue; }
    if (prev !== null && Math.abs(y - prev) > 4 * span) flush();
    cur.push({ x, y }); prev = y;
  }
  flush();
  return out;
}

/** Where the curve crosses y = 0, found by looking for sign changes and narrowing in. Jumps over a gap are not counted as roots. */
export function roots(fn: Fn, xmin: number, xmax: number, steps = 2000, max = 12): number[] {
  const found: number[] = [];
  const f = (x: number) => { try { return fn(x); } catch { return NaN; } };
  let x0 = xmin, y0 = f(x0);
  for (let i = 1; i <= steps && found.length < max; i++) {
    const x1 = xmin + ((xmax - xmin) * i) / steps, y1 = f(x1);
    if (Number.isFinite(y0) && Number.isFinite(y1)) {
      if (y0 === 0) found.push(x0);
      else if (y0 * y1 < 0) {
        let a = x0, b = x1, ya = y0;
        for (let k = 0; k < 60; k++) { const m = (a + b) / 2, ym = f(m); if (!Number.isFinite(ym)) break; if (ya * ym <= 0) b = m; else { a = m; ya = ym; } }
        const r = (a + b) / 2;
        if (Math.abs(f(r)) < 1e-6 * Math.max(1, Math.abs(y0) + Math.abs(y1))) found.push(r);
      }
    }
    x0 = x1; y0 = y1;
  }
  const rounded = found.map((r) => Math.round(r * 1e6) / 1e6);
  return rounded.filter((r, i) => i === 0 || Math.abs(r - rounded[i - 1]) > 1e-5).map((r) => (Object.is(r, -0) ? 0 : r));
}

/** A tidy grid spacing: 1, 2 or 5 times a power of ten, giving roughly `target` lines. */
export function niceStep(range: number, target = 8): number {
  const raw = range / target, pow = 10 ** Math.floor(Math.log10(raw)), f = raw / pow;
  return (f < 1.5 ? 1 : f < 3.5 ? 2 : f < 7.5 ? 5 : 10) * pow;
}

export const zoom = (v: View, factor: number): View => {
  const cx = (v.xmin + v.xmax) / 2, cy = (v.ymin + v.ymax) / 2, hx = ((v.xmax - v.xmin) / 2) * factor, hy = ((v.ymax - v.ymin) / 2) * factor;
  return { xmin: cx - hx, xmax: cx + hx, ymin: cy - hy, ymax: cy + hy };
};
export const pan = (v: View, dx: number, dy: number): View => { const w = v.xmax - v.xmin, h = v.ymax - v.ymin; return { xmin: v.xmin + dx * w, xmax: v.xmax + dx * w, ymin: v.ymin + dy * h, ymax: v.ymax + dy * h }; };
export const fmt = (n: number) => String(parseFloat(n.toPrecision(6)));
