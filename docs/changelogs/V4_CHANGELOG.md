# V4 Changelog

## V4 - 2026-04-15

V4 expands the browser dashboard tooling while keeping the project focused on the logged-in `members-ng` website experience.

### Added

- Dashboard `Intelligence Center` focused on member progress.
- Compact default `Intelligence Center` state showing:
  - member anniversary
  - 30-day activity
  - streak
  - member since
- Expandable detailed progress view with:
  - license snapshot
  - participation credits
  - recent awards
  - recent events
- Direct official `Manual` links on supported shop and licensed-content car cards.
- Official car-manual matcher based on the public iRacing user-manual catalog.
- Site-analysis report in [V4_SITE_DEEP_ANALYSIS.md](./V4_SITE_DEEP_ANALYSIS.md) documenting the useful `members-ng` data surface discovered during V4 research.

### Changed

- Updated extension versioning to `4.0.0` / `v4`.
- Reduced dashboard vertical footprint by placing `Budget Snapshot` and `Intelligence Center` into a shared responsive row.
- `Intelligence Center` now defaults to compact mode and uses `Expand` / `Compact` instead of icon-only controls.
- Refined the 30-day activity card so it explains the delta versus the previous 30 days and shows the active date range.
- `Budget Snapshot` now shows one rotating curiosity at a time while using a larger comparison pool.
- Dashboard widgets now auto-refresh only once per tab session instead of repeatedly while the page remains open.
- Dashboard widget UI state persists while the tab stays alive, then clears when the tab is closed.
- Removed the separate `Membership Snapshot` widget and merged the useful member-progress information into the new dashboard panel.

### Privacy And Safety

- The extension still requests only the `storage` permission in the browser manifest.
- Order History summaries remain sanitized before storage and do not intentionally store order numbers, names, e-mails, tokens, credentials, or raw invoice HTML.
- Dashboard membership/intelligence runtime state is kept to the current tab session instead of being persisted as long-lived profile data.
- No hardcoded secrets, personal credentials, or private machine-specific paths were found in tracked source files during the V4 audit.

### Validation

- `node --check` on the main new/changed dashboard scripts.
- `npm run build`.
- `npm audit --omit=dev`.
- `git diff --check`.
- Source scan for common secret/token/private-data patterns.
