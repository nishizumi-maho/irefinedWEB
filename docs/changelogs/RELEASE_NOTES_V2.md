# V2 Release

This V2 release consolidates the original V2 work and the follow-up critical fixes that were previously split out separately. This is now the canonical V2 release and should be published as the latest stable release for the browser extension.

## Changelog

### Added

- Queue buttons for upcoming race sessions, including rows that normally expose only `View in iRacing`.
- Queue support for qualifying sessions.
- A clearer top-card workflow that keeps direct `Register` and `Withdraw` visible while exposing separate race and qualify queue actions below.
- Direct practice `Register` buttons only when `members-ng` exposes a valid registerable practice session id.
- The advanced `Re-queue displaced registration` setting, disabled by default, to keep a displaced registration queued after switching to a nearer queued session.
- `(R)` and `(Q)` tags in the bottom queue bar so scheduled race and qualify entries are easy to identify.

### Changed

- The top session card now stays focused on the primary action for the current session, while upcoming sessions remain queueable from the dedicated queue areas.
- `Register unavailable` on supported race cards was replaced with `Queue for the next race` when the site has not opened a valid direct registration target yet.
- `Currently Racing` keeps the native `View in iRacing` action instead of showing queue buttons.

### Fixed

- Restored the queue registration flow for race and qualify sessions when the site exposes a session id before the automatic 5-minute register window.
- Synced the bottom queue bar countdown with the `Next Race` countdown to prevent timer drift between UI areas.
- Fixed local withdraw from the top status bar so the main central button updates immediately after the withdraw request.
- Fixed session row deduplication so users no longer lose future rows when iRacing reuses a raw `session_id`.
- Improved queue handoff when the user is already registered elsewhere by withdrawing the current registration before switching to the nearer queued session.
- Improved browser-side registration state refresh after local register and withdraw actions.

## Validation

- Built the Chromium extension package with `npm run build`.
- Repacked the Chromium release zip for GitHub Releases.
- Verified GitHub release notes and repository docs were updated for the consolidated V2 release.
