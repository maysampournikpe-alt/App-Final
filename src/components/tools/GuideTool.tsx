"use client";
import { GUIDES } from "@/data/guides";
import { useLang } from "@/lib/i18n";
import { useLocalDoc } from "@/lib/local-doc";
import { useCopy } from "@/lib/use-copy";
import { Callout, Ext, Head, mapsSearch, pick, type L } from "./shared";

export interface MapButton { label: L; q: string }
const copy = {
  en: { near: "Look near you", place: "Search near", placeHelp: "Uses the place you set in Find. It opens a map in a new tab.", sources: "Official links" },
  es: { near: "Busca cerca de ti", place: "Buscar cerca de", placeHelp: "Usa el lugar que pusiste en Buscar. Abre un mapa en una pestaña nueva.", sources: "Enlaces oficiales" },
};

/** Renders one of the plain-language guides in src/data/guides.ts. `maps` adds "look near you" buttons that open a map search. */
export function GuideTool({ id, maps, children }: { id: string; maps?: MapButton[]; children?: React.ReactNode }) {
  const lang = useLang();
  const c = useCopy(copy);
  const g = GUIDES[id];
  const [place] = useLocalDoc<string>("finder-place", "");
  return (
    <Head title={pick(g.title, lang)} lead={pick(g.lead, lang)}>
      {children}
      {maps?.length ? (
        <section className="guide-card mt-6 p-5" aria-labelledby="near-h">
          <h2 id="near-h" className="text-xl">{c.near}</h2>
          <p className="mt-1 text-sm text-muted">{place ? `${c.place}: ${place}. ` : ""}{c.placeHelp}</p>
          <div className="mt-3 flex flex-wrap gap-2">{maps.map((m) => <Ext key={m.q} href={mapsSearch(`${m.q} ${place}`.trim())} className="rounded-md border-[1.5px] border-ink bg-surface px-3 py-2 no-underline hover:bg-sunken">{pick(m.label, lang)}</Ext>)}</div>
        </section>
      ) : null}
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
