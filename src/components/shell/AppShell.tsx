"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Menu, X, Ellipsis } from "lucide-react";
import { findTab } from "@/config/features";
import { ICONS } from "@/config/icons";
import { BRAND } from "@/config/brand";
import { useLang, useT } from "@/lib/i18n";
import { applyPrefs, usePrefs } from "@/lib/prefs";
import { Compass } from "../art";
import { Sidebar } from "./Sidebar";
import { LangToggle, ThemeToggle } from "./Toggles";

export function AppShell({ children }: { children: React.ReactNode }) {
  const t = useT();
  const prefs = usePrefs();
  // The drawer is open only for the page it was opened on, so navigating closes it.
  const [drawerAt, setDrawerAt] = useState<string | null>(null);
  const opener = useRef<HTMLButtonElement>(null);
  const closeBtn = useRef<HTMLButtonElement>(null);
  const pathname = usePathname();
  const drawer = drawerAt === pathname;
  const setDrawer = (open: boolean) => setDrawerAt(open ? pathname : null);

  // Keep <html> attributes in step with saved preferences after hydration.
  useEffect(() => applyPrefs(prefs), [prefs]);

  useEffect(() => {
    if (!drawer) return;
    closeBtn.current?.focus();
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setDrawerAt(null);
    window.addEventListener("keydown", onKey);
    const o = opener.current;
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
      o?.focus();
    };
  }, [drawer]);

  return (
    <div className="min-h-dvh md:grid" style={{ gridTemplateColumns: `${prefs.sidebarCollapsed ? "4rem" : "19rem"} minmax(0,1fr)` }}>
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-[60] focus:rounded-md focus:bg-ink focus:px-3 focus:py-2 focus:text-paper">
        {t("skip")}
      </a>

      {/* Tablet and desktop: the menu stays open on the left. */}
      <aside className="no-print sticky top-0 hidden h-dvh border-r-[1.5px] border-ink bg-surface md:block">
        <Sidebar />
      </aside>

      <div className="flex min-h-dvh min-w-0 flex-col">
        <header className="no-print sticky top-0 z-30 flex items-center justify-between gap-3 border-b-[1.5px] border-ink bg-paper px-4 py-2.5">
          <div className="flex items-center gap-2 md:hidden">
            <button
              ref={opener}
              onClick={() => setDrawer(true)}
              aria-label={t("menu")}
              aria-expanded={drawer}
              className="grid h-10 w-10 place-items-center rounded-md border-[1.5px] border-ink bg-surface"
            >
              <Menu size={20} strokeWidth={1.75} />
            </button>
            <Link href="/" className="flex items-center gap-1.5 text-teal">
              <Compass size={26} />
              <span className="font-display text-xl font-semibold text-ink">{BRAND.name}</span>
            </Link>
          </div>
          <div className="hidden md:block" />
          <div className="flex items-center gap-2">
            <LangToggle />
            <ThemeToggle />
          </div>
        </header>

        <main id="main" className="flex-1 pb-24 md:pb-10" tabIndex={-1}>
          {children}
        </main>
      </div>

      {/* Phones: full menu as a slide-out drawer. */}
      {drawer ? (
        <div className="no-print fixed inset-0 z-50 md:hidden" role="dialog" aria-modal="true" aria-label={t("menu")}>
          <button className="absolute inset-0 bg-ink/50" aria-label={t("closeMenu")} onClick={() => setDrawer(false)} tabIndex={-1} />
          <div className="absolute inset-y-0 left-0 w-[min(88vw,22rem)] border-r-[1.5px] border-ink bg-surface shadow-[6px_0_0_var(--c-line)]">
            <button
              ref={closeBtn}
              onClick={() => setDrawer(false)}
              aria-label={t("closeMenu")}
              className="absolute right-2 top-3 z-10 grid h-9 w-9 place-items-center rounded-md hover:bg-sunken"
            >
              <X size={20} strokeWidth={1.75} />
            </button>
            <Sidebar collapsible={false} onNavigate={() => setDrawer(false)} />
          </div>
        </div>
      ) : null}

      <BottomBar onMore={() => setDrawer(true)} />
    </div>
  );
}

function BottomBar({ onMore }: { onMore: () => void }) {
  const t = useT();
  const lang = useLang();
  const prefs = usePrefs();
  const pathname = usePathname();
  const tabs = prefs.bottomTabs.map((id) => findTab(id)?.tab).filter((x): x is NonNullable<typeof x> => !!x).slice(0, 5);
  return (
    <nav aria-label="Main" className="no-print fixed inset-x-0 bottom-0 z-40 border-t-[1.5px] border-ink bg-surface pb-[env(safe-area-inset-bottom)] md:hidden">
      <ul className="mx-auto flex max-w-xl items-stretch">
        {tabs.map((tab) => {
          const Icon = ICONS[tab.icon];
          const active = pathname.startsWith(`/t/${tab.id}`);
          return (
            <li key={tab.id} className="flex-1">
              <Link
                href={`/t/${tab.id}`}
                aria-current={active ? "page" : undefined}
                className={`flex h-14 flex-col items-center justify-center gap-0.5 text-[0.7rem] font-bold leading-tight ${active ? "text-teal" : "text-ink"}`}
              >
                <span className={`grid h-7 w-12 place-items-center rounded-full ${active ? "bg-teal text-on-teal" : ""}`}>
                  <Icon size={18} strokeWidth={1.75} />
                </span>
                <span className="max-w-full truncate px-1">{tab.name[lang]}</span>
              </Link>
            </li>
          );
        })}
        <li className="flex-1">
          <button onClick={onMore} className="flex h-14 w-full flex-col items-center justify-center gap-0.5 text-[0.7rem] font-bold leading-tight">
            <span className="grid h-7 w-12 place-items-center"><Ellipsis size={18} strokeWidth={1.75} /></span>
            {t("more")}
          </button>
        </li>
      </ul>
    </nav>
  );
}
