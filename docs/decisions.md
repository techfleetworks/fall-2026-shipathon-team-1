# Decisions log

A running record of every decision made during the build, in order. Each entry has a date, what was decided, and why. The team can read this top to bottom to understand how the app got to where it is.

For the big architecture decision (stack + detection approach), see [ADR 0001](adr/0001-poc-stack-and-detection.md).

---

### 2026-11-15 — Stack: HTML + Tailwind + Supabase + Vercel
**Decided:** Static HTML and vanilla JS with Tailwind CSS, Supabase for database and storage, Vercel for hosting. No framework.
**Why:** The dev recommended this stack. For a 10–20 person PoC with one flow, a framework adds build complexity without helping. Tailwind carries the design tokens so the UI matches the design system.

### 2026-11-15 — Real AI detection, not faked
**Decided:** The photo detection uses a real vision model, not canned results.
**Why:** Faked detection wouldn't test real effort. If the model misses a category, the participant has to add it by hand — that effort is part of what we're measuring. Detection quality is part of the hypothesis.

### 2026-11-15 — Participant codes, no accounts
**Decided:** Participants enter a code (P01, P02, …) instead of creating an account.
**Why:** The PoC runs with known participants. Building auth would take days and add nothing to the test. The code gates the detection endpoint so only participants can use it.

### 2026-11-15 — Insert-only database access from the browser
**Decided:** The public Supabase key can only insert rows, never read or update. Results are read from the Supabase dashboard.
**Why:** Participants don't need to see each other's data. Insert-only RLS means a leaked key can't expose anyone's listings or photos.

### 2026-11-15 — Categories are a fixed list, not free-text
**Decided:** The app uses 8 categories: Clothes, Shoes, Toys, Books, Baby gear, Towels & bedding, Winter clothes, Accessories.
**Why:** A fixed list lets the model return structured results and keeps the UI simple (chips, not a text field). Participants can still add or remove categories from the list.

### 2026-11-15 — Condition options: New, Used like new, Used
**Decided:** Three condition choices instead of the Figma's four (which had "Used like old").
**Why:** "Used like old" read like a placeholder. Three options cover the range without an awkward label. Waiting on confirmation from the team.

### 2026-11-15 — Timing is the product metric
**Decided:** Every step logs a timestamped event to Supabase. A `session_timings` view computes total seconds and listing count per participant.
**Why:** The hypothesis is about effort and time. We need per-step timing to see where time is spent, not just a total. The 1–7 ease rating captures perceived effort separately.

### 2026-11-16 — 20 participants, not 10
**Decided:** Extend the test to 20 participants.
**Why:** More photos test detection quality. 20 gives a wider range of real-world images and slightly stronger directional data, though still not statistically significant.

### 2026-11-16 — SmolVLM tested, yes/no approach works for small models
**Decided:** Tested HuggingFaceTB/SmolVLM-Instruct on 20 real photos in Google Colab. The model found categories in every photo. The key insight: asking one yes/no question per category works far better than asking a small model for structured JSON.
**Why:** Needed to know if an open model could handle detection. It can, but it needs a GPU (can't run on Vercel). Kept as evidence that a free option exists for production.
**Evidence:** Results in [Google Drive](https://drive.google.com/drive/folders/1v9tJts6ldNrK_4FxPniJSCxalUBwjuyd).

### 2026-11-16 — Towels & bedding is a real category
**Decided:** Towels detected by SmolVLM were correct — the ground truth was missing them, not the model.
**Why:** Initially thought the model was hallucinating towels. On review, the photos did contain towels. This is a true positive.

### 2026-11-16 — Switch detection from Claude to Gemini Flash (free tier)
**Decided:** Replace Claude (Anthropic API, paid) with Google Gemini Flash (free tier) in `api/detect.js`. Model: `gemini-3.5-flash-lite` (the `gemini-2.0-flash` model was deprecated; `gemini-3.8-flash` and other full-size Flash models are available but intermittently return 503 under high demand; `gemini-3.5-flash-lite` is stable and handles vision + structured JSON).
**Why:** The team can't spend money on API calls for testing. Gemini Flash free tier is more than enough for 20 participants with a few photos each. It handles images and structured JSON output natively, so the same response format works. The Anthropic SDK is removed; replaced with `@google/generative-ai`. The AQ.-format key doesn't work with the Generative Language API; using an older AIza-format key instead.

### 2026-11-16 — State resets when going back to start
**Decided:** Pressing Cancel or the back arrow clears all photos, categories, details, and other flow state.
**Why:** Photos and detected categories were persisting when a participant went back to the start screen and began again, contaminating the second attempt.

### 2026-11-16 — Remove photo on the detection screen
**Decided:** Each photo in the strip has an X button to remove it. If all photos are removed, the app returns to the instructions screen.
**Why:** Participants need a way to remove a bad photo without restarting the entire flow.

### 2026-11-16 — Instructions screen shows examples and illustration placeholders
**Decided:** The instructions screen now says "One photo, multiple listings", has a dashed placeholder for an example illustration, shows example category chips (Clothes, Shoes, Toys = 3 listings), and uses clearer step descriptions.
**Why:** Participants need to understand what to expect before they take a photo. Priming with examples reduces confusion.

### 2026-11-16 — "Lay items flat" is a tip banner, not a step
**Decided:** Moved the "Lay items flat" instruction out of the photo sheet and into a standalone tip banner on the instructions screen, with a "Tip" label badge.
**Why:** This guidance should be visible before the participant opens the camera, not hidden inside the bottom sheet.

### 2026-11-16 — Photo sheet: "From gallery", X close, no Cancel button
**Decided:** Renamed "Add from photos" to "From gallery" (two words, fits the button). Replaced the Cancel text button with an X icon in the top-right corner. Removed the separate Cancel row.
**Why:** "Add from photos" was too long for the button width. An X icon is a standard close pattern and saves vertical space.

### 2026-11-16 — Tip banner moved into photo sheet
**Decided:** The "Lay items flat" tip banner now appears inside the photo bottom sheet, below the camera/gallery buttons, instead of on the instructions screen.
**Why:** The tip is most useful right before the participant takes a photo. Placing it inside the sheet means they see it at the moment of action, not on a screen they scroll past.

### 2026-11-16 — Category/details section is a pull-up sheet
**Decided:** The category and details tabs sit inside a white pull-up sheet with rounded top corners and a handle bar, below the photos. This matches the Figma design.
**Why:** The sheet visual separates the editable content from the photos and gives the screen the bottom-sheet feel from the design system.

### 2026-11-16 — Add Category is inline in the sheet, not a full-screen overlay
**Decided:** "Add new" replaces the category list content inside the same pull-up sheet (back arrow + "Add new item category" heading, search field, available pills). The footer changes to "Back" and "Confirm & Add". Only unselected categories are shown.
**Why:** Matches the Figma design. Keeping the add flow in the same sheet preserves context (photos and tabs visible). Searching for an already-added category shows "That category is already added."

### 2026-11-16 — Removing a photo also removes its detected categories
**Decided:** When a participant removes a photo, the categories that were detected from that photo are also removed (along with any details filled in for them). Manually added categories are not affected.
**Why:** Detected categories are tied to the photo. Keeping orphaned categories after removing their source photo is confusing and contaminates the data.
