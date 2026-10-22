# Rumbo

A free app that helps middle and high school students in the Rio Grande Valley find
opportunities, build skills, study better and reach their goals. English and Spanish.
Built for the 2026 Congressional App Challenge. (The name is a placeholder in
`src/config/brand.ts`.)

Status of every feature: see [FEATURES.md](FEATURES.md).

## Run it locally

```bash
npm install
cp .env.example .env.local   # fill in values; never commit this file
npm run dev                  # http://localhost:3000
```

| Command | What it does |
|---|---|
| `npm run build` | Production build (what Vercel runs) |
| `npm run typecheck` | Route types + TypeScript |
| `npm run lint` | ESLint |
| `npm run check:contrast` | Fails if any color pair drops below WCAG AA |
| `npm run features:md` | Regenerates FEATURES.md from `src/config/features.ts` |
| `npm run icons` | Re-renders the PWA icons from `public/icon.svg` |

## Environment variables

Listed in `.env.example`. Real values go in **Vercel → Project → Settings → Environment
Variables**, never in the repo. `SUPABASE_SERVICE_ROLE_KEY` and `GROQ_API_KEY` are
server-only; mark them Sensitive. Only variables starting with `NEXT_PUBLIC_` reach the browser.

## Deploy to Vercel

1. Push this repo to GitHub.
2. In Vercel: **Add New → Project**, pick the repo. Framework is detected as Next.js.
3. Add the environment variables above, then deploy. Every push to `main` deploys to
   production, and every other branch gets its own preview link.
4. In Supabase → Authentication → URL Configuration, add the production URL and the
   Vercel preview URL pattern as allowed redirect URLs.

## How the app is organized

- `src/config/features.ts`: every feature, in English and Spanish. The sidebar, tab pages,
  "Coming soon" previews and FEATURES.md all read from it. Add a key to `BUILT` when a
  feature ships and its badge disappears.
- `src/components/tools/registry.tsx`: maps each feature key ("tab/tool") to the screen that runs it.
  Most tools keep their data on the device through `useLocalDoc` and sync it when signed in.
- `src/app/api/`: `coach` (streaming chat), `find` (Opportunity Finder), `plan`, and `assist`. The `assist` route runs
  the one-shot AI helpers (summaries, quizzes, feedback and so on). The browser sends a task name and the student's text,
  never a prompt: the reviewed prompts live in `src/lib/ai/assist.ts`. It has input limits, a rate limit, and the same
  crisis handling as the Coach.
- `/api/learn` powers the study paths (`/t/ap/path`, `/t/sat/path`, `/t/psat/path`, `/t/act/path`, `/t/tsi/path`). It takes only ids from our own lists (course, unit), writes unit notes, and writes practice questions that a second AI call solves blind; only questions where both agree are kept. Questions from the checked bank are always used first.
- AP guard rails for the AI writers (server only, never sent to students): `src/data/ap/profiles.ts` (what each course is about and what must never be tested in it, for all 41 courses), `unit-briefs.ts` (every unit) and `topic-briefs-*.ts` (every topic of Biology, Chemistry, Environmental Science, the four Physics courses and Psychology). `src/lib/exam/ap-briefs.ts` joins them. Every written question must also pass a harsh reviewer that checks scope, accuracy (one clearly taught answer, no arguable ones) and a 1 to 10 fit score against a real exam question (at least 8, or 9 for real-exam-style; change `MIN_FIT` in `src/lib/exam/verify.ts`). `styles.ts` says how real questions in each course are built, and `topic-contexts-bio.ts` lists good biological settings for each AP Biology topic. These briefs are written from the published course structure and public study guides, not copied from the CED, so compare them with the CED and fix any line.
- AP courses, units and topics (1.1, 1.2, 1.3 ...) live in `src/data/ap/` (`stem.ts`, `social.ts`, `humanities.ts`) and are turned into the course list in `src/lib/exam/ap.ts`. They follow the usual College Board course outlines but were written without opening the official Course and Exam Descriptions, so topic names and numbers can differ slightly. Compare with apcentral.collegeboard.org and fix any entry in those files.
- `/api/learn` takes `kind`: `notes` (one topic), `quiz` (questions for a unit or a topic), `terms` (vocabulary for a unit) and `cram` (a one-page cram sheet). Questions made by the AI are saved in the shared `question_bank` table (migration `0004_question_bank.sql`, run it in the Supabase SQL editor) so the next student gets them without another AI call.
- SAT, PSAT, ACT and TSI sub-skills (1.1, 1.2 ...) live in `src/data/exam-topics.ts`. `src/lib/exam/courses.ts` shapes every test like an AP course (section = course, skill = unit, sub-skill = topic) so the path, home, quizzes, mock exams, vocabulary and cram sheets are the same screens for all five tests.
- Quiz difficulty levels are mixed, easy, medium, hard and real exam style (`src/lib/exam/levels.ts`). The question writer gets a different prompt for real exam style: a stimulus first, then a question that applies a skill.
- Practice screens live in `src/components/exam/PracticeTools.tsx` (quizzes, mock exams, vocabulary, cram sheets), the home in `ApTools.tsx` (`ExamHubTool`), the path in `StudyPath.tsx`. Study notes are detailed (sections, examples, how it is tested, memory tips); bump `NOTES_VERSION` in `src/lib/ai/learn.ts` when that shape changes.
- AP section screens (older note): `src/components/exam/StudyPath.tsx` (topic by topic path with YouTube and Khan Academy search links, notes, quiz, XP), `ApTools.tsx` (course picker and AP home), `ApStudy.tsx` (practice quizzes, mock exams, vocabulary, cram sheets). Questions are collected by `src/lib/exam/gather.ts`: bank first, then the AI, then kept on the device.
- Google Maps features (bus map and finder maps) are switched off until after the 2026 Congressional App Challenge. See COMPLIANCE.md.
- AI features need `GROQ_API_KEY` on the server. With `AI_FIXTURES=1` the helpers return a fixed reply, which is
  how the screens are tested without a key.
- `chess.js` (BSD license) validates moves in the chess opening trainer.
- `src/app/globals.css`: the design tokens (color, type, card families, motion).
- `/styleguide`: every component on one page. Not linked from the app.
- `src/lib/i18n.ts`: interface text. Add a language by adding a column.
- `src/lib/prefs.ts`: theme, text size, dyslexia font, low data mode, pinned tabs. Stored on
  the device.

## Demo and checking a deployment

- **/demo** fills the device you are on with sample classes, homework, saved items, a plan in progress,
  focus time and SAT practice, so you can show the app with real-looking content. It is labeled "Sample"
  and has a Remove button. It never touches a real account.
- **A real demo account** for judges: on your computer, with `.env.local` filled in, run
  `DEMO_PASSWORD='something-good' npm run demo:seed`. It creates `demo_student` with the same sample data.
  Share the password through the submission form, not in this README.
- **/api/health** shows what is configured on the live site (yes/no flags and short database messages,
  never a key). If the Coach, Finder or sign-up misbehave, open it first.

## Growing the question banks (SAT, ACT, TSI and every AP course)

No computer needed: add a repository secret named `GROQ_API_KEY` (Settings > Secrets and variables > Actions), then open the Actions tab, pick "Generate practice questions" and press Run workflow. The new questions land on a `bank/...` branch for you to read and merge. The commands below do the same thing by hand.

Needs to run on a computer that can reach Groq, with `GROQ_API_KEY` in `.env.local`:

```bash
npm run bank:generate -- --all --per-skill 12     # every skill, both SAT sections
npm run bank:generate -- --section math --skill algebra --count 8
npm run bank:generate -- --exam ap --section ap-biology --per-skill 12   # one AP course, every unit
npm run bank:generate -- --exam ap --section ap-biology --topics --per-skill 4   # every topic (1.1, 1.2 ...)
npm run bank:generate -- --exam sat --all --topics --level exam --per-skill 4   # real-exam-style, every sub-skill (--level mixed|easy|medium|hard|exam)
npm run bank:generate -- --exam act --all --per-skill 8
npm run bank:generate -- --exam tsi --all --per-skill 8
npm run bank:generate -- --list                   # exams, course ids and unit ids
```

Each question is checked by structure, by an independent AI solve that never sees the answer key, by a scope check (is it really about this course and topic, at the level of the real exam, with no ideas from another course), and
for duplicates. Read through a sample of `src/data/bank/sat-generated.json`, then commit it.

## Before you submit

- Run `npm run typecheck && npm run lint && npm test && npm run build`.
- Confirm `/api/health` says `healthy: true` on the production link.
- Confirm no key is in the repo: `git grep -nE "gsk_|sb_secret_"` should print nothing.
