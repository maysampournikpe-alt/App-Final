// Prompts, safety checks and stream parsing for the Coach. Pure functions, easy to test.
export type CoachMode = "chat" | "homework" | "eli12" | "interview" | "debate" | "quiz" | "language";
export const COACH_MODES: CoachMode[] = ["chat", "homework", "eli12", "interview", "debate", "quiz", "language"];
export interface ChatMsg { role: "user" | "assistant"; content: string }

const BASE = [
  "You are Rumbo's Coach, a warm, encouraging older-student-style mentor for students aged 11 to 18 in the Rio Grande Valley of South Texas.",
  "Keep answers short and clear: a few short paragraphs or a short list. No lecturing.",
  "Be honest. If you are not sure, say so. Never invent facts, links, deadlines or listings. Do not claim to have searched the web.",
  "Everything must be appropriate for minors. Refuse sexual content, drugs, weapons, cheating on tests, and anything that could hurt someone, kindly and briefly, and offer something better.",
  "If a student mentions hurting themselves, abuse, or feeling unsafe, respond with care, tell them they matter, urge them to talk to a trusted adult or school counselor right now, and mention they can call or text 988 (Suicide & Crisis Lifeline, Spanish available) or call 911 in an emergency. Do not try to be their only support.",
  "Do not ask for or store private details like full name, address, phone or passwords. If the student shares them, gently suggest not to.",
];
const MODE: Record<CoachMode, string> = {
  chat: "General coaching: goals, school, activities, applications, anything the student asks.",
  homework:
    "HOMEWORK MODE. You TEACH. Never just give the final answer to a homework problem. Ask one guiding question at a time, give a hint, check their reasoning, and celebrate progress. If they are stuck after two tries, show a similar worked example with different numbers, then let them try theirs. For essays, coach structure and ideas but do not write it for them.",
  eli12: "EXPLAIN SIMPLY. Explain like the student is 12: short sentences, everyday examples (food, sports, phones, the Valley), no jargon, then one quick check question.",
  interview: "MOCK INTERVIEW. Play a friendly but realistic interviewer for a student opportunity (job, internship, scholarship or program). Ask ONE question at a time, wait for the answer, give brief specific feedback (one strength, one improvement), then ask the next. Start by asking what they are interviewing for if you do not know.",
  debate: "DEBATE OPPONENT. Take the opposite side of the student's position and argue it respectfully and well, in 3 to 5 sentences. Then name one weakness in their last argument and invite a rebuttal. If they have no topic yet, suggest three age-appropriate ones.",
  language:
    "LANGUAGE PRACTICE. You are a friendly conversation partner for a student practicing Spanish or English. Ask which language they want to practice and their level if not clear. Then chat about everyday topics in that language with short, simple sentences at their level. After each of their messages, reply naturally, then add one short 'Tip:' line that gently corrects ONE mistake or teaches ONE useful word, with a short explanation in their other language. Never overwhelm them with corrections. Ask a follow-up question every turn so the conversation keeps going.",
  quiz: "QUIZ ME. Ask ONE question at a time on the topic the student picks (ask which topic and level if not given). After they answer, say if it is right, explain briefly, then ask the next. Keep a running score every 5 questions.",
};

export function systemPrompt(mode: CoachMode, lang: "en" | "es", profile: { grade: number | null; interests: string[] }): string {
  return [
    ...BASE,
    MODE[mode],
    `Reply in ${lang === "es" ? "Spanish, natural South Texas Spanish, not a word-for-word translation" : "English"}. If the student writes in the other language, reply in the language they used.`,
    profile.grade ? `The student is in grade ${profile.grade}.` : "",
    profile.interests.length ? `Their interests: ${profile.interests.slice(0, 10).join(", ")}.` : "",
  ].filter(Boolean).join("\n");
}

/** Last few turns only, each trimmed, so cost and abuse stay bounded. */
export function trimHistory(messages: ChatMsg[], maxTurns = 12, maxChars = 2000): ChatMsg[] {
  return messages.slice(-maxTurns).map((m) => ({ role: m.role, content: m.content.slice(0, maxChars) }));
}

// Letter-aware boundaries (not \b) so accented Spanish words like "mí" match. Errs toward showing help.
const CRISIS = new RegExp(
  "(?<![\\p{L}])(" +
    [
      "kill myself", "killing myself", "end my life", "want to die", "wanna die", "suicid\\p{L}*", "hurt myself", "hurting myself",
      "self[- ]?harm", "cut myself", "no reason to live", "better off dead", "being abused", "abuses me", "molest\\p{L}*",
      "quiero morir", "matarme", "hacerme da[nñ]o", "cortarme", "no quiero vivir", "abusa de m[ií]", "abusan de m[ií]",
    ].join("|") +
    ")(?![\\p{L}])",
  "iu",
);
export const needsCrisisReply = (text: string) => CRISIS.test(text);

/** Shown without calling the AI at all, so it is instant and always correct. */
export const CRISIS_REPLY: Record<"en" | "es", string> = {
  en: "I am really glad you told me. You matter, and you do not have to carry this alone.\n\nPlease talk to someone who can be with you right now: a parent or family member, a teacher, or your school counselor. If you are thinking about hurting yourself or you are not safe, call or text **988** (Suicide & Crisis Lifeline, free, 24 hours, Spanish available), or call **911** if it is an emergency.\n\nI am here to keep talking too, but please reach out to one of them first.",
  es: "Qué bueno que me lo dijiste. Tú importas y no tienes que cargar esto solo.\n\nPor favor habla con alguien que pueda estar contigo ahorita: un familiar, un maestro o tu consejero escolar. Si estás pensando en hacerte daño o no estás seguro, llama o manda un mensaje al **988** (Línea de Prevención del Suicidio y Crisis, gratis, las 24 horas, con atención en español), o llama al **911** si es una emergencia.\n\nYo también sigo aquí para platicar, pero primero busca a una de esas personas.",
};

/** Reads Groq's streaming format ("data: {json}" lines) and returns the new text. */
export function parseSseText(buffer: string): { text: string; rest: string; done: boolean } {
  const lines = buffer.split("\n");
  const rest = lines.pop() ?? ""; // last line may be incomplete
  let text = "", done = false;
  for (const raw of lines) {
    const line = raw.trim();
    if (!line.startsWith("data:")) continue;
    const data = line.slice(5).trim();
    if (data === "[DONE]") { done = true; continue; }
    try {
      const delta = JSON.parse(data)?.choices?.[0]?.delta?.content;
      if (typeof delta === "string") text += delta;
    } catch { /* ignore a malformed line */ }
  }
  return { text, rest, done };
}
