"use client";
import { GUIDES } from "@/data/guides";
import { useLang } from "@/lib/i18n";
import { Callout, Ext, Head, pick } from "./shared";

/** Renders one of the plain-language guides in src/data/guides.ts. */
export function GuideTool({ id, children }: { id: string; children?: React.ReactNode }) {
  const lang = useLang();
  const g = GUIDES[id];
  return (
    <Head title={pick(g.title, lang)} lead={pick(g.lead, lang)}>
      {children}
      {g.sections.map((s, i) => (
        <section key={i} className="mt-8" aria-labelledby={`g-${i}`}>
          <h2 id={`g-${i}`} className="border-b-[1.5px] border-ink pb-1 text-2xl">{pick(s.h, lang)}</h2>
          {s.p?.map((p, k) => <p key={k} className="mt-3 max-w-prose text-lg">{pick(p, lang)}</p>)}
          {s.li ? <ul className="mt-3 list-disc space-y-2 pl-6 text-lg">{s.li.map((x, k) => <li key={k} className="max-w-prose">{pick(x, lang)}</li>)}</ul> : null}
          {s.links ? <ul className="mt-3 flex flex-wrap gap-x-5 gap-y-2">{s.links.map((x) => <li key={x.url}><Ext href={x.url}>{pick(x.label, lang)}</Ext></li>)}</ul> : null}
        </section>
      ))}
      {g.note ? <Callout>{pick(g.note, lang)}</Callout> : null}
    </Head>
  );
}
