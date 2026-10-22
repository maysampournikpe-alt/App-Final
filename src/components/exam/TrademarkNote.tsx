"use client";
import { useCopy } from "@/lib/use-copy";

const copy = {
  en: "AP, SAT and PSAT are trademarks of College Board. ACT is a trademark of ACT, Inc. TSI and TSIA2 are programs of the Texas Higher Education Coordinating Board and College Board. This app is not affiliated with or endorsed by any of them. Practice questions are original and made for this app.",
  es: "AP, SAT y PSAT son marcas de College Board. ACT es una marca de ACT, Inc. TSI y TSIA2 son programas del Consejo de Educación Superior de Texas y College Board. Esta app no está afiliada ni respaldada por ninguna de ellas. Las preguntas de práctica son originales y se hicieron para esta app.",
};

/** Shown on test-prep screens so nobody mistakes this app for the official tests. */
export function TrademarkNote() {
  const text = useCopy(copy);
  return <p className="mt-10 max-w-prose text-xs text-muted">{text}</p>;
}
