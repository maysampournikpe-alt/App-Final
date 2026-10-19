"use client";
import Link from "next/link";
import type { Group, Tab } from "@/config/features";
import { hubOfTab } from "@/config/features";
import { ICONS } from "@/config/icons";
import { useLang } from "@/lib/i18n";
import { Page, ToolList } from "./ui";

export function TabView({ tab }: { tab: Tab; group: Group }) {
  const lang = useLang();
  const Icon = ICONS[tab.icon];
  const hub = hubOfTab(tab.id);
  return (
    <>
      <div className="contours border-b-[1.5px] border-ink">
        <Page>
          {hub ? <Link href={`/h/${hub.id}`} className="font-display text-terracotta underline-offset-4 hover:underline">{hub.name[lang]}</Link> : null}
          <h1 className="mt-1 flex items-center gap-3 text-4xl sm:text-5xl">
            <Icon size={38} strokeWidth={1.75} className="shrink-0 text-teal" />
            {tab.name[lang]}
          </h1>
        </Page>
      </div>
      <Page><ToolList tools={tab.tools} /></Page>
    </>
  );
}
