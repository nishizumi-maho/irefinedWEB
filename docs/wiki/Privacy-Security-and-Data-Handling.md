# Privacy, Security, and Data Handling

This project is intentionally conservative about permissions and data retention.

## Permission Surface

The stable manifest in `extension/public/manifest.json` requests only one extension permission:

- `storage`

There are no host-level fetch permissions added beyond the content-script match scope already needed to run on the iRacing pages.

## What the Extension Does

- injects UI helpers into logged-in iRacing website pages
- reads page state that the site already exposes in DOM or React props
- stores a limited amount of browser-side state for settings, queue state, and dashboard widgets

## What the Extension Does Not Intentionally Store

- passwords
- raw authentication tokens
- e-mail addresses as a product feature
- raw invoice HTML as long-term stored data
- payment card data
- private credentials for external services

## Financial Data Model

The Budget Snapshot and Order History analyzer are designed around derived summaries rather than durable raw page dumps.

The intended pattern is:

1. parse Order History on the Order History page
2. classify rows into categories
3. publish a reduced summary through the storage bridge
4. render that summary in the dashboard widget

The dashboard uses hidden-by-default values and keeps visible widget state scoped to the current tab session.

## Why the Bridge Is Narrow

`extension/public/bridge.js` is not a general-purpose pipe. It only exposes a small allowlist of storage keys used for derived summaries.

That reduces the chance of unrelated page scripts using the bridge as a generic storage transport.

## Browser-Side Only Scope

This repository is intentionally browser-first.

It does not:

- attach to the installed sim client
- send driving inputs
- attempt to bypass iRacing authentication
- replace iRacing's launch handoff into the local app

## Update Checks

The update-notice feature checks the public GitHub Releases page for a newer release.

This is used only to notify the user that a new version exists. The extension does not self-install updates.

## Practical Privacy Defaults

The project currently follows several privacy-oriented defaults:

- financial values are hidden until the user reveals them
- budget widget state is not intended to survive a full tab-session reset
- only the minimum extension permission is requested
- there is no cloud sync service for user financial data

## Security Boundaries

Like any site-integrated extension, this project depends on the target site's DOM and client-side data model. If the target site changes significantly, the safe response is to update selectors and logic rather than widening permissions or adding invasive hooks.

## Recommended Maintenance Practice

For this repository, the safe long-term posture is:

- keep permissions minimal
- keep the bridge allowlist small
- avoid retaining raw account data unless strictly needed
- prefer derived summaries over raw copies
- document behavior clearly in the wiki and changelog
