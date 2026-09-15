# Emoji Drops — restore point

Updated after the full QA / polish pass.

## Restore target
- Branch: `main`
- Commit: `42728f4485b2c14fb5d300d2e2f34813a6b6486a`
- Message: `Update QA contract for P4 cache v3`

This is the verified baseline from the completed QA pass. Return to this commit if a later development pass introduces regressions.

## Current runtime
- `js/app-v2.js` version `132`
- Functional/runtime modules load deterministically.
- `js/emoji-drops-reference-v21-studio.js` is the single visual authority.
- Superseded visual and dead runtime layers are intentionally removed rather than kept as hidden fallbacks.

## QA baseline
The baseline passed the complete 28-stage static/browser QA workflow, including economy, transactions, case opening, Upgrade, accessibility, performance, mobile/touch, recovery/multi-tab and security checks.

## Platform note
GitHub Pages is static HTML/CSS/JavaScript hosting; it does not provide a server-side application backend. Real secure authentication/economy would require a backend.
