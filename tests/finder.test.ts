import { describe, expect, it } from "vitest";
import { buildPrompt, cacheKeyParts, extractJson, finalize, findRequestSchema, type FindRequest } from "../src/lib/ai/finder";
import { cleanUrl, isAgeAppropriate, scamReasons, urlKey } from "../src/lib/ai/safety";
import { collectSearched } from "../src/lib/ai/groq";
import { vi } from "vitest";
vi.mock("server-only", () => ({}));

const req: FindRequest = { query: "chess clubs", place: "Edinburg", grade: 7, interests: ["chess"], lang: "en", filters: {} };
const searched = [{ title: "Library", url: "https://www.edinburg.lib.tx.us/youth/chess?utm_source=x" }];
const listing = (over = {}) => ({
  title: "Youth chess club", organization: "Edinburg Library", description: "Weekly beginner chess.", category: "club",
  cost: "free", sourceUrl: "https://edinburg.lib.tx.us/youth/chess", whyFits: "You like chess.", ...over,
});

describe("extractJson", () => {
  it("finds JSON inside fences and chatter", () => {
    expect(extractJson('Sure!\n```json\n{"a":{"b":"}"}}\n``` hope that helps')).toEqual({ a: { b: "}" } });
  });
  it("returns null for broken or missing JSON", () => {
    expect(extractJson("no json here")).toBeNull();
    expect(extractJson('{"a": ')).toBeNull();
  });
});

describe("finalize: never show an invented listing as confirmed", () => {
  it("keeps a listing whose page the search actually returned (tracking junk and www ignored)", () => {
    const r = finalize({ listings: [listing()] }, searched, req)!;
    expect(r.listings).toHaveLength(1);
    expect(r.listings[0].sourceUrl).toBe("https://edinburg.lib.tx.us/youth/chess");
    expect(r.listings[0].category).toBe("club");
  });
  it("demotes a listing whose link was never in the search results", () => {
    const r = finalize({ listings: [listing({ sourceUrl: "https://totally-made-up.example.com/event" })] }, searched, req)!;
    expect(r.listings).toHaveLength(0);
    expect(r.notConfirmed.map((s) => s.name)).toContain("Edinburg Library");
    expect(r.droppedUnverified).toBe(1);
  });
  it("demotes a listing with no link at all", () => {
    const r = finalize({ listings: [listing({ sourceUrl: null })] }, searched, req)!;
    expect(r.listings).toHaveLength(0);
  });
  it("accepts a different page on a site the search did return", () => {
    const r = finalize({ listings: [listing({ sourceUrl: "https://edinburg.lib.tx.us/events" })] }, searched, req)!;
    expect(r.listings).toHaveLength(1);
  });
  it("drops listings that are not for minors, even with a real link", () => {
    const r = finalize({ listings: [listing({ title: "Casino dealer trainee" })] }, searched, req)!;
    expect(r.listings).toHaveLength(0);
  });
  it("flags scam patterns instead of hiding them", () => {
    const r = finalize({ listings: [listing({ description: "Pay a registration fee of $50 before you start. Send your social security number." })] }, searched, req)!;
    expect(r.listings[0].scam).toEqual(expect.arrayContaining(["upfront_fee", "private_info"]));
  });
  it("treats unknown or odd values safely", () => {
    const r = finalize({ listings: [listing({ category: "wizardry", cost: "maybe" })] }, searched, req)!;
    expect(r.listings[0].category).toBeNull();
    expect(r.listings[0].cost).toBe("unknown");
  });
  it("honors the free-only filter", () => {
    const paid = listing({ cost: "paid" });
    expect(finalize({ listings: [paid] }, searched, { ...req, filters: { freeOnly: true } })!.listings).toHaveLength(0);
  });
  it("returns null for output that is not the expected shape", () => {
    expect(finalize({ listings: "nope" }, searched, req)).toBeNull();
  });
});

describe("safety helpers", () => {
  it("cleans urls", () => {
    expect(cleanUrl("example.org/a?utm_source=z&x=1#top")).toBe("https://example.org/a?x=1");
    expect(cleanUrl("javascript:alert(1)")).toBeNull();
    expect(cleanUrl("not a url")).toBeNull();
    expect(urlKey("https://WWW.Example.org/a/")).toBe("example.org/a");
  });
  it("does not flag ordinary text", () => {
    expect(scamReasons("Free robotics camp. Lunch provided.")).toEqual([]);
    expect(isAgeAppropriate("Essex classic car show for families")).toBe(true);
    expect(isAgeAppropriate("Must be 21+ to attend")).toBe(false);
  });
});

describe("request handling", () => {
  it("validates and defaults the request", () => {
    const ok = findRequestSchema.safeParse({ query: "law internships" });
    expect(ok.success && ok.data.lang).toBe("en");
    expect(findRequestSchema.safeParse({ query: "x" }).success).toBe(false);
    expect(findRequestSchema.safeParse({ query: "ok query", filters: { category: "wizard" } }).success).toBe(false);
  });
  it("shares cache between equal questions but not between languages", () => {
    expect(cacheKeyParts({ ...req, query: "  Chess   Clubs " })).toBe(cacheKeyParts(req));
    expect(cacheKeyParts({ ...req, lang: "es" })).not.toBe(cacheKeyParts(req));
  });
  it("tells the model the rules and the student's language", () => {
    const p = buildPrompt({ ...req, lang: "es" });
    expect(p.system).toMatch(/NEVER invent/);
    expect(p.user).toMatch(/Spanish/);
  });
  it("finds search results anywhere in the provider reply", () => {
    const found = collectSearched({ executed_tools: [{ type: "search", search_results: { results: [{ title: "A", url: "https://a.org/x" }, { title: "B", url: "https://b.org/y" }] } }] });
    expect(found.map((f) => f.url)).toEqual(["https://a.org/x", "https://b.org/y"]);
  });
});
