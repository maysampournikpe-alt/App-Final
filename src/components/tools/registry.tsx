"use client";
import type { ComponentType } from "react";
import { AccountTool } from "./Account";
import { PrivacyTool, TransparencyTool } from "./Legal";
import { InterestsTool, ProfileTool } from "./Profile";
import { AppearanceSettings, LanguageSettings } from "./Settings";

/** Built features, keyed "tab/tool". Anything not here shows its Coming soon page. */
export const TOOL_COMPONENTS: Record<string, ComponentType> = {
  "settings/appearance": AppearanceSettings,
  "settings/language": LanguageSettings,
  "settings/account": AccountTool,
  "settings/privacy": PrivacyTool,
  "settings/transparency": TransparencyTool,
  "profile/profile": ProfileTool,
  "profile/interests": InterestsTool,
};
