export type CalcResult = { ok: true; text: string; value: number | null } | { ok: false };

/** Evaluates what a student typed on a scientific calculator. mathjs loads only when this runs. */
export async function evaluateExpression(input: string, opts: { deg: boolean; ans?: number }): Promise<CalcResult> {
  const text = input.trim();
  if (!text || text.length > 200) return { ok: false };
  try {
    const math = await import("mathjs");
    const expr = text.replace(/×/g, "*").replace(/÷/g, "/").replace(/−/g, "-").replace(/π/g, "pi").replace(/√\s*\(/g, "sqrt(").replace(/\blog\(/g, "log10(").replace(/\bln\(/g, "log(");
    const rad = Math.PI / 180;
    const scope: Record<string, unknown> = { ans: opts.ans ?? 0 };
    if (opts.deg) Object.assign(scope, {
      sin: (x: number) => Math.sin(x * rad), cos: (x: number) => Math.cos(x * rad), tan: (x: number) => Math.tan(x * rad),
      asin: (x: number) => Math.asin(x) / rad, acos: (x: number) => Math.acos(x) / rad, atan: (x: number) => Math.atan(x) / rad,
    });
    const v = math.evaluate(expr, scope);
    if (typeof v === "number") return Number.isFinite(v) ? { ok: true, text: math.format(v, { precision: 12 }), value: v } : { ok: false };
    if (typeof v === "boolean" || v == null || typeof v === "function") return { ok: false };
    return { ok: true, text: math.format(v, { precision: 12 }), value: null };
  } catch {
    return { ok: false };
  }
}
