# Session Registration and Queue

The session workflow is primarily implemented by `extension/src/features/auto-register.js` and surfaced by `extension/src/features/status-bar.jsx`.

## Main Responsibilities

`auto-register.js` is responsible for:

- finding current session data on Go Racing pages
- deciding whether a row or main card should show `Register`, `Withdraw`, `Queue`, or the native fallback
- persisting queued sessions
- tracking the current registration state
- timing register attempts near the open window
- handling displacement when a queued session should replace an existing registration

`status-bar.jsx` is responsible for:

- rendering the visible registration bar
- showing current queued items
- exposing quick queue removal / activation actions
- showing countdowns and browser-managed session status

## Queue State

Queue data is persisted browser-side so the user can leave one series page and still keep the queued item visible in the iRefined bar.

The queue system supports:

- race queue items
- qualifying queue items
- labels such as `(R)` and `(Q)` in queue displays
- optional re-queue behavior for displaced registrations

## Registration State Model

The extension tracks a browser-side current registration state so the UI can react faster than waiting for a full page refresh.

Key exported helpers from `auto-register.js`:

- `clearRegistrationState`
- `isCurrentPageWithdrawPending`
- `getCurrentRegistrationState`
- `confirmRegistrationState`
- `getCurrentTime`
- `requestCurrentSessionWithdraw`
- `activateQueueItem`
- `removeQueuedSession`

These functions let the status bar and page controls talk to the same underlying state.

## Current Card vs Queue Area

V5.1 keeps an intentional distinction:

- the main session card prefers the direct action for the current/open session
- the queue area lists upcoming queue targets

This keeps `Register` and `Withdraw` obvious while still allowing users to queue future sessions.

## Practice Registration

Practice registration is only added when the site exposes enough real data to support it safely.

The extension does not invent practice targets. It only decorates what the page already makes available.

## Current Limitations

- everything still depends on the iRacing page exposing usable session data
- the extension cannot register for something the site does not expose
- final launch/join still follows the site's local-app handoff behavior
- DOM changes on iRacing's side can break selectors or data resolution

## Related Files

- `extension/src/features/auto-register.js`
- `extension/src/features/status-bar.jsx`
- `extension/src/features/better-join-button.js`
- `extension/src/helpers/websockets.js`
- `extension/src/helpers/react-resolver.js`
- `extension/src/helpers/sound.js`
