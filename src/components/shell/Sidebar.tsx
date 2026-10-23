"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { PanelLeftClose, PanelLeftOpen, Search, Star, X } from "lucide-react";
import { ALL_TABS, HUBS, hubOfTab, type Tool } from "@/config/features";
import { ICONS } from "@/config/icons";
import { BRAND } from "@/config/brand";
import { useLang, useT } from "@/lib/i18n";
import { setPrefs, togglePref, usePrefs } from "@/lib/prefs";
import { Compass } from "../art";

const norm = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

/** Seven hubs, not 28 tabs. Every feature is still one search or one hub page away. */
export function Sidebar({ collapsible = true, onNavigate }: { collapsible?: boolean; onNavigate?: () => void }) {
  const t = useT();
  const lang = useLang();
  const prefs = usePrefs();
  const pathname = usePathname();
  const [query, setQuery] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const collapsed = collapsible && prefs.sidebarCollapsed;

  const hidden = useMemo(() => new Set(prefs.hidden), [prefs.hidden]);
  const toolsByKey = useMemo(() => new Map(ALL_TABS.flatMap((tab) => tab.tools.map((tool) => [tool.key, { tool, tab }] as const))), []);

  // Which hub the current page belongs to: /h/<hub>, or /t/<tab>/... mapped through its tab.
  const parts = pathname.split("/");
  const currentHub = pathname.startsWith("/h/") ? parts[2] : pathname.startsWith("/t/") ? hubOfTab(parts[2])?.id : undefined;
  const currentKey = pathname.startsWith("/t/") ? parts.slice(2, 4).join("/") : "";

  useEffect(() => {
    scrollRef.current?.querySelector<HTMLElement>('[aria-current="page"]')?.scrollIntoView({ block: "nearest" });
  }, [pathname, collapsed]);

  const results = useMemo(() => {
    const q = norm(query.trim());
    if (!q) return null;
    return ALL_TABS.flatMap((tab) =>
      tab.tools
        .filter((tool) => tool.status === "built" && !hidden.has(tool.key))
        .filter((tool) => [tool.name.en, tool.name.es, tab.name.en, tab.name.es].some((s) => norm(s).includes(q)))
        .map((tool) => ({ tool, tab })),
    );
  }, [query, hidden]);

  if (collapsed) {
    return (
      <nav aria-label={BRAND.name} className="flex h-full flex-col items-center gap-1 overflow-y-auto py-3">
        <Link href="/" className="mb-2 text-teal" aria-label={t("home")} title={t("home")}><Compass size={30} /></Link>
        <div className="flex w-full flex-col items-center gap-1 border-t border-dashed border-line pt-2">
          {HUBS.map((h) => {
            const Icon = ICONS[h.icon];
            const active = currentHub === h.id;
            return (
              <Link key={h.id} href={`/h/${h.id}`} title={h.name[lang]} aria-label={h.name[lang]} aria-current={active ? "page" : undefined}
                className={`grid h-10 w-10 place-items-center rounded-xl ${active ? "bg-teal text-on-teal" : "text-ink hover:bg-sunken"}`}>
                <Icon size={20} strokeWidth={1.75} />
              </Link>
            );
          })}
        </div>
        <button onClick={() => setPrefs({ sidebarCollapsed: false })} aria-label={t("expandSidebar")} title={t("expandSidebar")}
          className="mt-auto grid h-10 w-10 place-items-center rounded-xl text-ink hover:bg-sunken"><PanelLeftOpen size={20} strokeWidth={1.75} /></button>
      </nav>
    );
  }

  const pinnedTools = prefs.pinned.map((k) => toolsByKey.get(k)).filter((x): x is NonNullable<typeof x> => !!x && !hidden.has(x.tool.key));

  return (
    <nav aria-label={BRAND.name} className="flex h-full flex-col">
      <div className="flex items-center justify-between gap-2 px-4 pb-2 pt-4">
        <Link href="/" onClick={onNavigate} className="flex items-center gap-2 text-teal">
          <Compass size={30} /><span className="font-display text-2xl font-extrabold text-ink">{BRAND.name}</span>
        </Link>
        {collapsible ? (
          <button onClick={() => setPrefs({ sidebarCollapsed: true })} aria-label={t("collapseSidebar")} title={t("collapseSidebar")}
            className="grid h-9 w-9 place-items-center rounded-xl text-ink hover:bg-sunken"><PanelLeftClose size={20} strokeWidth={1.75} /></button>
        ) : null}
      </div>

      <div className="px-4 pb-3">
        <label className="relative block">
          <span className="sr-only">{t("searchFeatures")}</span>
          <Search size={18} strokeWidth={1.75} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder={t("searchFeatures")} enterKeyHint="search"
            className="w-full rounded-xl border-[1.5px] border-ink bg-surface py-2 pl-10 pr-9 text-[0.95rem] placeholder:text-muted" />
          {query ? (
            <button onClick={() => setQuery("")} aria-label="Clear" className="absolute right-1.5 top-1/2 grid h-7 w-7 -translate-y-1/2 place-items-center rounded text-muted hover:text-ink"><X size={16} /></button>
          ) : null}
        </label>
      </div>

      <div ref={scrollRef} className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-2 pb-6">
        {results ? (
          results.length ? (
            <ul className="space-y-0.5">
              {results.map(({ tool, tab }) => (
                <li key={tool.key}><ToolLink tool={tool} tabName={tab.name[lang]} active={currentKey === tool.key} onNavigate={() => { setQuery(""); onNavigate?.(); }} /></li>
              ))}
            </ul>
          ) : <p className="px-3 py-4 text-sm text-muted">{t("noMatches")}</p>
        ) : (
          <>
            {pinnedTools.length ? (
              <section className="mb-3">
                <h2 className="px-3 pb-1 pt-1 font-display text-sm font-semibold text-terracotta">{t("pinned")}</h2>
                <ul className="space-y-0.5">
                  {pinnedTools.map(({ tool, tab }) => (
                    <li key={tool.key}><ToolLink tool={tool} tabName={tab.name[lang]} active={currentKey === tool.key} onNavigate={onNavigate} /></li>
                  ))}
                </ul>
              </section>
            ) : null}

            <ul className="space-y-1">
              {HUBS.map((hub) => {
                const Icon = ICONS[hub.icon];
                const active = currentHub === hub.id;
                return (
                  <li key={hub.id}>
                    <Link href={`/h/${hub.id}`} onClick={onNavigate} aria-current={active ? "page" : undefined}
                      className={`flex items-center gap-3 rounded-xl px-2 py-2 ${active ? "bg-teal text-on-teal" : "hover:bg-sunken"}`}>
                      <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-lg ${active ? "bg-marigold text-on-marigold" : "bg-sunken text-teal"}`}><Icon size={19} strokeWidth={2} aria-hidden /></span>
                      <span className="min-w-0 flex-1 truncate text-lg font-extrabold">{hub.name[lang]}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </>
        )}
      </div>
    </nav>
  );
}

function ToolLink({ tool, tabName, active, onNavigate }: { tool: Tool; tabName?: string; active: boolean; onNavigate?: () => void }) {
  const t = useT();
  const lang = useLang();
  const prefs = usePrefs();
  const Icon = ICONS[tool.icon];
  const pinned = prefs.pinned.includes(tool.key);
  return (
    <div className={`group flex items-center rounded-xl ${active ? "bg-marigold text-on-marigold" : "hover:bg-sunken"}`}>
      <Link href={`/t/${tool.key}`} onClick={onNavigate} aria-current={active ? "page" : undefined} className="flex min-w-0 flex-1 items-center gap-2 px-2 py-1.5 text-[0.95rem]">
        <Icon size={17} strokeWidth={1.75} className="shrink-0" />
        <span className="min-w-0 flex-1">
          <span className="block truncate">{tool.name[lang]}</span>
          {tabName ? <span className={`block truncate text-xs ${active ? "" : "text-muted"}`}>{tabName}</span> : null}
        </span>
      </Link>
      <button onClick={() => togglePref("pinned", tool.key)} aria-pressed={pinned} aria-label={`${pinned ? t("unpin") : t("pin")}: ${tool.name[lang]}`} title={pinned ? t("unpin") : t("pin")}
        className={`mr-1 grid h-7 w-7 shrink-0 place-items-center rounded ${pinned ? "" : "opacity-0 focus-visible:opacity-100 group-hover:opacity-100 [@media(hover:none)]:opacity-60"}`}>
        <Star size={15} strokeWidth={1.75} className={pinned ? "fill-current" : ""} />
      </button>
    </div>
  );
}
