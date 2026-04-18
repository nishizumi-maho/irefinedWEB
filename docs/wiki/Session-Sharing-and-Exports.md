# Session Sharing and Exports

This area covers the browser-side import/export helpers for Hosted, League, Official, and Test Drive flows.

## Hosted and League Session Import/Export

Primary implementation:

- `extension/src/features/share-hosted-session.jsx`

Supporting helpers:

- `helpers/download.js`
- `helpers/json-safe.js`
- `helpers/weather-import.js`
- `helpers/react-resolver.js`

### What It Does

- exports supported session configuration as JSON
- imports supported session configuration back into compatible forms
- normalizes weather payloads during import

### Why It Exists

Hosted/League setup in the iRacing UI can be repetitive. These helpers reduce repeated manual form entry.

## Official Go Racing Export

Primary implementation:

- `extension/src/features/go-racing-export.js`

This feature focuses on exporting session data where supported on Go Racing pages.

## Test Drive Sharing

Primary implementation:

- `extension/src/features/share-test-session.jsx`

This is a lighter sharing helper for Test Drive contexts where the page exposes enough structure to attach a share/export action.

## Safety Boundaries

- these tools only work where the page already exposes usable data
- JSON export/import is browser-side convenience, not a backend integration
- weather normalization is defensive, so mismatched payload shapes do not blindly overwrite live data
