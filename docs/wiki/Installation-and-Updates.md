# Installation and Updates

## Release Install

The normal user install path is an unpacked Chromium extension install.

1. Open the [Releases page](https://github.com/nishizumi-maho/irefinedWEB/releases).
2. Download the latest Chromium package, for example `irefined-browser-chromium-v5.1.zip`.
3. Extract it to a permanent folder.
4. Open `chrome://extensions` or `edge://extensions`.
5. Enable **Developer mode**.
6. Click **Load unpacked**.
7. Select the extracted folder containing `manifest.json`.
8. Open `https://members-ng.iracing.com/web/racing/home/dashboard`.

## Update Model

This project is not currently distributed through a browser extension store.

That means:

- updates are manual
- users download a newer release zip
- users extract it
- users reload the unpacked extension

## In-Extension Update Detection

The extension checks the repository's latest GitHub release using the GitHub Releases API.

Current behavior:

- the check is cached locally
- the toolbar can show an update badge
- the settings panel can show the latest release link
- the newer builds can also show a popup-style notice

The extension never self-installs updates.

## Supported Stable Browser

The stable published target is Chromium:

- Chrome
- Edge
- Brave
- Vivaldi
- Opera

## Local Development Install

For local development:

1. run `npm install` in `extension/`
2. run `npm run build`
3. load `extension/dist/` as an unpacked extension

## Common Installation Mistakes

- loading the `.zip` file directly instead of extracting it
- extracting into a temporary folder that later disappears
- selecting the wrong folder instead of the one that contains `manifest.json`
- forgetting to reload the extension after downloading a newer release
