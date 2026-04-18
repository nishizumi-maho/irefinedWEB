# Helper Modules Reference

This page is a concentrated reference for the helper modules that most feature files depend on.

## `helpers/settings.js`

Responsibilities:

- define default settings
- load settings from `localStorage`
- persist settings back to `localStorage`

## `helpers/dom-observer.js`

Despite its name, this module currently uses a polling loop rather than a MutationObserver.

Behavior:

- maintains a list of watched selectors
- checks them every `300ms`
- toggles the feature body class
- calls the feature callback when the selector appears or disappears

## `helpers/react-resolver.js`

Responsibilities:

- walk `__reactFiber*` references from DOM nodes
- recover `memoizedProps`
- recover component state holders
- expose convenience helpers like `findProps` and `findState`

## `helpers/websockets.js`

Responsibilities:

- wait for the iRacing release identifier from the page
- connect websocket clients to members-ng and client.io
- issue `registration.register` and `registration.withdraw`
- request refresh nudges after registration changes
- collect season/session pushes for light indexing

## `helpers/updates.js`

Responsibilities:

- read the current extension version injected by Vite
- fetch the latest GitHub release metadata
- cache it in `localStorage`
- normalize cached and fetched data against the installed version
- dispatch `iref-update-info`
- open the latest release page

## `helpers/sound.js`

Responsibilities:

- initialize browser audio support when needed
- play the queue success sound
- respect the queue sound enabled/volume settings

## `helpers/download.js`

Responsibilities:

- trigger browser-side downloads for JSON exports

## `helpers/json-safe.js`

Responsibilities:

- deep-clone values into JSON-safe structures
- avoid leaking unserializable or unstable objects into exported payloads

## `helpers/weather-import.js`

Responsibilities:

- normalize imported weather payloads
- merge imported weather into current wizard state safely

## `helpers/bridge-storage.js`

Responsibilities:

- hide the `window.postMessage` bridge details
- expose `bridgeStorageGet`, `bridgeStorageSet`, and `bridgeStorageRemove`
- define the canonical bridge key names

## `helpers/purchase-analytics.js`

Responsibilities:

- load stored Order History summaries
- clear session-scoped purchase summaries after handoff
- collect missing-content summaries from shop pages
- compute owned catalog value
- compute pending content cost
- compute recent spend windows
- open Order History with the dashboard session id

## `helpers/price-curiosities.js`

Responsibilities:

- turn spend values into rotating real-world comparison facts
- maintain curiosity seed rotation

## `helpers/membership-analytics.js`

Responsibilities:

- load the account info page through a hidden iframe
- scrape label/value pairs and React/redux-like data
- normalize membership fields such as member since and next billing
- build the membership summary
- persist it through the bridge

## `helpers/intelligence-analytics.js`

Responsibilities:

- collect the multi-source dashboard intelligence snapshot
- fetch profile, credits, awards, and schedule data
- gather owned content information
- attach car manual references where relevant
- cache the assembled snapshot for a short freshness window
- provide driver search helpers

## `helpers/car-manuals.js`

Responsibilities:

- maintain a lookup of supported iRacing car manuals
- resolve manual links for cars where a manual exists

## `helpers/dashboard-widget-row.js`

Responsibilities:

- give dashboard widgets a shared placement row
- keep widget insertion logic consistent

## Practical Rule

Feature files are mostly UI orchestration. Helper files are where the data contracts and integrations live.
