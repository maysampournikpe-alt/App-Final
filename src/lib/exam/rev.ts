import type { Question } from "./types";

/**
 * Version of the AP unit and topic outline that AI-written questions were made for. Bump it whenever AP unit or topic ids
 * change (a course is restructured), so older saved questions stop being served under the wrong unit.
 * Other tests keep their ids, so only AP questions are checked.
 */
export const OUTLINE_REV = "2610";
export const isCurrent = (q: Pick<Question, "exam" | "rev" | "source">): boolean => q.exam !== "ap" || q.source !== "generated" || q.rev === OUTLINE_REV;
