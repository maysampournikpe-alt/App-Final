import { afterEach, describe, expect, it, vi } from "vitest";
vi.mock("server-only", () => ({}));

const req = (body: unknown) => new Request("http://x/api", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });

describe("the plan builder and the finder answer a crisis with the fixed caring message", () => {
  it("plan: no AI call, the help lines in English and Spanish", async () => {
    const fetchSpy = vi.fn(); vi.stubGlobal("fetch", fetchSpy);
    const { POST } = await import("@/app/api/plan/route");
    const en = await (await POST(req({ goal: "I want to kill myself", lang: "en" }))).json();
    expect(en).toMatchObject({ ok: false, error: "crisis" }); expect(en.text).toMatch(/988/);
    const es = await (await POST(req({ goal: "quiero hacerme daño", lang: "es" }))).json();
    expect(es.error).toBe("crisis"); expect(es.text).toMatch(/988/);
    const adj = await (await POST(req({ goal: "Learn guitar", lang: "en", adjust: { instruction: "I want to end my life", plan: "{}" } }))).json();
    expect(adj.error).toBe("crisis");
    expect(fetchSpy).not.toHaveBeenCalled();
    vi.unstubAllGlobals();
  });
  it("find: no search, the help lines, and a normal search is not caught", async () => {
    const fetchSpy = vi.fn(); vi.stubGlobal("fetch", fetchSpy);
    const { POST } = await import("@/app/api/find/route");
    const r = await (await POST(req({ query: "I want to kill myself", lang: "en" }))).json();
    expect(r).toMatchObject({ ok: false, error: "crisis" }); expect(r.text).toMatch(/988/);
    expect(fetchSpy).not.toHaveBeenCalled();
    vi.unstubAllGlobals();
  });
});

describe("Claude spending cap", () => {
  const keys = ["CLAUDE_DAILY_CALLS", "NEXT_PUBLIC_SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY"];
  const saved: Record<string, string | undefined> = {};
  afterEach(() => { for (const k of keys) { if (saved[k] === undefined) delete process.env[k]; else process.env[k] = saved[k]; } });
  const prep = () => { for (const k of keys) { saved[k] = process.env[k]; delete process.env[k]; } };
  it("defaults to 1500 a day, reads the setting, and 0 means Claude is off", async () => {
    prep();
    const { claudeDailyCap, claudeBudgetOk } = await import("@/lib/ai/budget");
    expect(claudeDailyCap()).toBe(1500);
    process.env.CLAUDE_DAILY_CALLS = "300"; expect(claudeDailyCap()).toBe(300);
    process.env.CLAUDE_DAILY_CALLS = "garbage"; expect(claudeDailyCap()).toBe(1500);
    process.env.CLAUDE_DAILY_CALLS = "0"; expect(claudeDailyCap()).toBe(0); expect(await claudeBudgetOk()).toBe(false);
  });
  it("is not limited when there is no database (local work)", async () => {
    prep();
    const { claudeBudgetOk } = await import("@/lib/ai/budget");
    expect(await claudeBudgetOk()).toBe(true);
  });
});
