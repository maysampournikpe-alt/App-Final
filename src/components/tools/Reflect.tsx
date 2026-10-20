"use client";
import { today, formatDay } from "@/lib/dates";
import { useLocalDoc } from "@/lib/local-doc";
import { FIELDS, isFilled, journalPromptIndex, NO_REFLECTIONS, pastKeys, periodKey, REFLECT_KEY, type Entry, type ReflectKind, type Reflections } from "@/lib/reflect";
import { useCopy } from "@/lib/use-copy";
import { useLang } from "@/lib/i18n";
import { inputClass, Page } from "../ui";

const copy = {
  en: {
    weekly: { title: "Weekly review", lead: "Every Sunday, look back at your week and plan the next one. Five minutes is enough.", period: "This week" },
    monthly: { title: "Monthly reflection", lead: "What worked, what did not, and what to change next month.", period: "This month" },
    journal: { title: "Goal journal", lead: "One short prompt each week. Write a few sentences about your goals.", period: "This week" },
    q: {
      wins: ["What went well this week?", "List up to three wins, big or small."], hard: ["What got in the way?", "Be honest. No one else reads this."], next: ["Top 3 things for next week", "One per line."],
      worked: ["What worked this month?", "Habits, plans or people that helped."], didnt: ["What did not work?", "Where did you get stuck?"], change: ["What will you change next month?", "Pick one or two things."], proud: ["One moment you are proud of", "It can be small."],
      entry: ["Your entry", "Write a few sentences."],
    } as Record<string, [string, string]>,
    prompts: ["What is one goal you are working toward, and why does it matter to you?", "What is something hard you did recently? How did you get through it?", "Who could help you with your goal this month? What could you ask them?", "What is one small step you can take tomorrow?", "What would you try if you knew you could not fail?", "What is a habit you want to start, and what will you do right after it?", "What did you learn this week that you want to remember?", "What does a good week look like for you? What would you need to do to make one?"],
    rating: "How was your week?", rateNames: ["Rough", "Meh", "Okay", "Good", "Great"], saved: "Saved on this device as you type.", past: "Earlier entries", none: "Nothing saved yet.", weekOf: (d: string) => `Week of ${d}`,
  },
  es: {
    weekly: { title: "Revisión semanal", lead: "Cada domingo, mira hacia atrás y planea la semana que viene. Cinco minutos bastan.", period: "Esta semana" },
    monthly: { title: "Reflexión del mes", lead: "Lo que funcionó, lo que no, y qué cambiar el mes que viene.", period: "Este mes" },
    journal: { title: "Diario de metas", lead: "Una pregunta corta cada semana. Escribe unas frases sobre tus metas.", period: "Esta semana" },
    q: {
      wins: ["¿Qué salió bien esta semana?", "Anota hasta tres logros, grandes o pequeños."], hard: ["¿Qué te estorbó?", "Sé sincero. Nadie más lee esto."], next: ["Las 3 cosas principales de la próxima semana", "Una por línea."],
      worked: ["¿Qué funcionó este mes?", "Hábitos, planes o personas que ayudaron."], didnt: ["¿Qué no funcionó?", "¿Dónde te atoraste?"], change: ["¿Qué vas a cambiar el mes que viene?", "Elige una o dos cosas."], proud: ["Un momento del que estás orgulloso", "Puede ser pequeño."],
      entry: ["Tu entrada", "Escribe unas frases."],
    } as Record<string, [string, string]>,
    prompts: ["¿Cuál es una meta por la que trabajas, y por qué te importa?", "¿Qué cosa difícil hiciste hace poco? ¿Cómo la lograste?", "¿Quién podría ayudarte con tu meta este mes? ¿Qué le podrías pedir?", "¿Cuál es un paso pequeño que puedes dar mañana?", "¿Qué intentarías si supieras que no puedes fallar?", "¿Qué hábito quieres empezar, y qué harás justo después?", "¿Qué aprendiste esta semana que quieres recordar?", "¿Cómo es una buena semana para ti? ¿Qué necesitarías hacer para tener una?"],
    rating: "¿Cómo estuvo tu semana?", rateNames: ["Difícil", "Así así", "Normal", "Buena", "Excelente"], saved: "Se guarda en este dispositivo mientras escribes.", past: "Entradas anteriores", none: "Todavía no hay nada guardado.", weekOf: (d: string) => `Semana del ${d}`,
  },
};

export function ReflectTool({ kind }: { kind: ReflectKind }) {
  const c = useCopy(copy);
  const lang = useLang();
  const [all, setAll] = useLocalDoc<Reflections>(REFLECT_KEY, NO_REFLECTIONS);
  const now = today();
  const key = periodKey(kind, now);
  const entry: Entry = all[key] ?? { answers: {}, updated: 0 };
  const save = (patch: Partial<Entry>, field?: [string, string]) =>
    setAll((p) => { const cur = p[key] ?? { answers: {}, updated: 0 }; return { ...p, [key]: { ...cur, ...patch, answers: field ? { ...cur.answers, [field[0]]: field[1] } : cur.answers, updated: Date.now() } }; });
  const past = pastKeys(all, kind, key);
  const label = (k: string) => (kind === "monthly" ? k.split(":")[1] : c.weekOf(formatDay(k.split(":")[1], lang, false)));
  const [title, lead] = [c[kind].title, c[kind].lead];

  return (
    <Page>
      <h1 className="text-3xl sm:text-4xl">{title}</h1>
      <p className="mt-2 max-w-prose text-muted">{lead}</p>
      <section className="guide-card mt-6 p-5" aria-label={c[kind].period}>
        <h2 className="text-xl text-terracotta">{c[kind].period}</h2>
        {kind === "journal" ? <p className="mt-2 font-display text-xl font-semibold">{c.prompts[journalPromptIndex(now)]}</p> : null}
        {FIELDS[kind].map((f) => (
          <label key={f} className="mt-4 block">
            {kind === "journal" ? <span className="sr-only">{c.q[f][0]}</span> : <><span className="block font-bold">{c.q[f][0]}</span><span className="block text-sm text-muted">{c.q[f][1]}</span></>}
            <textarea value={entry.answers[f] ?? ""} onChange={(e) => save({}, [f, e.target.value])} rows={kind === "journal" ? 7 : 3} maxLength={2000} className={`${inputClass} mt-1`} />
          </label>
        ))}
        {kind === "weekly" ? (
          <fieldset className="mt-4"><legend className="font-bold">{c.rating}</legend>
            <div className="mt-1 flex flex-wrap gap-2">{[1, 2, 3, 4, 5].map((n) => (
              <button key={n} type="button" onClick={() => save({ rating: entry.rating === n ? undefined : n })} aria-pressed={entry.rating === n}
                className={`rounded-full border-[1.5px] border-ink px-3 py-1 font-bold ${entry.rating === n ? "bg-ink text-paper" : "bg-surface hover:bg-sunken"}`}>{n} · {c.rateNames[n - 1]}</button>))}</div>
          </fieldset>
        ) : null}
        <p className="mt-4 text-sm text-muted" role="status">{c.saved}</p>
      </section>
      <h2 className="mt-8 border-b-[1.5px] border-ink pb-1 text-2xl">{c.past}</h2>
      {past.length === 0 ? <p className="mt-3 text-muted">{c.none}</p> : (
        <div className="mt-2 divide-y-2 divide-dotted divide-line">
          {past.map((k) => (
            <details key={k} className="py-2"><summary className="cursor-pointer font-bold">{label(k)}{isFilled(all[k]) && all[k].rating ? ` · ${all[k].rating}/5` : ""}</summary>
              <dl className="mt-2 space-y-2">{FIELDS[kind].filter((f) => all[k].answers[f]?.trim()).map((f) => (
                <div key={f}><dt className="text-sm font-bold text-muted">{kind === "journal" ? "" : c.q[f][0]}</dt><dd className="whitespace-pre-wrap">{all[k].answers[f]}</dd></div>))}</dl>
            </details>
          ))}
        </div>
      )}
    </Page>
  );
}
