"use client";
import Link from "next/link";
import { useMemo, useState } from "react";
import { Plus, Printer, Trash2 } from "lucide-react";
import { INTERESTS } from "@/config/interests";
import { IDEAS, type Idea } from "@/data/ideas";
import { collectItems } from "@/lib/calendar";
import { addDays, formatDay, today } from "@/lib/dates";
import { matches, outside, weekNumber } from "@/lib/foryou";
import { HOMEWORK_KEY, NO_ASSIGNMENTS, type Assignment } from "@/lib/homework";
import { useLang } from "@/lib/i18n";
import { useLocalDoc } from "@/lib/local-doc";
import { useProfile } from "@/lib/profile";
import type { SavedListing } from "@/lib/saved";
import { EVENTS_KEY, NO_EVENTS, type SchoolEvent } from "@/lib/schedule";
import { useCopy } from "@/lib/use-copy";
import { buttonClass, inputClass } from "../ui";
import { Callout, Empty, Ext, Head } from "./shared";

const copy = {
  en: {
    add: "Add", remove: "Remove", search: "Search this", run: "Search again",
    hiTitle: "Search history", hiLead: "Run an earlier Opportunity Finder search again with one tap. Kept on this device.", hiEmpty: "No searches yet. Your searches in the Finder will show up here.", hiClear: "Clear history", hiIn: "near",
    ssTitle: "Saved searches", ssLead: "Keep the searches you like and run them again any time to see what is new.", ssNote: "This does not send automatic alerts. Open a saved search now and then, because new listings appear all the time.", ssPh: "Chess clubs", ssLabel: "Search to save", ssEmpty: "No saved searches yet.", ssFromHist: "Save one from your history", ssDup: "Already saved.",
    suTitle: "Surprise me", suLead: "One idea for something you might never think to search for. Tap to see what is out there near you.", suBtn: "Surprise me", suWhy: "Why not try", suOutside: "Outside my interests", suAny: "Anything",
    siTitle: "Similar opportunities", siLead: "Pick something you saved and get searches for more like it.", siNone: "Save an opportunity in the Finder first. Then come back here.", siOpen: "Open the Finder", siPick: "A saved opportunity", siIdeas: "Searches to try", siQ: [(t: string) => `programs similar to ${t}`, (_t: string, o: string) => `${o || "youth programs"} other programs for students`, (_t: string, _o: string, c: string) => `${c || "student"} opportunities for teens near me`, (t: string) => `free alternatives to ${t}`],
    flTitle: "Printable flyers", flLead: "Fill in the details of an event or opportunity and print a flyer to post at school or share with friends. Always get permission before posting.", fName: "What is it?", fOrg: "Hosted by", fWhen: "When", fWhere: "Where", fCost: "Cost", fContact: "How to sign up (website or contact)", fAbout: "A few words about it", fFrom: "Fill from a saved opportunity", fPrint: "Print flyer", fPh: "Beginner chess club", fNone: "(none)", fPermission: "Check your school's rules and get a teacher's OK before you post a flyer. Only share contact details you are comfortable making public.", fFree: "Free",
    mpTitle: "Map view", mpLead: "See where your saved opportunities are. Each one opens in Google Maps in a new tab.", mpNone: "None of your saved opportunities has a location yet.", mpOnline: "Online", mpNear: "Search near me", mpPlace: "City or ZIP code", mpTypes: ["youth centers", "libraries", "community centers", "parks and recreation", "colleges"], mpHead: "Find places near you", mpOpen: "Open in Maps",
    fyTitle: "Recommendation feed", fyLead: "Ideas picked from your interests and grade, each with a reason. These are things to search for, so you can find real, current listings.", wkTitle: "Picked for you this week", wkLead: "A short summary for this week: a few ideas that match you, one new thing, and what is coming up.", tnTitle: "Try something new", tnLead: "Ideas from outside your usual interests, so you can discover more. A new batch every week.", because: (n: string) => `Because you like ${n.toLowerCase()}`, general: "A popular place to start", fresh: "Something new to try", noInt: "Pick your interests in your Profile to get ideas that fit you.", prof: "Open my Profile", thisWeek: "This week", soon: "Coming up", nothingSoon: "Nothing due in the next 7 days.", reroll: "Show other ideas",
  },
  es: {
    add: "Agregar", remove: "Quitar", search: "Buscar esto", run: "Buscar otra vez",
    hiTitle: "Historial de búsquedas", hiLead: "Repite con un toque una búsqueda anterior del Buscador de oportunidades. Se guarda en este dispositivo.", hiEmpty: "Todavía no hay búsquedas. Tus búsquedas en el Buscador aparecerán aquí.", hiClear: "Borrar historial", hiIn: "cerca de",
    ssTitle: "Búsquedas guardadas", ssLead: "Guarda las búsquedas que te gusten y repítelas cuando quieras para ver qué hay de nuevo.", ssNote: "Esto no manda avisos automáticos. Abre una búsqueda guardada de vez en cuando, porque aparecen opciones nuevas todo el tiempo.", ssPh: "Clubes de ajedrez", ssLabel: "Búsqueda por guardar", ssEmpty: "Todavía no hay búsquedas guardadas.", ssFromHist: "Guardar una de tu historial", ssDup: "Ya está guardada.",
    suTitle: "Sorpréndeme", suLead: "Una idea de algo que quizás nunca pensaste buscar. Toca para ver qué hay cerca de ti.", suBtn: "Sorpréndeme", suWhy: "¿Por qué no probar", suOutside: "Fuera de mis intereses", suAny: "Lo que sea",
    siTitle: "Oportunidades parecidas", siLead: "Elige algo que guardaste y recibe búsquedas para encontrar más como eso.", siNone: "Primero guarda una oportunidad en el Buscador. Luego regresa aquí.", siOpen: "Abrir el Buscador", siPick: "Una oportunidad guardada", siIdeas: "Búsquedas para probar", siQ: [(t: string) => `programs similar to ${t}`, (_t: string, o: string) => `${o || "youth programs"} other programs for students`, (_t: string, _o: string, c: string) => `${c || "student"} opportunities for teens near me`, (t: string) => `free alternatives to ${t}`],
    flTitle: "Volantes para imprimir", flLead: "Llena los datos de un evento u oportunidad e imprime un volante para pegar en tu escuela o compartir con amigos. Siempre pide permiso antes de pegarlo.", fName: "¿Qué es?", fOrg: "Organiza", fWhen: "Cuándo", fWhere: "Dónde", fCost: "Costo", fContact: "Cómo inscribirse (sitio web o contacto)", fAbout: "Unas palabras sobre el evento", fFrom: "Llenar con una oportunidad guardada", fPrint: "Imprimir volante", fPh: "Club de ajedrez para principiantes", fNone: "(ninguna)", fPermission: "Revisa las reglas de tu escuela y pide el visto bueno de un maestro antes de pegar un volante. Comparte solo datos de contacto que te parezca bien hacer públicos.", fFree: "Gratis",
    mpTitle: "Vista de mapa", mpLead: "Mira dónde están tus oportunidades guardadas. Cada una abre Google Maps en una pestaña nueva.", mpNone: "Ninguna de tus oportunidades guardadas tiene ubicación todavía.", mpOnline: "En línea", mpNear: "Buscar cerca de mí", mpPlace: "Ciudad o código postal", mpTypes: ["centros juveniles", "bibliotecas", "centros comunitarios", "parques y recreación", "universidades"], mpHead: "Encuentra lugares cerca de ti", mpOpen: "Abrir en Mapas",
    fyTitle: "Recomendaciones para ti", fyLead: "Ideas escogidas según tus intereses y tu grado, cada una con su razón. Son cosas para buscar, así encuentras opciones reales y actuales.", wkTitle: "Lo mejor de tu semana", wkLead: "Un resumen corto de esta semana: unas ideas que te van, algo nuevo y lo que viene.", tnTitle: "Prueba algo nuevo", tnLead: "Ideas fuera de tus intereses de siempre, para que descubras más. Un grupo nuevo cada semana.", because: (n: string) => `Porque te gusta ${n.toLowerCase()}`, general: "Un buen lugar para empezar", fresh: "Algo nuevo para probar", noInt: "Elige tus intereses en tu Perfil para recibir ideas que te queden.", prof: "Abrir mi Perfil", thisWeek: "Esta semana", soon: "Lo que viene", nothingSoon: "No vence nada en los próximos 7 días.", reroll: "Mostrar otras ideas",
  },
};
const href = (q: string) => `/t/find/search?q=${encodeURIComponent(q)}`;
const rm = (label: string, text: string, fn: () => void) => <button onClick={fn} aria-label={`${text}: ${label}`} className="grid h-10 w-10 shrink-0 place-items-center rounded-md hover:bg-sunken"><Trash2 size={18} strokeWidth={1.75} /></button>;

const NO_SAVED: SavedListing[] = [];
export type Hist = { q: string; place: string; at: number };
export const HISTORY_KEY = "finder-history";
export const NO_HIST: Hist[] = [];

export function HistoryTool() {
  const c = useCopy(copy);
  const [h, setH] = useLocalDoc<Hist[]>(HISTORY_KEY, NO_HIST);
  return (
    <Head title={c.hiTitle} lead={c.hiLead}>
      {h.length === 0 ? <Empty>{c.hiEmpty}</Empty> : <>
        <ul className="mt-5 divide-y-2 divide-dotted divide-line">{h.map((x) => <li key={x.at} className="flex items-center gap-3 py-3"><div className="min-w-0 flex-1"><p className="font-bold">{x.q}</p>{x.place ? <p className="text-sm text-muted">{c.hiIn} {x.place}</p> : null}</div>
          <Link href={href(x.q)} className={buttonClass.secondary} aria-label={`${c.run}: ${x.q}`}>{c.run}</Link>{rm(x.q, c.remove, () => setH((p) => p.filter((y) => y.at !== x.at)))}</li>)}</ul>
        <button onClick={() => setH([])} className="mt-4 font-bold text-ruby underline underline-offset-4">{c.hiClear}</button></>}
    </Head>
  );
}

type Saved = { id: string; q: string };
const NO_SS: Saved[] = [];
export function SavedSearchesTool() {
  const c = useCopy(copy);
  const [list, setList] = useLocalDoc<Saved[]>("saved-searches", NO_SS);
  const [hist] = useLocalDoc<Hist[]>(HISTORY_KEY, NO_HIST);
  const [q, setQ] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const addQ = (text: string) => { const t = text.trim(); if (t.length < 2) return; if (list.some((x) => x.q.toLowerCase() === t.toLowerCase())) return setErr(c.ssDup); setErr(null); setList((p) => [...p, { id: crypto.randomUUID(), q: t }]); setQ(""); };
  const fromHist = hist.filter((x) => !list.some((y) => y.q.toLowerCase() === x.q.toLowerCase())).slice(0, 5);
  return (
    <Head title={c.ssTitle} lead={c.ssLead}>
      <form className="mt-5 flex flex-wrap items-end gap-3" onSubmit={(e) => { e.preventDefault(); addQ(q); }}>
        <label className="min-w-0 flex-1"><span className="block font-bold">{c.ssLabel}</span><input value={q} onChange={(e) => setQ(e.target.value)} placeholder={c.ssPh} maxLength={120} className={`${inputClass} mt-1`} /></label><button className={buttonClass.primary}><Plus size={18} />{c.add}</button></form>
      {err ? <p role="alert" className="mt-2 font-bold text-ruby">{err}</p> : null}
      {fromHist.length ? <div className="mt-3"><p className="text-sm font-bold">{c.ssFromHist}</p><div className="mt-1 flex flex-wrap gap-2">{fromHist.map((x) => <button key={x.at} onClick={() => addQ(x.q)} className="rounded-full border-[1.5px] border-ink bg-surface px-3 py-1 hover:bg-sunken">{x.q}</button>)}</div></div> : null}
      {list.length === 0 ? <Empty>{c.ssEmpty}</Empty> : <ul className="mt-5 divide-y-2 divide-dotted divide-line">{list.map((x) => <li key={x.id} className="flex items-center gap-3 py-3"><p className="min-w-0 flex-1 font-bold">{x.q}</p><Link href={href(x.q)} className={buttonClass.secondary} aria-label={`${c.run}: ${x.q}`}>{c.run}</Link>{rm(x.q, c.remove, () => setList((p) => p.filter((y) => y.id !== x.id)))}</li>)}</ul>}
      <Callout>{c.ssNote}</Callout>
    </Head>
  );
}

export function SurpriseTool() {
  const c = useCopy(copy);
  const lang = useLang();
  const [profile] = useProfile();
  const [mode, setMode] = useState<"any" | "outside">("any");
  const [pick, setPick] = useState<Idea | null>(null);
  const roll = () => { const pool = mode === "outside" ? IDEAS.filter((i) => !profile.interests.includes(i.interest)) : IDEAS; setPick(pool[Math.floor(Math.random() * pool.length)]); };
  return (
    <Head title={c.suTitle} lead={c.suLead}>
      <div className="mt-5 flex flex-wrap gap-2" role="group" aria-label={c.suTitle}>{(["any", "outside"] as const).map((m) => <button key={m} onClick={() => setMode(m)} aria-pressed={mode === m} className={`rounded-full border-[1.5px] border-ink px-4 py-1.5 font-bold ${mode === m ? "bg-ink text-paper" : "bg-surface hover:bg-sunken"}`}>{m === "any" ? c.suAny : c.suOutside}</button>)}</div>
      <button onClick={roll} className={`${buttonClass.primary} mt-4`}>{c.suBtn}</button>
      {pick ? <section className="guide-card mt-5 p-6" aria-live="polite"><p className="text-muted">{c.suWhy}…</p><h2 className="font-display text-3xl font-semibold">{pick[lang]}</h2><Link href={href(pick.q)} className={`${buttonClass.primary} mt-4 inline-flex`}>{c.search}</Link></section> : null}
    </Head>
  );
}

export function SimilarTool() {
  const c = useCopy(copy);
  const [saved] = useLocalDoc<SavedListing[]>("saved-opportunities", NO_SAVED);
  const [i, setI] = useState(0);
  const l = saved[i] ?? saved[0];
  return (
    <Head title={c.siTitle} lead={c.siLead}>
      {saved.length === 0 ? <><Empty>{c.siNone}</Empty><Link href="/t/find/search" className={`${buttonClass.primary} mt-3 inline-flex`}>{c.siOpen}</Link></> : <>
        <label className="mt-5 block max-w-xl"><span className="block font-bold">{c.siPick}</span><select value={i} onChange={(e) => setI(Number(e.target.value))} className={`${inputClass} mt-1`}>{saved.map((s, k) => <option key={s.sourceUrl} value={k}>{s.title}</option>)}</select></label>
        <h2 className="mt-5 text-2xl">{c.siIdeas}</h2>
        <ul className="mt-2 space-y-2">{c.siQ.map((f, k) => { const q = f(l.title, l.organization ?? "", l.category ?? ""); return <li key={k} className="guide-card flex flex-wrap items-center gap-3 p-3"><span className="min-w-0 flex-1 text-lg">{q}</span><Link href={href(q)} className={buttonClass.secondary} aria-label={`${c.search}: ${q}`}>{c.search}</Link></li>; })}</ul></>}
    </Head>
  );
}

type Flyer = { name: string; org: string; when: string; where: string; cost: string; contact: string; about: string };
const NO_FLYER: Flyer = { name: "", org: "", when: "", where: "", cost: "", contact: "", about: "" };
export function FlyerTool() {
  const c = useCopy(copy);
  const [f, setF] = useLocalDoc<Flyer>("flyer", NO_FLYER);
  const [saved] = useLocalDoc<SavedListing[]>("saved-opportunities", NO_SAVED);
  const field = (k: keyof Flyer, label: string, ph = "") => <label><span className="block font-bold">{label}</span><input value={f[k]} onChange={(e) => setF({ ...f, [k]: e.target.value })} placeholder={ph} maxLength={k === "about" ? 300 : 120} className={`${inputClass} mt-1`} /></label>;
  return (
    <Head title={c.flTitle} lead={c.flLead}>
      <div className="print:hidden">
        {saved.length ? <label className="mt-5 block max-w-xl"><span className="block font-bold">{c.fFrom}</span><select value="" onChange={(e) => { const s = saved[Number(e.target.value)]; if (s) setF({ name: s.title, org: s.organization ?? "", when: "", where: s.online ? "Online" : s.location ?? "", cost: s.cost === "free" ? c.fFree : s.costNote ?? "", contact: s.sourceUrl, about: (s.description ?? "").slice(0, 300) }); }} className={`${inputClass} mt-1`}><option value="">{c.fNone}</option>{saved.map((s, k) => <option key={s.sourceUrl} value={k}>{s.title}</option>)}</select></label> : null}
        <div className="guide-card mt-4 grid gap-4 p-5 sm:grid-cols-2">{field("name", c.fName, c.fPh)}{field("org", c.fOrg)}{field("when", c.fWhen)}{field("where", c.fWhere)}{field("cost", c.fCost)}{field("contact", c.fContact)}<div className="sm:col-span-2">{field("about", c.fAbout)}</div></div>
        <button onClick={() => window.print()} disabled={!f.name.trim()} className={`${buttonClass.primary} mt-4`}><Printer size={18} />{c.fPrint}</button>
        <Callout>{c.fPermission}</Callout></div>
      {f.name.trim() ? <article className="mx-auto mt-6 max-w-2xl rounded-lg border-[3px] border-ink bg-surface p-8 text-center print:mt-0 print:border-4" aria-label={f.name}>
        <h2 className="font-display text-4xl font-semibold leading-tight sm:text-5xl">{f.name}</h2>
        {f.org ? <p className="mt-2 text-xl">{f.org}</p> : null}
        {f.about ? <p className="mx-auto mt-4 max-w-prose text-lg">{f.about}</p> : null}
        <dl className="mx-auto mt-6 grid max-w-md gap-2 text-left text-lg">{[[c.fWhen, f.when], [c.fWhere, f.where], [c.fCost, f.cost]].filter(([, v]) => v).map(([k, v]) => <div key={k} className="flex gap-3 border-b-2 border-dotted border-line pb-1"><dt className="w-24 shrink-0 font-bold">{k}</dt><dd className="min-w-0 break-words">{v}</dd></div>)}</dl>
        {f.contact ? <p className="mt-6 break-words text-xl font-bold">{f.contact}</p> : null}</article> : null}
    </Head>
  );
}

export function MapTool() {
  const c = useCopy(copy);
  const [saved] = useLocalDoc<SavedListing[]>("saved-opportunities", NO_SAVED);
  const [place] = useLocalDoc<string>("finder-place", "");
  const [near, setNear] = useState(place);
  const withLoc = saved.filter((s) => s.location && !s.online);
  const maps = (q: string) => `https://www.google.com/maps/search/${encodeURIComponent(q)}`;
  return (
    <Head title={c.mpTitle} lead={c.mpLead}>
      {saved.length === 0 || withLoc.length === 0 ? <Empty>{c.mpNone}</Empty> : <ul className="mt-5 space-y-2">{withLoc.map((s) => <li key={s.sourceUrl} className="guide-card flex flex-wrap items-center gap-3 p-3"><div className="min-w-0 flex-1"><p className="font-bold">{s.title}</p><p className="text-sm text-muted">{s.location}</p></div><Ext href={maps(`${s.organization ?? s.title} ${s.location}`)}>{c.mpOpen}</Ext></li>)}</ul>}
      {saved.some((s) => s.online) ? <p className="mt-3 text-sm text-muted">{c.mpOnline}: {saved.filter((s) => s.online).map((s) => s.title).join(", ")}</p> : null}
      <h2 className="mt-8 border-b-[1.5px] border-ink pb-1 text-2xl">{c.mpHead}</h2>
      <label className="mt-3 block max-w-sm"><span className="block font-bold">{c.mpPlace}</span><input value={near} onChange={(e) => setNear(e.target.value)} maxLength={60} className={`${inputClass} mt-1`} /></label>
      <ul className="mt-3 flex flex-wrap gap-3">{c.mpTypes.map((t) => <li key={t}><Ext href={maps(`${t} ${near}`.trim())}>{t}</Ext></li>)}</ul>
    </Head>
  );
}

export function ForYouTool({ view }: { view: "feed" | "weekly" | "trynew" }) {
  const c = useCopy(copy);
  const lang = useLang();
  const [profile] = useProfile();
  const [saved] = useLocalDoc<SavedListing[]>("saved-opportunities", NO_SAVED);
  const [homework] = useLocalDoc<Assignment[]>(HOMEWORK_KEY, NO_ASSIGNMENTS);
  const [events] = useLocalDoc<SchoolEvent[]>(EVENTS_KEY, NO_EVENTS);
  const [bump, setBump] = useState(0);
  const now = today();
  const seed = weekNumber(now) + bump;
  const mine = useMemo(() => matches(profile.interests, profile.grade, seed, view === "weekly" ? 3 : 6), [profile, seed, view]);
  const fresh = useMemo(() => outside(profile.interests, profile.grade, seed, view === "trynew" ? 3 : 1), [profile, seed, view]);
  const name = (id: string) => INTERESTS.find((x) => x.id === id)?.name[lang] ?? id;
  const card = (i: Idea, why: string) => <li key={i.q} className="guide-card flex flex-wrap items-center gap-3 p-4"><div className="min-w-0 flex-1"><h2 className="text-xl">{i[lang]}</h2><p className="text-sm text-muted">{why}</p></div><Link href={href(i.q)} className={buttonClass.secondary} aria-label={`${c.search}: ${i[lang]}`}>{c.search}</Link></li>;
  const upcoming = collectItems({ saved, homework, countdowns: [], events, now }).filter((x) => x.date >= now && x.date <= addDays(now, 7)).slice(0, 6);
  const title = view === "feed" ? c.fyTitle : view === "weekly" ? c.wkTitle : c.tnTitle;
  return (
    <Head title={title} lead={view === "feed" ? c.fyLead : view === "weekly" ? c.wkLead : c.tnLead}>
      {profile.interests.length === 0 && view !== "trynew" ? <Callout>{c.noInt} <Link href="/t/profile/interests" className="font-bold underline underline-offset-4">{c.prof}</Link></Callout> : null}
      {view !== "trynew" ? <ul className="mt-5 space-y-3">{mine.map((i) => card(i, profile.interests.includes(i.interest) ? c.because(name(i.interest)) : c.general))}</ul> : null}
      {view === "feed" || view === "weekly" ? <><h2 className="mt-6 text-2xl">{c.fresh}</h2><ul className="mt-3 space-y-3">{fresh.map((i) => card(i, name(i.interest)))}</ul></> : null}
      {view === "trynew" ? <><ul className="mt-5 space-y-3">{fresh.map((i) => card(i, name(i.interest)))}</ul><button onClick={() => setBump(bump + 1)} className={`${buttonClass.secondary} mt-4`}>{c.reroll}</button></> : null}
      {view === "weekly" ? <><h2 className="mt-8 border-b-[1.5px] border-ink pb-1 text-2xl">{c.soon}</h2>{upcoming.length === 0 ? <p className="mt-2 text-muted">{c.nothingSoon}</p> : <ul className="mt-2 divide-y-2 divide-dotted divide-line">{upcoming.map((x) => <li key={x.id} className="flex justify-between gap-3 py-2"><span className="font-bold">{x.title}</span><span className="text-muted">{formatDay(x.date, lang)}</span></li>)}</ul>}</> : null}
    </Head>
  );
}
