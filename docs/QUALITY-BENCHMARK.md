# Emoji Drops — 11/10 quality benchmark

Release benchmark for the current local-only fictional game scope. No real-money gambling or payment mechanics are part of the project.

## Engineering
- [x] Single authoritative runtime and dataset bridge.
- [x] Boot-order, asset and module contracts in CI.
- [x] No global timer shim; event-driven guards and coalesced UI observers.
- [x] Transaction journal v4: hashes, rollback, recovery and lease protection.
- [x] Replay-safe action lock and one-shot case-open resilience.
- [x] Final state recovery/normalization layer.
- [x] Economy invariants: 8 cases/prices, five rarities, duplicate detection, Monte Carlo sanity, open/sell/upgrade/market invariants, extreme balances and long sessions.
- [x] Corrupt JSON repair, duplicate inventory repair, numeric normalization and backup diagnostics.
- [x] Storage-event refresh and bounded local product metadata.
- [x] 320/340/375/390/430 portrait + 844x390 landscape E2E matrix.
- [x] Rapid taps, Escape, reduced motion, overflow and touch-target checks.
- [x] Inventory/Market/Daily browser smoke and persistence smoke.
- [x] Modal semantics, focus trap/restore, keyboard focus, labels and live region.
- [x] Static QA + invariant self-tests + browser E2E in CI.

## Product
- [x] Case catalog search/filter/sort.
- [x] Favorites and case details.
- [x] Opening/reel/result flow with duplicate-action protection.
- [x] Inventory tools, collection progress and selling foundations.
- [x] Upgrade runtime/invariants.
- [x] Market listing/buy/cancel foundations with ownership checks.
- [x] Daily rewards, streak and bonus limits.
- [x] Profile progression, achievements and history.
- [x] Live activity.
- [x] Local-only virtual currency boundary and recovery diagnostics.

## Deliberate scope boundaries
- [ ] Contracts mode.
- [ ] Server-backed accounts/cloud sync.
- [ ] Multiplayer, tournaments and giveaways.
- [ ] Deterministic multi-tab merge for competing balance mutations; without a server authority there is no safe generic merge rule for currency.
- [ ] Browser-specific quota/private-mode fault injection.
- [ ] Full axe/WCAG dependency scan; lightweight semantic contracts are currently used instead.
- [ ] Dedicated browser Upgrade success/failure scenario; runtime/invariant coverage exists, but this is the remaining gameplay-specific E2E enhancement.
- [ ] Monolithic-core split and final legacy-helper removal; both are refactors with regression risk and no required user-visible behavior change.

These are explicit scope/quality enhancements, not hidden defects. The release must not be called final until the active CI Browser E2E matrix is green.

## Case-Battle benchmark
The target is comparable functional polish, not copied branding or paid mechanics. Emoji Drops currently matches the useful local equivalents for catalog, favorites, opening, inventory, Upgrade, Market, rewards, profile, live activity, trust and automated QA. Contracts, social/server features and the larger commercial ecosystem remain outside the current static/local architecture.

## 11/10 definition
For this scope, 11/10 means no known release-blocking reliability, persistence, economy-integrity, mobile or accessibility defect; important current behavior is automatically checked; and scope boundaries are explicit. It does not mean every feature of a server-backed commercial platform exists.
