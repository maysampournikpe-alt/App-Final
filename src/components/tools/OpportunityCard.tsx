"use client";
import { ExternalLink, ShieldAlert } from "lucide-react";
import { type Category, type Listing } from "@/lib/ai/finder";
import type { ScamReason } from "@/lib/ai/safety";
import { useCopy } from "@/lib/use-copy";
import { Stamp } from "../art";
import { Ticket } from "../cards";
import { buttonClass } from "../ui";

export const categoryCopy: Record<"en" | "es", Record<Category, string>> = {
  en: { job: "Job", internship: "Internship", "academic-competition": "Academic competition", "sports-competition": "Sports competition", event: "Event", volunteer: "Volunteer", club: "Club", scholarship: "Scholarship", "summer-program": "Summer program", camp: "Camp", course: "Course", certification: "Certification" },
  es: { job: "Trabajo", internship: "Pasantía", "academic-competition": "Competencia académica", "sports-competition": "Competencia deportiva", event: "Evento", volunteer: "Voluntariado", club: "Club", scholarship: "Beca", "summer-program": "Programa de verano", camp: "Campamento", course: "Curso", certification: "Certificación" },
};

const copy = {
  en: {
    free: "Free", paid: "Costs money", unknown: "Cost not listed", notListed: "Not listed, check with organizer",
    online: "Online", grades: "Grades", deadline: "Deadline", dates: "Dates", source: "Source", save: "Save", saved: "Saved", unsave: "Remove from saved",
    why: "Why this fits you", general: "Opportunity",
    scamTitle: "Be careful with this one",
    scam: { upfront_fee: "It mentions a fee to apply or start.", private_info: "It asks for private information like a bank account or Social Security number.", unrealistic_pay: "The pay sounds too good to be true.", unusual_payment: "It mentions gift cards, crypto or cash apps.", pressure: "It rushes you to act now." } as Record<ScamReason, string>,
    scamTip: "Ask a parent, teacher or counselor before you share anything or pay anything.",
  },
  es: {
    free: "Gratis", paid: "Cuesta dinero", unknown: "Costo no indicado", notListed: "No aparece, pregunta al organizador",
    online: "En línea", grades: "Grados", deadline: "Fecha límite", dates: "Fechas", source: "Fuente", save: "Guardar", saved: "Guardado", unsave: "Quitar de guardados",
    why: "Por qué te queda bien", general: "Oportunidad",
    scamTitle: "Ten cuidado con esta",
    scam: { upfront_fee: "Menciona una cuota para aplicar o empezar.", private_info: "Pide datos privados, como una cuenta de banco o el número de Seguro Social.", unrealistic_pay: "El pago suena demasiado bueno para ser cierto.", unusual_payment: "Menciona tarjetas de regalo, cripto o apps de dinero.", pressure: "Te apura para que actúes ya." } as Record<ScamReason, string>,
    scamTip: "Antes de dar datos o pagar algo, habla con tus papás, un maestro o un consejero.",
  },
};

export function OpportunityCard({ listing, saved, onToggle, lang }: { listing: Listing; saved: boolean; onToggle: () => void; lang: "en" | "es" }) {
  const c = useCopy(copy);
  const host = (() => { try { return new URL(listing.sourceUrl).hostname.replace(/^www\./, ""); } catch { return listing.sourceUrl; } })();
  const details = [
    listing.cost === "free" ? c.free : listing.cost === "paid" ? c.paid : c.unknown,
    listing.costNote,
    listing.grades ? `${c.grades}: ${listing.grades}` : null,
    listing.dates ? `${c.dates}: ${listing.dates}` : null,
    listing.deadline ? `${c.deadline}: ${listing.deadline}` : null,
    listing.online ? c.online : listing.location,
    listing.distance,
    listing.transit,
  ].filter((x): x is string => !!x);

  return (
    <Ticket
      category={listing.category ? categoryCopy[lang][listing.category] : c.general}
      title={listing.title}
      org={listing.organization ?? c.notListed}
      details={details}
      why={listing.whyFits ? `${c.why}: ${listing.whyFits}` : undefined}
      footer={
        <>
          <a href={listing.sourceUrl} target="_blank" rel="noopener noreferrer" className="inline-flex min-w-0 items-center gap-1.5 font-bold text-teal underline underline-offset-4">
            <ExternalLink size={16} className="shrink-0" /><span className="truncate">{c.source}: {host}</span>
          </a>
          <button onClick={onToggle} aria-pressed={saved} aria-label={`${saved ? c.unsave : c.save}: ${listing.title}`} className={`${buttonClass.quiet} relative shrink-0 !px-3 !py-1.5`}>
            {saved ? <Stamp animate tone="ruby" className="!border-0 !p-0">{c.saved}</Stamp> : c.save}
          </button>
        </>
      }
    >
      {listing.description ? <p className="mb-2">{listing.description}</p> : null}
      {listing.scam.length ? (
        <div role="note" className="mt-2 rounded-xl border-[1.5px] border-ruby bg-sunken p-3">
          <p className="flex items-center gap-2 font-bold text-ruby"><ShieldAlert size={18} />{c.scamTitle}</p>
          <ul className="mt-1 list-disc pl-5">{listing.scam.map((r) => <li key={r}>{c.scam[r]}</li>)}</ul>
          <p className="mt-1 text-sm">{c.scamTip}</p>
        </div>
      ) : null}
    </Ticket>
  );
}
