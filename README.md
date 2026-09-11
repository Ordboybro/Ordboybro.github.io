# 🎰 Emoji Drops

> A browser-based case-opening simulator with roulette, Live Drops, inventory, profile progression and item upgrades.

[![Static QA](https://github.com/Ordboybro/Ordboybro.github.io/actions/workflows/static-qa.yml/badge.svg)](https://github.com/Ordboybro/Ordboybro.github.io/actions/workflows/static-qa.yml)  
**Live demo:** https://ordboybro.github.io/

Emoji Drops is a static-first web application built with vanilla HTML, CSS and JavaScript. The project focuses on a polished game-like UI while keeping the client runtime dependency-light and heavily tested with browser smoke checks and contract tests.

> This is a simulator / portfolio project. It does not process real-money gambling or payments.

## ✨ Features

- 📦 Case opening and multi-open flows
- 🎰 Dedicated roulette animation for each case
- ⚡ Fast opening mode
- 🔴 Live Drops feed with a bounded visible stream
- 👤 Profile, inventory and Best Drop
- 📊 Statistics and account settings
- 🚀 Item upgrades with x1.5 / x2 / x3 / x5 multipliers
- 📱 Responsive desktop and mobile layouts
- 💾 Client-side state persistence
- 🛡️ Runtime guards and transaction-style state handling

## 🧱 Runtime architecture

The application is deliberately split into small browser modules rather than one monolithic script:

```text
index.html
   │
   ├── data.js                bootstrap / dataset bridge
   │
   └── js/app-v2.js           application runtime
          │
          ├── hardening        defensive state/runtime checks
          ├── core             game state and domain logic
          ├── transaction      controlled state mutations
          ├── runtime guards   action locks / safety contracts
          └── UI polish        presentation behavior
```

Supporting test code lives under `tests/`, while optional backend-related experiments are isolated under `supabase/`.

## 🧪 Quality & CI

Every push and pull request to `main` runs the static QA workflow. It checks:

- JavaScript syntax, including inline scripts
- local asset references
- deterministic runtime bootstrap order
- dataset contracts
- economy invariants
- transaction behavior
- runtime guard contracts
- UI polish contracts
- Chromium browser smoke tests

The project intentionally avoids a large frontend framework and keeps the runtime free of external CDN dependencies.

## 🛠️ Tech stack

- HTML5
- CSS3
- Vanilla JavaScript
- Canvas / browser APIs
- Local browser storage
- Playwright for browser smoke tests
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

Opening `index.html` directly may work for basic UI inspection, but an HTTP server is recommended for browser API and asset behavior.

## 📂 Project structure

```text
.
├── .github/workflows/static-qa.yml
├── index.html
├── mobile.html
├── data.js
├── js/
│   ├── data.js
│   ├── app-v2.js
│   └── runtime modules
├── css/
├── tests/
├── docs/
├── supabase/
├── logo.png
├── 404.html
└── README.md
```

## 📈 Project status

**Portfolio project — active development**

The core case-opening, inventory, economy, runtime-hardening and browser-QA systems are implemented. Future work is focused on product polish, performance and maintaining deterministic behavior as the UI evolves.

## 👨‍💻 Author

**ORDBOY**  
GitHub: https://github.com/Ordboybro
