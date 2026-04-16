# Changelog

## V4.1 - 2026-04-16

V4.1 is a focused refinement release on top of V4. It expands the local financial-comparison content and trims recurring browser-side work that did not need to run so often.

### Added

- Much larger local curiosity bank for the dashboard `Budget Snapshot`.
- Matching expansion of the `Order History` comparison pool so dashboard and history views now surface richer real-world racing comparisons from the same overall concept.
- New comparisons across track nights, race entries, fuel, tires, safety gear, travel, coaching, paddock costs, and sim-rig hardware.

### Changed

- Updated extension versioning to `4.1.0` / `v4.1`.
- `Budget Snapshot` now rotates through a much deeper pool of local comparisons.
- `Order History` range-based curiosities now use a wider reference set and stronger cross-category comparisons.

### Performance

- Replaced the old high-frequency global selector scan with a mutation-driven observer plus a lighter fallback scan.
- Reduced repeated work in hidden tabs for dashboard, manual-link, join-button, and queue/status UI refresh paths.
- Prevented duplicate polling intervals in the improved join-button helper.

### Validation

- `node --check` on updated runtime files.
- `npm run build`.

## V4 - 2026-04-15

V4 expands the browser dashboard tooling while keeping the project focused on the logged-in `members-ng` website experience.

### Added

- Dashboard `Intelligence Center` focused on member progress.
- Compact default `Intelligence Center` state showing member anniversary, 30-day activity, streak, and member-since timing.
- Expandable detailed progress view with license snapshot, participation credits, recent awards, and recent events.
- Direct official `Manual` links on supported shop and licensed-content car cards.
- Official car-manual matching based on the public iRacing user-manual catalog.
- Deep `members-ng` analysis report captured in `V4_SITE_DEEP_ANALYSIS.md`.

### Changed

- Updated extension versioning to `4.0.0` / `v4`.
- Reduced dashboard vertical footprint by placing `Budget Snapshot` and `Intelligence Center` in a shared responsive row.
- `Intelligence Center` now defaults to compact mode and uses `Expand` / `Compact` controls.
- Refined the 30-day activity card to show the delta versus the previous 30 days and the active date range more clearly.
- `Budget Snapshot` now rotates a single curiosity at a time from a larger comparison pool.
- Dashboard widgets now auto-refresh only once per tab session and keep their UI state only for the life of that tab.
- Removed the separate `Membership Snapshot` widget and folded the useful member-progress data into the new dashboard panel.

### Privacy And Safety

- The extension still requests only the `storage` permission.
- Order History summaries remain sanitized before storage.
- Dashboard membership/intelligence state now prefers per-tab session persistence.
- No tracked hardcoded secrets, personal credentials, or private local paths were found during the V4 audit.

### Validation

- `node --check` on the main new/changed dashboard scripts.
- `npm run build`.
- `npm audit --omit=dev`.
- `git diff --check`.
- Source scan for common secret/token/private-data patterns.

## V3 Experimental - 2026-04-15

V3 is an experimental release focused on dashboard spend visibility, local Order History analysis, and clearer update notices.

### Added

- Dashboard `Budget Snapshot` widget.
- Compact dashboard mode showing last-30-days spend after Order History has been synced.
- Expanded dashboard mode showing total content spend and estimated pending cost for unowned cars and tracks.
- Local Order History analyzer for content, hosted sessions, subscriptions, gifts, account recharge usage, auto credits, refunds, and other spending categories.
- Date-range filters for synced Order History data.
- Hosted sessions as a dedicated spend category on the Order History page.
- Rotating price curiosities comparing content spend and pending catalog value with real-world racing-related items.
- More visible update popup when a newer GitHub release is detected.
- Narrow storage bridge between `members-ng` and legacy account pages for approved local purchase summary keys only.

### Changed

- The dashboard financial widget is enabled by default, but opens compact and hides all values by default.
- Financial values and curiosities require an explicit `Reveal` click before they are shown.
- The first-run welcome page was removed.
- Dashboard content spend falls back to current owned catalog value until Order History is synced.
- Order History summaries are sanitized before storage and do not intentionally keep order numbers, names, e-mails, tokens, credentials, or raw invoice HTML.

### Privacy And Safety

- Financial summaries are stored locally through browser storage.
- The widget can be disabled entirely from iRefined settings.
- The extension keeps the existing minimal extension permission set and only adds `storage` for local summaries.
- No hardcoded secrets, personal account data, auth tokens, or private local paths were found in the source review for this release.

### Validation

- `node --check` on the main V3 JavaScript entry points.
- `npm run build`.
- `npm audit --omit=dev`.
- Source scan for common secret/token/private-data patterns.

## V2 - 2026-04-15

This entry consolidates the original V2 release and the critical fixes that followed it. The GitHub release tagged `v2` should use this combined state.

### Added

- Queue support for race rows that only expose `View in iRacing`.
- Queue support for qualifying sessions.
- Practice `Register` buttons when the iRacing site exposes a valid direct practice session target.
- The advanced `Re-queue displaced registration` option, disabled by default.
- `(R)` and `(Q)` labels in the bottom queue bar for scheduled race and qualify entries.

### Changed

- The top race card keeps direct registration actions separate from the queue actions below it.
- Upcoming sessions remain queueable even when the current top session is already open for registration.
- `Currently Racing` keeps only the native `View in iRacing` action.

### Fixed

- Restored queue registration detection so queued race and qualify sessions do not stay stuck in `Searching for ... session` once the site already exposes a session id.
- Synced the queue-bar countdown with the `Next Race` timer.
- Fixed local withdraw from the top status bar so the main button updates immediately afterward.
- Fixed session deduplication so some users no longer see only one future race when multiple rows share the same raw `session_id`.
- Improved withdraw/register handoff when moving from an existing registration into a nearer queued session.
