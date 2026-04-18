# Build, Release, and CI

This page documents how the repository is built and how release artifacts are produced.

## Local Development Build

The extension project lives under `extension/`.

Typical local flow:

1. install dependencies with `npm install`
2. build with `npm run build`
3. load the built or unpacked extension into a Chromium browser

The repository's stable user-facing install path remains GitHub Releases rather than a browser store.

## Extension Packaging

The browser extension output is generated into `extension/dist/`.

Release packaging then zips the relevant output so users can:

1. download the release zip
2. extract it locally
3. load the extracted folder via `chrome://extensions` or `edge://extensions`

## Version Sources

Version information is primarily maintained in:

- `extension/package.json`
- `extension/public/manifest.json`

The release artifacts should match the extension version declared there.

## Main GitHub Actions Workflows

### Extension build workflow

The repository uses a build workflow to verify that the extension still bundles correctly.

This protects against:

- broken imports
- syntax errors
- packaging regressions

### Release workflow

The release workflow packages the extension and attaches the resulting zip to a GitHub Release.

This is the distribution path used by end users.

### Wiki sync workflow

The repository now includes `.github/workflows/wiki-sync.yml`.

Its purpose is to publish the contents of `docs/wiki/` into the GitHub wiki so the detailed technical documentation stays versioned in the repository.

Current behavior:

- can be triggered manually
- also syncs on pushes to `main` that affect `docs/wiki/**`

## Why the Wiki Sources Live in the Repository

Keeping wiki pages in `docs/wiki/` has two advantages:

- documentation changes are reviewable in normal pull requests
- the live wiki can still be published automatically

This avoids the common problem where a repository wiki drifts away from the code because it is edited separately.

## Release Documentation Model

The repository documentation is now split intentionally:

- `README.md`: concise entry point for installation and common repository information
- `CHANGELOG.md`: root historical changelog
- `docs/changelogs/`: version-specific release notes
- `docs/wiki/`: detailed technical documentation that also publishes to the GitHub wiki
- `docs/research/`: deeper analysis/reference documents that are useful to keep versioned

## Recommended Release Checklist

For maintainers, the practical release checklist is:

1. update version in `package.json` and `manifest.json`
2. update `CHANGELOG.md`
3. add a version-specific changelog under `docs/changelogs/` if needed
4. run the build
5. validate the packaged artifact
6. draft the GitHub Release with the changelog summary
7. publish when ready
