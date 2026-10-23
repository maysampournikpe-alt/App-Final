import { afterEach, describe, expect, it, vi } from "vitest";
vi.mock("server-only", () => ({}));

afterEach(() => { vi.unstubAllGlobals(); delete process.env.GROQ_API_KEY; });

describe("reading how long Groq says to wait", () => {
  it("understands the header and the message forms", async () => {
    const { retryDelayMs } = await import("@/lib/ai/groq");
    expect(retryDelayMs(new Headers({ "retry-after": "3" }), "")).toBe(3000);
    expect(retryDelayMs(new Headers(), "Rate limit reached. Please try again in 1.5s. Need more tokens?")).toBe(1500);
    expect(retryDelayMs(new Headers(), "Please try again in 850ms.")).toBe(850);
    expect(retryDelayMs(new Headers(), "Please try again in 2m3.5s.")).toBe(123500);
    expect(retryDelayMs(new Headers(), "no hint here")).toBeNull();
  });
});

describe("waiting out a per-minute limit", () => {
  const models = JSON.stringify({ data: [{ id: "openai/gpt-oss-120b" }, { id: "openai/gpt-oss-20b" }] });
  it("waits a short time and tries again instead of failing", async () => {
    process.env.GROQ_API_KEY = "x";
    let chats = 0;
    vi.stubGlobal("fetch", vi.fn(async (u: string) => {
      if (String(u).endsWith("/models")) return new Response(models);
      chats++;
      return chats <= 2 ? new Response('{"error":{"message":"Rate limit reached on tokens per minute. Please try again in 50ms."}}', { status: 429 }) : new Response(JSON.stringify({ choices: [{ message: { content: "ok after waiting" } }] }));
    }));
    const { groqChat } = await import("@/lib/ai/groq");
    expect((await groqChat({ model: "openai/gpt-oss-120b", timeoutSeconds: 20, messages: [{ role: "user", content: "hi" }] })).content).toBe("ok after waiting");
    expect(chats).toBe(3);
  });
  it("does not wait when Groq says to come back much later (a daily limit)", async () => {
    process.env.GROQ_API_KEY = "x";
    let chats = 0;
    vi.stubGlobal("fetch", vi.fn(async (u: string) => {
      if (String(u).endsWith("/models")) return new Response(models);
      chats++;
      return new Response('{"error":{"message":"Rate limit reached on tokens per day. Please try again in 1h10m2s."}}', { status: 429 });
    }));
    const { groqChat } = await import("@/lib/ai/groq");
    await expect(groqChat({ model: "openai/gpt-oss-120b", timeoutSeconds: 20, messages: [{ role: "user", content: "hi" }] })).rejects.toMatchObject({ code: "rate" });
    expect(chats).toBe(2); // one try per model, no waiting round
  });
});
