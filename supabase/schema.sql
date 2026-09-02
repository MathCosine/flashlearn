-- FlashLearn database schema
-- Run this once in your Supabase project's SQL Editor
-- (Dashboard -> SQL Editor -> New query -> paste this whole file -> Run).
--
-- Already ran an older version of this file? Run the files in
-- supabase/migrations/ instead — they only add what's new.

-- ── Sets (decks) ─────────────────────────────────────────────────────────
create table if not exists public.sets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  description text,
  category text,
  tags text[] not null default '{}',
  extra_fields jsonb not null default '[]',
  strict_answers boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists sets_user_id_idx on public.sets (user_id);

-- ── Cards ────────────────────────────────────────────────────────────────
create table if not exists public.cards (
  id uuid primary key default gen_random_uuid(),
  set_id uuid not null references public.sets (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  front text not null,
  back text not null,
  extra_data jsonb not null default '{}',
  image_url text,
  created_at timestamptz not null default now()
);

create index if not exists cards_set_id_idx on public.cards (set_id);
create index if not exists cards_user_id_idx on public.cards (user_id);

-- ── Per-user, per-card study progress ────────────────────────────────────
create table if not exists public.card_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  card_id uuid not null references public.cards (id) on delete cascade,
  dots integer not null default 0,
  known boolean not null default false,
  starred boolean not null default false,
  times_seen integer not null default 0,
  times_correct integer not null default 0,
  last_reviewed timestamptz,
  unique (user_id, card_id)
);

create index if not exists card_progress_user_id_idx on public.card_progress (user_id);

-- ── One row per finished study session (powers stats and streaks) ────────
create table if not exists public.study_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  mode text not null,
  cards_studied integer not null default 0,
  cards_correct integer not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists study_sessions_user_id_idx
  on public.study_sessions (user_id, created_at desc);

-- ── Row Level Security: every user can only ever touch their own rows ───
alter table public.sets enable row level security;
alter table public.cards enable row level security;
alter table public.card_progress enable row level security;
alter table public.study_sessions enable row level security;

drop policy if exists "sets are owned by their creator" on public.sets;
create policy "sets are owned by their creator" on public.sets
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "cards are owned by their creator" on public.cards;
create policy "cards are owned by their creator" on public.cards
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "progress is owned by its creator" on public.card_progress;
create policy "progress is owned by its creator" on public.card_progress
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "sessions are owned by their creator" on public.study_sessions;
create policy "sessions are owned by their creator" on public.study_sessions
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ── Storage bucket for card images ───────────────────────────────────────
insert into storage.buckets (id, name, public)
values ('card-images', 'card-images', false)
on conflict (id) do nothing;

drop policy if exists "own card images: read" on storage.objects;
create policy "own card images: read" on storage.objects
  for select
  using (
    bucket_id = 'card-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "own card images: write" on storage.objects;
create policy "own card images: write" on storage.objects
  for insert
  with check (
    bucket_id = 'card-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "own card images: delete" on storage.objects;
create policy "own card images: delete" on storage.objects
  for delete
  using (
    bucket_id = 'card-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
