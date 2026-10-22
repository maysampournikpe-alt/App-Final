import { IDEAS, type Idea } from "@/data/ideas";

/** A small stable shuffle, so the same week gives the same picks but the next week gives new ones. */
function rotate<T>(list: T[], seed: number): T[] {
  if (!list.length) return list;
  const k = ((seed % list.length) + list.length) % list.length;
  return [...list.slice(k), ...list.slice(0, k)];
}
const fits = (i: Idea, grade: number | null) => !i.minGrade || !grade || grade >= i.minGrade;

/** Ideas that match the student's interests. If they picked none, a rotating general mix. */
export function matches(interests: string[], grade: number | null, seed: number, n = 6): Idea[] {
  const mine = IDEAS.filter((i) => interests.includes(i.interest) && fits(i, grade));
  const pool = mine.length ? mine : IDEAS.filter((i) => ["volunteering", "coding", "science", "art", "business", "trades"].includes(i.interest) && fits(i, grade));
  return rotate(pool, seed).slice(0, n);
}

/** Ideas from interests the student did NOT pick, for discovering something new. */
export function outside(interests: string[], grade: number | null, seed: number, n = 3): Idea[] {
  return rotate(IDEAS.filter((i) => !interests.includes(i.interest) && fits(i, grade)), seed * 3 + 1).slice(0, n);
}

export const weekNumber = (iso: string) => Math.floor(new Date(iso + "T00:00:00Z").getTime() / (7 * 86400000));
