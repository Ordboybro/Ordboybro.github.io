# Emoji Drops — restore point

Created before the next Upgrade / case-opening / QA pass.

## Restore target
- Branch: `main`
- Commit: `4b2faf34d18131820a5fe134e06b891b239675c5`
- Message: `chore: remove obsolete javascript runtimes`

This is the baseline to return to if the next development pass introduces regressions.

## Current runtime at the restore point
- `js/functional-final.js`
- `js/runtime-hardening.js`
- `js/case-upgrade-polish.js`
- `js/app-v2.js`

## Important scope
The general site appearance is frozen. Only case-opening and Upgrade visuals are allowed to change during the next pass.

## Platform note
GitHub Pages is static HTML/CSS/JavaScript hosting; it does not provide a server-side application backend. Real secure authentication/economy would require a backend.
