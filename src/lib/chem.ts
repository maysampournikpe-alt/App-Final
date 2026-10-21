export type Category = "nonmetal" | "noble" | "alkali" | "alkaline" | "metalloid" | "halogen" | "post" | "transition" | "lanthanide" | "actinide";
export interface Element { z: number; sym: string; name: string; mass: number; cat: Category }

// Name, symbol, atomic mass (standard values to 3 decimals; for elements with no stable isotope, the mass number of the longest-lived one), category.
const RAW = `H Hydrogen 1.008 nonmetal|He Helium 4.003 noble|Li Lithium 6.94 alkali|Be Beryllium 9.012 alkaline|B Boron 10.81 metalloid|C Carbon 12.011 nonmetal|N Nitrogen 14.007 nonmetal|O Oxygen 15.999 nonmetal|F Fluorine 18.998 halogen|Ne Neon 20.18 noble|
Na Sodium 22.99 alkali|Mg Magnesium 24.305 alkaline|Al Aluminum 26.982 post|Si Silicon 28.085 metalloid|P Phosphorus 30.974 nonmetal|S Sulfur 32.06 nonmetal|Cl Chlorine 35.45 halogen|Ar Argon 39.948 noble|K Potassium 39.098 alkali|Ca Calcium 40.078 alkaline|
Sc Scandium 44.956 transition|Ti Titanium 47.867 transition|V Vanadium 50.942 transition|Cr Chromium 51.996 transition|Mn Manganese 54.938 transition|Fe Iron 55.845 transition|Co Cobalt 58.933 transition|Ni Nickel 58.693 transition|Cu Copper 63.546 transition|Zn Zinc 65.38 transition|
Ga Gallium 69.723 post|Ge Germanium 72.63 metalloid|As Arsenic 74.922 metalloid|Se Selenium 78.971 nonmetal|Br Bromine 79.904 halogen|Kr Krypton 83.798 noble|Rb Rubidium 85.468 alkali|Sr Strontium 87.62 alkaline|Y Yttrium 88.906 transition|Zr Zirconium 91.224 transition|
Nb Niobium 92.906 transition|Mo Molybdenum 95.95 transition|Tc Technetium 98 transition|Ru Ruthenium 101.07 transition|Rh Rhodium 102.906 transition|Pd Palladium 106.42 transition|Ag Silver 107.868 transition|Cd Cadmium 112.414 transition|In Indium 114.818 post|Sn Tin 118.71 post|
Sb Antimony 121.76 metalloid|Te Tellurium 127.6 metalloid|I Iodine 126.904 halogen|Xe Xenon 131.293 noble|Cs Cesium 132.905 alkali|Ba Barium 137.327 alkaline|La Lanthanum 138.905 lanthanide|Ce Cerium 140.116 lanthanide|Pr Praseodymium 140.908 lanthanide|Nd Neodymium 144.242 lanthanide|
Pm Promethium 145 lanthanide|Sm Samarium 150.36 lanthanide|Eu Europium 151.964 lanthanide|Gd Gadolinium 157.25 lanthanide|Tb Terbium 158.925 lanthanide|Dy Dysprosium 162.5 lanthanide|Ho Holmium 164.93 lanthanide|Er Erbium 167.259 lanthanide|Tm Thulium 168.934 lanthanide|Yb Ytterbium 173.045 lanthanide|
Lu Lutetium 174.967 lanthanide|Hf Hafnium 178.49 transition|Ta Tantalum 180.948 transition|W Tungsten 183.84 transition|Re Rhenium 186.207 transition|Os Osmium 190.23 transition|Ir Iridium 192.217 transition|Pt Platinum 195.084 transition|Au Gold 196.967 transition|Hg Mercury 200.592 transition|
Tl Thallium 204.38 post|Pb Lead 207.2 post|Bi Bismuth 208.98 post|Po Polonium 209 post|At Astatine 210 halogen|Rn Radon 222 noble|Fr Francium 223 alkali|Ra Radium 226 alkaline|Ac Actinium 227 actinide|Th Thorium 232.038 actinide|
Pa Protactinium 231.036 actinide|U Uranium 238.029 actinide|Np Neptunium 237 actinide|Pu Plutonium 244 actinide|Am Americium 243 actinide|Cm Curium 247 actinide|Bk Berkelium 247 actinide|Cf Californium 251 actinide|Es Einsteinium 252 actinide|Fm Fermium 257 actinide|
Md Mendelevium 258 actinide|No Nobelium 259 actinide|Lr Lawrencium 266 actinide|Rf Rutherfordium 267 transition|Db Dubnium 268 transition|Sg Seaborgium 269 transition|Bh Bohrium 270 transition|Hs Hassium 277 transition|Mt Meitnerium 278 post|Ds Darmstadtium 281 post|
Rg Roentgenium 282 post|Cn Copernicium 285 transition|Nh Nihonium 286 post|Fl Flerovium 289 post|Mc Moscovium 290 post|Lv Livermorium 293 post|Ts Tennessine 294 halogen|Og Oganesson 294 noble`;

export const ELEMENTS: Element[] = RAW.replace(/\n/g, "").split("|").map((row, i) => {
  const [sym, name, mass, cat] = row.trim().split(" ");
  return { z: i + 1, sym, name, mass: Number(mass), cat: cat as Category };
});
export const BY_SYMBOL = new Map(ELEMENTS.map((e) => [e.sym, e]));

/** Row and column in the standard 18-column table. Lanthanides and actinides sit in two rows underneath (rows 8 and 9). */
export function position(z: number): { row: number; col: number } {
  if (z === 1) return { row: 1, col: 1 };
  if (z === 2) return { row: 1, col: 18 };
  if (z <= 4) return { row: 2, col: z - 2 };
  if (z <= 10) return { row: 2, col: z + 8 };
  if (z <= 12) return { row: 3, col: z - 10 };
  if (z <= 18) return { row: 3, col: z };
  if (z <= 36) return { row: 4, col: z - 18 };
  if (z <= 54) return { row: 5, col: z - 36 };
  if (z <= 56) return { row: 6, col: z - 54 };
  if (z <= 71) return { row: 8, col: z - 54 };
  if (z <= 86) return { row: 6, col: z - 68 };
  if (z <= 88) return { row: 7, col: z - 86 };
  if (z <= 103) return { row: 9, col: z - 86 };
  return { row: 7, col: z - 100 };
}
export const periodOf = (z: number) => { const p = position(z); return p.row === 8 ? 6 : p.row === 9 ? 7 : p.row; };
export const groupOf = (z: number): number | null => { const p = position(z); return p.row >= 8 ? null : p.col; };

const GASES = new Set([1, 2, 7, 8, 9, 10, 17, 18, 36, 54, 86]);
export type State = "solid" | "liquid" | "gas" | "unknown";
export const stateOf = (z: number): State => (GASES.has(z) ? "gas" : z === 35 || z === 80 ? "liquid" : z === 85 || z === 87 || z >= 100 ? "unknown" : "solid");

/* ---------- Formulas ---------- */
export type Counts = Map<string, number>;
export class FormulaError extends Error {}

/** "Ca(OH)2", "Al2(SO4)3", "CuSO4·5H2O" -> element counts. Throws FormulaError with a plain message. */
export function parseFormula(input: string): Counts {
  const text = input.trim().replace(/\s+/g, "").replace(/[.•*]/g, "·");
  if (!text) throw new FormulaError("empty");
  const total: Counts = new Map();
  for (const part of text.split("·")) {
    const m = part.match(/^(\d+)(.*)$/);
    const mult = m ? parseInt(m[1], 10) : 1;
    const counts = parseGroup(m ? m[2] : part);
    counts.forEach((n, sym) => total.set(sym, (total.get(sym) ?? 0) + n * mult));
  }
  return total;
}
function parseGroup(s: string): Counts {
  if (!s) throw new FormulaError("empty");
  const stack: Counts[] = [new Map()];
  let i = 0;
  const num = () => { const m = s.slice(i).match(/^\d+/); if (!m) return 1; i += m[0].length; return parseInt(m[0], 10); };
  while (i < s.length) {
    const ch = s[i];
    if (ch === "(" || ch === "[") { stack.push(new Map()); i++; }
    else if (ch === ")" || ch === "]") {
      if (stack.length < 2) throw new FormulaError("brackets");
      i++;
      const inner = stack.pop()!, n = num(), top = stack[stack.length - 1];
      inner.forEach((c, sym) => top.set(sym, (top.get(sym) ?? 0) + c * n));
    } else if (/[A-Z]/.test(ch)) {
      const m = s.slice(i).match(/^[A-Z][a-z]?/)!;
      let sym = m[0];
      if (!BY_SYMBOL.has(sym) && sym.length === 2) sym = sym[0]; // "Co" vs "CO": handled below by the capital letter rule; a lowercase never starts an element
      if (!BY_SYMBOL.has(sym)) throw new FormulaError(`unknown:${m[0]}`);
      i += sym.length;
      const n = num(), top = stack[stack.length - 1];
      top.set(sym, (top.get(sym) ?? 0) + n);
    } else throw new FormulaError(`char:${ch}`);
  }
  if (stack.length !== 1) throw new FormulaError("brackets");
  return stack[0];
}

export function molarMass(formula: string) {
  const counts = parseFormula(formula);
  const parts = [...counts].map(([sym, count]) => ({ sym, count, mass: BY_SYMBOL.get(sym)!.mass * count }));
  const total = parts.reduce((n, p) => n + p.mass, 0);
  return { total: Math.round(total * 1000) / 1000, parts: parts.map((p) => ({ ...p, mass: Math.round(p.mass * 1000) / 1000, percent: Math.round((p.mass / total) * 10000) / 100 })) };
}

/* ---------- Balancing ---------- */
type Frac = [bigint, bigint]; // numerator, denominator (denominator > 0)
const gcdB = (a: bigint, b: bigint): bigint => { a = a < 0n ? -a : a; b = b < 0n ? -b : b; while (b) [a, b] = [b, a % b]; return a || 1n; };
const norm = ([n, d]: Frac): Frac => { if (d < 0n) { n = -n; d = -d; } const g = gcdB(n, d); return [n / g, d / g]; };
const sub = (a: Frac, b: Frac): Frac => norm([a[0] * b[1] - b[0] * a[1], a[1] * b[1]]);
const mul = (a: Frac, b: Frac): Frac => norm([a[0] * b[0], a[1] * b[1]]);
const div = (a: Frac, b: Frac): Frac => norm([a[0] * b[1], a[1] * b[0]]);

export interface Balanced { reactants: { formula: string; coeff: number }[]; products: { formula: string; coeff: number }[] }
export type BalanceResult = { ok: true; value: Balanced } | { ok: false; reason: "format" | "formula" | "impossible" | "many"; detail?: string };

/** Balances "H2 + O2 -> H2O" with exact fractions. Ions and charges are not supported. */
export function balance(equation: string): BalanceResult {
  const sides = equation.split(/->|→|=>|=/);
  if (sides.length !== 2) return { ok: false, reason: "format" };
  const split = (s: string) => s.split("+").map((x) => x.trim()).filter(Boolean);
  const left = split(sides[0]), right = split(sides[1]);
  if (!left.length || !right.length) return { ok: false, reason: "format" };
  const species = [...left, ...right];
  let counts: Counts[];
  try {
    // A leading number the student typed (like "2H2") is ignored: we find the coefficients ourselves.
    counts = species.map((f) => parseFormula(f.replace(/^\d+(?=[A-Z(\[])/, "")));
  } catch (e) { return { ok: false, reason: "formula", detail: e instanceof FormulaError ? e.message : undefined }; }
  const elements = [...new Set(counts.flatMap((c) => [...c.keys()]))];
  if (!elements.every((el) => counts.slice(0, left.length).some((c) => c.has(el)) && counts.slice(left.length).some((c) => c.has(el)))) return { ok: false, reason: "impossible" };

  // Matrix: one row per element, one column per species (products negative). Find its null space.
  const rows: Frac[][] = elements.map((el) => counts.map((c, j) => norm([BigInt((c.get(el) ?? 0) * (j < left.length ? 1 : -1)), 1n])));
  const cols = species.length;
  const pivotCol: number[] = [];
  let r = 0;
  for (let c = 0; c < cols && r < rows.length; c++) {
    const p = rows.findIndex((row, i) => i >= r && row[c][0] !== 0n);
    if (p < 0) continue;
    [rows[r], rows[p]] = [rows[p], rows[r]];
    rows[r] = rows[r].map((x) => div(x, rows[r][c]));
    for (let i = 0; i < rows.length; i++) if (i !== r && rows[i][c][0] !== 0n) { const f = rows[i][c]; rows[i] = rows[i].map((x, k) => sub(x, mul(f, rows[r][k]))); }
    pivotCol.push(c); r++;
  }
  const free = Array.from({ length: cols }, (_, i) => i).filter((c) => !pivotCol.includes(c));
  if (free.length === 0) return { ok: false, reason: "impossible" };
  if (free.length > 1) return { ok: false, reason: "many" };
  const f = free[0];
  const sol: Frac[] = Array.from({ length: cols }, () => [0n, 1n] as Frac);
  sol[f] = [1n, 1n];
  pivotCol.forEach((c, i) => { sol[c] = norm([-rows[i][f][0], rows[i][f][1]]); });
  let lcm = 1n;
  sol.forEach(([, d]) => { lcm = (lcm * d) / gcdB(lcm, d); });
  const ints = sol.map(([n, d]) => (n * lcm) / d);
  if (ints.some((x) => x <= 0n)) return { ok: false, reason: "impossible" };
  const g = ints.reduce((a, b) => gcdB(a, b));
  const out = ints.map((x) => Number(x / g));
  const clean = (f: string) => f.replace(/^\d+(?=[A-Z(\[])/, "");
  return { ok: true, value: { reactants: left.map((f, i) => ({ formula: clean(f), coeff: out[i] })), products: right.map((f, i) => ({ formula: clean(f), coeff: out[left.length + i] })) } };
}
