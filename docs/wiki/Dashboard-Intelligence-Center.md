# Dashboard Intelligence Center

The Intelligence Center is implemented by `extension/src/features/intelligence-center.js`.

It is the member/account progress widget for the dashboard.

## Main Goals

- show a compact summary by default
- highlight member anniversary timing
- show recent activity and streak information
- surface account and profile snapshots already exposed by iRacing

## Current Snapshot Content

Depending on what iRacing exposes, the widget can surface:

- member-since information
- member anniversary timing
- 30-day activity summary
- streak information
- last login style metadata
- license and participation-credit-related information
- selected recent events or account indicators

## Data Sources

The Intelligence Center mainly depends on:

- `helpers/intelligence-analytics.js`
- `helpers/membership-analytics.js`

Those helpers gather dashboard data using existing iRacing endpoints and the account info page.

## Freshness Model

The Intelligence Center tries to avoid unnecessary repeated refreshes while the page is open.

It uses freshness checks and cached summaries where appropriate, then syncs again only when the existing information is stale enough to justify it.

## Anniversary Logic

The widget contains explicit anniversary logic:

- it calculates days to the next membership anniversary
- it can show a special same-day anniversary message
- it formats the anniversary information into user-facing cards/alerts

## Supporting Files

- `extension/src/features/intelligence-center.js`
- `extension/src/helpers/intelligence-analytics.js`
- `extension/src/helpers/membership-analytics.js`
- `extension/src/helpers/dashboard-widget-row.js`

## Scope Boundaries

This feature is strictly informational.

It does not create registrations, change iRacing account state, or write to external services. It only turns exposed account/profile data into a more useful dashboard view.
