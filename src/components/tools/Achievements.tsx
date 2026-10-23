"use client";
import { useState } from "react";
import { Plus, Printer, Trash2 } from "lucide-react";
import { ACH_KEY, ACH_KINDS, CERTS_KEY, certStatus, NO_ACH, NO_CERTS, NO_VOLUNTEER, sortNewest, VOLUNTEER_KEY, volunteerByOrg, volunteerTotal,
  type AchKind, type Achievement, type Certificate, type VolunteerEntry } from "@/lib/career";
import { formatDay, isValidISO, today } from "@/lib/dates";
import { useLang } from "@/lib/i18n";
import { useLocalDoc } from "@/lib/local-doc";
import { useProfile } from "@/lib/profile";
import { useCopy } from "@/lib/use-copy";
import { EmptyTrail } from "../art";
import { buttonClass, Field, inputClass, Page } from "../ui";

const copy = {
  en: {
    kinds: { award: "Award", activity: "Activity", leadership: "Leadership", result: "Result", project: "Project" } as Record<AchKind, string>,
    trTitle: "Accomplishments tracker", trLead: "Awards, activities and results in one place. Future you will be glad you wrote them down.", what: "What did you do or win?", whatPh: "Placed 2nd at the district chess tournament", kind: "Type", date: "Date", note: "Details (optional)", notePh: "What was your role? What was the result?", add: "Add", needTitle: "Write what it was.", needDate: "Pick a date.",
    all: "All", empty: "Nothing here yet. Add your first accomplishment.", remove: "Remove",
    vTitle: "Volunteer hour log", vLead: "Date, organization, hours and who can confirm them.", org: "Organization", orgPh: "Food bank", hours: "Hours", supervisor: "Supervisor", contact: "Phone or email", total: (n: number) => `${n} hours total`, byOrg: "By organization", needOrg: "Write the organization.", needHours: "Enter hours from 0.25 to 24.", vEmpty: "No hours yet. Log your first volunteer day.", signed: "Ask the supervisor to confirm your hours in writing if a program needs proof.",
    cTitle: "Certificate tracker", cLead: "CPR, Microsoft Office, coding and more, with a heads-up before they expire.", cName: "Certificate", cNamePh: "CPR and First Aid", issuer: "Issued by", issuerPh: "Red Cross", earned: "Earned", expires: "Expires (optional)", cEmpty: "No certificates yet.",
    status: { none: "", ok: "Current", soon: "Expires soon", expired: "Expired" } as Record<string, string>,
    bragTitle: "Brag sheet", bragLead: "Everything in one page that you can hand a counselor or teacher who is writing you a letter.", bragWho: "Your name", bragGoals: "What you want to do next", bragGoalsPh: "Study nursing and work in my community", print: "Print or save as PDF",
    bragNone: "Nothing yet. Add accomplishments, volunteer hours or certificates first.", bragNote: "Fill in the other tools and this page updates by itself.", grade: "Grade", school: "School", hoursLine: (n: number) => `${n} volunteer hours`, sections: { ach: "Accomplishments", vol: "Volunteer service", cert: "Certificates" },
    resumeTitle: "Resume builder", resumeLead: "Turn your accomplishments into a one-page resume, then print it or save it as a PDF.", contactLine: "Contact (email or phone)", summary: "About me (one or two sentences)", summaryPh: "Student leader who loves chess and helping my community.", resumeNote: "Your name and contact are only used on this page. They are not saved to your account profile.",
  },
  es: {
    kinds: { award: "Premio", activity: "Actividad", leadership: "Liderazgo", result: "Resultado", project: "Proyecto" } as Record<AchKind, string>,
    trTitle: "Registro de logros", trLead: "Premios, actividades y resultados en un solo lugar. Tu yo del futuro te lo va a agradecer.", what: "¿Qué hiciste o ganaste?", whatPh: "Quedé en 2.º lugar en el torneo de ajedrez del distrito", kind: "Tipo", date: "Fecha", note: "Detalles (opcional)", notePh: "¿Cuál fue tu papel? ¿Cuál fue el resultado?", add: "Agregar", needTitle: "Escribe qué fue.", needDate: "Elige una fecha.",
    all: "Todos", empty: "Todavía no hay nada. Agrega tu primer logro.", remove: "Quitar",
    vTitle: "Registro de horas de voluntariado", vLead: "Fecha, organización, horas y quién puede confirmarlas.", org: "Organización", orgPh: "Banco de comida", hours: "Horas", supervisor: "Supervisor", contact: "Teléfono o correo", total: (n: number) => `${n} horas en total`, byOrg: "Por organización", needOrg: "Escribe la organización.", needHours: "Escribe horas de 0.25 a 24.", vEmpty: "Todavía no hay horas. Anota tu primer día de voluntariado.", signed: "Pídele al supervisor que confirme tus horas por escrito si un programa pide prueba.",
    cTitle: "Registro de certificados", cLead: "RCP, Microsoft Office, programación y más, con un aviso antes de que venzan.", cName: "Certificado", cNamePh: "RCP y primeros auxilios", issuer: "Emitido por", issuerPh: "Cruz Roja", earned: "Obtenido", expires: "Vence (opcional)", cEmpty: "Todavía no hay certificados.",
    status: { none: "", ok: "Vigente", soon: "Vence pronto", expired: "Vencido" } as Record<string, string>,
    bragTitle: "Hoja de logros", bragLead: "Todo en una página que puedes darle a un consejero o maestro que te escribe una carta.", bragWho: "Tu nombre", bragGoals: "Lo que quieres hacer después", bragGoalsPh: "Estudiar enfermería y trabajar en mi comunidad", print: "Imprimir o guardar como PDF",
    bragNone: "Todavía no hay nada. Primero agrega logros, horas de voluntariado o certificados.", bragNote: "Llena las otras herramientas y esta página se actualiza sola.", grade: "Grado", school: "Escuela", hoursLine: (n: number) => `${n} horas de voluntariado`, sections: { ach: "Logros", vol: "Servicio voluntario", cert: "Certificados" },
    resumeTitle: "Creador de currículum", resumeLead: "Convierte tus logros en un currículum de una página, luego imprímelo o guárdalo como PDF.", contactLine: "Contacto (correo o teléfono)", summary: "Sobre mí (una o dos frases)", summaryPh: "Líder estudiantil a quien le encanta el ajedrez y ayudar a mi comunidad.", resumeNote: "Tu nombre y contacto solo se usan en esta página. No se guardan en el perfil de tu cuenta.",
  },
};
type C = typeof copy.en;
const del = (c: C, label: string, onClick: () => void) => <button onClick={onClick} aria-label={`${c.remove}: ${label}`} className="grid h-10 w-10 shrink-0 place-items-center rounded-xl hover:bg-sunken print:hidden"><Trash2 size={18} strokeWidth={1.75} /></button>;
const hoursNum = (s: string) => { const n = parseFloat(s.replace(",", ".")); return Number.isFinite(n) ? n : 0; };

export function TrackerTool() {
  const c = useCopy(copy);
  const lang = useLang();
  const [list, setList] = useLocalDoc<Achievement[]>(ACH_KEY, NO_ACH);
  const [f, setF] = useState({ title: "", kind: "award" as AchKind, date: today(), note: "" });
  const [err, setErr] = useState<"title" | "date" | null>(null);
  const [filter, setFilter] = useState<AchKind | "">("");
  const add = (e: React.FormEvent) => {
    e.preventDefault();
    if (!f.title.trim()) return setErr("title");
    if (!isValidISO(f.date)) return setErr("date");
    setErr(null);
    setList((p) => [{ id: crypto.randomUUID(), kind: f.kind, title: f.title.trim(), date: f.date, note: f.note.trim() }, ...p]);
    setF({ ...f, title: "", note: "" });
  };
  const shown = sortNewest(list).filter((x) => !filter || x.kind === filter);
  return (
    <Page wide>
      <h1 className="text-3xl sm:text-4xl">{c.trTitle}</h1>
      <p className="mt-2 max-w-prose text-muted">{c.trLead}</p>
      <form onSubmit={add} className="guide-card mt-6 grid gap-x-4 p-5 sm:grid-cols-2 lg:grid-cols-[3fr_1fr_1fr_auto] lg:items-start" noValidate>
        <Field label={c.what} error={err === "title" ? c.needTitle : null}>{(p) => <input {...p} value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} placeholder={c.whatPh} maxLength={120} className={inputClass} />}</Field>
        <Field label={c.kind}>{(p) => <select {...p} value={f.kind} onChange={(e) => setF({ ...f, kind: e.target.value as AchKind })} className={inputClass}>{ACH_KINDS.map((k) => <option key={k} value={k}>{c.kinds[k]}</option>)}</select>}</Field>
        <Field label={c.date} error={err === "date" ? c.needDate : null}>{(p) => <input {...p} type="date" value={f.date} onChange={(e) => setF({ ...f, date: e.target.value })} className={inputClass} />}</Field>
        <div className="lg:pt-7"><button className={buttonClass.primary}><Plus size={18} />{c.add}</button></div>
        <div className="sm:col-span-2 lg:col-span-4"><Field label={c.note}>{(p) => <textarea {...p} rows={2} value={f.note} onChange={(e) => setF({ ...f, note: e.target.value })} placeholder={c.notePh} maxLength={300} className={inputClass} />}</Field></div>
      </form>
      <div className="mt-6 flex flex-wrap gap-2" role="group" aria-label={c.kind}>
        {(["", ...ACH_KINDS] as const).map((k) => <button key={k || "all"} onClick={() => setFilter(k)} aria-pressed={filter === k} className={`rounded-full border-[1.5px] border-ink px-4 py-1.5 font-bold ${filter === k ? "bg-ink text-paper" : "bg-surface hover:bg-sunken"}`}>{k ? c.kinds[k] : c.all}</button>)}
      </div>
      {shown.length === 0 ? <div className="guide-card mt-6 flex max-w-xl items-center gap-5 p-5"><EmptyTrail className="h-24 w-36 shrink-0 text-ink" /><p className="text-lg">{c.empty}</p></div> : (
        <ul className="mt-4 divide-y-2 divide-dotted divide-line">{shown.map((x) => (
          <li key={x.id} className="flex items-start gap-3 py-3"><div className="min-w-0 flex-1"><p className="font-bold">{x.title}</p><p className="text-sm text-muted">{c.kinds[x.kind]} · {formatDay(x.date, lang)}</p>{x.note ? <p className="mt-1">{x.note}</p> : null}</div>{del(c, x.title, () => setList((p) => p.filter((y) => y.id !== x.id)))}</li>))}</ul>
      )}
    </Page>
  );
}

export function VolunteerTool() {
  const c = useCopy(copy);
  const lang = useLang();
  const [list, setList] = useLocalDoc<VolunteerEntry[]>(VOLUNTEER_KEY, NO_VOLUNTEER);
  const [f, setF] = useState({ date: today(), org: "", hours: "2", supervisor: "", contact: "" });
  const [err, setErr] = useState<"org" | "hours" | null>(null);
  const add = (e: React.FormEvent) => {
    e.preventDefault();
    const h = hoursNum(f.hours);
    if (!f.org.trim()) return setErr("org");
    if (!(h >= 0.25 && h <= 24) || !isValidISO(f.date)) return setErr("hours");
    setErr(null);
    setList((p) => [{ id: crypto.randomUUID(), date: f.date, org: f.org.trim(), hours: h, supervisor: f.supervisor.trim(), contact: f.contact.trim() }, ...p]);
    setF({ ...f, hours: "2" });
  };
  const orgs = [...new Set(list.map((x) => x.org))];
  return (
    <Page wide>
      <h1 className="text-3xl sm:text-4xl">{c.vTitle}</h1>
      <p className="mt-2 max-w-prose text-muted">{c.vLead}</p>
      <form onSubmit={add} className="guide-card mt-6 grid gap-x-4 p-5 sm:grid-cols-2 lg:grid-cols-[1fr_2fr_1fr_1.5fr_1.5fr_auto] lg:items-start" noValidate>
        <Field label={c.date}>{(p) => <input {...p} type="date" max={today()} value={f.date} onChange={(e) => setF({ ...f, date: e.target.value })} className={inputClass} />}</Field>
        <Field label={c.org} error={err === "org" ? c.needOrg : null}>{(p) => <input {...p} list="orgs" value={f.org} onChange={(e) => setF({ ...f, org: e.target.value })} placeholder={c.orgPh} maxLength={80} className={inputClass} />}</Field>
        <datalist id="orgs">{orgs.map((o) => <option key={o} value={o} />)}</datalist>
        <Field label={c.hours} error={err === "hours" ? c.needHours : null}>{(p) => <input {...p} inputMode="decimal" value={f.hours} onChange={(e) => setF({ ...f, hours: e.target.value })} className={inputClass} />}</Field>
        <Field label={c.supervisor}>{(p) => <input {...p} value={f.supervisor} onChange={(e) => setF({ ...f, supervisor: e.target.value })} maxLength={60} className={inputClass} />}</Field>
        <Field label={c.contact}>{(p) => <input {...p} value={f.contact} onChange={(e) => setF({ ...f, contact: e.target.value })} maxLength={80} className={inputClass} />}</Field>
        <div className="lg:pt-7"><button className={buttonClass.primary}><Plus size={18} />{c.add}</button></div>
      </form>
      {list.length === 0 ? <div className="guide-card mt-6 flex max-w-xl items-center gap-5 p-5"><EmptyTrail className="h-24 w-36 shrink-0 text-ink" /><p className="text-lg">{c.vEmpty}</p></div> : (
        <>
          <section className="guide-card mt-6 p-5" aria-live="polite"><p className="font-display text-3xl font-semibold text-teal">{c.total(volunteerTotal(list))}</p>
            <h2 className="mt-3 text-lg">{c.byOrg}</h2><ul className="mt-1">{volunteerByOrg(list).map((o) => <li key={o.org} className="flex justify-between border-b-2 border-dotted border-line py-1"><span className="font-bold">{o.org}</span><span className="tabular-nums">{o.hours} h</span></li>)}</ul></section>
          <ul className="mt-4 divide-y-2 divide-dotted divide-line">{list.map((x) => (
            <li key={x.id} className="flex items-start gap-3 py-3"><div className="min-w-0 flex-1"><p className="font-bold">{x.org} · {x.hours} h</p><p className="text-sm text-muted">{formatDay(x.date, lang)}{x.supervisor ? ` · ${x.supervisor}` : ""}{x.contact ? ` · ${x.contact}` : ""}</p></div>{del(c, x.org, () => setList((p) => p.filter((y) => y.id !== x.id)))}</li>))}</ul>
          <p className="mt-4 max-w-prose text-sm text-muted">{c.signed}</p>
        </>
      )}
    </Page>
  );
}

export function CertificatesTool() {
  const c = useCopy(copy);
  const lang = useLang();
  const [list, setList] = useLocalDoc<Certificate[]>(CERTS_KEY, NO_CERTS);
  const [f, setF] = useState({ name: "", issuer: "", earned: today(), expires: "" });
  const [err, setErr] = useState(false);
  const now = today();
  const add = (e: React.FormEvent) => {
    e.preventDefault();
    if (!f.name.trim() || !isValidISO(f.earned) || (f.expires && !isValidISO(f.expires))) return setErr(true);
    setErr(false);
    setList((p) => [...p, { id: crypto.randomUUID(), name: f.name.trim(), issuer: f.issuer.trim(), earned: f.earned, expires: f.expires }]);
    setF({ ...f, name: "", issuer: "", expires: "" });
  };
  return (
    <Page wide>
      <h1 className="text-3xl sm:text-4xl">{c.cTitle}</h1>
      <p className="mt-2 max-w-prose text-muted">{c.cLead}</p>
      <form onSubmit={add} className="guide-card mt-6 grid gap-x-4 p-5 sm:grid-cols-2 lg:grid-cols-[2fr_1.5fr_1fr_1fr_auto] lg:items-start" noValidate>
        <Field label={c.cName} error={err ? c.needTitle : null}>{(p) => <input {...p} value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} placeholder={c.cNamePh} maxLength={80} className={inputClass} />}</Field>
        <Field label={c.issuer}>{(p) => <input {...p} value={f.issuer} onChange={(e) => setF({ ...f, issuer: e.target.value })} placeholder={c.issuerPh} maxLength={60} className={inputClass} />}</Field>
        <Field label={c.earned}>{(p) => <input {...p} type="date" max={now} value={f.earned} onChange={(e) => setF({ ...f, earned: e.target.value })} className={inputClass} />}</Field>
        <Field label={c.expires}>{(p) => <input {...p} type="date" value={f.expires} onChange={(e) => setF({ ...f, expires: e.target.value })} className={inputClass} />}</Field>
        <div className="lg:pt-7"><button className={buttonClass.primary}><Plus size={18} />{c.add}</button></div>
      </form>
      {list.length === 0 ? <div className="guide-card mt-6 flex max-w-xl items-center gap-5 p-5"><EmptyTrail className="h-24 w-36 shrink-0 text-ink" /><p className="text-lg">{c.cEmpty}</p></div> : (
        <ul className="mt-4 divide-y-2 divide-dotted divide-line">{list.map((x) => {
          const st = certStatus(x, now);
          return (
            <li key={x.id} className="flex items-start gap-3 py-3"><div className="min-w-0 flex-1"><p className="font-bold">{x.name}{st !== "none" ? <span className={`ml-2 rounded-full border-[1.5px] border-ink px-2 text-xs font-bold ${st === "expired" ? "bg-ruby text-on-ruby" : st === "soon" ? "bg-marigold text-on-marigold" : ""}`}>{c.status[st]}</span> : null}</p>
              <p className="text-sm text-muted">{[x.issuer, `${c.earned} ${formatDay(x.earned, lang, false)}`, x.expires ? `${c.expires.replace(" (optional)", "").replace(" (opcional)", "")} ${formatDay(x.expires, lang, false)}` : ""].filter(Boolean).join(" · ")}</p></div>{del(c, x.name, () => setList((p) => p.filter((y) => y.id !== x.id)))}</li>);
        })}</ul>
      )}
    </Page>
  );
}

/** The one page that bragSheet and resume share: what the student has recorded in the other tools. */
function useRecord() {
  const [ach] = useLocalDoc<Achievement[]>(ACH_KEY, NO_ACH);
  const [vol] = useLocalDoc<VolunteerEntry[]>(VOLUNTEER_KEY, NO_VOLUNTEER);
  const [certs] = useLocalDoc<Certificate[]>(CERTS_KEY, NO_CERTS);
  return { ach: sortNewest(ach), vol, certs };
}

export function BragTool() { return <Sheet kind="brag" />; }
export function ResumeTool() { return <Sheet kind="resume" />; }

function Sheet({ kind }: { kind: "brag" | "resume" }) {
  const c = useCopy(copy);
  const lang = useLang();
  const { ach, vol, certs } = useRecord();
  const [profile] = useProfile();
  const [name, setName] = useState(""), [contact, setContact] = useState(""), [text, setText] = useState("");
  const empty = !ach.length && !vol.length && !certs.length;
  const title = kind === "brag" ? c.bragTitle : c.resumeTitle;
  return (
    <Page>
      <div className="print:hidden">
        <h1 className="text-3xl sm:text-4xl">{title}</h1>
        <p className="mt-2 max-w-prose text-muted">{kind === "brag" ? c.bragLead : c.resumeLead}</p>
        <div className="guide-card mt-6 grid gap-x-4 p-5 sm:grid-cols-2">
          <Field label={c.bragWho}>{(p) => <input {...p} value={name} onChange={(e) => setName(e.target.value)} maxLength={60} className={inputClass} />}</Field>
          {kind === "resume" ? <Field label={c.contactLine}>{(p) => <input {...p} value={contact} onChange={(e) => setContact(e.target.value)} maxLength={80} className={inputClass} />}</Field> : null}
          <div className="sm:col-span-2"><Field label={kind === "brag" ? c.bragGoals : c.summary} help={kind === "resume" ? c.resumeNote : c.bragNote}>{(p) => <textarea {...p} rows={2} value={text} onChange={(e) => setText(e.target.value)} placeholder={kind === "brag" ? c.bragGoalsPh : c.summaryPh} maxLength={300} className={inputClass} />}</Field></div>
        </div>
        <button onClick={() => window.print()} disabled={empty} className={`${buttonClass.primary} mt-4`}><Printer size={18} />{c.print}</button>
      </div>
      {empty ? <p className="mt-6 text-lg print:hidden">{c.bragNone}</p> : (
        <article className="guide-card mt-6 p-6 print:mt-0 print:border-0 print:shadow-none" aria-label={title}>
          <h2 className="font-display text-3xl font-semibold">{name || title}</h2>
          <p className="text-muted">{[profile.grade ? `${c.grade} ${profile.grade}` : "", profile.school, kind === "resume" ? contact : ""].filter(Boolean).join(" · ")}</p>
          {text.trim() ? <p className="mt-3">{kind === "brag" ? <strong>{c.bragGoals}: </strong> : null}{text}</p> : null}
          {ach.length ? <section className="mt-5"><h3 className="border-b-[1.5px] border-ink pb-1 text-xl">{c.sections.ach}</h3><ul className="mt-2 space-y-2">{ach.map((x) => <li key={x.id}><span className="font-bold">{x.title}</span> <span className="text-muted">({c.kinds[x.kind]}, {formatDay(x.date, lang, false)})</span>{x.note ? <span className="block">{x.note}</span> : null}</li>)}</ul></section> : null}
          {vol.length ? <section className="mt-5"><h3 className="border-b-[1.5px] border-ink pb-1 text-xl">{c.sections.vol}</h3><p className="mt-2 font-bold">{c.hoursLine(volunteerTotal(vol))}</p><ul className="mt-1">{volunteerByOrg(vol).map((o) => <li key={o.org}>{o.org}: {o.hours} h</li>)}</ul></section> : null}
          {certs.length ? <section className="mt-5"><h3 className="border-b-[1.5px] border-ink pb-1 text-xl">{c.sections.cert}</h3><ul className="mt-2">{certs.map((x) => <li key={x.id}>{x.name}{x.issuer ? `, ${x.issuer}` : ""} ({formatDay(x.earned, lang, false)})</li>)}</ul></section> : null}
        </article>
      )}
    </Page>
  );
}
