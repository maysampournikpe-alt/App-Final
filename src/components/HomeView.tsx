"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowRight } from "lucide-react";
import { HUBS } from "@/config/features";
import { ICONS, type IconName } from "@/config/icons";
import { BRAND } from "@/config/brand";
import { useAccount } from "@/lib/account";
import { useLang, useT } from "@/lib/i18n";
import { useLocalDoc } from "@/lib/local-doc";
import { TrailHero } from "./art";
import { WHY_KEY } from "./tools/Why";
import { Page } from "./ui";

const QUICK: { href: string; icon: IconName; en: string; es: string; tone: string }[] = [
  { href: "/h/testprep", icon: "file-check", en: "Study for a test", es: "Estudiar para un examen", tone: "bg-marigold text-on-marigold" },
  { href: "/t/find/search", icon: "search", en: "Find a club or program", es: "Buscar un club o programa", tone: "bg-teal text-on-teal" },
  { href: "/t/coach/chat", icon: "message", en: "Ask the Coach", es: "Pregúntale al Coach", tone: "bg-ruby text-on-ruby" },
  { href: "/t/notes/flashcards", icon: "layers", en: "Make flashcards", es: "Hacer tarjetas", tone: "bg-surface text-ink" },
  { href: "/h/plan", icon: "route", en: "Plan my week", es: "Planear mi semana", tone: "bg-surface text-ink" },
  { href: "/h/career", icon: "graduation", en: "Explore college and careers", es: "Explorar universidad y carreras", tone: "bg-surface text-ink" },
];

export function HomeView() {
  const t = useT();
  const lang = useLang();
  const router = useRouter();
  const account = useAccount();
  const [q, setQ] = useState("");
  const [why] = useLocalDoc<string>(WHY_KEY, "");

  const go = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(`/t/find/search${q.trim() ? `?q=${encodeURIComponent(q.trim())}` : ""}`);
  };

  return (
    <>
      <section className="hero-blobs border-b-[1.5px] border-ink">
        <Page wide>
          <div className="grid items-center gap-8 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]">
            <div>
              <p className="text-lg font-extrabold text-terracotta">{BRAND.tagline[lang]}</p>
              <h1 className="mt-2 text-4xl sm:text-5xl lg:text-6xl">{t("homeAsk")}</h1>
              <form onSubmit={go} className="mt-7 flex max-w-xl flex-col gap-3 sm:flex-row">
                <label className="min-w-0 flex-1">
                  <span className="sr-only">{t("homeAsk")}</span>
                  <input
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    placeholder={t("homePlaceholder")}
                    className="w-full rounded-xl border-[1.5px] border-ink bg-surface px-4 py-3 text-lg placeholder:text-muted"
                  />
                </label>
                <button className="inline-flex items-center justify-center gap-2 rounded-xl border-[1.5px] border-ink bg-ruby px-6 py-3 text-lg font-bold text-on-ruby shadow-[3px_3px_0_var(--c-ink)] active:translate-x-px active:translate-y-px active:shadow-[2px_2px_0_var(--c-ink)]">
                  {t("homeSearch")} <ArrowRight size={20} strokeWidth={2} />
                </button>
              </form>
              {why.trim() ? (
                <blockquote className="mt-5 max-w-xl border-l-[6px] border-teal pl-4 font-display text-xl">
                  <Link href="/t/profile/why" className="hover:underline">“{why.trim().slice(0, 200)}”</Link>
                </blockquote>
              ) : null}
              {account.status === "signed-in" ? (
                <p className="mt-4 text-muted">{t("welcomeBack")} <b className="font-mono text-ink">{account.profile.username}</b></p>
              ) : account.status === "guest" ? (
                <p className="mt-4 max-w-md text-muted">
                  {t("guestNote")}{" "}
                  <Link href="/t/settings/account" className="font-bold text-teal underline underline-offset-4">{t("guestCta")}</Link>
                </p>
              ) : null}
            </div>
            <TrailHero className="mx-auto hidden w-full max-w-md text-ink lg:block" />
          </div>
        </Page>
      </section>

      <Page wide>
        <h2 className="text-2xl sm:text-3xl">{lang === "es" ? "Empieza aquí" : "Start here"}</h2>
        <ul className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
          {QUICK.map(({ href, icon, en, es, tone }) => {
            const Icon = ICONS[icon];
            return (
              <li key={href}>
                <Link href={href} className={`flex h-full min-h-28 flex-col justify-between rounded-2xl border-[1.5px] border-ink p-4 shadow-[3px_3px_0_var(--c-ink)] transition-transform hover:-translate-y-0.5 ${tone}`}>
                  <Icon size={26} strokeWidth={2} aria-hidden />
                  <span className="mt-3 block text-lg font-extrabold leading-tight">{lang === "es" ? es : en}</span>
                </Link>
              </li>
            );
          })}
        </ul>

        <h2 className="mt-12 text-2xl sm:text-3xl">{lang === "es" ? "Todo lo que hay" : "Everything in Rumbo"}</h2>
        <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {HUBS.map((hub) => {
            const Icon = ICONS[hub.icon];
            return (
              <li key={hub.id}>
                <Link href={`/h/${hub.id}`} className="guide-card flex h-full items-start gap-3 p-4 hover:-translate-y-0.5">
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-sunken text-teal"><Icon size={24} strokeWidth={2} aria-hidden /></span>
                  <span className="min-w-0"><span className="block text-lg font-extrabold">{hub.name[lang]}</span><span className="block text-sm text-muted">{hub.blurb[lang]}</span></span>
                </Link>
              </li>
            );
          })}
        </ul>
      </Page>
    </>
  );
}
