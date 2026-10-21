"use client";
import { useState } from "react";
import { Phone, Plus, Trash2 } from "lucide-react";
import { MOOD_KEY, needsSupportNudge, NO_MOODS, NO_SLEEP, SLEEP_KEY, sleepHours, sleepVerdict, type Mood, type Sleep } from "@/lib/career";
import { addDays, formatDay, today } from "@/lib/dates";
import { useLang } from "@/lib/i18n";
import { useLocalDoc } from "@/lib/local-doc";
import { useCopy } from "@/lib/use-copy";
import { EmptyTrail } from "../art";
import { buttonClass, inputClass, Page } from "../ui";

const copy = {
  en: {
    moodTitle: "Mood check-in", moodLead: "A quick check-in. It is for you, and it stays on your device and account.", howFeel: "How are you feeling today?", names: ["Really low", "Low", "Okay", "Good", "Great"], noteL: "Anything on your mind? (optional)", save: "Save today", saved: "Saved for today. You can change it.",
    last14: "Last 14 days", tipsTitle: "Something small to try", tips: ["Take five slow breaths.", "Drink some water and stretch for two minutes.", "Step outside for a short walk.", "Text a friend or family member just to say hi.", "Write down one thing that went okay today."],
    nudge: "You have felt low a few times this week. That is worth telling someone. Talk to a counselor, a teacher or a family member you trust. The Help lines page has numbers you can call or text any time.", help: "Open help lines", emergency: "If you are in danger or thinking about hurting yourself, call or text 988 right now. For an emergency, call 911.",
    sleepTitle: "Sleep tracker", sleepLead: "Teens need about 8 to 10 hours. Log your bedtime and wake time.", date: "Morning of", bed: "Bedtime", wake: "Wake time", add: "Log sleep", needTimes: "Enter both times.", avg: (n: number) => `Average this week: ${n} hours`, none: "No sleep logged yet.", remove: "Remove",
    verdict: { short: "Less than 8 hours", good: "In the healthy range", long: "More than 10 hours" } as Record<string, string>, h: (n: number) => `${n} h`,
    helpTitle: "Counselor contacts and help lines", helpLead: "Numbers to call or text when you need someone. They are free and private.",
    lines: [
      { n: "988", name: "988 Suicide and Crisis Lifeline", d: "Call or text 988, any time, for anyone in distress.", tel: "988" },
      { n: "741741", name: "Crisis Text Line", d: "Text HOME to 741741 to chat with a trained counselor.", tel: "" },
      { n: "911", name: "Emergency", d: "If someone is in immediate danger, call 911.", tel: "911" },
      { n: "211", name: "211 Texas", d: "Call 211 to find local help with food, housing, health and more.", tel: "211" },
      { n: "1-800-422-4453", name: "Childhelp National Child Abuse Hotline", d: "Call or text for help if someone is hurting you or a child you know.", tel: "18004224453" },
    ],
    mine: "My trusted people", mineLead: "Add your counselor, a teacher or a family member, so their number is in one place.", who: "Name", whoPh: "Ms. Garza, counselor", how: "Phone or email", c_add: "Add", c_empty: "No one added yet.", verify: "Check these numbers on the official sites if you are unsure. They are reliable, but services can change.",
  },
  es: {
    moodTitle: "Cómo me siento", moodLead: "Un chequeo rápido. Es para ti, y se queda en tu dispositivo y tu cuenta.", howFeel: "¿Cómo te sientes hoy?", names: ["Muy mal", "Mal", "Normal", "Bien", "Muy bien"], noteL: "¿Algo en tu mente? (opcional)", save: "Guardar hoy", saved: "Guardado para hoy. Puedes cambiarlo.",
    last14: "Últimos 14 días", tipsTitle: "Algo pequeño para probar", tips: ["Respira lento cinco veces.", "Toma agua y estírate por dos minutos.", "Sal a caminar un rato.", "Escríbele a un amigo o familiar solo para saludar.", "Anota una cosa que salió bien hoy."],
    nudge: "Te has sentido mal varias veces esta semana. Vale la pena contárselo a alguien. Habla con un consejero, un maestro o un familiar de confianza. La página de líneas de ayuda tiene números a los que puedes llamar o escribir a cualquier hora.", help: "Abrir líneas de ayuda", emergency: "Si estás en peligro o piensas en hacerte daño, llama o escribe al 988 ahora mismo. En una emergencia, llama al 911.",
    sleepTitle: "Registro de sueño", sleepLead: "Los adolescentes necesitan de 8 a 10 horas. Anota tu hora de dormir y de despertar.", date: "Mañana del", bed: "Hora de dormir", wake: "Hora de despertar", add: "Anotar sueño", needTimes: "Escribe las dos horas.", avg: (n: number) => `Promedio esta semana: ${n} horas`, none: "Todavía no hay sueño anotado.", remove: "Quitar",
    verdict: { short: "Menos de 8 horas", good: "Dentro de lo saludable", long: "Más de 10 horas" } as Record<string, string>, h: (n: number) => `${n} h`,
    helpTitle: "Contactos de consejeros y líneas de ayuda", helpLead: "Números a los que llamar o escribir cuando necesites a alguien. Son gratis y privados.",
    lines: [
      { n: "988", name: "Línea 988 de Prevención del Suicidio y Crisis", d: "Llama o escribe al 988, a cualquier hora, si alguien está en crisis. Hay atención en español.", tel: "988" },
      { n: "741741", name: "Línea de Texto para Crisis", d: "Escribe HOME al 741741 para hablar con un consejero capacitado.", tel: "" },
      { n: "911", name: "Emergencia", d: "Si alguien está en peligro inmediato, llama al 911.", tel: "911" },
      { n: "211", name: "211 Texas", d: "Llama al 211 para encontrar ayuda local con comida, vivienda, salud y más.", tel: "211" },
      { n: "1-800-422-4453", name: "Línea Nacional contra el Abuso Infantil (Childhelp)", d: "Llama o escribe si alguien te está haciendo daño a ti o a un niño que conoces.", tel: "18004224453" },
    ],
    mine: "Mis personas de confianza", mineLead: "Agrega a tu consejero, un maestro o un familiar, para tener su número en un solo lugar.", who: "Nombre", whoPh: "Sra. Garza, consejera", how: "Teléfono o correo", c_add: "Agregar", c_empty: "Todavía no hay nadie.", verify: "Revisa estos números en los sitios oficiales si tienes dudas. Son confiables, pero los servicios pueden cambiar.",
  },
};

export function MoodTool() {
  const c = useCopy(copy);
  const lang = useLang();
  const [log, setLog] = useLocalDoc<Mood[]>(MOOD_KEY, NO_MOODS);
  const now = today();
  const todays = log.find((m) => m.date === now);
  const [note, setNote] = useState(todays?.note ?? "");
  const [justSaved, setJustSaved] = useState(false);
  const setMood = (mood: Mood["mood"]) => { setLog((p) => [...p.filter((m) => m.date !== now), { date: now, mood, note }].slice(-120)); setJustSaved(true); };
  const days = Array.from({ length: 14 }, (_, i) => addDays(now, i - 13));
  const byDay = new Map(log.map((m) => [m.date, m]));
  const tip = c.tips[new Date().getDate() % c.tips.length];
  const COLORS = ["bg-ruby", "bg-terracotta", "bg-marigold", "bg-teal", "bg-teal"];
  return (
    <Page>
      <h1 className="text-3xl sm:text-4xl">{c.moodTitle}</h1>
      <p className="mt-2 max-w-prose text-muted">{c.moodLead}</p>
      <section className="guide-card mt-6 p-5">
        <h2 className="text-xl">{c.howFeel}</h2>
        <div className="mt-3 grid grid-cols-5 gap-2" role="group" aria-label={c.howFeel}>{([1, 2, 3, 4, 5] as const).map((n) => (
          <button key={n} onClick={() => setMood(n)} aria-pressed={todays?.mood === n} className={`rounded-md border-[1.5px] border-ink px-1 py-3 text-center font-bold ${todays?.mood === n ? "bg-ink text-paper" : "bg-surface hover:bg-sunken"}`}><span className="block font-display text-2xl">{n}</span><span className="block text-xs sm:text-sm">{c.names[n - 1]}</span></button>))}</div>
        <label className="mt-4 block"><span className="block font-bold">{c.noteL}</span><textarea value={note} onChange={(e) => setNote(e.target.value)} rows={2} maxLength={300} className={`${inputClass} mt-1`} /></label>
        <p className="mt-2 text-sm text-muted" role="status">{justSaved || todays ? c.saved : ""}</p>
      </section>
      {needsSupportNudge(log, now) ? (
        <section className="guide-card mt-6 border-l-[6px] border-l-ruby p-5" role="note"><p className="text-lg">{c.nudge}</p><p className="mt-2 font-bold">{c.emergency}</p>
          <a href="/t/wellbeing/contacts" className="mt-3 inline-block font-bold text-teal underline underline-offset-4">{c.help}</a></section>
      ) : (
        <section className="guide-card mt-6 p-5"><h2 className="text-xl">{c.tipsTitle}</h2><p className="mt-1 text-lg">{tip}</p></section>
      )}
      <h2 className="mt-8 border-b-[1.5px] border-ink pb-1 text-2xl">{c.last14}</h2>
      <ol className="mt-3 flex gap-1.5" aria-label={c.last14}>{days.map((d) => { const m = byDay.get(d); return (
        <li key={d} className="flex flex-1 flex-col items-center gap-1" title={`${formatDay(d, lang)}${m ? `: ${c.names[m.mood - 1]}` : ""}`}>
          <span className={`h-10 w-full rounded-sm border border-ink ${m ? COLORS[m.mood - 1] : "bg-sunken"}`} aria-hidden /><span className="text-[0.65rem] text-muted">{Number(d.slice(8))}</span></li>); })}</ol>
    </Page>
  );
}

export function SleepTool() {
  const c = useCopy(copy);
  const lang = useLang();
  const [log, setLog] = useLocalDoc<Sleep[]>(SLEEP_KEY, NO_SLEEP);
  const [f, setF] = useState({ date: today(), bed: "22:30", wake: "06:30" });
  const [err, setErr] = useState(false);
  const add = (e: React.FormEvent) => {
    e.preventDefault();
    if (sleepHours(f.bed, f.wake) === null) return setErr(true);
    setErr(false);
    setLog((p) => [{ ...f }, ...p.filter((x) => x.date !== f.date)].slice(0, 120));
  };
  const rows = [...log].sort((a, b) => b.date.localeCompare(a.date));
  const week = rows.filter((r) => r.date > addDays(today(), -7)).map((r) => sleepHours(r.bed, r.wake)!).filter((h) => h > 0);
  const avg = week.length ? Math.round((week.reduce((n, h) => n + h, 0) / week.length) * 10) / 10 : null;
  return (
    <Page>
      <h1 className="text-3xl sm:text-4xl">{c.sleepTitle}</h1>
      <p className="mt-2 max-w-prose text-muted">{c.sleepLead}</p>
      <form onSubmit={add} className="guide-card mt-6 grid gap-x-4 gap-y-3 p-5 sm:grid-cols-[1fr_1fr_1fr_auto] sm:items-end" noValidate>
        <label><span className="block font-bold">{c.date}</span><input type="date" max={today()} value={f.date} onChange={(e) => setF({ ...f, date: e.target.value })} className={`${inputClass} mt-1`} /></label>
        <label><span className="block font-bold">{c.bed}</span><input type="time" value={f.bed} onChange={(e) => setF({ ...f, bed: e.target.value })} className={`${inputClass} mt-1`} /></label>
        <label><span className="block font-bold">{c.wake}</span><input type="time" value={f.wake} onChange={(e) => setF({ ...f, wake: e.target.value })} className={`${inputClass} mt-1`} /></label>
        <button className={buttonClass.primary}><Plus size={18} />{c.add}</button>
        {err ? <p role="alert" className="font-bold text-ruby sm:col-span-4">{c.needTimes}</p> : null}
      </form>
      {avg !== null ? <p className="mt-4 font-display text-2xl font-semibold text-teal" aria-live="polite">{c.avg(avg)}</p> : null}
      {rows.length === 0 ? <div className="guide-card mt-6 flex max-w-xl items-center gap-5 p-5"><EmptyTrail className="h-24 w-36 shrink-0 text-ink" /><p className="text-lg">{c.none}</p></div> : (
        <ul className="mt-4 divide-y-2 divide-dotted divide-line">{rows.slice(0, 30).map((r) => { const h = sleepHours(r.bed, r.wake)!; const v = sleepVerdict(h); return (
          <li key={r.date} className="flex items-center gap-3 py-2.5"><div className="min-w-0 flex-1"><p className="font-bold">{formatDay(r.date, lang)} · {c.h(h)}</p><p className="text-sm text-muted">{r.bed} → {r.wake} · <span className={v === "good" ? "font-bold text-teal" : "font-bold text-terracotta"}>{c.verdict[v]}</span></p></div>
            <button onClick={() => setLog((p) => p.filter((x) => x.date !== r.date))} aria-label={`${c.remove}: ${r.date}`} className="grid h-10 w-10 shrink-0 place-items-center rounded-md hover:bg-sunken"><Trash2 size={18} strokeWidth={1.75} /></button></li>); })}</ul>
      )}
    </Page>
  );
}

interface Person { id: string; name: string; how: string }
const NO_PEOPLE: Person[] = [];
export function HelpTool() {
  const c = useCopy(copy);
  const [people, setPeople] = useLocalDoc<Person[]>("trusted-people", NO_PEOPLE);
  const [name, setName] = useState(""), [how, setHow] = useState("");
  return (
    <Page>
      <h1 className="text-3xl sm:text-4xl">{c.helpTitle}</h1>
      <p className="mt-2 max-w-prose text-muted">{c.helpLead}</p>
      <ul className="mt-6 space-y-3">{c.lines.map((l) => (
        <li key={l.name} className="guide-card flex items-center gap-4 p-4"><span className="grid h-14 w-14 shrink-0 place-items-center rounded-full border-[1.5px] border-ink bg-marigold text-on-marigold"><Phone size={22} aria-hidden /></span>
          <div className="min-w-0 flex-1"><p className="font-display text-xl font-semibold">{l.name}</p><p className="text-muted">{l.d}</p></div>
          {l.tel ? <a href={`tel:${l.tel}`} className={`${buttonClass.primary} shrink-0`}>{l.n}</a> : <span className="shrink-0 rounded-md border-[1.5px] border-ink px-3 py-2 font-bold">{l.n}</span>}</li>))}</ul>
      <p className="mt-3 max-w-prose text-sm text-muted">{c.verify}</p>
      <h2 className="mt-8 border-b-[1.5px] border-ink pb-1 text-2xl">{c.mine}</h2>
      <p className="mt-2 max-w-prose text-muted">{c.mineLead}</p>
      <form className="mt-3 flex flex-wrap items-end gap-3" onSubmit={(e) => { e.preventDefault(); if (name.trim()) { setPeople((p) => [...p, { id: crypto.randomUUID(), name: name.trim(), how: how.trim() }]); setName(""); setHow(""); } }}>
        <label className="min-w-[12rem] flex-1"><span className="block font-bold">{c.who}</span><input value={name} onChange={(e) => setName(e.target.value)} placeholder={c.whoPh} maxLength={60} className={`${inputClass} mt-1`} /></label>
        <label className="min-w-[10rem] flex-1"><span className="block font-bold">{c.how}</span><input value={how} onChange={(e) => setHow(e.target.value)} maxLength={80} className={`${inputClass} mt-1`} /></label>
        <button className={buttonClass.primary}><Plus size={18} />{c.c_add}</button>
      </form>
      {people.length === 0 ? <p className="mt-3 text-muted">{c.c_empty}</p> : (
        <ul className="mt-3 divide-y-2 divide-dotted divide-line">{people.map((p) => (
          <li key={p.id} className="flex items-center gap-3 py-2.5"><p className="min-w-0 flex-1"><span className="font-bold">{p.name}</span>{p.how ? <span className="text-muted"> · {p.how}</span> : null}</p>
            <button onClick={() => setPeople((q) => q.filter((x) => x.id !== p.id))} aria-label={p.name} className="grid h-10 w-10 shrink-0 place-items-center rounded-md hover:bg-sunken"><Trash2 size={18} strokeWidth={1.75} /></button></li>))}</ul>
      )}
    </Page>
  );
}
