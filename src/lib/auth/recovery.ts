import "server-only";
import { createHash, randomBytes, timingSafeEqual } from "node:crypto";

// Crockford base32: no I, L, O or U, so a code read off paper is hard to mistype.
const ALPHABET = "0123456789ABCDEFGHJKMNPQRSTVWXYZ";

/** 16 characters, 80 bits of randomness, shown as XXXX-XXXX-XXXX-XXXX. */
export function generateRecoveryCode(): string {
  const bytes = randomBytes(16);
  let out = "";
  for (let i = 0; i < 16; i++) out += ALPHABET[bytes[i] % 32];
  return out.match(/.{4}/g)!.join("-");
}

export function normalizeRecoveryCode(input: string): string {
  return input.toUpperCase().replace(/O/g, "0").replace(/[IL]/g, "1").replace(/[^0-9A-Z]/g, "");
}

export const hashRecoveryCode = (input: string) =>
  createHash("sha256").update(normalizeRecoveryCode(input)).digest("hex");

export function recoveryCodeMatches(input: string, storedHash: string): boolean {
  const a = Buffer.from(hashRecoveryCode(input), "hex");
  const b = Buffer.from(storedHash, "hex");
  return a.length === b.length && timingSafeEqual(a, b);
}
