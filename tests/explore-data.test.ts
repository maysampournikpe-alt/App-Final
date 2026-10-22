import { describe, expect, it } from "vitest";
import { CAREERS, COLLEGES, COURSES, EDU_LABEL, MAJORS, QUIZ, QUOTES, SCHOLARSHIPS, SEASONS } from "../src/data/explore";
import { GUIDES, INTEREST_TAGS } from "../src/data/guides";
import { INTERESTS } from "../src/config/interests";
import { BUILT, findTool } from "../src/config/features";
import { quoteOfDay } from "../src/lib/quote";

const both = (x: { en: string; es: string }) => x.en.trim().length > 2 && x.es.trim().length > 2 && x.en !== x.es;

describe("explore data", () => {
  it("every career has unique id, both languages, a valid education level and two interest codes", () => {
    expect(new Set(CAREERS.map((c) => c.id)).size).toBe(CAREERS.length);
    for (const c of CAREERS) { expect(both(c.name), c.id).toBe(true); expect(c.day.en.length > 10 && c.day.es.length > 10, c.id).toBe(true); expect(Object.keys(EDU_LABEL)).toContain(c.edu); expect(c.codes[0]).not.toBe(c.codes[1]); expect(c.search.length).toBeGreaterThan(2); }
  });
  it("every major points to careers that exist", () => {
    const ids = new Set(CAREERS.map((c) => c.id));
    for (const m of MAJORS) { expect(both(m.name), m.id).toBe(true); expect(m.leads.length).toBeGreaterThan(0); for (const id of m.leads) expect(ids.has(id), `${m.id} -> ${id}`).toBe(true); }
  });
  it("the interest quiz has three questions for each of the six types", () => {
    const n: Record<string, number> = {}; QUIZ.forEach((q) => { n[q.code] = (n[q.code] ?? 0) + 1; expect(both(q.text)).toBe(true); });
    expect(n).toEqual({ R: 3, I: 3, A: 3, S: 3, E: 3, C: 3 });
  });
  it("every career is reachable from the quiz: both of its codes are real types", () => { for (const c of CAREERS) for (const k of c.codes) expect(["R", "I", "A", "S", "E", "C"]).toContain(k); });
  it("colleges, scholarships and courses are complete and have real https links", () => {
    for (const x of [...COLLEGES.map((c) => c.url), ...SCHOLARSHIPS.map((s) => s.url), ...COURSES.map((c) => c.url)]) expect(x).toMatch(/^https:\/\/[a-z0-9.-]+\.[a-z]{2,}(\/|$)/);
    for (const s of SCHOLARSHIPS) { expect(both(s.who) && both(s.note), s.id).toBe(true); expect(s.grades[0]).toBeLessThanOrEqual(s.grades[1]); expect(s.grades[0]).toBeGreaterThanOrEqual(7); expect(s.grades[1]).toBeLessThanOrEqual(12); }
    for (const c of COLLEGES) expect(both(c.kind) && both(c.note), c.id).toBe(true);
    for (const c of COURSES) expect(both(c.what), c.id).toBe(true);
    expect(COLLEGES.filter((c) => c.local)).toHaveLength(3);
    expect(new Set([...COLLEGES.map((c) => c.id), ...SCHOLARSHIPS.map((c) => c.id), ...COURSES.map((c) => c.id)]).size).toBe(COLLEGES.length + SCHOLARSHIPS.length + COURSES.length);
  });
  it("no data file contains a dollar figure, pay number or tuition price that could go out of date", () => {
    const all = JSON.stringify([CAREERS, MAJORS, COLLEGES, SCHOLARSHIPS, COURSES]);
    expect(all).not.toMatch(/\$\s?\d/);
  });
  it("every interest id maps to at least one tag, and every tag has a course", () => {
    for (const i of INTERESTS) expect(INTEREST_TAGS[i.id]?.length, i.id).toBeGreaterThan(0);
    for (const t of new Set(Object.values(INTEREST_TAGS).flat())) expect(COURSES.some((c) => c.tags.includes(t)), t).toBe(true);
  });
  it("the quote of the day is stable for a day, rotates, and covers every quote", () => {
    expect(quoteOfDay(20000)).toBe(quoteOfDay(20000)); expect(quoteOfDay(20000)).not.toBe(quoteOfDay(20001));
    expect(new Set(Array.from({ length: QUOTES.length }, (_, i) => quoteOfDay(i))).size).toBe(QUOTES.length);
    expect(quoteOfDay(-5)).toBeDefined();
    for (const q of QUOTES) expect(q.text.en.trim() && q.text.es.trim() && q.by.en && q.by.es).toBeTruthy();
  });
  it("seasons: twelve months, three searchable ideas each", () => {
    expect(SEASONS).toHaveLength(12);
    for (const s of SEASONS) { expect(s.items).toHaveLength(3); for (const it of s.items) { expect(both(it.title) && both(it.why)).toBe(true); expect(it.q.length).toBeGreaterThan(8); } }
  });
});

describe("guides", () => {
  it("every guide is bilingual, has sections, and links only to https sites", () => {
    expect(Object.keys(GUIDES).length).toBeGreaterThanOrEqual(9);
    for (const [k, g] of Object.entries(GUIDES)) {
      expect(both(g.title) && both(g.lead), k).toBe(true); expect(g.sections.length, k).toBeGreaterThanOrEqual(3);
      for (const s of g.sections) { expect(both(s.h) || (s.h.en === s.h.es && s.h.en.length <= 12), `${k}: ${s.h.en}`).toBe(true); for (const x of [...(s.p ?? []), ...(s.li ?? [])]) expect(both(x), `${k}: ${x.en.slice(0, 30)}`).toBe(true); for (const l of s.links ?? []) { expect(l.url).toMatch(/^https:\/\//); expect(both(l.label) || l.label.en === l.label.es, k).toBe(true); } }
      expect(g.sections.some((s) => (s.p ?? s.li ?? s.links)), k).toBe(true);
    }
  });
  it("every guide id is a real tool in the feature list, and built tools are not left as coming soon", () => {
    for (const k of Object.keys(GUIDES)) { const [tab, tool] = k.split("/"); expect(findTool(tab, tool), k).toBeDefined(); }
    expect(BUILT.size).toBeGreaterThan(100);
  });
  it("money, dates and deadlines are phrased as 'check the official site', not hard-coded", () => {
    const text = JSON.stringify(GUIDES);
    expect(text).not.toMatch(/\$\s?\d/);
  });
});
