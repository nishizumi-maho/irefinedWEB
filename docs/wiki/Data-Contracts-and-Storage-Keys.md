# Data Contracts and Storage Keys

This page collects the extension's important storage keys, runtime globals, and message contracts in one place.

## `localStorage` Keys

### Settings

| Key | Producer | Consumer | Purpose |
| --- | --- | --- | --- |
| `iref_settings` | `helpers/settings.js` | `feature-manager.js`, settings panel, all feature toggles | persistent user settings |

### Official workflow

| Key | Producer | Consumer | Purpose |
| --- | --- | --- | --- |
| `iref_watch_queue` | `auto-register.js` | `auto-register.js`, `status-bar.jsx` | persisted queue list |
| `iref_registration_state` | `auto-register.js` | `auto-register.js`, `status-bar.jsx` | current browser-managed registration state |
| `selected_car_season_<contentId>` | `auto-register.js` | `auto-register.js` | saved per-series car choice |

### Update system

| Key | Producer | Consumer | Purpose |
| --- | --- | --- | --- |
| `iref_release_info` | `helpers/updates.js` | update notice, settings panel | cached GitHub release check result |

### Curiosity rotation

| Key pattern | Producer | Consumer | Purpose |
| --- | --- | --- | --- |
| `iref_curiosity_seed_<scope>` | `price-curiosities.js`, `account-main.js` | budget widget, Order History summary panel | rotate curiosity/fact variants |

## `sessionStorage` Keys

### Dashboard purchase widget

| Key | Purpose |
| --- | --- |
| `iref_dashboard_purchase_state_v2` | persisted tab-scoped Budget Snapshot state |
| `iref_dashboard_purchase_session_token_v1` | dashboard tab identity used for Order History handoff |
| `iref_dashboard_purchase_autorefreshed_v2` | one-time refresh guard for the widget |

### Update popup

| Key | Purpose |
| --- | --- |
| `iref_update_popup_seen_tag` | prevents repeating the same popup in the same tab session |

## `chrome.storage.local` Keys

These keys are available only through the restricted bridge.

| Key | Purpose |
| --- | --- |
| `iref_purchase_history_summary` | generic purchase summary |
| `iref_missing_content_summary` | current catalog ownership/missing-content summary |
| `iref_membership_summary` | membership/account summary |
| `iref_purchase_history_summary::<session-id>` | dashboard-tab-scoped Order History handoff |

## Queue Item Contract

Queue items are written to `iref_watch_queue` as an array of objects with the following shape:

- `car_id`
- `car_class_id`
- `car_name`
- `event_type`
- `event_type_name`
- `season_id`
- `season_name`
- `start_time`
- `start_label`
- `track_name`
- `source_path`
- `source_url`
- `created_at`
- `last_attempt_at`
- `last_found_at`
- `registration_open`
- `status`
- `session_id`
- `subsession_id`

Expected `status` values:

- `queued`
- `found`
- `registering`

## Registration State Contract

The browser-managed registration snapshot written to `iref_registration_state` includes fields such as:

- `status`
- `source`
- `confirmed_by_site`
- `season_id`
- `season_name`
- `car_id`
- `car_class_id`
- `car_name`
- `event_type`
- `event_type_name`
- `session_id`
- `subsession_id`
- `start_time`
- `start_label`
- `track_name`
- `source_path`
- `source_url`
- `registered_at`
- `updated_at`

## Bridge Message Contract

`bridge-storage.js` and `bridge.js` communicate through `window.postMessage`.

### Request source

- `irefined-bridge-request`

### Response source

- `irefined-bridge-response`

### Supported actions

- `storage-get`
- `storage-set`
- `storage-remove`

Everything else is rejected.

## Runtime Globals

Important runtime globals created or consumed by the extension include:

| Global | Purpose |
| --- | --- |
| `window.__irefinedLoaded` | marker that the main website runtime was loaded |
| `window.__irefinedBridgeLoaded` | marker that the bridge runtime was loaded |
| `window.watchQueue` | in-memory queue copy mirrored to localStorage |
| `window.irefPendingWithdrawState` | short-lived optimistic withdraw marker |
| `window.irefIndex` | small in-memory season index learned from websocket session pushes |

## Custom Browser Events

| Event | Producer | Consumer |
| --- | --- | --- |
| `iref-update-info` | `helpers/updates.js` | update popup, update toolbar button, settings update notice |

## Why This Page Exists

Most bugs in this repository are state bugs:

- stale queue state
- stale dashboard state
- stale update cache
- mismatched bridge keys

Keeping these contracts documented reduces that class of bug.
