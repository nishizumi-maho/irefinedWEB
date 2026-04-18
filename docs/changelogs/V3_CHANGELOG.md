# V3 Changelog

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
