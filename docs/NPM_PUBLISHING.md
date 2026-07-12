# NPM Publishing Runbook

Date: 2026-05-02

## Live Readiness Checks

Do not treat older `npm whoami` or registry lookup notes as publish approval.
Run these checks in the same shell and checkout that will run `npm publish`:

```sh
npm whoami
npm view looprelay versions --json
```

Latest local observation on 2026-07-09:

- `npm whoami` returned `E401 Unauthorized`, so this machine was not ready to
  publish without npm login.
- `npm view looprelay versions --json` returned `E404 Not Found`, so the
  package name still appeared unpublished at that moment.

Both results can change. Treat them as a dated operator note only, not as a
release gate substitute.

The preflight command repeats those checks before publish and fails closed when
auth is missing, the package version already exists, the worktree is dirty, or
the expected release tag does not point at the current commit:

```sh
corepack pnpm npm-publish:preflight
```

`corepack pnpm npm-publish:preflight` verifies the local tag and `origin` tag
point at the same release commit after the local tag points at HEAD and is
annotated.
When blocked, human output prints a `Blocking checks` section near the top
before the full check list, followed by a copy-ready `Next action`.
JSON output includes the same failed checks as top-level `blocking_checks`
before the full `checks` array so automation does not need to re-filter it.
Only when every preflight check passes and no release check was skipped, JSON
output includes `publish_command: "npm publish --tag latest"` as the copy-ready
publish handoff.
When the only blocker is npm authentication, JSON output also includes
`recovery_commands` with `npm login` and the preflight recheck command; it does
not include `npm publish --tag latest` because publish still requires a fresh
passing preflight.
Human and JSON output also include `Release warnings`. The current warning says
the required `corepack pnpm --silent benchmark -- --json` pass is synthetic
regression evidence: a synthetic pass is not real-world effectiveness proof, and
repository maintainers may collect consent-bearing redacted fixtures in
`docs/benchmark-fixtures/real.json`. Installed users can keep the same fixture
shape in an operator-owned local file by running:

```sh
looprelay benchmark prepare-fixture --prompt-id "$PROMPT_ID" --consent-note "$CONSENT_NOTE" --confirm-consent --output "$FIXTURE_FILE"
looprelay benchmark pair-candidates --json
looprelay benchmark prepare-pair --baseline-prompt-id "$BASELINE_PROMPT_ID" --looprelay-prompt-id "$LOOPRELAY_PROMPT_ID" --pair-id "$PAIR_ID" --query "$MATCH_QUERY" --consent-note "$CONSENT_NOTE" --confirm-consent --output "$PAIR_FIXTURE_FILE"
```

`prepare-fixture` revalidates selected archive prompts and includes only
explicitly attributed completed outcomes. `prepare-pair` is the paired
observational path: it requires a completed unattributed baseline and explicitly
attributed LoopRelay treatment from the same tool, writes one private matched
fixture, and never turns that evidence into a causal claim. Repeat the four
pair-selection options in matching order to put at least three pairs in one
fixture without manual JSON merging. Use `pair-candidates --json` to inspect
separate body-free baseline and
LoopRelay candidate groups before choosing equivalent tasks; the command does
not expose snapshot ids or outcome content and does not infer equivalence. For
manual fixture authoring, run
`looprelay benchmark init-fixture --output "$FIXTURE_FILE"`, replacing
every example with consent-bearing redacted fixtures, updating `consent_note`,
adding operator-confirmed `passed` or `failed` outcome metadata with safe
evidence refs, setting `improvement_used` to `true` only when the generated
improvement was actually used (`false` otherwise), setting `template_only` to `false`, and then running
`looprelay benchmark --fixture-set real --fixture-file "$FIXTURE_FILE"`
with `--json --report-file "$BASELINE_REPORT"` to save one validated private
JSON snapshot. A trend claim additionally requires rerunning the same corpus
with `--baseline-file "$BASELINE_REPORT"`.
If that file is absent, preflight adds a separate `real benchmark fixtures are
missing` warning. This warning does not block publish after the release gates
pass; it blocks overclaiming real-user effectiveness trends.

## Recommended Next Stable Publish

Publish 1.0.1 to the default `latest` npm dist-tag after the full local release
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

Skip flags are inspection-only. If any release check is skipped and every
executed check passes, JSON output reports `status: "inspection"` and
`publish_ready: false`, plus `inspection_warnings` naming the skipped checks;
rerun without skip flags before publishing.

For machine-readable preflight output, use the silent pnpm invocation so stdout
stays parseable JSON even when the preflight blocks:

```sh
corepack pnpm --silent npm-publish:preflight -- --json
```

Release tags are immutable. If HEAD has moved past an existing tag, either
publish the exact tagged commit or bump the package version and create a new tag:

```sh
git checkout v1.0.0
corepack pnpm npm-publish:preflight
npm publish --tag latest
```

`v1.0.0` must point at the commit being published and must never be moved. The
current immutable tag predates the LoopRelay rename, so the renamed product must
use a new version and tag after the maintainer selects that release number.

Recommended version:

```json
{
  "version": "1.0.1"
}
```

Why `--tag latest`:

- this is the first stable release target
- `npm install -g looprelay` gets the stable release
- future prereleases can still use `--tag beta` or another explicit tag

## Install Commands After Publish

```sh
npm install -g looprelay
looprelay setup --profile coach --register-mcp --open-web
looprelay coach
looprelay doctor claude-code
looprelay doctor codex
looprelay server
```

## Required Local Gate Before Publishing

Run on a Node.js version that satisfies `package.json#engines.node` (`>=22.12 <25`):

```sh
corepack pnpm format
corepack pnpm test
corepack pnpm lint
corepack pnpm build
corepack pnpm pack:dry-run
corepack pnpm --silent benchmark -- --json
corepack pnpm e2e:browser
corepack pnpm smoke:release
corepack pnpm smoke:package-install
corepack pnpm evidence:quality -- --require-complete
corepack pnpm looprelay quality-evidence --require-complete
# after selecting a new version:
git tag -a v<new-version> -m "looprelay <new-version>"
git push origin v<new-version>
corepack pnpm npm-publish:preflight
git diff --check
```

The package install smoke builds, packs with `--ignore-scripts`, installs the
tarball into an isolated npm prefix, runs all shipped bin help commands,
verifies the installed `looprelay start --open-web --json` first-success guide,
and verifies the installed `looprelay quality-evidence --require-complete` release gate:

```sh
corepack pnpm smoke:package-install
```

## Publish Checklist

- [ ] package name is still available or already owned by the maintainer
- [ ] package is not marked private in `package.json`
- [ ] package manager is pinned to `pnpm@10.18.0`, and Node engine remains `>=22.12 <25`
- [ ] license, repository, homepage, bugs, keywords, publish access, and bin metadata are present in `package.json`
- [ ] `corepack pnpm npm-publish:preflight` reports `package publish access is public` and `package keywords include public positioning terms`
- [ ] package files include `dist`, Claude/Codex integration surfaces (`.claude-plugin`, `commands`, `plugins`, `integrations`), core integration docs (`docs/LOOPRELAY.md`, `docs/AGENT-HARNESS.md`, `docs/INSTRUCTION-FILES.md`, `docs/PLUGINS.md`, `docs/ADAPTERS.md`, `docs/LOOP-SNAPSHOT-SCHEMA.md`), the real benchmark fixture template (`docs/benchmark-fixtures/real.example.json`), release runbooks (`docs/NPM_PUBLISHING.md`, `docs/PACKAGE_CONTENTS.md`, `docs/PRE_PUBLISH_PRIVACY_AUDIT.md`, `docs/RELEASE_CHECKLIST.md`), release evidence docs, public docs (`README.md`, `README.ko.md`, `CHANGELOG.md`, `LICENSE`, `SECURITY.md`, `CODE_OF_CONDUCT.md`, `CONTRIBUTING.md`, `SUPPORT.md`), the npm publish preflight script, and core release verification scripts
- [ ] package files exclude `dist/**/*.map`
- [ ] version in `package.json` is bumped and has never been published
- [ ] `src/shared/version.ts` `VERSION` matches `package.json#version` (the
      vitest in `src/shared/version.test.ts` enforces this on every run)
- [ ] README is available in English and Korean and matches the actual feature set
- [ ] package contents contain built CLI/server/web assets
- [ ] all three bin entries exist after build:
  - `bin.looprelay` → `dist/cli/index.js`
  - `bin.lr-claude` → `dist/cli/lr-claude.js`
  - `bin.lr-codex` → `dist/cli/lr-codex.js`
- [ ] each bin file is executable after build (`scripts/fix-bin-mode.mjs`
      runs as part of `pnpm build:server` and chmods all three)
- [ ] `corepack pnpm pack:dry-run` excludes `dist/**/*.map` (source maps stay local)
- [ ] full release checklist (`docs/RELEASE_CHECKLIST.md`) passes
- [ ] pre-publish privacy audit (`docs/PRE_PUBLISH_PRIVACY_AUDIT.md`) passes
- [ ] npm account is authenticated
- [ ] 2FA/OTP requirement is available if npm asks for it
- [ ] a new annotated git tag matching `package.json#version` is created after the full gate
- [ ] the origin tag points at the same release commit and has never been moved
- [ ] `corepack pnpm npm-publish:preflight` passes
- [ ] publish uses `--tag latest` for the first stable release

## Do Not Publish Yet If

- `corepack pnpm smoke:release` fails
- `corepack pnpm pack:dry-run` does not include `dist/cli`, `dist/server`, or `dist/web`
- npm reports that `looprelay` is already taken by another owner
- the npm account cannot complete 2FA/OTP
- README still claims a feature that is not implemented

## Useful NPM Commands

```sh
npm whoami
npm view looprelay version
npm access list packages "$(npm whoami)" --json
npm publish --tag latest
npm dist-tag ls looprelay
npm view looprelay versions --json
git tag -a v<new-version> -m "looprelay <new-version>"
git push origin v<new-version>
```
