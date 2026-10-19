// "What do I need on the final?"
export type NeededResult =
  | { kind: "already"; needed: number } // you would pass the target even with a 0
  | { kind: "possible"; needed: number }
  | { kind: "impossible"; needed: number }; // would take more than 100

/**
 * @param current grade now, in percent (0 to 100+)
 * @param finalWeight how much the final counts, in percent of the whole grade (1 to 100)
 * @param target the grade you want, in percent
 */
export function neededOnFinal(current: number, finalWeight: number, target: number): NeededResult | null {
  if (![current, finalWeight, target].every(Number.isFinite) || finalWeight <= 0 || finalWeight > 100) return null;
  const w = finalWeight / 100;
  const needed = Math.round(((target - current * (1 - w)) / w) * 10) / 10;
  if (needed <= 0) return { kind: "already", needed: 0 };
  if (needed > 100) return { kind: "impossible", needed };
  return { kind: "possible", needed };
}
