# Emoji Drops — 11/10 quality benchmark

This document is the technical/product benchmark for the project. It intentionally separates **engine quality** from the later visual redesign phase.

## Current benchmark

### Runtime / reliability
- [x] One authoritative runtime chain.
- [x] Dataset bridge before runtime.
- [x] Runtime hardening before core.
- [x] Event-driven runtime guards; no continuous guard polling.
- [x] UI MutationObserver work coalesced through `requestAnimationFrame` and filtered to relevant mutations.
- [x] Legacy 15s balance-only polling suppressed during core boot.
- [ ] Full transaction engine migrated into the current V3 state model with atomic rollback for every mutation.

### Economy
- [x] 8 cases / 8 case prices validated.
- [x] All five rarities validated.
- [x] Duplicate fingerprints and invalid prices checked.
- [x] Monte Carlo rarity distribution check.
- [x] Open / sell / upgrade / market invariants tested at the self-test level.
- [x] Extreme balances and `MAX_SAFE_INTEGER` boundaries covered.
- [ ] Economy simulation over long sessions with inflation/deflation targets and expected value thresholds.

### State / persistence
- [x] Corrupted JSON repair.
- [x] Duplicate inventory ID repair.
- [x] Numeric normalization.
- [x] Bonus claim rollback.
- [x] Backup/recovery diagnostics.
- [ ] Atomic journal/commit semantics for **all** core actions (open, sell, sell-all, upgrade, market buy/list, daily, reset).
- [ ] Quota/private-mode failure E2E.
- [ ] Cross-tab conflict handling.

### Browser / mobile
- [x] Browser smoke flow exists.
- [x] 390x844 mobile viewport is covered by smoke E2E.
- [x] Reduced-motion mode is exercised by the smoke configuration.
- [ ] 320/340/375/390/430 portrait matrix.
- [ ] Landscape touch matrix.
- [ ] Rapid multi-tap / interrupted modal / back-navigation E2E.
- [ ] Upgrade flow E2E and persistence assertion.

### Accessibility
- [x] Escape closes the active modal.
- [x] Reduced-motion CSS exists.
- [ ] Complete focus trap/restore for every modal.
- [ ] Visible keyboard focus contract.
- [ ] Semantic labels for icon-only controls.
- [ ] Screen-reader state announcements for result/upgrade/error feedback.
- [ ] Automated accessibility scan in CI.

### Maintainability
- [x] Current runtime loader documents the authoritative chain.
- [x] Static QA checks syntax, assets, boot order and runtime contracts.
- [x] Dead legacy runtime files have begun to be removed.
- [ ] Complete dead-code audit and final removal pass.
- [ ] Split the 31 KB monolithic core into state, economy, render, modal and event modules without changing UI.

## Case-Battle-level product benchmark

Public Case-Battle pages currently expose a much broader ecosystem than a simple case opener: large categorized case catalogs, favorites/filtering, Upgrade, Contracts, giveaways and tournaments, plus account/inventory workflows. citeturn0search1turn0search2

Emoji Drops should not copy branding or paid gambling mechanics. The benchmark is functional polish:

1. **Case catalog** — categories, search, sort, favorites, case detail and transparent odds/value information.
2. **Opening** — fast, deterministic UI state transitions, multi-open, cancel/skip rules, result history and zero duplicate transactions.
3. **Inventory** — filtering, sorting, bulk actions, item details, collection progress and history.
4. **Upgrade** — mathematically correct chance, clear target constraints, atomic transaction, failure recovery and replay-safe state.
5. **Contracts** — combine multiple items into one outcome with explicit rules and atomic rollback.
6. **Market** — listing, buy, cancel, pricing validation, ownership checks and transaction history.
7. **Rewards** — daily streak, bonus limits, anti-abuse rules and auditable reward history.
8. **Profile** — stats, history, collection, settings and account-safe reset/export.
9. **Live activity** — performant feed that does not require polling the whole DOM.
10. **Trust** — clear local-only/virtual economy boundaries, diagnostics, no hidden balance mutations and recoverable state.
11. **QA** — browser E2E, corruption recovery, failure injection, mobile matrix, accessibility and performance budgets.

## Definition of 11/10

The project is 11/10 only when every item above is either implemented and automatically tested, or deliberately excluded from scope with a documented reason. Visual redesign is a separate phase and must not be mixed into the engineering hardening pass.
