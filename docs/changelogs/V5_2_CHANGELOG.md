# V5.2 Changelog

V5.2 is a focused updater hotfix on top of V5.1.

## Fixed

- Fixed the update notice showing `v5.1 is ready` even when the installed extension was already running `v5.1`.
- Fixed stale cached update data from older installs incorrectly keeping the popup, toolbar update button, and settings update notice active.
- The updater now recalculates `available` from the currently installed extension version every time cached or freshly fetched release data is used.

## Changed

- Updated extension versioning to `5.2.0` / `v5.2`.

## Why This Matters

Users who updated from V5 to V5.1 could still have cached release data saying that V5.1 was available. Because that cached `available` flag was trusted directly, the extension could keep prompting for an update that was already installed.

V5.2 makes the current installed version authoritative. Cached release metadata is still reused for efficiency, but its availability flag is normalized before the UI is allowed to show an update prompt.

## Validation

- `node --check extension/src/helpers/updates.js`
- `npm run build`
- `npm audit --omit=dev`
- `git diff --check`
- Local regression check:
  - current `5.1.0` plus cached latest `v5.1` returns `available: false`
  - current `5.1.0` plus latest `v5.2` returns `available: true`
