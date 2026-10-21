export const SMART_KEY = "smart-goals";
export interface SmartGoal { id: string; specific: string; measurable: string; achievable: string; relevant: string; by: string; created: string }
export const NO_SMART: SmartGoal[] = [];
export const SMART_FIELDS = ["specific", "measurable", "achievable", "relevant"] as const;
/** A goal is ready when every part has real words and a valid date. */
export const smartReady = (g: Pick<SmartGoal, "specific" | "measurable" | "achievable" | "relevant" | "by">) =>
  SMART_FIELDS.every((k) => g[k].trim().length >= 3) && /^\d{4}-\d{2}-\d{2}$/.test(g.by);
