"use client";
import type { Group, Tab } from "@/config/features";
import { ICONS } from "@/config/icons";
import { useLang } from "@/lib/i18n";
import { IndexRow, Page } from "./ui";

export function TabView({ tab, group }: { tab: Tab; group: Group }) {
  const lang = useLang();
  const Icon = ICONS[tab.icon];
  return (
    <>
      <div className="contours border-b-[1.5px] border-ink">
        <Page>
          <p className="font-display text-terracotta">{group.name[lang]}</p>
          <h1 className="mt-1 flex items-center gap-3 text-4xl sm:text-5xl">
            <Icon size={38} strokeWidth={1.75} className="shrink-0 text-teal" />
            {tab.name[lang]}
          </h1>
        </Page>
      </div>
      <Page>
        <ul className="divide-y-2 divide-dotted divide-line">
          {tab.tools.map((tool) => (
            <li key={tool.key}>
              <IndexRow tool={tool} href={`/t/${tool.key}`} />
            </li>
          ))}
        </ul>
      </Page>
    </>
  );
}
