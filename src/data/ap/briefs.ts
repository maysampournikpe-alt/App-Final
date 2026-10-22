// Server-only data: import this only from server code (src/lib/exam/ap-briefs.ts), never from a component.
import { PROFILES, type Profile } from "./profiles";
import { UNIT_BRIEFS } from "./unit-briefs";
import { BIO_CHEM_BRIEFS } from "./topic-briefs-bio-chem";
import { ENV_PHYS_PSYCH_BRIEFS } from "./topic-briefs-env-phys-psych";

/** What each course is about and what must never be tested in it. */
export const AP_PROFILES: Record<string, Profile> = PROFILES;
/** One brief per unit, in unit order, for every course. */
export const AP_UNIT_BRIEFS: Record<string, string[]> = UNIT_BRIEFS;
/** One brief per topic (per unit, in topic order) for the courses where neighboring subjects overlap most. */
export const AP_TOPIC_BRIEFS: Record<string, string[][]> = { ...BIO_CHEM_BRIEFS, ...ENV_PHYS_PSYCH_BRIEFS };
export type { Profile };
