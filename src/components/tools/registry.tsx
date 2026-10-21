"use client";
import { useSyncExternalStore, type ComponentType } from "react";
import { Page } from "../ui";
import { AccountTool } from "./Account";
import { BackwardTool } from "./Backward";
import { CoachTool } from "./Coach";
import { BragTool, CertificatesTool, ResumeTool, TrackerTool, VolunteerTool } from "./Achievements";
import { BudgetTool } from "./Budget";
import { CalendarTool } from "./CalendarTool";
import { ConverterTool, CostTool, CreditsTool, RankTool } from "./CollegeTools";
import { CornellTool } from "./Cornell";
import { CountdownTool } from "./Countdown";
import { DrillsTool } from "./Drills";
import { FocusLogTool } from "./FocusLog";
import { FractionsTool } from "./Fractions";
import { GeometryTool } from "./Geometry";
import { ReflectTool } from "./Reflect";
import { ProgressTool } from "./Progress";
import { RoutinesTool } from "./Routines";
import { SmartTool } from "./Smart";
import { StackingTool } from "./Stacking";
import { TasksTool } from "./Tasks";
import { FlashcardsTool } from "./Flashcards";
import { HabitsTool } from "./Habits";
import { MoneyTool } from "./Money";
import { UnitsTool } from "./Units";
import { HelpTool, MoodTool, SleepTool } from "./Wellbeing";
import { WhyTool } from "./Why";
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
  "notes/cornell": clientOnly(CornellTool),
  "notes/flashcards": clientOnly(() => <FlashcardsTool view="make" />),
  "notes/spaced": clientOnly(() => <FlashcardsTool view="review" />),
  "habits/tracker": clientOnly(HabitsTool),
  "college/cost": clientOnly(CostTool),
  "college/converter": clientOnly(ConverterTool),
  "grades/rank": clientOnly(RankTool),
  "grades/credits": clientOnly(CreditsTool),
  "achievements/tracker": clientOnly(TrackerTool),
  "achievements/volunteer": clientOnly(VolunteerTool),
  "achievements/certificates": clientOnly(CertificatesTool),
  "achievements/brag": clientOnly(BragTool),
  "achievements/resume": clientOnly(ResumeTool),
  "wellbeing/mood": clientOnly(MoodTool),
  "wellbeing/sleep": clientOnly(SleepTool),
  "wellbeing/contacts": clientOnly(HelpTool),
  "profile/why": clientOnly(WhyTool),
  "profile/progress": clientOnly(() => <ProgressTool view="progress" />),
  "profile/levels": clientOnly(() => <ProgressTool view="levels" />),
  "profile/streaks": clientOnly(() => <ProgressTool view="streaks" />),
  "profile/avatar": clientOnly(() => <ProgressTool view="avatar" />),
  "achievements/badges": clientOnly(() => <ProgressTool view="badges" />),
  "money/budget": clientOnly(BudgetTool),
  "habits/smart": clientOnly(SmartTool),
  "habits/weekly": clientOnly(() => <ReflectTool kind="weekly" />),
  "habits/monthly": clientOnly(() => <ReflectTool kind="monthly" />),
  "habits/journal": clientOnly(() => <ReflectTool kind="journal" />),
  "habits/routines": clientOnly(RoutinesTool),
  "habits/stacking": clientOnly(StackingTool),
  "calendar/deadlines": clientOnly(() => <CalendarTool view="deadlines" />),
  "calendar/reminders": clientOnly(() => <CalendarTool view="reminders" />),
  "focus/logger": clientOnly(() => <FocusLogTool view="logger" />),
  "focus/stats": clientOnly(() => <FocusLogTool view="stats" />),
  "homework/todo": clientOnly(() => <TasksTool view="todo" />),
  "homework/eisenhower": clientOnly(() => <TasksTool view="matrix" />),
  "math/fractions": clientOnly(FractionsTool),
  "math/geometry": clientOnly(GeometryTool),
  "math/drills": clientOnly(DrillsTool),
  "calendar/countdown": clientOnly(CountdownTool),
  "math/units": clientOnly(UnitsTool),
  "money/compound": clientOnly(() => <MoneyTool view="compound" />),
  "money/savings": clientOnly(() => <MoneyTool view="savings" />),
  "money/paycheck": clientOnly(() => <MoneyTool view="paycheck" />),
  "homework/backward": clientOnly(BackwardTool),
};
