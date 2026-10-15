"use client";
import { useEffect } from "react";
import { useAccount } from "@/lib/account";
import { syncAllDocs } from "@/lib/local-doc";
import { applySyncedPrefs } from "@/lib/prefs";

/** When a student is signed in, merge guest data into the account once per page load. */
export function AccountSync() {
  const account = useAccount();
  const signedIn = account.status === "signed-in";
  useEffect(() => {
    if (!signedIn) return;
    void syncAllDocs().then(applySyncedPrefs).catch(() => {});
  }, [signedIn]);
  return null;
}
