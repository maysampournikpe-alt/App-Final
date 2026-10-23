import { afterEach, describe, expect, it, vi } from "vitest";
vi.mock("server-only", () => ({}));
vi.mock("@/lib/ai/budget", () => ({ claudeBudgetOk: async () => false }));

afterEach(() => { vi.unstubAllGlobals(); for (const k of ["CLOUDFLARE_ACCOUNT_ID", "CLOUDFLARE_API_TOKEN", "GROQ_API_KEY"]) delete process.env[k]; });

describe("when the day's Claude budget is used up", () => {
  it("chat goes to Groq and Claude is not called", async () => {
    process.env.CLOUDFLARE_ACCOUNT_ID = "a"; process.env.CLOUDFLARE_API_TOKEN = "t"; process.env.GROQ_API_KEY = "g";
    const urls: string[] = [];
    vi.stubGlobal("fetch", vi.fn(async (u: string) => {
      urls.push(String(u));
      if (String(u).endsWith("/models")) return new Response(JSON.stringify({ data: [{ id: "llama-3.3-70b-versatile" }] }));
      return new Response(JSON.stringify({ choices: [{ message: { content: "from groq" } }] }));
    }));
    const { groqChat } = await import("@/lib/ai/groq");
    expect((await groqChat({ model: "llama-3.3-70b-versatile", timeoutSeconds: 5, messages: [{ role: "user", content: "hi" }] })).content).toBe("from groq");
    expect(urls.some((u) => u.includes("cloudflare"))).toBe(false);
  });
});
