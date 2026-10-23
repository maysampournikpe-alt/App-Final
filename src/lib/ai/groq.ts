import "server-only";
import { AI } from "@/config/ai";
import { claudeChat, claudeConfigured, claudeStreamResponse, ClaudeError } from "./claude";

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

const isOss = (m: string) => m.startsWith("openai/gpt-oss");

/** Models to try, best first: the configured one, then the fallbacks this account actually has. */
async function candidates(wanted: string, key: string): Promise<string[]> {
  const ids = await availableModels(key);
  const pool = wanted.includes("compound") ? AI.fallbacks.search : AI.fallbacks.chat;
  const list = [wanted, ...pool].filter((m, i, all) => all.indexOf(m) === i);
  const have = ids.length ? list.filter((m) => ids.includes(m)) : list;
  return have.length ? have : [wanted];
}

function requestBody(model: string, args: ChatArgs, stream: boolean): string {
  const wantsSearch = args.model.includes("compound");
  const gptOss = isOss(model);
  return JSON.stringify({
    model,
    // gpt-oss has no Compound-style search, but Groq gives it a built-in browser tool.
    ...(wantsSearch && gptOss ? { tools: [{ type: "browser_search" }], tool_choice: "auto" } : {}),
    ...(gptOss ? { reasoning_effort: "low" } : {}),
    messages: args.messages,
    temperature: args.temperature ?? (stream ? 0.5 : 0.2),
    // Always cap the answer: Groq counts the cap (not the real length) against the per-minute limit,
    // and a model's default cap is huge. gpt-oss also spends tokens on hidden reasoning.
    max_tokens: (args.maxTokens ?? 3000) + (gptOss ? 600 : 0),
    ...(stream ? { stream: true } : {}),
    ...(model.includes("compound") && args.excludeDomains?.length ? { search_settings: { exclude_domains: [...args.excludeDomains] } } : {}),
  });
}

/**
 * Sends the request. Groq limits each model separately, so when one is full (429) or missing (404)
 * the next model is tried instead of showing students an error.
 */
async function send(args: ChatArgs, key: string, stream: boolean): Promise<Response> {
  const models = await candidates(args.model, key);
  const deadline = Date.now() + args.timeoutSeconds * 1000;
  let last: Response | null = null;
  for (let i = 0; i < models.length; i++) {
    let res: Response;
    try {
      res = await fetch(`${AI.baseUrl}/chat/completions`, {
        method: "POST",
        headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
        body: requestBody(models[i], args, stream),
        signal: AbortSignal.timeout(Math.max(1000, deadline - Date.now())),
      });
    } catch (e) {
      throw new AiError((e as Error).name === "TimeoutError" ? "timeout" : "upstream");
    }
    if ((res.status === 429 || res.status === 404) && i < models.length - 1) {
      console.warn(`groq ${models[i]} answered ${res.status}, trying ${models[i + 1]}`);
      last = res;
      await res.text().catch(() => "");
      continue;
    }
    return res;
  }
  return last!;
}

/** Claude failures use the same error codes the routes already understand. */
function asAiError(e: unknown): AiError {
  if (e instanceof AiError) return e;
  if (e instanceof ClaudeError) return new AiError(e.code, e.message);
  return new AiError("upstream");
}

async function failure(res: Response, what: string): Promise<AiError> {
  const detail = (await res.text().catch(() => "")).replace(/\s+/g, " ").slice(0, 220);
  console.error(what, res.status, detail);
  const code = res.status === 401 || res.status === 403 ? "auth" : res.status === 404 ? "model" : res.status === 429 ? "rate" : "upstream";
  return new AiError(code, `${res.status} ${detail}`);
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
  if (process.env.AI_FIXTURES === "1" && args.messages[0]?.content.includes("TERMS_JSON")) return { content: JSON.stringify({ terms: Array.from({ length: 8 }, (_, i) => ({ term: `Fixture term ${i + 1}`, meaning: `Meaning of fixture term ${i + 1}.` })) }), searched: [] };
  if (process.env.AI_FIXTURES === "1" && args.messages[0]?.content.includes("CRAM_JSON")) return { content: JSON.stringify({ mustKnow: ["Fixture must-know idea one.", "Fixture must-know idea two.", "Fixture must-know idea three.", "Fixture must-know idea four."], terms: Array.from({ length: 5 }, (_, i) => ({ term: `Cram term ${i + 1}`, meaning: `Cram meaning ${i + 1}.` })), numbers: ["A key number to remember."], traps: ["A common trap on the exam.", "Another trap to avoid."], examTips: ["Read every choice before answering.", "Manage your time per question."] }), searched: [] };
  if (process.env.AI_FIXTURES === "1" && args.messages[0]?.content.includes("NOTES_JSON")) return { content: JSON.stringify({ summary: "Fixture notes about this lesson, written by the test fixture for screens.", sections: [{ heading: "What it is", body: "A fixture explanation of the idea, long enough to pass the length check in the notes shape, so the screen can show a real section." }, { heading: "How it works", body: "1) First step of the fixture process. 2) Second step of the fixture process. 3) Third step of the fixture process." }, { heading: "Why it matters", body: "A fixture paragraph about why the topic matters and how it connects to the rest of the course." }], keyIdeas: ["First key idea of the lesson.", "Second key idea of the lesson.", "Third key idea of the lesson.", "Fourth key idea of the lesson."], terms: [{ term: "Term one", meaning: "Meaning of the first term." }, { term: "Term two", meaning: "Meaning of the second term." }, { term: "Term three", meaning: "Meaning of the third term." }, { term: "Term four", meaning: "Meaning of the fourth term." }], examples: [{ title: "Worked example", body: "A short worked example that shows the idea in action, step by step." }], mistakes: ["A common mistake students make.", "Another common mistake to avoid."], howTested: ["Shows up as a stimulus-based multiple choice question.", "Free response asks you to explain how or why."], memoryTips: ["A memory tip for this lesson."], selfCheck: ["Can I explain the main idea in my own words?", "Can I give one example?", "Can I spot the common mistake?"] }), searched: [] };
  if (process.env.AI_FIXTURES === "1" && args.messages[0]?.content.includes("strict content reviewer")) return { content: "Looks right.\nSCOPE: IN\nACCURATE: YES\nFIT: 9", searched: [] };
  if (process.env.AI_FIXTURES === "1" && args.messages[0]?.content.includes("Solve the question carefully")) return { content: "Working it out.\nANSWER: A", searched: [] };
  if (process.env.AI_FIXTURES === "1" && args.messages[0]?.content.includes("ORIGINAL practice questions")) { const tag = [...args.messages.map((m) => m.content).join("|")].reduce((h, ch) => (h * 31 + ch.charCodeAt(0)) >>> 0, 7).toString(36); return { content: JSON.stringify({ questions: [1, 2, 3, 4, 5].map((n) => ({ stem: `Fixture question number ${n} (${tag}): which choice is correct for this test?`, passage: null, type: "mc", choices: [`Right answer ${n}`, `Wrong one ${n}`, `Wrong two ${n}`, `Wrong three ${n}`], answer: "A", accept: null, explanation: `Explanation for fixture question ${n}: choice A is correct.` })) }), searched: [] }; }
  if (process.env.AI_FIXTURES === "1" && args.messages[0]?.content.includes("study helper")) return { content: "Fixture reply for testing.\n1. First step\n2. Second step", searched: [] };
  if (process.env.AI_FIXTURES === "1") return fixture(args.messages[0]?.content.includes("goal plans") ? "plan" : undefined); // local testing without a key
  // Web search stays on Groq. Everything else goes to Claude when it is set up, with Groq as the backup.
  const key = process.env.GROQ_API_KEY;
  if (claudeConfigured() && !args.model.includes("compound")) {
    try {
      return { content: await claudeChat(args), searched: [] };
    } catch (e) {
      if (!key) throw asAiError(e);
      console.warn("claude failed, using groq:", (e as Error).message);
    }
  }
  if (!key) throw new AiError("unavailable");

  const res = await send(args, key, false);
  if (!res.ok) throw await failure(res, "groq error");
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
  let res: Response | null = null;
  if (claudeConfigured() && !args.model.includes("compound")) {
    try {
      res = await claudeStreamResponse(args);
    } catch (e) {
      if (!key) throw asAiError(e);
      console.warn("claude stream failed, using groq:", (e as Error).message);
    }
  }
  if (!res) {
    if (!key) throw new AiError("unavailable");
    res = await send(args, key, true);
    if (!res.ok || !res.body) throw await failure(res, "groq stream error");
  }
  if (!res.body) throw new AiError("upstream");
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
