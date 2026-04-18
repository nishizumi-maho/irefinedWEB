# Runtime Boot and Integration

This page describes how the extension starts, how it integrates with the iRacing website, and which execution contexts are involved.

## The Three Runtime Entry Points

The browser build has three runtime entry points declared in `extension/public/manifest.json`.

### 1. `main.js`

Injected on:

- `https://members-ng.iracing.com/web/*`
- `https://members-ng.iracing.com/web/racing/*`

Execution mode:

- `document_start`
- `world: MAIN`

Purpose:

- boot the website-side runtime
- load the websocket helper
- import and register all feature modules
- attach UI helpers directly inside the live members-ng application

### 2. `bridge.js`

Injected on:

- `members-ng`
- `members.iracing.com/membersite/account/*`

Purpose:

- expose a narrow message-based bridge to `chrome.storage.local`
- allow page-world scripts to read or write only a small allowlisted set of keys

### 3. `account-main.js`

Injected only on:

- `https://members.iracing.com/membersite/account/OrderHistory.do*`

Execution mode:

- `document_idle`
- `world: MAIN`

Purpose:

- parse Order History
- classify spending and gains
- render the Order History summary panel
- publish the derived summary back through the bridge

## Boot Sequence on `members-ng`

The boot sequence is simple and intentionally flat:

1. `main.js` runs.
2. It sets `window.__irefinedLoaded = true`.
3. It imports `helpers/websockets.js`.
4. It imports each feature file.
5. Each feature registers itself with `feature-manager.js`.
6. `feature-manager.js` decides whether that feature is enabled.
7. Enabled features are attached to the DOM observer loop.

This project does not currently use a background service worker to orchestrate state. The behavior is almost entirely page-local.

## Feature Registration Model

`extension/src/feature-manager.js` is the registry.

Each feature registers:

- an `id`
- whether it should be observed
- a selector
- a body class
- a callback

`feature-manager.js` then merges the user settings from `helpers/settings.js` with defaults and decides whether the feature should be active.

These are always treated as core features:

- `settings-panel`
- `status-bar`
- `update-notice`
- `go-racing-export`

Everything else depends on user settings.

## DOM Activation Model

The extension does not currently use a true MutationObserver-based activation layer.

`helpers/dom-observer.js` keeps a watch list and polls every `300ms`.

For each watched selector it:

1. checks whether the selector exists
2. checks whether the feature is enabled
3. adds or removes the feature's body class
4. runs the feature callback on enter/leave

This is lighter than a full custom page re-render loop, but it is still polling, not event-driven.

## Why the Runtime Uses `world: MAIN`

Some parts of the iRacing website expose useful data only through React internals or page-defined globals. Running in the page world makes it easier to:

- inspect React fiber-backed nodes
- read page-owned state directly
- interoperate with page-owned socket behavior and runtime globals

This is especially important for:

- official session data
- wizard state in hosted/league flows
- Order History parsing

## React Integration Strategy

The site is a React application. Several helpers rely on walking React internals from DOM nodes.

`helpers/react-resolver.js` provides:

- `findMemoizedProps`
- `findStateComponent`
- `findProps`
- `findState`

These helpers search upward through `__reactFiber*` references on DOM nodes and recover props or state from nearby React components.

## Network Integration Points

The extension uses several kinds of browser-side network access.

### Websocket integration

`helpers/websockets.js` opens:

- `https://members-ng.iracing.com`
- `https://members-ng.iracing.com/client.io`

It waits for the page's `SENTRY_RELEASE` value, derives the client version, and authenticates with that value.

It is used mainly for:

- registration requests
- withdraw requests
- state refresh hints after those requests
- live season/session data pushes

### JSON fetches and hidden iframes

Analytics helpers fetch members-ng data through BFF/proxy endpoints and also open hidden iframes for pages whose useful state is easiest to read from rendered React props.

Examples:

- member profile
- participation credits
- awards
- season schedule
- account info page
- owned cars page
- owned tracks page
- shop cars page
- shop tracks page

## Runtime Globals Used by the Extension

Important globals include:

- `window.__irefinedLoaded`
- `window.__irefinedBridgeLoaded`
- `window.watchQueue`
- `window.irefPendingWithdrawState`
- `window.irefIndex`

These are internal coordination points, not stable public APIs.

## Custom Events

The update system dispatches:

- `iref-update-info`

Consumers:

- update popup
- toolbar update button
- settings panel update note

## Practical Maintenance Boundary

The main integration points that usually break first after an iRacing UI change are:

- page headings used to locate sections
- React prop shape recovered through `__reactFiber`
- specific button text that drives action detection
- dashboard anchor elements used for widget placement

That is the real maintenance surface of this project.
