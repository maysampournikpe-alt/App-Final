"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown, ChevronRight, PanelLeftClose, PanelLeftOpen, Search, Star, X } from "lucide-react";
import { ALL_TABS, GROUPS, type Tab, type Tool } from "@/config/features";
import { ICONS } from "@/config/icons";
import { BRAND } from "@/config/brand";
import { useLang, useT } from "@/lib/i18n";
import { setPrefs, togglePref, usePrefs } from "@/lib/prefs";
import { Compass } from "../art";

const norm = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
const toolHref = (t: Tool) => `/t/${t.key}`;

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

  const currentTab = pathname.startsWith("/t/") ? pathname.split("/")[2] : "";
  const currentKey = pathname.startsWith("/t/") ? pathname.split("/").slice(2, 4).join("/") : "";

  // Keep the current page visible in the long list.
  useEffect(() => {
    const el = scrollRef.current?.querySelector<HTMLElement>('[aria-current="page"]');
    el?.scrollIntoView({ block: "nearest" });
  }, [pathname, collapsed]);

  const results = useMemo(() => {
    const q = norm(query.trim());
    if (!q) return null;
    return ALL_TABS.flatMap((tab) =>
      tab.tools
        .filter((tool) => !hidden.has(tool.key))
        .filter((tool) =>
          [tool.name.en, tool.name.es, tab.name.en, tab.name.es].some((s) => norm(s).includes(q)),
        )
        .map((tool) => ({ tool, tab })),
    );
  }, [query, hidden]);

  if (collapsed) {
    return (
      <nav aria-label={BRAND.name} className="flex h-full flex-col items-center gap-1 overflow-y-auto py-3">
        <Link href="/" className="mb-2 text-teal" aria-label={t("home")} title={t("home")}>
          <Compass size={30} />
        </Link>
        {GROUPS.map((g) => (
          <div key={g.id} className="flex w-full flex-col items-center gap-1 border-t border-dashed border-line pt-2">
            {g.tabs.map((tab) => {
              const Icon = ICONS[tab.icon];
              const active = currentTab === tab.id;
              return (
                <Link
                  key={tab.id}
                  href={`/t/${tab.id}`}
                  title={tab.name[lang]}
                  aria-label={tab.name[lang]}
                  aria-current={active ? "page" : undefined}
                  className={`grid h-10 w-10 place-items-center rounded-md ${active ? "bg-teal text-on-teal" : "text-ink hover:bg-sunken"}`}
                >
                  <Icon size={20} strokeWidth={1.75} />
                </Link>
              );
            })}
          </div>
        ))}
        <button
          onClick={() => setPrefs({ sidebarCollapsed: false })}
          aria-label={t("expandSidebar")}
          title={t("expandSidebar")}
          className="mt-auto grid h-10 w-10 place-items-center rounded-md text-ink hover:bg-sunken"
        >
          <PanelLeftOpen size={20} strokeWidth={1.75} />
        </button>
      </nav>
    );
  }

  const pinnedTools = prefs.pinned.map((k) => toolsByKey.get(k)).filter((x): x is NonNullable<typeof x> => !!x && !hidden.has(x.tool.key));

  return (
    <nav aria-label={BRAND.name} className="flex h-full flex-col">
      <div className="flex items-center justify-between gap-2 px-4 pb-2 pt-4">
        <Link href="/" onClick={onNavigate} className="flex items-center gap-2 text-teal">
          <Compass size={30} />
          <span className="font-display text-2xl font-semibold text-ink">{BRAND.name}</span>
        </Link>
        {collapsible ? (
          <button
            onClick={() => setPrefs({ sidebarCollapsed: true })}
            aria-label={t("collapseSidebar")}
            title={t("collapseSidebar")}
            className="grid h-9 w-9 place-items-center rounded-md text-ink hover:bg-sunken"
          >
            <PanelLeftClose size={20} strokeWidth={1.75} />
          </button>
        ) : null}
      </div>

      {/* Search stays pinned while the list scrolls. */}
      <div className="px-4 pb-3">
        <label className="relative block">
          <span className="sr-only">{t("searchFeatures")}</span>
          <Search size={18} strokeWidth={1.75} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t("searchFeatures")}
            enterKeyHint="search"
            className="w-full rounded-md border-[1.5px] border-ink bg-surface py-2 pl-10 pr-9 text-[0.95rem] placeholder:text-muted"
          />
          {query ? (
            <button onClick={() => setQuery("")} aria-label="Clear" className="absolute right-1.5 top-1/2 grid h-7 w-7 -translate-y-1/2 place-items-center rounded text-muted hover:text-ink">
              <X size={16} />
            </button>
          ) : null}
        </label>
        {!query ? <p className="mt-1 text-xs text-muted">{t("searchHint")}</p> : null}
      </div>

      <div ref={scrollRef} className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-2 pb-6">
        {results ? (
          results.length ? (
            <ul className="space-y-0.5">
              {results.map(({ tool, tab }) => (
                <li key={tool.key}>
                  <ToolLink tool={tool} tabName={tab.name[lang]} active={currentKey === tool.key} onNavigate={() => { setQuery(""); onNavigate?.(); }} />
                </li>
              ))}
            </ul>
          ) : (
            <p className="px-3 py-4 text-sm text-muted">{t("noMatches")}</p>
          )
        ) : (
          <>
            <section className="mb-3">
              <h2 className="px-3 pb-1 pt-2 font-display text-sm font-semibold text-terracotta">{t("pinned")}</h2>
              {pinnedTools.length ? (
                <ul className="space-y-0.5">
                  {pinnedTools.map(({ tool, tab }) => (
                    <li key={tool.key}>
                      <ToolLink tool={tool} tabName={tab.name[lang]} active={currentKey === tool.key} onNavigate={onNavigate} />
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="px-3 text-sm text-muted">{t("pinnedEmpty")}</p>
              )}
            </section>

            {GROUPS.map((group, gi) => {
              const closed = prefs.closedGroups.includes(group.id);
              return (
                <section key={group.id} className="mb-1">
                  <h2>
                    <button
                      onClick={() => togglePref("closedGroups", group.id)}
                      aria-expanded={!closed}
                      className="flex w-full items-baseline gap-2 rounded-md px-3 py-2 text-left hover:bg-sunken"
                    >
                      <span className="w-5 text-xs font-bold tabular-nums text-terracotta">{String(gi + 1).padStart(2, "0")}</span>
                      <span className="flex-1 font-display text-lg font-semibold">{group.name[lang]}</span>
                      {closed ? <ChevronRight size={16} className="self-center text-muted" /> : <ChevronDown size={16} className="self-center text-muted" />}
                      <span className="sr-only">{closed ? t("expandSection") : t("collapseSection")}</span>
                    </button>
                  </h2>
                  {!closed ? (
                    <ul className="relative ml-[1.55rem] space-y-0.5 pl-3">
                      <span aria-hidden className="trail-dots absolute bottom-2 left-0 top-1 w-[4px]" />
                      {group.tabs.map((tab) => (
                        <TabBlock key={tab.id} tab={tab} hidden={hidden} currentTab={currentTab} currentKey={currentKey} onNavigate={onNavigate} />
                      ))}
                    </ul>
                  ) : null}
                </section>
              );
            })}
          </>
        )}
      </div>
    </nav>
  );
}

function TabBlock({
  tab, hidden, currentTab, currentKey, onNavigate,
}: { tab: Tab; hidden: Set<string>; currentTab: string; currentKey: string; onNavigate?: () => void }) {
  const lang = useLang();
  const prefs = usePrefs();
  const Icon = ICONS[tab.icon];
  const isCurrent = currentTab === tab.id;
  const open = isCurrent || prefs.openTabs.includes(tab.id);
  const tools = tab.tools.filter((x) => !hidden.has(x.key));
  if (!tools.length) return null;
  return (
    <li>
      <div className={`flex items-center rounded-md ${isCurrent && !currentKey.includes("/") ? "bg-teal text-on-teal" : "hover:bg-sunken"}`}>
        <Link
          href={`/t/${tab.id}`}
          onClick={onNavigate}
          aria-current={isCurrent && currentKey === tab.id ? "page" : undefined}
          className="flex min-w-0 flex-1 items-center gap-2.5 px-2 py-1.5 font-bold"
        >
          <Icon size={19} strokeWidth={1.75} className="shrink-0" />
          <span className="truncate">{tab.name[lang]}</span>
        </Link>
        <button
          onClick={() => togglePref("openTabs", tab.id)}
          aria-expanded={open}
          aria-label={`${tab.name[lang]}: ${open ? "−" : "+"}`}
          className="grid h-8 w-8 shrink-0 place-items-center rounded"
        >
          {open ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
        </button>
      </div>
      {open ? (
        <ul className="my-0.5 ml-4 space-y-px border-l-[1.5px] border-line pl-2">
          {tools.map((tool) => (
            <li key={tool.key}>
              <ToolLink tool={tool} active={currentKey === tool.key} onNavigate={onNavigate} />
            </li>
          ))}
        </ul>
      ) : null}
    </li>
  );
}

function ToolLink({ tool, tabName, active, onNavigate }: { tool: Tool; tabName?: string; active: boolean; onNavigate?: () => void }) {
  const t = useT();
  const lang = useLang();
  const prefs = usePrefs();
  const Icon = ICONS[tool.icon];
  const pinned = prefs.pinned.includes(tool.key);
  return (
    <div className={`group flex items-center rounded-md ${active ? "bg-marigold text-on-marigold" : "hover:bg-sunken"}`}>
      <Link
        href={toolHref(tool)}
        onClick={onNavigate}
        aria-current={active ? "page" : undefined}
        className="flex min-w-0 flex-1 items-center gap-2 px-2 py-1.5 text-[0.95rem]"
      >
        <Icon size={17} strokeWidth={1.75} className="shrink-0" />
        <span className="min-w-0 flex-1">
          <span className="block truncate">{tool.name[lang]}</span>
          {tabName ? <span className={`block truncate text-xs ${active ? "" : "text-muted"}`}>{tabName}</span> : null}
        </span>
        {tool.status === "soon" ? (
          <span className={`shrink-0 rounded-sm border px-1 text-[0.7rem] font-bold leading-4 ${active ? "border-on-marigold" : "border-line text-muted"}`}>
            {t("comingSoon")}
          </span>
        ) : null}
      </Link>
      <button
        onClick={() => togglePref("pinned", tool.key)}
        aria-pressed={pinned}
        aria-label={`${pinned ? t("unpin") : t("pin")}: ${tool.name[lang]}`}
        title={pinned ? t("unpin") : t("pin")}
        className={`mr-1 grid h-7 w-7 shrink-0 place-items-center rounded ${pinned ? "" : "opacity-0 focus-visible:opacity-100 group-hover:opacity-100 [@media(hover:none)]:opacity-60"}`}
      >
        <Star size={15} strokeWidth={1.75} className={pinned ? "fill-current" : ""} />
      </button>
    </div>
  );
}
