"use client";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ALL_TABS, type Hub } from "@/config/features";
import { ICONS } from "@/config/icons";
import { useLang } from "@/lib/i18n";
import { Page, ToolList } from "./ui";

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
          {tabs.length > 1 ? (
            <ul className="mt-4 flex flex-wrap gap-2">
              {tabs.map((t) => <li key={t.id}><a href={`#s-${t.id}`} className="inline-block rounded-full border-[1.5px] border-ink bg-surface px-3 py-1 font-bold hover:bg-sunken">{t.name[lang]}</a></li>)}
            </ul>
          ) : null}
        </Page>
      </div>
      <Page>
        <div className="space-y-12">
          {tabs.map((tab) => {
            const Icon = ICONS[tab.icon];
            return (
              <section key={tab.id} id={`s-${tab.id}`} aria-labelledby={`h-${tab.id}`} className="scroll-mt-20">
                <div className="flex items-baseline justify-between gap-3 border-b-[1.5px] border-ink pb-1">
                  <h2 id={`h-${tab.id}`} className="flex items-center gap-2 text-2xl"><Icon size={22} strokeWidth={1.75} className="text-teal" />{tab.name[lang]}</h2>
                  <Link href={`/t/${tab.id}`} className="inline-flex items-center gap-1 font-bold text-teal underline-offset-4 hover:underline" aria-label={`${tab.name[lang]}: all`}><ArrowRight size={16} /></Link>
                </div>
                <ToolList tools={tab.tools} />
              </section>
            );
          })}
        </div>
      </Page>
    </>
  );
}
