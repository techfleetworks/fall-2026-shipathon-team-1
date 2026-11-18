-- ============================================================
-- My Village — seed data (matches lib/data/seed.ts)
-- Run after schema.sql. Photos use placeholder URLs; swap for
-- real Supabase Storage URLs once images are uploaded.
--
-- This SQL seeds the giver (Amara) side. The RUNTIME source of
-- truth for the demo — including the community catalogue the
-- receiver browses and the current receiver persona (Noa) — is
-- lib/data/seed.ts, which the in-memory store loads directly.
-- ============================================================

insert into givers (id, name, location)
values ('00000000-0000-0000-0000-000000000001', 'Amara', 'Rosewood, 1.2 km away')
on conflict (id) do nothing;

insert into receivers (id, name, location)
values ('00000000-0000-0000-0000-00000000000f', 'Noa', 'Elm Park')
on conflict (id) do nothing;

-- Bundle 1 (posted ~1 hr ago) --------------------------------
insert into bundles (id, giver_id, status, pickup_address, created_at)
values (
  '00000000-0000-0000-0000-0000000000a1',
  '00000000-0000-0000-0000-000000000001',
  'published',
  '14 Rosewood Lane',
  now() - interval '1 hour'
) on conflict (id) do nothing;

insert into items (id, bundle_id, name, category, size_fit, gender, condition, flaws, status)
values
  ('00000000-0000-0000-0000-0000000000b1', '00000000-0000-0000-0000-0000000000a1',
   'Toddler winter coat', 'clothing', '2-3 yr old', 'boy', 'Used like new', '', 'requested'),
  ('00000000-0000-0000-0000-0000000000b2', '00000000-0000-0000-0000-0000000000a1',
   'Canvas sneakers', 'shoes', 'Kids US 8', 'neutral', 'Gently used', 'Slightly torn sole around the edge', 'available'),
  ('00000000-0000-0000-0000-0000000000b3', '00000000-0000-0000-0000-0000000000a1',
   'Wooden puzzle set', 'toys', '3+ yrs', 'neutral', 'Like new', '', 'requested')
on conflict (id) do nothing;

-- Ordered interest queue for the winter coat (Ben #1, Alex #2, Trinity #3)
insert into interests (item_id, receiver_name, position, note, state, created_at)
values
  ('00000000-0000-0000-0000-0000000000b1', 'Ben', 1,
   'This would be perfect for my son this winter — thank you!', 'active', now() - interval '44 minutes'),
  ('00000000-0000-0000-0000-0000000000b1', 'Alex', 2,
   'We just moved here and could really use this.', 'waiting', now() - interval '30 minutes'),
  ('00000000-0000-0000-0000-0000000000b1', 'Trinity', 3,
   'Is pickup flexible on weekends?', 'waiting', now() - interval '12 minutes'),
  ('00000000-0000-0000-0000-0000000000b3', 'Maya', 1,
   'My daughter loves puzzles, this looks lovely.', 'active', now() - interval '20 minutes'),
  ('00000000-0000-0000-0000-0000000000b3', 'Sam', 2, '', 'waiting', now() - interval '8 minutes');

-- Bundle 2 (posted ~2 days ago) ------------------------------
insert into bundles (id, giver_id, status, pickup_address, created_at)
values (
  '00000000-0000-0000-0000-0000000000a2',
  '00000000-0000-0000-0000-000000000001',
  'published',
  '14 Rosewood Lane',
  now() - interval '2 days'
) on conflict (id) do nothing;

insert into items (id, bundle_id, name, category, size_fit, gender, condition, flaws, status)
values
  ('00000000-0000-0000-0000-0000000000b4', '00000000-0000-0000-0000-0000000000a2',
   'Striped cotton onesies (set of 3)', 'clothing', '0-3 months', 'neutral', 'Used like new', '', 'accepted'),
  ('00000000-0000-0000-0000-0000000000b5', '00000000-0000-0000-0000-0000000000a2',
   'Soft activity play gym', 'toys', '0-12 months', 'neutral', 'Good', 'One hanging toy attachment missing', 'gone')
on conflict (id) do nothing;

insert into interests (item_id, receiver_name, position, note, state, created_at)
values
  ('00000000-0000-0000-0000-0000000000b4', 'Priya', 1,
   'Expecting in March — these are adorable, thank you!', 'accepted', now() - interval '2 days'),
  ('00000000-0000-0000-0000-0000000000b5', 'Jordan', 1, '', 'accepted', now() - interval '2 days');

-- Chat thread for the accepted onesies --------------------------
insert into threads (id, item_id, receiver_name, quick_replies)
values (
  '00000000-0000-0000-0000-0000000000c1',
  '00000000-0000-0000-0000-0000000000b4',
  'Priya',
  array['Say hi', 'Share pickup address', 'Ask for pickup availability', 'something else']
) on conflict (id) do nothing;

insert into messages (thread_id, sender, body, type, created_at)
values
  ('00000000-0000-0000-0000-0000000000c1', 'system',
   'You accepted Priya''s request. Say hi and sort out pickup.', 'system', now() - interval '2 days'),
  ('00000000-0000-0000-0000-0000000000c1', 'receiver',
   'Hi! Thank you so much for accepting. When would be a good time to pick these up?', 'text', now() - interval '2 days');
