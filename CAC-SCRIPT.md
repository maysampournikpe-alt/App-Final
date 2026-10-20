# Congressional App Challenge 2026: video script and written answers

Rules checked on congressionalappchallenge.us (2026): video **1 to 3 minutes** (hard max 3:00), uploaded to YouTube or Vimeo set to **public**. It must say: every participant's name, the app's name, a one-sentence purpose, the target audience, the tools and languages used, and what the app does. The deadline is **Oct 26, 2026, 12:00 PM ET**. Judges may penalize a video that runs over.

Fill in everything in [BRACKETS]. Read it out loud once and time it; this script is about 2:20 at a normal speaking pace.

---

## Video script (about 2:20)

| Time | On screen | Say |
|---|---|---|
| 0:00 | Home page, search box | "Hi, I'm [YOUR NAME], a [GRADE]th grader at [SCHOOL] in the Rio Grande Valley. This is **Rumbo**, a free, bilingual app that helps middle and high school students find opportunities and prepare for their future." |
| 0:15 | Sidebar with the 7 hubs | "Rumbo is for students like me, in South Texas. [ADD YOUR OWN REASON, for example: "I kept missing programs I only heard about after the deadline."] Good programs exist, but they are hard to find, and test prep costs money. Rumbo puts it in one place, in English and Spanish." |
| 0:35 | Finder: search "chess clubs" near 78539 | "First, the Opportunity Finder. I type what I'm interested in and my ZIP code. It searches the web and shows real clubs, contests and programs near me. Every listing links to its source, and if the app can't confirm a listing, it says so instead of guessing." |
| 0:55 | A listing, then the ES language switch | "Everything switches to Spanish with one tap, so my family can use it too." |
| 1:05 | Test Prep → SAT practice question, then results | "Test Prep has free practice for the SAT, PSAT, ACT, TSI and AP exams. After a test, Rumbo shows my weak skills and builds practice from the questions I missed." |
| 1:25 | Coach chat, ask a question | "The Coach is an AI tutor that explains things simply. If a student writes that they are in crisis, it skips the AI and shows the 988 hotline and 911 right away." |
| 1:40 | Flashcards review, then habit tracker | "Many tools work with no internet at all, like flashcards with spaced repetition, a habit tracker, a savings goal tracker, and a GPA calculator. Everything is saved on the device, and signed-in students get it on every device." |
| 1:55 | Settings → Account, sign-up screen | "There is no email and no personal information. A student just picks a username and password, and gets a recovery code." |
| 2:05 | A slide or the README with the stack | "I built it with Next.js, React and TypeScript, styled with Tailwind CSS. Supabase stores accounts and data, Groq runs the AI on the server so no keys are exposed, and it is hosted on Vercel. It installs on a phone like an app." |
| 2:20 | Home page | "Next, I want to add more AP courses and college tools. Rumbo helps students find the next step, one trail at a time. Thank you!" |

If you run over 2:45, cut the flashcards/habit line and the sign-up line first.

### Before you record
- Say **every team member's name** out loud. The rules require it.
- Record on the live site (not localhost). Use the demo account so the screens are full, not empty: `npm run demo:seed`.
- Use a real recording of the screen with your voice. Keep clicks slow and smooth.
- Upload to YouTube or Vimeo, set it to **Public**, and paste the link in the submission.
- **Be honest about AI.** The rules say AI may only support parts of the project and must not be the entire technical development. Add one truthful line, for example: "I used an AI coding assistant to help write and debug code. I designed the app, chose the features, wrote the practice content and tested it with [WHO]." Say only what is true for you.

---

## Written answer: technical challenge

Past years asked: *What technical or coding difficulty did you face, and how did you address it?* Adjust to your own words and to what you personally worked through.

> The hardest problem was trusting the AI. When the Opportunity Finder asked an AI model for clubs and programs near a student, it sometimes returned listings with web links that did not exist. A student could waste time on a program that isn't real, or worse, get scammed. I fixed this by checking every link the AI gives against the pages the web search really returned. Any listing whose link can't be matched is moved to a separate "not confirmed, ask first" list. I also filter for age and scam patterns, such as requests for payment up front. A second challenge was the AI service's per-minute limits. When one model was full, the Coach showed an error. I changed the server to switch to another model automatically, and I added a test to prove it works. Finally, I kept all keys on the server so they never reach the student's browser.

---

## Written answer: what problem does it solve

> Students in the Rio Grande Valley often don't hear about clubs, contests, scholarships and programs, and test prep is expensive. Rumbo gathers these in one free, bilingual app that works on a phone, works offline for many tools, and asks for no email or personal information.
