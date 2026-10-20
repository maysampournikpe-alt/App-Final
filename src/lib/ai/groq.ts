import "server-only";
import { AI } from "@/config/ai";

export type AiErrorCode = "unavailable" | "auth" | "model" | "rate" | "timeout" | "upstream" | "empty";
export class AiError extends Error {
  constructor(public code: AiErrorCode, detail?: string) {
    super(detail ? `${code}: ${detail}` : code);
  }
}

export interface ChatArgs {
  model: string;
  messages: { role: "system" | "user" | "assistant"; content: string }[];
  timeoutSeconds: number;
  temperature?: number;
  /** Compound only: sites the search must skip. */
  excludeDomains?: readonly string[];
  maxTokens?: number;
}
export interface ChatReply { content: string; searched: { title: string; url: string }[] }

/** Finds every page the search tool returned, wherever the provider put it. */
export function collectSearched(node: unknown, out: { title: string; url: string }[] = [], depth = 0): { title: string; url: string }[] {
  if (!node || typeof node !== "object" || depth > 8) return out;
  if (Array.isArray(node)) { node.forEach((n) => collectSearched(n, out, depth + 1)); return out; }
  const o = node as Record<string, unknown>;
  if (typeof o.url === "string" && /^https?:\/\//i.test(o.url)) out.push({ title: typeof o.title === "string" ? o.title : o.url, url: o.url });
  for (const v of Object.values(o)) if (v && typeof v === "object") collectSearched(v, out, depth + 1);
  return out;
}

let modelCache: { at: number; ids: string[] } | null = null;

/** Model ids this Groq account can use, cached for ten minutes. Empty when Groq cannot be asked. */
export async function availableModels(key: string): Promise<string[]> {
  if (modelCache && Date.now() - modelCache.at < 10 * 60_000) return modelCache.ids;
  try {
    const res = await fetch(`${AI.baseUrl}/models`, { headers: { Authorization: `Bearer ${key}` }, signal: AbortSignal.timeout(6000) });
    if (!res.ok) return [];
    const ids: string[] = ((await res.json()).data ?? []).map((m: { id: string }) => m.id);
    modelCache = { at: Date.now(), ids };
    return ids;
  } catch {
    return [];
  }
}

/** The configured model if the account has it, else the first listed fallback it has, else the configured name. */
async function pickModel(wanted: string, key: string): Promise<string> {
  const ids = await availableModels(key);
  if (!ids.length || ids.includes(wanted)) return wanted;
  const pool = wanted.includes("compound") ? AI.fallbacks.search : AI.fallbacks.chat;
  const found = pool.find((m) => ids.includes(m));
  if (found) console.warn(`groq model ${wanted} not in account, using ${found}`);
  return found ?? wanted;
}

const fixture = (kind?: string): ChatReply => kind === "plan" ? ({
  content: JSON.stringify({
    title: "Fixture plan", summary: "A plan made by the test fixture.", searchIdeas: ["chess clubs near me"],
    horizons: [
      { horizon: "week", steps: ["Do the first small thing", "Tell someone your goal"] },
      { horizon: "month", steps: ["Practice three times a week", "Find a mentor or friend"] },
      { horizon: "year", steps: ["Enter an event", "Review how far you came"] },
    ],
  }),
  searched: [],
}) : ({
  content: JSON.stringify({
    listings: [{
      title: "Sample chess club (fixture)", organization: "Sample Library", description: "Weekly beginner chess.",
      category: "club", cost: "free", grades: "6-8", location: "Edinburg, TX", online: false,
      sourceUrl: "https://example.org/chess", whyFits: "Matches your interest in chess.",
    }],
    notConfirmed: [{ name: "Edinburg Public Library", why: "Often hosts youth clubs.", contact: "Front desk" }],
    emailScript: "Hello, I am a student interested in chess. Do you have a youth club? Thank you, [Your name]",
    phoneScript: "Hi, my name is [Your name]. I am looking for a youth chess club. Do you know of one?",
  }),
  searched: [{ title: "Sample", url: "https://example.org/chess" }],
});

export async function groqChat(args: ChatArgs): Promise<ChatReply> {
  if (process.env.AI_FIXTURES === "1") return fixture(args.messages[0]?.content.includes("goal plans") ? "plan" : undefined); // local testing without a key
  const key = process.env.GROQ_API_KEY;
  if (!key) throw new AiError("unavailable");

  const model = await pickModel(args.model, key);
  const isCompound = model.includes("compound");
  const wantsSearch = args.model.includes("compound");
  const isGptOss = model.startsWith("openai/gpt-oss");
  const body: Record<string, unknown> = {
    model,
    // gpt-oss has no Compound-style search, but Groq gives it a built-in browser tool.
    ...(wantsSearch && !isCompound && isGptOss ? { tools: [{ type: "browser_search" }], tool_choice: "auto" } : {}),
    ...(isGptOss ? { reasoning_effort: "low" } : {}),
    messages: args.messages,
    temperature: args.temperature ?? 0.2,
    // Always cap the answer: Groq counts the cap (not the real length) against the per-minute limit,
    // and a model's default cap is huge.
    max_tokens: (args.maxTokens ?? 3000) + (isGptOss ? 1500 : 0),
    ...(isCompound && args.excludeDomains?.length ? { search_settings: { exclude_domains: [...args.excludeDomains] } } : {}),
  };
  let res: Response;
  try {
    res = await fetch(`${AI.baseUrl}/chat/completions`, {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(args.timeoutSeconds * 1000),
    });
  } catch (e) {
    throw new AiError((e as Error).name === "TimeoutError" ? "timeout" : "upstream");
  }
  if (!res.ok) {
    const detail = (await res.text().catch(() => "")).slice(0, 300); // logged on the server only
    console.error("groq error", res.status, detail);
    throw new AiError(res.status === 401 || res.status === 403 ? "auth" : res.status === 404 ? "model" : res.status === 429 ? "rate" : "upstream", `${res.status} ${detail.replace(/\s+/g, " ").slice(0, 220)}`);
  }
  const json = await res.json();
  const message = json?.choices?.[0]?.message;
  const content: string = typeof message?.content === "string" ? message.content : "";
  if (!content.trim()) throw new AiError("empty");
  const seen = new Set<string>();
  const searched = collectSearched(message?.executed_tools ?? json?.executed_tools).filter((s) => !seen.has(s.url) && seen.add(s.url));
  return { content, searched };
}

/**
 * Streams plain text as the model writes it, so students see words right away.
 * Failures before the first byte throw an AiError. A failure mid-stream just ends the text.
 */
export async function groqStream(args: ChatArgs): Promise<ReadableStream<Uint8Array>> {
  const enc = new TextEncoder();
  if (process.env.AI_FIXTURES === "1") {
    const words = "This is a fixture answer so you can test the chat without a key. Ask me anything!".split(" ");
    return new ReadableStream({
      async start(c) {
        for (const w of words) { c.enqueue(enc.encode(w + " ")); await new Promise((r) => setTimeout(r, 40)); }
        c.close();
      },
    });
  }
  const key = process.env.GROQ_API_KEY;
  if (!key) throw new AiError("unavailable");
  const model = await pickModel(args.model, key);
  let res: Response;
  try {
    res = await fetch(`${AI.baseUrl}/chat/completions`, {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({ model, ...(model.startsWith("openai/gpt-oss") ? { reasoning_effort: "low" } : {}), messages: args.messages, temperature: args.temperature ?? 0.5, stream: true, ...(args.maxTokens ? { max_tokens: args.maxTokens + (model.startsWith("openai/gpt-oss") ? 1500 : 0) } : {}) }),
      signal: AbortSignal.timeout(args.timeoutSeconds * 1000),
    });
  } catch (e) {
    throw new AiError((e as Error).name === "TimeoutError" ? "timeout" : "upstream");
  }
  if (!res.ok || !res.body) {
    console.error("groq stream error", res.status, (await res.text().catch(() => "")).slice(0, 300));
    throw new AiError(res.status === 401 || res.status === 403 ? "auth" : res.status === 404 ? "model" : res.status === 429 ? "rate" : "upstream", String(res.status));
  }
  const { parseSseText } = await import("./coach");
  const reader = res.body.getReader();
  const dec = new TextDecoder();
  let buf = "";
  return new ReadableStream({
    async pull(c) {
      // Keep reading until there is text to hand over: a chunk with no text (the model's hidden
      // reasoning) must not end this pull, or the stream stalls waiting for a call that never comes.
      try {
        for (;;) {
          const { value, done } = await reader.read();
          if (done) return c.close();
          buf += dec.decode(value, { stream: true });
          const out = parseSseText(buf);
          buf = out.rest;
          if (out.text) c.enqueue(enc.encode(out.text));
          if (out.done) { c.close(); reader.cancel().catch(() => {}); return; }
          if (out.text) return;
        }
      } catch {
        c.close();
      }
    },
    cancel() { reader.cancel().catch(() => {}); },
  });
}
