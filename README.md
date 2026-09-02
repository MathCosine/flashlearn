# FlashLearn

A flashcard app for any subject. Build sets, organize them by category and
tag, mix several together, and drill them nine different ways — including
digital versions of the pile-sorting and dot-marking methods that work on
paper.

Runs on two free services: **Supabase** (auth + database + image storage)
and **GitHub Pages** (static hosting). No paid tier required.

## What it does

- **Cards** have a front, a back, and any optional labeled fields you define
  per set (Gender, Principal parts, Units, Date — whatever the subject needs).
- **Math and science**: write LaTeX between dollar signs (`$e^{i\pi}+1=0$`)
  and it renders as real math. KaTeX is only downloaded when a card
  actually contains math.
- **Images**: attach a picture to a card. Files live in a private storage
  bucket that only you can read.
- **Languages**: click-to-insert macron vowels (ā ē ī ō ū) when writing cards
  or typing answers, and forgiving answer checking.
- **Importing**: paste straight from a spreadsheet or type a list with any
  separator — tab, pipe, comma, dash or colon. The importer detects the
  format, previews the parsed table, and can load a `.csv`/`.txt` file.
- **Progress**: dots pile up on stubborn cards, stars flag ones you choose,
  and a day streak plus a progress page show what's actually sticking.

### The nine study modes

| Mode | What it does |
| --- | --- |
| Classic Flip | See the prompt, recall, flip to check. Space and arrow keys. |
| Stack Method | Sort into "known" / "not yet" piles, repeat the not-yet pile until empty. |
| Dot Method | Missed cards earn a dot that's saved to your account. |
| Learn | Adaptive: multiple choice first, promoted to typing once a card sticks. |
| Speed Round | 1, 3 or 5 minute timed sprint. |
| Match Game | Race the clock pairing prompts and answers. Saves your best time. |
| True or False | Rapid fire — is this pairing right? Tracks your streak. |
| Multiple Choice | Options generated from your own other cards. Press 1–4. |
| Type the Answer | Type it from memory, with forgiving matching. |

Every session can run **front→back, back→front or mixed**, over **all cards,
only unknown ones, only starred, or only 3+ dots**, shuffled or in order, and
capped at 10 / 20 / 50 cards.

## 1. Set up Supabase (free)

1. Create a free account and project at [supabase.com](https://supabase.com).
2. Open **SQL Editor**, paste the whole of
   [`supabase/schema.sql`](./supabase/schema.sql), and run it. This creates
   the tables, the row-level-security policies (so a user can only ever read
   their own rows), and the private `card-images` storage bucket.
   - **Already ran an older version of `schema.sql`?** Run the files in
     [`supabase/migrations/`](./supabase/migrations/) instead — they only add
     what's new and are safe to re-run.
3. Open **Settings → API** and copy two values:
   - **Project URL**
   - the **publishable** key (older projects call this the **anon public**
     key — same thing). It's designed to be public; row level security is
     what protects the data.
4. Optional: under **Authentication → Providers → Email**, turn off "Confirm
   email" if you don't want to click a confirmation link when signing up.

## 2. Run it locally

```bash
npm install
cp .env.example .env.local   # then paste in your URL + key
npm run dev
```

## 3. Deploy free on GitHub Pages

1. **Settings → Pages** → set **Source** to **GitHub Actions**.
2. **Settings → Secrets and variables → Actions** → add
   `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.
3. **Settings → Environments → github-pages** → under *Deployment branches
   and tags*, make sure `main` is allowed (or set it to no restriction).
   Without this the deploy job is blocked by environment protection rules.
4. Push to `main`. The workflow in
   [`.github/workflows/deploy.yml`](./.github/workflows/deploy.yml) builds
   and publishes automatically; every later push redeploys.

Live at `https://<your-username>.github.io/<repo-name>/`.

### Why GitHub Pages works without a server

GitHub Pages only serves static files — it can't run a database. It doesn't
need to: Supabase *is* the backend, running on its own infrastructure, and
the browser talks to it directly over HTTPS. GitHub Pages just hosts the app
shell.

Prefer something else? It's a plain static site, so `npm run build` and
uploading `dist/` works on Netlify, Firebase Hosting, or any static host.

## Project structure

```
src/
  components/       Shared UI; components/ui/ holds the design primitives
  context/          Auth state
  hooks/            Keyboard shortcut hook
  lib/              Supabase client, all database calls (api.ts), sounds, seed data
  pages/            Routed pages; pages/study/ has one file per study mode
  utils/            Shuffling, answer checking, import parsing, streaks, colors
supabase/
  schema.sql        Full schema for a new project
  migrations/       Incremental changes for an existing project
```

Study sessions are driven entirely by the URL
(`#/study/session?sets=…&mode=match&dir=front&pool=unknown`), so a session
survives a refresh and can be bookmarked. Each mode only reports "this card
was right/wrong" and a single place in `StudySession.tsx` turns that into
saved progress.
