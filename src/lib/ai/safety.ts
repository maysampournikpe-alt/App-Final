// Checks that run on every listing before a student sees it. Plain rules, no AI, so they are predictable.

const SCAM_PATTERNS: { re: RegExp; reason: "upfront_fee" | "private_info" | "unrealistic_pay" | "unusual_payment" | "pressure" }[] = [
  { re: /\b(registration|application|training|processing|starter kit|background check) fee of \$?\d+/i, reason: "upfront_fee" },
  { re: /\b(pay|send|wire|deposit)\b[^.]{0,40}\b(before|upfront|up front|to apply|to start)\b/i, reason: "upfront_fee" },
  { re: /\b(social security|ssn|bank account|routing number|credit card|passport number)\b/i, reason: "private_info" },
  { re: /\bearn\s+\$?\d{3,}\s*(\/|per|a)\s*(day|hour|week)\b|\bguaranteed (income|job|pay)\b|\bno experience needed\b.{0,40}\$\d{3,}/i, reason: "unrealistic_pay" },
  { re: /\b(gift cards?|crypto|bitcoin|zelle|cash ?app|venmo|western union|money order)\b/i, reason: "unusual_payment" },
  { re: /\b(act now|limited spots? left today|only \d+ spots? left|urgent(ly)? hiring)\b/i, reason: "pressure" },
];
export type ScamReason = (typeof SCAM_PATTERNS)[number]["reason"];

/** Reasons a listing looks risky. Empty means nothing obvious. Always a warning, never a verdict. */
export function scamReasons(...texts: (string | null | undefined)[]): ScamReason[] {
  const text = texts.filter(Boolean).join(" \n ");
  return [...new Set(SCAM_PATTERNS.filter((p) => p.re.test(text)).map((p) => p.reason))];
}

// Not suitable for ages 11 to 18. Whole words only, so "Essex" or "classic" never trip it.
const NOT_FOR_MINORS =
  /\b(casino|gambling|sportsbook|betting|sweepstakes|escort|adult entertainment|strip club|dating|hookup|vape|vaping|cannabis|marijuana|dispensary|alcohol|bartender|21\+|18\+ only|must be 18|must be 21|nsfw|only fans|onlyfans)\b/i;
export const isAgeAppropriate = (...texts: (string | null | undefined)[]) => !NOT_FOR_MINORS.test(texts.filter(Boolean).join(" \n "));

/** Adds a protocol if missing, only allows http(s), and removes tracking junk. Returns null if unusable. */
export function cleanUrl(raw: string | null | undefined): string | null {
  if (!raw) return null;
  try {
    const u = new URL(/^https?:\/\//i.test(raw.trim()) ? raw.trim() : `https://${raw.trim()}`);
    if (!/^https?:$/.test(u.protocol) || !u.hostname.includes(".")) return null;
    for (const k of [...u.searchParams.keys()]) if (/^(utm_|fbclid|gclid|mc_)/i.test(k)) u.searchParams.delete(k);
    u.hash = "";
    return u.toString();
  } catch {
    return null;
  }
}

/** Same page, different spelling: lowercase host without www, no trailing slash. */
export function urlKey(raw: string): string | null {
  const c = cleanUrl(raw);
  if (!c) return null;
  const u = new URL(c);
  return `${u.hostname.replace(/^www\./, "").toLowerCase()}${u.pathname.replace(/\/+$/, "")}${u.search}`;
}
