import generated from "@/data/bank/sat-generated.json";
import apGenerated from "@/data/bank/ap-generated.json";
import actGenerated from "@/data/bank/act-generated.json";
import tsiGenerated from "@/data/bank/tsi-generated.json";
import { ACT_SEED } from "@/data/bank/act-seed";
import { AP_SEED } from "@/data/bank/ap-seed";
import { SAT_SEED } from "@/data/bank/sat-seed";
import { TSI_SEED } from "@/data/bank/tsi-seed";
import type { Question } from "./types";

/** Starter questions plus any verified questions made by `npm run bank:generate`. Static, so tests work offline. */
const all: Question[] = [...SAT_SEED, ...ACT_SEED, ...TSI_SEED, ...AP_SEED, ...(generated as Question[]), ...(apGenerated as Question[]), ...(actGenerated as Question[]), ...(tsiGenerated as Question[])];
const byId = new Map(all.map((q) => [q.id, q]));

export const BANK: Question[] = all;
export const bankById = (): Map<string, Question> => { loadRuntime(); return byId; };
export const bankCount = (exam: Question["exam"], section?: string) => all.filter((q) => q.exam === exam && (!section || q.section === section)).length;

// Questions made on demand by the study path and mock exams. They live on this device (not synced), so a test in progress still works after a reload.
const RUNTIME_KEY = "rumbo:runtime-questions-v2"; // v2: only questions that passed the scope check
const RUNTIME_MAX = 240;
let runtimeLoaded = false;
function loadRuntime() {
  if (runtimeLoaded || typeof window === "undefined") return;
  runtimeLoaded = true;
  try { for (const q of JSON.parse(localStorage.getItem(RUNTIME_KEY) ?? "[]") as Question[]) if (q?.id && !byId.has(q.id)) byId.set(q.id, q); } catch { /* blocked or damaged: start empty */ }
}
export function registerQuestions(qs: Question[]) {
  loadRuntime();
  for (const q of qs) byId.set(q.id, q);
  try {
    const mine = [...byId.values()].filter((q) => q.id.startsWith("ai-") && q.scoped);
    localStorage.setItem(RUNTIME_KEY, JSON.stringify(mine.slice(-RUNTIME_MAX)));
  } catch { /* storage full or blocked: the questions still work this session */ }
}
export const runtimeQuestions = (): Question[] => { loadRuntime(); return [...byId.values()].filter((q) => q.id.startsWith("ai-") && q.scoped); };
