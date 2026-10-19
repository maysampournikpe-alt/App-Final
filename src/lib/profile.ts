"use client";
import { updateProfile } from "@/app/actions/profile";
import { useLocalDoc } from "./local-doc";

export interface LocalProfile {
  grade: number | null;
  school: string;
  interests: string[]; // ids from config/interests, or free text the student typed
}
export const EMPTY_PROFILE: LocalProfile = { grade: null, school: "", interests: [] };

/** Profile lives on the device (works for guests) and syncs with the account like every other tool. */
export function useProfile() {
  const [profile, setProfile] = useLocalDoc<LocalProfile>("profile", EMPTY_PROFILE);
  const save = (next: LocalProfile) => {
    setProfile(next);
    // Best effort copy for server-side features. Fails quietly for guests and offline.
    void updateProfile({ grade: next.grade, school: next.school, interests: next.interests }).catch(() => {});
  };
  return [profile, save] as const;
}
