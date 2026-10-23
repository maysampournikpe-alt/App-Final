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
      <div className="contours border-b-[1.5px] border-ink">
        <Page>
          <h1 className="flex items-center gap-3 text-4xl sm:text-5xl"><HubIcon size={38} strokeWidth={1.75} className="shrink-0 text-teal" />{hub.name[lang]}</h1>
          <p className="mt-2 max-w-prose text-lg text-muted">{hub.blurb[lang]}</p>
        </Page>
      </div>
      <Page wide>
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {tabs.filter((tab) => tab.tools.some((x) => x.status === "built")).map((tab) => {
            const Icon = ICONS[tab.icon];
            const built = tab.tools.filter((x) => x.status === "built");
            const first = built.slice(0, 4);
            return (
              <li key={tab.id}>
                <section aria-labelledby={`h-${tab.id}`} className="guide-card flex h-full flex-col p-5">
                  <h2 id={`h-${tab.id}`} className="flex items-center gap-3 text-xl">
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-sunken text-teal"><Icon size={22} strokeWidth={2} aria-hidden /></span>
                    <Link href={`/t/${tab.id}`} className="hover:underline">{tab.name[lang]}</Link>
                  </h2>
                  <ul className="mt-3 flex-1 space-y-1">
                    {first.map((tool) => <li key={tool.key}><Link href={`/t/${tool.key}`} className="block rounded-lg px-2 py-1 hover:bg-sunken">{tool.name[lang]}</Link></li>)}
                  </ul>
                  {built.length > first.length ? <Link href={`/t/${tab.id}`} className="mt-3 inline-flex items-center gap-1 font-bold text-teal underline-offset-4 hover:underline">{lang === "es" ? `Ver las ${built.length}` : `See all ${built.length}`} <ArrowRight size={16} aria-hidden /></Link> : null}
                </section>
              </li>
            );
          })}
        </ul>
      </Page>
    </>
  );
}
