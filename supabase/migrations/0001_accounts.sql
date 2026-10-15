-- Rumbo, step 1A: accounts, profile, synced device data, rate limits.
-- Paste this whole file into Supabase > SQL Editor > New query > Run.
-- Safe to run twice.

create extension if not exists citext;

-- ---------------------------------------------------------------------------
-- Profile: one row per student. The username is the login name, never a real name.
-- ---------------------------------------------------------------------------
create table if not exists public.profiles (
  id          uuid primary key references auth.users (id) on delete cascade,
  username    citext not null unique
              check (username ~ '^[a-z0-9_]{3,20}$'),
  grade       smallint check (grade between 5 and 12),
  school      text check (char_length(school) <= 80),
  lang        text not null default 'en' check (lang in ('en', 'es')),
  interests   text[] not null default '{}' check (cardinality(interests) <= 20),
  why         text check (char_length(why) <= 300),
  created_at  timestamptz not null default now()
);
alter table public.profiles enable row level security;

drop policy if exists "profiles: read own" on public.profiles;
create policy "profiles: read own" on public.profiles
  for select to authenticated using (id = auth.uid());

-- Students may edit their own profile, but not their id or username.
drop policy if exists "profiles: update own" on public.profiles;
create policy "profiles: update own" on public.profiles
  for update to authenticated using (id = auth.uid()) with check (id = auth.uid());

-- Rows are created only by the server (service role) when an account is made.

-- ---------------------------------------------------------------------------
-- Synced device data. Every [LOCAL] tool stores its data on the device and
-- mirrors it here as one JSON document per key. Newest write wins.
-- ---------------------------------------------------------------------------
create table if not exists public.user_data (
  user_id     uuid not null references auth.users (id) on delete cascade,
  key         text not null check (char_length(key) <= 80),
  value       jsonb not null,
  updated_at  timestamptz not null default now(),
  primary key (user_id, key),
  check (pg_column_size(value) <= 262144)  -- 256 KB per document
);
alter table public.user_data enable row level security;

drop policy if exists "user_data: own rows" on public.user_data;
create policy "user_data: own rows" on public.user_data
  for all to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());

-- ---------------------------------------------------------------------------
-- Recovery codes. There is no email, so this is the only way back in.
-- Only the hash is stored, and only the server can read it.
-- ---------------------------------------------------------------------------
create table if not exists public.recovery_codes (
  user_id    uuid primary key references auth.users (id) on delete cascade,
  code_hash  text not null,
  created_at timestamptz not null default now()
);
alter table public.recovery_codes enable row level security;
-- No policies on purpose: students can never read this table.

-- ---------------------------------------------------------------------------
-- Rate limits. Serverless functions share no memory, so counts live here.
-- Returns true when the call is allowed.
-- ---------------------------------------------------------------------------
create table if not exists public.rate_limits (
  key          text primary key,
  window_start timestamptz not null default now(),
  hits         integer not null default 0
);
alter table public.rate_limits enable row level security;

create or replace function public.hit_rate_limit(p_key text, p_max integer, p_window_seconds integer)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  allowed boolean;
begin
  insert into public.rate_limits as r (key, window_start, hits)
  values (p_key, now(), 1)
  on conflict (key) do update
    set hits = case
                 when r.window_start < now() - make_interval(secs => p_window_seconds) then 1
                 else r.hits + 1
               end,
        window_start = case
                 when r.window_start < now() - make_interval(secs => p_window_seconds) then now()
                 else r.window_start
               end
  returning (r.hits <= p_max) into allowed;
  return allowed;
end;
$$;

-- Only the server (service role) may call it.
revoke all on function public.hit_rate_limit(text, integer, integer) from public, anon, authenticated;
grant execute on function public.hit_rate_limit(text, integer, integer) to service_role;

-- Old counters can be cleared by a cron job later:
--   delete from public.rate_limits where window_start < now() - interval '1 day';
