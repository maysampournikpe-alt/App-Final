import { beforeEach, describe, expect, it, vi } from "vitest";
vi.mock("server-only", () => ({}));

const store = new Map<string, { value: unknown; compact: boolean; ageMs: number }>();
const puts: { key: string; compact: boolean }[] = [];
vi.mock("@/lib/ai/doc-cache", async () => {
  const real = await vi.importActual<typeof import("@/lib/ai/doc-cache")>("@/lib/ai/doc-cache");
  return {
    ...real,
    docGet: async (k: string) => store.get(k) ?? null,
    docPut: async (key: string, value: unknown, compact: boolean) => { puts.push({ key, compact }); store.set(key, { value, compact, ageMs: 0 }); },
  };
});

const post = (body: object) => new Request("http://x/api/learn", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
beforeEach(() => { store.clear(); puts.length = 0; process.env.AI_FIXTURES = "1"; delete process.env.CLOUDFLARE_ACCOUNT_ID; delete process.env.CLOUDFLARE_API_TOKEN; });

describe("shared saved copies of notes, vocabulary and cram sheets", () => {
  it("the first student makes it, the second gets the saved copy without the AI", async () => {
    const { POST } = await import("@/app/api/learn/route");
    const body = { track: "ap", section: "ap-biology", skill: "u1", topic: "u1-1", kind: "notes", lang: "en" };
    const first = await (await POST(post(body))).json();
    expect(first.ok).toBe(true); expect(first.notes.sections.length).toBeGreaterThan(2);
    expect(puts).toHaveLength(1); expect(puts[0].key).toMatch(/^doc:d2:notes:ap:ap-biology:u1:u1-1:en$/);
    // Make the saved copy recognizable, then ask again: the saved copy comes back and nothing new is saved.
    store.get(puts[0].key)!.value = { ...first.notes, summary: "SAVED COPY ".repeat(6) };
    const second = await (await POST(post(body))).json();
    expect(second.notes.summary).toMatch(/^SAVED COPY/); expect(puts).toHaveLength(1);
  });
  it("a shortened copy (made without Claude) is marked, and terms and cram sheets are saved and served in their own shapes", async () => {
    const { POST } = await import("@/app/api/learn/route");
    await POST(post({ track: "ap", section: "ap-biology", skill: "u1", kind: "notes", lang: "es" }));
    expect(puts[0].compact).toBe(true);
    const t = await (await POST(post({ track: "sat", section: "math", skill: "algebra", kind: "terms", lang: "en" }))).json();
    expect(Array.isArray(t.terms)).toBe(true);
    const t2 = await (await POST(post({ track: "sat", section: "math", skill: "algebra", kind: "terms", lang: "en" }))).json();
    expect(t2.terms).toEqual(t.terms);
    const c = await (await POST(post({ track: "act", section: "science", skill: "evaluation-of-models", kind: "cram", lang: "en" }))).json();
    expect(c.cram.mustKnow.length).toBeGreaterThan(3);
    const c2 = await (await POST(post({ track: "act", section: "science", skill: "evaluation-of-models", kind: "cram", lang: "en" }))).json();
    expect(c2.cram).toEqual(c.cram);
  });
  it("a bad saved copy is ignored and made again", async () => {
    const { POST } = await import("@/app/api/learn/route");
    store.set("doc:d2:terms:sat:math:algebra::en", { value: "garbage", compact: false, ageMs: 10 });
    const r = await (await POST(post({ track: "sat", section: "math", skill: "algebra", kind: "terms", lang: "en" }))).json();
    expect(Array.isArray(r.terms)).toBe(true);
  });
  it("an old shortened copy is replaced once Claude is on, a fresh full copy is kept", async () => {
    const { docFresh } = await import("@/lib/ai/doc-cache");
    const day = 24 * 3600_000;
    expect(docFresh({ value: 1, compact: true, ageMs: 3 * day }, false)).toBe(false); // too old
    expect(docFresh({ value: 1, compact: true, ageMs: 1 * day }, false)).toBe(true);  // still good while only Groq is available
    expect(docFresh({ value: 1, compact: true, ageMs: 1 * day }, true)).toBe(false);  // Claude is on now: write a full one
    expect(docFresh({ value: 1, compact: false, ageMs: 20 * day }, true)).toBe(true);
    expect(docFresh({ value: 1, compact: false, ageMs: 31 * day }, true)).toBe(false);
  });
});
