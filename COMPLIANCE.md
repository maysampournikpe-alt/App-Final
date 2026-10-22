# 2026 Congressional App Challenge: compliance notes

Working notes for the submitter. Check them against the official 2026 rules before you submit. Nothing here replaces reading the rules yourself.

## What the rules ask for, and where the app stands

| Rule | Status |
| --- | --- |
| The app is solely created by the student | Your statement to make. Say only what is true. |
| AI tools used in development are allowed only if fully disclosed and not the entirety of the work | You must disclose. See "AI disclosure" below. |
| Open-source libraries must be documented | Listed below. |
| No third-party IP or privacy violations | See "Third-party content" below. |
| Video is 3 minutes or less and covers names, app name, one-sentence purpose, audience, tools and functionality | See `CAC-SCRIPT.md`. |
| Judges may ask for source code or app access | Keep the repository and the live link available. |
| One entry per person | Your responsibility. |

## Google Maps (switched off)

Google Maps features are removed until after the contest: the bus map, the map on the program and event finder, and the "open in maps" buttons. Nothing in `src` links to Google Maps. To restore them after the contest, bring back the code removed in commit `cb7cafc` (`git show cb7cafc -- src/components/tools src/config/features.ts src/data/guides.ts`).

## Open-source libraries (from `package.json`)

Runtime: Next.js, React, React DOM, `@supabase/ssr`, `@supabase/supabase-js`, `chess.js` (BSD), `katex`, `lucide-react`, `mathjs`, `zod`, `server-only`, and the font packages `@fontsource-variable/fraunces`, `@fontsource/atkinson-hyperlegible`, `@fontsource/opendyslexic`.

Development: TypeScript, Tailwind CSS (with `@tailwindcss/turbopack`), ESLint with `eslint-config-next`, Vitest, `tsx`, `sharp`, and the `@types/*` packages.

Check each package's license in `node_modules/<name>/package.json` before you submit, and say so in your documentation.

## AI disclosure

Two different things need to be described honestly.

1. AI inside the app (allowed by the rules as a feature): the Coach, the Opportunity Finder and the study helpers call the Groq API from the server. Practice questions for the study paths, mock exams, notes, vocabulary and cram sheets can be written by an AI and are checked by a second AI call. Say this in the video and in your write-up. These answers can be wrong, and the app tells students so.
2. AI used to build the app: an AI coding assistant (Claude Code) wrote and edited code in this repository at your direction. The rules ask you to disclose this fully. Describe what you decided, what you wrote and what you tested yourself, and state the AI's role truthfully. The rules say AI must not be the entirety of the development, so be ready to explain the parts you did yourself.

## Third-party content

- Study notes, vocabulary lists, cram sheets and extra practice questions are written by the AI at the time a student asks, not copied from any publisher. Real-exam-style questions imitate the format of the tests, never specific released questions.
- Practice questions are original, from the app's own seed files or written by the app's AI. They are not copied from College Board, ACT or Khan Academy.
- The YouTube and Khan Academy buttons only open a search page on those sites in a new tab. The app does not copy, embed or download their videos or text.
- AP topic names follow the usual public course outlines, which College Board publishes. They were not checked against the official Course and Exam Descriptions, so verify them before you claim they are exact.
- Trademark notice: AP, SAT and PSAT are trademarks of College Board, and ACT is a trademark of ACT, Inc. The app shows a "not affiliated or endorsed" line on its test-prep screens.
- Privacy: the app stores study data on the device and, when signed in, in your Supabase project. Student passwords are handled by Supabase Auth. No unmoderated chat or message boards.

## Before you submit

- Run the checks in `README.md` ("Before you submit").
- Run migration `supabase/migrations/0004_question_bank.sql` in the Supabase SQL editor so the shared question bank works.
- Generate more questions on your own computer (see "Growing the question banks" in `README.md`) and read a sample before you commit it.
- Test the live link on a phone.
