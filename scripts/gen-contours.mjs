// Generates public/contours.svg: faint topographic lines (marching squares over a
// smooth height field). Run once; the output is committed.
import { writeFileSync } from "node:fs";

const W = 1200, H = 600, COLS = 120, ROWS = 60;
const peaks = [[260, 200, 190, 1], [820, 380, 240, 1.1], [1080, 110, 150, 0.8], [520, 520, 130, 0.6]];
const field = (x, y) => {
  let v = 0;
  for (const [px, py, r, a] of peaks) v += a * Math.exp(-(((x - px) ** 2 + (y - py) ** 2) / (2 * r * r)));
  return v + 0.05 * Math.sin(x / 70 + y / 110) + 0.03 * Math.sin(y / 45 - x / 130);
};
const grid = [];
for (let j = 0; j <= ROWS; j++) {
  grid.push([]);
  for (let i = 0; i <= COLS; i++) grid[j].push(field((i * W) / COLS, (j * H) / ROWS));
}
const lerp = (a, b, va, vb, lv) => a + ((lv - va) / (vb - va)) * (b - a);
const key = (p) => `${p[0].toFixed(1)},${p[1].toFixed(1)}`;

let d = "";
for (let lv = 0.12; lv < 1.3; lv += 0.1) {
  const segs = [];
  for (let j = 0; j < ROWS; j++) for (let i = 0; i < COLS; i++) {
    const x0 = (i * W) / COLS, x1 = ((i + 1) * W) / COLS, y0 = (j * H) / ROWS, y1 = ((j + 1) * H) / ROWS;
    const a = grid[j][i], b = grid[j][i + 1], c = grid[j + 1][i + 1], e = grid[j + 1][i];
    const code = (a > lv) * 8 + (b > lv) * 4 + (c > lv) * 2 + (e > lv);
    if (code === 0 || code === 15) continue;
    const top = [lerp(x0, x1, a, b, lv), y0], right = [x1, lerp(y0, y1, b, c, lv)];
    const bottom = [lerp(x0, x1, e, c, lv), y1], left = [x0, lerp(y0, y1, a, e, lv)];
    const table = {
      1: [[left, bottom]], 2: [[bottom, right]], 3: [[left, right]], 4: [[top, right]],
      5: [[top, left], [bottom, right]], 6: [[top, bottom]], 7: [[top, left]], 8: [[top, left]],
      9: [[top, bottom]], 10: [[top, right], [left, bottom]], 11: [[top, right]], 12: [[left, right]],
      13: [[bottom, right]], 14: [[left, bottom]],
    };
    for (const s of table[code]) segs.push(s);
  }
  // Join segments into polylines.
  const byEnd = new Map();
  segs.forEach((s, idx) => s.forEach((p) => { const k = key(p); (byEnd.get(k) ?? byEnd.set(k, []).get(k)).push(idx); }));
  const used = new Set();
  for (let s = 0; s < segs.length; s++) {
    if (used.has(s)) continue;
    used.add(s);
    let line = [...segs[s]];
    for (const dir of [1, -1]) {
      for (;;) {
        const end = dir === 1 ? line[line.length - 1] : line[0];
        const next = (byEnd.get(key(end)) ?? []).find((n) => !used.has(n));
        if (next === undefined) break;
        used.add(next);
        const [p, q] = segs[next];
        const other = key(p) === key(end) ? q : p;
        dir === 1 ? line.push(other) : line.unshift(other);
      }
    }
    if (line.length < 4) continue;
    d += "M" + line.map((p) => `${p[0].toFixed(0)} ${p[1].toFixed(0)}`).join("L") + " ";
  }
}
writeFileSync(
  new URL("../public/contours.svg", import.meta.url),
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid slice"><path d="${d.trim()}" fill="none" stroke="#000" stroke-width="1.6" stroke-linejoin="round" stroke-linecap="round"/></svg>`,
);
console.log("wrote public/contours.svg", Math.round(d.length / 1024) + "KB path data");
