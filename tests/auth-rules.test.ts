import { describe, expect, it, vi } from "vitest";
import { checkPassword, checkUsername, normalizeUsername, usernameToEmail } from "../src/lib/auth/rules";

vi.mock("server-only", () => ({}));

describe("usernames", () => {
  it("accepts normal names and trims or lowercases them", () => {
    expect(checkUsername("maria_r")).toBeNull();
    expect(normalizeUsername("  Maria_R ")).toBe("maria_r");
    expect(checkUsername("  Maria_R ")).toBeNull();
  });
  it("rejects too short, too long and odd characters", () => {
    expect(checkUsername("ab")).toBe("username_short");
    expect(checkUsername("a".repeat(21))).toBe("username_long");
    expect(checkUsername("maria r")).toBe("username_chars");
    expect(checkUsername("josé")).toBe("username_chars");
    expect(checkUsername("a@b.com")).toBe("username_chars");
  });
  it("rejects reserved and blocked names, even with digits mixed in", () => {
    expect(checkUsername("admin")).toBe("username_reserved");
    expect(checkUsername("Teacher")).toBe("username_reserved");
    expect(checkUsername("sh1t_head")).toBe("username_reserved");
    expect(checkUsername("s3x")).toBe("username_reserved");
    expect(checkUsername("essex_kid")).toBeNull();
    expect(checkUsername("grape_juice")).toBeNull();
  });
  it("maps to a non-deliverable address", () => {
    expect(usernameToEmail("Maria_R")).toBe("maria_r@users.rumbo.invalid");
  });
});

describe("passwords", () => {
  it("needs 8 characters", () => {
    expect(checkPassword("short7!")).toBe("password_short");
    expect(checkPassword("longenough1")).toBeNull();
  });
  it("rejects common passwords and the username itself", () => {
    expect(checkPassword("Password1")).toBe("password_common");
    expect(checkPassword("maria_rodriguez", "Maria_Rodriguez")).toBe("password_is_username");
  });
  it("rejects more than 72 bytes", () => {
    expect(checkPassword("a".repeat(73))).toBe("password_long");
    expect(checkPassword("ñ".repeat(37))).toBe("password_long"); // 74 bytes
  });
});

describe("recovery codes", () => {
  it("round-trips and ignores case, dashes and look-alike letters", async () => {
    const { generateRecoveryCode, hashRecoveryCode, recoveryCodeMatches } = await import("../src/lib/auth/recovery");
    const code = generateRecoveryCode();
    expect(code).toMatch(/^[0-9A-HJKMNP-TV-Z]{4}(-[0-9A-HJKMNP-TV-Z]{4}){3}$/);
    const hash = hashRecoveryCode(code);
    expect(recoveryCodeMatches(code.toLowerCase().replaceAll("-", " "), hash)).toBe(true);
    expect(recoveryCodeMatches("0000-0000-0000-0000", hash)).toBe(false);
    expect(generateRecoveryCode()).not.toBe(code);
  });
});
