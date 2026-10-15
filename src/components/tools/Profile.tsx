"use client";
import { useState } from "react";
import { INTERESTS, INTEREST_MAX, INTEREST_MIN } from "@/config/interests";
import { useLang, useT } from "@/lib/i18n";
import { useProfile } from "@/lib/profile";
import { buttonClass, Field, inputClass, Page } from "../ui";

const MOODS: { key: "mood_build" | "mood_help" | "mood_create" | "mood_compete" | "mood_figure"; picks: string[] }[] = [
  { key: "mood_build", picks: ["robotics", "engineering", "cars", "trades", "coding"] },
  { key: "mood_help", picks: ["volunteering", "nursing", "animals", "teaching", "medicine"] },
  { key: "mood_create", picks: ["art", "music", "dance", "theater", "film"] },
  { key: "mood_compete", picks: ["chess", "soccer", "basketball", "gaming", "debate"] },
  { key: "mood_figure", picks: ["writing", "history", "science", "math", "law"] },
];

/** Bubbles to tap. 3 to 10, plus anything the student wants to add. */
export function InterestPicker({ onDone, allowSkip = false }: { onDone?: () => void; allowSkip?: boolean }) {
  const t = useT();
  const lang = useLang();
  const [profile, save] = useProfile();
  const [custom, setCustom] = useState("");
  const [quiz, setQuiz] = useState(false);
  const chosen = profile.interests;
  const known = new Set(INTERESTS.map((i) => i.id));
  const extra = chosen.filter((c) => !known.has(c));
  const full = chosen.length >= INTEREST_MAX;

  const toggle = (id: string) => {
    if (chosen.includes(id)) save({ ...profile, interests: chosen.filter((c) => c !== id) });
    else if (!full) save({ ...profile, interests: [...chosen, id] });
  };
  const addCustom = (e: React.FormEvent) => {
    e.preventDefault();
    const v = custom.trim().slice(0, 40);
    if (v && !full && !chosen.some((c) => c.toLowerCase() === v.toLowerCase())) save({ ...profile, interests: [...chosen, v] });
    setCustom("");
  };
  const addMood = (picks: string[]) => {
    const next = [...chosen];
    for (const p of picks) if (next.length < INTEREST_MAX && !next.includes(p)) next.push(p);
    save({ ...profile, interests: next });
  };

  return (
    <div>
      <p className="max-w-prose text-lg">{t("interestsLead")}</p>
      <p className="mt-2 font-bold" aria-live="polite">
        {chosen.length} / {INTEREST_MAX}{full ? ` · ${t("interestsMax")}` : ""}
      </p>

      <ul className="mt-4 flex flex-wrap gap-2">
        {INTERESTS.map((i) => {
          const on = chosen.includes(i.id);
          return (
            <li key={i.id}>
              <button onClick={() => toggle(i.id)} aria-pressed={on} disabled={!on && full}
                className={`rounded-full border-[1.5px] border-ink px-4 py-2 font-bold disabled:opacity-45 ${on ? "bg-teal text-on-teal" : "bg-surface hover:bg-sunken"}`}>
                {i.name[lang]}
              </button>
            </li>
          );
        })}
        {extra.map((c) => (
          <li key={c}>
            <button onClick={() => toggle(c)} aria-pressed className="rounded-full border-[1.5px] border-ink bg-marigold px-4 py-2 font-bold text-on-marigold">{c}</button>
          </li>
        ))}
      </ul>

      <form onSubmit={addCustom} className="mt-5 flex max-w-md gap-2">
        <label className="min-w-0 flex-1">
          <span className="sr-only">{t("addOwn")}</span>
          <input value={custom} onChange={(e) => setCustom(e.target.value)} placeholder={t("addOwn")} maxLength={40} className={inputClass} />
        </label>
        <button disabled={!custom.trim() || full} className={buttonClass.quiet}>{t("add")}</button>
      </form>

      <div className="mt-6">
        <button onClick={() => setQuiz((q) => !q)} aria-expanded={quiz} className="font-bold text-teal underline underline-offset-4">{t("notSure")}</button>
        {quiz ? (
          <div className="guide-card mt-3 max-w-xl p-4">
            <p className="mb-3">{t("notSureLead")}</p>
            <ul className="flex flex-wrap gap-2">
              {MOODS.map((m) => (
                <li key={m.key}><button onClick={() => addMood(m.picks)} className="rounded-md border-[1.5px] border-ink bg-surface px-3 py-2 font-bold hover:bg-sunken">{t(m.key)}</button></li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>

      {onDone ? (
        <div className="mt-8 flex flex-wrap items-center gap-4">
          <button disabled={chosen.length < INTEREST_MIN} onClick={onDone} className={buttonClass.primary}>{t("continue")}</button>
          {chosen.length < INTEREST_MIN ? <span className="text-muted">{t("interestsMin")}</span> : null}
          {allowSkip ? <button onClick={onDone} className="font-bold text-teal underline underline-offset-4">{t("skip")}</button> : null}
        </div>
      ) : null}
    </div>
  );
}

export function InterestsTool() {
  const t = useT();
  return (
    <Page>
      <h1 className="mb-6 text-3xl sm:text-4xl">{t("interestsTitle")}</h1>
      <InterestPicker />
    </Page>
  );
}

export function ProfileTool() {
  const t = useT();
  const [profile, save] = useProfile();
  const [school, setSchool] = useState(profile.school);
  const [justSaved, setJustSaved] = useState(false);
  return (
    <Page>
      <h1 className="mb-2 text-3xl sm:text-4xl">{t("profileTitle")}</h1>
      <p className="mb-6 max-w-prose text-muted">{t("profileNote")}</p>
      <form className="max-w-xl" onSubmit={(e) => { e.preventDefault(); save({ ...profile, school: school.trim() }); setJustSaved(true); }}>
        <Field label={t("gradeLabel")}>
          {(p) => (
            <select id={p.id} value={profile.grade ?? ""} onChange={(e) => save({ ...profile, grade: e.target.value ? Number(e.target.value) : null })} className={inputClass}>
              <option value="">{t("gradeNone")}</option>
              {[5, 6, 7, 8, 9, 10, 11, 12].map((g) => <option key={g} value={g}>{t("gradeN")} {g}</option>)}
            </select>
          )}
        </Field>
        <Field label={t("schoolLabel")}>
          {(p) => <input {...p} value={school} maxLength={80} onChange={(e) => { setSchool(e.target.value); setJustSaved(false); }} className={inputClass} />}
        </Field>
        <button className={buttonClass.primary}>{t("save")}</button>
        <span role="status" className="ml-3 font-bold text-palm">{justSaved ? t("saved") : ""}</span>
      </form>
      <h2 className="mb-4 mt-12 text-2xl">{t("interestsTitle")}</h2>
      <InterestPicker />
    </Page>
  );
}
