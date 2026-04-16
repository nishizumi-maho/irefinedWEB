# V4.1 Changelog

## V4.1 - 2026-04-16

V4.1 is a focused refinement release on top of V4. It expands the local financial-comparison content and trims recurring browser-side work that did not need to run so often.

### Added

- Much larger local curiosity bank for the dashboard `Budget Snapshot`.
- Matching expansion of the `Order History` comparison pool so dashboard and history views now surface richer real-world racing comparisons from the same overall concept.
- New comparisons across:
  - track nights
  - race entries
  - karting sessions
  - fuel
  - tires
  - brake parts
  - garage/travel costs
  - safety gear
  - coaching
  - sim-rig hardware

### Changed

- Updated extension versioning to `4.1.0` / `v4.1`.
- `Budget Snapshot` now rotates through a much deeper pool of local comparisons.
- `Order History` range-based curiosities now use a wider reference set and stronger cross-category comparisons.

### Performance

- Replaced the old high-frequency global selector scan with a mutation-driven observer plus a lighter fallback scan.
- Reduced repeated work in hidden tabs for:
  - dashboard `Budget Snapshot`
  - car-manual link injection
  - status/queue bar refresh
  - better join-button refresh
- Prevented duplicate polling intervals in the improved join-button helper.

### Scope

- No behavioral queue/register logic was changed in this release.
- This release stays focused on richer local comparisons and safer browser-side efficiency wins.

### Validation

- `node --check` on updated runtime files.
- `npm run build`.
