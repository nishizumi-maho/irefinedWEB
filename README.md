# iRefined Browser 🚀

> **Note for iRacing Staff**
>
> This repository is a browser-only helper layer for the public `members-ng` website. It does **not** inject into the installed iRacing UI, does **not** rely on closed Electron/devtools ports, does **not** attach to the local sim client, does **not** automate driving inputs, and does **not** attempt to bypass authentication or security controls. The intent of this fork is to provide UI helpers on top of the existing logged-in website experience only, using actions and state already exposed through `members-ng`. If any behavior here is considered incompatible with current iRacing policy, please open an issue or contact the maintainer so it can be adjusted cooperatively.

**This repository and its contributors are not affiliated with iRefined. This repository started as a fork of iRefined.**
Discord of the original iRefined project: https://discord.gg/hxVf8wcGaV

## ⚡ Quick Install (GitHub Releases)

If you just want to use the extension, do this:

1. Open the [GitHub Releases page](https://github.com/nishizumi-maho/irefinedWEB/releases)
2. Download the newest file named like `irefined-browser-chromium-v5.1.zip`
3. Extract that zip somewhere permanent on your PC
4. Open `chrome://extensions` in Chrome, or `edge://extensions` in Edge
5. Enable `Developer mode`
6. Click `Load unpacked`
7. Select the extracted folder that contains `manifest.json`
8. Open `https://members-ng.iracing.com/web/racing/home/dashboard`

Quick notes:

- do not point the browser at the `.zip` itself; extract it first
- do not leave the extension inside a temporary folder that you plan to delete later
- when a new GitHub release comes out, download the new zip, extract it, and click `Reload` on the browser extensions page
- unpacked extensions installed from GitHub Releases do not auto-update by themselves in Chromium browsers
- the extension itself will warn you inside the iRefined UI when a newer GitHub Release is available

`iRefined Browser` is a browser-first extension for the iRacing `members-ng` site:

- Official series register and withdraw helpers
- Queueing race and qualifying sessions from the web UI
- Direct practice registration when the iRacing website exposes it
- Dashboard `Budget Snapshot` with private hidden values, Order History sync, and content catalog estimates
- Dashboard `Intelligence Center` with compact member progress, expandable detailed progress cards, and anniversary/activity tracking
- Hosted and League session import/export helpers
- Registration banner with the current registered session and visible start countdown
- Test Drive session sharing buttons
- UI quality-of-life tweaks for the `members-ng` layout

This repository is a browser-focused fork/adaptation of the original `iRefined` project. The old desktop launcher flow is intentionally removed here. This build targets the website at `https://members-ng.iracing.com/web/*` and does not try to inject into the installed iRacing UI.

## ✨ At A Glance

- 🟢 Register and withdraw from supported Official series pages
- ⏳ Queue future sessions and let the extension handle the switch near race time
- 💵 Check recent and total content spend privately from the dashboard
- 📦 Export/import `session.json` for Hosted and League setup reuse
- 🔔 Get a queue notification sound when the new registration lands
- 🧰 Apply small UI quality-of-life tweaks directly on `members-ng`

## 🌐 Browser Support

### Chromium browsers ✅

The current release package is built for Chromium browsers.

That includes the easiest targets:

- Chrome
- Edge
- Brave
- Vivaldi
- Opera

For these browsers, the current extension package should work with little or no change.

### Firefox 🛠️

Firefox is possible in theory, but it is not a drop-in target for this repository right now.

The codebase is reasonably portable, but Firefox distribution is a different path:

- persistent Firefox installs generally require a Mozilla-signed `.xpi`
- this repository currently ships a Chromium-style unpacked package, not a Firefox release artifact
- if we decide to support Firefox later, it should be treated as a separate distribution target and tested independently

### Safari 🍎

Safari is also possible in theory, but it is a separate packaging and distribution project.

This repository does not currently target Safari.

## 🔄 Update Model

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

## 🧭 What This Fork Is

This repository exists to make the useful parts of iRefined work directly in Chromium browsers on `members-ng`.

The goal is:

- keep the parts that can work from the browser
- remove the old desktop launcher dependency
- make registration and queue workflows usable from the website itself
- keep the repository small and easy to understand

This project is not affiliated with iRacing.

## ✅ What Works

Current browser-first features:

- direct `Register` and `Withdraw` helpers on supported Official series pages
- queue helpers for race and qualifying sessions on supported Official series pages
- automatic register switching when a queued session becomes registerable
- optional re-queueing of the displaced registration after a queue handoff
- direct practice registration when the site exposes a registerable practice session
- queue notification sound with configurable volume
- registration banner showing current browser-managed registration state
- Hosted and League `Create a Race` session import/export
- page-level export helpers for supported pages
- Test Drive session sharing buttons
- dashboard `Budget Snapshot` with last-30-days compact mode
- expanded spend and pending content estimates
- dashboard `Intelligence Center` with compact progress overview and expandable detailed progress cards
- Order History spend breakdown by category, including hosted sessions and subscriptions
- local date-range filtering for synced Order History summaries
- optional UI tweaks:
  - hide sidebars
  - collapse menu
  - suppress notifications
  - auto-close notifications
  - inline log viewer

## ⚠️ What Does Not Work

This extension does not turn iRacing into a full browser-only experience.

Known limitations:

- joining a session still depends on whatever action the site exposes, which usually hands off to the local iRacing app
- launching the sim is still local-app behavior
- weather import/export is currently hidden while it is being reworked, use the session import/export as a workaround (the weather feature works there!)
- practice registration is only added when `members-ng` exposes the required practice registration data
- real paid spend requires opening Order History once so the extension can sync the local summary
- dashboard catalog estimates use current shop pricing, not historical purchase prices
- direct official car-manual links are currently disabled until the card integration is reliable
- some UI placements on `members-ng` may break whenever iRacing changes the site layout

In practice:

- `Register` and `Withdraw` can work from the web backend
- `Join` only works when the site itself exposes a join/open action
- this project is best understood as a web helper layer on top of `members-ng`

## 📥 Installation

### Install from GitHub Releases

This is the recommended path for normal users.

1. Open the [GitHub Releases page](https://github.com/nishizumi-maho/irefinedWEB/releases)
2. Download the latest `irefined-browser-chromium-v5.zip` style file
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

- `https://members-ng.iracing.com/web/*`

If the extension is loaded correctly, the custom iRefined UI should appear on supported pages.

## 🎛️ Default Settings

Enabled by default:

- Test Drive session sharing buttons
- Hosted/League session tools
- Queue system for future sessions
- Queue register sound
- Join button displays session type
- Dashboard financial widget, compact and hidden by default

Disabled by default:

- Prompt for car when queueing
- Re-queue displaced registration
- No notifications
- Auto close notifications
- Hide sidebars
- Collapse menu
- Show log messages

Default numeric values:

- notification auto-close timeout: `5` seconds
- queue sound volume: `65%`

## 🏁 How The Main Flows Work

### Official series

On supported Official `Go Racing` pages, the extension can:

- show a browser-side `Register` button
- switch that button to `Withdraw` when the browser-managed registration is active
- show a green registration banner at the top
- queue race and qualifying sessions
- register practice sessions directly when the site exposes a registerable practice session

When the top session is open for registration, the top card keeps the direct `Register` or `Withdraw` action. The upcoming race session list can still show `Queue` for that same session, so a user can choose between registering immediately or leaving it queued.

If a queued session reaches the registration window:

- the extension tries to withdraw the current session first
- then it sends the new register request
- then it plays the configured queue sound

With `Re-queue displaced registration` enabled, the previous registration can be kept queued after the extension switches you into the newer queued session. This setting is off by default because it is intentionally more aggressive.

### Queue behavior

Queue is meant for supported Official race and qualifying sessions.

Typical flow:

1. Open a supported series page
2. Choose your car if needed
3. Click a `Queue` button
4. Leave the tab open, or come back later
5. When the queued session becomes registerable, the extension moves it into `Register now`
6. The extension attempts the withdraw/register switch automatically

Important notes:

- queue depends on the site still exposing the session and registration data the extension expects
- queue is safest when the series page can still resolve a real session id
- if you are already registered elsewhere, queue will try to withdraw that session before sending the new register request
- `Currently Racing` intentionally does not show queue buttons

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

### Dashboard Spend Widget

On the main `members-ng` dashboard, V3 adds a compact `Budget Snapshot`.

Default behavior:

- the widget is enabled
- the widget starts compact
- values are hidden
- rotating curiosities are hidden

Click `Reveal` to show financial values. Click `Expand` to see total content spend and pending catalog value. Click `Order History` to sync real paid totals from the legacy members account page.

The dashboard can estimate owned and missing content from the current shop catalog. Real paid totals, hosted sessions, subscriptions, gifts, credits, and date filters require the Order History sync.

### Privacy

The V3 financial tools are local browser helpers.

Stored local data is limited to:

- iRefined settings
- queue state and selected car preferences
- update-check cache
- sanitized purchase/category summaries
- catalog ownership/cost summaries

The extension does not intentionally store passwords, auth tokens, e-mail addresses, order numbers, or raw invoice HTML. The financial widget can be disabled entirely from the iRefined settings panel.

## 🧪 Recommended Session Reuse Workflow

If your goal is to preserve a setup you like and keep coming back to it later, this is the easiest pattern:

1. Export the `session.json` for the session you want to preserve
2. Create a Hosted race with any valid future date
3. Import that `session.json`
4. Let the wizard repopulate the session details and embedded weather automatically
5. Schedule that Hosted race for the future
6. Reuse that Hosted setup later whenever you want a known-good configuration

Why people like this workflow:

- 🧱 you build the session once
- 🌦️ the weather is already embedded inside the exported session config
- 🔁 it becomes much easier to recreate the same test/setup environment later
- 🖥️ it plays nicely with workflows that still bounce through the local iRacing UI for Test Drive or checks

## 🩺 Logs And Troubleshooting

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

## 🐞 How To Report A Useful Issue

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

## 📝 Issue Templates

GitHub issue templates are included in `.github/ISSUE_TEMPLATE`.

Use:

- `bug_report.md` for broken behavior
- `feature_request.md` for new ideas

## 🛠️ Development

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

## 💡 Notes For Users

- If the site DOM changes, selectors may need to be updated.
- If iRacing changes their backend behavior, register/withdraw helpers may stop working.
- If a feature depends on the site exposing a button or session id, the extension cannot invent that data on its own.
- If audio does not play for queue notifications, interact with the page once first so the browser can unlock audio playback.

## 📦 Current Repository Scope

This repository only keeps the browser-extension-focused code that is actually used by this fork.

Removed from this fork:

- the old launcher flow
- desktop-only injection plumbing
- monitored browser artifacts
- local test traces and generated junk

That is intentional.

## Version Changelog

Detailed per-version changelog files live in `changelogs/`.

### V5.1 Release

V5.1 is a focused hotfix on top of V5.

Main changes since V5:

- Fixes `Budget Snapshot` losing synced Order History data after returning to the dashboard.
- Keeps synced dashboard budget data available while the same dashboard tab session remains alive.
- Prevents empty temporary bridge reads from replacing a valid synced summary with an empty state.
- Removes unload-time dashboard cleanup that could discard the per-tab sync token during normal navigation to Order History.
- Keeps the existing privacy model: budget values stay hidden until `Reveal`, visible state remains tab-scoped, and the temporary Order History bridge copy is removed after the dashboard reads it.

### V5 Release

V5 is a release built from the stable V4.1 line while treating V2 as the functional baseline for Official registration, withdraw, and queue behavior.

Main changes compared with V2:

- Keeps the V2 Official workflow: direct `Register` / `Withdraw`, race queue, qualifying queue, practice register when exposed by the site, `(R)` / `(Q)` queue-bar labels, and displaced-registration handling.
- Adds the V3/V4 dashboard layer: private `Budget Snapshot`, Order History analysis, content catalog estimates, richer financial curiosities, and compact/expanded dashboard widgets.
- Adds the V4 `Intelligence Center` for compact member progress, anniversary, activity, streak, member-since, awards, credits, license snapshots, and recent events.
- Adds a more visible registered-session banner with a live `Starts in ...` countdown for the active registration.
- Tightens the `Budget Snapshot` privacy model: dashboard values stay hidden, Order History sync is required before values unlock, and synced data is scoped to the active dashboard tab session.
- Fixes V5 regressions found during testing around main-card `Withdraw`, current-session queue placement, and `Queue for the next race` behavior.
- Removes the inactive direct car-manual setting/runtime hook because the toggle was not reliably controlling the feature.

Privacy notes for V5:

- The extension still uses only the `storage` permission.
- Order History summaries are sanitized before use and do not intentionally retain order numbers, names, e-mails, tokens, credentials, or raw invoice HTML.
- The temporary Order History bridge now uses a dashboard-session key. After the dashboard reads a synced summary, it removes that bridge copy and keeps the visible widget state in tab session storage.
- Financial values and curiosities remain hidden until the user clicks `Reveal`.

### V4.1 Release

V4.1 is a refinement release on top of V4.

Main changes since V4:

- Expanded the local `Budget Snapshot` curiosity bank substantially.
- Expanded the `Order History` curiosity pool so date-range analysis gets much richer real-world comparisons.
- Added many more local comparison references spanning:
  - race entries
  - track nights
  - karting
  - fuel
  - tires
  - brake parts
  - safety gear
  - travel and garage costs
  - coaching
  - sim hardware
- Reworked the extension's global page scanning to be mutation-driven with a lighter fallback.
- Reduced repeated DOM work while the tab is hidden for several dashboard and page helpers.
- Prevented duplicate refresh intervals in the improved join-button helper.

V4.1 does not change the queue/register feature scope. It is mainly a content and efficiency update.

### V4 Release

V4 adds a second generation of dashboard tools while keeping the browser-only scope intact.

Main changes since V3:

- Added a dashboard `Intelligence Center` focused on member progress, anniversary timing, recent 30-day activity, streaks, awards, participation credits, license snapshots, and recent events.
- The `Intelligence Center` opens compact by default and can be expanded with `Expand` / `Compact`.
- Added direct official car `Manual` links on supported shop and licensed-content car cards.
- Added automatic one-time dashboard refresh behavior per tab session for the dashboard widgets so the page does not keep re-syncing repeatedly while open.
- Kept the `Budget Snapshot` private by default and reduced its footprint to work better beside the new dashboard panel.
- Improved update discoverability and kept the in-page GitHub release check flow.

Privacy notes for V4:

- The extension still uses only the minimal `storage` permission.
- Order History purchase summaries remain sanitized before storage and do not intentionally keep order numbers, names, e-mails, tokens, credentials, or raw invoice HTML.
- Dashboard runtime widget state now prefers per-tab session persistence for compact/expanded state and one-time refresh behavior.
- No hardcoded secrets or personal account credentials are intentionally stored by the V4 dashboard tools.

### V2 Release

V2 focused on making the browser-side Official session workflow easier to use from the iRacing `members-ng` pages.

Main changes since V1:

- Added race queue buttons to upcoming race rows, including rows that use the native `View in iRacing` action.
- Added queue support for qualifying sessions.
- Kept the top session card as the direct `Register` or `Withdraw` action while still allowing the same open session to be queued from the upcoming sessions area.
- Added a clearer `Race Queue` area with upcoming race session buttons.
- Hid the top-card `View in iRacing` button in registerable, registered, and not-yet-open states so the primary action is easier to understand.
- Replaced `Register unavailable` with `Queue for the next race` when no valid direct registration action is available yet.
- Removed queue buttons from `Currently Racing`; that view keeps the native `View in iRacing` behavior.
- Added direct `Register` for practice sessions only when the site exposes a valid registerable practice session id.
- Improved registration state refresh after browser-side register and withdraw actions.
- Added smarter queue handoff: if a queued session becomes registerable while you are already registered somewhere else, the extension withdraws the current registration before registering the queued session.
- Added the advanced `Re-queue displaced registration` setting, disabled by default. When enabled, a displaced existing registration can be kept queued after switching into a nearer queued session.

Critical fixes already rolled into this V2 release:

- Restored the queue registration flow for race and qualify sessions when the site exposes a session id before the automatic 5-minute register window.
- Synced the bottom queue bar countdown with the main `Next Race` countdown so both timers use the same clock reference.
- Fixed local withdraw from the top status bar so the main central action updates immediately after the withdraw request.
- Fixed session row deduplication so some users no longer see only a single future race when iRacing reuses a raw `session_id`.
- Added `(R)` and `(Q)` markers in the queue bar so scheduled race and qualify items are easy to distinguish.
