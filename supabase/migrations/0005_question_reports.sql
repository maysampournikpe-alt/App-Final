-- Rumbo: lets students flag a bad AI-written question. After 2 different students report it, the shared bank stops serving it.
-- Run after 0004. Paste into Supabase > SQL Editor > New query > Run. Safe to run twice.

alter table public.question_bank add column if not exists reports integer not null default 0;

create or replace function public.report_question(p_id text)
returns void
language sql
security definer
set search_path = public
as $$
  update public.question_bank set reports = reports + 1 where id = p_id;
$$;
revoke all on function public.report_question(text) from public, anon, authenticated;
grant execute on function public.report_question(text) to service_role;
