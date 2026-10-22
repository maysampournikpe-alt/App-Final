/** MLA 9 and APA 7 basics for web pages, books and articles. Output is a list of parts so titles can be shown in italics. */
export type Style = "mla" | "apa";
export type Kind = "web" | "book" | "article";
export interface Person { first: string; last: string }
export interface Source {
  authors: Person[]; title: string; site: string; publisher: string; url: string;
  year: string; month: string; day: string; container: string; volume: string; issue: string; pages: string;
}
export const EMPTY_SOURCE: Source = { authors: [{ first: "", last: "" }], title: "", site: "", publisher: "", url: "", year: "", month: "", day: "", container: "", volume: "", issue: "", pages: "" };
export interface Part { t: string; i?: boolean }

const MLA_MONTHS = ["Jan.", "Feb.", "Mar.", "Apr.", "May", "June", "July", "Aug.", "Sept.", "Oct.", "Nov.", "Dec."];
const APA_MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const trim = (s: string) => s.trim().replace(/\s+/g, " ");
const initials = (first: string) => trim(first).split(/[\s-]+/).filter(Boolean).map((n) => n[0].toUpperCase() + ".").join(" ");
const endDot = (s: string) => (/[.?!]$/.test(s) ? s : s + ".");

function authorsMla(a: Person[]): string {
  const p = a.filter((x) => trim(x.last));
  if (p.length === 0) return "";
  const f = (x: Person, flip: boolean) => (flip ? `${trim(x.last)}${trim(x.first) ? ", " + trim(x.first) : ""}` : `${trim(x.first)} ${trim(x.last)}`.trim());
  if (p.length === 1) return endDot(f(p[0], true));
  if (p.length === 2) return endDot(`${f(p[0], true)}, and ${f(p[1], false)}`);
  return endDot(`${f(p[0], true)}, et al`);
}
function authorsApa(a: Person[]): string {
  const p = a.filter((x) => trim(x.last));
  if (p.length === 0) return "";
  const f = (x: Person) => `${trim(x.last)}${initials(x.first) ? ", " + initials(x.first) : ""}`;
  if (p.length === 1) return endDot(f(p[0]));
  if (p.length === 2) return endDot(`${f(p[0])}, & ${f(p[1])}`);
  return endDot(p.slice(0, -1).map(f).join(", ") + ", & " + f(p[p.length - 1]));
}

export function cite(style: Style, kind: Kind, s: Source): Part[] {
  const out: Part[] = [];
  const push = (t: string, i = false) => { if (t) out.push({ t, i }); };
  const mi = Number(s.month) - 1, y = trim(s.year), d = trim(s.day);
  const title = trim(s.title);
  if (style === "mla") {
    const au = authorsMla(s.authors);
    push(au ? au + " " : "");
    const date = [d, MLA_MONTHS[mi], y].filter(Boolean).join(" ");
    if (kind === "book") {
      push(endDot(title), true); push(" ");
      push([trim(s.publisher), y].filter(Boolean).join(", ") + (s.publisher || y ? "." : ""));
    } else if (kind === "article") {
      push(`“${endDot(title)}” `);
      const meta = [trim(s.volume) && `vol. ${trim(s.volume)}`, trim(s.issue) && `no. ${trim(s.issue)}`, date, trim(s.pages) && `pp. ${trim(s.pages)}`].filter(Boolean).join(", ");
      push(trim(s.container), true); push(trim(s.container) && meta ? ", " : "");
      push(meta ? endDot(meta) : trim(s.container) ? "." : "");
      if (trim(s.url)) push(" " + endDot(trim(s.url)));
    } else {
      push(`“${endDot(title)}” `);
      const site = trim(s.site);
      const rest = [site, trim(s.publisher) && trim(s.publisher) !== site ? trim(s.publisher) : "", date].filter(Boolean);
      push(site, true);
      const tail = [trim(s.publisher) && trim(s.publisher) !== site ? trim(s.publisher) : "", date].filter(Boolean);
      push(site && tail.length ? ", " : "");
      push(tail.join(", ") + (rest.length ? "." : ""));
      if (trim(s.url)) push(" " + endDot(trim(s.url).replace(/^https?:\/\//, "")));
    }
  } else {
    const au = authorsApa(s.authors);
    const dateStr = y ? (kind === "web" && mi >= 0 && APA_MONTHS[mi] ? `${y}, ${APA_MONTHS[mi]}${d ? " " + d : ""}` : y) : "n.d.";
    if (au) { push(au + " "); push(`(${dateStr}). `); }
    if (kind === "book") {
      if (!au) { push(endDot(title), true); push(` (${dateStr}). `); } else push(endDot(title), true);
      push(trim(s.publisher) ? " " + endDot(trim(s.publisher)) : "");
    } else if (kind === "article") {
      if (!au) { push(endDot(title) + " "); push(`(${dateStr}). `); } else push(endDot(title) + " ");
      push(trim(s.container), true);
      const vol = trim(s.volume), iss = trim(s.issue), pg = trim(s.pages);
      if (vol) { push(", "); push(vol, true); }
      if (iss) push(`(${iss})`);
      if (pg) push(`, ${pg}`);
      push(".");
      if (trim(s.url)) push(" " + trim(s.url));
    } else {
      if (!au) { push(endDot(title), true); push(` (${dateStr}). `); } else push(endDot(title), true);
      push(trim(s.site) ? " " + endDot(trim(s.site)) : "");
      if (trim(s.url)) push(" " + trim(s.url));
    }
  }
  return out.filter((p) => p.t !== "").reduce<Part[]>((acc, p) => { const last = acc[acc.length - 1]; if (last && !!last.i === !!p.i) last.t += p.t; else acc.push({ ...p }); return acc; }, []);
}

export const citeText = (parts: Part[]) => parts.map((p) => p.t).join("").replace(/\s+/g, " ").replace(/\.\./g, ".").trim();
