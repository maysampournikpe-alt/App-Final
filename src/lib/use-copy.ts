"use client";
import type { Lang } from "@/config/features";
import { useLang } from "./i18n";

/** Text that belongs to one screen lives next to it, in both languages with the same shape. */
export function useCopy<T>(dict: Record<Lang, T>): T {
  return dict[useLang()];
}
