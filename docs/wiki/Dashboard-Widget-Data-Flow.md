# Dashboard Widget Data Flow

This page documents the two dashboard widgets and the data pipelines behind them.

The dashboard widgets are:

- `Budget Snapshot`
- `Intelligence Center`

## Shared Dashboard Layout

Both widgets are anchored through the shared dashboard row helper:

- `extension/src/helpers/dashboard-widget-row.js`
- `extension/src/features/dashboard-widget-row.css`

## Budget Snapshot: End-to-End Flow

Main files:

- `extension/src/features/purchase-summary.js`
- `extension/src/helpers/purchase-analytics.js`
- `extension/src/helpers/price-curiosities.js`
- `extension/public/account-main.js`
- `extension/public/bridge.js`

### Boot Sequence

When the dashboard opens:

1. `purchase-summary.js` checks whether the page is the dashboard
2. it creates or restores a per-tab dashboard session token
3. it restores tab-scoped widget state from `sessionStorage`
4. it tries to load any synced Order History summary from the bridge
5. it tries to refresh the current missing-content catalog summary
6. it renders the widget hidden by default

### Per-Tab Session Model

The widget uses these keys:

- `iref_dashboard_purchase_state_v2`
- `iref_dashboard_purchase_session_token_v1`
- `iref_dashboard_purchase_autorefreshed_v2`

### Order History Sync Flow

When the user clicks the Order History action:

1. the widget opens Order History with the dashboard session id
2. `account-main.js` parses and classifies the page
3. it writes the derived summary to a session-scoped bridge key
4. the dashboard widget reads that summary back
5. after reading it, the widget clears the bridge copy
6. the dashboard keeps the useful state in `sessionStorage`

### Missing Content / Catalog Estimate Flow

The widget also estimates owned and missing content value from the current catalog.

`purchase-analytics.js`:

1. opens hidden iframes for unowned cars and unowned tracks
2. reads React pageData from those shop pages
3. collapses duplicate package ids
4. computes owned count, missing count, owned current catalog value, and remaining cost

This is a current-price estimate, not a historical receipt reconstruction.

### UI States

The widget has several overlapping states:

- hidden/private
- compact
- expanded
- sync required
- loading stored analytics
- refreshing catalog

The hidden/private state is the default.

### Curiosity Flow

The rotating comparison text comes from:

- `helpers/price-curiosities.js`

The widget only shows curiosity text when:

- the financial data is revealed
- the Order History sync is available
- enough values exist to build a meaningful comparison

## Intelligence Center: End-to-End Flow

Main files:

- `extension/src/features/intelligence-center.js`
- `extension/src/helpers/intelligence-analytics.js`
- `extension/src/helpers/membership-analytics.js`
- `extension/src/helpers/car-manuals.js`

### Snapshot Assembly

`getIntelligenceSnapshot(force)` is the main entry point.

It assembles a snapshot from several sources:

- member profile
- participation credits
- awards
- recent events/schedule data
- membership/account info summary
- owned car and track catalog pages

### Cache Model

`intelligence-analytics.js` keeps:

- `cachedSnapshot`
- `cachedSnapshotAt`
- `pendingSnapshotPromise`

Freshness window:

- `snapshotFreshMs = 5 minutes`

### Membership Summary Integration

The intelligence flow reads the membership summary first through:

- `getStoredMembershipSummary()`

If that summary is stale, it refreshes it with:

- `syncMembershipSummary({ persist: false })`

### Catalog Intelligence

The intelligence helper also inspects:

- owned cars page
- owned tracks page

This is where it can enrich owned-content views and car manual references.

### UI Modes

The Intelligence Center intentionally supports:

- compact mode
- expanded mode

Compact mode highlights:

- member anniversary
- 30 day activity
- streak
- member since / last login context

Expanded mode adds:

- license snapshot
- participation credits
- recent awards
- recent events

## Practical Maintenance Notes

The dashboard widgets are most sensitive to:

- dashboard anchor layout changes
- React pageData shape changes on catalog pages
- Order History markup changes
- members-ng endpoint response changes
