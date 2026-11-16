-- ============================================================
-- My Village — Supabase schema (giver side)
-- Run in the Supabase SQL editor, or via `supabase db push`.
-- Mirrors lib/types.ts. The app runs on the in-memory mock store
-- until NEXT_PUBLIC_SUPABASE_URL / ANON_KEY are set.
-- ============================================================

create extension if not exists "pgcrypto";

-- Enums -------------------------------------------------------
do $$ begin
  create type item_category as enum ('clothing', 'shoes', 'toys');
exception when duplicate_object then null; end $$;

do $$ begin
  create type item_status as enum ('available', 'requested', 'accepted', 'gone');
exception when duplicate_object then null; end $$;

do $$ begin
  create type interest_state as enum ('waiting', 'active', 'accepted', 'declined', 'expired');
exception when duplicate_object then null; end $$;

do $$ begin
  create type message_from as enum ('giver', 'receiver', 'system');
exception when duplicate_object then null; end $$;

do $$ begin
  create type message_type as enum ('text', 'quick', 'system');
exception when duplicate_object then null; end $$;

-- Tables ------------------------------------------------------
create table if not exists givers (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  avatar     text,
  location   text,
  created_at timestamptz not null default now()
);

create table if not exists bundles (
  id         uuid primary key default gen_random_uuid(),
  giver_id   uuid not null references givers(id) on delete cascade,
  photos     text[] not null default '{}',
  status     text not null default 'published',
  created_at timestamptz not null default now()
);

create table if not exists items (
  id         uuid primary key default gen_random_uuid(),
  bundle_id  uuid not null references bundles(id) on delete cascade,
  name       text not null,
  category   item_category not null,
  size_fit   text,
  condition  text,
  flaws      text,
  photos     text[] not null default '{}',
  status     item_status not null default 'available',
  created_at timestamptz not null default now()
);

create table if not exists interests (
  id             uuid primary key default gen_random_uuid(),
  item_id        uuid not null references items(id) on delete cascade,
  receiver_name  text not null,
  receiver_avatar text,
  position       int not null,
  note           text,
  state          interest_state not null default 'waiting',
  created_at     timestamptz not null default now(),
  unique (item_id, position)
);

create table if not exists threads (
  id             uuid primary key default gen_random_uuid(),
  item_id        uuid not null references items(id) on delete cascade,
  receiver_name  text not null,
  receiver_avatar text,
  quick_replies  text[] not null default '{}',
  created_at     timestamptz not null default now()
);

create table if not exists messages (
  id         uuid primary key default gen_random_uuid(),
  thread_id  uuid not null references threads(id) on delete cascade,
  sender     message_from not null,
  body       text not null,
  type       message_type not null default 'text',
  created_at timestamptz not null default now()
);

-- Indexes -----------------------------------------------------
create index if not exists items_bundle_idx on items(bundle_id);
create index if not exists interests_item_idx on interests(item_id, position);
create index if not exists messages_thread_idx on messages(thread_id, created_at);

-- Row Level Security -----------------------------------------
-- Enable and add policies scoped to the authenticated giver before
-- going to production. Example (requires a giver <-> auth.uid mapping):
--
--   alter table bundles enable row level security;
--   create policy "givers manage own bundles" on bundles
--     for all using (giver_id = auth.uid());
--
-- Storage: create a public (or signed-URL) bucket named `item-photos`
-- for the pile/item images referenced by items.photos.
