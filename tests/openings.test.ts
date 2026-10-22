import { Chess } from "chess.js";
import { describe, expect, it } from "vitest";
import { OPENINGS } from "@/data/openings";

describe("opening lines", () => {
  it("every line is legal from the start position", () => {
    for (const o of OPENINGS) {
      const g = new Chess();
      for (const m of o.moves) expect(() => g.move(m), `${o.id} ${m}`).not.toThrow();
      expect(g.history().length).toBe(o.moves.length);
    }
  });
  it("has unique ids, 10-move lines and a valid side", () => {
    expect(new Set(OPENINGS.map((o) => o.id)).size).toBe(OPENINGS.length);
    for (const o of OPENINGS) { expect(o.moves.length).toBe(10); expect(["w", "b"]).toContain(o.side); expect(o.idea.en.length).toBeGreaterThan(20); }
  });
  it("Ruy Lopez reaches the known position after 5...Be7", () => {
    const g = new Chess(); OPENINGS.find((o) => o.id === "ruy")!.moves.forEach((m) => g.move(m));
    expect(g.fen().split(" ")[0]).toBe("r1bqk2r/1pppbppp/p1n2n2/4p3/B3P3/5N2/PPPP1PPP/RNBQ1RK1");
  });
});
