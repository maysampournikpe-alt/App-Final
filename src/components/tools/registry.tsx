"use client";
import { useSyncExternalStore, type ComponentType } from "react";
import { Page } from "../ui";
import { AccountTool } from "./Account";
import { BackwardTool } from "./Backward";
import { CoachTool } from "./Coach";
import { BragTool, CertificatesTool, ResumeTool, TrackerTool, VolunteerTool } from "./Achievements";
import { CareersTool, DayInLifeTool, MajorsTool, QuizTool } from "./CareerTools";
import { CollegesTool, ScholarshipsTool } from "./CollegeFinder";
import { CoursesTool, PlaylistTool, QuoteTool, SeasonalTool } from "./Explore";
import { ConflictsTool, ExportTool, OverloadTool, ScheduleTool, SchoolYearTool, SemesterTool, TimeBlockTool, WeeklyTool } from "./CalendarPlus";
import { AutoScheduleTool, CatchUpTool, PackingTool, StudyPlannerTool } from "./Planners";
import { BackpackTool, FrogTool, GroupPlannerTool, GroupProjectTool, InboxTool, KanbanTool, TwoMinuteTool } from "./HomeworkPlus";
import { AuditTool, BalanceTool, BrainGamesTool, BurnoutTool, DistractionTool, EnergyTool, EstimatorTool, FocusModeTool, LadderTool, ScreenTool, VisionTool } from "./FocusHabitsPlus";
import { ConjugationTool, PronunciationTool, TransCardsTool } from "./LanguageTools";
import { DataGraphTool, LabReportTool, MindMapTool, OutlineTool, PalaceTool } from "./NotesTools";
import { DailyTool, DebateTool, MethodsTool, ScienceFairTool, SpeakingTool, TestDayTool, TimedTool } from "./StudyMore";
import { CounterTool, EssayOutlineTool, ParaphraseTool, ReadLevelTool, ReadLogTool, ReadSpeedTool, ThesisTool, TypingTool, VocabBuilderTool, VocabCtxTool } from "./WritingTools";
import { AssistTool } from "./AssistTools";
import { ApFlashTool, ApNotesTool, ApPlanTool, AppTrackerTool, CitationTool } from "./MoreLocal";
import { CelebrationsTool, ChallengesTool, ParentViewTool, PortfolioTool, RadarTool, YearReviewTool } from "./AchievementsPlus";
import { FlyerTool, ForYouTool, HistoryTool, MapTool, SavedSearchesTool, SimilarTool, SurpriseTool } from "./FinderExtras";
import { ExportTool as DataExportTool, NotificationsTool, OfflineTool, ReadAloudTool, SidebarTool, VoiceTool } from "./SettingsMore";
import { ChessTool } from "./ChessTool";
import { StudyPathTool } from "../exam/StudyPath";
import { GuideTool } from "./GuideTool";
import { BusTool, EventsTool, LocalMapTool } from "./LocalTools";
import { LaborLawTool, TxAdmitTool, TxGradTool } from "./TexasTools";
import { BreaksTool, StressTool } from "./WellbeingExtra";
import { BudgetTool } from "./Budget";
import { BalancerTool, MolarTool, PeriodicTool } from "./ChemTools";
import { CalendarTool } from "./CalendarTool";
import { ConverterTool, CostTool, CreditsTool, RankTool } from "./CollegeTools";
import { CornellTool } from "./Cornell";
import { CountdownTool } from "./Countdown";
import { DrillsTool } from "./Drills";
import { FocusLogTool } from "./FocusLog";
import { FormulasTool } from "./Formulas";
import { FractionsTool } from "./Fractions";
import { GeometryTool } from "./Geometry";
import { GraphingTool, ScientificTool } from "./MathTools";
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
  "college/careers": clientOnly(CareersTool),
  "college/quiz": clientOnly(QuizTool),
  "college/dayinlife": clientOnly(DayInLifeTool),
  "college/majors": clientOnly(MajorsTool),
  "college/colleges": clientOnly(CollegesTool),
  "college/scholarships": clientOnly(ScholarshipsTool),
  "college/fafsa": clientOnly(() => <GuideTool id="college/fafsa" />),
  "college/dual": clientOnly(() => <GuideTool id="college/dual" />),
  "college/trades": clientOnly(() => <GuideTool id="college/trades" />),
  "college/military": clientOnly(() => <GuideTool id="college/military" />),
  "grades/txgrad": clientOnly(TxGradTool),
  "grades/txadmit": clientOnly(TxAdmitTool),
  "money/laborlaw": clientOnly(LaborLawTool),
  "local/map": clientOnly(LocalMapTool),
  "local/bus": clientOnly(BusTool),
  "local/events": clientOnly(EventsTool),
  "local/tutoring": clientOnly(() => <GuideTool id="local/tutoring" maps={[{ label: { en: "Libraries", es: "Bibliotecas" }, q: "public library" }, { label: { en: "Tutoring centers", es: "Centros de tutoría" }, q: "free tutoring" }]} />),
  "local/wifi": clientOnly(() => <GuideTool id="local/wifi" maps={[{ label: { en: "Libraries", es: "Bibliotecas" }, q: "public library free wifi" }, { label: { en: "Community centers", es: "Centros comunitarios" }, q: "community center" }]} />),
  "local/gear": clientOnly(() => <GuideTool id="local/gear" maps={[{ label: { en: "Boys and Girls Clubs", es: "Boys and Girls Clubs" }, q: "Boys and Girls Club" }, { label: { en: "Community centers", es: "Centros comunitarios" }, q: "community center" }]} />),
  "local/feewaiver": clientOnly(() => <GuideTool id="local/feewaiver" />),
  "wellbeing/stress": clientOnly(StressTool),
  "wellbeing/breaks": clientOnly(BreaksTool),
  "find/seasonal": clientOnly(SeasonalTool),
  "foryou/quote": clientOnly(QuoteTool),
  "study/courses": clientOnly(CoursesTool),
  "focus/playlist": clientOnly(PlaylistTool),
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
  "math/periodic": clientOnly(PeriodicTool),
  "math/molar": clientOnly(MolarTool),
  "math/balancer": clientOnly(BalancerTool),
  "math/formulas": clientOnly(FormulasTool),
  "math/scientific": clientOnly(ScientificTool),
  "math/graphing": clientOnly(GraphingTool),
  "money/compound": clientOnly(() => <MoneyTool view="compound" />),
  "money/savings": clientOnly(() => <MoneyTool view="savings" />),
  "money/paycheck": clientOnly(() => <MoneyTool view="paycheck" />),
  "homework/backward": clientOnly(BackwardTool),
  "calendar/schoolyear": clientOnly(SchoolYearTool),
  "calendar/semester": clientOnly(SemesterTool),
  "calendar/schedule": clientOnly(ScheduleTool),
  "calendar/timeblock": clientOnly(TimeBlockTool),
  "calendar/conflicts": clientOnly(ConflictsTool),
  "calendar/overload": clientOnly(OverloadTool),
  "calendar/gcal": clientOnly(ExportTool),
  "plan/catchup": clientOnly(CatchUpTool),
  "plan/studyplanner": clientOnly(StudyPlannerTool),
  "plan/packing": clientOnly(PackingTool),
  "calendar/autoschedule": clientOnly(AutoScheduleTool),
  "homework/backpack": clientOnly(BackpackTool),
  "homework/frog": clientOnly(FrogTool),
  "homework/twominute": clientOnly(TwoMinuteTool),
  "homework/kanban": clientOnly(KanbanTool),
  "homework/groupproject": clientOnly(GroupProjectTool),
  "homework/inbox": clientOnly(InboxTool),
  "homework/groupplanner": clientOnly(GroupPlannerTool),
  "focus/focusmode": clientOnly(FocusModeTool),
  "focus/distraction": clientOnly(DistractionTool),
  "focus/braingames": clientOnly(BrainGamesTool),
  "habits/ladder": clientOnly(LadderTool),
  "habits/vision": clientOnly(VisionTool),
  "habits/audit": clientOnly(AuditTool),
  "habits/estimator": clientOnly(EstimatorTool),
  "wellbeing/energy": clientOnly(EnergyTool),
  "wellbeing/screen": clientOnly(ScreenTool),
  "wellbeing/burnout": clientOnly(BurnoutTool),
  "wellbeing/balance": clientOnly(BalanceTool),
  "calendar/weekly": clientOnly(() => <WeeklyTool layer="all" />),
  "calendar/sports": clientOnly(() => <WeeklyTool layer="sports" />),
  "writing/outline": clientOnly(EssayOutlineTool),
  "writing/thesis": clientOnly(ThesisTool),
  "writing/counter": clientOnly(CounterTool),
  "writing/readlevel": clientOnly(ReadLevelTool),
  "writing/paraphrase": clientOnly(ParaphraseTool),
  "writing/readlog": clientOnly(ReadLogTool),
  "writing/readspeed": clientOnly(ReadSpeedTool),
  "writing/typing": clientOnly(TypingTool),
  "writing/vocabbuilder": clientOnly(VocabBuilderTool),
  "writing/vocabctx": clientOnly(VocabCtxTool),
  "notes/mindmap": clientOnly(MindMapTool),
  "notes/outline": clientOnly(OutlineTool),
  "notes/palace": clientOnly(PalaceTool),
  "math/labreport": clientOnly(LabReportTool),
  "math/datagraph": clientOnly(DataGraphTool),
  "languages/conjugation": clientOnly(ConjugationTool),
  "languages/transcards": clientOnly(TransCardsTool),
  "languages/pronunciation": clientOnly(PronunciationTool),
  "study/methods": clientOnly(MethodsTool),
  "study/testday": clientOnly(TestDayTool),
  "study/timed": clientOnly(TimedTool),
  "study/daily": clientOnly(DailyTool),
  "study/speaking": clientOnly(SpeakingTool),
  "study/debate": clientOnly(DebateTool),
  "study/sciencefair": clientOnly(ScienceFairTool),
  "notes/summarizer": clientOnly(() => <AssistTool task="summarizer" />),
  "notes/notestoquiz": clientOnly(() => <AssistTool task="notestoquiz" />),
  "notes/mnemonic": clientOnly(() => <AssistTool task="mnemonic" />),
  "study/feynman": clientOnly(() => <AssistTool task="feynman" />),
  "math/stepchecker": clientOnly(() => <AssistTool task="stepchecker" />),
  "writing/grammar": clientOnly(() => <AssistTool task="grammar" />),
  "college/essayfeedback": clientOnly(() => <AssistTool task="essayfeedback" />),
  "college/emailhelper": clientOnly(() => <AssistTool task="emailhelper" />),
  "college/reclett": clientOnly(() => <AssistTool task="reclett" />),
  "homework/taskbreaker": clientOnly(() => <AssistTool task="taskbreaker" />),
  "languages/bilingual": clientOnly(() => <AssistTool task="bilingual" />),
  "ap/frq": clientOnly(() => <AssistTool task="frq" />),
  "coach/interview": clientOnly(() => <CoachTool kind="practice" />),
  "writing/citation": clientOnly(CitationTool),
  "college/apptracker": clientOnly(AppTrackerTool),
  "ap/notes": clientOnly(ApNotesTool),
  "ap/flash": clientOnly(ApFlashTool),
  "ap/plan": clientOnly(ApPlanTool),
  "find/history": clientOnly(HistoryTool),
  "find/alerts": clientOnly(SavedSearchesTool),
  "find/surprise": clientOnly(SurpriseTool),
  "find/similar": clientOnly(SimilarTool),
  "find/flyer": clientOnly(FlyerTool),
  "find/map": clientOnly(MapTool),
  "foryou/challenge": clientOnly(ChallengesTool),
  "achievements/challenges": clientOnly(ChallengesTool),
  "achievements/portfolio": clientOnly(PortfolioTool),
  "achievements/radar": clientOnly(RadarTool),
  "achievements/yearreview": clientOnly(YearReviewTool),
  "profile/celebrations": clientOnly(CelebrationsTool),
  "family/parent": clientOnly(ParentViewTool),
  "settings/sidebar": clientOnly(SidebarTool),
  "settings/notifications": clientOnly(NotificationsTool),
  "settings/voice": clientOnly(VoiceTool),
  "settings/readaloud": clientOnly(ReadAloudTool),
  "settings/offline": clientOnly(OfflineTool),
  "settings/export": clientOnly(DataExportTool),
  "foryou/feed": clientOnly(() => <ForYouTool view="feed" />),
  "foryou/weekly": clientOnly(() => <ForYouTool view="weekly" />),
  "foryou/trynew": clientOnly(() => <ForYouTool view="trynew" />),
  "languages/conversation": clientOnly(() => <CoachTool kind="language" />),
  "study/chess": clientOnly(ChessTool),
  "ap/path": clientOnly(() => <StudyPathTool track="ap" />),
  "sat/path": clientOnly(() => <StudyPathTool track="sat" />),
  "psat/path": clientOnly(() => <StudyPathTool track="psat" />),
  "act/path": clientOnly(() => <StudyPathTool track="act" />),
  "tsi/path": clientOnly(() => <StudyPathTool track="tsi" />),
};
