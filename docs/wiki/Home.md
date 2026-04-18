# iRefined Browser Wiki

iRefined Browser is a browser-first extension for the iRacing `members-ng` website. This wiki is the detailed technical reference for the project and is intended to be the maintainers' reference, not just an end-user FAQ.

## What This Wiki Covers

- installation and update flow
- project architecture
- feature-by-feature behavior
- runtime boot and integration behavior
- official queue/register state contracts
- dashboard tools
- dashboard data pipelines
- Order History analysis and the storage bridge
- settings and storage keys
- helper module responsibilities
- build, packaging, and release workflows
- privacy, data handling, and known limitations
- troubleshooting
- file-by-file source map

## Recommended Reading Order

1. [Installation and Updates](Installation-and-Updates)
2. [Architecture](Architecture)
3. [Runtime Boot and Integration](Runtime-Boot-and-Integration)
4. [Feature Index](Feature-Index)
5. [Session Registration and Queue](Session-Registration-and-Queue)
6. [Official Workflow Deep Dive](Official-Workflow-Deep-Dive)
7. [Dashboard Budget Snapshot](Dashboard-Budget-Snapshot)
8. [Dashboard Intelligence Center](Dashboard-Intelligence-Center)
9. [Dashboard Widget Data Flow](Dashboard-Widget-Data-Flow)
10. [Session Sharing and Exports](Session-Sharing-and-Exports)
11. [Order History and Data Bridge](Order-History-and-Data-Bridge)
12. [Data Contracts and Storage Keys](Data-Contracts-and-Storage-Keys)
13. [Helper Modules Reference](Helper-Modules-Reference)
14. [Settings and Storage](Settings-and-Storage)
15. [Privacy, Security, and Data Handling](Privacy-Security-and-Data-Handling)
16. [Build, Release, and CI](Build-Release-and-CI)
17. [Source Map](Source-Map)
18. [Troubleshooting](Troubleshooting)

## Project Scope

This fork deliberately stays on the website side:

- it injects into `members-ng`
- it adds UI helpers on pages the user is already viewing
- it does not attach to the installed sim client
- it does not automate driving inputs
- it does not bypass authentication or local-app handoff behavior

## Stable Browser Target

The stable release target is Chromium-based browsers using the unpacked extension package from GitHub Releases.

## Source of Truth

The live GitHub Wiki is published from the repository-side files in `docs/wiki/`.

That means:

- wiki changes should ideally start in the repository
- technical docs can be reviewed in pull requests
- the published wiki should mirror the codebase rather than drift away from it

## Suggested Reading by Topic

### If you want to understand how the extension starts

- [Architecture](Architecture)
- [Runtime Boot and Integration](Runtime-Boot-and-Integration)

### If you want to debug official queue/register behavior

- [Session Registration and Queue](Session-Registration-and-Queue)
- [Official Workflow Deep Dive](Official-Workflow-Deep-Dive)
- [Data Contracts and Storage Keys](Data-Contracts-and-Storage-Keys)

### If you want to debug dashboard widgets

- [Dashboard Budget Snapshot](Dashboard-Budget-Snapshot)
- [Dashboard Intelligence Center](Dashboard-Intelligence-Center)
- [Dashboard Widget Data Flow](Dashboard-Widget-Data-Flow)

### If you want to debug account and financial data

- [Order History and Data Bridge](Order-History-and-Data-Bridge)
- [Data Contracts and Storage Keys](Data-Contracts-and-Storage-Keys)

### If you want a file-level map

- [Feature Index](Feature-Index)
- [Helper Modules Reference](Helper-Modules-Reference)
- [Source Map](Source-Map)

## Repository Pointers

- Repository root: `https://github.com/nishizumi-maho/irefinedWEB`
- Releases: `https://github.com/nishizumi-maho/irefinedWEB/releases`
- Changelog: `https://github.com/nishizumi-maho/irefinedWEB/blob/main/CHANGELOG.md`
- Documentation source in the repo: `https://github.com/nishizumi-maho/irefinedWEB/tree/main/docs`
