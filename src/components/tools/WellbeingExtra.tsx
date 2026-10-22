"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Pause, Play, RotateCcw } from "lucide-react";
import { useCopy } from "@/lib/use-copy";
import { buttonClass } from "../ui";
import { Callout, Head } from "./shared";

const PHASES = ["in", "hold1", "out", "hold2"] as const;
type Phase = (typeof PHASES)[number];

const copy = {
  en: {
    sTitle: "Stress tips", sLead: "Short things you can do when you feel stressed. Try one, and see if it helps.", breathe: "Box breathing", breatheLead: "Breathe in for 4, hold for 4, breathe out for 4, hold for 4. Do a few rounds.", start: "Start", pause: "Pause", reset: "Start over",
    phase: { in: "Breathe in", hold1: "Hold", out: "Breathe out", hold2: "Hold" } as Record<Phase, string>, rounds: (n: number) => `${n} ${n === 1 ? "round" : "rounds"} done`,
    tips: "More ideas", list: ["Ground yourself: name 5 things you see, 4 you can touch, 3 you hear, 2 you smell and 1 you taste.", "Write the worry down. Then write one small thing you can do about it.", "Break the task into one tiny step and do only that step.", "Move: walk, stretch or shake out your arms for two minutes.", "Drink some water and eat something if you are hungry.", "Talk to someone you trust. Saying it out loud often makes it smaller.", "Sleep matters. Try to put screens away 30 minutes before bed."],
    help: "If stress feels too big, or you feel unsafe, talk to a counselor, a teacher or a family member. You can also call or text 988 any time.", helpLink: "See help lines", note: "These tips are for everyday stress. They do not replace help from a professional.",
    bTitle: "Break ideas", bLead: "A good break helps you focus better after it. Pick one, and set the timer.", pickOne: "Give me an idea", timer: "Break timer", minutes: "minutes", go: "Start break", stop: "Stop", done: "Break is over. Ready to get back to it?", left: (m: number, s: number) => `${m}:${String(s).padStart(2, "0")} left`,
    groups: { move: "Move your body", mind: "Rest your mind", people: "Connect", reset: "Reset your space" } as Record<string, string>,
    ideas: { move: ["Stretch your neck, shoulders and back", "Walk around the room or outside", "Do 10 jumping jacks or squats", "Dance to one song"], mind: ["Close your eyes and take five slow breaths", "Look out a window at something far away", "Doodle or draw for a few minutes", "Listen to one calm song"], people: ["Chat with a friend or family member", "Text someone something kind", "Pet a pet, or look at photos that make you smile"], reset: ["Drink a glass of water", "Tidy your desk", "Open a window for fresh air", "Wash your face"] } as Record<string, string[]>,
    avoid: "Tip: scrolling a phone is not a real break for your brain. Try one of these instead.",
  },
  es: {
    sTitle: "Consejos para el estrés", sLead: "Cosas cortas que puedes hacer cuando te sientes estresado. Prueba una y mira si te ayuda.", breathe: "Respiración cuadrada", breatheLead: "Inhala 4, sostén 4, exhala 4, sostén 4. Haz unas cuantas rondas.", start: "Empezar", pause: "Pausar", reset: "Empezar de nuevo",
    phase: { in: "Inhala", hold1: "Sostén", out: "Exhala", hold2: "Sostén" } as Record<Phase, string>, rounds: (n: number) => `${n} ${n === 1 ? "ronda" : "rondas"} completas`,
    tips: "Más ideas", list: ["Conecta con tu entorno: nombra 5 cosas que ves, 4 que puedes tocar, 3 que oyes, 2 que hueles y 1 que saboreas.", "Escribe la preocupación. Luego escribe una cosa pequeña que puedes hacer al respecto.", "Divide la tarea en un paso pequeñito y haz solo ese paso.", "Muévete: camina, estírate o sacude los brazos por dos minutos.", "Toma agua y come algo si tienes hambre.", "Habla con alguien de confianza. Decirlo en voz alta muchas veces lo hace más pequeño.", "El sueño importa. Trata de guardar las pantallas 30 minutos antes de dormir."],
    help: "Si el estrés se siente demasiado grande, o te sientes inseguro, habla con un consejero, un maestro o un familiar. También puedes llamar o escribir al 988 a cualquier hora.", helpLink: "Ver líneas de ayuda", note: "Estos consejos son para el estrés de todos los días. No reemplazan la ayuda de un profesional.",
    bTitle: "Ideas para descansar", bLead: "Un buen descanso te ayuda a concentrarte mejor después. Elige uno y pon el temporizador.", pickOne: "Dame una idea", timer: "Temporizador de descanso", minutes: "minutos", go: "Empezar descanso", stop: "Detener", done: "Se acabó el descanso. ¿Listo para volver?", left: (m: number, s: number) => `Faltan ${m}:${String(s).padStart(2, "0")}`,
    groups: { move: "Mueve tu cuerpo", mind: "Descansa tu mente", people: "Conecta con otros", reset: "Reinicia tu espacio" } as Record<string, string>,
    ideas: { move: ["Estira el cuello, los hombros y la espalda", "Camina por el cuarto o afuera", "Haz 10 saltos de tijera o sentadillas", "Baila una canción"], mind: ["Cierra los ojos y respira lento cinco veces", "Mira por una ventana algo que esté lejos", "Garabatea o dibuja unos minutos", "Escucha una canción tranquila"], people: ["Platica con un amigo o familiar", "Mándale a alguien un mensaje amable", "Acaricia a una mascota o mira fotos que te hagan sonreír"], reset: ["Toma un vaso de agua", "Ordena tu escritorio", "Abre una ventana para que entre aire fresco", "Lávate la cara"] } as Record<string, string[]>,
    avoid: "Consejo: mirar el celular no es un descanso real para tu cerebro. Prueba una de estas ideas.",
  },
};

export function StressTool() {
  const c = useCopy(copy);
  const [running, setRunning] = useState(false);
  const [tick, setTick] = useState(0);
  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(id);
  }, [running]);
  const phase = PHASES[Math.floor(tick / 4) % 4], inPhase = (tick % 4) + 1, rounds = Math.floor(tick / 16);
  const big = phase === "in" ? inPhase / 4 : phase === "out" ? 1 - inPhase / 4 : phase === "hold1" ? 1 : 0;
  return (
    <Head title={c.sTitle} lead={c.sLead}>
      <section className="guide-card mt-6 p-6 text-center" aria-labelledby="bx-h">
        <h2 id="bx-h" className="text-2xl">{c.breathe}</h2><p className="mt-1 text-muted">{c.breatheLead}</p>
        <div className="mx-auto mt-5 grid h-48 w-48 place-items-center" aria-hidden>
          <div className="grid place-items-center rounded-full border-[1.5px] border-ink bg-teal text-on-teal transition-all duration-1000 ease-linear motion-reduce:transition-none" style={{ width: `${40 + (running ? big : 0) * 60}%`, height: `${40 + (running ? big : 0) * 60}%` }}>{running ? <span className="font-display text-3xl">{inPhase}</span> : null}</div>
        </div>
        <p className="mt-2 font-display text-2xl font-semibold" role="status" aria-live="polite">{running ? c.phase[phase] : ""}</p><p className="text-sm text-muted">{tick >= 16 ? c.rounds(rounds) : ""}</p>
        <div className="mt-3 flex justify-center gap-3">
          <button onClick={() => setRunning((r) => !r)} className={buttonClass.primary}>{running ? <Pause size={18} /> : <Play size={18} />}{running ? c.pause : c.start}</button>
          <button onClick={() => { setRunning(false); setTick(0); }} className={buttonClass.quiet}><RotateCcw size={18} />{c.reset}</button>
        </div>
      </section>
      <h2 className="mt-8 border-b-[1.5px] border-ink pb-1 text-2xl">{c.tips}</h2>
      <ul className="mt-3 list-disc space-y-2 pl-6 text-lg">{c.list.map((x) => <li key={x} className="max-w-prose">{x}</li>)}</ul>
      <Callout tone="warn"><p>{c.help}</p><p className="mt-2"><Link href="/t/wellbeing/contacts" className="font-bold text-teal underline underline-offset-4">{c.helpLink}</Link></p></Callout>
      <p className="mt-3 text-sm text-muted">{c.note}</p>
    </Head>
  );
}

export function BreaksTool() {
  const c = useCopy(copy);
  const [idea, setIdea] = useState<string | null>(null);
  const [mins, setMins] = useState(5);
  const [left, setLeft] = useState<number | null>(null);
  const endAt = useRef(0);
  useEffect(() => {
    if (left === null) return;
    const id = setInterval(() => { const r = Math.round((endAt.current - Date.now()) / 1000); setLeft(r > 0 ? r : 0); if (r <= 0) clearInterval(id); }, 500);
    return () => clearInterval(id);
  }, [left === null]); // eslint-disable-line react-hooks/exhaustive-deps
  const all = Object.values(c.ideas).flat();
  return (
    <Head title={c.bTitle} lead={c.bLead} wide>
      <div className="mt-5 grid gap-6 md:grid-cols-2">
        <section className="guide-card p-5"><button onClick={() => setIdea(all[Math.floor(Math.random() * all.length)])} className={buttonClass.primary}>{c.pickOne}</button>
          <p className="mt-4 min-h-[3.5rem] font-display text-2xl font-semibold text-teal" aria-live="polite">{idea ?? ""}</p><p className="text-sm text-muted">{c.avoid}</p></section>
        <section className="guide-card p-5"><h2 className="text-xl">{c.timer}</h2>
          <div className="mt-3 flex flex-wrap items-center gap-3"><label className="font-bold"><select value={mins} onChange={(e) => setMins(Number(e.target.value))} className="rounded-md border-[1.5px] border-ink bg-surface px-3 py-2 text-lg">{[2, 5, 10, 15].map((m) => <option key={m} value={m}>{m} {c.minutes}</option>)}</select></label>
            {left === null || left === 0 ? <button onClick={() => { endAt.current = Date.now() + mins * 60_000; setLeft(mins * 60); }} className={buttonClass.secondary}>{c.go}</button> : <button onClick={() => setLeft(null)} className={buttonClass.quiet}>{c.stop}</button>}</div>
          <p className="mt-3 font-display text-3xl font-semibold" role="timer" aria-live="off">{left ? c.left(Math.floor(left / 60), left % 60) : ""}</p><p className="font-bold text-teal" role="status">{left === 0 ? c.done : ""}</p></section>
      </div>
      <div className="mt-8 grid gap-4 md:grid-cols-2">{Object.keys(c.ideas).map((g) => <section key={g} className="guide-card p-4"><h2 className="text-xl">{c.groups[g]}</h2><ul className="mt-2 list-disc space-y-1 pl-6">{c.ideas[g].map((x) => <li key={x}>{x}</li>)}</ul></section>)}</div>
    </Head>
  );
}
