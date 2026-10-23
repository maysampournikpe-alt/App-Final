"use client";
import { useState } from "react";
import { Plus, Printer, Trash2 } from "lucide-react";
import { today } from "@/lib/dates";
import { useLocalDoc } from "@/lib/local-doc";
import { useCopy } from "@/lib/use-copy";
import { EmptyTrail } from "../art";
import { buttonClass, inputClass, Page } from "../ui";

interface Note { id: string; title: string; cls: string; date: string; cues: string; notes: string; summary: string }
const KEY = "cornell-notes";
const NONE: Note[] = [];

const copy = {
  en: {
    title: "Cornell notes", lead: "Write notes on the right, questions on the left, and a summary at the bottom. Then cover the right side and quiz yourself.",
    newNote: "New notes", pick: "Your notes", empty: "No notes yet. Start a new page.", topic: "Topic", date: "Date", topicPh: "Photosynthesis", cls: "Class", clsPh: "Biology",
    cues: "Cues and questions", cuesPh: "What are the two stages?", notes: "Notes", notesPh: "Light reactions happen in the thylakoids…", summary: "Summary in your own words", summaryPh: "Plants turn light into sugar in two stages…",
    cover: "Cover my notes (quiz mode)", uncover: "Show my notes", remove: "Delete these notes", print: "Print", untitled: "Untitled",
    saved: "Saved on this device.",
  },
  es: {
    title: "Notas Cornell", lead: "Escribe los apuntes a la derecha, las preguntas a la izquierda y un resumen abajo. Luego tapa la derecha y ponte a prueba.",
    newNote: "Notas nuevas", pick: "Tus notas", empty: "Todavía no hay notas. Empieza una página nueva.", topic: "Tema", date: "Fecha", topicPh: "Fotosíntesis", cls: "Clase", clsPh: "Biología",
    cues: "Pistas y preguntas", cuesPh: "¿Cuáles son las dos etapas?", notes: "Apuntes", notesPh: "Las reacciones de luz ocurren en los tilacoides…", summary: "Resumen con tus palabras", summaryPh: "Las plantas convierten luz en azúcar en dos etapas…",
    cover: "Tapar mis apuntes (modo examen)", uncover: "Mostrar mis apuntes", remove: "Borrar estas notas", print: "Imprimir", untitled: "Sin título",
    saved: "Guardado en este dispositivo.",
  },
};

export function CornellTool() {
  const c = useCopy(copy);
  const [notes, setNotes] = useLocalDoc<Note[]>(KEY, NONE);
  const [openId, setOpenId] = useState<string | null>(null);
  const [covered, setCovered] = useState(false);
  const current = notes.find((n) => n.id === openId) ?? null;

  const create = () => {
    const n: Note = { id: crypto.randomUUID(), title: "", cls: "", date: today(), cues: "", notes: "", summary: "" };
    setNotes((p) => [n, ...p]); setOpenId(n.id); setCovered(false);
  };
  const edit = (patch: Partial<Note>) => current && setNotes((p) => p.map((n) => (n.id === current.id ? { ...n, ...patch } : n)));

  return (
    <Page wide>
      <h1 className="text-3xl sm:text-4xl">{c.title}</h1>
      <p className="mt-2 max-w-prose text-muted">{c.lead}</p>
      <div className="mt-6 grid gap-6 lg:grid-cols-[16rem_1fr]">
        <div>
          <button onClick={create} className={`${buttonClass.primary} w-full`}><Plus size={18} />{c.newNote}</button>
          <h2 className="mt-5 text-lg">{c.pick}</h2>
          {notes.length === 0 ? (
            <div className="mt-2 flex items-center gap-3"><EmptyTrail className="h-14 w-20 shrink-0 text-ink" /><p className="text-sm text-muted">{c.empty}</p></div>
          ) : (
            <ul className="mt-2 space-y-1">
              {notes.map((n) => (
                <li key={n.id}><button onClick={() => { setOpenId(n.id); setCovered(false); }} aria-current={n.id === openId ? "true" : undefined}
                  className={`w-full rounded-xl px-3 py-2 text-left ${n.id === openId ? "bg-marigold text-on-marigold" : "hover:bg-sunken"}`}>
                  <span className="block truncate font-bold">{n.title || c.untitled}</span><span className="block truncate text-xs">{[n.cls, n.date].filter(Boolean).join(" · ")}</span></button></li>
              ))}
            </ul>
          )}
        </div>

        {current ? (
          <section className="guide-card p-4 sm:p-5 print:border-0 print:shadow-none" aria-label={current.title || c.untitled}>
            <div className="grid gap-3 sm:grid-cols-[2fr_1fr_auto]">
              <label><span className="block text-sm font-bold">{c.topic}</span><input value={current.title} onChange={(e) => edit({ title: e.target.value })} placeholder={c.topicPh} maxLength={80} className={inputClass} /></label>
              <label><span className="block text-sm font-bold">{c.cls}</span><input value={current.cls} onChange={(e) => edit({ cls: e.target.value })} placeholder={c.clsPh} maxLength={40} className={inputClass} /></label>
              <label><span className="block text-sm font-bold">{c.date}</span><input type="date" value={current.date} onChange={(e) => edit({ date: e.target.value })} className={inputClass} /></label>
            </div>
            <div className="mt-4 grid min-h-[22rem] grid-cols-[1fr_2fr] border-[1.5px] border-ink">
              <label className="border-r-[1.5px] border-ink p-2"><span className="block text-sm font-bold text-terracotta">{c.cues}</span>
                <textarea value={current.cues} onChange={(e) => edit({ cues: e.target.value })} placeholder={c.cuesPh} className="mt-1 h-[19rem] w-full resize-y bg-transparent p-1 text-base placeholder:text-muted" /></label>
              <label className="p-2"><span className="block text-sm font-bold text-teal">{c.notes}</span>
                {covered ? <div className="mt-1 grid h-[19rem] place-items-center bg-sunken text-muted" aria-hidden>▒▒▒</div> : (
                  <textarea value={current.notes} onChange={(e) => edit({ notes: e.target.value })} placeholder={c.notesPh} className="mt-1 h-[19rem] w-full resize-y bg-transparent p-1 text-base placeholder:text-muted" />)}</label>
            </div>
            <label className="mt-0 block border-[1.5px] border-t-0 border-ink p-2"><span className="block text-sm font-bold">{c.summary}</span>
              <textarea value={current.summary} onChange={(e) => edit({ summary: e.target.value })} placeholder={c.summaryPh} rows={3} className="mt-1 w-full resize-y bg-transparent p-1 text-base placeholder:text-muted" /></label>
            <div className="mt-4 flex flex-wrap items-center gap-3 print:hidden">
              <button onClick={() => setCovered((v) => !v)} aria-pressed={covered} className={buttonClass.secondary}>{covered ? c.uncover : c.cover}</button>
              <button onClick={() => window.print()} className={buttonClass.quiet}><Printer size={18} />{c.print}</button>
              <button onClick={() => { setNotes((p) => p.filter((n) => n.id !== current.id)); setOpenId(null); }} className={buttonClass.danger}><Trash2 size={18} />{c.remove}</button>
              <span className="text-sm text-muted" role="status">{c.saved}</span>
            </div>
          </section>
        ) : null}
      </div>
    </Page>
  );
}
