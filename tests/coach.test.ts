import { describe, expect, it } from "vitest";
import { CRISIS_REPLY, needsCrisisReply, parseSseText, systemPrompt, trimHistory } from "../src/lib/ai/coach";

describe("coach safety", () => {
  it("catches crisis messages in English and Spanish, and only those", () => {
    for (const t of ["i want to kill myself", "Sometimes I want to die", "I hurt myself last night", "quiero morir", "pienso en matarme", "mi tío abusa de mí"]) {
      expect(needsCrisisReply(t), t).toBe(true);
    }
    for (const t of ["How do I kill a process in Linux?", "this homework is killing me", "Help me write about the Holocaust", "My teacher is mean", "Necesito ayuda con mi tarea"]) {
      expect(needsCrisisReply(t), t).toBe(false);
    }
  });
  it("replies include the 988 line in both languages", () => {
    expect(CRISIS_REPLY.en).toMatch(/988/);
    expect(CRISIS_REPLY.es).toMatch(/988/);
  });
});

describe("prompts and history", () => {
  it("homework mode teaches instead of answering", () => {
    expect(systemPrompt("homework", "en", { grade: 7, interests: [] })).toMatch(/Never just give the final answer/);
  });
  it("sets language and profile context", () => {
    const p = systemPrompt("chat", "es", { grade: 9, interests: ["chess"] });
    expect(p).toMatch(/Spanish/); expect(p).toMatch(/grade 9/); expect(p).toMatch(/chess/);
  });
  it("keeps only recent turns and trims long ones", () => {
    const many = Array.from({ length: 30 }, (_, i) => ({ role: "user" as const, content: "x".repeat(5000) + i }));
    const out = trimHistory(many);
    expect(out).toHaveLength(12);
    expect(out[0].content.length).toBe(2000);
  });
});

describe("stream parsing", () => {
  it("accumulates deltas, keeps partial lines, and sees DONE", () => {
    const a = parseSseText('data: {"choices":[{"delta":{"content":"Hel"}}]}\ndata: {"choices":[{"delta":{"content":"lo"}}]}\ndata: {"choi');
    expect(a.text).toBe("Hello");
    expect(a.rest).toBe('data: {"choi');
    const b = parseSseText(a.rest + 'ces":[{"delta":{"content":"!"}}]}\ndata: [DONE]\n');
    expect(b.text).toBe("!");
    expect(b.done).toBe(true);
  });
  it("ignores noise", () => {
    expect(parseSseText(": keep-alive\ndata: not json\n\n").text).toBe("");
  });
});
