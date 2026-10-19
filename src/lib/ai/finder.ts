import { z } from "zod";
import { cleanUrl, isAgeAppropriate, scamReasons, urlKey, type ScamReason } from "./safety";

export const CATEGORIES = [
  "job", "internship", "academic-competition", "sports-competition", "event", "volunteer",
  "club", "scholarship", "summer-program", "camp", "course", "certification",
] as const;
export type Category = (typeof CATEGORIES)[number];

export interface FindRequest {
  query: string;
  place: string; // city or ZIP, typed by the student
  grade: number | null;
  interests: string[];
  lang: "en" | "es";
  filters: { category?: Category; freeOnly?: boolean; paidOnly?: boolean; mode?: "online" | "in-person" };
}

export const findRequestSchema = z.object({
  query: z.string().trim().min(2).max(200),
  place: z.string().trim().max(80).default(""),
  grade: z.number().int().min(5).max(12).nullable().default(null),
  interests: z.array(z.string().trim().max(40)).max(10).default([]),
  lang: z.enum(["en", "es"]).default("en"),
  filters: z.object({
    category: z.enum(CATEGORIES).optional(),
    freeOnly: z.boolean().optional(),
    paidOnly: z.boolean().optional(),
    mode: z.enum(["online", "in-person"]).optional(),
  }).default({}),
});

/** What the model is asked to return. Everything is optional-ish because models drift. */
const modelListing = z.object({
  title: z.string().min(2).max(160),
  organization: z.string().max(160).nullish(),
  description: z.string().max(600).nullish(),
  category: z.string().nullish(),
  cost: z.string().nullish(), // "free" | "paid" | "unknown" (loosely)
  costNote: z.string().max(160).nullish(),
  grades: z.string().max(60).nullish(),
  dates: z.string().max(120).nullish(),
  deadline: z.string().max(60).nullish(),
  location: z.string().max(160).nullish(),
  online: z.boolean().nullish(),
  distance: z.string().max(60).nullish(),
  transit: z.string().max(120).nullish(),
  sourceUrl: z.string().max(500).nullish(),
  whyFits: z.string().max(240).nullish(),
});
const modelSuggestion = z.object({
  name: z.string().min(2).max(160),
  why: z.string().max(300).nullish(),
  contact: z.string().max(160).nullish(),
});
export const modelOutputSchema = z.object({
  listings: z.array(modelListing).max(20).default([]),
  notConfirmed: z.array(modelSuggestion).max(8).default([]),
  emailScript: z.string().max(1200).nullish(),
  phoneScript: z.string().max(800).nullish(),
});

export interface Listing {
  id: string;
  title: string;
  organization: string | null;
  description: string | null;
  category: Category | null;
  cost: "free" | "paid" | "unknown";
  costNote: string | null;
  grades: string | null;
  dates: string | null;
  deadline: string | null;
  location: string | null;
  online: boolean | null;
  distance: string | null;
  transit: string | null;
  sourceUrl: string;
  whyFits: string | null;
  scam: ScamReason[];
}
export interface Suggestion { name: string; why: string | null; contact: string | null }
export interface FindResult {
  listings: Listing[];
  notConfirmed: Suggestion[];
  emailScript: string | null;
  phoneScript: string | null;
  sources: { title: string; url: string }[];
  droppedUnverified: number;
}

export function buildPrompt(req: FindRequest): { system: string; user: string } {
  const f = req.filters;
  const lines = [
    `Student request: "${req.query}"`,
    `Location: ${req.place || "not given (prefer online options, and say so)"}`,
    req.grade ? `Grade: ${req.grade}` : "Grade: not given",
    req.interests.length ? `Interests: ${req.interests.join(", ")}` : "",
    f.category ? `Only this category: ${f.category}` : "",
    f.freeOnly ? "Only free opportunities." : "",
    f.paidOnly ? "Only paid opportunities (jobs that pay)." : "",
    f.mode === "online" ? "Online only." : f.mode === "in-person" ? "In person only." : "",
    `Write every text field in ${req.lang === "es" ? "Spanish (natural, as spoken in South Texas)" : "English"}.`,
  ].filter(Boolean);
  return {
    system: [
      "You find real opportunities for students aged 11 to 18 in the Rio Grande Valley of South Texas, and online.",
      "Search the public web. Prefer .gov, .edu, .org, school district, city, county and library sites.",
      "RULES:",
      "1. NEVER invent a listing. Include a listing only if you found it on a real web page, and put that exact page address in sourceUrl.",
      "2. If you cannot find a confirmed listing for something, do not put it in listings. Put real organizations that might offer it in notConfirmed, with why to ask them.",
      "3. Unknown details must be null. Never guess dates, costs or deadlines.",
      "4. Only opportunities appropriate for minors. Skip anything that asks for money upfront or for sensitive personal information.",
      `5. category must be one of: ${CATEGORIES.join(", ")}.`,
      "6. cost is \"free\", \"paid\" (the student pays) or \"unknown\". Paid jobs that pay the student are cost \"free\" with costNote \"Paid job\".",
      "7. whyFits is one short sentence tying the listing to the student's request, grade or interests.",
      "8. Give at most 8 listings, best matches first.",
      "9. emailScript is a short, polite email a student could send to a notConfirmed organization. phoneScript is a short call script. Both are generic enough to reuse, with [Your name] style placeholders.",
      "Reply with ONLY one JSON object, no markdown, in this shape:",
      '{"listings":[{"title":"","organization":"","description":"","category":"","cost":"","costNote":"","grades":"","dates":"","deadline":"","location":"","online":false,"distance":"","transit":"","sourceUrl":"","whyFits":""}],"notConfirmed":[{"name":"","why":"","contact":""}],"emailScript":"","phoneScript":""}',
    ].join("\n"),
    user: lines.join("\n"),
  };
}

/** Pulls the first balanced JSON object out of text, tolerating code fences and chatter. */
export function extractJson(text: string): unknown | null {
  const start = text.indexOf("{");
  if (start < 0) return null;
  let depth = 0, inStr = false, esc = false;
  for (let i = start; i < text.length; i++) {
    const ch = text[i];
    if (inStr) { if (esc) esc = false; else if (ch === "\\") esc = true; else if (ch === '"') inStr = false; continue; }
    if (ch === '"') inStr = true;
    else if (ch === "{") depth++;
    else if (ch === "}" && --depth === 0) {
      try { return JSON.parse(text.slice(start, i + 1)); } catch { return null; }
    }
  }
  return null;
}

const norm = (s: string | null | undefined) => (s ?? "").trim() || null;
const asCategory = (c: string | null | undefined): Category | null =>
  (CATEGORIES as readonly string[]).includes((c ?? "").toLowerCase().trim()) ? ((c as string).toLowerCase().trim() as Category) : null;
const asCost = (c: string | null | undefined): Listing["cost"] => {
  const v = (c ?? "").toLowerCase();
  return v.startsWith("free") ? "free" : v.startsWith("paid") ? "paid" : "unknown";
};

/**
 * Turns the model's answer into what students see. The important rule lives here, in code:
 * a listing is confirmed only if its source link is a page the web search actually returned.
 * Anything else is demoted to "not confirmed" instead of being shown as a real listing.
 */
export function finalize(raw: unknown, searched: { title: string; url: string }[], req: FindRequest): FindResult | null {
  const parsed = modelOutputSchema.safeParse(raw);
  if (!parsed.success) return null;
  const real = new Set(searched.map((s) => urlKey(s.url)).filter(Boolean) as string[]);
  const realHosts = new Set([...real].map((k) => k.split("/")[0]));

  const listings: Listing[] = [];
  const demoted: Suggestion[] = [];
  let dropped = 0;
  for (const [i, l] of parsed.data.listings.entries()) {
    const text = [l.title, l.organization, l.description, l.costNote];
    if (!isAgeAppropriate(...text)) { dropped++; continue; }
    const url = cleanUrl(l.sourceUrl);
    const key = url ? urlKey(url) : null;
    // Exact page seen in search results, or at least the same site (some results are the site's home page).
    const verified = !!key && (real.has(key) || realHosts.has(key.split("/")[0]));
    if (!url || !verified) {
      dropped++;
      if (l.organization || l.title) demoted.push({ name: l.organization || l.title, why: norm(l.description), contact: null });
      continue;
    }
    const cost = asCost(l.cost);
    if (req.filters.freeOnly && cost === "paid") continue;
    if (req.filters.paidOnly && !/paid job|pays|wage|salary|stipend/i.test(`${l.costNote ?? ""} ${l.description ?? ""}`)) continue;
    listings.push({
      id: `${key}#${i}`,
      title: l.title.trim(), organization: norm(l.organization), description: norm(l.description),
      category: asCategory(l.category), cost, costNote: norm(l.costNote), grades: norm(l.grades),
      dates: norm(l.dates), deadline: norm(l.deadline), location: norm(l.location), online: l.online ?? null,
      distance: norm(l.distance), transit: norm(l.transit), sourceUrl: url, whyFits: norm(l.whyFits),
      scam: scamReasons(l.title, l.description, l.costNote, l.organization),
    });
  }
  const seen = new Set<string>();
  const notConfirmed = [...parsed.data.notConfirmed.map((s) => ({ name: s.name.trim(), why: norm(s.why), contact: norm(s.contact) })), ...demoted]
    .filter((s) => isAgeAppropriate(s.name, s.why) && !seen.has(s.name.toLowerCase()) && seen.add(s.name.toLowerCase()))
    .slice(0, 8);
  return {
    listings: listings.slice(0, 8),
    notConfirmed,
    emailScript: norm(parsed.data.emailScript),
    phoneScript: norm(parsed.data.phoneScript),
    sources: searched.slice(0, 12),
    droppedUnverified: dropped,
  };
}

/** Cache key: the same question from two students shares one answer. No personal data in it. */
export function cacheKeyParts(req: FindRequest): string {
  const f = req.filters;
  return JSON.stringify([
    req.query.toLowerCase().replace(/\s+/g, " ").trim(), req.place.toLowerCase().trim(), req.lang,
    req.grade ?? null, f.category ?? null, !!f.freeOnly, !!f.paidOnly, f.mode ?? null,
  ]);
}
