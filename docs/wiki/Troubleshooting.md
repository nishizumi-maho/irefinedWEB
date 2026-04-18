# Troubleshooting

This page covers the common failure modes for the browser-side extension.

## First Checks

Before debugging anything deeper, verify:

1. the extension is loaded in the browser and enabled
2. the extracted folder still exists on disk
3. the current page is on `members-ng.iracing.com`
4. the browser extension has been reloaded after updating files
5. the user is logged into iRacing

## If a Button Does Not Appear

Check:

- whether the page actually exposes the needed action
- whether the feature is enabled in the iRefined settings
- whether iRacing changed the page layout or React props for that page

Common example:

- practice register only appears when the site exposes a valid practice registration target

## If Queue or Registration State Looks Wrong

The session tooling depends on live page state and browser-side queue state.

Useful checks:

- reload the page once
- confirm whether the current session is actually open in the iRacing UI
- check whether another registration is already active
- enable the inline `logger` setting if you need more visibility

## If Budget Snapshot Does Not Show Spend

Real spend requires an Order History sync.

Expected flow:

1. visit `Order History`
2. let the analyzer finish
3. return to the dashboard
4. reveal the values in the widget

If current catalog estimates show but real spend does not, the Order History sync path is the part to inspect first.

## If the Dashboard Widgets Look Empty

Possible reasons:

- the current page is not the dashboard
- the widget feature is disabled in settings
- iRacing changed the dashboard data shape
- no synced data exists yet for the relevant widget

## If the Layout Looks Misaligned

The iRacing site is a React application that changes over time. Layout issues are often caused by:

- a selector drift after a site update
- a sidebar tweak conflicting with a page redesign
- a widget anchor no longer matching the dashboard container structure

## Logging

The `logger` setting can be enabled from the settings panel to expose more internal status information on-page.

That is the fastest way to inspect runtime behavior without attaching additional tooling.

## Good Bug Reports

The most useful reports include:

- exact page URL or page type
- extension version
- browser and version
- what the page was expected to show
- what actually appeared
- whether reloading changed the behavior
- a screenshot if the issue is visual

## When the Root Cause Is iRacing-Side

This project depends on data and actions exposed by the iRacing website. Some failures are not local bugs in the extension but changes in the underlying site structure or data exposure. In those cases the fix is usually a selector/data-resolution update, not a settings change.
