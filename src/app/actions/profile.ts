"use server";
import { z } from "zod";
import { hasSupabaseServer, supabaseServer } from "@/lib/supabase/server";
import { INTEREST_IDS } from "@/config/interests";

const schema = z.object({
  grade: z.number().int().min(5).max(12).nullable().optional(),
  school: z.string().trim().max(80).optional(),
  lang: z.enum(["en", "es"]).optional(),
  interests: z.array(z.string().trim().min(1).max(40)).max(20).optional(),
  why: z.string().trim().max(300).optional(),
});

export type ProfileResult = { ok: true } | { ok: false; error: "unavailable" | "not_signed_in" | "invalid_input" | "unknown" };

export async function updateProfile(input: z.input<typeof schema>): Promise<ProfileResult> {
  if (!hasSupabaseServer()) return { ok: false, error: "unavailable" };
  const parsed = schema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "invalid_input" };
  const supabase = await supabaseServer();
  const { data } = await supabase.auth.getUser();
  if (!data.user) return { ok: false, error: "not_signed_in" };

  const patch: Record<string, unknown> = { ...parsed.data };
  if (parsed.data.interests) {
    // Known interests keep their ids. Custom ones are kept as plain text.
    patch.interests = [...new Set(parsed.data.interests.map((i) => (INTEREST_IDS.has(i) ? i : i.slice(0, 40))))];
  }
  const { error } = await supabase.from("profiles").update(patch).eq("id", data.user.id);
  return error ? { ok: false, error: "unknown" } : { ok: true };
}
