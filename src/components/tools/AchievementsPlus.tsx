"use client";
import { useState } from "react";
import { Plus, Printer, Trash2 } from "lucide-react";
import { ACH_KEY, CERTS_KEY, NO_ACH, NO_CERTS, NO_VOLUNTEER, sortNewest, VOLUNTEER_KEY, volunteerTotal, type Achievement, type Certificate, type VolunteerEntry } from "@/lib/career";
import { collectItems } from "@/lib/calendar";
import { diffDays, formatDay, today } from "@/lib/dates";
import { HABITS_KEY, NO_HABITS, type Habit } from "@/lib/habits";
import { HOMEWORK_KEY, NO_ASSIGNMENTS, type Assignment } from "@/lib/homework";
import { useLang } from "@/lib/i18n";
import { useLocalDoc } from "@/lib/local-doc";
import { useProfile } from "@/lib/profile";
import type { SavedListing } from "@/lib/saved";
import { EVENTS_KEY, NO_EVENTS, type SchoolEvent } from "@/lib/schedule";
import { NO_SESSIONS, SESSIONS_KEY, type Session } from "@/lib/study";
import { useCopy } from "@/lib/use-copy";
import { buttonClass, inputClass } from "../ui";
import { Callout, Chips, Empty, Head } from "./shared";

const NO_SAVED: SavedListing[] = [];
const NO_READS: { date: string; pages: number; minutes: number }[] = [];
const NO_APPS: { id: string; name: string; status: string; deadline: string; kind: string }[] = [];
const NO_COUNTS: { id: string; name: string; date: string }[] = [];

const copy = {
  en: {
    remove: "Remove", print: "Print", add: "Add",
    pfTitle: "Digital portfolio", pfLead: "A printable page of your achievements. You choose what goes on it. It stays on your device, and you decide who gets a copy, either on paper or as a PDF from your print window.", pfName: "Your name", pfAbout: "A sentence about you", pfShow: "What to include", pfSections: { ach: "Achievements and awards", vol: "Volunteer hours", certs: "Certificates", radar: "Skills radar", study: "Study and reading totals" } as Record<string, string>, pfNone: "Nothing to show yet. Add achievements, volunteer hours or certificates first.", pfPrivacy: "Tip: choose a first name or initials if you plan to share it. Do not include your address or phone number.", pfStudy: (h: number, p: number) => `${h} hours studied and ${p} pages read in the last 90 days`, pfHours: (n: number) => `${n} volunteer hours in total`,
    rdTitle: "Skills radar", rdLead: "Rate yourself from 0 to 5 in each area. The shape shows where you are strong and where you can grow.", areas: { leadership: "Leadership", academics: "Academics", service: "Service", arts: "Arts", athletics: "Athletics" } as Record<string, string>, rdHint: "Hint: think about what you have actually done, like clubs led, grades, hours volunteered, performances and teams.", rdAlt: (s: string) => `Skills radar: ${s}`, rdTop: (a: string) => `Your strongest area right now: ${a}`, rdGrow: (a: string) => `A place to grow: ${a}`, rdEmpty: "Rate at least one area.",
    chTitle: "Monthly challenges", chLead: "Pick a goal for the month. Your progress fills in from what you log in the other tools.", chKinds: { volunteer: "Volunteer hours", reading: "Pages read", study: "Hours studied", habit: "Habit check-ins" } as Record<string, string>, chTarget: "Goal for the month", chAdd: "Add challenge", chGoal: "Reached. Great job.", chOf: (a: number, b: number) => `${a} of ${b}`, chEmpty: "Pick your first challenge above.", chMonth: "This month", chSource: { volunteer: "From your Volunteer hours log", reading: "From your Reading log", study: "From your Study session logger", habit: "From your Habit tracker" } as Record<string, string>,
    yrTitle: "Year in review", yrLead: "Your school year in numbers, from what you logged. August to July.", yrYear: "School year", yrStudy: "Hours studied", yrReading: "Pages read", yrVol: "Volunteer hours", yrAch: "Achievements recorded", yrHw: "Assignments finished", yrHabit: "Habit check-ins", yrBest: "Best habit streak", yrEmpty: "Log some study sessions, reading, volunteer hours or achievements and your review will fill in.", yrTop: "Highlights", yrDays: (n: number) => `${n} days`,
    ceTitle: "Celebrations", ceLead: "Revisit your wins: acceptances, awards and certificates you earned.", ceEmpty: "Your wins will show up here: mark an application Accepted, or add an award or certificate.", ceIn: "You got in", ceAward: "Award", ceCert: "Certificate", ceNote: "Every one of these took work. Take a moment to enjoy it.",
    paTitle: "Parent view", paLead: "A summary for your family of what you have saved, with dates and costs. Choose English or Spanish, then print it or save it as a PDF.", paLang: "Language of the summary", paFor: "For", paSaved: "Opportunities I saved", paDue: "Coming deadlines", paApps: "My applications", paVol: "Volunteer hours", paNone: "Nothing saved yet.", paCost: { free: "Free", paid: "Costs money", unknown: "Cost not listed" } as Record<string, string>, paWhere: "Where", paOnline: "Online", paDeadline: "Deadline", paLink: "More information", paAsk: "Ask your student to show you how these tools work. The costs and dates here came from web results and should be confirmed on the official website before you decide.", paStatuses: { planning: "Planning", working: "Working on it", submitted: "Submitted", accepted: "Accepted", waitlisted: "Waitlisted", declined: "Not accepted" } as Record<string, string>, paDated: "Printed on",
  },
  es: {
    remove: "Quitar", print: "Imprimir", add: "Agregar",
    pfTitle: "Portafolio digital", pfLead: "Una página imprimible con tus logros. Tú eliges qué incluye. Se queda en tu dispositivo y tú decides quién recibe una copia, en papel o como PDF desde la ventana de impresión.", pfName: "Tu nombre", pfAbout: "Una frase sobre ti", pfShow: "Qué incluir", pfSections: { ach: "Logros y premios", vol: "Horas de voluntariado", certs: "Certificados", radar: "Radar de habilidades", study: "Totales de estudio y lectura" } as Record<string, string>, pfNone: "Todavía no hay nada que mostrar. Primero agrega logros, horas de voluntariado o certificados.", pfPrivacy: "Consejo: usa solo tu nombre o iniciales si vas a compartirlo. No incluyas tu dirección ni tu teléfono.", pfStudy: (h: number, p: number) => `${h} horas de estudio y ${p} páginas leídas en los últimos 90 días`, pfHours: (n: number) => `${n} horas de voluntariado en total`,
    rdTitle: "Radar de habilidades", rdLead: "Califícate de 0 a 5 en cada área. La forma muestra dónde eres fuerte y dónde puedes crecer.", areas: { leadership: "Liderazgo", academics: "Estudios", service: "Servicio", arts: "Artes", athletics: "Deportes" } as Record<string, string>, rdHint: "Pista: piensa en lo que has hecho de verdad, como clubes que dirigiste, calificaciones, horas de voluntariado, presentaciones y equipos.", rdAlt: (s: string) => `Radar de habilidades: ${s}`, rdTop: (a: string) => `Tu área más fuerte ahora: ${a}`, rdGrow: (a: string) => `Un lugar para crecer: ${a}`, rdEmpty: "Califica al menos un área.",
    chTitle: "Retos del mes", chLead: "Elige una meta para el mes. Tu avance se llena con lo que anotas en las otras herramientas.", chKinds: { volunteer: "Horas de voluntariado", reading: "Páginas leídas", study: "Horas de estudio", habit: "Registros de hábitos" } as Record<string, string>, chTarget: "Meta del mes", chAdd: "Agregar reto", chGoal: "Lo lograste. Muy bien.", chOf: (a: number, b: number) => `${a} de ${b}`, chEmpty: "Elige tu primer reto arriba.", chMonth: "Este mes", chSource: { volunteer: "De tu registro de voluntariado", reading: "De tu registro de lectura", study: "De tu registro de sesiones de estudio", habit: "De tu registro de hábitos" } as Record<string, string>,
    yrTitle: "Resumen del año", yrLead: "Tu año escolar en números, según lo que anotaste. De agosto a julio.", yrYear: "Año escolar", yrStudy: "Horas de estudio", yrReading: "Páginas leídas", yrVol: "Horas de voluntariado", yrAch: "Logros anotados", yrHw: "Tareas terminadas", yrHabit: "Registros de hábitos", yrBest: "Mejor racha de hábitos", yrEmpty: "Anota sesiones de estudio, lectura, horas de voluntariado o logros y tu resumen se llenará.", yrTop: "Lo más destacado", yrDays: (n: number) => `${n} días`,
    ceTitle: "Celebraciones", ceLead: "Vuelve a ver tus triunfos: aceptaciones, premios y certificados que lograste.", ceEmpty: "Tus triunfos aparecerán aquí: marca una solicitud como Aceptado, o agrega un premio o certificado.", ceIn: "Entraste", ceAward: "Premio", ceCert: "Certificado", ceNote: "Cada uno de estos costó trabajo. Tómate un momento para disfrutarlo.",
    paTitle: "Vista para padres", paLead: "Un resumen para tu familia de lo que has guardado, con fechas y costos. Elige inglés o español y luego imprímelo o guárdalo como PDF.", paLang: "Idioma del resumen", paFor: "Para", paSaved: "Oportunidades que guardé", paDue: "Próximas fechas límite", paApps: "Mis solicitudes", paVol: "Horas de voluntariado", paNone: "Todavía no hay nada guardado.", paCost: { free: "Gratis", paid: "Cuesta dinero", unknown: "Costo no indicado" } as Record<string, string>, paWhere: "Dónde", paOnline: "En línea", paDeadline: "Fecha límite", paLink: "Más información", paAsk: "Pídele a tu estudiante que te muestre cómo funcionan estas herramientas. Los costos y fechas vienen de resultados de internet y deben confirmarse en el sitio oficial antes de decidir.", paStatuses: { planning: "Planeando", working: "Trabajando en ella", submitted: "Enviada", accepted: "Aceptado", waitlisted: "En lista de espera", declined: "No aceptado" } as Record<string, string>, paDated: "Impreso el",
  },
};
type C = typeof copy.en;

const monthOf = (d: string) => d.slice(0, 7);
const rm = (label: string, text: string, fn: () => void) => <button onClick={fn} aria-label={`${text}: ${label}`} className="grid h-10 w-10 shrink-0 place-items-center rounded-md hover:bg-sunken"><Trash2 size={18} strokeWidth={1.75} /></button>;

const AREAS = ["leadership", "academics", "service", "arts", "athletics"] as const;
const NO_RADAR: Record<string, number> = {};
function Radar({ rating, labels, alt }: { rating: Record<string, number>; labels: Record<string, string>; alt: string }) {
  const R = 110, cx = 160, cy = 150;
  const pt = (i: number, v: number) => { const a = (i / AREAS.length) * Math.PI * 2 - Math.PI / 2; return [cx + Math.cos(a) * R * (v / 5), cy + Math.sin(a) * R * (v / 5)]; };
  return (
    <svg viewBox="0 0 320 300" role="img" aria-label={alt} className="mx-auto w-full max-w-sm text-ink">
      {[1, 2, 3, 4, 5].map((r) => <polygon key={r} points={AREAS.map((_, i) => pt(i, r).join(",")).join(" ")} fill="none" stroke="currentColor" strokeOpacity={0.25} />)}
      {AREAS.map((_, i) => <line key={i} x1={cx} y1={cy} x2={pt(i, 5)[0]} y2={pt(i, 5)[1]} stroke="currentColor" strokeOpacity={0.25} />)}
      <polygon points={AREAS.map((a, i) => pt(i, rating[a] ?? 0).join(",")).join(" ")} fill="var(--c-teal, #0c5a60)" fillOpacity={0.45} stroke="var(--c-teal, #0c5a60)" strokeWidth={2.5} />
      {AREAS.map((a, i) => { const [x, y] = pt(i, 6.2); return <text key={a} x={x} y={y} textAnchor="middle" fontSize={13} fontWeight={700} fill="currentColor" dy="4">{labels[a]}</text>; })}
    </svg>
  );
}

export function RadarTool() {
  const c = useCopy(copy);
  const [r, setR] = useLocalDoc<Record<string, number>>("skills-radar", NO_RADAR);
  const rated = AREAS.filter((a) => (r[a] ?? 0) > 0);
  const top = [...rated].sort((a, b) => r[b] - r[a])[0], low = [...AREAS].sort((a, b) => (r[a] ?? 0) - (r[b] ?? 0))[0];
  const summary = AREAS.map((a) => `${c.areas[a]} ${r[a] ?? 0}`).join(", ");
  return (
    <Head title={c.rdTitle} lead={c.rdLead}>
      <div className="mt-5 grid gap-6 md:grid-cols-2">
        <div className="space-y-4">{AREAS.map((a) => <label key={a} className="block"><span className="flex justify-between font-bold"><span>{c.areas[a]}</span><span className="tabular-nums">{r[a] ?? 0}</span></span><input type="range" min={0} max={5} step={1} value={r[a] ?? 0} onChange={(e) => setR({ ...r, [a]: Number(e.target.value) })} className="w-full accent-[var(--c-teal)]" /></label>)}<p className="text-sm text-muted">{c.rdHint}</p></div>
        <div><Radar rating={r} labels={c.areas} alt={c.rdAlt(summary)} />
          <p className="mt-2 text-center font-bold text-teal" aria-live="polite">{rated.length ? <>{c.rdTop(c.areas[top])}<br />{c.rdGrow(c.areas[low])}</> : c.rdEmpty}</p></div></div>
    </Head>
  );
}

type Challenge = { id: string; kind: string; target: number };
const NO_CH: Challenge[] = [];
const DEFAULT_TARGET: Record<string, number> = { volunteer: 5, reading: 100, study: 10, habit: 15 };
export function ChallengesTool() {
  const c = useCopy(copy);
  const [goals, setGoals] = useLocalDoc<Challenge[]>("monthly-challenges", NO_CH);
  const [vol] = useLocalDoc<VolunteerEntry[]>(VOLUNTEER_KEY, NO_VOLUNTEER);
  const [reads] = useLocalDoc<{ date: string; pages: number; minutes: number }[]>("reading-log", NO_READS);
  const [study] = useLocalDoc<Session[]>(SESSIONS_KEY, NO_SESSIONS);
  const [habits] = useLocalDoc<Habit[]>(HABITS_KEY, NO_HABITS);
  const [kind, setKind] = useState("volunteer");
  const [target, setTarget] = useState(String(DEFAULT_TARGET.volunteer));
  const m = monthOf(today());
  const progress = (k: string) => k === "volunteer" ? Math.round(volunteerTotal(vol.filter((x) => monthOf(x.date) === m)) * 10) / 10 : k === "reading" ? reads.filter((x) => monthOf(x.date) === m).reduce((n, x) => n + x.pages, 0) : k === "study" ? Math.round((study.filter((x) => monthOf(x.date) === m).reduce((n, x) => n + x.minutes, 0) / 60) * 10) / 10 : habits.reduce((n, h) => n + h.done.filter((d) => monthOf(d) === m).length, 0);
  return (
    <Head title={c.chTitle} lead={c.chLead}>
      <form className="guide-card mt-5 flex flex-wrap items-end gap-4 p-5" onSubmit={(e) => { e.preventDefault(); const t = Number(target); if (t > 0 && t <= 10000) setGoals((p) => [...p, { id: crypto.randomUUID(), kind, target: t }]); }}>
        <label><span className="block font-bold">{c.chMonth}</span><select value={kind} onChange={(e) => { setKind(e.target.value); setTarget(String(DEFAULT_TARGET[e.target.value])); }} className={`${inputClass} mt-1`}>{Object.entries(c.chKinds).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select></label>
        <label><span className="block font-bold">{c.chTarget}</span><input type="number" min={1} max={10000} value={target} onChange={(e) => setTarget(e.target.value)} className={`${inputClass} mt-1 max-w-32`} /></label>
        <button className={buttonClass.primary}><Plus size={18} />{c.chAdd}</button></form>
      {goals.length === 0 ? <Empty>{c.chEmpty}</Empty> : <ul className="mt-5 space-y-3">{goals.map((g) => { const p = progress(g.kind), done = p >= g.target; return (
        <li key={g.id} className="guide-card p-4"><div className="flex items-center gap-3"><h2 className="min-w-0 flex-1 text-xl">{c.chKinds[g.kind]}</h2><span className="font-bold tabular-nums">{c.chOf(p, g.target)}</span>{rm(c.chKinds[g.kind], c.remove, () => setGoals((q) => q.filter((x) => x.id !== g.id)))}</div>
          <div className="mt-2 h-4 overflow-hidden rounded-full border-[1.5px] border-ink bg-sunken" role="img" aria-label={`${Math.min(100, Math.round((p / g.target) * 100))}%`}><div className={`h-full ${done ? "bg-palm" : "bg-teal"}`} style={{ width: `${Math.min(100, (p / g.target) * 100)}%` }} /></div>
          <p className="mt-1 text-sm text-muted">{done ? <span className="font-bold text-teal">{c.chGoal}</span> : c.chSource[g.kind]}</p></li>); })}</ul>}
    </Head>
  );
}

export function YearReviewTool() {
  const c = useCopy(copy);
  const [vol] = useLocalDoc<VolunteerEntry[]>(VOLUNTEER_KEY, NO_VOLUNTEER);
  const [reads] = useLocalDoc<{ date: string; pages: number; minutes: number }[]>("reading-log", NO_READS);
  const [study] = useLocalDoc<Session[]>(SESSIONS_KEY, NO_SESSIONS);
  const [habits] = useLocalDoc<Habit[]>(HABITS_KEY, NO_HABITS);
  const [ach] = useLocalDoc<Achievement[]>(ACH_KEY, NO_ACH);
  const [hw] = useLocalDoc<Assignment[]>(HOMEWORK_KEY, NO_ASSIGNMENTS);
  const nowY = Number(today().slice(0, 4)), nowM = Number(today().slice(5, 7));
  const currentStart = nowM >= 8 ? nowY : nowY - 1;
  const [start, setStart] = useState(currentStart);
  const from = `${start}-08-01`, to = `${start + 1}-07-31`;
  const inYear = (d: string) => d >= from && d <= to;
  const studyH = Math.round((study.filter((x) => inYear(x.date)).reduce((n, x) => n + x.minutes, 0) / 60) * 10) / 10;
  const pages = reads.filter((x) => inYear(x.date)).reduce((n, x) => n + x.pages, 0);
  const vh = volunteerTotal(vol.filter((x) => inYear(x.date)));
  const achs = sortNewest(ach.filter((x) => inYear(x.date)));
  const hwDone = hw.filter((x) => x.done && inYear(x.due)).length;
  const hab = habits.reduce((n, h) => n + h.done.filter(inYear).length, 0);
  let best = 0;
  for (const h of habits) { const ds = h.done.filter(inYear).sort(); let run = 0; for (let i = 0; i < ds.length; i++) { run = i > 0 && diffDays(ds[i - 1], ds[i]) === 1 ? run + 1 : 1; best = Math.max(best, run); } }
  const stats: [string, string | number][] = [[c.yrStudy, studyH], [c.yrReading, pages], [c.yrVol, vh], [c.yrAch, achs.length], [c.yrHw, hwDone], [c.yrHabit, hab], [c.yrBest, c.yrDays(best)]];
  const empty = !studyH && !pages && !vh && !achs.length && !hwDone && !hab;
  return (
    <Head title={c.yrTitle} lead={c.yrLead}>
      <div className="mt-5 print:hidden"><Chips<string> value={String(start)} onChange={(v) => setStart(Number(v))} label={c.yrYear} options={[currentStart - 1, currentStart].map((y) => ({ id: String(y), label: `${y}–${y + 1}` }))} /></div>
      {empty ? <Empty>{c.yrEmpty}</Empty> : <>
        <h2 className="mt-5 text-3xl">{start}–{start + 1}</h2>
        <dl className="mt-3 grid grid-cols-2 gap-3 lg:grid-cols-4">{stats.map(([k, v]) => <div key={k} className="guide-card p-4"><dt className="text-sm text-muted">{k}</dt><dd className="font-display text-4xl font-semibold tabular-nums">{v}</dd></div>)}</dl>
        {achs.length ? <><h2 className="mt-6 border-b-[1.5px] border-ink pb-1 text-2xl">{c.yrTop}</h2><ul className="mt-2 space-y-1">{achs.slice(0, 8).map((a) => <li key={a.id}><span className="font-bold">{a.title}</span> <span className="text-muted">· {a.date}</span></li>)}</ul></> : null}
        <button onClick={() => window.print()} className={`${buttonClass.secondary} mt-5 print:hidden`}><Printer size={18} />{c.print}</button></>}
    </Head>
  );
}

type App = { id: string; name: string; status: string; deadline: string; kind: string };
export function CelebrationsTool() {
  const c = useCopy(copy);
  const lang = useLang();
  const [apps] = useLocalDoc<App[]>("applications", NO_APPS);
  const [ach] = useLocalDoc<Achievement[]>(ACH_KEY, NO_ACH);
  const [certs] = useLocalDoc<Certificate[]>(CERTS_KEY, NO_CERTS);
  const items = [
    ...apps.filter((a) => a.status === "accepted").map((a) => ({ id: a.id, tag: c.ceIn, title: a.name, date: a.deadline })),
    ...ach.filter((a) => a.kind === "award" || a.kind === "result").map((a) => ({ id: a.id, tag: c.ceAward, title: a.title, date: a.date })),
    ...certs.map((x) => ({ id: x.id, tag: c.ceCert, title: x.name, date: x.earned })),
  ].sort((a, b) => b.date.localeCompare(a.date));
  return (
    <Head title={c.ceTitle} lead={c.ceLead}>
      {items.length === 0 ? <Empty>{c.ceEmpty}</Empty> : <><ul className="mt-6 grid gap-4 sm:grid-cols-2">{items.map((x) => (
        <li key={x.id} className="rounded-lg border-[1.5px] border-ink bg-marigold p-5 text-on-marigold"><p className="text-sm font-bold uppercase tracking-wide">{x.tag}</p><h2 className="font-display text-2xl font-semibold">{x.title}</h2>{x.date ? <p className="text-sm">{formatDay(x.date, lang)}</p> : null}</li>))}</ul><Callout>{c.ceNote}</Callout></>}
    </Head>
  );
}

const P = (lang: "en" | "es") => copy[lang];
export function ParentViewTool() {
  const ui = useLang();
  const [lang, setLang] = useState<"en" | "es">(ui);
  const p: C = P(lang);
  const [profile] = useProfile();
  const [saved] = useLocalDoc<SavedListing[]>("saved-opportunities", NO_SAVED);
  const [apps] = useLocalDoc<App[]>("applications", NO_APPS);
  const [vol] = useLocalDoc<VolunteerEntry[]>(VOLUNTEER_KEY, NO_VOLUNTEER);
  const [hw] = useLocalDoc<Assignment[]>(HOMEWORK_KEY, NO_ASSIGNMENTS);
  const [events] = useLocalDoc<SchoolEvent[]>(EVENTS_KEY, NO_EVENTS);
  const [name, setName] = useState("");
  const now = today();
  const due = collectItems({ saved, homework: hw, countdowns: NO_COUNTS, events, now }).filter((x) => x.date >= now && (x.kind === "opportunity" || x.kind === "event")).slice(0, 10);
  const nothing = !saved.length && !apps.length && !vol.length;
  const labels = { en: "Language", es: "Idioma" };
  return (
    <Head title={copy[ui].paTitle} lead={copy[ui].paLead}>
      <div className="mt-5 flex flex-wrap items-end gap-5 print:hidden">
        <Chips<"en" | "es"> value={lang} onChange={setLang} label={copy[ui].paLang} options={[{ id: "en", label: "English" }, { id: "es", label: "Español" }]} />
        <label><span className="block font-bold">{labels[ui]}: {copy[ui].paFor}</span><input value={name} onChange={(e) => setName(e.target.value)} maxLength={40} className={`${inputClass} mt-1`} /></label>
        <button onClick={() => window.print()} disabled={nothing} className={buttonClass.primary}><Printer size={18} />{copy[ui].print}</button></div>
      {nothing ? <Empty>{p.paNone}</Empty> : (
        <article lang={lang} className="guide-card mt-6 p-6 print:mt-0 print:border-0" aria-label={p.paTitle}>
          <h2 className="font-display text-3xl font-semibold">{p.paTitle}{name ? `: ${name}` : ""}</h2>
          <p className="text-muted">{[profile.grade ? `${lang === "es" ? "Grado" : "Grade"} ${profile.grade}` : "", profile.school, `${p.paDated} ${formatDay(now, lang)}`].filter(Boolean).join(" · ")}</p>
          {due.length ? <section className="mt-5"><h3 className="border-b-[1.5px] border-ink pb-1 text-xl">{p.paDue}</h3><ul className="mt-2 space-y-1">{due.map((x) => <li key={x.id}><span className="font-bold">{x.title}</span> · {formatDay(x.date, lang)}</li>)}</ul></section> : null}
          {saved.length ? <section className="mt-5"><h3 className="border-b-[1.5px] border-ink pb-1 text-xl">{p.paSaved}</h3><ul className="mt-2 space-y-3">{saved.map((s) => <li key={s.sourceUrl}><p className="font-bold">{s.title}{s.organization ? `, ${s.organization}` : ""}</p>
            <p className="text-sm">{p.paCost[s.cost]}{s.costNote ? ` (${s.costNote})` : ""} · {p.paWhere}: {s.online ? p.paOnline : s.location ?? "—"}{s.deadline ? ` · ${p.paDeadline}: ${s.deadline}` : ""}</p>
            {s.sourceUrl ? <p className="break-all text-sm text-muted">{p.paLink}: {s.sourceUrl}</p> : null}</li>)}</ul></section> : null}
          {apps.length ? <section className="mt-5"><h3 className="border-b-[1.5px] border-ink pb-1 text-xl">{p.paApps}</h3><ul className="mt-2">{apps.map((a) => <li key={a.id}><span className="font-bold">{a.name}</span> · {p.paStatuses[a.status] ?? a.status}{a.deadline ? ` · ${formatDay(a.deadline, lang)}` : ""}</li>)}</ul></section> : null}
          {vol.length ? <section className="mt-5"><h3 className="border-b-[1.5px] border-ink pb-1 text-xl">{p.paVol}</h3><p className="mt-2 font-bold">{lang === "es" ? `${volunteerTotal(vol)} horas en total` : `${volunteerTotal(vol)} hours in total`}</p></section> : null}
          <p className="mt-6 text-sm text-muted">{p.paAsk}</p></article>
      )}
    </Head>
  );
}

function useRecord() {
  const [ach] = useLocalDoc<Achievement[]>(ACH_KEY, NO_ACH);
  const [vol] = useLocalDoc<VolunteerEntry[]>(VOLUNTEER_KEY, NO_VOLUNTEER);
  const [certs] = useLocalDoc<Certificate[]>(CERTS_KEY, NO_CERTS);
  return { ach: sortNewest(ach), vol, certs };
}
type Opts = { name: string; about: string; ach: boolean; vol: boolean; certs: boolean; radar: boolean; study: boolean };
const DEFAULT_OPTS: Opts = { name: "", about: "", ach: true, vol: true, certs: true, radar: false, study: false };
export function PortfolioTool() {
  const c = useCopy(copy);
  const lang = useLang();
  const [o, setO] = useLocalDoc<Opts>("portfolio-opts", DEFAULT_OPTS);
  const { ach, vol, certs } = useRecord();
  const [profile] = useProfile();
  const [radar] = useLocalDoc<Record<string, number>>("skills-radar", NO_RADAR);
  const [study] = useLocalDoc<Session[]>(SESSIONS_KEY, NO_SESSIONS);
  const [reads] = useLocalDoc<{ date: string; pages: number; minutes: number }[]>("reading-log", NO_READS);
  const now = today(), since = new Date(now + "T00:00:00"); since.setDate(since.getDate() - 90);
  const s90 = `${since.getFullYear()}-${String(since.getMonth() + 1).padStart(2, "0")}-${String(since.getDate()).padStart(2, "0")}`;
  const hours = Math.round((study.filter((x) => x.date >= s90).reduce((n, x) => n + x.minutes, 0) / 60) * 10) / 10, pages = reads.filter((x) => x.date >= s90).reduce((n, x) => n + x.pages, 0);
  const empty = !ach.length && !vol.length && !certs.length;
  const rated = AREAS.some((a) => (radar[a] ?? 0) > 0);
  const toggles = Object.keys(c.pfSections) as (keyof typeof c.pfSections)[];
  return (
    <Head title={c.pfTitle} lead={c.pfLead}>
      <div className="print:hidden">
        <div className="guide-card mt-5 grid gap-4 p-5 sm:grid-cols-2">
          <label><span className="block font-bold">{c.pfName}</span><input value={o.name} onChange={(e) => setO({ ...o, name: e.target.value })} maxLength={50} className={`${inputClass} mt-1`} /></label>
          <label><span className="block font-bold">{c.pfAbout}</span><input value={o.about} onChange={(e) => setO({ ...o, about: e.target.value })} maxLength={160} className={`${inputClass} mt-1`} /></label>
          <fieldset className="sm:col-span-2"><legend className="font-bold">{c.pfShow}</legend><div className="mt-1 flex flex-wrap gap-x-6 gap-y-1">{toggles.map((k) => <label key={k} className="flex items-center gap-2"><input type="checkbox" checked={!!o[k as keyof Opts]} onChange={(e) => setO({ ...o, [k]: e.target.checked })} className="h-5 w-5 accent-[var(--c-teal)]" />{c.pfSections[k]}</label>)}</div></fieldset></div>
        <button onClick={() => window.print()} disabled={empty} className={`${buttonClass.primary} mt-4`}><Printer size={18} />{c.print}</button>
        <Callout>{c.pfPrivacy}</Callout></div>
      {empty ? <Empty>{c.pfNone}</Empty> : (
        <article className="guide-card mt-6 p-6 print:mt-0 print:border-0" aria-label={c.pfTitle}>
          <h2 className="font-display text-3xl font-semibold">{o.name || c.pfTitle}</h2>
          <p className="text-muted">{[profile.grade ? `${lang === "es" ? "Grado" : "Grade"} ${profile.grade}` : "", profile.school].filter(Boolean).join(" · ")}</p>
          {o.about ? <p className="mt-2 text-lg">{o.about}</p> : null}
          {o.ach && ach.length ? <section className="mt-5"><h3 className="border-b-[1.5px] border-ink pb-1 text-xl">{c.pfSections.ach}</h3><ul className="mt-2 space-y-2">{ach.map((x) => <li key={x.id}><span className="font-bold">{x.title}</span> <span className="text-muted">· {formatDay(x.date, lang, false)}</span>{x.note ? <p className="text-sm">{x.note}</p> : null}</li>)}</ul></section> : null}
          {o.vol && vol.length ? <section className="mt-5"><h3 className="border-b-[1.5px] border-ink pb-1 text-xl">{c.pfSections.vol}</h3><p className="mt-2 font-bold">{c.pfHours(volunteerTotal(vol))}</p></section> : null}
          {o.certs && certs.length ? <section className="mt-5"><h3 className="border-b-[1.5px] border-ink pb-1 text-xl">{c.pfSections.certs}</h3><ul className="mt-2">{certs.map((x) => <li key={x.id}>{x.name}{x.issuer ? `, ${x.issuer}` : ""} <span className="text-muted">· {formatDay(x.earned, lang, false)}</span></li>)}</ul></section> : null}
          {o.radar && rated ? <section className="mt-5"><h3 className="border-b-[1.5px] border-ink pb-1 text-xl">{c.pfSections.radar}</h3><Radar rating={radar} labels={c.areas} alt={c.rdAlt(AREAS.map((a) => `${c.areas[a]} ${radar[a] ?? 0}`).join(", "))} /></section> : null}
          {o.study && (hours || pages) ? <section className="mt-5"><h3 className="border-b-[1.5px] border-ink pb-1 text-xl">{c.pfSections.study}</h3><p className="mt-2">{c.pfStudy(hours, pages)}</p></section> : null}
        </article>
      )}
    </Head>
  );
}
