import { AP_PROFILES, AP_TOPIC_BRIEFS, AP_UNIT_BRIEFS } from "@/data/ap/briefs";
import type { ApCourse } from "./ap";

/**
 * The course profile and the unit and topic briefs for AP. Only the question and notes writers on the server use them
 * (import this only from server code), so they stay out of what students download. A topic brief gets its unit brief
 * as context; without one, the unit brief stands alone.
 */
export function apBriefs(course: ApCourse, unitIndex: number, topicIndex?: number): { about?: string; avoid?: string; cover?: string } {
  const prof = AP_PROFILES[course.en];
  const unit = AP_UNIT_BRIEFS[course.en]?.[unitIndex];
  const topic = topicIndex === undefined ? undefined : AP_TOPIC_BRIEFS[course.en]?.[unitIndex]?.[topicIndex];
  const cover = topic ? (unit ? `${topic}\nUnit context: ${unit}` : topic) : unit;
  return { ...(prof ? { about: prof.about, avoid: prof.avoid } : {}), ...(cover ? { cover } : {}) };
}
