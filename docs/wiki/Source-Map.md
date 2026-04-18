# Source Map

This page is a practical map of where the important code lives.

## Repository Root

| Path | Purpose |
| --- | --- |
| `README.md` | concise repository entry point |
| `CHANGELOG.md` | root historical changelog |
| `docs/` | repository-side documentation |
| `extension/` | browser extension source, build config, and package metadata |

## `.github/`

| Path | Purpose |
| --- | --- |
| `.github/workflows/extension.yml` | build validation workflow |
| `.github/workflows/release.yml` | release packaging workflow |
| `.github/workflows/wiki-sync.yml` | publishes `docs/wiki/` to the GitHub wiki |

## `docs/`

| Path | Purpose |
| --- | --- |
| `docs/README.md` | documentation index |
| `docs/changelogs/` | version-specific release notes |
| `docs/research/` | deeper analysis/reference documents |
| `docs/wiki/` | versioned wiki source pages |

## `extension/public/`

| Path | Purpose |
| --- | --- |
| `manifest.json` | extension manifest and content-script entry declarations |
| `bridge.js` | narrow storage bridge for page-world scripts |
| `account-main.js` | Order History parsing and derived financial summary generation |

## `extension/src/`

| Path | Purpose |
| --- | --- |
| `main.js` | browser entry point that loads features |
| `feature-manager.js` | feature registry and enable/disable orchestration |

## `extension/src/features/`

| Path | Purpose |
| --- | --- |
| `status-bar.jsx` | visible iRefined bar and current session/queue UI |
| `auto-register.js` | register, withdraw, queue, and queue handoff logic |
| `better-join-button.js` | join/watch/spot button improvements where supported |
| `settings-panel.jsx` | settings UI and update information |
| `update-notice.js` | GitHub release update detection |
| `purchase-summary.js` | Budget Snapshot widget |
| `intelligence-center.js` | Intelligence Center widget |
| `share-hosted-session.jsx` | Hosted/League import-export helpers |
| `share-test-session.jsx` | Test Drive sharing helpers |
| `go-racing-export.js` | Official session export helpers |
| `no-toasts.js` | hide toasts tweak |
| `auto-close-toasts.js` | auto-close toasts tweak |
| `no-sidebars.js` | sidebar suppression tweak |
| `collapse-menu.js` | menu collapse tweak |
| `logger.js` | inline debug log panel |

## `extension/src/helpers/`

| Path | Purpose |
| --- | --- |
| `settings.js` | default settings and local persistence |
| `dom-observer.js` | mutation-based feature activation |
| `react-resolver.js` | React prop/state resolution from DOM nodes |
| `websockets.js` | websocket-assisted live state refresh behavior |
| `updates.js` | release checking helpers |
| `sound.js` | queue notification sound helpers |
| `bridge-storage.js` | safe accessors for the page bridge keys |
| `purchase-analytics.js` | purchase summary loading, refresh, and estimates |
| `price-curiosities.js` | rotating financial curiosity generator |
| `dashboard-widget-row.js` | shared dashboard widget row anchoring |
| `intelligence-analytics.js` | dashboard and activity intelligence helpers |
| `membership-analytics.js` | membership/account summary helpers |
| `download.js` | browser download helpers |
| `json-safe.js` | safe JSON parsing/formatting helpers |
| `weather-import.js` | session weather normalization during import |
| `car-manuals.js` | manual lookup data for supported car cards |

## Styling

Most features have a sibling CSS module in `extension/src/features/`.

Pattern:

- logic in `feature-name.js` or `feature-name.jsx`
- styling in `feature-name.css`

The bundle process rolls those styles into the extension stylesheet delivered to the target pages.
