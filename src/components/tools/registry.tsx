"use client";
import type { ComponentType } from "react";
import { AppearanceSettings, LanguageSettings } from "./Settings";

/** Built features, keyed "tab/tool". Anything not here shows its Coming soon page. */
export const TOOL_COMPONENTS: Record<string, ComponentType> = {
  "settings/appearance": AppearanceSettings,
  "settings/language": LanguageSettings,
};
