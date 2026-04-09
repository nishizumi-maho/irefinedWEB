# iRefined Browser

## Quick Install (GitHub Releases)

If you just want to use the extension, do this:

1. Open the [latest release](https://github.com/nishizumi-maho/irefinedWEB/releases/latest)
2. Download the file named like `irefined-browser-chromium-v1.zip`
3. Extract that zip somewhere permanent on your PC
4. Open `chrome://extensions` in Chrome, or `edge://extensions` in Edge
5. Enable `Developer mode`
6. Click `Load unpacked`
7. Select the extracted folder that contains `manifest.json`
8. Open `https://members-ng.iracing.com/web/racing/home/dashboard`

Important:

- do not point the browser at the `.zip` itself; extract it first
- do not leave the extension inside a temporary folder that you plan to delete later
- when a new GitHub release comes out, download the new zip, extract it, and click `Reload` on the browser extensions page
- unpacked extensions installed from GitHub Releases do not auto-update by themselves in Chromium browsers
- the extension itself will warn you inside the iRefined UI when a newer GitHub Release is available

> **Note for iRacing Staff**
>
> This repository is a browser-only helper layer for the public `members-ng` website. It does **not** inject into the installed iRacing UI, does **not** rely on closed Electron/devtools ports, does **not** attach to the local sim client, does **not** automate driving inputs, and does **not** attempt to bypass authentication or security controls. The intent of this fork is to provide UI helpers on top of the existing logged-in website experience only, using actions and state already exposed through `members-ng`. If any behavior here is considered incompatible with current iRacing policy, please open an issue or contact the maintainer so it can be adjusted cooperatively.

`iRefined Browser` is a browser-first extension for the iRacing `members-ng` site:

- Official series register and withdraw helpers
- Queueing future official sessions from the web UI
- Hosted and League session import/export helpers
- Test Drive session sharing buttons
- UI quality-of-life tweaks for the `members-ng` layout

This repository is a browser-focused fork/adaptation of the original `iRefined` project. The old desktop launcher flow is intentionally removed here. This build targets the website at `https://members-ng.iracing.com/web/racing/*` and does not try to inject into the installed iRacing UI.

## Browser Support

### Chromium browsers

The current release package is built for Chromium browsers.

That includes the easiest targets:

- Chrome
- Edge
- Brave
- Vivaldi
- Opera

For these browsers, the current extension package should work with little or no change.

### Firefox

Firefox is possible in theory, but it is not a drop-in target for this repository right now.

The codebase is reasonably portable, but Firefox distribution is a different path:

- persistent Firefox installs generally require a Mozilla-signed `.xpi`
- this repository currently ships a Chromium-style unpacked package, not a Firefox release artifact
- if we decide to support Firefox later, it should be treated as a separate distribution target and tested independently

### Safari

Safari is also possible in theory, but it is a separate packaging and distribution project.

This repository does not currently target Safari.

## Update Model

Current update model:

- users install from GitHub Releases
- users update manually by downloading a newer release and reloading the unpacked extension

Why this is the current model:

- the extension is not being distributed through the Chrome Web Store or Edge Add-ons right now
- unpacked GitHub-installed extensions do not behave like store-managed auto-updating extensions

Could the extension notify users that a new version exists?

Yes. This repository now includes an in-extension update check.

How the notice works:

- on page load, the extension checks the repository's latest GitHub Release
- the result is cached locally so it does not spam GitHub on every page interaction
- if a newer release exists, the bottom iRefined bar shows an `Update vX` button
- the settings panel also shows an update notice with a direct link to the latest release page

The extension does not self-install updates. The notice is there to tell users that they should download the newer release zip and reload the unpacked extension.

## What This Fork Is

This repository exists to make the useful parts of iRefined work directly in Chromium browsers on `members-ng`.

The goal is:

- keep the parts that can work from the browser
- remove the old desktop launcher dependency
- make registration and queue workflows usable from the website itself
- keep the repository small and easy to understand

This project is not affiliated with iRacing.

## What Works

Current browser-first features:

- direct `Register` and `Withdraw` helpers on supported Official series pages
- queue helpers for future Official race sessions
- automatic register switching for queued sessions near race time
- queue notification sound with configurable volume
- registration banner showing current browser-managed registration state
- Hosted and League `Create a Race` session import/export
- page-level export helpers for supported pages
- Test Drive session sharing buttons
- optional UI tweaks:
  - hide sidebars
  - collapse menu
  - suppress notifications
  - auto-close notifications
  - inline log viewer

## What Does Not Work

This extension does not turn iRacing into a full browser-only experience.

Known limitations:

- joining a session still depends on whatever action the site exposes, which usually hands off to the local iRacing app
- launching the sim is still local-app behavior
- weather import/export is currently hidden while it is being reworked, use the session import/export as a workaround (the weather feature works there!)
- some UI placements on `members-ng` may break whenever iRacing changes the site layout

In practice:

- `Register` and `Withdraw` can work from the web backend
- `Join` only works when the site itself exposes a join/open action
- this project is best understood as a web helper layer on top of `members-ng`

## Installation

### Install from GitHub Releases

This is the recommended path for normal users.

1. Open the [latest release](https://github.com/nishizumi-maho/irefinedWEB/releases/latest)
2. Download the latest `irefined-browser-chromium-v1.zip` style file
3. Extract it
4. Open `chrome://extensions` or `edge://extensions`
5. Enable `Developer mode`
6. Click `Load unpacked`
7. Select the extracted folder that contains `manifest.json`

### Build from source

#### 1. Build the extension

```powershell
cd extension
npm install
npm run build
```

#### 2. Load it into Chrome or Edge

1. Open `chrome://extensions` in Chrome or `edge://extensions` in Edge
2. Enable `Developer mode`
3. Click `Load unpacked`
4. Select `extension/dist`

#### 3. Open iRacing

Open:

- `https://members-ng.iracing.com/web/racing/home/dashboard`

or any other `members-ng` page under:

- `https://members-ng.iracing.com/web/racing/*`

If the extension is loaded correctly, the custom iRefined UI should appear on supported pages.

## Default Settings

Enabled by default:

- Test Drive session sharing buttons
- Hosted/League session tools
- Queue system for future sessions
- Queue register sound
- Join button displays session type

Disabled by default:

- Prompt for car when queueing
- No notifications
- Auto close notifications
- Hide sidebars
- Collapse menu
- Show log messages

Default numeric values:

- notification auto-close timeout: `5` seconds
- queue sound volume: `65%`

## How The Main Flows Work

### Official series

On supported Official `Go Racing` pages, the extension can:

- show a browser-side `Register` button
- switch that button to `Withdraw` when the browser-managed registration is active
- show a green registration banner at the top
- queue future race sessions

If a queued session reaches the registration window:

- the extension tries to withdraw the current session first
- then it sends the new register request
- then it plays the configured queue sound

### Queue behavior

Queue is meant for future Official race sessions.

Typical flow:

1. Open a supported series page
2. Choose your car if needed
3. Click a `Queue` button
4. Leave the tab open, or come back later
5. When the queued race becomes registerable, the extension moves it into `Register now`
6. Near race time, the extension attempts the withdraw/register switch automatically

Important notes:

- queue depends on the site still exposing the session and registration data the extension expects
- queue is safest when the series page can still resolve a real session id
- if you are already registered elsewhere, queue will try to withdraw that session before sending the new register request

### Hosted and Leagues

On supported `Create a Race` flows, the extension can add:

- `Import Session`
- `Export Session`

The goal is to let you move session configurations between Hosted and League workflows without touching the old desktop UI.

Practical workflow:

1. Export a `session.json` from the session setup you want to preserve
2. Open Hosted or Leagues and create a new race with any valid date in the future
3. Click `Import Session`
4. Select the exported `session.json`
5. The wizard should repopulate the session settings, including the weather that is already embedded in that session export
6. Finish scheduling the Hosted race for the future
7. Use that scheduled session as your reusable setup target

Why this is useful:

- you only have to build the session once
- you can keep a known-good setup with the track, rules, and climate already baked in
- after scheduling it for the future, you can keep going back to that same setup flow instead of rebuilding everything from scratch
- this is especially handy if your normal workflow involves bouncing through the local iRacing UI for Test Drive or related setup checks

In short:

- `session.json` is the portable setup file
- importing it into a future Hosted race is the fastest way to recreate a full session configuration
- the point is to make repeatable test and setup workflows much less annoying

### Test Drive

On supported Test Drive flows, the extension can expose sharing helpers for session configuration export/import.

## Logs And Troubleshooting

There are two useful places to collect logs.

### 1. The in-page log panel

Enable `Show log messages` in the iRefined settings panel.

That adds a visible iRefined log panel inside the page. It is useful for:

- queue state changes
- withdraw/register attempts
- websocket readiness
- export/import actions

### 2. Browser DevTools console

Open DevTools on the iRacing page and check the `Console` tab.

The extension mirrors its own logs there with the prefix:

- `[iRefined]`

Useful things to capture:

- the first `[iRefined] loaded` message
- any `[iRefined]` websocket errors
- queue/register/withdraw messages
- screenshots of the series page if the UI does not match the logs

## How To Report A Useful Issue

Before opening an issue:

- reload the extension in `chrome://extensions` or `edge://extensions`
- hard refresh the iRacing page
- reproduce the problem once
- collect logs

When reporting a bug, include:

- browser name and version
- extension version from the extensions page
- exact `members-ng` page URL or page type
- what you expected to happen
- what actually happened
- whether you were already registered in another session
- whether queue was involved
- screenshots if the UI looked wrong
- iRefined logs from the page and/or DevTools console

Good examples:

- `Queue reached 5 minutes but did not withdraw current session`
- `Hosted Create a Race export button appears but downloads nothing`
- `Register button stays in Registering after direct register`

Bad examples:

- `doesn't work`
- `queue broken`

## Issue Templates

GitHub issue templates are included in `.github/ISSUE_TEMPLATE`.

Use:

- `bug_report.md` for broken behavior
- `feature_request.md` for new ideas

## Development

### Build

```powershell
cd extension
npm install
npm run build
```

### Project structure

Main paths:

- `extension/src/main.js`: extension entrypoint
- `extension/src/feature-manager.js`: feature toggling
- `extension/src/features`: UI features
- `extension/src/helpers`: shared utilities
- `extension/public/manifest.json`: extension manifest

### CI

The repository includes a simple extension build workflow in `.github/workflows/extension.yml`.

### Release packaging

The repository also includes a GitHub Actions release packaging workflow.

The intended maintainer flow is:

1. publish a GitHub Release such as `v1`, `v2`, `v3`
2. let GitHub Actions build the extension
3. let GitHub Actions attach a ready-to-install Chromium zip to that release

That release zip is what normal users should download.

## Notes For Users

- If the site DOM changes, selectors may need to be updated.
- If iRacing changes their backend behavior, register/withdraw helpers may stop working.
- If a feature depends on the site exposing a button or session id, the extension cannot invent that data on its own.
- If audio does not play for queue notifications, interact with the page once first so the browser can unlock audio playback.

## Current Repository Scope

This repository only keeps the browser-extension-focused code that is actually used by this fork.

Removed from this fork:

- the old launcher flow
- desktop-only injection plumbing
- monitored browser artifacts
- local test traces and generated junk

That is intentional.
