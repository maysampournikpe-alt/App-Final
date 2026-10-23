import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
vi.mock("server-only", () => ({}));
import { claudeBody, claudeConfigured, claudeText, claudeUsable, DEFAULT_CLAUDE_MODEL, resumeClaude } from "@/lib/ai/claude";
import { parseSseText } from "@/lib/ai/coach";

const ENV_KEYS = ["CLOUDFLARE_ACCOUNT_ID", "CLOUDFLARE_API_TOKEN", "AI_PROVIDER", "GROQ_API_KEY", "CLAUDE_MODEL"];
const saved: Record<string, string | undefined> = {};
beforeEach(() => { for (const k of ENV_KEYS) { saved[k] = process.env[k]; delete process.env[k]; } });
afterEach(() => { resumeClaude(); for (const k of ENV_KEYS) { if (saved[k] === undefined) delete process.env[k]; else process.env[k] = saved[k]; } vi.unstubAllGlobals(); });

describe("claude request and reply shapes", () => {
  it("keeps the system text apart and starts and alternates with user turns", () => {
    const b = JSON.parse(claudeBody({ timeoutSeconds: 5, temperature: 0.3, maxTokens: 500, messages: [{ role: "system", content: "Be brief." }, { role: "user", content: "a" }, { role: "user", content: "b" }, { role: "assistant", content: "c" }, { role: "user", content: "d" }] }, false));
    expect(b.model).toBe(DEFAULT_CLAUDE_MODEL); expect(b.system).toBe("Be brief."); expect(b.max_tokens).toBe(500); expect(b.temperature).toBe(0.3);
    expect(b.messages).toEqual([{ role: "user", content: "a\n\nb" }, { role: "assistant", content: "c" }, { role: "user", content: "d" }]);
    expect(b.stream).toBeUndefined();
  });
  it("adds a first user turn when there is only a system message, caps temperature, and can stream or drop temperature", () => {
    const b = JSON.parse(claudeBody({ timeoutSeconds: 5, temperature: 2, messages: [{ role: "system", content: "Write JSON." }] }, true));
    expect(b.messages[0].role).toBe("user"); expect(b.temperature).toBe(1); expect(b.stream).toBe(true); expect(b.max_tokens).toBe(3000);
    expect(JSON.parse(claudeBody({ timeoutSeconds: 5, temperature: 0.2, messages: [{ role: "user", content: "x" }] }, false, "m", false)).temperature).toBeUndefined();
  });
  it("reads the text of a reply in either shape", () => {
    expect(claudeText({ content: [{ type: "text", text: "Hello " }, { type: "text", text: "there" }] })).toBe("Hello there");
    expect(claudeText({ choices: [{ message: { content: "from chat shape" } }] })).toBe("from chat shape");
    expect(claudeText({ result: { content: [{ type: "text", text: "wrapped" }] } })).toBe("wrapped");
    expect(claudeText({})).toBe("");
  });
  it("reads Claude's streaming events as well as chat-completions chunks", () => {
    const sse = 'event: content_block_delta\ndata: {"type":"content_block_delta","delta":{"type":"text_delta","text":"Hi"}}\n\nevent: content_block_delta\ndata: {"type":"content_block_delta","delta":{"type":"text_delta","text":" you"}}\n\nevent: message_stop\ndata: {"type":"message_stop"}\n\n';
    expect(parseSseText(sse)).toMatchObject({ text: "Hi you", done: true });
    expect(parseSseText('data: {"choices":[{"delta":{"content":"ok"}}]}\n\n').text).toBe("ok");
  });
  it("is on only when both Cloudflare values are set, and AI_PROVIDER=groq turns it off", () => {
    expect(claudeConfigured()).toBe(false);
    process.env.CLOUDFLARE_ACCOUNT_ID = "acct"; expect(claudeConfigured()).toBe(false);
    process.env.CLOUDFLARE_API_TOKEN = "tok"; expect(claudeConfigured()).toBe(true);
    process.env.AI_PROVIDER = "groq"; expect(claudeConfigured()).toBe(false);
  });
});

describe("groqChat with Claude turned on", () => {
  const claudeOk = () => new Response(JSON.stringify({ content: [{ type: "text", text: "from claude" }] }));
  const setup = () => { process.env.CLOUDFLARE_ACCOUNT_ID = "acct"; process.env.CLOUDFLARE_API_TOKEN = "tok"; };
  it("sends chat to the Cloudflare messages endpoint with the token and returns the text", async () => {
    setup();
    const calls: { url: string; auth: string | null; body: { model: string } }[] = [];
    vi.stubGlobal("fetch", vi.fn(async (u: string, init?: RequestInit) => { calls.push({ url: String(u), auth: new Headers(init?.headers).get("authorization"), body: JSON.parse(String(init?.body)) }); return claudeOk(); }));
    const { groqChat } = await import("@/lib/ai/groq");
    const r = await groqChat({ model: "llama-3.3-70b-versatile", timeoutSeconds: 5, messages: [{ role: "user", content: "hi" }] });
    expect(r).toEqual({ content: "from claude", searched: [] });
    expect(calls).toHaveLength(1); expect(calls[0].url).toBe("https://api.cloudflare.com/client/v4/accounts/acct/ai/v1/messages");
    expect(calls[0].auth).toBe("Bearer tok"); expect(calls[0].body.model).toBe("anthropic/claude-sonnet-5");
  });
  it("falls back to Groq when Claude fails and a Groq key exists", async () => {
    setup(); process.env.GROQ_API_KEY = "g";
    vi.stubGlobal("fetch", vi.fn(async (u: string) => {
      if (String(u).includes("cloudflare")) return new Response("{}", { status: 500 });
      if (String(u).endsWith("/models")) return new Response(JSON.stringify({ data: [{ id: "llama-3.3-70b-versatile" }] }));
      return new Response(JSON.stringify({ choices: [{ message: { content: "from groq" } }] }));
    }));
    const { groqChat } = await import("@/lib/ai/groq");
    expect((await groqChat({ model: "llama-3.3-70b-versatile", timeoutSeconds: 5, messages: [{ role: "user", content: "hi" }] })).content).toBe("from groq");
  });
  it("reports the error when Claude fails and there is no Groq key", async () => {
    setup();
    vi.stubGlobal("fetch", vi.fn(async () => new Response("{}", { status: 429 })));
    const { groqChat } = await import("@/lib/ai/groq");
    await expect(groqChat({ model: "llama-3.3-70b-versatile", timeoutSeconds: 5, messages: [{ role: "user", content: "hi" }] })).rejects.toMatchObject({ code: "rate" });
  });
  it("keeps web search on Groq even when Claude is on", async () => {
    setup(); process.env.GROQ_API_KEY = "g";
    const urls: string[] = [];
    vi.stubGlobal("fetch", vi.fn(async (u: string) => {
      urls.push(String(u));
      if (String(u).endsWith("/models")) return new Response(JSON.stringify({ data: [{ id: "groq/compound" }] }));
      return new Response(JSON.stringify({ choices: [{ message: { content: "search answer" } }] }));
    }));
    const { groqChat } = await import("@/lib/ai/groq");
    expect((await groqChat({ model: "groq/compound", timeoutSeconds: 5, messages: [{ role: "user", content: "find" }] })).content).toBe("search answer");
    expect(urls.some((u) => u.includes("cloudflare"))).toBe(false);
  });
  it("streams Claude's reply", async () => {
    setup();
    const lines = ['data: {"type":"content_block_delta","delta":{"type":"text_delta","text":"Hel"}}\n\n', 'data: {"type":"content_block_delta","delta":{"type":"text_delta","text":"lo"}}\n\n', 'data: {"type":"message_stop"}\n\n'];
    const body = new ReadableStream({ start(c) { for (const l of lines) c.enqueue(new TextEncoder().encode(l)); c.close(); } });
    vi.stubGlobal("fetch", vi.fn(async () => new Response(body)));
    const { groqStream } = await import("@/lib/ai/groq");
    expect(await new Response(await groqStream({ model: "llama-3.3-70b-versatile", timeoutSeconds: 5, messages: [{ role: "user", content: "hi" }] })).text()).toBe("Hello");
  });
  it("retries without temperature when the model refuses it", async () => {
    setup();
    const bodies: { temperature?: number }[] = [];
    vi.stubGlobal("fetch", vi.fn(async (_u: string, init?: RequestInit) => {
      const b = JSON.parse(String(init?.body)); bodies.push(b);
      return b.temperature !== undefined ? new Response('{"error":"temperature is not supported for this model"}', { status: 400 }) : claudeOk();
    }));
    const { groqChat } = await import("@/lib/ai/groq");
    expect((await groqChat({ model: "llama-3.3-70b-versatile", timeoutSeconds: 5, temperature: 0.3, messages: [{ role: "user", content: "hi" }] })).content).toBe("from claude");
    expect(bodies).toHaveLength(2); expect(bodies[1].temperature).toBeUndefined();
  });
});

describe("pausing Claude after a refusal", () => {
  const setup = () => { process.env.CLOUDFLARE_ACCOUNT_ID = "acct"; process.env.CLOUDFLARE_API_TOKEN = "tok"; process.env.GROQ_API_KEY = "g"; };
  it("stops asking Claude after a 402 (no credit), and uses Groq meanwhile", async () => {
    setup();
    let claudeCalls = 0;
    vi.stubGlobal("fetch", vi.fn(async (u: string) => {
      if (String(u).includes("cloudflare")) { claudeCalls++; return new Response('{"error":{"message":"Insufficient balance"}}', { status: 402 }); }
      if (String(u).endsWith("/models")) return new Response(JSON.stringify({ data: [{ id: "llama-3.3-70b-versatile" }] }));
      return new Response(JSON.stringify({ choices: [{ message: { content: "from groq" } }] }));
    }));
    const { groqChat } = await import("@/lib/ai/groq");
    const ask = { model: "llama-3.3-70b-versatile", timeoutSeconds: 5, messages: [{ role: "user" as const, content: "hi" }] };
    expect((await groqChat(ask)).content).toBe("from groq");
    expect(claudeUsable()).toBe(false);
    expect((await groqChat(ask)).content).toBe("from groq");
    expect(claudeCalls).toBe(1); // the second request skipped Claude
    resumeClaude(); expect(claudeUsable()).toBe(true);
  });
  it("does not pause for a plain rate limit (429)", async () => {
    setup();
    vi.stubGlobal("fetch", vi.fn(async (u: string) => (String(u).includes("cloudflare") ? new Response("{}", { status: 429 }) : String(u).endsWith("/models") ? new Response(JSON.stringify({ data: [{ id: "llama-3.3-70b-versatile" }] })) : new Response(JSON.stringify({ choices: [{ message: { content: "g" } }] })))));
    const { groqChat } = await import("@/lib/ai/groq");
    await groqChat({ model: "llama-3.3-70b-versatile", timeoutSeconds: 5, messages: [{ role: "user", content: "hi" }] });
    expect(claudeUsable()).toBe(true);
  });
});
