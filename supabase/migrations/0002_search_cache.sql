-- Rumbo, step 1B: shared cache for Opportunity Finder answers.
-- Two students asking the same thing share one answer for 24 hours, which keeps AI costs low.
-- Holds no personal data: the key is built only from the question, the place and the filters.
-- Paste into Supabase > SQL Editor > Run. Safe to run twice.

create table if not exists public.search_cache (
  key        text primary key,
  result     jsonb not null,
  created_at timestamptz not null default now()
);
alter table public.search_cache enable row level security;
-- No policies on purpose: only the server (service role) reads or writes this table.

create index if not exists search_cache_created_at_idx on public.search_cache (created_at);
-- Old rows can be cleared by a cron job:
--   delete from public.search_cache where created_at < now() - interval '3 days';
