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
  /** Seconds. Vercel Hobby functions can run longer than this, but students should not wait longer. */
  searchTimeoutSeconds: 50,
  chatTimeoutSeconds: 40,
  /** Sites that rarely hold a real, checkable listing. */
  excludeDomains: ["pinterest.com", "quora.com", "tiktok.com", "reddit.com", "facebook.com", "instagram.com"],
} as const;
