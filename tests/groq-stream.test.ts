import { describe, it, expect, vi } from "vitest";
vi.mock("server-only", () => ({}));
describe("stream", () => {
  it("survives chunks with no text", async () => {
    const lines = [
      'data: {"choices":[{"delta":{"role":"assistant","reasoning":"hmm"}}]}\n\n',
      'data: {"choices":[{"delta":{"reasoning":"more"}}]}\n\n',
      'data: {"choices":[{"delta":{"content":"Hello"}}]}\n\n',
      'data: {"choices":[{"delta":{"content":" there"}}]}\n\n',
      "data: [DONE]\n\n",
    ];
    const body = new ReadableStream({ async start(c) { for (const l of lines) { c.enqueue(new TextEncoder().encode(l)); await new Promise((r) => setTimeout(r, 5)); } c.close(); } });
    vi.stubGlobal("fetch", vi.fn(async (u: string) => String(u).endsWith("/models") ? new Response(JSON.stringify({ data: [{ id: "openai/gpt-oss-120b" }] })) : new Response(body, { status: 200 })));
    process.env.GROQ_API_KEY = "x";
    const { groqStream } = await import("@/lib/ai/groq");
    const text = await new Response(await groqStream({ model: "openai/gpt-oss-120b", timeoutSeconds: 5, messages: [{ role: "user", content: "hi" }] })).text();
    expect(text).toBe("Hello there");
  });
});

describe("model fallback", () => {
  it("tries the next model when one is rate limited", async () => {
    const used: string[] = [];
    vi.stubGlobal("fetch", vi.fn(async (u: string, init?: RequestInit) => {
      if (String(u).endsWith("/models")) return new Response(JSON.stringify({ data: [{ id: "openai/gpt-oss-120b" }, { id: "openai/gpt-oss-20b" }] }));
      const model = JSON.parse(String(init?.body)).model as string;
      used.push(model);
      return model === "openai/gpt-oss-120b"
        ? new Response('{"error":{"message":"Rate limit reached"}}', { status: 429 })
        : new Response(JSON.stringify({ choices: [{ message: { content: "ok from 20b" } }] }));
    }));
    process.env.GROQ_API_KEY = "x";
    vi.resetModules();
    const { groqChat } = await import("@/lib/ai/groq");
    const r = await groqChat({ model: "llama-3.3-70b-versatile", timeoutSeconds: 5, messages: [{ role: "user", content: "hi" }] });
    expect(r.content).toBe("ok from 20b");
    expect(used).toEqual(["openai/gpt-oss-120b", "openai/gpt-oss-20b"]);
  });
});
