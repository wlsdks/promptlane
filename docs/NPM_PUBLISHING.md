# NPM Publishing Runbook

Date: 2026-05-02

## Current Readiness

The local environment is authenticated to npm as:

```sh
npm whoami
# stark97
```

The unscoped package name currently appears available:

```sh
npm view promptlane version
# E404 Not Found
```

That result means the package has not been published to the public npm registry at the time of the check. It is not a reservation. The name can still be taken by someone else before the first publish.

## Recommended First Publish

Use a beta prerelease first:

```sh
npm publish --tag beta
```

Recommended version:

```json
{
  "version": "0.1.0-beta.0"
}
```

Why `--tag beta`:

- users must intentionally install the beta tag
- `npm install -g promptlane@beta` gets the prerelease
- the `latest` tag remains unused until the package is stable enough

## Install Commands After Publish

```sh
npm install -g promptlane@beta
promptlane setup
promptlane doctor claude-code
promptlane doctor codex
promptlane server
```

## Required Local Gate Before Publishing

Run on Node 22:

```sh
corepack pnpm format
corepack pnpm test
corepack pnpm lint
corepack pnpm build
corepack pnpm benchmark -- --json
corepack pnpm e2e:browser
corepack pnpm smoke:release
corepack pnpm pack:dry-run
git diff --check
```

Recommended additional package smoke (uses the pack output filename
instead of hardcoding the version so this stays correct after bumps). Build
first and use `--ignore-scripts` for the npm pack calls so lifecycle logs do
not contaminate the JSON output:

```sh
corepack pnpm build
npm pack --dry-run --ignore-scripts
TARBALL="$(npm pack --json --ignore-scripts | node -e 'process.stdin.on("data",d=>{const j=JSON.parse(d);console.log(j[0].filename)})')"
TMP_HOME="$(mktemp -d)"
TMP_PREFIX="$(mktemp -d)"
HOME="$TMP_HOME" npm install -g --prefix "$TMP_PREFIX" "./$TARBALL"
"$TMP_PREFIX/bin/promptlane" --help
"$TMP_PREFIX/bin/pl-claude" --pc-help
"$TMP_PREFIX/bin/pl-codex" --pc-help
```

## Publish Checklist

- [ ] package name is still available or already owned by the maintainer
- [ ] version in `package.json` is bumped and has never been published
- [ ] `src/shared/version.ts` `VERSION` matches `package.json#version` (the
      vitest in `src/shared/version.test.ts` enforces this on every run)
- [ ] README is available in English and Korean and matches the actual feature set
- [ ] package contents contain built CLI/server/web assets
- [ ] all three bin entries exist after build:
  - `bin.promptlane` → `dist/cli/index.js`
  - `bin.pl-claude` → `dist/cli/pl-claude.js`
  - `bin.pl-codex` → `dist/cli/pl-codex.js`
- [ ] each bin file is executable after build (`scripts/fix-bin-mode.mjs`
      runs as part of `pnpm build:server` and chmods all three)
- [ ] `corepack pnpm pack:dry-run` excludes `dist/**/*.map` (source maps stay local)
- [ ] full release checklist (`docs/RELEASE_CHECKLIST.md`) passes
- [ ] pre-publish privacy audit (`docs/PRE_PUBLISH_PRIVACY_AUDIT.md`) passes
- [ ] npm account is authenticated
- [ ] 2FA/OTP requirement is available if npm asks for it
- [ ] publish uses `--tag beta` for the first prerelease

## Do Not Publish Yet If

- `corepack pnpm smoke:release` fails
- `corepack pnpm pack:dry-run` does not include `dist/cli`, `dist/server`, or `dist/web`
- npm reports that `promptlane` is already taken by another owner
- the npm account cannot complete 2FA/OTP
- README still claims a feature that is not implemented

## Useful NPM Commands

```sh
npm whoami
npm view promptlane version
npm access list packages stark97 --json
npm publish --tag beta
npm dist-tag ls promptlane
npm view promptlane versions --json
```
