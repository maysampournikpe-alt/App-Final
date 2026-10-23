import { beforeEach, describe, expect, it, vi } from "vitest";

const reportQuestion = vi.fn(async () => true);
const allow = vi.fn(async () => true);
vi.mock("@/lib/ai/qbank", () => ({ reportQuestion }));
vi.mock("@/lib/rate-limit", () => ({ allow, clientIp: async () => "1.2.3.4" }));
vi.mock("@/lib/supabase/server", () => ({ hasSupabaseServer: () => true }));

const post = (b: unknown) => new Request("http://x/api/report", { method: "POST", body: JSON.stringify(b) });

describe("POST /api/report", () => {
  beforeEach(() => { reportQuestion.mockClear(); allow.mockReset(); allow.mockResolvedValue(true); });
  it("counts a report for an AI question id", async () => {
    const { POST } = await import("@/app/api/report/route");
    const r = await POST(post({ id: "ai-ap-ap-biology-0123456789" }));
    expect(r.status).toBe(200);
    expect(reportQuestion).toHaveBeenCalledWith("ai-ap-ap-biology-0123456789");
  });
  it("rejects ids that are not AI questions", async () => {
    const { POST } = await import("@/app/api/report/route");
    expect((await POST(post({ id: "sat-seed-1" }))).status).toBe(400);
    expect((await POST(post({ id: "ai-x'; drop table" }))).status).toBe(400);
    expect(reportQuestion).not.toHaveBeenCalled();
  });
  it("ignores a repeat report from the same person", async () => {
    allow.mockResolvedValueOnce(true).mockResolvedValueOnce(false);
    const { POST } = await import("@/app/api/report/route");
    await POST(post({ id: "ai-ap-ap-biology-0123456789" }));
    expect(reportQuestion).not.toHaveBeenCalled();
  });
});
