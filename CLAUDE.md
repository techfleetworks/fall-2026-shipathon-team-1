# My Village: Giver flow PoC

Shipathon proof of concept. Goal: let up to 20 users create multiple listings from one photo, and measure effort and time. Keep scope to the Giver flow. Do not add features outside it.

## Stack and layout
- `public/`: static site. `index.html`, `app.js` (all UI logic, vanilla JS, one render function per step). `styles.css` and `config.js` are generated, never edit or commit them.
- `src/input.css` + `tailwind.config.js`: Tailwind. Colors, type, radii and shadows mirror the My Village design system. Use the token classes (`bg-brand`, `text-ink-muted`, `rounded-lg`, `.btn-primary`, `.chip`), not raw hex values.
- `api/detect.js`: Vercel function, calls Google Gemini 2.0 Flash (free tier, structured JSON output) to list categories in a photo.
- `supabase/schema.sql`: tables, RLS, storage policy, `session_timings` view.
- Build: `npm run build`. Dev: `npx vercel dev`.

## Design source
- Figma file `wX75a3VccCdUdeQY8NBkte`, section "Nov 13-15 - Iteration V2", band "Giver - Creating a listing".
- Copy follows the design system voice: sentence case, warm, "Give away" not "Donate", no emoji.

## Rules
- Secrets (`GOOGLE_AI_API_KEY`) live only in Vercel env vars or a local `.env`. Never in `public/` or git.
- The browser only gets the Supabase `anon` key. Every table has RLS with insert-only policies for `anon`.
- Escape all user text before putting it in HTML (`esc()` in `app.js`).
- Log a tracking event (`track(...)`) for any new step or decision point, because timing is the product metric.
- Keep UI accessible: real buttons and labels, 44px touch targets, visible focus, announce loading and errors.
- One branch per task, PR into `main`, one reviewer. Don't force-push shared branches.

## Known gaps (PoC)
- No user accounts: participants use a code. `/api/detect` is gated by `ALLOWED_PARTICIPANT_CODES` but has no rate limit.
- SmolVLM was tested on 20 real photos (results in Google Drive). Gemini Flash is untested on real photos until `GOOGLE_AI_API_KEY` is set.
- No automated tests yet. Smoke test by hand: code, photo, edit categories, details, preview, post, rate.
