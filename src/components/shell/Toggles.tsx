"use client";
import { Moon, Sun } from "lucide-react";
import { LANGS, useT } from "@/lib/i18n";
import { setPrefs, usePrefs } from "@/lib/prefs";

/** On every page, in the header. */
export function LangToggle() {
  const { lang } = usePrefs();
  const t = useT();
  return (
    <div role="group" aria-label={t("language")} className="flex overflow-hidden rounded-md border-[1.5px] border-ink">
      {LANGS.map((l) => (
        <button
          key={l.code}
          onClick={() => setPrefs({ lang: l.code })}
          aria-pressed={lang === l.code}
          lang={l.code}
          title={l.label}
          className={`px-2.5 py-1 text-sm font-bold ${lang === l.code ? "bg-ink text-paper" : "bg-surface text-ink hover:bg-sunken"}`}
        >
          {l.short}
        </button>
      ))}
    </div>
  );
}

export function ThemeToggle() {
  const { theme } = usePrefs();
  const t = useT();
  // Cycles system → day → night. The icon shows what you are switching to.
  const next = theme === "system" ? "light" : theme === "light" ? "dark" : "system";
  return (
    <button
      onClick={() => setPrefs({ theme: next })}
      aria-label={`${t("switchTheme")} (${theme === "system" ? t("themeSystem") : theme === "light" ? t("themeLight") : t("themeDark")})`}
      title={t("switchTheme")}
      className="grid h-9 w-9 place-items-center rounded-md border-[1.5px] border-ink bg-surface text-ink hover:bg-sunken"
    >
      <Moon size={18} strokeWidth={1.75} className="theme-moon" />
      <Sun size={18} strokeWidth={1.75} className="theme-sun" />
    </button>
  );
}
