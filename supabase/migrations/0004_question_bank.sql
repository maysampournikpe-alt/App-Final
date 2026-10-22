-- Rumbo: a shared bank of AI-written practice questions that a second AI solve has already checked.
-- Every verified question the study path or mock quiz makes is saved here, so the next student gets it
-- instantly and the bank keeps growing. Only the server (service role) reads and writes it.
-- Paste into Supabase > SQL Editor > New query > Run. Safe to run twice.

create table if not exists public.question_bank (
  id          text primary key,
  exam        text not null,
  section     text not null,
  skill       text not null,
  topic       text,
  lang        text not null default 'en',
  data        jsonb not null,
  created_at  timestamptz not null default now()
);
create index if not exists question_bank_lookup on public.question_bank (exam, section, skill, topic, lang);
alter table public.question_bank enable row level security;
-- No policies on purpose: the browser cannot read or write this table, only the server can.
