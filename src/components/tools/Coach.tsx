"use client";
import { useEffect, useRef, useState } from "react";
import { Send, RotateCcw, Lightbulb } from "lucide-react";
import type { ChatMsg, CoachMode } from "@/lib/ai/coach";
import { useLang } from "@/lib/i18n";
import { useLocalDoc } from "@/lib/local-doc";
import { useProfile } from "@/lib/profile";
import { useCopy } from "@/lib/use-copy";
import { errorText, useAiLimitText } from "@/lib/ai-limit";
import { RichText } from "../RichText";
import { buttonClass, inputClass, Page } from "../ui";

const NONE: ChatMsg[] = [];

const copy = {
  en: {
    titles: { language: "Conversation practice", chat: "Coach", homework: "Homework mode", eli12: "Explain like I'm 12", practice: "Practice modes" } as Record<string, string>,
    leads: {
      language: "Practice Spanish or English in a friendly chat. You get one small tip after each message.",
      chat: "Talk through goals, school, applications, anything.",
      homework: "I will not just hand you answers. I will ask questions and give hints so you actually get it.",
      eli12: "Ask about any idea and I will explain it in plain, everyday words.",
      practice: "Pick a mode and practice out loud or in writing.",
    } as Record<string, string>,
    practice: { interview: "Mock interview", debate: "Debate opponent", quiz: "Quiz me" } as Record<string, string>,
    starters: {
      language: ["I want to practice my English", "Quiero practicar mi español", "Let us talk about my weekend"],
      chat: ["Help me make a plan to get my first job", "What can I do this summer in the Valley?", "How do I get ready for college?"],
      homework: ["I am stuck on a math problem", "Help me understand my science homework", "I need help planning an essay"],
      eli12: ["What is compound interest?", "How does photosynthesis work?", "What is the electoral college?"],
      interview: ["I am interviewing for a part-time job", "Practice a scholarship interview with me", "I have an internship interview"],
      debate: ["Should schools start later?", "Argue against my side: homework should be optional", "Give me three debate topics"],
      quiz: ["Quiz me on Texas history", "Quiz me on algebra", "Quiz me on Spanish vocabulary"],
    } as Record<string, string[]>,
    placeholder: "Type your message", send: "Send", newChat: "New chat", simpler: "Explain simpler", retry: "Try again", you: "You", coach: "Coach",
    note: "Answers are made by AI and can be wrong. Check important things with a teacher or counselor.",
    errors: { rate_limited: "You have sent a lot of messages this hour. Take a short break and try again in a minute.", busy: "The AI is busy. Try again in a minute.", slow: "That took too long. Try again.", unavailable: "The Coach is not turned on in this version yet.", failed: "Something went wrong on our side. Try again in a minute.", offline: "You are offline. The Coach needs internet, but your other tools still work.", bad_request: "Write a message first." } as Record<string, string>,
    thinking: "Thinking…", emptyHint: "Try one of these:", mode: "Mode",
  },
  es: {
    titles: { language: "Práctica de conversación", chat: "Entrenador", homework: "Modo tarea", eli12: "Explícamelo fácil", practice: "Modos de práctica" } as Record<string, string>,
    leads: {
      language: "Practica español o inglés en una plática amistosa. Recibes un consejo pequeño después de cada mensaje.",
      chat: "Habla de tus metas, la escuela, solicitudes, lo que quieras.",
      homework: "No te voy a dar las respuestas nada más. Te hago preguntas y te doy pistas para que de veras lo entiendas.",
      eli12: "Pregunta sobre cualquier idea y te la explico con palabras de todos los días.",
      practice: "Elige un modo y practica hablando o escribiendo.",
    } as Record<string, string>,
    practice: { interview: "Entrevista de práctica", debate: "Rival de debate", quiz: "Hazme preguntas" } as Record<string, string>,
    starters: {
      language: ["Quiero practicar mi inglés", "I want to practice my Spanish", "Platiquemos de mi fin de semana"],
      chat: ["Ayúdame a hacer un plan para conseguir mi primer trabajo", "¿Qué puedo hacer este verano en el Valle?", "¿Cómo me preparo para la universidad?"],
      homework: ["Estoy atorado en un problema de mates", "Ayúdame a entender mi tarea de ciencias", "Necesito ayuda para planear un ensayo"],
      eli12: ["¿Qué es el interés compuesto?", "¿Cómo funciona la fotosíntesis?", "¿Qué es el colegio electoral?"],
      interview: ["Tengo una entrevista para un trabajo de medio tiempo", "Practica conmigo una entrevista para una beca", "Tengo una entrevista para una pasantía"],
      debate: ["¿Deberían las escuelas empezar más tarde?", "Defiende lo contrario: la tarea debería ser opcional", "Dame tres temas de debate"],
      quiz: ["Hazme preguntas de historia de Texas", "Hazme preguntas de álgebra", "Hazme preguntas de vocabulario en inglés"],
    } as Record<string, string[]>,
    placeholder: "Escribe tu mensaje", send: "Enviar", newChat: "Chat nuevo", simpler: "Explícalo más fácil", retry: "Intentar de nuevo", you: "Tú", coach: "Entrenador",
    note: "Las respuestas las hace una IA y pueden tener errores. Confirma lo importante con un maestro o consejero.",
    errors: { rate_limited: "Has mandado muchos mensajes esta hora. Descansa un ratito e intenta de nuevo en un minuto.", busy: "La IA está ocupada. Intenta de nuevo en un minuto.", slow: "Tardó demasiado. Intenta de nuevo.", unavailable: "El entrenador todavía no está activado en esta versión.", failed: "Algo falló de nuestra parte. Intenta de nuevo en un minuto.", offline: "No tienes internet. El entrenador la necesita, pero tus otras herramientas sí funcionan.", bad_request: "Escribe un mensaje primero." } as Record<string, string>,
    thinking: "Pensando…", emptyHint: "Prueba una de estas:", mode: "Modo",
  },
};

type Kind = "chat" | "homework" | "eli12" | "practice" | "language";

export function CoachTool({ kind }: { kind: Kind }) {
  const c = useCopy(copy);
  const limit = useAiLimitText();
  const lang = useLang();
  const [profile] = useProfile();
  const [sub, setSub] = useState<"interview" | "debate" | "quiz">("interview");
  const mode: CoachMode = kind === "practice" ? sub : kind;
  const docKey = kind === "practice" ? `coach-practice-${sub}` : `coach-${kind}`;
  const [messages, setMessages] = useLocalDoc<ChatMsg[]>(docKey, NONE);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [live, setLive] = useState("");
  const abort = useRef<AbortController | null>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const msgsRef = useRef(messages);
  msgsRef.current = messages;

  useEffect(() => () => abort.current?.abort(), []);
  useEffect(() => { endRef.current?.scrollIntoView({ block: "end", behavior: "smooth" }); }, [messages.length, live]);

  const send = async (text: string, asMode: CoachMode = mode) => {
    const clean = text.trim();
    if (!clean || busy) return;
    if (!navigator.onLine) return setError("offline");
    setError(null);
    const history: ChatMsg[] = [...msgsRef.current, { role: "user", content: clean }];
    setMessages(history);
    setInput("");
    setBusy(true);
    setLive("");
    const ctl = new AbortController();
    abort.current = ctl;
    let acc = "";
    try {
      const res = await fetch("/api/coach", {
        method: "POST", headers: { "Content-Type": "application/json" }, signal: ctl.signal,
        body: JSON.stringify({ mode: asMode, lang, grade: profile.grade, interests: profile.interests.slice(0, 10), messages: history.slice(-20) }),
      });
      if (!res.ok || !res.body) {
        const j = await res.json().catch(() => null);
        setError(j?.error ?? "failed");
      } else {
        const reader = res.body.getReader();
        const dec = new TextDecoder();
        for (;;) {
          const { value, done } = await reader.read();
          if (done) break;
          acc += dec.decode(value, { stream: true });
          setLive(acc);
        }
        if (!acc.trim()) setError("failed");
      }
    } catch (e) {
      if ((e as Error).name !== "AbortError") setError(navigator.onLine ? "failed" : "offline");
    } finally {
      if (acc.trim()) setMessages([...history, { role: "assistant", content: acc }]);
      setLive("");
      setBusy(false);
    }
  };

  const lastIsAssistant = messages.at(-1)?.role === "assistant";
  const lastUser = [...messages].reverse().find((m) => m.role === "user");

  return (
    <Page>
      <h1 className="text-3xl sm:text-4xl">{c.titles[kind]}</h1>
      <p className="mt-2 max-w-prose text-muted">{c.leads[kind]}</p>

      {kind === "practice" ? (
        <div role="group" aria-label={c.mode} className="mt-5 flex flex-wrap gap-2">
          {(Object.keys(c.practice) as (typeof sub)[]).map((k) => (
            <button key={k} onClick={() => { abort.current?.abort(); setSub(k); setError(null); }} aria-pressed={sub === k}
              className={`rounded-full border-[1.5px] border-ink px-4 py-1.5 font-bold ${sub === k ? "bg-ink text-paper" : "bg-surface hover:bg-sunken"}`}>{c.practice[k]}</button>
          ))}
        </div>
      ) : null}

      <section aria-label={c.titles[kind]} className="mt-6">
        <div role="log" aria-live="polite" aria-relevant="additions" className="space-y-4">
          {messages.length === 0 && !busy ? (
            <div>
              <p className="mb-3 font-bold">{c.emptyHint}</p>
              <ul className="flex flex-wrap gap-2">
                {c.starters[mode].map((s) => <li key={s}><button onClick={() => send(s)} className="rounded-md border-[1.5px] border-ink bg-surface px-3 py-2 text-left font-bold hover:bg-sunken">{s}</button></li>)}
              </ul>
            </div>
          ) : null}
          {messages.map((m, i) => <Bubble key={i} role={m.role} c={c}>{m.role === "assistant" ? <RichText text={m.content} /> : <p className="whitespace-pre-wrap">{m.content}</p>}</Bubble>)}
          {busy ? <Bubble role="assistant" c={c}>{live ? <RichText text={live} /> : <p className="text-muted">{c.thinking}</p>}</Bubble> : null}
          {error ? (
            <div role="alert" className="guide-card p-4"><p className="font-bold">{errorText(c.errors, error, limit)}</p>
              {lastUser && error !== "rate_limited" && error !== "unavailable" ? <button onClick={() => { setMessages(messages.slice(0, -1)); void send(lastUser.content); }} className="mt-2 font-bold text-teal underline underline-offset-4">{c.retry}</button> : null}</div>
          ) : null}
          <div ref={endRef} />
        </div>

        {lastIsAssistant && !busy && kind !== "eli12" ? (
          <button onClick={() => send(lang === "es" ? "Explícamelo como si tuviera 12 años." : "Explain that like I'm 12.", "eli12")} className="mt-3 inline-flex items-center gap-1.5 font-bold text-teal underline underline-offset-4"><Lightbulb size={16} />{c.simpler}</button>
        ) : null}

        <form onSubmit={(e) => { e.preventDefault(); void send(input); }} className="sticky bottom-20 mt-5 md:bottom-4">
          <div className="guide-card flex items-end gap-2 bg-surface p-2">
            <label className="min-w-0 flex-1"><span className="sr-only">{c.placeholder}</span>
              <textarea value={input} rows={2} maxLength={2000} placeholder={c.placeholder} onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); void send(input); } }}
                className={`${inputClass} resize-none border-0 bg-transparent`} /></label>
            <button disabled={busy || !input.trim()} aria-label={c.send} className={`${buttonClass.primary} !px-4`}><Send size={18} /></button>
          </div>
        </form>
        <div className="mt-3 flex flex-wrap items-center justify-between gap-3 text-sm text-muted">
          <p>{c.note}</p>
          {messages.length ? <button onClick={() => { abort.current?.abort(); setMessages([]); setError(null); }} className="inline-flex items-center gap-1.5 font-bold text-teal underline underline-offset-4"><RotateCcw size={14} />{c.newChat}</button> : null}
        </div>
      </section>
    </Page>
  );
}

function Bubble({ role, c, children }: { role: "user" | "assistant"; c: { you: string; coach: string }; children: React.ReactNode }) {
  const mine = role === "user";
  return (
    <div className={`flex ${mine ? "justify-end" : ""}`}>
      <div className={`max-w-[92%] rounded-lg border-[1.5px] border-ink px-4 py-3 sm:max-w-[80%] ${mine ? "bg-teal text-on-teal" : "bg-surface"}`}>
        <p className={`mb-1 text-xs font-bold ${mine ? "" : "text-terracotta"}`}>{mine ? c.you : c.coach}</p>
        {children}
      </div>
    </div>
  );
}
