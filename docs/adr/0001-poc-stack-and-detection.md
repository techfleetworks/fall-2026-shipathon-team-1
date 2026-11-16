# 0001: PoC stack and photo detection approach

Status: accepted (2026-11-15)

## Context
A 3-person team has a short shipathon window to test one hypothesis with about 10 users: a one-photo, many-listings flow is less effortful than listing item by item. The dev proposed HTML, Tailwind, Supabase and Vercel. The core of the flow is detecting item categories from a photo.

## Decision
- Static HTML and vanilla JS with Tailwind (design tokens in config), Supabase for data, Vercel for hosting. No framework, so there is no build complexity beyond the Tailwind CLI.
- Real AI detection through one Vercel serverless function (`api/detect.js`) that calls Google Gemini 2.0 Flash with the image and a JSON response schema (fixed category list). The API key stays server-side. We chose Gemini Flash free tier (15 RPM, 1500 req/day) because the team cannot spend money on API calls for testing. An earlier version used Claude; switched on 2026-11-16. SmolVLM (open model) was also tested on 20 photos in Colab and worked, but needs a GPU so can't run on Vercel.
- Participants are identified by a code, not accounts. The function accepts only codes in `ALLOWED_PARTICIPANT_CODES`.
- The anon Supabase key is insert-only (RLS), so the public key cannot read data. Results are read from the Supabase dashboard.

## Consequences
- Detection quality is part of what is being tested. Users can always remove or add categories, so a miss costs effort rather than blocking the flow.
- No rate limit on `/api/detect` beyond the code allowlist. Acceptable for 10 known participants; revisit before any wider release.
- Adding a framework later is possible but not needed for this PoC.

## Alternatives considered
- Faked detection (manual or canned): faster to build, but would not test real effort.
- Claude (Anthropic API): strong structured output, but costs money per call. Ruled out because the team has no API budget.
- SmolVLM (open model, self-hosted): tested on 20 photos in Colab, works with a yes/no-per-category approach. Needs a GPU endpoint, which adds infra the PoC doesn't need. Results saved in [Google Drive](https://drive.google.com/drive/folders/1v9tJts6ldNrK_4FxPniJSCxalUBwjuyd).
- Next.js or similar: more structure than a 20-user PoC needs.
