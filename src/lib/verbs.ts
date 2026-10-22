/** Spanish and English verb forms for the drills. Irregular forms are written out, not guessed. */

export type Tense = "present" | "preterite" | "future";
export const PERSONS = ["yo", "tú", "él / ella / usted", "nosotros", "ellos / ellas / ustedes"] as const;

const ENDINGS: Record<Tense, Record<"ar" | "er" | "ir", string[]>> = {
  present: { ar: ["o", "as", "a", "amos", "an"], er: ["o", "es", "e", "emos", "en"], ir: ["o", "es", "e", "imos", "en"] },
  preterite: { ar: ["é", "aste", "ó", "amos", "aron"], er: ["í", "iste", "ió", "imos", "ieron"], ir: ["í", "iste", "ió", "imos", "ieron"] },
  future: { ar: ["é", "ás", "á", "emos", "án"], er: ["é", "ás", "á", "emos", "án"], ir: ["é", "ás", "á", "emos", "án"] },
};

const IRREGULAR: Record<string, Partial<Record<Tense, string[]>>> = {
  ser: { present: ["soy", "eres", "es", "somos", "son"], preterite: ["fui", "fuiste", "fue", "fuimos", "fueron"] },
  estar: { present: ["estoy", "estás", "está", "estamos", "están"], preterite: ["estuve", "estuviste", "estuvo", "estuvimos", "estuvieron"] },
  ir: { present: ["voy", "vas", "va", "vamos", "van"], preterite: ["fui", "fuiste", "fue", "fuimos", "fueron"] },
  tener: { present: ["tengo", "tienes", "tiene", "tenemos", "tienen"], preterite: ["tuve", "tuviste", "tuvo", "tuvimos", "tuvieron"] },
  hacer: { present: ["hago", "haces", "hace", "hacemos", "hacen"], preterite: ["hice", "hiciste", "hizo", "hicimos", "hicieron"] },
  poder: { present: ["puedo", "puedes", "puede", "podemos", "pueden"], preterite: ["pude", "pudiste", "pudo", "pudimos", "pudieron"] },
  querer: { present: ["quiero", "quieres", "quiere", "queremos", "quieren"], preterite: ["quise", "quisiste", "quiso", "quisimos", "quisieron"] },
  decir: { present: ["digo", "dices", "dice", "decimos", "dicen"], preterite: ["dije", "dijiste", "dijo", "dijimos", "dijeron"] },
  venir: { present: ["vengo", "vienes", "viene", "venimos", "vienen"], preterite: ["vine", "viniste", "vino", "vinimos", "vinieron"] },
  ver: { present: ["veo", "ves", "ve", "vemos", "ven"], preterite: ["vi", "viste", "vio", "vimos", "vieron"] },
  dar: { present: ["doy", "das", "da", "damos", "dan"], preterite: ["di", "diste", "dio", "dimos", "dieron"] },
  saber: { present: ["sé", "sabes", "sabe", "sabemos", "saben"], preterite: ["supe", "supiste", "supo", "supimos", "supieron"] },
};
const FUTURE_STEM: Record<string, string> = { tener: "tendr", hacer: "har", poder: "podr", querer: "querr", decir: "dir", venir: "vendr", saber: "sabr" };

export const SPANISH_VERBS: { inf: string; en: string; irregular: boolean }[] = [
  { inf: "hablar", en: "to speak", irregular: false }, { inf: "caminar", en: "to walk", irregular: false }, { inf: "estudiar", en: "to study", irregular: false }, { inf: "trabajar", en: "to work", irregular: false },
  { inf: "comer", en: "to eat", irregular: false }, { inf: "beber", en: "to drink", irregular: false }, { inf: "correr", en: "to run", irregular: false },
  { inf: "vivir", en: "to live", irregular: false }, { inf: "escribir", en: "to write", irregular: false }, { inf: "abrir", en: "to open", irregular: false },
  ...Object.keys(IRREGULAR).map((inf) => ({ inf, en: ({ ser: "to be (permanent)", estar: "to be (state, place)", ir: "to go", tener: "to have", hacer: "to do, to make", poder: "to be able to", querer: "to want", decir: "to say, to tell", venir: "to come", ver: "to see", dar: "to give", saber: "to know (a fact)" } as Record<string, string>)[inf], irregular: true })),
];

export function conjugate(inf: string, tense: Tense): string[] | null {
  const irr = IRREGULAR[inf];
  if (tense === "future") {
    const stem = FUTURE_STEM[inf] ?? inf;
    if (!/(ar|er|ir)$/.test(inf)) return null;
    return ENDINGS.future.ar.map((e) => stem + e);
  }
  if (irr?.[tense]) return irr[tense]!;
  const m = inf.match(/(ar|er|ir)$/);
  if (!m) return null;
  const stem = inf.slice(0, -2), type = m[1] as "ar" | "er" | "ir";
  return ENDINGS[tense][type].map((e) => stem + e);
}

/** Past tense and past participle of common English irregular verbs. */
export const ENGLISH_IRREGULAR: { base: string; past: string; participle: string }[] = [
  ["be", "was / were", "been"], ["begin", "began", "begun"], ["break", "broke", "broken"], ["bring", "brought", "brought"], ["build", "built", "built"], ["buy", "bought", "bought"],
  ["catch", "caught", "caught"], ["choose", "chose", "chosen"], ["do", "did", "done"], ["drive", "drove", "driven"], ["eat", "ate", "eaten"], ["fall", "fell", "fallen"],
  ["find", "found", "found"], ["fly", "flew", "flown"], ["forget", "forgot", "forgotten"], ["give", "gave", "given"], ["go", "went", "gone"], ["grow", "grew", "grown"],
  ["have", "had", "had"], ["hide", "hid", "hidden"], ["keep", "kept", "kept"], ["know", "knew", "known"], ["leave", "left", "left"], ["make", "made", "made"],
  ["ride", "rode", "ridden"], ["ring", "rang", "rung"], ["run", "ran", "run"], ["say", "said", "said"], ["see", "saw", "seen"], ["sell", "sold", "sold"],
  ["sing", "sang", "sung"], ["sleep", "slept", "slept"], ["speak", "spoke", "spoken"], ["swim", "swam", "swum"], ["take", "took", "taken"], ["teach", "taught", "taught"],
  ["tell", "told", "told"], ["think", "thought", "thought"], ["throw", "threw", "thrown"], ["wear", "wore", "worn"], ["write", "wrote", "written"],
].map(([base, past, participle]) => ({ base, past, participle }));

/** Accepts either form when two are listed ("was / were"), ignoring case and spaces. */
export const sameForm = (answer: string, correct: string): boolean => {
  const a = answer.trim().toLowerCase();
  return !!a && correct.toLowerCase().split("/").map((x) => x.trim()).includes(a);
};
