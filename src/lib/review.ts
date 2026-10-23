import { diffDays, type ISODate } from "./dates";
import type { TopicStat } from "./exam/engine";

export type ReviewKind = "retry" | "weak" | "refresh";
export interface ReviewItem { topicId: string; kind: ReviewKind; /** Best score on the path quiz (retry and refresh) or the share right in practice (weak), 0 to 1. */ score: number; /** Days since the path quiz was last passed (refresh). */ days?: number }
export interface PathProg { best?: number; tries?: number; at?: string; notes?: boolean }

export const PASS_MARK = 0.6;
export const REFRESH_AFTER_DAYS = 7;
export const WEAK_BELOW = 0.6;

/**
 * What a student should review next, most urgent first:
 * 1. "retry": tried the path quiz and has not passed it yet.
 * 2. "weak": below 60 percent in practice quizzes and mock exams on that topic (at least 2 questions).
 * 3. "refresh": passed a week or more ago, so it is time to see it again (spaced review).
 * `progOf` gives the path progress for a topic id. `topicIds` is the course order.
 */
export function reviewQueue(opts: { topicIds: string[]; progOf: (topicId: string) => PathProg | undefined; stats: TopicStat[]; today: ISODate; limit?: number }): ReviewItem[] {
  const out: ReviewItem[] = [];
  const have = new Set<string>();
  const add = (i: ReviewItem) => { if (!have.has(i.topicId)) { have.add(i.topicId); out.push(i); } };
  const known = new Set(opts.topicIds);

  const retry = opts.topicIds.map((id) => ({ id, p: opts.progOf(id) })).filter((x) => (x.p?.tries ?? 0) > 0 && (x.p?.best ?? 0) < PASS_MARK).sort((a, b) => (a.p!.best ?? 0) - (b.p!.best ?? 0));
  for (const r of retry) add({ topicId: r.id, kind: "retry", score: r.p!.best ?? 0 });

  for (const s of opts.stats) if (known.has(s.topic) && s.pct < WEAK_BELOW) add({ topicId: s.topic, kind: "weak", score: s.pct });

  const refresh = opts.topicIds.map((id) => ({ id, p: opts.progOf(id) }))
    .filter((x) => (x.p?.best ?? 0) >= PASS_MARK && x.p?.at && diffDays(x.p.at, opts.today) >= REFRESH_AFTER_DAYS)
    .sort((a, b) => diffDays(b.p!.at!, opts.today) - diffDays(a.p!.at!, opts.today));
  for (const r of refresh) add({ topicId: r.id, kind: "refresh", score: r.p!.best ?? 0, days: diffDays(r.p!.at!, opts.today) });

  return out.slice(0, opts.limit ?? 4);
}
