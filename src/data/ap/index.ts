import { HUMANITIES } from "./humanities";
import { SOCIAL } from "./social";
import { STEM } from "./stem";
import type { Outline } from "./types";

/** Unit and topic outline for every AP course, keyed by the course's English name. */
export const AP_OUTLINE: Record<string, Outline> = { ...STEM, ...SOCIAL, ...HUMANITIES };
export type { Outline };
