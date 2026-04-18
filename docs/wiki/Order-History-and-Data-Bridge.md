# Order History and Data Bridge

This is one of the most important implementation areas in the project because it is where the extension turns iRacing account history into dashboard-friendly financial summaries.

## Files Involved

- `extension/public/account-main.js`
- `extension/public/bridge.js`
- `extension/src/helpers/bridge-storage.js`
- `extension/src/helpers/purchase-analytics.js`
- `extension/src/features/purchase-summary.js`

## Why a Bridge Exists

The Order History analyzer runs in page context on the legacy `membersite/account` page. The dashboard widget lives on `members-ng`. The extension needs a safe way to move only the necessary derived summary across those contexts.

The bridge exists to do exactly that and nothing broader.

## Bridge Rules

`public/bridge.js` only allows a small set of keys:

- `iref_purchase_history_summary`
- `iref_missing_content_summary`
- `iref_purchase_history_summary::<session-id>`

This means page-world scripts cannot use the bridge as a generic arbitrary storage tunnel.

## Order History Analyzer Responsibilities

`public/account-main.js` is responsible for:

- scanning the visible order rows
- reading adjustment rows
- fetching order-detail pages when a deeper classification is needed
- categorizing content, hosted, subscriptions, gifts, credits, and similar buckets
- building the derived summary consumed by the dashboard
- publishing that summary through the bridge

## Dashboard Session Keys

The dashboard uses session-scoped handoff keys to avoid mixing multiple dashboard tabs.

That design helps:

- keep each dashboard tab independent
- reduce accidental stale cross-tab reuse
- preserve privacy expectations

## Why This Design Is Safer Than Parsing Everything on the Dashboard

- the heavy parsing stays on Order History
- the dashboard receives a reduced summary, not raw invoice HTML
- storage is restricted to a controlled key list

## Known Behavior Notes

- real spend appears only after Order History has been visited and synced
- current catalog estimation can still work without Order History
- the widget intentionally keeps visible financial state hidden until the user reveals it
