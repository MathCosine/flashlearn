-- Migration 002: per-card stats, starring, card images, and a session log.
--
-- Run this in your Supabase project's SQL Editor if you already ran
-- schema.sql before this migration existed. It is safe to run more than
-- once. (A brand new project can just run schema.sql, which already
-- includes everything below.)

alter table public.card_progress
  add column if not exists starred boolean not null default false;

alter table public.card_progress
  add column if not exists times_seen integer not null default 0;

alter table public.card_progress
  add column if not exists times_correct integer not null default 0;

alter table public.cards
  add column if not exists image_url text;

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

alter table public.study_sessions enable row level security;

drop policy if exists "sessions are owned by their creator" on public.study_sessions;
create policy "sessions are owned by their creator" on public.study_sessions
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ── Storage bucket for card images ───────────────────────────────────────
-- Files are stored under a folder named after the owner's user id, and the
-- policies below make sure nobody can read or write another user's folder.
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
