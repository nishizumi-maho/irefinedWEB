# iRefined Browser Wiki

iRefined Browser is a browser-first extension for the iRacing `members-ng` website. This wiki is the detailed technical reference for the project.

## What This Wiki Covers

- installation and update flow
- project architecture
- feature-by-feature behavior
- dashboard tools
- Order History analysis and the storage bridge
- settings and storage keys
- build, packaging, and release workflows
- privacy, data handling, and known limitations
- troubleshooting
- file-by-file source map

## Recommended Reading Order

1. [Installation and Updates](Installation-and-Updates)
2. [Architecture](Architecture)
3. [Feature Index](Feature-Index)
4. [Session Registration and Queue](Session-Registration-and-Queue)
5. [Dashboard Budget Snapshot](Dashboard-Budget-Snapshot)
6. [Dashboard Intelligence Center](Dashboard-Intelligence-Center)
7. [Session Sharing and Exports](Session-Sharing-and-Exports)
8. [Order History and Data Bridge](Order-History-and-Data-Bridge)
9. [Settings and Storage](Settings-and-Storage)
10. [Privacy, Security, and Data Handling](Privacy-Security-and-Data-Handling)
11. [Build, Release, and CI](Build-Release-and-CI)
12. [Source Map](Source-Map)
13. [Troubleshooting](Troubleshooting)

## Project Scope

This fork deliberately stays on the website side:

- it injects into `members-ng`
- it adds UI helpers on pages the user is already viewing
- it does not attach to the installed sim client
- it does not automate driving inputs
- it does not bypass authentication or local-app handoff behavior

## Stable Browser Target

The stable release target is Chromium-based browsers using the unpacked extension package from GitHub Releases.

## Repository Pointers

- Repository root: `https://github.com/nishizumi-maho/irefinedWEB`
- Releases: `https://github.com/nishizumi-maho/irefinedWEB/releases`
- Changelog: `https://github.com/nishizumi-maho/irefinedWEB/blob/main/CHANGELOG.md`
- Documentation source in the repo: `https://github.com/nishizumi-maho/irefinedWEB/tree/main/docs`
