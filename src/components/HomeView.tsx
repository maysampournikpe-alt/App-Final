"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowRight } from "lucide-react";
import { GROUPS } from "@/config/features";
import { ICONS } from "@/config/icons";
import { BRAND } from "@/config/brand";
import { useAccount } from "@/lib/account";
import { useLang, useT } from "@/lib/i18n";
import { TrailHero } from "./art";
import { Page } from "./ui";

export function HomeView() {
  const t = useT();
  const lang = useLang();
  const router = useRouter();
  const account = useAccount();
  const [q, setQ] = useState("");

  const go = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(`/t/find/search${q.trim() ? `?q=${encodeURIComponent(q.trim())}` : ""}`);
  };

  return (
    <>
      <section className="contours border-b-[1.5px] border-ink">
        <Page wide>
          <div className="grid items-center gap-8 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]">
            <div>
              <p className="font-display text-lg text-terracotta">{BRAND.tagline[lang]}</p>
              <h1 className="mt-2 text-4xl sm:text-5xl lg:text-6xl">{t("homeAsk")}</h1>
              <form onSubmit={go} className="mt-7 flex max-w-xl flex-col gap-3 sm:flex-row">
                <label className="min-w-0 flex-1">
                  <span className="sr-only">{t("homeAsk")}</span>
                  <input
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    placeholder={t("homePlaceholder")}
                    className="w-full rounded-md border-[1.5px] border-ink bg-surface px-4 py-3 text-lg placeholder:text-muted"
                  />
                </label>
                <button className="inline-flex items-center justify-center gap-2 rounded-md border-[1.5px] border-ink bg-ruby px-6 py-3 text-lg font-bold text-on-ruby shadow-[3px_3px_0_var(--c-ink)] active:translate-x-px active:translate-y-px active:shadow-[2px_2px_0_var(--c-ink)]">
                  {t("homeSearch")} <ArrowRight size={20} strokeWidth={2} />
                </button>
              </form>
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
        <h2 className="text-2xl sm:text-3xl">{t("homeTry")}</h2>
        <p className="mt-1 text-muted">{t("homeShortcuts")}</p>
        <div className="mt-6 grid gap-x-10 gap-y-8 md:grid-cols-2 xl:grid-cols-3">
          {GROUPS.map((g) => (
            <section key={g.id}>
              <h3 className="border-b-[1.5px] border-ink pb-1 text-xl">{g.name[lang]}</h3>
              <ul>
                {g.tabs.map((tab) => {
                  const Icon = ICONS[tab.icon];
                  const ready = tab.tools.filter((x) => x.status === "built").length;
                  return (
                    <li key={tab.id}>
                      <Link href={`/t/${tab.id}`} className="flex items-center gap-3 py-2.5 hover:bg-sunken sm:px-2">
                        <Icon size={20} strokeWidth={1.75} className="shrink-0 text-teal" />
                        <span className="font-bold">{tab.name[lang]}</span>
                        <span aria-hidden className="mb-1 min-w-4 flex-1 self-end border-b-2 border-dotted border-line" />
                        <span className={`text-sm ${ready ? "font-bold text-palm" : "text-muted"}`}>
                          {ready ? `${ready}/${tab.tools.length}` : tab.tools.length}
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </section>
          ))}
        </div>
      </Page>
    </>
  );
}
