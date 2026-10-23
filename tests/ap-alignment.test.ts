import { describe, expect, it } from "vitest";
import { AP_COURSES } from "@/lib/exam/ap";
import { AP_PROFILES, AP_TOPIC_BRIEFS, AP_TOPIC_CONTEXTS, AP_UNIT_BRIEFS } from "@/data/ap/briefs";

describe("AP briefs line up with the outline", () => {
  it("every course has a profile and one unit brief per unit", () => {
    for (const c of AP_COURSES) {
      expect(AP_PROFILES[c.en], `${c.en} profile`).toBeTruthy();
      expect(AP_UNIT_BRIEFS[c.en]?.length, `${c.en} unit briefs`).toBe(c.units.length);
    }
  });
  it("topic briefs and contexts, where they exist, match the topics one to one", () => {
    for (const [src, label] of [[AP_TOPIC_BRIEFS, "brief"], [AP_TOPIC_CONTEXTS, "context"]] as const) {
      for (const [name, units] of Object.entries(src)) {
        const c = AP_COURSES.find((x) => x.en === name);
        expect(c, `${label}: ${name} is a course`).toBeTruthy();
        expect(units.length, `${name} ${label} units`).toBe(c!.units.length);
        units.forEach((u, i) => expect(u.length, `${name} unit ${i + 1} ${label}s`).toBe(c!.units[i].topics.length));
      }
    }
  });
  it("only lists courses that still exist", () => {
    expect(AP_COURSES.map((c) => c.en)).not.toContain("AP Studio Art");
  });
});

describe("AP mock exam lengths", () => {
  it("name only real courses, and use the real multiple-choice length for Biology and Statistics", async () => {
    const { AP_MC_FORMAT, AP_SECTIONS } = await import("@/lib/exam/ap");
    for (const id of Object.keys(AP_MC_FORMAT)) expect(AP_COURSES.map((c) => c.id), id).toContain(id);
    expect(AP_SECTIONS.find((s) => s.id === "ap-biology")).toMatchObject({ questions: 60, minutes: 90 });
    expect(AP_SECTIONS.find((s) => s.id === "apstats")).toMatchObject({ questions: 42, minutes: 90 });
  });
});

describe("outline revision", () => {
  it("stops serving AP questions written for an older outline, but keeps other tests and seed questions", async () => {
    const { isCurrent, OUTLINE_REV } = await import("@/lib/exam/rev");
    expect(isCurrent({ exam: "ap", source: "generated", rev: OUTLINE_REV })).toBe(true);
    expect(isCurrent({ exam: "ap", source: "generated" })).toBe(false);
    expect(isCurrent({ exam: "ap", source: "generated", rev: "2501" })).toBe(false);
    expect(isCurrent({ exam: "ap", source: "seed" })).toBe(true);
    expect(isCurrent({ exam: "sat", source: "generated" })).toBe(true);
  });
});
