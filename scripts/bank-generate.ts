// Grows the practice question bank. Run on YOUR computer, where Groq is reachable:
//
//   GROQ_API_KEY=... npm run bank:generate -- --section math --skill algebra --count 12      (SAT, the default)
//   npm run bank:generate -- --exam ap --section ap-biology --skill u3 --count 12            (one AP unit)
//   npm run bank:generate -- --exam ap --section ap-biology --per-skill 12                   (every unit of one AP course)
//   npm run bank:generate -- --exam ap --section ap-biology --topics --per-skill 4           (every topic, like 1.1 and 1.2)
//   npm run bank:generate -- --exam sat --all --topics --level exam --per-skill 4              (real-exam-style, every sub-skill)
//   npm run bank:generate -- --exam act --all --per-skill 8                                  (the whole ACT)
//   npm run bank:generate -- --exam tsi --all --per-skill 8
//   npm run bank:generate -- --exam ap --all --per-skill 10                                  (every AP course: a lot of calls)
//   npm run bank:generate -- --list                                                          (show exams, courses and units)
//
// The PSAT practices from the SAT bank, so generate with --exam sat.
//
// Each question is checked three ways before it is saved: its structure, an independent solve by a
// second AI call that never sees the answer key, and a duplicate check. Rejected ones are thrown away.
// Review the diff of src/data/bank/sat-generated.json, then commit it.
import { createHash } from "node:crypto";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { AI } from "../src/config/ai";
import { coursesFor } from "../src/lib/exam/courses";
import { EXAMS } from "../src/lib/exam/config";
import { LEVELS, specFor, type Level } from "../src/lib/exam/levels";
import { extractJson } from "../src/lib/ai/finder";
import { buildGenPrompt, buildScopePrompt, buildSolvePrompt, genBatch, normalizeStem, parseScope, parseSolved, topicOf, verifyQuestion, type GenSpec } from "../src/lib/exam/verify";
import type { Question } from "../src/lib/exam/types";

const args = process.argv.slice(2);
const EXAM = (args.includes("--exam") ? args[args.indexOf("--exam") + 1] : "sat") as GenSpec["exam"];
if (!["sat", "act", "tsi", "ap"].includes(EXAM)) { console.error("--exam must be sat, act, tsi or ap"); process.exit(1); }
const OUT = new URL(`../src/data/bank/${EXAM}-generated.json`, import.meta.url);
const flag = (n: string) => args.includes(`--${n}`);
const opt = (n: string, d?: string) => { const i = args.indexOf(`--${n}`); return i >= 0 ? args[i + 1] : d; };

if (args.includes("--list")) {
  for (const id of ["sat", "act", "tsi"] as const) console.log(`${id}: ` + EXAMS[id].sections.map((x) => `${x.id}[${x.skills.map((k) => k.id).join(",")}]`).join(" "));
  for (const c of coursesFor("ap")) console.log(`ap ${c.id}: ${c.units.map((u) => u.id).join(",")}`);
  process.exit(0);
}

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

// The model name in config may not exist for this key. Try the fallbacks in order and keep the first that works.
const MODELS: string[] = [AI.models.chat, ...AI.fallbacks.chat];
let modelAt = 0;

/** Thrown when Groq says to come back much later (a daily limit), so the run stops cleanly and keeps what it saved. */
class QuotaStop extends Error {}
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
const MAX_WAIT_SECONDS = 120; // a longer wait than this means a daily limit, not a passing rate limit

async function chat(system: string, user: string, temperature: number): Promise<string> {
  for (let attempt = 1; attempt <= 8; attempt++) {
    const res = await fetch(`${AI.baseUrl}/chat/completions`, {
      method: "POST", headers: { Authorization: `Bearer ${KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({ model: MODELS[modelAt], temperature, messages: [{ role: "system", content: system }, { role: "user", content: user }] }),
      signal: AbortSignal.timeout(90_000),
    }).catch(() => null);
    if (res?.ok) return (await res.json()).choices?.[0]?.message?.content ?? "";
    if (res && (res.status === 404 || res.status === 400) && modelAt < MODELS.length - 1) {
      const text = await res.text();
      if (/model/i.test(text)) { console.log(`  model ${MODELS[modelAt]} is not available for this key, trying ${MODELS[modelAt + 1]}`); modelAt++; attempt--; continue; }
      throw new Error(`Groq ${res.status}: ${text.slice(0, 200)}`);
    }
    if (res && res.status !== 429 && res.status < 500) throw new Error(`Groq ${res.status}: ${(await res.text()).slice(0, 200)}`);
    // Rate limited or busy: wait as long as Groq says (retry-after), else back off, then try again.
    const told = res ? Number(res.headers.get("retry-after")) : NaN;
    if (Number.isFinite(told) && told > MAX_WAIT_SECONDS) throw new QuotaStop(`Groq asked us to wait ${Math.round(told / 60)} minutes (probably a daily limit)`);
    const wait = Number.isFinite(told) && told > 0 ? told + 1 : Math.min(60, 4 * 2 ** (attempt - 1));
    console.log(`  Groq is busy or rate limited (${res?.status ?? "no reply"}), waiting ${Math.round(wait)}s (try ${attempt} of 8)`);
    await sleep(wait * 1000);
  }
  throw new Error("Groq kept failing after 8 tries");
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
    const id = `${spec.exam}-${spec.section}-g${createHash("sha1").update(item.stem).digest("hex").slice(0, 8)}`;
    let scope: "in" | "out" | null = null;
    if (!dup && solved) { const sp = buildScopePrompt(spec, item); scope = parseScope(await chat(sp.system, sp.user, 0)); }
    const verdict = dup ? ({ ok: false, reason: "duplicate" } as const) : verifyQuestion(item, spec, solved, id, scope);
    if (verdict.ok) { bank.push(verdict.question); seen.add(normalizeStem(item.stem)); kept++; } else { tossed++; console.log(`  rejected: ${verdict.reason}`); }
  }
  return { kept, tossed };
}

async function main() {
  const sections = coursesFor(EXAM).map((c) => ({ id: c.id, skills: c.units }));
  const per = Number(opt("per-skill", opt("count", "8")));
  const level = opt("level", "mixed") as Level;
  if (!LEVELS.includes(level)) { console.error("--level must be one of " + LEVELS.join(", ")); process.exit(1); }
  const jobs: GenSpec[] = [];
  for (const sec of sections) for (const sk of sec.skills) {
    if (!flag("all") && (opt("section") !== sec.id || (opt("skill") && opt("skill") !== sk.id))) continue;
    if (!topicOf(EXAM, sec.id, sk.id)) continue;
    // AP with --topics: one set of jobs per topic (1.1, 1.2, ...), so every topic quiz has its own questions.
    const topics = flag("topics") ? (sk as { topics: { id: string }[] }).topics.map((t) => t.id) : [undefined];
    for (const topic of topics) {
      // Batches of 4 so each reply stays small and checkable.
      for (let left = per, i = 0; left > 0; left -= 4, i++) jobs.push({ exam: EXAM, section: sec.id, skill: sk.id, ...(topic ? { topic } : {}), count: Math.min(4, left), ...specFor(level, i) });
    }
  }
  if (!jobs.length) { console.error("Nothing to do. Use --all, or --section <id> [--skill <id>] --count 12 (see --list), with --exam sat|act|tsi|ap"); process.exit(1); }
  const maxBatches = Number(opt("max-batches", "0"));
  if (maxBatches && jobs.length > maxBatches) { console.error(`That is ${jobs.length} batches, more than the limit of ${maxBatches}. Pick one section, a smaller per-skill number, or turn topics off.`); process.exit(1); }
  console.log(`${jobs.length} batch(es), starting with model ${MODELS[0]}${dry ? " (dry run, nothing will be saved)" : ""}`);
  let kept = 0, tossed = 0, failed = 0, failedInARow = 0;
  for (const job of jobs) {
    console.log(`${job.section}/${job.skill}${job.topic ? `/${job.topic}` : ""} x${job.count} (difficulty ${job.difficulty}${job.style ? ", real exam style" : ""})`);
    try {
      const r = await run(job); kept += r.kept; tossed += r.tossed; failedInARow = 0;
    } catch (e) {
      if (e instanceof QuotaStop) { console.log(`\nStopping: ${e.message}. Everything saved so far is kept.`); break; }
      failedInARow++; failed++;
      console.log(`  skipped this batch: ${(e as Error).message}`);
      if (failedInARow >= 5) { console.log("\nStopping: five batches in a row failed. Everything saved so far is kept."); break; }
    }
    if (!dry) writeFileSync(OUT, JSON.stringify(bank, null, 2) + "\n"); // save as we go
  }
  console.log(`\nDone. Kept ${kept}, rejected ${tossed}${failed ? `, ${failed} batches skipped` : ""}. Bank now has ${bank.length} generated questions.`);
  console.log(`Next: read through a sample, then git add src/data/bank/${EXAM}-generated.json && git commit && git push`);
}
main().catch((e) => { console.error(e.message); process.exit(1); });
