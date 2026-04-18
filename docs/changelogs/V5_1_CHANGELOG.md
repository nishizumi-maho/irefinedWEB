# V5.1 Changelog

## V5.1 - 2026-04-16

V5.1 is a small Budget Snapshot hotfix on top of V5.

## Fixed

- Fixed Budget Snapshot losing synced Order History data after returning to the dashboard.
- Empty bridge reads no longer overwrite a valid per-tab dashboard summary.
- Removed the dashboard `beforeunload` cleanup that could clear the per-tab sync token during normal navigation.

## Privacy

- Budget values still remain hidden by default until the user clicks `Reveal`.
- Synced dashboard state still uses tab-scoped `sessionStorage`.
- The temporary Order History bridge copy is still removed after the dashboard reads it successfully.

## Validation

- `node --check` on the changed runtime file.
- `npm run build`.
- `npm audit --omit=dev`.
- source scan for common secret/token/private-data patterns.
