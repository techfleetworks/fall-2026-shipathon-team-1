<div align="center">

# 🏘️ MyVillage

### A community exchange for reusable children's items

Pass on outgrown clothes, shoes, and toys — without the listing hassle or the "is this still available?" guessing game.

![Status](https://img.shields.io/badge/status-in%20development-yellow?style=for-the-badge)
![Type](https://img.shields.io/badge/type-two--sided%20marketplace-blue?style=for-the-badge)
![Focus](https://img.shields.io/badge/focus-sustainability-2ea44f?style=for-the-badge)

**Built for the Techfleet Fall 2026 Shipathon — Team 1**

</div>

---

## 📖 Overview

**MyVillage** is a mobile-first, two-sided app dedicated solely to **reusable children's items** — clothes, shoes, and toys. It connects parents and caregivers who have items to give away (**givers**) with those who need them (**receivers**).

Today, giving away a batch of outgrown items means creating tedious one-by-one listings. Receivers, meanwhile, waste time scrolling past irrelevant items, get ghosted on requests, and repeatedly ask _"is this still available?"_

MyVillage removes that friction with:

- **Fast bundle posting** — add a pile of outgrown items as one batch instead of a separate listing per item.
- **Needs-based discovery** — search and filters that surface only relevant children's items.
- **Always-visible listing status** — `requested` → `accepted` → `gone`, so no one is left guessing.

> **Who it serves:** parents and caregivers of young children — including families who have just relocated and don't yet know their local giving channels.

---

## ✨ Key Features

The product is scoped around two user journeys — the **giver** and the **receiver** — delivered across an **MVP** (prove the core flow) and an **MMP** (make it trustworthy and repeatable).

### 🎁 Milestone 1 — Giver: Bundle Posting

- **Bundle listing in one flow:** a giver uploads one or a few photos and publishes multiple listings together, instead of creating a separate listing per item.
- **Quick per-item fields with bundle-level defaults:** category, size, and condition are set fast, with shared defaults applied across the bundle to cut repetitive entry.
- **Children-only scope:** every listing belongs to a children's-item category, so the catalogue stays relevant.

### 🔎 Milestone 2 — Receiver & Shared Trust: Discovery and Live Status

- **Needs-based discovery:** search and filters by category, size, and location — so receivers stop scrolling past things they don't need.
- **Trusted live status:** a clear, prominent `requested / accepted / gone` indicator visible to both sides, so receivers can trust availability.
- **Close the loop (anti-ghosting):** one-tap accept/decline for givers, plus auto-decline / auto-expire and a receiver notification if a giver doesn't respond within a set window — so every request ends in a clear outcome.
- **Pickup coordination:** a lightweight handoff flow once an item is accepted, with a nudge to mark items as `gone`.

> [!NOTE]
> The original PRD proposed an AI/computer-vision bundle flow (auto-detecting and categorizing items from a photo). **That AI feature is intentionally out of scope for this build.** Bundle posting uses the manual fields + bundle-level defaults flow described above.

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Framework / Front-end | ![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=next.js&logoColor=white) |
| Back-end | ![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=node.js&logoColor=white) ![Express](https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white) |
| Database / Auth | ![Supabase](https://img.shields.io/badge/Supabase-3FCF8E?style=for-the-badge&logo=supabase&logoColor=white) |
| Hosting | ![Vercel](https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white) |

---

## 🚀 Getting Started

> The codebase is in early setup. The steps below reflect the intended stack and will be finalized as the app scaffolding lands.

### Prerequisites

- [Node.js](https://nodejs.org/) (LTS)
- A [Supabase](https://supabase.com/) project (database + auth)
- npm (or pnpm / yarn)

### Setup

```bash
# 1. Clone the repo
git clone https://github.com/techfleetworks/fall-2026-shipathon-team-1.git
cd fall-2026-shipathon-team-1

# 2. Install dependencies
npm install

# 3. Configure environment
cp .env.example .env.local
# then fill in your Supabase URL and keys

# 4. Run the dev server
npm run dev
```

The app will be available at `http://localhost:3000`.

---

## 📊 Success Metrics

The release is validated against:

- **Task completion** — ~80% of usability participants publish a multi-item bundle without help or abandoning.
- **Time-to-publish** — median time from first photo to a live bundle (lower is better).
- **"Still available?" noise** — share of such messages on already-claimed/gone listings, targeting below 10%.
- **Responsiveness** — median time from request to first giver accept/decline (target under 24h); share of requests with no response after N days below 20%.
- **Retention** — share of givers who post a second bundle within 30 days (target ~20%).

---

## 🗺️ Roadmap

- [ ] **MVP** — prove the core giver → receiver exchange flow end to end.
- [ ] Bundle posting with per-item fields and bundle-level defaults.
- [ ] Needs-based discovery (category, size, location filters).
- [ ] Live listing status (`requested / accepted / gone`).
- [ ] **MMP** — anti-ghosting (auto-decline/expire), pickup coordination, notifications.
- [ ] Mobile adaptation.

### Key risks we're watching

- **Cold start** — seed one neighbourhood with a local community group before launch.
- **Switching cost** — must add clear value over existing Buy Nothing groups and church networks.
- **Status engagement** — keep the lowest-effort path to update status, with auto-decline/expire as a safety net.

---

## 👥 Team

**Techfleet Fall 2026 Shipathon — Team 1**

Contributions happen on feature branches (e.g. `branch-sope-01`) merged into `main`.

---

## 📄 License

See [LICENSE](LICENSE) for details.
