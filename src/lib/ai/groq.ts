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

const fixture = (): ChatReply => ({
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
  if (process.env.AI_FIXTURES === "1") return fixture(); // local testing without a key
  const key = process.env.GROQ_API_KEY;
  if (!key) throw new AiError("unavailable");

  const isCompound = args.model.includes("compound");
  const body: Record<string, unknown> = {
    model: args.model,
    messages: args.messages,
    temperature: args.temperature ?? 0.2,
    ...(args.maxTokens ? { max_tokens: args.maxTokens } : {}),
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
    throw new AiError(res.status === 401 || res.status === 403 ? "auth" : res.status === 404 ? "model" : res.status === 429 ? "rate" : "upstream", String(res.status));
  }
  const json = await res.json();
  const message = json?.choices?.[0]?.message;
  const content: string = typeof message?.content === "string" ? message.content : "";
  if (!content.trim()) throw new AiError("empty");
  const seen = new Set<string>();
  const searched = collectSearched(message?.executed_tools ?? json?.executed_tools).filter((s) => !seen.has(s.url) && seen.add(s.url));
  return { content, searched };
}
