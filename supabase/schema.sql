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
