# 🎰 Emoji Drops

> A polished browser-based case-opening simulator with Cases, Upgrade, Market, Live Drops, Profile and Inventory.

[![Static QA](https://github.com/Ordboybro/Ordboybro.github.io/actions/workflows/static-qa.yml/badge.svg)](https://github.com/Ordboybro/Ordboybro.github.io/actions/workflows/static-qa.yml)
[![GitHub Pages](https://img.shields.io/badge/demo-GitHub%20Pages-111111?logo=github)](https://ordboybro.github.io/)

**Live demo:** https://ordboybro.github.io/

## 🎯 About the project

Emoji Drops is a portfolio web application built from scratch with vanilla HTML, CSS and JavaScript. It recreates the feel of a modern case-opening interface while keeping the project in a controlled, static-first architecture.

The product focuses on a few existing surfaces and makes them feel coherent and production-ready:

- 📦 themed Cases with weighted rarity drops and a reel-style opening flow
- ⚡ Upgrade with an authoritative transaction result and separate visual animation
- 🛒 Market with server-backed listing and purchase flows
- 🔴 Live Drops with Realtime/polling fallback
- 👤 Profile, Inventory, statistics and progression
- 📱 responsive mobile and landscape layouts
- ♿ keyboard/focus support and reduced-motion handling
- 🛡️ recovery, lifecycle, economy and security regression coverage

> **Portfolio project:** Emoji Drops is a simulator. It does not process real-money gambling or payments.

## ▶️ Demo & visual QA

**[Open the live demo](https://ordboybro.github.io/)**

The repository also has a dedicated [showcase page](docs/SHOWCASE.md) with the live demo and the latest CI-generated visual QA evidence.

The visual QA workflow captures browser screenshots for the exact commit being tested. This keeps the repository from accumulating stale screenshots while still preserving reproducible release evidence in GitHub Actions.

## 🧱 Runtime architecture

The application uses a deterministic bootstrap in `js/app-v2.js`. Runtime modules are loaded in a controlled order and the QA suite verifies the expected ownership contracts.

The current runtime includes:

- server-authoritative Case / Upgrade / Market transactions
- controlled Live Drops Realtime with polling fallback
- explicit case-open interaction ownership
- shared visual tokens and interaction states
- reduced-motion support
- responsive safe-area and touch handling
- lifecycle cleanup and recovery guards
- accessibility and security regression checks

Existing UX surfaces are refined in place; the project is not expanding its feature set with extra user-facing buttons.

## 🧪 Quality gate

Every push and pull request to `main` runs the full static QA workflow.

The release gate covers:

- JavaScript syntax and asset/bootstrap integrity
- canonical economy and transaction contracts
- case opening and Upgrade browser E2E
- accessibility
- performance and lifecycle budgets
- responsive/mobile/touch behavior
- recovery and multi-tab behavior
- Supabase anonymous security checks
- architecture and visual-regression smoke tests
- production smoke
- final release gate

A release is considered verified only when the workflow for the exact current `main` commit finishes successfully.

## 🛠️ Tech stack

- **HTML5 / CSS3**
- **Vanilla JavaScript**
- **Supabase** for authenticated/server-side data and economy operations
- **Browser APIs / Canvas** where needed
- **Local browser storage** for resilient client state
- **Playwright + axe-core** for browser and accessibility QA
- **GitHub Actions** for CI
- **GitHub Pages** for deployment

## 🚀 Run locally

The frontend is static, so a simple HTTP server is enough:

```bash
git clone https://github.com/Ordboybro/Ordboybro.github.io.git
cd Ordboybro.github.io
python -m http.server 8000
```

Then open:

```
http://localhost:8000
```

## 📂 Repository structure

```text
.
├── .github/workflows/      # CI / release QA
├── assets/emoji-drops/     # project artwork/data assets
├── docs/                   # setup, QA, schema and showcase documentation
├── js/                     # runtime modules and UI owners
├── supabase/               # database/functions source
├── tests/                  # static, browser and security QA
├── index.html              # application entry point
├── 404.html                # GitHub Pages fallback
├── data.js                 # shared data entry point
├── SECURITY.md             # security reporting policy
├── logo.png                # project branding
└── README.md
```

## 🔐 Security

Security-sensitive issues should be reported privately. See [SECURITY.md](SECURITY.md).

Do not commit credentials, service-role keys or other secrets. Supabase server-side credentials must stay out of the client bundle.

## 👨‍💻 Author

**ORDBOY**

[GitHub profile](https://github.com/Ordboybro)
