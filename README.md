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
- `src/app/globals.css`: the design tokens (color, type, card families, motion).
- `/styleguide`: every component on one page. Not linked from the app.
- `src/lib/i18n.ts`: interface text. Add a language by adding a column.
- `src/lib/prefs.ts`: theme, text size, dyslexia font, low data mode, pinned tabs. Stored on
  the device.
