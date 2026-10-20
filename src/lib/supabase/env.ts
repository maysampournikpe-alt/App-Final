/** The project address only: no trailing slash and no /rest/v1 tail, which people often copy by mistake. */
export const cleanSupabaseUrl = (raw: string) => raw.trim().replace(/\/+$/, "").replace(/\/rest\/v1$/i, "").replace(/\/+$/, "");

const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
export const SUPABASE_URL = cleanSupabaseUrl(rawUrl);
export const SUPABASE_ANON_KEY = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "").trim();

/** True when the pasted address had to be tidied. Shown (as yes/no only) on /api/health. */
export const SUPABASE_URL_WAS_MESSY = rawUrl !== "" && rawUrl !== SUPABASE_URL;

/** False when the keys are missing, so the app shows a friendly message instead of crashing. */
export const hasSupabasePublic = () => Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);
