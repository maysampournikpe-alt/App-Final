// Fails if any text color pair in globals.css drops below WCAG AA (4.5:1).
import { readFileSync } from "node:fs";

const css = readFileSync(new URL("../src/app/globals.css", import.meta.url), "utf8");
const block = (selector) => {
  const start = css.indexOf(selector);
  const body = css.slice(css.indexOf("{", start) + 1, css.indexOf("}", start));
  return Object.fromEntries([...body.matchAll(/--c-([\w-]+):\s*(#[0-9a-f]{6})/gi)].map((m) => [m[1], m[2]]));
};
const themes = { light: block(":root {"), night: block(':root[data-theme="dark"] {') };

const lum = (hex) => {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255)
    .map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const ratio = (a, b) => {
  const [hi, lo] = [lum(a), lum(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
};

const pairs = [
  ["ink", "paper"], ["ink", "surface"], ["ink", "sunken"],
  ["muted", "paper"], ["muted", "surface"], ["muted", "sunken"],
  ["ruby", "paper"], ["ruby", "surface"], ["on-ruby", "ruby"],
  ["teal", "paper"], ["teal", "surface"], ["on-teal", "teal"],
  ["on-marigold", "marigold"],
  ["terracotta", "paper"], ["terracotta", "surface"],
  ["palm", "paper"], ["palm", "surface"],
];
let failed = 0;
for (const [name, t] of Object.entries(themes)) {
  for (const [fg, bg] of pairs) {
    const r = ratio(t[fg], t[bg]);
    // Marigold on the page is only used as a fill or large mark, so 3:1 is enough there.
    const min = fg === "marigold" ? 3 : 4.5;
    if (r < min) { failed++; console.log(`FAIL ${name}: ${fg} on ${bg} = ${r.toFixed(2)} (needs ${min})`); }
  }
}
console.log(failed ? `${failed} pair(s) below AA` : "All color pairs pass WCAG AA");
process.exit(failed ? 1 : 0);
