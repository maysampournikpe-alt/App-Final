// Grows the practice question bank. Run on YOUR computer, where Groq is reachable:
//
//   GROQ_API_KEY=... npm run bank:generate -- --section math --skill algebra --count 12
//   npm run bank:generate -- --all --per-skill 12        (every skill of both sections)
//
// Each question is checked three ways before it is saved: its structure, an independent solve by a
// second AI call that never sees the answer key, and a duplicate check. Rejected ones are thrown away.
// Review the diff of src/data/bank/sat-generated.json, then commit it.
import { createHash } from "node:crypto";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { AI } from "../src/config/ai";
import { EXAMS } from "../src/lib/exam/config";
import { extractJson } from "../src/lib/ai/finder";
import { buildGenPrompt, buildSolvePrompt, genBatch, normalizeStem, parseSolved, verifyQuestion, type GenSpec } from "../src/lib/exam/verify";
import type { Question } from "../src/lib/exam/types";

const OUT = new URL("../src/data/bank/sat-generated.json", import.meta.url);
const args = process.argv.slice(2);
const flag = (n: string) => args.includes(`--${n}`);
const opt = (n: string, d?: string) => { const i = args.indexOf(`--${n}`); return i >= 0 ? args[i + 1] : d; };

function loadKey(): string {
  if (process.env.GROQ_API_KEY) return process.env.GROQ_API_KEY;
  for (const f of [".env.local", ".env"]) if (existsSync(f)) {
    const m = /^GROQ_API_KEY=(.+)$/m.exec(readFileSync(f, "utf8"));
    if (m) return m[1].trim().replace(/^["']|["']$/g, "");
  }
  console.error("No GROQ_API_KEY. Put it in .env.local or run: GROQ_API_KEY=... npm run bank:generate");
  process.exit(1);
}
const KEY = loadKey();

async function chat(system: string, user: string, temperature: number): Promise<string> {
  for (let attempt = 1; attempt <= 3; attempt++) {
    const res = await fetch(`${AI.baseUrl}/chat/completions`, {
      method: "POST", headers: { Authorization: `Bearer ${KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({ model: AI.models.chat, temperature, messages: [{ role: "system", content: system }, { role: "user", content: user }] }),
      signal: AbortSignal.timeout(60_000),
    }).catch(() => null);
    if (res?.ok) return (await res.json()).choices?.[0]?.message?.content ?? "";
    if (res && res.status !== 429 && res.status < 500) throw new Error(`Groq ${res.status}: ${(await res.text()).slice(0, 200)}`);
    await new Promise((r) => setTimeout(r, 2000 * attempt)); // rate limited or busy: wait and retry
  }
  throw new Error("Groq kept failing; try again later");
}

const bank: Question[] = existsSync(OUT) ? JSON.parse(readFileSync(OUT, "utf8")) : [];
const seen = new Set(bank.map((q) => normalizeStem(q.stem)));
const dry = flag("dry");

async function run(spec: GenSpec) {
  const { system, user } = buildGenPrompt(spec);
  const reply = await chat(system, user, 0.8);
  const json = extractJson(reply);
  const parsed = json ? genBatch.safeParse(json) : null;
  if (!parsed?.success) { console.log(`  ${spec.section}/${spec.skill}: model reply was not usable, skipping a batch`); return { kept: 0, tossed: spec.count }; }
  let kept = 0, tossed = 0;
  for (const item of parsed.data.questions) {
    const dup = seen.has(normalizeStem(item.stem));
    const solve = buildSolvePrompt({ stem: item.stem, passage: item.passage, type: item.type, choices: item.choices });
    const solved = dup ? null : parseSolved(await chat(solve.system, solve.user, 0));
    const id = `sat-${spec.section}-g${createHash("sha1").update(item.stem).digest("hex").slice(0, 8)}`;
    const verdict = dup ? ({ ok: false, reason: "duplicate" } as const) : verifyQuestion(item, spec, solved, id);
    if (verdict.ok) { bank.push(verdict.question); seen.add(normalizeStem(item.stem)); kept++; } else { tossed++; console.log(`  rejected: ${verdict.reason}`); }
  }
  return { kept, tossed };
}

async function main() {
  const sat = EXAMS.sat.sections;
  const per = Number(opt("per-skill", opt("count", "8")));
  const diffs: (1 | 2 | 3)[] = [1, 2, 2, 3];
  const jobs: GenSpec[] = [];
  for (const sec of sat) for (const sk of sec.skills) {
    if (!flag("all") && (opt("section") !== sec.id || (opt("skill") && opt("skill") !== sk.id))) continue;
    // Batches of 4 so each reply stays small and checkable.
    for (let left = per, i = 0; left > 0; left -= 4, i++) jobs.push({ exam: "sat", section: sec.id, skill: sk.id, count: Math.min(4, left), difficulty: diffs[i % diffs.length] });
  }
  if (!jobs.length) { console.error("Nothing to do. Use --all, or --section math|rw [--skill algebra] --count 12"); process.exit(1); }
  console.log(`${jobs.length} batch(es), model ${AI.models.chat}${dry ? " (dry run, nothing will be saved)" : ""}`);
  let kept = 0, tossed = 0;
  for (const job of jobs) {
    console.log(`${job.section}/${job.skill} x${job.count} (difficulty ${job.difficulty})`);
    const r = await run(job); kept += r.kept; tossed += r.tossed;
    if (!dry) writeFileSync(OUT, JSON.stringify(bank, null, 2) + "\n"); // save as we go
  }
  console.log(`\nDone. Kept ${kept}, rejected ${tossed}. Bank now has ${bank.length} generated questions.`);
  console.log("Next: read through a sample, then git add src/data/bank/sat-generated.json && git commit && git push");
}
main().catch((e) => { console.error(e.message); process.exit(1); });
