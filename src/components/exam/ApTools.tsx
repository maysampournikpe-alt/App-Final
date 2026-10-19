"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Check } from "lucide-react";
import { diffDays, isValidISO, today } from "@/lib/dates";
import { AP_ALL_COURSES, AP_PRACTICE_COURSES } from "@/lib/exam/ap";
import { BANK } from "@/lib/exam/bank";
import { buildTest, newSession, skillStats } from "@/lib/exam/engine";
import { useLang } from "@/lib/i18n";
import { useLocalDoc } from "@/lib/local-doc";
import { useCopy } from "@/lib/use-copy";
import { buttonClass, inputClass, Page } from "../ui";
import { examCopy } from "./copy";
import { useExamData } from "./useExam";

const NO_COURSES: string[] = [];
const NO_DATES: Record<string, string> = {};

/** Pick your AP courses. Saved on the device and synced to the account. */
export function ApCoursesTool() {
  const c = useCopy(examCopy);
  const lang = useLang();
  const [picked, setPicked] = useLocalDoc<string[]>("ap-courses", NO_COURSES);
  const ready = new Set(AP_PRACTICE_COURSES.map((x) => x.id));
  const toggle = (id: string) => setPicked(picked.includes(id) ? picked.filter((x) => x !== id) : [...picked, id]);
  return (
    <Page>
      <h1 className="text-3xl sm:text-4xl">{c.ap.picked}</h1>
      <p className="mt-2 max-w-prose text-muted">{c.ap.pickLead}</p>
      <ul className="mt-6 grid gap-2 sm:grid-cols-2">
        {AP_ALL_COURSES.map((course) => {
          const on = picked.includes(course.id);
          return (
            <li key={course.id}>
              <label className={`flex cursor-pointer items-center gap-3 rounded-md border-[1.5px] border-ink p-3 ${on ? "bg-teal text-on-teal" : "bg-surface hover:bg-sunken"}`}>
                <input type="checkbox" checked={on} onChange={() => toggle(course.id)} className="peer sr-only" />
                <span aria-hidden className={`grid h-6 w-6 shrink-0 place-items-center rounded border-2 border-current peer-focus-visible:outline peer-focus-visible:outline-[3px] peer-focus-visible:outline-offset-2 peer-focus-visible:outline-[var(--c-focus)]`}>{on ? <Check size={16} strokeWidth={3} /> : null}</span>
                <span className="min-w-0 flex-1 font-bold">{course[lang]}</span>
                <span className={`shrink-0 rounded-sm border px-1.5 text-xs font-bold ${on ? "border-on-teal" : ready.has(course.id) ? "border-palm text-palm" : "border-line text-muted"}`}>{ready.has(course.id) ? c.ap.ready : c.ap.notReadyYet}</span>
              </label>
            </li>
          );
        })}
      </ul>
      {picked.length ? <Link href="/t/ap/dashboard" className={`${buttonClass.primary} mt-6`}>{c.ap.dashTitle}</Link> : null}
    </Page>
  );
}

/** Units in the official order, with accuracy so far and a shortcut to practice each one. */
export function ApDashboardTool() {
  const c = useCopy(examCopy);
  const lang = useLang();
  const router = useRouter();
  const { attempts, setSession } = useExamData();
  const [picked] = useLocalDoc<string[]>("ap-courses", NO_COURSES);
  const [dates, setDates] = useLocalDoc<Record<string, string>>("ap-exam-dates", NO_DATES);
  const stats = skillStats(attempts.filter((a) => a.exam === "ap"));
  const courses = AP_PRACTICE_COURSES.filter((x) => picked.includes(x.id));

  const practice = (course: string, unit: string) => {
    const qids = buildTest(BANK, { exam: "ap", mode: "section", section: course, skill: unit, count: 10 });
    if (!qids.length) return;
    setSession(newSession("ap", "section", qids, null));
    router.push("/t/ap/quizzes?go");
  };

  return (
    <Page>
      <h1 className="text-3xl sm:text-4xl">AP</h1>
      <p className="mt-2 max-w-prose text-muted">{c.ap.dashLead}</p>
      <p className="mt-2 max-w-prose text-sm text-muted">{c.ap.mcOnly}</p>
      {courses.length === 0 ? (
        <p className="guide-card mt-6 max-w-xl p-5 text-lg">{c.ap.none} <Link href="/t/ap/courses" className="font-bold text-teal underline underline-offset-4">{c.ap.picked}</Link></p>
      ) : (
        <div className="mt-8 space-y-12">
          {courses.map((course) => {
            const date = dates[course.id] ?? "";
            const left = isValidISO(date) ? diffDays(today(), date) : null;
            return (
              <section key={course.id} aria-labelledby={`c-${course.id}`}>
                <div className="flex flex-wrap items-end justify-between gap-4 border-b-[1.5px] border-ink pb-2">
                  <h2 id={`c-${course.id}`} className="text-2xl sm:text-3xl">{course[lang]}</h2>
                  <label className="text-sm"><span className="block font-bold">{c.ap.examDate}</span>
                    <input type="date" value={date} onChange={(e) => setDates({ ...dates, [course.id]: e.target.value })} className={`${inputClass} !w-auto !py-1.5`} />
                    {left !== null ? <span className="mt-1 block font-bold text-terracotta" aria-live="polite">{c.ap.daysTo(left)}</span> : null}
                  </label>
                </div>
                <ol className="mt-3 divide-y-2 divide-dotted divide-line">
                  {course.units.map((unit, i) => {
                    const n = BANK.filter((x) => x.exam === "ap" && x.section === course.id && x.skill === unit.id).length;
                    const st = stats.find((x) => x.section === course.id && x.skill === unit.id);
                    return (
                      <li key={unit.id} className="py-3">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <p className="font-bold"><span className="mr-2 tabular-nums text-terracotta">{i + 1}</span>{unit[lang]}</p>
                          <button disabled={!n} onClick={() => practice(course.id, unit.id)} className={`${buttonClass.quiet} !py-1`}>{n ? c.ap.practiceUnit : c.ap.noQs}</button>
                        </div>
                        <div className="mt-2 flex items-center gap-3">
                          <div className="h-3 flex-1 overflow-hidden rounded-full border-[1.5px] border-ink bg-sunken" aria-hidden="true">
                            {st ? <div className={`h-full ${st.pct >= 0.7 ? "bg-palm" : st.pct >= 0.4 ? "bg-marigold" : "bg-ruby"}`} style={{ width: `${Math.round(st.pct * 100)}%` }} /> : null}
                          </div>
                          <span className="w-40 shrink-0 text-right text-sm text-muted">{st ? `${c.ap.acc}: ${st.correct}/${st.total}` : n ? `${c.ap.unitQs(n)} · ${c.ap.noData}` : ""}</span>
                        </div>
                      </li>
                    );
                  })}
                </ol>
              </section>
            );
          })}
        </div>
      )}
    </Page>
  );
}
