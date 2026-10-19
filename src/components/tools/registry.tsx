"use client";
import { useSyncExternalStore, type ComponentType } from "react";
import { Page } from "../ui";
import { AccountTool } from "./Account";
import { BackwardTool } from "./Backward";
import { CoachTool } from "./Coach";
import { FindTool } from "./Find";
import { GpaTool } from "./Gpa";
import { GradeCalcTool } from "./GradeCalc";
import { HomeworkTool } from "./Homework";
import { ApCoursesTool, ApDashboardTool } from "../exam/ApTools";
import { ExamTool } from "../exam/ExamTool";
import { MistakesTool, WeakSpotsTool } from "../exam/StudyTools";
import { PlanTool } from "./Plan";
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
  "coach/chat": clientOnly(() => <CoachTool kind="chat" />),
  "coach/homework": clientOnly(() => <CoachTool kind="homework" />),
  "coach/eli12": clientOnly(() => <CoachTool kind="eli12" />),
  "coach/practice": clientOnly(() => <CoachTool kind="practice" />),
  "plan/builder": clientOnly(() => <PlanTool view="builder" />),
  "plan/templates": clientOnly(() => <PlanTool view="templates" />),
  "plan/checklists": clientOnly(() => <PlanTool view="checklists" />),
  "plan/adjust": clientOnly(() => <PlanTool view="adjust" />),
  "study/mistakes": clientOnly(MistakesTool),
  "study/weak": clientOnly(WeakSpotsTool),
  "sat/overview": clientOnly(() => <ExamTool exam="sat" view="overview" />),
  "sat/diagnostic": clientOnly(() => <ExamTool exam="sat" view="diagnostic" />),
  "sat/sections": clientOnly(() => <ExamTool exam="sat" view="sections" />),
  "sat/full": clientOnly(() => <ExamTool exam="sat" view="full" />),
  "sat/scores": clientOnly(() => <ExamTool exam="sat" view="scores" />),
  "sat/resources": clientOnly(() => <ExamTool exam="sat" view="resources" />),
  "psat/overview": clientOnly(() => <ExamTool exam="psat" view="overview" />),
  "psat/diagnostic": clientOnly(() => <ExamTool exam="psat" view="diagnostic" />),
  "psat/sections": clientOnly(() => <ExamTool exam="psat" view="sections" />),
  "psat/full": clientOnly(() => <ExamTool exam="psat" view="full" />),
  "psat/scores": clientOnly(() => <ExamTool exam="psat" view="scores" />),
  "psat/resources": clientOnly(() => <ExamTool exam="psat" view="resources" />),
  "act/overview": clientOnly(() => <ExamTool exam="act" view="overview" />),
  "act/diagnostic": clientOnly(() => <ExamTool exam="act" view="diagnostic" />),
  "act/sections": clientOnly(() => <ExamTool exam="act" view="sections" />),
  "act/full": clientOnly(() => <ExamTool exam="act" view="full" />),
  "act/scores": clientOnly(() => <ExamTool exam="act" view="scores" />),
  "act/resources": clientOnly(() => <ExamTool exam="act" view="resources" />),
  "tsi/overview": clientOnly(() => <ExamTool exam="tsi" view="overview" />),
  "tsi/diagnostic": clientOnly(() => <ExamTool exam="tsi" view="diagnostic" />),
  "tsi/sections": clientOnly(() => <ExamTool exam="tsi" view="sections" />),
  "tsi/full": clientOnly(() => <ExamTool exam="tsi" view="full" />),
  "tsi/scores": clientOnly(() => <ExamTool exam="tsi" view="scores" />),
  "tsi/resources": clientOnly(() => <ExamTool exam="tsi" view="resources" />),
  "ap/courses": clientOnly(ApCoursesTool),
  "ap/dashboard": clientOnly(ApDashboardTool),
  "ap/quizzes": clientOnly(() => <ExamTool exam="ap" view="sections" />),
  "ap/exam": clientOnly(() => <ExamTool exam="ap" view="full" />),
  "ap/score": clientOnly(() => <ExamTool exam="ap" view="scores" />),
  "ap/weak": clientOnly(WeakSpotsTool),
  "ap/resources": clientOnly(() => <ExamTool exam="ap" view="resources" />),
  "find/search": clientOnly(FindTool),
  "find/saved": clientOnly(SavedTool),
  "find/scams": ScamGuideTool,
  "grades/gpa": clientOnly(GpaTool),
  "grades/grade": clientOnly(GradeCalcTool),
  "focus/pomodoro": clientOnly(PomodoroTool),
  "homework/tracker": clientOnly(HomeworkTool),
  "homework/backward": clientOnly(BackwardTool),
};
