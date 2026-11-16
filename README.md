# My Village: Giver flow (shipathon PoC)

**Hypothesis:** Parents and caregivers with outgrown children's items find existing platforms too much effort, because every item category needs its own listing. A flow where they snap **one photo** and get several listings is less effortful and faster.

**Test:** Up to 20 participants each create listings in this flow, and we compare their time and perceived effort with their usual platform.

## The flow
Start (participant code) → Photo instructions → Add photo (camera or gallery) → Detected categories (edit) → Details per category → Preview + pick-up location → Post → Ease rating (1 to 7).

Photo detection calls Google Gemini Flash (free tier) from a Vercel function (`api/detect.js`). Everything the participant does is logged to Supabase so we can compute time per step.

## Stack
Plain HTML + JS, Tailwind CSS (design-system tokens in `tailwind.config.js`), Supabase (Postgres + Storage), Vercel (static site + one serverless function).

## Run it locally
```bash
npm install
cp .env.example .env     # fill in values, see below
npm run build            # builds public/styles.css and public/config.js
npx vercel dev           # serves public/ and api/ together
```
Without Supabase values the app still runs in offline mode (events go to the browser console, nothing is saved). Without `GOOGLE_AI_API_KEY` and a matching participant code, detection fails and the app falls back to adding categories by hand.

## Set up (once)
1. **Supabase:** create a project, run `supabase/schema.sql` in the SQL editor, copy the project URL and `anon` key.
2. **Vercel:** import this GitHub repo and add these environment variables:
   - `GOOGLE_AI_API_KEY` (server only — get a free key at https://aistudio.google.com/apikey)
   - `ALLOWED_PARTICIPANT_CODES` (for example `P01,P02,...,P20`)
   - `SUPABASE_URL`, `SUPABASE_ANON_KEY`
3. Give each participant one code. Each Vercel PR gets a preview URL.

## Reading the results
In the Supabase SQL editor:
```sql
select * from session_timings order by started_at;        -- total seconds per participant
select * from feedback order by created_at;                -- 1 to 7 ease ratings
select type, props, created_at from events where session_id = '<id>' order by created_at;  -- per-step timing
```

## Working together
See `CLAUDE.md`. Short version: branch per task, PRs into `main`, never commit secrets.
