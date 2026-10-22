"use client";
// Small pieces the many guide and helper tools share, so they look and behave the same.
import Link from "next/link";
import { ExternalLink } from "lucide-react";
import type { Lang } from "@/config/features";
import { EmptyTrail } from "../art";
import { Page } from "../ui";

export type L = { en: string; es: string };
export const pick = (x: L, lang: Lang) => x[lang];

export function Head({ title, lead, wide = false, children }: { title: string; lead?: string; wide?: boolean; children?: React.ReactNode }) {
  return (
    <Page wide={wide}>
      <h1 className="text-3xl sm:text-4xl">{title}</h1>
      {lead ? <p className="mt-2 max-w-prose text-muted">{lead}</p> : null}
      {children}
    </Page>
  );
}

/** A link to another website. Opens in a new tab and says so for screen readers. */
export function Ext({ href, children, className = "" }: { href: string; children: React.ReactNode; className?: string }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className={`inline-flex items-center gap-1 font-bold text-teal underline underline-offset-4 ${className}`}>
      {children}<ExternalLink size={14} aria-hidden /><span className="sr-only"> (opens in a new tab)</span>
    </a>
  );
}

export function Callout({ children, tone = "note" }: { children: React.ReactNode; tone?: "note" | "warn" }) {
  return <div role="note" className={`guide-card mt-4 border-l-[6px] p-4 ${tone === "warn" ? "border-l-ruby" : "border-l-marigold"}`}>{children}</div>;
}

export function Chips<T extends string>({ value, onChange, options, label }: { value: T; onChange: (v: T) => void; options: { id: T; label: string }[]; label: string }) {
  return (
    <div className="flex flex-wrap gap-2" role="group" aria-label={label}>
      {options.map((o) => <button key={o.id || "all"} onClick={() => onChange(o.id)} aria-pressed={value === o.id}
        className={`rounded-full border-[1.5px] border-ink px-4 py-1.5 font-bold ${value === o.id ? "bg-ink text-paper" : "bg-surface hover:bg-sunken"}`}>{o.label}</button>)}
    </div>
  );
}

export function Empty({ children }: { children: React.ReactNode }) {
  return <div className="guide-card mt-6 flex max-w-xl items-center gap-5 p-5"><EmptyTrail className="hidden h-20 w-32 shrink-0 text-ink sm:block" /><div className="min-w-0 text-lg">{children}</div></div>;
}

export const searchLink = (q: string) => `/t/find/search?q=${encodeURIComponent(q)}`;
export const FindLink = ({ q, children }: { q: string; children: React.ReactNode }) => <Link href={searchLink(q)} className="font-bold text-teal underline underline-offset-4">{children}</Link>;
export const webSearch = (q: string) => `https://www.google.com/search?q=${encodeURIComponent(q)}`;
export const youtubeSearch = (q: string) => `https://www.youtube.com/results?search_query=${encodeURIComponent(q)}`;
export const spotifySearch = (q: string) => `https://open.spotify.com/search/${encodeURIComponent(q)}`;
