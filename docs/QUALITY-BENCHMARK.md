# Emoji Drops — 11/10 quality benchmark

This document is the technical/product benchmark for the project. It intentionally separates **engine quality** from the later visual redesign phase.

## Engineering status

The hardening pass is now treated as a release gate: a checkbox is only marked complete when the behavior is implemented and covered by an automated contract/E2E check. Visual redesign is not part of this gate.

### Runtime / reliability
- [x] One authoritative runtime chain.
- [x] Dataset bridge before runtime.
- [x] Runtime hardening before core.
- [x] Event-driven runtime guards; no continuous guard polling.
- [x] UI MutationObserver work coalesced through `requestAnimationFrame` and filtered to relevant mutations.
- [x] Legacy timer risk removed without a global `setInterval` shim.
- [x] Transaction journal v4 with before/after hashes, rollback and recovery.
- [x] Transaction action coverage contract includes open, sell, sell-all, upgrade, market buy/list, daily and reset selectors.

### Economy
- [x] 8 cases / 8 case prices validated.
- [x] All five rarities validated.
- [x] Duplicate fingerprints and invalid prices checked.
- [x] Monte Carlo rarity distribution check.
- [x] Open / sell / upgrade / market invariants tested at the self-test level.
- [x] Extreme balances and `MAX_SAFE_INTEGER` boundaries covered.
- [x] Long-session balance/integrity simulation.
- [ ] Full economic tuning against a formal inflation/deflation target — intentionally deferred to the dedicated economy phase so engineering hardening does not silently rebalance gameplay.

### State / persistence
- [x] Corrupted JSON repair.
- [x] Duplicate inventory ID repair.
- [x] Numeric normalization.
- [x] Bonus claim rollback.
- [x] Backup/recovery diagnostics.
- [x] Atomic journal/commit semantics around the current mutation entry points.
- [x] Browser-level fresh-state persistence smoke.
- [x] Cross-tab storage event refresh for non-active transactions.
- [ ] Full multi-tab conflict resolution with deterministic merge semantics — deliberately deferred because the current single-device local economy has no safe merge rule for competing balance mutations.
- [ ] Quota/private-mode failure injection E2E — browser-dependent and kept as a follow-up hardening test rather than pretending ordinary persistence smoke proves it.

### Browser / mobile
- [x] Browser smoke flow.
- [x] 320/340/375/390/430 portrait matrix.
- [x] 844x390 landscape smoke.
- [x] Reduced-motion mode.
- [x] Rapid multi-tap opening path.
- [x] Modal Escape close.
- [x] Horizontal-overflow assertion.
- [x] Inventory / Market / Daily navigation smoke.
- [ ] Dedicated Upgrade success/failure persistence scenario — gameplay-specific expansion is deferred to the product QA phase.

### Accessibility
- [x] Escape closes the active modal.
- [x] Reduced-motion CSS exists.
- [x] Focus trap and focus restore for modal surfaces.
- [x] Visible keyboard focus contract.
- [x] Labels for empty/icon-only controls and form fallbacks.
- [x] Screen-reader live region for modal announcements.
- [ ] Automated WCAG/axe scan in CI — intentionally not added as a dependency-heavy gate yet; current CI uses lightweight semantic contracts.

### Maintainability
- [x] Current runtime loader documents the authoritative chain.
- [x] Static QA checks syntax, assets, boot order and runtime contracts.
- [x] Dead legacy runtime file removal has begun.
- [ ] Complete dead-code audit and final removal pass.
- [ ] Split the monolithic core into state, economy, render, modal and event modules without changing UI.

The last two items are **refactoring opportunities, not release blockers**. Splitting the currently working monolith during the final hardening pass would increase regression risk without improving the user-visible product proportionally.

## Case-Battle-level product benchmark

The benchmark is functional polish rather than copying branding or paid gambling mechanics:

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

Product features such as Contracts and a larger catalog are deliberately **not** being smuggled into the engineering gate. They belong to the next product phase.

## Definition of 11/10

The engineering gate is 11/10 when every release-critical reliability, economy-integrity, persistence, browser/mobile and accessibility item is implemented and automatically checked, while intentionally deferred product/refactor items have a documented reason. The next phase can then focus on economy, Emoji Coin semantics and UX/product expansion rather than returning to technical firefighting.
