"use client";
import Link from "next/link";
import { Flame, Lock } from "lucide-react";
import { ACH_KEY, CERTS_KEY, MOOD_KEY, NO_ACH, NO_CERTS, NO_MOODS, NO_SLEEP, NO_VOLUNTEER, SLEEP_KEY, VOLUNTEER_KEY, type Achievement, type Certificate, type Mood, type Sleep, type VolunteerEntry } from "@/lib/career";
import { addDays, today } from "@/lib/dates";
import { DRILL_KEY, NO_SCORES, type DrillScore } from "@/lib/drills";
import type { Attempt } from "@/lib/exam/types";
import { HABITS_KEY, NO_HABITS, type Habit } from "@/lib/habits";
import { HOMEWORK_KEY, NO_ASSIGNMENTS, type Assignment } from "@/lib/homework";
import { useLang } from "@/lib/i18n";
import { useLocalDoc } from "@/lib/local-doc";
import { NO_PLANS, PLANS_KEY, type Plan } from "@/lib/plan";
import { AVATAR_KEY, BADGES, DEFAULT_AVATAR, EMBLEMS, levelName, levelOf, TINTS, totalXp, usableAvatar, xpBreakdown, streaks, activeDays, levelStart, type AvatarChoice, type Snapshot } from "@/lib/progress";
import { NO_REFLECTIONS, REFLECT_KEY, type Reflections } from "@/lib/reflect";
import { NO_ROUTINES, ROUTINES_KEY, type RoutineDoc } from "@/lib/routines";
import type { SavedListing } from "@/lib/saved";
import { FLASHCARDS_KEY, NO_CARDS, type Card } from "@/lib/srs";
import { NO_SESSIONS, SESSIONS_KEY, type Session } from "@/lib/study";
import { NO_TASKS, TASKS_KEY, type Task } from "@/lib/tasks";
import { useCopy } from "@/lib/use-copy";
import { ICONS } from "@/config/icons";
import { Patch } from "../art";
import { Page } from "../ui";

const NO_ATTEMPTS: Attempt[] = [], NO_SAVED: SavedListing[] = [], NO_LOG: Record<string, number> = {};

/** Everything the progress tools read, taken from what the other tools already saved. */
export function useSnapshot(): Snapshot {
  const [homework] = useLocalDoc<Assignment[]>(HOMEWORK_KEY, NO_ASSIGNMENTS);
  const [tasks] = useLocalDoc<Task[]>(TASKS_KEY, NO_TASKS);
  const [habits] = useLocalDoc<Habit[]>(HABITS_KEY, NO_HABITS);
  const [focusLog] = useLocalDoc<Record<string, number>>("focus-log", NO_LOG);
  const [sessions] = useLocalDoc<Session[]>(SESSIONS_KEY, NO_SESSIONS);
  const [routines] = useLocalDoc<RoutineDoc>(ROUTINES_KEY, NO_ROUTINES);
  const [attempts] = useLocalDoc<Attempt[]>("exam-attempts", NO_ATTEMPTS);
  const [plans] = useLocalDoc<Plan[]>(PLANS_KEY, NO_PLANS);
  const [saved] = useLocalDoc<SavedListing[]>("saved-opportunities", NO_SAVED);
  const [volunteer] = useLocalDoc<VolunteerEntry[]>(VOLUNTEER_KEY, NO_VOLUNTEER);
  const [achievements] = useLocalDoc<Achievement[]>(ACH_KEY, NO_ACH);
  const [certs] = useLocalDoc<Certificate[]>(CERTS_KEY, NO_CERTS);
  const [moods] = useLocalDoc<Mood[]>(MOOD_KEY, NO_MOODS);
  const [sleep] = useLocalDoc<Sleep[]>(SLEEP_KEY, NO_SLEEP);
  const [reflections] = useLocalDoc<Reflections>(REFLECT_KEY, NO_REFLECTIONS);
  const [cards] = useLocalDoc<Card[]>(FLASHCARDS_KEY, NO_CARDS);
  const [drills] = useLocalDoc<DrillScore[]>(DRILL_KEY, NO_SCORES);
  return { now: today(), homework, tasks, habits, focusLog, sessions, routines, attempts, plans, savedCount: saved.length, volunteer, achievements, certs, moods, sleep, reflections, cards, drills };
}

export function AvatarBadge({ choice, size = 64 }: { choice: AvatarChoice; size?: number }) {
  const e = EMBLEMS.find((x) => x.id === choice.emblem) ?? EMBLEMS[0], t = TINTS.find((x) => x.id === choice.tint) ?? TINTS[0];
  const Icon = ICONS[e.icon];
  return <span className={`inline-grid shrink-0 place-items-center rounded-full border-[1.5px] border-ink ${t.var}`} style={{ width: size, height: size }} aria-hidden><Icon size={size * 0.5} strokeWidth={1.75} /></span>;
}

const copy = {
  en: {
    progTitle: "Progress dashboard", progLead: "What you have done so far, all in one place. It fills in as you use the other tools.", level: (n: number, name: string) => `Level ${n} · ${name}`, xp: (n: number) => `${n} XP`, toNext: (n: number, l: number) => `${n} XP to level ${l}`,
    streakLine: (n: number) => (n === 1 ? "1 day in a row" : `${n} days in a row`), stats: "Your numbers", badgesTitle: "Badges you have earned", noBadges: "No badges yet. Open Badges to see how to earn the first one.", seeAll: "See all badges",
    s: { saved: "Opportunities saved", volunteer: "Volunteer hours", planSteps: "Plan steps done", homework: "Homework finished", study: "Hours studied", tests: "Practice tests", cards: "Flashcards reviewed", achievements: "Accomplishments logged" } as Record<string, string>,
    streaksTitle: "Streaks", streaksLead: "Days in a row you showed up. Missing a day starts over, so one small thing a day is enough.", current: "Current streak", best: "Best streak", active: "Active days", last35: "Last 5 weeks", doneDay: "Active", quietDay: "No activity",
    counts: "What counts as showing up", countList: ["Checking off a habit or a routine step", "A focus timer session or a logged study session", "A mood or sleep check-in", "Volunteer hours", "Finishing a practice test or a math drill"], noStreak: "Do one small thing today to start a streak.",
    lvTitle: "Levels and XP", lvLead: "You earn XP for things you really do. Every line below is added up from your own tools.", total: "Total XP", earned: "Where your XP came from", howEarn: "Ways to earn more", ladder: "The trail ahead", unlocks: "Unlocks", at: (xp: number) => `${xp} XP`,
    rule: { homework: "Homework finished", tasks: "To-do tasks finished", habits: "Habit check-ins", routines: "Routine steps checked", focus: "Focus timer, per 10 minutes", study: "Study sessions, per 15 minutes", tests: "Practice tests finished", questions: "Practice questions answered right", cards: "Flashcard reviews", drills: "Math drill runs", planSteps: "Plan steps finished", saved: "Opportunities saved", volunteer: "Volunteer hours (whole hours)", achievements: "Accomplishments logged", certs: "Certificates added", checkins: "Mood and sleep check-ins", reflections: "Reflections written" } as Record<string, string>,
    each: (n: number) => `${n} XP each`,
    avTitle: "Avatar", avLead: "Pick an emblem and a color. Reach new levels to unlock more.", emblem: "Emblem", color: "Color", locked: (n: number) => `Unlocks at level ${n}`, yours: "Your avatar",
    bdTitle: "Badges", bdLead: "Patches you earn for finishing things. Locked patches show how close you are.", earnedCount: (a: number, b: number) => `${a} of ${b} earned`, progress: (a: number, b: number) => `${Math.min(a, b)} / ${b}`,
  },
  es: {
    progTitle: "Panel de avance", progLead: "Lo que has hecho hasta ahora, en un solo lugar. Se llena mientras usas las otras herramientas.", level: (n: number, name: string) => `Nivel ${n} · ${name}`, xp: (n: number) => `${n} puntos`, toNext: (n: number, l: number) => `${n} puntos para el nivel ${l}`,
    streakLine: (n: number) => (n === 1 ? "1 día seguido" : `${n} días seguidos`), stats: "Tus números", badgesTitle: "Insignias que has ganado", noBadges: "Todavía no hay insignias. Abre Insignias para ver cómo ganar la primera.", seeAll: "Ver todas las insignias",
    s: { saved: "Oportunidades guardadas", volunteer: "Horas de voluntariado", planSteps: "Pasos de plan terminados", homework: "Tarea terminada", study: "Horas de estudio", tests: "Exámenes de práctica", cards: "Tarjetas repasadas", achievements: "Logros anotados" } as Record<string, string>,
    streaksTitle: "Rachas", streaksLead: "Días seguidos que cumpliste. Si faltas un día, empiezas de nuevo, así que basta con una cosa pequeña al día.", current: "Racha actual", best: "Mejor racha", active: "Días activos", last35: "Últimas 5 semanas", doneDay: "Activo", quietDay: "Sin actividad",
    counts: "Qué cuenta como cumplir", countList: ["Marcar un hábito o un paso de una rutina", "Una sesión del temporizador o una sesión de estudio anotada", "Un chequeo de ánimo o de sueño", "Horas de voluntariado", "Terminar un examen de práctica o una práctica de operaciones"], noStreak: "Haz una cosa pequeña hoy para empezar una racha.",
    lvTitle: "Niveles y puntos", lvLead: "Ganas puntos por lo que de verdad haces. Cada línea de abajo se suma de tus propias herramientas.", total: "Puntos totales", earned: "De dónde salieron tus puntos", howEarn: "Formas de ganar más", ladder: "El sendero que sigue", unlocks: "Desbloquea", at: (xp: number) => `${xp} puntos`,
    rule: { homework: "Tarea terminada", tasks: "Pendientes terminados", habits: "Hábitos marcados", routines: "Pasos de rutina marcados", focus: "Temporizador, por cada 10 minutos", study: "Sesiones de estudio, por cada 15 minutos", tests: "Exámenes de práctica terminados", questions: "Preguntas de práctica correctas", cards: "Tarjetas repasadas", drills: "Prácticas de operaciones", planSteps: "Pasos de plan terminados", saved: "Oportunidades guardadas", volunteer: "Horas de voluntariado (horas completas)", achievements: "Logros anotados", certs: "Certificados agregados", checkins: "Chequeos de ánimo y sueño", reflections: "Reflexiones escritas" } as Record<string, string>,
    each: (n: number) => `${n} puntos cada uno`,
    avTitle: "Avatar", avLead: "Elige un emblema y un color. Sube de nivel para desbloquear más.", emblem: "Emblema", color: "Color", locked: (n: number) => `Se desbloquea en el nivel ${n}`, yours: "Tu avatar",
    bdTitle: "Insignias", bdLead: "Parches que ganas al terminar cosas. Los parches bloqueados muestran qué tan cerca estás.", earnedCount: (a: number, b: number) => `${a} de ${b} ganadas`, progress: (a: number, b: number) => `${Math.min(a, b)} / ${b}`,
  },
};
const PER: Record<string, number> = { homework: 5, tasks: 3, habits: 3, routines: 1, focus: 1, study: 1, tests: 20, questions: 1, cards: 1, drills: 5, planSteps: 5, saved: 2, volunteer: 10, achievements: 15, certs: 15, checkins: 1, reflections: 10 };

function useStanding() {
  const snap = useSnapshot();
  const xp = totalXp(snap), lv = levelOf(xp);
  return { snap, xp, lv, st: streaks(snap), avatar: usableAvatar(useLocalDoc<AvatarChoice>(AVATAR_KEY, DEFAULT_AVATAR)[0], lv.level) };
}

export function ProgressTool({ view }: { view: "progress" | "streaks" | "levels" | "avatar" | "badges" }) {
  const c = useCopy(copy);
  const lang = useLang();
  const { snap, xp, lv, st, avatar } = useStanding();
  const [, setChoice] = useLocalDoc<AvatarChoice>(AVATAR_KEY, DEFAULT_AVATAR);
  const earned = BADGES.filter((b) => b.value(snap) >= b.target);
  const lines = xpBreakdown(snap);
  const name = levelName(lv.level)[lang];

  const bar = (pct: number, label: string) => (
    <div className="h-4 overflow-hidden rounded-full border-[1.5px] border-ink bg-sunken" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label={label}><div className="h-full bg-teal" style={{ width: `${pct}%` }} /></div>
  );

  if (view === "badges") return (
    <Page wide>
      <h1 className="text-3xl sm:text-4xl">{c.bdTitle}</h1>
      <p className="mt-2 max-w-prose text-muted">{c.bdLead}</p>
      <p className="mt-3 font-display text-2xl font-semibold text-teal">{c.earnedCount(earned.length, BADGES.length)}</p>
      <ul className="mt-6 grid grid-cols-2 gap-x-2 gap-y-6 sm:grid-cols-3 lg:grid-cols-5">
        {BADGES.map((b) => {
          const v = b.value(snap), ok = v >= b.target, Icon = ICONS[b.icon];
          return (
            <li key={b.id} className="flex flex-col items-center text-center">
              <Patch label={b[lang]} earned={ok}><Icon size={34} strokeWidth={1.75} /></Patch>
              <p className="mt-1 max-w-[9rem] text-xs text-muted">{b.how[lang]}</p>
              <p className={`text-xs font-bold ${ok ? "text-teal" : "text-muted"}`}>{ok ? "✓" : c.progress(v, b.target)}</p>
            </li>
          );
        })}
      </ul>
    </Page>
  );

  if (view === "avatar") return (
    <Page>
      <h1 className="text-3xl sm:text-4xl">{c.avTitle}</h1>
      <p className="mt-2 max-w-prose text-muted">{c.avLead}</p>
      <div className="guide-card mt-6 flex items-center gap-5 p-5"><AvatarBadge choice={avatar} size={96} /><div><p className="text-sm font-bold text-muted">{c.yours}</p><p className="font-display text-2xl font-semibold">{c.level(lv.level, name)}</p></div></div>
      <h2 className="mt-6 text-xl">{c.emblem}</h2>
      <ul className="mt-2 flex flex-wrap gap-3">{EMBLEMS.map((e) => {
        const open = e.level <= lv.level, Icon = ICONS[e.icon];
        return <li key={e.id}><button disabled={!open} onClick={() => setChoice({ ...avatar, emblem: e.id })} aria-pressed={avatar.emblem === e.id} aria-label={`${e[lang]}${open ? "" : `, ${c.locked(e.level)}`}`}
          className={`relative grid h-16 w-16 place-items-center rounded-full border-[1.5px] border-ink ${avatar.emblem === e.id ? "bg-marigold text-on-marigold ring-2 ring-ink ring-offset-2 ring-offset-paper" : "bg-surface hover:bg-sunken"} disabled:opacity-50`}>
          <Icon size={26} strokeWidth={1.75} />{open ? null : <Lock size={14} className="absolute -bottom-1 -right-1 rounded-full bg-paper p-0.5" />}</button>
          {open ? null : <span className="mt-1 block w-16 text-center text-[0.65rem] text-muted">{c.locked(e.level)}</span>}</li>;
      })}</ul>
      <h2 className="mt-6 text-xl">{c.color}</h2>
      <ul className="mt-2 flex flex-wrap gap-3">{TINTS.map((t) => {
        const open = t.level <= lv.level;
        return <li key={t.id}><button disabled={!open} onClick={() => setChoice({ ...avatar, tint: t.id })} aria-pressed={avatar.tint === t.id} aria-label={`${t[lang]}${open ? "" : `, ${c.locked(t.level)}`}`}
          className={`grid h-12 w-12 place-items-center rounded-full border-[1.5px] border-ink ${t.var} ${avatar.tint === t.id ? "ring-2 ring-ink ring-offset-2 ring-offset-paper" : ""} disabled:opacity-40`}>{open ? (avatar.tint === t.id ? "✓" : "") : <Lock size={16} />}</button>
          {open ? null : <span className="mt-1 block w-12 text-center text-[0.65rem] text-muted">{c.locked(t.level)}</span>}</li>;
      })}</ul>
    </Page>
  );

  if (view === "streaks") {
    const act = activeDays(snap), days = Array.from({ length: 35 }, (_, i) => addDays(snap.now, i - 34));
    return (
      <Page>
        <h1 className="text-3xl sm:text-4xl">{c.streaksTitle}</h1>
        <p className="mt-2 max-w-prose text-muted">{c.streaksLead}</p>
        <dl className="mt-6 grid gap-3 sm:grid-cols-3">
          <div className="guide-card p-4"><dt className="text-sm font-bold text-muted">{c.current}</dt><dd className="flex items-center gap-2 font-display text-4xl font-semibold text-terracotta"><Flame size={30} />{st.current}</dd></div>
          <div className="guide-card p-4"><dt className="text-sm font-bold text-muted">{c.best}</dt><dd className="font-display text-4xl font-semibold">{st.best}</dd></div>
          <div className="guide-card p-4"><dt className="text-sm font-bold text-muted">{c.active}</dt><dd className="font-display text-4xl font-semibold">{st.activeCount}</dd></div>
        </dl>
        {st.current === 0 ? <p className="mt-4 font-bold">{c.noStreak}</p> : null}
        <h2 className="mt-8 border-b-[1.5px] border-ink pb-1 text-2xl">{c.last35}</h2>
        <ol className="mt-3 grid grid-cols-7 gap-1.5" aria-label={c.last35}>{days.map((d) => (
          <li key={d} title={`${d}: ${act.has(d) ? c.doneDay : c.quietDay}`} className={`grid h-10 place-items-center rounded-md border-[1.5px] border-ink text-xs font-bold ${act.has(d) ? "bg-teal text-on-teal" : "bg-sunken text-muted"} ${d === snap.now ? "ring-2 ring-marigold ring-offset-2 ring-offset-paper" : ""}`}><span className="sr-only">{act.has(d) ? c.doneDay : c.quietDay} </span>{Number(d.slice(8))}</li>))}</ol>
        <h2 className="mt-8 text-xl">{c.counts}</h2>
        <ul className="mt-2 list-disc space-y-1 pl-6 text-lg">{c.countList.map((x) => <li key={x}>{x}</li>)}</ul>
      </Page>
    );
  }

  if (view === "levels") return (
    <Page>
      <h1 className="text-3xl sm:text-4xl">{c.lvTitle}</h1>
      <p className="mt-2 max-w-prose text-muted">{c.lvLead}</p>
      <section className="guide-card mt-6 p-5" aria-live="polite">
        <div className="flex items-center gap-4"><AvatarBadge choice={avatar} size={72} /><div className="min-w-0 flex-1"><p className="font-display text-2xl font-semibold">{c.level(lv.level, name)}</p><p className="text-muted">{c.total}: {c.xp(xp)} · {c.toNext(lv.toNext, lv.level + 1)}</p></div></div>
        <div className="mt-3">{bar(lv.pct, c.level(lv.level, name))}</div>
      </section>
      <h2 className="mt-8 border-b-[1.5px] border-ink pb-1 text-2xl">{c.earned}</h2>
      <ul className="divide-y-2 divide-dotted divide-line">{lines.filter((l) => l.count > 0).map((l) => (
        <li key={l.key} className="flex items-center gap-3 py-2"><p className="min-w-0 flex-1">{c.rule[l.key]} <span className="text-muted">× {l.count}</span></p><p className="font-bold tabular-nums">+{l.points}</p></li>))}
        {lines.every((l) => l.count === 0) ? <li className="py-2 text-muted">{c.noStreak}</li> : null}</ul>
      <h2 className="mt-8 text-xl">{c.howEarn}</h2>
      <ul className="mt-2 divide-y-2 divide-dotted divide-line">{lines.map((l) => <li key={l.key} className="flex items-center gap-3 py-1.5 text-sm"><span className="min-w-0 flex-1">{c.rule[l.key]}</span><span className="text-muted">{c.each(PER[l.key])}</span></li>)}</ul>
      <h2 className="mt-8 border-b-[1.5px] border-ink pb-1 text-2xl">{c.ladder}</h2>
      <ol className="mt-2 space-y-1">{[1, 2, 3, 4, 5, 6].map((i) => { const L = lv.level + i; return (
        <li key={L} className="flex items-center gap-3 py-1"><span className="grid h-9 w-9 place-items-center rounded-full border-[1.5px] border-ink bg-surface font-bold">{L}</span><span className="min-w-0 flex-1 font-bold">{levelName(L)[lang]}</span>
          <span className="text-sm text-muted">{c.at(levelStart(L))}{[...EMBLEMS, ...TINTS].some((u) => u.level === L) ? ` · ${c.unlocks}: ${[...EMBLEMS, ...TINTS].filter((u) => u.level === L).map((u) => u[lang]).join(", ")}` : ""}</span></li>); })}</ol>
    </Page>
  );

  const statValues: [string, number][] = [
    ["saved", snap.savedCount], ["volunteer", Math.round(snap.volunteer.reduce((n, v) => n + v.hours, 0) * 10) / 10],
    ["planSteps", snap.plans.reduce((n, p) => n + p.horizons.reduce((m, h) => m + h.steps.filter((s) => s.done).length, 0), 0)],
    ["homework", snap.homework.filter((h) => h.done).length],
    ["study", Math.round(((snap.sessions.reduce((n, s) => n + s.minutes, 0) + Object.values(snap.focusLog).reduce((n, m) => n + m, 0)) / 60) * 10) / 10],
    ["tests", snap.attempts.length], ["cards", snap.cards.reduce((n, x) => n + x.reps, 0)], ["achievements", snap.achievements.length],
  ];
  return (
    <Page wide>
      <h1 className="text-3xl sm:text-4xl">{c.progTitle}</h1>
      <p className="mt-2 max-w-prose text-muted">{c.progLead}</p>
      <section className="guide-card mt-6 p-5">
        <div className="flex flex-wrap items-center gap-5">
          <AvatarBadge choice={avatar} size={80} />
          <div className="min-w-0 flex-1"><Link href="/t/profile/levels" className="font-display text-2xl font-semibold hover:underline">{c.level(lv.level, name)}</Link>
            <p className="text-muted">{c.xp(xp)} · {c.toNext(lv.toNext, lv.level + 1)}</p><div className="mt-2 max-w-md">{bar(lv.pct, c.level(lv.level, name))}</div></div>
          <Link href="/t/profile/streaks" className="flex items-center gap-2 rounded-md border-[1.5px] border-ink bg-surface px-4 py-3 font-bold hover:bg-sunken"><Flame size={22} className="text-terracotta" />{c.streakLine(st.current)}</Link>
        </div>
      </section>
      <h2 className="mt-8 border-b-[1.5px] border-ink pb-1 text-2xl">{c.stats}</h2>
      <dl className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">{statValues.map(([k, v]) => <div key={k} className="guide-card p-3"><dt className="text-sm font-bold text-muted">{c.s[k]}</dt><dd className="font-display text-3xl font-semibold text-teal">{v}</dd></div>)}</dl>
      <h2 className="mt-8 border-b-[1.5px] border-ink pb-1 text-2xl">{c.badgesTitle}</h2>
      {earned.length === 0 ? <p className="mt-3 text-lg">{c.noBadges}</p> : <ul className="mt-4 flex flex-wrap gap-x-3 gap-y-4">{earned.map((b) => { const Icon = ICONS[b.icon]; return <li key={b.id}><Patch label={b[lang]}><Icon size={34} strokeWidth={1.75} /></Patch></li>; })}</ul>}
      <p className="mt-4"><Link href="/t/achievements/badges" className="font-bold text-teal underline underline-offset-4">{c.seeAll}</Link></p>
    </Page>
  );
}
