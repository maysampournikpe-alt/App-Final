"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ALL_TABS } from "@/config/features";
import { today } from "@/lib/dates";
import { collectItems } from "@/lib/calendar";
import { HOMEWORK_KEY, NO_ASSIGNMENTS, type Assignment } from "@/lib/homework";
import { useLang } from "@/lib/i18n";
import { PREFIX, useLocalDoc, writeDoc } from "@/lib/local-doc";
import { togglePref, usePrefs } from "@/lib/prefs";
import type { SavedListing } from "@/lib/saved";
import { useCopy } from "@/lib/use-copy";
import { buttonClass, inputClass } from "../ui";
import { Callout, Head } from "./shared";

const copy = {
  en: {
    sbTitle: "Pinned and hidden tabs", sbLead: "Pin your favorite tools so they show at the top of the menu, and hide the ones you do not use. Nothing is deleted, and you can undo any of it.", sbFind: "Find a tool", sbPinned: "Pinned", sbHidden: "Hidden", sbPin: "Pin", sbUnpin: "Unpin", sbHide: "Hide", sbShow: "Show", sbCount: (p: number, h: number) => `${p} pinned, ${h} hidden`, sbNone: "No tools match.",
    ntTitle: "Notifications", ntLead: "Get a reminder when you open Rumbo about homework due today or tomorrow, and deadlines coming up. Reminders show only while Rumbo is open or installed on your device. Nothing is sent from a server.", ntAllow: "Allow notifications", ntState: { default: "Not asked yet", granted: "Allowed", denied: "Blocked in your browser settings", unsupported: "Not supported on this browser" } as Record<string, string>, ntHw: "Homework due today or tomorrow", ntDl: "Saved deadlines in the next 3 days", ntTest: "Send a test", ntTestBody: "This is how a reminder will look.", ntSaved: "Saved.", ntDenied: "Notifications are blocked. Change this in your browser's site settings, then come back.", ntHow: "On iPhone, add Rumbo to your Home Screen first. Then notifications can be turned on.",
    vcTitle: "Voice input", vcLead: "Say your search instead of typing it. Your browser turns your voice into text.", vcSay: "Say it", vcStop: "Stop", vcHeard: "I heard", vcGo: "Search the Finder with this", vcNo: "Your browser cannot listen to your voice. Try Chrome, Edge or Safari.", vcLang: "Language", vcPriv: "When you tap Say it, your browser may send the sound to its speech service (for example Google in Chrome, Apple in Safari). Rumbo does not save the audio.", vcErr: "I could not hear that. Check that your microphone is allowed, then try again.",
    raTitle: "Read aloud", raLead: "Type or paste any text and hear it read to you. Good for essays, plans and answers.", raText: "Text to read", raPlay: "Read it", raStop: "Stop", raRate: "Speed", raVoice: "Voice language", raNo: "Your browser cannot read text aloud.", raSlow: "Slow", raFast: "Fast", raMax: (n: number) => `${n} characters left`,
    ofTitle: "Offline mode", ofLead: "Most of Rumbo's tools work without internet because your data is saved on your device.", ofNow: "Right now you are", ofOn: "online", ofOff: "offline", ofSw: "Offline pages", ofSwOn: "Ready. Pages you have opened before can open without internet.", ofSwOff: "Not ready yet. Reload the page once while online.", ofSwNo: "Not supported on this browser.", ofInst: "Installed on your device", ofInstYes: "Yes", ofInstNo: "Not yet. Use your browser's menu and choose Add to Home Screen or Install.", ofDocs: (n: number) => `${n} saved lists and logs on this device`, ofWorks: "Works offline", ofNeeds: "Needs internet", ofW: ["Homework, to-do and calendar tools", "Flashcards, notes and study timers", "Calculators, graphs and formulas", "Habits, mood and sleep logs", "Anything you saved, once its page has been opened"], ofN: ["Opportunity Finder and its search", "Coach and the AI helpers", "Signing in and syncing to your account", "Opening a page for the first time"],
    exTitle: "Download my data", exLead: "Get a copy of everything you saved in Rumbo. Use it as a backup, or to move to another device.", exFile: "Download data file", exSum: "Readable summary", exSumBtn: "Download summary", exCount: (n: number) => `${n} saved lists and logs`, exImport: "Restore from a data file", exImportHelp: "This replaces the matching lists on this device with the ones in the file.", exConfirm: "Yes, replace my data", exCancel: "Cancel", exDone: (n: number) => `Restored ${n} lists.`, exBad: "That file is not a Rumbo data file.", exBig: "That file is too large.", exNote: "Your data file is private. Keep it somewhere safe, because it can include things like grades and notes.", exPick: "Choose a data file",
  },
  es: {
    sbTitle: "Pestañas fijas y ocultas", sbLead: "Fija tus herramientas favoritas para que aparezcan arriba del menú y oculta las que no usas. No se borra nada y puedes deshacerlo.", sbFind: "Buscar una herramienta", sbPinned: "Fijadas", sbHidden: "Ocultas", sbPin: "Fijar", sbUnpin: "Quitar", sbHide: "Ocultar", sbShow: "Mostrar", sbCount: (p: number, h: number) => `${p} fijadas, ${h} ocultas`, sbNone: "Ninguna herramienta coincide.",
    ntTitle: "Notificaciones", ntLead: "Recibe un recordatorio al abrir Rumbo sobre la tarea que vence hoy o mañana y las fechas límite que vienen. Los recordatorios salen solo mientras Rumbo está abierto o instalado en tu dispositivo. No se envía nada desde un servidor.", ntAllow: "Permitir notificaciones", ntState: { default: "Todavía no se pregunta", granted: "Permitidas", denied: "Bloqueadas en la configuración de tu navegador", unsupported: "No funciona en este navegador" } as Record<string, string>, ntHw: "Tarea que vence hoy o mañana", ntDl: "Fechas límite guardadas en los próximos 3 días", ntTest: "Enviar una prueba", ntTestBody: "Así se verá un recordatorio.", ntSaved: "Guardado.", ntDenied: "Las notificaciones están bloqueadas. Cámbialo en la configuración del sitio en tu navegador y regresa.", ntHow: "En iPhone, primero agrega Rumbo a tu pantalla de inicio. Luego se pueden activar las notificaciones.",
    vcTitle: "Entrada por voz", vcLead: "Di tu búsqueda en vez de escribirla. Tu navegador convierte tu voz en texto.", vcSay: "Decirlo", vcStop: "Parar", vcHeard: "Escuché", vcGo: "Buscar en el Buscador con esto", vcNo: "Tu navegador no puede escuchar tu voz. Prueba Chrome, Edge o Safari.", vcLang: "Idioma", vcPriv: "Cuando tocas Decirlo, tu navegador puede enviar el sonido a su servicio de voz (por ejemplo Google en Chrome, Apple en Safari). Rumbo no guarda el audio.", vcErr: "No pude escuchar. Revisa que el micrófono esté permitido y vuelve a intentar.",
    raTitle: "Leer en voz alta", raLead: "Escribe o pega cualquier texto y escúchalo. Sirve para ensayos, planes y respuestas.", raText: "Texto para leer", raPlay: "Leerlo", raStop: "Parar", raRate: "Velocidad", raVoice: "Idioma de la voz", raNo: "Tu navegador no puede leer texto en voz alta.", raSlow: "Lenta", raFast: "Rápida", raMax: (n: number) => `Quedan ${n} caracteres`,
    ofTitle: "Sin conexión", ofLead: "La mayoría de las herramientas de Rumbo funcionan sin internet porque tus datos se guardan en tu dispositivo.", ofNow: "Ahora mismo estás", ofOn: "en línea", ofOff: "sin conexión", ofSw: "Páginas sin conexión", ofSwOn: "Listo. Las páginas que ya abriste se pueden abrir sin internet.", ofSwOff: "Todavía no está listo. Recarga la página una vez con internet.", ofSwNo: "No funciona en este navegador.", ofInst: "Instalada en tu dispositivo", ofInstYes: "Sí", ofInstNo: "Todavía no. Usa el menú de tu navegador y elige Agregar a la pantalla de inicio o Instalar.", ofDocs: (n: number) => `${n} listas y registros guardados en este dispositivo`, ofWorks: "Funciona sin internet", ofNeeds: "Necesita internet", ofW: ["Herramientas de tarea, pendientes y calendario", "Tarjetas, apuntes y temporizadores de estudio", "Calculadoras, gráficas y fórmulas", "Registros de hábitos, ánimo y sueño", "Lo que guardaste, una vez que abriste su página"], ofN: ["El Buscador de oportunidades y su búsqueda", "El Entrenador y las ayudas con IA", "Iniciar sesión y sincronizar con tu cuenta", "Abrir una página por primera vez"],
    exTitle: "Descargar mis datos", exLead: "Obtén una copia de todo lo que guardaste en Rumbo. Úsala como respaldo o para pasar a otro dispositivo.", exFile: "Descargar archivo de datos", exSum: "Resumen legible", exSumBtn: "Descargar resumen", exCount: (n: number) => `${n} listas y registros guardados`, exImport: "Restaurar desde un archivo de datos", exImportHelp: "Esto reemplaza en este dispositivo las listas que coincidan con las del archivo.", exConfirm: "Sí, reemplazar mis datos", exCancel: "Cancelar", exDone: (n: number) => `Se restauraron ${n} listas.`, exBad: "Ese archivo no es un archivo de datos de Rumbo.", exBig: "Ese archivo es demasiado grande.", exNote: "Tu archivo de datos es privado. Guárdalo en un lugar seguro, porque puede incluir cosas como calificaciones y apuntes.", exPick: "Elegir un archivo de datos",
  },
};

export function SidebarTool() {
  const c = useCopy(copy);
  const lang = useLang();
  const prefs = usePrefs();
  const [q, setQ] = useState("");
  const norm = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
  const all = ALL_TABS.flatMap((tab) => tab.tools.filter((t) => t.status === "built").map((t) => ({ key: t.key, name: t.name[lang], tab: tab.name[lang] })));
  const list = all.filter((x) => !q || norm(x.name + " " + x.tab).includes(norm(q)));
  return (
    <Head title={c.sbTitle} lead={c.sbLead}>
      <p className="mt-3 font-bold text-teal" aria-live="polite">{c.sbCount(prefs.pinned.length, prefs.hidden.length)}</p>
      <label className="mt-3 block max-w-md"><span className="block font-bold">{c.sbFind}</span><input value={q} onChange={(e) => setQ(e.target.value)} className={`${inputClass} mt-1`} /></label>
      {list.length === 0 ? <p className="mt-4 text-muted">{c.sbNone}</p> : <ul className="mt-4 divide-y-2 divide-dotted divide-line">{list.slice(0, 80).map((x) => { const p = prefs.pinned.includes(x.key), h = prefs.hidden.includes(x.key); return (
        <li key={x.key} className="flex flex-wrap items-center gap-2 py-2"><div className="min-w-0 flex-1"><p className="font-bold">{x.name}</p><p className="text-sm text-muted">{x.tab}{p ? ` · ${c.sbPinned}` : ""}{h ? ` · ${c.sbHidden}` : ""}</p></div>
          <button onClick={() => togglePref("pinned", x.key)} aria-pressed={p} aria-label={`${p ? c.sbUnpin : c.sbPin}: ${x.name}`} className={buttonClass.quiet}>{p ? c.sbUnpin : c.sbPin}</button>
          <button onClick={() => togglePref("hidden", x.key)} aria-pressed={h} aria-label={`${h ? c.sbShow : c.sbHide}: ${x.name}`} className={buttonClass.quiet}>{h ? c.sbShow : c.sbHide}</button></li>); })}</ul>}
    </Head>
  );
}

export type NotifyPrefs = { homework: boolean; deadlines: boolean; lastDay: string };
export const NOTIFY_KEY = "notify-prefs";
export const NO_NOTIFY: NotifyPrefs = { homework: true, deadlines: true, lastDay: "" };
const perm = (): string => (typeof Notification === "undefined" ? "unsupported" : Notification.permission);

export function NotificationsTool() {
  const c = useCopy(copy);
  const [n, setN] = useLocalDoc<NotifyPrefs>(NOTIFY_KEY, NO_NOTIFY);
  const [state, setState] = useState("default");
  const [msg, setMsg] = useState("");
  // eslint-disable-next-line react-hooks/set-state-in-effect -- reading browser state or resetting for a retry; not derivable during render
  useEffect(() => setState(perm()), []);
  const ask = async () => { try { setState(await Notification.requestPermission()); } catch { setState(perm()); } };
  const test = async () => { try { new Notification("Rumbo", { body: c.ntTestBody, icon: "/icon-192.png" }); } catch { setMsg(c.ntDenied); } };
  return (
    <Head title={c.ntTitle} lead={c.ntLead}>
      <section className="guide-card mt-5 p-5"><p className="font-bold" aria-live="polite">{c.ntState[state]}</p>
        {state === "default" ? <button onClick={ask} className={`${buttonClass.primary} mt-3`}>{c.ntAllow}</button> : null}
        {state === "denied" ? <p className="mt-2 text-ruby">{c.ntDenied}</p> : null}
        {state === "granted" ? <button onClick={test} className={`${buttonClass.secondary} mt-3`}>{c.ntTest}</button> : null}</section>
      <div className="mt-5 space-y-2">
        <label className="flex items-center gap-3 text-lg"><input type="checkbox" checked={n.homework} onChange={(e) => { setN({ ...n, homework: e.target.checked }); setMsg(c.ntSaved); }} className="h-5 w-5 accent-[var(--c-teal)]" />{c.ntHw}</label>
        <label className="flex items-center gap-3 text-lg"><input type="checkbox" checked={n.deadlines} onChange={(e) => { setN({ ...n, deadlines: e.target.checked }); setMsg(c.ntSaved); }} className="h-5 w-5 accent-[var(--c-teal)]" />{c.ntDl}</label></div>
      <p className="mt-2 font-bold text-teal" role="status">{msg}</p>
      <Callout>{c.ntHow}</Callout>
    </Head>
  );
}

/** Mounted once in the app shell. Shows at most one reminder per day, and only if the student turned it on and allowed it. */
export function ReminderBoot() {
  const [n, setN] = useLocalDoc<NotifyPrefs>(NOTIFY_KEY, NO_NOTIFY);
  const [hw] = useLocalDoc<Assignment[]>(HOMEWORK_KEY, NO_ASSIGNMENTS);
  const [saved] = useLocalDoc<SavedListing[]>("saved-opportunities", NO_SAVED);
  const lang = useLang();
  const ran = useRef(false);
  useEffect(() => {
    if (ran.current || perm() !== "granted") return;
    const now = today();
    if (n.lastDay === now || (!n.homework && !n.deadlines)) return;
    ran.current = true;
    const t = new Date(now + "T00:00:00"); t.setDate(t.getDate() + 1);
    const tomorrow = `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, "0")}-${String(t.getDate()).padStart(2, "0")}`;
    const t3 = new Date(now + "T00:00:00"); t3.setDate(t3.getDate() + 3);
    const in3 = `${t3.getFullYear()}-${String(t3.getMonth() + 1).padStart(2, "0")}-${String(t3.getDate()).padStart(2, "0")}`;
    const hwDue = n.homework ? hw.filter((h) => !h.done && h.due >= now && h.due <= tomorrow).length : 0;
    const dl = n.deadlines ? collectItems({ saved, homework: [], countdowns: [], now }).filter((x) => x.kind === "opportunity" && x.date >= now && x.date <= in3).length : 0;
    if (!hwDue && !dl) return;
    const body = lang === "es" ? [hwDue ? `${hwDue} tarea(s) para hoy o mañana` : "", dl ? `${dl} fecha(s) límite en 3 días` : ""] : [hwDue ? `${hwDue} assignment(s) due today or tomorrow` : "", dl ? `${dl} deadline(s) in the next 3 days` : ""];
    try { new Notification("Rumbo", { body: body.filter(Boolean).join(" · "), icon: "/icon-192.png" }); setN({ ...n, lastDay: now }); } catch { /* blocked */ }
  }, [n, hw, saved, lang, setN]);
  return null;
}
const NO_SAVED: SavedListing[] = [];

type SR = { new (): { lang: string; interimResults: boolean; onresult: ((e: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null; onend: (() => void) | null; onerror: (() => void) | null; start(): void; stop(): void } };
export function VoiceTool() {
  const c = useCopy(copy);
  const lang = useLang();
  const [sl, setSl] = useState<"en" | "es">(lang);
  const [ok, setOk] = useState(true);
  const [on, setOn] = useState(false);
  const [text, setText] = useState("");
  const [err, setErr] = useState(false);
  const rec = useRef<InstanceType<SR> | null>(null);
  // eslint-disable-next-line react-hooks/set-state-in-effect -- reading browser state or resetting for a retry; not derivable during render
  useEffect(() => { const w = window as unknown as { SpeechRecognition?: SR; webkitSpeechRecognition?: SR }; setOk(!!(w.SpeechRecognition ?? w.webkitSpeechRecognition)); return () => rec.current?.stop(); }, []);
  const say = () => {
    const w = window as unknown as { SpeechRecognition?: SR; webkitSpeechRecognition?: SR };
    const Ctor = w.SpeechRecognition ?? w.webkitSpeechRecognition; if (!Ctor) return;
    try { const r = new Ctor(); r.lang = sl === "es" ? "es-MX" : "en-US"; r.interimResults = false; r.onresult = (e) => setText(e.results[0][0].transcript); r.onend = () => setOn(false); r.onerror = () => { setOn(false); setErr(true); }; rec.current = r; setErr(false); setOn(true); r.start(); } catch { setOn(false); setErr(true); }
  };
  return (
    <Head title={c.vcTitle} lead={c.vcLead}>
      {!ok ? <Callout tone="warn">{c.vcNo}</Callout> : <>
        <div className="mt-5 flex flex-wrap gap-2" role="group" aria-label={c.vcLang}>{(["en", "es"] as const).map((l) => <button key={l} onClick={() => setSl(l)} aria-pressed={sl === l} className={`rounded-full border-[1.5px] border-ink px-4 py-1.5 font-bold ${sl === l ? "bg-ink text-paper" : "bg-surface hover:bg-sunken"}`}>{l === "en" ? "English" : "Español"}</button>)}</div>
        <div className="mt-4">{on ? <button onClick={() => rec.current?.stop()} className={buttonClass.primary}>{c.vcStop}</button> : <button onClick={say} className={buttonClass.primary}>{c.vcSay}</button>}</div>
        {err ? <p role="alert" className="mt-3 font-bold text-ruby">{c.vcErr}</p> : null}
        <label className="mt-5 block"><span className="block font-bold">{c.vcHeard}</span><input value={text} onChange={(e) => setText(e.target.value)} maxLength={200} className={`${inputClass} mt-1`} /></label>
        {text.trim().length >= 2 ? <Link href={`/t/find/search?q=${encodeURIComponent(text.trim())}`} className={`${buttonClass.secondary} mt-3 inline-flex`}>{c.vcGo}</Link> : null}</>}
      <p className="mt-4 max-w-prose text-sm text-muted">{c.vcPriv}</p>
    </Head>
  );
}

export function ReadAloudTool() {
  const c = useCopy(copy);
  const lang = useLang();
  const [text, setText] = useState("");
  const [rate, setRate] = useState(1);
  const [vl, setVl] = useState<"en" | "es">(lang);
  const [on, setOn] = useState(false);
  const [ok, setOk] = useState(true);
  // eslint-disable-next-line react-hooks/set-state-in-effect -- reading browser state or resetting for a retry; not derivable during render
  useEffect(() => { setOk("speechSynthesis" in window); return () => { try { speechSynthesis.cancel(); } catch {} }; }, []);
  const play = () => { try { speechSynthesis.cancel(); const u = new SpeechSynthesisUtterance(text); u.lang = vl === "es" ? "es-MX" : "en-US"; u.rate = rate; u.onend = () => setOn(false); u.onerror = () => setOn(false); setOn(true); speechSynthesis.speak(u); } catch { setOn(false); } };
  const stop = () => { try { speechSynthesis.cancel(); } catch {} setOn(false); };
  return (
    <Head title={c.raTitle} lead={c.raLead}>
      {!ok ? <Callout tone="warn">{c.raNo}</Callout> : <>
        <label className="mt-5 block"><span className="block font-bold">{c.raText}</span><textarea value={text} onChange={(e) => setText(e.target.value.slice(0, 5000))} rows={8} className="mt-1 w-full rounded-md border-[1.5px] border-ink bg-surface p-3 text-lg" /><span className="text-sm text-muted">{c.raMax(5000 - text.length)}</span></label>
        <div className="mt-3 flex flex-wrap items-end gap-5">
          <div className="flex gap-2" role="group" aria-label={c.raVoice}>{(["en", "es"] as const).map((l) => <button key={l} onClick={() => setVl(l)} aria-pressed={vl === l} className={`rounded-full border-[1.5px] border-ink px-4 py-1.5 font-bold ${vl === l ? "bg-ink text-paper" : "bg-surface hover:bg-sunken"}`}>{l === "en" ? "English" : "Español"}</button>)}</div>
          <label className="flex items-center gap-2 font-bold">{c.raRate}: {c.raSlow}<input type="range" min={0.6} max={1.5} step={0.1} value={rate} onChange={(e) => setRate(Number(e.target.value))} aria-label={c.raRate} className="accent-[var(--c-teal)]" />{c.raFast}</label></div>
        <div className="mt-4">{on ? <button onClick={stop} className={buttonClass.primary}>{c.raStop}</button> : <button disabled={!text.trim()} onClick={play} className={buttonClass.primary}>{c.raPlay}</button>}</div></>}
    </Head>
  );
}

export function OfflineTool() {
  const c = useCopy(copy);
  const [online, setOnline] = useState(true);
  const [sw, setSw] = useState<"on" | "off" | "no">("off");
  const [installed, setInstalled] = useState(false);
  const [docs, setDocs] = useState(0);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- reading browser state or resetting for a retry; not derivable during render
    setOnline(navigator.onLine);
    const up = () => setOnline(true), down = () => setOnline(false);
    window.addEventListener("online", up); window.addEventListener("offline", down);
    if (!("serviceWorker" in navigator)) setSw("no"); else navigator.serviceWorker.getRegistration().then((r) => setSw(r?.active ? "on" : "off")).catch(() => setSw("off"));
    setInstalled(window.matchMedia("(display-mode: standalone)").matches);
    try { setDocs(Object.keys(localStorage).filter((k) => k.startsWith(PREFIX)).length); } catch { /* blocked */ }
    return () => { window.removeEventListener("online", up); window.removeEventListener("offline", down); };
  }, []);
  return (
    <Head title={c.ofTitle} lead={c.ofLead}>
      <dl className="mt-5 space-y-3">
        <div className="guide-card p-4"><dt className="text-sm text-muted">{c.ofNow}</dt><dd className={`font-display text-2xl font-semibold ${online ? "text-teal" : "text-ruby"}`} aria-live="polite">{online ? c.ofOn : c.ofOff}</dd></div>
        <div className="guide-card p-4"><dt className="text-sm text-muted">{c.ofSw}</dt><dd className="text-lg">{sw === "on" ? c.ofSwOn : sw === "off" ? c.ofSwOff : c.ofSwNo}</dd></div>
        <div className="guide-card p-4"><dt className="text-sm text-muted">{c.ofInst}</dt><dd className="text-lg">{installed ? c.ofInstYes : c.ofInstNo}</dd></div>
        <div className="guide-card p-4"><dt className="sr-only">{c.ofDocs(docs)}</dt><dd className="text-lg">{c.ofDocs(docs)}</dd></div></dl>
      <div className="mt-6 grid gap-5 md:grid-cols-2">
        <section className="guide-card p-5"><h2 className="text-xl text-teal">{c.ofWorks}</h2><ul className="mt-2 list-disc space-y-1 pl-5">{c.ofW.map((x) => <li key={x}>{x}</li>)}</ul></section>
        <section className="guide-card p-5"><h2 className="text-xl text-ruby">{c.ofNeeds}</h2><ul className="mt-2 list-disc space-y-1 pl-5">{c.ofN.map((x) => <li key={x}>{x}</li>)}</ul></section></div>
    </Head>
  );
}

type Dump = { app: "rumbo"; exported: string; docs: Record<string, unknown> };
const download = (name: string, text: string, type: string) => { const url = URL.createObjectURL(new Blob([text], { type })); const a = document.createElement("a"); a.href = url; a.download = name; document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(url), 1000); };
export function collectDocs(): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  try { for (const k of Object.keys(localStorage)) if (k.startsWith(PREFIX)) { try { const v = JSON.parse(localStorage.getItem(k) ?? "null"); if (v && typeof v === "object" && "v" in v) out[k.slice(PREFIX.length)] = v.v; } catch { /* skip */ } } } catch { /* blocked */ }
  return out;
}
export function parseDump(text: string): Record<string, unknown> | null {
  try { const j = JSON.parse(text) as Dump; if (j?.app !== "rumbo" || !j.docs || typeof j.docs !== "object" || Array.isArray(j.docs)) return null; return Object.fromEntries(Object.entries(j.docs).filter(([k]) => /^[a-z0-9-/_]{1,60}$/i.test(k))); } catch { return null; }
}

export function ExportTool() {
  const c = useCopy(copy);
  const [n, setN] = useState(0);
  const [pending, setPending] = useState<Record<string, unknown> | null>(null);
  const [msg, setMsg] = useState<{ t: string; bad: boolean } | null>(null);
  const file = useRef<HTMLInputElement>(null);
  // eslint-disable-next-line react-hooks/set-state-in-effect -- reading browser state or resetting for a retry; not derivable during render
  useEffect(() => setN(Object.keys(collectDocs()).length), []);
  const dump = () => download(`rumbo-data-${today()}.json`, JSON.stringify({ app: "rumbo", exported: new Date().toISOString(), docs: collectDocs() } satisfies Dump, null, 2), "application/json");
  const summary = () => {
    const docs = collectDocs();
    const lines = Object.entries(docs).sort().map(([k, v]) => `${k}: ${Array.isArray(v) ? `${v.length} ${Array.isArray(v) && v.length === 1 ? "item" : "items"}` : typeof v === "object" && v ? `${Object.keys(v).length} fields` : String(v).slice(0, 60)}`);
    download(`rumbo-summary-${today()}.txt`, `Rumbo data summary, ${today()}\n\n${lines.join("\n")}\n`, "text/plain");
  };
  const pick = async (f: File | undefined) => {
    if (!f) return;
    if (f.size > 5_000_000) return setMsg({ t: c.exBig, bad: true });
    const docs = parseDump(await f.text());
    if (!docs || !Object.keys(docs).length) return setMsg({ t: c.exBad, bad: true });
    setMsg(null); setPending(docs);
  };
  const restore = () => { if (!pending) return; for (const [k, v] of Object.entries(pending)) writeDoc(k, v); setMsg({ t: c.exDone(Object.keys(pending).length), bad: false }); setPending(null); setN(Object.keys(collectDocs()).length); if (file.current) file.current.value = ""; };
  return (
    <Head title={c.exTitle} lead={c.exLead}>
      <p className="mt-4 font-bold text-teal">{c.exCount(n)}</p>
      <div className="mt-3 flex flex-wrap gap-3"><button onClick={dump} className={buttonClass.primary}>{c.exFile}</button><button onClick={summary} className={buttonClass.secondary}>{c.exSumBtn}</button></div>
      <h2 className="mt-8 border-b-[1.5px] border-ink pb-1 text-2xl">{c.exImport}</h2>
      <p className="mt-2 text-muted">{c.exImportHelp}</p>
      <label className="mt-3 block"><span className="block font-bold">{c.exPick}</span><input ref={file} type="file" accept="application/json,.json" onChange={(e) => pick(e.target.files?.[0])} className="mt-1 w-full max-w-full overflow-hidden text-sm" /></label>
      {pending ? <div className="guide-card mt-3 p-4"><p className="font-bold">{c.exCount(Object.keys(pending).length)}</p><div className="mt-2 flex gap-3"><button onClick={restore} className={buttonClass.primary}>{c.exConfirm}</button><button onClick={() => { setPending(null); if (file.current) file.current.value = ""; }} className={buttonClass.secondary}>{c.exCancel}</button></div></div> : null}
      {msg ? <p role={msg.bad ? "alert" : "status"} className={`mt-3 font-bold ${msg.bad ? "text-ruby" : "text-teal"}`}>{msg.t}</p> : null}
      <Callout>{c.exNote}</Callout>
    </Head>
  );
}
