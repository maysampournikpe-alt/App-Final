import { describe, expect, it } from "vitest";
import { charCount, copiedShare, fkGrade, sentences, syllables, typingResult, words, wpm } from "@/lib/text";
import { conjugate, ENGLISH_IRREGULAR, sameForm, SPANISH_VERBS } from "@/lib/verbs";

describe("text measures", () => {
  it("counts syllables of common words", () => {
    const cases: [string, number][] = [["cat", 1], ["water", 2], ["beautiful", 3], ["table", 2], ["jumped", 1], ["education", 4], ["the", 1], ["make", 1]];
    for (const [w, n] of cases) expect(syllables(w), w).toBe(n);
  });
  it("counts words and sentences", () => {
    expect(words("Don't stop, ok? Yes!")).toEqual(["Don't", "stop", "ok", "Yes"]);
    expect(sentences("One. Two! Three?")).toBe(3);
    expect(sentences("no end punctuation")).toBe(1);
  });
  it("reports a low grade for simple text and a higher one for dense text", () => {
    const easy = "The cat sat on the mat. The dog ran to the park. We like to play in the sun. It is a fun day for all of us. The bird can fly up high.";
    const hard = "Photosynthesis fundamentally transforms electromagnetic radiation into biochemical energy, enabling autotrophic organisms to synthesize carbohydrates from atmospheric carbon dioxide while simultaneously releasing molecular oxygen into the surrounding environment.";
    const e = fkGrade(easy)!, h = fkGrade(hard + " " + hard)!;
    expect(e.grade).toBeLessThan(4);
    expect(h.grade).toBeGreaterThan(12);
    expect(fkGrade("too short")).toBeNull();
  });
  it("measures copied runs in a paraphrase", () => {
    const orig = "The quick brown fox jumps over the lazy dog near the river bank every morning";
    expect(copiedShare(orig, orig)).toBe(1);
    expect(copiedShare(orig, "A speedy auburn fox leaps across a sleepy hound by the stream each dawn")).toBe(0);
    const part = copiedShare(orig, "Every day, the quick brown fox jumps over the lazy dog and keeps running far away");
    expect(part).toBeGreaterThan(0.3);
    expect(part).toBeLessThan(0.8);
    expect(copiedShare(orig, "")).toBe(0);
  });
  it("computes typing and reading speed", () => {
    expect(wpm(200, 60)).toBe(200);
    expect(wpm(100, 30)).toBe(200);
    expect(wpm(10, 0)).toBe(0);
    expect(typingResult("hello world", "hello world", 12)).toEqual({ wpm: 11, accuracy: 100 });
    expect(typingResult("hello", "hxllo", 60).accuracy).toBe(80);
  });
  it("counts characters", () => { expect(charCount("a b c")).toEqual({ withSpaces: 5, noSpaces: 3 }); });
});

describe("verbs", () => {
  it("conjugates regular Spanish verbs", () => {
    expect(conjugate("hablar", "present")).toEqual(["hablo", "hablas", "habla", "hablamos", "hablan"]);
    expect(conjugate("comer", "present")).toEqual(["como", "comes", "come", "comemos", "comen"]);
    expect(conjugate("vivir", "present")).toEqual(["vivo", "vives", "vive", "vivimos", "viven"]);
    expect(conjugate("hablar", "preterite")).toEqual(["hablé", "hablaste", "habló", "hablamos", "hablaron"]);
    expect(conjugate("vivir", "preterite")).toEqual(["viví", "viviste", "vivió", "vivimos", "vivieron"]);
    expect(conjugate("estudiar", "future")).toEqual(["estudiaré", "estudiarás", "estudiará", "estudiaremos", "estudiarán"]);
  });
  it("uses the written-out irregular forms", () => {
    expect(conjugate("ser", "present")![0]).toBe("soy");
    expect(conjugate("ir", "preterite")).toEqual(conjugate("ser", "preterite"));
    expect(conjugate("tener", "future")).toEqual(["tendré", "tendrás", "tendrá", "tendremos", "tendrán"]);
    expect(conjugate("hacer", "future")![0]).toBe("haré");
    expect(conjugate("ir", "future")![0]).toBe("iré");
    expect(conjugate("hacer", "preterite")![2]).toBe("hizo");
    expect(conjugate("ver", "preterite")![0]).toBe("vi");
  });
  it("has five forms for every listed verb and tense", () => {
    for (const v of SPANISH_VERBS) for (const t of ["present", "preterite", "future"] as const) { const f = conjugate(v.inf, t); expect(f?.length, v.inf + t).toBe(5); }
  });
  it("lists English verbs with distinct, nonempty forms", () => {
    expect(ENGLISH_IRREGULAR.length).toBeGreaterThan(35);
    for (const v of ENGLISH_IRREGULAR) { expect(v.base && v.past && v.participle).toBeTruthy(); }
    expect(new Set(ENGLISH_IRREGULAR.map((v) => v.base)).size).toBe(ENGLISH_IRREGULAR.length);
    expect(sameForm("Was", "was / were")).toBe(true);
    expect(sameForm("went ", "went")).toBe(true);
    expect(sameForm("", "went")).toBe(false);
  });
});

import { buildOutline, outlineText } from "@/lib/outline";
describe("outline builder", () => {
  it("numbers top-level lines with roman numerals", () => {
    expect(buildOutline("Causes\nEffects\nSolutions").map((l) => l.label)).toEqual(["I.", "II.", "III."]);
  });
  it("uses indentation for sublevels and restarts counts", () => {
    const o = buildOutline("Causes\n  Pollution\n  Habitat loss\n    Farming\nEffects\n  Heat");
    expect(o.map((l) => l.label)).toEqual(["I.", "A.", "B.", "1.", "II.", "A."]);
    expect(o.map((l) => l.level)).toEqual([0, 1, 1, 2, 0, 1]);
  });
  it("strips bullets, skips blank lines and treats tabs as indentation", () => {
    const o = buildOutline("- Main idea\n\n\t* detail one\n\t* detail two");
    expect(o.map((l) => l.text)).toEqual(["Main idea", "detail one", "detail two"]);
    expect(outlineText(o)).toBe("I. Main idea\n    A. detail one\n    B. detail two");
  });
  it("handles stepping back more than one level", () => {
    const o = buildOutline("A\n  b\n    c\nD");
    expect(o.map((l) => l.label)).toEqual(["I.", "A.", "1.", "II."]);
  });
  it("returns nothing for empty input", () => { expect(buildOutline("  \n\n")).toEqual([]); });
});
