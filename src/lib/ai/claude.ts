// Claude through Cloudflare (Workers AI, Anthropic Messages format). Used for everything except web search.
// Turn it on in Vercel with CLOUDFLARE_ACCOUNT_ID and CLOUDFLARE_API_TOKEN. Set AI_PROVIDER=groq to switch it off.
// No "server-only" import on purpose: the question-generator script uses this file too.

export const DEFAULT_CLAUDE_MODEL = "anthropic/claude-sonnet-5";

export class ClaudeError extends Error {
  constructor(public code: "auth" | "model" | "rate" | "timeout" | "upstream" | "empty", public retryAfter?: number, detail?: string) {
    super(detail ? `${code}: ${detail}` : code);
  }
}

export interface ClaudeArgs {
  messages: { role: "system" | "user" | "assistant"; content: string }[];
  timeoutSeconds: number;
  temperature?: number;
  maxTokens?: number;
}

export const claudeConfigured = (): boolean => !!process.env.CLOUDFLARE_ACCOUNT_ID && !!process.env.CLOUDFLARE_API_TOKEN && process.env.AI_PROVIDER !== "groq";
export const claudeModel = (): string => process.env.CLAUDE_MODEL || DEFAULT_CLAUDE_MODEL;
const endpoint = () => `https://api.cloudflare.com/client/v4/accounts/${process.env.CLOUDFLARE_ACCOUNT_ID}/ai/v1/messages`;

/** The Messages format keeps the system text apart and wants user and assistant turns that alternate, starting with a user turn. */
export function claudeBody(args: ClaudeArgs, stream: boolean, model: string = claudeModel(), withTemperature = true): string {
  const system = args.messages.filter((m) => m.role === "system").map((m) => m.content).join("\n\n");
  const turns: { role: "user" | "assistant"; content: string }[] = [];
  for (const m of args.messages) {
    if (m.role === "system") continue;
    const last = turns[turns.length - 1];
    if (last && last.role === m.role) last.content += "\n\n" + m.content;
    else turns.push({ role: m.role, content: m.content });
  }
  if (!turns.length || turns[0].role !== "user") turns.unshift({ role: "user", content: system ? "Follow the instructions above." : "Hello." });
  return JSON.stringify({
    model,
    max_tokens: args.maxTokens ?? 3000,
    ...(system ? { system } : {}),
    messages: turns,
    ...(withTemperature && args.temperature !== undefined ? { temperature: Math.min(1, Math.max(0, args.temperature)) } : {}),
    ...(stream ? { stream: true } : {}),
  });
}

/** Reads the text of a reply, in the Messages shape or (if Cloudflare answers that way) the chat-completions shape. */
export function claudeText(json: unknown): string {
  const j = json as { content?: unknown; choices?: { message?: { content?: unknown } }[]; result?: unknown };
  if (Array.isArray(j?.content)) return j.content.map((b: { type?: string; text?: unknown }) => (b?.type === "text" || b?.type === undefined) && typeof b.text === "string" ? b.text : "").join("");
  if (typeof j?.content === "string") return j.content;
  const c = j?.choices?.[0]?.message?.content;
  if (typeof c === "string") return c;
  if (j?.result && typeof j.result === "object") return claudeText(j.result);
  return "";
}

const codeOf = (status: number): ClaudeError["code"] => (status === 401 || status === 403 ? "auth" : status === 404 ? "model" : status === 429 ? "rate" : "upstream");

async function post(args: ClaudeArgs, stream: boolean): Promise<Response> {
  const send = (withTemperature: boolean) => fetch(endpoint(), {
    method: "POST",
    headers: { Authorization: `Bearer ${process.env.CLOUDFLARE_API_TOKEN}`, "Content-Type": "application/json" },
    body: claudeBody(args, stream, claudeModel(), withTemperature),
    signal: AbortSignal.timeout(args.timeoutSeconds * 1000),
  });
  let res: Response;
  try {
    res = await send(true);
    // Some newer models refuse a temperature setting. Ask once more without it.
    if (res.status === 400 && args.temperature !== undefined) {
      const text = await res.clone().text().catch(() => "");
      if (/temperature/i.test(text)) res = await send(false);
    }
  } catch (e) {
    throw new ClaudeError((e as Error).name === "TimeoutError" ? "timeout" : "upstream");
  }
  if (!res.ok) {
    const detail = (await res.text().catch(() => "")).replace(/\s+/g, " ").slice(0, 220);
    console.error("claude error", res.status, detail);
    const ra = Number(res.headers.get("retry-after"));
    throw new ClaudeError(codeOf(res.status), Number.isFinite(ra) ? ra : undefined, `${res.status} ${detail}`);
  }
  return res;
}

export async function claudeChat(args: ClaudeArgs): Promise<string> {
  const res = await post(args, false);
  const text = claudeText(await res.json().catch(() => null));
  if (!text.trim()) throw new ClaudeError("empty");
  return text;
}

/** Streams the reply as raw SSE bytes. The caller reads it with parseSseText, which understands this format. */
export async function claudeStreamResponse(args: ClaudeArgs): Promise<Response> {
  const res = await post(args, true);
  if (!res.body) throw new ClaudeError("upstream");
  return res;
}
