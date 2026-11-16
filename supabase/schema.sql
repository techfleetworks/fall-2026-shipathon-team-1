-- Run once in the Supabase SQL editor.
-- Anonymous visitors may INSERT only (no read-back), so the public anon key cannot leak data.
-- Read results in the Supabase dashboard / SQL editor (runs as an admin role).

create table if not exists events (
  id bigint generated always as identity primary key,
  session_id uuid not null,
  participant_code text not null check (char_length(participant_code) <= 32),
  type text not null check (char_length(type) <= 64),
  props jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists listings (
  id uuid primary key,
  session_id uuid not null,
  participant_code text not null check (char_length(participant_code) <= 32),
  category text not null check (char_length(category) <= 64),
  condition text check (char_length(condition) <= 64),
  size text check (char_length(size) <= 64),
  gender text check (char_length(gender) <= 16),
  notes text check (char_length(notes) <= 500),
  pickup_location text check (char_length(pickup_location) <= 200),
  photo_paths text[] not null default '{}',
  created_at timestamptz not null default now()
);

create table if not exists feedback (
  id bigint generated always as identity primary key,
  session_id uuid not null,
  participant_code text not null check (char_length(participant_code) <= 32),
  ease smallint not null check (ease between 1 and 7),
  comment text check (char_length(comment) <= 1000),
  created_at timestamptz not null default now()
);

alter table events enable row level security;
alter table listings enable row level security;
alter table feedback enable row level security;

create policy "anon insert events" on events for insert to anon with check (true);
create policy "anon insert listings" on listings for insert to anon with check (true);
create policy "anon insert feedback" on feedback for insert to anon with check (true);

-- Photos: private bucket, anon may upload only.
insert into storage.buckets (id, name, public) values ('photos', 'photos', false)
on conflict (id) do nothing;

create policy "anon upload photos" on storage.objects for insert to anon
  with check (bucket_id = 'photos' and (storage.foldername(name))[1] ~ '^[0-9a-f-]{36}$');

-- Headline metric: seconds from flow_started to posted, per session.
create or replace view session_timings as
select
  s.session_id,
  s.participant_code,
  min(s.created_at) filter (where s.type = 'flow_started') as started_at,
  min(s.created_at) filter (where s.type = 'posted') as posted_at,
  extract(epoch from (
    min(s.created_at) filter (where s.type = 'posted') -
    min(s.created_at) filter (where s.type = 'flow_started')
  )) as total_seconds,
  max((s.props->>'listing_count')::int) filter (where s.type = 'posted') as listing_count
from events s
group by s.session_id, s.participant_code;
