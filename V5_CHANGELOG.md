# V5 Changelog

## V5 - 2026-04-16

V5 is prepared from the stable V4.1 line and compares its user-facing scope against V2, because V2 is the known-good baseline for Official register, withdraw, and queue behavior.

## Compared With V2

### Official Registration And Queue

- Keeps the V2 Official-series workflow:
  - direct `Register`
  - direct `Withdraw`
  - race queue
  - qualifying queue
  - practice `Register` only when the iRacing website exposes a valid practice session target
  - `(R)` and `(Q)` labels in the bottom queue bar
  - displaced-registration handoff
  - optional `Re-queue displaced registration`, disabled by default
- Fixes V5 regressions found during local testing:
  - main-card `Withdraw` now uses a direct withdraw handler
  - lower `Race Queue` buttons keep chronological order after a withdraw
  - the top `Queue for the next race` mirrors the first visible race queue slot below it

### Dashboard And Financial Tools Added Since V2

- Adds the dashboard `Budget Snapshot`.
- Values remain hidden by default and require `Reveal`.
- Order History sync is required before spend values unlock.
- The widget can remain compact for last-30-days spend or expand for content spend and pending catalog value.
- Order History analysis includes categories such as content, hosted sessions, subscriptions, gifts, credits, refunds, and adjustments.
- Date-range filtering remains available on the Order History page.
- Local racing-cost curiosities are richer than V2 and do not use a remote feed.

### Member Progress Added Since V2

- Adds dashboard `Intelligence Center`.
- Compact view focuses on:
  - member anniversary
  - 30-day activity
  - streak
  - member since
- Expanded view includes:
  - license snapshot
  - participation credits
  - awards
  - recent events

### Status And Update UX Added Since V2

- Adds a visible registered-session banner.
- The banner now shows a live `Starts in ...` countdown for the active registered session.
- Keeps the GitHub release update notice flow introduced after V2.

## V5-Specific Changes Since V4.1

- Updated extension versioning to `5.0.0` / `v5`.
- Tightened `Budget Snapshot` sync gating and copy.
- Scoped Order History dashboard handoff to a dashboard-session key.
- Removed the temporary bridge copy after the dashboard reads synced Order History data.
- Removed the inactive direct car-manual setting/runtime hook because the toggle was not reliably controlling the feature.
- Restored the V2-style DOM observer path used by register/withdraw/queue so Official session actions initialize reliably.
- Fixed current-session queue placement after withdraw.
- Added the registered-session start countdown to the top registration banner.

## Privacy And Safety

- The extension still requests only the `storage` permission.
- Financial summaries remain sanitized before being used by the dashboard.
- The dashboard keeps visible financial state hidden by default.
- No remote curiosity feed or external dynamic content source was added.
- No hardcoded secrets, personal credentials, auth tokens, or private local account data are intentionally stored in tracked source.

## Validation

- `npm run build`
- `npm audit --omit=dev`
- source scan for common secret/token/private-data patterns
- manifest and permission review
