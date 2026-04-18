# Settings and Storage

This page documents the main settings surface and the storage model used by the extension.

## Why Multiple Storage Layers Exist

The project uses more than one storage layer because the data has different lifetimes and sensitivity levels.

- `localStorage`: long-lived browser-side settings and lightweight cache values
- `sessionStorage`: per-tab dashboard state that should disappear when that tab session ends
- `chrome.storage.local`: extension-owned storage exposed through a narrow bridge for the page-world scripts that cannot directly call extension APIs

## User Settings

The default settings live in `extension/src/helpers/settings.js`.

| Setting key | Default | Purpose |
| --- | --- | --- |
| `share-test-session` | `true` | Enables Test Drive sharing helpers |
| `share-hosted-session` | `true` | Enables Hosted and League session import/export helpers |
| `auto-register` | `true` | Enables official register, withdraw, and queue helpers |
| `queue-car-prompt` | `false` | Enables the car-selection prompt where queue flow supports it |
| `queue-requeue-displaced-registration` | `false` | Lets a displaced registration be re-queued after switching into a nearer queued session |
| `queue-register-sound` | `true` | Plays the queue success sound after a successful registration |
| `queue-register-sound-volume` | `65` | Queue sound volume percentage |
| `better-join-button` | `true` | Enables enhanced join/watch/spot button behavior where the site exposes it |
| `dashboard-intelligence-center` | `true` | Enables the Intelligence Center widget |
| `dashboard-purchase-summary` | `true` | Enables the Budget Snapshot widget |
| `no-toasts` | `false` | Hides iRacing toast notifications |
| `auto-close-toasts` | `false` | Closes toast notifications automatically |
| `toast-timeout-s` | `5` | Seconds before auto-closed toasts are dismissed |
| `no-sidebars` | `false` | Hides sidebars and lets the main content use more width |
| `collapse-menu` | `false` | Collapses the left-side menu footprint |
| `logger` | `false` | Shows the inline debug log panel |

## Main `localStorage` Keys

The extension uses `localStorage` for long-lived browser-side state.

Common keys:

- `iref_settings`: user feature settings
- `iref_release_info`: cached GitHub release check result
- queue and registration-related keys managed by the session tooling

The queue system intentionally persists browser-side so the user can move between series pages without losing queued items.

## Main `sessionStorage` Keys

The budget widget intentionally keeps sensitive visible state inside the current tab session.

Current purchase-summary keys include:

- `iref_dashboard_purchase_state_v2`
- `iref_dashboard_purchase_session_token_v1`
- `iref_dashboard_purchase_autorefreshed_v2`

This lets the dashboard keep synced data while the tab stays alive without turning it into durable long-term storage.

## `chrome.storage.local` Bridge Keys

The bridge storage is deliberately restricted to a small allowlist.

Common keys:

- `iref_purchase_history_summary`
- `iref_missing_content_summary`
- `iref_membership_summary`
- `iref_purchase_history_summary::<session-id>`

The page-world scripts do not receive open-ended storage access.

## Settings Lifecycle

1. `helpers/settings.js` loads settings from `localStorage`
2. `feature-manager.js` merges them with defaults
3. feature modules start or stop based on the resulting state
4. the settings panel writes the updated values back into `localStorage`

## Why This Matters

This storage split is one of the main reasons the project stays manageable:

- persistent preferences stay simple
- dashboard financial visibility stays private by default
- page-world parsing stays behind a narrow storage bridge
