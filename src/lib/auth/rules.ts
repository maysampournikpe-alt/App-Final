// Shared by the server (authoritative) and the sign-up form (instant feedback).
// Errors are codes, not sentences, so the interface can show them in either language.

export const USERNAME_MIN = 3;
export const USERNAME_MAX = 20;
export const PASSWORD_MIN = 8;
export const PASSWORD_MAX = 72; // bcrypt ignores everything past 72 bytes

const RESERVED = new Set([
  "admin", "administrator", "root", "support", "help", "moderator", "mod", "staff", "rumbo",
  "teacher", "counselor", "counsellor", "parent", "official", "system", "null", "undefined", "anonymous",
]);
// Not exhaustive. Usernames are also never shown to other students in this version.
const BLOCKED_SUBSTRINGS = ["fuck", "shit", "bitch", "nazi", "porn", "cunt", "nigg"];
// Short words only count when they are the whole name, so "essex" or "grape" stay allowed.
const BLOCKED_EXACT = new Set(["sex", "rape", "fag"]);
const LEET: Record<string, string> = { "0": "o", "1": "i", "3": "e", "4": "a", "5": "s", "7": "t", "$": "s", "@": "a" };
const COMMON_PASSWORDS = new Set([
  "password", "password1", "12345678", "123456789", "1234567890", "qwerty123", "iloveyou", "11111111",
  "abc12345", "letmein1", "contrasena", "contraseña", "00000000", "password123",
]);

export type UsernameError = "username_short" | "username_long" | "username_chars" | "username_reserved";
export type PasswordError = "password_short" | "password_long" | "password_common" | "password_is_username";

export const normalizeUsername = (raw: string) => raw.trim().toLowerCase();

export function checkUsername(raw: string): UsernameError | null {
  const u = normalizeUsername(raw);
  if (u.length < USERNAME_MIN) return "username_short";
  if (u.length > USERNAME_MAX) return "username_long";
  if (!/^[a-z0-9_]+$/.test(u)) return "username_chars";
  const plain = [...u].map((c) => LEET[c] ?? c).join("").replace(/[_\d]/g, "");
  if (RESERVED.has(u) || BLOCKED_EXACT.has(plain) || BLOCKED_SUBSTRINGS.some((w) => plain.includes(w))) {
    return "username_reserved";
  }
  return null;
}

export function checkPassword(password: string, username = ""): PasswordError | null {
  if (password.length < PASSWORD_MIN) return "password_short";
  if (new TextEncoder().encode(password).length > PASSWORD_MAX) return "password_long";
  if (COMMON_PASSWORDS.has(password.toLowerCase())) return "password_common";
  if (username && password.toLowerCase() === normalizeUsername(username)) return "password_is_username";
  return null;
}

/**
 * Supabase Auth wants an email. Students never give one, so each username maps to a
 * made-up address on a reserved, undeliverable domain. No mail is ever sent to it.
 */
export const usernameToEmail = (username: string) => `${normalizeUsername(username)}@users.rumbo.invalid`;

export type AuthErrorCode =
  | UsernameError
  | PasswordError
  | "username_taken"
  | "bad_credentials"
  | "bad_recovery"
  | "rate_limited"
  | "unavailable"
  | "invalid_input"
  | "not_signed_in"
  | "unknown";
