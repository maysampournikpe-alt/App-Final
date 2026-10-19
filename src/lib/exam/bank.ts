import generated from "@/data/bank/sat-generated.json";
import { ACT_SEED } from "@/data/bank/act-seed";
import { AP_SEED } from "@/data/bank/ap-seed";
import { SAT_SEED } from "@/data/bank/sat-seed";
import { TSI_SEED } from "@/data/bank/tsi-seed";
import type { Question } from "./types";

/** Starter questions plus any verified questions made by `npm run bank:generate`. Static, so tests work offline. */
const all: Question[] = [...SAT_SEED, ...ACT_SEED, ...TSI_SEED, ...AP_SEED, ...(generated as Question[])];
const byId = new Map(all.map((q) => [q.id, q]));

export const BANK: Question[] = all;
export const bankById = (): Map<string, Question> => byId;
export const bankCount = (exam: Question["exam"], section?: string) => all.filter((q) => q.exam === exam && (!section || q.section === section)).length;
