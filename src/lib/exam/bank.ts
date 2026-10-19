import generated from "@/data/bank/sat-generated.json";
import { SAT_SEED } from "@/data/bank/sat-seed";
import type { Question } from "./types";

/** Starter questions plus any verified questions made by `npm run bank:generate`. Static, so tests work offline. */
const all: Question[] = [...SAT_SEED, ...(generated as Question[])];
const byId = new Map(all.map((q) => [q.id, q]));

export const BANK: Question[] = all;
export const bankById = (): Map<string, Question> => byId;
export const bankCount = (exam: Question["exam"], section?: string) => all.filter((q) => q.exam === exam && (!section || q.section === section)).length;
