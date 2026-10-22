"use client";
import { useMemo } from "react";
import type { ApCourse } from "@/lib/exam/ap";
import { coursesFor } from "@/lib/exam/courses";
import type { ExamId } from "@/lib/exam/types";
import { useLocalDoc } from "@/lib/local-doc";
import { addXp, NO_XP, type XpDoc } from "@/lib/xp";
import { today } from "@/lib/dates";

export type Prog = { notes?: boolean; best?: number; tries?: number; at?: string };
const NO_PROG: Record<string, Prog> = {};
const NO_PICKED: string[] = [];
export const PASS = 0.6, GOLD = 0.9;
export const levelOfProg = (p?: Prog) => (!p ? 0 : (p.best ?? 0) >= GOLD ? 3 : (p.best ?? 0) >= PASS ? 2 : p.notes ? 1 : 0);

/** Which course (an AP course, or a section of the SAT, ACT or TSI) the student is working on. For AP it starts from the courses they picked. */
export function useCourse(track: ExamId, preferred?: string | null) {
  const [picked] = useLocalDoc<string[]>("ap-courses", NO_PICKED);
  const [currentId, setCurrentId] = useLocalDoc<string>(track === "ap" ? "ap-current" : `${track}-current`, "");
  const all = coursesFor(track);
  const list = useMemo<ApCourse[]>(() => {
    if (track !== "ap") return all;
    const mine = all.filter((c) => picked.includes(c.id) || c.id === preferred);
    return mine.length ? mine : all;
  }, [all, track, picked, preferred]);
  const course = list.find((c) => c.id === (preferred ?? currentId)) ?? all.find((c) => c.id === preferred) ?? list[0];
  return { course, list, picked, setCurrent: setCurrentId, hasPicked: track !== "ap" || picked.length > 0 };
}

export function usePathProgress() {
  const [prog, setProg] = useLocalDoc<Record<string, Prog>>("path-progress", NO_PROG);
  const update = (key: string, patch: Prog) => setProg((all) => ({ ...all, [key]: { ...all[key], ...patch } }));
  return { prog, update };
}

export function useXp() {
  const [doc, setDoc] = useLocalDoc<XpDoc>("path-xp", NO_XP);
  return { ...doc, award: (points: number) => setDoc((d) => addXp(d, points, today())) };
}
