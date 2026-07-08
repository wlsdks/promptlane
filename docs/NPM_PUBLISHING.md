# NPM Publishing Runbook

Date: 2026-05-02

## Live Readiness Checks

Do not treat older `npm whoami` or registry lookup notes as publish approval.
Run these checks in the same shell and checkout that will run `npm publish`:

```sh
npm whoami
npm view promptlane versions --json
```

Latest local observation on 2026-07-08:

- `npm whoami` returned `E401 Unauthorized`, so this machine was not ready to
  publish without npm login.
- `npm view promptlane versions --json` returned `E404 Not Found`, so the
  package name still appeared unpublished at that moment.

Both results can change. Treat them as a dated operator note only, not as a
release gate substitute.

The preflight command repeats those checks before publish and fails closed when
auth is missing, the package version already exists, the worktree is dirty, or
the expected release tag does not point at the current commit:

```sh
corepack pnpm npm-publish:preflight
```

## Recommended First Stable Publish

Publish 1.0.0 to the default `latest` npm dist-tag after the full local release
gate passes:

```sh
npm publish --tag latest
```

Before publishing, run the local preflight. It checks the local version
surfaces, clean/tag state, npm auth, and whether the current package version is
already published. It does not publish:

```sh
corepack pnpm npm-publish:preflight
```

For offline or test-only inspection, skip npm registry/auth checks:

```sh
corepack pnpm npm-publish:preflight -- --skip-npm
```

For machine-readable preflight output, use the silent pnpm invocation so stdout
stays parseable JSON even when the preflight blocks:

```sh
corepack pnpm --silent npm-publish:preflight -- --json
```

If main has moved past `v1.0.0`, publish from the tagged release commit rather
than the newer main commit:

```sh
git checkout v1.0.0
corepack pnpm npm-publish:preflight
npm publish --tag latest
```

`v1.0.0` must point at the commit you are publishing.

Before `promptlane@1.0.0` is published, release-candidate polish commits may
still be included in the first stable release by rerunning the full local
release gate and refreshing the annotated tag on the verified main commit:

```sh
git tag -fa v1.0.0 -m "promptlane 1.0.0"
git push origin v1.0.0 --force
```

After `promptlane@1.0.0` is published, do not retarget `v1.0.0`; bump the
package version, rerun the full release gate, and create a new annotated tag
for the next published release.

Recommended version:

```json
{
  "version": "1.0.0"
}
```

Why `--tag latest`:

- this is the first stable release target
- `npm install -g promptlane` gets the stable release
- future prereleases can still use `--tag beta` or another explicit tag

## Install Commands After Publish

```sh
npm install -g promptlane
promptlane setup --profile coach --register-mcp --open-web
promptlane coach
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
corepack pnpm smoke:package-install
corepack pnpm evidence:quality -- --require-complete
corepack pnpm promptlane quality-evidence --require-complete
git tag -fa v1.0.0 -m "promptlane 1.0.0"
corepack pnpm npm-publish:preflight
git diff --check
```

The package install smoke builds, packs with `--ignore-scripts`, installs the
tarball into an isolated npm prefix, and runs all shipped bin help commands:

```sh
corepack pnpm smoke:package-install
```

## Publish Checklist

- [ ] package name is still available or already owned by the maintainer
- [ ] package is not marked private in `package.json`
- [ ] package manager is pinned to `pnpm@10.18.0`, and Node engine remains `>=22.12 <25`
- [ ] license, repository, and bin metadata are present in `package.json`
- [ ] package files include `dist`, `README.md`, `LICENSE`, the npm publish preflight script, and core release verification scripts
- [ ] package files exclude `dist/**/*.map`
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
- [ ] annotated git tag `v1.0.0` is created or refreshed before `corepack pnpm npm-publish:preflight`
- [ ] `corepack pnpm npm-publish:preflight` passes
- [ ] publish uses `--tag latest` for the first stable release

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
npm access list packages "$(npm whoami)" --json
npm publish --tag latest
npm dist-tag ls promptlane
npm view promptlane versions --json
git tag -fa v1.0.0 -m "promptlane 1.0.0"
git push origin v1.0.0 --force
```
