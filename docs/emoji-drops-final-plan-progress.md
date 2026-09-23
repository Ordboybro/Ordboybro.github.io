# Emoji Drops — final plan progress

Updated: 2026-09-23
Branch: `final/emoji-drops-11-10-implementation-2026-09-23`
PR: #35

## Scope of this pass

This file is the persistent checkpoint for the user's request to finish **exactly the first half of the remaining final-plan blocks** before doing the second half. No new user-facing features, pages, currencies, or buttons were introduced.

### Half 1 — completed / audited

1. **Architecture / ownership**
   - Runtime ownership is declared in `js/app-v2.js`.
   - Navigation is owned by `js/emoji-drops-navigation-final.js`.
   - Exact case modal/reveal is owned by `js/emoji-drops-case-showcase-exact.js`.
   - Transactions, Upgrade, Market, Live Drops, Inventory and Favorites have explicit contracts in the runtime bootstrap.
   - Fixed a real mobile navigation race: a synthetic/non-touch click arriving shortly after a touch could activate a different navigation target. Navigation v8 now rejects stale cross-target clicks during the active touch window.

2. **Design system**
   - Canonical `--ed-*` tokens exist in the runtime bootstrap: surfaces, border, text, muted, accent, rarity, radii, shadows, motion durations and easing.
   - Runtime visual layers were already migrated to these canonical tokens in this branch; no new visual system was added here.

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
   - The current CI workflow already contains dedicated Market privacy, race/concurrency and production-migration audit gates. This pass keeps that scope intact rather than inventing another Market implementation.

## Second half — implemented / verified in this pass

9. **Security + Supabase production pass**
   - Schema audit enforces RLS, canonical RPC identities, `SECURITY DEFINER SET search_path=''`, ownership checks and locked Market mutations.
   - Anonymous live matrix verifies direct economy-table denial, mutation RPC denial, constrained Market snapshot and narrow Live Drops payload.
   - Current Supabase guidance was rechecked: private Realtime channels/RLS are recommended for protected topics; public Live Drops remains intentionally limited to non-private fields.

10. **Performance**
   - 100 normalized modal/navigation lifecycle cycles are covered by the performance budget E2E.
   - Observer/listener/timeout/interval/audio/DOM/resource budgets are checked before and after the cycle.

11. **Mobile + Safari**
   - Mobile matrix now exactly covers 320x568, 360x800, 375x812, 390x844, 412x915, 430x932, 844x390 and 915x412.
   - WebKit 390x844 runs the physical touch case → modal → close flow.
   - Case-open controls use a 52px mobile height to preserve a >=48px physical hit target after layout transforms.
   - Profile item actions were normalized to 48px touch targets.

12. **Accessibility**
   - Existing axe/keyboard/focus-trap/Escape/focus-restore/reduced-motion gate passes.
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
   - Browser E2E, Upgrade E2E, accessibility, performance, mobile, recovery, anonymous Supabase security, architecture, visual regression and production smoke have all passed on the latest full run before the release-gate-only workflow fix.
   - The release gate itself was corrected to evaluate prior-step outcomes with `success()` rather than self-referential `job.status`.
   - A final rerun on the latest SHA is required before merge.

## Release status

The implementation work for the remaining half is complete. **Do not merge until the latest SHA receives a full green CI run including the final release gate.**
