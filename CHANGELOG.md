# Changelog

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
