# Emoji Drops — Release Ownership & Definition of Done

This document is the final ownership contract for the production runtime. It is intentionally about reliability and maintainability, not adding user-facing features.

| Surface | Authoritative owner | Server authority |
|---|---|---|
| Navigation | `emoji-drops-navigation-final.js` | n/a |
| Case catalogue / modal | `emoji-drops-case-showcase-exact.js` | `open_case_server` |
| Case activation bridge | `emoji-drops-case-open-bridge.js` | n/a |
| Transactions | `emoji-drops-transaction-layer.js` | RPCs |
| Upgrade | `emoji-drops-upgrade-final.js` | `upgrade_server` |
| Market | `emoji-drops-market-v26.js` | market RPCs |
| Live Drops | `emoji-drops-live-final.js` | `live_drops` + Realtime |
| Favorites | canonical `emojiDropsFavoritesV2` contract | n/a |
| Inventory / balance state | `emoji-drops-core.js` + transaction layer | profile/RPC state |
| Profile surface | `emoji-drops-final-ux.js` | profile state |
| Visual system | `app-v2.js` design-system + loaded surface owners | n/a |

## Rules

1. A new module must not become a second owner for an existing surface.
2. Presentation layers may style or adapt an owner, but must not create a competing transaction/state path.
3. Browser animation never chooses a Case/Upgrade result.
4. Critical economy mutations are server-authoritative.
5. Realtime is the primary Live Drops transport; polling is a controlled fallback, never an independent second source.
6. Reduced motion must shorten/disable non-essential motion without breaking operation completion.
7. Mobile touch handling must not globally disable browser gestures or zoom.
8. A release is not green because tests exist; the latest main commit must have a successful Static QA run.

## Release gate

The production gate covers:

- syntax/assets/bootstrap
- ownership/cache contracts
- economy source-of-truth
- transaction/recovery/storage faults
- Supabase/RLS/security
- Case/Upgrade/Market/Inventory/Profile/Live Drops
- browser E2E
- accessibility and keyboard/focus behavior
- performance/lifecycle budgets
- portrait/landscape/mobile touch
- multi-tab/recovery
- visual regression smoke
- production smoke

A previous successful run does not validate a newer commit.
