# iRacing Members / Members-NG Deep Analysis

Date of analysis: 2026-04-15  
Workspace: `irefinedWEB-v3-clean`  
Scope: live authenticated inspection of `members-ng.iracing.com` and relevant legacy `members.iracing.com` pages, plus static bundle analysis of the shipped frontend.

## 1. Executive Summary

The current iRacing web stack is a React SPA on `members-ng.iracing.com/web` backed by an OAuth BFF at `members-ng.iracing.com/bff/pub`, plus a still-important legacy account surface on `members.iracing.com/membersite`.

The most valuable hidden/underused surfaces are:

1. Authenticated BFF data endpoints that return signed S3 JSON links.
2. Public structured feeds for tours, time attack schedules, news/promotions, maintenance, and ad placements.
3. A richer session model for hosted/league spectating than the visible UI currently uses (`can_watch`, `can_spot`, `can_broadcast`, spectator capacity, launch/open times).
4. Full catalog endpoints for cars and tracks.
5. Account/session introspection via `bff/pub/proxy/api/sessions`.
6. Route-level subpages that exist and are usable, but are not prominent in the main UI.

The main caution from this pass: not every service/method string embedded in the frontend bundle is directly callable through `/bff/pub/proxy/data/<service>/<method>`. Some clearly are. Some require parameters. Some are legacy or use a different transport.

## 2. How This Was Verified

I used two methods:

1. Static bundle mining:
   - extracted route strings
   - extracted service/method pairs
   - identified config, asset hosts, auth/BFF hosts, and chunk loading behavior

2. Live authenticated inspection:
   - visited the main members-ng routes and subroutes
   - verified final routes after redirect normalization
   - queried selected BFF endpoints directly from the authenticated page context
   - fetched returned signed S3 payloads and summarized their schemas

## 3. Frontend Architecture

### Confirmed app config from bundle

- `auth_url`: `https://members-login.iracing.com`
- `membersite_url`: `https://members.iracing.com/membersite`
- `oauthAccountManagement`: `https://oauth.iracing.com/accountmanagement`
- `oauthBff`: `https://members-ng.iracing.com/bff/pub`
- `oauthUi`: `https://oauth.iracing.com/oauth2`
- `path`: `/web`
- `s3_url_environment_assets`: `https://members-assets.iracing.com`
- `clientId`: `iracing_ui`
- frontend version observed in bundle: `10.57.1`

### Frontend chunk layout

The SPA is split into large functional bundles, notably:

- `cards`
- `content`
- `pages`
- `partials`
- `features`
- `interface`
- `vendor`
- `modals`
- `echarts`
- `moment`

### Other observed frontend dependencies/integrations

- Google Analytics
- Sentry
- Chakra UI color-mode storage
- public guided tours loaded from JSON, not hardcoded in the app bundle

## 4. Route Map: What Actually Exists

## Racing / Core

Confirmed accessible:

- `/web/racing/home/dashboard`
- `/web/racing/home/stream`
- `/web/racing/profile`
- `/web/racing/licensed-content/cars`
- `/web/racing/licensed-content/tracks`
- `/web/racing/official/series-list`
- `/web/racing/official/up-next`
- `/web/racing/spectate/official`
- `/web/racing/spectate/hosted`
- `/web/racing/spectate/leagues`
- `/web/racing/hosted/browse-sessions`
- `/web/racing/hosted/my-sessions`
- `/web/racing/leagues/up-next`
- `/web/racing/leagues/my-leagues`
- `/web/racing/teams/my-teams`
- `/web/racing/results-stats/results`
- `/web/racing/results-stats/driver-stats`
- `/web/racing/results-stats/official-series-standings`
- `/web/racing/time-attack/competitions`

Observed route normalization behavior:

- `/web/racing/licensed-content` redirects to cars purchased view
- `/web/racing/official` redirects to official series list
- `/web/racing/spectate` redirects to official spectate list
- `/web/racing/hosted` redirects to hosted browse list
- `/web/racing/leagues` redirects to leagues up-next
- `/web/racing/results-stats` redirects to results

Observed bundle routes that redirected back to dashboard in this build/account:

- `/web/racing/up-next`
- `/web/racing/browse-sessions`
- `/web/network`
- `/web/documents`
- `/web/debug`
- `/web/settings/preferences/member-prefs`

These are not safe targets for extension features until revalidated.

## Shop

Confirmed accessible:

- `/web/shop/cars`
- `/web/shop/tracks`
- `/web/shop/merch`

Observed normalization:

- `/web/shop` redirects to cars, filtered to unowned content

## Settings

Confirmed accessible:

- `/web/settings/options/general`
- `/web/settings/options/network`
- `/web/settings/options/preferences`
- `/web/settings/options/about`
- `/web/settings/account/info`
- `/web/settings/account/history`

Notable confirmed sections:

- `Options > Preferences` includes notifications, interface, interface tours, confirmations, favorites, and “Help Improve iRacing”
- `Options > About` includes install details
- `Options > Network` exposes networking configuration
- `Account > Info` exposes account information, balance, credits expiration, promo/gift card sections, and referral area
- `Account > History` exists natively in members-ng

## Help

Confirmed accessible:

- `/web/help/documents`
- `/web/help/videos`
- `/web/help/protests`
- `/web/help/change-display-name`

Notable confirmed details:

- `Help > Protests` exposes a full protest form
- it explicitly states up to 3 attachments
- per-attachment size limit observed in UI: 50 MB
- `Help > Change Display Name` includes rules/policy content, not just a redirect

## 5. Legacy Members Site Still Matters

The legacy account pages are still very relevant:

- `https://members.iracing.com/membersite/account/OrderHistory.do`
- `https://members.iracing.com/membersite/account/MyInfo.do`

### What legacy `OrderHistory.do` exposes

- full order history layout
- gifts sent
- gifts received
- the cleanest raw source for historical spend / credits / gifts / recharge flows

### What legacy `MyInfo.do` exposes

- member since
- subscription info
- credits / dollars
- referral program details
- address info
- email settings

This is high value, but it is also PII-heavy. Any extension surface that reads from legacy account pages should be opt-in and kept local.

## 6. Confirmed Public Structured Feeds

These are available without special reverse engineering:

- `https://members-assets.iracing.com/public/maintenance.json`
- `https://members-assets.iracing.com/public/wordpress/news.json`
- `https://members-assets.iracing.com/public/wordpress/promotions.json`
- `https://members-assets.iracing.com/public/guided-tours/index.json`
- `https://members-assets.iracing.com/public/time-attack/schedules/time_attack_schedule_index.json`
- `https://members-assets.iracing.com/public/time-attack/schedules/complete/time_attack_schedule_index.json`
- `https://members-assets.iracing.com/public/time-attack/schedules/future/time_attack_schedule_index.json`
- ads/promotions JSON from `d3bxce0eg3woeh.iracing.com/public/ads/members/...`

### Guided tours schema

Confirmed structure:

- index file maps named tours to locale-specific JSON files
- supported locales include `en`, `en-US`, `es-ES`, `de-DE`, `it-IT`, `fr-FR`, `pt-PT`, `pt-BR`
- a tour file contains:
  - `name`
  - `icon`
  - `tour` array
- observed tour step schema:
  - `target`
  - `title`
  - `showSkipButton`
  - `content`
  - `placement`

This is a strong base for extension-driven contextual tours or “advanced mode” onboarding.

### Time Attack schedule feed

Confirmed current public schedule flow:

1. fetch index JSON
2. index returns a hashed filename
3. hashed JSON contains competition rows

Observed competition row fields include:

- `comp_id`
- `comp_name`
- `comp_short_name`
- `comp_category`
- sponsor assets/URLs
- `terms_doc_url`
- `comp_season_id`
- `car_class_id`
- `start_date_time`
- `end_date_time`
- `season_year`
- `season_quarter`
- `fixed_setup`
- `tracks`
- `allowed_members`

This is enough for a full Time Attack calendar / sponsor / rules overlay without scraping the visible page.

## 7. Confirmed Authenticated BFF Endpoints

## Session / account surface

### `/bff/pub/proxy/api/sessions`

Confirmed live.

Returns an object with `sessions`, where each item includes:

- `session_id`
- `client_id`
- `client_name`
- `client_developer_name`
- `scope`
- `scope_descriptions`
- `auth_time`
- `last_activity`
- `session_expiration`
- `current_session`

This is a strong candidate for:

- “where am I signed in?” widget
- suspicious/stale session warning
- last-activity/session-expiry panel

### `/bff/pub/proxy/data/member/info`

Confirmed live via signed S3 link.

Observed returned fields include:

- `member_since`
- name/display-name variants
- `last_login`
- `flags`
- connection/download preferences
- `account`
- `helmet`
- `suit`
- flair metadata

This is one of the best sources for member anniversary, profile cosmetics, and account-level flags.

### `/bff/pub/proxy/data/member/profile`

Confirmed live via signed S3 link.

Observed top-level sections include:

- `recent_awards`
- `activity`
- `member_info`
- `license_history`
- `recent_events`
- `follow_counts`

High-value for profile overlays, progression panels, recent activity widgets, and compact “career snapshot” UI.

### `/bff/pub/proxy/data/member/participation_credits`

Confirmed live via signed S3 link.

Observed row fields include:

- `season_id`
- `series_id`
- `series_name`
- `license_group`
- `min_weeks`
- `weeks`
- `earned_credits`
- `total_credits`

Very strong fit for:

- “you are X weeks away from credits” widget
- season credit tracker
- missed-credit opportunity alerts

### `/bff/pub/proxy/data/member/awards`

Confirmed live.

Observed:

- metadata object with `data_url`
- award data array
- row fields include `award_id`, `achievement`, `award_date`, `group_name`, `has_pdf`

Good fit for:

- awards browser
- “new award since last visit” widget
- downloadable certificate quick links

## Series / schedule / results

### `/bff/pub/proxy/data/series/season_list`

Confirmed live via signed S3 link.

Observed:

- `seasons` array
- in the current dataset on 2026-04-15, 147 season rows were returned

Observed season row fields include:

- `season_id`
- `season_name`
- `active`
- `car_class_ids`
- `car_types`
- rule/settings fields

### `/bff/pub/proxy/data/series/season_schedule?season_id=...`

Confirmed live.

Observed schedule row fields include:

- `practice_length`
- `qual_attached`
- `qual_time_descriptors`
- `qualify_laps`
- `qualify_length`
- `race_time_descriptors`
- `race_time_limit`
- `race_lap_limit`
- `race_week_cars`
- `series_name`
- `category`
- `full_course_cautions`

This is one of the highest-value endpoints in the whole stack. It supports:

- week-by-week schedule widgets
- attached qualifying intelligence
- car/track requirement forecasting
- content-gap warnings for upcoming weeks

### `/bff/pub/proxy/data/results/season_results?season_id=...`

Confirmed live.

Observed top-level keys include:

- `season_id`
- `race_week_num`
- `event_type`
- `results_list`

This is good for:

- recent-result rollups
- season heatmaps
- series popularity/performance overlays

### `/bff/pub/proxy/data/results/search_series`

Confirmed reachable.

Without filters it returns a validation error requiring:

- date range, or
- season year/quarter

This is useful because it confirms search is exposed and parameterized, not UI-only.

## Hosted / leagues / spectating

### `/bff/pub/proxy/data/hosted/combined_sessions`

Confirmed live via signed S3 link.

Observed session row fields include:

- `num_drivers`
- `num_spotters`
- `num_spectators`
- `num_broadcasters`
- `available_reserved_broadcaster_slots`
- `num_spectator_slots`
- `available_spectator_slots`
- `can_broadcast`
- `can_watch`
- `can_spot`
- `elig`
- `driver_changes`
- `restrict_viewing`
- `max_users`
- `private_session_id`
- `session_id`
- `subsession_id`
- `session_name`
- `open_reg_expires`
- `launch_at`

This is extremely useful. It enables much better “watch / spot / broadcast / join later” tooling than the stock UI currently surfaces.

### `/bff/pub/proxy/data/league/directory`

Confirmed live.

Observed response shape includes:

- paging bounds
- row count

### `/bff/pub/proxy/data/league/cust_league_sessions`

Confirmed live.

Observed top-level structure includes:

- `mine`
- `subscribed`
- `sequence`
- `sessions`

Observed session fields mirror hosted sessions and include:

- `can_watch`
- `can_spot`
- `can_broadcast`
- spectator slot counts
- `open_reg_expires`
- `launch_at`

This is a strong opportunity for league-specific dashboard tooling.

## Lookup / metadata / catalog

### `/bff/pub/proxy/data/lookup/licenses`

Confirmed live.

Observed license group rows with:

- `license_group`
- `group_name`
- thresholds
- participation credit settings
- level definitions

### `/bff/pub/proxy/data/lookup/flairs`

Confirmed live.

Useful for flair pickers, profile styling helpers, and profile decoding.

### `/bff/pub/proxy/data/lookup/drivers?search_term=...`

Confirmed live.

Observed result row fields include:

- `cust_id`
- `display_name`
- `helmet`
- `profile_disabled`

Good fit for driver quick search and contextual profile popovers.

### `/bff/pub/proxy/data/car/get`

Confirmed live.

Observed dataset size on 2026-04-15:

- 185 car rows

Observed fields include:

- `car_id`
- `car_name`
- `car_name_abbreviated`
- `car_types`
- `categories`
- `first_sale`
- `forum_url`
- `free_with_subscription`
- paint/cosmetic capability flags
- AI support flags

### `/bff/pub/proxy/data/track/get`

Confirmed live.

Observed dataset size on 2026-04-15:

- 463 track/config rows

Observed fields include:

- `config_name`
- `category`
- `free_with_subscription`
- `has_svg_map`
- `location`
- `latitude`
- `longitude`
- `is_dirt`
- `is_oval`
- lighting/start/grid capabilities

This is the strongest catalog base for ownership analysis, content planning, and richer series-week widgets.

## 8. Important Negative Findings

These bundle-exposed service/method labels did **not** resolve cleanly at `/bff/pub/proxy/data/...` in this pass:

- `account/*` services tested (`info`, `order_history`, `credits_expiration`)
- `registration/*` services tested
- several `season/*` methods tested
- some `member/*` methods tested (`owned_content`, `preferences`, `mpr`, `friends`, `blacklist`)
- some `results/*` methods tested (`recent_subsessions`, `subsession_drivers`)

Interpretation:

1. some names are real but live on a different endpoint family
2. some are legacy/older transport surfaces
3. some require parameters or POST payloads not used in this pass
4. some extracted strings may not be direct API methods despite appearing in bundle mining

This matters because it means direct write-actions like register/withdraw should **not** be inferred from bundle strings alone.

## 9. Highest-Value Feature Opportunities

## Very High Confidence

1. Session security widget
   - source: `/bff/pub/proxy/api/sessions`
   - idea: show active app/browser sessions, scopes, expiration, and suspicious stale sessions

2. Spectate / spot / broadcast radar
   - source: `hosted/combined_sessions`, `league/cust_league_sessions`
   - idea: sortable session board for watch/spot/broadcast availability and slot pressure

3. Content completeness / purchase planner
   - sources: `car/get`, `track/get`, members-ng shop pages, licensed-content pages
   - idea: per-series/per-week ownership gap analysis, “what blocks me next week?”, free-with-subscription separation, track map previews

4. Series schedule intelligence
   - source: `series/season_list`, `series/season_schedule`, `results/season_results`
   - idea: attached qualifying flags, race format summary, weekly car/track requirements, recent result density, prep checklist

5. Awards / credits progress widgets
   - source: `member/awards`, `member/participation_credits`
   - idea: credits tracker, award timeline, new-badge alerts, certificate surfacing

6. Driver quick lookup
   - source: `lookup/drivers`
   - idea: inline driver search, helmet/avatar/name jump, profile popover

7. Guided-tour extension points
   - source: public guided-tour JSON schema
   - idea: extension-specific contextual tours that follow iRacing’s own targeting model

## High Confidence

8. Hosted / league watchlist
   - source: hosted + league session feeds
   - idea: pin favorite sessions, alert when `can_watch` becomes true, alert when spectator slots become scarce

9. Member anniversary / progression dashboard
   - source: `member/info`, profile data, legacy account info
   - idea: anniversary countdown, member age, last login, cosmetic/profile summary

10. Protest assistant
   - source: `/web/help/protests`
   - idea: protest checklist, attachment validation, incident note templates, deadline reminders

11. Settings intelligence panel
   - source: settings options subpages
   - idea: detect hidden preferences, tours enabled/disabled state, network config reminders

## Medium Confidence / Needs More Reverse Engineering

12. Direct register/withdraw through members-ng backend
   - bundle suggests it exists
   - direct BFF path not confirmed in this pass

13. Full account-history API replacement for legacy order history
   - members-ng account history page exists
   - direct BFF endpoint mapping was not confirmed here

14. System message / blackout feed overlays
   - bundle suggests supporting services
   - direct endpoint mapping was not confirmed here

## 10. Privacy / Safety Notes

- legacy account pages are the biggest privacy risk because they expose personal/account data in-page
- BFF data endpoints commonly return signed S3 links with short expirations; extensions should cache lightly and locally
- some data is better treated as opt-in only:
  - spend history
  - address/account details
  - active auth sessions
  - referral information

Recommended default posture for any new feature:

1. local-only storage
2. hidden by default for sensitive widgets
3. explicit opt-in before mirroring account/billing/history data

## 11. Bundle Inventory Summary

Meaningful service groups extracted from the frontend bundle:

- `league`: 51
- `member`: 44
- `team`: 26
- `stats`: 23
- `myaccount`: 13
- `account`: 11
- `hosted`: 11
- `results`: 10
- `season`: 8
- `registration`: 8
- `lookup`: 7
- `series`: 5
- `carclass`: 5
- `time_attack`: 3
- `setup`: 3
- `protest`: 3
- `notification`: 3
- `package`: 3
- `session`: 2
- `car`: 2
- `track`: 1
- `telemetry`: 1
- `award`: 1
- `skies`: 1
- `blackout`: 1
- `eligibility`: 1

The deepest usable surfaces from that inventory, based on live verification, are `member`, `series`, `hosted`, `league`, `lookup`, `car`, `track`, and `results`.

## 12. Bottom Line

The iRacing site exposes much more structured data than the visible UI suggests. The best extension opportunities are not generic scraping tricks; they are:

- using the signed JSON feeds behind the SPA
- enriching session/watch/ownership/schedule workflows
- using the public feed ecosystem already maintained by iRacing
- avoiding direct mutation endpoints until their exact transport is confirmed

If the goal is V4+ product direction, the best next move is a feature roadmap built around:

1. session intelligence
2. content intelligence
3. progression/account intelligence
4. guided-tour / helper UX
