# FlashLearn

A general-purpose flashcard app: make sets for any subject (Latin vocab,
chemistry, history dates, whatever), categorize and tag them, mix multiple
sets together, and study with six different modes — classic flip, the stack
method, the dot method, a 5-minute speed round, multiple choice, and
type-the-answer.

Runs entirely on two free services: **Supabase** (auth + database) and
**GitHub Pages** (static hosting). No servers to manage, no paid tier
required.

## How it's built

- **Frontend**: React + TypeScript + Vite, styled with Tailwind CSS.
- **Backend**: none — the frontend talks directly to Supabase (Postgres +
  Auth + auto-generated REST API) from the browser using the Supabase JS
  client. Row Level Security policies make sure every user can only ever
  see and edit their own data.
- **Hosting**: the built static site is deployed to GitHub Pages via a
  GitHub Actions workflow that runs on every push to `main`.

Cards have a simple **front** and **back**, plus any number of optional
**extra fields** you define per set (e.g. "Gender", "Principal parts",
"Formula", "Derivatives") that show up on the back of every card in that
set. That's flexible enough for Latin dictionary entries, chemistry
formulas, or plain vocab — whatever you're studying.

## 1. Set up Supabase (free)

1. Go to [supabase.com](https://supabase.com) and create a free account and
   a new project (pick any name/region; the free tier is plenty for this).
2. Once the project is ready, open **SQL Editor** in the left sidebar,
   paste the entire contents of [`supabase/schema.sql`](./supabase/schema.sql),
   and click **Run**. This creates the `sets`, `cards`, and `card_progress`
   tables along with Row Level Security policies so users can only access
   their own data.
3. Open **Settings → API**. You'll need two values from this page:
   - **Project URL** (looks like `https://xxxxxxxx.supabase.co`)
   - **anon public** key (a long string — this is safe to expose in a
     frontend app; RLS is what actually protects the data)
4. Optional but recommended for a smoother signup flow: go to
   **Authentication → Providers → Email** and turn off "Confirm email" if
   you don't want to deal with confirmation emails during development.

## 2. Run it locally

```bash
npm install
cp .env.example .env.local
# edit .env.local and paste in your Supabase Project URL and anon key
npm run dev
```

Open the printed `localhost` URL, sign up for an account, and start
creating sets.

## 3. Deploy for free on GitHub Pages

1. Push this repo to GitHub (if it isn't already).
2. In the repo, go to **Settings → Pages** and set **Source** to
   **GitHub Actions**.
3. Go to **Settings → Secrets and variables → Actions** and add two
   repository secrets:
   - `VITE_SUPABASE_URL` — your Supabase Project URL
   - `VITE_SUPABASE_ANON_KEY` — your Supabase anon public key
4. Push to `main` (or run the "Deploy to GitHub Pages" workflow manually
   from the **Actions** tab). The included workflow
   (`.github/workflows/deploy.yml`) builds the app and publishes it to
   GitHub Pages automatically.
5. Your app will be live at `https://<your-github-username>.github.io/<repo-name>/`.

That's it — no Vercel, no Cloudflare, no server to pay for. Supabase's free
tier and GitHub Pages are both free forever for a project this size.

### Why this works without a backend server

GitHub Pages only serves static files (HTML/CSS/JS) — it can't run a
database. That's fine here because Supabase *is* the database and backend,
running on its own infrastructure. The React app calls Supabase directly
over HTTPS from the browser. GitHub Pages just hosts the app shell; all
your data lives in and is served by Supabase.

### Alternatives to GitHub Pages

If you'd rather not use GitHub Pages, the app is a plain static site and
deploys the same way to [Netlify](https://netlify.com) or
[Firebase Hosting](https://firebase.google.com/products/hosting) (both have
free tiers) — just run `npm run build` and upload the `dist/` folder, or
connect the repo through their dashboards. You'd still use Supabase for the
backend either way.

## Using the app

- **Sets**: A set is a deck of cards on one topic. Give it a name,
  optional category (e.g. "Latin"), optional tags (e.g. "chapter 3"), and
  any extra fields you want on the back of cards (gender, formula, dates,
  etc.).
- **Cards**: Add cards one at a time, or use **Bulk import** to paste many
  at once — one per line, fields separated by `|`:
  ```
  agricola | farmer | agricola, agricolae | m | 1st declension
  ```
- **Studying**: Go to **Study / Mix Sets**, check off one or more sets
  (mixing across categories works fine for combined review), pick a mode,
  and start:
  - **Classic Flip** — look, recall, flip to check.
  - **Stack Method** — sorts cards into "known" / "not yet" piles and
    repeats with just the "not yet" pile until everything is known.
  - **Dot Method** — cards you miss get a dot that's saved to your
    account; a "focus on 3+ dots" filter lets you zero in on your
    stubborn cards later in the semester.
  - **Speed Round** — a 5-minute shuffled sprint, good for a quick daily
    review.
  - **Multiple Choice** — auto-generated wrong answers pulled from the
    other cards in your session.
  - **Type the Answer** — type it from memory. Matching is lenient by
    default (case, extra spaces, and accents don't need to be exact, and
    any comma-separated synonym counts); turn on "Strict answer checking"
    per-set if you want exact matches required.
- A sample Latin vocabulary set is available from an empty dashboard
  ("Add a sample set") just to show the format — feel free to delete it.

## Project structure

```
src/
  components/       Shared UI (Button, Panel, flashcard view, forms)
  context/          Auth state
  lib/              Supabase client + all database calls (lib/api.ts)
  pages/            Routed pages, including pages/study/ for each mode
  types.ts          Shared TypeScript types
  utils/            Shuffling, answer-checking, color helpers
supabase/schema.sql Database schema + Row Level Security policies
```
