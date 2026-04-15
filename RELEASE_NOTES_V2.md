# V2 Experimental Release

This is an experimental release of iRefined Browser focused on the Official session registration and queue workflow on the iRacing `members-ng` website.

## Changelog

- Added queue buttons for upcoming race sessions, including rows that normally expose only `View in iRacing`.
- Added queue support for qualifying sessions.
- Kept the top session card focused on the direct registration state: `Register`, `Withdraw`, `Registered elsewhere`, or `Queue for the next race` when direct registration is not available.
- Hid the top-card `View in iRacing` button in the new registration/queue states to make the primary action clearer.
- Added the currently open race session to the `Race Queue` upcoming session buttons, so users can queue it even when the top card offers direct registration.
- Removed queue buttons from the `Currently Racing` driver table and restored the native `View in iRacing` behavior there.
- Added direct green `Register` buttons for practice sessions only when `members-ng` exposes a valid registerable practice session id.
- Improved queue handoff when the user is already registered elsewhere: when a queued session becomes registerable, the extension withdraws the current registration before registering the queued session.
- Added the advanced `Re-queue displaced registration` setting, disabled by default. When enabled, the extension can keep the displaced registration queued after switching to a nearer queued session.
- Improved registration state refresh after browser-side register and withdraw actions.
- Updated V2 metadata in `package.json`, `package-lock.json`, and `manifest.json`.
- Updated README documentation for V2 behavior, settings, installation, and limitations.

## Notes

- This release remains a browser-only helper layer for the public iRacing `members-ng` website.
- Queue/register behavior depends on the session ids and registration state exposed by `members-ng`.
- Practice registration is only added where the site exposes the required direct registration data.
- This release should be published as a GitHub pre-release while the expanded queue behavior is validated.

## Validation

- Built the Chromium extension package with `npm run build`.
- Ran a production dependency audit with `npm audit --omit=dev`.
- Ran repository privacy and secret scans across tracked source and documentation files.
