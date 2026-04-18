# Official Workflow Deep Dive

This page is the detailed reference for the official register, withdraw, and queue system.

The main implementation lives in:

- `extension/src/features/auto-register.js`
- `extension/src/features/status-bar.jsx`
- `extension/src/helpers/websockets.js`

## Scope of the Official Workflow

The official workflow covers:

- direct register buttons where the site exposes a valid register target
- direct withdraw buttons
- queue buttons for future race sessions
- queue buttons for qualifying sessions
- practice register buttons when the site exposes a real practice target
- queue/status display in the iRefined bar

It does not invent sessions. It only decorates state the site already exposes.

## Core Timing Constants

The queue system has explicit timing constants in `auto-register.js`.

| Constant | Value | Purpose |
| --- | --- | --- |
| `autoRegisterLeadMs` | `5 minutes` | queue begins automatic registration inside this lead window |
| `autoRegisterGraceMs` | `15 minutes` | stale sessions are tolerated briefly after start |
| `queueRetentionMs` | `12 hours` | expired queue items and stale registration state are discarded |
| `queueWithdrawRetryDelayMs` | `2500 ms` | retry delay between queue-driven withdraw attempts |
| `queueRegisterDelayMs` | `7000 ms` | delay used before queue-driven register handoff |
| `optimisticWithdrawWindowMs` | `15000 ms` | temporary UI optimism after a local withdraw request |

## Persistent Keys Used by the Official Workflow

`auto-register.js` stores durable browser-side state in `localStorage`.

| Key | Purpose |
| --- | --- |
| `iref_watch_queue` | persisted queue list |
| `iref_registration_state` | current browser-managed registration snapshot |
| `selected_car_season_<contentId>` | saved car choice per season/content id |

## Queue Item Contract

Every queued item is normalized into a single object shape.

Fields created by `makeQueueItem(...)`:

| Field | Meaning |
| --- | --- |
| `car_id` | selected car id |
| `car_class_id` | selected car class id |
| `car_name` | display name of the selected car |
| `event_type` | numeric event type used by iRacing |
| `event_type_name` | human-readable event type label, for example Race or Qualify |
| `season_id` | target season/content id |
| `season_name` | cleaned season label |
| `start_time` | ISO timestamp of the queued slot |
| `start_label` | visible short time label shown in UI |
| `track_name` | track display name if available |
| `source_path` | page path where the queue was created |
| `source_url` | full page URL where the queue was created |
| `created_at` | queue creation time |
| `last_attempt_at` | most recent register attempt time |
| `last_found_at` | when the real registerable session was found |
| `registration_open` | whether the site says direct registration is already open |
| `status` | `queued`, `found`, or `registering` |
| `session_id` | real session id when discovered |
| `subsession_id` | real subsession id when available |

## Registration State Contract

The browser-managed registration state is separate from the queue list.

Important fields:

| Field | Meaning |
| --- | --- |
| `status` | `registering` or `registered` |
| `source` | browser action source, especially `queue` when queue-triggered |
| `confirmed_by_site` | whether the live site state has confirmed the registration |
| `season_id` | season/content id |
| `season_name` | display name |
| `car_id` | registered car id |
| `car_class_id` | registered car class id |
| `car_name` | display name of the selected car |
| `event_type` | event type numeric id |
| `event_type_name` | Race / Qualify / Practice style label |
| `session_id` | real session id when known |
| `subsession_id` | subsession id when known |
| `start_time` | target start ISO time |
| `start_label` | short visible start label |
| `track_name` | track display name |
| `source_path` | page path of origin |
| `source_url` | full page URL of origin |
| `registered_at` | when the browser marked the registration as active |
| `updated_at` | most recent write time |

## Queue Lifecycle

The queue lifecycle is:

1. user clicks a queue button
2. extension resolves the selected car
3. extension creates a queue item and persists it
4. if the target session is already known, the item can become `found`
5. inside the register window, the queue item can become `registering`
6. after confirmation, the registration state becomes `registered`
7. the queue item is removed or preserved depending on outcome

The queue bar in `status-bar.jsx` reflects that lifecycle using:

- gray searching state for `queued`
- blue ready state for `found`
- gray registering state for `registering`

## Car Selection Rules

Queueing requires a car choice in series where multiple cars are possible.

Resolution path:

1. use saved car from `selected_car_season_<contentId>` when valid
2. try to enrich a stored choice using current car/class data
3. if prompt mode is enabled, ask the user
4. otherwise show `Select Car` / `Choose a car` feedback

## Queue Readiness

A queue item becomes ready when the site exposes a real session id for the target slot.

`markQueueItemFound(...)` writes:

- `session_id`
- `subsession_id`
- `registration_open`
- `last_found_at`
- `status = "found"`

This is the condition behind the blue `Register now` state.

## What `Queue for the next race` Actually Does

The top-card queue shortcut is not a separate queueing system.

It mirrors the first visible queue slot in the lower queue list for the same series. The lower queue buttons remain the canonical slot actions.

## Displaced Registration Handling

If the user is already registered elsewhere and a nearer queued session is supposed to take over, the extension can:

1. withdraw the current registration
2. register the queued target
3. optionally re-queue the displaced later session

That last step is guarded by:

- `queue-requeue-displaced-registration`

It is off by default because it is an advanced behavior.

## Page Areas the Official Workflow Touches

The official workflow actively searches for and modifies:

- the `Next Race` card
- the `Available Sessions` table
- the `Practice sessions` section
- the `Currently Racing` section
- the iRefined status/queue bar

It intentionally avoids queue actions in `Currently Racing`, where the default action remains the native page action.

## Site Clock Synchronization

The official workflow also tries to align with the site's visible countdown.

It extracts countdown text from the `Next Race` card and computes a current time offset. That offset is then used for queue timing so the lower queue bar and main page countdown stay aligned.

## Status Bar Responsibilities

`status-bar.jsx` renders:

- current registration banner
- countdown until the registered session starts
- withdraw button for the registered session
- optional join button when the page exposes one
- current queue items
- `(R)` and `(Q)` queue type tags

It also allows:

- manual queue activation
- queue item removal

## Websocket Responsibilities

The websocket helper is used for the actual:

- `registration.register`
- `registration.withdraw`

calls, plus follow-up refresh nudges.

## Important Limitations

The official workflow still depends on iRacing exposing:

- usable session props
- real session ids
- valid car/class data
- visible or recoverable register/withdraw actions

If those disappear or change shape, the queue/register layer will need maintenance.
