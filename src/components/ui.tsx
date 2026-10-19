"use client";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import type { Tab, Tool } from "@/config/features";
import { ICONS } from "@/config/icons";
import { useLang, useT } from "@/lib/i18n";
import { EmptyTrail, Stamp } from "./art";

/** Page width and rhythm shared by every screen. */
export function Page({ children, wide = false }: { children: React.ReactNode; wide?: boolean }) {
  return <div className={`mx-auto w-full px-4 py-6 sm:px-8 sm:py-10 ${wide ? "max-w-6xl" : "max-w-4xl"}`}>{children}</div>;
}

export function SoonBadge({ className = "" }: { className?: string }) {
  const t = useT();
  return (
    <span className={`inline-block rounded-sm border border-line px-1.5 text-xs font-bold leading-5 text-muted ${className}`}>
      {t("comingSoon")}
    </span>
  );
}

/** A page for a feature that is planned but not built yet. Never blank, never broken. */
export function ComingSoon({ tool, tab }: { tool: Tool; tab: Tab }) {
  const t = useT();
  const lang = useLang();
  const Icon = ICONS[tool.icon];
  return (
    <Page>
      <Link href={`/t/${tab.id}`} className="mb-6 inline-flex items-center gap-1.5 font-bold text-teal underline-offset-4 hover:underline">
        <ArrowLeft size={18} strokeWidth={1.75} /> {t("backTo")} {tab.name[lang]}
      </Link>
      <div className="guide-card contours overflow-hidden p-6 sm:p-10">
        <div className="flex flex-col gap-8 sm:flex-row sm:items-center">
          <div className="min-w-0 flex-1">
            <Stamp tone="terracotta" className="mb-4">{t("comingSoon")}</Stamp>
            <h1 className="flex items-center gap-3 text-3xl sm:text-4xl">
              <Icon size={32} strokeWidth={1.75} className="shrink-0 text-teal" />
              {tool.name[lang]}
            </h1>
            <p className="mt-5 font-bold">{t("soonLead")}</p>
            <p className="mt-1 text-lg">{tool.desc[lang]}</p>
            {tool.local ? <p className="mt-4 text-muted">{t("worksOffline")}</p> : null}
          </div>
          <EmptyTrail className="mx-auto h-36 w-56 shrink-0 text-ink" />
        </div>
      </div>
    </Page>
  );
}

/** Contents-page row: name, one line, and a dotted leader to its status. */
export function IndexRow({ tool, href }: { tool: Tool; href: string }) {
  const lang = useLang();
  const t = useT();
  const Icon = ICONS[tool.icon];
  return (
    <Link href={href} className="group flex items-start gap-3 rounded-sm py-3 hover:bg-sunken sm:px-2">
      <Icon size={22} strokeWidth={1.75} className="mt-0.5 shrink-0 text-teal" />
      <span className="min-w-0 flex-1">
        <span className="flex items-baseline gap-2">
          <span className="font-bold group-hover:underline">{tool.name[lang]}</span>
          <span aria-hidden className="mb-1 min-w-4 flex-1 border-b-2 border-dotted border-line" />
          {tool.status === "built" ? (
            <span className="text-sm font-bold text-palm">{t("built")}</span>
          ) : (
            <span className="text-sm text-muted">{t("comingSoon")}</span>
          )}
        </span>
        <span className="mt-0.5 block text-[0.95rem] text-muted">{tool.desc[lang]}</span>
      </span>
    </Link>
  );
}

const btn = "inline-flex items-center justify-center gap-2 rounded-md border-[1.5px] border-ink px-5 py-2.5 font-bold disabled:cursor-not-allowed disabled:opacity-60";
export const buttonClass = {
  primary: `${btn} bg-ruby text-on-ruby shadow-[3px_3px_0_var(--c-ink)] active:translate-x-px active:translate-y-px active:shadow-[2px_2px_0_var(--c-ink)]`,
  secondary: `${btn} bg-teal text-on-teal`,
  quiet: `${btn} hover:bg-sunken`,
  danger: `${btn} bg-surface text-ruby`,
};

/** Label, input and help text, wired together for screen readers. */
export function Field({
  label, help, error, children,
}: { label: string; help?: string; error?: string | null; children: (props: { id: string; "aria-describedby"?: string; "aria-invalid"?: boolean }) => React.ReactNode }) {
  const id = `f-${label.replace(/\W+/g, "-").toLowerCase()}`;
  const note = error ? `${id}-err` : help ? `${id}-help` : undefined;
  return (
    <div className="mb-5">
      <label htmlFor={id} className="block font-bold">{label}</label>
      <div className="mt-1">{children({ id, "aria-describedby": note, "aria-invalid": error ? true : undefined })}</div>
      {error ? <p id={`${id}-err`} role="alert" className="mt-1 text-sm font-bold text-ruby">{error}</p>
        : help ? <p id={`${id}-help`} className="mt-1 text-sm text-muted">{help}</p> : null}
    </div>
  );
}
export const inputClass = "w-full rounded-md border-[1.5px] border-ink bg-surface px-3 py-2.5 text-lg placeholder:text-muted aria-[invalid=true]:border-ruby";

/** Ready tools first as a contents list. Tools that are not built yet fold away so the page stays clean. */
export function ToolList({ tools }: { tools: Tool[] }) {
  const t = useT();
  const ready = tools.filter((x) => x.status === "built");
  const soon = tools.filter((x) => x.status !== "built");
  return (
    <>
      {ready.length ? (
        <ul className="divide-y-2 divide-dotted divide-line">
          {ready.map((tool) => <li key={tool.key}><IndexRow tool={tool} href={`/t/${tool.key}`} /></li>)}
        </ul>
      ) : null}
      {soon.length ? (
        <details className="mt-2">
          <summary className="cursor-pointer py-2 font-bold text-muted hover:text-ink">{t("comingSoon")} ({soon.length})</summary>
          <ul className="divide-y-2 divide-dotted divide-line">
            {soon.map((tool) => <li key={tool.key}><IndexRow tool={tool} href={`/t/${tool.key}`} /></li>)}
          </ul>
        </details>
      ) : null}
    </>
  );
}
