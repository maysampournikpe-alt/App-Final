"use client";
import { LANGS, useT } from "@/lib/i18n";
import { DEFAULT_PREFS, setPrefs, usePrefs, type Prefs } from "@/lib/prefs";
import { Page } from "../ui";

function Choice<T extends string>({
  legend, value, options, onChange,
}: { legend: string; value: T; options: { value: T; label: string }[]; onChange: (v: T) => void }) {
  return (
    <fieldset className="border-t-2 border-dotted border-line py-5">
      <legend className="float-left mb-3 w-full font-display text-xl font-semibold">{legend}</legend>
      <div className="clear-both flex flex-wrap gap-2">
        {options.map((o) => (
          <label key={o.value} className="cursor-pointer">
            <input type="radio" name={legend} value={o.value} checked={value === o.value} onChange={() => onChange(o.value)} className="peer sr-only" />
            <span className="inline-block rounded-md border-[1.5px] border-ink bg-surface px-4 py-2 font-bold peer-checked:bg-ink peer-checked:text-paper peer-focus-visible:outline peer-focus-visible:outline-[3px] peer-focus-visible:outline-offset-2 peer-focus-visible:outline-[var(--c-focus)]">
              {o.label}
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

function Switch({ label, help, checked, onChange }: { label: string; help: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex cursor-pointer items-start gap-4 border-t-2 border-dotted border-line py-5">
      <span className="min-w-0 flex-1">
        <span className="block font-display text-xl font-semibold">{label}</span>
        <span className="mt-0.5 block text-muted">{help}</span>
      </span>
      <input type="checkbox" role="switch" checked={checked} onChange={(e) => onChange(e.target.checked)} className="peer sr-only" />
      <span aria-hidden className="relative mt-1 h-7 w-12 shrink-0 rounded-full border-[1.5px] border-ink bg-sunken after:absolute after:left-0.5 after:top-0.5 after:h-5 after:w-5 after:rounded-full after:bg-ink after:transition-transform peer-checked:bg-teal peer-checked:after:translate-x-5 peer-checked:after:bg-on-teal peer-focus-visible:outline peer-focus-visible:outline-[3px] peer-focus-visible:outline-offset-2 peer-focus-visible:outline-[var(--c-focus)]" />
    </label>
  );
}

export function LanguageSettings() {
  const t = useT();
  const { lang } = usePrefs();
  return (
    <Page>
      <h1 className="text-3xl sm:text-4xl">{t("language")}</h1>
      <div className="mt-6">
        <Choice legend={t("language")} value={lang} options={LANGS.map((l) => ({ value: l.code, label: l.label }))} onChange={(v) => setPrefs({ lang: v })} />
      </div>
    </Page>
  );
}

export function AppearanceSettings() {
  const t = useT();
  const p = usePrefs();
  return (
    <Page>
      <h1 className="text-3xl sm:text-4xl">{t("appearance")}</h1>
      <div className="mt-6">
        <Choice
          legend={t("theme")} value={p.theme}
          options={[
            { value: "system", label: t("themeSystem") },
            { value: "light", label: t("themeLight") },
            { value: "dark", label: t("themeDark") },
          ]}
          onChange={(v) => setPrefs({ theme: v })}
        />
        <Choice
          legend={t("textSize")} value={p.text}
          options={[
            { value: "normal", label: t("textNormal") },
            { value: "large", label: t("textLarge") },
            { value: "xlarge", label: t("textXLarge") },
          ]}
          onChange={(v) => setPrefs({ text: v })}
        />
        <Switch label={t("dyslexia")} help={t("dyslexiaHelp")} checked={p.dyslexia} onChange={(v) => setPrefs({ dyslexia: v })} />
        <Switch label={t("lowData")} help={t("lowDataHelp")} checked={p.lowData} onChange={(v) => setPrefs({ lowData: v })} />
        <Switch label={t("motion")} help={t("motionHelp")} checked={p.motion === "reduce"} onChange={(v) => setPrefs({ motion: v ? "reduce" : "system" })} />
        <div className="border-t-2 border-dotted border-line pt-5">
          <button
            onClick={() => setPrefs({ theme: DEFAULT_PREFS.theme, text: DEFAULT_PREFS.text, dyslexia: false, lowData: false, motion: "system" } satisfies Partial<Prefs>)}
            className="rounded-md border-[1.5px] border-ink px-4 py-2 font-bold hover:bg-sunken"
          >
            {t("resetPrefs")}
          </button>
        </div>
      </div>
    </Page>
  );
}
