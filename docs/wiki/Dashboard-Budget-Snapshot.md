# Dashboard Budget Snapshot

The Budget Snapshot is implemented by `extension/src/features/purchase-summary.js`.

Its job is to make iRacing financial analysis available directly on the dashboard while keeping the values private by default.

## Goals

- show recent spend
- estimate owned content value
- estimate remaining content cost
- keep values hidden until the user explicitly reveals them
- avoid keeping long-lived visible financial state outside the current tab session

## Display Modes

The widget supports:

- a compact mode
- an expanded mode
- a hidden/private mode

The private mode is the default visual behavior. This is specifically meant to help users who are streaming or sharing their screen.

## Storage Model

The Budget Snapshot uses `sessionStorage` for its visible widget state because the intended behavior is:

- state persists while the tab session is alive
- state should not become long-lived durable storage by default

Relevant keys include:

- `iref_dashboard_purchase_state_v2`
- `iref_dashboard_purchase_session_token_v1`
- `iref_dashboard_purchase_autorefreshed_v2`

## Data Sources

The widget combines two different sources:

### 1. Real spend data

Pulled from the Order History sync path.

This is what enables:

- real historical spend
- category breakdowns
- recent 30-day spend

### 2. Current catalog estimation

Pulled from the current unowned shop catalog to estimate:

- owned content catalog value
- remaining content cost

This is an estimate based on current catalog pricing, not a reconstruction of the exact historical checkout price for each owned item.

## Privacy Rules

- values stay hidden until `Reveal`
- no remote spend sync service is used
- dashboard state is tab-scoped
- the Order History bridge only permits a small allowed key set

## Supporting Files

- `extension/src/features/purchase-summary.js`
- `extension/src/helpers/purchase-analytics.js`
- `extension/src/helpers/price-curiosities.js`
- `extension/src/helpers/dashboard-widget-row.js`
- `extension/src/helpers/bridge-storage.js`
- `extension/public/bridge.js`
- `extension/public/account-main.js`

## Why It Is Split Across Multiple Files

This feature is intentionally decomposed because the dashboard page and Order History page expose different pieces of data.

- dashboard UI logic lives in `purchase-summary.js`
- analytics helpers live in `purchase-analytics.js`
- curiosity generation lives in `price-curiosities.js`
- page-world parsing of Order History lives in `account-main.js`

That separation keeps the dashboard responsive while still allowing deeper analysis when the user visits Order History.
