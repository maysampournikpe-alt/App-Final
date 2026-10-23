import { describe, expect, it } from "vitest";
import { errorText } from "@/lib/ai-limit";

describe("AI limit message", () => {
  const errors = { busy: "old busy text", rate_limited: "old rate text", slow: "Too slow.", failed: "Failed." };
  it("busy and rate_limited both show the limit message", () => {
    expect(errorText(errors, "busy", "LIMIT")).toBe("LIMIT");
    expect(errorText(errors, "rate_limited", "LIMIT")).toBe("LIMIT");
  });
  it("other errors keep their own text, and unknown ones fall back to failed", () => {
    expect(errorText(errors, "slow", "LIMIT")).toBe("Too slow.");
    expect(errorText(errors, "nope", "LIMIT")).toBe("Failed.");
  });
});
