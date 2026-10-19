"use client";
import Link from "next/link";
import { useLang } from "@/lib/i18n";
import { useSaved } from "@/lib/saved";
import { useCopy } from "@/lib/use-copy";
import { EmptyTrail } from "../art";
import { buttonClass, Page } from "../ui";
import { OpportunityCard } from "./OpportunityCard";

const copy = {
  en: { title: "My Saved", empty: "Nothing saved yet. Find something you would actually want to do this month.", find: "Find opportunities", count: (n: number) => `${n} saved`, note: "Dates and costs can change. Open the source link to confirm before you plan around it." },
  es: { title: "Mis guardados", empty: "Todavía no has guardado nada. Busca algo que de verdad te gustaría hacer este mes.", find: "Buscar oportunidades", count: (n: number) => `${n} guardadas`, note: "Las fechas y los costos pueden cambiar. Abre el enlace de la fuente para confirmar antes de hacer planes." },
};

export function SavedTool() {
  const c = useCopy(copy);
  const lang = useLang();
  const { saved, toggle } = useSaved();
  return (
    <Page wide>
      <h1 className="text-3xl sm:text-4xl">{c.title}</h1>
      {saved.length === 0 ? (
        <div className="guide-card mt-6 flex max-w-xl flex-col items-start gap-5 p-5 sm:flex-row sm:items-center">
          <EmptyTrail className="h-24 w-36 shrink-0 text-ink" />
          <div><p className="text-lg">{c.empty}</p><Link href="/t/find/search" className={`${buttonClass.primary} mt-4`}>{c.find}</Link></div>
        </div>
      ) : (
        <>
          <p className="mt-2 text-muted">{c.count(saved.length)} · {c.note}</p>
          <div className="mt-6 grid gap-6 md:grid-cols-2">
            {saved.map((l) => (
              <OpportunityCard key={l.sourceUrl} listing={l} lang={lang} saved onToggle={() => toggle(l)} />
            ))}
          </div>
        </>
      )}
    </Page>
  );
}
