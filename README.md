# iRefined Browser

Browser-first helpers for the iRacing `members-ng` website.

This repository is a website-focused fork/adaptation of iRefined. It adds workflow and dashboard helpers directly on top of the logged-in iRacing web UI.

## Documentation

- Wiki: [github.com/nishizumi-maho/irefinedWEB/wiki](https://github.com/nishizumi-maho/irefinedWEB/wiki)
- Changelog: [CHANGELOG.md](CHANGELOG.md)
- Version release notes: [docs/changelogs](docs/changelogs)
- Research/reference docs: [docs/research](docs/research)
- Releases: [github.com/nishizumi-maho/irefinedWEB/releases](https://github.com/nishizumi-maho/irefinedWEB/releases)

The wiki is the primary technical reference. It documents the architecture, features, storage model, privacy boundaries, troubleshooting, and source map in detail.

## Install

1. Open [Releases](https://github.com/nishizumi-maho/irefinedWEB/releases).
2. Download the newest Chromium package, such as `irefined-browser-chromium-v5.1.zip`.
3. Extract the zip to a permanent folder.
4. Open `chrome://extensions` in Chrome or `edge://extensions` in Edge.
5. Enable `Developer mode`.
6. Click `Load unpacked`.
7. Select the extracted folder that contains `manifest.json`.
8. Open `https://members-ng.iracing.com/web/racing/home/dashboard`.

## What It Does

- register and withdraw helpers for supported official series pages
- queue support for race and qualifying sessions
- practice registration where the site exposes a valid practice target
- dashboard Budget Snapshot and Intelligence Center widgets
- hosted and league session import/export helpers
- test drive session sharing helpers
- update notice when a newer GitHub release is available
- browser-side UI quality-of-life tweaks for `members-ng`

## Browser Support

The stable release target is Chromium-based browsers using the unpacked package from GitHub Releases.

Supported target:

- Chrome
- Edge
- Brave
- Vivaldi
- Opera

## Development

The extension source lives in [`extension/`](extension).

Typical local workflow:

1. `cd extension`
2. `npm install`
3. `npm run build`
4. load the built/unpacked extension in a Chromium browser

## Repository Layout

- [`extension/`](extension): browser extension source and build config
- [`docs/wiki/`](docs/wiki): versioned source for the GitHub wiki
- [`docs/changelogs/`](docs/changelogs): version-specific release notes
- [`docs/research/`](docs/research): deeper analysis/reference material

## Support and Issues

- Use GitHub Issues for bug reports and feature requests.
- Include the extension version, browser, affected page, and a screenshot when the issue is UI-related.

## Scope

This project is browser-only.

It does not:

- attach to the installed sim client
- automate driving inputs
- bypass authentication
- replace iRacing's local app launch handoff

## License and Affiliation

This repository and its contributors are not affiliated with iRefined or iRacing.
