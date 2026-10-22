"use client";
import { useEffect, useRef, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { MOOD_KEY, NO_MOODS, NO_SLEEP, SLEEP_KEY, sleepHours, type Mood, type Sleep } from "@/lib/career";
import { startOfWeek } from "@/lib/calendar";
import { addDays, today } from "@/lib/dates";
import { HOMEWORK_KEY, NO_ASSIGNMENTS, type Assignment } from "@/lib/homework";
import { balanceShares, BALANCE_AREAS, burnoutSignals, levelOf, weekScore, type BalanceArea, type Signal } from "@/lib/load";
import { useLocalDoc } from "@/lib/local-doc";
import { BLOCKS_KEY, blockHours, EVENTS_KEY, NO_BLOCKS, NO_EVENTS, type Block, type SchoolEvent } from "@/lib/schedule";
import { NO_SESSIONS, SESSIONS_KEY, type Session } from "@/lib/study";
import { useCopy } from "@/lib/use-copy";
import { buttonClass, inputClass } from "../ui";
import { Callout, Chips, Empty, Head } from "./shared";

const copy = {
  en: {
    add: "Add", remove: "Remove", start: "Start", stop: "Stop", min: "min",
    fmTitle: "Focus mode", fmLead: "A calm timer with optional background sound made right on your device. Headphones help.", fmLen: "Length", fmSound: "Sound", sounds: { off: "Off", brown: "Soft rumble", white: "White noise", rain: "Rain-like" }, fmVol: "Volume", fmDone: "Time. Take a short break.", fmNote: "These are simple generated sounds, not music. For music, see Study playlists.",
    dsTitle: "Distraction reminder", dsLead: "Before you start, run through this quick list. Each one removes a common reason students lose their focus.", dsItems: ["Phone is across the room or in another room", "Notifications are off", "Only the tabs I need are open", "Water and a snack are nearby", "I know the one thing I am doing first"], dsReady: "Ready. Go.", dsLeft: (n: number) => `${n} left before you start`, dsGo: "Open the Pomodoro timer", dsReset: "Start over",
    bgTitle: "Brain break games", bgLead: "Two quick games for between study sessions. Two minutes, then back to work.", bgMath: "Math sprint (60 seconds)", bgMem: "Memory pattern", bgScore: (n: number) => `Score: ${n}`, bgBest: (n: number) => `Best: ${n}`, bgAnswer: "Your answer", bgTime: (n: number) => `${n} seconds left`, bgOver: "Time is up.", bgLevel: (n: number) => `Round ${n}: repeat the pattern`, bgWatch: "Watch…", bgYour: "Your turn", bgLost: (n: number) => `Missed it. You got ${n} rounds.`, colors: ["Red", "Blue", "Green", "Yellow"],
    ldTitle: "Goal ladder", ldLead: "Your big goal on top, small steps as rungs. Climb one rung at a time.", ldGoal: "Big goal", ldGoalPh: "Get into a good college", ldStep: "Next step", ldStepPh: "Raise my math grade to a B", ldProg: (a: number, b: number) => `${a} of ${b} rungs climbed`, ldTop: "Top of the ladder", ldNote: "Put the first rung at the bottom. Make it small enough to do this week.",
    vsTitle: "Vision board", vsLead: "Words and short phrases for the future you want to build. Put it somewhere you will see it.", vsPh: "Study nursing", vsEmpty: "Nothing on your board yet. Write a goal, a place, or a feeling you are working toward.", vsNote: "This board is words only, so it stays private on your device.",
    auTitle: "Time audit", auLead: "Log what you do for a week and see where the hours really go. No judging. It is just data.", dayL: "Day", auAct: "What did you do?", auCat: "Type", auMin: "Minutes", cats: { school: "School", homework: "Homework", activities: "Activities", screens: "Screens", family: "Family and friends", rest: "Rest and sleep", other: "Other" } as Record<string, string>, auWeek: "Last 7 days", auTotal: (n: number) => `${Math.round(n / 6) / 10} hours logged`, auEmpty: "Log your first activity above.",
    esTitle: "Task time estimator", esLead: "Guess how long a task will take, then log the real time. Over weeks, your guesses get better.", esTask: "Task", esGuess: "My guess (minutes)", esReal: "Real time (minutes)", esSave: "Save real time", esOpen: "Waiting for the real time", esDone: "Finished", esAvg: (p: number) => (p > 110 ? `You usually guess too short, by about ${p - 100}%. Add some extra time.` : p < 90 ? `You usually guess too long, by about ${100 - p}%. You are faster than you think.` : "Your guesses are close. Nice."), esNone: "Finish a few tasks to see how your guesses compare.",
    enTitle: "Energy planner", enLead: "Rate how focused you feel in each part of the day. Then put your hardest work in your best time.", parts: { morning: "Morning", afternoon: "Afternoon", evening: "Evening", night: "Late night" } as Record<string, string>, enRate: "Focus level", levels: ["Low", "Medium", "High"], enBest: (p: string) => `Your best time is the ${p.toLowerCase()}. Put hard tasks and tests prep there. Use lower-energy times for easy tasks.`, enNone: "Rate at least one part of the day.", enNoteLate: "Late nights make the next day harder. Sleep helps your memory.",
    scTitle: "Screen time goal", scLead: "Set a daily limit you choose for non-school screen time, then log honestly. It is your goal, not a rule.", scGoal: "My daily goal (minutes)", scToday: "Today's screen minutes", scSave: "Save", scUnder: "Under your goal. Nice.", scOver: (n: number) => `${n} minutes over your goal. That is okay. Try one thing that helps tomorrow.`, scWeek: "Last 7 days", scNone: "no entry", scHelp: "Ideas: charge your phone outside your room, set app timers, or swap the first 30 minutes after school for something offline.",
    buTitle: "Burnout check", buLead: "A gentle look at your week using what you have already logged. It is not a diagnosis.", buSleep: "Average sleep", buMood: "Low mood days", buLoad: "This week's workload", buStudy: "Hours studied", buRest: "Days with no study", signals: { sleep: "You are sleeping a bit less than the 8 to 10 hours teens usually need.", sleepLow: "You are sleeping under 7 hours on average.", mood: "You had several low mood days this week.", load: "This week has a heavy workload.", study: "You studied a lot of hours this week.", rest: "You did not take a single rest day from studying." } as Record<Signal, string>, lv: { light: "Looking steady", medium: "A little stretched", heavy: "Very stretched" }, tips: { light: "Nothing worrying. Keep protecting your sleep.", medium: "Pick one thing to lighten this week: move a task, sleep earlier, or take a real break.", heavy: "This is a lot. Talk to a trusted adult, and think about what can be postponed. If you feel hopeless or unsafe, call or text 988 any time." }, noData: "Not enough logged yet. Use the Sleep tracker, Mood check-in and Study logger and this will fill in.", help: "See help lines and trusted people", hrs: "h", of7: "of 7",
    blTitle: "Balance meter", blLead: "How many hours a week go to school, activities, rest and friends? There is no perfect mix. Look for what is missing.", areas: { school: "School and homework", activities: "Sports and activities", rest: "Rest and sleep", friends: "Friends and family" } as Record<BalanceArea, string>, blHrs: "Hours per week", blEmpty: "Enter your hours above to see your mix.", blLow: (a: string) => `Your smallest share is ${a.toLowerCase()}. Is that on purpose?`, blRestLow: "Rest is under a third of your week. Sleep alone is usually more than that.",
  },
  es: {
    add: "Agregar", remove: "Quitar", start: "Empezar", stop: "Parar", min: "min",
    fmTitle: "Modo de concentración", fmLead: "Un temporizador tranquilo con sonido de fondo opcional, hecho en tu propio dispositivo. Ayuda usar audífonos.", fmLen: "Duración", fmSound: "Sonido", sounds: { off: "Apagado", brown: "Retumbo suave", white: "Ruido blanco", rain: "Como lluvia" }, fmVol: "Volumen", fmDone: "Se acabó el tiempo. Descansa un poco.", fmNote: "Son sonidos simples generados, no música. Para música, mira Música para estudiar.",
    dsTitle: "Aviso contra distracciones", dsLead: "Antes de empezar, repasa esta lista rápida. Cada punto quita una razón común por la que los estudiantes pierden la concentración.", dsItems: ["El celular está al otro lado del cuarto o en otro cuarto", "Las notificaciones están apagadas", "Solo tengo abiertas las pestañas que necesito", "Tengo agua y algo de comer cerca", "Sé la única cosa que voy a hacer primero"], dsReady: "Listo. Empieza.", dsLeft: (n: number) => `Faltan ${n} antes de empezar`, dsGo: "Abrir el temporizador Pomodoro", dsReset: "Empezar de nuevo",
    bgTitle: "Juegos para descansar", bgLead: "Dos juegos rápidos para entre sesiones de estudio. Dos minutos y de vuelta al trabajo.", bgMath: "Carrera de mates (60 segundos)", bgMem: "Patrón de memoria", bgScore: (n: number) => `Puntos: ${n}`, bgBest: (n: number) => `Mejor: ${n}`, bgAnswer: "Tu respuesta", bgTime: (n: number) => `Quedan ${n} segundos`, bgOver: "Se acabó el tiempo.", bgLevel: (n: number) => `Ronda ${n}: repite el patrón`, bgWatch: "Mira…", bgYour: "Tu turno", bgLost: (n: number) => `Te equivocaste. Lograste ${n} rondas.`, colors: ["Rojo", "Azul", "Verde", "Amarillo"],
    ldTitle: "Escalera de metas", ldLead: "Tu meta grande arriba, pasos pequeños como escalones. Sube un escalón a la vez.", ldGoal: "Meta grande", ldGoalPh: "Entrar a una buena universidad", ldStep: "Siguiente paso", ldStepPh: "Subir mi calificación de mate a B", ldProg: (a: number, b: number) => `${a} de ${b} escalones subidos`, ldTop: "Arriba de la escalera", ldNote: "Pon el primer escalón abajo. Hazlo tan pequeño que puedas lograrlo esta semana.",
    vsTitle: "Tablero de visión", vsLead: "Palabras y frases cortas del futuro que quieres construir. Ponlo donde lo veas.", vsPh: "Estudiar enfermería", vsEmpty: "Todavía no hay nada en tu tablero. Escribe una meta, un lugar o un sentimiento hacia el que trabajas.", vsNote: "Este tablero es solo de palabras, así que se queda privado en tu dispositivo.",
    auTitle: "Auditoría de tiempo", auLead: "Anota lo que haces durante una semana y mira a dónde se van las horas. Sin juzgar. Solo son datos.", dayL: "Día", auAct: "¿Qué hiciste?", auCat: "Tipo", auMin: "Minutos", cats: { school: "Escuela", homework: "Tarea", activities: "Actividades", screens: "Pantallas", family: "Familia y amigos", rest: "Descanso y sueño", other: "Otro" } as Record<string, string>, auWeek: "Últimos 7 días", auTotal: (n: number) => `${Math.round(n / 6) / 10} horas anotadas`, auEmpty: "Anota tu primera actividad arriba.",
    esTitle: "Estimador de tiempo", esLead: "Adivina cuánto tardará una tarea y luego anota el tiempo real. Con las semanas, tus cálculos mejoran.", esTask: "Tarea", esGuess: "Mi cálculo (minutos)", esReal: "Tiempo real (minutos)", esSave: "Guardar tiempo real", esOpen: "Esperando el tiempo real", esDone: "Terminadas", esAvg: (p: number) => (p > 110 ? `Normalmente calculas muy poco, como ${p - 100}% menos. Agrega tiempo extra.` : p < 90 ? `Normalmente calculas de más, como ${100 - p}%. Eres más rápido de lo que piensas.` : "Tus cálculos están cerca. Muy bien."), esNone: "Termina algunas tareas para ver cómo van tus cálculos.",
    enTitle: "Planeador de energía", enLead: "Califica qué tan concentrado te sientes en cada parte del día. Luego pon tu trabajo más difícil en tu mejor momento.", parts: { morning: "Mañana", afternoon: "Tarde", evening: "Anochecer", night: "Noche tarde" } as Record<string, string>, enRate: "Nivel de concentración", levels: ["Bajo", "Medio", "Alto"], enBest: (p: string) => `Tu mejor momento es ${p.toLowerCase()}. Pon ahí lo difícil y el repaso para exámenes. Usa los momentos de menos energía para lo fácil.`, enNone: "Califica al menos una parte del día.", enNoteLate: "Desvelarse hace más difícil el día siguiente. Dormir ayuda a la memoria.",
    scTitle: "Meta de pantalla", scLead: "Pon un límite diario que tú elijas para pantallas que no son de la escuela y anota con honestidad. Es tu meta, no una regla.", scGoal: "Mi meta diaria (minutos)", scToday: "Minutos de pantalla de hoy", scSave: "Guardar", scUnder: "Por debajo de tu meta. Muy bien.", scOver: (n: number) => `${n} minutos arriba de tu meta. Está bien. Prueba algo que ayude mañana.`, scWeek: "Últimos 7 días", scNone: "sin dato", scHelp: "Ideas: carga el celular fuera de tu cuarto, pon límites de tiempo a las apps, o cambia los primeros 30 minutos después de la escuela por algo sin pantalla.",
    buTitle: "Chequeo de agotamiento", buLead: "Una mirada amable a tu semana con lo que ya anotaste. No es un diagnóstico.", buSleep: "Sueño promedio", buMood: "Días de ánimo bajo", buLoad: "Carga de esta semana", buStudy: "Horas de estudio", buRest: "Días sin estudiar", signals: { sleep: "Duermes un poco menos de las 8 a 10 horas que los jóvenes suelen necesitar.", sleepLow: "Duermes menos de 7 horas en promedio.", mood: "Tuviste varios días de ánimo bajo esta semana.", load: "Esta semana tiene mucha carga de trabajo.", study: "Estudiaste muchas horas esta semana.", rest: "No te tomaste ni un día de descanso del estudio." } as Record<Signal, string>, lv: { light: "Se ve estable", medium: "Un poco estirado", heavy: "Muy estirado" }, tips: { light: "Nada preocupante. Sigue cuidando tu sueño.", medium: "Elige algo para aligerar esta semana: mover una tarea, dormir más temprano o tomar un descanso de verdad.", heavy: "Es mucho. Habla con un adulto de confianza y piensa qué se puede posponer. Si te sientes sin esperanza o en peligro, llama o manda un mensaje al 988 a cualquier hora." }, noData: "Todavía hay pocos datos. Usa el Registro de sueño, Cómo te sientes y el Registro de sesiones y esto se llenará.", help: "Ver líneas de ayuda y personas de confianza", hrs: "h", of7: "de 7",
    blTitle: "Medidor de equilibrio", blLead: "¿Cuántas horas a la semana van a escuela, actividades, descanso y amigos? No hay una mezcla perfecta. Busca lo que falta.", areas: { school: "Escuela y tarea", activities: "Deportes y actividades", rest: "Descanso y sueño", friends: "Amigos y familia" } as Record<BalanceArea, string>, blHrs: "Horas por semana", blEmpty: "Escribe tus horas arriba para ver tu mezcla.", blLow: (a: string) => `Tu parte más pequeña es ${a.toLowerCase()}. ¿Es a propósito?`, blRestLow: "El descanso es menos de un tercio de tu semana. Solo dormir suele ser más que eso.",
  },
};

const rm = (label: string, text: string, fn: () => void) => <button onClick={fn} aria-label={`${text}: ${label}`} className="grid h-10 w-10 shrink-0 place-items-center rounded-md hover:bg-sunken"><Trash2 size={18} strokeWidth={1.75} /></button>;
const num = (s: string, lo: number, hi: number) => { const n = Number(s); return Number.isFinite(n) ? Math.max(lo, Math.min(hi, Math.round(n))) : lo; };
const clock = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
const last7 = (now: string) => Array.from({ length: 7 }, (_, i) => addDays(now, i - 6));

type Sound = "off" | "brown" | "white" | "rain";
function makeNoise(ctx: AudioContext, kind: Exclude<Sound, "off">, gain: GainNode) {
  const len = ctx.sampleRate * 2, buf = ctx.createBuffer(1, len, ctx.sampleRate), d = buf.getChannelData(0);
  let last = 0;
  for (let i = 0; i < len; i++) { const w = Math.random() * 2 - 1; if (kind === "brown") { last = (last + 0.02 * w) / 1.02; d[i] = last * 3.5; } else d[i] = w * 0.5; }
  const src = ctx.createBufferSource(); src.buffer = buf; src.loop = true;
  let node: AudioNode = src;
  if (kind === "rain") { const f = ctx.createBiquadFilter(); f.type = "bandpass"; f.frequency.value = 2200; f.Q.value = 0.5; src.connect(f); node = f; }
  node.connect(gain); src.start();
  return src;
}

export function FocusModeTool() {
  const c = useCopy(copy);
  const [len, setLen] = useState(25);
  const [sound, setSound] = useState<Sound>("rain");
  const [vol, setVol] = useState(0.4);
  const [left, setLeft] = useState<number | null>(null);
  const audio = useRef<{ ctx: AudioContext; src: AudioBufferSourceNode; gain: GainNode } | null>(null);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);
  const halt = () => {
    if (timer.current) clearInterval(timer.current); timer.current = null;
    const a = audio.current; if (a) { try { a.src.stop(); } catch {} a.ctx.close().catch(() => {}); } audio.current = null;
  };
  useEffect(() => halt, []);
  useEffect(() => { if (audio.current) audio.current.gain.gain.value = vol; }, [vol]);
  const begin = () => {
    halt(); setLeft(len * 60);
    if (sound !== "off") {
      try { const Ctx = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext; const ctx = new Ctx(), gain = ctx.createGain(); gain.gain.value = vol; gain.connect(ctx.destination); audio.current = { ctx, gain, src: makeNoise(ctx, sound, gain) }; } catch {}
    }
    timer.current = setInterval(() => setLeft((s) => { if (s === null) return s; if (s <= 1) { halt(); return 0; } return s - 1; }), 1000);
  };
  const stop = () => { halt(); setLeft(null); };
  return (
    <Head title={c.fmTitle} lead={c.fmLead}>
      <div className="mt-5 grid gap-5 sm:grid-cols-2">
        <Chips<string> value={String(len)} onChange={(v) => setLen(Number(v))} label={c.fmLen} options={[15, 25, 45, 60].map((n) => ({ id: String(n), label: `${n} ${c.min}` }))} />
        <Chips<Sound> value={sound} onChange={setSound} label={c.fmSound} options={(["off", "brown", "white", "rain"] as Sound[]).map((s) => ({ id: s, label: c.sounds[s] }))} /></div>
      <label className="mt-4 flex max-w-sm items-center gap-3 font-bold">{c.fmVol}<input type="range" min={0} max={1} step={0.05} value={vol} onChange={(e) => setVol(Number(e.target.value))} className="flex-1 accent-[var(--c-teal)]" /></label>
      <section className="guide-card mt-6 grid place-items-center p-10 text-center" aria-live="off">
        <p className="font-display text-7xl font-semibold tabular-nums" role="timer">{clock(left ?? len * 60)}</p>
        {left === 0 ? <p className="mt-3 font-bold text-teal" role="status">{c.fmDone}</p> : null}
        <div className="mt-5">{left === null || left === 0 ? <button onClick={begin} className={buttonClass.primary}>{c.start}</button> : <button onClick={stop} className={buttonClass.secondary}>{c.stop}</button>}</div></section>
      <p className="mt-3 text-sm text-muted">{c.fmNote}</p>
    </Head>
  );
}

export function DistractionTool() {
  const c = useCopy(copy);
  const [on, setOn] = useState<boolean[]>(() => c.dsItems.map(() => false));
  const left = on.filter((x) => !x).length;
  return (
    <Head title={c.dsTitle} lead={c.dsLead}>
      <ul className="mt-5 divide-y-2 divide-dotted divide-line">{c.dsItems.map((it, i) => <li key={it}><label className="flex items-center gap-3 py-3 text-lg"><input type="checkbox" checked={on[i] ?? false} onChange={() => setOn((p) => p.map((x, j) => (j === i ? !x : x)))} className="h-5 w-5 accent-[var(--c-teal)]" />{it}</label></li>)}</ul>
      <p className="mt-4 font-display text-2xl font-semibold text-teal" role="status">{left === 0 ? c.dsReady : c.dsLeft(left)}</p>
      <div className="mt-4 flex flex-wrap gap-3"><a href="/t/focus/pomodoro" className={buttonClass.primary}>{c.dsGo}</a><button onClick={() => setOn(c.dsItems.map(() => false))} className={buttonClass.secondary}>{c.dsReset}</button></div>
    </Head>
  );
}

const BEST_KEY = "braingames-best";
export function BrainGamesTool() {
  const c = useCopy(copy);
  const [best, setBest] = useLocalDoc<{ math: number; mem: number }>(BEST_KEY, { math: 0, mem: 0 });
  const [game, setGame] = useState<"math" | "mem">("math");
  return (
    <Head title={c.bgTitle} lead={c.bgLead}>
      <div className="mt-5"><Chips<"math" | "mem"> value={game} onChange={setGame} label={c.bgTitle} options={[{ id: "math", label: c.bgMath }, { id: "mem", label: c.bgMem }]} /></div>
      {game === "math" ? <MathSprint c={c} best={best.math} onBest={(n) => setBest((p) => ({ ...p, math: Math.max(p.math, n) }))} /> : <MemoryGame c={c} best={best.mem} onBest={(n) => setBest((p) => ({ ...p, mem: Math.max(p.mem, n) }))} />}
    </Head>
  );
}
type BG = typeof copy.en;
function MathSprint({ c, best, onBest }: { c: BG; best: number; onBest: (n: number) => void }) {
  const [q, setQ] = useState<{ a: number; b: number; op: "+" | "-" | "×" } | null>(null);
  const [score, setScore] = useState(0);
  const [time, setTime] = useState(0);
  const [ans, setAns] = useState("");
  const scoreRef = useRef(0);
  const next = () => { const op = (["+", "-", "×"] as const)[Math.floor(Math.random() * 3)]; const a = op === "×" ? 2 + Math.floor(Math.random() * 11) : 5 + Math.floor(Math.random() * 40), b = op === "×" ? 2 + Math.floor(Math.random() * 11) : 2 + Math.floor(Math.random() * 30); setQ(op === "-" && b > a ? { a: b, b: a, op } : { a, b, op }); setAns(""); };
  useEffect(() => { if (time <= 0) return; const t = setTimeout(() => setTime((s) => s - 1), 1000); return () => clearTimeout(t); }, [time]);
  useEffect(() => { if (time === 0 && q) onBest(scoreRef.current); }, [time]); // eslint-disable-line react-hooks/exhaustive-deps
  const start = () => { scoreRef.current = 0; setScore(0); setTime(60); next(); };
  const submit = (e: React.FormEvent) => { e.preventDefault(); if (!q || time <= 0) return; const r = q.op === "+" ? q.a + q.b : q.op === "-" ? q.a - q.b : q.a * q.b; if (Number(ans) === r) { scoreRef.current++; setScore(scoreRef.current); } next(); };
  return (
    <section className="guide-card mt-5 p-6">
      {time > 0 && q ? <form onSubmit={submit}><p className="font-bold text-teal" aria-live="off">{c.bgTime(time)} · {c.bgScore(score)}</p><p className="my-3 font-display text-5xl font-semibold tabular-nums">{q.a} {q.op} {q.b} =</p>
        <label><span className="sr-only">{c.bgAnswer}</span><input autoFocus inputMode="numeric" value={ans} onChange={(e) => setAns(e.target.value)} className={`${inputClass} max-w-40`} /></label> <button className={buttonClass.primary}>OK</button></form>
        : <div>{q ? <p className="text-xl font-bold" role="status">{c.bgOver} {c.bgScore(score)}</p> : null}<p className="mt-1 text-muted">{c.bgBest(best)}</p><button onClick={start} className={`${buttonClass.primary} mt-3`}>{c.start}</button></div>}
    </section>
  );
}
function MemoryGame({ c, best, onBest }: { c: BG; best: number; onBest: (n: number) => void }) {
  const [seq, setSeq] = useState<number[]>([]);
  const [phase, setPhase] = useState<"idle" | "show" | "input" | "lost">("idle");
  const [lit, setLit] = useState<number | null>(null);
  const [pos, setPos] = useState(0);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  useEffect(() => () => timers.current.forEach(clearTimeout), []);
  const play = (s: number[]) => { setPhase("show"); setPos(0); s.forEach((v, i) => { timers.current.push(setTimeout(() => setLit(v), 700 * i + 400), setTimeout(() => setLit(null), 700 * i + 800)); }); timers.current.push(setTimeout(() => setPhase("input"), 700 * s.length + 500)); };
  const start = () => { const s = [Math.floor(Math.random() * 4)]; setSeq(s); play(s); };
  const press = (i: number) => {
    if (phase !== "input") return;
    if (seq[pos] !== i) { setPhase("lost"); onBest(seq.length - 1); return; }
    if (pos + 1 === seq.length) { const s = [...seq, Math.floor(Math.random() * 4)]; setSeq(s); timers.current.push(setTimeout(() => play(s), 500)); setPhase("show"); } else setPos(pos + 1);
  };
  const bg = ["bg-ruby text-on-ruby", "bg-teal text-on-teal", "bg-sage text-ink", "bg-marigold text-on-marigold"];
  return (
    <section className="guide-card mt-5 p-6">
      <p className="font-bold text-teal" role="status">{phase === "show" ? c.bgWatch : phase === "input" ? c.bgYour : phase === "lost" ? c.bgLost(seq.length - 1) : c.bgBest(best)}{phase !== "idle" && phase !== "lost" ? ` · ${c.bgLevel(seq.length)}` : ""}</p>
      <div className="mt-3 grid max-w-xs grid-cols-2 gap-3">{c.colors.map((name, i) => <button key={name} onClick={() => press(i)} disabled={phase !== "input"} className={`h-20 rounded-lg border-[1.5px] border-ink font-bold ${bg[i]} ${lit === i ? "ring-4 ring-ink" : "opacity-70"}`}>{name}</button>)}</div>
      {phase === "idle" || phase === "lost" ? <button onClick={start} className={`${buttonClass.primary} mt-4`}>{c.start}</button> : null}
    </section>
  );
}

type Ladder = { goal: string; rungs: { id: string; text: string; done: boolean }[] };
const NO_LADDER: Ladder = { goal: "", rungs: [] };
export function LadderTool() {
  const c = useCopy(copy);
  const [l, setL] = useLocalDoc<Ladder>("goal-ladder", NO_LADDER);
  const [text, setText] = useState("");
  const done = l.rungs.filter((r) => r.done).length;
  return (
    <Head title={c.ldTitle} lead={c.ldLead}>
      <label className="mt-5 block"><span className="block font-bold">{c.ldGoal}</span><input value={l.goal} onChange={(e) => setL({ ...l, goal: e.target.value })} placeholder={c.ldGoalPh} maxLength={100} className={`${inputClass} mt-1`} /></label>
      <form className="mt-4 flex flex-wrap items-end gap-3" onSubmit={(e) => { e.preventDefault(); if (text.trim()) { setL({ ...l, rungs: [...l.rungs, { id: crypto.randomUUID(), text: text.trim(), done: false }] }); setText(""); } }}>
        <label className="min-w-0 flex-1"><span className="block font-bold">{c.ldStep}</span><input value={text} onChange={(e) => setText(e.target.value)} placeholder={c.ldStepPh} maxLength={100} className={`${inputClass} mt-1`} /></label><button className={buttonClass.primary}><Plus size={18} />{c.add}</button></form>
      <p className="mt-2 text-sm text-muted">{c.ldNote}</p>
      {l.goal || l.rungs.length ? <section className="mt-6 max-w-xl">
        <p className="font-bold text-teal" aria-live="polite">{c.ldProg(done, l.rungs.length)}</p>
        <div className="mt-2 rounded-lg border-[1.5px] border-ink bg-marigold p-4 text-on-marigold"><p className="text-sm font-bold uppercase tracking-wide">{c.ldTop}</p><p className="font-display text-2xl font-semibold">{l.goal || "—"}</p></div>
        <ol className="mt-2 flex flex-col-reverse gap-2">{l.rungs.map((r, i) => <li key={r.id} className="flex items-center gap-2 rounded-md border-[1.5px] border-ink bg-surface p-2" style={{ marginInline: `${Math.min(i, 5) * 6}px` }}><label className="flex min-w-0 flex-1 items-center gap-3"><input type="checkbox" checked={r.done} onChange={() => setL({ ...l, rungs: l.rungs.map((x) => (x.id === r.id ? { ...x, done: !x.done } : x)) })} className="h-5 w-5 accent-[var(--c-teal)]" /><span className={r.done ? "text-muted line-through" : ""}>{i + 1}. {r.text}</span></label>{rm(r.text, c.remove, () => setL({ ...l, rungs: l.rungs.filter((x) => x.id !== r.id) }))}</li>)}</ol></section> : null}
    </Head>
  );
}

type Vision = { id: string; text: string; tone: number }[];
const NO_VISION: Vision = [];
const TONES = ["bg-marigold text-on-marigold", "bg-teal text-on-teal", "bg-ruby text-on-ruby", "bg-sage text-ink", "bg-surface text-ink"];
export function VisionTool() {
  const c = useCopy(copy);
  const [cards, setCards] = useLocalDoc<Vision>("vision-board", NO_VISION);
  const [text, setText] = useState("");
  return (
    <Head title={c.vsTitle} lead={c.vsLead} wide>
      <form className="mt-5 flex flex-wrap items-end gap-3" onSubmit={(e) => { e.preventDefault(); if (text.trim()) { setCards((p) => [...p, { id: crypto.randomUUID(), text: text.trim(), tone: p.length % TONES.length }].slice(0, 40)); setText(""); } }}>
        <label className="min-w-0 flex-1"><span className="sr-only">{c.vsTitle}</span><input value={text} onChange={(e) => setText(e.target.value)} placeholder={c.vsPh} maxLength={60} className={inputClass} /></label><button className={buttonClass.primary}><Plus size={18} />{c.add}</button></form>
      {cards.length === 0 ? <Empty>{c.vsEmpty}</Empty> : <ul className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{cards.map((k) => <li key={k.id} className={`relative flex min-h-28 items-center justify-center rounded-lg border-[1.5px] border-ink p-4 text-center font-display text-xl font-semibold ${TONES[k.tone]}`}>{k.text}<button onClick={() => setCards((p) => p.filter((x) => x.id !== k.id))} aria-label={`${c.remove}: ${k.text}`} className="absolute right-1 top-1 grid h-9 w-9 place-items-center rounded hover:bg-black/10"><Trash2 size={16} /></button></li>)}</ul>}
      <p className="mt-4 text-sm text-muted">{c.vsNote}</p>
    </Head>
  );
}

type Audit = { id: string; date: string; act: string; cat: string; min: number }[];
const NO_AUDIT: Audit = [];
export function AuditTool() {
  const c = useCopy(copy);
  const [log, setLog] = useLocalDoc<Audit>("time-audit", NO_AUDIT);
  const [f, setF] = useState({ act: "", cat: "school", min: "30", date: today() });
  const now = today(), days = last7(now);
  const week = log.filter((e) => days.includes(e.date));
  const total = week.reduce((n, e) => n + e.min, 0);
  const by = Object.keys(c.cats).map((k) => ({ k, min: week.filter((e) => e.cat === k).reduce((n, e) => n + e.min, 0) })).filter((x) => x.min > 0).sort((a, b) => b.min - a.min);
  return (
    <Head title={c.auTitle} lead={c.auLead}>
      <form className="guide-card mt-5 grid gap-x-4 gap-y-3 p-5 sm:grid-cols-2 lg:grid-cols-[2fr_1.3fr_0.8fr_1fr_auto] lg:items-end" onSubmit={(e) => { e.preventDefault(); if (!f.act.trim()) return; setLog((p) => [{ id: crypto.randomUUID(), date: f.date || now, act: f.act.trim(), cat: f.cat, min: num(f.min, 1, 1440) }, ...p].slice(0, 300)); setF({ ...f, act: "" }); }}>
        <label><span className="block font-bold">{c.auAct}</span><input value={f.act} onChange={(e) => setF({ ...f, act: e.target.value })} maxLength={60} className={`${inputClass} mt-1`} /></label>
        <label><span className="block font-bold">{c.auCat}</span><select value={f.cat} onChange={(e) => setF({ ...f, cat: e.target.value })} className={`${inputClass} mt-1`}>{Object.entries(c.cats).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select></label>
        <label><span className="block font-bold">{c.auMin}</span><input type="number" min={1} max={1440} value={f.min} onChange={(e) => setF({ ...f, min: e.target.value })} className={`${inputClass} mt-1`} /></label>
        <label><span className="block font-bold">{c.dayL}</span><input type="date" value={f.date} max={now} onChange={(e) => setF({ ...f, date: e.target.value })} className={`${inputClass} mt-1`} /></label>
        <button className={buttonClass.primary}><Plus size={18} />{c.add}</button></form>
      {log.length === 0 ? <Empty>{c.auEmpty}</Empty> : (
        <><h2 className="mt-6 border-b-[1.5px] border-ink pb-1 text-2xl">{c.auWeek}</h2><p className="mt-1 font-bold text-teal">{c.auTotal(total)}</p>
          <ul className="mt-3 space-y-2">{by.map((x) => <li key={x.k}><div className="flex justify-between font-bold"><span>{c.cats[x.k]}</span><span>{Math.round(x.min / 6) / 10} {c.hrs}</span></div><div className="mt-1 h-3 overflow-hidden rounded-full border-[1.5px] border-ink bg-sunken" role="img" aria-label={`${c.cats[x.k]}: ${Math.round((x.min / total) * 100)}%`}><div className="h-full bg-teal" style={{ width: `${(x.min / total) * 100}%` }} /></div></li>)}</ul>
          <ul className="mt-5 divide-y-2 divide-dotted divide-line">{log.slice(0, 15).map((e) => <li key={e.id} className="flex items-center gap-3 py-2"><p className="min-w-0 flex-1"><span className="font-bold">{e.act}</span> <span className="text-muted">· {c.cats[e.cat]} · {e.min} {c.min} · {e.date}</span></p>{rm(e.act, c.remove, () => setLog((p) => p.filter((x) => x.id !== e.id)))}</li>)}</ul></>
      )}
    </Head>
  );
}

type Est = { id: string; task: string; guess: number; real: number | null }[];
const NO_EST: Est = [];
export function EstimatorTool() {
  const c = useCopy(copy);
  const [list, setList] = useLocalDoc<Est>("estimates", NO_EST);
  const [f, setF] = useState({ task: "", guess: "30" });
  const [real, setReal] = useState<Record<string, string>>({});
  const open = list.filter((e) => e.real === null), done = list.filter((e) => e.real !== null);
  const ratio = done.length >= 3 ? Math.round((done.reduce((n, e) => n + (e.real as number), 0) / done.reduce((n, e) => n + e.guess, 0)) * 100) : null;
  return (
    <Head title={c.esTitle} lead={c.esLead}>
      <form className="mt-5 flex flex-wrap items-end gap-3" onSubmit={(e) => { e.preventDefault(); if (!f.task.trim()) return; setList((p) => [{ id: crypto.randomUUID(), task: f.task.trim(), guess: num(f.guess, 1, 600), real: null }, ...p].slice(0, 200)); setF({ ...f, task: "" }); }}>
        <label className="min-w-0 flex-1"><span className="block font-bold">{c.esTask}</span><input value={f.task} onChange={(e) => setF({ ...f, task: e.target.value })} maxLength={80} className={`${inputClass} mt-1`} /></label>
        <label><span className="block font-bold">{c.esGuess}</span><input type="number" min={1} max={600} value={f.guess} onChange={(e) => setF({ ...f, guess: e.target.value })} className={`${inputClass} mt-1`} /></label><button className={buttonClass.primary}><Plus size={18} />{c.add}</button></form>
      {open.length ? <><h2 className="mt-6 text-2xl">{c.esOpen}</h2><ul className="mt-2 space-y-2">{open.map((e) => <li key={e.id} className="guide-card flex flex-wrap items-end gap-3 p-3"><p className="min-w-0 flex-1 font-bold">{e.task} <span className="font-normal text-muted">· {e.guess} {c.min}</span></p>
        <label><span className="sr-only">{c.esReal}: {e.task}</span><input type="number" min={1} max={1000} placeholder={c.esReal} value={real[e.id] ?? ""} onChange={(ev) => setReal({ ...real, [e.id]: ev.target.value })} className={`${inputClass} max-w-44`} /></label>
        <button onClick={() => { if (real[e.id]) setList((p) => p.map((x) => (x.id === e.id ? { ...x, real: num(real[e.id], 1, 1000) } : x))); }} aria-label={`${c.esSave}: ${e.task}`} className={buttonClass.secondary}>{c.esSave}</button>{rm(e.task, c.remove, () => setList((p) => p.filter((x) => x.id !== e.id)))}</li>)}</ul></> : null}
      {done.length ? <><h2 className="mt-6 text-2xl">{c.esDone}</h2><ul className="mt-2 divide-y-2 divide-dotted divide-line">{done.slice(0, 20).map((e) => <li key={e.id} className="flex items-center gap-3 py-2"><p className="min-w-0 flex-1"><span className="font-bold">{e.task}</span> <span className="text-muted">· {e.guess} → {e.real} {c.min}</span></p>{rm(e.task, c.remove, () => setList((p) => p.filter((x) => x.id !== e.id)))}</li>)}</ul></> : null}
      <p className="mt-5 font-bold text-teal" role="status">{ratio === null ? c.esNone : c.esAvg(ratio)}</p>
    </Head>
  );
}

const PARTS = ["morning", "afternoon", "evening", "night"] as const;
const NO_ENERGY: Record<string, number> = {};
export function EnergyTool() {
  const c = useCopy(copy);
  const [e, setE] = useLocalDoc<Record<string, number>>("energy", NO_ENERGY);
  const rated = PARTS.filter((p) => e[p]);
  const best = [...rated].sort((a, b) => e[b] - e[a])[0];
  return (
    <Head title={c.enTitle} lead={c.enLead}>
      <div className="mt-5 grid gap-4 md:grid-cols-2">{PARTS.map((p) => (
        <fieldset key={p} className="guide-card p-4"><legend className="px-1 text-xl font-bold">{c.parts[p]}</legend><p className="sr-only">{c.enRate}</p>
          <div className="mt-1 flex flex-wrap gap-2">{c.levels.map((lv, i) => <button key={lv} onClick={() => setE({ ...e, [p]: e[p] === i + 1 ? 0 : i + 1 })} aria-pressed={e[p] === i + 1} className={`rounded-full border-[1.5px] border-ink px-4 py-1.5 font-bold ${e[p] === i + 1 ? "bg-ink text-paper" : "bg-surface hover:bg-sunken"}`}>{lv}</button>)}</div></fieldset>))}</div>
      <p className="mt-5 font-display text-xl font-semibold text-teal" role="status">{best ? c.enBest(c.parts[best]) : c.enNone}</p>
      {e.night >= 3 ? <Callout>{c.enNoteLate}</Callout> : null}
    </Head>
  );
}

type Screen = { goal: number; log: Record<string, number> };
const NO_SCREEN: Screen = { goal: 120, log: {} };
export function ScreenTool() {
  const c = useCopy(copy);
  const [s, setS] = useLocalDoc<Screen>("screen-goal", NO_SCREEN);
  const now = today();
  const [val, setVal] = useState("");
  const todayMin = s.log[now];
  return (
    <Head title={c.scTitle} lead={c.scLead}>
      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <label><span className="block font-bold">{c.scGoal}</span><input type="number" min={0} max={1440} step={15} value={s.goal} onChange={(e) => setS({ ...s, goal: num(e.target.value, 0, 1440) })} className={`${inputClass} mt-1`} /></label>
        <form className="flex items-end gap-3" onSubmit={(e) => { e.preventDefault(); if (val !== "") { setS({ ...s, log: Object.fromEntries(Object.entries({ ...s.log, [now]: num(val, 0, 1440) }).sort().slice(-60)) }); setVal(""); } }}>
          <label className="min-w-0 flex-1"><span className="block font-bold">{c.scToday}</span><input type="number" min={0} max={1440} value={val} placeholder={todayMin !== undefined ? String(todayMin) : ""} onChange={(e) => setVal(e.target.value)} className={`${inputClass} mt-1`} /></label><button className={buttonClass.primary}>{c.scSave}</button></form></div>
      {todayMin !== undefined ? <p className="mt-4 font-display text-xl font-semibold text-teal" role="status">{todayMin <= s.goal ? c.scUnder : c.scOver(todayMin - s.goal)}</p> : null}
      <h2 className="mt-6 border-b-[1.5px] border-ink pb-1 text-2xl">{c.scWeek}</h2>
      <ul className="mt-2 divide-y-2 divide-dotted divide-line">{last7(now).reverse().map((d) => <li key={d} className="flex justify-between py-2"><span>{d}</span><span className={`font-bold ${s.log[d] !== undefined && s.log[d] > s.goal ? "text-ruby" : ""}`}>{s.log[d] !== undefined ? `${s.log[d]} ${c.min}` : c.scNone}</span></li>)}</ul>
      <Callout>{c.scHelp}</Callout>
    </Head>
  );
}

export function BurnoutTool() {
  const c = useCopy(copy);
  const [sleep] = useLocalDoc<Sleep[]>(SLEEP_KEY, NO_SLEEP);
  const [mood] = useLocalDoc<Mood[]>(MOOD_KEY, NO_MOODS);
  const [study] = useLocalDoc<Session[]>(SESSIONS_KEY, NO_SESSIONS);
  const [events] = useLocalDoc<SchoolEvent[]>(EVENTS_KEY, NO_EVENTS);
  const [hw] = useLocalDoc<Assignment[]>(HOMEWORK_KEY, NO_ASSIGNMENTS);
  const [blocks] = useLocalDoc<Block[]>(BLOCKS_KEY, NO_BLOCKS);
  const now = today(), days = last7(now);
  const hrs = sleep.filter((x) => days.includes(x.date)).map((x) => sleepHours(x.bed, x.wake)).filter((x): x is number => x !== null);
  const avgSleep = hrs.length ? hrs.reduce((n, x) => n + x, 0) / hrs.length : null;
  const lowMood = mood.filter((m) => days.includes(m.date) && m.mood <= 2).length;
  const wk = startOfWeek(now), end = addDays(wk, 6);
  const score = weekScore({ tests: events.filter((e) => e.kind === "test" && e.date >= wk && e.date <= end).length, projects: events.filter((e) => e.kind === "project" && e.date >= wk && e.date <= end).length, homework: hw.filter((h) => !h.done && h.due >= wk && h.due <= end).length, commitmentHours: blocks.filter((b) => b.kind !== "study").reduce((n, b) => n + blockHours(b), 0) });
  const weekLevel = levelOf(score);
  const studyMin = study.filter((x) => days.includes(x.date)).reduce((n, x) => n + x.minutes, 0);
  const restDays = days.filter((d) => !study.some((x) => x.date === d && x.minutes > 0)).length;
  const has = hrs.length > 0 || mood.some((m) => days.includes(m.date)) || studyMin > 0 || score > 0;
  const r = burnoutSignals({ avgSleep, lowMoodDays: lowMood, weekLevel, studyHours: studyMin / 60, restDays: study.some((x) => days.includes(x.date)) ? restDays : 7 });
  return (
    <Head title={c.buTitle} lead={c.buLead}>
      {!has ? <Empty>{c.noData}</Empty> : (
        <>
          <dl className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {[[c.buSleep, avgSleep === null ? "—" : `${Math.round(avgSleep * 10) / 10} ${c.hrs}`], [c.buMood, `${lowMood} ${c.of7}`], [c.buLoad, c.lv[weekLevel]], [c.buStudy, `${Math.round((studyMin / 60) * 10) / 10} ${c.hrs}`], [c.buRest, `${restDays} ${c.of7}`]].map(([k, v]) => <div key={k} className="guide-card p-3"><dt className="text-sm text-muted">{k}</dt><dd className="font-display text-2xl font-semibold">{v}</dd></div>)}</dl>
          <section className="guide-card mt-5 p-5"><h2 className="font-display text-3xl font-semibold">{c.lv[r.level]}</h2>
            {r.signals.length ? <ul className="mt-2 list-disc pl-6">{r.signals.map((s) => <li key={s}>{c.signals[s]}</li>)}</ul> : null}
            <p className="mt-3 max-w-prose text-lg">{c.tips[r.level]}</p></section>
        </>
      )}
      <a href="/t/wellbeing/contacts" className={`${buttonClass.secondary} mt-5 inline-flex`}>{c.help}</a>
    </Head>
  );
}

const NO_HOURS: Record<BalanceArea, string> = { school: "", activities: "", rest: "", friends: "" };
export function BalanceTool() {
  const c = useCopy(copy);
  const [h, setH] = useLocalDoc<Record<BalanceArea, string>>("balance", NO_HOURS);
  const hours = Object.fromEntries(BALANCE_AREAS.map((a) => [a, Number(h[a]) || 0])) as Record<BalanceArea, number>;
  const total = BALANCE_AREAS.reduce((n, a) => n + hours[a], 0);
  const share = balanceShares(hours);
  const smallest = [...BALANCE_AREAS].sort((a, b) => share[a] - share[b])[0];
  const colors: Record<BalanceArea, string> = { school: "bg-teal", activities: "bg-marigold", rest: "bg-sage", friends: "bg-ruby" };
  return (
    <Head title={c.blTitle} lead={c.blLead}>
      <div className="mt-5 grid gap-4 sm:grid-cols-2">{BALANCE_AREAS.map((a) => <label key={a}><span className="block font-bold">{c.areas[a]} ({c.blHrs})</span><input type="number" min={0} max={168} value={h[a]} onChange={(e) => setH({ ...h, [a]: e.target.value })} className={`${inputClass} mt-1`} /></label>)}</div>
      {total === 0 ? <Empty>{c.blEmpty}</Empty> : (
        <section className="mt-6">
          <div className="flex h-8 overflow-hidden rounded-full border-[1.5px] border-ink" role="img" aria-label={BALANCE_AREAS.map((a) => `${c.areas[a]} ${share[a]}%`).join(", ")}>{BALANCE_AREAS.map((a) => <div key={a} className={colors[a]} style={{ width: `${share[a]}%` }} />)}</div>
          <ul className="mt-3 grid gap-2 sm:grid-cols-2">{BALANCE_AREAS.map((a) => <li key={a} className="flex items-center gap-2"><span className={`inline-block h-4 w-4 rounded border border-ink ${colors[a]}`} aria-hidden /><span className="font-bold">{c.areas[a]}</span> {share[a]}%</li>)}</ul>
          <p className="mt-4 font-bold text-teal">{c.blLow(c.areas[smallest])}</p>
          {share.rest < 33 ? <Callout>{c.blRestLow}</Callout> : null}
        </section>
      )}
    </Head>
  );
}
