"use client";
import { useSyncExternalStore, type ComponentType } from "react";
import { Page } from "../ui";
import { AccountTool } from "./Account";
import { BackwardTool } from "./Backward";
import { FindTool } from "./Find";
import { GpaTool } from "./Gpa";
import { GradeCalcTool } from "./GradeCalc";
import { HomeworkTool } from "./Homework";
import { PomodoroTool } from "./Pomodoro";
import { PrivacyTool, ScamGuideTool, TransparencyTool } from "./Legal";
import { InterestsTool, ProfileTool } from "./Profile";
import { SavedTool } from "./Saved";
import { AppearanceSettings, LanguageSettings } from "./Settings";

const useIsClient = () => useSyncExternalStore(() => () => {}, () => true, () => false);

/**
 * Tools that read today's date or the device's saved data render only in the browser.
 * The pages are built ahead of time on a server with a different date and no saved data,
 * so rendering them there could disagree with what the phone shows.
 */
function clientOnly(Tool: ComponentType): ComponentType {
  return function ClientOnlyTool() {
    return useIsClient() ? <Tool /> : <Page><p className="sr-only" role="status">…</p></Page>;
  };
}

/** Built features, keyed "tab/tool". Anything not here shows its Coming soon page. */
export const TOOL_COMPONENTS: Record<string, ComponentType> = {
  "settings/appearance": AppearanceSettings,
  "settings/language": LanguageSettings,
  "settings/account": AccountTool,
  "settings/privacy": PrivacyTool,
  "settings/transparency": TransparencyTool,
  "profile/profile": ProfileTool,
  "profile/interests": InterestsTool,
  "find/search": clientOnly(FindTool),
  "find/saved": clientOnly(SavedTool),
  "find/scams": ScamGuideTool,
  "grades/gpa": clientOnly(GpaTool),
  "grades/grade": clientOnly(GradeCalcTool),
  "focus/pomodoro": clientOnly(PomodoroTool),
  "homework/tracker": clientOnly(HomeworkTool),
  "homework/backward": clientOnly(BackwardTool),
};
