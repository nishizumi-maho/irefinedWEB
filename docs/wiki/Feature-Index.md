# Feature Index

This page is the feature-level map of the extension.

## Core Runtime Features

| Feature ID | File | Default | Purpose |
| --- | --- | --- | --- |
| `status-bar` | `extension/src/features/status-bar.jsx` | Always on | Top/bottom iRefined status UI, current registration state, queue quick actions, countdowns |
| `update-notice` | `extension/src/features/update-notice.js` | Always on | GitHub release update detection and in-page update notice |
| `settings-panel` | `extension/src/features/settings-panel.jsx` | Always on | User-facing settings UI, update info, queue sound controls |
| `go-racing-export` | `extension/src/features/go-racing-export.js` | Always on | Export helpers on Go Racing pages |

## Session / Registration Features

| Feature ID | File | Default | Purpose |
| --- | --- | --- | --- |
| `auto-register` | `extension/src/features/auto-register.js` | On | Queue, register, withdraw, current-session actions, timing logic, queue persistence |
| `better-join-button` | `extension/src/features/better-join-button.js` | On | Improves join/watch/spot style buttons where the page exposes the needed actions |

## Dashboard Features

| Feature ID | File | Default | Purpose |
| --- | --- | --- | --- |
| `dashboard-purchase-summary` | `extension/src/features/purchase-summary.js` | On | Budget Snapshot widget with hidden-by-default financial data |
| `dashboard-intelligence-center` | `extension/src/features/intelligence-center.js` | On | Intelligence Center widget for member progress and account summary |

## Session Sharing / Export Features

| Feature ID | File | Default | Purpose |
| --- | --- | --- | --- |
| `share-test-session` | `extension/src/features/share-test-session.jsx` | On | Test Drive sharing helpers |
| `share-hosted-session` | `extension/src/features/share-hosted-session.jsx` | On | Hosted and League import/export helpers |

## UI Tweaks

| Feature ID | File | Default | Purpose |
| --- | --- | --- | --- |
| `no-toasts` | `extension/src/features/no-toasts.js` | Off | Hides iRacing toast notifications |
| `auto-close-toasts` | `extension/src/features/auto-close-toasts.js` | Off | Automatically closes toasts after a configurable timeout |
| `no-sidebars` | `extension/src/features/no-sidebars.js` | Off | Hides sidebars and expands central layout |
| `collapse-menu` | `extension/src/features/collapse-menu.js` | Off | Collapses the racing sidebar footprint |
| `logger` | `extension/src/features/logger.js` | Off | Shows inline log output for troubleshooting |

## Catalog / Content Helpers

| Feature ID | File | Default | Purpose |
| --- | --- | --- | --- |
| `catalog-manual-links` | `extension/src/features/catalog-manual-links.js` | Not imported in `main.js` on the stable 5.1 line | Adds direct car manual links where supported |

## Supporting CSS Modules

Most features have a paired CSS file. Those style sheets are imported by the feature module and bundled into `extension.css`.

Common pattern:

- `feature-name.js` or `.jsx` contains the logic
- `feature-name.css` contains the presentation layer

## Non-Feature Runtime Files

These are not user-toggleable features, but they are still core parts of the system:

- `helpers/websockets.js`
- `helpers/react-resolver.js`
- `helpers/dom-observer.js`
- `helpers/settings.js`
- `helpers/updates.js`
- `helpers/sound.js`
- `public/bridge.js`
- `public/account-main.js`

## Stable Feature Scope in V5.1

The stable V5.1 line includes:

- official race register/withdraw helpers
- race and qualifying queue
- practice register where the page exposes valid practice registration data
- hosted/league export-import helpers
- dashboard Budget Snapshot
- dashboard Intelligence Center
- update notifications
- UI quality-of-life toggles
