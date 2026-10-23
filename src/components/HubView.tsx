"use client";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ALL_TABS, type Hub } from "@/config/features";
import { ICONS } from "@/config/icons";
import { useLang } from "@/lib/i18n";
import { Page } from "./ui";

/** One page per hub: its sections, with ready tools first and the rest folded away. */
export function HubView({ hub }: { hub: Hub }) {
  const lang = useLang();
  const HubIcon = ICONS[hub.icon];
  const tabs = hub.tabs.map((id) => ALL_TABS.find((t) => t.id === id)).filter((t): t is NonNullable<typeof t> => !!t);
  return (
    <>
      <div className="notebook-hero border-b-[1.5px] border-ink">
        <Page>
          <h1 className="flex items-center gap-3 text-4xl sm:text-5xl"><HubIcon size={38} strokeWidth={1.75} className="shrink-0 text-teal" /><span className="marker">{hub.name[lang]}</span></h1>
          <p className="mt-2 max-w-prose text-lg text-muted">{hub.blurb[lang]}</p>
        </Page>
      </div>
      <Page wide>
        <ul className="grid gap-x-4 gap-y-6 sm:grid-cols-2 lg:grid-cols-3">
          {tabs.filter((tab) => tab.tools.some((x) => x.status === "built")).map((tab, i) => {
            const Icon = ICONS[tab.icon];
            const built = tab.tools.filter((x) => x.status === "built");
            return (
              <li key={tab.id}>
                <Link href={`/t/${tab.id}`} className={`folder tone-${(i % 7) + 1} flex h-full items-center gap-3 p-5 hover:-translate-y-0.5`}>
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-sunken text-teal"><Icon size={24} strokeWidth={2} aria-hidden /></span>
                  <span className="min-w-0 flex-1"><span className="block text-xl font-extrabold">{tab.name[lang]}</span><span className="block text-sm text-muted">{lang === "es" ? `${built.length} herramientas` : `${built.length} tools`}</span></span>
                  <ArrowRight size={20} aria-hidden className="shrink-0 text-teal" />
                </Link>
              </li>
            );
          })}
        </ul>
      </Page>
    </>
  );
}
