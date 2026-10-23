"use client";
import { useAccount } from "./account";
import { useLang } from "./i18n";

const TEXT = {
  en: { guest: "AI limit reached for now. Sign in for more use, or try again later.", user: "AI limit reached for now. Please try again later." },
  es: { guest: "Se alcanzó el límite de IA por ahora. Inicia sesión para usarla más, o intenta más tarde.", user: "Se alcanzó el límite de IA por ahora. Intenta de nuevo más tarde." },
};

/** What to show when the AI will not answer because of a limit. Signed-in students get a bigger hourly allowance, so guests are pointed to sign in. */
export function useAiLimitText(): string {
  const lang = useLang();
  const signedIn = useAccount().status === "signed-in";
  return signedIn ? TEXT[lang].user : TEXT[lang].guest;
}

/** The message for an API error code. "busy" and "rate_limited" both mean the AI limit was reached. */
export const errorText = (errors: Record<string, string>, code: string, limit: string): string =>
  code === "busy" || code === "rate_limited" ? limit : errors[code] ?? errors.failed;
