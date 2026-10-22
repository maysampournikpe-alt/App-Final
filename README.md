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

## Growing the SAT question bank

Needs to run on a computer that can reach Groq, with `GROQ_API_KEY` in `.env.local`:

```bash
npm run bank:generate -- --all --per-skill 12     # every skill, both sections
npm run bank:generate -- --section math --skill algebra --count 8
```

Each question is checked by structure, by an independent AI solve that never sees the answer key, and
for duplicates. Read through a sample of `src/data/bank/sat-generated.json`, then commit it.

## Before you submit

- Run `npm run typecheck && npm run lint && npm test && npm run build`.
- Confirm `/api/health` says `healthy: true` on the production link.
- Confirm no key is in the repo: `git grep -nE "gsk_|sb_secret_"` should print nothing.
