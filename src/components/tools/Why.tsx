"use client";
import { useLocalDoc } from "@/lib/local-doc";
import { useCopy } from "@/lib/use-copy";
import { inputClass, Page } from "../ui";

export const WHY_KEY = "my-why";
const copy = {
  en: { title: "My why", lead: "Write the reason behind your goals. When things get hard, this is what to come back to.", label: "Why do these goals matter to you?", ph: "I want to be the first in my family to finish college so I can help my community.", saved: "Saved on this device as you type.", prompts: "Not sure what to write? Try finishing one of these:", starters: ["I am working hard because…", "In five years I want to…", "The person I want to help is…"] },
  es: { title: "Mi razón", lead: "Escribe la razón detrás de tus metas. Cuando todo se ponga difícil, vuelve a esto.", label: "¿Por qué te importan estas metas?", ph: "Quiero ser el primero de mi familia en terminar la universidad para ayudar a mi comunidad.", saved: "Se guarda en este dispositivo mientras escribes.", prompts: "¿No sabes qué escribir? Intenta terminar una de estas frases:", starters: ["Me esfuerzo porque…", "En cinco años quiero…", "La persona a quien quiero ayudar es…"] },
};
export function WhyTool() {
  const c = useCopy(copy);
  const [why, setWhy] = useLocalDoc<string>(WHY_KEY, "");
  return (
    <Page>
      <h1 className="text-3xl sm:text-4xl">{c.title}</h1>
      <p className="mt-2 max-w-prose text-muted">{c.lead}</p>
      <label className="guide-card mt-6 block p-5"><span className="block font-bold">{c.label}</span>
        <textarea value={why} onChange={(e) => setWhy(e.target.value)} rows={6} maxLength={500} placeholder={c.ph} className={`${inputClass} mt-2`} />
        <span className="mt-2 block text-sm text-muted" role="status">{c.saved}</span></label>
      <p className="mt-5 font-bold">{c.prompts}</p>
      <ul className="mt-1 list-disc pl-6 text-lg">{c.starters.map((s) => <li key={s}><button onClick={() => setWhy((w) => (w ? `${w}\n${s} ` : `${s} `))} className="text-left text-teal underline underline-offset-4">{s}</button></li>)}</ul>
    </Page>
  );
}
