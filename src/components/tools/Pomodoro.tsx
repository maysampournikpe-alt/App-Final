"use client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Pause, Play, RotateCcw, SkipForward } from "lucide-react";
import { addDays, formatDay, today, weekdayShort } from "@/lib/dates";
import { useLang } from "@/lib/i18n";
import { useLocalDoc } from "@/lib/local-doc";
import { useCopy } from "@/lib/use-copy";
import { buttonClass, inputClass, Page } from "../ui";

interface Settings { work: number; short: number; long: number; every: number; sound: boolean }
const DEFAULTS: Settings = { work: 25, short: 5, long: 15, every: 4, sound: true };
const NO_LOG: Record<string, number> = {};
type Phase = "work" | "short" | "long";

const copy = {
  en: {
    title: "Pomodoro timer", lead: "Work in focused rounds, then rest. Change the lengths to whatever works for you.",
    phase: { work: "Focus", short: "Short break", long: "Long break" } as Record<Phase, string>,
    start: "Start", pause: "Pause", reset: "Reset", skip: "Skip",
    settings: "Lengths (minutes)", work: "Focus", short: "Short break", long: "Long break", every: "Long break after", rounds: "rounds",
    sound: "Sound and vibration when time is up", today: "Focus today", week: "Last 7 days", min: "min",
    round: (n: number) => `Round ${n}`, done: "Time is up", total: (m: number) => `${m} min this week`,
    tableLabel: "Focus minutes per day",
  },
  es: {
    title: "Temporizador Pomodoro", lead: "Trabaja en rondas de concentración y luego descansa. Cambia los tiempos a lo que te funcione.",
    phase: { work: "Concentración", short: "Descanso corto", long: "Descanso largo" } as Record<Phase, string>,
    start: "Empezar", pause: "Pausar", reset: "Reiniciar", skip: "Saltar",
    settings: "Duración (minutos)", work: "Concentración", short: "Descanso corto", long: "Descanso largo", every: "Descanso largo después de", rounds: "rondas",
    sound: "Sonido y vibración cuando se acabe el tiempo", today: "Concentración de hoy", week: "Últimos 7 días", min: "min",
    round: (n: number) => `Ronda ${n}`, done: "Se acabó el tiempo", total: (m: number) => `${m} min esta semana`,
    tableLabel: "Minutos de concentración por día",
  },
};

function beep() {
  try {
    const ctx = new AudioContext();
    [0, 0.25, 0.5].forEach((t) => {
      const o = ctx.createOscillator(), g = ctx.createGain();
      o.frequency.value = 880; o.connect(g); g.connect(ctx.destination);
      g.gain.setValueAtTime(0.0001, ctx.currentTime + t);
      g.gain.exponentialRampToValueAtTime(0.25, ctx.currentTime + t + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + t + 0.2);
      o.start(ctx.currentTime + t); o.stop(ctx.currentTime + t + 0.22);
    });
    setTimeout(() => ctx.close(), 1200);
  } catch { /* audio blocked: the on-screen message still shows */ }
}

const mmss = (ms: number) => {
  const s = Math.max(0, Math.ceil(ms / 1000));
  return `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
};

export function PomodoroTool() {
  const c = useCopy(copy);
  const lang = useLang();
  const [settings, setSettings] = useLocalDoc<Settings>("pomodoro-settings", DEFAULTS);
  const [log, setLog] = useLocalDoc<Record<string, number>>("focus-log", NO_LOG);
  const [phase, setPhase] = useState<Phase>("work");
  const [round, setRound] = useState(1);
  const [running, setRunning] = useState(false);
  const [left, setLeft] = useState(settings.work * 60_000);
  const [finished, setFinished] = useState(false);
  const endAt = useRef(0);
  const startedMs = useRef(0);

  const lengthFor = useCallback((p: Phase) => (p === "work" ? settings.work : p === "short" ? settings.short : settings.long) * 60_000, [settings]);

  // Credit the focus minutes actually spent, so pausing or skipping early is counted honestly.
  const credit = useCallback((ms: number, p: Phase) => {
    if (p !== "work" || ms < 30_000) return;
    const key = today();
    setLog((prev) => ({ ...prev, [key]: Math.round(((prev[key] ?? 0) + ms / 60_000) * 10) / 10 }));
  }, [setLog]);

  const next = useCallback((wasFinished: boolean) => {
    let p: Phase = "work", r = round;
    if (phase === "work") { p = round % settings.every === 0 ? "long" : "short"; }
    else { r = phase === "long" ? 1 : round + 1; }
    setPhase(p); setRound(r); setLeft(lengthFor(p)); setRunning(false); setFinished(wasFinished);
  }, [phase, round, settings.every, lengthFor]);

  // Time is measured against the clock, not by counting ticks, so a sleeping phone does not lose time.
  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => {
      const remaining = endAt.current - Date.now();
      setLeft(remaining);
      if (remaining <= 0) {
        clearInterval(id);
        credit(lengthFor(phase), phase);
        if (settings.sound) { beep(); try { navigator.vibrate?.([200, 100, 200]); } catch { /* unsupported */ } }
        next(true);
      }
    }, 250);
    return () => clearInterval(id);
  }, [running, phase, settings.sound, lengthFor, credit, next]);

  useEffect(() => {
    document.title = running ? `${mmss(left)} · ${c.phase[phase]}` : "Rumbo";
    return () => { document.title = "Rumbo"; };
  }, [running, left, phase, c.phase]);

  const toggle = () => {
    if (running) { setRunning(false); credit(Date.now() - startedMs.current, phase); setLeft(endAt.current - Date.now()); return; }
    setFinished(false);
    startedMs.current = Date.now();
    endAt.current = Date.now() + left;
    setRunning(true);
  };
  const reset = () => { if (running) credit(Date.now() - startedMs.current, phase); setRunning(false); setFinished(false); setLeft(lengthFor(phase)); };
  const skip = () => { if (running) credit(Date.now() - startedMs.current, phase); next(false); };

  const setNum = (k: keyof Omit<Settings, "sound">, v: string, min: number, max: number) => {
    const n = Math.round(Number(v));
    if (!Number.isFinite(n) || n < min || n > max) return;
    const patch = { ...settings, [k]: n };
    setSettings(patch);
    if (!running) setLeft(((phase === "work" ? patch.work : phase === "short" ? patch.short : patch.long)) * 60_000);
  };

  const days = useMemo(() => Array.from({ length: 7 }, (_, i) => { const d = addDays(today(), i - 6); return { d, m: log[d] ?? 0 }; }), [log]);
  const max = Math.max(30, ...days.map((x) => x.m));
  const total = Math.round(days.reduce((s, x) => s + x.m, 0));
  const total_ms = lengthFor(phase);
  const progress = 1 - Math.max(0, Math.min(1, left / total_ms));

  return (
    <Page wide>
      <h1 className="text-3xl sm:text-4xl">{c.title}</h1>
      <p className="mt-2 max-w-prose text-muted">{c.lead}</p>

      <div className="mt-8 grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <section aria-label={c.title}>
          <div className="guide-card contours grid place-items-center p-8 text-center">
            <p className="font-display text-2xl text-terracotta">{c.phase[phase]} · {c.round(round)}</p>
            <div className="relative my-4 grid h-64 w-64 place-items-center">
              <svg viewBox="0 0 100 100" className="absolute inset-0 -rotate-90" aria-hidden="true">
                <circle cx="50" cy="50" r="46" fill="none" className="stroke-line" strokeWidth="3" strokeDasharray="1 4" strokeLinecap="round" />
                <circle cx="50" cy="50" r="46" fill="none" className={phase === "work" ? "stroke-ruby" : "stroke-teal"} strokeWidth="4" strokeLinecap="round"
                  strokeDasharray={2 * Math.PI * 46} strokeDashoffset={2 * Math.PI * 46 * (1 - progress)} />
              </svg>
              <p className="font-display text-6xl font-semibold tabular-nums" role="timer" aria-live="off">{mmss(left)}</p>
            </div>
            <p role="status" className="mb-4 h-6 font-bold text-palm">{finished ? c.done : ""}</p>
            <div className="flex flex-wrap justify-center gap-3">
              <button onClick={toggle} className={buttonClass.primary}>{running ? <Pause size={18} /> : <Play size={18} />}{running ? c.pause : c.start}</button>
              <button onClick={reset} className={buttonClass.quiet}><RotateCcw size={18} />{c.reset}</button>
              <button onClick={skip} className={buttonClass.quiet}><SkipForward size={18} />{c.skip}</button>
            </div>
          </div>

          <fieldset className="mt-6">
            <legend className="mb-3 text-xl font-bold font-display">{c.settings}</legend>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              {([["work", c.work, 1, 180], ["short", c.short, 1, 60], ["long", c.long, 1, 90], ["every", c.every, 2, 12]] as const).map(([k, label, lo, hi]) => (
                <label key={k}><span className="block text-sm font-bold">{label}{k === "every" ? ` (${c.rounds})` : ""}</span>
                  <input type="number" min={lo} max={hi} value={settings[k]} onChange={(e) => setNum(k, e.target.value, lo, hi)} className={`${inputClass} mt-1`} /></label>
              ))}
            </div>
            <label className="mt-4 flex cursor-pointer items-center gap-3 font-bold">
              <input type="checkbox" checked={settings.sound} onChange={(e) => setSettings({ ...settings, sound: e.target.checked })} className="h-5 w-5 accent-[var(--c-teal)]" />{c.sound}
            </label>
          </fieldset>
        </section>

        <section aria-label={c.week}>
          <p className="text-muted">{c.today}</p>
          <p className="font-display text-5xl font-semibold tabular-nums">{Math.round(log[today()] ?? 0)} <span className="text-2xl">{c.min}</span></p>
          <h2 className="mb-1 mt-8 text-2xl">{c.week}</h2>
          <p className="mb-3 text-sm text-muted">{c.total(total)}</p>
          <div className="flex h-48 items-end gap-2 border-b-[1.5px] border-ink" aria-hidden="true">
            {days.map(({ d, m }) => (
              <div key={d} className="flex h-full flex-1 flex-col items-center justify-end">
                <span className="mb-1 text-xs font-bold tabular-nums">{m ? Math.round(m) : ""}</span>
                <div className={`w-full rounded-t-sm border-[1.5px] border-b-0 border-ink ${d === today() ? "bg-ruby" : "bg-teal"}`} style={{ height: `${(m / max) * 100}%`, minHeight: m ? 3 : 0 }} />
              </div>
            ))}
          </div>
          <div className="mt-1 flex gap-2" aria-hidden="true">
            {days.map(({ d }) => <span key={d} className="flex-1 text-center text-xs text-muted">{weekdayShort(d, lang)}</span>)}
          </div>
          <table className="sr-only"><caption>{c.tableLabel}</caption>
            <tbody>{days.map(({ d, m }) => <tr key={d}><th>{formatDay(d, lang)}</th><td>{Math.round(m)}</td></tr>)}</tbody></table>
        </section>
      </div>
    </Page>
  );
}
