# Architecture

## Runtime Model

iRefined Browser is a content-script-driven browser extension. It does not use a background service worker in the current design. The extension works by injecting UI and helper logic directly into the logged-in iRacing website.

## Manifest and Entry Points

The extension manifest lives at `extension/public/manifest.json`.

The three runtime entry points are:

- `main.js`: injected into `members-ng` pages
- `bridge.js`: injected into both `members-ng` and `membersite/account` pages to expose a tightly scoped storage bridge
- `account-main.js`: injected into `OrderHistory.do` for financial parsing and summary generation

## Main Flow

`extension/src/main.js` bootstraps the extension.

It imports:

- the websocket helper
- the feature modules

Each feature registers itself with `feature-manager.js`.

## Feature Registration

`extension/src/feature-manager.js` is the central switchboard.

It:

- stores a registry of features
- reads current settings from `helpers/settings.js`
- decides whether a feature is enabled
- starts the DOM observer-driven feature callback
- can rerun every feature after settings changes

Three features are effectively always-on even when not user-toggleable:

- `settings-panel`
- `status-bar`
- `update-notice`

`go-racing-export` is also forced on in the manager because it is treated as a core tool.

## DOM Observation Model

The project does not use a MutationObserver-based activation layer in the current stable line.

Instead, `helpers/dom-observer.js` keeps a feature watch list and polls selectors every `300ms`.

For each feature it:

- checks whether the selector exists
- checks whether the feature is enabled
- adds or removes the feature body class
- invokes the callback on enter or leave

This is important because the maintenance cost and runtime profile are shaped by that polling loop.

## React Data Access

iRacing uses a React application. Several features need data that is not directly exposed as plain DOM.

`helpers/react-resolver.js` provides utilities such as:

- `findReact`
- `findProps`
- `findMemoizedProps`
- `findStateComponent`

Those helpers walk React internals from live DOM nodes to recover props and state that the page already knows about.

## Persistence Layers

The project uses three storage styles:

### 1. `localStorage`

Used for:

- extension settings
- cached release-check data
- queue persistence and related runtime flags
- per-series selected car choices
- curiosity seed rotation

### 2. `sessionStorage`

Used where per-tab lifetime matters, especially dashboard widget state for the Budget Snapshot.

It is also used for one-tab-only update popup memory.

### 3. `chrome.storage.local`

Used via the bridge on page contexts that need extension storage access from page-world scripts.

This is intentionally scoped to specific keys rather than a general-purpose arbitrary storage bridge.

For a detailed key reference, see [Data Contracts and Storage Keys](Data-Contracts-and-Storage-Keys).

## Financial / Order History Data Path

The financial dashboard path is split deliberately:

1. `purchase-summary.js` renders the dashboard widget
2. `purchase-analytics.js` manages loading/sync helpers
3. `bridge-storage.js` talks to the page bridge
4. `bridge.js` sanitizes allowed keys and proxies storage calls
5. `account-main.js` runs only on Order History, parses orders, computes summaries, and stores a sanitized result

This split keeps the dashboard page small and isolates the heavy Order History parsing to the page that actually exposes the source data.

## Websocket Path

`helpers/websockets.js` is loaded once from `main.js`.

It supports queue and registration-related status refresh behavior used by the session tooling. The extension still depends on what the site exposes; the websocket layer helps keep the UI in sync rather than inventing its own backend.

## Dashboard Layout Model

Dashboard widgets share a common row helper:

- `helpers/dashboard-widget-row.js`
- `features/dashboard-widget-row.css`

This keeps the Budget Snapshot and Intelligence Center visually organized on the dashboard without each widget reinventing layout anchoring.

## Release and Packaging Model

The repo builds a static browser-extension output in `extension/dist/`.

GitHub Actions package the built output into release zips and attach them to GitHub Releases.

## Recommended Companion Pages

This page is the overview. The detailed deep-dive pages are:

- [Runtime Boot and Integration](Runtime-Boot-and-Integration)
- [Official Workflow Deep Dive](Official-Workflow-Deep-Dive)
- [Dashboard Widget Data Flow](Dashboard-Widget-Data-Flow)
- [Helper Modules Reference](Helper-Modules-Reference)
