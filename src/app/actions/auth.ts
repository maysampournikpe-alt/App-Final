"use server";
import { z } from "zod";
import { allow, clientIp } from "@/lib/rate-limit";
import {
  checkPassword, checkUsername, normalizeUsername, usernameToEmail, type AuthErrorCode,
} from "@/lib/auth/rules";
import { generateRecoveryCode, hashRecoveryCode, recoveryCodeMatches } from "@/lib/auth/recovery";
import { hasSupabaseServer, supabaseAdmin, supabaseServer } from "@/lib/supabase/server";

export type AuthResult =
  | { ok: true; recoveryCode?: string }
  | { ok: false; error: AuthErrorCode };

const fail = (error: AuthErrorCode): AuthResult => ({ ok: false, error });

const signUpSchema = z.object({
  username: z.string().max(60),
  password: z.string().max(200),
  grade: z.number().int().min(5).max(12).nullable(),
  lang: z.enum(["en", "es"]),
});

export async function signUp(input: z.input<typeof signUpSchema>): Promise<AuthResult> {
  if (!hasSupabaseServer()) return fail("unavailable");
  const parsed = signUpSchema.safeParse(input);
  if (!parsed.success) return fail("invalid_input");
  const { password, grade, lang } = parsed.data;
  const username = normalizeUsername(parsed.data.username);

  const bad = checkUsername(username) ?? checkPassword(password, username);
  if (bad) return fail(bad);

  const ip = await clientIp();
  if (!(await allow(`signup:ip:${ip}`, 6, 3600))) return fail("rate_limited");

  const admin = supabaseAdmin();
  const created = await admin.auth.admin.createUser({
    email: usernameToEmail(username),
    password,
    email_confirm: true,
    user_metadata: { username },
  });
  if (created.error || !created.data.user) {
    return fail(/already|registered|exists/i.test(created.error?.message ?? "") ? "username_taken" : "unknown");
  }
  const userId = created.data.user.id;

  const code = generateRecoveryCode();
  const profile = await admin.from("profiles").insert({ id: userId, username, grade, lang });
  const stored = profile.error
    ? { error: profile.error }
    : await admin.from("recovery_codes").insert({ user_id: userId, code_hash: hashRecoveryCode(code) });
  if (stored.error) {
    await admin.auth.admin.deleteUser(userId); // roll back so the name is not stuck
    return fail(/duplicate|unique/i.test(stored.error.message) ? "username_taken" : "unknown");
  }

  const session = await (await supabaseServer()).auth.signInWithPassword({ email: usernameToEmail(username), password });
  if (session.error) return fail("unknown");
  return { ok: true, recoveryCode: code };
}

const signInSchema = z.object({ username: z.string().max(60), password: z.string().max(200) });

export async function signIn(input: z.input<typeof signInSchema>): Promise<AuthResult> {
  if (!hasSupabaseServer()) return fail("unavailable");
  const parsed = signInSchema.safeParse(input);
  if (!parsed.success) return fail("invalid_input");
  const username = normalizeUsername(parsed.data.username);
  const ip = await clientIp();
  // Count by address and by name, so one student cannot be locked out by strangers on many addresses
  // without also tripping the address limit.
  if (!(await allow(`signin:ip:${ip}`, 20, 600)) || !(await allow(`signin:user:${username}`, 10, 600))) {
    return fail("rate_limited");
  }
  const { error } = await (await supabaseServer()).auth.signInWithPassword({
    email: usernameToEmail(username),
    password: parsed.data.password,
  });
  return error ? fail("bad_credentials") : { ok: true };
}

export async function signOut(): Promise<AuthResult> {
  if (!hasSupabaseServer()) return fail("unavailable");
  await (await supabaseServer()).auth.signOut();
  return { ok: true };
}

const recoverSchema = z.object({
  username: z.string().max(60),
  code: z.string().max(60),
  newPassword: z.string().max(200),
});

/** Sets a new password with the recovery code, then issues a fresh code. */
export async function recoverAccount(input: z.input<typeof recoverSchema>): Promise<AuthResult> {
  if (!hasSupabaseServer()) return fail("unavailable");
  const parsed = recoverSchema.safeParse(input);
  if (!parsed.success) return fail("invalid_input");
  const username = normalizeUsername(parsed.data.username);
  const badPassword = checkPassword(parsed.data.newPassword, username);
  if (badPassword) return fail(badPassword);

  const ip = await clientIp();
  if (!(await allow(`recover:ip:${ip}`, 10, 3600)) || !(await allow(`recover:user:${username}`, 5, 3600))) {
    return fail("rate_limited");
  }

  const admin = supabaseAdmin();
  const profile = await admin.from("profiles").select("id").eq("username", username).maybeSingle();
  const stored = profile.data
    ? await admin.from("recovery_codes").select("code_hash").eq("user_id", profile.data.id).maybeSingle()
    : null;
  // Same answer whether the name or the code was wrong.
  if (!profile.data || !stored?.data || !recoveryCodeMatches(parsed.data.code, stored.data.code_hash)) {
    return fail("bad_recovery");
  }

  const updated = await admin.auth.admin.updateUserById(profile.data.id, { password: parsed.data.newPassword });
  if (updated.error) return fail("unknown");
  const fresh = generateRecoveryCode();
  await admin.from("recovery_codes").upsert({ user_id: profile.data.id, code_hash: hashRecoveryCode(fresh) });

  const session = await (await supabaseServer()).auth.signInWithPassword({
    email: usernameToEmail(username),
    password: parsed.data.newPassword,
  });
  return session.error ? fail("unknown") : { ok: true, recoveryCode: fresh };
}

/** Deletes the account and everything in it. Asks for the password again. */
export async function deleteAccount(input: { password: string }): Promise<AuthResult> {
  if (!hasSupabaseServer()) return fail("unavailable");
  const supabase = await supabaseServer();
  const { data } = await supabase.auth.getUser();
  const user = data.user;
  if (!user) return fail("not_signed_in");
  const username = (user.user_metadata?.username as string | undefined) ?? "";
  if (!(await allow(`delete:user:${user.id}`, 5, 3600))) return fail("rate_limited");

  const check = await supabase.auth.signInWithPassword({ email: usernameToEmail(username), password: String(input.password ?? "") });
  if (check.error) return fail("bad_credentials");

  const removed = await supabaseAdmin().auth.admin.deleteUser(user.id); // cascades to every table
  if (removed.error) return fail("unknown");
  await supabase.auth.signOut();
  return { ok: true };
}
