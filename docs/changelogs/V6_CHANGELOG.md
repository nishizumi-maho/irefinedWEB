# V6 Changelog

V6 resets the release line back to the stable V5.2 base and keeps the scope limited to one goal: make iRefined controls appear in the WEBUI even when the site language is not `en-US`.

## Fixed

- Fixed top-card action detection so the extension no longer depends on English labels such as `Next Race @`, `View in iRacing`, `Up Next`, or `Withdraw`.
- Fixed available-session and practice-session button discovery by resolving session actions from React props instead of button text.
- Fixed queue slot detection for localized WEBUI labels by matching the localized `Up Next` line and extracting time labels structurally.
- Fixed event-type inference for queue/register handling when the site exposes localized session names.

## Changed

- Updated extension versioning to `6.0.0` / `v6`.
- Kept the release intentionally minimal: no page translation, no remote translation service, no extension settings translation work.

## Why This Matters

The previous experimental path widened the scope too far and introduced extra moving parts. This V6 release intentionally goes back to the latest stable line and changes only what is needed for the iRefined buttons to show up on localized WEBUI pages.

Instead of depending on English button labels, the extension now looks for the underlying session props that iRacing attaches to the native controls. That makes the injected iRefined controls much less sensitive to whichever supported WEBUI language the member selected.

## Validation

- `npm install`
- `npm run build`
- Manual selector review for top-card, available-session, and practice-session flows
