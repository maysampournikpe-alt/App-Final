import { describe, expect, it } from "vitest";
import { cite, citeText, EMPTY_SOURCE, type Source } from "@/lib/citation";
import { planUnits } from "@/lib/apPlan";

const base = (o: Partial<Source>): Source => ({ ...EMPTY_SOURCE, ...o });
describe("citations", () => {
  it("MLA web page with one author", () => {
    const s = base({ authors: [{ first: "Jane", last: "Smith" }], title: "Why Sleep Matters", site: "Teen Health", year: "2024", month: "3", day: "5", url: "https://www.teenhealth.org/sleep" });
    expect(citeText(cite("mla", "web", s))).toBe("Smith, Jane. “Why Sleep Matters.” Teen Health, 5 Mar. 2024. www.teenhealth.org/sleep.");
  });
  it("MLA book with two authors", () => {
    const s = base({ authors: [{ first: "Ana", last: "Lopez" }, { first: "Luis", last: "Cruz" }], title: "River Stories", publisher: "Valley Press", year: "2019" });
    expect(citeText(cite("mla", "book", s))).toBe("Lopez, Ana, and Luis Cruz. River Stories. Valley Press, 2019.");
    expect(cite("mla", "book", s).some((p) => p.i && p.t.includes("River Stories"))).toBe(true);
  });
  it("MLA with three authors uses et al.", () => {
    const s = base({ authors: [{ first: "A", last: "One" }, { first: "B", last: "Two" }, { first: "C", last: "Three" }], title: "T", publisher: "P", year: "2020" });
    expect(citeText(cite("mla", "book", s))).toBe("One, A, et al. T. P, 2020.");
  });
  it("APA web page with full date and initials", () => {
    const s = base({ authors: [{ first: "Maria Elena", last: "Garza" }], title: "How teens study", site: "Study Lab", year: "2023", month: "10", day: "12", url: "https://studylab.org/teens" });
    expect(citeText(cite("apa", "web", s))).toBe("Garza, M. E. (2023, October 12). How teens study. Study Lab. https://studylab.org/teens");
  });
  it("APA book and two authors with ampersand", () => {
    const s = base({ authors: [{ first: "Ana", last: "Lopez" }, { first: "Luis", last: "Cruz" }], title: "River Stories", publisher: "Valley Press", year: "2019" });
    expect(citeText(cite("apa", "book", s))).toBe("Lopez, A., & Cruz, L. (2019). River Stories. Valley Press.");
  });
  it("APA with no author moves the title first and uses n.d. when undated", () => {
    const s = base({ authors: [{ first: "", last: "" }], title: "Texas facts", site: "State Site", url: "https://example.gov/tx" });
    expect(citeText(cite("apa", "web", s))).toBe("Texas facts. (n.d.). State Site. https://example.gov/tx");
  });
  it("articles include volume, issue and pages", () => {
    const s = base({ authors: [{ first: "Sam", last: "Reed" }], title: "Cell growth", container: "Science Today", volume: "12", issue: "3", pages: "45-52", year: "2022" });
    expect(citeText(cite("apa", "article", s))).toBe("Reed, S. (2022). Cell growth. Science Today, 12(3), 45-52.");
    expect(citeText(cite("mla", "article", s))).toBe("Reed, Sam. “Cell growth.” Science Today, vol. 12, no. 3, 2022, pp. 45-52.");
  });
});

describe("AP unit plan", () => {
  it("spreads units in order, before the exam, starting today", () => {
    const p = planUnits(9, "2026-11-01", "2027-05-05")!;
    expect(p.dates).toHaveLength(9);
    expect(p.dates[0]).toBe("2026-11-01");
    expect([...p.dates].sort()).toEqual(p.dates);
    expect(p.dates.at(-1)! < "2027-05-05").toBe(true);
    expect(p.tight).toBe(false);
  });
  it("flags a tight timeline and returns null for bad input", () => {
    expect(planUnits(9, "2026-10-22", "2026-11-01")!.tight).toBe(true);
    expect(planUnits(0, "2026-10-22", "2027-01-01")).toBeNull();
    expect(planUnits(5, "2026-10-22", "2026-10-22")).toBeNull();
    expect(planUnits(5, "2026-10-22", "2026-01-01")).toBeNull();
  });
});

import { matches, outside, weekNumber } from "@/lib/foryou";
import { IDEAS } from "@/data/ideas";
import { INTEREST_IDS } from "@/config/interests";
describe("for you picks", () => {
  it("has one valid idea per interest", () => {
    expect(new Set(IDEAS.map((i) => i.interest)).size).toBe(IDEAS.length);
    for (const i of IDEAS) { expect(INTEREST_IDS.has(i.interest), i.interest).toBe(true); expect(i.q.length).toBeGreaterThan(10); }
    expect(IDEAS.length).toBe(INTEREST_IDS.size);
  });
  it("matches only chosen interests and never repeats", () => {
    const m = matches(["chess", "coding", "art"], null, 0);
    expect(m.map((i) => i.interest).sort()).toEqual(["art", "chess", "coding"]);
  });
  it("outside picks never include chosen interests", () => {
    for (let w = 0; w < 20; w++) for (const i of outside(["chess", "coding"], null, w)) expect(["chess", "coding"]).not.toContain(i.interest);
  });
  it("changes weekly but is stable within a week", () => {
    const a = matches(["chess", "coding", "art", "music"], null, 5, 2).map((i) => i.interest), b = matches(["chess", "coding", "art", "music"], null, 5, 2).map((i) => i.interest), c2 = matches(["chess", "coding", "art", "music"], null, 6, 2).map((i) => i.interest);
    expect(a).toEqual(b); expect(a).not.toEqual(c2);
    expect(weekNumber("2026-10-22")).toBe(weekNumber("2026-10-23"));
  });
  it("respects minimum grade and falls back to a general mix with no interests", () => {
    expect(matches(["law"], 6, 0).length).toBeGreaterThan(0);
    expect(matches(["law"], 6, 0).some((i) => i.interest === "law")).toBe(false);
    expect(matches([], null, 0).length).toBeGreaterThan(2);
  });
});
