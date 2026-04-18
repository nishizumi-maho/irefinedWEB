# Feature Index

This page is the feature-level map of the extension.

## Core Runtime Features

| Feature ID | File | Default | Main Page Target | Purpose |
| --- | --- | --- | --- | --- |
| `status-bar` | `extension/src/features/status-bar.jsx` | Always on | members-ng pages with the iRefined bar | renders the registration banner and queue bar |
| `update-notice` | `extension/src/features/update-notice.js` | Always on | all members-ng pages with the iRefined bar | GitHub release update detection and popup/button notice |
| `settings-panel` | `extension/src/features/settings-panel.jsx` | Always on | all members-ng pages | user-facing settings UI and update note |
| `go-racing-export` | `extension/src/features/go-racing-export.js` | Always on | Go Racing and session listing pages | JSON export helpers for official, hosted, league, and weather contexts |

## Session / Registration Features

| Feature ID | File | Default | Main Page Target | Purpose |
| --- | --- | --- | --- | --- |
| `auto-register` | `extension/src/features/auto-register.js` | On | official series pages | queue, register, withdraw, current-session actions, timing logic, queue persistence |
| `better-join-button` | `extension/src/features/better-join-button.js` | On | pages with native join/watch style actions | improves join/watch/spot style buttons where the page exposes the needed actions |

## Dashboard Features

| Feature ID | File | Default | Main Page Target | Purpose |
| --- | --- | --- | --- | --- |
| `dashboard-purchase-summary` | `extension/src/features/purchase-summary.js` | On | dashboard | Budget Snapshot widget with hidden-by-default financial data |
| `dashboard-intelligence-center` | `extension/src/features/intelligence-center.js` | On | dashboard | Intelligence Center widget for member progress and account summary |

## Session Sharing / Export Features

| Feature ID | File | Default | Main Page Target | Purpose |
| --- | --- | --- | --- | --- |
| `share-test-session` | `extension/src/features/share-test-session.jsx` | On | Test Drive | Test Drive sharing helpers |
| `share-hosted-session` | `extension/src/features/share-hosted-session.jsx` | On | Hosted and League create-race wizard | Hosted and League import/export helpers |

## UI Tweaks

| Feature ID | File | Default | Main Page Target | Purpose |
| --- | --- | --- | --- | --- |
| `no-toasts` | `extension/src/features/no-toasts.js` | Off | members-ng pages with toast notifications | hides iRacing toast notifications |
| `auto-close-toasts` | `extension/src/features/auto-close-toasts.js` | Off | members-ng pages with toast notifications | automatically closes toasts after a configurable timeout |
| `no-sidebars` | `extension/src/features/no-sidebars.js` | Off | wide members-ng layouts | hides sidebars and expands central layout |
| `collapse-menu` | `extension/src/features/collapse-menu.js` | Off | pages with the left menu | collapses the racing sidebar footprint |
| `logger` | `extension/src/features/logger.js` | Off | all members-ng pages | shows inline log output for troubleshooting |

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

## Deep-Dive References

Use these pages when the file list above is not enough:

- [Runtime Boot and Integration](Runtime-Boot-and-Integration)
- [Official Workflow Deep Dive](Official-Workflow-Deep-Dive)
- [Dashboard Widget Data Flow](Dashboard-Widget-Data-Flow)
- [Helper Modules Reference](Helper-Modules-Reference)

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
