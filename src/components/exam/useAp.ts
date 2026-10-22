"use client";
import { useMemo } from "react";
import { AP_COURSES, courseById, type ApCourse } from "@/lib/exam/ap";
import { useLocalDoc } from "@/lib/local-doc";
import { addXp, NO_XP, type XpDoc } from "@/lib/xp";
import { today } from "@/lib/dates";

export type Prog = { notes?: boolean; best?: number; tries?: number; at?: string };
const NO_PROG: Record<string, Prog> = {};
const NO_PICKED: string[] = [];
export const PASS = 0.6, GOLD = 0.9;
export const levelOfProg = (p?: Prog) => (!p ? 0 : (p.best ?? 0) >= GOLD ? 3 : (p.best ?? 0) >= PASS ? 2 : p.notes ? 1 : 0);

/** Which AP course the student is working on, and the courses they picked. Falls back to the first picked course, then to all courses. */
export function useApCourse(preferred?: string | null) {
  const [picked] = useLocalDoc<string[]>("ap-courses", NO_PICKED);
  const [currentId, setCurrentId] = useLocalDoc<string>("ap-current", "");
  const list = useMemo<ApCourse[]>(() => { const mine = AP_COURSES.filter((c) => picked.includes(c.id) || c.id === preferred); return mine.length ? mine : AP_COURSES; }, [picked, preferred]);
  const course = list.find((c) => c.id === (preferred ?? currentId)) ?? courseById(preferred ?? "") ?? list[0];
  return { course, list, picked, setCurrent: setCurrentId, hasPicked: picked.length > 0 };
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
