# 🎰 Emoji Drops

> A browser-based case-opening simulator with roulette, Live Drops, profile progression, inventory, market and item upgrades.

[![Static QA](https://github.com/Ordboybro/Ordboybro.github.io/actions/workflows/static-qa.yml/badge.svg)](https://github.com/Ordboybro/Ordboybro.github.io/actions/workflows/static-qa.yml)  
**Live demo:** https://ordboybro.github.io/

Emoji Drops is a static-first web application built with vanilla HTML, CSS and JavaScript. The current UI follows a dark premium reference direction: Cases / Upgrade / Market are the primary navigation, Profile contains Inventory and related account sections, and case cards use large thematic emojis.

> This is a simulator / portfolio project. It does not process real-money gambling or payments.

## ✨ Features

- 📦 Eight themed cases with weighted rarity drops
- 🎰 Exact case-opening modal with roulette/reel presentation
- ⚡ Fast opening and resilient action handling
- 🔴 Live Drops feed
- 👤 Profile with Inventory and account sections
- 📊 Statistics, progression and achievements
- 🚀 Item upgrades with transaction-safe state mutation
- 🛒 Market flows and balance/inventory consistency
- 📱 Responsive portrait and landscape layouts
- 💾 Client-side state persistence
- 🛡️ Runtime hardening, accessibility, recovery and lifecycle QA

## 🧱 Runtime architecture

The runtime is intentionally split into focused browser modules. `js/app-v2.js` is the single bootstrap/loader and keeps the production order deterministic.

```text
index.html
   │
   ├── data.js                         dataset bootstrap
   │
   └── js/app-v2.js                    runtime loader
          │
          ├── schema / data bridge     canonical dataset exposure
          ├── hardening / guards       defensive runtime contracts
          ├── core                     state + domain rendering
          ├── transaction layer        controlled state mutations
          ├── product layers           search, filters, progression, UX
          ├── case showcase            authoritative case modal
          ├── case authority/bridge    canonical case activation
          ├── P3/P4 polish             responsive interaction/accessibility
          └── reference-v21 studio     single visual authority
```

There is deliberately no legacy visual override chain in the production loader. Superseded runtime/visual files are removed instead of being left as hidden fallback layers.

## 🧪 Quality & CI

Every push and pull request to `main` runs the static QA workflow. It checks:

- JavaScript syntax and local asset integrity
- deterministic runtime bootstrap order and cache versions
- canonical dataset and economy contracts
- transaction, recovery and storage-fault behavior
- product, accessibility, security and hardening contracts
- Chromium browser E2E flows
- Upgrade E2E
- responsive/touch behavior across portrait and landscape viewports
- performance budgets, DOM lifecycle stability, resource growth and observer lifecycle
- multi-tab/recovery behavior

Performance failures are treated as real failures; lifecycle checks are not made green by simply raising leak thresholds.

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

Open:

```text
http://localhost:8000
```

Opening `index.html` directly may work for basic inspection, but an HTTP server is recommended for browser API and asset behavior.

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
│   └── case/reference modules
├── assets/emoji-drops/
├── tests/
├── docs/
├── supabase/
├── logo.png
├── 404.html
└── README.md
```

## 📈 Project status

**Portfolio project — active development**

The case-opening, economy, inventory, profile, Upgrade, Market, runtime-hardening and browser-QA systems are implemented. Current work is focused on maintaining the reference-driven product UI, deterministic state transitions and regression-free production behavior.

## 👨‍💻 Author

**ORDBOY**  
GitHub: https://github.com/Ordboybro
