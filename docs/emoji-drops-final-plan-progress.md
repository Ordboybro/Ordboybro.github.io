# Emoji Drops — final plan progress

Updated: 2026-09-24 — second-half hardening pass
Branch: `final/emoji-drops-11-10-implementation-2026-09-23`
PR: #35

## Scope of this pass

This file is the persistent checkpoint for the user's request to finish **the remaining final-plan blocks** before doing the second half. No new user-facing features, pages, currencies, or buttons were introduced.

### Half 1 — completed / audited

1. **Architecture / ownership**
   - Runtime ownership is declared in `js/app-v2.js`.
   - Navigation is owned by `js/emoji-drops-navigation-final.js`.
   - Exact case modal/reveal is owned by `js/emoji-drops-case-showcase-exact.js`.
   - Transactions, Upgrade, Market, Live Drops, Inventory and Favorites have explicit contracts in the runtime bootstrap.
   - Fixed a real mobile navigation race: a synthetic/non-touch click arriving shortly after a touch could activate a different navigation target. Navigation v11 now rejects stale cross-target clicks during the active touch window and publishes a single `emoji-drops-view-committed` event for downstream feature owners.

2. **Design system**
   - Canonical `--ed-*` tokens exist in the runtime bootstrap: surfaces, border, text, muted, accent, rarity, radii, shadows, motion durations and easing.
   - Repaired a token self-reference introduced during cleanup and added explicit micro/card/modal/reveal/climax/upgrade timing tokens; canonical visual layers now consume shared timing/easing variables.

3. **Main / Cases hierarchy**
   - Existing main surface is intentionally centered on Cases first, with Live Drops below.
   - Case cards expose art, name, item count and price without adding extra controls.
   - Mobile/landscape sizing and touch-target rules are already part of the current UI contract.

4. **Case screen**
   - Exact case modal exposes title, price, rarity odds, reel, Open action and complete item grid.
   - The modal has explicit focus/keyboard ownership and a close guard for stale close callbacks.

5. **Case animation**
   - Transaction/result truth is resolved before presentation.
   - Reel presentation uses transform/opacity-friendly animation with acceleration, high-speed travel, deceleration and precision stop; reduced-motion bypass is supported.

6. **Result screen**
   - Result state is rendered from the authoritative item returned by the transaction path.
   - Result communicates YOU GOT, item, rarity, value and Added to Inventory before the next action.
   - Rarity drives the visual tier rather than using one identical climax for every result.

7. **Economy audit**
   - Added `tests/emoji-drops-economy-audit.js`.
   - It calculates EV from the canonical rarity weights (55/27/12/5/1) and mean item value within each rarity, then fails on canonical-data drift.
   - It intentionally does **not** change prices.
   - Current audit snapshot: Smile 16.29/100, Moves 12.99/80, Nature 13.43/60, Food 11.13/40, Animals 16.76/20, Transport 14.52/20, Sport 19.25/250, Games 29.25/500. These are audit values, not recommendations to change the economy.

8. **Market**
   - The current CI workflow contains Market privacy, race/concurrency and production-migration gates. Added deterministic buy/buy, buy/cancel, double-click, retry-after-timeout and refresh-during-mutation state-machine coverage; real two-user DB contention still requires authenticated staging credentials.

## Second half — implemented / verified in this pass

9. **Security + Supabase production pass**
   - Schema audit enforces RLS, canonical RPC identities, `SECURITY DEFINER SET search_path=''`, ownership checks and locked Market mutations.
   - Fixed two production-schema defects discovered during this pass: malformed PostgreSQL dollar-quoting and stale grants to retired RPC overloads.
   - Anonymous live matrix verifies direct economy-table denial, mutation RPC denial, constrained Market snapshot and narrow Live Drops payload.
   - Current Supabase guidance was rechecked: private Realtime channels/RLS are recommended for protected topics; public Live Drops remains intentionally limited to non-private fields.

10. **Performance**
   - 100 normalized modal/navigation lifecycle cycles are covered by the performance budget E2E.
   - Observer/listener/timeout/interval/audio/DOM/resource budgets are checked before and after the cycle.

11. **Mobile + Safari**
   - Mobile matrix now exactly covers 320x568, 360x800, 375x812, 390x844, 412x915, 430x932, 844x390 and 915x412.
   - WebKit 390x844 runs the physical touch case → modal → close flow.
   - Case-open controls use a 50px mobile height to preserve a >=48px physical hit target after fractional layout rounding/transforms.
   - Profile item actions were normalized to 48px touch targets.

12. **Accessibility**
   - Existing axe/keyboard/focus-trap/Escape/focus-restore/reduced-motion gate is retained.
   - Added automated 320px / 200% zoom and forced-colors + reduced-motion coverage.
   - WCAG 2.2 target-size/focus/reduced-motion guidance was cross-checked against the implementation.

13. **Favorites**
   - `emojiDropsFavoritesV2` remains the single storage owner with FLIP reorder animation and storage-event synchronization.

14. **Profile**
   - Profile dashboard uses server `profile_snapshot` synchronization and the final UX layer; no local-only balance is treated as authoritative.

15. **Live Drops**
   - Real Supabase rows only, narrow payload, Realtime INSERT lifecycle, fallback polling, reconnect/auth/visibility/pagehide/pageshow cleanup and observer teardown.

16. **Market**
   - Real listings only, explicit owner state, sell/buy/cancel lifecycle, server-side atomicity and race contracts; duplicate active item listings are blocked by the database constraint.

17. **Release QA**
   - Browser E2E, Upgrade E2E, accessibility, performance, mobile, recovery, anonymous Supabase security, architecture, visual regression and production smoke are already covered by the required workflow.
   - Added fairness-contract, canonical static-audit and exact 200%/forced-colors accessibility gates.
   - GitHub is currently creating `static-qa` runs with `conclusion=failure` and `jobs=[]` on this branch, so there is still no valid full-run result for the current head. Do not merge until a valid full run is green.

## Release status

The implementation work from the supplied final plan has been applied in code, schema, migrations and QA contracts. **The release gate is still open: GitHub is failing the workflow before a job is created (`jobs=[]`), so the current head has not been fully executed.** Do not merge until a valid full run is green.

### Final hardening findings from the second-half review

18. Fairness receipt correctness
   - Fixed the canonical fairness migration receipt bug: the open RPC now returns fair_round.id instead of the nonexistent round.id.
   - The fairness contract now checks the canonical fair_round variable, rejects any pre-result server_seed leak from the commitment RPC, and requires the post-result seed/commitment receipt.
   - The client continues to verify the SHA-256 commitment and exact catalog index before the reel.

19. Navigation guard precision
   - Tightened the synthetic-touch click guard from 8 seconds to 900ms. It still blocks stale cross-target synthetic clicks without suppressing a later intentional tap.
   - Navigation remains owned by pointerdown + click; pointerup is not a navigation trigger.

20. Authenticated/local state boundary
   - Added a release gate for anonymous local state versus authenticated server state.
   - Login resets local state before profile_snapshot; logout/refresh failure restores the isolated demo state instead of merging stale authenticated inventory.
   - Supabase client naming remains on the publishable-key model.

21. External market/security review
   - Current Supabase documentation recommends Broadcast over Postgres Changes for scalability/security, while distinguishing public and private channel authorization. Emoji Drops keeps Live Drops intentionally public and payload-minimized, with REST fallback and lifecycle cleanup rather than adding a new user-facing surface or an unnecessary transport migration.
   - Current competitor patterns emphasize visible odds, live activity, upgrade/market loops and verifiable fairness. Emoji Drops keeps those elements while avoiding artificial urgency/FOMO.
   - Current EU/FTC consumer-protection guidance reinforces clear price/odds information and avoiding manipulative purchase design, especially where minors can encounter paid randomized content.

22. Release blocker
   - GitHub's workflow-run connector currently returns no run objects for the latest PR head, so the full current-head CI result cannot yet be independently confirmed from this interface. The branch remains unmerged by design.

23. Concurrency hardening found during second-half deep review
   - Fairness commit and case-open previously acquired the shared profile/fairness-row locks in opposite orders, creating a real deadlock path under concurrent commit/open/retry activity.
   - Canonical schema + production fairness migration now use the same fairness-round -> profile lock order as open_case_server.
   - The Supabase schema audit now statically enforces that lock order.

24. Live Drops privacy hardening
   - The public item JSON previously carried private inventory identity fields (id, caseKey, obtainedAt) even though the feed only needs emoji/rarity/price.
   - Canonical schema and production fairness migration now persist only the public item subset and scrub legacy rows.
   - The browser Realtime/REST bridges also strip the same fields defensively before painting.

25. Transparency / simulator labeling
   - Header balance is explicitly labeled ДЕМО, with an accessible virtual-balance label.
   - Public metadata now states that the site is a virtual simulator and the in-game balance is not real money.

## External market / platform audit — 2026-09-24

- Apple currently requires odds disclosure before purchase for apps with loot boxes/randomized virtual items; Google Play likewise requires odds to be disclosed in advance and close to the purchase. Emoji Drops already renders the five rarity probabilities directly in the case screen and does not use real-money purchases.
- Current Supabase Realtime guidance recommends Broadcast for most scalable/security-sensitive realtime use cases, while Postgres Changes remains supported and simpler. The current Live Drops feed is deliberately public, payload-minimized, and has REST fallback/lifecycle cleanup; no authenticated/private topic is exposed through it.
- Current consumer-protection guidance continues to emphasize avoiding interfaces that obscure costs, terms, or user choice. The product therefore keeps demo/virtual-money labeling, visible case prices and odds, and no artificial countdown/FOMO mechanics.
- Current mobile/accessibility contracts remain aligned with the project scope: large touch targets, keyboard/focus handling, reduced motion, narrow layouts and explicit modal semantics.

## Release decision

The implementation scope is code-complete against the supplied final plan. The remaining work is release verification: obtain a valid CI run for the exact PR head, resolve any real failures, rerun the full matrix, and merge only after the release gate is green. No new feature surface should be added during that gate.
