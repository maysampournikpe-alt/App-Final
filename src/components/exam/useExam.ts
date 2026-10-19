"use client";
import { useLocalDoc } from "@/lib/local-doc";
import type { Attempt, Session } from "@/lib/exam/types";

const NO_ATTEMPTS: Attempt[] = [];
const NO_IDS: string[] = [];

/** Everything about a student's exam practice lives in these four documents on the device (and the account). */
export function useExamData() {
  const [session, setSession] = useLocalDoc<Session | null>("exam-session", null);
  const [attempts, setAttempts] = useLocalDoc<Attempt[]>("exam-attempts", NO_ATTEMPTS);
  const [hidden, setHidden] = useLocalDoc<string[]>("exam-hidden", NO_IDS); // questions the student reported
  const [dismissed, setDismissed] = useLocalDoc<string[]>("exam-mistakes-dismissed", NO_IDS);
  return { session, setSession, attempts, setAttempts, hidden, setHidden, dismissed, setDismissed };
}
