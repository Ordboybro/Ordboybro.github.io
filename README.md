# 🎰 Emoji Drops

> A browser-based case-opening simulator with roulette, Live Drops, profile progression, inventory, market and item upgrades.

[![Static QA](https://github.com/Ordboybro/Ordboybro.github.io/actions/workflows/static-qa.yml/badge.svg)](https://github.com/Ordboybro/Ordboybro.github.io/actions/workflows/static-qa.yml)  
**Live demo:** https://ordboybro.github.io/

Emoji Drops is a static-first web application built with vanilla HTML, CSS and JavaScript. The UI follows a dark premium reference direction: Cases / Upgrade / Market are the primary navigation, Profile contains Inventory and related account sections, and case cards use large thematic emojis.

> This is a simulator / portfolio project. It does not process real-money gambling or payments.

## ✨ Features

- 📦 Eight themed cases with weighted rarity drops
- 🎰 Exact case-opening modal with roulette/reel presentation
- ⚡ Resilient opening and interaction handling
- 🔴 Live Drops feed
- 👤 Profile with Inventory and account sections
- 📊 Statistics, progression and achievements
- 🚀 Item upgrades with transaction-safe state mutation
- 🛒 Market flows and balance/inventory consistency
- 📱 Responsive portrait and landscape layouts
- 💾 Client-side state persistence
- 🛡️ Runtime hardening, accessibility, recovery and lifecycle QA

## 🧱 Runtime architecture

`js/app-v2.js` is the deterministic bootstrap/loader. The production runtime uses a deterministic bootstrap with server-authoritative Case/Upgrade/Market transactions, a single Live Drops controller with controlled Realtime/polling fallback, explicit case-open interaction, shared visual tokens, reduced-motion handling, lifecycle cleanup, responsive safe-area treatment and non-native settings feedback. Existing UX surfaces are polished in place; no new user-facing feature set is being added.

## 🧪 Quality & CI

Every push and pull request to `main` runs the static QA workflow. It checks syntax, canonical economy, transaction/recovery behavior, product flows, Chromium browser E2E, Upgrade, accessibility, performance, responsive/touch behavior, multi-tab recovery and security.

After the latest UX repair pass, a fresh full QA run is required before declaring the project fully green. A previous green run is not treated as proof for the newer commit.

## 🛠️ Tech stack

- HTML5
- CSS3
- Vanilla JavaScript
- Browser APIs / Canvas where needed
- Local browser storage
- Playwright for browser E2E
- GitHub Actions for CI

## 🚀 Run locally

Because the project is static, a simple HTTP server is enough:

```bash
git clone https://github.com/Ordboybro/Ordboybro.github.io.git
cd Ordboybro.github.io
python -m http.server 8000
```

Open `http://localhost:8000`.

## 📂 Project structure

```text
.
├── .github/workflows/static-qa.yml
├── index.html
├── mobile.html
├── data.js
├── js/
│   ├── app-v2.js
│   ├── canonical runtime modules
│   └── UX/interaction repair layer
├── assets/emoji-drops/
├── tests/
├── docs/
├── supabase/
├── logo.png
├── 404.html
└── README.md
```

## 📈 Project status

**Final hardening pass:** runtime ownership, lifecycle safety, responsive UX, accessibility, motion discipline, Supabase authority and regression contracts have been tightened. The repository contains the full production QA gate; its GitHub Actions result must still be observed from GitHub before claiming a verified green release. The production codebase has received a focused repair pass for the reported Favorites, iOS search zoom, tap flash, modal close, case-result animation, Upgrade interaction conflict and Profile UX issues. Full QA and production smoke verification must pass before this status is changed to production-ready.

## 👨‍💻 Author

**ORDBOY**  
GitHub: https://github.com/Ordboybro
<!-- CI verification probe: profile-v13 + inventory-nav -->
