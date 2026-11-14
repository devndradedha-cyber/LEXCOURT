-- LexCourt feedback table. Run once in Supabase → SQL Editor.
--
-- Privacy: no IP address, user agent, name or contact details are stored.
-- Row-level security is ON with no policies, so the public "anon" key cannot
-- read or write anything. Only the server (service-role key, kept in Vercel
-- environment variables) can.

create table if not exists public.feedback (
  id             uuid primary key default gen_random_uuid(),
  created_at     timestamptz not null default now(),
  feature        text not null check (feature in ('notice_reader', 'rep_check')),
  rating         smallint not null check (rating between 1 and 5),
  comment        text check (char_length(comment) <= 1000),
  lang           text not null check (lang in ('en', 'es', 'hi', 'pa', 'ur')),
  public_consent boolean not null default false,
  status         text not null default 'private' check (status in ('private', 'pending', 'approved', 'rejected')),
  public_text    text check (char_length(public_text) <= 1000),
  flags          text[] not null default '{}',
  reviewed_at    timestamptz,
  -- A comment can only be pending or approved if the person allowed sharing.
  constraint consent_required check (status not in ('pending', 'approved') or public_consent)
);

create index if not exists feedback_status_created on public.feedback (status, created_at);

alter table public.feedback enable row level security;
-- No policies on purpose: nothing is readable or writable with the anon key.

-- ---------------------------------------------------------------------------
-- Email reminders. Only an email address, a date, one of three labels and the
-- language are stored — no name, A-Number, case number, immigration status,
-- court address or document. Rows are deleted after the date passes (daily
-- job), when the person taps "Stop these reminders", or after 48 hours if the
-- address was never confirmed.
-- ---------------------------------------------------------------------------

create table if not exists public.reminders (
  id          uuid primary key default gen_random_uuid(),
  created_at  timestamptz not null default now(),
  email       text not null check (char_length(email) between 3 and 254),
  event_date  date not null,
  label       text not null check (label in ('hearing', 'deadline', 'appointment')),
  lang        text not null check (lang in ('en', 'es', 'hi', 'pa', 'ur')),
  confirmed   boolean not null default false,
  last_stage  smallint check (last_stage in (7, 2, 1))
);

create index if not exists reminders_due on public.reminders (confirmed, event_date);
create index if not exists reminders_email on public.reminders (lower(email));

alter table public.reminders enable row level security;

-- Impact counters: numbers only, never personal data.
create table if not exists public.counters (
  name  text primary key,
  value bigint not null default 0
);
alter table public.counters enable row level security;

create or replace function public.increment_counter(counter_name text, amount integer)
returns void
language sql
as $$
  insert into public.counters (name, value) values (counter_name, amount)
  on conflict (name) do update set value = public.counters.value + excluded.value;
$$;

revoke execute on function public.increment_counter(text, integer) from public, anon, authenticated;
grant execute on function public.increment_counter(text, integer) to service_role;
