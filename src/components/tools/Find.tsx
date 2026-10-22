"use client";
import { useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Check, Copy, Search } from "lucide-react";
import { CATEGORIES, type Category, type FindResult } from "@/lib/ai/finder";
import { useLang } from "@/lib/i18n";
import { useLocalDoc } from "@/lib/local-doc";
import { useProfile } from "@/lib/profile";
import { useSaved } from "@/lib/saved";
import { useCopy } from "@/lib/use-copy";
import { EmptyTrail, Stamp } from "../art";
import { buttonClass, inputClass, Page } from "../ui";
import { categoryCopy, OpportunityCard } from "./OpportunityCard";

type Phase =
  | { kind: "idle" }
  | { kind: "loading"; step: number }
  | { kind: "done"; result: FindResult; cached: boolean }
  | { kind: "error"; code: string };

const copy = {
  en: {
    title: "Find opportunities", ask: "What are you looking for?", askPh: "chess tournaments for middle schoolers",
    place: "City or ZIP code", placePh: "Edinburg, TX", placeHelp: "So results are close to you. Leave it empty to see online options.",
    search: "Search", filters: "Filters", freeOnly: "Free only", paidOnly: "Paid jobs only", any: "Any type", inPerson: "In person", online: "Online", anyMode: "In person or online",
    steps: ["Searching public websites…", "Reading the pages it found…", "Checking each listing has a real source…"],
    slow: "This can take up to a minute. It is reading real pages, not guessing.",
    confirmed: (n: number) => `${n} confirmed ${n === 1 ? "listing" : "listings"}`, toAsk: (n: number) => `${n} to ask about`,
    cached: "Saved answer from today", notConfirmedTitle: "Not confirmed listings", notConfirmedLead: "These are places that might offer this. They are not confirmed listings, so contact them first to ask.",
    stamp: "Not a confirmed listing", contact: "Contact", emailScript: "Email you can send", phoneScript: "What to say on the phone", copy: "Copy", copied: "Copied",
    sourcesTitle: "Pages the search read", dropped: (n: number) => `${n} result${n === 1 ? " was" : "s were"} left out because there was no real page to check.`,
    errors: {
      bad_request: "Write at least a few words about what you want.",
      rate_limited: "You have searched a lot in the last hour. Try again in a minute, or use My Saved while you wait.",
      busy: "The search service is busy. Try again in a minute.",
      slow: "That took too long. Try a shorter search or try again in a minute.",
      unavailable: "Search is not turned on in this version yet.",
      no_results: "Nothing real turned up for that. Try other words, a bigger area, or pick Online.",
      failed: "Something went wrong on our side. Try again in a minute.",
      offline: "You are offline. Searching needs internet. Your saved items still work.",
    } as Record<string, string>,
    emptyTitle: "Describe it in your own words.", emptyBody: "Try “law internships for high schoolers” or “free summer coding camps”.",
  },
  es: {
    title: "Buscar oportunidades", ask: "¿Qué estás buscando?", askPh: "torneos de ajedrez para secundaria",
    place: "Ciudad o código postal", placePh: "Edinburg, TX", placeHelp: "Para que los resultados estén cerca de ti. Déjalo vacío para ver opciones en línea.",
    search: "Buscar", filters: "Filtros", freeOnly: "Solo gratis", paidOnly: "Solo trabajos que pagan", any: "Cualquier tipo", inPerson: "En persona", online: "En línea", anyMode: "En persona o en línea",
    steps: ["Buscando en sitios web públicos…", "Leyendo las páginas que encontró…", "Revisando que cada oportunidad tenga una fuente real…"],
    slow: "Puede tardar hasta un minuto. Está leyendo páginas reales, no adivinando.",
    confirmed: (n: number) => `${n} ${n === 1 ? "oportunidad confirmada" : "oportunidades confirmadas"}`, toAsk: (n: number) => `${n} para preguntar`,
    cached: "Respuesta guardada de hoy", notConfirmedTitle: "Oportunidades sin confirmar", notConfirmedLead: "Son lugares que podrían ofrecerlo. No son ofertas confirmadas, así que primero contáctalos para preguntar.",
    stamp: "No es una oferta confirmada", contact: "Contacto", emailScript: "Correo que puedes mandar", phoneScript: "Qué decir por teléfono", copy: "Copiar", copied: "Copiado",
    sourcesTitle: "Páginas que leyó la búsqueda", dropped: (n: number) => `${n} resultado${n === 1 ? " quedó fuera" : "s quedaron fuera"} porque no había una página real para revisar.`,
    errors: {
      bad_request: "Escribe al menos unas palabras sobre lo que quieres.",
      rate_limited: "Has buscado mucho en la última hora. Intenta de nuevo en un minuto, o mira Mis guardados mientras esperas.",
      busy: "El servicio de búsqueda está ocupado. Intenta de nuevo en un minuto.",
      slow: "Tardó demasiado. Prueba con una búsqueda más corta o intenta de nuevo en un minuto.",
      unavailable: "La búsqueda todavía no está activada en esta versión.",
      no_results: "No apareció nada real para eso. Prueba otras palabras, un área más grande, o elige En línea.",
      failed: "Algo falló de nuestra parte. Intenta de nuevo en un minuto.",
      offline: "No tienes internet. Para buscar se necesita conexión. Tus guardados sí funcionan.",
    } as Record<string, string>,
    emptyTitle: "Cuéntalo con tus palabras.", emptyBody: "Prueba “pasantías de derecho para estudiantes de prepa” o “campamentos de programación gratis en verano”.",
  },
};

function CopyBox({ title, text, c }: { title: string; text: string; c: { copy: string; copied: string } }) {
  const [done, setDone] = useState(false);
  return (
    <div className="notebook my-3 py-4 pr-4">
      <div className="flex items-center justify-between gap-3">
        <h4 className="font-display text-lg">{title}</h4>
        <button onClick={async () => { try { await navigator.clipboard.writeText(text); setDone(true); } catch { /* clipboard blocked */ } }} className="inline-flex items-center gap-1.5 font-bold text-teal underline underline-offset-4">
          {done ? <Check size={16} /> : <Copy size={16} />}{done ? c.copied : c.copy}
        </button>
      </div>
      <p className="mt-2 whitespace-pre-wrap leading-[1.9rem]">{text}</p>
    </div>
  );
}

const NO_HISTORY: { q: string; place: string; at: number }[] = [];

export function FindTool() {
  const c = useCopy(copy);
  const lang = useLang();
  const [profile] = useProfile();
  const { isSaved, toggle } = useSaved();
  const [place, setPlace] = useLocalDoc<string>("finder-place", "");
  const params = useSearchParams();
  const [, setHist] = useLocalDoc<{ q: string; place: string; at: number }[]>("finder-history", NO_HISTORY);
  const [query, setQuery] = useState(params.get("q") ?? "");
  const [category, setCategory] = useState<Category | "">("");
  const [free, setFree] = useState(false);
  const [paid, setPaid] = useState(false);
  const [mode, setMode] = useState<"" | "online" | "in-person">("");
  const [phase, setPhase] = useState<Phase>({ kind: "idle" });
  const timer = useRef<ReturnType<typeof setInterval>>(undefined);
  const auto = useRef(false);

  const run = async () => {
    if (query.trim().length < 2) return setPhase({ kind: "error", code: "bad_request" });
    if (!navigator.onLine) return setPhase({ kind: "error", code: "offline" });
    setHist((h) => [{ q: query.trim(), place: place.trim(), at: Date.now() }, ...h.filter((x) => x.q.toLowerCase() !== query.trim().toLowerCase())].slice(0, 30));
    setPhase({ kind: "loading", step: 0 });
    clearInterval(timer.current);
    let step = 0;
    timer.current = setInterval(() => setPhase((p) => (p.kind === "loading" ? { kind: "loading", step: Math.min(++step, 2) } : p)), 6000);
    try {
      const res = await fetch("/api/find", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: query.trim(), place: place.trim(), grade: profile.grade, lang,
          interests: profile.interests.slice(0, 10),
          filters: { ...(category ? { category } : {}), ...(free ? { freeOnly: true } : {}), ...(paid ? { paidOnly: true } : {}), ...(mode ? { mode } : {}) },
        }),
      });
      const json = await res.json().catch(() => null);
      setPhase(json?.ok ? { kind: "done", result: json.result, cached: !!json.cached } : { kind: "error", code: json?.error ?? "failed" });
    } catch {
      setPhase({ kind: "error", code: navigator.onLine ? "failed" : "offline" });
    } finally {
      clearInterval(timer.current);
    }
  };
  useEffect(() => () => clearInterval(timer.current), []);
  // Arriving from the home page with ?q= searches right away, once.
  useEffect(() => {
    if (!auto.current && query.trim().length >= 2 && params.has("q")) { auto.current = true; void run(); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loading = phase.kind === "loading";
  return (
    <Page wide>
      <h1 className="text-3xl sm:text-4xl">{c.title}</h1>

      <form onSubmit={(e) => { e.preventDefault(); void run(); }} className="guide-card mt-6 p-5">
        <label className="block font-bold" htmlFor="find-q">{c.ask}</label>
        <div className="mt-1 flex flex-col gap-3 sm:flex-row">
          <input id="find-q" value={query} onChange={(e) => setQuery(e.target.value)} placeholder={c.askPh} maxLength={200} className={`${inputClass} min-w-0 flex-1`} />
          <button disabled={loading} className={buttonClass.primary}><Search size={18} />{c.search}</button>
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <label><span className="block font-bold">{c.place}</span>
            <input value={place} onChange={(e) => setPlace(e.target.value)} placeholder={c.placePh} maxLength={80} autoComplete="address-level2" className={`${inputClass} mt-1`} />
            <span className="text-sm text-muted">{c.placeHelp}</span></label>
          <fieldset><legend className="font-bold">{c.filters}</legend>
            <div className="mt-1 grid grid-cols-2 gap-2">
              <select aria-label={c.any} value={category} onChange={(e) => setCategory(e.target.value as Category | "")} className={inputClass}>
                <option value="">{c.any}</option>{CATEGORIES.map((k) => <option key={k} value={k}>{categoryCopy[lang][k]}</option>)}</select>
              <select aria-label={c.anyMode} value={mode} onChange={(e) => setMode(e.target.value as typeof mode)} className={inputClass}>
                <option value="">{c.anyMode}</option><option value="in-person">{c.inPerson}</option><option value="online">{c.online}</option></select>
            </div>
            <div className="mt-3 flex flex-wrap gap-x-6 gap-y-2">
              <label className="flex cursor-pointer items-center gap-2 font-bold"><input type="checkbox" checked={free} onChange={(e) => { setFree(e.target.checked); if (e.target.checked) setPaid(false); }} className="h-5 w-5 accent-[var(--c-teal)]" />{c.freeOnly}</label>
              <label className="flex cursor-pointer items-center gap-2 font-bold"><input type="checkbox" checked={paid} onChange={(e) => { setPaid(e.target.checked); if (e.target.checked) setFree(false); }} className="h-5 w-5 accent-[var(--c-teal)]" />{c.paidOnly}</label>
            </div>
          </fieldset>
        </div>
      </form>

      <div className="mt-8" aria-live="polite">
        {phase.kind === "idle" ? (
          <div className="flex max-w-xl items-center gap-5"><EmptyTrail className="h-24 w-36 shrink-0 text-ink" />
            <div><p className="font-display text-xl font-semibold">{c.emptyTitle}</p><p className="text-muted">{c.emptyBody}</p></div></div>
        ) : null}

        {loading ? (
          <div className="guide-card max-w-xl p-6">
            <p className="font-display text-xl font-semibold">{c.steps[phase.step]}</p>
            <p className="mt-2 text-muted">{c.slow}</p>
            <div className="mt-4 h-2 overflow-hidden rounded-full border-[1.5px] border-ink bg-sunken"><div className="h-full w-1/3 animate-pulse bg-teal" /></div>
          </div>
        ) : null}

        {phase.kind === "error" ? (
          <p role="alert" className="guide-card max-w-xl p-5 text-lg font-bold">{c.errors[phase.code] ?? c.errors.failed}</p>
        ) : null}

        {phase.kind === "done" ? (
          <>
            <p className="mb-4 flex flex-wrap items-center gap-x-4 gap-y-1 font-bold">
              <span>{c.confirmed(phase.result.listings.length)}</span>
              {phase.result.notConfirmed.length ? <span className="text-muted">{c.toAsk(phase.result.notConfirmed.length)}</span> : null}
              {phase.cached ? <span className="text-sm font-normal text-muted">{c.cached}</span> : null}
            </p>
            <div className="grid gap-6 md:grid-cols-2">
              {phase.result.listings.map((l) => <OpportunityCard key={l.id} listing={l} lang={lang} saved={isSaved(l)} onToggle={() => toggle(l)} />)}
            </div>
            {phase.result.droppedUnverified ? <p className="mt-4 text-sm text-muted">{c.dropped(phase.result.droppedUnverified)}</p> : null}

            {phase.result.notConfirmed.length ? (
              <section className="mt-10">
                <h2 className="text-2xl sm:text-3xl">{c.notConfirmedTitle}</h2>
                <p className="mt-1 max-w-prose text-muted">{c.notConfirmedLead}</p>
                <ul className="mt-4 grid gap-4 md:grid-cols-2">
                  {phase.result.notConfirmed.map((s) => (
                    <li key={s.name} className="guide-card p-4">
                      <Stamp tone="terracotta" className="mb-2">{c.stamp}</Stamp>
                      <h3 className="text-xl">{s.name}</h3>
                      {s.why ? <p className="mt-1">{s.why}</p> : null}
                      {s.contact ? <p className="mt-1 text-muted">{c.contact}: {s.contact}</p> : null}
                    </li>
                  ))}
                </ul>
                {phase.result.emailScript ? <CopyBox title={c.emailScript} text={phase.result.emailScript} c={c} /> : null}
                {phase.result.phoneScript ? <CopyBox title={c.phoneScript} text={phase.result.phoneScript} c={c} /> : null}
              </section>
            ) : null}

            {phase.result.sources.length ? (
              <details className="mt-10 max-w-3xl">
                <summary className="cursor-pointer font-bold text-teal">{c.sourcesTitle} ({phase.result.sources.length})</summary>
                <ul className="mt-2 list-disc space-y-1 pl-6 marker:text-terracotta">
                  {phase.result.sources.map((s) => <li key={s.url} className="break-words"><a href={s.url} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2">{s.title}</a></li>)}
                </ul>
              </details>
            ) : null}
          </>
        ) : null}
      </div>
    </Page>
  );
}
