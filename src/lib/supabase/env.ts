export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
export const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

/** False when the keys are missing, so the app shows a friendly message instead of crashing. */
export const hasSupabasePublic = () => Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);
