// Every model name lives here, so changing or swapping a provider is a one-line edit.
// Check console.groq.com/docs/models for current names; these are the ones I know of.
export const AI = {
  baseUrl: "https://api.groq.com/openai/v1",
  models: {
    /** Web search with sources. Used by the Opportunity Finder and For You. */
    search: "groq/compound",
    /** Faster, single search per request. */
    searchFast: "groq/compound-mini",
    /** Plain chat, no web: Coach, notes, quizzes, plans, JSON repair. */
    chat: "llama-3.3-70b-versatile",
  },
  /** Tried in order when the name above is not in the account. The app asks Groq which models exist. */
  fallbacks: {
    chat: ["openai/gpt-oss-120b", "openai/gpt-oss-20b", "meta-llama/llama-4-scout-17b-16e-instruct", "qwen/qwen3-32b", "llama-3.1-8b-instant"],
    search: ["groq/compound", "groq/compound-mini"],
  },
  /** Seconds. Vercel Hobby functions can run longer than this, but students should not wait longer. */
  searchTimeoutSeconds: 50,
  chatTimeoutSeconds: 40,
  /** Sites that rarely hold a real, checkable listing. */
  excludeDomains: ["pinterest.com", "quora.com", "tiktok.com", "reddit.com", "facebook.com", "instagram.com"],
} as const;
