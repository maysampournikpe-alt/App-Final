"use client";
import Link from "next/link";
import { useState } from "react";
import { DEMO_KEYS, demoDocs } from "@/lib/demo";
import { useLang } from "@/lib/i18n";
import { writeDoc } from "@/lib/local-doc";
import { applySyncedPrefs, setPrefs } from "@/lib/prefs";
import { useCopy } from "@/lib/use-copy";
import { buttonClass, Page } from "./ui";

const copy = {
  en: {
    title: "Demo data", lead: "Fills this device with sample classes, homework, saved items, a plan in progress, focus time and SAT practice, so you can see the app with real-looking content. It replaces what is saved on this device for those tools.",
    load: "Load sample data", clear: "Remove sample data", loaded: "Sample data loaded. Everything below now has something in it.", cleared: "Sample data removed from this device.",
    where: "Look at", links: [["/t/grades/gpa", "GPA calculator"], ["/t/homework/tracker", "Homework tracker"], ["/t/focus/pomodoro", "Pomodoro and weekly chart"], ["/t/find/saved", "My Saved"], ["/t/plan/checklists", "Plan with progress"], ["/t/sat/scores", "SAT score tracker"], ["/t/study/weak", "Weak spot finder"], ["/t/study/mistakes", "Mistake notebook"], ["/t/coach/chat", "Coach"]] as [string, string][],
    note: "Sample items are labeled “Sample”. Real searches always show real sources.",
  },
  es: {
    title: "Datos de demostración", lead: "Llena este dispositivo con clases, tarea, guardados, un plan en progreso, tiempo de concentración y práctica del SAT de ejemplo, para ver la app con contenido que parece real. Reemplaza lo guardado en este dispositivo para esas herramientas.",
    load: "Cargar datos de ejemplo", clear: "Quitar datos de ejemplo", loaded: "Datos de ejemplo cargados. Todo lo de abajo ya tiene contenido.", cleared: "Se quitaron los datos de ejemplo de este dispositivo.",
    where: "Mira", links: [["/t/grades/gpa", "Calculadora de GPA"], ["/t/homework/tracker", "Registro de tarea"], ["/t/focus/pomodoro", "Pomodoro y gráfica semanal"], ["/t/find/saved", "Mis guardados"], ["/t/plan/checklists", "Plan con avance"], ["/t/sat/scores", "Puntajes del SAT"], ["/t/study/weak", "Puntos débiles"], ["/t/study/mistakes", "Cuaderno de errores"], ["/t/coach/chat", "Entrenador"]] as [string, string][],
    note: "Lo de ejemplo dice “Sample”. Las búsquedas reales siempre muestran fuentes reales.",
  },
};

export function DemoView() {
  const c = useCopy(copy);
  const lang = useLang();
  const [state, setState] = useState<"idle" | "loaded" | "cleared">("idle");
  const load = () => {
    const docs = demoDocs(lang);
    for (const k of DEMO_KEYS) if (k !== "prefs") writeDoc(k, docs[k]);
    setPrefs((docs.prefs as { pinned: string[] }));
    applySyncedPrefs();
    setState("loaded");
  };
  const clear = () => {
    for (const k of DEMO_KEYS) { try { localStorage.removeItem(`rumbo:data:${k}`); } catch { /* blocked */ } }
    setPrefs({ pinned: [] });
    setState("cleared");
    location.reload();
  };
  return (
    <Page>
      <h1 className="text-3xl sm:text-4xl">{c.title}</h1>
      <p className="mt-3 max-w-prose text-lg">{c.lead}</p>
      <div className="mt-6 flex flex-wrap gap-3">
        <button onClick={load} className={buttonClass.primary}>{c.load}</button>
        <button onClick={clear} className={buttonClass.quiet}>{c.clear}</button>
      </div>
      <p role="status" className="mt-4 font-bold text-palm">{state === "loaded" ? c.loaded : state === "cleared" ? c.cleared : ""}</p>
      <h2 className="mb-2 mt-8 text-2xl">{c.where}</h2>
      <ul className="grid max-w-xl gap-2 sm:grid-cols-2">
        {c.links.map(([href, label]) => <li key={href}><Link href={href} className="guide-card block p-3 font-bold text-teal hover:underline">{label}</Link></li>)}
      </ul>
      <p className="mt-6 text-sm text-muted">{c.note}</p>
    </Page>
  );
}
