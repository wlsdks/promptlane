# 작업 계획

## 2026-07-09 PromptLane NPM Package Entry Existence Preflight Guard

- [x] CHECK: npm publish preflight checked that source-controlled package
  entries were listed in `package.json#files`, but did not fail closed if a
  listed docs/script/integration entry was missing from the repo.
- [x] RED: focused preflight JSON test required representative package entry
  existence checks for a directory, doc, and script.
- [x] GREEN: npm publish preflight now checks existence for source-controlled
  package entries while leaving build artifact `dist` to the build/package
  gates.
- [x] VERIFY: focused preflight/packaging tests, skip-npm preflight JSON,
  touched-file formatting, typecheck, and diff hygiene.

## 2026-07-09 PromptLane NPM Runtime Evidence Docs Preflight Guard

- [x] CHECK: `package.json#files` and package contents docs ship PromptLane
  runtime history, legacy-surface, dogfood evidence, rename/deprecation
  decision, native-dialog, and UI patrol readiness docs, but npm publish
  preflight did not check those compatibility/evidence package entries.
- [x] RED: focused preflight and packaging guards required machine-readable
  checks for those runtime and evidence doc package-file entries.
- [x] GREEN: npm publish preflight now checks the runtime, compatibility, and
  evidence docs before publish.
- [x] VERIFY: focused preflight/packaging tests, skip-npm preflight JSON,
  touched-file formatting, typecheck, and diff hygiene.

## 2026-07-09 PromptLane NPM Product Docs Preflight Guard

- [x] CHECK: release checklist requires product, architecture, technical,
  benchmark, and audit docs to ship in the npm package, but npm publish
  preflight did not check that product-doc package surface.
- [x] RED: focused preflight and packaging guards required machine-readable
  checks for the release checklist's product and architecture doc entries.
- [x] GREEN: npm publish preflight now checks those product docs as
  package-file entries before publish.
- [x] VERIFY: focused preflight/packaging tests, skip-npm preflight JSON,
  touched-file formatting, typecheck, and diff hygiene.

## 2026-07-09 PromptLane NPM Local Verification Scripts Preflight Guard

- [x] CHECK: `package.json#files` and release/package contents docs ship local
  verification, smoke, dogfood, MCP, benchmark, and UI patrol scripts, but npm
  publish preflight only checked a small subset before publish.
- [x] RED: focused preflight and packaging guards required machine-readable
  checks for the remaining local verification script package-file entries.
- [x] GREEN: npm publish preflight now checks the release checklist's shipped
  local verification scripts as package-file entries.
- [x] VERIFY: focused preflight/packaging tests, skip-npm preflight JSON,
  touched-file formatting, typecheck, and diff hygiene.

## 2026-07-09 PromptLane NPM Release Evidence Docs Preflight Guard

- [x] CHECK: `package.json#files` ships release evidence docs, but npm publish
  preflight did not check the evidence docs backing release stability, local 9.5,
  product positioning, UI patrol, and Codex/Claude integration readiness.
- [x] RED: focused preflight and packaging guards required machine-readable
  checks for the release evidence doc package-file entries.
- [x] GREEN: npm publish preflight now checks those release evidence docs, and
  the NPM runbook checklist names the same publish package surface.
- [x] VERIFY: focused preflight/packaging tests, skip-npm preflight JSON,
  touched-file formatting, typecheck, and diff hygiene.

## 2026-07-09 PromptLane NPM Release Runbook Docs Preflight Guard

- [x] CHECK: `package.json#files` ships release runbooks, but npm publish
  preflight did not check the operator docs that explain package contents,
  privacy audit, release checklist, and npm publish flow.
- [x] RED: focused preflight and packaging guards required machine-readable
  checks for `docs/NPM_PUBLISHING.md`, `docs/PACKAGE_CONTENTS.md`,
  `docs/PRE_PUBLISH_PRIVACY_AUDIT.md`, and `docs/RELEASE_CHECKLIST.md`.
- [x] GREEN: npm publish preflight now checks those release runbooks, and the
  NPM runbook checklist names the same publish package surface.
- [x] VERIFY: focused preflight/packaging tests, skip-npm preflight JSON,
  touched-file formatting, typecheck, and diff hygiene.

## 2026-07-09 PromptLane NPM Integration Docs Preflight Guard

- [x] CHECK: `package.json#files` ships core PromptLane integration docs, but
  npm publish preflight did not check the docs that installed Codex/Claude
  users and agents rely on.
- [x] RED: focused preflight and packaging guards required machine-readable
  checks for `docs/PROMPTLANE.md`, `docs/AGENT-HARNESS.md`,
  `docs/INSTRUCTION-FILES.md`, `docs/PLUGINS.md`, `docs/ADAPTERS.md`, and
  `docs/LOOP-SNAPSHOT-SCHEMA.md`.
- [x] GREEN: npm publish preflight now checks those core integration docs, and
  the NPM runbook checklist names the same publish package surface.
- [x] VERIFY: focused preflight/packaging tests, skip-npm preflight JSON,
  touched-file formatting, typecheck, and diff hygiene.

## 2026-07-09 PromptLane NPM Integration Files Preflight Guard

- [x] CHECK: `package.json#files` ships Claude/Codex integration surfaces, but
  npm publish preflight did not check `.claude-plugin`, `commands`, `plugins`,
  or `integrations` before publish.
- [x] RED: focused preflight and packaging guards required machine-readable
  checks for those integration package-file entries.
- [x] GREEN: npm publish preflight now checks the integration surfaces, and the
  NPM runbook checklist names the same publish package surface.
- [x] VERIFY: focused preflight/packaging tests, skip-npm preflight JSON,
  touched-file formatting, typecheck, and diff hygiene.

## 2026-07-09 PromptLane NPM Community Docs Preflight Guard

- [x] CHECK: `package.json#files` ships community support documents, but npm
  publish preflight did not check `CODE_OF_CONDUCT.md`, `CONTRIBUTING.md`, or
  `SUPPORT.md` before publish.
- [x] RED: focused preflight and packaging guards required machine-readable
  checks for those community doc package-file entries.
- [x] GREEN: npm publish preflight now checks the community docs, and the NPM
  runbook checklist groups them under public docs.
- [x] VERIFY: focused preflight/packaging tests, skip-npm preflight JSON,
  touched-file formatting, typecheck, and diff hygiene.

## 2026-07-09 PromptLane NPM Public Docs Preflight Guard

- [x] CHECK: NPM publishing checklist requires English/Korean README and
  public release documentation, but npm publish preflight only checked
  `README.md` and `LICENSE`.
- [x] RED: focused preflight and packaging guards required machine-readable
  checks for `README.ko.md`, `CHANGELOG.md`, and `SECURITY.md` package-file
  entries.
- [x] GREEN: npm publish preflight now checks those public docs, and the NPM
  runbook checklist names the same publish package surface.
- [x] VERIFY: focused preflight/packaging tests, skip-npm preflight JSON,
  touched-file formatting, typecheck, and diff hygiene.

## 2026-07-09 PromptLane NPM Release Scripts Preflight Guard

- [x] CHECK: release checklist and package contents require core release
  verification scripts to ship, but npm publish preflight only checked the
  preflight script itself.
- [x] RED: focused preflight and packaging guards required machine-readable
  checks for `scripts/pack-dry-run.mjs`, `scripts/package-install-smoke.mjs`,
  `scripts/quality-gate.mjs`, and `scripts/release-smoke.mjs`.
- [x] GREEN: npm publish preflight now checks those core release verification
  script entries, and the NPM runbook checklist documents the broader package
  file prerequisite.
- [x] VERIFY: focused preflight/packaging tests, skip-npm preflight JSON,
  touched-file formatting, typecheck, and diff hygiene.

## 2026-07-09 PromptLane NPM Engine Manager Preflight Guard

- [x] CHECK: `package.json` pins `packageManager` and Node engine for release
  install/build behavior, but `scripts/npm-publish-preflight.mjs` did not check
  them in the final publish gate.
- [x] RED: focused preflight and packaging guards required machine-readable
  checks for `package manager is pinned` and `node engine range is stable`.
- [x] GREEN: npm publish preflight now emits package manager and Node engine
  checks, and the NPM runbook checklist documents the same release
  prerequisites.
- [x] VERIFY: focused preflight/packaging tests, touched-file formatting,
  typecheck, and diff hygiene.

## 2026-07-09 PromptLane NPM Source Map Exclusion Preflight Guard

- [x] CHECK: release docs require `dist/**/*.map` to stay local-only, and
  `package.json#files` has `!dist/**/*.map`, but npm publish preflight did not
  check that exclusion.
- [x] RED: focused preflight and packaging guards required a machine-readable
  `package files exclude dist/**/*.map` check.
- [x] GREEN: npm publish preflight now checks the source-map exclusion and the
  NPM runbook checklist records the same release surface.
- [x] VERIFY: focused preflight/packaging tests, touched-file formatting,
  typecheck, and diff hygiene.

## 2026-07-09 PromptLane NPM Package Files Preflight Guard

- [x] CHECK: npm publish preflight only checked that
  `scripts/npm-publish-preflight.mjs` was in `package.json#files`, but did not
  directly check core publish allowlist entries like `dist`, `README.md`, and
  `LICENSE`.
- [x] RED: focused preflight and packaging guards required machine-readable
  checks for the core package files.
- [x] GREEN: npm publish preflight now iterates core package file entries and
  emits `package files include ...` checks; the NPM runbook checklist documents
  the same publish surface.
- [x] VERIFY: focused preflight/packaging tests, touched-file formatting,
  typecheck, and diff hygiene.

## 2026-07-09 PromptLane NPM All Bins Preflight Guard

- [x] CHECK: npm publish preflight checked only `bin.promptlane`, while
  `package.json` publishes three CLI entries: `promptlane`, `pl-claude`, and
  `pl-codex`.
- [x] RED: focused preflight and packaging guards required `pl-claude` and
  `pl-codex` bin checks in addition to `promptlane`.
- [x] GREEN: npm publish preflight now iterates the expected bin map and emits a
  check for every shipped CLI bin entry.
- [x] VERIFY: focused preflight/packaging tests, touched-file formatting,
  typecheck, and diff hygiene.

## 2026-07-09 PromptLane NPM Metadata Preflight Guard

- [x] CHECK: `package.json` has stable release metadata for license,
  repository, and `bin.promptlane`, but `scripts/npm-publish-preflight.mjs` did
  not include those checks in the single publish gate.
- [x] RED: preflight JSON test and packaging guard now require package metadata
  checks for MIT license, GitHub repository, and the `promptlane` bin entry.
- [x] GREEN: npm publish preflight now emits metadata checks, and the NPM
  runbook checklist mentions license, repository, and bin metadata.
- [x] VERIFY: focused preflight/packaging tests, touched-file formatting,
  typecheck, and diff hygiene.

## 2026-07-09 PromptLane NPM Private Publish Guard

- [x] CHECK: `scripts/npm-publish-preflight.mjs` checked version, scripts,
  files, git state, tag state, npm auth, and unpublished package state, but did
  not explicitly fail closed if `package.json#private` became `true`.
- [x] RED: packaging guard required a `package is publishable` preflight check
  backed by `packageJson.private !== true`.
- [x] GREEN: npm publish preflight now emits a `package is publishable` check,
  the NPM runbook checklist calls out the private flag, and a focused preflight
  test covers the machine-readable check.
- [x] VERIFY: focused packaging/preflight tests, touched-file formatting,
  typecheck, and diff hygiene.

## 2026-07-09 PromptLane NPM Useful Commands Tag Refresh

- [x] CHECK: `docs/NPM_PUBLISHING.md`의 Useful NPM Commands 섹션이 여전히
  `git tag -a v1.0.0`와 non-force push를 안내해, unpublished 1.0.0 release
  candidate polish 동안의 current tag-refresh policy와 충돌했다.
- [x] RED: public release surface guard now requires the NPM runbook to show
  `git tag -fa v1.0.0` and `git push origin v1.0.0 --force`, and rejects the
  stale `git tag -a v1.0.0` command.
- [x] GREEN: Useful NPM Commands now matches the same tag refresh command used
  by the preflight and release checklist before first publish.
- [x] VERIFY: focused public release surface guard, touched-file formatting,
  typecheck, and diff hygiene.

## 2026-07-09 PromptLane Implementation Plan Tag Order

- [x] CHECK: `docs/IMPLEMENTATION_PLAN.md` still described creating the
  annotated `v1.0.0` tag only after the full local release gate, while current
  npm preflight requires the tag to exist and point at HEAD before
  `corepack pnpm npm-publish:preflight`.
- [x] RED: public release surface guard now requires the implementation plan to
  say create or refresh the annotated tag before npm publish preflight and
  rejects the old after-gate-only wording.
- [x] GREEN: implementation plan release-readiness steps now place the tag before
  npm preflight and publish after the preflight.
- [x] VERIFY: focused public release surface guard, touched-file formatting,
  typecheck, and diff hygiene.

## 2026-07-09 PromptLane NPM Runbook Tag Order

- [x] CHECK: `docs/RELEASE_CHECKLIST.md` now requires creating or refreshing
  `v1.0.0` before `corepack pnpm npm-publish:preflight`, but
  `docs/NPM_PUBLISHING.md` still had a publish-checklist line saying the tag is
  created only after the local release gate passes.
- [x] RED: packaging guard now requires the NPM publishing runbook to state that
  `v1.0.0` is created or refreshed before npm preflight, and rejects the stale
  after-gate-only wording.
- [x] GREEN: NPM publishing runbook local gate and publish checklist now place
  the annotated tag before `corepack pnpm npm-publish:preflight`.
- [x] VERIFY: focused packaging guard, touched-file formatting, typecheck, and
  diff hygiene.

## 2026-07-08 PromptLane Package Contents Script List

- [x] CHECK: `docs/PACKAGE_CONTENTS.md` shipped script 목록에서 일부 release
  scripts가 한 줄에 몰려 있어 1.0.0 공개 전 tarball 리뷰와 drift 검토가
  어렵다.
- [x] RED: packaging guard가 `package.json#files`에 실리는 핵심 검증
  script마다 package contents 문서의 독립 markdown list item을 요구하도록
  실패를 확인했다.
- [x] GREEN: local verification scripts 섹션을 script별 list item으로 정리해
  package contents 문서가 release review checklist처럼 읽히게 했다.
- [x] VERIFY: focused packaging guard, touched-file formatting, typecheck, and
  diff hygiene.

## 2026-07-08 PromptLane Release Checklist Tag Order

- [x] CHECK: release checklist told operators to run
  `corepack pnpm npm-publish:preflight` before creating the `v1.0.0` tag, but
  the preflight itself fails unless `v1.0.0` already points at HEAD.
- [x] RED: packaging guard now requires the release checklist to create or
  refresh `v1.0.0` before `corepack pnpm npm-publish:preflight` and rejects the
  old after-every-gate tag wording.
- [x] GREEN: release checklist now places tag creation/refresh before the npm
  publish preflight and distinguishes unpublished 1.0.0 tag refresh from
  post-publish version bump.
- [x] VERIFY: focused release checklist guard, touched-file formatting,
  typecheck, diff hygiene, and post-merge preflight.

## 2026-07-08 PromptLane Release Checklist Preflight JSON

- [x] CHECK: NPM publishing runbook documents the silent machine-readable
  preflight JSON command, but the release checklist only documented silent
  quality evidence JSON. Focused guard also exposed that Architecture omitted
  the installed `promptlane start --open-web --json` package-smoke path.
- [x] RED: packaging guard requires `docs/RELEASE_CHECKLIST.md` to mention
  `corepack pnpm --silent npm-publish:preflight -- --json` and still requires
  Architecture to mention the installed start guide path.
- [x] GREEN: release checklist now documents the parseable npm preflight JSON
  command, and Architecture records that package install smoke verifies the
  installed start guide.
- [x] VERIFY: focused packaging guards, touched-file formatting, typecheck,
  diff hygiene, and post-merge preflight.

## 2026-07-08 PromptLane NPM Preflight JSON Runbook

- [x] CHECK: `npm-publish:preflight -- --json` through a normal pnpm script
  prints pnpm script banners before JSON, while `corepack pnpm --silent
  npm-publish:preflight -- --json` stays machine-parseable.
- [x] RED: packaging guard now requires `docs/NPM_PUBLISHING.md` to document
  the silent machine-readable preflight command.
- [x] GREEN: npm publishing runbook includes the silent JSON preflight command
  and explains why it is the parseable path.
- [x] VERIFY: focused publishing guard, real silent JSON preflight, touched-file
  formatting, typecheck, diff hygiene, and post-merge preflight.

## 2026-07-08 PromptLane Preflight Tag Mismatch Next Action

- [x] CHECK: tag mismatch detail now includes the unpublished 1.0.0 tag refresh
  policy, but `next_action` still returned generic `Fix blocked checks before
  publishing.`
- [x] RED: fake-git preflight test now requires tag mismatch `next_action` to
  include the tagged checkout path, `git tag -fa v1.0.0`, and version bump path.
- [x] GREEN: `npm-publish:preflight` now emits a tag mismatch-specific next
  action instead of generic blocker guidance.
- [x] VERIFY: focused preflight/packaging guards, touched-file formatting,
  typecheck, diff hygiene, and post-merge preflight.

## 2026-07-08 PromptLane Preflight Tag Refresh Guidance

- [x] CHECK: `docs/NPM_PUBLISHING.md` now distinguishes unpublished 1.0.0 tag
  refresh from post-publish version bump, but `npm-publish:preflight` tag
  mismatch output still told operators only to publish from the old tag or bump.
- [x] RED: fake-git preflight test and packaging guard now require tag mismatch
  detail to mention unpublished `promptlane@1.0.0` tag refresh and
  already-published version bump.
- [x] GREEN: preflight tag mismatch detail includes the tagged-checkout path,
  `git tag -fa v1.0.0` for unpublished intended-release HEAD, and version bump
  for already-published versions.
- [x] VERIFY: focused preflight/packaging guards, touched-file formatting,
  typecheck, diff hygiene, and post-merge preflight.

## 2026-07-08 PromptLane Pre-Publish Tag Refresh Policy

- [x] CHECK: `docs/NPM_PUBLISHING.md` still implied that a newer main commit
  after `v1.0.0` should publish from the old tag or bump, while current 1.0.0
  release-candidate polishing needs a clear pre-publish tag refresh policy.
- [x] RED: packaging guard now requires separate policy for refreshing
  `v1.0.0` before `promptlane@1.0.0` is published and bumping after it is
  published.
- [x] GREEN: npm publishing runbook documents `git tag -fa v1.0.0` only for
  unpublished 1.0.0 release-candidate refreshes and forbids retargeting after
  publication.
- [x] VERIFY: focused packaging guard, touched-file formatting, typecheck,
  diff hygiene, and post-merge preflight.

## 2026-07-08 PromptLane NPM Post-Publish First Run Guide

- [x] CHECK: README first-success path uses
  `promptlane setup --profile coach --register-mcp --open-web` plus
  `promptlane coach`, but `docs/NPM_PUBLISHING.md` still told post-publish
  users to run bare `promptlane setup`.
- [x] RED: packaging guard now requires the npm publishing runbook to include
  the full setup/open-web/coach path and reject the bare setup command.
- [x] GREEN: npm publishing install-after-publish commands now match the
  verified first-success path.
- [x] VERIFY: focused packaging guard, typecheck, touched-file formatting,
  skip-npm preflight after commit, and diff hygiene.

## 2026-07-08 PromptLane Installed Quality Evidence Smoke

- [x] CHECK: `smoke:package-install` installs the tarball and checks first-run
  guidance, but it still does not prove the installed package can run the
  release-gate `promptlane quality-evidence --require-complete` command away
  from the repository working directory.
- [x] RED: packaging guard requires the package install smoke to execute the
  installed quality-evidence gate from an isolated cwd and requires release
  stability evidence to mention that installed gate.
- [x] GREEN: package install smoke runs installed bin checks from the isolated
  HOME/prefix context, validates quality evidence output, and records the
  installed release-gate command in smoke JSON.
- [x] VERIFY: focused packaging guard, real package install smoke, typecheck,
  formatting, diff hygiene, and npm publish preflight.

## 2026-07-08 PromptLane Package Smoke Start Guide

- [x] CHECK: `smoke:package-install` verified shipped bin help paths but did
  not execute the first user-facing command, `promptlane start --open-web
  --json`, from the installed tarball.
- [x] RED: packaging guard now requires package install smoke to run and
  validate `promptlane start --open-web --json`, and release stability evidence
  to mention that first-success check.
- [x] GREEN: package install smoke parses the installed start guide JSON and
  verifies setup, coach, and doctor commands are present.
- [x] VERIFY: focused packaging guards, real package install smoke, typecheck,
  formatting, and diff hygiene.

## 2026-07-08 PromptLane Korean README MCP Troubleshooting Parity

- [x] CHECK: English first 3-minute loop tells users to rerun
  `setup --register-mcp` before manual MCP commands, while Korean README showed
  manual `mcp add` comments directly in the doctor block.
- [x] RED: README guard now requires the Korean first 3-minute section to say
  MCP failure should rerun setup first and leave manual MCP commands as advanced
  troubleshooting.
- [x] GREEN: README.ko first 3-minute troubleshooting now mirrors the English
  order and explains why setup registration is preferred.
- [x] VERIFY: focused README guards, pack dry-run, formatting, and diff hygiene.

## 2026-07-08 PromptLane Korean README First Capture Parity

- [x] CHECK: Korean README Codex quick start omitted `--open-web`, and Capture
  check omitted `promptlane coach`, while English README included both in the
  first-success path.
- [x] RED: section-scoped README guard now requires the Korean Codex quick start
  and capture check sections to match the English first capture path.
- [x] GREEN: README.ko Codex setup now uses `--open-web`, and Capture check
  includes `promptlane coach`.
- [x] VERIFY: focused README guards, pack dry-run, test formatting, and diff
  hygiene.

## 2026-07-08 PromptLane Korean README Dev Setup Parity

- [x] CHECK: English README local development quick start uses `pnpm install`
  plus `pnpm setup` and explains the `prepare` build lifecycle, but
  README.ko still stopped at `pnpm build`.
- [x] RED: packaging guard now requires both English and Korean README to
  document `pnpm setup`, `prepare`, and the full
  `pnpm promptlane setup --profile coach --register-mcp --open-web` alias.
- [x] GREEN: README.ko local development setup now matches the English
  install/setup path and explains the prepare lifecycle.
- [x] VERIFY: focused README guards, pack dry-run, formatting, and diff hygiene.

## 2026-07-08 PromptLane Public Release Gate Docs

- [x] CHECK: `docs/IMPLEMENTATION_PLAN.md`, `docs/TECH_SPEC.md`, `docs/PRD.md`
  still showed bare `pnpm` release gates and omitted package install / quality
  evidence gates.
- [x] RED: public release surface packaging guard now requires the current
  `corepack pnpm` release gate in all three docs and rejects stale bare `pnpm`
  gate commands.
- [x] GREEN: implementation plan, tech spec, and PRD release gate sections now
  match the current local-first release gate.
- [x] VERIFY: focused packaging doc guards, built quality evidence CLI gate,
  and diff hygiene.

## 2026-07-08 PromptLane Release Evidence Pack Count Drift

- [x] CHECK: current `corepack pnpm pack:dry-run` reports 369 files, but
  `docs/RELEASE_STABILITY_EVIDENCE_2026-07-06.md` still hardcoded
  `359 files`.
- [x] RED: packaging guard now rejects exact tarball file-count phrases in
  release stability evidence and requires `expected shipped files` wording.
- [x] GREEN: release stability evidence now points to pack dry-run validating
  expected shipped files instead of a stale exact file count.
- [x] VERIFY: focused packaging guard, current pack dry-run, and diff hygiene.

## 2026-07-08 PromptLane Quality Evidence Package Install Gate

- [x] CHECK: `docs/NPM_PUBLISHING.md`와 release checklist에는
  `smoke:package-install`이 추가됐지만 `quality-evidence` JSON release gate,
  Architecture, 9.5 plan/backlog/release evidence는 아직 이전 gate를 말했다.
- [x] RED: quality evidence script/CLI tests가 release gate에
  `corepack pnpm smoke:package-install`과 bin install purpose를 요구하고
  현재 JSON 누락으로 실패한다.
- [x] GREEN: `scripts/quality-95-evidence.mjs` release gate와 관련 문서
  표면을 package install smoke까지 포함하도록 정렬했다.
- [x] VERIFY: focused quality evidence tests, packaging drift guards, actual
  quality evidence CLI output, typecheck, formatting, diff hygiene를 확인한다.

## 2026-07-08 PromptLane Package Install Smoke Gate

- [x] CHECK: 수동 npm tarball install smoke는 통과했지만 runbook 명령이
  shell detail에 취약해 반복 release gate로 쓰기 어렵다.
- [x] RED: packaging guard가 `smoke:package-install` 스크립트 등록,
  shipped script 포함, npm publishing runbook 사용을 요구하고 현재
  `scripts/package-install-smoke.mjs` 누락으로 실패한다.
- [x] GREEN: build, pack, isolated global install, three bin help checks를
  수행하는 package install smoke script를 추가하고 release docs를 정리한다.
- [x] VERIFY: focused packaging guard, package install smoke, touched-file
  formatting, diff hygiene, publish preflight 상태를 확인한다.

## 2026-07-08 PromptLane NPM Preflight Detail Length

- [x] CHECK: tag mismatch preflight detail used the new tagged-checkout
  guidance, but the shared detail cap truncated the sentence before
  `new tag for this commit.`
- [x] RED: fake-git preflight test now requires the full tag mismatch recovery
  sentence to include `new tag for this commit.`
- [x] GREEN: preflight check detail cap increased enough for current release
  operator guidance while preserving npm token sanitization.
- [x] VERIFY: focused preflight tests, packaging tests, post-merge preflight
  checks, touched-file formatting, typecheck, and diff hygiene.

## 2026-07-08 PromptLane NPM Preflight Tag Mismatch Copy

- [x] CHECK: `docs/NPM_PUBLISHING.md` no longer claimed `v1.0.0` predates the
  preflight script, but `scripts/npm-publish-preflight.mjs` still told tag
  mismatch users to use manual npm checks if the checkout predates preflight.
- [x] RED: packaging and fake-git preflight tests now reject
  `manual npm checks` / `predates this preflight` guidance and require rerunning
  `corepack pnpm npm-publish:preflight` from the tagged checkout.
- [x] GREEN: tag mismatch detail now tells operators to checkout the release
  tag, rerun the current preflight from that tagged checkout, and publish from
  that commit or bump/create a new tag.
- [x] VERIFY: focused preflight tests, packaging tests, real post-merge
  preflight/tag check, touched-file formatting, typecheck, and diff hygiene.

## 2026-07-08 PromptLane NPM Preflight Auth Next Action

- [x] CHECK: current publish preflight correctly blocks on missing npm auth,
  but its `next_action` was the generic "Fix blocked checks before publishing."
  even when npm authentication is the only remaining blocker.
- [x] RED: added a fake-npm preflight test that isolates the npm auth failure
  path and requires `npm login`, rerunning
  `corepack pnpm npm-publish:preflight`, and `npm publish --tag latest` in the
  JSON `next_action`.
- [x] GREEN: preflight now derives `next_action` from failed check labels and
  gives a publish-specific operator action for npm auth and already-published
  version blockers.
- [x] VERIFY: focused npm preflight test, packaging tests, post-merge
  skip-npm preflight/tag check, touched-file formatting, typecheck, and diff
  hygiene.

## 2026-07-08 PromptLane NPM Publish Runbook Current Tag

- [x] CHECK: `v1.0.0` now points at current main and
  `npm-publish:preflight` exists on the release commit, but
  `docs/NPM_PUBLISHING.md` still said the tag predates the preflight script.
- [x] RED: packaging guard now rejects stale publish-runbook copy that says the
  release tag predates `scripts/npm-publish-preflight.mjs`.
- [x] GREEN: publish runbook now tells operators that `v1.0.0` must point at
  the commit being published and runs `corepack pnpm npm-publish:preflight`
  from the tagged checkout.
- [x] VERIFY: focused npm publishing docs guard, packaging tests, touched-file
  formatting, typecheck, and diff hygiene.

## 2026-07-08 PromptLane Benchmark Archive Effectiveness Coverage

- [x] CHECK: `corepack pnpm benchmark -- --json` passed but reported
  `archive_effectiveness_score: 1` while only 1 of 5 synthetic prompts had
  linked outcome evidence, making benchmark usefulness too easy to overstate.
- [x] RED: benchmark contract packaging guard now requires
  `archive_effectiveness_coverage` in the benchmark runner and spec, plus a
  docs statement that coverage is measurement depth rather than archive-wide
  proof.
- [x] GREEN: benchmark JSON now reports
  `archive_effectiveness_coverage`, gates the synthetic corpus at 0.2, and the
  benchmark spec documents the metric and current 0.2 sample value.
- [x] VERIFY: focused benchmark contract test, current benchmark JSON, touched
  file formatting, typecheck, and diff hygiene.

## 2026-07-08 PromptLane Quality Evidence Header Row Guard

- [x] CHECK: 1.0.0 release smoke failed because the 9.5 scorecard Markdown
  header row was parsed as a real `axis` scorecard row after table formatting
  changed whitespace.
- [x] RED: focused quality evidence script and CLI tests reproduced
  `status: pending`, 8 parsed scorecard axes, and `--require-complete` failure.
- [x] GREEN: scorecard parsing now rejects header/separator rows after cell
  normalization, and tests guard against a synthetic `id: "axis"` row.
- [x] VERIFY: focused quality evidence tests, release smoke, pack dry-run,
  evidence quality require-complete, typecheck, code/test formatting, and diff
  hygiene.

## 2026-07-08 PromptLane README Release Smoke Corepack Commands

- [x] CHECK: README/README.ko release smoke examples still used bare
  `pnpm smoke:release` and `pnpm e2e:browser`, and the 9.5 quality plan still
  showed a stale `pnpm build && node scripts/loop-memory-approval-dogfood.mjs`
  test expectation.
- [x] RED: packaging guard now requires README release smoke commands and the
  quality-plan dogfood script snippet to use packageManager-pinned `corepack
  pnpm`.
- [x] GREEN: README release smoke commands and the 9.5 plan snippet now use
  `corepack pnpm` consistently.
- [x] VERIFY: focused README release-smoke guard, packaging tests, typecheck,
  touched-file formatting, quality lint, and diff whitespace check.

## 2026-07-08 PromptLane Smoke Dogfood Corepack Build

- [x] CHECK: most benchmark/e2e/smoke/dogfood package scripts still invoked
  bare `pnpm build`, and their missing-build hints said `pnpm build`, while
  release gates now use packageManager-pinned `corepack pnpm`.
- [x] RED: packaging guard now requires all build-backed benchmark/e2e/smoke
  and dogfood scripts to start with `corepack pnpm build &&`.
- [x] GREEN: build-backed benchmark/e2e/smoke/dogfood scripts and missing-build
  hints now use `corepack pnpm build`.
- [x] VERIFY: focused build-backed script guard, packaging tests, typecheck,
  touched-file formatting, quality lint, and diff whitespace check.

## 2026-07-08 PromptLane Agent Setup Smoke Corepack Build

- [x] CHECK: `smoke:agent-setup` still invoked bare `pnpm build`, and the
  smoke script missing-build recovery hint also said `pnpm build`, while release
  gates and docs now use packageManager-pinned `corepack pnpm`.
- [x] RED: packaging guard now requires `smoke:agent-setup` and the smoke
  script prerequisite message to use `corepack pnpm build`.
- [x] GREEN: `smoke:agent-setup` now runs `corepack pnpm build` before the
  isolated setup/doctor smoke, and the missing-build hint matches.
- [x] VERIFY: focused setup smoke packaging guard, packaging tests, typecheck,
  touched-file formatting, quality lint, and diff whitespace check.

## 2026-07-08 PromptLane Architecture Release Gate Corepack Alignment

- [x] CHECK: `docs/ARCHITECTURE.md` still documented the normal release gate
  with bare `pnpm` and omitted benchmark, browser E2E, release smoke, and 9.5
  quality evidence checks now required by release checklist and publish runbook.
- [x] RED: packaging guard now requires Architecture to include the current
  `corepack pnpm` release gate and reject the stale bare `pnpm test` gate.
- [x] GREEN: Architecture testing expectations now use
  `corepack pnpm pack:dry-run` and list the current local-first release gate.
- [x] VERIFY: focused release-checklist packaging guard, packaging tests,
  typecheck, touched-file formatting, quality lint, and diff whitespace check.

## 2026-07-08 PromptLane README Quality Evidence Corepack Commands

- [x] CHECK: README and README.ko documented the release/goal-completion
  `quality-evidence --require-complete` gate with bare `pnpm`, while release
  checklist, NPM publishing runbook, and quality evidence JSON use
  `corepack pnpm` to avoid package-manager drift.
- [x] RED: packaging guard now requires both READMEs to show
  `corepack pnpm promptlane quality-evidence --require-complete` and reject the
  bare `pnpm promptlane quality-evidence --require-complete` line.
- [x] GREEN: README quality-evidence command blocks now use `corepack pnpm`
  for text, JSON, operator brief, and require-complete examples.
- [x] VERIFY: focused quality-evidence packaging guard, packaging tests,
  typecheck, touched-file formatting, quality lint, and diff whitespace check.

## 2026-07-08 PromptLane NPM Publish Quality Gate Alignment

- [x] CHECK: `docs/RELEASE_CHECKLIST.md` and quality evidence JSON require
  both `corepack pnpm evidence:quality -- --require-complete` and built product
  CLI `corepack pnpm promptlane quality-evidence --require-complete`, but
  `docs/NPM_PUBLISHING.md` omitted both from the publish-local gate.
- [x] RED: packaging guard now requires the NPM publishing runbook to include
  both quality evidence commands before npm preflight.
- [x] GREEN: NPM publishing runbook's required local gate now includes repo
  evidence quality and built CLI quality-evidence parity checks before publish
  preflight.
- [x] VERIFY: focused packaging guard, packaging tests, typecheck,
  touched-file formatting, quality lint, and diff whitespace check.

## 2026-07-08 PromptLane NPM Publishing Live Readiness

- [x] CHECK: `docs/NPM_PUBLISHING.md` still presented a 2026-05-02
  `npm whoami` and E404 lookup as current readiness, while live checks on
  2026-07-08 returned `npm whoami` `E401 Unauthorized` and `promptlane`
  registry lookup `E404 Not Found`.
- [x] RED: packaging guard requires the runbook to use `## Live Readiness Checks`,
  warn against treating older `npm whoami` notes as publish approval, include
  live npm auth/version commands, and remove stale fixed output examples.
- [x] GREEN: NPM publishing runbook now records dated live observations only as
  operator notes and routes publish approval through same-checkout preflight.
- [x] VERIFY: focused packaging guard, implementation format check, typecheck,
  and diff whitespace check.

## 2026-07-08 PromptLane NPM Publish Tag Guidance

- [x] CHECK: `v1.0.0` 태그 이후 main이 preflight 추가 커밋으로 이동해,
  현재 main에서 publish하면 태그 커밋과 package commit이 달라질 수 있다.
- [x] RED: packaging guard가 NPM publishing runbook과 preflight script에
  `git checkout v1.0.0` 및 tagged release commit 복구 안내를 요구하게 해 현재
  안내 누락 실패를 확인한다.
- [x] GREEN: tag mismatch detail이 tagged release commit과 HEAD 차이를 설명하고
  `git checkout ${expectedTag}` 또는 version bump/new tag 경로를 안내하게 한다.
- [x] VERIFY: focused packaging guard, preflight tag-mismatch JSON smoke,
  implementation format check, typecheck, diff whitespace check를 실행한다.

## 2026-07-08 PromptLane NPM Publish Preflight

- [x] CHECK: 1.0.0 tag 이후 npm publish는 수동 runbook에 의존해 npm auth,
  이미 게시된 버전, clean/tag 상태를 publish 직전에 fail-closed로 확인하기 어렵다.
- [x] RED: packaging guard가 `scripts/npm-publish-preflight.mjs`,
  `npm-publish:preflight` package script, NPM publishing runbook의
  `corepack pnpm npm-publish:preflight` 문구를 요구하게 해 현재 누락 실패를 확인한다.
- [x] GREEN: publish를 실행하지 않는 npm publish preflight script를 추가하고
  package files, runbook, release checklist와 정렬한다.
- [x] VERIFY: focused packaging guard, preflight offline/json smoke,
  implementation format check, typecheck, diff whitespace check를 실행한다.

## 2026-07-08 PromptLane Release Smoke Quality Evidence CLI Gate

- [x] CHECK: release gate는 product CLI `quality-evidence --require-complete`를 요구하지만
  `scripts/release-smoke.mjs`는 built CLI의 quality evidence command를 직접 실행하지 않아
  release smoke만으로 installed CLI parity 회귀를 잡기 어렵다.
- [x] RED: packaging guard가 release smoke script 안의 `quality-evidence`와
  `--require-complete` 실행을 요구하게 해 현재 누락 실패를 확인한다.
- [x] GREEN: release smoke 마지막 단계가 built `dist/cli/index.js quality-evidence
  --require-complete`를 실행하고 complete status, corepack product CLI gate 문구,
  raw home path 부재를 확인한다.
- [x] VERIFY: focused release checklist packaging guard, quality evidence JSON smoke,
  implementation format check, typecheck, diff whitespace check를 실행한다.

## 2026-07-08 PromptLane Quality Evidence Corepack CLI Gate

- [x] CHECK: 9.5 quality release gate 대부분은 `corepack pnpm ...`을 쓰지만
  installed CLI parity 항목만 bare `pnpm promptlane quality-evidence --require-complete`를
  가리켜 package-manager PATH 의존성을 다시 만들 수 있다.
- [x] RED: quality evidence CLI/script/packaging tests가 release gate와 release checklist에
  `corepack pnpm promptlane quality-evidence --require-complete`를 요구하게 해 현재
  bare `pnpm promptlane...` drift 실패를 확인한다.
- [x] GREEN: `scripts/quality-95-evidence.mjs`와 release/backlog/quality-plan 문서의
  installed CLI parity gate를 `corepack pnpm promptlane ...`로 정렬한다.
- [x] VERIFY: focused quality-evidence CLI/packaging tests, quality evidence JSON smoke,
  implementation format check, typecheck, diff whitespace check를 실행한다.

## 2026-07-08 PromptLane Server Problem Quoted Detail Redaction

- [x] CHECK: server problem sanitizer가 raw-detail key phrase를 redaction하지만
  quoted 값 안에 공백이 있으면 첫 단어까지만 치환해 prompt/session summary fragment를
  problem response에 남길 수 있다.
- [x] RED: `src/server/errors.test.ts`가 `prompt_body="..."`와
  `compactSummary:'...'` quoted values 전체가 redaction되고 내부 문구가 남지 않도록
  요구하게 해 현재 partial redaction 실패를 확인한다.
- [x] GREEN: raw-detail key sanitizer regex가 double/single quoted value를 우선 통째로
  매칭한 뒤 unquoted fallback을 처리해 quoted prompt/session detail을 raw-free로 만든다.
- [x] VERIFY: focused server problem/validation tests, implementation format
  check, typecheck, diff whitespace check를 실행한다.

## 2026-07-08 PromptLane Server Problem Title Redaction

- [x] CHECK: server `problem()` factory가 `detail`, `instance`, `errors[]`는
  redaction하지만 top-level `title`과 title-derived `type` URL은 원문 title에서
  만들어 future route/server problem title이 raw local path/token을 response payload에
  남길 수 있다.
- [x] RED: `src/server/errors.test.ts`가 problem `title`과 `type` URL 안의
  `/Users/...`, `sk-proj-...` raw token이 남지 않도록 요구하게 해 현재 raw title/type
  passthrough 실패를 확인한다.
- [x] GREEN: server problem factory가 `title`에도 기존 problem text sanitizer를 적용하고
  `type` slug도 sanitized title에서 파생해 top-level problem metadata를 raw-free로 만든다.
- [x] VERIFY: focused server problem/validation tests, implementation format
  check, typecheck, diff whitespace check를 실행한다.

## 2026-07-08 PromptLane Server Problem Detail Redaction

- [x] CHECK: server `problem()` factory가 `errors[]`와 `instance`는 redaction하지만
  top-level `detail`은 그대로 전달해 future route/server error detail이 raw prompt body,
  local path, provider token을 response payload와 `Error.message`에 남길 수 있다.
- [x] RED: `src/server/errors.test.ts`가 problem `detail` 안의 `prompt_body=...`,
  `/Users/...`, `sk-proj-...`를 redaction token으로 치환하고 `Error.message`도 같은
  raw-free detail을 쓰도록 요구하게 해 현재 raw detail passthrough 실패를 확인한다.
- [x] GREEN: server problem factory가 `detail`에도 기존 problem text sanitizer를 적용해
  top-level problem response와 thrown error message를 중앙에서 raw-free로 만든다.
- [x] GREEN: shared bearer detector가 실제 bearer credential은 계속 마스킹하되
  사용자 안내 문구의 일반 `bearer token` phrase는 credential로 오탐하지 않게 한다.
- [x] VERIFY: focused server problem/validation tests, implementation format
  check, typecheck, diff whitespace check를 실행한다.

## 2026-07-08 PromptLane Server Problem Instance Redaction

- [x] CHECK: server `problem()` factory가 `errors[].field/message`는 redaction하지만
  `instance`는 그대로 전달해 `request.url` query에 raw local path/token이 들어오면
  problem response에 남길 수 있다.
- [x] RED: `src/server/errors.test.ts`가 problem `instance` 안의 `/Users/...`와
  `sk-proj-...` raw token이 response payload에 남지 않도록 요구하게 해 현재 raw
  instance passthrough 실패를 확인한다.
- [x] GREEN: server problem factory가 `instance`에도 기존 problem text sanitizer를 적용해
  route path는 유지하면서 raw query/path/token detail을 중앙에서 raw-free로 만든다.
- [x] VERIFY: focused server problem/validation tests, implementation format
  check, typecheck, diff whitespace check를 실행한다.

## 2026-07-08 PromptLane Server Problem Field Redaction

- [x] CHECK: server `problem()` factory가 validation `errors[].message`는 redaction하지만
  `errors[].field`는 그대로 전달해 future custom validation field가 raw local path/token을
  problem response에 남길 수 있다.
- [x] RED: `src/server/errors.test.ts`가 problem error field 안의 `/Users/...`와
  `sk-proj-...`를 shared detector redaction token으로 치환하도록 요구하게 해 현재 raw field
  passthrough 실패를 확인한다.
- [x] GREEN: server problem factory가 `errors[].field`에도 기존 problem error sanitizer를 적용해
  정상 field name은 유지하면서 raw path/token field만 중앙에서 raw-free로 만든다.
- [x] VERIFY: focused server problem/validation tests, implementation format
  check, typecheck, diff whitespace check를 실행한다.

## 2026-07-08 PromptLane Server Problem Error Redaction

- [x] CHECK: `problem()` factory가 validation `errors[].message`를 그대로 전달해
  future route/Zod/custom validation issue가 raw prompt detail, local path, provider token을
  server problem response에 남길 수 있다.
- [x] RED: `src/server/errors.test.ts`가 problem error message 안의
  `prompt_body=...`, `/Users/...`, `sk-proj-...`를 각각 `[REDACTED:...]` token으로
  치환하도록 요구하게 해 현재 raw message passthrough 실패를 확인한다.
- [x] GREEN: server problem factory가 `errors[].message`에 한해 raw-detail key phrase와
  shared sensitive detectors를 적용해 route별 validation mapping을 중앙에서 raw-free로 만든다.
- [x] VERIFY: focused server problem/validation tests, implementation format
  check, typecheck, diff whitespace check를 실행한다.

## 2026-07-08 PromptLane Web Error Description Detail

- [x] CHECK: `failApi`가 auth/OAuth-style failed response의 `error_description`을
  무시하고 짧은 `error` code만 표시해 settings/session recovery detail이 사라질 수 있다.
- [x] RED: `src/web/src/api.test.ts`가 `error: "invalid_session"`와 함께 온
  `error_description` recovery sentence를 사용자-visible error suffix로 우선 보존하도록 요구하게 해
  현재 짧은 code만 표시되는 실패를 확인한다.
- [x] GREEN: web API failed response detail assembly가 `error_description`을 기존
  `apiErrorText` sanitizer fallback으로 보내고 `error` code보다 우선 표시한다.
- [x] VERIFY: focused web API failed response detail/redaction tests, implementation
  format check, typecheck, diff whitespace check를 실행한다.

## 2026-07-08 PromptLane Web JSON String Error Detail

- [x] CHECK: `failApi`가 failed response JSON body를 object shape로만 해석해
  valid JSON string body의 settings/session recovery detail이 사라질 수 있다.
- [x] RED: `src/web/src/api.test.ts`가 failed response JSON string의 recovery sentence를
  사용자-visible error suffix로 보존하도록 요구하게 해 현재 suffix 누락 실패를 확인한다.
- [x] GREEN: web API failed response detail assembly가 parsed body 자체도 기존
  `apiErrorText` sanitizer fallback으로 먼저 확인해 string JSON body를 raw-free detail로 표시한다.
- [x] VERIFY: focused web API failed response detail/redaction tests, implementation
  format check, typecheck, diff whitespace check를 실행한다.

## 2026-07-08 PromptLane Web Real Text Response Error Detail

- [x] CHECK: `failApi`가 JSON parse 실패 후 같은 `Response`에서 `text()`를 읽어
  mock text response는 통과하지만 실제 Fetch `Response`에서는 body가 이미 소비되어 text/plain
  recovery detail이 사라질 수 있다.
- [x] RED: `src/web/src/api.test.ts`가 실제 `new Response(text, { status: 401 })` 기반
  settings failed response의 recovery sentence를 사용자-visible error suffix로 보존하도록 요구하게 해
  현재 suffix 누락 실패를 확인한다.
- [x] GREEN: web API failed response detail assembly가 JSON parse 전에 `response.clone()`
  fallback을 준비하고 parse 실패 시 clone에서 text를 읽어 기존 `apiErrorText` sanitizer를 거쳐 표시한다.
- [x] VERIFY: focused web API failed response detail/redaction tests, implementation
  format check, typecheck, diff whitespace check를 실행한다.

## 2026-07-08 PromptLane Web Text Error Detail Redaction

- [x] CHECK: `failApi`가 failed response를 JSON으로만 읽고 parse 실패 시 body text를
  버려 text/plain settings/session recovery detail이 사라질 수 있다.
- [x] RED: `src/web/src/api.test.ts`가 text/plain 401 response의 recovery sentence를
  사용자-visible error suffix로 보존하도록 요구하게 해 현재 suffix 누락 실패를 확인한다.
- [x] GREEN: web API failed response detail assembly가 JSON parse 실패 시 `response.text()`
  fallback을 시도하고 기존 `apiErrorText` sanitizer를 거친 text만 suffix로 표시한다.
- [x] VERIFY: focused web API failed response detail/redaction tests, implementation
  format check, typecheck, diff whitespace check를 실행한다.

## 2026-07-08 PromptLane Web Errors Field Detail Redaction

- [x] CHECK: `failApi`가 `errors[]` array는 issue detail로 처리하지만 common
  `{ errors: "..." }` string payload는 무시해 settings/session recovery detail이 사라질 수 있다.
- [x] RED: `src/web/src/api.test.ts`가 settings failed response `errors` string의
  recovery sentence를 사용자-visible error suffix로 보존하도록 요구하게 해 현재 suffix 누락 실패를 확인한다.
- [x] GREEN: web API failed response detail assembly가 string `errors`도 기존
  `apiErrorText` sanitizer fallback으로 보내 recovery text를 보존하고 array issue handling과 충돌하지 않게 한다.
- [x] VERIFY: focused web API failed response detail/redaction tests, implementation
  format check, typecheck, diff whitespace check를 실행한다.

## 2026-07-08 PromptLane Web Error Field Detail Redaction

- [x] CHECK: `failApi`가 failed response의 top-level `detail`/`title`/`message`는
  표시하지만 common `{ error: "..." }` payload는 무시해 settings/session recovery detail이
  사라질 수 있다.
- [x] RED: `src/web/src/api.test.ts`가 settings failed response `error` field의
  recovery sentence를 사용자-visible error suffix로 보존하도록 요구하게 해 현재 suffix 누락 실패를 확인한다.
- [x] GREEN: web API failed response detail assembly가 `error` string도 기존
  `apiErrorText` sanitizer fallback으로 보내 recovery text를 보존하고 raw-like detail redaction을 유지한다.
- [x] VERIFY: focused web API failed response detail/redaction tests, implementation
  format check, typecheck, diff whitespace check를 실행한다.

## 2026-07-08 PromptLane Web Error Issue Detail Redaction

- [x] CHECK: `apiErrorIssueText`가 failed response issue item의 `message`는 처리하지만
  JSON:API-style `detail`은 무시해 `source.pointer`가 있어도 field-level recovery detail이
  사라질 수 있다.
- [x] RED: `src/web/src/api.test.ts`가 `source.pointer: "/data/attributes/title"`과
  `detail: "Expected a non-empty title."`를 `data.attributes.title: Expected a non-empty title.`
  로 표시하도록 요구하게 해 현재 detail 누락 실패를 확인한다.
- [x] GREEN: web API issue sanitizer가 raw-detail key가 아닌 issue field에서는
  `message` fallback으로 `detail`도 raw-free sanitizer를 거쳐 표시한다.
- [x] VERIFY: focused web API issue/error redaction tests, implementation format
  check, typecheck, diff whitespace check를 실행한다.

## 2026-07-08 PromptLane Web Error Issues Array Redaction

- [x] CHECK: `failApi`가 failed response의 `errors[]`만 issue detail로 읽고
  Zod-style `issues[]`는 무시해 validation recovery detail이 사라질 수 있다.
- [x] RED: `src/web/src/api.test.ts`가 settings failed response `issues[]`의
  `path: ["body", "prompt_body"]`를 `body.prompt_body` field로 표시하면서 message body를
  `[REDACTED:prompt_body]`로 치환하도록 요구하게 해 현재 `issues[]` detail 누락 실패를 확인한다.
- [x] GREEN: web API failed response detail assembly가 `errors[]`가 없을 때
  `issues[]`도 기존 issue sanitizer로 보내 raw-detail key segment별 message redaction을 적용한다.
- [x] VERIFY: focused web API issue/error redaction tests, implementation format
  check, typecheck, diff whitespace check를 실행한다.

## 2026-07-08 PromptLane Web Error Issue Source Pointer Redaction

- [x] CHECK: `apiErrorIssueText`가 validation `errors[]`의 direct 위치 키와 AJV
  params는 처리하지만 JSON:API-style `source.pointer: "/data/attributes/prompt_body"`는
  무시해 raw issue message를 failed response detail에 남길 수 있다.
- [x] RED: `src/web/src/api.test.ts`가 settings failed response `errors[]`의
  `source.pointer`를 `data.attributes.prompt_body` field로 표시하면서 message body를
  `[REDACTED:prompt_body]`로 치환하도록 요구하게 해 현재 unsafe source pointer issue
  detail 노출 실패를 확인한다.
- [x] GREEN: web API error issue sanitizer가 `source.pointer`/`source.parameter`를
  path normalizer fallback으로 보내 raw-detail key segment별 issue message redaction을 적용한다.
- [x] VERIFY: focused web API issue/error redaction tests, implementation format
  check, typecheck, diff whitespace check를 실행한다.

## 2026-07-08 PromptLane Web Error Issue File URL Path Redaction

- [x] CHECK: `apiErrorIssuePathText`가 local filesystem path는 redaction 경로로 보내지만
  `file:///Users/.../raw.md` local file URL은 JSON Pointer처럼 dot path로 바꿔 failed
  response issue field에 남길 수 있다.
- [x] RED: `src/web/src/api.test.ts`가 settings failed response `errors[]`의 file URL
  path를 `[REDACTED:path]` field로 표시하도록 요구하게 해 현재 unsafe file URL path
  issue detail 노출 실패를 확인한다.
- [x] GREEN: web API error issue path sanitizer와 공통 API error sanitizer가 `file://...`
  local file URL도 raw path로 redaction한다.
- [x] VERIFY: focused web API issue/error redaction tests, implementation format
  check, typecheck, diff whitespace check를 실행한다.

## 2026-07-08 PromptLane Web Error Issue UNC Path Redaction

- [x] CHECK: `apiErrorIssuePathText`와 `sanitizeApiErrorText`가 Windows drive path는
  redaction하지만 `\\server\share\...\raw.md` 같은 UNC/network path는 failed response
  issue field에 그대로 남길 수 있다.
- [x] RED: `src/web/src/api.test.ts`가 settings failed response `errors[]`의 UNC path를
  `[REDACTED:path]` field로 표시하도록 요구하게 해 현재 unsafe UNC path issue detail
  노출 실패를 확인한다.
- [x] GREEN: web API error issue path sanitizer와 공통 API error sanitizer가 UNC/network
  path도 raw local path로 redaction한다.
- [x] VERIFY: focused web API issue/error redaction tests, implementation format
  check, typecheck, diff whitespace check를 실행한다.

## 2026-07-08 PromptLane Web Error Issue Windows Path Redaction

- [x] CHECK: `apiErrorIssuePathText`와 `sanitizeApiErrorText`가 Unix/`~/` local path는
  redaction하지만 `C:\Users\...\raw.md` 같은 Windows-style local path는 failed response
  issue field에 그대로 남길 수 있다.
- [x] RED: `src/web/src/api.test.ts`가 settings failed response `errors[]`의
  Windows path를 `[REDACTED:path]` field로 표시하도록 요구하게 해 현재 unsafe Windows
  path issue detail 노출 실패를 확인한다.
- [x] GREEN: web API error issue path sanitizer와 공통 API error sanitizer가 Windows drive
  path도 raw local path로 redaction한다.
- [x] VERIFY: focused web API issue/error redaction tests, implementation format
  check, typecheck, diff whitespace check를 실행한다.

## 2026-07-08 PromptLane Web Error Issue Home Path Redaction

- [x] CHECK: `apiErrorIssuePathText`가 `/Users/...` absolute path는 redaction 경로로
  보내지만 `~/prompt-memory/...` home-relative path는 JSON Pointer처럼 dot path로 바꿔
  failed response issue field에 남길 수 있다.
- [x] RED: `src/web/src/api.test.ts`가 settings failed response `errors[]`의
  `path: "~/prompt-memory/prompts/raw.md"`를 `[REDACTED:path]` field로 표시하도록 요구하게 해
  현재 unsafe home path issue detail 노출 실패를 확인한다.
- [x] GREEN: web API error issue path sanitizer와 공통 API error sanitizer가 `~/...`
  home-relative local path를 raw path로 redaction한다.
- [x] VERIFY: focused web API issue/error redaction tests, implementation format
  check, typecheck, diff whitespace check를 실행한다.

## 2026-07-08 PromptLane Web Error Issue Additional Property Redaction

- [x] CHECK: `apiErrorIssueParamsText`가 AJV-style `missingProperty`/`propertyName`은
  처리하지만 `params.additionalProperty: "prompt_body"`는 무시해 raw issue message를
  failed response detail에 남길 수 있다.
- [x] RED: `src/web/src/api.test.ts`가 settings failed response `errors[]`의
  `params.additionalProperty`를 `prompt_body` field로 표시하면서 message body를
  `[REDACTED:prompt_body]`로 치환하도록 요구하게 해 현재 unsafe additionalProperty
  issue detail 노출 실패를 확인한다.
- [x] GREEN: web API error issue sanitizer가 `params.additionalProperty`도 path
  normalizer fallback으로 보내 raw-detail key segment별 issue message redaction을 적용한다.
- [x] VERIFY: focused web API issue/error redaction tests, implementation format
  check, typecheck, diff whitespace check를 실행한다.

## 2026-07-08 PromptLane Web Error Issue Params Redaction

- [x] CHECK: `apiErrorIssueText`가 validation `errors[]`의 direct 위치 키는 처리하지만
  AJV-style `params.missingProperty: "prompt_body"`는 무시해 raw issue message를 failed
  response detail에 남길 수 있다.
- [x] RED: `src/web/src/api.test.ts`가 settings failed response `errors[]`의
  `params.missingProperty`를 `prompt_body` field로 표시하면서 message body를
  `[REDACTED:prompt_body]`로 치환하도록 요구하게 해 현재 unsafe params issue detail
  노출 실패를 확인한다.
- [x] GREEN: web API error issue sanitizer가 `params.missingProperty`/`propertyName`을
  path normalizer fallback으로 보내 raw-detail key segment별 issue message redaction을 적용한다.
- [x] VERIFY: focused web API issue/error redaction tests, implementation format
  check, typecheck, diff whitespace check를 실행한다.

## 2026-07-08 PromptLane Web Error Issue Param Redaction

- [x] CHECK: `apiErrorIssueText`가 validation `errors[]`의 `field`/`path`/`property`는
  처리하지만 `param: "prompt_body"` 형태는 무시해 raw issue message를 failed response
  detail에 남길 수 있다.
- [x] RED: `src/web/src/api.test.ts`가 settings failed response `errors[]`의 param을
  `prompt_body` field로 표시하면서 message body를 `[REDACTED:prompt_body]`로 치환하도록
  요구하게 해 현재 unsafe param issue detail 노출 실패를 확인한다.
- [x] GREEN: web API error issue sanitizer가 `param`도 path normalizer fallback으로
  보내 raw-detail key segment별 issue message redaction을 적용한다.
- [x] VERIFY: focused web API issue/error redaction tests, implementation format
  check, typecheck, diff whitespace check를 실행한다.

## 2026-07-08 PromptLane Web Error Issue Property Redaction

- [x] CHECK: `apiErrorIssueText`가 validation `errors[]`의 `field`/`path`/`instancePath`는
  처리하지만 `property: "body.prompt_body"` 형태는 무시해 raw issue message를 failed
  response detail에 남길 수 있다.
- [x] RED: `src/web/src/api.test.ts`가 settings failed response `errors[]`의 property를
  `body.prompt_body` field로 표시하면서 message body를 `[REDACTED:prompt_body]`로 치환하도록
  요구하게 해 현재 unsafe property issue detail 노출 실패를 확인한다.
- [x] GREEN: web API error issue sanitizer가 `property`도 path normalizer fallback으로
  보내 raw-detail key segment별 issue message redaction을 적용한다.
- [x] VERIFY: focused web API issue/error redaction tests, implementation format
  check, typecheck, diff whitespace check를 실행한다.

## 2026-07-08 PromptLane Web Error Issue Field Array Redaction

- [x] CHECK: `apiErrorIssueText`가 validation `errors[]`의 string `field`와 `path`
  array는 처리하지만 `field: ["body", "prompt_body"]` 형태는 무시해 raw issue message를
  failed response detail에 남길 수 있다.
- [x] RED: `src/web/src/api.test.ts`가 settings failed response `errors[]`의 field array를
  `body.prompt_body` field로 표시하면서 message body를 `[REDACTED:prompt_body]`로 치환하도록
  요구하게 해 현재 unsafe field-array issue detail 노출 실패를 확인한다.
- [x] GREEN: web API error issue sanitizer가 string이 아닌 `field`도 path normalizer
  fallback으로 보내 raw-detail key segment별 issue message redaction을 적용한다.
- [x] VERIFY: focused web API issue/error redaction tests, implementation format
  check, typecheck, diff whitespace check를 실행한다.

## 2026-07-08 PromptLane Web Error Issue Local Path String Redaction

- [x] CHECK: `apiErrorIssuePathText`가 string `path` 값을 JSON Pointer처럼 slash split해
  `/Users/...` local path를 `Users...` dot path로 바꾸면서 existing path redaction을 우회할 수 있다.
- [x] RED: `src/web/src/api.test.ts`가 settings failed response `errors[]`의 raw local
  path string을 `[REDACTED:path]` field로 표시하도록 요구하게 해 현재 unsafe path-field
  detail 노출 실패를 확인한다.
- [x] GREEN: web API error issue path sanitizer가 known local absolute path prefix는
  JSON Pointer 정규화 전에 기존 API error text sanitizer로 보내 raw path를 redaction한다.
- [x] VERIFY: focused web API issue/error redaction tests, implementation format
  check, typecheck, diff whitespace check를 실행한다.

## 2026-07-08 PromptLane Web Error Issue Instance Path Redaction

- [x] CHECK: `apiErrorIssueText`가 validation `errors[]`의 `field`와 `path`는
  표시하지만 AJV-style `instancePath: "/body/prompt_body"`는 무시해 raw issue message를
  failed response detail에 남길 수 있다.
- [x] RED: `src/web/src/api.test.ts`가 settings failed response `errors[]`의
  `instancePath` JSON Pointer를 `body.prompt_body` field로 표시하면서 message body를
  `[REDACTED:prompt_body]`로 치환하도록 요구하게 해 현재 unsafe instancePath issue
  detail 노출 실패를 확인한다.
- [x] GREEN: web API error issue sanitizer가 `field`/`path` fallback 뒤에
  `instancePath`를 raw-free field text로 정규화하고 raw-detail key segment별 issue
  message redaction을 적용한다.
- [x] VERIFY: focused web API issue/error redaction tests, implementation format
  check, typecheck, diff whitespace check를 실행한다.

## 2026-07-08 PromptLane Web Error Issue Path Array Redaction

- [x] CHECK: `apiErrorIssueText`가 validation `errors[]`의 `field`는 표시하지만
  `path: ["body", "prompt_body"]` 형태는 무시해 raw issue message를 failed response detail에
  남길 수 있다.
- [x] RED: `src/web/src/api.test.ts`가 settings failed response `errors[]`의 path array를
  `body.prompt_body` field로 표시하면서 message body를 `[REDACTED:prompt_body]`로 치환하도록
  요구하게 해 현재 unsafe path-array issue detail 노출 실패를 확인한다.
- [x] GREEN: web API error issue sanitizer가 `field` fallback으로 string/array `path`를
  raw-free field text로 정규화하고 raw-detail key segment별 issue message redaction을 적용한다.
- [x] VERIFY: focused web API issue/error redaction tests, implementation format
  check, typecheck, diff whitespace check를 실행한다.

## 2026-07-08 PromptLane Web Error Issue Raw Field Path Redaction

- [x] CHECK: `apiErrorIssueText`가 raw issue field exact key는 message body를
  redaction하지만 `body.prompt_body` 같은 validation field path에서는 raw key segment를
  인식하지 못해 issue message를 failed response detail에 남길 수 있다.
- [x] RED: `src/web/src/api.test.ts`가 settings failed response `errors[]`의
  `body.prompt_body` issue message를 `[REDACTED:prompt_body]`로 치환하도록 요구하게 해
  현재 unsafe field-path issue detail 노출 실패를 확인한다.
- [x] GREEN: web API error issue sanitizer가 field path 안의 raw-detail key segment를
  찾아 issue message body를 노출하지 않고 key별 redaction token만 반환한다.
- [x] VERIFY: focused web API issue/error redaction tests, implementation format
  check, typecheck, diff whitespace check를 실행한다.

## 2026-07-08 PromptLane Web Error Detail Quoted Equals Redaction

- [x] CHECK: `sanitizeApiErrorText`가 quoted raw-detail key의 colon-delimited phrase는
  redaction하지만 `"OPENAI_API_KEY" = private local provider token.` 같은 quoted
  key + equals-delimited phrase는 failed response detail에 남길 수 있다.
- [x] RED: `src/web/src/api.test.ts`가 settings failed response detail의 quoted
  `"OPENAI_API_KEY" = ...` phrase 전체를 `"OPENAI_API_KEY"=[REDACTED:openai_api_key]`로
  redaction하도록 요구하게 해 현재 unsafe quoted-equals credential 노출 실패를 확인한다.
- [x] GREEN: web API error sanitizer가 quoted raw-detail keys의 equals-delimited
  phrase도 key별 redaction한다.
- [x] VERIFY: focused web API recovery-detail/error redaction tests, implementation
  format check, typecheck, diff whitespace check를 실행한다.

## 2026-07-08 PromptLane Web Error Detail Equals Raw Redaction

- [x] CHECK: `sanitizeApiErrorText`가 colon-delimited raw phrases는 redaction하지만
  `OPENAI_API_KEY = private local provider token.` 같은 equals-delimited phrase는
  단일 토큰 fallback으로 첫 토큰만 redaction하고 tail을 failed response detail에 남길 수 있다.
- [x] RED: `src/web/src/api.test.ts`가 settings failed response detail의
  `OPENAI_API_KEY = private local provider token.` phrase 전체를
  `OPENAI_API_KEY=[REDACTED:openai_api_key]`로 redaction하도록 요구하게 해 현재 unsafe
  equals-delimited credential tail 노출 실패를 확인한다.
- [x] GREEN: web API error sanitizer가 equals-delimited raw-detail phrase도 문장
  구분자 전까지 key별 redaction한다.
- [x] VERIFY: focused web API recovery-detail/error redaction tests, implementation
  format check, typecheck, diff whitespace check를 실행한다.

## 2026-07-08 PromptLane Web Error Detail Env Credential Redaction

- [x] CHECK: `sanitizeApiErrorText` raw detail key pattern이 generic `api_key`와
  provider credential aliases는 redaction하지만 `OPENAI_API_KEY` 같은 env-style
  provider credential key는 failed response detail에 그대로 남길 수 있다.
- [x] RED: `src/web/src/api.test.ts`가 settings failed response detail의
  `OPENAI_API_KEY: private local provider token.` phrase 전체를
  `[REDACTED:openai_api_key]`로 redaction하도록 요구하게 해 현재 unsafe env credential
  detail 노출 실패를 확인한다.
- [x] GREEN: web API error sanitizer raw detail key pattern을 common provider env keys
  `OPENAI_API_KEY`/`ANTHROPIC_API_KEY`/`GITHUB_TOKEN`까지 확장한다.
- [x] VERIFY: focused web API recovery-detail/error redaction tests, implementation
  format check, typecheck, diff whitespace check를 실행한다.

## 2026-07-08 PromptLane Web Error Detail Quoted Key Redaction

- [x] CHECK: `sanitizeApiErrorText`가 raw detail value quote는 처리하지만
  JSON-ish detail string의 `"prompt_body": "..."`처럼 key 자체가 quoted인 경우 key 뒤의
  quote 때문에 raw key pattern을 매칭하지 못해 failed response detail에 prompt body가 남을 수 있다.
- [x] RED: `src/web/src/api.test.ts`가 settings failed response detail의
  `"prompt_body": "private setup prompt"` 값을 `"prompt_body":[REDACTED:prompt_body]`로
  redaction하도록 요구하게 해 현재 unsafe quoted-key detail 노출 실패를 확인한다.
- [x] GREEN: web API error sanitizer가 quoted raw-detail keys의 colon-delimited
  phrase를 먼저 redaction해 JSON-ish failed response detail도 raw-free로 유지한다.
- [x] VERIFY: focused web API recovery-detail/error redaction tests, implementation
  format check, typecheck, diff whitespace check를 실행한다.

## 2026-07-08 PromptLane Web Error Detail CamelCase Raw Redaction

- [x] CHECK: `sanitizeApiErrorText` raw detail key pattern이 snake_case 중심이라
  `providerCredential`/`promptBody`/`rawPath`/`compactSummary` 같은 JS/web camelCase keyed
  detail은 failed response detail에 그대로 남길 수 있다.
- [x] RED: `src/web/src/api.test.ts`가 settings failed response detail의
  `providerCredential: private local provider token.` phrase 전체를
  `[REDACTED:providercredential]`로 redaction하도록 요구하게 해 현재 unsafe camelCase
  credential detail 노출 실패를 확인한다.
- [x] GREEN: web API error sanitizer raw detail key pattern을 camelCase aliases까지
  확장해 provider credential, prompt body, raw path, compact/transcript keys의 casing drift를 막는다.
- [x] VERIFY: focused web API recovery-detail/error redaction tests, implementation
  format check, typecheck, diff whitespace check를 실행한다.

## 2026-07-08 PromptLane Web Error Detail Provider Credential Redaction

- [x] CHECK: `sanitizeApiErrorText`가 prompt/loop raw keys는 redaction하지만
  `provider_credential`/`api_key`/`token` 같은 provider credential keyed detail은
  failed response detail에 그대로 남길 수 있다.
- [x] RED: `src/web/src/api.test.ts`가 settings failed response detail의
  `provider_credential: private local provider token.` phrase 전체를
  `[REDACTED:provider_credential]`로 redaction하도록 요구하게 해 현재 unsafe credential
  detail 노출 실패를 확인한다.
- [x] GREEN: web API error sanitizer raw detail key pattern을 credential/API key/token
  계열까지 확장해 provider credential echo 금지 invariant를 error path에도 적용한다.
- [x] VERIFY: focused web API recovery-detail/error redaction tests, implementation
  format check, typecheck, diff whitespace check를 실행한다.

## 2026-07-08 PromptLane Web Error Issue Raw Field Redaction

- [x] CHECK: `apiErrorIssueText`가 `errors[]`의 `field`와 `message`를 따로 sanitize한 뒤
  합치기 때문에 `field: "compact_summary"`, `message: "<raw text>"` 형태에서는 raw
  message가 failed response issue detail에 그대로 남을 수 있다.
- [x] RED: `src/web/src/api.test.ts`가 settings failed response `errors[]`의
  `compact_summary` issue message를 `[REDACTED:compact_summary]`로 치환하도록 요구하게 해
  현재 unsafe issue detail 노출 실패를 확인한다.
- [x] GREEN: issue field가 raw detail key이면 issue message body를 노출하지 않고
  key별 redaction token만 반환한다.
- [x] VERIFY: focused web API recovery-detail/error redaction tests, implementation
  format check, typecheck, diff whitespace check를 실행한다.

## 2026-07-08 PromptLane Web Error Detail Compact Raw Redaction

- [x] CHECK: `sanitizeApiErrorText`가 prompt/path/markdown raw-like keys는 redaction하지만
  `compact_summary`/`transcript_body` 같은 loop/session privacy keys는 failed response
  detail에 그대로 남길 수 있다.
- [x] RED: `src/web/src/api.test.ts`가 settings failed response detail의
  `compact_summary: private loop context...` phrase 전체를 `[REDACTED:compact_summary]`로
  redaction하도록 요구하게 해 현재 unsafe compact summary 노출 실패를 확인한다.
- [x] GREEN: web API error sanitizer가 raw detail key pattern을 compact summary와
  transcript body 계열까지 확장하면서 quoted/unquoted/colon-delimited redaction 계약을 유지한다.
- [x] VERIFY: focused web API recovery-detail/error redaction tests, implementation
  format check, typecheck, diff whitespace check를 실행한다.

## 2026-07-08 PromptLane Web Error Detail Colon Raw Redaction

- [x] CHECK: `sanitizeApiErrorText`가 unquoted 단일 토큰 raw-like value는 redaction하지만
  `prompt_body: private incident summary.` 같은 colon-delimited phrase에서는 첫 토큰만
  redaction하고 나머지 phrase를 failed response detail에 남길 수 있다.
- [x] RED: `src/web/src/api.test.ts`가 settings failed response detail의
  `prompt_body: private incident summary.` phrase 전체를 `[REDACTED:prompt_body]`로
  redaction하도록 요구하게 해 현재 unsafe tail 노출 실패를 확인한다.
- [x] GREEN: web API error sanitizer가 quoted/unquoted 단일 토큰 redaction을 유지하면서
  colon-delimited raw-like phrase를 문장 구분자 전까지 key별 redaction한다.
- [x] VERIFY: focused web API recovery-detail/error redaction tests, implementation
  format check, typecheck, diff whitespace check를 실행한다.

## 2026-07-08 PromptLane Web Error Detail Unquoted Raw Redaction

- [x] CHECK: `sanitizeApiErrorText`가 quoted raw-like keyed value는 redaction하지만
  `prompt_body=private-incident-summary` 같은 unquoted 단일 토큰 value는 failed response
  detail에 그대로 남길 수 있다.
- [x] RED: `src/web/src/api.test.ts`가 settings failed response detail의 unquoted
  `prompt_body=...` 값을 `[REDACTED:prompt_body]`로 redaction하도록 요구하게 해 현재
  unsafe error detail 노출 실패를 확인한다.
- [x] GREEN: web API error sanitizer가 quoted raw-like value redaction을 유지하면서
  unquoted 단일 토큰 `prompt_body`/`raw_path`/`markdown` values도 key별 redaction한다.
- [x] VERIFY: focused web API recovery-detail/error redaction tests, implementation
  format check, typecheck, diff whitespace check를 실행한다.

## 2026-07-08 PromptLane Web Error Detail Raw Redaction

- [x] CHECK: `failApi`/`sanitizeApiErrorText`가 failed response detail/title/message/errors의
  path/secret은 redaction하지만 `prompt_body`/`raw_path`/`markdown` keyed value는 그대로
  보존할 수 있어 server error path로 raw prompt detail이 노출될 수 있다.
- [x] RED: `src/web/src/api.test.ts`가 settings failed response detail의
  `prompt_body="..."` 값을 `[REDACTED:prompt_body]`로 redaction하도록 요구하게 해 현재
  unsafe error detail 노출 실패를 확인한다.
- [x] GREEN: web API error sanitizer가 quoted raw-like keyed values를 key별
  `[REDACTED:<key>]`로 치환하면서 기존 recovery detail과 path/secret redaction을 유지한다.
- [x] VERIFY: focused web API recovery-detail/error redaction tests, implementation
  format check, typecheck, diff whitespace check를 실행한다.

## 2026-07-08 PromptLane Web Health Raw Contract Error

- [x] CHECK: `getHealth`가 health root 응답의 `ok`/`version`만 검증하고 raw-like
  `prompt_body`/`raw_path`/`markdown` extra field를 차단하지 않아 setup/status UI state로
  불필요한 raw prompt data가 넘어갈 수 있다.
- [x] RED: `src/web/src/api.test.ts`가 health response의 `prompt_body` body를
  `Health check failed: Invalid response.`로 reject하도록 요구하게 해 현재 unsafe health
  resolve 실패를 확인한다.
- [x] GREEN: health parser가 기존 `ok`/`version` 계약을 유지하면서 raw
  `prompt_body`/`raw_path`/`markdown` fields를 차단한다.
- [x] VERIFY: focused web API settings/health tests, implementation format check,
  typecheck, diff whitespace check를 실행한다.

## 2026-07-08 PromptLane Web Settings Raw Contract Error

- [x] CHECK: `getSettings`가 settings root 응답의 필수 `redaction_mode`/`server`
  field만 검증하고 raw-like `prompt_body`/`raw_path`/`markdown` extra field를 차단하지
  않아 setup/settings UI state로 불필요한 raw prompt data가 넘어갈 수 있다.
- [x] RED: `src/web/src/api.test.ts`가 settings response의 `prompt_body` body를
  `Settings failed: Invalid response.`로 reject하도록 요구하게 해 현재 unsafe settings
  resolve 실패를 확인한다.
- [x] GREEN: settings parser가 기존 `data_dir`/redaction/server settings 계약을
  유지하면서 raw `prompt_body`/`raw_path`/`markdown` fields를 차단한다.
- [x] VERIFY: focused web API settings/health tests, implementation format check,
  typecheck, diff whitespace check를 실행한다.

## 2026-07-08 PromptLane Web Project Summary Root Raw Contract Error

- [x] CHECK: `parseProjectSummaryResponse`가 project summary root의 raw-like
  `prompt_body`/`raw_path`/`markdown` extra field를 차단하지 않아 Projects UI state로
  raw project path data가 넘어갈 수 있다.
- [x] RED: `src/web/src/api.test.ts`가 project list item의 `raw_path` body를
  `Project list failed: Invalid response.`로 reject하도록 요구하게 해 현재 unsafe
  project summary resolve 실패를 확인한다.
- [x] GREEN: project summary parser가 project metadata/policy/nested
  instruction_review 계약을 유지하면서 raw `prompt_body`/`raw_path`/`markdown` fields를
  차단한다.
- [x] VERIFY: focused web API project list tests, implementation format check,
  typecheck, diff whitespace check를 실행한다.

## 2026-07-08 PromptLane Web Project Summary Instruction Review Contract Error

- [x] CHECK: `parseProjectSummaryResponse`가 optional `instruction_review`를 검증하지
  않아 Projects list item에 중첩된 raw-like `prompt_body` review가 UI state로 넘어갈
  수 있다.
- [x] RED: `src/web/src/api.test.ts`가 project list item의
  `instruction_review.prompt_body` body를 `Project list failed: Invalid response.`로
  reject하도록 요구하게 해 현재 unsafe nested review resolve 실패를 확인한다.
- [x] GREEN: project summary parser가 nested `instruction_review`를 기존 project
  instruction review parser로 검증하되 project list/update surface 에러 메시지를 유지한다.
- [x] VERIFY: focused web API project list/instruction tests, implementation format
  check, typecheck, diff whitespace check를 실행한다.

## 2026-07-08 PromptLane Web Project Instruction Suggestions Contract Error

- [x] CHECK: `parseProjectInstructionReviewResponse`가 `suggestions[]`를 배열인지까지만
  검증하고 string item 계약을 확인하지 않아 raw-like `prompt_body` object가
  instruction suggestion UI state로 넘어갈 수 있다.
- [x] RED: `src/web/src/api.test.ts`가 project instruction analysis
  `suggestions[].prompt_body` object를 `Project instruction analysis failed:
  Invalid response.`로 reject하도록 요구하게 해 현재 unsafe suggestion resolve 실패를
  확인한다.
- [x] GREEN: project instruction suggestions parser가 모든 item을 string으로
  제한해 raw-like object와 깨진 suggestion shape를 차단한다.
- [x] VERIFY: focused web API project instruction test, implementation format check,
  typecheck, diff whitespace check를 실행한다.

## 2026-07-08 PromptLane Web Project Instruction Checklist Raw Contract Error

- [x] CHECK: `parseProjectInstructionReviewResponse`가 `checklist[]`를 배열인지까지만
  검증하고 checklist item shape나 raw-like `prompt_body`/`raw_path`/`markdown` extra
  field를 차단하지 않아 instruction review checklist로 file/prompt body-like data가
  넘어갈 수 있다.
- [x] RED: `src/web/src/api.test.ts`가 project instruction analysis
  `checklist[].prompt_body` body를 `Project instruction analysis failed: Invalid response.`로
  reject하도록 요구하게 해 현재 unsafe checklist resolve 실패를 확인한다.
- [x] GREEN: project instruction checklist parser가 key/label/status/weight/earned/
  suggestion 계약을 확인하고 raw `prompt_body`/`raw_path`/`markdown` fields를 차단한다.
- [x] VERIFY: focused web API project instruction test, implementation format check,
  typecheck, diff whitespace check를 실행한다.

## 2026-07-08 PromptLane Web Project Instruction File Summary Raw Contract Error

- [x] CHECK: `parseProjectInstructionReviewResponse`가 `files[]`를 배열인지까지만
  검증하고 file summary shape나 raw-like `prompt_body`/`raw_path`/`markdown` extra
  field를 차단하지 않아 instruction file raw path data가 UI state로 넘어갈 수 있다.
- [x] RED: `src/web/src/api.test.ts`가 project instruction analysis
  `files[].raw_path` body를 `Project instruction analysis failed: Invalid response.`로
  reject하도록 요구하게 해 현재 unsafe file summary resolve 실패를 확인한다.
- [x] GREEN: project instruction file parser가 file_name/bytes/modified_at/
  content_hash/truncated 계약을 확인하고 raw `prompt_body`/`raw_path`/`markdown`
  fields를 차단한다.
- [x] VERIFY: focused web API project instruction test, implementation format check,
  typecheck, diff whitespace check를 실행한다.

## 2026-07-08 PromptLane Web Project Instruction Review Raw Contract Error

- [x] CHECK: `parseProjectInstructionReviewResponse`가 privacy flags를 확인하면서도
  root `data`의 raw-like `prompt_body`/`raw_path`/`markdown` extra field를 차단하지
  않아 instruction analysis UI state로 file body-like data가 넘어갈 수 있다.
- [x] RED: `src/web/src/api.test.ts`가 project instruction analysis response의
  `prompt_body` body를 `Project instruction analysis failed: Invalid response.`로
  reject하도록 요구하게 해 현재 unsafe instruction review resolve 실패를 확인한다.
- [x] GREEN: project instruction review parser가 score/files/checklist/suggestions/
  privacy 계약을 유지하면서 raw `prompt_body`/`raw_path`/`markdown` fields를 차단한다.
- [x] VERIFY: focused web API project instruction test, implementation format check,
  typecheck, diff whitespace check를 실행한다.

## 2026-07-08 PromptLane Web Import Dry-Run Root Raw Contract Error

- [x] CHECK: `parseImportDryRunResponse`가 import dry-run root `data`의 필수
  summary field만 검증하고 raw-like `prompt_body`/`raw_path`/`markdown` extra field를
  차단하지 않아 import preview summary로 raw prompt data가 넘어갈 수 있다.
- [x] RED: `src/web/src/api.test.ts`가 import dry-run root response의 `prompt_body`
  body를 `Import dry-run failed: Invalid response.`로 reject하도록 요구하게 해 현재
  unsafe import preview resolve 실패를 확인한다.
- [x] GREEN: import dry-run root parser가 summary/counts/samples 계약을 유지하면서
  raw `prompt_body`/`raw_path`/`markdown` fields를 차단한다.
- [x] VERIFY: focused web API import/export client test, implementation format check,
  typecheck, diff whitespace check를 실행한다.

## 2026-07-08 PromptLane Web Import Dry-Run Sample Raw Contract Error

- [x] CHECK: `parseImportDryRunResponse`가 import dry-run `samples[]`를 배열인지까지만
  검증하고 sample shape나 raw-like `prompt_body`/`raw_path`/`markdown` extra field를
  차단하지 않아 import preview UI state로 raw local path data가 넘어갈 수 있다.
- [x] RED: `src/web/src/api.test.ts`가 import dry-run sample의 `raw_path` body를
  `Import dry-run failed: Invalid response.`로 reject하도록 요구하게 해 현재 unsafe
  import preview resolve 실패를 확인한다.
- [x] GREEN: import dry-run sample parser가 record_offset/session_id/turn_id/
  cwd_label/prompt_preview/is_sensitive 계약을 확인하고 raw `prompt_body`/`raw_path`/
  `markdown` fields를 차단한다.
- [x] VERIFY: focused web API import/export client test, implementation format check,
  typecheck, diff whitespace check를 실행한다.

## 2026-07-08 PromptLane Web Export Payload Item Raw Contract Error

- [x] CHECK: `parseAnonymizedExportPayloadResponse`가 export payload item 필수
  field만 검증하고 raw-like `prompt_body`/`raw_path`/`markdown` extra field를
  차단하지 않아 anonymized export payload로 raw local path data가 넘어갈 수 있다.
- [x] RED: `src/web/src/api.test.ts`가 export execution payload item의 `raw_path`
  body를 `Export job execution failed: Invalid response.`로 reject하도록 요구하게 해
  현재 unsafe export payload resolve 실패를 확인한다.
- [x] GREEN: anonymized export payload item parser가 anonymous_id/tool/date/project/
  prompt/tags/gaps 계약을 유지하면서 raw `prompt_body`/`raw_path`/`markdown` fields를
  차단한다.
- [x] VERIFY: focused web API export client test, implementation format check,
  typecheck, diff whitespace check를 실행한다.

## 2026-07-08 PromptLane Web Export Preview Raw Contract Error

- [x] CHECK: `parseExportJobResponse`가 export job 필수 field만 검증하고
  raw-like `prompt_body`/`raw_path`/`markdown` extra field를 차단하지 않아 export
  preview/job metadata로 raw local path data가 넘어갈 수 있다.
- [x] RED: `src/web/src/api.test.ts`가 export preview response의 `raw_path`
  body를 `Export preview failed: Invalid response.`로 reject하도록 요구하게 해 현재
  unsafe export preview resolve 실패를 확인한다.
- [x] GREEN: export job parser가 id/preset/status/counts/redaction metadata 계약을
  유지하면서 raw `prompt_body`/`raw_path`/`markdown` fields를 차단한다.
- [x] VERIFY: focused web API export client test, implementation format check,
  typecheck, diff whitespace check를 실행한다.

## 2026-07-08 PromptLane Web Improvement Draft Copy Raw Contract Error

- [x] CHECK: `parsePromptImprovementDraftCopyResponse`가 copy event 필수 field만
  검증하고 raw-like `prompt_body`/`raw_path`/`markdown` extra field를 차단하지 않아
  draft reuse state로 raw prompt data가 넘어갈 수 있다.
- [x] RED: `src/web/src/api.test.ts`가 improvement draft copy response의
  `prompt_body` body를 `Improvement draft copy event failed: Invalid response.`로
  reject하도록 요구하게 해 현재 unsafe copy event resolve 실패를 확인한다.
- [x] GREEN: draft copy event parser가 id/prompt_id/copied_at 계약을 유지하면서
  raw `prompt_body`/`raw_path`/`markdown` fields를 차단한다.
- [x] VERIFY: focused web API test, implementation format check, typecheck, diff
  whitespace check를 실행한다.

## 2026-07-08 PromptLane Web Prompt Usefulness Raw Contract Error

- [x] CHECK: `parsePromptUsefulnessResponse`가 usefulness 필수 field만 검증하고
  raw-like `prompt_body`/`raw_path`/`markdown` extra field를 차단하지 않아 prompt
  reuse/bookmark state로 raw prompt/path data가 넘어갈 수 있다.
- [x] RED: `src/web/src/api.test.ts`가 prompt copy event response의
  `usefulness.raw_path` body를 `Prompt event failed: Invalid response.`로 reject하도록
  요구하게 해 현재 unsafe usefulness resolve 실패를 확인한다.
- [x] GREEN: shared usefulness parser가 copied/bookmark metadata 계약을 유지하면서
  raw `prompt_body`/`raw_path`/`markdown` fields를 차단한다.
- [x] VERIFY: focused web API test, implementation format check, typecheck, diff
  whitespace check를 실행한다.

## 2026-07-08 PromptLane Web Ask Event Summary Raw Contract Error

- [x] CHECK: `parseAskEventSummaryResponse`가 ask telemetry count/axis field만
  검증하고 raw-like `prompt_body`/`raw_path`/`markdown` extra field를 차단하지 않아
  ask telemetry summary로 raw prompt data가 넘어갈 수 있다.
- [x] RED: `src/web/src/api.test.ts`가 ask event summary response의
  `prompt_body` body를 `Ask event summary unavailable: Invalid response.`로
  reject하도록 요구하게 해 현재 unsafe ask summary resolve 실패를 확인한다.
- [x] GREEN: ask event summary parser가 total_count/recent_count/axis_counts/
  average_score/last_triggered_at 계약을 유지하면서 raw fields를 차단한다.
- [x] VERIFY: focused web API test, implementation format check, typecheck, diff
  whitespace check를 실행한다.

## 2026-07-08 PromptLane Web Coach Feedback Summary Raw Contract Error

- [x] CHECK: `getCoachFeedbackSummary`가 feedback ratio 필수 숫자 field만 검증하고
  raw-like `prompt_body`/`raw_path`/`markdown` extra field를 차단하지 않아 feedback
  summary 데이터로 raw prompt/path data가 넘어갈 수 있다.
- [x] RED: `src/web/src/api.test.ts`가 coach feedback summary response의
  `raw_path` body를 `Coach feedback summary failed: Invalid response.`로 reject하도록
  요구하게 해 현재 unsafe summary resolve 실패를 확인한다.
- [x] GREEN: coach feedback summary parser가 total/helpful/not_helpful/wrong/
  helpful_ratio 계약을 유지하면서 raw `prompt_body`/`raw_path`/`markdown` fields를 차단한다.
- [x] VERIFY: focused web API test, implementation format check, typecheck, diff
  whitespace check를 실행한다.

## 2026-07-08 PromptLane Web Coach Feedback Raw Contract Error

- [x] CHECK: `parseCoachFeedbackEntryResponse`가 feedback entry 필수 field만
  검증하고 raw-like `prompt_body`/`raw_path`/`markdown` extra field를 차단하지 않아
  prompt detail feedback state로 raw prompt data가 넘어갈 수 있다.
- [x] RED: `src/web/src/api.test.ts`가 coach feedback response의
  `prompt_body` body를 `Coach feedback failed: Invalid response.`로 reject하도록
  요구하게 해 현재 unsafe feedback resolve 실패를 확인한다.
- [x] GREEN: coach feedback entry parser가 id/prompt_id/rating/created_at 계약을
  유지하면서 raw `prompt_body`/`raw_path`/`markdown` fields를 차단한다.
- [x] VERIFY: focused web API test, implementation format check, typecheck, diff
  whitespace check를 실행한다.

## 2026-07-08 PromptLane Web Prompt Detail Effectiveness Contract Error

- [x] CHECK: `parsePromptDetailResponse`가 optional `effectiveness`를 object인지까지만
  검증해 깨진 effectiveness summary나 raw path-like evidence ref가 prompt detail
  effectiveness 데이터로 넘어갈 수 있다.
- [x] RED: `src/web/src/api.test.ts`가 prompt detail 내부 raw path-like
  `effectiveness.evidence_refs[]` body를 `Prompt not found: Invalid response.`로
  reject하도록 요구하게 해 현재 unsafe detail resolve 실패를 확인한다.
- [x] GREEN: prompt detail parser가 effectiveness verdict/summary/calibration/
  evidence_refs 계약을 확인하고 raw `prompt_body`/`raw_path`/`markdown` fields 및
  raw path-like evidence refs를 차단한다.
- [x] VERIFY: focused web API test, implementation format check, typecheck, diff
  whitespace check를 실행한다.

## 2026-07-08 PromptLane Web Prompt Detail Loop Outcomes Contract Error

- [x] CHECK: `parsePromptDetailResponse`가 optional `loop_outcomes[]`를 배열인지까지만
  검증해 깨진 loop outcome evidence shape나 raw-like `raw_path` field가 prompt
  detail loop evidence 데이터로 넘어갈 수 있다.
- [x] RED: `src/web/src/api.test.ts`가 prompt detail 내부 malformed
  `loop_outcomes[].raw_path` body를 `Prompt not found: Invalid response.`로
  reject하도록 요구하게 해 현재 unsafe detail resolve 실패를 확인한다.
- [x] GREEN: prompt detail parser가 loop outcome snapshot_id/status/summary/
  evidence_refs/tests_run 계약을 확인하고 raw `prompt_body`/`raw_path`/`markdown`
  fields를 차단한다.
- [x] VERIFY: focused web API test, implementation format check, typecheck, diff
  whitespace check를 실행한다.

## 2026-07-08 PromptLane Web Prompt Detail Judge Contract Error

- [x] CHECK: `parsePromptDetailResponse`가 optional `judge_score`를 object인지까지만
  검증해 깨진 judge score shape나 raw-like `prompt_body` field가 prompt detail
  judge panel 데이터로 넘어갈 수 있다.
- [x] RED: `src/web/src/api.test.ts`가 prompt detail 내부 malformed
  `judge_score.prompt_body` body를 `Prompt not found: Invalid response.`로
  reject하도록 요구하게 해 현재 unsafe detail resolve 실패를 확인한다.
- [x] GREEN: prompt detail parser가 judge score id/prompt_id/judge_tool/score/reason/
  created_at 계약을 확인하고 raw `prompt_body`/`raw_path`/`markdown` fields를 차단한다.
- [x] VERIFY: focused web API test, implementation format check, typecheck, diff
  whitespace check를 실행한다.

## 2026-07-08 PromptLane Web Prompt Detail Analysis Contract Error

- [x] CHECK: `parsePromptDetailResponse`가 optional `analysis`를 object인지까지만
  검증해 깨진 checklist shape나 raw-like `prompt_body` field가 prompt detail
  analysis panel 데이터로 넘어갈 수 있다.
- [x] RED: `src/web/src/api.test.ts`가 prompt detail 내부 malformed
  `analysis.checklist[].prompt_body` body를 `Prompt not found: Invalid response.`로
  reject하도록 요구하게 해 현재 unsafe detail resolve 실패를 확인한다.
- [x] GREEN: prompt detail parser가 analysis checklist/tags/quality_score/analyzer
  metadata 계약을 확인하고 analysis/checklist item의 raw `prompt_body`/`raw_path`/
  `markdown` fields를 차단한다.
- [x] VERIFY: focused web API test, implementation format check, typecheck, diff
  whitespace check를 실행한다.

## 2026-07-08 PromptLane Web Prompt Detail Draft Contract Error

- [x] CHECK: `parsePromptDetailResponse`가 `improvement_drafts[]`를 배열인지까지만
  검증해 깨진 draft shape나 raw-like `prompt_body` field가 prompt detail coach
  panel 데이터로 넘어갈 수 있다.
- [x] RED: `src/web/src/api.test.ts`가 prompt detail 내부 malformed
  improvement draft `prompt_body` body를 `Prompt not found: Invalid response.`로
  reject하도록 요구하게 해 현재 unsafe detail resolve 실패를 확인한다.
- [x] GREEN: prompt detail parser가 `improvement_drafts[]` item의 id/prompt_id/draft_text
  analyzer/changed_sections/safety_notes/redaction metadata 계약을 확인하고 raw
  `prompt_body`/`raw_path`/detail-only `markdown` fields를 draft item에서 차단한다.
- [x] VERIFY: focused web API test, implementation format check, typecheck, diff
  whitespace check를 실행한다.

## 2026-07-08 PromptLane Web Prompt Detail Markdown Contract Regression

- [x] CHECK: `parsePromptDetailResponse`가 `PromptDetail`의 필수 `markdown`
  field를 허용하기 전에 `isPromptSummary`를 호출하면서 prompt list용 raw-free
  summary guard 때문에 정상 prompt detail 응답까지 reject할 수 있다.
- [x] RED: `src/web/src/api.test.ts`가 valid prompt detail response with
  `markdown`을 `getPrompt`로 resolve해야 한다고 요구하게 해 현재 markdown
  contract regression 실패를 확인한다.
- [x] GREEN: prompt list item에는 `markdown`을 계속 금지하되 prompt detail
  parser는 summary core 계약과 detail-only `markdown` 계약을 분리해 정상 detail
  응답을 허용하고 raw `prompt_body`/`raw_path`는 계속 차단한다.
- [x] VERIFY: focused web API test, implementation format check, typecheck, diff
  whitespace check를 실행한다.

## 2026-07-08 PromptLane Web Prompt List Root Raw Contract Error

- [x] CHECK: web API `listPrompts`가 `/api/v1/prompts` 성공 응답의 root
  `data` 객체 raw-free 계약을 검증하지 않아 top-level raw prompt body/path-like field가 prompt list UI 데이터로 넘어갈 수 있다.
- [x] RED: `src/web/src/api.test.ts`가 malformed prompt list root `prompt_body`
  body를 `Prompt list failed: Invalid response.`로 reject하도록 요구하게 해 현재 unsafe root resolve 실패를 확인한다.
- [x] GREEN: prompt list root object에서 raw body/path-like extra fields를 차단해 item validator를 우회한 raw-free contract 오류도 중단하도록 고친다.
- [x] VERIFY: focused web API test, implementation format check, typecheck, diff whitespace check를 실행한다.

## 2026-07-08 PromptLane Web Prompt List Item Contract Error

- [x] CHECK: web API `listPrompts`가 `/api/v1/prompts` 성공 응답의
  `items[]` prompt summary 계약을 검증하지 않아 raw prompt body나 깨진 archive item이 prompt list UI 데이터로 넘어갈 수 있다.
- [x] RED: `src/web/src/api.test.ts`가 malformed prompt list item `prompt_body`
  body를 `Prompt list failed: Invalid response.`로 reject하도록 요구하게 해 현재 unsafe prompt item resolve 실패를 확인한다.
- [x] GREEN: prompt summary item 계약을 `parsePromptListResponse`에서 확인하고 raw body/path-like extra fields는 raw-free prompt list contract 오류로 중단하도록 고친다.
- [x] VERIFY: focused web API test, implementation format check, typecheck, diff whitespace check를 실행한다.

## 2026-07-08 PromptLane Web Archive Score Root Raw Contract Error

- [x] CHECK: web API `getArchiveScoreReport`가 `/api/v1/score` 성공 응답의 root
  `data` 객체 raw-free 계약을 검증하지 않아 top-level raw prompt body/path-like field가 archive score UI 데이터로 넘어갈 수 있다.
- [x] RED: `src/web/src/api.test.ts`가 malformed archive score root `prompt_body`
  body를 `Archive score report failed: Invalid response.`로 reject하도록 요구하게 해 현재 unsafe root resolve 실패를 확인한다.
- [x] GREEN: archive score root object에서 raw body/path-like extra fields를 차단해 하위 validator를 우회한 raw-free contract 오류도 중단하도록 고친다.
- [x] VERIFY: focused web API test, implementation format check, typecheck, diff whitespace check를 실행한다.

## 2026-07-08 PromptLane Web Quality Dashboard Root Raw Contract Error

- [x] CHECK: web API `getQualityDashboard`가 `/api/v1/quality` 성공 응답의 root
  `data` 객체 raw-free 계약을 검증하지 않아 top-level raw prompt body/path-like field가 dashboard UI 데이터로 넘어갈 수 있다.
- [x] RED: `src/web/src/api.test.ts`가 malformed dashboard root `prompt_body`
  body를 `Quality dashboard failed: Invalid response.`로 reject하도록 요구하게 해 현재 unsafe root resolve 실패를 확인한다.
- [x] GREEN: quality dashboard root object에서 raw body/path-like extra fields를 차단해 하위 validator를 우회한 raw-free contract 오류도 중단하도록 고친다.
- [x] VERIFY: focused web API test, implementation format check, typecheck, diff whitespace check를 실행한다.

## 2026-07-08 PromptLane Web Quality Dashboard Trend Contract Error

- [x] CHECK: web API `getQualityDashboard`가 `/api/v1/quality` 성공 응답의
  `trend.daily[]` item 계약을 검증하지 않아 raw prompt body나 깨진 trend metric이 dashboard trend UI 데이터로 넘어갈 수 있다.
- [x] RED: `src/web/src/api.test.ts`가 malformed trend daily item `prompt_body`
  body를 `Quality dashboard failed: Invalid response.`로 reject하도록 요구하게 해 현재 unsafe trend resolve 실패를 확인한다.
- [x] GREEN: trend daily date/prompt_count/quality_gap_count/quality_gap_rate/average_quality_score/sensitive_count 계약을 확인하고 raw body/path-like extra fields는 raw-free quality dashboard contract 오류로 중단하도록 고친다.
- [x] VERIFY: focused web API test, implementation format check, typecheck, diff whitespace check를 실행한다.

## 2026-07-08 PromptLane Web Quality Dashboard Recent Summary Contract Error

- [x] CHECK: web API `getQualityDashboard`가 `/api/v1/quality` 성공 응답의
  `sensitive_prompts`/`sensitive_ratio`/`recent` 집계 계약을 검증하지 않아 raw path-like field나 깨진 dashboard metric summary가 UI 데이터로 넘어갈 수 있다.
- [x] RED: `src/web/src/api.test.ts`가 malformed recent summary `raw_path`
  body를 `Quality dashboard failed: Invalid response.`로 reject하도록 요구하게 해 현재 unsafe recent summary resolve 실패를 확인한다.
- [x] GREEN: sensitive count/ratio와 recent last_7_days/last_30_days 계약을 확인하고 raw body/path-like extra fields는 raw-free quality dashboard contract 오류로 중단하도록 고친다.
- [x] VERIFY: focused web API test, implementation format check, typecheck, diff whitespace check를 실행한다.

## 2026-07-08 PromptLane Web Quality Dashboard Project Profiles Contract Error

- [x] CHECK: web API `getQualityDashboard`가 `/api/v1/quality` 성공 응답의
  `project_profiles[]`와 optional `top_gap` 계약을 검증하지 않아 raw path-like field나 깨진 project quality profile이 dashboard UI 데이터로 넘어갈 수 있다.
- [x] RED: `src/web/src/api.test.ts`가 malformed project profile `top_gap.raw_path`
  body를 `Quality dashboard failed: Invalid response.`로 reject하도록 요구하게 해 현재 unsafe project profile resolve 실패를 확인한다.
- [x] GREEN: project profile key/label/count/rate/score/latest/top_gap 계약을 확인하고 raw body/path-like extra fields는 raw-free quality dashboard contract 오류로 중단하도록 고친다.
- [x] VERIFY: focused web API test, implementation format check, typecheck, diff whitespace check를 실행한다.

## 2026-07-08 PromptLane Web Quality Dashboard Duplicate Groups Contract Error

- [x] CHECK: web API `getQualityDashboard`가 `/api/v1/quality` 성공 응답의
  `duplicate_prompt_groups[]`와 nested `prompts[]` item 계약을 검증하지 않아 raw prompt body나 깨진 duplicate prompt summary가 dashboard UI 데이터로 넘어갈 수 있다.
- [x] RED: `src/web/src/api.test.ts`가 malformed duplicate group nested prompt `prompt_body`
  body를 `Quality dashboard failed: Invalid response.`로 reject하도록 요구하게 해 현재 unsafe duplicate group resolve 실패를 확인한다.
- [x] GREEN: duplicate group group_id/count/latest_received_at/projects/prompts 계약과 nested prompt id/tool/cwd/received_at/tags/gaps 계약을 확인하고 raw body/path-like extra fields는 raw-free quality dashboard contract 오류로 중단하도록 고친다.
- [x] VERIFY: focused web API test, implementation format check, typecheck, diff whitespace check를 실행한다.

## 2026-07-08 PromptLane Web Quality Dashboard Useful Prompts Contract Error

- [x] CHECK: web API `getQualityDashboard`가 `/api/v1/quality` 성공 응답의
  `useful_prompts[]` item 계약을 검증하지 않아 raw prompt body나 깨진 reusable prompt summary가 dashboard UI 데이터로 넘어갈 수 있다.
- [x] RED: `src/web/src/api.test.ts`가 malformed useful prompt `prompt_body`
  body를 `Quality dashboard failed: Invalid response.`로 reject하도록 요구하게 해 현재 unsafe useful prompt resolve 실패를 확인한다.
- [x] GREEN: useful prompt id/tool/cwd/received_at/copy/bookmark/tags/gaps 계약을 확인하고 raw body/path-like extra fields는 raw-free quality dashboard contract 오류로 중단하도록 고친다.
- [x] VERIFY: focused web API test, implementation format check, typecheck, diff whitespace check를 실행한다.

## 2026-07-08 PromptLane Web Quality Dashboard Instruction Suggestions Contract Error

- [x] CHECK: web API `getQualityDashboard`가 `/api/v1/quality` 성공 응답의
  `instruction_suggestions[]` item 계약을 검증하지 않아 raw prompt/path-like field나 깨진 AGENTS.md/CLAUDE.md candidate가 Coach UI 데이터로 넘어갈 수 있다.
- [x] RED: `src/web/src/api.test.ts`가 malformed instruction suggestion `raw_path`
  body를 `Quality dashboard failed: Invalid response.`로 reject하도록 요구하게 해 현재 unsafe instruction suggestion resolve 실패를 확인한다.
- [x] GREEN: instruction suggestion scope/project/text/reason 계약을 확인하고 raw body/path-like fields는 raw-free quality dashboard contract 오류로 중단하도록 고친다.
- [x] VERIFY: focused web API test, implementation format check, typecheck, diff whitespace check를 실행한다.

## 2026-07-08 PromptLane Web Quality Dashboard Patterns Contract Error

- [x] CHECK: web API `getQualityDashboard`가 `/api/v1/quality` 성공 응답의
  `patterns[]` item 계약을 검증하지 않아 raw prompt/path-like field나 깨진 repeated pattern summary가 Coach UI 데이터로 넘어갈 수 있다.
- [x] RED: `src/web/src/api.test.ts`가 malformed pattern `prompt_body`
  body를 `Quality dashboard failed: Invalid response.`로 reject하도록 요구하게 해 현재 unsafe pattern resolve 실패를 확인한다.
- [x] GREEN: pattern project/item_key/label/count/total/message 계약을 확인하고 raw body/path-like fields는 raw-free quality dashboard contract 오류로 중단하도록 고친다.
- [x] VERIFY: focused web API test, implementation format check, typecheck, diff whitespace check를 실행한다.

## 2026-07-08 PromptLane Web Quality Dashboard Distribution Contract Error

- [x] CHECK: web API `getQualityDashboard`가 `/api/v1/quality` 성공 응답의
  `distribution.by_tool[]`/`distribution.by_project[]` item 계약을 검증하지 않아 raw path-like field나 깨진 distribution bucket이 quality dashboard UI 데이터로 넘어갈 수 있다.
- [x] RED: `src/web/src/api.test.ts`가 malformed distribution bucket `raw_path`
  body를 `Quality dashboard failed: Invalid response.`로 reject하도록 요구하게 해 현재 unsafe distribution resolve 실패를 확인한다.
- [x] GREEN: distribution bucket key/label/count/ratio 계약을 확인하고 raw body/path-like fields는 raw-free quality dashboard contract 오류로 중단하도록 고친다.
- [x] VERIFY: focused web API test, implementation format check, typecheck, diff whitespace check를 실행한다.

## 2026-07-08 PromptLane Web Quality Dashboard Missing Items Contract Error

- [x] CHECK: web API `getQualityDashboard`가 `/api/v1/quality` 성공 응답의
  `missing_items[]` item 계약을 검증하지 않아 raw prompt/path-like field나 깨진 gap summary가 quality dashboard UI 데이터로 넘어갈 수 있다.
- [x] RED: `src/web/src/api.test.ts`가 malformed missing item `prompt_body`
  body를 `Quality dashboard failed: Invalid response.`로 reject하도록 요구하게 해 현재 unsafe missing item resolve 실패를 확인한다.
- [x] GREEN: missing item key/label/missing/weak/total/rate 계약을 확인하고 raw body/path-like fields는 raw-free quality dashboard contract 오류로 중단하도록 고친다.
- [x] VERIFY: focused web API test, implementation format check, typecheck, diff whitespace check를 실행한다.

## 2026-07-08 PromptLane Web Quality Dashboard Score Contract Error

- [x] CHECK: web API `getQualityDashboard`가 `/api/v1/quality` 성공 응답의
  `quality_score` 내부 계약을 검증하지 않아 raw prompt/path-like field나 깨진 score summary가 quality dashboard UI 데이터로 넘어갈 수 있다.
- [x] RED: `src/web/src/api.test.ts`가 malformed quality-score `prompt_body`
  body를 `Quality dashboard failed: Invalid response.`로 reject하도록 요구하게 해 현재 unsafe quality score resolve 실패를 확인한다.
- [x] GREEN: quality_score average/max/band/scored_prompts 계약을 확인하고 raw body/path-like fields는 raw-free quality dashboard contract 오류로 중단하도록 고친다.
- [x] VERIFY: focused web API test, implementation format check, typecheck, diff whitespace check를 실행한다.

## 2026-07-08 PromptLane Web Quality Dashboard Privacy Contract Error

- [x] CHECK: web API `getQualityDashboard`가 `/api/v1/quality` 성공 응답의
  `privacy` local-first/raw-free 계약을 검증하지 않아 prompt bodies 또는 raw paths 반환 가능 상태를 web UI에 넘길 수 있다.
- [x] RED: `src/web/src/api.test.ts`가 malformed quality dashboard
  `privacy.returns_raw_paths` body를 `Quality dashboard failed: Invalid response.`로 reject하도록 요구하게 해 현재 unsafe quality dashboard resolve 실패를 확인한다.
- [x] GREEN: quality dashboard privacy가 local-only, no external calls, no prompt bodies, no raw paths 계약을 만족하는지 확인하고 깨진 privacy block은 raw-free quality dashboard contract 오류로 중단하도록 고친다.
- [x] VERIFY: focused web API test, implementation format check, typecheck, diff whitespace check를 실행한다.

## 2026-07-08 PromptLane Web Archive Score Metadata Contract Error

- [x] CHECK: web API `getArchiveScoreReport`가 `/api/v1/score` 성공 응답의
  `generated_at`/`has_more` metadata 계약을 검증하지 않아 깨진 freshness/pagination state가 archive score UI 데이터로 넘어갈 수 있다.
- [x] RED: `src/web/src/api.test.ts`가 malformed metadata `has_more`
  body를 `Archive score report failed: Invalid response.`로 reject하도록 요구하게 해 현재 unsafe metadata resolve 실패를 확인한다.
- [x] GREEN: generated_at string, has_more boolean 계약을 확인해 깨진 archive score metadata는 contract 오류로 중단하도록 고친다.
- [x] VERIFY: focused web API test, implementation format check, typecheck, diff whitespace check를 실행한다.

## 2026-07-08 PromptLane Web Archive Score Next Prompt Template Contract Error

- [x] CHECK: web API `getArchiveScoreReport`가 `/api/v1/score` 성공 응답의
  `next_prompt_template` 계약을 검증하지 않아 raw path-like text가 copy-ready archive score guidance로 넘어갈 수 있다.
- [x] RED: `src/web/src/api.test.ts`가 raw-path 포함 `next_prompt_template`
  body를 `Archive score report failed: Invalid response.`로 reject하도록 요구하게 해 현재 unsafe template resolve 실패를 확인한다.
- [x] GREEN: next_prompt_template string 계약과 raw path-like substring 차단을 확인해 raw-free archive score contract 오류로 중단하도록 고친다.
- [x] VERIFY: focused web API test, implementation format check, typecheck, diff whitespace check를 실행한다.

## 2026-07-08 PromptLane Web Archive Score Filters Contract Error

- [x] CHECK: web API `getArchiveScoreReport`가 `/api/v1/score` 성공 응답의
  `filters` 계약을 검증하지 않아 raw path-like field나 깨진 filter metadata가 archive score UI 데이터로 넘어갈 수 있다.
- [x] RED: `src/web/src/api.test.ts`가 malformed filters `raw_path`
  body를 `Archive score report failed: Invalid response.`로 reject하도록 요구하게 해 현재 unsafe filters resolve 실패를 확인한다.
- [x] GREEN: filters tool/project/received_from/received_to/max_prompts 계약을 확인하고 raw body/path-like fields는 raw-free archive score contract 오류로 중단하도록 고친다.
- [x] VERIFY: focused web API test, implementation format check, typecheck, diff whitespace check를 실행한다.

## 2026-07-08 PromptLane Web Archive Score Effectiveness Summary Contract Error

- [x] CHECK: web API `getArchiveScoreReport`가 `/api/v1/score` 성공 응답의
  `effectiveness_summary` 계약을 검증하지 않아 raw prompt/path-like field나 깨진 outcome evidence summary가 archive score UI 데이터로 넘어갈 수 있다.
- [x] RED: `src/web/src/api.test.ts`가 malformed effectiveness-summary `prompt_body`
  body를 `Archive score report failed: Invalid response.`로 reject하도록 요구하게 해 현재 unsafe effectiveness summary resolve 실패를 확인한다.
- [x] GREEN: effectiveness-summary measured/unmeasured/verdicts/calibration/evidence refs/next_action 계약을 확인하고 raw body/path-like fields는 raw-free archive score contract 오류로 중단하도록 고친다.
- [x] VERIFY: focused web API test, implementation format check, typecheck, diff whitespace check를 실행한다.

## 2026-07-08 PromptLane Web Archive Score Distribution Contract Error

- [x] CHECK: web API `getArchiveScoreReport`가 `/api/v1/score` 성공 응답의
  `distribution` 계약을 검증하지 않아 raw prompt/path-like field나 깨진 band count가 archive score UI 데이터로 넘어갈 수 있다.
- [x] RED: `src/web/src/api.test.ts`가 malformed distribution `prompt_body`
  body를 `Archive score report failed: Invalid response.`로 reject하도록 요구하게 해 현재 unsafe distribution resolve 실패를 확인한다.
- [x] GREEN: distribution excellent/good/needs_work/weak 숫자 계약을 확인하고 raw body/path-like fields는 raw-free archive score contract 오류로 중단하도록 고친다.
- [x] VERIFY: focused web API test, implementation format check, typecheck, diff whitespace check를 실행한다.

## 2026-07-08 PromptLane Web Archive Score Summary Contract Error

- [x] CHECK: web API `getArchiveScoreReport`가 `/api/v1/score` 성공 응답의
  `archive_score` 내부 계약을 검증하지 않아 raw prompt/path-like field나 깨진 score summary가 archive score UI 데이터로 넘어갈 수 있다.
- [x] RED: `src/web/src/api.test.ts`가 malformed archive-score `prompt_body`
  body를 `Archive score report failed: Invalid response.`로 reject하도록 요구하게 해 현재 unsafe archive-score summary resolve 실패를 확인한다.
- [x] GREEN: archive-score average/max/band/scored_prompts/total_prompts 계약을 확인하고 raw body/path-like fields는 raw-free archive score contract 오류로 중단하도록 고친다.
- [x] VERIFY: focused web API test, implementation format check, typecheck, diff whitespace check를 실행한다.

## 2026-07-08 PromptLane Web Archive Score Top Gaps Contract Error

- [x] CHECK: web API `getArchiveScoreReport`가 `/api/v1/score` 성공 응답의
  `top_gaps[]` item 계약을 검증하지 않아 raw prompt/path-like field가 archive score UI 데이터로 넘어갈 수 있다.
- [x] RED: `src/web/src/api.test.ts`가 malformed top-gap `prompt_body`
  body를 `Archive score report failed: Invalid response.`로 reject하도록 요구하게 해 현재 unsafe top-gap resolve 실패를 확인한다.
- [x] GREEN: top-gap label/count/rate 계약을 확인하고 raw body/path-like fields는 raw-free archive score contract 오류로 중단하도록 고친다.
- [x] VERIFY: focused web API test, implementation format check, typecheck, diff whitespace check를 실행한다.

## 2026-07-08 PromptLane Web Archive Score Practice Plan Contract Error

- [x] CHECK: web API `getArchiveScoreReport`가 `/api/v1/score` 성공 응답의
  `practice_plan[]` item 계약을 검증하지 않아 raw prompt/path-like field가 archive score UI 데이터로 넘어갈 수 있다.
- [x] RED: `src/web/src/api.test.ts`가 malformed practice-plan `prompt_body`
  body를 `Archive score report failed: Invalid response.`로 reject하도록 요구하게 해 현재 unsafe practice-plan resolve 실패를 확인한다.
- [x] GREEN: practice-plan priority/label/prompt_rule/reason/count/rate 계약을 확인하고 raw body/path-like fields는 raw-free archive score contract 오류로 중단하도록 고친다.
- [x] VERIFY: focused web API test, implementation format check, typecheck, diff whitespace check를 실행한다.

## 2026-07-08 PromptLane Web Archive Score Low Prompts Contract Error

- [x] CHECK: web API `getArchiveScoreReport`가 `/api/v1/score` 성공 응답의
  `low_score_prompts[]` item 계약을 검증하지 않아 prompt body 같은 raw field가 archive score UI 데이터로 넘어갈 수 있다.
- [x] RED: `src/web/src/api.test.ts`가 malformed low-score prompt `prompt_body`
  body를 `Archive score report failed: Invalid response.`로 reject하도록 요구하게 해 현재 unsafe low-score prompt resolve 실패를 확인한다.
- [x] GREEN: low-score prompt summary id/tool/project/score/gaps/tags/sensitivity 계약을 확인하고 raw body/path-like fields는 raw-free archive score contract 오류로 중단하도록 고친다.
- [x] VERIFY: focused web API test, implementation format check, typecheck, diff whitespace check를 실행한다.

## 2026-07-08 PromptLane Web Archive Score Privacy Contract Error

- [x] CHECK: web API `getArchiveScoreReport`가 `/api/v1/score` 성공 응답의
  `privacy` local-first/raw-free 계약을 검증하지 않아 prompt bodies 또는 raw paths 반환 가능 상태를 web UI에 넘길 수 있다.
- [x] RED: `src/web/src/api.test.ts`가 malformed archive score `privacy.returns_prompt_bodies`
  body를 `Archive score report failed: Invalid response.`로 reject하도록 요구하게 해 현재 unsafe archive score resolve 실패를 확인한다.
- [x] GREEN: archive score privacy가 local-only, no external calls, no prompt bodies, no raw paths 계약을 만족하는지 확인하고 깨진 privacy block은 raw-free archive score contract 오류로 중단하도록 고친다.
- [x] VERIFY: focused web API test, implementation format check, typecheck, diff whitespace check를 실행한다.

## 2026-07-08 PromptLane Web Loop List Recent Decisions Contract Error

- [x] CHECK: web API `listLoops`가 `/api/v1/loops` 성공 응답의 optional
  `status.activity.recent_decisions[].decision` 계약을 검증하지 않아 깨진 merge/continue/defer 상태가 loop list UI로 넘어갈 수 있다.
- [x] RED: `src/web/src/api.test.ts`가 malformed recent decision `decision` 값을
  `Loop list failed: Invalid response.`로 reject하도록 요구하게 해 현재 unsafe recent decision resolve 실패를 확인한다.
- [x] GREEN: recent decision snapshot/worktree/decision/reason/decided_by/created_at 계약을 확인하고 깨진 recent decision은 raw-free loop list contract 오류로 중단하도록 고친다.
- [x] VERIFY: focused web API test, implementation format check, typecheck, diff whitespace check를 실행한다.

## 2026-07-08 PromptLane Web Loop List Command Center Contract Error

- [x] CHECK: web API `listLoops`가 `/api/v1/loops` 성공 응답의 optional
  `status.activity.command_center.review_packet.status` 계약을 검증하지 않아 깨진 merge-review 상태가 loop list UI로 넘어갈 수 있다.
- [x] RED: `src/web/src/api.test.ts`가 malformed command-center `review_packet.status`를
  `Loop list failed: Invalid response.`로 reject하도록 요구하게 해 현재 unsafe loop command-center resolve 실패를 확인한다.
- [x] GREEN: loop command-center review packet, review items, merge readiness 계약을 확인하고 깨진 command-center는 raw-free loop list contract 오류로 중단하도록 고친다.
- [x] VERIFY: focused web API test, implementation format check, typecheck, diff whitespace check를 실행한다.

## 2026-07-08 PromptLane Web Loop Worktree Renewed Memory Post Submit Retry Renewed Memory Post Submit Collection Uncertainty Reminder Contract Error

- [x] CHECK: web API `getLoopWorktree`가 `/api/v1/loops/worktrees/:worktree` 성공 응답의
  optional `continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_retry_renewed_memory_approval_post_submit_collection_freshness_uncertainty_collection_reminder`
  계약을 검증하지 않아 PromptLane이 post-submit collection freshness를 자동 검증하거나 collection을 자동 시작한다는 guidance를 UI에 넘길 수 있다.
- [x] RED: `src/web/src/api.test.ts`가 malformed
  `continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_retry_renewed_memory_approval_post_submit_collection_freshness_uncertainty_collection_reminder.not_automated`
  body를 `Loop worktree drilldown failed: Invalid response.`로 reject하도록 요구하게 해 현재 unsafe
  renewed-memory-approval post-submit collection freshness uncertainty reminder resolve 실패를 확인한다.
- [x] GREEN: renewed-memory-approval post-submit retry post-submit collection freshness uncertainty label, reminder/not_automated/reason,
  writes_files, external_calls 계약을 확인하고 깨진 guidance는 raw-free drilldown contract 오류로 중단하도록 고친다.
- [x] VERIFY: focused web API test, implementation format check, typecheck, diff whitespace
  check를 실행한다.

## 2026-07-08 PromptLane Web Loop Worktree Renewed Memory Post Submit Retry Renewed Memory Post Submit Collection Freshness Result Contract Error

- [x] CHECK: web API `getLoopWorktree`가 `/api/v1/loops/worktrees/:worktree` 성공 응답의
  optional `continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_retry_renewed_memory_approval_post_submit_collection_freshness_result_non_persistence_note`
  계약을 검증하지 않아 PromptLane이 post-submit collection freshness result를 저장한다는 guidance를 UI에 넘길 수 있다.
- [x] RED: `src/web/src/api.test.ts`가 malformed
  `continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_retry_renewed_memory_approval_post_submit_collection_freshness_result_non_persistence_note.not_stored`
  body를 `Loop worktree drilldown failed: Invalid response.`로 reject하도록 요구하게 해 현재 unsafe
  renewed-memory-approval post-submit collection freshness result non-persistence note resolve 실패를 확인한다.
- [x] GREEN: renewed-memory-approval post-submit retry post-submit collection freshness result label, not_stored/not_detected/reason,
  writes_files, external_calls 계약을 확인하고 깨진 guidance는 raw-free drilldown contract 오류로 중단하도록 고친다.
- [x] VERIFY: focused web API test, implementation format check, typecheck, diff whitespace
  check를 실행한다.

## 2026-07-08 PromptLane Web Loop Worktree Renewed Memory Post Submit Retry Renewed Memory Post Submit Collection Post Submit Contract Error

- [x] CHECK: web API `getLoopWorktree`가 `/api/v1/loops/worktrees/:worktree` 성공 응답의
  optional `continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_retry_renewed_memory_approval_post_submit_collection_post_submit_freshness_advisory`
  계약을 검증하지 않아 PromptLane이 submitted state, agent response, post-submit collection freshness를 모니터링한다는 guidance를 UI에 넘길 수 있다.
- [x] RED: `src/web/src/api.test.ts`가 malformed
  `continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_retry_renewed_memory_approval_post_submit_collection_post_submit_freshness_advisory.not_monitored`
  body를 `Loop worktree drilldown failed: Invalid response.`로 reject하도록 요구하게 해 현재 unsafe
  renewed-memory-approval post-submit collection post-submit freshness advisory resolve 실패를 확인한다.
- [x] GREEN: renewed-memory-approval post-submit retry post-submit collection post-submit label, advisory/not_monitored/reason,
  writes_files, external_calls 계약을 확인하고 깨진 guidance는 raw-free drilldown contract 오류로 중단하도록 고친다.
- [x] VERIFY: focused web API test, implementation format check, typecheck, diff whitespace
  check를 실행한다.

## 2026-07-08 PromptLane Web Loop Worktree Renewed Memory Post Submit Retry Renewed Memory Post Submit Collection Pre Submit Contract Error

- [x] CHECK: web API `getLoopWorktree`가 `/api/v1/loops/worktrees/:worktree` 성공 응답의
  optional `continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_retry_renewed_memory_approval_post_submit_collection_pre_submit_freshness_advisory`
  계약을 검증하지 않아 PromptLane이 submission을 승인하거나 post-submit collection freshness를 검증한다는 guidance를 UI에 넘길 수 있다.
- [x] RED: `src/web/src/api.test.ts`가 malformed
  `continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_retry_renewed_memory_approval_post_submit_collection_pre_submit_freshness_advisory.not_decision`
  body를 `Loop worktree drilldown failed: Invalid response.`로 reject하도록 요구하게 해 현재 unsafe
  renewed-memory-approval post-submit collection pre-submit freshness advisory resolve 실패를 확인한다.
- [x] GREEN: renewed-memory-approval post-submit retry post-submit collection pre-submit label, advisory/not_decision/reason,
  writes_files, external_calls 계약을 확인하고 깨진 guidance는 raw-free drilldown contract 오류로 중단하도록 고친다.
- [x] VERIFY: focused web API test, implementation format check, typecheck, diff whitespace
  check를 실행한다.

## 2026-07-08 PromptLane Web Loop Worktree Renewed Memory Post Submit Retry Renewed Memory Post Submit Collection Pre Paste Contract Error

- [x] CHECK: web API `getLoopWorktree`가 `/api/v1/loops/worktrees/:worktree` 성공 응답의
  optional `continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_retry_renewed_memory_approval_post_submit_collection_pre_paste_freshness_advisory`
  계약을 검증하지 않아 PromptLane이 paste target을 승인하거나 post-submit collection freshness를 검증한다는 guidance를 UI에 넘길 수 있다.
- [x] RED: `src/web/src/api.test.ts`가 malformed
  `continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_retry_renewed_memory_approval_post_submit_collection_pre_paste_freshness_advisory.not_decision`
  body를 `Loop worktree drilldown failed: Invalid response.`로 reject하도록 요구하게 해 현재 unsafe
  renewed-memory-approval post-submit collection pre-paste freshness advisory resolve 실패를 확인한다.
- [x] GREEN: renewed-memory-approval post-submit retry post-submit collection pre-paste label, advisory/not_decision/reason,
  writes_files, external_calls 계약을 확인하고 깨진 guidance는 raw-free drilldown contract 오류로 중단하도록 고친다.
- [x] VERIFY: focused web API test, implementation format check, typecheck, diff whitespace
  check를 실행한다.

## 2026-07-08 PromptLane Web Loop Worktree Renewed Memory Post Submit Retry Renewed Memory Post Submit Collection Pre Handoff Contract Error

- [x] CHECK: web API `getLoopWorktree`가 `/api/v1/loops/worktrees/:worktree` 성공 응답의
  optional `continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_retry_renewed_memory_approval_post_submit_collection_pre_handoff_freshness_advisory`
  계약을 검증하지 않아 PromptLane이 handoff를 승인하거나 post-submit collection freshness를 검증한다는 guidance를 UI에 넘길 수 있다.
- [x] RED: `src/web/src/api.test.ts`가 malformed
  `continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_retry_renewed_memory_approval_post_submit_collection_pre_handoff_freshness_advisory.not_decision`
  body를 `Loop worktree drilldown failed: Invalid response.`로 reject하도록 요구하게 해 현재 unsafe
  renewed-memory-approval post-submit collection pre-handoff freshness advisory resolve 실패를 확인한다.
- [x] GREEN: renewed-memory-approval post-submit retry post-submit collection pre-handoff label, advisory/not_decision/reason,
  writes_files, external_calls 계약을 확인하고 깨진 guidance는 raw-free drilldown contract 오류로 중단하도록 고친다.
- [x] VERIFY: focused web API test, implementation format check, typecheck, diff whitespace
  check를 실행한다.

## 2026-07-08 PromptLane Web Loop Worktree Renewed Memory Post Submit Retry Renewed Memory Post Submit Collection Pre Merge Contract Error

- [x] CHECK: web API `getLoopWorktree`가 `/api/v1/loops/worktrees/:worktree` 성공 응답의
  optional `continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_retry_renewed_memory_approval_post_submit_collection_pre_merge_freshness_advisory`
  계약을 검증하지 않아 PromptLane이 merge를 승인하거나 post-submit collection freshness를 검증한다는 guidance를 UI에 넘길 수 있다.
- [x] RED: `src/web/src/api.test.ts`가 malformed
  `continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_retry_renewed_memory_approval_post_submit_collection_pre_merge_freshness_advisory.not_decision`
  body를 `Loop worktree drilldown failed: Invalid response.`로 reject하도록 요구하게 해 현재 unsafe
  renewed-memory-approval post-submit collection pre-merge freshness advisory resolve 실패를 확인한다.
- [x] GREEN: renewed-memory-approval post-submit retry post-submit collection pre-merge label, advisory/not_decision/reason,
  writes_files, external_calls 계약을 확인하고 깨진 guidance는 raw-free drilldown contract 오류로 중단하도록 고친다.
- [x] VERIFY: focused web API test, implementation format check, typecheck, diff whitespace
  check를 실행한다.

## 2026-07-08 PromptLane Web Loop Worktree Renewed Memory Post Submit Retry Renewed Memory Post Submit Collection Uncertainty Contract Error

- [x] CHECK: web API `getLoopWorktree`가 `/api/v1/loops/worktrees/:worktree` 성공 응답의
  optional `continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_retry_renewed_memory_approval_post_submit_collection_uncertainty_reminder`
  계약을 검증하지 않아 PromptLane이 post-submit retry renewed-memory-approval post-submit collection result를 검증하거나 collection을 자동 시작한다는
  guidance를 UI에 넘길 수 있다.
- [x] RED: `src/web/src/api.test.ts`가 malformed
  `continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_retry_renewed_memory_approval_post_submit_collection_uncertainty_reminder.not_automated`
  body를 `Loop worktree drilldown failed: Invalid response.`로 reject하도록 요구하게 해 현재 unsafe
  renewed-memory-approval post-submit collection uncertainty reminder resolve 실패를 확인한다.
- [x] GREEN: renewed-memory-approval post-submit retry post-submit collection uncertainty label, reminder/not_automated/reason,
  writes_files, external_calls 계약을 확인하고 깨진 guidance는 raw-free drilldown contract 오류로 중단하도록 고친다.
- [x] VERIFY: focused web API test, implementation format check, typecheck, diff whitespace
  check를 실행한다.

## 2026-07-08 PromptLane Web Loop Worktree Renewed Memory Post Submit Retry Renewed Memory Post Submit Collection Result Contract Error

- [x] CHECK: web API `getLoopWorktree`가 `/api/v1/loops/worktrees/:worktree` 성공 응답의
  optional `continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_retry_renewed_memory_approval_post_submit_collection_result_non_persistence_note`
  계약을 검증하지 않아 PromptLane이 post-submit retry renewed-memory-approval post-submit collection result를 저장하거나 동기화한다는
  guidance를 UI에 넘길 수 있다.
- [x] RED: `src/web/src/api.test.ts`가 malformed
  `continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_retry_renewed_memory_approval_post_submit_collection_result_non_persistence_note.not_stored`
  body를 `Loop worktree drilldown failed: Invalid response.`로 reject하도록 요구하게 해 현재 unsafe
  renewed-memory-approval post-submit collection result note resolve 실패를 확인한다.
- [x] GREEN: renewed-memory-approval post-submit retry post-submit collection result label, result_scope/not_stored/reason,
  writes_files, external_calls 계약을 확인하고 깨진 guidance는 raw-free drilldown contract 오류로 중단하도록 고친다.
- [x] VERIFY: focused web API test, implementation format check, typecheck, diff whitespace
  check를 실행한다.

## 2026-07-08 PromptLane Web Loop Worktree Renewed Memory Post Submit Retry Renewed Memory Post Submit Contract Error

- [x] CHECK: web API `getLoopWorktree`가 `/api/v1/loops/worktrees/:worktree` 성공 응답의
  optional `continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_retry_renewed_memory_approval_post_submit_freshness_advisory`
  계약을 검증하지 않아 PromptLane이 submitted state나 agent response를 감시해 post-submit retry renewed-memory-approval freshness를
  자동 검증하는 guidance를 UI에 넘길 수 있다.
- [x] RED: `src/web/src/api.test.ts`가 malformed
  `continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_retry_renewed_memory_approval_post_submit_freshness_advisory.not_automated`
  body를 `Loop worktree drilldown failed: Invalid response.`로 reject하도록 요구하게 해 현재 unsafe
  renewed-memory-approval post-submit freshness advisory resolve 실패를 확인한다.
- [x] GREEN: renewed-memory-approval post-submit retry post-submit freshness label, advisory/not_automated/reason,
  writes_files, external_calls 계약을 확인하고 깨진 guidance는 raw-free drilldown contract 오류로 중단하도록 고친다.
- [x] VERIFY: focused web API test, implementation format check, typecheck, diff whitespace
  check를 실행한다.

## 2026-07-08 PromptLane Web Loop Worktree Renewed Memory Post Submit Retry Renewed Memory Pre Submit Contract Error

- [x] CHECK: web API `getLoopWorktree`가 `/api/v1/loops/worktrees/:worktree` 성공 응답의
  optional `continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_retry_renewed_memory_approval_pre_submit_freshness_advisory`
  계약을 검증하지 않아 PromptLane이 submission을 승인하거나 post-submit retry renewed-memory-approval freshness를 검증하는
  guidance를 UI에 넘길 수 있다.
- [x] RED: `src/web/src/api.test.ts`가 malformed
  `continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_retry_renewed_memory_approval_pre_submit_freshness_advisory.not_decision`
  body를 `Loop worktree drilldown failed: Invalid response.`로 reject하도록 요구하게 해 현재 unsafe
  renewed-memory-approval pre-submit freshness advisory resolve 실패를 확인한다.
- [x] GREEN: renewed-memory-approval post-submit retry pre-submit freshness label, advisory/not_decision/reason,
  writes_files, external_calls 계약을 확인하고 깨진 guidance는 raw-free drilldown contract 오류로 중단하도록 고친다.
- [x] VERIFY: focused web API test, implementation format check, typecheck, diff whitespace
  check를 실행한다.

## 2026-07-08 PromptLane Web Loop Worktree Renewed Memory Post Submit Retry Renewed Memory Pre Paste Contract Error

- [x] CHECK: web API `getLoopWorktree`가 `/api/v1/loops/worktrees/:worktree` 성공 응답의
  optional `continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_retry_renewed_memory_approval_pre_paste_freshness_advisory`
  계약을 검증하지 않아 PromptLane이 paste target을 승인하거나 post-submit retry renewed-memory-approval freshness를 검증하는
  guidance를 UI에 넘길 수 있다.
- [x] RED: `src/web/src/api.test.ts`가 malformed
  `continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_retry_renewed_memory_approval_pre_paste_freshness_advisory.not_decision`
  body를 `Loop worktree drilldown failed: Invalid response.`로 reject하도록 요구하게 해 현재 unsafe
  renewed-memory-approval pre-paste freshness advisory resolve 실패를 확인한다.
- [x] GREEN: renewed-memory-approval post-submit retry pre-paste freshness label, advisory/not_decision/reason,
  writes_files, external_calls 계약을 확인하고 깨진 guidance는 raw-free drilldown contract 오류로 중단하도록 고친다.
- [x] VERIFY: focused web API test, implementation format check, typecheck, diff whitespace
  check를 실행한다.

## 2026-07-08 PromptLane Web Loop Worktree Renewed Memory Post Submit Retry Renewed Memory Pre Handoff Contract Error

- [x] CHECK: web API `getLoopWorktree`가 `/api/v1/loops/worktrees/:worktree` 성공 응답의
  optional `continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_retry_renewed_memory_approval_pre_handoff_freshness_advisory`
  계약을 검증하지 않아 PromptLane이 handoff를 승인하거나 post-submit retry renewed-memory-approval freshness를 검증하는
  guidance를 UI에 넘길 수 있다.
- [x] RED: `src/web/src/api.test.ts`가 malformed
  `continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_retry_renewed_memory_approval_pre_handoff_freshness_advisory.not_decision`
  body를 `Loop worktree drilldown failed: Invalid response.`로 reject하도록 요구하게 해 현재 unsafe
  renewed-memory-approval pre-handoff freshness advisory resolve 실패를 확인한다.
- [x] GREEN: renewed-memory-approval post-submit retry pre-handoff freshness label, advisory/not_decision/reason,
  writes_files, external_calls 계약을 확인하고 깨진 guidance는 raw-free drilldown contract 오류로 중단하도록 고친다.
- [x] VERIFY: focused web API test, implementation format check, typecheck, diff whitespace
  check를 실행한다.

## 2026-07-08 PromptLane Web Loop Worktree Renewed Memory Post Submit Retry Renewed Memory Pre Merge Contract Error

- [x] CHECK: web API `getLoopWorktree`가 `/api/v1/loops/worktrees/:worktree` 성공 응답의
  optional `continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_retry_renewed_memory_approval_pre_merge_freshness_advisory`
  계약을 검증하지 않아 PromptLane이 merge를 승인하거나 post-submit retry renewed-memory-approval freshness를 검증하는
  guidance를 UI에 넘길 수 있다.
- [x] RED: `src/web/src/api.test.ts`가 malformed
  `continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_retry_renewed_memory_approval_pre_merge_freshness_advisory.not_decision`
  body를 `Loop worktree drilldown failed: Invalid response.`로 reject하도록 요구하게 해 현재 unsafe
  renewed-memory-approval pre-merge freshness advisory resolve 실패를 확인한다.
- [x] GREEN: renewed-memory-approval post-submit retry pre-merge freshness label, advisory/not_decision/reason,
  writes_files, external_calls 계약을 확인하고 깨진 guidance는 raw-free drilldown contract 오류로 중단하도록 고친다.
- [x] VERIFY: focused web API test, implementation format check, typecheck, diff whitespace
  check를 실행한다.

## 2026-07-08 PromptLane Web Loop Worktree Renewed Memory Post Submit Retry Renewed Memory Uncertainty Contract Error

- [x] CHECK: web API `getLoopWorktree`가 `/api/v1/loops/worktrees/:worktree` 성공 응답의
  optional `continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_retry_renewed_memory_approval_collection_uncertainty_reminder`
  계약을 검증하지 않아 PromptLane이 post-submit retry renewed-memory-approval collection result를 자동 검증하거나 collection을 자동 시작하는
  guidance를 UI에 넘길 수 있다.
- [x] RED: `src/web/src/api.test.ts`가 malformed
  `continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_retry_renewed_memory_approval_collection_uncertainty_reminder.not_automated`
  body를 `Loop worktree drilldown failed: Invalid response.`로 reject하도록 요구하게 해 현재 unsafe
  renewed-memory-approval collection uncertainty reminder resolve 실패를 확인한다.
- [x] GREEN: renewed-memory-approval post-submit retry renewed-memory collection uncertainty label, reminder/not_automated/reason,
  writes_files, external_calls 계약을 확인하고 깨진 guidance는 raw-free drilldown contract 오류로 중단하도록 고친다.
- [x] VERIFY: focused web API test, implementation format check, typecheck, diff whitespace
  check를 실행한다.

## 2026-07-08 PromptLane Web Loop Worktree Renewed Memory Post Submit Retry Renewed Memory Result Contract Error

- [x] CHECK: web API `getLoopWorktree`가 `/api/v1/loops/worktrees/:worktree` 성공 응답의
  optional `continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_retry_renewed_memory_approval_collection_result_non_persistence_note`
  계약을 검증하지 않아 PromptLane이 post-submit retry renewed-memory-approval collection result state를 detect/store/sync하는
  guidance를 UI에 넘길 수 있다.
- [x] RED: `src/web/src/api.test.ts`가 malformed
  `continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_retry_renewed_memory_approval_collection_result_non_persistence_note.not_stored`
  body를 `Loop worktree drilldown failed: Invalid response.`로 reject하도록 요구하게 해 현재 unsafe
  renewed-memory-approval collection result resolve 실패를 확인한다.
- [x] GREEN: renewed-memory-approval post-submit retry renewed-memory collection result label, result_scope/not_stored/reason,
  writes_files, external_calls 계약을 확인하고 깨진 guidance는 raw-free drilldown contract 오류로 중단하도록 고친다.
- [x] VERIFY: focused web API test, implementation format check, typecheck, diff whitespace
  check를 실행한다.

## 2026-07-08 PromptLane Web Loop Worktree Renewed Memory Post Submit Retry Renewed Memory Collection Contract Error

- [x] CHECK: web API `getLoopWorktree`가 `/api/v1/loops/worktrees/:worktree` 성공 응답의
  optional `continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_retry_renewed_memory_approval_collection_reminder`
  계약을 검증하지 않아 PromptLane이 post-submit retry renewed memory approval이나 hidden approval signal에서 collection을 자동 시작하는
  guidance를 UI에 넘길 수 있다.
- [x] RED: `src/web/src/api.test.ts`가 malformed
  `continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_retry_renewed_memory_approval_collection_reminder.not_automated`
  body를 `Loop worktree drilldown failed: Invalid response.`로 reject하도록 요구하게 해 현재 unsafe
  renewed memory approval collection reminder resolve 실패를 확인한다.
- [x] GREEN: renewed-memory-approval post-submit retry renewed memory collection label, reminder/not_automated/reason,
  writes_files, external_calls 계약을 확인하고 깨진 guidance는 raw-free drilldown contract 오류로 중단하도록 고친다.
- [x] VERIFY: focused web API test, implementation format check, typecheck, diff whitespace
  check를 실행한다.

## 2026-07-08 PromptLane Web Loop Worktree Renewed Memory Post Submit Retry Pre Memory Contract Error

- [x] CHECK: web API `getLoopWorktree`가 `/api/v1/loops/worktrees/:worktree` 성공 응답의
  optional `continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_retry_pre_memory_approval_freshness_advisory`
  계약을 검증하지 않아 PromptLane이 이 advisory에서 memory를 승인하거나 post-submit retry freshness를 검증하는
  guidance를 UI에 넘길 수 있다.
- [x] RED: `src/web/src/api.test.ts`가 malformed
  `continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_retry_pre_memory_approval_freshness_advisory.not_decision`
  body를 `Loop worktree drilldown failed: Invalid response.`로 reject하도록 요구하게 해 현재 unsafe
  pre-memory-approval freshness advisory resolve 실패를 확인한다.
- [x] GREEN: renewed-memory-approval post-submit retry pre-memory approval label, advisory/not_decision/reason,
  writes_files, external_calls 계약을 확인하고 깨진 guidance는 raw-free drilldown contract 오류로 중단하도록 고친다.
- [x] VERIFY: focused web API test, implementation format check, typecheck, diff whitespace
  check를 실행한다.

## 2026-07-08 PromptLane Web Loop Worktree Renewed Memory Post Submit Retry Freshness Uncertainty Contract Error

- [x] CHECK: web API `getLoopWorktree`가 `/api/v1/loops/worktrees/:worktree` 성공 응답의
  optional `continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_retry_freshness_uncertainty_collection_reminder`
  계약을 검증하지 않아 PromptLane이 post-submit retry freshness를 자동 검증하거나 collection을 자동 시작하는
  guidance를 UI에 넘길 수 있다.
- [x] RED: `src/web/src/api.test.ts`가 malformed
  `continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_retry_freshness_uncertainty_collection_reminder.not_automated`
  body를 `Loop worktree drilldown failed: Invalid response.`로 reject하도록 요구하게 해 현재 unsafe
  post-submit retry freshness uncertainty resolve 실패를 확인한다.
- [x] GREEN: renewed-memory-approval post-submit retry freshness uncertainty label, collection_trigger/not_automated/reason,
  writes_files, external_calls 계약을 확인하고 깨진 guidance는 raw-free drilldown contract 오류로 중단하도록 고친다.
- [x] VERIFY: focused web API test, implementation format check, typecheck, diff whitespace
  check를 실행한다.

## 2026-07-08 PromptLane Web Loop Worktree Renewed Memory Post Submit Retry Freshness Result Contract Error

- [x] CHECK: web API `getLoopWorktree`가 `/api/v1/loops/worktrees/:worktree` 성공 응답의
  optional `continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_retry_freshness_result_non_persistence_note`
  계약을 검증하지 않아 PromptLane이 post-submit retry freshness result state를 detect/store/sync하는
  guidance를 UI에 넘길 수 있다.
- [x] RED: `src/web/src/api.test.ts`가 malformed
  `continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_retry_freshness_result_non_persistence_note.not_stored`
  body를 `Loop worktree drilldown failed: Invalid response.`로 reject하도록 요구하게 해 현재 unsafe
  post-submit retry freshness result resolve 실패를 확인한다.
- [x] GREEN: renewed-memory-approval post-submit retry freshness result label, result_scope/not_stored/reason,
  writes_files, external_calls 계약을 확인하고 깨진 guidance는 raw-free drilldown contract 오류로 중단하도록 고친다.
- [x] VERIFY: focused web API test, implementation format check, typecheck, diff whitespace
  check를 실행한다.

## 2026-07-08 PromptLane Web Loop Worktree Renewed Memory Post Submit Retry Evidence Contract Error

- [x] CHECK: web API `getLoopWorktree`가 `/api/v1/loops/worktrees/:worktree` 성공 응답의
  optional `continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_retry_evidence_freshness_boundary_note`
  계약을 검증하지 않아 PromptLane이 git status, transcript, agent UI activity에서 post-submit retry evidence freshness를
  자동 검증하는 guidance를 UI에 넘길 수 있다.
- [x] RED: `src/web/src/api.test.ts`가 malformed
  `continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_retry_evidence_freshness_boundary_note.not_verified`
  body를 `Loop worktree drilldown failed: Invalid response.`로 reject하도록 요구하게 해 현재 unsafe
  post-submit retry evidence freshness resolve 실패를 확인한다.
- [x] GREEN: renewed-memory-approval post-submit retry evidence freshness label, freshness_scope/not_verified/reason,
  writes_files, external_calls 계약을 확인하고 깨진 guidance는 raw-free drilldown contract 오류로 중단하도록 고친다.
- [x] VERIFY: focused web API test, implementation format check, typecheck, diff whitespace
  check를 실행한다.

## 2026-07-08 PromptLane Web Loop Worktree Renewed Memory Post Submit Retry Outcome Contract Error

- [x] CHECK: web API `getLoopWorktree`가 `/api/v1/loops/worktrees/:worktree` 성공 응답의
  optional `continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_retry_outcome_non_persistence_note`
  계약을 검증하지 않아 PromptLane이 post-submit retry outcome state를 detect/store/sync하는
  guidance를 UI에 넘길 수 있다.
- [x] RED: `src/web/src/api.test.ts`가 malformed
  `continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_retry_outcome_non_persistence_note.not_stored`
  body를 `Loop worktree drilldown failed: Invalid response.`로 reject하도록 요구하게 해 현재 unsafe
  post-submit retry outcome resolve 실패를 확인한다.
- [x] GREEN: renewed-memory-approval post-submit retry outcome label, outcome_scope/not_stored/reason,
  writes_files, external_calls 계약을 확인하고 깨진 guidance는 raw-free drilldown contract 오류로 중단하도록 고친다.
- [x] VERIFY: focused web API test, implementation format check, typecheck, diff whitespace
  check를 실행한다.

## 2026-07-08 PromptLane Web Loop Worktree Renewed Memory Post Submit Retry Boundary Contract Error

- [x] CHECK: web API `getLoopWorktree`가 `/api/v1/loops/worktrees/:worktree` 성공 응답의
  optional `continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_collection_retry_boundary_note`
  계약을 검증하지 않아 PromptLane이 post-submit collection command를 자동 retry하거나 hidden recovery를 수행하는
  guidance를 UI에 넘길 수 있다.
- [x] RED: `src/web/src/api.test.ts`가 malformed
  `continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_collection_retry_boundary_note.not_automated`
  body를 `Loop worktree drilldown failed: Invalid response.`로 reject하도록 요구하게 해 현재 unsafe
  post-submit retry boundary resolve 실패를 확인한다.
- [x] GREEN: renewed-memory-approval post-submit retry boundary label, retry/not_automated/reason,
  writes_files, external_calls 계약을 확인하고 깨진 guidance는 raw-free drilldown contract 오류로 중단하도록 고친다.
- [x] VERIFY: focused web API test, implementation format check, typecheck, diff whitespace
  check를 실행한다.

## 2026-07-08 PromptLane Web Loop Worktree Renewed Memory Post Submit Result Contract Error

- [x] CHECK: web API `getLoopWorktree`가 `/api/v1/loops/worktrees/:worktree` 성공 응답의
  optional `continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_collection_result_non_persistence_note`
  계약을 검증하지 않아 PromptLane이 post-submit collection result state를 detect/store/sync하는
  guidance를 UI에 넘길 수 있다.
- [x] RED: `src/web/src/api.test.ts`가 malformed
  `continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_collection_result_non_persistence_note.not_stored`
  body를 `Loop worktree drilldown failed: Invalid response.`로 reject하도록 요구하게 해 현재 unsafe
  post-submit collection result note resolve 실패를 확인한다.
- [x] GREEN: renewed-memory-approval post-submit collection result note label, result_scope/not_stored/reason,
  writes_files, external_calls 계약을 확인하고 깨진 guidance는 raw-free drilldown contract 오류로 중단하도록 고친다.
- [x] VERIFY: focused web API test, implementation format check, typecheck, diff whitespace
  check를 실행한다.

## 2026-07-08 PromptLane Web Loop Worktree Renewed Memory Post Submit Advisory Contract Error

- [x] CHECK: web API `getLoopWorktree`가 `/api/v1/loops/worktrees/:worktree` 성공 응답의
  optional `continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_freshness_advisory`
  계약을 검증하지 않아 PromptLane이 submitted state, agent responses, renewed-memory-approval freshness를
  자동 모니터링하는 guidance를 UI에 넘길 수 있다.
- [x] RED: `src/web/src/api.test.ts`가 malformed
  `continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_freshness_advisory.not_automated`
  body를 `Loop worktree drilldown failed: Invalid response.`로 reject하도록 요구하게 해 현재 unsafe
  post-submit advisory resolve 실패를 확인한다.
- [x] GREEN: renewed-memory-approval post-submit freshness advisory label, advisory/not_automated/reason,
  writes_files, external_calls 계약을 확인하고 깨진 guidance는 raw-free drilldown contract 오류로 중단하도록 고친다.
- [x] VERIFY: focused web API test, implementation format check, typecheck, diff whitespace
  check를 실행한다.

## 2026-07-08 PromptLane Web Loop Worktree Renewed Memory Pre Submit Advisory Contract Error

- [x] CHECK: web API `getLoopWorktree`가 `/api/v1/loops/worktrees/:worktree` 성공 응답의
  optional `continuation_safety_post_memory_approval_retry_renewed_memory_approval_pre_submit_freshness_advisory`
  계약을 검증하지 않아 PromptLane이 submission approve나 renewed-memory-approval freshness verification을 수행하는
  guidance를 UI에 넘길 수 있다.
- [x] RED: `src/web/src/api.test.ts`가 malformed
  `continuation_safety_post_memory_approval_retry_renewed_memory_approval_pre_submit_freshness_advisory.not_decision`
  body를 `Loop worktree drilldown failed: Invalid response.`로 reject하도록 요구하게 해 현재 unsafe
  pre-submit advisory resolve 실패를 확인한다.
- [x] GREEN: renewed-memory-approval pre-submit freshness advisory label, advisory/not_decision/reason,
  writes_files, external_calls 계약을 확인하고 깨진 guidance는 raw-free drilldown contract 오류로 중단하도록 고친다.
- [x] VERIFY: focused web API test, implementation format check, typecheck, diff whitespace
  check를 실행한다.

## 2026-07-08 PromptLane Web Loop Worktree Renewed Memory Pre Paste Advisory Contract Error

- [x] CHECK: web API `getLoopWorktree`가 `/api/v1/loops/worktrees/:worktree` 성공 응답의
  optional `continuation_safety_post_memory_approval_retry_renewed_memory_approval_pre_paste_freshness_advisory`
  계약을 검증하지 않아 PromptLane이 paste target approve나 renewed-memory-approval freshness verification을 수행하는
  guidance를 UI에 넘길 수 있다.
- [x] RED: `src/web/src/api.test.ts`가 malformed
  `continuation_safety_post_memory_approval_retry_renewed_memory_approval_pre_paste_freshness_advisory.not_decision`
  body를 `Loop worktree drilldown failed: Invalid response.`로 reject하도록 요구하게 해 현재 unsafe
  pre-paste advisory resolve 실패를 확인한다.
- [x] GREEN: renewed-memory-approval pre-paste freshness advisory label, advisory/not_decision/reason,
  writes_files, external_calls 계약을 확인하고 깨진 guidance는 raw-free drilldown contract 오류로 중단하도록 고친다.
- [x] VERIFY: focused web API test, implementation format check, typecheck, diff whitespace
  check를 실행한다.

## 2026-07-08 PromptLane Web Loop Worktree Renewed Memory Pre Handoff Advisory Contract Error

- [x] CHECK: web API `getLoopWorktree`가 `/api/v1/loops/worktrees/:worktree` 성공 응답의
  optional `continuation_safety_post_memory_approval_retry_renewed_memory_approval_pre_handoff_freshness_advisory`
  계약을 검증하지 않아 PromptLane이 handoff approve나 renewed-memory-approval freshness verification을 수행하는
  guidance를 UI에 넘길 수 있다.
- [x] RED: `src/web/src/api.test.ts`가 malformed
  `continuation_safety_post_memory_approval_retry_renewed_memory_approval_pre_handoff_freshness_advisory.not_decision`
  body를 `Loop worktree drilldown failed: Invalid response.`로 reject하도록 요구하게 해 현재 unsafe
  pre-handoff advisory resolve 실패를 확인한다.
- [x] GREEN: renewed-memory-approval pre-handoff freshness advisory label, advisory/not_decision/reason,
  writes_files, external_calls 계약을 확인하고 깨진 guidance는 raw-free drilldown contract 오류로 중단하도록 고친다.
- [x] VERIFY: focused web API test, implementation format check, typecheck, diff whitespace
  check를 실행한다.

## 2026-07-08 PromptLane Web Loop Worktree Renewed Memory Pre Merge Advisory Contract Error

- [x] CHECK: web API `getLoopWorktree`가 `/api/v1/loops/worktrees/:worktree` 성공 응답의
  optional `continuation_safety_post_memory_approval_retry_renewed_memory_approval_pre_merge_freshness_advisory`
  계약을 검증하지 않아 PromptLane이 merge approve나 renewed-memory-approval freshness verification을 수행하는
  guidance를 UI에 넘길 수 있다.
- [x] RED: `src/web/src/api.test.ts`가 malformed
  `continuation_safety_post_memory_approval_retry_renewed_memory_approval_pre_merge_freshness_advisory.not_decision`
  body를 `Loop worktree drilldown failed: Invalid response.`로 reject하도록 요구하게 해 현재 unsafe
  pre-merge advisory resolve 실패를 확인한다.
- [x] GREEN: renewed-memory-approval pre-merge freshness advisory label, advisory/not_decision/reason,
  writes_files, external_calls 계약을 확인하고 깨진 guidance는 raw-free drilldown contract 오류로 중단하도록 고친다.
- [x] VERIFY: focused web API test, implementation format check, typecheck, diff whitespace
  check를 실행한다.

## 2026-07-08 PromptLane Web Loop Worktree Renewed Memory Collection Uncertainty Contract Error

- [x] CHECK: web API `getLoopWorktree`가 `/api/v1/loops/worktrees/:worktree` 성공 응답의
  optional `continuation_safety_post_memory_approval_retry_renewed_memory_approval_collection_uncertainty_reminder`
  계약을 검증하지 않아 PromptLane이 renewed-memory-approval collection result를 verify하거나 collection을
  자동 시작하는 guidance를 UI에 넘길 수 있다.
- [x] RED: `src/web/src/api.test.ts`가 malformed
  `continuation_safety_post_memory_approval_retry_renewed_memory_approval_collection_uncertainty_reminder.not_automated`
  body를 `Loop worktree drilldown failed: Invalid response.`로 reject하도록 요구하게 해 현재 unsafe
  collection uncertainty reminder resolve 실패를 확인한다.
- [x] GREEN: renewed-memory-approval collection uncertainty reminder label, reminder/not_automated/reason,
  writes_files, external_calls 계약을 확인하고 깨진 guidance는 raw-free drilldown contract 오류로 중단하도록 고친다.
- [x] VERIFY: focused web API test, implementation format check, typecheck, diff whitespace
  check를 실행한다.

## 2026-07-08 PromptLane Web Loop Worktree Renewed Memory Collection Result Contract Error

- [x] CHECK: web API `getLoopWorktree`가 `/api/v1/loops/worktrees/:worktree` 성공 응답의
  optional `continuation_safety_post_memory_approval_retry_renewed_memory_approval_collection_result_non_persistence_note`
  계약을 검증하지 않아 PromptLane이 renewed-memory-approval collection result 상태를 detect/store/sync하는
  guidance를 UI에 넘길 수 있다.
- [x] RED: `src/web/src/api.test.ts`가 malformed
  `continuation_safety_post_memory_approval_retry_renewed_memory_approval_collection_result_non_persistence_note.not_stored`
  body를 `Loop worktree drilldown failed: Invalid response.`로 reject하도록 요구하게 해 현재 unsafe
  collection result note resolve 실패를 확인한다.
- [x] GREEN: renewed-memory-approval collection result note label, result_scope/not_stored/reason,
  writes_files, external_calls 계약을 확인하고 깨진 guidance는 raw-free drilldown contract 오류로 중단하도록 고친다.
- [x] VERIFY: focused web API test, implementation format check, typecheck, diff whitespace
  check를 실행한다.

## 2026-07-08 PromptLane Web Loop Worktree Renewed Memory Collection Reminder Contract Error

- [x] CHECK: web API `getLoopWorktree`가 `/api/v1/loops/worktrees/:worktree` 성공 응답의
  optional `continuation_safety_post_memory_approval_retry_renewed_memory_approval_collection_reminder` 계약을
  검증하지 않아 PromptLane이 renewed memory approval 이후 collection을 자동 시작하는 guidance를 UI에 넘길 수 있다.
- [x] RED: `src/web/src/api.test.ts`가 malformed
  `continuation_safety_post_memory_approval_retry_renewed_memory_approval_collection_reminder.not_automated` body를
  `Loop worktree drilldown failed: Invalid response.`로 reject하도록 요구하게 해 현재 unsafe
  renewed-memory collection reminder resolve 실패를 확인한다.
- [x] GREEN: renewed-memory-approval collection reminder label, reminder/not_automated/reason,
  writes_files, external_calls 계약을 확인하고 깨진 guidance는 raw-free drilldown contract 오류로 중단하도록 고친다.
- [x] VERIFY: focused web API test, implementation format check, typecheck, diff whitespace
  check를 실행한다.

## 2026-07-08 PromptLane Web Loop Worktree Post Memory Approval Retry Pre Memory Advisory Contract Error

- [x] CHECK: web API `getLoopWorktree`가 `/api/v1/loops/worktrees/:worktree` 성공 응답의
  optional `continuation_safety_post_memory_approval_retry_pre_memory_approval_freshness_advisory` 계약을
  검증하지 않아 PromptLane이 renewed memory approval이나 post-approval retry freshness verification을 수행하는 guidance를 UI에 넘길 수 있다.
- [x] RED: `src/web/src/api.test.ts`가 malformed
  `continuation_safety_post_memory_approval_retry_pre_memory_approval_freshness_advisory.not_decision` body를
  `Loop worktree drilldown failed: Invalid response.`로 reject하도록 요구하게 해 현재 unsafe
  post-memory-approval retry pre-memory advisory resolve 실패를 확인한다.
- [x] GREEN: post-memory-approval retry pre-memory-approval freshness advisory label, advisory/not_decision/reason,
  writes_files, external_calls 계약을 확인하고 깨진 guidance는 raw-free drilldown contract 오류로 중단하도록 고친다.
- [x] VERIFY: focused web API test, implementation format check, typecheck, diff whitespace
  check를 실행한다.

## 2026-07-08 PromptLane Web Loop Worktree Post Memory Approval Retry Freshness Uncertainty Contract Error

- [x] CHECK: web API `getLoopWorktree`가 `/api/v1/loops/worktrees/:worktree` 성공 응답의
  optional `continuation_safety_post_memory_approval_retry_freshness_uncertainty_collection_reminder` 계약을
  검증하지 않아 PromptLane이 post-approval retry freshness를 verify하거나 collection을 자동 시작하는 guidance를 UI에 넘길 수 있다.
- [x] RED: `src/web/src/api.test.ts`가 malformed
  `continuation_safety_post_memory_approval_retry_freshness_uncertainty_collection_reminder.not_automated` body를
  `Loop worktree drilldown failed: Invalid response.`로 reject하도록 요구하게 해 현재 unsafe
  post-memory-approval retry freshness uncertainty reminder resolve 실패를 확인한다.
- [x] GREEN: post-memory-approval retry freshness uncertainty reminder label, reminder/not_automated/reason,
  writes_files, external_calls 계약을 확인하고 깨진 guidance는 raw-free drilldown contract 오류로 중단하도록 고친다.
- [x] VERIFY: focused web API test, implementation format check, typecheck, diff whitespace
  check를 실행한다.

## 2026-07-08 PromptLane Web Loop Worktree Post Memory Approval Retry Freshness Result Contract Error

- [x] CHECK: web API `getLoopWorktree`가 `/api/v1/loops/worktrees/:worktree` 성공 응답의
  optional `continuation_safety_post_memory_approval_retry_freshness_result_non_persistence_note` 계약을
  검증하지 않아 PromptLane이 post-approval retry freshness result state를 detect/store/sync하는 guidance를 UI에 넘길 수 있다.
- [x] RED: `src/web/src/api.test.ts`가 malformed
  `continuation_safety_post_memory_approval_retry_freshness_result_non_persistence_note.not_stored` body를
  `Loop worktree drilldown failed: Invalid response.`로 reject하도록 요구하게 해 현재 unsafe
  post-memory-approval retry freshness result resolve 실패를 확인한다.
- [x] GREEN: post-memory-approval retry freshness result non-persistence label, result_scope/not_stored/reason,
  writes_files, external_calls 계약을 확인하고 깨진 guidance는 raw-free drilldown contract 오류로 중단하도록 고친다.
- [x] VERIFY: focused web API test, implementation format check, typecheck, diff whitespace
  check를 실행한다.

## 2026-07-08 PromptLane Web Loop Worktree Post Memory Approval Retry Freshness Contract Error

- [x] CHECK: web API `getLoopWorktree`가 `/api/v1/loops/worktrees/:worktree` 성공 응답의
  optional `continuation_safety_post_memory_approval_retry_evidence_freshness_boundary_note` 계약을 검증하지 않아
  post-approval retry freshness를 git status, transcripts, agent UI activity로 검증하는 guidance를 UI에 넘길 수 있다.
- [x] RED: `src/web/src/api.test.ts`가 malformed
  `continuation_safety_post_memory_approval_retry_evidence_freshness_boundary_note.not_verified` body를
  `Loop worktree drilldown failed: Invalid response.`로 reject하도록 요구하게 해 현재 unsafe
  post-memory-approval retry freshness boundary resolve 실패를 확인한다.
- [x] GREEN: post-memory-approval retry evidence freshness boundary label, review/not_verified/reason,
  writes_files, external_calls 계약을 확인하고 깨진 guidance는 raw-free drilldown contract 오류로 중단하도록 고친다.
- [x] VERIFY: focused web API test, implementation format check, typecheck, diff whitespace
  check를 실행한다.

## 2026-07-08 PromptLane Web Loop Worktree Post Memory Approval Retry Outcome Contract Error

- [x] CHECK: web API `getLoopWorktree`가 `/api/v1/loops/worktrees/:worktree` 성공 응답의
  optional `continuation_safety_post_memory_approval_retry_outcome_non_persistence_note` 계약을 검증하지 않아 PromptLane이
  post-approval retry success/failure state를 detect/store/sync하는 guidance를 UI에 넘길 수 있다.
- [x] RED: `src/web/src/api.test.ts`가 malformed
  `continuation_safety_post_memory_approval_retry_outcome_non_persistence_note.not_stored` body를
  `Loop worktree drilldown failed: Invalid response.`로 reject하도록 요구하게 해 현재 unsafe
  post-memory-approval retry outcome resolve 실패를 확인한다.
- [x] GREEN: post-memory-approval retry outcome non-persistence label, outcome_scope/not_stored/reason,
  writes_files, external_calls 계약을 확인하고 깨진 guidance는 raw-free drilldown contract 오류로 중단하도록 고친다.
- [x] VERIFY: focused web API test, implementation format check, typecheck, diff whitespace
  check를 실행한다.

## 2026-07-08 PromptLane Web Loop Worktree Post Memory Approval Collection Retry Contract Error

- [x] CHECK: web API `getLoopWorktree`가 `/api/v1/loops/worktrees/:worktree` 성공 응답의
  optional `continuation_safety_post_memory_approval_collection_retry_boundary_note` 계약을 검증하지 않아 PromptLane이
  post-approval collection retry나 hidden recovery를 자동 실행하는 guidance를 UI에 넘길 수 있다.
- [x] RED: `src/web/src/api.test.ts`가 malformed
  `continuation_safety_post_memory_approval_collection_retry_boundary_note.not_automated` body를
  `Loop worktree drilldown failed: Invalid response.`로 reject하도록 요구하게 해 현재 unsafe
  post-memory-approval collection retry boundary resolve 실패를 확인한다.
- [x] GREEN: post-memory-approval collection retry boundary label, retry/not_automated/reason,
  writes_files, external_calls 계약을 확인하고 깨진 guidance는 raw-free drilldown contract 오류로 중단하도록 고친다.
- [x] VERIFY: focused web API test, implementation format check, typecheck, diff whitespace
  check를 실행한다.

## 2026-07-08 PromptLane Web Loop Worktree Post Memory Approval Collection Result Contract Error

- [x] CHECK: web API `getLoopWorktree`가 `/api/v1/loops/worktrees/:worktree` 성공 응답의
  optional `continuation_safety_post_memory_approval_collection_result_non_persistence_note` 계약을
  검증하지 않아 PromptLane이 post-approval collection result를 detect/store/sync하는 guidance를 UI에 넘길 수 있다.
- [x] RED: `src/web/src/api.test.ts`가 malformed
  `continuation_safety_post_memory_approval_collection_result_non_persistence_note.not_stored` body를
  `Loop worktree drilldown failed: Invalid response.`로 reject하도록 요구하게 해 현재 unsafe
  post-memory-approval collection result resolve 실패를 확인한다.
- [x] GREEN: post-memory-approval collection result non-persistence label, result_scope/not_stored/reason,
  writes_files, external_calls 계약을 확인하고 깨진 guidance는 raw-free drilldown contract 오류로 중단하도록 고친다.
- [x] VERIFY: focused web API test, implementation format check, typecheck, diff whitespace
  check를 실행한다.

## 2026-07-08 PromptLane Web Loop Worktree Post Memory Approval Collection Reminder Contract Error

- [x] CHECK: web API `getLoopWorktree`가 `/api/v1/loops/worktrees/:worktree` 성공 응답의
  optional `continuation_safety_post_memory_approval_collection_reminder` 계약을 검증하지 않아 PromptLane이
  memory approval 이후 collection을 자동 시작하는 guidance를 UI에 넘길 수 있다.
- [x] RED: `src/web/src/api.test.ts`가 malformed
  `continuation_safety_post_memory_approval_collection_reminder.not_automated` body를
  `Loop worktree drilldown failed: Invalid response.`로 reject하도록 요구하게 해 현재 unsafe
  post-memory-approval collection reminder resolve 실패를 확인한다.
- [x] GREEN: post-memory-approval collection reminder label, reminder/not_automated/reason,
  writes_files, external_calls 계약을 확인하고 깨진 guidance는 raw-free drilldown contract 오류로 중단하도록 고친다.
- [x] VERIFY: focused web API test, implementation format check, typecheck, diff whitespace
  check를 실행한다.

## 2026-07-08 PromptLane Web Loop Worktree Pre Memory Approval Freshness Advisory Contract Error

- [x] CHECK: web API `getLoopWorktree`가 `/api/v1/loops/worktrees/:worktree` 성공 응답의
  optional `continuation_safety_pre_memory_approval_freshness_advisory` 계약을 검증하지 않아 PromptLane이
  memory를 approve하거나 freshness를 verify하는 guidance를 UI에 넘길 수 있다.
- [x] RED: `src/web/src/api.test.ts`가 malformed
  `continuation_safety_pre_memory_approval_freshness_advisory.not_decision` body를
  `Loop worktree drilldown failed: Invalid response.`로 reject하도록 요구하게 해 현재 unsafe
  pre-memory-approval freshness advisory resolve 실패를 확인한다.
- [x] GREEN: pre-memory-approval freshness advisory label, advisory/not_decision/reason,
  writes_files, external_calls 계약을 확인하고 깨진 guidance는 raw-free drilldown contract 오류로 중단하도록 고친다.
- [x] VERIFY: focused web API test, implementation format check, typecheck, diff whitespace
  check를 실행한다.

## 2026-07-08 PromptLane Web Loop Worktree Pre Merge Freshness Advisory Contract Error

- [x] CHECK: web API `getLoopWorktree`가 `/api/v1/loops/worktrees/:worktree` 성공 응답의
  optional `continuation_safety_pre_merge_freshness_advisory` 계약을 검증하지 않아 PromptLane이
  merge를 approve하거나 freshness를 verify하는 guidance를 UI에 넘길 수 있다.
- [x] RED: `src/web/src/api.test.ts`가 malformed
  `continuation_safety_pre_merge_freshness_advisory.not_decision` body를
  `Loop worktree drilldown failed: Invalid response.`로 reject하도록 요구하게 해 현재 unsafe
  pre-merge freshness advisory resolve 실패를 확인한다.
- [x] GREEN: pre-merge freshness advisory label, advisory/not_decision/reason,
  writes_files, external_calls 계약을 확인하고 깨진 guidance는 raw-free drilldown contract 오류로 중단하도록 고친다.
- [x] VERIFY: focused web API test, implementation format check, typecheck, diff whitespace
  check를 실행한다.

## 2026-07-08 PromptLane Web Loop Worktree Freshness Uncertainty Collection Reminder Contract Error

- [x] CHECK: web API `getLoopWorktree`가 `/api/v1/loops/worktrees/:worktree` 성공 응답의
  optional `continuation_safety_freshness_uncertainty_collection_reminder` 계약을 검증하지 않아 freshness
  uncertainty resolution이 automatic freshness verification이나 collection start처럼 보이는 guidance를 UI에 넘길 수 있다.
- [x] RED: `src/web/src/api.test.ts`가 malformed
  `continuation_safety_freshness_uncertainty_collection_reminder.not_automated` body를
  `Loop worktree drilldown failed: Invalid response.`로 reject하도록 요구하게 해 현재 unsafe
  freshness uncertainty collection reminder resolve 실패를 확인한다.
- [x] GREEN: freshness uncertainty collection reminder label, reminder/not_automated/reason,
  writes_files, external_calls 계약을 확인하고 깨진 guidance는 raw-free drilldown contract 오류로 중단하도록 고친다.
- [x] VERIFY: focused web API test, implementation format check, typecheck, diff whitespace
  check를 실행한다.

## 2026-07-08 PromptLane Web Loop Worktree Freshness Result Non Persistence Contract Error

- [x] CHECK: web API `getLoopWorktree`가 `/api/v1/loops/worktrees/:worktree` 성공 응답의
  optional `continuation_safety_freshness_result_non_persistence_note` 계약을 검증하지 않아 freshness
  result state를 PromptLane이 detect/store/sync하는 guidance를 UI에 넘길 수 있다.
- [x] RED: `src/web/src/api.test.ts`가 malformed
  `continuation_safety_freshness_result_non_persistence_note.not_stored` body를
  `Loop worktree drilldown failed: Invalid response.`로 reject하도록 요구하게 해 현재 unsafe
  freshness result non-persistence resolve 실패를 확인한다.
- [x] GREEN: freshness result non-persistence label, result_scope/not_stored/reason, writes_files,
  external_calls 계약을 확인하고 깨진 guidance는 raw-free drilldown contract 오류로 중단하도록 고친다.
- [x] VERIFY: focused web API test, implementation format check, typecheck, diff whitespace
  check를 실행한다.

## 2026-07-08 PromptLane Web Loop Worktree Collection Evidence Freshness Boundary Contract Error

- [x] CHECK: web API `getLoopWorktree`가 `/api/v1/loops/worktrees/:worktree` 성공 응답의
  optional `continuation_safety_collection_evidence_freshness_boundary_note` 계약을 검증하지 않아
  freshness를 git status, transcripts, agent UI activity로 PromptLane이 검증하는 guidance를 UI에 넘길 수 있다.
- [x] RED: `src/web/src/api.test.ts`가 malformed
  `continuation_safety_collection_evidence_freshness_boundary_note.not_verified` body를
  `Loop worktree drilldown failed: Invalid response.`로 reject하도록 요구하게 해 현재 unsafe
  collection evidence freshness boundary resolve 실패를 확인한다.
- [x] GREEN: collection evidence freshness boundary label, freshness_check/not_verified/reason,
  writes_files, external_calls 계약을 확인하고 깨진 guidance는 raw-free drilldown contract 오류로 중단하도록 고친다.
- [x] VERIFY: focused web API test, implementation format check, typecheck, diff whitespace
  check를 실행한다.

## 2026-07-08 PromptLane Web Loop Worktree Retry Outcome Non Persistence Contract Error

- [x] CHECK: web API `getLoopWorktree`가 `/api/v1/loops/worktrees/:worktree` 성공 응답의
  optional `continuation_safety_retry_outcome_non_persistence_note` 계약을 검증하지 않아 retry
  success/failure state를 PromptLane이 detect/store/sync하는 guidance를 UI에 넘길 수 있다.
- [x] RED: `src/web/src/api.test.ts`가 malformed
  `continuation_safety_retry_outcome_non_persistence_note.not_stored` body를
  `Loop worktree drilldown failed: Invalid response.`로 reject하도록 요구하게 해 현재 unsafe
  retry outcome non-persistence resolve 실패를 확인한다.
- [x] GREEN: retry outcome non-persistence label, outcome_scope/not_stored/reason, writes_files,
  external_calls 계약을 확인하고 깨진 guidance는 raw-free drilldown contract 오류로 중단하도록 고친다.
- [x] VERIFY: focused web API test, implementation format check, typecheck, diff whitespace
  check를 실행한다.

## 2026-07-08 PromptLane Web Loop Worktree Collection Retry Boundary Contract Error

- [x] CHECK: web API `getLoopWorktree`가 `/api/v1/loops/worktrees/:worktree` 성공 응답의
  optional `continuation_safety_collection_retry_boundary_note` 계약을 검증하지 않아 collection retry가
  automatic collection command나 hidden recovery action처럼 보이는 guidance를 UI에 넘길 수 있다.
- [x] RED: `src/web/src/api.test.ts`가 malformed
  `continuation_safety_collection_retry_boundary_note.not_automated` body를
  `Loop worktree drilldown failed: Invalid response.`로 reject하도록 요구하게 해 현재 unsafe
  collection retry boundary resolve 실패를 확인한다.
- [x] GREEN: collection retry boundary label, retry/not_automated/reason, writes_files,
  external_calls 계약을 확인하고 깨진 guidance는 raw-free drilldown contract 오류로 중단하도록 고친다.
- [x] VERIFY: focused web API test, implementation format check, typecheck, diff whitespace
  check를 실행한다.

## 2026-07-08 PromptLane Web Loop Worktree Collection Result Non Persistence Contract Error

- [x] CHECK: web API `getLoopWorktree`가 `/api/v1/loops/worktrees/:worktree` 성공 응답의
  optional `continuation_safety_collection_result_non_persistence_note` 계약을 검증하지 않아
  collection result state를 agent UI activity에서 store/sync/infer하는 guidance를 UI에 넘길 수 있다.
- [x] RED: `src/web/src/api.test.ts`가 malformed
  `continuation_safety_collection_result_non_persistence_note.not_stored` body를
  `Loop worktree drilldown failed: Invalid response.`로 reject하도록 요구하게 해 현재 unsafe
  collection result non-persistence resolve 실패를 확인한다.
- [x] GREEN: collection result non-persistence label, result_scope/not_stored/reason, writes_files,
  external_calls 계약을 확인하고 깨진 guidance는 raw-free drilldown contract 오류로 중단하도록 고친다.
- [x] VERIFY: focused web API test, implementation format check, typecheck, diff whitespace
  check를 실행한다.

## 2026-07-08 PromptLane Web Loop Worktree Post Submission Collection Reminder Contract Error

- [x] CHECK: web API `getLoopWorktree`가 `/api/v1/loops/worktrees/:worktree` 성공 응답의
  optional `continuation_safety_post_submission_collection_reminder_note` 계약을 검증하지 않아
  submission, transcript changes, agent UI activity에서 background collection을 시작하는 guidance를 UI에 넘길 수 있다.
- [x] RED: `src/web/src/api.test.ts`가 malformed
  `continuation_safety_post_submission_collection_reminder_note.not_background` body를
  `Loop worktree drilldown failed: Invalid response.`로 reject하도록 요구하게 해 현재 unsafe
  post-submission collection reminder resolve 실패를 확인한다.
- [x] GREEN: post-submission collection reminder label, reminder/not_background/reason, writes_files,
  external_calls 계약을 확인하고 깨진 guidance는 raw-free drilldown contract 오류로 중단하도록 고친다.
- [x] VERIFY: focused web API test, implementation format check, typecheck, diff whitespace
  check를 실행한다.

## 2026-07-08 PromptLane Web Loop Worktree Submission Result Non Persistence Contract Error

- [x] CHECK: web API `getLoopWorktree`가 `/api/v1/loops/worktrees/:worktree` 성공 응답의
  optional `continuation_safety_submission_result_non_persistence_note` 계약을 검증하지 않아
  submitted state나 agent response를 PromptLane이 detect/store/sync하는 guidance를 UI에 넘길 수 있다.
- [x] RED: `src/web/src/api.test.ts`가 malformed
  `continuation_safety_submission_result_non_persistence_note.not_stored` body를
  `Loop worktree drilldown failed: Invalid response.`로 reject하도록 요구하게 해 현재 unsafe
  submission result non-persistence resolve 실패를 확인한다.
- [x] GREEN: submission result non-persistence label, result_scope/not_stored/reason, writes_files,
  external_calls 계약을 확인하고 깨진 guidance는 raw-free drilldown contract 오류로 중단하도록 고친다.
- [x] VERIFY: focused web API test, implementation format check, typecheck, diff whitespace
  check를 실행한다.

## 2026-07-08 PromptLane Web Loop Worktree Manual Submission Boundary Contract Error

- [x] CHECK: web API `getLoopWorktree`가 `/api/v1/loops/worktrees/:worktree` 성공 응답의
  optional `continuation_safety_manual_submission_boundary_note` 계약을 검증하지 않아 final
  submission이 PromptLane의 enter/click submit, submitted state 기록처럼 보이는 guidance를 UI에 넘길 수 있다.
- [x] RED: `src/web/src/api.test.ts`가 malformed
  `continuation_safety_manual_submission_boundary_note.not_automated` body를
  `Loop worktree drilldown failed: Invalid response.`로 reject하도록 요구하게 해 현재 unsafe
  manual submission boundary resolve 실패를 확인한다.
- [x] GREEN: manual submission boundary label, submission/not_automated/reason, writes_files,
  external_calls 계약을 확인하고 깨진 guidance는 raw-free drilldown contract 오류로 중단하도록 고친다.
- [x] VERIFY: focused web API test, implementation format check, typecheck, diff whitespace
  check를 실행한다.

## 2026-07-08 PromptLane Web Loop Worktree Paste Destination Boundary Contract Error

- [x] CHECK: web API `getLoopWorktree`가 `/api/v1/loops/worktrees/:worktree` 성공 응답의
  optional `continuation_safety_paste_destination_boundary_note` 계약을 검증하지 않아 paste
  destination 확인이 active window 검증, target content read, paste success 확인처럼 보이는 guidance를 UI에 넘길 수 있다.
- [x] RED: `src/web/src/api.test.ts`가 malformed
  `continuation_safety_paste_destination_boundary_note.not_verified` body를
  `Loop worktree drilldown failed: Invalid response.`로 reject하도록 요구하게 해 현재 unsafe
  paste destination boundary resolve 실패를 확인한다.
- [x] GREEN: paste destination boundary label, boundary/not_verified/reason, writes_files,
  external_calls 계약을 확인하고 깨진 guidance는 raw-free drilldown contract 오류로 중단하도록 고친다.
- [x] VERIFY: focused web API test, implementation format check, typecheck, diff whitespace
  check를 실행한다.

## 2026-07-08 PromptLane Web Loop Worktree Target Agent Check Contract Error

- [x] CHECK: web API `getLoopWorktree`가 `/api/v1/loops/worktrees/:worktree` 성공 응답의
  optional `continuation_safety_target_agent_check_note` 계약을 검증하지 않아 target agent
  확인이 PromptLane의 agent UI inspection이나 target content read처럼 보이는 guidance를 UI에 넘길 수 있다.
- [x] RED: `src/web/src/api.test.ts`가 malformed
  `continuation_safety_target_agent_check_note.not_inspection` body를
  `Loop worktree drilldown failed: Invalid response.`로 reject하도록 요구하게 해 현재 unsafe
  target-agent check resolve 실패를 확인한다.
- [x] GREEN: target-agent check label, check/not_inspection/reason, writes_files, external_calls
  계약을 확인하고 깨진 guidance는 raw-free drilldown contract 오류로 중단하도록 고친다.
- [x] VERIFY: focused web API test, implementation format check, typecheck, diff whitespace
  check를 실행한다.

## 2026-07-08 PromptLane Web Loop Worktree Pre Paste Confirmation Contract Error

- [x] CHECK: web API `getLoopWorktree`가 `/api/v1/loops/worktrees/:worktree` 성공 응답의
  optional `continuation_safety_pre_paste_confirmation_note` 계약을 검증하지 않아 final
  handoff confirmation이 prompt submission이나 safety approval처럼 보이는 guidance를 UI에 넘길 수 있다.
- [x] RED: `src/web/src/api.test.ts`가 malformed
  `continuation_safety_pre_paste_confirmation_note.external_calls` body를
  `Loop worktree drilldown failed: Invalid response.`로 reject하도록 요구하게 해 현재 unsafe
  pre-paste confirmation resolve 실패를 확인한다.
- [x] GREEN: pre-paste confirmation label, confirmation/not_submission/reason, writes_files,
  external_calls 계약을 확인하고 깨진 guidance는 raw-free drilldown contract 오류로 중단하도록 고친다.
- [x] VERIFY: focused web API test, implementation format check, typecheck, diff whitespace
  check를 실행한다.

## 2026-07-08 PromptLane Web Loop Worktree Copy Retry Contract Error

- [x] CHECK: web API `getLoopWorktree`가 `/api/v1/loops/worktrees/:worktree` 성공 응답의
  optional `continuation_safety_copy_retry_note` 계약을 검증하지 않아 retry가 자동 clipboard
  write나 prompt submission처럼 보이는 guidance를 UI에 넘길 수 있다.
- [x] RED: `src/web/src/api.test.ts`가 malformed
  `continuation_safety_copy_retry_note.external_calls` body를
  `Loop worktree drilldown failed: Invalid response.`로 reject하도록 요구하게 해 현재 unsafe
  copy retry resolve 실패를 확인한다.
- [x] GREEN: copy retry label, retry_scope/not_automatic/reason, writes_files, external_calls
  계약을 확인하고 깨진 guidance는 raw-free drilldown contract 오류로 중단하도록 고친다.
- [x] VERIFY: focused web API test, implementation format check, typecheck, diff whitespace
  check를 실행한다.

## 2026-07-08 PromptLane Web Loop Worktree Copy Feedback Failure Contract Error

- [x] CHECK: web API `getLoopWorktree`가 `/api/v1/loops/worktrees/:worktree` 성공 응답의
  optional `continuation_safety_copy_feedback_failure_note` 계약을 검증하지 않아 clipboard 실패를
  hidden recovery, prompt submission, review state 저장처럼 보이는 guidance를 UI에 넘길 수 있다.
- [x] RED: `src/web/src/api.test.ts`가 malformed
  `continuation_safety_copy_feedback_failure_note.external_calls` body를
  `Loop worktree drilldown failed: Invalid response.`로 reject하도록 요구하게 해 현재 unsafe
  copy feedback failure resolve 실패를 확인한다.
- [x] GREEN: copy feedback failure label, failure_scope/not_state/reason, writes_files,
  external_calls 계약을 확인하고 깨진 guidance는 raw-free drilldown contract 오류로 중단하도록
  고친다.
- [x] VERIFY: focused web API test, implementation format check, typecheck, diff whitespace
  check를 실행한다.

## 2026-07-08 PromptLane Web Loop Worktree Copy Feedback Timeout Contract Error

- [x] CHECK: web API `getLoopWorktree`가 `/api/v1/loops/worktrees/:worktree` 성공 응답의
  optional `continuation_safety_copy_feedback_timeout_note` 계약을 검증하지 않아 copied feedback
  timeout이 review completion/submission state처럼 보이는 guidance를 UI에 넘길 수 있다.
- [x] RED: `src/web/src/api.test.ts`가 malformed
  `continuation_safety_copy_feedback_timeout_note.external_calls` body를
  `Loop worktree drilldown failed: Invalid response.`로 reject하도록 요구하게 해 현재 unsafe
  copy feedback timeout resolve 실패를 확인한다.
- [x] GREEN: copy feedback timeout label, timeout_scope/not_state/reason, writes_files,
  external_calls 계약을 확인하고 깨진 guidance는 raw-free drilldown contract 오류로 중단하도록
  고친다.
- [x] VERIFY: focused web API test, implementation format check, typecheck, diff whitespace
  check를 실행한다.

## 2026-07-08 PromptLane Web Loop Worktree Copy Feedback Accessibility Contract Error

- [x] CHECK: web API `getLoopWorktree`가 `/api/v1/loops/worktrees/:worktree` 성공 응답의
  optional `continuation_safety_copy_feedback_accessibility_note` 계약을 검증하지 않아 copied
  status가 visible command를 대체하거나 safety approval처럼 보이는 guidance를 UI에 넘길 수 있다.
- [x] RED: `src/web/src/api.test.ts`가 malformed
  `continuation_safety_copy_feedback_accessibility_note.external_calls` body를
  `Loop worktree drilldown failed: Invalid response.`로 reject하도록 요구하게 해 현재 unsafe
  copy feedback accessibility resolve 실패를 확인한다.
- [x] GREEN: copy feedback accessibility label, visible/assistive feedback, reason,
  writes_files, external_calls 계약을 확인하고 깨진 guidance는 raw-free drilldown contract 오류로
  중단하도록 고친다.
- [x] VERIFY: focused web API test, implementation format check, typecheck, diff whitespace
  check를 실행한다.

## 2026-07-08 PromptLane Web Loop Worktree Copy Feedback Reminder Contract Error

- [x] CHECK: web API `getLoopWorktree`가 `/api/v1/loops/worktrees/:worktree` 성공 응답의
  optional `continuation_safety_copy_feedback_reminder` 계약을 검증하지 않아 copied feedback을
  safety approval이나 agent submission처럼 오해시키는 guidance를 UI에 넘길 수 있다.
- [x] RED: `src/web/src/api.test.ts`가 malformed
  `continuation_safety_copy_feedback_reminder.external_calls` body를
  `Loop worktree drilldown failed: Invalid response.`로 reject하도록 요구하게 해 현재 unsafe
  copy feedback reminder resolve 실패를 확인한다.
- [x] GREEN: copy feedback reminder label, feedback_scope/next_step/reason, writes_files,
  external_calls 계약을 확인하고 깨진 guidance는 raw-free drilldown contract 오류로 중단하도록
  고친다.
- [x] VERIFY: focused web API test, implementation format check, typecheck, diff whitespace
  check를 실행한다.

## 2026-07-08 PromptLane Web Loop Worktree Safety Recheck Cue Contract Error

- [x] CHECK: web API `getLoopWorktree`가 `/api/v1/loops/worktrees/:worktree` 성공 응답의
  optional `continuation_safety_recheck_cue` 계약을 검증하지 않아 copy 이후 재검토 guidance가
  깨진 drilldown state를 UI에 넘길 수 있다.
- [x] RED: `src/web/src/api.test.ts`가 malformed
  `continuation_safety_recheck_cue.external_calls` body를
  `Loop worktree drilldown failed: Invalid response.`로 reject하도록 요구하게 해 현재 unsafe
  re-check cue resolve 실패를 확인한다.
- [x] GREEN: re-check cue label, trigger/instruction/reason, writes_files, external_calls 계약을
  확인하고 깨진 guidance는 raw-free drilldown contract 오류로 중단하도록 고친다.
- [x] VERIFY: focused web API test, implementation format check, typecheck, diff whitespace
  check를 실행한다.

## 2026-07-08 PromptLane Web Loop Worktree Safety Non Persistence Contract Error

- [x] CHECK: web API `getLoopWorktree`가 `/api/v1/loops/worktrees/:worktree` 성공 응답의
  optional `continuation_safety_non_persistence_note` 계약을 검증하지 않아 safety review state
  저장/동기화 boundary가 깨진 drilldown state를 UI에 넘길 수 있다.
- [x] RED: `src/web/src/api.test.ts`가 malformed
  `continuation_safety_non_persistence_note.stores_state` body를
  `Loop worktree drilldown failed: Invalid response.`로 reject하도록 요구하게 해 현재 unsafe
  non-persistence guidance resolve 실패를 확인한다.
- [x] GREEN: non-persistence note label, state/reminder/reason, stores_state, external_calls
  계약을 확인하고 깨진 guidance는 raw-free drilldown contract 오류로 중단하도록 고친다.
- [x] VERIFY: focused web API test, implementation format check, typecheck, diff whitespace
  check를 실행한다.

## 2026-07-08 PromptLane Web Loop Worktree Continuation Safety Ordering Contract Error

- [x] CHECK: web API `getLoopWorktree`가 `/api/v1/loops/worktrees/:worktree` 성공 응답의
  optional `continuation_safety_ordering_note` 계약을 검증하지 않아 copy/paste 전 review
  ordering guidance가 깨진 drilldown state를 UI에 넘길 수 있다.
- [x] RED: `src/web/src/api.test.ts`가 malformed
  `continuation_safety_ordering_note.external_calls` body를
  `Loop worktree drilldown failed: Invalid response.`로 reject하도록 요구하게 해 현재 unsafe
  ordering guidance resolve 실패를 확인한다.
- [x] GREEN: safety ordering note label, first/then/reason, writes_files, external_calls 계약을
  확인하고 깨진 guidance는 raw-free drilldown contract 오류로 중단하도록 고친다.
- [x] VERIFY: focused web API test, implementation format check, typecheck, diff whitespace
  check를 실행한다.

## 2026-07-08 PromptLane Web Loop Worktree Continuation Safety Group Contract Error

- [x] CHECK: web API `getLoopWorktree`가 `/api/v1/loops/worktrees/:worktree` 성공 응답의
  optional `continuation_safety_group` 계약을 검증하지 않아 read-only handoff boundary나
  no-external-call guidance가 깨진 drilldown state를 UI에 넘길 수 있다.
- [x] RED: `src/web/src/api.test.ts`가 malformed `continuation_safety_group.external_calls`
  body를 `Loop worktree drilldown failed: Invalid response.`로 reject하도록 요구하게 해 현재
  unsafe continuation safety guidance resolve 실패를 확인한다.
- [x] GREEN: continuation safety group label, scope/includes/reason, writes_files,
  external_calls 계약을 확인하고 깨진 guidance는 raw-free drilldown contract 오류로 중단하도록
  고친다.
- [x] VERIFY: focused web API test, implementation format check, typecheck, diff whitespace
  check를 실행한다.

## 2026-07-08 PromptLane Web Loop Worktree Snapshot Age Contract Error

- [x] CHECK: web API `getLoopWorktree`가 `/api/v1/loops/worktrees/:worktree` 성공 응답의
  optional `snapshot_age` 계약을 검증하지 않아 stale/latest 판단이나 refresh guidance가 깨진
  drilldown state를 UI에 넘길 수 있다.
- [x] RED: `src/web/src/api.test.ts`가 malformed `snapshot_age.next_action` body를
  `Loop worktree drilldown failed: Invalid response.`로 reject하도록 요구하게 해 현재
  incomplete snapshot age resolve 실패를 확인한다.
- [x] GREEN: snapshot age label, timestamp string, status/reason/next_action 계약을 확인하고
  깨진 age guidance는 raw-free drilldown contract 오류로 중단하도록 고친다.
- [x] VERIFY: focused web API test, implementation format check, typecheck, diff whitespace
  check를 실행한다.

## 2026-07-08 PromptLane Web Loop Worktree Copy Side Effects Contract Error

- [x] CHECK: web API `getLoopWorktree`가 `/api/v1/loops/worktrees/:worktree` 성공 응답의
  optional `copy_side_effects` 안전 계약을 검증하지 않아 clipboard-only/no-write/no-external-call
  guidance가 깨진 drilldown UI state를 넘길 수 있다.
- [x] RED: `src/web/src/api.test.ts`가 malformed `copy_side_effects.external_calls` body를
  `Loop worktree drilldown failed: Invalid response.`로 reject하도록 요구하게 해 현재 unsafe
  copy side-effect guidance resolve 실패를 확인한다.
- [x] GREEN: copy side effects label, clipboard/ui feedback/does_not text, writes_files,
  external_calls 계약을 확인하고 깨진 guidance는 raw-free drilldown contract 오류로 중단하도록
  고친다.
- [x] VERIFY: focused web API test, implementation format check, typecheck, diff whitespace
  check를 실행한다.

## 2026-07-08 PromptLane Web Loop Worktree Command Filters Contract Error

- [x] CHECK: web API `getLoopWorktree`가 `/api/v1/loops/worktrees/:worktree` 성공 응답의
  optional `command_filters` 안전 계약을 검증하지 않아 selected/review command scope나
  side-effect flag가 깨진 drilldown guidance를 UI에 넘길 수 있다.
- [x] RED: `src/web/src/api.test.ts`가 malformed `command_filters.review_command_filters` body를
  `Loop worktree drilldown failed: Invalid response.`로 reject하도록 요구하게 해 현재
  incomplete command filters resolve 실패를 확인한다.
- [x] GREEN: command filters label, selected/review filter tuple, reason, writes_files,
  external_calls 계약을 확인하고 깨진 guidance는 raw-free drilldown contract 오류로 중단하도록
  고친다.
- [x] VERIFY: focused web API test, implementation format check, typecheck, diff whitespace
  check를 실행한다.

## 2026-07-08 PromptLane Web Loop Worktree Command Distinction Contract Error

- [x] CHECK: web API `getLoopWorktree`가 `/api/v1/loops/worktrees/:worktree` 성공 응답의
  optional `command_distinction` 안전 계약을 검증하지 않아 selected/review command role이나
  side-effect flag가 깨진 drilldown guidance를 UI에 넘길 수 있다.
- [x] RED: `src/web/src/api.test.ts`가 malformed `command_distinction.external_calls` body를
  `Loop worktree drilldown failed: Invalid response.`로 reject하도록 요구하게 해 현재 unsafe
  command distinction resolve 실패를 확인한다.
- [x] GREEN: command distinction label, selected/review role, reason, writes_files,
  external_calls 계약을 확인하고 깨진 guidance는 raw-free drilldown contract 오류로 중단하도록
  고친다.
- [x] VERIFY: focused web API test, implementation format check, typecheck, diff whitespace
  check를 실행한다.

## 2026-07-08 PromptLane Web Loop Worktree Selected Action Contract Error

- [x] CHECK: web API `getLoopWorktree`가 `/api/v1/loops/worktrees/:worktree` 성공 응답의
  optional `selected_brief_action` 안전 계약을 검증하지 않아 writes_files/external_calls가
  깨진 continuation action을 selected worktree drilldown UI에 넘길 수 있다.
- [x] RED: `src/web/src/api.test.ts`가 malformed `selected_brief_action.writes_files` body를
  `Loop worktree drilldown failed: Invalid response.`로 reject하도록 요구하게 해 현재 unsafe
  selected action resolve 실패를 확인한다.
- [x] GREEN: selected brief action label/action/reason/command/writes_files/external_calls 계약을
  확인하고 깨진 action은 raw-free drilldown contract 오류로 중단하도록 고친다.
- [x] VERIFY: focused web API test, implementation format check, typecheck, diff whitespace
  check를 실행한다.

## 2026-07-08 PromptLane Web Loop Worktree Selection Scope Contract Error

- [x] CHECK: web API `getLoopWorktree`가 `/api/v1/loops/worktrees/:worktree` 성공 응답의
  `selection_scope`를 객체 여부만 검증해 malformed filter/reason/action을 selected
  worktree drilldown UI에 넘길 수 있다.
- [x] RED: `src/web/src/api.test.ts`가 malformed worktree `selection_scope.filters` body를
  `Loop worktree drilldown failed: Invalid response.`로 reject하도록 요구하게 해 현재
  incomplete selection scope resolve 실패를 확인한다.
- [x] GREEN: selection scope label, allowed filter tuple, reason, next action 계약을 확인하고
  깨진 scope는 raw-free drilldown contract 오류로 중단하도록 고친다.
- [x] VERIFY: focused web API test, implementation format check, typecheck, diff whitespace
  check를 실행한다.

## 2026-07-08 PromptLane Web Loop Worktree Privacy Contract Error

- [x] CHECK: web API `getLoopWorktree`가 `/api/v1/loops/worktrees/:worktree` 성공 응답의
  top-level `privacy` raw-free contract를 검증하지 않아 malformed privacy flags를 selected
  worktree drilldown UI에 넘길 수 있다.
- [x] RED: `src/web/src/api.test.ts`가 malformed worktree `privacy` body를
  `Loop worktree drilldown failed: Invalid response.`로 reject하도록 요구하게 해 현재 unsafe
  privacy flag resolve 실패를 확인한다.
- [x] GREEN: worktree drilldown privacy가 local-only, no prompt bodies, no raw paths, no
  compact content 계약을 만족하는지 확인하고 깨진 privacy block은 raw-free drilldown contract
  오류로 중단하도록 고친다.
- [x] VERIFY: focused web API test, implementation format check, typecheck, diff whitespace
  check를 실행한다.

## 2026-07-08 PromptLane Web Selected Loop Brief Boundary Contract Error

- [x] CHECK: web API `getSelectedLoopBrief`가 `/api/v1/loops/brief` 성공 응답의 optional
  `compact_boundary` contract를 검증하지 않아 malformed compaction boundary를 continuation
  brief UI에 넘길 수 있다.
- [x] RED: `src/web/src/api.test.ts`가 malformed selected loop brief compact boundary body를
  `Selected loop brief failed: Invalid response.`로 reject하도록 요구하게 해 현재 incomplete
  boundary resolve 실패를 확인한다.
- [x] GREEN: selected loop brief compact boundary가 존재할 때 `LoopSummary` compact boundary
  계약을 만족하는지 확인하고 깨진 boundary는 raw-free selected brief contract 오류로 중단하도록
  고친다.
- [x] VERIFY: focused web API test, implementation format check, typecheck, diff whitespace
  check를 실행한다.

## 2026-07-08 PromptLane Web Loop Instruction Patch Contract Error

- [x] CHECK: web API `getLoopInstructionPatch`가 `/api/v1/loops/instruction-patch` 성공
  응답의 apply gate와 instruction patch metadata 일부를 검증하지 않아 malformed source
  memory, next action, apply reason을 review UI에 넘길 수 있다.
- [x] RED: `src/web/src/api.test.ts`가 malformed instruction patch apply gate body를
  `Loop instruction patch proposal failed: Invalid response.`로 reject하도록 요구하게 해 현재
  incomplete apply-gate resolve 실패를 확인한다.
- [x] GREEN: title, source_memory_id, next_action, apply_gate.reason 계약을 확인하고 깨진
  proposal은 raw-free instruction patch contract 오류로 중단하도록 고친다.
- [x] VERIFY: focused web API test, implementation format check, typecheck, diff whitespace
  check를 실행한다.

## 2026-07-08 PromptLane Web Loop Memory Approval Contract Error

- [x] CHECK: web API `approveLoopMemory`가 `/api/v1/loops/memory/approve` 성공 응답의
  durable memory metadata와 next action contract를 일부만 검증해 malformed memory title,
  approver, evidence ref, next action을 loop memory UI에 넘길 수 있다.
- [x] RED: `src/web/src/api.test.ts`가 malformed memory approval metadata body를
  `Loop memory approval failed: Invalid response.`로 reject하도록 요구하게 해 현재 incomplete
  approval resolve 실패를 확인한다.
- [x] GREEN: memory title, approved_by, created_at, string evidence refs, next_action,
  string-array next_actions 계약을 확인하고 깨진 block은 raw-free approval contract 오류로
  중단하도록 고친다.
- [x] VERIFY: focused web API test, implementation format check, typecheck, diff whitespace
  check를 실행한다.

## 2026-07-08 PromptLane Web Loop Worktree Items Contract Error

- [x] CHECK: web API `getLoopWorktree`가 `/api/v1/loops/worktrees/:worktree` 성공
  응답의 `items` 배열 내부 loop snapshot summary 계약을 검증하지 않아 malformed selected
  worktree snapshot을 drilldown UI에 넘길 수 있다.
- [x] RED: `src/web/src/api.test.ts`가 malformed worktree `items` body를
  `Loop worktree drilldown failed: Invalid response.`로 reject하도록 요구하게 해 현재
  incomplete item resolve 실패를 확인한다.
- [x] GREEN: worktree drilldown `items`가 `LoopSummary` 계약을 만족하는지 확인하고 깨진
  item은 raw-free worktree drilldown contract 오류로 중단하도록 고친다.
- [x] VERIFY: focused web API test, implementation format check, typecheck, diff whitespace
  check를 실행한다.

## 2026-07-08 PromptLane Web Loop Status Core Contract Error

- [x] CHECK: web API `listLoops`가 `/api/v1/loops` 성공 응답의 core
  `status.status`, `snapshot_count`, `next_action`, `next_actions` contract를 검증하지 않아
  malformed loop status state를 web UI에 넘길 수 있다.
- [x] RED: `src/web/src/api.test.ts`가 `snapshot_count: "1"` body를
  `Loop list failed: Invalid response.`로 reject하도록 요구하게 해 현재 malformed core
  status resolve 실패를 확인한다.
- [x] GREEN: loop status core fields가 ready/empty status, numeric snapshot count, string
  next action, string-array next actions 계약을 만족하는지 확인하고 깨진 block은 raw-free
  loop list contract 오류로 중단하도록 고친다.
- [x] VERIFY: focused web API test, implementation format check, typecheck, diff whitespace
  check를 실행한다.

## 2026-07-08 PromptLane Web Loop Memory Candidate Contract Error

- [x] CHECK: web API `listLoops`가 `/api/v1/loops` 성공 응답의 optional
  `status.memory_candidate` contract를 검증하지 않아 malformed approval eligibility/action을
  loop memory review UI에 넘길 수 있다.
- [x] RED: `src/web/src/api.test.ts`가 `memory_candidate.eligible: "yes"` body를
  `Loop list failed: Invalid response.`로 reject하도록 요구하게 해 현재 malformed memory
  candidate resolve 실패를 확인한다.
- [x] GREEN: memory candidate가 존재할 때 eligible boolean, allowed reason, allowed next
  action 계약을 확인하고 깨진 block은 raw-free loop list contract 오류로 중단하도록 고친다.
- [x] VERIFY: focused web API test, implementation format check, typecheck, diff whitespace
  check를 실행한다.

## 2026-07-08 PromptLane Web Loop Project Memory Contract Error

- [x] CHECK: web API `listLoops`가 `/api/v1/loops` 성공 응답의
  `status.project_memory` contract를 검증하지 않아 malformed approved memory state를 loop
  memory review UI에 넘길 수 있다.
- [x] RED: `src/web/src/api.test.ts`가 `project_memory.approved_count: "0"` body를
  `Loop list failed: Invalid response.`로 reject하도록 요구하게 해 현재 malformed project
  memory resolve 실패를 확인한다.
- [x] GREEN: loop status project memory의 approved count와 brief inclusion flag 계약을
  확인하고 깨진 block은 raw-free loop list contract 오류로 중단하도록 고친다.
- [x] VERIFY: focused web API test, implementation format check, typecheck, diff whitespace
  check를 실행한다.

## 2026-07-08 PromptLane Web Loop Activity Worktree Contract Error

- [x] CHECK: web API `listLoops`가 `/api/v1/loops` 성공 응답의
  `status.activity.worktrees` item contract를 검증하지 않아 malformed worktree/session
  counters를 loop status UI에 넘길 수 있다.
- [x] RED: `src/web/src/api.test.ts`가 `activity.worktrees` 내부 `sessions: "1"` body를
  `Loop list failed: Invalid response.`로 reject하도록 요구하게 해 현재 malformed worktree
  item resolve 실패를 확인한다.
- [x] GREEN: activity worktree item의 worktree id, optional branch, sessions/snapshots,
  latest snapshot metadata, evidence count 계약을 확인하고 깨진 item은 raw-free loop list
  contract 오류로 중단하도록 고친다.
- [x] VERIFY: focused web API test, implementation format check, typecheck, diff whitespace
  check를 실행한다.

## 2026-07-08 PromptLane Web Loop Status Activity Contract Error

- [x] CHECK: web API `listLoops`가 `/api/v1/loops` 성공 응답의
  `status.activity` core contract를 검증하지 않아 malformed activity counters/flags를
  loop status UI에 넘길 수 있다.
- [x] RED: `src/web/src/api.test.ts`가 `active_worktrees: "1"`인
  `status.activity` body를 `Loop list failed: Invalid response.`로 reject하도록 요구하게 해
  현재 malformed activity resolve 실패를 확인한다.
- [x] GREEN: loop status activity의 active worktrees/sessions, review flag, next action,
  worktree list shape를 확인하고 깨진 activity block은 raw-free loop list contract 오류로
  중단하도록 고친다.
- [x] VERIFY: focused web API test, implementation format check, typecheck, diff whitespace
  check를 실행한다.

## 2026-07-08 PromptLane Web Loop List Privacy Contract Error

- [x] CHECK: web API `listLoops`가 `/api/v1/loops` 성공 응답의 top-level
  `privacy` raw-free contract를 검증하지 않아 malformed privacy flags를 loop list UI에
  넘길 수 있다.
- [x] RED: `src/web/src/api.test.ts`가 top-level `privacy.returns_prompt_bodies: true`
  body를 `Loop list failed: Invalid response.`로 reject하도록 요구하게 해 현재 unsafe
  privacy flag resolve 실패를 확인한다.
- [x] GREEN: loop list top-level privacy가 local-only, no prompt bodies, no raw paths, no
  compact content 계약을 만족하는지 확인하고 깨진 privacy block은 raw-free loop list
  contract 오류로 중단하도록 고친다.
- [x] VERIFY: focused web API test, implementation format check, typecheck, diff whitespace
  check를 실행한다.

## 2026-07-08 PromptLane Web Loop Status Privacy Contract Error

- [x] CHECK: web API `listLoops`가 `/api/v1/loops` 성공 응답의 `status.privacy`
  raw-free contract를 검증하지 않아 malformed privacy flags를 agent-loop status UI에 넘길
  수 있다.
- [x] RED: `src/web/src/api.test.ts`가 `returns_raw_paths: true`인
  `status.privacy` body를 `Loop list failed: Invalid response.`로 reject하도록 요구하게 해
  현재 unsafe privacy flag resolve 실패를 확인한다.
- [x] GREEN: loop status privacy가 local-only, no external calls, no prompt bodies, no raw
  paths, no compact content 계약을 만족하는지 확인하고 깨진 privacy block은 raw-free loop
  list contract 오류로 중단하도록 고친다.
- [x] VERIFY: focused web API test, implementation format check, typecheck, diff whitespace
  check를 실행한다.

## 2026-07-08 PromptLane Web Loop Status Compact Boundary Contract Error

- [x] CHECK: web API `listLoops`가 `/api/v1/loops` 성공 응답의
  `status.latest_compact_boundary` 계약을 검증하지 않아 malformed compact boundary를
  agent-loop status UI에 넘길 수 있다.
- [x] RED: `src/web/src/api.test.ts`가 malformed `status.latest_compact_boundary` body를
  `Loop list failed: Invalid response.`로 reject하도록 요구하게 해 현재 `{}` boundary
  resolve 실패를 확인한다.
- [x] GREEN: loop status의 optional latest compact boundary가 있으면 compact boundary
  계약을 만족하도록 확인하고 깨진 boundary는 raw-free loop list contract 오류로 중단하도록
  고친다.
- [x] VERIFY: focused web API test, implementation format check, typecheck, diff whitespace
  check를 실행한다.

## 2026-07-08 PromptLane Web Loop Status Snapshot Contract Error

- [x] CHECK: web API `listLoops`가 `/api/v1/loops` 성공 응답의
  `status.latest_snapshot` 계약을 검증하지 않아 malformed latest snapshot을
  agent-loop status UI에 넘길 수 있다.
- [x] RED: `src/web/src/api.test.ts`가 malformed `status.latest_snapshot` body를
  `Loop list failed: Invalid response.`로 reject하도록 요구하게 해 현재 `{}` snapshot
  resolve 실패를 확인한다.
- [x] GREEN: loop status의 optional latest snapshot이 있으면 `LoopSummary` 계약을
  만족하도록 확인하고 깨진 snapshot은 raw-free loop list contract 오류로 중단하도록 고친다.
- [x] VERIFY: focused web API test, implementation format check, typecheck, diff whitespace
  check를 실행한다.

## 2026-07-08 PromptLane Web Loop List Item Contract Error

- [x] CHECK: web API `listLoops`가 `/api/v1/loops` 성공 응답의 `items` 배열 내부
  loop summary 계약을 검증하지 않아 malformed item을 agent-loop continuity UI에 넘길 수
  있다.
- [x] RED: `src/web/src/api.test.ts`가 malformed loop list item body를
  `Loop list failed: Invalid response.`로 reject하도록 요구하게 해 현재 `[{}]` resolve 실패를
  확인한다.
- [x] GREEN: loop list item의 summary 필수 필드와 compact boundary 계약을 확인하고 깨진
  item은 raw-free loop list contract 오류로 중단하도록 고친다.
- [x] VERIFY: focused web API test, implementation format check, typecheck, diff whitespace
  check를 실행한다.

## 2026-07-08 PromptLane Web Project List Item Contract Error

- [x] CHECK: web API `listProjects`가 `/api/v1/projects` 성공 응답의 `items` 배열 내부
  project summary 계약을 검증하지 않아 malformed item을 project settings/policy UI에 넘길 수
  있다.
- [x] RED: `src/web/src/api.test.ts`가 malformed project list item body를
  `Project list failed: Invalid response.`로 reject하도록 요구하게 해 현재 `[{}]` resolve 실패를
  확인한다.
- [x] GREEN: project list item의 project summary/policy 필드 계약을 확인하고 깨진 item은
  raw-free project list contract 오류로 중단하도록 고친다.
- [x] VERIFY: focused web API test, implementation format check, typecheck, diff whitespace
  check를 실행한다.

## 2026-07-08 PromptLane Web Ask Summary Contract Error

- [x] CHECK: web API `getAskEventSummary`가 `/api/v1/ask-events/summary` 성공 응답의
  ask/coach telemetry 계약을 검증하지 않아 malformed 응답을 `{}` 상태로 UI에 넘길 수 있다.
- [x] RED: `src/web/src/api.test.ts`가 malformed ask event summary body를
  `Ask event summary unavailable: Invalid response.`로 reject하도록 요구하게 해 현재 `{}`
  resolve 실패를 확인한다.
- [x] GREEN: ask event summary 응답의 count, axis count, average score, optional timestamp
  계약을 확인하고 깨진 성공 응답은 raw-free ask telemetry contract 오류로 중단하도록 고친다.
- [x] VERIFY: focused web API test, implementation format check, typecheck, diff whitespace
  check를 실행한다.

## 2026-07-08 PromptLane Web Export Payload Contract Error

- [x] CHECK: web API `executeExportJob`가 `/api/v1/exports` 성공 응답의 anonymized export
  payload 계약을 검증하지 않아 malformed 응답을 `{}` 상태로 export UI에 넘길 수 있다.
- [x] RED: `src/web/src/api.test.ts`가 malformed export execution body를
  `Export job execution failed: Invalid response.`로 reject하도록 요구하게 해 현재 `{}` resolve
  실패를 확인한다.
- [x] GREEN: export payload 응답의 job id, preset, redaction/generated metadata, count,
  items 배열 계약을 확인하고 깨진 성공 응답은 raw-free export payload contract 오류로
  중단하도록 고친다.
- [x] VERIFY: focused web API test, implementation format check, typecheck, diff whitespace
  check를 실행한다.

## 2026-07-08 PromptLane Web Similar Prompts Contract Error

- [x] CHECK: web API `getSimilarPrompts`가 `/api/v1/prompts/:id/similar` 성공 응답의
  prompt summary 배열 계약을 검증하지 않아 malformed 응답을 `{}` 상태로 reuse candidates
  UI에 넘길 수 있다.
- [x] RED: `src/web/src/api.test.ts`가 malformed similar prompts body를
  `Similar prompts unavailable: Invalid response.`로 reject하도록 요구하게 해 현재 `{}`
  resolve 실패를 확인한다.
- [x] GREEN: similar prompts 응답이 prompt summary 배열인지 확인하고 깨진 성공 응답은
  raw-free similar prompts contract 오류로 중단하도록 고친다.
- [x] VERIFY: focused web API test, implementation format check, typecheck, diff whitespace
  check를 실행한다.

## 2026-07-08 PromptLane Web Draft Copy Event Contract Error

- [x] CHECK: web API `markPromptImprovementDraftCopied`가
  `/api/v1/prompts/:id/improvements/:draftId/copy` 성공 응답의 saved draft copy 계약을
  검증하지 않아 malformed 응답을 `{}` 상태로 detail coach UI에 넘길 수 있다.
- [x] RED: `src/web/src/api.test.ts`가 malformed draft copy event body를
  `Improvement draft copy event failed: Invalid response.`로 reject하도록 요구하게 해 현재
  `{}` resolve 실패를 확인한다.
- [x] GREEN: draft copy 응답의 `id`, `prompt_id`, `copied_at` 계약을 확인하고 깨진 성공
  응답은 raw-free draft copy contract 오류로 중단하도록 고친다.
- [x] VERIFY: focused web API test, implementation format check, typecheck, diff whitespace
  check를 실행한다.

## 2026-07-08 PromptLane Web Bookmark Contract Error

- [x] CHECK: web API `setPromptBookmark`가 `/api/v1/prompts/:id/bookmark` 성공 응답의
  prompt usefulness/reuse 계약을 검증하지 않아 malformed 응답을 `undefined` 또는 `{}` 상태로
  archive/detail UI에 넘길 수 있다.
- [x] RED: `src/web/src/api.test.ts`가 malformed bookmark body를
  `Bookmark failed: Invalid response.`로 reject하도록 요구하게 해 현재 깨진 성공 응답이
  reject되지 않는 실패를 확인한다.
- [x] GREEN: bookmark 응답의 usefulness copied/bookmark 필드 계약을 확인하고 깨진 성공
  응답은 raw-free bookmark contract 오류로 중단하도록 고친다.
- [x] VERIFY: focused web API test, implementation format check, typecheck, diff whitespace
  check를 실행한다.

## 2026-07-08 PromptLane Web Prompt Copy Event Contract Error

- [x] CHECK: web API `recordPromptCopied`가 `/api/v1/prompts/:id/events` 성공 응답의
  prompt usefulness/reuse 계약을 검증하지 않아 malformed 응답을 `undefined` 또는 `{}` 상태로
  archive/detail UI에 넘길 수 있다.
- [x] RED: `src/web/src/api.test.ts`가 malformed prompt copy event body를
  `Prompt event failed: Invalid response.`로 reject하도록 요구하게 해 현재 깨진 성공 응답이
  reject되지 않는 실패를 확인한다.
- [x] GREEN: prompt usefulness 응답의 copied/bookmark 필드 계약을 확인하고 깨진 성공
  응답은 raw-free prompt event contract 오류로 중단하도록 고친다.
- [x] VERIFY: focused web API test, implementation format check, typecheck, diff whitespace
  check를 실행한다.

## 2026-07-08 PromptLane Web Improvement Draft Contract Error

- [x] CHECK: web API `savePromptImprovementDraft`가
  `/api/v1/prompts/:id/improvements` 성공 응답의 first coach draft 계약을 검증하지 않아
  malformed 응답을 `{}` 상태로 draft UI에 넘길 수 있다.
- [x] RED: `src/web/src/api.test.ts`가 malformed improvement draft save body를
  `Improvement draft save failed: Invalid response.`로 reject하도록 요구하게 해 현재 `{}`
  resolve 실패를 확인한다.
- [x] GREEN: improvement draft 응답의 id, prompt id, draft text, analyzer,
  changed sections, safety notes, redaction/local draft fields 계약을 확인하고 깨진 성공
  응답은 raw-free draft contract 오류로 중단하도록 고친다.
- [x] VERIFY: focused web API test, implementation format check, typecheck, diff whitespace
  check를 실행한다.

## 2026-07-08 PromptLane Web Prompt Detail Contract Error

- [x] CHECK: web API `getPrompt`가 `/api/v1/prompts/:id` 성공 응답의 prompt detail
  계약을 검증하지 않아 malformed 응답을 `{}` 상태로 archive/detail UI에 넘길 수 있다.
- [x] RED: `src/web/src/api.test.ts`가 malformed prompt detail body를
  `Prompt not found: Invalid response.`로 reject하도록 요구하게 해 현재 `{}` resolve 실패를
  확인한다.
- [x] GREEN: prompt detail 응답의 summary, markdown, usefulness, drafts/analysis 계약을
  확인하고 깨진 성공 응답은 raw-free prompt detail contract 오류로 중단하도록 고친다.
- [x] VERIFY: focused web API test, implementation format check, typecheck, diff whitespace
  check를 실행한다.

## 2026-07-08 PromptLane Web Export Preview Contract Error

- [x] CHECK: web API `createExportPreview`가 `/api/v1/exports/preview` 성공 응답의
  raw-free export job 계약을 검증하지 않아 malformed 응답을 `{}` 상태로 export UI에 넘길 수
  있다.
- [x] RED: `src/web/src/api.test.ts`가 malformed export preview body를
  `Export preview failed: Invalid response.`로 reject하도록 요구하게 해 현재 `{}` resolve
  실패를 확인했다.
- [x] GREEN: export job 응답의 `id`, `preset`, `status`, hash/count/redaction fields
  계약을 확인하고 깨진 성공 응답은 raw-free export preview contract 오류로 중단하도록
  고쳤다.
- [x] VERIFY: focused web API test, implementation format check, typecheck, diff whitespace
  check를 실행한다.

## 2026-07-08 PromptLane Web Import Dry-Run Contract Error

- [x] CHECK: web API `previewImportDryRun`가 `/api/v1/import/dry-run` 성공 응답의
  raw-free import summary 계약을 검증하지 않아 malformed 응답을 `{}` 상태로 import UI에
  넘길 수 있다.
- [x] RED: `src/web/src/api.test.ts`가 malformed import dry-run body를
  `Import dry-run failed: Invalid response.`로 reject하도록 요구하게 해 현재 `{}` resolve
  실패를 확인했다.
- [x] GREEN: import dry-run 응답의 `dry_run`, `source_type`, count fields,
  `skipped_records`, `samples` 계약을 확인하고 깨진 성공 응답은 raw-free import dry-run
  contract 오류로 중단하도록 고쳤다.
- [x] VERIFY: focused web API test, implementation format check, typecheck, diff whitespace
  check를 실행한다.

## 2026-07-08 PromptLane Web Coach Feedback Entry Contract Error

- [x] CHECK: web API `sendCoachFeedback`가 `/api/v1/prompts/:id/coach-feedback` 성공
  응답의 feedback entry 계약을 검증하지 않아 malformed 응답을 `{}` 상태로 first coach
  feedback UI에 넘길 수 있다.
- [x] RED: `src/web/src/api.test.ts`가 malformed coach feedback body를
  `Coach feedback failed: Invalid response.`로 reject하도록 요구하게 해 현재 `{}` resolve
  실패를 확인했다.
- [x] GREEN: feedback entry 응답의 `id`, `prompt_id`, `rating`, `created_at` 계약을
  확인하고 깨진 성공 응답은 raw-free coach feedback contract 오류로 중단하도록 고쳤다.
- [x] VERIFY: focused web API test, implementation format check, typecheck, diff whitespace
  check를 실행한다.

## 2026-07-08 PromptLane Web Project Instruction Review Contract Error

- [x] CHECK: web API `analyzeProjectInstructions`가
  `/api/v1/projects/:id/instructions/analyze` 성공 응답의 instruction review/privacy 계약을
  검증하지 않아 malformed 응답을 `{}` 상태로 instruction review UI에 넘길 수 있다.
- [x] RED: `src/web/src/api.test.ts`가 malformed project instruction analysis body를
  `Project instruction analysis failed: Invalid response.`로 reject하도록 요구하게 해 현재
  `{}` resolve 실패를 확인했다.
- [x] GREEN: instruction review 응답의 `score`, `files`, `checklist`, `suggestions`,
  `privacy` 계약을 확인하고 깨진 성공 응답은 raw-free instruction review contract 오류로
  중단하도록 고쳤다.
- [x] VERIFY: focused web API test, implementation format check, typecheck, diff whitespace
  check를 실행한다.

## 2026-07-08 PromptLane Web Project Policy Contract Error

- [x] CHECK: web API `updateProjectPolicy`가 `/api/v1/projects/:id/policy` 성공 응답의
  project summary/policy 계약을 검증하지 않아 malformed 응답을 `{}` 상태로 project settings
  UI에 넘길 수 있다.
- [x] RED: `src/web/src/api.test.ts`가 malformed project policy update body를
  `Project policy update failed: Invalid response.`로 reject하도록 요구하게 해 현재 `{}`
  resolve 실패를 확인했다.
- [x] GREEN: project summary 응답의 `project_id`, `label`, `prompt_count`, `policy`
  계약을 확인하고 깨진 성공 응답은 raw-free project policy contract 오류로 중단하도록
  고쳤다.
- [x] VERIFY: focused web API test, implementation format check, typecheck, diff whitespace
  check를 실행한다.

## 2026-07-08 PromptLane Web Prompt List Contract Error

- [x] CHECK: web API `listPrompts`가 `/api/v1/prompts` 성공 응답의 archive list 계약을
  검증하지 않아 malformed 응답을 `{}` 상태로 first coach/archive UI에 넘길 수 있다.
- [x] RED: `src/web/src/api.test.ts`가 malformed prompt list body를
  `Prompt list failed: Invalid response.`로 reject하도록 요구하게 해 현재 `{}` resolve
  실패를 확인했다.
- [x] GREEN: prompt list 응답의 `items` 배열과 optional `next_cursor` string 계약을
  확인하고 깨진 성공 응답은 raw-free prompt list contract 오류로 중단하도록 고쳤다.
- [x] VERIFY: focused web API test, implementation format check, typecheck, diff whitespace
  check를 실행한다.

## 2026-07-08 PromptLane Web Instruction Patch Contract Error

- [x] CHECK: web API `getLoopInstructionPatch`가 `/api/v1/loops/instruction-patch`
  성공 응답의 review/apply-gate 계약을 검증하지 않아 malformed 응답을 `{}` 상태로
  instruction patch UI에 넘길 수 있다.
- [x] RED: `src/web/src/api.test.ts`가 malformed instruction patch proposal body를
  `Loop instruction patch proposal failed: Invalid response.`로 reject하도록 요구하게 해
  현재 `{}` resolve 실패를 확인했다.
- [x] GREEN: proposal 응답의 `target_file`, `patch_kind`, `writes_files`,
  `requires_user_approval`, `apply_gate`, `privacy` 계약을 확인하고 깨진 성공 응답은
  raw-free instruction patch contract 오류로 중단하도록 고쳤다.
- [x] VERIFY: focused web API test, implementation format check, typecheck, diff whitespace
  check를 실행한다.

## 2026-07-08 PromptLane Web Loop Memory Approval Contract Error

- [x] CHECK: web API `approveLoopMemory`가 `/api/v1/loops/memory/approve` 성공 응답의
  durable memory approval 계약을 검증하지 않아 malformed 응답을 `{}` 상태로 instruction
  patch/continuation UI에 넘길 수 있다.
- [x] RED: `src/web/src/api.test.ts`가 malformed loop memory approval body를
  `Loop memory approval failed: Invalid response.`로 reject하도록 요구하게 해 현재 `{}`
  resolve 실패를 확인했다.
- [x] GREEN: approval 응답의 `recorded`, `memory`, `next_actions`, `privacy` 계약을
  확인하고 깨진 성공 응답은 raw-free loop memory approval contract 오류로 중단하도록
  고쳤다.
- [x] VERIFY: focused web API test, implementation format check, typecheck, diff whitespace
  check를 실행한다.

## 2026-07-08 PromptLane Web Selected Brief Contract Error

- [x] CHECK: web API `getSelectedLoopBrief`가 `/api/v1/loops/brief` 성공 응답의 selected
  continuation brief 계약을 검증하지 않아 malformed 응답을 `{}` 상태로 continuation UI에
  넘길 수 있다.
- [x] RED: `src/web/src/api.test.ts`가 malformed selected loop brief body를
  `Selected loop brief failed: Invalid response.`로 reject하도록 요구하게 해 현재 `{}`
  resolve 실패를 확인했다.
- [x] GREEN: selected loop brief 응답의 `title`, `prompt`, `source_snapshot_id`,
  `privacy` 계약을 확인하고 깨진 성공 응답은 raw-free selected loop brief contract 오류로
  중단하도록 고쳤다.
- [x] VERIFY: focused web API test, implementation format check, typecheck, diff whitespace
  check를 실행한다.

## 2026-07-08 PromptLane Web Loop Worktree Contract Error

- [x] CHECK: web API `getLoopWorktree`가 `/api/v1/loops/worktrees/:worktree` 성공 응답의
  selected continuation 계약을 검증하지 않아 malformed 응답을 `{}` 상태로 worktree
  drilldown UI에 넘길 수 있다.
- [x] RED: `src/web/src/api.test.ts`가 malformed loop worktree body를
  `Loop worktree drilldown failed: Invalid response.`로 reject하도록 요구하게 해 현재 `{}`
  resolve 실패를 확인했다.
- [x] GREEN: `getLoopWorktree`가 `worktree`, `selection_scope`, `items` 계약을 확인하고
  깨진 성공 응답은 raw-free loop worktree contract 오류로 중단하도록 고친다.
- [x] VERIFY: focused web API test, implementation format check, typecheck, diff whitespace
  check를 실행한다.

## 2026-07-08 PromptLane Web Coach Feedback Contract Error

- [x] CHECK: web API `getCoachFeedbackSummary`가 `/api/v1/coach-feedback/summary` 성공
  응답의 ratio/count 계약을 검증하지 않아 malformed 응답을 `{}` 상태로 dashboard UI에
  넘길 수 있다.
- [x] RED: `src/web/src/api.test.ts`가 malformed coach feedback summary body를
  `Coach feedback summary failed: Invalid response.`로 reject하도록 요구하게 해 현재 `{}`
  resolve 실패를 확인했다.
- [x] GREEN: `getCoachFeedbackSummary`가 `total`, `helpful`, `not_helpful`, `wrong`,
  `helpful_ratio` 숫자 계약을 확인하고 깨진 성공 응답은 raw-free coach feedback contract
  오류로 중단하도록 고쳤다.
- [x] VERIFY: focused web API test, implementation format check, typecheck, diff whitespace
  check를 실행한다.

## 2026-07-08 PromptLane Web Archive Score Contract Error

- [x] CHECK: web API `getArchiveScoreReport`가 `/api/v1/score` 성공 응답의 archive
  score/practice plan 계약을 검증하지 않아 malformed 응답을 `{}` 상태로 first coach loop
  practice UI에 넘길 수 있다.
- [x] RED: `src/web/src/api.test.ts`가 malformed archive score body를
  `Archive score report failed: Invalid response.`로 reject하도록 요구하게 해 현재 `{}`
  resolve 실패를 확인했다.
- [x] GREEN: `getArchiveScoreReport`가 `archive_score`, `practice_plan`,
  `low_score_prompts` 계약을 확인하고 깨진 성공 응답은 raw-free archive score contract
  오류로 중단하도록 고쳤다.
- [x] VERIFY: focused web API test, implementation format check, typecheck, diff whitespace
  check를 실행한다.

## 2026-07-08 PromptLane Web Quality Dashboard Contract Error

- [x] CHECK: web API `getQualityDashboard`가 `/api/v1/quality` 성공 응답의 첫 화면 품질
  지표 계약을 검증하지 않아 malformed 응답을 `{}` 상태로 dashboard UI에 넘길 수 있다.
- [x] RED: `src/web/src/api.test.ts`가 malformed quality dashboard body를
  `Quality dashboard failed: Invalid response.`로 reject하도록 요구하게 해 현재 `{}` resolve
  실패를 확인했다.
- [x] GREEN: `getQualityDashboard`가 `total_prompts`, `quality_score`, `missing_items`
  계약을 확인하고 깨진 성공 응답은 raw-free quality dashboard contract 오류로 중단하도록
  고쳤다.
- [x] VERIFY: focused web API test, implementation format check, typecheck, diff whitespace
  check를 실행한다.

## 2026-07-08 PromptLane Web Health Contract Error

- [x] CHECK: web API `getHealth`가 `/api/v1/health` 성공 응답의 `ok`/`version` 계약을
  검증하지 않아 malformed 응답을 `{}` 상태로 server status UI에 넘길 수 있다.
- [x] RED: `src/web/src/api.test.ts`가 malformed health body를
  `Health check failed: Invalid response.`로 reject하도록 요구하게 해 현재 `{}` resolve 실패를
  확인했다.
- [x] GREEN: `getHealth`가 `ok` boolean과 `version` string 계약을 확인하고 깨진 성공
  응답은 raw-free health contract 오류로 중단하도록 고쳤다.
- [x] VERIFY: focused web API test, implementation format check, typecheck, diff whitespace
  check를 실행한다.

## 2026-07-08 PromptLane Web Settings Contract Error

- [x] CHECK: web API `getSettings`가 `/api/v1/settings` 성공 응답의 setup/redaction/server
  계약을 검증하지 않아 malformed 응답을 `{}` 상태로 UI에 넘길 수 있다.
- [x] RED: `src/web/src/api.test.ts`가 malformed settings body를
  `Settings failed: Invalid response.`로 reject하도록 요구하게 해 현재 `{}` resolve 실패를
  확인했다.
- [x] GREEN: `getSettings`가 `redaction_mode`, `server.host`, `server.port` 계약을 확인하고
  깨진 성공 응답은 raw-free settings contract 오류로 중단하도록 고쳤다.
- [x] VERIFY: focused web API test, implementation format check, typecheck, diff whitespace
  check를 실행한다.

## 2026-07-08 PromptLane Web Loop List Contract Error

- [x] CHECK: web API `listLoops`가 `/api/v1/loops` 성공 응답의 top-level loop list
  계약을 검증하지 않아 malformed 응답을 `{}` 또는 `undefined` 상태로 UI에 넘길 수 있다.
- [x] RED: `src/web/src/api.test.ts`가 malformed loop list body를
  `Loop list failed: Invalid response.`로 reject하도록 요구하게 해 현재 `{}` resolve 실패를
  확인했다.
- [x] GREEN: `listLoops`가 `status` 객체와 `items` 배열 계약을 확인하고 깨진 성공 응답은
  raw-free loop list contract 오류로 중단하도록 고쳤다.
- [x] VERIFY: focused web API test, implementation format check, typecheck, diff whitespace
  check를 실행한다.

## 2026-07-08 PromptLane Web Project List Contract Error

- [x] CHECK: web API `listProjects`가 `/api/v1/projects` 성공 응답의 `data.items`
  계약을 검증하지 않아 malformed 응답을 오류 대신 `undefined`로 반환할 수 있다.
- [x] RED: `src/web/src/api.test.ts`가 malformed project list body를
  `Project list failed: Invalid response.`로 reject하도록 요구하게 해 현재 `undefined`
  resolve 실패를 확인했다.
- [x] GREEN: `listProjects`가 `items` 배열 계약을 확인하고 깨진 성공 응답은 raw-free
  project list contract 오류로 중단하도록 고쳤다.
- [x] VERIFY: focused web API test, implementation format check, typecheck, diff whitespace
  check를 실행한다.

## 2026-07-08 PromptLane Web Session Contract Error

- [x] CHECK: web API `ensureSession`이 `/api/v1/session` 성공 응답의 `data.csrf_token`
  계약을 검증하지 않아 malformed 또는 blank token 응답이 후속 API 호출까지 흘러가며 raw
  TypeError를 만든다.
- [x] RED: `src/web/src/api.test.ts`가 malformed session body와 blank csrf token을
  `Session failed: Invalid session response.`로 fail-close 하도록 요구하게 해 후속
  `response.ok` TypeError 실패를 확인했다.
- [x] GREEN: `ensureSession`이 csrf token을 string/non-blank으로 검증하고 깨진 성공
  응답은 raw 내부 속성명 없이 명확한 session contract 오류로 중단하도록 고쳤다.
- [x] VERIFY: focused web API test, implementation format check, typecheck, diff whitespace
  check를 실행한다.

## 2026-07-08 PromptLane Web API Error Redaction

- [x] CHECK: web API client `failApi`가 structured problem `errors[]`를 browser-visible
  error에 붙이면서 future/malformed server error가 raw path 또는 token-shaped secret을
  담으면 그대로 노출할 수 있다.
- [x] RED: `src/web/src/api.test.ts`가 structured problem detail의 `/Users/...` path와
  `sk-proj...` token을 `[REDACTED:path]`, `[REDACTED:secret]`으로 마스킹하도록
  요구하게 해 raw value 노출 실패를 확인했다.
- [x] GREEN: browser-visible API error text sanitizer를 추가해 path와 API-key 형태 secret을
  마스킹하도록 고쳤다.
- [x] VERIFY: focused web API test, typecheck, implementation format check, diff
  whitespace check를 실행한다.

## 2026-07-08 PromptLane Web API Problem Error Cap

- [x] CHECK: web API client `failApi`가 structured problem `errors[]`를 모두 붙여
  validation issue가 많을 때 사용자-visible error가 과도하게 길어진다.
- [x] RED: `src/web/src/api.test.ts`가 첫 3개 issue와 remaining count만 표시하도록
  요구하게 해 full issue list 노출 실패를 확인했다.
- [x] GREEN: `apiErrorIssueText`가 최대 3개 field-level issue와 남은 개수를 표시하도록
  제한했다.
- [x] VERIFY: focused web API test, typecheck, implementation format check, diff
  whitespace check를 실행한다.

## 2026-07-08 PromptLane Web API Problem Errors

- [x] CHECK: server problem responses now expose readable `errors[]` field messages, but
  web API client `failApi` only surfaces `detail/title/message` and drops field-level
  recovery hints.
- [x] RED: `src/web/src/api.test.ts`가 problem `errors[0]`의 `prompt: Prompt cannot be
  empty.`를 thrown API error message에 포함하도록 요구하게 해 generic detail-only 실패를
  확인했다.
- [x] GREEN: `failApi`가 string `errors[]` field/message 항목을 detail suffix에 붙이도록
  고쳤다.
- [x] VERIFY: focused web API test, typecheck, implementation format check, diff
  whitespace check를 실행한다.

## 2026-07-08 PromptLane Ingest Too Large Prompt Message

- [x] CHECK: ingest route prompt length validation이 response `detail`은 readable하지만
  structured problem `errors[0].message`에는 내부 코드식 `too_large`를 노출한다.
- [x] RED: `src/server/create-server.test.ts`가 oversized prompt ingest 응답에서
  `errors[0].message`가 `Prompt length limit exceeded.`가 되도록 요구하게 해 실패를
  확인했다.
- [x] GREEN: prompt length structured error message를 readable recovery text로 맞췄다.
- [x] VERIFY: focused server create-server test, typecheck, implementation format check,
  diff whitespace check를 실행한다.

## 2026-07-08 PromptLane Ingest Empty Prompt Message

- [x] CHECK: ingest route empty prompt validation이 response `detail`은 readable하지만
  structured problem `errors[0].message`에는 내부 코드식 `empty`를 노출한다.
- [x] RED: `src/server/create-server.test.ts`가 empty prompt ingest 응답에서
  `errors[0].message`가 `Prompt cannot be empty.`가 되도록 요구하게 해 실패를 확인했다.
- [x] GREEN: empty prompt structured error message를 readable recovery text로 맞췄다.
- [x] VERIFY: focused server create-server test, typecheck, implementation format check,
  diff whitespace check를 실행한다.

## 2026-07-08 PromptLane Ingest Zod Error Message

- [x] CHECK: ingest route `normalizePayload` Zod error mapper가 structured problem
  `errors` 항목에 human-readable `issue.message` 대신 내부 `issue.code`를 넣어 agent
  hook payload validation 복구 기준을 보기 어렵다.
- [x] RED: `src/server/create-server.test.ts`가 invalid `hook_event_name` ingest 응답에서
  `UserPromptSubmit` 기준을 포함하고 `invalid_value` code만 노출하지 않도록 요구하게 해
  실패를 확인했다.
- [x] GREEN: ingest route Zod mapper가 `issue.message`를 problem error message로
  보내도록 고쳤다.
- [x] VERIFY: focused server create-server test, typecheck, implementation format check,
  diff whitespace check를 실행한다.

## 2026-07-08 PromptLane Server Zod Error Message

- [x] CHECK: 공통 `createServer` Zod error handler가 structured problem `errors`
  항목에 human-readable `issue.message` 대신 내부 `issue.code`를 넣어 web/API 사용자가
  out-of-range 복구 기준을 보기 어렵다.
- [x] RED: `src/server/create-server.test.ts`가 `daily_limit` validation error message에
  `10000` 한계를 포함하고 `too_big` code만 노출하지 않도록 요구하게 해 실패를 확인했다.
- [x] GREEN: 공통 Zod mapper가 `issue.message`를 problem error message로 보내도록
  고쳤다.
- [x] VERIFY: focused server create-server test, typecheck, implementation format check,
  diff whitespace check를 실행했다. `create-server.test.ts` 전체 포맷은 기존 fixture
  줄바꿈 churn을 만들기 때문에 적용하지 않았다.

## 2026-07-08 PromptLane Web API Error Message Fallback

- [x] CHECK: web API client `failApi`가 canonical `detail/title`만 읽어 Fastify 기본
  또는 중간 계층의 `{ message }` error body에서는 복구 안내 대신 상태 코드만 노출한다.
- [x] RED: `src/web/src/api.test.ts`가 message-only 429 응답에서 message recovery hint를
  보존하도록 요구하게 해 `Delete failed (429)` 실패를 확인했다.
- [x] GREEN: `failApi`가 `detail -> title -> message` 순서로 문자열 recovery hint를
  fallback하도록 고쳤다.
- [x] VERIFY: focused web API test, typecheck, code format check, diff whitespace check를
  실행한다.

## 2026-07-08 PromptLane Web API Error String Fallback

- [x] CHECK: web API client `failApi`가 `detail?.trim()`에 직접 의존해 malformed
  non-string detail이 있으면 `title` recovery hint까지 catch로 잃고 상태 코드만 노출한다.
- [x] RED: `src/web/src/api.test.ts`가 non-string detail + useful title 응답에서 title
  recovery hint를 보존하도록 요구하게 해 `Delete failed (403)` 실패를 확인했다.
- [x] GREEN: `failApi`가 detail/title 값을 unknown으로 다루고 문자열일 때만 trim해
  fallback하도록 고쳤다.
- [x] VERIFY: focused web API test, typecheck, code format check, diff whitespace check를
  실행한다.

## 2026-07-08 PromptLane Web API Error Title Fallback

- [x] CHECK: web API client `failApi`가 서버 error body의 `detail`을 trim하지 않아
  blank detail이 있으면 `title` recovery hint fallback을 막고 공백 suffix만 노출한다.
- [x] RED: `src/web/src/api.test.ts`가 blank detail + useful title 응답에서 title
  recovery hint를 보존하도록 요구하게 해 `Delete failed (403):    ` 실패를 확인했다.
- [x] GREEN: `failApi`가 `detail`과 `title`을 trim한 뒤 blank detail이면 title로
  fallback하도록 고쳤다.
- [x] VERIFY: focused web API test, typecheck, code format check, diff whitespace check를
  실행한다.

## 2026-07-08 PromptLane Web Command Center Brief Error Detail

- [x] CHECK: `getSelectedLoopBrief`는 command center loop brief에서도 서버 recovery
  detail을 Error message에 보존하지만, command center copy handler catch가 API 실패와
  clipboard 실패를 같은 generic 문구로 덮어써 command center brief 복구 안내가 UI까지
  전달되지 않는다.
- [x] RED: `src/web/src/error-message.test.ts`가 command center loop brief recovery
  detail 보존 helper를 요구하게 해 helper missing 실패를 확인했다.
- [x] GREEN: command center loop brief fallback helper를 추가하고 copy handler가
  API/server recovery detail을 보존한 뒤 clipboard 실패만 기존 copy fallback으로
  처리하도록 분리했다.
- [x] VERIFY: focused web helper test, typecheck, code format check, diff whitespace
  check를 실행했다.

## 2026-07-08 PromptLane Web Selected Loop Brief Error Detail

- [x] CHECK: `getSelectedLoopBrief`는 서버 recovery detail을 Error message에 보존하지만,
  selected loop brief copy handler catch가 API 실패와 clipboard 실패를 같은 generic
  문구로 덮어써 continuation brief 복구 안내가 UI까지 전달되지 않는다.
- [x] RED: `src/web/src/error-message.test.ts`가 selected loop brief recovery detail
  보존 helper를 요구하게 해 helper missing 실패를 확인했다.
- [x] GREEN: selected loop brief fallback helper를 추가하고 copy handler가 API/server
  recovery detail을 보존한 뒤 clipboard 실패만 기존 copy fallback으로 처리하도록
  분리했다.
- [x] VERIFY: focused web helper test, typecheck, format check, diff whitespace check를
  실행했다.

## 2026-07-08 PromptLane Web Session Error Detail

- [x] CHECK: `ensureSession`이 `/api/v1/session` non-OK 응답을 확인하지 않아
  session recovery detail 대신 `body.data.csrf_token` TypeError를 던진다.
- [x] RED: `src/web/src/api.test.ts`가 session bootstrap recovery detail 보존을
  요구하게 해 TypeError 실패를 확인했다.
- [x] GREEN: `ensureSession`이 non-OK session 응답에서 shared `failApi`를 사용해
  서버 recovery detail을 `Session failed (...)` Error message로 보존하도록 고쳤다.
- [x] VERIFY: focused web API test, typecheck, diff whitespace check를 실행했다.
  `api.test.ts` 전체 포맷은 기존 대형 fixture 포맷 churn을 만들기 때문에 적용하지
  않았다.

## 2026-07-08 PromptLane Web Coach Feedback Query Error Detail

- [x] CHECK: `getCoachFeedbackSummary`는 서버 recovery detail을 Error message에 보존하지만,
  dashboard query 초기 coach feedback catch가 실패를 무시해 feedback 복구 안내가
  UI까지 전달되지 않는다.
- [x] RED: `src/web/src/error-message.test.ts`가 coach feedback query recovery detail
  보존 helper를 요구하게 해 helper missing 실패를 확인했다.
- [x] GREEN: coach feedback query fallback helper를 추가하고 dashboard query handler가
  API/server recovery detail을 사용자-visible error로 전달하도록 연결했다.
- [x] VERIFY: focused web helper/dashboard-query tests, typecheck, format check, diff
  whitespace check를 실행했다.

## 2026-07-08 PromptLane Web Archive Score Query Error Detail

- [x] CHECK: `getArchiveScoreReport`는 서버 recovery detail을 Error message에 보존하지만,
  dashboard query 초기 archive score catch가 실패를 무시해 archive score 복구 안내가
  UI까지 전달되지 않는다.
- [x] RED: `src/web/src/error-message.test.ts`가 archive score query recovery detail
  보존 helper를 요구하게 해 helper missing 실패를 확인했다.
- [x] GREEN: archive score query fallback helper를 추가하고 dashboard query handler가
  API/server recovery detail을 사용자-visible error로 전달하도록 연결했다.
- [x] VERIFY: focused web helper/dashboard-query tests, typecheck, format check, diff
  whitespace check를 실행했다.

## 2026-07-08 PromptLane Web Quality Dashboard Error Detail

- [x] CHECK: `getQualityDashboard`는 서버 recovery detail을 Error message에 보존하지만,
  dashboard query 초기 로딩 catch가 실패를 무시해 quality/dashboard 복구 안내가
  UI까지 전달되지 않는다.
- [x] RED: `src/web/src/error-message.test.ts`가 quality dashboard recovery detail 보존
  helper를 요구하게 해 helper missing 실패를 확인했다.
- [x] GREEN: quality dashboard fallback helper를 추가하고 dashboard query handler가
  API/server recovery detail을 사용자-visible error로 전달하도록 연결했다.
- [x] VERIFY: focused web helper/dashboard-query tests, typecheck, format check, diff
  whitespace check를 실행했다.

## 2026-07-08 PromptLane Web Project List Error Detail

- [x] CHECK: `listProjects`는 서버 recovery detail을 Error message에 보존하지만,
  workspace query project list catch가 실패를 무시해 project policy/setup 복구 안내가
  UI까지 전달되지 않는다.
- [x] RED: `src/web/src/error-message.test.ts`가 project list recovery detail 보존
  helper를 요구하게 해 helper missing 실패를 확인했다.
- [x] GREEN: project list fallback helper를 추가하고 workspace query project list handler가
  API/server recovery detail을 사용자-visible error로 전달하도록 연결했다.
- [x] VERIFY: focused web helper/workspace-query tests, typecheck, format check, diff
  whitespace check를 실행했다.

## 2026-07-08 PromptLane Web Loop List Error Detail

- [x] CHECK: `listLoops`는 서버 recovery detail을 Error message에 보존하지만,
  workspace query loop list catch가 실패를 무시해 loop/session/worktree 복구 안내가
  UI까지 전달되지 않는다.
- [x] RED: `src/web/src/error-message.test.ts`가 loop list recovery detail 보존
  helper를 요구하게 해 helper missing 실패를 확인했다.
- [x] GREEN: loop list fallback helper를 추가하고 workspace query loop list handler가
  API/server recovery detail을 사용자-visible error로 전달하도록 연결했다.
- [x] VERIFY: focused web helper/workspace-query tests, typecheck, format check, diff
  whitespace check를 실행했다.

## 2026-07-08 PromptLane Web Loop Worktree Error Detail

- [x] CHECK: `getLoopWorktree`는 서버 recovery detail을 Error message에 보존하지만,
  workspace query drilldown catch가 generic 문구로 덮어써 loop/session/worktree 복구
  안내가 UI까지 전달되지 않는다.
- [x] RED: `src/web/src/error-message.test.ts`가 loop worktree recovery detail 보존
  helper를 요구하게 해 helper missing 실패를 확인했다.
- [x] GREEN: loop worktree fallback helper를 추가하고 workspace query handler가
  API/server recovery detail을 보존하도록 연결했다.
- [x] VERIFY: focused web helper/workspace-query tests, typecheck, format check, diff
  whitespace check를 실행했다.

## 2026-07-08 PromptLane Web Prompt List Error Detail

- [x] CHECK: `listPrompts`는 서버 recovery detail을 Error message에 보존하지만,
  prompt list query hook catch가 generic 문구로 덮어써 archive/search 복구 안내가
  UI까지 전달되지 않는다.
- [x] RED: `src/web/src/error-message.test.ts`가 prompt list recovery detail 보존
  helper를 요구하게 해 helper missing 실패를 확인했다.
- [x] GREEN: prompt list fallback helper를 추가하고 prompt list query handler가
  API/server recovery detail을 보존하도록 연결했다.
- [x] VERIFY: focused web helper/query tests, typecheck, format check, diff whitespace
  check를 실행했다.

## 2026-07-08 PromptLane Web Selected Prompt Error Detail

- [x] CHECK: `getPrompt`는 서버 recovery detail을 Error message에 보존하지만,
  selected prompt detail hook catch가 generic 문구로 덮어써 deep-link/detail 복구
  안내가 UI까지 전달되지 않는다.
- [x] RED: `src/web/src/error-message.test.ts`가 selected prompt recovery detail 보존
  helper를 요구하게 해 helper missing 실패를 확인했다.
- [x] GREEN: selected prompt fallback helper를 추가하고 selected prompt query handler가
  API/server recovery detail을 보존하도록 연결했다.
- [x] VERIFY: focused web helper/query tests, typecheck, format check, diff whitespace
  check를 실행했다.

## 2026-07-08 PromptLane Web Similar Prompts Error Detail

- [x] CHECK: `getSimilarPrompts`는 서버 recovery detail을 Error message에 보존하지만,
  Prompt detail similar prompts 패널 catch가 generic 문구로 덮어써 archive/detail 복구
  안내가 UI까지 전달되지 않는다.
- [x] RED: `src/web/src/error-message.test.ts`가 similar prompts recovery detail 보존
  helper를 요구하게 해 helper missing 실패를 확인했다.
- [x] GREEN: similar prompts fallback helper를 추가하고 Prompt detail panel handler가
  API/server recovery detail을 보존하도록 연결했다.
- [x] VERIFY: focused web helper test, typecheck, diff whitespace check를 실행했다.

## 2026-07-08 PromptLane Web Ask Events Error Detail

- [x] CHECK: `getAskEventSummary`는 서버 recovery detail을 Error message에 보존하지만,
  Ask mode summary panel catch가 generic 문구로 덮어써 ask/clarification summary
  복구 안내가 UI까지 전달되지 않는다.
- [x] RED: `src/web/src/error-message.test.ts`가 ask event summary recovery detail 보존
  helper를 요구하게 해 helper missing 실패를 확인했다.
- [x] GREEN: ask event summary fallback helper를 추가하고 panel handler가 API/server
  recovery detail을 보존하도록 연결했다.
- [x] VERIFY: focused web helper test, typecheck, diff whitespace check를 실행한다.

## 2026-07-08 PromptLane Web Copy Usage Event Error Detail

- [x] CHECK: `recordPromptCopied`는 서버 recovery detail을 Error message에 보존하지만,
  App prompt copy usage-event catch가 generic 문구로 덮어써 archive/search 복구 안내가
  UI까지 전달되지 않는다.
- [x] RED: `src/web/src/error-message.test.ts`가 prompt copy usage event recovery detail
  보존 helper를 요구하게 해 helper missing 실패를 확인했다.
- [x] GREEN: prompt copy usage event fallback helper를 추가하고 App handler가
  API/server recovery detail을 보존하도록 연결했다.
- [x] VERIFY: focused web helper test, typecheck, diff whitespace check를 실행한다.

## 2026-07-08 PromptLane Web Draft Copy Marker Error Detail

- [x] CHECK: `markPromptImprovementDraftCopied`는 서버 recovery detail을 Error message에
  보존하지만, App saved draft copy marker catch가 generic 문구로 덮어써 saved draft
  review/retry 복구 안내가 UI까지 전달되지 않는다.
- [x] RED: `src/web/src/error-message.test.ts`가 draft copy marker recovery detail 보존
  helper를 요구하게 해 helper missing 실패를 확인했다.
- [x] GREEN: draft copy marker fallback helper를 추가하고 App handler가 API/server
  recovery detail을 보존하도록 연결했다.
- [x] VERIFY: focused web helper test, typecheck, diff whitespace check를 실행한다.

## 2026-07-08 PromptLane Web Bulk Delete Error Detail

- [x] CHECK: `deletePrompt`는 서버 recovery detail을 Error message에 보존하지만,
  App bulk delete catch가 generic 문구로 덮어써 archive/search 복구 안내가 UI까지
  전달되지 않는다.
- [x] RED: `src/web/src/error-message.test.ts`가 bulk delete recovery detail 보존
  helper를 요구하게 해 helper missing 실패를 확인했다.
- [x] GREEN: bulk delete fallback helper를 추가하고 App handler가 API/server recovery
  detail을 보존하도록 연결했다.
- [x] VERIFY: focused web helper test, typecheck, diff whitespace check를 실행한다.

## 2026-07-08 PromptLane Web Bookmark Error Detail

- [x] CHECK: `setPromptBookmark`는 서버 recovery detail을 Error message에 보존하지만,
  App `toggleBookmark` catch가 generic 문구로 덮어써 archive/search 복구 안내가
  UI까지 전달되지 않는다.
- [x] RED: `src/web/src/error-message.test.ts`가 bookmark recovery detail 보존 helper를
  요구하게 해 helper missing 실패를 확인했다.
- [x] GREEN: bookmark fallback helper를 추가하고 App handler가 API/server recovery
  detail을 보존하도록 연결했다.
- [x] VERIFY: focused web helper test, typecheck, diff whitespace check를 실행한다.

## 2026-07-08 PromptLane Web Improvement Draft Error Detail

- [x] CHECK: `savePromptImprovementDraft`는 서버 recovery detail을 Error message에
  보존하지만, App `saveImprovementDraft` catch가 generic 문구로 덮어써 saved draft
  저장 복구 안내가 UI까지 전달되지 않는다.
- [x] RED: `src/web/src/error-message.test.ts`가 improvement draft save recovery detail
  보존 helper를 요구하게 해 helper missing 실패를 확인했다.
- [x] GREEN: improvement draft save fallback helper를 추가하고 App handler가 API/server
  recovery detail을 보존하도록 연결했다.
- [x] VERIFY: focused web helper test, typecheck, diff whitespace check를 실행한다.

## 2026-07-08 PromptLane Web Health Error Detail

- [x] CHECK: `getHealth`가 non-OK 응답에서 `failApi`를 거치지 않아 local server
  readiness/detail 응답을 Error로 보존하지 않고 성공 payload처럼 반환한다.
- [x] RED: `src/web/src/api.test.ts`가 health non-OK detail 보존을 요구하게 해
  promise가 `{ detail }`로 resolve되는 실패를 확인했다.
- [x] GREEN: health API client가 `failApi`를 사용하도록 고쳐 server readiness recovery
  detail을 Error message로 보존한다.
- [x] VERIFY: focused web API test, typecheck, diff whitespace check를 실행한다.

## 2026-07-08 PromptLane Web Prompt List Error Detail

- [x] CHECK: `listPrompts`가 non-OK 응답에서 `failApi`를 거치지 않아 Prompt archive
  첫 화면에서 session/recovery detail이 UI/API caller까지 전달되지 않는다.
- [x] RED: `src/web/src/api.test.ts`가 prompt list non-OK detail 보존을 요구하게 해
  promise가 reject되지 않는 실패를 확인했다.
- [x] GREEN: prompt list API client가 `failApi`를 사용하도록 고쳐 서버 recovery
  detail을 Error message로 보존한다.
- [x] VERIFY: focused web API test, typecheck, diff whitespace check를 실행한다.

## 2026-07-08 PromptLane Web Settings Error Detail

- [x] CHECK: `getSettings`가 non-OK 응답에서 `failApi`를 거치지 않아 settings/local
  server diagnostic 화면에서 session/recovery detail이 UI/API caller까지 전달되지 않는다.
- [x] RED: `src/web/src/api.test.ts`가 settings non-OK detail 보존을 요구하게 해
  promise가 reject되지 않는 실패를 확인했다.
- [x] GREEN: settings API client가 `failApi`를 사용하도록 고쳐 서버 recovery detail을
  Error message로 보존한다.
- [x] VERIFY: focused web API test, typecheck, diff whitespace check를 실행한다.

## 2026-07-08 PromptLane Web Loop Brief Error Detail

- [x] CHECK: `getLoopBrief`가 non-OK 응답에서 `failApi`를 거치지 않아 continuation
  brief 실패 시 loop collect/reopen 같은 recovery detail이 UI/API caller까지 전달되지
  않는다.
- [x] RED: `src/web/src/api.test.ts`가 loop brief non-OK detail 보존을 요구하게 해
  promise가 reject되지 않는 실패를 확인했다.
- [x] GREEN: loop brief API client가 `failApi`를 사용하도록 고쳐 서버 recovery detail을
  Error message로 보존한다.
- [x] VERIFY: focused web API test, typecheck, diff whitespace check를 실행한다.

## 2026-07-08 PromptLane Web Loop List Error Detail

- [x] CHECK: `listLoops`가 non-OK 응답에서 `failApi`를 거치지 않아 loop/session/worktree
  snapshot 화면 진입 시 session/recovery detail이 UI까지 전달되지 않는다.
- [x] RED: `src/web/src/api.test.ts`가 loop list non-OK detail 보존을 요구하게 해
  promise가 reject되지 않는 실패를 확인했다.
- [x] GREEN: loop list API client가 `failApi`를 사용하도록 고쳐 서버 recovery detail을
  Error message로 보존한다.
- [x] VERIFY: focused web API test, typecheck, diff whitespace check를 실행한다.

## 2026-07-08 PromptLane Web Project List Error Detail

- [x] CHECK: `listProjects`가 non-OK 응답에서 `failApi`를 거치지 않아 project control
  화면 진입 시 session/recovery detail 대신 `body.data.items` 접근 오류가 날 수 있다.
- [x] RED: `src/web/src/api.test.ts`가 project list non-OK detail 보존을 요구하게 해
  generic property access 오류로 실패하는 것을 확인했다.
- [x] GREEN: project list API client가 `failApi`를 사용하도록 고쳐 서버 recovery
  detail을 Error message로 보존한다.
- [x] VERIFY: focused web API test, typecheck, diff whitespace check를 실행한다.

## 2026-07-08 PromptLane Web Quality Dashboard Error Detail

- [x] CHECK: `getQualityDashboard`가 non-OK 응답에서 `failApi`를 거치지 않아
  quality dashboard session/recovery detail이 Error로 올라오지 않고, archive
  measurement flow에서 원인 안내를 잃을 수 있다.
- [x] RED: `src/web/src/api.test.ts`가 quality dashboard non-OK detail 보존을
  요구하게 해 promise가 reject되지 않는 실패를 확인했다.
- [x] GREEN: quality dashboard API client가 `failApi`를 사용하도록 고쳐 web
  measurement catch가 서버 recovery detail을 그대로 표시할 수 있게 했다.
- [x] VERIFY: focused web API test, typecheck, diff whitespace check를 실행한다.

## 2026-07-08 PromptLane Web Archive Score Error Detail

- [x] CHECK: `getArchiveScoreReport`가 non-OK 응답에서 `failApi`를 거치지 않아
  archive score session/recovery detail이 Error로 올라오지 않고, App archive
  measurement catch도 generic 문구로 덮는다.
- [x] RED: `src/web/src/api.test.ts`가 archive score non-OK detail 보존을 요구하게 해
  promise가 reject되지 않는 실패를 확인했고, `src/web/src/error-message.test.ts`가
  archive score UI fallback helper missing 실패를 확인했다.
- [x] GREEN: archive score API client가 `failApi`를 사용하도록 고치고, App archive
  score refresh/measurement catch가 Error detail을 보존하도록 연결했다.
- [x] VERIFY: focused web API/helper tests, typecheck, diff whitespace check를
  실행한다.

## 2026-07-08 PromptLane Web Export Preview Error Detail

- [x] CHECK: `createExportPreview`는 서버 recovery detail을 Error message에 보존하지만,
  App `previewExport` catch가 generic preview 문구로 덮어써 CSRF/session/validation
  복구 안내가 UI까지 전달되지 않는다.
- [x] RED: `src/web/src/error-message.test.ts`가 export preview recovery detail 보존
  helper를 요구하게 해 helper missing 실패를 확인했다.
- [x] GREEN: export preview fallback helper를 추가하고 App handler가 API/server
  recovery detail을 보존하도록 연결했다.
- [x] VERIFY: focused web helper test, typecheck, diff whitespace check를 실행한다.

## 2026-07-08 PromptLane Web Project Policy Error Detail

- [x] CHECK: `updateProjectPolicy`는 서버 recovery detail을 Error message에
  보존하지만, App `toggleProjectCapture` catch가 generic policy 문구로 덮어써 stale
  project 복구 안내가 UI까지 전달되지 않는다.
- [x] RED: `src/web/src/error-message.test.ts`가 project policy update recovery detail
  보존 helper를 요구하게 해 helper missing 실패를 확인했다.
- [x] GREEN: project policy update fallback helper를 추가하고 App handler가
  API/server recovery detail을 보존하도록 연결했다.
- [x] VERIFY: focused web helper test, typecheck, diff whitespace check를 실행한다.

## 2026-07-08 PromptLane Web Instruction Analysis Error Detail

- [x] CHECK: `analyzeProjectInstructions`는 서버 recovery detail을 Error message에
  보존하지만, App `analyzeProjectRules` catch가 generic 문구로 덮어써 stale project
  복구 안내가 UI까지 전달되지 않는다.
- [x] RED: `src/web/src/error-message.test.ts`가 project instruction analysis recovery
  detail 보존 helper를 요구하게 해 helper missing 실패를 확인했다.
- [x] GREEN: project instruction analysis fallback helper를 추가하고 App handler가
  API/server recovery detail을 보존하도록 연결했다.
- [x] VERIFY: focused web helper test, typecheck, diff whitespace check를 실행한다.

## 2026-07-08 PromptLane Web Export Error Detail Preservation

- [x] CHECK: web API layer는 export job recovery detail을 Error message에 보존하지만,
  App export execution catch가 generic preview retry 문구로 덮어써 UI까지 전달되지
  않는다.
- [x] RED: `src/web/src/error-message.test.ts`가 공백이 섞인 export recovery detail을
  trim해서 보존해야 한다고 요구하게 해 기존 helper 실패를 확인했다.
- [x] GREEN: `errorMessageOrDefault`가 trim된 Error message를 반환하도록 고치고,
  export execution catch가 API/server recovery detail을 보존하도록 적용했다.
- [x] VERIFY: focused web helper test, typecheck, diff whitespace check를 실행한다.

## 2026-07-08 PromptLane Web Error Detail Preservation

- [x] CHECK: web API layer는 RFC 7807 `detail`을 Error message에 보존하지만, App
  handler catch가 generic 문구로 덮어쓰면 loop memory approval 같은 핵심 recovery
  detail이 UI까지 전달되지 않는다.
- [x] RED: `src/web/src/error-message.test.ts`가 API Error message 보존과 non-Error
  fallback 동작을 요구하게 해 helper missing 실패를 확인했다.
- [x] GREEN: `errorMessageOrDefault` helper를 추가하고 loop memory approval catch가
  API/server recovery detail을 보존하도록 적용했다.
- [x] VERIFY: focused web helper test, typecheck, diff whitespace check를 실행한다.

## 2026-07-08 PromptLane Unsupported Media Recovery

- [x] CHECK: unsupported content-type 415는 "The request content-type is not
  supported."만 반환해, JSON content-type 전송과 agent hook reinstall/doctor 복구
  경로가 덜 분명했다.
- [x] RED: `src/server/create-server.test.ts`가 XML ingest request에서 JSON
  content-type/hook recovery detail과 raw-free detail을 요구하게 해 실패를 확인했다.
- [x] GREEN: shared Fastify unsupported media 415 detail을 JSON content-type 전송 및
  agent hook reinstall/doctor recovery 안내로 교체했다.
- [x] VERIFY: focused server route test, typecheck, diff whitespace check를
  실행한다.

## 2026-07-08 PromptLane Malformed JSON Recovery

- [x] CHECK: malformed JSON body 400은 "The request body could not be parsed."만
  반환해, agent hook payload 문제일 때 valid JSON/hook reinstall/doctor 복구 경로가
  덜 분명했다.
- [x] RED: `src/server/create-server.test.ts`가 malformed ingest JSON에서 valid
  JSON/hook recovery detail과 raw-free detail을 요구하게 해 실패를 확인했다.
- [x] GREEN: shared Fastify parse error 400 detail을 valid JSON 전송 및 agent hook
  reinstall/doctor recovery 안내로 교체했다.
- [x] VERIFY: focused server route test, typecheck, diff whitespace check를
  실행한다.

## 2026-07-08 PromptLane Ingest Bearer Recovery

- [x] CHECK: Codex/Claude Code hook ingest route의 missing/invalid bearer token 실패는
  "Missing or invalid bearer token."만 반환해, stale hook token을 갱신하고 doctor로
  확인하는 복구 경로가 덜 분명했다.
- [x] RED: `src/server/create-server.test.ts`가 unauthenticated ingest에서
  `install-hook`/`doctor` recovery detail과 raw-free detail을 요구하게 해 실패를
  확인했다.
- [x] GREEN: shared `requireBearerToken` 401 detail을 Claude Code/Codex hook reinstall
  및 matching doctor command 안내로 교체했다.
- [x] VERIFY: focused server route test, typecheck, diff whitespace check를
  실행한다.

## 2026-07-08 PromptLane Web App Session Recovery

- [x] CHECK: HTTP/web app access route의 missing/invalid session 실패는 "Missing or
  invalid app session."만 반환해, local web session을 다시 열어야 한다는 복구
  경로가 덜 분명했다.
- [x] RED: `src/server/create-server.test.ts`가 session 없는 `/api/v1/prompts`
  요청에서 `/api/v1/session` recovery detail과 raw-free detail을 요구하게 해 실패를
  확인했다.
- [x] GREEN: shared `requireAppAccess` app-session 401 detail을 local web session
  refresh recovery 안내로 교체했다.
- [x] VERIFY: focused server route test, typecheck, diff whitespace check를
  실행한다.

## 2026-07-08 PromptLane Web CSRF Recovery

- [x] CHECK: protected HTTP/web write route의 missing/invalid CSRF 실패는 "Missing
  or invalid CSRF token."만 반환해, local web session을 새로고침한 뒤 재시도해야
  한다는 복구 경로가 덜 분명했다.
- [x] RED: `src/server/create-server.test.ts`가 no-CSRF protected delete에서
  `/api/v1/session` refresh recovery detail과 raw-free detail을 요구하게 해 실패를
  확인했다.
- [x] GREEN: shared `requireAppAccess` CSRF 403 detail을 local web session refresh
  recovery 안내로 교체했다.
- [x] VERIFY: focused server route test, typecheck, diff whitespace check를
  실행한다.

## 2026-07-08 PromptLane Web Unknown Route Recovery

- [x] CHECK: HTTP/web unknown route 404는 "The requested route does not exist."만
  반환해, local server readiness 확인 또는 web app route 재진입 경로가 덜 분명했다.
- [x] RED: `src/server/create-server.test.ts`가 unknown route에서 health check/web
  app route recovery detail과 raw-free detail을 요구하게 해 실패를 확인했다.
- [x] GREEN: Fastify notFound handler의 404 detail을 `/api/v1/health` readiness 확인
  및 PromptLane web app route 재진입 안내로 교체했다.
- [x] VERIFY: focused server route test, typecheck, diff whitespace check를
  실행한다.

## 2026-07-08 PromptLane Web Export Job Recovery

- [x] CHECK: HTTP/web `POST /api/v1/exports`는 stale/missing export job 실행에서
  "Export job not found."만 반환해, 새 export preview를 만든 뒤 해당 preview에서
  실행해야 한다는 복구 경로가 덜 분명했다.
- [x] RED: `src/server/create-server.test.ts`가 missing export job id에서
  preview-creation recovery detail과 raw-free detail을 요구하게 해 실패를 확인했다.
- [x] GREEN: export execute route의 missing job 404 detail을 new preview creation
  recovery 안내로 교체했다.
- [x] VERIFY: focused server route test, typecheck, diff whitespace check를
  실행한다.

## 2026-07-08 PromptLane Web Project Instruction Review Recovery

- [x] CHECK: HTTP/web `GET /api/v1/projects/:id/instructions`는 stale/missing
  instruction review에서 "Project instruction review not found."만 반환해, 먼저
  instruction analysis를 실행해야 한다는 복구 경로가 덜 분명했다.
- [x] RED: `src/server/create-server.test.ts`가 missing review에서 instruction
  analysis-first recovery detail과 raw-free detail을 요구하게 해 실패를 확인했다.
- [x] GREEN: project instruction review route의 missing review 404 detail을 existing
  project에서 instruction analysis를 먼저 실행하라는 recovery 안내로 교체했다.
- [x] VERIFY: focused server route test, typecheck, diff whitespace check를
  실행한다.

## 2026-07-08 PromptLane Web Project Instruction Analyze Recovery

- [x] CHECK: HTTP/web `POST /api/v1/projects/:id/instructions/analyze`는
  stale/missing project에서 instruction analysis를 시도할 때 "Project not
  found."만 반환해, local project list를 새로고침한 뒤 기존 project에서 재시도해야
  한다는 복구 경로가 덜 분명했다.
- [x] RED: `src/server/create-server.test.ts`가 missing project id에서 instruction
  analysis recovery detail과 raw-free detail을 요구하게 해 실패를 확인했다.
- [x] GREEN: project instruction analyze route의 missing project 404 detail을 local
  project list refresh recovery 안내로 교체했고, test memory storage의 analyze
  helper를 실제 존재 여부 기반으로 맞췄다.
- [x] VERIFY: focused server route test, typecheck, diff whitespace check를
  실행한다.

## 2026-07-08 PromptLane Web Project Policy Recovery

- [x] CHECK: HTTP/web `PATCH /api/v1/projects/:id/policy`는 stale/missing
  project에서 policy 변경을 시도할 때 "Project not found."만 반환해, local
  project list를 새로고침한 뒤 기존 project에서 재시도해야 한다는 복구 경로가 덜
  분명했다.
- [x] RED: `src/server/create-server.test.ts`가 missing project id에서 project-list
  refresh recovery detail과 raw-free detail을 요구하게 해 실패를 확인했다.
- [x] GREEN: project policy route의 missing project 404 detail을 local project
  list refresh recovery 안내로 교체했고, test memory storage의 policy update
  helper를 실제 존재 여부 기반으로 맞췄다.
- [x] VERIFY: focused server route test, typecheck, diff whitespace check를
  실행한다.

## 2026-07-08 PromptLane Web Saved Draft Copy Recovery

- [x] CHECK: HTTP/web `POST /api/v1/prompts/:id/improvements/:draft_id/copy`는
  stale/missing saved draft copy에서 "Improvement draft not found."만 반환해,
  prompt detail/saved drafts로 복구하는 방법이 덜 분명했다.
- [x] RED: `src/server/create-server.test.ts`가 valid prompt id와 missing draft
  id에서 saved-drafts recovery detail과 raw-free detail을 요구하게 해 실패를
  확인했다.
- [x] GREEN: saved draft copy route의 missing draft 404 detail을 local prompt
  detail/saved drafts recovery 안내로 교체했다.
- [x] VERIFY: focused server route test, typecheck, diff whitespace check를
  실행한다.

## 2026-07-08 PromptLane Web Coach Feedback Recovery

- [x] CHECK: HTTP/web `POST /api/v1/prompts/:id/coach-feedback`는 stale/missing
  prompt에서 coach feedback 기록을 시도할 때 "Prompt not found."만 반환해, local
  archive/search로 복구하는 방법이 덜 분명했다.
- [x] RED: `src/server/create-server.test.ts`가 valid-but-missing prompt id와
  coach feedback payload에서 archive/search recovery detail과 raw-free detail을
  요구하게 해 실패를 확인했다.
- [x] GREEN: coach-feedback route의 missing prompt 404 detail을 local
  archive/search recovery 안내로 교체했고, test memory storage의 feedback helper를
  실제 존재 여부 기반으로 맞췄다.
- [x] VERIFY: focused server route test, typecheck, diff whitespace check를
  실행한다.

## 2026-07-08 PromptLane Web Delete Recovery

- [x] CHECK: HTTP/web `DELETE /api/v1/prompts/:id`는 stale/missing prompt에서
  delete를 시도할 때 "Prompt not found."만 반환해, local archive/search로 복구하는
  방법이 덜 분명했다.
- [x] RED: `src/server/create-server.test.ts`가 valid-but-missing prompt id에서
  delete recovery detail과 raw-free detail을 요구하게 해 실패를 확인했다.
- [x] GREEN: delete route의 missing prompt 404 detail을 local archive/search
  recovery 안내로 교체했고, test memory storage의 delete helper를 실제 존재 여부
  기반으로 맞췄다.
- [x] VERIFY: focused server route test, typecheck, diff whitespace check를
  실행한다.

## 2026-07-08 PromptLane Web Usage Event Recovery

- [x] CHECK: HTTP/web `POST /api/v1/prompts/:id/events`는 stale/missing prompt에서
  usage event 기록을 시도할 때 "Prompt not found."만 반환해, local archive/search로
  복구하는 방법이 덜 분명했다.
- [x] RED: `src/server/create-server.test.ts`가 valid-but-missing prompt id와
  `prompt_copied` payload에서 archive/search recovery detail과 raw-free detail을
  요구하게 해 실패를 확인했다.
- [x] GREEN: usage-event route의 missing prompt 404 detail을 local archive/search
  recovery 안내로 교체했다.
- [x] VERIFY: focused server route test, typecheck, diff whitespace check를
  실행한다.

## 2026-07-08 PromptLane Web Bookmark Recovery

- [x] CHECK: HTTP/web `PUT /api/v1/prompts/:id/bookmark`는 stale/missing
  prompt에서 bookmark 변경을 시도할 때 "Prompt not found."만 반환해, local
  archive/search로 복구하는 방법이 덜 분명했다.
- [x] RED: `src/server/create-server.test.ts`가 valid-but-missing prompt id와
  bookmark payload에서 archive/search recovery detail과 raw-free detail을
  요구하게 해 실패를 확인했다.
- [x] GREEN: bookmark route의 missing prompt 404 detail을 local archive/search
  recovery 안내로 교체했다.
- [x] VERIFY: focused server route test, typecheck, diff whitespace check를
  실행한다.

## 2026-07-08 PromptLane Web Improvement Recovery

- [x] CHECK: HTTP/web `POST /api/v1/prompts/:id/improvements`는 stale/missing
  prompt에서 improvement draft 저장을 시도할 때 "Prompt not found."만 반환해,
  local archive/search로 복구하는 방법이 덜 분명했다.
- [x] RED: `src/server/create-server.test.ts`가 valid-but-missing prompt id와
  유효한 improvement payload에서 archive/search recovery detail과 raw-free
  detail을 요구하게 해 실패를 확인했다.
- [x] GREEN: improvement draft 생성 route의 missing prompt 404 detail을 local
  archive/search recovery 안내로 교체했다.
- [x] VERIFY: focused server route test, typecheck, diff whitespace check를
  실행한다.

## 2026-07-08 PromptLane Web Prompt Detail Recovery

- [x] CHECK: HTTP/web `GET /api/v1/prompts/:id`는 stale/missing prompt detail
  link에서 "Prompt not found."만 반환해, local archive/search로 복구하는 방법이
  덜 분명했다.
- [x] RED: `src/server/create-server.test.ts`가 valid-but-missing prompt id에
  archive/search recovery detail과 raw-free detail을 요구하게 해 실패를 확인했다.
- [x] GREEN: prompt detail route의 404 detail을 local archive/search recovery
  안내로 교체했다.
- [x] VERIFY: focused server route test, typecheck, diff whitespace check를
  실행한다.

## 2026-07-08 PromptLane Web Explicit Brief Recovery

- [x] CHECK: HTTP/web `GET /api/v1/loops/:id/brief`는 explicit snapshot id가
  없을 때 "Loop snapshot not found."만 반환해, stale detail link에서 최신 safe
  continuation brief로 복구하는 방법을 안내하지 않았다.
- [x] RED: `src/server/create-server.test.ts`가 missing explicit loop brief
  응답에 next Codex/Claude Code turn 후 `promptlane loop collect`를 실행하고
  latest `promptlane loop brief`로 retry하라는 raw-free 안내를 요구하게 해 실패를
  확인했다.
- [x] GREEN: explicit snapshot brief route의 404 detail을 raw-free recovery
  문구로 교체했다.
- [x] VERIFY: focused server route test, typecheck, diff whitespace check를
  실행한다.

## 2026-07-08 PromptLane Web Brief Recovery

- [x] CHECK: HTTP/web `GET /api/v1/loops/brief`는 snapshot이 없거나 선택
  필터가 맞지 않을 때 CLI/MCP보다 짧은 "Loop snapshot not found." 또는
  selected-filter miss 문구만 반환해 first prompt/collect retry 경로가 덜
  분명했다.
- [x] RED: `src/server/create-server.test.ts`가 empty web brief에는 first
  prompt/score/collect 후 retry 안내를, selected-filter miss에는 필터를 포함한
  `promptlane loop collect ...` recovery command를 요구하게 해 실패를 확인했다.
- [x] GREEN: server brief route가 shared brief no-snapshot helper와 selected
  snapshot recovery helper를 사용하게 했다.
- [x] VERIFY: focused server route test, typecheck, diff whitespace check를
  실행한다.

## 2026-07-08 PromptLane Web Memory Approval Recovery

- [x] CHECK: HTTP/web `POST /api/v1/loops/memory/approve`는 loop snapshot이
  없을 때 "Loop snapshot not found."만 반환해, memory approval 전에 필요한
  first prompt/score/collect/outcome evidence 순서를 안내하지 않았다.
- [x] RED: `src/server/create-server.test.ts`가 web memory approval no-snapshot
  응답에 first prompt, first score, loop snapshot collect, passed outcome
  evidence 후 retry 안내를 요구하게 해 실패를 확인했다.
- [x] GREEN: server route가 shared memory no-snapshot recovery helper를 사용해
  web/HTTP approval 표면도 evidence-first 순서를 안내하게 했다.
- [x] VERIFY: focused server route test, typecheck, diff whitespace check를
  실행한다.

## 2026-07-08 PromptLane Web Instruction Patch Memory Recovery

- [x] CHECK: HTTP/web `GET /api/v1/loops/instruction-patch`는 approved loop
  memory가 없을 때 CLI/MCP와 달리 "Approve a PromptLane memory first"만
  반환해 evidence-backed memory 생성 순서를 덜 분명하게 안내했다.
- [x] RED: `src/server/create-server.test.ts`가 web instruction patch no-memory
  응답에 first prompt, first score, loop snapshot collect, passed outcome
  evidence, memory approval 후 retry 안내를 요구하게 해 실패를 확인했다.
- [x] GREEN: server route가 shared CLI recovery helper를 사용해 web/HTTP
  표면도 같은 evidence-first 순서를 안내하게 했다.
- [x] VERIFY: focused server route test, typecheck, diff whitespace check를
  실행한다.

## 2026-07-08 PromptLane Instruction Patch Memory Recovery

- [x] CHECK: instruction patch proposal/apply가 approved loop memory가 없을 때
  단순히 `loop memory-approve`만 안내해, evidence-backed memory를 만들기 위한
  first prompt/score/collect/outcome evidence 순서가 덜 분명했다.
- [x] RED: CLI/MCP instruction patch no-memory tests가 first prompt, score
  확인, loop snapshot collect, passed outcome evidence, memory approval 후 retry를
  안내해야 한다고 요구하게 해 실패를 확인했다.
- [x] GREEN: CLI/MCP instruction patch no-memory recovery helper를 추가하고
  proposal/apply 양쪽이 같은 evidence-first 순서를 안내하게 했다.
- [x] VERIFY: focused loop CLI/MCP tests, typecheck, formatting/diff checks를
  실행한다.

## 2026-07-08 PromptLane Loop Outcome First-Prompt Recovery

- [x] CHECK: MCP `record_loop_outcome`의 latest snapshot 경로가 empty archive에서
  바로 `loop collect`만 안내해, outcome 기록 전에 first prompt/score 확인이
  선행되어야 한다는 흐름이 덜 분명했다.
- [x] RED: `src/mcp/loop-tool.test.ts`가 no-snapshot `record_loop_outcome`에
  first prompt + `coach_prompt`/status recheck + `promptlane loop collect` 후
  retry 안내를 요구하게 해 실패를 확인했다.
- [x] GREEN: MCP outcome no-snapshot recovery helper를 추가하고
  `recordLoopOutcomeTool`이 `record_loop_outcome`에 맞는 recovery를 반환하게 했다.
- [x] VERIFY: focused MCP loop-tool test, typecheck, formatting/diff checks를
  실행한다.

## 2026-07-08 PromptLane Loop Memory First-Prompt Recovery

- [x] CHECK: empty archive에서 `loop memory-candidate`와 MCP
  `propose_loop_memory_candidate`가 바로 `loop collect`만 안내해, loop memory가
  요구하는 first prompt/coach/collect/outcome evidence 순서가 덜 분명했다.
- [x] RED: CLI/MCP memory candidate no-snapshot tests가 first prompt + first
  score 확인, `promptlane loop collect`, passed outcome evidence 기록 후 retry를
  안내해야 한다고 요구하게 해 실패를 확인했다.
- [x] GREEN: CLI/MCP 표면별 loop memory no-snapshot recovery helper를 추가하고,
  `memory-candidate`, `memory-approve`, `propose_loop_memory_candidate`,
  `record_loop_memory`가 같은 순서를 안내하게 했다.
- [x] VERIFY: focused loop CLI/MCP tests, typecheck, formatting/diff checks를
  실행한다.

## 2026-07-08 PromptLane Loop Brief First-Prompt Recovery

- [x] CHECK: empty archive에서 `promptlane loop brief`와 MCP
  `prepare_loop_brief`는 바로 `loop collect`만 안내해, 첫 사용자에게 먼저
  Codex/Claude Code prompt를 캡처하고 coach/score를 확인해야 한다는 순서가
  약했다.
- [x] RED: CLI/MCP loop brief no-snapshot tests가 first prompt + coach/score
  확인 후 `promptlane loop collect`를 실행하라는 recovery message를 요구하게 해
  실패를 확인했다.
- [x] GREEN: CLI/MCP 표면별 no-snapshot recovery message를
  `loop/snapshot-selection` helper로 공유하고, selected-filter recovery는 그대로
  유지했다.
- [x] VERIFY: focused loop CLI/MCP tests, typecheck, formatting/diff checks를
  실행한다.

## 2026-07-08 PromptLane Quality Operator Brief Complete State

- [x] CHECK: `promptlane quality-evidence --operator-brief`는 현재
  `native_dialog_approved_dogfood`가 complete인데도, 완료 증거가 이미 기록되어
  추가 operator action이 없다는 문장을 직접 보여주지 않았다.
- [x] RED: `src/cli/commands/quality-evidence.test.ts`가 complete 상태 operator
  brief에 no-action boundary와 completion audit 문서 위치를 요구하게 해 실패를
  확인했다.
- [x] GREEN: native dialog evidence가 complete일 때 operator brief가
  "Operator action: none"과 완료 기록 문서 경로를 출력하게 했다.
- [x] VERIFY: focused quality-evidence CLI test, built CLI operator brief,
  typecheck, formatting/diff checks를 실행한다.

## 2026-07-08 PromptLane Start Codex First-Score Guidance

- [x] CHECK: `promptlane start --tool codex`는 first-score happy path와
  `promptlane coach` 명령을 보여주지만, "Send one real coding prompt" 단계의
  in-agent follow-up은 Claude Code slash command만 언급해 Codex 사용자가
  agent-native `coach_prompt`를 바로 떠올리기 어려웠다.
- [x] RED: `src/cli/commands/start.test.ts`가 Codex 전용 start guide의 send-step
  detail에 `Inside Codex`와 `coach_prompt` 안내가 있어야 한다고 요구하게 해
  실패를 확인했다.
- [x] GREEN: `buildStartGuide`가 선택된 tool 집합에 맞춰 Claude Code
  `/promptlane:improve-last`와 Codex `coach_prompt` follow-up 안내를 구성하게
  했다.
- [x] VERIFY: focused start command test, typecheck, formatting/diff checks를
  실행한다.

## 2026-07-08 PromptLane Web Empty Loop Korean Next Actions

- [x] CHECK: web Loops empty panel이 서버 `next_actions`를 렌더링하게 됐지만,
  한국어 UI에서도 first prompt/coach/loop collect 안내가 영어로 남아 첫 사용자
  onboarding 흐름이 섞여 보였다.
- [x] RED: `src/web/src/i18n.test.ts`가 서버 제공 empty loop first-score action을
  `localizeElement(..., "ko")`에서 한국어로 번역해야 한다고 요구하게 해 실패를
  확인했다.
- [x] GREEN: empty loop heading/status/next-step/action 문구를 `UI_TRANSLATIONS`에
  추가해 한국어 UI에서도 next action 순서가 자연스럽게 보이게 했다.
- [x] VERIFY: focused i18n/LoopsView tests, typecheck, formatting/diff checks,
  rendered Korean web validation을 실행한다.

## 2026-07-08 PromptLane Web Empty Loop Next Actions

- [x] CHECK: loop status 모델과 MCP는 empty loop 상태에서 first prompt/coach 이후
  `loop collect`를 안내하지만, web Loops empty panel은 서버 `next_actions`를
  렌더링하지 않고 정적 `loop collect` 문구만 보여줬다.
- [x] RED: `src/web/src/loops-view.test.ts`가 empty loop panel에 상태 라벨,
  `Next steps`, first prompt/coach action, 그리고 collect action 순서를 요구하게
  해 실패를 확인했다.
- [x] GREEN: `LoopEmptyState`가 서버 `status`와 최대 3개의 `next_actions`를
  렌더링하게 하고, empty panel의 next-step text styling을 summary status line과
  맞췄다.
- [x] VERIFY: focused LoopsView test, typecheck, formatting/diff checks, rendered
  web validation을 실행한다.

## 2026-07-08 PromptLane Empty Loop First Value Guidance

- [x] CHECK: loop status 모델의 empty 상태는 `loop collect`를 먼저 안내하고
  prompt capture 필요성을 뒤에 말해, 새 사용자가 빈 snapshot부터 만들 수 있었다.
- [x] RED: `src/loop/status.test.ts`가 empty loop status에서 Codex/Claude Code
  prompt capture와 `promptlane coach` first score 확인이 `loop collect`보다 먼저
  나오도록 요구하게 해 실패를 확인했다.
- [x] GREEN: empty loop next actions를 first prompt/coach -> loop collect 순서로
  바꿨다. `next_action`은 실행 가능한 snapshot 생성 명령인 `promptlane loop
  collect`로 유지한다.
- [x] VERIFY: focused loop status/MCP tests, typecheck, formatting/diff checks를
  실행한다.

## 2026-07-08 PromptLane Loop MCP First Prompt Guidance

- [x] CHECK: 일반 `get_promptlane_status` setup-needed/empty 상태는 첫
  Codex/Claude Code prompt 후 `coach_prompt` 또는 status recheck를 안내하지만,
  `get_promptlane_loop_status` setup-needed fallback은 바로 `loop collect`로
  넘어가 첫 사용자에게 capture/score 선행 단계를 덜 분명하게 보여줬다.
- [x] RED: `src/mcp/loop-tool.test.ts`가 loop MCP setup guidance에 MCP용
  first-prompt next step이 포함되고 `loop collect`보다 먼저 나오도록 요구하게 해
  실패를 확인했다.
- [x] GREEN: MCP first-prompt next step을 공유 상수로 분리하고, loop MCP
  setup-needed next actions가 setup -> first prompt/coach_prompt -> loop collect
  순서를 따르게 했다.
- [x] VERIFY: focused MCP loop/status/server tests, typecheck, formatting/diff
  checks를 실행한다.

## 2026-07-08 PromptLane Hook Shell Quote Centralization

- [x] CHECK: install-hook/statusline은 shared `quoteForShell` 도입 이후에도
  local `shellQuote = JSON.stringify` helper를 유지해 command quoting 규칙이
  다시 drift될 수 있었다.
- [x] RED: `src/packaging/plugin-files.test.ts` guard가 command-rendering
  surfaces에서 local `shellQuote` helper를 금지하고, `quoteForShell` 사용 시
  shared `shell-quote` import를 요구하게 해 install-hook/statusline에서 실패를
  확인했다.
- [x] GREEN: install-hook/statusline이 shared `quoteForShell`을 사용하게 하고,
  hook command 기대값을 shared single-quote shell form으로 갱신했다.
- [x] VERIFY: focused packaging/install-hook/statusline tests, typecheck,
  formatting/diff checks를 실행한다.

## 2026-07-08 PromptLane MCP Registration Command Quoting

- [x] CHECK: setup/doctor가 사용자에게 보여주는 MCP registration command는
  `mcpRegistrationSpec` argv를 사람이 복사할 수 있는 문자열로 렌더링하지만,
  dist entry path에 공백이 있으면 `[command, ...args].join(" ")` 때문에 깨질 수
  있었다.
- [x] RED: `src/cli/agent-access.test.ts`에 Codex/Claude Code registration
  command가 공백 포함 entry path를 shell-quote해야 한다는 focused test를 추가해
  실패를 확인했다.
- [x] GREEN: `mcpRegistrationCommand`가 shared `quoteForShell`로 argv를 렌더링하게
  했다. 기존 PATH 기반 `promptlane mcp` 문구는 그대로 유지된다.
- [x] VERIFY: focused agent-access/setup/doctor tests, typecheck,
  formatting/diff checks를 실행한다.

## 2026-07-08 PromptLane Command Center Command Quoting

- [x] CHECK: command-center continuation command는 web/CLI/MCP status가 공유하는
  agent-loop next action 표면인데, worktree/branch 값을 문자열 interpolation 후
  join해 공백/따옴표 포함 label에서 복사 실행이 깨질 수 있었다.
- [x] RED: `src/loop/status.test.ts`에 command-center continuation command와
  `next_actions`가 공백/따옴표 포함 worktree/branch 값을 shell-quote해야 한다는
  focused test를 추가해 실패를 확인했다.
- [x] GREEN: `continuationCommandForWorktree`가 argv 배열을 만들고 shared
  `quoteForShell`로 렌더링하게 했다. 기존 safe 값은 unquoted로 유지된다.
- [x] VERIFY: focused loop status/CLI/MCP/web tests, typecheck,
  formatting/diff checks를 실행한다.

## 2026-07-08 PromptLane Shared Shell Quote Helper

- [x] CHECK: selected brief command, brief recovery command, Codex HUD buddy
  command가 모두 같은 shell-quoting primitive를 쓰지만 각 entrypoint에
  `quoteForShell` helper가 중복되어 있었다.
- [x] RED: `src/shared/shell-quote.test.ts`를 추가해 shared `quoteForShell`
  contract를 먼저 요구했고, 모듈이 없어 실패를 확인했다.
- [x] GREEN: `src/shared/shell-quote.ts`를 추가하고 CLI/server/loop command
  rendering 표면이 같은 helper를 import하게 했다. ARCHITECTURE shared helper
  목록도 갱신했다.
- [x] VERIFY: shared helper test와 관련 command rendering focused tests,
  typecheck, formatting/diff checks를 실행한다.

## 2026-07-08 PromptLane Brief Recovery Command Quoting

- [x] CHECK: selected loop brief가 선택 필터와 일치하는 snapshot을 찾지 못할 때
  CLI/MCP가 공유 recovery message로 `promptlane loop collect ...` 명령을 안내하지만,
  worktree/branch 값에 공백이나 따옴표가 있으면 복사 실행이 깨질 수 있었다.
- [x] RED: `src/cli/commands/loop.test.ts`에 selected brief recovery command가
  공백/따옴표 포함 필터 값을 shell-quote해야 한다는 focused test를 추가해 실패를
  확인했다.
- [x] GREEN: raw path label sanitization은 유지하고, 최종 recovery command argv
  조각을 `quoteForShell` helper로 렌더링하게 했다.
- [x] VERIFY: focused loop CLI/MCP tests, typecheck, formatting/diff checks를
  실행한다.

## 2026-07-08 PromptLane Selected Brief Command Quoting

- [x] CHECK: web/server selected continuation brief action은
  `promptlane loop brief --worktree ...` command를 사용자에게 복사 가능한 형태로
  제공하지만, worktree/session/branch 값에 공백이나 따옴표가 있으면 shell command가
  깨질 수 있었다.
- [x] RED: `src/server/loop-detail-guidance.test.ts`에 selected brief command가
  공백/따옴표 포함 필터 값을 shell-quote해야 한다는 focused test를 추가해 실패를
  확인했다.
- [x] GREEN: `selectedBriefCommand`가 모든 argv 조각을 작은 `quoteForShell`
  helper로 렌더링하게 했다. 기존 안전한 label/branch 값은 그대로 unquoted로 유지한다.
- [x] VERIFY: focused loop detail guidance test, typecheck, formatting/diff
  checks를 실행한다.

## 2026-07-08 PromptLane Codex HUD Custom Data Dir

- [x] CHECK: `install-codex-hud`는 `--data-dir`를 실제 buddy argv에는 전달하지만,
  cmux/no multiplexer 안내의 `promptlane buddy ...` pretty command에는 빠뜨려
  custom storage 사용자가 다른 archive를 볼 수 있었다.
- [x] RED: `src/cli/commands/install-codex-hud.test.ts`에 cmux/no multiplexer
  JSON instructions가 custom `--data-dir`를 runnable pretty command에 보존해야
  한다는 focused tests를 추가해 실패를 확인했다.
- [x] GREEN: text/JSON instructions가 공유 `formatBuddyCommandPretty` helper를
  사용하게 하고, custom data-dir 값은 기존 shell quoting 규칙으로 렌더링한다.
- [x] VERIFY: focused HUD CLI test, typecheck, formatting/diff checks를 실행했다.

## 2026-07-08 PromptLane Buddy Setup Actions

- [x] CHECK: MCP/coach/loop setup-needed 흐름은 custom data-dir 복구 안내를
  raw-free next action으로 제공하지만, `buddy` block 출력은 첫 번째
  `next_move`만 보여 보조 복구 액션을 놓칠 수 있었다.
- [x] RED: `src/cli/commands/buddy.test.ts`에 `buddy --json`이 모든 setup
  recovery action을 top-level `next_actions`로 노출하고, block 출력도 두 번째
  이후 action을 보여야 한다는 focused tests를 추가해 실패를 확인했다.
- [x] GREEN: `BuddySnapshot`에 additive `next_actions`를 추가하고 기존
  `next_move`는 첫 번째 action으로 유지했다. block 출력은 두 번째 이후 action을
  `Also do` 줄로 렌더링한다.
- [x] VERIFY: focused CLI test, typecheck, formatting/diff checks를 실행했다.

## 2026-07-08 PromptLane Long-Running Product Polish

- [x] CHECK: 장기 goal을 등록했다. 목표는 PromptLane를 local-first
  agent-loop memory/workspace 제품으로 기획, 아키텍처, Codex/Claude Code
  통합, privacy invariant, UI/CLI/MCP/doctor/runtime 검증까지 장기 개선하는
  것이다.
- [x] CHECK: 현재 `quality-evidence`는 `promptlane_95_quality`를
  `complete`로 보고하고, 7개 scorecard axis 모두 `9.5/10`이며 blocker와
  recommended next slice가 없다.
- [x] CHECK: 현재 main에서 기본 release gate가 통과했다:
  `corepack pnpm test`, `corepack pnpm lint`, `corepack pnpm build`,
  `corepack pnpm pack:dry-run`, `git diff --check`.
- [x] CHECK: `corepack pnpm smoke:release`도 통과해 SQLite, Markdown, FTS,
  hook installer preview, local server, Claude Code/Codex payload capture,
  import/export, delete cleanup 흐름이 현재 빌드에서 동작한다.
- [ ] NEXT: 9.5 완료 상태를 단순 유지하는 작업보다, 사용자가 첫 설치 후
  "다음 요청이 실제로 더 좋아졌다"고 느끼는 end-to-end 제품 경험을 기준으로
  다음 개선 슬라이스를 선정한다.
- [x] NEXT: 첫 후보는 `first value loop`의 operator journey 재검토다. setup,
  doctor, hook/MCP registration, first coach loop, continuation brief,
  approved memory, instruction patch proposal이 한 화면/한 명령 흐름에서
  어디서 끊기는지 실제 로컬 실행으로 확인하고 가장 큰 마찰 하나만 줄인다.
- [x] RED: `corepack pnpm smoke:agent-setup`이 isolated setup 이후
  `doctor claude-code`에서 실패했다. fake provider binaries가 `mcp add/list`
  상태를 시뮬레이션하지 않았고, doctor readiness가 local server까지 요구하는
  현재 contract와 smoke harness가 맞지 않았다.
- [x] GREEN: `scripts/agent-setup-smoke.mjs`의 fake provider가 MCP 등록 파일과
  `mcp list` 출력을 시뮬레이션하게 하고, doctor 실행 전 isolated local server를
  시작하도록 고쳤다.
- [x] VERIFY: 수정 후 `corepack pnpm smoke:agent-setup`, `corepack pnpm test`,
  `corepack pnpm lint`, `corepack pnpm pack:dry-run`, `git diff --check`가
  통과했다.
- [x] NEXT: 다음 슬라이스는 first coach loop와 loop-memory approval dogfood를
  이어서 실행해, setup/doctor 이후 사용자가 실제로 copy-ready prompt,
  continuation brief, approved memory까지 도달하는 흐름의 다음 마찰 하나를
  찾는다.
- [x] CHECK: `corepack pnpm dogfood:first-coach-loop`는 isolated server,
  Codex hook capture, `coach --json`, `loop collect --json`,
  `loop brief --json`까지 통과했다.
- [x] CHECK: `corepack pnpm dogfood:loop-memory-approval`은 isolated server,
  Codex hook capture, MCP server, `record_loop_outcome`,
  `propose_loop_memory_candidate`, `record_loop_memory`,
  `propose_instruction_patch`까지 통과했다.
- [x] NEXT: 다음 개선 후보는 web/user-flow 또는 CLI operator wording처럼
  자동 dogfood가 통과해도 실제 첫 사용자 경험에서 "무엇을 다음에 해야 하는지"
  덜 분명한 표면을 하나 고르는 것이다.
- [x] RED: `scripts/browser-e2e.mjs`에 Settings onboarding의 Hook Capture
  waiting 상태가 실행 가능한 다음 행동을 보여야 한다는 assertion을 추가했고,
  기존 `"No hook delivery has been recorded yet."` 문구에서 실패했다.
- [x] GREEN: Settings onboarding pending copy를 행동 지향으로 바꿨다. Hook
  Capture는 `promptlane setup --profile coach` 후 Codex/Claude Code prompt를
  보내라고 안내하고, First prompt stored와 Reuse loop도 다음 행동을 직접 말한다.
- [x] VERIFY: `corepack pnpm dogfood:web-user-flow`, `corepack pnpm ui-patrol`,
  `corepack pnpm lint:types`, `git diff --check`가 통과했다. `ui-patrol`
  screenshot에서 desktop/mobile Settings 문구 wrapping도 확인했다.
- [x] NEXT: 다음 후보는 CLI `setup`/`doctor`/`quality-evidence` 텍스트 중
  web에서 개선한 첫 행동 안내와 불일치하는 문구가 있는지 focused CLI 출력
  snapshot으로 확인하고 하나만 정리한다.
- [x] RED: `doctor claude-code`가 server/token/hook/MCP는 ready지만 아직 hook
  delivery가 없는 첫 사용자 상태에서 MCP elicitation note만 보여주고, 첫 prompt를
  보내라는 next action을 보여주지 않는 focused test를 추가해 실패를 확인했다.
- [x] GREEN: CLI 공통 first-prompt next step을 `src/cli/agent-access.ts`에 두고
  `setup`과 `doctor`가 같은 `"Send one Codex or Claude Code prompt, then run
  promptlane coach."` 문구를 쓰게 했다.
- [x] VERIFY: `corepack pnpm vitest run src/cli/commands/doctor.test.ts
  src/cli/commands/setup.test.ts`, `corepack pnpm lint:types`,
  `corepack pnpm smoke:agent-setup`이 통과했다.
- [x] NEXT: 다음 후보는 `start` guide, README/AGENT-HARNESS, plugin docs의
  first-score path가 web/setup/doctor와 같은 순서로 안내되는지 문서/CLI snapshot
  중심으로 확인하고, 문서만 필요하면 테스트 없이 `rg`와 diff check로 마무리한다.
- [x] CHECK: active quickstart 표면인 README, README.ko, slash setup guide,
  archive empty-state copy를 확인했다. 과거 spec과 일반 compatibility 문구는
  historical/contextual text라 수정 범위에서 제외했다.
- [x] GREEN: quickstart와 empty-state first-score path를 `setup -> one Codex
  or Claude Code prompt -> coach/first score` 순서로 정리했다.
- [x] VERIFY: first-score wording `rg`, `corepack pnpm lint:types`,
  `git diff --check`가 통과했다. 문서-only/copy-only 변경이라 full gate는
  실행하지 않았다.
- [x] NEXT: 다음 후보는 branch의 변경을 PR 가능한 단위로 정리하고, 필요한
  경우 focused package check만 추가로 돌린 뒤 push/PR 단계로 넘기는 것이다.
- [x] CHECK: `codex/promptlane-first-value-dogfood-hardening` 브랜치를 원격에
  push했고 draft PR #511을 열었다. PR 본문에는 이번 branch의 first-value
  onboarding smoke hardening, web/CLI/doc copy alignment, focused validation
  명령을 기록했다.
- [x] NEXT: PR #511의 diff를 리뷰 관점으로 한 번 더 훑어 불필요한 scope creep,
  stale wording, privacy/local-first regression 가능성이 없는지 focused review를
  수행한다.
- [x] REVIEW: PR #511 diff를 코드/harness/web/docs/tasks로 나눠 확인했다. 제품
  코드에는 추가 수정이 필요한 privacy/local-first regression을 찾지 못했고,
  진행 로그의 stale wording만 정리했다.
- [x] NEXT: PR #511을 ready로 전환할지, 또는 draft 상태로 두고 maintainer review를
  기다릴지 결정한다. 전환 전에는 필요한 focused check만 재실행한다.
- [x] VERIFY: PR ready 전 package-focused `corepack pnpm pack:dry-run`과
  `git diff --check`가 통과했다.
- [x] CHECK: PR #511을 ready for review로 전환했다.
- [ ] NEXT: PR #511 리뷰/머지 후 main 기준으로 다음 small slice를 고른다. 후보는
  loop/session/worktree continuation UX, MCP status wording, 또는 quality-evidence
  operator brief 중 가장 직접적인 사용자 마찰이다.

### 판단 기준

- 새 기능은 Codex/Claude Code의 현재 공식 표면(AGENTS.md, skills, hooks,
  MCP, sessions/worktrees)에 붙는 경우에만 추가한다.
- 숨은 provider call, automatic prompt resubmission, raw transcript scraping,
  private app DB 접근, credential proxy/storage는 계속 reject한다.
- 다음 구현 슬라이스는 RED -> GREEN -> focused verify -> local gate 순서로
  진행하고, `promptlane` runtime identity compatibility window를 깨지 않는다.

## 2026-07-06 PromptLane Approved Native Dialog Evidence

- [x] CHECK: PR #507 이후
  `PROMPTLANE_NATIVE_DIALOG_APPROVED=1 corepack pnpm dogfood:mcp-native-dialog-approved`
  를 explicit operator approval 상태에서 다시 실행했고 `approved native dialog
  dogfood passed`로 완료됐다.
- [x] RED: 기존 quality evidence tests/docs는
  `native_dialog_approved_dogfood`를 pending blocker로 유지하도록 고정돼 있어
  실제 승인 실행 완료 상태를 반영할 수 없었다.
- [x] GREEN: native dialog audit, Codex/Claude local integration evidence,
  9.5 quality plan, NEXT_BACKLOG, quality evidence tests를 approved answered
  evidence 기준으로 갱신한다.
- [x] EFFECT: `native_dialog_approved_dogfood`는 완료 evidence로 기록하되,
  향후 반복 실행은 여전히 explicit approval 없이는 금지한다.

### 판단 기준

- `quality-evidence` must be `complete` only when every scorecard row is
  `9.5/10` or higher and the audit includes
  `interaction_status: "answered"`, `approved native dialog dogfood passed`,
  and `PROMPTLANE_NATIVE_DIALOG_APPROVED=1`.
- Native dialog dogfood remains a human-approved local operation, never a CI or
  scheduled automation step.

## 2026-07-06 PromptLane Native Dialog AppleScript Separator

- [x] CHECK: 승인형 native dialog dogfood가 operator approval env를 받은 뒤에도
  `interaction_status: timeout`으로 실패했다. 직접 osascript 진단은 동작했지만
  native fallback이 만든 AppleScript는 `giving up after N return ...`을 한
  statement로 만들어 syntax error를 냈다.
- [x] RED: `src/mcp/ask-clarifying-questions-tool.test.ts`에 macOS native dialog
  script가 `giving up after N`과 `return`을 줄바꿈으로 분리해야 한다는 테스트를
  추가했고 기존 구현에서 실패했다.
- [x] GREEN: `src/mcp/native-elicitation.ts`에서 `display dialog` modifier들은 한
  명령으로 유지하되, 결과 `return`만 별도 AppleScript statement로 분리했다.
- [x] EFFECT: native dialog fallback이 AppleScript syntax error로 즉시 cancel되는
  문제를 제거했다. 이후 explicit operator approval 재실행에서 approved dogfood가
  통과했다.

### 판단 기준

- `native_dialog_approved_dogfood` may be complete only because the approved
  dogfood returned `interaction_status: "answered"`.
- Keep the macOS dialog command local-only and free of prompt archive/storage
  side effects.

## 2026-07-06 PromptLane Native Dialog Operator Brief

- [x] CHECK: 남은 9.5 blocker는 승인형 native dialog dogfood뿐인데,
  일반 `quality-evidence` 출력은 전체 summary가 길어 operator가 실행 전
  확인해야 할 승인 조건, command, completion evidence, guardrail만 바로
  보기 어려웠다.
- [x] RED: `src/cli/commands/quality-evidence.test.ts`가
  `qualityEvidenceForCli({ operatorBrief: true })`에 focused native dialog
  operator brief를 요구했고 기존 formatter가 전체 summary를 반환해 실패했다.
- [x] GREEN: `promptlane quality-evidence --operator-brief`를 추가해 현재
  approval status, command, preconditions, completion evidence, guardrails,
  그리고 dogfood를 실행하지 않는 result boundary를 출력한다.
- [x] GREEN: operator brief에 approval env 없이 실행할 수 있는 refusal
  preflight command와 기대 refusal 조건을 추가했고, 별도
  `dogfood:mcp-native-dialog-refusal` script로 approved dogfood와 이름을
  분리했다.
- [x] EFFECT: 명시 승인 없이는 native dialog를 열지 않는 정책을 유지하면서,
  승인자가 남은 blocker를 안전하게 해소할 때 필요한 실행 brief를 제품 CLI에서
  바로 확인할 수 있다.

### 판단 기준

- `--operator-brief` must not run the native dialog dogfood.
- It must not mark `native_dialog_approved_dogfood` complete.
- Output must stay local-only, raw-free, and free of absolute paths.

## 2026-07-06 PromptLane Native Dialog Approval Evidence Clarity

- [x] CHECK: `quality-evidence` JSON의 recommended next slice는 native dialog
  실행 전 operator approval이 필요하다고 말하지만, direct evidence row는
  상태와 `approved_run_required`만 보여 기본 출력에서 승인 전제 조건이 약했다.
- [x] RED: `src/cli/commands/quality-evidence.test.ts`가
  `evidence.native_dialog_approved_dogfood.approval_status`와
  `preconditions`를 JSON에 요구하고, 텍스트 `External evidence status`에도
  같은 승인 상태/전제 조건이 렌더링되도록 실패했다.
- [x] GREEN: `scripts/quality-95-evidence.mjs`가 direct native-dialog evidence에
  `approval_status=operator_approval_required`와 explicit operator approval
  precondition을 추가하고, CLI formatter가 해당 값을 출력한다.
- [x] EFFECT: 승인 없는 자동 실행은 계속 금지하면서도 남은 9.5 blocker를
  사람이 읽는 기본 evidence 출력과 JSON 파서 양쪽에서 더 명확히 추적한다.

### 판단 기준

- Do not run approved native OS dialog dogfood without explicit operator
  approval.
- Do not mark `native_dialog_approved_dogfood` complete through metadata-only
  clarity improvements.
- Keep external evidence output raw-free and free of local paths.

## 2026-07-06 PromptLane Stale Scheduled UI Patrol Docs Cleanup

- [x] CHECK: CI workflow removal 이후에도 9.5 plan의 현재 blocker 문단이
  scheduled patrol cron과 next expected UTC를 언급해 다음 작업자를 잘못된
  external blocker로 유도할 수 있었다.
- [x] RED: packaging guard가 `## Remaining 9.5 blockers`에서
  `scheduled patrol cron`, `next expected UTC`, `scheduled-event pass`,
  `scheduled \`ui-patrol\`` 문구를 금지하도록 추가했고 기존 문서에서 실패했다.
- [x] GREEN: 현행 9.5 plan/backlog 문구를 local `ui-patrol` 기준으로 정리하고
  남은 external blocker를 native dialog approved dogfood만으로 유지했다.
- [x] EFFECT: CI 제거 후 품질 판단과 다음 작업 큐가 다시 scheduled GitHub
  Actions evidence로 되돌아가지 않는다.

### 판단 기준

- Historical audit entries may mention retired scheduled patrol work.
- Current priority, remaining blocker, and required-slice sections must use
  local `ui-patrol` and `dogfood:web-user-flow`.
- Do not run native dialog dogfood without explicit operator approval.

## 2026-07-06 PromptLane CI Workflow Removal

- [x] CHECK: 사용자가 CI는 없어도 된다고 명시했고, 남은 GitHub Actions 파일은
  scheduled `ui-patrol.yml` 하나였다.
- [x] RED: 기존 quality-evidence 테스트는 `scheduled_ui_patrol` blocker와
  `next_recheck_utc`를 기대해 실패했다.
- [x] GREEN: `.github/workflows/ui-patrol.yml`과
  `scripts/ui-patrol-evidence.mjs`를 제거하고, web operations 품질 기준을
  local `corepack pnpm ui-patrol` plus `dogfood:web-user-flow` 증거로 전환했다.
- [x] EFFECT: PromptLane의 active gate는 local gate와 approval-gated native
  dialog dogfood만 남는다. GitHub Actions schedule 대기는 더 이상 9.5 품질
  blocker가 아니다.

### 판단 기준

- Do not re-add `.github/workflows/*.yml` without a dedicated product decision.
- Do not treat removed scheduled evidence as a remaining quality blocker.
- Keep `ui-patrol` as a local browser verification command.

## 2026-07-06 PromptLane Recommendation Blocked Reasons

- [x] CHECK: `recommended_next_slices` marked external blockers but did not
  expose why they were blocked or when a scheduled retry becomes relevant.
- [x] RED: quality evidence script and CLI tests required
  `scheduled_ui_patrol_cron_review` to include `blocked_reason` plus
  `available_after_utc`, and native dialog dogfood to include
  `blocked_reason=operator_approval_required`.
- [x] GREEN: recommendations now carry those fields and CLI text renders them.
- [x] EFFECT: agents can distinguish waiting for cron from needing operator
  approval without interpreting free-form preconditions.

### 판단 기준

- Do not treat `available_after_utc` as completion evidence.
- Do not run native dialog dogfood without explicit operator approval.
- Keep recommendation output raw-free and free of local paths.

## 2026-07-06 PromptLane Axis Blocker Causes

- [x] CHECK: scorecard axis blockers still said to raise the axis with direct
  evidence, even when `axis_evidence_coverage` already knew the exact remaining
  evidence.
- [x] RED: quality evidence script and CLI tests required axis blockers to
  expose `remaining_evidence` and point `next_action` at
  `native_dialog_approved_dogfood` or `scheduled_ui_patrol`; tests failed with
  generic next actions.
- [x] GREEN: axis blockers now include `remaining_evidence` and text output
  shows the same lower-level evidence before the next action.
- [x] EFFECT: agents can see why an axis is below 9.5 without manually joining
  blocker rows to axis coverage.

### 판단 기준

- Do not mark any axis complete through blocker explanation changes.
- Keep blocker output raw-free and free of local paths.
- Preserve scheduled and native dialog blockers as separate direct evidence.

## 2026-07-06 PromptLane Quality Blocker Next Actions

- [x] CHECK: `promptlane quality-evidence` 기본 텍스트의 Blockers 섹션이
  blocker id/status만 보여 주고 각 blocker의 `next_action`은 JSON에만 있었다.
- [x] RED: CLI focused test가 scheduled `ui-patrol`과 native dialog blocker의
  `next_action=` 줄을 요구했고 기존 formatter에서 실패했다.
- [x] GREEN: 기본 텍스트 출력의 각 blocker 아래에 `next_action=`을 표시한다.
- [x] EFFECT: agents and operators can act from the default CLI summary without
  switching to JSON just to find the next step.

### 판단 기준

- Do not remove or downgrade blockers through text rendering.
- Keep output raw-free and free of local paths.
- Keep JSON output unchanged.

## 2026-07-06 PromptLane UI Patrol Schedule Wait State

- [x] CHECK: `evidence:ui-patrol`이 `pending_no_schedule_run`일 때 다음 cron을
  기다리면 되는지, 이미 예상 cron이 지났는데 schedule run이 없는지 구분하지
  못했다.
- [x] RED: fake `gh`와 deterministic `PROMPTLANE_UI_PATROL_NOW_UTC`를 쓰는
  focused test가 `schedule_wait_state`, `last_expected_schedule_utc`,
  `next_expected_schedule_utc`를 요구했고 기존 스크립트에서 실패했다.
- [x] GREEN: `scripts/ui-patrol-evidence.mjs`가
  `waiting_for_next_cron`/`overdue_no_schedule_run`을 구분하고 CLI text도 해당
  상태를 표시한다.
- [x] EFFECT: scheduled `ui-patrol` evidence remains pending, but operators and
  agents can tell whether to wait for cron or inspect missing schedule delivery.

### 판단 기준

- Do not mark `scheduled_ui_patrol` complete without a real `schedule` run and
  9 png artifact.
- Do not treat workflow_dispatch evidence as scheduled evidence.
- Keep pending output raw-free and free of local paths.

## 2026-07-06 PromptLane General CI Removal

- [x] CHECK: PR/main test workflow가 남아 있어 PR #495에서 GitHub Actions
  환경의 `gh run list` 실패가 제품 변경과 무관한 CI 실패로 드러났다.
- [x] RED: packaging guard는 `.github/workflows/test.yml`이 없어야 한다고
  요구하고, PromptLane 실행 계획 문구는 PR CI 대신 local gate를 요구한다.
- [x] GREEN: 일반 test CI workflow를 삭제하고, release/backlog/quality-plan
  문서를 local gate 기준으로 갱신했다. 예약된 `ui-patrol.yml`은 외부 운영
  증거 수집 workflow라 유지한다.
- [x] EFFECT: 향후 merge/release 판단은 focused tests, `corepack pnpm test`,
  `corepack pnpm lint`, `corepack pnpm build`, `corepack pnpm pack:dry-run`,
  필요한 smoke/dogfood 명령으로 판단한다.

### 판단 기준

- Do not re-add generic PR/main `test.yml` without a dedicated product decision.
- Keep scheduled `ui-patrol.yml` because it proves external browser screenshot
  evidence, not general CI correctness.
- Historical CI evidence may remain as history, but active gates must name the
  local release gate.

## 2026-07-06 PromptLane Quality Evidence External Status Text

- [x] CHECK: `quality-evidence --json` exposed external evidence metadata, but
  human `quality-evidence` text skipped schedule/native evidence status.
- [x] RED: CLI test required an `External evidence status` section with
  scheduled patrol status, workflow, cron, next expected schedule time, and
  native dialog approved-run requirement; the focused test failed while the
  section was absent.
- [x] GREEN: the text formatter now renders external evidence status when the
  JSON summary includes it.
- [x] EFFECT: operators and agents can use the default CLI summary to decide
  when to re-check the remaining external blockers.

### 판단 기준

- Do not remove or downgrade the external blockers through text rendering.
- Keep text output raw-free and free of local paths.
- Keep JSON output unchanged except for data already emitted by the evidence
  script.

## 2026-07-06 PromptLane UI Patrol Next Schedule Evidence

- [x] CHECK: `ui-patrol.yml` still has no `schedule` event, and
  `evidence:ui-patrol` only said to wait for the weekly cron.
- [x] RED: packaging guard required `scripts/ui-patrol-evidence.mjs` and the
  scheduled-evidence docs to mention `next_expected_schedule_utc` and
  `schedule_cron`; the focused test failed while those fields were absent.
- [x] GREEN: pending `evidence:ui-patrol` output now includes the weekly cron
  expression and the next expected UTC schedule time.
- [x] EFFECT: future agents know when to re-check the external schedule event
  instead of rerunning unrelated local UI checks.

### 판단 기준

- Do not treat `next_expected_schedule_utc` as completion evidence.
- Do not mark scheduled `ui-patrol` complete without a real `schedule` event
  and 9-png artifact.
- Keep pending output raw-free and free of local paths.

## 2026-07-06 PromptLane External Evidence Action Criteria

- [x] CHECK: The remaining 9.5 blockers are external, but the recommended next
  slices only exposed command and expected effect.
- [x] RED: quality evidence CLI/script tests required external recommendations
  to include preconditions, completion evidence, and guardrails; tests failed
  while those fields were absent.
- [x] GREEN: `quality-evidence` now emits those fields for scheduled
  `ui-patrol` review and native dialog operator dogfood, and the CLI text
  renders them below each recommendation.
- [x] EFFECT: future operators and agents can identify what must be true before
  running the action, what proves completion, and what must not be substituted.

### 판단 기준

- Do not remove existing blockers through action criteria alone.
- Do not treat manual/readiness evidence as scheduled or approved evidence.
- Keep the structured criteria raw-free and path-free in CLI output.

## 2026-07-06 PromptLane Native Dialog Preflight Evidence

- [x] CHECK: Approved native OS dialog dogfood still requires explicit operator
  approval, so `native_dialog_approved_dogfood` must stay pending.
- [x] RED: quality evidence CLI/script tests required
  `codex_and_claude_code_integration` to include `native_dialog_preflight`
  while still keeping `native_dialog_approved_dogfood` and
  `scorecard_level_below_9_5` as remaining evidence; packaging tests required
  the native dialog audit to ship.
- [x] GREEN: `docs/NATIVE_DIALOG_DOGFOOD_AUDIT_2026-07-05.md` is now packaged
  and `quality-evidence` exposes its no-dialog and elicitation proof as
  `native_dialog_preflight`.
- [x] EFFECT: agents can see native dialog readiness without confusing it with
  operator-approved OS dialog dogfood.

### 판단 기준

- Do not run approved native OS dialog dogfood without explicit operator
  approval.
- Do not use no-dialog fallback evidence as a substitute for answered OS dialog
  evidence.
- Keep preflight evidence visible so future work waits for the right manual
  approval instead of repeating unrelated smoke checks.

## 2026-07-06 PromptLane UI Patrol Schedule Readiness Evidence

- [x] CHECK: The GitHub `ui-patrol` workflow has no successful `schedule` event
  yet, so `scheduled_ui_patrol` must stay pending.
- [x] RED: quality evidence CLI/script tests required
  `web_ui_and_operational_evidence` to include
  `scheduled_ui_patrol_preflight` while still keeping `scheduled_ui_patrol` and
  `scorecard_level_below_9_5` as remaining evidence; packaging tests required
  the readiness ledger to ship.
- [x] GREEN: `docs/UI_PATROL_SCHEDULE_READINESS_2026-07-06.md` records the
  configured cron, latest manual artifact path, and checker boundary, and
  `quality-evidence` exposes it as `scheduled_ui_patrol_preflight`.
- [x] EFFECT: agents can see schedule readiness without confusing it with
  actual cron completion.

### 판단 기준

- Do not mark scheduled `ui-patrol` complete without a real `schedule` event.
- Do not use workflow_dispatch evidence as a substitute for cron evidence.
- Keep readiness evidence visible so future work waits for the right external
  event instead of rerunning unrelated local checks.

## 2026-07-06 PromptLane Codex Claude Evidence Split

- [x] CHECK: Codex/Claude integration still has an external native-dialog
  approved dogfood blocker, but local setup, hooks, MCP, elicitation, first
  loop, and loop-memory dogfood evidence are already repeatable.
- [x] RED: quality evidence CLI/script tests required
  `codex_and_claude_code_integration` to include
  `codex_claude_local_integration_evidence` while still keeping
  `native_dialog_approved_dogfood` and `scorecard_level_below_9_5` as remaining
  evidence; tests failed while only setup smoke and local sweep evidence were
  satisfied.
- [x] GREEN:
  `docs/CODEX_CLAUDE_LOCAL_INTEGRATION_EVIDENCE_2026-07-06.md` records the
  non-operator integration evidence and `quality-evidence` now exposes it as a
  separate satisfied evidence ref.
- [x] EFFECT: Codex/Claude evidence is more accurate without claiming the
  operator-approved native dialog blocker is complete.

### 판단 기준

- Do not run native OS dialog dogfood without explicit operator approval.
- Do not promote Codex/Claude integration to 9.5 while native approved dogfood
  remains pending.
- Keep local setup/hook/MCP/elicitation evidence visible so agents do not rerun
  stale local work unnecessarily.

## 2026-07-06 PromptLane Web Operations Evidence Split

- [x] CHECK: GitHub `ui-patrol.yml` still has only workflow_dispatch runs and
  no real `schedule` event, so scheduled `ui-patrol` cannot be completed.
- [x] RED: quality evidence CLI/script tests required
  `web_ui_and_operational_evidence` to include
  `manual_ui_patrol_artifact_evidence` while still keeping
  `scheduled_ui_patrol` and `scorecard_level_below_9_5` as remaining evidence;
  tests failed while only `web_user_flow_current_main_evidence` was satisfied.
- [x] GREEN: `docs/UI_PATROL_EVIDENCE_2026-07-06.md` records manual
  workflow_dispatch artifact, local UI patrol, and web-user-flow evidence, and
  `quality-evidence` now exposes that non-scheduled web proof separately.
- [x] EFFECT: web operations evidence is more accurate without claiming the
  scheduled cron blocker is complete.

### 판단 기준

- Do not mark scheduled `ui-patrol` complete without a real `schedule` event.
- Do not promote web operations to 9.5 while scheduled evidence remains
  pending.
- Keep manual/local browser evidence visible so agents do not rerun stale local
  work unnecessarily.

## 2026-07-06 PromptLane Product Positioning Evidence

- [x] CHECK: GitHub repository metadata, README copy, package metadata, Codex
  plugin metadata, Claude plugin metadata, product contract, backlog, and goal
  audit all point to PromptLane as prompt improvement first and loop-aware
  continuation second.
- [x] RED: quality evidence CLI/script tests required
  `product_planning_and_positioning` to report `9.5/10`, `meets_target`, and
  `product_positioning_metadata_alignment`; tests failed while the axis still
  reported `9.2/10`.
- [x] GREEN: `docs/PRODUCT_POSITIONING_EVIDENCE_2026-07-06.md` records the
  product-positioning evidence and `quality-evidence` now treats the axis as
  complete when that ledger and metadata stay aligned.
- [x] EFFECT: `quality-evidence` removes the product-planning blocker while
  keeping Codex/Claude operator dogfood, web operations, scheduled `ui-patrol`,
  and native-dialog approved dogfood pending.

### 판단 기준

- Do not rename `promptlane` runtime IDs during the compatibility window.
- Do not re-promote PromptLane as product-facing identity.
- Do not claim full 9.5 completion while external integration and operational
  blockers remain pending.

## 2026-07-06 PromptLane Local Scorecard Axis Promotion

- [x] CHECK: `scorecard_review_candidates` identified four axes whose local
  evidence was present and whose only remaining gap was
  `scorecard_level_below_9_5`.
- [x] RED: quality evidence script and CLI tests required local-first privacy,
  setup/doctor/MCP smoke, loop memory/continuation, and release stability to
  report `9.5/10` and `meets_target`; tests failed while the scorecard still
  reported them below target.
- [x] GREEN: the 9.5 scorecard now promotes those four non-external axes while
  leaving product planning, Codex/Claude operator dogfood, web operations,
  scheduled `ui-patrol`, and native-dialog approved dogfood pending.
- [x] EFFECT: `quality-evidence` now has fewer scorecard blockers and no local
  scorecard-review recommendation ahead of the explicit external blockers.

### 판단 기준

- Do not promote web operations until scheduled `ui-patrol` evidence exists.
- Do not promote Codex/Claude integration until operator-approved native-dialog
  dogfood evidence exists.
- Do not claim full 9.5 completion while product planning or external blockers
  remain pending.

## 2026-07-06 PromptLane Scorecard Review Recommendation

- [x] CHECK: `scorecard_review_candidates` existed, but
  `recommended_next_slices` pointed first at externally blocked scheduled
  `ui-patrol` evidence.
- [x] RED: quality evidence script and CLI tests required the first
  recommendation to be `scorecard_review_candidates` with
  `blocked_by_external_event: false` and
  `promptlane quality-evidence --json`; tests failed while
  `scheduled_ui_patrol_cron_review` was first.
- [x] GREEN: `recommendedNextSlices` now prepends
  `scorecard_review_candidates` when review candidates exist.
- [x] EFFECT: agents can handle local scorecard review before waiting on cron
  or operator-approved native-dialog blockers.

### 판단 기준

- Must not mark quality complete or remove blockers.
- External blockers remain in recommendations after the local review action.
- Output remains local-only and raw-free.

## 2026-07-06 PromptLane Scorecard Review Candidates

- [x] CHECK: `axis_evidence_coverage` separated satisfied evidence from
  remaining gaps, but it did not identify which axes were ready for scorecard
  review versus still blocked by external evidence.
- [x] RED: quality evidence script and CLI tests required
  `scorecard_review_candidates` to include axes whose only remaining gap is
  `scorecard_level_below_9_5` and exclude axes still blocked by
  `scheduled_ui_patrol` or `native_dialog_approved_dogfood`.
- [x] GREEN: `scripts/quality-95-evidence.mjs` now emits
  `scorecard_review_candidates` for local-first privacy, setup/MCP smoke, loop
  memory/continuation, and release stability without marking them complete.
- [x] GREEN: `promptlane quality-evidence` text now renders a
  `Scorecard review candidates` section for human review.

### 판단 기준

- Review candidates must not remove blockers or change `promptlane_95_quality`
  from `pending`.
- Web UI operations and Codex/Claude integration must stay out of review
  candidates while scheduled UI patrol or native-dialog dogfood is pending.
- Candidate output must stay local-only and raw-free.

## 2026-07-06 PromptLane Axis Evidence Coverage

- [x] CHECK: `corepack pnpm --silent evidence:quality` had blockers and
  recommendations, but no machine-readable per-axis evidence coverage.
- [x] RED: quality evidence script and CLI tests required
  `axis_evidence_coverage` with satisfied evidence and remaining evidence for
  local privacy, Codex/Claude integration, and web operations; tests failed
  while the field was missing.
- [x] GREEN: `scripts/quality-95-evidence.mjs` now emits
  `axis_evidence_coverage` with `partial`, `blocked_external`, `missing`, or
  `complete` status without upgrading static scorecard levels.
- [x] GREEN: `promptlane quality-evidence` text now renders an
  `Axis evidence coverage` section so humans can see local proof vs remaining
  external/scorecard gaps without opening JSON.

### 판단 기준

- Coverage must not mark `promptlane_95_quality` complete.
- Coverage must distinguish satisfied local evidence from
  `scheduled_ui_patrol`, `native_dialog_approved_dogfood`, and
  `scorecard_level_below_9_5`.
- Output must remain local-only and raw-free.

## 2026-07-06 PromptLane Local 9.5 Evidence Ledger

- [x] CHECK: `corepack pnpm evidence:ui-patrol` still reports
  `pending_no_schedule_run`, so scheduled UI patrol remains externally blocked.
- [x] RUN: `corepack pnpm smoke:hooks` passed and ended with
  `hook binary smoke passed`.
- [x] RUN: `corepack pnpm smoke:mcp-coach-loop` passed and ended with
  `mcp coach loop smoke passed`.
- [x] RUN: `corepack pnpm dogfood:first-coach-loop` passed and ended with
  `first coach loop dogfood passed`.
- [x] RUN: `corepack pnpm dogfood:loop-memory-approval` passed and ended with
  `loop memory approval dogfood passed`.
- [x] RUN: `corepack pnpm smoke:release` passed and ended with
  `release smoke passed`.
- [x] RUN: `corepack pnpm benchmark -- --json` passed with
  `privacy_leak_count: 0` and `archive_effectiveness_score: 1`.
- [x] RED: packaging guard required
  `docs/LOCAL_95_EVIDENCE_2026-07-06.md` in shipped package files and failed
  before the ledger existed in `package.json#files`.
- [x] GREEN: local 9.5 evidence ledger is packaged and referenced from the
  9.5 plan/backlog without treating scheduled `ui-patrol` or native-dialog
  dogfood as complete.

### 판단 기준

- Native dialog approved dogfood must not run without explicit operator
  approval.
- The local evidence ledger strengthens scorecard evidence but must not make
  `promptlane_95_quality` complete by itself.
- Evidence text must stay raw-free and avoid prompt bodies, raw paths, tokens,
  provider credentials, transcript bodies, and compact summaries.

## 2026-07-06 PromptLane Quality Evidence Forward Recommendations

- [x] CHECK: `promptlane quality-evidence --json` still recommended
  `web_user_flow_current_main_evidence` first even after that recommendation
  had been dogfooded and recorded with `browser e2e passed`.
- [x] RED: quality evidence script and CLI tests expected completed web
  dogfood evidence to be skipped and `privacy_raw_free_regression_sweep` to
  become the first unblocked local recommendation; focused tests failed while
  the script repeated the completed web slice.
- [x] GREEN: `scripts/quality-95-evidence.mjs` now reads the 9.5 ledger for
  completed web-user-flow evidence and skips
  `web_user_flow_current_main_evidence` once that proof exists.
- [x] RUN: after the recommender advanced, `corepack pnpm test -- src/security
  src/hooks src/mcp` passed with 108 test files and 833 tests.
- [x] RUN: after the recommender advanced again, `corepack pnpm
  smoke:agent-setup` passed and ended with
  `promptlane agent setup smoke passed`.
- [x] GREEN: completed local recommendations now also skip
  `privacy_raw_free_regression_sweep` and `codex_claude_setup_smoke_refresh`,
  leaving scheduled UI patrol and native-dialog dogfood as externally blocked
  next recommendations.
- [x] EFFECT: the quality loop now advances toward the next useful local proof
  instead of repeatedly asking agents to run evidence already recorded in the
  default-branch ledger. After this slice, no immediately runnable local
  recommendation remains ahead of the two explicit external blockers.

### 판단 기준

- Completed local evidence may stay in the ledger but must not keep occupying
  the first recommended slot.
- Scheduled `ui-patrol` and native-dialog dogfood must remain separate blockers.
- Recommendation output must remain raw-free and machine-parseable.

## 2026-07-06 PromptLane Recommended Web User-Flow Evidence

- [x] CHECK: `promptlane quality-evidence --json` now recommends
  `web_user_flow_current_main_evidence` first, but that recommendation needed
  proof that it actually leads to executable evidence.
- [x] RUN: `corepack pnpm dogfood:web-user-flow` completed with
  `browser e2e passed` on current main.
- [x] RED: packaging guard required plan/backlog to record
  `corepack pnpm dogfood:web-user-flow` and `browser e2e passed`, and failed
  before the ledger update.
- [x] GREEN: 9.5 plan and backlog now record that the first recommended local
  evidence slice was executed successfully.
- [x] EFFECT: PromptLane's quality evidence recommendation is no longer only
  advice; it has been followed once and converted into tracked current evidence
  without claiming scheduled `ui-patrol` or native-dialog dogfood completion.

### 판단 기준

- This evidence refresh must not mark `promptlane_95_quality` complete.
- Scheduled `ui-patrol` and native-dialog dogfood must remain separate blockers.
- The ledger must show the exact command and `browser e2e passed` result.

## 2026-07-06 PromptLane Quality Evidence Recommended Next Slices

- [x] CHECK: `promptlane quality-evidence`는 9.5 blocker를 보여주지만,
  바로 실행 가능한 다음 작업과 cron/명시 승인처럼 외부 조건이 필요한 작업을
  구분하지 않았다.
- [x] RED: quality evidence JSON에 `recommended_next_slices`가 없고 CLI text에
  recommended next slices 섹션이 없어 focused tests가 실패해야 한다.
- [x] GREEN: quality evidence JSON과 CLI text가
  `web_user_flow_current_main_evidence`를 첫 번째 unblocked local evidence
  action으로 제안하고, scheduled UI patrol/native dialog dogfood는
  `blocked_by_external_event: true`로 분리한다.
- [x] EFFECT: future agents can keep improving toward 9.5 without pretending
  externally gated evidence is complete or guessing the next useful local slice.

### 판단 기준

- Recommended slices must not mark scheduled `ui-patrol` or native-dialog
  dogfood complete.
- The first recommendation must be locally runnable and evidence-producing.
- Text output must stay raw-free and avoid prompt bodies, raw paths, and tokens.

## 2026-07-06 PromptLane Quality Evidence CLI Ledger Refresh

- [x] CHECK: PR #478로 installed CLI `promptlane quality-evidence`가
  landing됐지만 9.5 quality plan/backlog ledger는 아직 PR #478과 latest
  main CI run `28753458359`를 추적하지 않았다.
- [x] RED: packaging guard가 9.5 plan과 backlog에서 PR #478,
  `28753458359`, `promptlane quality-evidence --json`, and
  `promptlane quality-evidence --require-complete`를 찾지 못해 실패해야
  한다.
- [x] GREEN: 9.5 plan과 backlog가 installed CLI quality gate evidence와
  latest main CI run `28753458359`를 반영한다.
- [x] EFFECT: future agents can judge 9.5 completion from the product CLI and
  current default-branch evidence instead of relying on stale ledger text or a
  repo-only npm script.

### 판단 기준

- This slice must not mark scheduled `ui-patrol` or native-dialog dogfood
  complete.
- The ledger must keep `--require-complete` as a fail-closed gate while direct
  blockers or scorecard axes remain pending.
- The guard must fail if future docs drop PR #478 or the current main CI
  evidence from the 9.5 quality ledger.

## 2026-07-06 PromptLane 9.5 Quality Evidence Summary

- [x] CHECK: scheduled UI patrol and native OS dialog evidence are still
  separate blockers, but the 9.5 completion judgment was spread across plan,
  backlog, audit, and manual commands.
- [x] RED: behavior/package guards fail unless `scripts/quality-95-evidence.mjs`,
  package script `evidence:quality`, docs, and release/package lists expose
  `corepack pnpm evidence:quality`.
- [x] GREEN: `evidence:quality` emits `promptlane_95_quality` JSON with
  `scheduled_ui_patrol` and `native_dialog_approved_dogfood` blockers instead
  of claiming 9.5 completion.
- [x] EFFECT: future agents and release checks can see why the long-running
  goal is still pending without treating passing tests as full product proof.
- [x] GREEN: `scorecard_axes` now lists all seven 9.5 scorecard axes from the
  plan and marks axes below 9.5 as `below_target`.
- [x] GREEN: `--require-complete` keeps JSON output available but exits nonzero
  while `promptlane_95_quality.status` is not `complete`.
- [x] GREEN: machine parsers can use
  `corepack pnpm --silent evidence:quality` or
  `node scripts/quality-95-evidence.mjs` for clean JSON without pnpm banners.
- [x] GREEN: installed CLI users can run `promptlane quality-evidence`,
  `promptlane quality-evidence --json`, and
  `promptlane quality-evidence --require-complete`.

### 판단 기준

- The command must not open a native OS dialog.
- The command must not mark native dialog dogfood complete from MCP
  elicitation-smoke `answered` evidence alone.
- The command must keep 9.5 status `pending` while either scheduled UI patrol
  or operator-approved native dialog evidence is missing.
- The command must keep 9.5 status `pending` while any scorecard axis is below
  its 9.5 target.
- Release/goal-completion automation can use
  `corepack pnpm evidence:quality -- --require-complete` as a fail-closed gate.
- JSON-consuming automation should use the silent pnpm invocation or direct node
  script, not the noisy package-manager wrapper output.

## 2026-07-06 PromptLane Scheduled UI Patrol Evidence Checker

- [x] CHECK: GitHub `ui-patrol.yml` workflow history still has no `schedule`
  event, so scheduled evidence must remain pending even though manual
  workflow_dispatch artifact evidence exists.
- [x] RED: packaging guard fails unless `scripts/ui-patrol-evidence.mjs`,
  package script `evidence:ui-patrol`, and docs mention
  `corepack pnpm evidence:ui-patrol`.
- [x] GREEN: evidence checker reports `pending_no_schedule_run` when no
  scheduled run exists, and verifies `ui-patrol-screenshots` plus 9 png
  artifacts before returning `complete`.
- [x] EFFECT: scheduled UI patrol blocker is repeatable and machine-readable
  without pretending the manual workflow_dispatch artifact is scheduled
  evidence.

### 판단 기준

- Checker must not mark completion unless a real `schedule` event exists.
- Checker must require `ui-patrol-screenshots` and 9 png files for completion.
- Docs must keep scheduled `ui-patrol` evidence pending until
  `corepack pnpm evidence:ui-patrol` reports `complete`.

## 2026-07-06 PromptLane MCP Coach Effectiveness Smoke

- [x] CHECK: `coach_prompt` agent brief는 effectiveness evidence를 포함하지만
  반복 가능한 `smoke:mcp-coach-loop`는 아직 실제 MCP stdio 서버에서 그
  one-call path를 검증하지 않았다.
- [x] RED: smoke assertion이 `coach_prompt` agent brief의
  `Effectiveness evidence`, unmeasured prompt review action, safe evidence
  refs를 요구하지만 `coach_prompt`를 호출하지 않아 실패해야 한다.
- [x] GREEN: smoke가 measured prompt와 unmeasured prompt를 모두 seed하고,
  MCP `coach_prompt`를 호출해 raw-free effectiveness guidance를 검증한다.
- [x] EFFECT: Codex/Claude Code 통합 evidence가 `score_prompt` 개별 prompt
  효과에서 멈추지 않고 기본 one-call coach workflow까지 포함한다.

### 판단 기준

- Smoke must run through the real MCP stdio server, not a direct function call.
- The seeded archive must include at least one linked passed outcome and one
  unmeasured prompt.
- The agent brief must not expose prompt bodies, raw data-dir paths, transcript
  paths, or token-like secrets.

## 2026-07-06 PromptLane Coach Prompt Effectiveness Brief

- [x] CHECK: `score_prompt`, archive score, web, benchmark에는 효과 evidence가
  있지만 기본 one-call `coach_prompt`의 `agent_brief`는
  `effectiveness_summary`를 다음 행동 판단에 반영하지 않았다.
- [x] RED: MCP `coachPromptTool` 테스트가 linked passed loop outcome이 있는
  archive에서도 `agent_brief.summary`의 `Effectiveness evidence`와
  unmeasured prompt review action을 찾지 못해 실패해야 한다.
- [x] GREEN: `coach_prompt` agent brief가 measured/unmeasured coverage,
  linked outcomes, tests run, safe evidence refs, review-first next action을
  포함한다.
- [x] EFFECT: Codex/Claude Code가 one-call coach result만 봐도 prompt
  improvement를 실제 효과로 주장하기 전에 어떤 prompt가 아직 미측정인지
  확인할 수 있다.

### 판단 기준

- Brief must use the existing archive `effectiveness_summary`; no extra
  storage or network call.
- Brief must not expose prompt bodies, raw local paths, or token-like secrets.
- Benchmark `coach_prompt_actionability` must require effectiveness evidence in
  the one-call agent brief.

## 2026-07-06 PromptLane Archive Effectiveness Benchmark Ledger

- [x] CHECK: PR #469로 `archive_effectiveness_score` benchmark hard gate는
  main에 들어갔지만, 9.5 plan/backlog ledger가 아직 그 효과 측정 evidence를
  추적하지 않아 다음 작업자가 stale evidence로 판단할 수 있었다.
- [x] RED: packaging guard가 9.5 plan과 backlog에서 PR #469,
  `archive_effectiveness_score`, main CI run `28751693022`,
  `privacy_leak_count: 0`를 찾지 못해 실패해야 한다.
- [x] GREEN: 9.5 plan과 backlog가 benchmark JSON 결과, raw-free
  `effectiveness_summary`, linked passed loop outcome, Node 22/24 main CI
  evidence를 함께 기록한다.
- [x] EFFECT: PromptLane의 효과 판단은 CLI/MCP/Web summary에서 끝나지
  않고, `corepack pnpm benchmark -- --json` hard gate로 회귀를 잡는다는
  기준이 장기 품질 장부에 남는다.

### 판단 기준

- Evidence ledger must include PR #469, `archive_effectiveness_score`,
  main CI run `28751693022`, and `privacy_leak_count: 0`.
- This slice must not claim scheduled `ui-patrol` or native-dialog dogfood is
  complete.
- The guard must fail if future docs remove the benchmark effectiveness
  evidence from the 9.5 ledger.

## 2026-07-06 PromptLane Web Archive Effectiveness Summary

- [x] CHECK: archive-level `effectiveness_summary`는 CLI/MCP/API에
  연결됐지만, Dashboard의 Archive score review에는 아직 보이지 않아 실제
  사용자가 웹에서 효과 판단을 하기 어려웠다.
- [x] RED: browser E2E가 `Effectiveness evidence`, measured/unmeasured
  coverage, next action을 Dashboard에서 찾지 못해 실패해야 한다.
- [x] GREEN: Archive score review now renders measured vs unmeasured prompt
  effectiveness, proven/mixed verdict counts, linked outcomes, tests run, safe
  evidence refs, and review-first next action.
- [x] EFFECT: web users can judge whether archive prompt improvements are
  backed by actual loop outcomes without opening CLI JSON, MCP output, or one
  prompt detail page.

### 판단 기준

- The UI must use the existing archive score report payload; no extra network
  waterfall.
- The block must remain compact and wrap-safe in the existing dashboard grid.
- Browser E2E must prove the evidence block is visible and raw-free.

## 2026-07-06 PromptLane Archive Effectiveness Summary

- [x] CHECK: 개별 prompt `effectiveness` verdict는 CLI/MCP/Web에 있지만,
  최근 archive 전체가 실제 loop outcome으로 검증됐는지 한 번에 판단하는
  summary surface가 약했다.
- [x] RED: `createArchiveScoreReport()`가 `effectiveness_summary`를 반환하지
  않아 archive-level 효과 집계 테스트가 실패해야 한다.
- [x] RED: `promptlane score` 텍스트 출력이 `Effectiveness evidence`
  섹션을 보여주지 않아 CLI 테스트가 실패해야 한다.
- [x] RED: MCP `score_prompt_archive` output schema가
  `effectiveness_summary`를 선언하지 않아 schema drift 테스트가 실패해야
  한다.
- [x] GREEN: archive score report, CLI JSON/text, server score API, MCP
  archive tool, and web API type now share the same raw-free
  `effectiveness_summary`.
- [x] EFFECT: PromptLane can now judge whether prompt improvement is backed by
  actual linked loop outcomes across the recent archive, not only by predicted
  prompt score or one prompt detail page.

### 판단 기준

- Summary counts measured vs unmeasured prompts, proven/mixed/unproven
  verdicts, linked outcomes, passing/failing outcomes, tests run, and safe
  evidence refs.
- Prompt bodies, raw local paths, and token-like evidence refs must not appear
  in the summary.
- A mixed outcome must produce a review-first next action instead of claiming
  improvement is proven.

## 2026-07-06 PromptLane Fresh Web User-Flow Evidence

- [x] CHECK: scheduled `ui-patrol` still has no `schedule` event, so web
  operations cannot be promoted on scheduled artifact evidence.
- [x] RED: packaging guard fails unless the web dogfood evidence doc, backlog,
  and 9.5 plan include fresh current-main web user-flow evidence after PR #465.
- [x] GREEN: `docs/DOGFOOD_WEB_USER_FLOW_2026-07-05.md`, backlog, and 9.5 plan
  now record the current-main `dogfood:web-user-flow` pass.
- [x] EFFECT: web operations evidence is refreshed from an executable browser
  user-flow instead of relying only on the earlier PR #429/#430 evidence.

### 판단 기준

- The dogfood must use isolated local data and must not touch the user's real
  archive.
- Browser-visible output must remain raw-free.
- Scheduled `ui-patrol` remains pending until a real `schedule` event exists.

## 2026-07-06 PromptLane Release Stability Evidence

- [x] CHECK: GitHub `ui-patrol.yml` still has no `schedule` event, so scheduled
  artifact evidence cannot be marked complete.
- [x] RED: packaging guard fails unless
  `docs/RELEASE_STABILITY_EVIDENCE_2026-07-06.md` is shipped, linked from the
  9.5 plan/backlog, and includes current `smoke:release`, `pack:dry-run`, main
  CI, and privacy evidence.
- [x] GREEN: release-stability evidence doc, package files, 9.5 quality plan,
  and backlog now record current local-first release path evidence.
- [x] EFFECT: release stability is judged from current executable smoke and CI
  evidence instead of stale ledger text, while scheduled `ui-patrol` and
  native-dialog blockers remain separate.
- [x] VERIFY: focused packaging guard, full local gate, PR CI, latest main CI
  run `28750611089`, and branch prune all pass.
- [x] INTEGRATE: PR #464 merged the release stability evidence doc and package
  manifest coverage into main.

### 판단 기준

- Release evidence must remain raw-free and must not claim scheduled
  `ui-patrol` completion without a real `schedule` event.
- `smoke:release` must exercise isolated local CLI/server/storage/export/delete
  behavior, not the user's real PromptLane archive.
- This slice must not mark the long-running goal complete.

## 2026-07-06 PromptLane Prompt Effectiveness Verdict

- [x] CHECK: `expected_impact`와 `loop_outcomes`는 각각 보이지만, Codex/Claude Code와 web 사용자가 실제 효과를 매번 수동으로 해석해야 했다.
- [x] RED: storage `getPrompt()`가 linked outcome에서 `effectiveness` verdict를 반환하지 않아 실패해야 한다.
- [x] RED: `promptlane show --json`이 같은 `effectiveness` verdict를 포함하지 않아 실패해야 한다.
- [x] RED: web prompt detail이 `Effectiveness: proven`과 raw-free verdict summary를 렌더링하지 않아 실패해야 한다.
- [x] GREEN: storage detail, CLI JSON, web detail이 같은 raw-free effectiveness verdict를 공유한다.
- [x] EFFECT: 예상 개선량과 실제 loop outcome 사이를 사용자가 직접 추론하지 않아도, passed outcome/test/ref 기반으로 prompt 효과를 빠르게 판단할 수 있다.
- [x] VERIFY: focused tests, `corepack pnpm e2e:browser`, `corepack pnpm ui-patrol`, full local gate, PR CI, latest main CI run `28749214218`, and branch prune all pass.
- [x] INTEGRATE: PR #457이 CI `test (22)`/`test (24)` 통과 후 merge되었고 branch prune까지 확인됐다.

### 판단 기준

- `effectiveness`는 raw-free `loop_outcomes`에서만 계산하고 prompt body, raw local path, token-like secret을 노출하지 않는다.
- verdict는 자동 승인이나 외부 LLM 판단이 아니라 local evidence summary다.
- scheduled `ui-patrol`과 approval-gated native dialog dogfood는 별도 blocker로 유지한다.

## 2026-07-06 PromptLane CLI Prompt Outcome Evidence

- [x] CHECK: web/API prompt detail은 actual loop outcome evidence를 보여주지만, Codex/Claude Code가 자주 쓰는 `promptlane show --json`은 같은 효과 증거를 직접 볼 수 없었다.
- [x] RED: storage `getPrompt()`가 linked loop outcome evidence를 반환하지 않아 실패해야 한다.
- [x] RED: `promptlane show --json`이 `loop_outcomes`를 포함하지 않아 실패해야 한다.
- [x] GREEN: storage prompt detail이 raw-free `loop_outcomes`를 포함하고, CLI `show --json`도 같은 필드를 반환한다.
- [x] EFFECT: agent-native CLI 흐름에서도 expected-impact prediction과 actual loop outcome evidence를 함께 평가할 수 있다.
- [x] VERIFY: focused tests, `corepack pnpm e2e:browser`, full local gate, PR CI, latest main CI run `28748664657`, and branch prune all pass.
- [x] INTEGRATE: PR #455가 CI `test (22)`/`test (24)` 통과 후 merge되었고 branch prune까지 확인됐다.

### 판단 기준

- CLI JSON은 기존 raw `cwd` compatibility를 유지하되, `loop_outcomes` summary/ref는 raw path와 token-like secret을 노출하지 않는다.
- web route와 CLI가 서로 다른 outcome derivation을 갖지 않도록 storage detail contract를 공유한다.
- scheduled `ui-patrol`과 approval-gated native dialog dogfood는 별도 blocker로 유지한다.

## 2026-07-06 PromptLane Prompt Outcome Effectiveness Evidence

- [x] CHECK: `expected_impact`는 CLI/MCP/Web에 보이지만, prompt detail에서 해당 prompt가 실제 loop outcome으로 이어졌는지 확인하는 사후 evidence가 없었다.
- [x] RED: prompt detail API test가 linked loop snapshot outcome을 `loop_outcomes`로 반환하지 않아 실패해야 한다.
- [x] RED: PromptDetailView SSR test가 `Outcome evidence`, outcome summary, status, tests count, PR/CI refs 부재로 실패해야 한다.
- [x] GREEN: prompt detail API가 해당 prompt id를 포함한 loop snapshot outcome을 raw-free `loop_outcomes`로 반환하고, web detail이 outcome evidence panel을 렌더링한다.
- [x] EFFECT: PromptLane이 개선안의 예상 효과만 보여주는 상태에서 벗어나, 같은 prompt가 실제 loop 결과와 어떤 evidence로 연결됐는지 확인할 수 있게 한다.
- [x] VERIFY: focused tests, `corepack pnpm e2e:browser`, full local gate, PR CI, latest main CI run `28748310489`, and branch prune all pass.
- [x] INTEGRATE: PR #453이 CI `test (22)`/`test (24)` 통과 후 merge되었고 branch prune까지 확인됐다.

### 판단 기준

- outcome evidence는 prompt body, raw local path, token-like secret을 노출하지 않는다.
- 효과 판단은 expected-impact prediction과 actual loop outcome evidence를 함께 보게 해야 한다.
- scheduled `ui-patrol`과 approval-gated native dialog dogfood는 별도 blocker로 유지한다.

## 2026-07-06 PromptLane Expected Impact 9.5 Ledger Refresh

- [x] CHECK: PR #447-#450으로 expected-impact 기능과 web 증거가 landing 되었지만 9.5 quality plan과 backlog Evidence Ledger가 PR #434/latest main CI `28745224451` 상태에 머물렀다.
- [x] RED: packaging guard가 9.5 plan에 PR #447, PR #449, PR #450, `expected_impact`, latest main CI run `28747682131`이 없어서 실패해야 한다.
- [x] GREEN: 9.5 quality plan과 backlog가 expected-impact CLI/MCP/Web evidence, browser E2E/ui-patrol assertion, latest main CI를 반영한다.
- [x] EFFECT: 9.5 scorecard가 실제 제품 효과 증거를 따라가며, 다음 작업자가 stale score/evidence로 완료 판단하지 못하게 한다.
- [x] VERIFY: focused packaging guard, full local gate, PR CI, latest main CI run `28747890493`, and branch prune all pass.
- [x] INTEGRATE: PR #451이 CI `test (22)`/`test (24)` 통과 후 merge되었고 branch prune까지 확인됐다.

### 판단 기준

- evidence ledger must track measurable before/after prompt-improvement evidence, not only feature names.
- scheduled `ui-patrol` remains pending until a real `schedule` event exists.
- this slice must not claim the long-running goal is complete.

## 2026-07-06 PromptLane Web Expected Impact Evidence

- [x] CHECK: `improve` expected impact는 CLI/MCP에 노출되지만 web prompt detail의 current improvement draft에는 원문 점수, 개선안 점수, delta가 보이지 않았다.
- [x] RED: `PromptDetailView` SSR test가 `Expected impact`, `Original score`, `Improved score`, positive point delta 부재로 실패해야 한다.
- [x] GREEN: web prompt detail coach panel이 expected impact metric row를 렌더링한다.
- [x] EFFECT: 웹 사용자가 개선안을 복사/저장하기 전에 로컬 analyzer 기준 원문 대비 예상 개선량을 직접 판단할 수 있다.
- [x] VERIFY: focused web tests, `corepack pnpm ui-patrol`, full local gate, PR CI, latest main CI run `28747568864`, and branch prune all pass.
- [x] INTEGRATE: PR #449가 CI `test (22)`/`test (24)` 통과 후 merge되었고 branch prune까지 확인됐다.

### 판단 기준

- expected impact is advisory local-rules evidence, not external LLM judgment or automatic approval.
- web UI must expose numeric improvement evidence without exposing prompt bodies outside the existing comparison panel.
- layout must remain stable on desktop and mobile patrol viewports.

## 2026-07-06 PromptLane Improve Expected Impact Evidence

- [x] CHECK: `improve`가 approval-ready draft를 만들지만 사용자가 “정말 나아졌는지” 판단할 수 있는 원문 점수, 개선안 예상 점수, delta를 직접 보여주지 않았다.
- [x] RED: focused improve test가 `expected_impact` 부재로 실패하고, CLI human output test가 `Expected impact` 섹션 부재로 실패해야 한다.
- [x] GREEN: `PromptImprovement`가 로컬 deterministic analyzer 기반 `expected_impact`를 포함하고, CLI human output이 score before/after/delta와 changed axis count를 출력한다.
- [x] EFFECT: 같은 테스트가 개선안이 원문보다 높은 점수를 갖고 delta가 양수임을 검증하며, MCP 결과는 prompt body, raw path, secret을 노출하지 않는다.
- [x] VERIFY: focused tests, full local gate, PR CI, latest main CI run `28747232481`, and branch prune all pass.
- [x] INTEGRATE: PR #447가 CI `test (22)`/`test (24)` 통과 후 merge되었고 branch prune까지 확인됐다.

### 판단 기준

- effectiveness means the user can compare the weak original prompt with the proposed draft using safe numeric metadata.
- expected impact is advisory local-rules evidence, not an external LLM judgment or automatic approval.
- score metadata must not expose raw prompt bodies, raw paths, provider credentials, tokens, or transcript content.

## 2026-07-06 Codex Doctor Hook Count Evidence

- [x] CHECK: `doctor codex` now detects duplicate hooks and proves `install-hook codex` repairs them, but JSON/plain output only exposes `duplicateHooks=true` and not the safe handler count needed to compare before/after state.
- [x] RED: focused doctor test must fail until duplicate Codex hook results expose `hookCount=2`, repaired results expose `hookCount=1`, and plain output says `duplicate hooks found (2 handlers)`.
- [x] GREEN: doctor Codex settings include a raw-free hook count and plain duplicate output shows the handler count.
- [x] EFFECT: the same test proves the user can compare duplicate count before repair and ready state after repair without seeing raw paths, prompts, or tokens.
- [x] VERIFY: focused doctor test, full local gate, PR CI, latest main CI run `28746879799`, and branch prune all pass.
- [x] INTEGRATE: PR #445가 CI `test (22)`/`test (24)` 통과 후 merge되었고 branch prune까지 확인됐다.

### 판단 기준

- effectiveness means the diagnostic output helps verify whether the duplicate hook issue was actually reduced.
- count output must be safe numeric metadata only.
- no automatic config mutation happens from doctor.

## 2026-07-06 Codex Duplicate Hook Recovery Copy

- [x] CHECK: `install-hook codex` already deduplicates same-file PromptLane hooks, but `doctor codex` still gives generic duplicate removal guidance that is less useful for same-file duplicate `UserPromptSubmit` output.
- [x] RED: focused doctor test must fail until duplicate Codex hook next steps tell the user to rerun `promptlane install-hook codex` for same-file normalization.
- [x] GREEN: doctor duplicate hook recovery copy points to the idempotent install-hook cleanup path while preserving manual user/project duplicate guidance.
- [x] EFFECT: the focused doctor test proves rerunning `install-hook codex` removes same-file duplicate `UserPromptSubmit` handlers and returns `doctor codex` to ready state.
- [x] VERIFY: focused doctor test, full local gate, PR CI, latest main CI run `28746602316`, and branch prune all pass.
- [x] INTEGRATE: PR #443가 CI `test (22)`/`test (24)` 통과 후 merge되었고 branch prune까지 확인됐다.

### 판단 기준

- `doctor codex` should explain how to stop duplicate `UserPromptSubmit` hook context output.
- recovery copy should remain raw-free and should not expose local paths, prompt text, or tokens.
- no automatic config mutation happens from doctor.

## 2026-07-06 Codex Same-File Duplicate Hook Doctor

- [x] CHECK: `doctor codex` detects duplicate PromptLane hooks across user/project sources, but same-file duplicate `UserPromptSubmit` hook groups can still create duplicate hook context output without being diagnosed.
- [x] RED: focused doctor test must fail when one Codex hooks file contains two PromptLane `UserPromptSubmit` hook groups and `duplicateHooks` remains false.
- [x] GREEN: doctor detects same-file duplicate PromptLane Codex `UserPromptSubmit` hooks while preserving existing user/project duplicate detection.
- [x] VERIFY: focused doctor test, full local gate, PR CI, latest main CI run `28746274401`, and branch prune all pass.
- [x] INTEGRATE: PR #441가 CI `test (22)`/`test (24)` 통과 후 merge되었고 branch prune까지 확인됐다.

### 판단 기준

- duplicate hook output should be diagnosable from `promptlane doctor codex`.
- this slice should not mutate user config automatically or remove hooks without explicit user action.
- no raw prompt, path, token, or transcript content is introduced into doctor output.

## 2026-07-06 PromptLane Loop Snapshot MCP Branding

- [x] CHECK: `docs/LOOP-SNAPSHOT-SCHEMA.md` is an active loop snapshot/privacy contract, but its MCP section still described the surface as `PromptLane MCP tools`.
- [x] RED: packaging guard must fail unless the active schema says `PromptLane MCP loop tools may expose snapshot-derived status and briefs` and no longer says `PromptLane MCP tools may expose`.
- [x] GREEN: active loop snapshot MCP surface wording now uses PromptLane while preserving `promptlane` runtime IDs and legacy `promptlane` compatibility boundaries.
- [x] VERIFY: focused packaging guard, full local gate, PR CI, latest main CI run `28745956945`, and branch prune all pass.
- [x] INTEGRATE: PR #439가 CI `test (22)`/`test (24)` 통과 후 merge되었고 branch prune까지 확인됐다.

### 판단 기준

- active product/runtime contract docs use PromptLane for product-facing surfaces.
- `PromptLane` remains allowed in rejected-name history, legacy compatibility docs, and compatibility alias surfaces only.
- this slice does not rename package, CLI, slash namespace, MCP server name, or existing compatibility ids.

## 2026-07-06 PromptLane Reuse Audit Branding Drift

- [x] CHECK: scheduled `ui-patrol` has not fired yet, and `docs/REUSE_LOOP_AUDIT_2026-07-05.md` still described the tested server as a local PromptLane web server.
- [x] RED: focused packaging guard must fail unless the reuse audit says `local PromptLane web server` and no longer contains `local PromptLane`.
- [x] GREEN: reuse audit path-tested copy now says `local PromptLane web server`.
- [x] VERIFY: focused packaging guard, full local gate, PR CI, latest main CI run `28745662071`, and branch prune all pass.
- [x] INTEGRATE: PR #437이 CI `test (22)`/`test (24)` 통과 후 merge되었고 branch prune까지 확인됐다.

### 판단 기준

- active audit evidence should use PromptLane for product-facing surfaces.
- `promptlane` remains allowed only as an explicit compatibility alias or legacy tool name.
- naming cleanup must not rewrite historical command ids, package names, MCP tool ids, or compatibility docs.

## 2026-07-06 PromptLane Release Stability Backlog Refresh

- [x] CHECK: scheduled `ui-patrol` has not fired yet because the 2026-07-06 15:17 KST cron time has not arrived, while `docs/NEXT_BACKLOG.md` and the 9.5 quality plan still carried stale release-stability follow-up wording.
- [x] RED: packaging guard must fail unless backlog and 9.5 plan include PR #425, PR #427, PR #433, PR #434, latest main CI run `28745224451`, and no stale action-runtime or better-sqlite3 warning follow-up text.
- [x] GREEN: backlog and 9.5 quality plan now record the closed release-stability evidence while keeping scheduled `ui-patrol` artifact evidence pending.
- [x] VERIFY: focused packaging guard, full local gate, PR CI, latest main CI run `28745397311`, and branch prune all pass.
- [x] INTEGRATE: PR #435가 CI `test (22)`/`test (24)` 통과 후 merge되었고 branch prune까지 확인됐다.

### 판단 기준

- release-stability backlog must describe current evidence, not already-closed follow-ups.
- scheduled `ui-patrol` evidence remains pending until a real `schedule` event and artifact exist.
- completed warning cleanup must stay guarded by tests, workflow metadata, dependency versions, and latest main CI evidence.

## 2026-07-06 PromptLane UI Patrol Action Runtime Cleanup

- [x] CHECK: `ui-patrol.yml` has a real Monday cron (`17 6 * * 1`), but as of 2026-07-06 00:04 KST the scheduled run has not fired yet; the workflow still used `pnpm/action-setup@v4`.
- [x] RED: packaging guard must fail while the scheduled UI patrol workflow uses `pnpm/action-setup@v4` instead of Node 24 compatible `pnpm/action-setup@v6`.
- [x] GREEN: `.github/workflows/ui-patrol.yml` now uses `pnpm/action-setup@v6`, matching the latest verified action major whose metadata uses `runs.using: node24`.
- [x] VERIFY: focused packaging guard, full local gate, PR CI, latest main CI run `28745108598`, and branch prune all pass.
- [x] INTEGRATE: PR #433이 CI `test (22)`/`test (24)` 통과 후 merge되었고 branch prune까지 확인됐다.

### 판단 기준

- scheduled `ui-patrol` evidence remains pending until a real `schedule` event and artifact exist.
- action runtime cleanup is release/web reliability work because scheduled evidence should not reintroduce Node 20 action annotations.
- workflow action major updates must be guarded so `ui-patrol.yml` does not drift behind the main test workflow.

## 2026-07-05 PromptLane 9.5 Web Evidence Ledger Refresh

- [x] CHECK: 9.5 quality plan Evidence Ledger still referenced the stale "after PR #422" main CI line and did not pin PR #429/#430 or latest main CI run `28744698708`.
- [x] RED: packaging guard must fail unless the 9.5 quality plan includes PR #429, PR #430, `dogfood:web-user-flow`, `docs/DOGFOOD_WEB_USER_FLOW_2026-07-05.md`, and latest main CI run `28744698708`.
- [x] GREEN: the 9.5 quality plan now records PR #429 web user-flow evidence, PR #430 close-log integration, and latest main CI run `28744698708`.
- [x] VERIFY: focused packaging guard, full local gate, PR CI, latest main CI run `28744839139`, and branch prune all pass.
- [x] INTEGRATE: PR #431이 CI `test (22)`/`test (24)` 통과 후 merge되었고 branch prune까지 확인됐다.

### 판단 기준

- 9.5 Evidence Ledger는 stale PR/CI 문구를 방치하지 않는다.
- web dogfood evidence는 PR 번호, command evidence, CI evidence가 함께 추적되어야 한다.
- scheduled `ui-patrol`과 native OS ask UI dogfood는 별도 blocker로 유지한다.

## 2026-07-05 PromptLane Web User-Flow Dogfood Evidence

- [x] CHECK: 9.5 web operations blocker still needed repeatable fresh user-flow evidence beyond scheduled `ui-patrol`, while `scripts/browser-e2e.mjs` already exercises the real archive/detail/dashboard/coach/projects/mcp/exports/settings/mobile flow.
- [x] RED: package script, shipped evidence doc, harness/package docs, backlog, and 9.5 plan must link `dogfood:web-user-flow`, or packaging guard fails.
- [x] GREEN: `dogfood:web-user-flow` now aliases `e2e:browser`, and `docs/DOGFOOD_WEB_USER_FLOW_2026-07-05.md` records the repeatable local web user-flow evidence lane.
- [x] VERIFY: focused packaging guard, `corepack pnpm dogfood:web-user-flow`, full local gate, PR CI, latest main CI run `28744584511`, and branch prune all pass.
- [x] INTEGRATE: PR #429가 CI `test (22)`/`test (24)` 통과 후 merge되었고 branch prune까지 확인됐다.

### 판단 기준

- scheduled `ui-patrol` evidence remains separate because it requires a real `schedule` event.
- web user-flow evidence must be replayable locally and in CI without real provider credentials, real prompt archives, or external LLM calls.
- screenshots are evidence only when produced by a real browser run; docs must not invent screenshots.

## 2026-07-05 Better SQLite Node 24 Install Warning Cleanup

- [x] CHECK: latest main CI after PR #426 passed but Node 24 install logs still showed `better-sqlite3` triggering `prebuild-install@7.1.3` `fs.R_OK` deprecation warnings.
- [x] RED: packaging guard must fail while `better-sqlite3` remains on 11.x and no `prebuild-install@7.1.3` patch replaces deprecated permission constants.
- [x] GREEN: `better-sqlite3` now targets the npm-published 12.x line and `prebuild-install@7.1.3` is patched through pnpm to use `fs.constants.R_OK` and `fs.constants.W_OK`.
- [x] VERIFY: `NODE_OPTIONS=--trace-deprecation corepack pnpm rebuild better-sqlite3` completes without `fs.R_OK`, `DEP0176`, or `DeprecationWarning` output.
- [x] INTEGRATE: PR #427이 focused guard, full local gate, PR CI, latest main CI run `28744263539` warning check, merge, and branch prune까지 통과했다.

### 판단 기준

- dependency warning cleanup은 무조건 suppression하지 않고, 먼저 npm 최신 버전과 upstream state를 확인한다.
- upstream `prebuild-install` 최신이 여전히 `7.1.3`이면 warning-free release가 나오기 전까지 작은 pnpm patch를 유지한다.
- patch는 deprecated permission constants만 바꾼다. install flow, native binary resolution, `better-sqlite3` runtime API는 바꾸지 않는다.

## 2026-07-05 CI Action Runtime Warning Cleanup

- [x] CHECK: latest main CI run `28743502403` passed Node 22 and Node 24 but emitted GitHub Actions annotations because `pnpm/action-setup@v4` runs on the deprecated Node 20 action runtime.
- [x] RED: packaging guard must fail while `.github/workflows/test.yml` still uses `pnpm/action-setup@v4` instead of Node 24 compatible `pnpm/action-setup@v6`.
- [x] GREEN: `.github/workflows/test.yml` now uses `pnpm/action-setup@v6`, matching the latest official action major whose metadata uses `runs.using: node24`.
- [x] VERIFY: focused packaging guard, full local gate, PR CI, latest main CI, and branch prune all pass.
- [x] INTEGRATE: PR #425가 CI `test (22)`/`test (24)` 통과 후 merge되고 branch prune까지 확인됐다.

### 판단 기준

- 릴리스 안정성 9.5 판단에는 통과 여부뿐 아니라 CI annotation drift도 포함한다.
- GitHub Actions action major update는 공식 metadata로 runtime을 확인하고, workflow guard로 재발을 막는다.
- 최신 main CI run `28743728855`에는 `Node.js 20 is deprecated` annotation이 남지 않았지만, Node 24 install 단계의 `better-sqlite3` `fs.R_OK` deprecation warning은 별도 release-stability slice로 판단한다.

## 2026-07-05 PromptLane 9.5 Scorecard Refresh

- [x] CHECK: 9.5 plan still carried initial current-level scores and `future loop memory approval dogfood` wording even after PR #417, PR #419, and PR #421 landed.
- [x] RED: 9.5 plan must include `## Evidence Progress Ledger`, PR #417, PR #419, PR #421, `dogfood:loop-memory-approval`, `docs/DOGFOOD_CODEX_CLAUDE_2026-07-05.md`, workflow_dispatch run `28717406758`, no `schedule` event, and Remaining 9.5 blockers, or packaging guard fails.
- [x] GREEN: 9.5 plan scorecard now reflects latest evidence levels, adds evidence ledger, and keeps scheduled UI patrol/native dialog/user-flow blockers explicit.
- [x] VERIFY: focused packaging test와 full gate를 통과한다.
- [x] INTEGRATE: PR #423이 CI `test (22)`/`test (24)` 통과 후 merge되고 branch prune까지 확인됐다.

### 판단 기준

- 9.5 plan은 낙관적 완료 선언이 아니라 현재 증거와 남은 blocker를 함께 보여야 한다.
- scheduled `ui-patrol`과 native OS ask UI는 실제 evidence 없이 완료로 올리지 않는다.
- scorecard는 최신 dogfood/CI/package evidence가 들어오면 stale 상태로 방치하지 않는다.

## 2026-07-05 PromptLane Scheduled UI Patrol Evidence Audit

- [x] CHECK: GitHub `ui-patrol.yml` workflow history has workflow_dispatch run `28717406758`, but no `schedule` event; artifact API confirms workflow_dispatch run `28717406758` still has non-expired screenshot artifact `8084817676` with 9 png files.
- [x] RED: goal audit, backlog, and todo must say there is no `schedule` event and scheduled `ui-patrol` evidence remains pending, or packaging drift guard fails.
- [x] GREEN: goal audit/backlog/todo record the current manual artifact evidence while preserving scheduled `ui-patrol` evidence remains pending.
- [x] VERIFY: focused packaging test와 full gate를 통과한다.
- [x] INTEGRATE: PR #421이 CI `test (22)`/`test (24)` 통과 후 merge되었고 branch prune까지 확인했다.

### 판단 기준

- workflow_dispatch artifact는 operational evidence로 인정하지만 scheduled evidence completion으로 쓰지 않는다.
- scheduled evidence가 완료됐다는 문구를 추가하지 않는다.
- 다음 월요일 cron 이후 실제 `schedule` event와 artifact가 생기면 별도 slice에서 완료 처리한다.

## 2026-07-05 PromptLane Codex And Claude Code Dogfood Evidence

- [x] CHECK: 9.5 plan의 Task 2가 실제 Codex/Claude Code setup, doctor, hook, MCP, loop dogfood evidence 문서를 요구하는지 확인했다.
- [x] RED: `docs/DOGFOOD_CODEX_CLAUDE_2026-07-05.md`, package inclusion, AGENT-HARNESS 링크가 없으면 packaging test가 실패하도록 고정했다.
- [x] GREEN: 격리 smoke/dogfood 명령 결과를 기반으로 Codex/Claude Code dogfood evidence 문서를 추가하고 package/harness에 연결했다.
- [x] VERIFY: focused packaging test와 full gate를 통과한다.
- [x] INTEGRATE: PR #419가 CI `test (22)`/`test (24)` 통과 후 merge되었고 branch prune까지 확인했다.

### 판단 기준

- dogfood evidence는 실제 명령 실행 결과를 요약해야 하며 상상한 통합 상태를 증거로 쓰지 않는다.
- 자동 smoke는 real user config, provider credential, raw prompt archive를 건드리지 않아야 한다.
- native OS dialog dogfood는 명시적 operator approval 없이는 실행하지 않고 human-only remaining step으로 남긴다.

## 2026-07-05 PromptLane Loop Memory Approval Dogfood

- [x] CHECK: `record_loop_outcome`, `propose_loop_memory_candidate`, `record_loop_memory`, `propose_instruction_patch`가 MCP surface로 존재하며 approved memory와 instruction patch proposal을 분리하는지 확인했다.
- [x] RED: `dogfood:loop-memory-approval`, `scripts/loop-memory-approval-dogfood.mjs`, AGENT-HARNESS/PACKAGE_CONTENTS/RELEASE_CHECKLIST 연결이 없으면 packaging test가 실패하도록 고정했다.
- [x] GREEN: 격리 HOME/data-dir/project에서 Codex hook capture, loop snapshot, MCP outcome recording, memory candidate proposal, approved memory write, instruction patch proposal을 실행하는 dogfood script를 추가했다.
- [x] VERIFY: focused packaging test, `node scripts/loop-memory-approval-dogfood.mjs`, full gate를 통과한다.
- [x] INTEGRATE: PR #417이 CI `test (22)`/`test (24)` 통과 후 merge되었고 branch prune까지 확인했다.

### 판단 기준

- approved loop memory는 passed outcome과 evidence refs가 있을 때만 생성되어야 한다.
- memory approval은 instruction files를 직접 쓰지 않고, patch proposal은 user approval gate와 `writes_files: false`를 유지해야 한다.
- dogfood output은 prompt body, raw path, secret-looking token을 노출하지 않아야 한다.

## 2026-07-05 PromptLane 9.5 Quality Plan

- [x] CHECK: 기존 수준평가가 축별 점수는 제시했지만 9.5/10을 증명하는 acceptance bar와 다음 slice를 repo에 고정하지 않았음을 확인했다.
- [x] RED: 9.5 quality plan 문서, package inclusion, NEXT_BACKLOG 링크가 없으면 packaging test가 실패하도록 고정했다.
- [x] GREEN: `docs/superpowers/plans/2026-07-05-promptlane-95-quality-plan.md`에 축별 9.5 bar, 증거 기준, 다음 TDD slice를 기록하고 package/backlog에 연결했다.
- [x] VERIFY: focused packaging test와 full gate를 통과한다.
- [x] INTEGRATE: PR #415가 CI `test (22)`/`test (24)` 통과 후 merge되었고 branch prune까지 확인했다.

### 판단 기준

- 9.5점은 감상 평가가 아니라 축별 evidence bar로 판단한다.
- 테스트 통과만으로 goal complete를 선언하지 않고, 실제 dogfood/CI/package/privacy 증거가 축별 요구사항과 맞아야 한다.

## 2026-07-05 PromptLane First Coach Loop Dogfood

- [x] CHECK: setup smoke와 MCP smoke는 있지만 temp archive에서 실제 `hook codex` capture를 local server로 통과시킨 뒤 `coach`와 `loop` CLI로 이어지는 first loop dogfood가 없음을 확인했다.
- [x] RED: `dogfood:first-coach-loop`, `scripts/first-coach-loop-dogfood.mjs`, AGENT-HARNESS/PACKAGE_CONTENTS 연결이 없으면 packaging test가 실패하도록 고정했다.
- [x] GREEN: 격리 HOME/data-dir/server port에서 `hook codex`, `coach --json`, `loop collect --json`, `loop brief --json`을 실행하고 raw secret/body/path privacy를 확인하는 dogfood script를 추가했다.
- [x] VERIFY: focused packaging test, `node scripts/first-coach-loop-dogfood.mjs`, full gate를 통과한다.
- [x] INTEGRATE: PR #413이 CI `test (22)`/`test (24)` 통과 후 merge되었고 branch prune까지 확인했다.

### 판단 기준

- dogfood는 실제 사용자 config, 실제 prompt archive, provider credential, external call을 건드리지 않는다.
- hook은 local PromptLane server가 떠 있을 때만 archive를 채우며, 실패 시 fail-open이어야 한다.
- coach/loop output은 local-only, no auto-submit, no prompt body/raw path exposure를 유지해야 한다.

## 2026-07-05 PromptLane Local UI Patrol Evidence

- [x] CHECK: GitHub `ui-patrol` history still has no scheduled cron run; manual dispatch and current local evidence are the available operational proof.
- [x] RED: goal audit/backlog must include local `corepack pnpm ui-patrol` evidence and 9 png files, or packaging drift guard fails.
- [x] GREEN: goal audit/backlog record the current local `corepack pnpm ui-patrol` pass while keeping first scheduled cron artifact pending.
- [x] VERIFY: focused packaging test와 full gate를 통과한다.
- [x] INTEGRATE: PR #411이 CI `test (22)`/`test (24)` 통과 후 merge되었고 branch prune까지 확인했다.

### 판단 기준

- Manual workflow artifact와 local patrol evidence는 증거로 인정하되 scheduled cron artifact를 완료로 둔갑시키지 않는다.
- UI patrol은 broad operational guard로 유지하고 실제 visual regression이 나오기 전까지 targeted assertion을 늘리지 않는다.

## 2026-07-05 PromptLane Goal Audit Refresh

- [x] CHECK: `docs/NEXT_BACKLOG.md`와 `docs/PROMPTLANE_GOAL_AUDIT_2026-07-05.md`가 #371 기준에 머물러 있고 #403-#408 MVP reliability slices를 반영하지 않는지 확인했다.
- [x] RED: goal audit/backlog가 #403, #405, #407, #408 및 최신 main commit evidence를 포함하지 않으면 packaging drift guard가 실패하도록 고정했다.
- [x] GREEN: goal audit/backlog에 MCP storage setup guidance, loop memory evidence guard, agent setup smoke, close-log PR evidence와 “No immediate MVP reliability slice remains” 판단을 반영했다.
- [x] VERIFY: focused packaging test와 full gate를 통과한다.
- [x] INTEGRATE: PR #409가 CI `test (22)`/`test (24)` 통과 후 merge되었고 branch prune까지 확인했다.

### 판단 기준

- 장기 목표 감사 문서는 최신 merged main의 실제 evidence를 따라야 한다.
- 이미 닫힌 MVP reliability slice를 backlog에 open work처럼 남기지 않는다.
- 남은 작업은 scheduled UI patrol evidence, 승인형 native dialog dogfood, 실제 MCP registry trigger, fresh user-flow evidence로 분리한다.

## 2026-07-05 PromptLane Agent Setup Smoke

- [x] CHECK: 기존 release/hook/MCP smoke는 있지만, Codex와 Claude Code의 `setup --profile coach --register-mcp` 및 `doctor` happy path를 독립적으로 검증하는 focused smoke가 없는지 확인했다.
- [x] RED: `smoke:agent-setup`, `scripts/agent-setup-smoke.mjs`, AGENT-HARNESS/PACKAGE_CONTENTS 연결이 없으면 packaging test가 실패하도록 고정했다.
- [x] GREEN: 격리 HOME/PATH/data-dir에서 fake `claude`/`codex`를 감지시키고 setup dry-run, real setup, `doctor claude-code`, `doctor codex`를 실행하는 local-only smoke를 추가했다.
- [x] VERIFY: focused packaging test, `node scripts/agent-setup-smoke.mjs`, full gate를 통과한다.
- [x] INTEGRATE: PR #407이 CI `test (22)`/`test (24)` 통과 후 merge되었고 branch prune까지 확인했다.

### 판단 기준

- Codex와 Claude Code는 PromptLane의 1급 실행 표면이므로 setup/doctor happy path가 별도 smoke로 반복 가능해야 한다.
- smoke는 실제 provider CLI를 실행하지 않고 격리된 fake binary와 temp HOME/data-dir만 사용한다.
- smoke는 real user config, real prompt archive, provider credentials, external calls를 건드리지 않는다.

## 2026-07-05 PromptLane Loop Memory Evidence Guard

- [x] CHECK: `decideLoopMemoryCandidate`, CLI `loop memory-approve`, MCP `record_loop_memory`는 최신 snapshot 후보 결정을 통해 passed loop와 evidence를 요구하는지 확인했다.
- [x] RED: storage port가 빈 evidence 또는 unsafe evidence ref로 approved loop memory를 저장하면 `src/storage/sqlite-storage.test.ts`가 실패하도록 고정했다.
- [x] GREEN: `recordLoopMemory`가 evidence refs를 trim/normalize하고, 빈 evidence refs와 raw path/secret-looking evidence refs를 저장 전에 거부하도록 수정했다.
- [x] VERIFY: focused storage/CLI/MCP tests와 full gate를 통과한다.
- [x] INTEGRATE: PR #405가 CI `test (22)`/`test (24)` 통과 후 merge되었고 branch prune까지 확인했다.

### 판단 기준

- durable loop memory는 passed loop 후보 생성뿐 아니라 storage write boundary에서도 evidence-first여야 한다.
- approved memory evidence refs는 최소 하나 이상이어야 하며 raw local path나 secret-looking token을 포함하지 않아야 한다.
- CLI/MCP는 계속 user approval과 separate instruction patch gate를 요구해야 한다.

## 2026-07-05 PromptLane MCP Storage Setup Guidance

- [x] CHECK: GitHub repository name/description, local origin, package repository, README heading이 `promptlane`/PromptLane 기준인지 확인했다.
- [x] RED: MCP storage unavailable 메시지가 Codex/Claude Code setup/register/doctor 흐름을 안내하지 않으면 `src/mcp/storage-unavailable.test.ts`가 실패하도록 고정했다.
- [x] GREEN: 공통 MCP storage error helper가 PromptLane setup, MCP registration, doctor, custom `--data-dir` 경로를 raw-free 문장으로 안내하도록 수정했다.
- [x] VERIFY: focused MCP tests와 full gate를 통과한다.
- [x] INTEGRATE: PR #403이 CI `test (22)`/`test (24)` 통과 후 merge되었고 branch prune까지 확인했다.

### 판단 기준

- GitHub repository canonical name은 `wlsdks/promptlane`이다.
- npm package, CLI, slash namespace, MCP server compatibility ID는 `promptlane`로 유지한다.
- MCP storage failure는 사용자가 다음 행동을 바로 알 수 있어야 한다: setup/register, 실제 Codex/Claude Code prompt 제출, doctor 확인, custom `--data-dir` 일치.
- storage error copy는 raw local path나 SQLite 파일명을 노출하지 않는다.

## 2026-07-05 PromptLane Risk Execution Contract

- [x] RED: `docs/PROMPTLANE.md`가 기술 리스크, MVP slice 순서, TDD 실행 규칙을 명시하지 않으면 packaging test가 실패하도록 고정했다.
- [x] GREEN: PromptLane product contract에 storage capability drift, MCP registry drift, privacy regression, overbuilding autonomy, runtime compatibility breakage와 mitigation을 추가했다.
- [x] VERIFY: focused packaging test와 full gate를 통과한다.
- [x] INTEGRATE: PR #401이 CI `test (22)`/`test (24)` 통과 후 merge되었고 branch prune까지 확인했다.

### 판단 기준

- 다음 구현은 storage capability negotiation을 우선한다.
- MCP registry 정리는 새 tool/schema 변경이 실제로 닿을 때만 수행한다.
- privacy regression은 raw-free fixture, packaging guard, focused privacy test로 막는다.
- auto-submit, background cron, merge automation은 승인 gate 전에는 구현하지 않는다.
- 각 slice는 RED/GREEN/VERIFY/INTEGRATE 순서로 진행한다.

## 2026-07-05 PromptLane Data Privacy Contract

- [x] RED: `docs/PROMPTLANE.md`가 데이터 모델과 privacy/local-first 경계를 명시하지 않으면 packaging test가 실패하도록 고정했다.
- [x] GREEN: PromptLane product contract에 redacted Markdown archive, SQLite/FTS, loop snapshots, approved memories, instruction patch proposals, storage capability registry의 역할과 boundary를 추가했다.
- [x] VERIFY: focused packaging test와 full gate를 통과한다.
- [x] INTEGRATE: PR #399가 CI `test (22)`/`test (24)` 통과 후 merge되었고 branch prune까지 확인했다.

### 판단 기준

- prompt bodies는 redacted Markdown archive에만 남고 status/setup/MCP summary로 복사되지 않는다.
- loop snapshots는 safe labels, prompt ids, aggregate counts, outcome state, evidence refs, continuation readiness만 저장한다.
- raw local paths는 safe label/hash로 대체하고 transcripts/compact summaries는 loop memory로 저장하지 않는다.
- provider credentials는 추출, 저장, proxy, replay하지 않는다.
- loop state의 Markdown export는 opt-in이며 기본 기능으로 확장하지 않는다.

## 2026-07-05 PromptLane Feature Portfolio Contract

- [x] RED: `docs/PROMPTLANE.md`가 Keep/Improve/Build Next/Defer/Reject 기능 결정을 명시하지 않으면 packaging test가 실패하도록 고정했다.
- [x] GREEN: PromptLane product contract의 Feature Portfolio를 결정 기준과 함께 유지/개선/신규/보류/거부 matrix로 보강했다.
- [x] VERIFY: focused packaging test와 full gate를 통과한다.
- [x] INTEGRATE: PR #397이 CI `test (22)`/`test (24)` 통과 후 merge되었고 branch prune까지 확인했다.

### 판단 기준

- 기존 prompt capture, Markdown archive, SQLite/FTS, deterministic scoring, setup/status/hook/smoke command는 유지한다.
- Codex/Claude setup guidance, selected continuation brief, user-approved memory/instruction patch workflow는 개선한다.
- storage capability negotiation과 capability-aware MCP setup/status는 다음 신규 slice 후보로 둔다.
- semantic vector memory, cloud/team sync, background cron collection은 명시적으로 보류한다.
- hidden external LLM calls, automatic prompt resubmission, automatic merge/rebase/branch checkout, provider credential proxying, raw transcript scraping은 거부한다.

## 2026-07-05 PromptLane Instruction Contract

- [x] RED: AGENTS.md/CLAUDE.md/harness/instruction docs가 PromptLane product contract와 PromptLane legacy allowlist를 함께 라우팅하지 않으면 packaging test가 실패하도록 고정했다.
- [x] GREEN: AGENTS.md와 instruction layering docs가 `docs/PROMPTLANE-LEGACY-SURFACES.md`를 직접 안내한다.
- [x] VERIFY: focused packaging test와 full gate를 통과한다.
- [x] INTEGRATE: PR #395가 CI `test (22)`/`test (24)` 통과 후 merge되었고 branch prune까지 확인했다.

### 판단 기준

- AGENTS.md는 repo-level source of truth로 짧게 유지하고 deeper docs로 라우팅한다.
- CLAUDE.md는 Claude Code 전용 차이만 남기고 AGENTS.md를 먼저 읽게 한다.
- Codex/Claude harness 판단은 `docs/AGENT-HARNESS.md`와 PromptLane product contract를 함께 따른다.
- 새 `PromptLane`/`promptlane` 문자열은 legacy surface allowlist 기준으로 분류한다.

## 2026-07-05 PromptLane Repository Surface Audit

- [x] CHECK: GitHub canonical repository, local origin, README, package metadata, Claude/Codex plugin metadata가 `wlsdks/promptlane`과 `PromptLane`을 쓰는지 확인했다.
- [x] RED: loop continuation brief가 product-facing `PromptLane` wording을 노출하면 focused test와 packaging guard가 실패하도록 고정했다.
- [x] GREEN: continuation brief의 user-facing snapshot copy를 `PromptLane` 기준으로 수정한다.
- [x] VERIFY: focused tests, full test/lint/build, pack dry-run, diff check를 통과한다.
- [x] INTEGRATE: PR #394가 CI `test (22)`/`test (24)` 통과 후 merge되었고 branch prune까지 확인했다.

### 판단 기준

- GitHub repository canonical name은 `wlsdks/promptlane`이다.
- 로컬 checkout 폴더명 `prompt-memory`는 GitHub repository name이 아니다.
- `promptlane`는 package/CLI/MCP/slash/runtime compatibility id로 유지한다.
- `PromptLane`는 제품명으로 쓰지 않고 workflow phrase로만 허용한다.
- product-facing `PromptLane` copy는 legacy/historical/compatibility allowlist 밖에서 추가하지 않는다.

## 2026-07-05 PromptLane Historical Plan Contract

- [x] RED: shipped `docs/superpowers/plans/2026-07-04-promptlane-*.md` 문서가 현재 PromptLane 계약 안내 없이 package에 실리면 packaging test가 실패하도록 고정했다.
- [x] GREEN: 모든 shipped historical PromptLane markdown plan 상단에 historical naming note, 현재 제품명 `PromptLane`, 현재 runtime id `promptlane`, current contract 문서 링크를 추가했다.
- [x] VERIFY: focused packaging guard, full test/lint/build, pack dry-run, diff check를 통과한다.
- [x] INTEGRATE: PR #393이 CI `test (22)`/`test (24)` 통과 후 merge되었고 branch prune까지 확인했다.

### 판단 기준

- historical docs는 삭제하지 않고 과거 결정 기록으로 유지한다.
- 설치 사용자가 historical docs를 열어도 현재 제품명은 PromptLane이고 runtime id는 `promptlane`임을 먼저 보게 한다.
- 새 PromptLane/`promptlane` surface는 `docs/PROMPTLANE-LEGACY-SURFACES.md` 기준으로 분류한다.

## 2026-07-05 PromptLane Runtime Copy Boundary

- [x] RED: CLI loop schedule help가 `PromptLane` 제품명을 노출하면 `src/cli/index.test.ts`가 실패하도록 고정했다.
- [x] GREEN: `loop schedule` help description을 PromptLane 중심으로 정리했다.
- [x] GREEN: active backlog/audit 문서의 stale `PromptLane status` copy를 PromptLane status로 정리하고 active product surface guard 범위에 포함했다.
- [x] VERIFY: focused CLI/packaging tests, full test/lint/build, pack dry-run, diff check를 통과한다.
- [x] INTEGRATE: PR #391이 CI `test (22)`/`test (24)` 통과 후 merge되었고 branch prune까지 확인했다.

### 판단 기준

- `get_promptlane_status` 같은 published compatibility id는 유지한다.
- 사용자-facing CLI/help/docs copy는 PromptLane을 제품명으로 사용한다.
- `PromptLane`는 allowlist 문서의 legacy/internal/historical 범주 밖에서 제품명으로 쓰지 않는다.

## 2026-07-05 PromptLane Legacy Surface Inventory

- [x] RED: 남아 있는 `PromptLane`/`promptlane` surface allowlist 문서가 package contract에 없으면 packaging test가 실패하도록 고정했다.
- [x] GREEN: `docs/PROMPTLANE-LEGACY-SURFACES.md`를 추가해 legacy CLI alias, MCP compatibility tool, internal runtime type, historical planning docs, forbidden product-facing copy를 분류했다.
- [x] GREEN: `package.json#files`, `docs/PACKAGE_CONTENTS.md`, `docs/PROMPTLANE.md`, `docs/PROMPTLANE.md`를 allowlist 문서와 연결했다.
- [x] VERIFY: focused packaging guard, full test/lint/build, pack dry-run, diff check를 통과한다.
- [x] INTEGRATE: PR #389가 CI `test (22)`/`test (24)` 통과 후 merge되었고 branch prune까지 확인했다.

### 판단 기준

- 새 `PromptLane`/`promptlane` 문자열은 allowlist의 네 허용 범주 중 하나여야 한다.
- product-facing copy는 PromptLane을 사용하고, `promptlane`는 runtime compatibility ID로 유지한다.
- `get_promptlane_status` 같은 published MCP/tool compatibility 이름은 유지하되 설명 copy는 PromptLane을 사용한다.

## 2026-07-05 PromptLane PromptLane Alias Boundary

- [x] RED: Codex default prompts, README, PLUGINS가 `promptlane` alias를 추천하거나 preferred/manual command로 홍보하면 packaging test가 실패하도록 고정했다.
- [x] GREEN: Codex plugin default prompts에서 `promptlane` 제안을 제거하고 README/PLUGINS는 legacy compatibility 설명만 남겼다.
- [x] VERIFY: focused packaging guard, full test/lint/build, pack dry-run, diff check를 통과한다.
- [x] INTEGRATE: PR #387이 CI `test (22)`/`test (24)` 통과 후 merge되었고 branch prune까지 확인했다.

### 판단 기준

- `PromptLane`은 제품명이고 `promptlane`는 기본 runtime command다.
- `promptlane`는 primary CLI로 설명하고 새 사용자 prompt/default action도 `promptlane` 기준으로 제안한다.
- `/promptlane:*`는 shipped slash namespace가 아니며 `/promptlane:*`가 계속 required namespace다.

## 2026-07-05 PromptLane Name And Repository Surface

- [x] DECISION: `PromptLane`는 서비스명으로 쓰지 않고 `PromptLane`을 제품명으로 사용한다.
- [x] DECISION: `PromptLane`은 primary product/repository name으로 쓰지 않고 legacy CLI alias와 historical migration 문맥으로만 남긴다.
- [x] META: GitHub repository를 `wlsdks/promptlane`에서 `wlsdks/promptlane`으로 rename하고 local origin과 repo description/topics를 갱신했다.
- [x] RED: active product surfaces가 `PromptLane` 또는 product-facing `PromptLane` wording을 다시 노출하면 packaging test가 실패하도록 고정한다.
- [x] GREEN: README, plugin metadata, package metadata, install docs, product docs가 `PromptLane`과 `wlsdks/promptlane` 기준으로 맞춰진다.
- [x] VERIFY: focused packaging guard, full test/lint/build, pack dry-run, diff check를 통과한다.
- [x] INTEGRATE: PR #385가 CI `test (22)`/`test (24)` 통과 후 merge되었고 branch prune까지 확인했다.

### 판단 기준

- 제품명은 `PromptLane`이고 `promptlane`는 package/CLI/hook/MCP/slash compatibility runtime ID다.
- `promptlane`는 현재 binary alias, tag, historical docs, internal compatibility symbols에서만 허용한다.
- 사용자 설치 경로와 GitHub marketplace 경로는 `wlsdks/promptlane`을 사용한다.

## 2026-07-04 Agent Loop Memory Design

- [x] 2026년 7월 기준 Codex, Claude Code, OpenAI Agents, Anthropic context engineering, Google ADK, AGENTS.md 자료 확인
- [x] 현재 promptlane의 MCP, hook, storage, adapter, web/CLI 표면과 확장 가능 지점 확인
- [x] 프로젝트명 후보와 GitHub/npm rename 리스크 확인
- [x] `docs/superpowers/specs/2026-07-04-agent-loop-memory-design.md` 설계 문서 작성
- [x] 설계 문서 셀프리뷰와 기본 검증 실행

### 판단 기준

- Codex와 Claude Code는 부가 통합이 아니라 제품의 1급 실행 표면이어야 한다.
- 제품명/저장소명 변경은 CLI/package/plugin/remote/docs migration을 포함해야 하며, 사용자가 원한 방향을 좁히지 않는다.
- `promptlane`의 기존 privacy/local-first 원칙은 유지하되 제품 포지션은 prompt 단위에서 agent loop/worktree/session 단위로 확장한다.
- 설계 문서는 실제 TDD 구현 계획으로 내려갈 수 있는 첫 slice를 포함해야 한다.

## 2026-07-05 Package Publishing Docs Drift

- [x] RED: package contents/publishing docs가 shipped `promptlane` bin과 local verification scripts 목록에서 드리프트 나면 packaging test가 실패하도록 고정
- [x] GREEN: `docs/PACKAGE_CONTENTS.md`에 shipped native-dialog approved harness와 ui-patrol script를 반영
- [x] GREEN: `docs/NPM_PUBLISHING.md` publish checklist를 four-bin contract와 `promptlane` alias에 맞게 갱신

### 판단 기준

- 설치/배포 문서는 `package.json#files`와 `package.json#bin`의 실제 공개 surface를 따라야 한다.
- TODO-only 정리 PR을 만들지 않고, 테스트 가능한 package contract drift와 문서 수정을 같은 slice로 묶는다.

## 2026-07-05 Corepack Pack Lifecycle

- [x] ROOT CAUSE: direct `npm pack --dry-run`은 npm lifecycle에서 PATH의 pnpm 11을 잡아 `packageManager`가 고정한 pnpm 10.18.0과 다른 동작을 만들 수 있었다.
- [x] ROOT CAUSE: pnpm script 안에서 실행한 npm은 pnpm-only config env를 상속해 `Unknown env config` warning을 출력했다.
- [x] RED: packaging test가 `pack:dry-run`, `prepack`, `prepare`의 packageManager-pinned build/pack path를 요구하도록 고정했다.
- [x] GREEN: npm lifecycle build script는 `corepack pnpm build`를 사용하고, `pack:dry-run`은 wrapper에서 pnpm-only npm env를 제거한 뒤 `npm pack --dry-run --ignore-scripts`를 실행한다.
- [x] VERIFY: focused packaging test, `corepack pnpm pack:dry-run`, direct `npm pack --dry-run --ignore-scripts`, full gates를 통과했다.
- [x] INTEGRATE: PR merge와 branch prune까지 확인했다.

### 판단 기준

- npm lifecycle은 사용자의 PATH에 있는 다른 pnpm 버전에 의존하지 않는다.
- 사람이 보는 dry-run은 warning 없이 안정적으로 실행하고, JSON package inspection은 build 후 `--ignore-scripts`로 lifecycle log contamination을 피한다.
- 스크립트 변경, packaging contract test, publishing/package docs는 하나의 PR에 묶는다.

## 2026-07-05 Release Checklist Package Lifecycle

- [x] RED: release checklist가 package lifecycle command와 shipped script allowlist에서 드리프트 나면 packaging test가 실패하도록 고정했다.
- [x] GREEN: `docs/RELEASE_CHECKLIST.md`를 `corepack pnpm` gate, wrapper contract, 전체 shipped verification scripts 목록에 맞춘다.
- [x] VERIFY: focused packaging test와 full gates를 통과했다.
- [x] INTEGRATE: PR merge와 branch prune까지 확인했다.

### 판단 기준

- public beta checklist는 `docs/NPM_PUBLISHING.md`, `docs/PACKAGE_CONTENTS.md`, `package.json#files`, `package.json#scripts`와 같은 release contract를 공유한다.
- 새 checklist/audit 상태 갱신은 독립 문서 PR로 쪼개지 않고 package lifecycle drift test와 함께 묶는다.

## 2026-07-05 README Package Lifecycle Gate

- [x] RED: README/README.ko 개발 gate가 package dry-run wrapper 대신 bare `pnpm pack:dry-run`을 안내하면 packaging test가 실패하도록 고정했다.
- [x] GREEN: README/README.ko 개발 gate를 `corepack pnpm` 기준과 `docs/PACKAGE_CONTENTS.md` wrapper contract에 맞춘다.
- [x] VERIFY: focused packaging test와 full gates를 통과했다.
- [x] INTEGRATE: PR #363이 `main`에 merge되었고 branch prune까지 확인했다.

### 판단 기준

- README의 contributor-facing local gate는 release checklist와 package contents 문서의 package lifecycle contract를 따라야 한다.
- 사용자 설치 명령, compatibility runtime id, plugin/slash/MCP command 예시는 `promptlane`를 유지한다.

## 2026-07-05 PromptLane MCP Storage Setup Copy

- [x] RED: 중앙 MCP storage unavailable 메시지가 제품명 없이 `promptlane` archive만 말하면 실패하도록 고정
- [x] GREEN: agent-facing setup 오류는 `Local PromptLane archive`를 쓰고, 실행 command는 compatibility runtime인 `promptlane init`로 유지

### 판단 기준

- MCP tool 결과처럼 Codex/Claude Code가 직접 읽는 제품-facing 문구는 PromptLane 방향을 반영한다.
- 설치/호환성 command, package id, MCP server id는 `promptlane` compatibility window를 유지한다.

## 2026-07-05 PromptLane MCP Tool Description Copy

- [x] RED: `tools/list`의 agent-facing description이 `promptlane archive/storage`를 제품 저장소명처럼 노출하면 실패하도록 고정
- [x] GREEN: MCP tool/schema description은 `PromptLane archive/storage`를 사용하고, command/tool/server id 문맥의 `promptlane`는 유지

### 판단 기준

- Codex와 Claude Code가 읽는 tool description은 PromptLane 제품 방향을 보여야 한다.
- `promptlane`는 command, tool, package, MCP server compatibility id로만 남긴다.

## 2026-07-05 PromptLane Claude Command Copy

- [x] RED: Claude Code slash command frontmatter/heading이 `promptlane` 또는 Prompt Memory 제품명을 노출하면 packaging test가 실패하도록 고정
- [x] GREEN: slash command description과 top-level heading은 PromptLane-facing으로 갱신하고, 본문 command 예시는 compatibility runtime인 `promptlane`를 유지

### 판단 기준

- `/promptlane:*` namespace는 유지하지만 사용자가 보는 command copy는 PromptLane 제품 방향을 보여야 한다.
- 실행 명령, MCP tool name, package id 문맥의 `promptlane`는 유지한다.

## 2026-07-05 PromptLane CLI Coach Copy

- [x] RED: CLI `coach`/`buddy` text output과 MCP status preflight title이 Prompt Memory/Prompt-memory 제품명을 노출하면 실패하도록 고정
- [x] GREEN: user-facing CLI headings와 setup-needed headline/title은 PromptLane으로 갱신하고, 실행 command 예시는 `promptlane` compatibility runtime을 유지

### 판단 기준

- CLI와 MCP가 직접 보여주는 제목/상태 문구는 PromptLane 제품 방향을 사용한다.
- command 이름, slash namespace, MCP server/tool compatibility id 문맥의 `promptlane`는 유지한다.

## 2026-07-04 Loop Snapshot CLI Implementation Plan

- [x] 설계 문서의 Slice 1 범위를 CLI/storage/domain으로 제한
- [x] CLI, SQLite storage, migration, prompt summary 패턴 확인
- [x] `docs/superpowers/plans/2026-07-04-loop-snapshot-cli-implementation.md` 작성
- [x] placeholder scan과 `git diff --check` 검증

### 판단 기준

- 구현 계획은 `promptlane` CLI/package 이름을 유지하고 PromptLane rename은 별도 slice로 남긴다.
- 각 단계는 실패 테스트, 최소 구현, focused test, commit 단위로 쪼갠다.
- 계획은 prompt body/raw path/privacy 경계를 첫 slice의 검증 조건으로 포함해야 한다.

## 2026-07-05 CLI Input Error Boundary Audit

- [x] RED: `promptlane import --dry-run --file <missing>`가 importer의 plain `Error`를 통해 stack trace로 실패할 수 있음을 `runCli` 테스트로 재현
- [x] GREEN: importer 입력/일치성 오류를 `ImportInputError`로 분리하고 CLI import 경계에서 `UserError`로 변환
- [x] 회귀: import dry-run, resume, source parsing 입력 오류는 friendly stderr를 유지하고 prompt path 원문을 출력하지 않음
- [x] Track C audit: `service install/start/stop/status`는 기본 plain text, `--json` opt-in, launchctl friendly mapping, 회귀 테스트를 이미 충족함
- [x] 검증 게이트(`pnpm test`, `pnpm lint`, `pnpm build`, `pnpm pack:dry-run`, `git diff --check`)
- [x] 별도 브랜치 + PR

### 판단 기준

- CLI entrypoint는 사용자 입력/환경 오류를 stack trace로 보여주지 않는다.
- 도메인/importer 계층은 CLI 전용 `UserError`에 직접 의존하지 않고, CLI command 경계에서만 사용자 메시지로 변환한다.
- programmer bug는 기존처럼 재throw되어 개발 중 stack trace를 보존한다.

## 2026-07-04 Product Planning Hardening

- [x] 기존 기획서가 개발 착수 기준으로 부족한 항목 감사
- [x] Codex/Claude Code/Google ADK/AGENTS.md 최신 공식 자료 보강 확인
- [x] 기존 기능 유지/개선/폐기/신규 개발 결정표 추가
- [x] Codex/Claude Code acceptance criteria 추가
- [x] AGENTS.md/CLAUDE.md/harness 문서 개편 원칙 추가
- [x] 기술 리스크, 완화책, 개발 전 go/no-go gate 추가

### 판단 기준

- 개발 착수 전 제품 포트폴리오 결정이 명시되어야 한다.
- PromptLane은 generic agent runtime이 아니라 Codex/Claude Code loop memory workbench로 좁힌다.
- 기획서가 승인되기 전 package/CLI/repo/plugin rename과 hook/MCP/web 구현을 섞지 않는다.

## 2026-07-05 PromptLane Instruction And Harness Docs

- [x] 현재 `AGENTS.md`/`CLAUDE.md`가 PromptLane runtime 상태와 drift 난 부분 확인
- [x] 2026년 7월 기준 Codex AGENTS.md/hooks/MCP/plugins/worktrees와 Claude Code plugin component 방향 재확인
- [x] `AGENTS.md`를 짧은 cross-agent source of truth로 재작성
- [x] `CLAUDE.md`를 Claude Code-specific adapter 문서로 축소
- [x] `docs/INSTRUCTION-FILES.md` 추가
- [x] `docs/AGENT-HARNESS.md` 추가
- [x] 공개 harness docs를 npm package files와 package contents 문서에 포함

### 판단 기준

- AGENTS.md는 공통 규칙과 문서 라우팅을 담고, 긴 제품/기술 세부사항은 docs로 넘긴다.
- CLAUDE.md는 AGENTS.md 복제본이 아니라 Claude Code hook/stdout/plugin/slash namespace 차이만 담는다.
- Codex와 Claude Code 통합 문서는 최신 공식 surface를 기준으로 하되, PromptLane이 generic runtime으로 확장되지 않도록 local-first harness boundary를 명시한다.
- 새 문서는 설치 사용자에게도 필요한 공개 계약이므로 `package.json#files`와 packaging test에 포함한다.

## 2026-07-05 PromptLane Product And Snapshot Schema Docs

- [x] 설계서의 필수 harness document set에서 아직 비어 있는 `docs/PROMPTLANE.md`와 `docs/LOOP-SNAPSHOT-SCHEMA.md` 확인
- [x] `docs/PROMPTLANE.md`에 제품 thesis, runtime id compatibility, core workflows, feature portfolio, autonomy model, non-goals 정리
- [x] `docs/LOOP-SNAPSHOT-SCHEMA.md`에 현재 `src/loop/types.ts`와 SQLite `loop_snapshots` 저장 형태, privacy invariants, CLI/MCP/web/hook surface rules 정리
- [x] 두 문서를 `package.json#files`, package contents 문서, packaging test에 포함
- [x] 설계서의 필수 문서 상태를 implemented로 갱신

### 판단 기준

- 제품 계약은 PromptLane 방향을 넓히되 `promptlane` runtime compatibility window를 깨지 않는다.
- Snapshot schema 문서는 raw transcript store나 generic tracing backend가 아니라 privacy-safe local loop record임을 명시한다.
- 문서가 runtime type과 drift 나지 않도록 변경 절차에 `src/loop/types.ts`, storage tests, CLI/MCP/web tests 갱신 규칙을 포함한다.

## 2026-07-04 Codex Dogfood Hook Noise Fix

- [x] 실제 user-level Codex hook 설정 확인: `UserPromptSubmit` hook은 하나만 설치되어 있고 project-level hook 중복은 없음
- [x] Retired external-tool reference sweep: repo tracked source/docs에서 불필요한 특정 도구명 잔재 없음
- [x] RED: Codex rewrite-guard context output이 hook stdout에 남아 사용자 화면에 보일 수 있음을 wrapper 테스트로 재현
- [x] GREEN: Codex `additionalContext` rewrite guidance는 기본적으로 stdout을 비워 사용자-visible hook context 노이즈를 막음
- [x] README/README.ko에 Codex stdout 노출 경계와 대체 확인 경로 문서화
- [x] Dogfood: Codex/Claude Code MCP를 `promptlane` absolute dist command로 재등록하고 doctor `mcp.registered=true` 확인
- [x] Dogfood: legacy `prompt-memory` MCP 실패/disabled 항목 제거 및 project-local `.codex/config.toml` rename 잔재 정리
- [x] Source hygiene: absolute path가 들어가는 `.codex/` project-local runtime config를 git ignore 처리
- [x] Dogfood: Codex `UserPromptSubmit` capture `prmt_20260704_101950_a5aa324a10c7`를 list/show/score/open으로 확인
- [x] Dogfood: MCP stdio `tools/list`, `get_promptlane_status`, `score_prompt_archive` 호출이 통과하고 dogfood prompt id가 low-score list에 포함됨 확인
- [x] Dogfood: Playwright로 detail UI를 열어 codex, 10/100 weak, 원문, 개선안, MCP/CLI action 렌더링 확인
- [x] RED: UI selected action이 안내하는 `score_prompt include_suggestions=true`가 MCP schema에 없어 strict client에서 깨질 수 있음을 server test로 재현
- [x] GREEN: `score_prompt` MCP input schema에 `include_suggestions`를 추가해 UI action command와 tool schema를 일치시킴
- [x] Dogfood: MCP stdio로 selected prompt `score_prompt prompt_id=... include_suggestions=true`와 `improve_prompt prompt_id=...` 호출 성공 확인
- [x] Dogfood: 새 `codex exec` 세션에서 native `promptlane` MCP `score_prompt`/`improve_prompt` tool call 완료 확인
- [x] Dogfood: native `improve_prompt` 결과가 `clarifying_questions`와 ask-first `next_action`을 반환하고 자동 제출하지 않음 확인
- [x] Dogfood: MCP stdio `apply_clarifications`로 사용자 답변을 적용하면 copy/manual approval draft가 생성되고 local-only/no-external 경계를 유지함 확인
- [x] Dogfood: MCP stdio `record_clarifications`는 stored prompt id에 답변 기반 draft를 저장하되 응답에는 prompt body, draft body, user answer text를 반환하지 않음 확인
- [x] Dogfood: 새 `codex exec` 세션에서 native `promptlane` MCP `improve_prompt` -> `record_clarifications` tool call이 완료되고 manual review/copy 흐름을 유지함 확인
- [x] Dogfood: CLI `show --explain`은 saved draft metadata를 보여주고 `show --json`은 local-only 검토용 draft body를 반환함 확인
- [x] RED: stored clarification draft가 web detail UI에서 metadata만 보이고 draft body/copy action이 없어 MCP `record_clarifications`의 local review/copy 안내가 약함을 컴포넌트 테스트로 고정
- [x] GREEN: web detail UI의 saved drafts 섹션에 draft body preview와 `Copy saved draft` 액션을 추가해 local review/copy 흐름을 완성
- [x] Dogfood: Playwright로 dogfood prompt detail에서 저장된 `clarifications-v1` draft 본문과 `Copy saved draft` 버튼이 실제 렌더링됨 확인
- [x] Dogfood: Playwright click으로 `Copy saved draft`를 눌렀을 때 버튼 상태가 `Copied`로 바뀌고 clipboard에 답변 반영 draft 본문이 들어감 확인
- [x] Dogfood: `claude mcp list`와 `promptlane doctor claude-code --json`에서 `promptlane` MCP 등록/연결/last ingest 200 확인
- [x] Dogfood: Claude Code 기본 Fable 5 실행은 usage credits 429로 막혔지만 `--model sonnet` 재시도에서 native `mcp__promptlane__score_prompt`/`improve_prompt` tool call 성공 확인
- [x] Dogfood: Claude Code stream JSON에 `server_display_name: "promptlane"` tool_use metadata와 최종 "both tool calls succeeded" 보고가 남음 확인
- [x] Dogfood: Claude Code native `mcp__promptlane__record_clarifications` tool call 성공 확인
- [x] Dogfood: Claude Code `record_clarifications` 결과가 `draft_id=impdraft_7f47a9c62c0f47cd9f1b663b` metadata만 반환하고 prompt body/draft body/user answer text를 echo하지 않음 확인
- [x] Dogfood: CLI `show --json`에서 Claude Code가 기록한 draft id와 local draft body가 archive에 저장되어 UI/CLI 검토 대상으로 남음 확인
- [x] DECISION: saved draft copy telemetry는 새 prompt usage event/body 저장을 만들지 않고 기존 draft row의 `copied_at`만 갱신한다
- [x] RED: saved draft copy marker route가 없어 focused server test가 404로 실패함 확인
- [x] RED: 초기 copy route 응답이 draft body를 echo하면 metadata-only privacy 경계를 깨는 것을 focused server test로 확인
- [x] GREEN: saved draft copy route/storage/web API/UI handler가 `id`, `prompt_id`, `copied_at` metadata만 반환하고 draft row의 `copied_at`을 갱신
- [x] Dogfood: Playwright로 실제 dogfood prompt detail에서 `Copy saved draft` 버튼 클릭 후 CLI `show --json`에 `impdraft_7f47a9c62c0f47cd9f1b663b.copied_at=2026-07-04T11:06:36.809Z` 기록 확인
- [x] Dogfood: 실제 서버 session+CSRF POST `/api/v1/prompts/:id/improvements/:draft_id/copy`가 200을 반환하고 응답에 draft body가 포함되지 않음 확인
- [x] Dogfood: Claude Code 2.1.199 `claude -p --model sonnet --output-format stream-json`에서 native `mcp__promptlane__ask_clarifying_questions` tool call 성공 확인
- [x] Dogfood: Claude Code ask/elicitation print-mode 실행은 사용자가 1000ms 안에 답하지 않아 `interaction_status=declined`, `answers_count=0`, `clarifying_questions=2`, `requires_user_approval=true` metadata fallback으로 종료됨 확인
- [x] Docs: 비대화형 Claude Code print-mode에서는 MCP routing 성공과 사용자 답변 수집 성공을 분리해서 보고하고, `declined` fallback 시 native ask UI로 다시 묻도록 README/README.ko에 명시
- [x] RED: `ask_clarifying_questions` 타입/문서는 `allow_native_dialog`를 지원하지만 공개 MCP `tools/list` input schema에 없어 strict Codex/Claude client가 native dialog opt-in을 보낼 수 없음을 server test로 재현
- [x] GREEN: `ask_clarifying_questions` public input schema에 `allow_native_dialog` boolean opt-in을 추가하고 test 고정
- [x] Dogfood: dist MCP stdio `tools/list`에서 `allow_native_dialog`가 노출되고 `additionalProperties=false`를 유지함 확인
- [x] Dogfood: 새 `codex exec` 세션에서 native `mcp__promptlane.ask_clarifying_questions`를 `allow_native_dialog=false`로 호출해 schema error 없이 `interaction_status=declined`, `answers_count=0`, `clarifying_questions=yes`로 완료됨 확인
- [x] Dogfood: 실제 dist `promptlane mcp` stdio server에 `initialize`로 `capabilities.elicitation`을 광고하는 dogfood client를 붙여 server-initiated `elicitation/create` 요청 발생 확인
- [x] Dogfood: dogfood client가 `elicitation/create`에 사용자 답변 payload를 반환하자 최종 `interaction_status=answered`, `answers_count=2`, `analyzer=clarifications-v1`, `clarifying_questions=[]`, answer text가 반영된 improved draft, local-only/no-store/no-external privacy contract를 확인
- [x] Harness: `scripts/mcp-elicitation-smoke.mjs`와 `pnpm smoke:mcp-elicitation`을 추가해 dist MCP stdio answered path를 반복 검증 가능하게 고정
- [x] Source hygiene: selected worktree detail의 command/filter/copy guidance helper를 `src/server/loop-detail-guidance.ts`로 분리하고 focused 테스트 추가
- [x] Source hygiene: selected worktree detail의 snapshot age/readiness/evidence aggregate guidance를 route에서 분리하고 focused 테스트 추가
- [x] Source hygiene: selected detail safety note markup을 `LoopReviewItem`으로 분리하고 focused 렌더링 테스트 추가
- [x] Source hygiene: selected detail copy-feedback safety note markup을 `LoopReviewItem`으로 추가 전환하고 focused 렌더링 테스트 확인
- [x] Source hygiene: selected detail paste/submission safety note markup을 `LoopReviewItem`으로 추가 전환하고 focused 렌더링 테스트 확인
- [x] Source hygiene: selected detail post-submission collection/retry/freshness safety note markup을 `LoopReviewItem`으로 추가 전환하고 focused 렌더링 테스트 확인
- [x] Task 170 DECISION: post-memory-approval retry renewed-memory-approval 15개 review item은 같은 safety cluster라 별도 helper로 묶고 공용 `renderReviewItem`을 재사용
- [x] Task 170 RED: 해당 15개 field가 `LoopsView`에 직접 남아 있어 source hygiene test 실패 확인
- [x] Task 170 GREEN: `LoopWorktreeMemoryApprovalRetryRenewedItems`로 15개 item을 이동하고 `LoopsView` 직접 field 접근을 제거
- [x] Task 170 PRIVACY: UI helper extraction만 수행하며 API field, 저장 state, prompt body/evidence refs/outcome summary/raw path/git read/write/transcript import/command execution/external call을 추가하지 않음
- [x] Task 171 DECISION: baseline continuation/copy/paste/submission safety 14개 review item은 같은 selected-detail safety cluster라 별도 helper로 묶고 공용 `renderReviewItem`을 재사용
- [x] Task 171 RED: 해당 14개 field가 `LoopsView`에 직접 남아 있어 source hygiene test 실패 확인
- [x] Task 171 GREEN: `LoopWorktreeContinuationSafetyItems`로 14개 item을 이동하고 `LoopsView` 직접 field 접근을 제거
- [x] Task 171 PRIVACY: UI helper extraction만 수행하며 API field, 저장 state, prompt body/evidence refs/outcome summary/raw path/git read/write/transcript import/command execution/external call을 추가하지 않음
- [x] Task 172 DECISION: post-submission collection/retry/freshness 9개 review item은 같은 selected-detail collection freshness cluster라 별도 helper로 묶고 공용 `renderReviewItem`을 재사용
- [x] Task 172 RED: 해당 9개 field가 `LoopsView`에 직접 남아 있어 source hygiene test 실패 확인
- [x] Task 172 GREEN: `LoopWorktreeCollectionFreshnessItems`로 9개 item을 이동하고 `LoopsView` 직접 field 접근을 제거
- [x] Task 172 PRIVACY: UI helper extraction만 수행하며 API field, 저장 state, prompt body/evidence refs/outcome summary/raw path/git read/write/transcript import/command execution/external call을 추가하지 않음
- [x] Task 173 DECISION: post-memory-approval collection/retry/freshness 8개 review item은 같은 selected-detail memory collection cluster라 별도 helper로 묶고 공용 `renderReviewItem`을 재사용
- [x] Task 173 RED: 해당 8개 field가 `LoopsView`에 직접 남아 있어 source hygiene test 실패 확인
- [x] Task 173 GREEN: `LoopWorktreeMemoryCollectionItems`로 8개 item을 이동하고 `LoopsView` 직접 field 접근을 제거
- [x] Task 173 PRIVACY: UI helper extraction만 수행하며 API field, 저장 state, prompt body/evidence refs/outcome summary/raw path/git read/write/transcript import/command execution/external call을 추가하지 않음
- [x] Task 174 DECISION: 최근 review item helper PR이 너무 작게 쪼개졌으므로 이번 slice는 selected-detail boundary/privacy/review 9개 item과 merge review packet summary를 한 PR 단위로 묶는다
- [x] Task 174 RED: boundary/privacy/review field와 review packet field가 `LoopsView`에 직접 남아 있어 source hygiene test 실패 확인
- [x] Task 174 GREEN: `LoopWorktreeBoundaryReviewItems`와 `LoopWorktreeMergeReviewSummary`로 하단 review 영역을 이동하고 `LoopsView` 직접 field 접근을 제거
- [x] Task 174 PRIVACY: UI helper extraction만 수행하며 API field, 저장 state, prompt body/evidence refs/outcome summary/raw path/git read/write/transcript import/command execution/external call을 추가하지 않음
- [x] Task 175 DECISION: `selected_brief_action` 아래 command distinction/filter/copy side-effect formatting은 같은 selected brief guidance 영역이므로 한 helper로 묶는다
- [x] Task 175 RED: selected brief command guidance field가 `LoopsView`에 직접 남아 있어 source hygiene test 실패 확인
- [x] Task 175 GREEN: `LoopWorktreeSelectedBriefGuidance`로 continuation guidance와 관련 review item을 이동하고 `LoopsView` 직접 field 접근을 제거
- [x] Task 175 PRIVACY: UI helper extraction만 수행하며 API field, 저장 state, prompt body/evidence refs/outcome summary/raw path/git read/write/transcript import/command execution/external call을 추가하지 않음
- [x] Task 176 DECISION: worktree detail header/selection/snapshot-age/latest-decision은 selected worktree status header 영역이므로 한 helper로 묶는다
- [x] Task 176 RED: header/status field가 `LoopsView`에 직접 남아 있어 source hygiene test 실패 확인
- [x] Task 176 GREEN: `LoopWorktreeDetailHeader`로 header/status rendering을 이동하고 `LoopsView` 직접 field 접근을 제거
- [x] Task 176 PRIVACY: UI helper extraction만 수행하며 API field, 저장 state, prompt body/evidence refs/outcome summary/raw path/git read/write/transcript import/command execution/external call을 추가하지 않음
- [x] Task 177 DECISION: command-center summary/review packet/worktree preview는 같은 command-center panel 영역이므로 한 helper로 묶는다
- [x] Task 177 RED: command-center field가 `LoopsView`에 직접 남아 있어 source hygiene test 실패 확인
- [x] Task 177 GREEN: `LoopCommandCenterSummary`로 command-center rendering을 이동하고 `LoopsView` 직접 field 접근을 제거
- [x] Task 177 PRIVACY: UI helper extraction만 수행하며 API field, 저장 state, prompt body/evidence refs/outcome summary/raw path/git read/write/transcript import/command execution/external call을 추가하지 않음
- [x] Task 178 DECISION: recent decisions/worktree preview/memory candidate/project memory action은 같은 loop activity summary 영역이므로 한 helper로 묶는다
- [x] Task 178 RED: activity summary field가 `LoopsView`에 직접 남아 있어 source hygiene test 실패 확인
- [x] Task 178 GREEN: `LoopActivitySummary`로 activity summary rendering을 이동하고 `LoopsView` 직접 field 접근을 제거
- [x] Task 178 PRIVACY: UI helper extraction만 수행하며 API field, 저장 state, prompt body/evidence refs/outcome summary/raw path/git read/write/transcript import/command execution/external call을 추가하지 않음
- [x] Task 179 DECISION: selected worktree loop rows table과 generic loop rows/list는 같은 loop row presentation 영역이므로 한 helper module로 묶는다
- [x] Task 179 RED: loop row/table field가 `LoopsView`에 직접 남아 있어 source hygiene test 실패 확인
- [x] Task 179 GREEN: `LoopWorktreeDetailRows`와 `LoopRows`로 row/table rendering을 이동하고 `LoopsView` 직접 row field 접근을 제거
- [x] Task 179 PRIVACY: UI helper extraction만 수행하며 API field, 저장 state, prompt body/evidence refs/outcome summary/raw path/git read/write/transcript import/command execution/external call을 추가하지 않음
- [x] Task 180 DECISION: 최근 helper extraction PR이 과하게 작아졌으므로 patch proposal panel, selected worktree copy action, loading/empty shell을 하나의 remaining shell cleanup PR로 묶는다
- [x] Task 180 RED: remaining shell formatting이 `LoopsView`에 직접 남아 있어 source hygiene test 실패 확인
- [x] Task 180 GREEN: `LoopInstructionPatchPanel`, `LoopSelectedBriefAction`, `LoopLoadingState`/`LoopEmptyState`로 남은 shell rendering을 이동하고 `LoopsView` 직접 shell 문자열/field 접근을 제거
- [x] Task 180 PRIVACY: UI helper extraction만 수행하며 API field, 저장 state, prompt body/evidence refs/outcome summary/raw path/git read/write/transcript import/command execution/external call을 추가하지 않음
- [x] Task 181 DECISION: `LoopsView`는 orchestration-only에 충분히 가까워졌으므로 추가 UI cleanup보다 Codex native dialog fallback dogfood 준비로 이동
- [x] Task 181 RED: dist MCP native dialog opt-in preflight harness/package script가 없어 packaging focused test 실패 확인
- [x] Task 181 GREEN: `scripts/mcp-native-dialog-preflight.mjs`와 `smoke:mcp-native-dialog`를 추가해 `allow_native_dialog` public schema와 no-dialog metadata fallback을 dist MCP stdio에서 반복 검증
- [x] Task 181 PRIVACY: preflight는 `allow_native_dialog=false`와 `PROMPTLANE_NATIVE_DIALOG=0`으로 OS dialog를 열지 않고, prompt body 저장/external call/raw path/git read/write/transcript import를 추가하지 않음
- [x] Task 182 RED: Commander unknown-command 오류가 테스트 중 `process.exit`를 호출해 raw stack path로 실패하는 것을 확인
- [x] Task 182 GREEN: `runCli`가 Commander input error를 `exitOverride`로 받아 friendly stderr와 exit code 1을 반환하고 programmer error는 계속 rethrow
- [x] Task 182 PRIVACY: CLI error handling만 변경하며 prompt body 저장/external call/raw path 출력/git read/write/transcript import를 추가하지 않음
- [x] Task 183 DECISION: 실제 OS dialog를 자동 테스트나 scheduled check에서 열지 않기 위해 operator approval env로 보호되는 dogfood harness를 별도 slice로 둔다
- [x] Task 183 RED: approval-gated native dialog dogfood harness가 package files와 scripts에 없어 focused packaging test가 실패함 확인
- [x] Task 183 GREEN: `scripts/mcp-native-dialog-approved.mjs`와 `dogfood:mcp-native-dialog-approved`를 추가하고 승인 env가 없으면 OS dialog를 열지 않고 실패하도록 고정
- [x] Task 183 PRIVACY: 승인 없는 경로는 prompt body 저장/external call/raw path/git read/write/transcript import/OS dialog 실행을 추가하지 않음
- [ ] 다음 dogfood slice: 명시적 사용자 승인 후 `PROMPTLANE_NATIVE_DIALOG_APPROVED=1 corepack pnpm dogfood:mcp-native-dialog-approved`로 실제 answered OS dialog 결과 확인

### 판단 기준

- 이번 수정은 Codex의 화면 노이즈를 줄이는 실사용 결함 수정이며, Claude Code의 기존 `UserPromptSubmit` context 출력 동작은 유지한다.
- Codex `Stop`/compact lifecycle hook의 local-only 수집과 prompt ingest 경계는 변경하지 않는다.
- `block-and-copy`처럼 decision이 필요한 hook 출력은 이번 수정에서 제거하지 않는다.
- Codex/Claude Code MCP는 낡은 `prompt-memory` command가 아니라 `promptlane` 이름과 현재 dist entrypoint로 연결되어야 한다.
- Archive, UI, MCP 검증은 prompt body/raw path를 외부로 보내지 않고 local-only 경로에서 수행한다.
- Selected prompt MCP action은 UI에 표시되는 command, MCP tool schema, 실제 tool-call 동작이 서로 일치해야 한다.
- Native tool routing 검증은 현재 실행 중인 thread tool exposure가 아니라 새 agent session에서 실제 `mcp_tool_call` 이벤트가 발생했는지로 판단한다.
- Direct `apply_clarifications`는 현재 입력받은 prompt text로 copy draft를 반환하는 즉석 도구이고, stored prompt 기반 raw-free MCP 응답은 `record_clarifications`로 검증한다.
- Stored clarification 기록은 local archive write를 허용하지만 MCP 응답은 metadata-only여야 하며, 실제 draft body 검토와 복사는 local UI/CLI에서 사용자가 수행해야 한다.
- Stored draft UI는 metadata만 보여주면 불충분하다. `record_clarifications`가 반환한 `draft_id` 이후 사용자는 local detail UI에서 draft body를 검토하고 복사할 수 있어야 한다.
- Saved draft copy telemetry는 copy success 여부를 회고/사용성 신호로 남길 가치가 있지만, 새 event stream이나 prompt body 복제는 privacy/value 대비 과하다. 기존 `prompt_improvement_drafts.copied_at`만 갱신하고 응답은 metadata-only로 유지한다.
- Claude Code native MCP routing은 `claude mcp list`의 health check만으로 완료 처리하지 않는다. 실제 `claude -p --output-format stream-json`에서 `mcp__promptlane__...` tool_use가 발생하고 성공한 기록이 있어야 한다.
- Claude Code 모델/크레딧 실패는 integration 실패와 구분한다. 이번 검증에서는 Fable 5 usage credits 429는 별도 외부 상태이고, Sonnet 실행에서 promptlane MCP routing 자체는 성공했다.
- Claude Code의 stored clarification write flow는 MCP 응답에서는 metadata-only를 유지하고, draft body 검토는 local archive/UI/CLI로 넘어가야 한다.
- Claude Code `ask_clarifying_questions` print-mode dogfood는 MCP routing 성공 여부와 실제 사용자 답변 수집 여부를 분리한다. `interaction_status=declined`는 tool failure가 아니라 답변 미수집 fallback이며, 다음 단계는 agent native ask UI 또는 interactive session에서 답을 받아 `apply_clarifications`/`record_clarifications`로 이어가는 것이다.
- Codex native dialog fallback을 문서화하려면 `allow_native_dialog`가 public MCP schema에 있어야 한다. internal TypeScript-only argument는 실제 strict MCP client 통합으로 간주하지 않는다.
- 실제 사용자 답변 포함 경로는 mock 함수 호출만으로 완료 처리하지 않는다. dist MCP stdio server, client `capabilities.elicitation`, server-initiated `elicitation/create`, client answer response, final answered draft까지 한 번에 통과해야 한다.
- 승인형 native dialog dogfood harness가 존재하더라도 실제 OS dialog에 operator가 답한 증거와는 구분한다. 목표 완료 증거로 쓰려면 승인 env를 명시적으로 켜고 최종 `interaction_status=answered`, no external calls, no auto-submit, no raw secret leakage를 확인해야 한다.

## 2026-07-04 Loop Snapshot Domain Slice

- [x] Task 1 RED: loop snapshot builder 테스트가 missing module로 실패하는지 확인
- [x] Task 1 GREEN: `src/loop/types.ts`와 `src/loop/snapshot.ts` 최소 구현
- [x] Task 2 RED: continuation brief formatter 테스트가 missing module로 실패하는지 확인
- [x] Task 2 GREEN: `src/loop/brief.ts` 최소 구현
- [x] Task 3 RED: SQLite loop snapshot storage 테스트가 missing method로 실패하는지 확인
- [x] Task 3 GREEN: migration 16과 loop snapshot persistence port 구현
- [x] Task 4 RED: loop CLI 테스트가 missing module로 실패하는지 확인
- [x] Task 4 GREEN: `promptlane loop collect` / `promptlane loop brief` CLI 등록
- [x] Task 5: architecture 문서에 `src/loop/` 경계 추가
- [x] Task 6 RED: PromptLane MCP tool 테스트가 missing module/tool list로 실패하는지 확인
- [x] Task 6 GREEN: `get_promptlane_status` / `prepare_loop_brief` MCP tool 구현
- [x] Task 7 RED: loop outcome storage/MCP 테스트가 missing method/tool로 실패하는지 확인
- [x] Task 7 GREEN: `record_loop_outcome` MCP write tool과 SQLite outcome update 구현
- [x] 다음 slice: Codex/Claude Code hook 기반 loop snapshot 수집 설계 및 구현

### 판단 기준

- 이번 slice는 prompt body와 raw path를 저장하거나 출력하지 않는 domain/storage/CLI/MCP read contract와 user-approved outcome metadata write contract만 증명한다.
- hook, web, rename 작업은 이 커밋에 섞지 않는다.
- 다음 slice도 RED-GREEN 단위로 storage integration부터 진행한다.

## 2026-07-05 Dependency Security Alerts

- [x] RED: GitHub Dependabot alerts와 `corepack pnpm audit --json`에서 `vite`, `esbuild`, `fast-uri` 취약점 5건 확인
- [x] GREEN: `fastify`를 5.9.0으로 올려 transitive `fast-uri`를 3.1.3으로 갱신
- [x] GREEN: `vite`를 8.1.3으로 올리고 `esbuild` 0.28.1을 명시 devDependency로 고정해 Vite peer가 patched esbuild를 사용하게 함
- [x] VERIFY: `corepack pnpm audit --json` 결과 vulnerabilities 0건 확인

### 판단 기준

- 이번 slice는 default branch 보안 알림 제거가 목적이며 제품/runtime id rename, UI 변경, hook/MCP 동작 변경을 포함하지 않는다.
- `vite`/`esbuild` advisory는 dev-server 계열이지만 local-first developer tool 신뢰성에 직접 영향을 주므로 full gate와 CI로 검증한다.

## 2026-07-05 pnpm Build Approval Settings

- [x] RED: `package.json#pnpm.onlyBuiltDependencies`가 남아 있고 `pnpm-workspace.yaml`이 없어 packaging focused test가 실패함 확인
- [x] GREEN: build-script approval 설정을 `pnpm-workspace.yaml`의 `onlyBuiltDependencies`로 이동하고 `package.json#pnpm` 제거
- [x] VERIFY: `corepack pnpm build`에서 pnpm field ignored warning이 사라짐 확인

### 판단 기준

- 이 변경은 pnpm 11 전환 준비와 현재 build/pack 로그 품질 개선이며 dependency version, runtime id, hook/MCP 동작을 바꾸지 않는다.
- build-script approval 대상은 기존과 동일하게 `better-sqlite3`, `esbuild`만 유지한다.

## 2026-07-04 Hook Loop Snapshot Collection Slice

- [x] Task 1 RED: Claude Code/Codex `Stop` hook이 prompt ingest route로 가지 않고 local loop snapshot을 생성해야 한다는 wrapper 테스트 작성
- [x] Task 1 GREEN: Stop hook용 local-only loop snapshot collector 구현
- [x] Task 2 RED: Stop hook 출력과 저장 snapshot이 prompt body/raw path를 노출하지 않는 회귀 테스트 작성
- [x] Task 2 GREEN: fail-open/privacy-safe stdout/stderr contract 유지
- [x] Task 3: CLI loop collect와 hook collect가 같은 snapshot builder 경계를 공유하도록 정리
- [x] Task 4: docs/README/PLUGINS/PR에 Stop hook loop collection 범위와 한계 반영
- [x] 다음 slice: PostCompact/PreCompact boundary metadata 설계 및 구현

### 판단 기준

- Stop hook은 `UserPromptSubmit` ingest 흐름을 깨지 않고, prompt body가 없는 lifecycle event를 별도 local collector로 처리한다.
- Hook 실패는 기존처럼 fail-open이며 stdout/stderr에 prompt body, raw path, token을 노출하지 않는다.
- 이번 slice는 hook 기반 수집까지만 포함하고 cron, web loops view, repo/package rename은 섞지 않는다.
- Codex/Claude Code acceptance criteria 중 "Hook `Stop`: collect loop snapshot"을 현재 `promptlane` CLI/package 이름 아래에서 먼저 증명한다.

## 2026-07-04 Compact Boundary Metadata Slice

- [x] Task 1 RED: SQLite compact boundary storage 테스트가 missing method/migration으로 실패하는지 확인
- [x] Task 1 GREEN: `compact_boundaries` migration과 storage port 구현
- [x] Task 2 RED: Claude Code/Codex `PreCompact`/`PostCompact` hook wrapper 테스트가 prompt ingest 미사용 및 raw-free metadata 저장을 요구하는지 확인
- [x] Task 2 GREEN: compact hook local-only boundary recorder 구현
- [x] Task 3 RED: installer dry-run이 `PreCompact`/`PostCompact` hook 등록을 요구하는지 확인
- [x] Task 3 GREEN: Claude/Codex installer, plugin hook, example settings에 compact hooks 추가
- [x] Task 4: README/PLUGINS/spec/todo에 compact boundary 범위와 공식 hook 근거 반영
- [x] 다음 slice: loop status/brief에 compact boundary awareness 반영

## 2026-07-04 Compact Boundary Awareness Slice

- [x] Task 1 RED: `promptlane loop brief`가 최신 snapshot 이후 compact boundary section을 요구하도록 CLI 테스트 작성
- [x] Task 1 GREEN: `createLoopBrief`와 CLI가 최신 snapshot 이후 compact boundary metadata를 표시
- [x] Task 2 RED: `get_promptlane_status` / `prepare_loop_brief`가 compact boundary awareness를 요구하도록 MCP 테스트 작성
- [x] Task 2 GREEN: MCP status/brief result에 raw-free compact boundary metadata 추가
- [x] Task 3: spec/README/PLUGINS에 compact boundary awareness 범위와 한계 반영
- [x] 다음 slice: compact-aware loop status CLI 또는 web Loops view 설계

## 2026-07-04 Loop Status CLI Slice

- [x] Task 1 RED: `promptlane loop status`가 missing export로 실패하는지 확인
- [x] Task 1 GREEN: local loop snapshot readiness와 latest snapshot metadata를 표시하는 CLI status 구현
- [x] Task 2 GREEN: 최신 snapshot 이후 compact boundary가 있으면 `promptlane loop collect` refresh action 표시
- [x] Task 3: README/PLUGINS/spec/todo에 `loop status` 범위와 privacy contract 반영
- [x] 다음 slice: web Loops view 또는 CLI/MCP status 모델 공통화

## 2026-07-04 Web Loops View First Slice

- [x] Task 1 RED: `/api/v1/loops`가 404로 실패하는지 확인
- [x] Task 1 GREEN: loop snapshot list API가 safe metadata와 compact boundary marker를 반환
- [x] Task 2 RED: `/loops` routing과 `listLoops()` client가 missing route/function으로 실패하는지 확인
- [x] Task 2 GREEN: sidebar Loops navigation과 dense loop list/empty state 구현
- [x] Task 3: component-owned `loops-view.css`로 CSS line budget 유지
- [x] Task 4: README/PLUGINS/spec/todo에 Web Loops first slice 범위와 한계 반영
- [x] Task 5 RED: `/api/v1/loops/:id/brief`와 `getLoopBrief()`가 missing route/function으로 실패하는지 확인
- [x] Task 5 GREEN: row-level `Copy brief` action이 privacy-safe continuation brief를 가져와 복사
- [x] Task 6 RED: `loop collect`가 `source: "service"` snapshot을 만들지 못하는 실패 확인
- [x] Task 6 GREEN: `promptlane loop collect --source service` 명시적 one-shot collector 구현
- [x] Task 7 RED: `loop schedule install --dry-run` LaunchAgent helper가 missing module로 실패하는지 확인
- [x] Task 7 GREEN: opt-in macOS LaunchAgent dry-run/install helper와 `loop schedule install` CLI 구현
- [x] Task 8 RED: scheduler status/uninstall helper가 missing export로 실패하는지 확인
- [x] Task 8 GREEN: `loop schedule status`와 `loop schedule uninstall` plist-only lifecycle 구현
- [x] Task 9 RED: semantic memory decision gate와 CLI/MCP surface가 missing module/export/tool로 실패하는지 확인
- [x] Task 9 GREEN: `decideLoopMemoryCandidate`, `loop memory-candidate`, `propose_loop_memory_candidate` 구현
- [x] Task 10 RED: approved memory storage/CLI/MCP가 missing method/export/tool로 실패하는지 확인
- [x] Task 10 GREEN: `loop_memories`, `loop memory-approve`, `record_loop_memory` local-only 승인 저장 구현
- [x] Task 11 RED: instruction-file patch proposal generator/CLI/MCP가 missing module/export/tool로 실패하는지 확인
- [x] Task 11 GREEN: `loop instruction-patch`, `propose_instruction_patch`, review-only unified diff proposal 구현
- [x] Task 12 RED: explicit instruction patch apply 함수/CLI/MCP/tool list가 missing export/tool로 실패하는지 확인
- [x] Task 12 GREEN: `loop instruction-apply`, `apply_instruction_patch`, confirm-required/idempotent file write 구현
- [x] Task 13 RED: package/plugin product-facing metadata가 PromptLane이 아니라는 manifest 테스트 실패 확인
- [x] Task 13 GREEN: package/plugin/README/docs product-facing metadata를 PromptLane으로 갱신하고 CLI/package id는 `promptlane` 유지
- [x] Task 13 META: GitHub repo를 `wlsdks/promptlane`으로 rename, origin URL과 repo description/topics 갱신
- [x] Task 14 PLAN: CLI/MCP/web status model 공통화 구현 계획을 `docs/superpowers/plans/2026-07-04-loop-status-model-commonization.md`로 작성
- [x] Task 14.1 RED: `src/loop/status.test.ts`가 missing `src/loop/status.ts`로 실패하는지 확인
- [x] Task 14.1 GREEN: `createPromptLaneStatus` 공유 모델과 privacy-safe snapshot mapper 구현
- [x] Task 14.2 RED: CLI/MCP/API/web loop status surfaces가 공유 status shape 없이 drift할 수 있음을 focused test로 고정
- [x] Task 14.2 GREEN: CLI `loop status`, MCP `get_promptlane_status`, `/api/v1/loops`, web Loops status header를 `src/loop/status.ts`로 연결
- [x] Task 15 RED: approved loop memory가 continuation brief에 포함되지 않는 CLI/MCP/API focused test 실패 확인
- [x] Task 15 GREEN: `createLoopBrief`와 CLI `loop brief`, MCP `prepare_loop_brief`, `/api/v1/loops/:id/brief`가 최신 approved memory를 privacy-safe section으로 포함
- [x] Task 16 RED: approved loop memory가 다른 project continuation brief에 섞이는 storage/CLI/MCP/API focused test 실패 확인
- [x] Task 16 GREEN: `listLoopMemories({ projectId })`와 brief 호출부 project scoping으로 현재 snapshot project memory만 포함
- [x] Task 17 RED: CLI/MCP/API/web status가 project-scoped approved memory count를 노출하지 않는 focused test 실패 확인
- [x] Task 17 GREEN: `PromptLaneStatus.project_memory` count를 CLI `loop status`, MCP `get_promptlane_status`, `/api/v1/loops`, web Loops summary에 raw-free로 연결
- [x] Task 18 RED: `package.json#bin.promptlane`와 alias 문서가 누락된 packaging focused test 실패 확인
- [x] Task 18 GREEN: `promptlane` bin alias를 기존 CLI entrypoint에 연결하고 README/PACKAGE_CONTENTS에 compatibility 설명 추가
- [x] Task 19 RED: status surfaces가 latest loop memory candidate eligibility를 raw-free로 노출하지 않는 focused test 실패 확인
- [x] Task 19 GREEN: `PromptLaneStatus.memory_candidate`를 CLI/MCP/API/web status에 statement/evidence 없이 연결
- [x] Task 20 RED: plugin command docs/default prompts가 `promptlane` CLI alias와 `/promptlane:*` namespace compatibility를 설명하지 않는 packaging focused test 실패 확인
- [x] Task 20 GREEN: Claude command docs, Codex default prompt, README/PLUGINS에 `promptlane` CLI alias guidance를 추가하고 slash namespace는 유지
- [x] Task 21 RED: memory approval result가 다음 실행 명령을 structured `next_actions`로 안내하지 않는 CLI/MCP focused test 실패 확인
- [x] Task 21 GREEN: CLI `loop memory-approve`와 MCP `record_loop_memory`에 brief/patch proposal 후속 명령을 추가하되 instruction file write는 하지 않음
- [x] Task 22 RED: web Loops approval API/client/CTA가 없어 latest memory candidate를 승인할 수 없는 focused test 실패 확인
- [x] Task 22 GREEN: CSRF-protected `/api/v1/loops/memory/approve`, `approveLoopMemory()`, Loops summary approval CTA, App refresh 연결, same-snapshot 중복 승인 방지
- [x] Task 23 RED: web에서 latest approved memory의 instruction patch proposal을 review-only로 볼 수 없는 focused test 실패 확인
- [x] Task 23 GREEN: `/api/v1/loops/instruction-patch`, `getLoopInstructionPatch()`, Loops summary review CTA/diff preview 구현
- [x] Task 24 RED: dedicated plugin rename plan이 없어 slash command/plugin id rename compatibility gate를 증명하지 못하는 packaging focused test 실패 확인
- [x] Task 24 GREEN: `2026-07-04-promptlane-plugin-rename-plan.md`로 package/CLI/plugin/slash namespace/hook/MCP rename phases와 acceptance gates 고정
- [x] Task 25 RED: instruction patch proposal에 web no-apply gate/CLI confirm command/MCP apply tool 계약이 없어 focused tests 실패 확인
- [x] Task 25 GREEN: core proposal, MCP schema/result, API client type, web review panel에 explicit apply gate 연결
- [x] Task 26 RED: shared PromptLane status에 worktree/session activity summary가 없어 CLI/API/web/MCP focused tests 실패 확인
- [x] Task 26 GREEN: `PromptLaneStatus.activity`를 active worktree/session counts, review-needed signal, CLI/MCP/API/web summary로 연결
- [x] Task 27 RED: shared PromptLane status에 worktree별 activity detail이 없어 CLI/API/web/MCP focused tests 실패 확인
- [x] Task 27 GREEN: `PromptLaneStatus.activity.worktrees`를 safe worktree label, sessions, snapshots, latest outcome으로 CLI/MCP/API/web summary에 연결
- [x] Task 28 RED: dedicated worktree drilldown API/client/UI가 없어 focused tests 실패 확인
- [x] Task 28 GREEN: `/api/v1/loops/worktrees/:worktree`, `getLoopWorktree()`, Loops summary open action, selected worktree detail panel 구현
- [x] Task 29 RED: `/loops?worktree=...` query-state deep link가 복원되지 않는 routing focused test 실패 확인
- [x] Task 29 GREEN: `View`/`pathForView`/`routeFromLocation`과 App 초기/클릭 흐름을 worktree query-state에 연결
- [x] Task 30 RED: worktree drilldown을 session 단위로 좁히는 API/client/routing/UI focused tests 실패 확인
- [x] Task 30 GREEN: `session_id` API query, `getLoopWorktree(..., { sessionId })`, `/loops?worktree=...&session=...`, active session label 연결
- [x] Task 31 RED: worktree drilldown을 branch 단위로 좁히는 API/client/routing/UI focused tests 실패 확인
- [x] Task 31 GREEN: `branch` API query, `getLoopWorktree(..., { branch })`, `/loops?worktree=...&session=...&branch=...`, active branch label 연결
- [x] Task 32 RED: PromptLane rename issue-slice plan과 package files 계약이 없어 packaging focused test 실패 확인
- [x] Task 32 GREEN: rename issue-slice plan을 R1-R7로 분해하고 package files/spec/todo에 연결
- [x] Task 33 RED: runtime id inventory artifact가 없어 packaging focused test 실패 확인
- [x] Task 33 GREEN: package/bin/plugin/command/hook/MCP runtime id inventory JSON을 추가하고 live manifest 비교 테스트로 잠금
- [x] Task 34 RED: `/promptlane:*` alias-only slash namespace docs 계약이 없어 packaging focused test 실패 확인
- [x] Task 34 GREEN: README/README.ko/PLUGINS가 `/promptlane:*`를 future alias-only namespace로 설명하고 command files/runtime ids는 유지
- [x] Task 35 RED: R3 Claude Code dual namespace decision artifact가 없어 packaging focused test 실패 확인
- [x] Task 35 GREEN: 공식 plugin namespace 모델 근거로 `/promptlane:*` command file 추가를 보류하고 safe future path를 문서화
- [x] Task 36 RED: Codex plugin display/default prompt가 아직 promptlane 중심이라 packaging focused test 실패 확인
- [x] Task 36 GREEN: Codex plugin 사용자-facing copy를 PromptLane으로 정리하고 plugin id/path/hook command는 유지
- [x] Task 37 RED: hook binary compatibility smoke script/package 계약이 없어 packaging focused test 실패 확인
- [x] Task 37 GREEN: built `promptlane`/`promptlane` entrypoint hook status/claude-code/codex fail-open smoke 추가
- [x] Task 38 RED: MCP server name compatibility decision artifact가 없어 packaging focused test 실패 확인
- [x] Task 38 GREEN: `promptlane` canonical MCP server name 유지와 `promptlane` server-name alias 보류 조건 문서화
- [x] Task 39 RED: deprecation readiness artifact가 없어 packaging focused test 실패 확인
- [x] Task 39 GREEN: alias-only/deprecation/breaking release note template, saved snippet support, rollback/upgrade smoke gate 문서화
- [x] Task 40 RED: rename line 이후 다음 runtime value slice artifact/package 계약이 없어 packaging focused test 실패 확인
- [x] Task 40 GREEN: selected worktree continuation brief parity를 다음 product/runtime slice로 확정하고 spec/package/todo에 연결
- [x] Task 41 RED: CLI/MCP `loop brief`가 worktree/session/branch filter를 무시하고 global latest snapshot을 쓰는 실패 확인
- [x] Task 41 GREEN: 공유 snapshot selector와 CLI/MCP filtered continuation brief selection 구현
- [x] Task 42 RED: Web selected worktree detail filtered brief endpoint/client/action이 없어 focused tests 실패 확인
- [x] Task 42 GREEN: `/api/v1/loops/brief`, `getSelectedLoopBrief`, selected detail copy action 구현
- [x] Task 43 RED: multi-worktree command center summary가 shared status/CLI/MCP schema/web summary에 없어 focused tests 실패 확인
- [x] Task 43 GREEN: `PromptLaneStatus.activity.command_center`, CLI status, MCP schema, web Loops summary 구현
- [x] Task 44 RED: command-center review item별 selected brief shortcut/command metadata가 없어 focused tests 실패 확인
- [x] Task 44 GREEN: `continuation_command`, CLI/MCP schema, web `Copy review brief` action, App filtered brief copy 연결
- [x] Task 44 PRIVACY: continuation brief outcome summary가 unsafe raw path/secret-looking text를 포함하면 출력하지 않도록 회귀 테스트와 필터 추가
- [x] Task 45 RED: command-center review item에 merge-readiness/evidence grouping metadata가 없어 domain/web/CLI/MCP focused tests 실패 확인
- [x] Task 45 GREEN: `evidence_count`와 `merge_readiness`를 shared status, CLI status, MCP schema, web Loops summary에 연결
- [x] Task 45 PRIVACY: evidence refs 원문, unsafe raw path, outcome summary, prompt body가 status/summary surface에 노출되지 않는 회귀 테스트 유지
- [x] Task 46 RED: command-center에 aggregate review-before-merge packet이 없어 domain/web/CLI/MCP focused tests 실패 확인
- [x] Task 46 GREEN: `review_packet` status/summary/counts/actions를 shared status, CLI status, MCP schema, web Loops summary에 연결
- [x] Task 46 PRIVACY: packet은 evidence refs 원문, outcome summary, prompt body, raw path를 포함하지 않는 safe aggregate metadata로 제한
- [x] Task 47 RED: review packet에 explicit human checklist가 없어 domain/web/CLI/MCP focused tests 실패 확인
- [x] Task 47 GREEN: `review_packet.checklist`를 safe aggregate actions에서 생성하고 CLI/MCP/web에 read-only로 노출
- [x] Task 47 PRIVACY: checklist는 label/status/action만 포함하고 evidence refs, outcome summary, prompt body, raw path를 포함하지 않음
- [x] Task 48 DECISION: local merge decision journal은 CLI-only explicit write boundary로 채택하고 MCP/web write는 보류
- [x] Task 48 RED: `loop decision record/list`가 없어 CLI focused tests 실패 확인
- [x] Task 48 GREEN: worktree별 merge/continue/defer decision journal을 SQLite에 기록하고 CLI record/list로 노출
- [x] Task 48 PRIVACY: decision reason은 raw path/secret-looking token을 거부하고 prompt body/evidence refs/git writes/external calls를 포함하지 않음
- [x] Task 49 DECISION: recent merge decisions는 status/MCP/web에 read-only로 노출하고 write boundary는 CLI-only 유지
- [x] Task 49 RED: `activity.recent_decisions`가 없어 domain/CLI/MCP/web focused tests 실패 확인
- [x] Task 49 GREEN: 최근 decision 3개를 `PromptLaneStatus.activity`, CLI status, MCP schema/runtime, API type, web Loops summary에 노출
- [x] Task 49 PRIVACY: recent decision은 snapshot_id/worktree/decision/reason/decided_by/created_at만 포함하고 prompt body/evidence refs/outcome summary/raw path/git write를 포함하지 않음
- [x] Task 50 DECISION: recent decisions는 `review_packet.decision_advisory`로만 반영하고 readiness status/next_action/git state는 변경하지 않음
- [x] Task 50 RED: `review_packet.decision_advisory`가 없어 domain/CLI/MCP/web focused tests 실패 확인
- [x] Task 50 GREEN: continue/defer/merge decision advisory next-action을 review packet에 optional read-only로 노출
- [x] Task 50 PRIVACY: advisory는 summary/next_action만 포함하고 prompt body/evidence refs/outcome summary/raw path/git write를 포함하지 않음
- [x] Task 51 DECISION: selected worktree detail은 matching latest decision을 read-only로 노출하고 web/MCP write는 보류
- [x] Task 51 RED: `/api/v1/loops/worktrees/:worktree`와 selected detail UI에 `latest_decision`이 없어 focused tests 실패 확인
- [x] Task 51 GREEN: selected worktree detail API/type/UI에 latest decision value/reason을 read-only로 노출
- [x] Task 51 PRIVACY: detail decision은 snapshot_id/worktree/decision/reason/decided_by/created_at만 포함하고 recent decisions는 latest project로 scope해 prompt body/evidence refs/outcome summary/raw path/git write/cross-project decision reason을 포함하지 않음
- [x] Task 52 DECISION: selected worktree detail은 raw-free review packet summary/action을 read-only로 노출하고 write/merge/checklist state는 보류
- [x] Task 52 RED: selected detail API/UI에 `review_packet_summary`가 없어 focused tests 실패 확인
- [x] Task 52 GREEN: selected worktree detail API/type/UI에 review packet summary, packet next action, worktree action을 노출
- [x] Task 52 PRIVACY: review packet summary는 aggregate status/summary/action만 포함하고 prompt body/evidence refs/outcome summary/raw path/git write를 포함하지 않음
- [x] Task 53 DECISION: selected worktree detail은 기존 command-center continuation command를 read-only command hint로 노출하고 실행 버튼은 보류
- [x] Task 53 RED: selected detail API/UI에 `review_packet_summary.command_hint`가 없어 focused tests 실패 확인
- [x] Task 53 GREEN: selected worktree detail API/type/UI에 command hint label/command를 read-only로 노출
- [x] Task 53 PRIVACY: command hint는 기존 safe continuation command만 포함하고 prompt body/evidence refs/outcome summary/raw path/git write를 포함하지 않음
- [x] Task 54 DECISION: selected worktree detail은 blocked/missing_evidence 상태에서 raw-free explanation을 노출하고 evidence refs/outcome summary는 보류
- [x] Task 54 RED: blocked selected detail API/UI에 `missing_evidence_explanation`이 없어 focused tests 실패 확인
- [x] Task 54 GREEN: selected worktree detail API/type/UI에 Missing evidence label/reason/next_action을 optional read-only로 노출
- [x] Task 54 PRIVACY: explanation은 safe reason/action만 포함하고 prompt body/evidence refs/outcome summary/raw path/git write를 포함하지 않음
- [x] Task 55 DECISION: selected worktree detail은 command-center checklist에서 selected worktree action과 일치하는 raw-free reviewer checklist preview만 노출
- [x] Task 55 RED: selected detail API/UI에 `reviewer_checklist_preview`가 없어 focused tests 실패 확인
- [x] Task 55 GREEN: selected worktree detail API/type/UI에 required reviewer checklist preview를 read-only로 노출
- [x] Task 55 PRIVACY: preview는 기존 checklist label/status/action만 포함하고 prompt body/evidence refs/outcome summary/raw path/git write를 포함하지 않음
- [x] Task 56 DECISION: selected worktree detail은 ready/needs_review/missing_evidence 모두에 raw-free readiness summary를 노출하고 단일 ready worktree fallback도 허용
- [x] Task 56 RED: selected detail API/UI에 `readiness_summary`가 없고 단일 ready worktree summary가 없어 focused tests 실패 확인
- [x] Task 56 GREEN: selected worktree detail API/type/UI에 readiness summary를 추가하고 command-center가 없는 단일 ready worktree도 같은 summary를 노출
- [x] Task 56 PRIVACY: summary는 safe status/reason/action만 포함하고 prompt body/evidence refs/outcome summary/raw path/git write를 포함하지 않음
- [x] Task 57 DECISION: selected worktree detail은 aggregate evidence_count만 설명하고 evidence ref 문자열/본문은 노출하지 않음
- [x] Task 57 RED: selected detail API/UI에 `evidence_count_explanation`이 없어 focused tests 실패 확인
- [x] Task 57 GREEN: selected worktree detail API/type/UI에 Evidence count label/count/reason을 read-only로 노출
- [x] Task 57 PRIVACY: explanation은 count와 safe reason/action만 포함하고 evidence refs/outcome summary/raw path/git write를 포함하지 않음
- [x] Task 58 DECISION: selected worktree detail은 worktree/session/branch 필터 scope를 raw-free로 설명하고 새 selector/write 기능은 보류
- [x] Task 58 RED: selected detail API/UI에 `selection_scope`가 없어 focused tests 실패 확인
- [x] Task 58 GREEN: selected worktree detail API/type/UI에 Selection scope label/reason/next action을 read-only로 노출
- [x] Task 58 PRIVACY: scope 설명은 explicit filter 종류와 safe reason/action만 포함하고 prompt body/evidence refs/outcome summary/raw path/git write를 포함하지 않음
- [x] Task 59 DECISION: selected worktree detail은 selected snapshot이 전체 최신 loop보다 뒤처지는지 raw-free로 설명하고 wall-clock/git/filesystem reads는 보류
- [x] Task 59 RED: selected detail API/UI에 `snapshot_age`가 없어 focused tests 실패 확인
- [x] Task 59 GREEN: selected worktree detail API/type/UI에 Selected snapshot age status/reason/next action을 read-only로 노출
- [x] Task 59 PRIVACY: age 설명은 selected snapshot timestamp와 safe status/reason/action만 포함하고 prompt body/evidence refs/outcome summary/raw path/git read/write를 포함하지 않음
- [x] Task 60 DECISION: selected worktree detail은 Copy selected brief가 filtered/read-only/no-auto-submit action임을 설명하고 command execution/write는 보류
- [x] Task 60 RED: selected detail API/UI에 `selected_brief_action`이 없어 focused tests 실패 확인
- [x] Task 60 GREEN: selected worktree detail API/type/UI에 Selected brief action reason/command/no-write flags를 read-only로 노출
- [x] Task 60 PRIVACY: action rationale은 selected filters 기반 CLI command와 safe flags만 포함하고 prompt body/evidence refs/outcome summary/raw path/git read/write/external call을 포함하지 않음
- [x] Task 61 DECISION: selected brief는 continuation handoff이고 merge approval이 아니므로 readiness별 merge gate를 별도 rationale로 노출
- [x] Task 61 RED: selected detail API/UI에 `review_packet_summary.brief_rationale`이 없어 focused tests 실패 확인
- [x] Task 61 GREEN: selected worktree detail API/type/UI에 Brief rationale reason/next action/merge gate를 read-only로 노출
- [x] Task 61 PRIVACY: rationale은 readiness status/action만 포함하고 prompt body/evidence refs/outcome summary/raw path/git read/write/external call을 포함하지 않음
- [x] Task 62 DECISION: selected detail guidance가 커졌으므로 API 계약 변경 없이 continuation/merge/evidence section label로 스캔성을 개선
- [x] Task 62 RED: selected detail UI에 `Continuation guidance`, `Merge review guidance`, `Evidence guidance`가 없어 focused web test 실패 확인
- [x] Task 62 GREEN: selected worktree detail UI에 compact section labels를 추가해 focused web test 통과
- [x] Task 62 PRIVACY: section labels만 추가하고 prompt body/evidence refs/outcome summary/raw path/git read/write/external call을 포함하지 않음
- [x] Task 63 DECISION: review packet detail panel이 커졌으므로 API 계약 변경 없이 section wrapper/grid/item 구조로 시각 위계를 개선
- [x] Task 63 RED: selected detail UI에 `loop-worktree-detail`, `loop-detail-section`, `loop-detail-section-title`, `loop-review-grid`, `loop-review-item` 구조가 없어 focused web test 실패 확인
- [x] Task 63 GREEN: selected worktree detail UI/CSS에 compact section wrapper와 responsive review grid를 추가해 focused web test 통과
- [x] Task 63 PRIVACY: presentation classes와 CSS만 추가하고 prompt body/evidence refs/outcome summary/raw path/git read/write/external call을 포함하지 않음
- [x] Task 64 DECISION: review command hint가 여러 command 사이에서 혼동되지 않도록 기존 command-center continuation command에서 온 provenance를 raw-free로 노출
- [x] Task 64 RED: selected detail API/UI에 `review_packet_summary.command_hint.provenance`가 없어 focused server/API/web tests 실패 확인
- [x] Task 64 GREEN: selected worktree detail API/type/UI에 command provenance source/reason/no-write flags를 read-only로 노출
- [x] Task 64 PRIVACY: provenance는 safe selected worktree metadata 출처만 설명하고 prompt body/evidence refs/outcome summary/raw path/git read/write/external call을 포함하지 않음
- [x] Task 65 DECISION: selected continuation command와 review packet command hint는 같은 패널에서 다를 수 있으므로 역할 차이를 raw-free로 설명
- [x] Task 65 RED: selected detail API/UI에 `command_distinction`이 없어 focused server/API/web tests 실패 확인
- [x] Task 65 GREEN: selected worktree detail API/type/UI에 selected command role, review command role, difference reason, no-write flags를 read-only로 노출
- [x] Task 65 PRIVACY: distinction은 command role 차이만 설명하고 prompt body/evidence refs/outcome summary/raw path/git read/write/external call을 포함하지 않음
- [x] Task 66 DECISION: selected detail의 visible command들이 어떤 filter category를 반영하는지 raw-free로 설명
- [x] Task 66 RED: selected detail API/UI에 `command_filters`가 없어 focused server/API/web tests 실패 확인
- [x] Task 66 GREEN: selected worktree detail API/type/UI에 selected/review command filter categories와 no-write flags를 read-only로 노출
- [x] Task 66 PRIVACY: filter explanation은 filter 이름만 포함하고 prompt body/evidence refs/outcome summary/raw path/git read/write/external call을 포함하지 않음
- [x] Task 67 DECISION: selected detail panel의 copy button side effects는 local-first 경계 확인에 필요하므로 raw-free로 요약
- [x] Task 67 RED: selected detail API/UI에 `copy_side_effects`가 없어 focused server/API/web tests 실패 확인
- [x] Task 67 GREEN: selected worktree detail API/type/UI에 clipboard/UI feedback과 no-write/no-external-call flags를 read-only로 노출
- [x] Task 67 PRIVACY: copy side-effect summary는 prompt body/evidence refs/outcome summary/raw path/git read/write/command execution/external call을 포함하지 않음
- [x] Task 68 DECISION: selected detail panel의 paste destination hint는 Codex/Claude Code continuation handoff 연결에 필요하므로 raw-free로 제공
- [x] Task 68 RED: selected detail API/UI에 `paste_destination`이 없어 focused server/API/web tests 실패 확인
- [x] Task 68 GREEN: selected worktree detail API/type/UI에 Codex/Claude Code active request destination과 no-auto-submit/no-write flags를 read-only로 노출
- [x] Task 68 PRIVACY: paste destination hint는 prompt body/evidence refs/outcome summary/raw path/git read/write/command execution/external call을 포함하지 않음
- [x] Task 69 DECISION: selected detail panel의 continuation handoff checklist는 loop memory 작업을 닫기 위해 필요하므로 raw-free로 제공
- [x] Task 69 RED: selected detail API/UI에 `handoff_checklist`가 없어 focused server/API/web tests 실패 확인
- [x] Task 69 GREEN: selected worktree detail API/type/UI에 copy/paste/manual submit/next loop collect steps와 no-write flags를 read-only로 노출
- [x] Task 69 PRIVACY: handoff checklist는 prompt body/evidence refs/outcome summary/raw path/git read/write/transcript read/command execution/external call을 포함하지 않음
- [x] Task 70 DECISION: post-handoff reminder는 next loop collect와 memory approval/merge를 구분하기 위해 필요하므로 raw-free로 제공
- [x] Task 70 RED: selected detail API/UI에 `post_handoff_reminder`가 없어 focused server/API/web tests 실패 확인
- [x] Task 70 GREEN: selected worktree detail API/type/UI에 next loop collect, memory approval separate review, merge separate decision을 read-only로 노출
- [x] Task 70 PRIVACY: post-handoff reminder는 prompt body/evidence refs/outcome summary/raw path/git read/write/transcript read/command execution/external call을 포함하지 않음
- [x] Task 71 DECISION: source-of-truth note는 next loop snapshot을 transcript import가 아닌 local memory input으로 설명하기 위해 필요하므로 raw-free로 제공
- [x] Task 71 RED: selected detail API/UI에 `source_of_truth_note`가 없어 focused server/API/web tests 실패 확인
- [x] Task 71 GREEN: selected worktree detail API/type/UI에 next loop snapshot source-of-truth, no transcript import, no transcript storage flags를 read-only로 노출
- [x] Task 71 PRIVACY: source-of-truth note는 prompt body/evidence refs/outcome summary/raw path/git read/write/transcript storage/transcript import/command execution/external call을 포함하지 않음
- [x] Task 72 DECISION: privacy boundary note는 source-of-truth model의 local DB/Markdown archive 범위와 저장 금지 데이터를 명확히 하기 위해 필요하므로 raw-free로 제공
- [x] Task 72 RED: selected detail API/UI에 `privacy_boundary_note`가 없어 focused server/API/web tests 실패 확인
- [x] Task 72 GREEN: selected worktree detail API/type/UI에 local DB/Markdown archive storage scope, no prompt bodies/transcripts/raw paths/provider credentials, local-only flags를 read-only로 노출
- [x] Task 72 PRIVACY: privacy boundary note는 prompt body/evidence refs/outcome summary/raw path/git read/write/transcript storage/transcript import/credential handling/command execution/external call을 포함하지 않음
- [x] Task 73 DECISION: operator review gate는 continuation handoff가 자동 제출이 아니라 사용자 검토 후 수동 제출임을 명확히 하기 위해 필요하므로 raw-free로 제공
- [x] Task 73 RED: selected detail API/UI에 `operator_review_gate`가 없어 focused server/API/web tests 실패 확인
- [x] Task 73 GREEN: selected worktree detail API/type/UI에 operator review before submit, manual Codex/Claude Code submit, no auto-submit/no command/no write/no merge mutation flags를 read-only로 노출
- [x] Task 73 PRIVACY: operator review gate는 prompt body/evidence refs/outcome summary/raw path/git read/write/transcript read/command execution/automatic submission/external call을 포함하지 않음
- [x] Task 74 DECISION: collection responsibility note는 continuation handoff 이후 next loop snapshot 수집 책임과 트리거를 명확히 하기 위해 필요하므로 raw-free로 제공
- [x] Task 74 RED: selected detail API/UI에 `collection_responsibility_note`가 없어 focused server/API/web tests 실패 확인
- [x] Task 74 GREEN: selected worktree detail API/type/UI에 operator collects next snapshot, collection starts only through operator-run loop collection flow, no transcript watch/no agent UI scrape/no background collect flags를 read-only로 노출
- [x] Task 74 PRIVACY: collection responsibility note는 prompt body/evidence refs/outcome summary/raw path/git read/write/transcript watching/agent UI scraping/background collection/command execution/external call을 포함하지 않음
- [x] Task 75 DECISION: pre-merge advisory는 next loop snapshot 수집/검토 전 merge 판단 보류와 memory approval 분리를 명확히 하기 위해 필요하므로 raw-free로 제공
- [x] Task 75 RED: selected detail API/UI에 `pre_merge_advisory`가 없어 focused server/API/web tests 실패 확인
- [x] Task 75 GREEN: selected worktree detail API/type/UI에 hold merge until next snapshot collected/reviewed, continuation can change readiness, memory approval separate, no merge decision write flags를 read-only로 노출
- [x] Task 75 PRIVACY: pre-merge advisory는 prompt body/evidence refs/outcome summary/raw path/git read/write/memory approval write/merge decision write/command execution/external call을 포함하지 않음
- [x] Task 76 DECISION: post-collection review note는 수집된 loop snapshot quality/evidence 검토가 memory approval/merge readiness보다 먼저임을 명확히 하기 위해 필요하므로 raw-free로 제공
- [x] Task 76 RED: selected detail API/UI에 `post_collection_review_note`가 없어 focused server/API/web tests 실패 확인
- [x] Task 76 GREEN: selected worktree detail API/type/UI에 review collected snapshot quality/evidence before approval, memory approval after review, merge readiness reconsidered after review, no memory/merge write flags를 read-only로 노출
- [x] Task 76 PRIVACY: post-collection review note는 prompt body/evidence refs/outcome summary/raw path/git read/write/memory approval write/merge decision write/command execution/external call을 포함하지 않음
- [x] Task 77 DECISION: continuation safety grouping label은 copy/paste/review/collect/privacy/merge gate 안내들이 하나의 read-only handoff boundary 묶음임을 명확히 하기 위해 필요하므로 raw-free로 제공
- [x] Task 77 RED: selected detail API/UI에 `continuation_safety_group`이 없어 focused server/API/web tests 실패 확인
- [x] Task 77 GREEN: selected worktree detail API/type/UI에 Codex/Claude Code continuation safety scope, included notes, no automation/no write/no external flags를 read-only로 노출
- [x] Task 77 PRIVACY: continuation safety group은 prompt body/evidence refs/outcome summary/raw path/git read/write/transcript import/command execution/memory approval write/merge decision write/external call을 포함하지 않음
- [x] Task 78 DECISION: continuation safety guidance ordering note는 copy/paste 전에 safety guidance를 먼저 검토해야 함을 명확히 하기 위해 필요하므로 raw-free로 제공
- [x] Task 78 RED: selected detail API/UI에 `continuation_safety_ordering_note`가 없어 focused server/API/web tests 실패 확인
- [x] Task 78 GREEN: selected worktree detail API/type/UI에 review safety before copy/paste, follow notes in order, no-write/no-external flags를 read-only로 노출
- [x] Task 78 PRIVACY: continuation safety ordering note는 prompt body/evidence refs/outcome summary/raw path/git read/write/transcript import/command execution/checklist completion state/memory approval write/merge decision write/external call을 포함하지 않음
- [x] Task 79 DECISION: continuation safety non-persistence note는 safety guidance 검토가 저장/동기화된 completed state가 아님을 명확히 하기 위해 필요하므로 raw-free로 제공
- [x] Task 79 RED: selected detail API/UI에 `continuation_safety_non_persistence_note`가 없어 focused server/API/web tests 실패 확인
- [x] Task 79 GREEN: selected worktree detail API/type/UI에 reviewed guidance state not stored/synchronized, re-check before manual submission, no-state/no-external flags를 read-only로 노출
- [x] Task 79 PRIVACY: continuation safety non-persistence note는 prompt body/evidence refs/outcome summary/raw path/git read/write/transcript import/command execution/persisted review state/checklist completion state/memory approval write/merge decision write/external call을 포함하지 않음
- [x] Task 80 DECISION: continuation safety re-check cue는 selected brief copy 이후마다 paste 전에 safety guidance를 다시 확인하게 하기 위해 필요하므로 raw-free로 제공
- [x] Task 80 RED: selected detail API/UI에 `continuation_safety_recheck_cue`가 없어 focused server/API/web tests 실패 확인
- [x] Task 80 GREEN: selected worktree detail API/type/UI에 after each selected brief copy, re-check before Codex/Claude Code paste, no-write/no-external flags를 read-only로 노출
- [x] Task 80 PRIVACY: continuation safety re-check cue는 prompt body/evidence refs/outcome summary/raw path/git read/write/transcript import/command execution/persisted review state/checklist completion state/memory approval write/merge decision write/external call을 포함하지 않음
- [x] Task 81 DECISION: copy feedback reminder는 copied 상태가 clipboard 도달만 의미하고 safety approval/submission이 아님을 명확히 하기 위해 필요하므로 raw-free로 제공
- [x] Task 81 RED: selected detail API/UI에 `continuation_safety_copy_feedback_reminder`가 없어 focused server/API/web tests 실패 확인
- [x] Task 81 GREEN: selected worktree detail API/type/UI에 copied state scope, return to safety re-check cue, no-write/no-external flags를 read-only로 노출
- [x] Task 81 PRIVACY: continuation safety copy feedback reminder는 prompt body/evidence refs/outcome summary/raw path/git read/write/transcript import/command execution/persisted review state/checklist completion state/memory approval write/merge decision write/external call을 포함하지 않음
- [x] Task 82 DECISION: selected-brief copy feedback accessibility note는 copy 상태가 visible command label을 바꾸거나 layout shift를 만들지 않고 accessible feedback으로 전달되어야 함을 명확히 하기 위해 필요하므로 raw-free로 제공
- [x] Task 82 RED: selected detail API/UI에 `continuation_safety_copy_feedback_accessibility_note`가 없어 focused server/API/web tests 실패 확인
- [x] Task 82 GREEN: selected worktree detail API/type/UI에 stable visible label, accessible copied status feedback, no-write/no-external flags를 read-only로 노출
- [x] Task 82 PRIVACY: continuation safety copy feedback accessibility note는 prompt body/evidence refs/outcome summary/raw path/git read/write/transcript import/command execution/persisted review state/checklist completion state/memory approval write/merge decision write/external call을 포함하지 않음
- [x] Task 83 DECISION: selected-brief copy feedback timeout note는 copied feedback이 짧은 local timeout 뒤 사라지는 임시 표시이며 review completion/submission state가 아님을 명확히 하기 위해 필요하므로 raw-free로 제공
- [x] Task 83 RED: selected detail API/UI에 `continuation_safety_copy_feedback_timeout_note`가 없어 focused server/API/web tests 실패 확인
- [x] Task 83 GREEN: selected worktree detail API/type/UI에 short local timeout scope, not review/submission state, no-write/no-external flags를 read-only로 노출
- [x] Task 83 PRIVACY: continuation safety copy feedback timeout note는 prompt body/evidence refs/outcome summary/raw path/git read/write/transcript import/command execution/persisted review state/checklist completion state/memory approval write/merge decision write/external call을 포함하지 않음
- [x] Task 84 DECISION: selected-brief copy feedback failure note는 clipboard failure가 수동 retry를 요구하며 prompt submission/review state 저장이 아님을 명확히 하기 위해 필요하므로 raw-free로 제공
- [x] Task 84 RED: selected detail API/UI에 `continuation_safety_copy_feedback_failure_note`가 없어 focused server/API/web tests 실패 확인
- [x] Task 84 GREEN: selected worktree detail API/type/UI에 manual retry requirement, not prompt submission/review state, no-write/no-external flags를 read-only로 노출
- [x] Task 84 PRIVACY: continuation safety copy feedback failure note는 prompt body/evidence refs/outcome summary/raw path/git read/write/transcript import/command execution/persisted review state/checklist completion state/memory approval write/merge decision write/external call을 포함하지 않음
- [x] Task 85 DECISION: selected-brief copy retry note는 retry가 operator manual action이고 PromptLane이 clipboard write/prompt submission을 자동 retry하지 않음을 명확히 하기 위해 필요하므로 raw-free로 제공
- [x] Task 85 RED: selected detail API/UI에 `continuation_safety_copy_retry_note`가 없어 focused server/API/web tests 실패 확인
- [x] Task 85 GREEN: selected worktree detail API/type/UI에 manual retry scope, no automatic clipboard retry/prompt submission, no-write/no-external flags를 read-only로 노출
- [x] Task 85 PRIVACY: continuation safety copy retry note는 prompt body/evidence refs/outcome summary/raw path/git read/write/transcript import/command execution/persisted review state/checklist completion state/memory approval write/merge decision write/external call을 포함하지 않음
- [x] Task 86 DECISION: selected-brief pre-paste confirmation note는 paste 전에 copied brief와 target agent request를 operator가 확인해야 하며 prompt submission/safety approval이 아님을 명확히 하기 위해 필요하므로 raw-free로 제공
- [x] Task 86 RED: selected detail API/UI에 `continuation_safety_pre_paste_confirmation_note`가 없어 focused server/API/web tests 실패 확인
- [x] Task 86 GREEN: selected worktree detail API/type/UI에 copied brief/target agent request confirmation, not submission/safety approval, no-write/no-external flags를 read-only로 노출
- [x] Task 86 PRIVACY: continuation safety pre-paste confirmation note는 prompt body/evidence refs/outcome summary/raw path/git read/write/transcript import/command execution/persisted review state/checklist completion state/memory approval write/merge decision write/external call을 포함하지 않음
- [x] Task 87 DECISION: selected-brief target-agent check note는 paste 전에 active Codex/Claude Code request box를 operator가 직접 확인해야 하며 PromptLane이 agent UI state/target contents를 inspect하지 않음을 명확히 하기 위해 필요하므로 raw-free로 제공
- [x] Task 87 RED: selected detail API/UI에 `continuation_safety_target_agent_check_note`가 없어 focused server/API/web tests 실패 확인
- [x] Task 87 GREEN: selected worktree detail API/type/UI에 active request box check, no agent UI/target content inspection, no-write/no-external flags를 read-only로 노출
- [x] Task 87 PRIVACY: continuation safety target-agent check note는 prompt body/evidence refs/outcome summary/raw path/target content/active-window title/git read/write/transcript import/command execution/persisted review state/checklist completion state/memory approval write/merge decision write/external call을 포함하지 않음
- [x] Task 88 DECISION: paste destination verification boundary note는 paste destination이 Codex/Claude Code 안에서 operator가 수동 선택하는 경계이며 PromptLane이 active window/target content/paste success를 verify하지 않음을 명확히 하기 위해 필요하므로 raw-free로 제공
- [x] Task 88 RED: selected detail API/UI에 `continuation_safety_paste_destination_boundary_note`가 없어 focused server/API/web tests 실패 확인
- [x] Task 88 GREEN: selected worktree detail API/type/UI에 manual paste destination boundary, no active-window/target-content/paste-success verification, no-write/no-external flags를 read-only로 노출
- [x] Task 88 PRIVACY: continuation safety paste destination boundary note는 prompt body/evidence refs/outcome summary/raw path/target content/active-window title/pasted content/paste result state/git read/write/transcript import/command execution/persisted review state/checklist completion state/memory approval write/merge decision write/external call을 포함하지 않음
- [x] Task 89 DECISION: manual submission boundary note는 pasted brief submit이 Codex/Claude Code 안에서 operator가 수동 수행하는 경계이며 PromptLane이 press enter/click submit/submitted state record를 하지 않음을 명확히 하기 위해 필요하므로 raw-free로 제공
- [x] Task 89 RED: selected detail API/UI에 `continuation_safety_manual_submission_boundary_note`가 없어 focused server/API/web tests 실패 확인
- [x] Task 89 GREEN: selected worktree detail API/type/UI에 manual submission boundary, no enter/click submit/submitted-state record, no-write/no-external flags를 read-only로 노출
- [x] Task 89 PRIVACY: continuation safety manual submission boundary note는 prompt body/evidence refs/outcome summary/raw path/target content/active-window title/pasted content/paste result state/submitted state/git read/write/transcript import/command execution/persisted review state/checklist completion state/memory approval write/merge decision write/external call을 포함하지 않음
- [x] Task 90 DECISION: submission result non-persistence note는 agent response/submission result가 다음 explicit loop snapshot 전까지 PromptLane 밖에 있고 submitted state를 detect/store/sync하지 않음을 명확히 하기 위해 필요하므로 raw-free로 제공
- [x] Task 90 RED: selected detail API/UI에 `continuation_safety_submission_result_non_persistence_note`가 없어 focused server/API/web tests 실패 확인
- [x] Task 90 GREEN: selected worktree detail API/type/UI에 submission result outside PromptLane until explicit snapshot, no submitted-state detect/store/sync, no-write/no-external flags를 read-only로 노출
- [x] Task 90 PRIVACY: continuation safety submission result non-persistence note는 prompt body/evidence refs/outcome summary/raw path/target content/active-window title/pasted content/paste result state/submitted state/agent response content/git read/write/transcript import/command execution/persisted review state/checklist completion state/memory approval write/merge decision write/external call을 포함하지 않음
- [x] Task 91 DECISION: post-submission collection reminder boundary note는 agent response 준비 후 operator가 다음 loop snapshot을 명시적으로 수집해야 하며 PromptLane이 submission/transcript/agent UI activity에서 collection을 시작하지 않음을 명확히 하기 위해 필요하므로 raw-free로 제공
- [x] Task 91 RED: selected detail API/UI에 `continuation_safety_post_submission_collection_reminder_note`가 없어 focused server/API/web tests 실패 확인
- [x] Task 91 GREEN: selected worktree detail API/type/UI에 explicit next loop snapshot collection reminder, no submission/transcript/agent UI activity background collection, no-write/no-external flags를 read-only로 노출
- [x] Task 91 PRIVACY: continuation safety post-submission collection reminder note는 prompt body/evidence refs/outcome summary/raw path/target content/active-window title/pasted content/paste result state/submitted state/agent response content/collection result state/git read/write/transcript import/command execution/persisted review state/checklist completion state/memory approval write/merge decision write/external call을 포함하지 않음
- [x] Task 92 DECISION: collection result non-persistence note는 collection result state가 다음 explicit loop snapshot 기록 전까지 persist되지 않고 PromptLane이 agent UI activity에서 collection result state를 store/sync/infer하지 않음을 명확히 하기 위해 필요하므로 raw-free로 제공
- [x] Task 92 RED: selected detail API/UI에 `continuation_safety_collection_result_non_persistence_note`가 없어 focused server/API/web tests 실패 확인
- [x] Task 92 GREEN: selected worktree detail API/type/UI에 collection result not persisted until explicit snapshot, no store/sync/infer from agent UI activity, no-write/no-external flags를 read-only로 노출
- [x] Task 92 PRIVACY: continuation safety collection result non-persistence note는 prompt body/evidence refs/outcome summary/raw path/target content/active-window title/pasted content/paste result state/submitted state/agent response content/collection result state/git read/write/transcript import/command execution/persisted review state/checklist completion state/memory approval write/merge decision write/external call을 포함하지 않음
- [x] Task 93 DECISION: collection retry boundary note는 retry가 operator가 explicit loop collection flow를 다시 실행하는 수동 경계이며 PromptLane이 collection command나 hidden recovery action을 자동 retry하지 않음을 명확히 하기 위해 필요하므로 raw-free로 제공
- [x] Task 93 RED: selected detail API/UI에 `continuation_safety_collection_retry_boundary_note`가 없어 focused server/API/web tests 실패 확인
- [x] Task 93 GREEN: selected worktree detail API/type/UI에 manual explicit collection retry, no automatic collection command retry/hidden recovery, no-write/no-external flags를 read-only로 노출
- [x] Task 93 PRIVACY: continuation safety collection retry boundary note는 prompt body/evidence refs/outcome summary/raw path/target content/active-window title/pasted content/paste result state/submitted state/agent response content/collection result state/retry result state/git read/write/transcript import/command execution/persisted review state/checklist completion state/memory approval write/merge decision write/external call을 포함하지 않음
- [x] Task 94 DECISION: retry outcome non-persistence note는 retry attempt/outcome이 다음 explicit loop snapshot 전까지 PromptLane 밖에 있고 retry success/failure state를 detect/store/sync하지 않음을 명확히 하기 위해 필요하므로 raw-free로 제공
- [x] Task 94 RED: selected detail API/UI에 `continuation_safety_retry_outcome_non_persistence_note`가 없어 focused server/API/web tests 실패 확인
- [x] Task 94 GREEN: selected worktree detail API/type/UI에 retry attempt/outcome outside PromptLane until explicit snapshot, no retry success/failure detect/store/sync, no-write/no-external flags를 read-only로 노출
- [x] Task 94 PRIVACY: continuation safety retry outcome non-persistence note는 prompt body/evidence refs/outcome summary/raw path/target content/active-window title/pasted content/paste result state/submitted state/agent response content/collection result state/retry result state/git read/write/transcript import/command execution/persisted review state/checklist completion state/memory approval write/merge decision write/external call을 포함하지 않음
- [x] Task 95 DECISION: collection evidence freshness boundary note는 evidence freshness를 latest explicit loop snapshot evidence 기준으로 operator가 확인해야 하며 PromptLane이 git status/transcript/agent UI activity에서 freshness를 verify하지 않음을 명확히 하기 위해 필요하므로 raw-free로 제공
- [x] Task 95 RED: selected detail API/UI에 `continuation_safety_collection_evidence_freshness_boundary_note`가 없어 focused server/API/web tests 실패 확인
- [x] Task 95 GREEN: selected worktree detail API/type/UI에 latest explicit loop snapshot evidence freshness check, no git status/transcript/agent UI freshness verification, no-write/no-external flags를 read-only로 노출
- [x] Task 95 PRIVACY: continuation safety collection evidence freshness boundary note는 prompt body/evidence refs/outcome summary/raw path/target content/active-window title/pasted content/paste result state/submitted state/agent response content/collection result state/retry result state/freshness result state/git read/write/transcript import/command execution/persisted review state/checklist completion state/memory approval write/merge decision write/external call을 포함하지 않음
- [x] Task 96 DECISION: freshness result non-persistence note는 freshness result state가 다음 explicit loop snapshot 전까지 PromptLane 밖에 있고 PromptLane이 freshness result state를 detect/store/sync하지 않음을 명확히 하기 위해 필요하므로 raw-free로 제공
- [x] Task 96 RED: selected detail API/UI에 `continuation_safety_freshness_result_non_persistence_note`가 없어 focused server/API/web tests 실패 확인
- [x] Task 96 GREEN: selected worktree detail API/type/UI에 freshness result outside PromptLane until explicit snapshot, no freshness result detect/store/sync, no-write/no-external flags를 read-only로 노출
- [x] Task 96 PRIVACY: continuation safety freshness result non-persistence note는 prompt body/evidence refs/outcome summary/raw path/target content/active-window title/pasted content/paste result state/submitted state/agent response content/collection result state/retry result state/freshness result state/git read/write/transcript import/command execution/persisted review state/checklist completion state/memory approval write/merge decision write/external call을 포함하지 않음
- [x] Task 97 DECISION: freshness uncertainty collection reminder는 evidence freshness가 uncertain할 때 operator가 새 explicit loop snapshot을 collect해야 하며 PromptLane이 freshness verify나 automatic collection을 시작하지 않음을 명확히 하기 위해 필요하므로 raw-free로 제공
- [x] Task 97 RED: selected detail API/UI에 `continuation_safety_freshness_uncertainty_collection_reminder`가 없어 focused server/API/web tests 실패 확인
- [x] Task 97 GREEN: selected worktree detail API/type/UI에 uncertainty 시 new explicit loop snapshot collection reminder, no freshness verification/automatic collection, no-write/no-external flags를 read-only로 노출
- [x] Task 97 PRIVACY: continuation safety freshness uncertainty collection reminder는 prompt body/evidence refs/outcome summary/raw path/target content/active-window title/pasted content/paste result state/submitted state/agent response content/collection result state/retry result state/freshness result state/git read/write/transcript import/command execution/persisted review state/checklist completion state/memory approval write/merge decision write/external call을 포함하지 않음
- [x] Task 98 DECISION: pre-merge freshness advisory는 merge decision 전에 freshness uncertainty를 review해야 하며 PromptLane이 merge approve나 freshness verify를 하지 않음을 명확히 하기 위해 필요하므로 raw-free로 제공
- [x] Task 98 RED: selected detail API/UI에 `continuation_safety_pre_merge_freshness_advisory`가 없어 focused server/API/web tests 실패 확인
- [x] Task 98 GREEN: selected worktree detail API/type/UI에 review freshness uncertainty before merge decisions, no merge approval/freshness verification, no-write/no-external flags를 read-only로 노출
- [x] Task 98 PRIVACY: continuation safety pre-merge freshness advisory는 prompt body/evidence refs/outcome summary/raw path/target content/active-window title/pasted content/paste result state/submitted state/agent response content/collection result state/retry result state/freshness result state/merge decision state/git read/write/transcript import/command execution/persisted review state/checklist completion state/memory approval write/merge decision write/external call을 포함하지 않음
- [x] Task 99 DECISION: pre-memory-approval freshness advisory는 loop memory approval 전에 freshness uncertainty를 review해야 하며 PromptLane이 memory approve나 freshness verify를 하지 않음을 명확히 하기 위해 필요하므로 raw-free로 제공
- [x] Task 99 RED: selected detail API/UI에 `continuation_safety_pre_memory_approval_freshness_advisory`가 없어 focused server/API/web tests 실패 확인
- [x] Task 99 GREEN: selected worktree detail API/type/UI에 review freshness uncertainty before approving loop memory, no memory approval/freshness verification, no-write/no-external flags를 read-only로 노출
- [x] Task 99 PRIVACY: continuation safety pre-memory-approval freshness advisory는 prompt body/evidence refs/outcome summary/raw path/target content/active-window title/pasted content/paste result state/submitted state/agent response content/collection result state/retry result state/freshness result state/merge decision state/memory approval state/git read/write/transcript import/command execution/persisted review state/checklist completion state/memory approval write/merge decision write/external call을 포함하지 않음
- [x] Task 100 DECISION: post-memory-approval collection reminder는 loop memory approval 후 새 explicit loop snapshot을 collect해야 하며 PromptLane이 memory approval이나 approval state change에서 collection을 자동 시작하지 않음을 명확히 하기 위해 필요하므로 raw-free로 제공
- [x] Task 100 RED: selected detail API/UI에 `continuation_safety_post_memory_approval_collection_reminder`가 없어 focused server/API/web tests 실패 확인
- [x] Task 100 GREEN: selected worktree detail API/type/UI에 collect a new explicit loop snapshot after approving loop memory, no collection from approval/state changes, no-write/no-external flags를 read-only로 노출
- [x] Task 100 PRIVACY: continuation safety post-memory-approval collection reminder는 prompt body/evidence refs/outcome summary/raw path/target content/active-window title/pasted content/paste result state/submitted state/agent response content/collection result state/retry result state/freshness result state/merge decision state/memory approval state/approval result state/git read/write/transcript import/command execution/persisted review state/checklist completion state/memory approval write/merge decision write/external call을 포함하지 않음
- [x] Task 101 DECISION: post-memory-approval collection result non-persistence note는 approval 후 collection result state가 다음 explicit loop snapshot 전까지 PromptLane 밖에 있고 PromptLane이 이를 detect/store/sync하지 않음을 명확히 하기 위해 필요하므로 raw-free로 제공
- [x] Task 101 RED: selected detail API/UI에 `continuation_safety_post_memory_approval_collection_result_non_persistence_note`가 없어 focused server/API/web tests 실패 확인
- [x] Task 101 GREEN: selected worktree detail API/type/UI에 post-approval collection result outside PromptLane until explicit snapshot, no detect/store/sync, no-write/no-external flags를 read-only로 노출
- [x] Task 101 PRIVACY: continuation safety post-memory-approval collection result non-persistence note는 prompt body/evidence refs/outcome summary/raw path/target content/active-window title/pasted content/paste result state/submitted state/agent response content/collection result state/post-approval collection result state/retry result state/freshness result state/merge decision state/memory approval state/approval result state/git read/write/transcript import/command execution/persisted review state/checklist completion state/memory approval write/merge decision write/external call을 포함하지 않음
- [x] Task 102 DECISION: post-memory-approval collection retry boundary note는 retry가 operator가 explicit post-approval loop collection flow를 다시 실행하는 수동 경계이며 PromptLane이 collection command나 hidden recovery action을 자동 retry하지 않음을 명확히 하기 위해 필요하므로 raw-free로 제공
- [x] Task 102 RED: selected detail API/UI에 `continuation_safety_post_memory_approval_collection_retry_boundary_note`가 없어 focused server/API/web tests 실패 확인
- [x] Task 102 GREEN: selected worktree detail API/type/UI에 manual explicit post-approval collection retry, no automatic collection command retry/hidden recovery, no-write/no-external flags를 read-only로 노출
- [x] Task 102 PRIVACY: continuation safety post-memory-approval collection retry boundary note는 prompt body/evidence refs/outcome summary/raw path/target content/active-window title/pasted content/paste result state/submitted state/agent response content/collection result state/post-approval collection result state/retry result state/post-approval retry result state/freshness result state/merge decision state/memory approval state/approval result state/git read/write/transcript import/command execution/persisted review state/checklist completion state/memory approval write/merge decision write/external call을 포함하지 않음
- [x] Task 103 DECISION: post-memory-approval retry outcome non-persistence note는 retry outcome이 다음 explicit loop snapshot 전까지 PromptLane 밖에 있고 PromptLane이 post-approval retry success/failure state를 detect/store/sync하지 않음을 명확히 하기 위해 필요하므로 raw-free로 제공
- [x] Task 103 RED: selected detail API/UI에 `continuation_safety_post_memory_approval_retry_outcome_non_persistence_note`가 없어 focused server/API/web tests 실패 확인
- [x] Task 103 GREEN: selected worktree detail API/type/UI에 post-approval retry outcome outside PromptLane until explicit snapshot, no detect/store/sync retry success/failure, no-write/no-external flags를 read-only로 노출
- [x] Task 103 PRIVACY: continuation safety post-memory-approval retry outcome non-persistence note는 prompt body/evidence refs/outcome summary/raw path/target content/active-window title/pasted content/paste result state/submitted state/agent response content/collection result state/post-approval collection result state/retry result state/post-approval retry result state/retry outcome state/freshness result state/merge decision state/memory approval state/approval result state/git read/write/transcript import/command execution/persisted review state/checklist completion state/memory approval write/merge decision write/external call을 포함하지 않음
- [x] Task 104 DECISION: post-memory-approval retry evidence freshness boundary note는 operator가 retry evidence freshness를 latest explicit loop snapshot 기준으로 확인해야 하고 PromptLane이 git status/transcript/agent UI activity에서 freshness를 verify하지 않음을 명확히 하기 위해 필요하므로 raw-free로 제공
- [x] Task 104 RED: selected detail API/UI에 `continuation_safety_post_memory_approval_retry_evidence_freshness_boundary_note`가 없어 focused server/API/web tests 실패 확인
- [x] Task 104 GREEN: selected worktree detail API/type/UI에 manual post-approval retry freshness review against latest explicit loop snapshot, no git/transcript/UI freshness verification, no-write/no-external flags를 read-only로 노출
- [x] Task 104 PRIVACY: continuation safety post-memory-approval retry evidence freshness boundary note는 prompt body/evidence refs/outcome summary/raw path/target content/active-window title/pasted content/paste result state/submitted state/agent response content/collection result state/post-approval collection result state/retry result state/post-approval retry result state/retry outcome state/freshness result state/retry freshness result state/merge decision state/memory approval state/approval result state/git read/write/transcript import/command execution/persisted review state/checklist completion state/memory approval write/merge decision write/external call을 포함하지 않음
- [x] Task 105 DECISION: post-memory-approval retry freshness result non-persistence note는 freshness review result가 다음 explicit loop snapshot 전까지 PromptLane 밖에 있고 PromptLane이 post-approval retry freshness result state를 detect/store/sync하지 않음을 명확히 하기 위해 필요하므로 raw-free로 제공
- [x] Task 105 RED: selected detail API/UI에 `continuation_safety_post_memory_approval_retry_freshness_result_non_persistence_note`가 없어 focused server/API/web tests 실패 확인
- [x] Task 105 GREEN: selected worktree detail API/type/UI에 post-approval retry freshness result outside PromptLane until explicit snapshot, no detect/store/sync freshness result state, no-write/no-external flags를 read-only로 노출
- [x] Task 105 PRIVACY: continuation safety post-memory-approval retry freshness result non-persistence note는 prompt body/evidence refs/outcome summary/raw path/target content/active-window title/pasted content/paste result state/submitted state/agent response content/collection result state/post-approval collection result state/retry result state/post-approval retry result state/retry outcome state/freshness result state/retry freshness result state/post-approval retry freshness result state/merge decision state/memory approval state/approval result state/git read/write/transcript import/command execution/persisted review state/checklist completion state/memory approval write/merge decision write/external call을 포함하지 않음
- [x] Task 106 DECISION: post-memory-approval retry freshness uncertainty collection reminder는 freshness가 uncertain할 때 operator가 새 explicit loop snapshot을 collect해야 하며 PromptLane이 freshness verify나 automatic collection을 시작하지 않음을 명확히 하기 위해 필요하므로 raw-free로 제공
- [x] Task 106 RED: selected detail API/UI에 `continuation_safety_post_memory_approval_retry_freshness_uncertainty_collection_reminder`가 없어 focused server/API/web tests 실패 확인
- [x] Task 106 GREEN: selected worktree detail API/type/UI에 collect a new explicit loop snapshot when post-approval retry freshness is uncertain, no freshness verification/automatic collection, no-write/no-external flags를 read-only로 노출
- [x] Task 106 PRIVACY: continuation safety post-memory-approval retry freshness uncertainty collection reminder는 prompt body/evidence refs/outcome summary/raw path/target content/active-window title/pasted content/paste result state/submitted state/agent response content/collection result state/post-approval collection result state/retry result state/post-approval retry result state/retry outcome state/freshness result state/retry freshness result state/post-approval retry freshness result state/merge decision state/memory approval state/approval result state/git read/write/transcript import/command execution/persisted review state/checklist completion state/memory approval write/merge decision write/external call을 포함하지 않음
- [x] Task 107 DECISION: post-memory-approval retry pre-memory-approval freshness advisory는 retry 후 loop memory를 다시 승인하기 전에 freshness uncertainty를 검토해야 하며 PromptLane이 memory approval이나 freshness verification을 대신하지 않음을 명확히 하기 위해 필요하므로 raw-free로 제공
- [x] Task 107 RED: selected detail API/UI에 `continuation_safety_post_memory_approval_retry_pre_memory_approval_freshness_advisory`가 없어 focused server/API/web tests 실패 확인
- [x] Task 107 GREEN: selected worktree detail API/type/UI에 review post-approval retry freshness uncertainty before approving loop memory again, no memory approval/freshness verification, no-write/no-external flags를 read-only로 노출
- [x] Task 107 PRIVACY: continuation safety post-memory-approval retry pre-memory-approval freshness advisory는 prompt body/evidence refs/outcome summary/raw path/target content/active-window title/pasted content/paste result state/submitted state/agent response content/collection result state/post-approval collection result state/retry result state/post-approval retry result state/retry outcome state/freshness result state/retry freshness result state/post-approval retry freshness result state/merge decision state/memory approval state/renewed memory approval state/approval result state/git read/write/transcript import/command execution/persisted review state/checklist completion state/memory approval write/merge decision write/external call을 포함하지 않음
- [x] Task 108 DECISION: post-memory-approval retry renewed-memory-approval collection reminder는 retry 후 loop memory를 다시 승인한 뒤에도 새 explicit loop snapshot collection은 operator가 명시적으로 수행해야 하며 PromptLane이 approval state 변화로 자동 collection을 시작하지 않음을 명확히 하기 위해 필요하므로 raw-free로 제공
- [x] Task 108 RED: selected detail API/UI에 `continuation_safety_post_memory_approval_retry_renewed_memory_approval_collection_reminder`가 없어 focused server/API/web tests 실패 확인
- [x] Task 108 GREEN: selected worktree detail API/type/UI에 collect a new explicit loop snapshot after approving loop memory again, no automatic collection from renewed memory approval or approval state changes, no-write/no-external flags를 read-only로 노출
- [x] Task 108 PRIVACY: continuation safety post-memory-approval retry renewed-memory-approval collection reminder는 prompt body/evidence refs/outcome summary/raw path/target content/active-window title/pasted content/paste result state/submitted state/agent response content/collection result state/post-approval collection result state/renewed memory approval collection result state/retry result state/post-approval retry result state/retry outcome state/freshness result state/retry freshness result state/post-approval retry freshness result state/merge decision state/memory approval state/renewed memory approval state/approval result state/git read/write/transcript import/command execution/persisted review state/checklist completion state/memory approval write/merge decision write/external call을 포함하지 않음
- [x] Task 109 DECISION: post-memory-approval retry renewed-memory-approval collection result non-persistence note는 renewed approval 이후 collection 결과가 다음 explicit loop snapshot 전까지 PromptLane 밖에 있으며 PromptLane이 결과 state를 detect/store/sync하지 않음을 명확히 하기 위해 필요하므로 raw-free로 제공
- [x] Task 109 RED: selected detail API/UI에 `continuation_safety_post_memory_approval_retry_renewed_memory_approval_collection_result_non_persistence_note`가 없어 focused server/API/web tests 실패 확인
- [x] Task 109 GREEN: selected worktree detail API/type/UI에 renewed-memory-approval collection result outside PromptLane until explicit snapshot, no detect/store/sync result state, no-write/no-external flags를 read-only로 노출
- [x] Task 109 PRIVACY: continuation safety post-memory-approval retry renewed-memory-approval collection result non-persistence note는 prompt body/evidence refs/outcome summary/raw path/target content/active-window title/pasted content/paste result state/submitted state/agent response content/collection result state/post-approval collection result state/renewed memory approval collection result state/retry result state/post-approval retry result state/retry outcome state/freshness result state/retry freshness result state/post-approval retry freshness result state/merge decision state/memory approval state/renewed memory approval state/approval result state/git read/write/transcript import/command execution/persisted review state/checklist completion state/memory approval write/merge decision write/external call을 포함하지 않음
- [x] Task 110 DECISION: post-memory-approval retry renewed-memory-approval collection uncertainty reminder는 renewed approval 이후 collection 결과가 uncertain하면 operator가 새 explicit loop snapshot을 collect해야 하며 PromptLane이 hidden verification이나 automatic collection을 하지 않음을 명확히 하기 위해 필요하므로 raw-free로 제공
- [x] Task 110 RED: selected detail API/UI에 `continuation_safety_post_memory_approval_retry_renewed_memory_approval_collection_uncertainty_reminder`가 없어 focused server/API/web tests 실패 확인
- [x] Task 110 GREEN: selected worktree detail API/type/UI에 collect a new explicit loop snapshot when renewed-memory-approval collection result is uncertain, no verification/automatic collection, no-write/no-external flags를 read-only로 노출
- [x] Task 110 PRIVACY: continuation safety post-memory-approval retry renewed-memory-approval collection uncertainty reminder는 prompt body/evidence refs/outcome summary/raw path/target content/active-window title/pasted content/paste result state/submitted state/agent response content/collection result state/post-approval collection result state/renewed memory approval collection result state/retry result state/post-approval retry result state/retry outcome state/freshness result state/retry freshness result state/post-approval retry freshness result state/merge decision state/memory approval state/renewed memory approval state/approval result state/git read/write/transcript import/command execution/persisted review state/checklist completion state/memory approval write/merge decision write/external call을 포함하지 않음
- [x] Task 111 DECISION: post-memory-approval retry renewed-memory-approval pre-merge freshness advisory는 renewed approval 이후에도 merge decision 전에 freshness uncertainty를 재검토해야 하며 PromptLane이 merge approval이나 freshness verification을 대신하지 않음을 명확히 하기 위해 필요하므로 raw-free로 제공
- [x] Task 111 RED: selected detail API/UI에 `continuation_safety_post_memory_approval_retry_renewed_memory_approval_pre_merge_freshness_advisory`가 없어 focused server/API/web tests 실패 확인
- [x] Task 111 GREEN: selected worktree detail API/type/UI에 review renewed-memory-approval freshness uncertainty before merge decisions, no merge approval/freshness verification before merge, no-write/no-external flags를 read-only로 노출
- [x] Task 111 PRIVACY: continuation safety post-memory-approval retry renewed-memory-approval pre-merge freshness advisory는 prompt body/evidence refs/outcome summary/raw path/target content/active-window title/pasted content/paste result state/submitted state/agent response content/collection result state/post-approval collection result state/renewed memory approval collection result state/retry result state/post-approval retry result state/retry outcome state/freshness result state/retry freshness result state/post-approval retry freshness result state/merge decision state/memory approval state/renewed memory approval state/approval result state/git read/write/transcript import/command execution/persisted review state/checklist completion state/memory approval write/merge decision write/external call을 포함하지 않음
- [x] Task 112 DECISION: post-memory-approval retry renewed-memory-approval pre-handoff freshness advisory는 renewed approval 이후 continuation handoff 전에 freshness uncertainty를 재검토해야 하며 PromptLane이 handoff approval이나 freshness verification을 대신하지 않음을 명확히 하기 위해 필요하므로 raw-free로 제공
- [x] Task 112 RED: selected detail API/UI에 `continuation_safety_post_memory_approval_retry_renewed_memory_approval_pre_handoff_freshness_advisory`가 없어 focused server/API/web tests 실패 확인
- [x] Task 112 GREEN: selected worktree detail API/type/UI에 review renewed-memory-approval freshness uncertainty before continuation handoff, no handoff approval/freshness verification before handoff, no-write/no-external flags를 read-only로 노출
- [x] Task 112 PRIVACY: continuation safety post-memory-approval retry renewed-memory-approval pre-handoff freshness advisory는 prompt body/evidence refs/outcome summary/raw path/target content/active-window title/pasted content/paste result state/submitted state/agent response content/collection result state/post-approval collection result state/renewed memory approval collection result state/retry result state/post-approval retry result state/retry outcome state/freshness result state/retry freshness result state/post-approval retry freshness result state/merge decision state/handoff approval state/memory approval state/renewed memory approval state/approval result state/git read/write/transcript import/command execution/persisted review state/checklist completion state/memory approval write/merge decision write/external call을 포함하지 않음
- [x] Task 113 DECISION: post-memory-approval retry renewed-memory-approval pre-paste freshness advisory는 renewed approval 이후 Codex/Claude Code로 paste하기 전에 freshness uncertainty를 재검토해야 하며 PromptLane이 paste target approval이나 freshness verification을 대신하지 않음을 명확히 하기 위해 필요하므로 raw-free로 제공
- [x] Task 113 RED: selected detail API/UI에 `continuation_safety_post_memory_approval_retry_renewed_memory_approval_pre_paste_freshness_advisory`가 없어 focused server/API/web tests 실패 확인
- [x] Task 113 GREEN: selected worktree detail API/type/UI에 review renewed-memory-approval freshness uncertainty before pasting into Codex or Claude Code, no paste target approval/freshness verification before paste, no-write/no-external flags를 read-only로 노출
- [x] Task 113 PRIVACY: continuation safety post-memory-approval retry renewed-memory-approval pre-paste freshness advisory는 prompt body/evidence refs/outcome summary/raw path/target content/active-window title/pasted content/paste result state/submitted state/agent response content/collection result state/post-approval collection result state/renewed memory approval collection result state/retry result state/post-approval retry result state/retry outcome state/freshness result state/retry freshness result state/post-approval retry freshness result state/merge decision state/paste target state/handoff approval state/memory approval state/renewed memory approval state/approval result state/git read/write/transcript import/command execution/persisted review state/checklist completion state/memory approval write/merge decision write/external call을 포함하지 않음
- [x] Task 114 DECISION: post-memory-approval retry renewed-memory-approval pre-submit freshness advisory는 renewed approval 이후 Codex/Claude Code에서 submit하기 전에 freshness uncertainty를 재검토해야 하며 PromptLane이 submission approval이나 freshness verification을 대신하지 않음을 명확히 하기 위해 필요하므로 raw-free로 제공
- [x] Task 114 RED: selected detail API/UI에 `continuation_safety_post_memory_approval_retry_renewed_memory_approval_pre_submit_freshness_advisory`가 없어 focused server/API/web tests 실패 확인
- [x] Task 114 GREEN: selected worktree detail API/type/UI에 review renewed-memory-approval freshness uncertainty before submitting in Codex or Claude Code, no submission approval/freshness verification before submit, no-write/no-external flags를 read-only로 노출
- [x] Task 114 PRIVACY: continuation safety post-memory-approval retry renewed-memory-approval pre-submit freshness advisory는 prompt body/evidence refs/outcome summary/raw path/target content/active-window title/pasted content/paste result state/submitted state/agent response content/collection result state/post-approval collection result state/renewed memory approval collection result state/retry result state/post-approval retry result state/retry outcome state/freshness result state/retry freshness result state/post-approval retry freshness result state/merge decision state/paste target state/handoff approval state/submission approval state/memory approval state/renewed memory approval state/approval result state/git read/write/transcript import/command execution/persisted review state/checklist completion state/memory approval write/merge decision write/external call을 포함하지 않음
- [x] Task 115 DECISION: post-memory-approval retry renewed-memory-approval post-submit freshness advisory는 renewed approval 이후 submit 후 freshness가 uncertain하면 operator가 새 explicit loop snapshot을 collect해야 하며 PromptLane이 submitted state/agent response/freshness monitoring을 하지 않음을 명확히 하기 위해 필요하므로 raw-free로 제공
- [x] Task 115 RED: selected detail API/UI에 `continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_freshness_advisory`가 없어 focused server/API/web tests 실패 확인
- [x] Task 115 GREEN: selected detail API/type/UI에 collect a new explicit loop snapshot after submission when renewed-memory-approval freshness is uncertain, no submitted-state/agent-response/freshness monitoring, no-write/no-external flags를 read-only로 노출
- [x] Task 115 PRIVACY: continuation safety post-memory-approval retry renewed-memory-approval post-submit freshness advisory는 prompt body/evidence refs/outcome summary/raw path/target content/active-window title/pasted content/paste result state/submitted state/agent response content/collection result state/post-approval collection result state/renewed memory approval collection result state/retry result state/post-approval retry result state/retry outcome state/freshness result state/retry freshness result state/post-approval retry freshness result state/merge decision state/paste target state/handoff approval state/submission approval state/memory approval state/renewed memory approval state/approval result state/git read/write/transcript import/command execution/persisted review state/checklist completion state/memory approval write/merge decision write/external call을 포함하지 않음
- [x] Task 116 DECISION: post-memory-approval retry renewed-memory-approval post-submit collection result non-persistence note는 post-submit collection 결과가 다음 explicit loop snapshot 전까지 PromptLane 밖에 있고 PromptLane이 post-submit collection result state를 detect/store/sync하지 않음을 명확히 하기 위해 필요하므로 raw-free로 제공
- [x] Task 116 RED: selected detail API/UI에 `continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_collection_result_non_persistence_note`가 없어 focused server/API/web tests 실패 확인
- [x] Task 116 GREEN: selected detail API/type/UI에 post-submit collection result outside PromptLane until explicit snapshot, no detect/store/sync post-submit collection result state, no-write/no-external flags를 read-only로 노출
- [x] Task 116 PRIVACY: continuation safety post-memory-approval retry renewed-memory-approval post-submit collection result non-persistence note는 prompt body/evidence refs/outcome summary/raw path/target content/active-window title/pasted content/paste result state/submitted state/agent response content/collection result state/post-submit collection result state/post-approval collection result state/renewed memory approval collection result state/retry result state/post-approval retry result state/retry outcome state/freshness result state/retry freshness result state/post-approval retry freshness result state/merge decision state/paste target state/handoff approval state/submission approval state/memory approval state/renewed memory approval state/approval result state/git read/write/transcript import/command execution/persisted review state/checklist completion state/memory approval write/merge decision write/external call을 포함하지 않음
- [x] Task 117 DECISION: post-memory-approval retry renewed-memory-approval post-submit collection retry boundary note는 post-submit collection retry가 operator가 explicit flow를 다시 실행하는 수동 경계이며 PromptLane이 post-submit collection command나 hidden recovery action을 자동 retry하지 않음을 명확히 하기 위해 필요하므로 raw-free로 제공
- [x] Task 117 RED: selected detail API/UI에 `continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_collection_retry_boundary_note`가 없어 focused server/API/web tests 실패 확인
- [x] Task 117 GREEN: selected detail API/type/UI에 operator reruns explicit post-submit loop collection flow when retry is needed, no automatic retry/hidden recovery, no-write/no-external flags를 read-only로 노출
- [x] Task 117 PRIVACY: continuation safety post-memory-approval retry renewed-memory-approval post-submit collection retry boundary note는 prompt body/evidence refs/outcome summary/raw path/target content/active-window title/pasted content/paste result state/submitted state/agent response content/collection result state/post-submit collection result state/post-submit retry result state/post-approval collection result state/renewed memory approval collection result state/retry result state/post-approval retry result state/retry outcome state/freshness result state/retry freshness result state/post-approval retry freshness result state/merge decision state/paste target state/handoff approval state/submission approval state/memory approval state/renewed memory approval state/approval result state/git read/write/transcript import/command execution/persisted review state/checklist completion state/memory approval write/merge decision write/external call을 포함하지 않음
- [x] Task 118 DECISION: post-memory-approval retry renewed-memory-approval post-submit retry outcome non-persistence note는 retry attempt/outcome이 다음 explicit loop snapshot 전까지 PromptLane 밖에 있고 retry success/failure state를 detect/store/sync하지 않음을 명확히 하기 위해 필요하므로 raw-free로 제공
- [x] Task 118 RED: selected detail API/UI에 `continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_retry_outcome_non_persistence_note`가 없어 focused server/API/web tests 실패 확인
- [x] Task 118 GREEN: selected detail API/type/UI에 post-submit retry attempt/outcome outside PromptLane until explicit snapshot, no retry success/failure detect/store/sync, no-write/no-external flags를 read-only로 노출
- [x] Task 118 PRIVACY: continuation safety post-memory-approval retry renewed-memory-approval post-submit retry outcome non-persistence note는 prompt body/evidence refs/outcome summary/raw path/target content/active-window title/pasted content/paste result state/submitted state/agent response content/collection result state/post-submit collection result state/post-submit retry result state/retry success/failure state/post-approval collection result state/renewed memory approval collection result state/retry result state/post-approval retry result state/retry outcome state/freshness result state/retry freshness result state/post-approval retry freshness result state/merge decision state/paste target state/handoff approval state/submission approval state/memory approval state/renewed memory approval state/approval result state/git read/write/transcript import/command execution/persisted review state/checklist completion state/memory approval write/merge decision write/external call을 포함하지 않음
- [x] Task 119 DECISION: post-memory-approval retry renewed-memory-approval post-submit retry evidence freshness boundary note는 operator가 post-submit retry evidence freshness를 latest explicit loop snapshot 기준으로 확인하며 PromptLane이 git status/transcript/agent UI activity로 freshness를 verify하지 않음을 명확히 하기 위해 필요하므로 raw-free로 제공
- [x] Task 119 RED: selected detail API/UI에 `continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_retry_evidence_freshness_boundary_note`가 없어 focused server/API/web tests 실패 확인
- [x] Task 119 GREEN: selected detail API/type/UI에 operator checks post-submit retry evidence freshness against latest explicit loop snapshot, no git/transcript/agent UI freshness verification, no-write/no-external flags를 read-only로 노출
- [x] Task 119 PRIVACY: continuation safety post-memory-approval retry renewed-memory-approval post-submit retry evidence freshness boundary note는 prompt body/evidence refs/outcome summary/raw path/target content/active-window title/pasted content/paste result state/submitted state/agent response content/collection result state/post-submit collection result state/post-submit retry result state/retry success/failure state/post-submit retry freshness result state/post-approval collection result state/renewed memory approval collection result state/retry result state/post-approval retry result state/retry outcome state/freshness result state/retry freshness result state/post-approval retry freshness result state/merge decision state/paste target state/handoff approval state/submission approval state/memory approval state/renewed memory approval state/approval result state/git read/write/transcript import/command execution/persisted review state/checklist completion state/memory approval write/merge decision write/external call을 포함하지 않음
- [x] Task 120 DECISION: post-memory-approval retry renewed-memory-approval post-submit retry freshness result non-persistence note는 post-submit retry freshness result가 다음 explicit loop snapshot 전까지 PromptLane 밖에 있고 PromptLane이 freshness result state를 detect/store/sync하지 않음을 명확히 하기 위해 필요하므로 raw-free로 제공
- [x] Task 120 RED: selected detail API/UI에 `continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_retry_freshness_result_non_persistence_note`가 없어 focused server/API/web tests 실패 확인
- [x] Task 120 GREEN: selected detail API/type/UI에 post-submit retry freshness result outside PromptLane until explicit snapshot, no detect/store/sync freshness result state, no-write/no-external flags를 read-only로 노출
- [x] Task 120 PRIVACY: continuation safety post-memory-approval retry renewed-memory-approval post-submit retry freshness result non-persistence note는 prompt body/evidence refs/outcome summary/raw path/target content/active-window title/pasted content/paste result state/submitted state/agent response content/collection result state/post-submit collection result state/post-submit retry result state/retry success/failure state/post-submit retry freshness result state/post-approval collection result state/renewed memory approval collection result state/retry result state/post-approval retry result state/retry outcome state/freshness result state/retry freshness result state/post-approval retry freshness result state/merge decision state/paste target state/handoff approval state/submission approval state/memory approval state/renewed memory approval state/approval result state/git read/write/transcript import/command execution/persisted review state/checklist completion state/memory approval write/merge decision write/external call을 포함하지 않음
- [x] Task 121 DECISION: post-memory-approval retry renewed-memory-approval post-submit retry freshness uncertainty collection reminder는 post-submit retry freshness가 uncertain하면 operator가 새 explicit loop snapshot을 collect해야 하며 PromptLane이 freshness verification이나 collection을 자동 시작하지 않음을 명확히 하기 위해 필요하므로 raw-free로 제공
- [x] Task 121 RED: selected detail API/UI에 `continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_retry_freshness_uncertainty_collection_reminder`가 없어 focused server/API/web tests 실패 확인
- [x] Task 121 GREEN: selected detail API/type/UI에 collect new explicit loop snapshot when post-submit retry freshness is uncertain, no automatic freshness verification/collection start, no-write/no-external flags를 read-only로 노출
- [x] Task 121 PRIVACY: continuation safety post-memory-approval retry renewed-memory-approval post-submit retry freshness uncertainty collection reminder는 prompt body/evidence refs/outcome summary/raw path/target content/active-window title/pasted content/paste result state/submitted state/agent response content/collection result state/post-submit collection result state/post-submit retry result state/retry success/failure state/post-submit retry freshness result state/post-submit retry freshness uncertainty collection result state/post-approval collection result state/renewed memory approval collection result state/retry result state/post-approval retry result state/retry outcome state/freshness result state/retry freshness result state/post-approval retry freshness result state/merge decision state/paste target state/handoff approval state/submission approval state/memory approval state/renewed memory approval state/approval result state/git read/write/transcript import/command execution/persisted review state/checklist completion state/memory approval write/merge decision write/external call을 포함하지 않음
- [x] Task 122 DECISION: post-memory-approval retry renewed-memory-approval post-submit retry pre-memory-approval freshness advisory는 renewed memory approval 전에 post-submit retry freshness uncertainty를 재검토해야 하며 PromptLane이 memory approval이나 freshness verification을 대신하지 않음을 명확히 하기 위해 필요하므로 raw-free로 제공
- [x] Task 122 RED: selected detail API/UI에 `continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_retry_pre_memory_approval_freshness_advisory`가 없어 focused server/API/web tests 실패 확인
- [x] Task 122 GREEN: selected detail API/type/UI에 review post-submit retry freshness uncertainty before approving loop memory again, no memory approval/freshness verification from advisory, no-write/no-external flags를 read-only로 노출
- [x] Task 122 PRIVACY: continuation safety post-memory-approval retry renewed-memory-approval post-submit retry pre-memory-approval freshness advisory는 prompt body/evidence refs/outcome summary/raw path/target content/active-window title/pasted content/paste result state/submitted state/agent response content/collection result state/post-submit collection result state/post-submit retry result state/retry success/failure state/post-submit retry freshness result state/post-submit retry freshness uncertainty collection result state/post-submit retry renewed memory approval state/post-approval collection result state/renewed memory approval collection result state/retry result state/post-approval retry result state/retry outcome state/freshness result state/retry freshness result state/post-approval retry freshness result state/merge decision state/paste target state/handoff approval state/submission approval state/memory approval state/renewed memory approval state/approval result state/git read/write/transcript import/command execution/persisted review state/checklist completion state/memory approval write/merge decision write/external call을 포함하지 않음
- [x] Task 123 DECISION: post-memory-approval retry renewed-memory-approval post-submit retry renewed-memory-approval collection reminder는 post-submit retry 이후 renewed memory approval 다음 explicit loop snapshot 수집 책임을 사용자에게 되돌려야 하므로 raw-free로 제공
- [x] Task 123 RED: selected detail API/UI에 `continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_retry_renewed_memory_approval_collection_reminder`가 없어 focused server/API/web tests 실패 확인
- [x] Task 123 GREEN: selected detail API/type/UI에 collect a new explicit loop snapshot after approving loop memory again after post-submit retry, no hidden approval signal collection, no-write/no-external flags를 read-only로 노출
- [x] Task 123 PRIVACY: continuation safety post-memory-approval retry renewed-memory-approval post-submit retry renewed-memory-approval collection reminder는 prompt body/evidence refs/outcome summary/raw path/target content/active-window title/pasted content/paste result state/submitted state/agent response content/collection result state/post-submit collection result state/post-submit retry result state/retry success/failure state/post-submit retry freshness result state/post-submit retry freshness uncertainty collection result state/post-submit retry renewed memory approval state/post-approval collection result state/renewed memory approval collection result state/post-submit retry renewed-memory-approval collection result state/retry result state/post-approval retry result state/retry outcome state/freshness result state/retry freshness result state/post-approval retry freshness result state/merge decision state/paste target state/handoff approval state/submission approval state/memory approval state/renewed memory approval state/approval result state/git read/write/transcript import/command execution/persisted review state/checklist completion state/memory approval write/merge decision write/external call을 포함하지 않음
- [x] Task 124 DECISION: post-memory-approval retry renewed-memory-approval post-submit retry renewed-memory-approval collection result non-persistence note는 collection reminder가 collection completion tracking을 암시하지 않도록 결과 state가 다음 explicit loop snapshot 전까지 PromptLane 밖에 있음을 명확히 하기 위해 필요하므로 raw-free로 제공
- [x] Task 124 RED: selected detail API/UI에 `continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_retry_renewed_memory_approval_collection_result_non_persistence_note`가 없어 focused server/API/web tests 실패 확인
- [x] Task 124 GREEN: selected detail API/type/UI에 post-submit retry renewed-memory-approval collection result stays outside PromptLane until the next explicit loop snapshot, no detect/store/sync, no-write/no-external flags를 read-only로 노출
- [x] Task 124 PRIVACY: continuation safety post-memory-approval retry renewed-memory-approval post-submit retry renewed-memory-approval collection result non-persistence note는 prompt body/evidence refs/outcome summary/raw path/target content/active-window title/pasted content/paste result state/submitted state/agent response content/collection result state/post-submit collection result state/post-submit retry result state/retry success/failure state/post-submit retry freshness result state/post-submit retry freshness uncertainty collection result state/post-submit retry renewed memory approval state/post-approval collection result state/renewed memory approval collection result state/post-submit retry renewed-memory-approval collection result state/retry result state/post-approval retry result state/retry outcome state/freshness result state/retry freshness result state/post-approval retry freshness result state/merge decision state/paste target state/handoff approval state/submission approval state/memory approval state/renewed memory approval state/approval result state/git read/write/transcript import/command execution/persisted review state/checklist completion state/memory approval write/merge decision write/external call을 포함하지 않음
- [x] Task 125 DECISION: post-memory-approval retry renewed-memory-approval post-submit retry renewed-memory-approval collection uncertainty reminder는 해당 collection result가 uncertain하면 operator가 새 explicit loop snapshot을 collect해야 하며 PromptLane이 result verification이나 automatic collection을 하지 않음을 명확히 하기 위해 필요하므로 raw-free로 제공
- [x] Task 125 RED: selected detail API/UI에 `continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_retry_renewed_memory_approval_collection_uncertainty_reminder`가 없어 focused server/API/web tests 실패 확인
- [x] Task 125 GREEN: selected detail API/type/UI에 collect a new explicit loop snapshot when post-submit retry renewed-memory-approval collection result is uncertain, no result verification/automatic collection start, no-write/no-external flags를 read-only로 노출
- [x] Task 125 PRIVACY: continuation safety post-memory-approval retry renewed-memory-approval post-submit retry renewed-memory-approval collection uncertainty reminder는 prompt body/evidence refs/outcome summary/raw path/target content/active-window title/pasted content/paste result state/submitted state/agent response content/collection result state/post-submit collection result state/post-submit retry result state/retry success/failure state/post-submit retry freshness result state/post-submit retry freshness uncertainty collection result state/post-submit retry renewed memory approval state/post-approval collection result state/renewed memory approval collection result state/post-submit retry renewed-memory-approval collection result state/uncertainty result state/retry result state/post-approval retry result state/retry outcome state/freshness result state/retry freshness result state/post-approval retry freshness result state/merge decision state/paste target state/handoff approval state/submission approval state/memory approval state/renewed memory approval state/approval result state/git read/write/transcript import/command execution/persisted review state/checklist completion state/memory approval write/merge decision write/external call을 포함하지 않음
- [x] Task 126 DECISION: post-memory-approval retry renewed-memory-approval post-submit retry renewed-memory-approval pre-merge freshness advisory는 merge decision 전에 post-submit retry renewed-memory-approval freshness uncertainty를 재검토해야 하며 PromptLane이 merge approval이나 freshness verification을 대신하지 않음을 명확히 하기 위해 필요하므로 raw-free로 제공
- [x] Task 126 RED: selected detail API/UI에 `continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_retry_renewed_memory_approval_pre_merge_freshness_advisory`가 없어 focused server/API/web tests 실패 확인
- [x] Task 126 GREEN: selected detail API/type/UI에 review post-submit retry renewed-memory-approval freshness uncertainty before merge decisions, no merge approval/freshness verification before merge, no-write/no-external flags를 read-only로 노출
- [x] Task 126 PRIVACY: continuation safety post-memory-approval retry renewed-memory-approval post-submit retry renewed-memory-approval pre-merge freshness advisory는 prompt body/evidence refs/outcome summary/raw path/target content/active-window title/pasted content/paste result state/submitted state/agent response content/collection result state/post-submit collection result state/post-submit retry result state/retry success/failure state/post-submit retry freshness result state/post-submit retry freshness uncertainty collection result state/post-submit retry renewed memory approval state/post-approval collection result state/renewed memory approval collection result state/post-submit retry renewed-memory-approval collection result state/uncertainty result state/retry result state/post-approval retry result state/retry outcome state/freshness result state/retry freshness result state/post-approval retry freshness result state/merge decision state/paste target state/handoff approval state/submission approval state/memory approval state/renewed memory approval state/approval result state/git read/write/transcript import/command execution/persisted review state/checklist completion state/memory approval write/merge decision write/external call을 포함하지 않음
- [x] Task 127 DECISION: post-memory-approval retry renewed-memory-approval post-submit retry renewed-memory-approval pre-handoff freshness advisory는 continuation handoff 전에 post-submit retry renewed-memory-approval freshness uncertainty를 재검토해야 하며 PromptLane이 handoff approval이나 freshness verification을 대신하지 않음을 명확히 하기 위해 필요하므로 raw-free로 제공
- [x] Task 127 RED: selected detail API/UI에 `continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_retry_renewed_memory_approval_pre_handoff_freshness_advisory`가 없어 focused server/API/web tests 실패 확인
- [x] Task 127 GREEN: selected detail API/type/UI에 review post-submit retry renewed-memory-approval freshness uncertainty before continuation handoff, no handoff approval/freshness verification before handoff, no-write/no-external flags를 read-only로 노출
- [x] Task 127 PRIVACY: continuation safety post-memory-approval retry renewed-memory-approval post-submit retry renewed-memory-approval pre-handoff freshness advisory는 prompt body/evidence refs/outcome summary/raw path/target content/active-window title/pasted content/paste result state/submitted state/agent response content/collection result state/post-submit collection result state/post-submit retry result state/retry success/failure state/post-submit retry freshness result state/post-submit retry freshness uncertainty collection result state/post-submit retry renewed memory approval state/post-approval collection result state/renewed memory approval collection result state/post-submit retry renewed-memory-approval collection result state/uncertainty result state/retry result state/post-approval retry result state/retry outcome state/freshness result state/retry freshness result state/post-approval retry freshness result state/merge decision state/paste target state/handoff approval state/submission approval state/memory approval state/renewed memory approval state/approval result state/git read/write/transcript import/command execution/persisted review state/checklist completion state/memory approval write/merge decision write/external call을 포함하지 않음
- [x] Task 128 DECISION: post-memory-approval retry renewed-memory-approval post-submit retry renewed-memory-approval pre-paste freshness advisory는 Codex/Claude Code로 paste하기 전에 post-submit retry renewed-memory-approval freshness uncertainty를 재검토해야 하며 PromptLane이 paste target approval이나 freshness verification을 대신하지 않음을 명확히 하기 위해 필요하므로 raw-free로 제공
- [x] Task 128 RED: selected detail API/UI에 `continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_retry_renewed_memory_approval_pre_paste_freshness_advisory`가 없어 focused server/API/web tests 실패 확인
- [x] Task 128 GREEN: selected detail API/type/UI에 review post-submit retry renewed-memory-approval freshness uncertainty before pasting into Codex or Claude Code, no paste target approval/freshness verification before paste, no-write/no-external flags를 read-only로 노출
- [x] Task 128 PRIVACY: continuation safety post-memory-approval retry renewed-memory-approval post-submit retry renewed-memory-approval pre-paste freshness advisory는 prompt body/evidence refs/outcome summary/raw path/target content/active-window title/pasted content/paste result state/submitted state/agent response content/collection result state/post-submit collection result state/post-submit retry result state/retry success/failure state/post-submit retry freshness result state/post-submit retry freshness uncertainty collection result state/post-submit retry renewed memory approval state/post-approval collection result state/renewed memory approval collection result state/post-submit retry renewed-memory-approval collection result state/uncertainty result state/retry result state/post-approval retry result state/retry outcome state/freshness result state/retry freshness result state/post-approval retry freshness result state/merge decision state/paste target state/handoff approval state/submission approval state/memory approval state/renewed memory approval state/approval result state/git read/write/transcript import/command execution/persisted review state/checklist completion state/memory approval write/merge decision write/external call을 포함하지 않음
- [x] Task 129 DECISION: post-memory-approval retry renewed-memory-approval post-submit retry renewed-memory-approval pre-submit freshness advisory는 Codex/Claude Code에서 submit하기 전에 post-submit retry renewed-memory-approval freshness uncertainty를 재검토해야 하며 PromptLane이 submission approval이나 freshness verification을 대신하지 않음을 명확히 하기 위해 필요하므로 raw-free로 제공
- [x] Task 129 RED: selected detail API/UI에 `continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_retry_renewed_memory_approval_pre_submit_freshness_advisory`가 없어 focused server/API/web tests 실패 확인
- [x] Task 129 GREEN: selected detail API/type/UI에 review post-submit retry renewed-memory-approval freshness uncertainty before submitting in Codex or Claude Code, no submission approval/freshness verification before submit, no-write/no-external flags를 read-only로 노출
- [x] Task 129 PRIVACY: continuation safety post-memory-approval retry renewed-memory-approval post-submit retry renewed-memory-approval pre-submit freshness advisory는 prompt body/evidence refs/outcome summary/raw path/target content/active-window title/pasted content/paste result state/submitted state/agent response content/collection result state/post-submit collection result state/post-submit retry result state/retry success/failure state/post-submit retry freshness result state/post-submit retry freshness uncertainty collection result state/post-submit retry renewed memory approval state/post-approval collection result state/renewed memory approval collection result state/post-submit retry renewed-memory-approval collection result state/uncertainty result state/retry result state/post-approval retry result state/retry outcome state/freshness result state/retry freshness result state/post-approval retry freshness result state/merge decision state/paste target state/handoff approval state/submission approval state/memory approval state/renewed memory approval state/approval result state/git read/write/transcript import/command execution/persisted review state/checklist completion state/memory approval write/merge decision write/external call을 포함하지 않음
- [x] Task 130 DECISION: post-memory-approval retry renewed-memory-approval post-submit retry renewed-memory-approval post-submit freshness advisory는 submit 후 post-submit retry renewed-memory-approval freshness가 uncertain하면 operator가 새 explicit loop snapshot을 collect해야 하며 PromptLane이 submitted state/agent response/freshness monitoring을 하지 않음을 명확히 하기 위해 필요하므로 raw-free로 제공
- [x] Task 130 RED: selected detail API/UI에 `continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_retry_renewed_memory_approval_post_submit_freshness_advisory`가 없어 focused server/API/web tests 실패 확인
- [x] Task 130 GREEN: selected detail API/type/UI에 collect a new explicit loop snapshot after submission when post-submit retry renewed-memory-approval freshness is uncertain, no submitted-state/agent-response/freshness monitoring, no-write/no-external flags를 read-only로 노출
- [x] Task 130 PRIVACY: continuation safety post-memory-approval retry renewed-memory-approval post-submit retry renewed-memory-approval post-submit freshness advisory는 prompt body/evidence refs/outcome summary/raw path/target content/active-window title/pasted content/paste result state/submitted state/agent response content/collection result state/post-submit collection result state/post-submit retry result state/retry success/failure state/post-submit retry freshness result state/post-submit retry freshness uncertainty collection result state/post-submit retry renewed memory approval state/post-approval collection result state/renewed memory approval collection result state/post-submit retry renewed-memory-approval collection result state/uncertainty result state/freshness monitoring state/retry result state/post-approval retry result state/retry outcome state/freshness result state/retry freshness result state/post-approval retry freshness result state/merge decision state/paste target state/handoff approval state/submission approval state/memory approval state/renewed memory approval state/approval result state/git read/write/transcript import/command execution/persisted review state/checklist completion state/memory approval write/merge decision write/external call을 포함하지 않음
- [x] Task 131 DECISION: post-memory-approval retry renewed-memory-approval post-submit retry renewed-memory-approval post-submit collection result non-persistence note는 submit 후 collection 결과가 다음 explicit loop snapshot 전까지 PromptLane 밖에 있고 PromptLane이 결과 state를 detect/store/sync하지 않음을 명확히 하기 위해 필요하므로 raw-free로 제공
- [x] Task 131 RED: selected detail API/UI에 `continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_retry_renewed_memory_approval_post_submit_collection_result_non_persistence_note`가 없어 focused server/API/web tests 실패 확인
- [x] Task 131 GREEN: selected detail API/type/UI에 post-submit retry renewed-memory-approval post-submit collection result outside PromptLane until explicit snapshot, no detect/store/sync, no-write/no-external flags를 read-only로 노출
- [x] Task 131 PRIVACY: continuation safety post-memory-approval retry renewed-memory-approval post-submit retry renewed-memory-approval post-submit collection result non-persistence note는 prompt body/evidence refs/outcome summary/raw path/target content/active-window title/pasted content/paste result state/submitted state/agent response content/collection result state/post-submit collection result state/post-submit retry result state/retry success/failure state/post-submit retry freshness result state/post-submit retry freshness uncertainty collection result state/post-submit retry renewed memory approval state/post-approval collection result state/renewed memory approval collection result state/post-submit retry renewed-memory-approval collection result state/post-submit retry renewed-memory-approval post-submit collection result state/uncertainty result state/freshness monitoring state/retry result state/post-approval retry result state/retry outcome state/freshness result state/retry freshness result state/post-approval retry freshness result state/merge decision state/paste target state/handoff approval state/submission approval state/memory approval state/renewed memory approval state/approval result state/git read/write/transcript import/command execution/persisted review state/checklist completion state/memory approval write/merge decision write/external call을 포함하지 않음
- [x] Task 132 DECISION: post-memory-approval retry renewed-memory-approval post-submit retry renewed-memory-approval post-submit collection uncertainty reminder는 post-submit collection result가 uncertain하면 operator가 새 explicit loop snapshot을 collect해야 하며 PromptLane이 result verification이나 automatic collection을 하지 않음을 명확히 하기 위해 필요하므로 raw-free로 제공
- [x] Task 132 RED: selected detail API/UI에 `continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_retry_renewed_memory_approval_post_submit_collection_uncertainty_reminder`가 없어 focused server/API/web tests 실패 확인
- [x] Task 132 GREEN: selected detail API/type/UI에 collect new explicit loop snapshot when post-submit retry renewed-memory-approval post-submit collection result is uncertain, no result verification/automatic collection start, no-write/no-external flags를 read-only로 노출
- [x] Task 132 PRIVACY: continuation safety post-memory-approval retry renewed-memory-approval post-submit retry renewed-memory-approval post-submit collection uncertainty reminder는 prompt body/evidence refs/outcome summary/raw path/target content/active-window title/pasted content/paste result state/submitted state/agent response content/collection result state/post-submit collection result state/post-submit retry result state/retry success/failure state/post-submit retry freshness result state/post-submit retry freshness uncertainty collection result state/post-submit retry renewed memory approval state/post-approval collection result state/renewed memory approval collection result state/post-submit retry renewed-memory-approval collection result state/post-submit retry renewed-memory-approval post-submit collection result state/post-submit retry renewed-memory-approval post-submit collection uncertainty result state/uncertainty result state/freshness monitoring state/retry result state/post-approval retry result state/retry outcome state/freshness result state/retry freshness result state/post-approval retry freshness result state/merge decision state/paste target state/handoff approval state/submission approval state/memory approval state/renewed memory approval state/approval result state/git read/write/transcript import/command execution/persisted review state/checklist completion state/memory approval write/merge decision write/external call을 포함하지 않음
- [x] Task 133 DECISION: post-memory-approval retry renewed-memory-approval post-submit retry renewed-memory-approval post-submit collection pre-merge freshness advisory는 merge decision 전에 post-submit collection freshness uncertainty를 재검토해야 하며 PromptLane이 merge approval이나 freshness verification을 대신하지 않음을 명확히 하기 위해 필요하므로 raw-free로 제공
- [x] Task 133 RED: selected detail API/UI에 `continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_retry_renewed_memory_approval_post_submit_collection_pre_merge_freshness_advisory`가 없어 focused server/API/web tests 실패 확인
- [x] Task 133 GREEN: selected detail API/type/UI에 review post-submit retry renewed-memory-approval post-submit collection freshness uncertainty before merge decisions, no merge approval/freshness verification before merge, no-write/no-external flags를 read-only로 노출
- [x] Task 133 PRIVACY: continuation safety post-memory-approval retry renewed-memory-approval post-submit retry renewed-memory-approval post-submit collection pre-merge freshness advisory는 prompt body/evidence refs/outcome summary/raw path/target content/active-window title/pasted content/paste result state/submitted state/agent response content/collection result state/post-submit collection result state/post-submit retry result state/retry success/failure state/post-submit retry freshness result state/post-submit retry freshness uncertainty collection result state/post-submit retry renewed memory approval state/post-approval collection result state/renewed memory approval collection result state/post-submit retry renewed-memory-approval collection result state/post-submit retry renewed-memory-approval post-submit collection result state/post-submit retry renewed-memory-approval post-submit collection uncertainty result state/post-submit retry renewed-memory-approval post-submit collection freshness result state/uncertainty result state/freshness monitoring state/retry result state/post-approval retry result state/retry outcome state/freshness result state/retry freshness result state/post-approval retry freshness result state/merge decision state/paste target state/handoff approval state/submission approval state/memory approval state/renewed memory approval state/approval result state/git read/write/transcript import/command execution/persisted review state/checklist completion state/memory approval write/merge decision write/external call을 포함하지 않음
- [x] Task 134 DECISION: post-memory-approval retry renewed-memory-approval post-submit retry renewed-memory-approval post-submit collection pre-handoff freshness advisory는 continuation handoff 전에 post-submit collection freshness uncertainty를 재검토해야 하며 PromptLane이 handoff approval이나 freshness verification을 대신하지 않음을 명확히 하기 위해 필요하므로 raw-free로 제공
- [x] Task 134 RED: selected detail API/UI에 `continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_retry_renewed_memory_approval_post_submit_collection_pre_handoff_freshness_advisory`가 없어 focused server/API/web tests 실패 확인
- [x] Task 134 GREEN: selected detail API/type/UI에 review post-submit retry renewed-memory-approval post-submit collection freshness uncertainty before continuation handoff, no handoff approval/freshness verification before handoff, no-write/no-external flags를 read-only로 노출
- [x] Task 134 PRIVACY: continuation safety post-memory-approval retry renewed-memory-approval post-submit retry renewed-memory-approval post-submit collection pre-handoff freshness advisory는 prompt body/evidence refs/outcome summary/raw path/target content/active-window title/pasted content/paste result state/submitted state/agent response content/collection result state/post-submit collection result state/post-submit retry result state/retry success/failure state/post-submit retry freshness result state/post-submit retry freshness uncertainty collection result state/post-submit retry renewed memory approval state/post-approval collection result state/renewed memory approval collection result state/post-submit retry renewed-memory-approval collection result state/post-submit retry renewed-memory-approval post-submit collection result state/post-submit retry renewed-memory-approval post-submit collection uncertainty result state/post-submit retry renewed-memory-approval post-submit collection freshness result state/uncertainty result state/freshness monitoring state/retry result state/post-approval retry result state/retry outcome state/freshness result state/retry freshness result state/post-approval retry freshness result state/merge decision state/paste target state/handoff approval state/submission approval state/memory approval state/renewed memory approval state/approval result state/git read/write/transcript import/command execution/persisted review state/checklist completion state/memory approval write/merge decision write/external call을 포함하지 않음
- [x] Task 135 DECISION: post-memory-approval retry renewed-memory-approval post-submit retry renewed-memory-approval post-submit collection pre-paste freshness advisory는 Codex/Claude Code로 paste하기 전에 post-submit collection freshness uncertainty를 재검토해야 하며 PromptLane이 paste target approval이나 freshness verification을 대신하지 않음을 명확히 하기 위해 필요하므로 raw-free로 제공
- [x] Task 135 RED: selected detail API/UI에 `continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_retry_renewed_memory_approval_post_submit_collection_pre_paste_freshness_advisory`가 없어 focused server/API/web tests 실패 확인
- [x] Task 135 GREEN: selected detail API/type/UI에 review post-submit retry renewed-memory-approval post-submit collection freshness uncertainty before pasting into Codex or Claude Code, no paste target approval/freshness verification before paste, no-write/no-external flags를 read-only로 노출
- [x] Task 135 PRIVACY: continuation safety post-memory-approval retry renewed-memory-approval post-submit retry renewed-memory-approval post-submit collection pre-paste freshness advisory는 prompt body/evidence refs/outcome summary/raw path/target content/active-window title/pasted content/paste result state/submitted state/agent response content/collection result state/post-submit collection result state/post-submit retry result state/retry success/failure state/post-submit retry freshness result state/post-submit retry freshness uncertainty collection result state/post-submit retry renewed memory approval state/post-approval collection result state/renewed memory approval collection result state/post-submit retry renewed-memory-approval collection result state/post-submit retry renewed-memory-approval post-submit collection result state/post-submit retry renewed-memory-approval post-submit collection uncertainty result state/post-submit retry renewed-memory-approval post-submit collection freshness result state/uncertainty result state/freshness monitoring state/retry result state/post-approval retry result state/retry outcome state/freshness result state/retry freshness result state/post-approval retry freshness result state/merge decision state/paste target state/handoff approval state/submission approval state/memory approval state/renewed memory approval state/approval result state/git read/write/transcript import/command execution/persisted review state/checklist completion state/memory approval write/merge decision write/external call을 포함하지 않음
- [x] Task 136 DECISION: post-memory-approval retry renewed-memory-approval post-submit retry renewed-memory-approval post-submit collection pre-submit freshness advisory는 Codex/Claude Code에서 submit하기 전에 post-submit collection freshness uncertainty를 재검토해야 하며 PromptLane이 submission approval이나 freshness verification을 대신하지 않음을 명확히 하기 위해 필요하므로 raw-free로 제공
- [x] Task 136 RED: selected detail API/UI에 `continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_retry_renewed_memory_approval_post_submit_collection_pre_submit_freshness_advisory`가 없어 focused server/API/web tests 실패 확인
- [x] Task 136 GREEN: selected detail API/type/UI에 review post-submit retry renewed-memory-approval post-submit collection freshness uncertainty before submitting in Codex or Claude Code, no submission approval/freshness verification before submit, no-write/no-external flags를 read-only로 노출
- [x] Task 136 PRIVACY: continuation safety post-memory-approval retry renewed-memory-approval post-submit retry renewed-memory-approval post-submit collection pre-submit freshness advisory는 prompt body/evidence refs/outcome summary/raw path/target content/active-window title/pasted content/paste result state/submitted state/agent response content/collection result state/post-submit collection result state/post-submit retry result state/retry success/failure state/post-submit retry freshness result state/post-submit retry freshness uncertainty collection result state/post-submit retry renewed memory approval state/post-approval collection result state/renewed memory approval collection result state/post-submit retry renewed-memory-approval collection result state/post-submit retry renewed-memory-approval post-submit collection result state/post-submit retry renewed-memory-approval post-submit collection uncertainty result state/post-submit retry renewed-memory-approval post-submit collection freshness result state/uncertainty result state/freshness monitoring state/retry result state/post-approval retry result state/retry outcome state/freshness result state/retry freshness result state/post-approval retry freshness result state/merge decision state/paste target state/handoff approval state/submission approval state/memory approval state/renewed memory approval state/approval result state/git read/write/transcript import/command execution/persisted review state/checklist completion state/memory approval write/merge decision write/external call을 포함하지 않음
- [x] Task 137 DECISION: post-memory-approval retry renewed-memory-approval post-submit retry renewed-memory-approval post-submit collection post-submit freshness advisory는 submit 후 post-submit collection freshness가 uncertain하면 operator가 새 explicit loop snapshot을 collect해야 하며 PromptLane이 submitted state/agent response/freshness monitoring을 하지 않음을 명확히 하기 위해 필요하므로 raw-free로 제공
- [x] Task 137 RED: selected detail API/UI에 `continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_retry_renewed_memory_approval_post_submit_collection_post_submit_freshness_advisory`가 없어 focused server/API/web tests 실패 확인
- [x] Task 137 GREEN: selected detail API/type/UI에 collect a new explicit loop snapshot after submission when post-submit retry renewed-memory-approval post-submit collection freshness is uncertain, no submitted state/agent response/freshness monitoring, no-write/no-external flags를 read-only로 노출
- [x] Task 137 PRIVACY: continuation safety post-memory-approval retry renewed-memory-approval post-submit retry renewed-memory-approval post-submit collection post-submit freshness advisory는 prompt body/evidence refs/outcome summary/raw path/target content/active-window title/pasted content/paste result state/submitted state/agent response content/collection result state/post-submit collection result state/post-submit retry result state/retry success/failure state/post-submit retry freshness result state/post-submit retry freshness uncertainty collection result state/post-submit retry renewed memory approval state/post-approval collection result state/renewed memory approval collection result state/post-submit retry renewed-memory-approval collection result state/post-submit retry renewed-memory-approval post-submit collection result state/post-submit retry renewed-memory-approval post-submit collection uncertainty result state/post-submit retry renewed-memory-approval post-submit collection freshness result state/uncertainty result state/freshness monitoring state/retry result state/post-approval retry result state/retry outcome state/freshness result state/retry freshness result state/post-approval retry freshness result state/merge decision state/paste target state/handoff approval state/submission approval state/memory approval state/renewed memory approval state/approval result state/git read/write/transcript import/command execution/persisted review state/checklist completion state/memory approval write/merge decision write/external call을 포함하지 않음
- [x] Task 138 DECISION: post-memory-approval retry renewed-memory-approval post-submit retry renewed-memory-approval post-submit collection freshness result non-persistence note는 freshness result가 다음 explicit loop snapshot 전까지 PromptLane 밖에 있고 PromptLane이 freshness result state를 detect/store/sync하지 않음을 명확히 하기 위해 필요하므로 raw-free로 제공
- [x] Task 138 RED: selected detail API/UI에 `continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_retry_renewed_memory_approval_post_submit_collection_freshness_result_non_persistence_note`가 없어 focused server/API/web tests 실패 확인
- [x] Task 138 GREEN: selected detail API/type/UI에 post-submit retry renewed-memory-approval post-submit collection freshness result stays outside PromptLane until next explicit loop snapshot, no detect/store/sync, no-write/no-external flags를 read-only로 노출
- [x] Task 138 PRIVACY: continuation safety post-memory-approval retry renewed-memory-approval post-submit retry renewed-memory-approval post-submit collection freshness result non-persistence note는 prompt body/evidence refs/outcome summary/raw path/target content/active-window title/pasted content/paste result state/submitted state/agent response content/collection result state/post-submit collection result state/post-submit retry result state/retry success/failure state/post-submit retry freshness result state/post-submit retry freshness uncertainty collection result state/post-submit retry renewed memory approval state/post-approval collection result state/renewed memory approval collection result state/post-submit retry renewed-memory-approval collection result state/post-submit retry renewed-memory-approval post-submit collection result state/post-submit retry renewed-memory-approval post-submit collection uncertainty result state/post-submit retry renewed-memory-approval post-submit collection freshness result state/uncertainty result state/freshness monitoring state/retry result state/post-approval retry result state/retry outcome state/freshness result state/retry freshness result state/post-approval retry freshness result state/merge decision state/paste target state/handoff approval state/submission approval state/memory approval state/renewed memory approval state/approval result state/git read/write/transcript import/command execution/persisted review state/checklist completion state/memory approval write/merge decision write/external call을 포함하지 않음
- [x] Task 139 DECISION: post-memory-approval retry renewed-memory-approval post-submit retry renewed-memory-approval post-submit collection freshness uncertainty collection reminder는 freshness uncertainty가 남은 상태에서 operator가 다음 explicit loop snapshot을 collect해야 함을 pre/post handoff 흐름과 별도로 명확히 하기 위해 필요하므로 raw-free로 제공
- [x] Task 139 RED: selected detail API/UI에 `continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_retry_renewed_memory_approval_post_submit_collection_freshness_uncertainty_collection_reminder`가 없어 focused server/API/web tests 실패 확인
- [x] Task 139 GREEN: selected detail API/type/UI에 collect new explicit loop snapshot when post-submit retry renewed-memory-approval post-submit collection freshness is uncertain, no freshness verification/automatic collection start, no-write/no-external flags를 read-only로 노출
- [x] Task 139 PRIVACY: continuation safety post-memory-approval retry renewed-memory-approval post-submit retry renewed-memory-approval post-submit collection freshness uncertainty collection reminder는 prompt body/evidence refs/outcome summary/raw path/target content/active-window title/pasted content/paste result state/submitted state/agent response content/collection result state/post-submit collection result state/post-submit retry result state/retry success/failure state/post-submit retry freshness result state/post-submit retry freshness uncertainty collection result state/post-submit retry renewed memory approval state/post-approval collection result state/renewed memory approval collection result state/post-submit retry renewed-memory-approval collection result state/post-submit retry renewed-memory-approval post-submit collection result state/post-submit retry renewed-memory-approval post-submit collection uncertainty result state/post-submit retry renewed-memory-approval post-submit collection freshness result state/post-submit retry renewed-memory-approval post-submit collection freshness uncertainty result state/uncertainty result state/freshness monitoring state/retry result state/post-approval retry result state/retry outcome state/freshness result state/retry freshness result state/post-approval retry freshness result state/merge decision state/paste target state/handoff approval state/submission approval state/memory approval state/renewed memory approval state/approval result state/git read/write/transcript import/command execution/persisted review state/checklist completion state/memory approval write/merge decision write/external call을 포함하지 않음
- [x] Task 140 DECISION: post-submit collection freshness uncertainty pre-merge/pre-handoff/pre-paste/pre-submit boundary는 Task 133-136의 기존 runtime field가 이미 담당하므로 중복 field를 추가하지 않음
- [x] Task 140 RED: `tasks/todo.md`에 selected detail duplicate boundary 미결정 TODO가 남아 source hygiene test 실패 확인
- [x] Task 140 GREEN: 중복 runtime field를 만들지 않고 기존 `continuation_safety_post_memory_approval_retry_renewed_memory_approval_post_submit_retry_renewed_memory_approval_post_submit_collection_pre_*_freshness_advisory` 4개를 canonical boundary로 유지
- [x] Task 140 PRIVACY: 새 API/UI field, 저장 state, prompt body/evidence refs/outcome summary/raw path/target content/active-window title/paste/submission/result state/git read/write/transcript import/command execution/external call을 추가하지 않음
- [x] Task 141 DECISION: selected detail panel의 remaining raw `loop-review-item` markup은 유지보수 비용을 줄이기 위해 안전한 묶음부터 계속 `LoopReviewItem`으로 전환
- [x] Task 141 RED: raw `loop-review-item` markup count가 61개라 source hygiene test의 58개 이하 기준 실패 확인
- [x] Task 141 GREEN: command distinction/filter/copy side-effect markup을 `LoopReviewItem`으로 전환해 rendered text를 유지하고 raw markup count를 58개로 감소
- [x] Task 141 PRIVACY: UI markup refactor만 수행하며 API field, 저장 state, prompt body/evidence refs/outcome summary/raw path/git read/write/transcript import/command execution/external call을 추가하지 않음
- [x] Task 142 DECISION: selected detail panel의 freshness raw `loop-review-item` markup은 같은 read-only line/footer 구조라 `LoopReviewItem`으로 계속 전환
- [x] Task 142 RED: raw `loop-review-item` markup count가 58개라 source hygiene test의 55개 이하 기준 실패 확인
- [x] Task 142 GREEN: freshness result non-persistence, freshness uncertainty collection reminder, pre-merge freshness advisory markup을 `LoopReviewItem`으로 전환해 raw markup count를 55개로 감소
- [x] Task 142 PRIVACY: UI markup refactor만 수행하며 API field, 저장 state, prompt body/evidence refs/outcome summary/raw path/git read/write/transcript import/command execution/external call을 추가하지 않음
- [x] Task 143 DECISION: selected detail panel의 pre/post-memory-approval raw `loop-review-item` markup은 같은 read-only line/footer 구조라 `LoopReviewItem`으로 계속 전환
- [x] Task 143 RED: raw `loop-review-item` markup count가 55개라 source hygiene test의 52개 이하 기준 실패 확인
- [x] Task 143 GREEN: pre-memory-approval freshness advisory, post-memory-approval collection reminder/result non-persistence markup을 `LoopReviewItem`으로 전환해 raw markup count를 52개로 감소
- [x] Task 143 PRIVACY: UI markup refactor만 수행하며 API field, 저장 state, prompt body/evidence refs/outcome summary/raw path/git read/write/transcript import/command execution/external call을 추가하지 않음
- [x] Task 144 DECISION: selected detail panel의 post-memory-approval retry raw `loop-review-item` markup은 같은 read-only line/footer 구조라 `LoopReviewItem`으로 계속 전환
- [x] Task 144 RED: raw `loop-review-item` markup count가 52개라 source hygiene test의 49개 이하 기준 실패 확인
- [x] Task 144 GREEN: post-memory-approval collection retry boundary, retry outcome non-persistence, retry evidence freshness boundary markup을 `LoopReviewItem`으로 전환해 raw markup count를 49개로 감소
- [x] Task 144 PRIVACY: UI markup refactor만 수행하며 API field, 저장 state, prompt body/evidence refs/outcome summary/raw path/git read/write/transcript import/command execution/external call을 추가하지 않음
- [x] Task 145 DECISION: selected detail panel의 post-memory-approval retry freshness raw `loop-review-item` markup은 같은 read-only line/footer 구조라 `LoopReviewItem`으로 계속 전환
- [x] Task 145 RED: raw `loop-review-item` markup count가 49개라 source hygiene test의 46개 이하 기준 실패 확인
- [x] Task 145 GREEN: post-memory-approval retry freshness result non-persistence, freshness uncertainty collection reminder, pre-memory-approval freshness advisory markup을 `LoopReviewItem`으로 전환해 raw markup count를 46개로 감소
- [x] Task 145 PRIVACY: UI markup refactor만 수행하며 API field, 저장 state, prompt body/evidence refs/outcome summary/raw path/git read/write/transcript import/command execution/external call을 추가하지 않음
- [x] Task 146 DECISION: selected detail panel의 renewed-memory-approval collection raw `loop-review-item` markup은 같은 read-only line/footer 구조라 `LoopReviewItem`으로 계속 전환
- [x] Task 146 RED: raw `loop-review-item` markup count가 46개라 source hygiene test의 43개 이하 기준 실패 확인
- [x] Task 146 GREEN: renewed-memory-approval collection reminder/result non-persistence/uncertainty reminder markup을 `LoopReviewItem`으로 전환해 raw markup count를 43개로 감소
- [x] Task 146 PRIVACY: UI markup refactor만 수행하며 API field, 저장 state, prompt body/evidence refs/outcome summary/raw path/git read/write/transcript import/command execution/external call을 추가하지 않음
- [x] Task 147 DECISION: selected detail panel의 renewed-memory-approval pre-boundary raw `loop-review-item` markup은 같은 read-only line/footer 구조라 `LoopReviewItem`으로 계속 전환
- [x] Task 147 RED: raw `loop-review-item` markup count가 43개라 source hygiene test의 40개 이하 기준 실패 확인
- [x] Task 147 GREEN: renewed-memory-approval pre-merge/pre-handoff/pre-paste freshness advisory markup을 `LoopReviewItem`으로 전환해 raw markup count를 40개로 감소
- [x] Task 147 PRIVACY: UI markup refactor만 수행하며 API field, 저장 state, prompt body/evidence refs/outcome summary/raw path/git read/write/transcript import/command execution/external call을 추가하지 않음
- [x] Task 148 DECISION: selected detail panel의 renewed-memory-approval submit/post-submit raw `loop-review-item` markup은 같은 read-only line/footer 구조라 `LoopReviewItem`으로 계속 전환
- [x] Task 148 RED: raw `loop-review-item` markup count가 40개라 source hygiene test의 37개 이하 기준 실패 확인
- [x] Task 148 GREEN: renewed-memory-approval pre-submit/post-submit freshness advisory/post-submit collection result non-persistence markup을 `LoopReviewItem`으로 전환해 raw markup count를 37개로 감소
- [x] Task 148 PRIVACY: UI markup refactor만 수행하며 API field, 저장 state, prompt body/evidence refs/outcome summary/raw path/git read/write/transcript import/command execution/external call을 추가하지 않음
- [x] Task 149 DECISION: selected detail panel의 renewed-memory-approval post-submit retry raw `loop-review-item` markup은 같은 read-only line/footer 구조라 `LoopReviewItem`으로 계속 전환
- [x] Task 149 RED: raw `loop-review-item` markup count가 37개라 source hygiene test의 34개 이하 기준 실패 확인
- [x] Task 149 GREEN: renewed-memory-approval post-submit collection retry boundary, retry outcome non-persistence, retry evidence freshness boundary markup을 `LoopReviewItem`으로 전환해 raw markup count를 34개로 감소
- [x] Task 149 PRIVACY: UI markup refactor만 수행하며 API field, 저장 state, prompt body/evidence refs/outcome summary/raw path/git read/write/transcript import/command execution/external call을 추가하지 않음
- [x] Task 150 DECISION: selected detail panel의 renewed-memory-approval post-submit retry freshness raw `loop-review-item` markup은 같은 read-only line/footer 구조라 `LoopReviewItem`으로 계속 전환
- [x] Task 150 RED: raw `loop-review-item` markup count가 34개라 source hygiene test의 31개 이하 기준 실패 확인
- [x] Task 150 GREEN: renewed-memory-approval post-submit retry freshness result non-persistence, freshness uncertainty collection reminder, pre-memory-approval freshness advisory markup을 `LoopReviewItem`으로 전환해 raw markup count를 31개로 감소
- [x] Task 150 PRIVACY: UI markup refactor만 수행하며 API field, 저장 state, prompt body/evidence refs/outcome summary/raw path/git read/write/transcript import/command execution/external call을 추가하지 않음
- [x] Task 151 DECISION: selected detail panel의 renewed-memory-approval post-submit retry renewed-memory-approval collection raw `loop-review-item` markup은 같은 read-only line/footer 구조라 `LoopReviewItem`으로 계속 전환
- [x] Task 151 RED: raw `loop-review-item` markup count가 31개라 source hygiene test의 28개 이하 기준 실패 확인
- [x] Task 151 GREEN: renewed-memory-approval post-submit retry renewed-memory-approval collection reminder, collection result non-persistence, collection uncertainty reminder markup을 `LoopReviewItem`으로 전환해 raw markup count를 28개로 감소
- [x] Task 151 PRIVACY: UI markup refactor만 수행하며 API field, 저장 state, prompt body/evidence refs/outcome summary/raw path/git read/write/transcript import/command execution/external call을 추가하지 않음
- [x] Task 152 DECISION: selected detail panel의 renewed-memory-approval post-submit retry renewed-memory-approval pre-boundary raw `loop-review-item` markup은 같은 read-only line/footer 구조라 `LoopReviewItem`으로 계속 전환
- [x] Task 152 RED: raw `loop-review-item` markup count가 28개라 source hygiene test의 25개 이하 기준 실패 확인
- [x] Task 152 GREEN: renewed-memory-approval post-submit retry renewed-memory-approval pre-merge/pre-handoff/pre-paste freshness advisory markup을 `LoopReviewItem`으로 전환해 raw markup count를 25개로 감소
- [x] Task 152 PRIVACY: UI markup refactor만 수행하며 API field, 저장 state, prompt body/evidence refs/outcome summary/raw path/git read/write/transcript import/command execution/external call을 추가하지 않음
- [x] Task 153 DECISION: selected detail panel의 renewed-memory-approval post-submit retry renewed-memory-approval submit/post-submit raw `loop-review-item` markup은 같은 read-only line/footer 구조라 `LoopReviewItem`으로 계속 전환
- [x] Task 153 RED: raw `loop-review-item` markup count가 25개라 source hygiene test의 22개 이하 기준 실패 확인
- [x] Task 153 GREEN: renewed-memory-approval post-submit retry renewed-memory-approval pre-submit/post-submit freshness advisory/post-submit collection result non-persistence markup을 `LoopReviewItem`으로 전환해 raw markup count를 22개로 감소
- [x] Task 153 PRIVACY: UI markup refactor만 수행하며 API field, 저장 state, prompt body/evidence refs/outcome summary/raw path/git read/write/transcript import/command execution/external call을 추가하지 않음
- [x] Task 154 DECISION: selected detail panel의 renewed-memory-approval post-submit retry renewed-memory-approval post-submit collection pre-boundary raw `loop-review-item` markup은 같은 read-only line/footer 구조라 `LoopReviewItem`으로 계속 전환
- [x] Task 154 RED: raw `loop-review-item` markup count가 22개라 source hygiene test의 19개 이하 기준 실패 확인
- [x] Task 154 GREEN: renewed-memory-approval post-submit retry renewed-memory-approval post-submit collection pre-merge/pre-handoff/pre-paste freshness advisory markup을 `LoopReviewItem`으로 전환해 raw markup count를 19개로 감소
- [x] Task 154 PRIVACY: UI markup refactor만 수행하며 API field, 저장 state, prompt body/evidence refs/outcome summary/raw path/git read/write/transcript import/command execution/external call을 추가하지 않음
- [x] Task 155 DECISION: selected detail panel의 renewed-memory-approval post-submit retry renewed-memory-approval post-submit collection submit/post-submit freshness raw `loop-review-item` markup은 같은 read-only line/footer 구조라 `LoopReviewItem`으로 계속 전환
- [x] Task 155 RED: raw `loop-review-item` markup count가 19개라 source hygiene test의 16개 이하 기준 실패 확인
- [x] Task 155 GREEN: renewed-memory-approval post-submit retry renewed-memory-approval post-submit collection pre-submit/post-submit freshness advisory/freshness result non-persistence markup을 `LoopReviewItem`으로 전환해 raw markup count를 16개로 감소
- [x] Task 155 PRIVACY: UI markup refactor만 수행하며 API field, 저장 state, prompt body/evidence refs/outcome summary/raw path/git read/write/transcript import/command execution/external call을 추가하지 않음
- [x] Task 156 DECISION: selected detail panel 후반의 handoff/source raw `loop-review-item` markup은 같은 read-only line/footer 구조라 `LoopReviewItem`으로 계속 전환
- [x] Task 156 RED: raw `loop-review-item` markup count가 16개라 source hygiene test의 13개 이하 기준 실패 확인
- [x] Task 156 GREEN: handoff checklist, post-handoff reminder, source-of-truth note markup을 `LoopReviewItem`으로 전환해 raw markup count를 13개로 감소
- [x] Task 156 PRIVACY: UI markup refactor만 수행하며 API field, 저장 state, prompt body/evidence refs/outcome summary/raw path/git read/write/transcript import/command execution/external call을 추가하지 않음
- [x] Task 157 DECISION: selected detail panel 후반의 privacy/operator/collection responsibility raw `loop-review-item` markup은 같은 read-only line/footer 구조라 `LoopReviewItem`으로 계속 전환
- [x] Task 157 RED: raw `loop-review-item` markup count가 13개라 source hygiene test의 10개 이하 기준 실패 확인
- [x] Task 157 GREEN: privacy boundary note, operator review gate, collection responsibility note markup을 `LoopReviewItem`으로 전환해 raw markup count를 10개로 감소
- [x] Task 157 PRIVACY: UI markup refactor만 수행하며 API field, 저장 state, prompt body/evidence refs/outcome summary/raw path/git read/write/transcript import/command execution/external call을 추가하지 않음
- [x] Task 158 DECISION: selected detail panel 후반의 merge/post-collection/review packet raw `loop-review-item` markup은 같은 read-only line/footer 구조라 `LoopReviewItem`으로 계속 전환
- [x] Task 158 RED: raw `loop-review-item` markup count가 10개라 source hygiene test의 7개 이하 기준 실패 확인
- [x] Task 158 GREEN: pre-merge advisory, post-collection review note, review packet readiness summary markup을 `LoopReviewItem`으로 전환해 raw markup count를 7개로 감소
- [x] Task 158 PRIVACY: UI markup refactor만 수행하며 API field, 저장 state, prompt body/evidence refs/outcome summary/raw path/git read/write/transcript import/command execution/external call을 추가하지 않음
- [x] Task 159 DECISION: review packet rationale/evidence/checklist raw `loop-review-item` markup은 같은 read-only line/footer 구조라 `LoopReviewItem`으로 계속 전환
- [x] Task 159 RED: raw `loop-review-item` markup count가 7개라 source hygiene test의 4개 이하 기준 실패 확인
- [x] Task 159 GREEN: review packet brief rationale, evidence count explanation, reviewer checklist preview markup을 `LoopReviewItem`으로 전환해 raw markup count를 4개로 감소
- [x] Task 159 PRIVACY: UI markup refactor만 수행하며 API field, 저장 state, prompt body/evidence refs/outcome summary/raw path/git read/write/transcript import/command execution/external call을 추가하지 않음
- [x] Task 160 DECISION: review packet command provenance/missing evidence raw `loop-review-item` markup은 같은 read-only line/footer 구조라 `LoopReviewItem`으로 계속 전환
- [x] Task 160 RED: raw `loop-review-item` markup count가 4개라 source hygiene test의 2개 이하 기준 실패 확인
- [x] Task 160 GREEN: review packet command provenance, missing evidence explanation markup을 `LoopReviewItem`으로 전환해 raw markup count를 2개로 감소
- [x] Task 160 PRIVACY: UI markup refactor만 수행하며 API field, 저장 state, prompt body/evidence refs/outcome summary/raw path/git read/write/transcript import/command execution/external call을 추가하지 않음
- [x] Task 161 DECISION: collection uncertainty reminder/paste destination raw `loop-review-item` markup은 같은 read-only line/footer 구조라 `LoopReviewItem`으로 계속 전환
- [x] Task 161 RED: raw `loop-review-item` markup count가 2개라 source hygiene test의 0개 이하 기준 실패 확인
- [x] Task 161 GREEN: collection uncertainty reminder, paste destination markup을 `LoopReviewItem`으로 전환해 raw markup count를 0개로 감소
- [x] Task 161 PRIVACY: UI markup refactor만 수행하며 API field, 저장 state, prompt body/evidence refs/outcome summary/raw path/git read/write/transcript import/command execution/external call을 추가하지 않음
- [x] Task 162 DECISION: selected detail panel의 long inline `LoopReviewItem` props는 view 가독성과 후속 안전 항목 추가 비용을 줄이기 위해 묶음별 helper 컴포넌트로 분리
- [x] Task 162 RED: renewed-memory-approval post-submit retry renewed-memory-approval collection 3개 field가 `LoopsView`에 직접 남아 있어 source hygiene test 실패 확인
- [x] Task 162 GREEN: 해당 3개 collection reminder/result/uncertainty item을 `LoopWorktreeRenewedMemoryApprovalItems`로 분리하고 `LoopsView`는 helper 호출만 유지
- [x] Task 162 PRIVACY: UI helper extraction만 수행하며 API field, 저장 state, prompt body/evidence refs/outcome summary/raw path/git read/write/transcript import/command execution/external call을 추가하지 않음
- [x] Task 163 DECISION: post-submit collection pre-boundary long inline `LoopReviewItem` props는 같은 renewed-memory-approval safety cluster라 기존 helper에 추가 분리
- [x] Task 163 RED: post-submit collection pre-merge/pre-handoff/pre-paste 3개 field가 `LoopsView`에 직접 남아 있어 source hygiene test 실패 확인
- [x] Task 163 GREEN: 해당 3개 pre-boundary freshness advisory item을 `LoopWorktreeRenewedMemoryApprovalItems`로 이동하고 `LoopsView` 직접 field 접근을 제거
- [x] Task 163 PRIVACY: UI helper extraction만 수행하며 API field, 저장 state, prompt body/evidence refs/outcome summary/raw path/git read/write/transcript import/command execution/external call을 추가하지 않음
- [x] Task 164 DECISION: post-submit collection submit/post-submit freshness long inline `LoopReviewItem` props는 같은 renewed-memory-approval safety cluster라 기존 helper에 추가 분리
- [x] Task 164 RED: post-submit collection pre-submit/post-submit/freshness result 3개 field가 `LoopsView`에 직접 남아 있어 source hygiene test 실패 확인
- [x] Task 164 GREEN: 해당 3개 submit/freshness item을 `LoopWorktreeRenewedMemoryApprovalItems`로 이동하고 `LoopsView` 직접 field 접근을 제거
- [x] Task 164 PRIVACY: UI helper extraction만 수행하며 API field, 저장 state, prompt body/evidence refs/outcome summary/raw path/git read/write/transcript import/command execution/external call을 추가하지 않음
- [x] Task 165 DECISION: post-submit collection freshness uncertainty collection long inline `LoopReviewItem` props는 같은 renewed-memory-approval safety cluster라 기존 helper에 추가 분리
- [x] Task 165 RED: post-submit collection freshness uncertainty collection field가 `LoopsView`에 직접 남아 있어 source hygiene test 실패 확인
- [x] Task 165 GREEN: 해당 freshness uncertainty collection item을 `LoopWorktreeRenewedMemoryApprovalItems`로 이동하고 `LoopsView` 직접 field 접근을 제거
- [x] Task 165 PRIVACY: UI helper extraction만 수행하며 API field, 저장 state, prompt body/evidence refs/outcome summary/raw path/git read/write/transcript import/command execution/external call을 추가하지 않음
- [x] Task 166 DECISION: post-submit collection result/uncertainty long inline `LoopReviewItem` props는 같은 renewed-memory-approval safety cluster라 기존 helper에 추가 분리
- [x] Task 166 RED: post-submit collection result/uncertainty 2개 field가 `LoopsView`에 직접 남아 있어 source hygiene test 실패 확인
- [x] Task 166 GREEN: 해당 result/uncertainty item을 `LoopWorktreeRenewedMemoryApprovalItems`로 이동하고 `LoopsView` 직접 field 접근을 제거
- [x] Task 166 PRIVACY: UI helper extraction만 수행하며 API field, 저장 state, prompt body/evidence refs/outcome summary/raw path/git read/write/transcript import/command execution/external call을 추가하지 않음
- [x] Task 167 DECISION: post-submit freshness advisory long inline `LoopReviewItem` props는 같은 renewed-memory-approval safety cluster라 기존 helper에 추가 분리
- [x] Task 167 RED: post-submit freshness advisory field가 `LoopsView`에 직접 남아 있어 source hygiene test 실패 확인
- [x] Task 167 GREEN: 해당 freshness advisory item을 `LoopWorktreeRenewedMemoryApprovalItems`로 이동하고 `LoopsView` 직접 field 접근을 제거
- [x] Task 167 PRIVACY: UI helper extraction만 수행하며 API field, 저장 state, prompt body/evidence refs/outcome summary/raw path/git read/write/transcript import/command execution/external call을 추가하지 않음
- [x] Task 168 DECISION: renewed-memory-approval pre-merge/pre-handoff/pre-paste/pre-submit freshness boundary 4개 long inline `LoopReviewItem` props는 같은 safety cluster라 한 helper extraction slice로 묶음
- [x] Task 168 RED: renewed-memory-approval pre-boundary freshness advisory 4개 field가 `LoopsView`에 직접 남아 있어 source hygiene test 실패 확인
- [x] Task 168 GREEN: 해당 4개 freshness boundary item을 `LoopWorktreeRenewedMemoryApprovalItems`로 이동하고 `LoopsView` 직접 field 접근을 제거
- [x] Task 168 PRIVACY: UI helper extraction만 수행하며 API field, 저장 state, prompt body/evidence refs/outcome summary/raw path/git read/write/transcript import/command execution/external call을 추가하지 않음
- [x] Task 169 DECISION: 같은 helper의 repeated `LoopReviewItem` field access는 336줄 helper를 계속 키우므로 private `renderReviewItem` helper로 압축
- [x] Task 169 RED: renewed-memory-approval helper에 `renderReviewItem`이 없고 long field access count가 높아 source hygiene test 실패 확인
- [x] Task 169 GREEN: private `renderReviewItem`으로 17개 review item 렌더링을 통합하고 helper를 117줄로 축소
- [x] Task 169 PRIVACY: UI rendering helper extraction만 수행하며 API field, 저장 state, prompt body/evidence refs/outcome summary/raw path/git read/write/transcript import/command execution/external call을 추가하지 않음
- [x] 다음 slice: 다른 `LoopsView` safety cluster를 같은 기준으로 helper 분리할지 결정

### 판단 기준

- Compact hooks는 `custom_instructions`, `compact_summary`, transcript body, raw path를 저장하지 않고 safe metadata와 optional hash만 저장한다.
- `PreCompact`/`PostCompact` lifecycle payload는 prompt ingest route로 보내지 않는다.
- Hook output은 기존처럼 fail-open이며 stdout/stderr에 원문을 노출하지 않는다.
- 이번 slice는 boundary metadata만 포함하고 compact summary 재주입, semantic memory, web UI는 다음 slice로 남긴다.

### Compact Boundary Awareness 판단 기준

- `loop brief`, `prepare_loop_brief`, `get_promptlane_status`는 최신 loop snapshot 이후 발생한 compact boundary만 표시한다.
- 표시되는 boundary 정보는 event name, trigger, time, tool, id, optional hash 같은 safe metadata로 제한한다.
- compact summary, custom instructions, transcript body, raw path는 CLI/MCP 출력과 테스트 결과에 노출하지 않는다.
- 이번 slice는 "다시 collect할 필요가 있음"을 알려주는 awareness까지만 포함하고 summary 재주입, semantic memory, web UI는 다음 slice로 남긴다.

### Loop Status CLI 판단 기준

- `promptlane loop status`는 사람용 터미널 readiness surface이며 MCP `get_promptlane_status`와 같은 local-first privacy 경계를 따른다.
- 출력은 snapshot count, latest loop safe metadata, compact refresh action, next command만 포함한다.
- prompt body, compact summary, custom instructions, transcript body, raw path는 text/JSON 출력에 포함하지 않는다.

### Web Loops View 판단 기준

- `/api/v1/loops`와 `/loops` view는 loop snapshot safe metadata만 표시한다.
- 현재 web slice는 list, empty state, compact refresh marker, copy-ready next
  brief action까지 포함한다.
- prompt body, compact summary, custom instructions, transcript body, raw path는 API/화면/테스트 출력에 포함하지 않는다.
- raw prompt detail panel과 instruction-file patch proposal workflow는 다음 slice로 남긴다.

### Explicit Service Collection 판단 기준

- `promptlane loop collect --source service`는 cron/LaunchAgent가 호출할 수 있는 명시적 one-shot 명령이다.
- `promptlane loop schedule install --dry-run`은 macOS LaunchAgent를 쓰기 전에 미리볼 수 있어야 한다.
- `promptlane loop schedule status`는 plist 존재 여부만 확인한다.
- `promptlane loop schedule uninstall`은 명시 호출 시 plist만 제거한다.
- scheduler 설치는 사용자의 명시적 CLI 명령으로만 동작한다.
- status/uninstall은 숨은 launchctl load/unload나 외부 서비스 변경을 하지 않는다.
- service-origin snapshot도 prompt body, compact summary, custom instructions, transcript body, raw path를 출력하지 않는다.

### Semantic Memory Decision Gate 판단 기준

- semantic memory는 자동 저장이 아니라 후보 판정부터 시작한다.
- `passed` outcome, non-empty summary, non-empty evidence refs가 있어야 candidate eligible이다.
- unsafe summary(raw path, secret-looking token)는 candidate로 반환하지 않는다.
- `promptlane loop memory-candidate`와 MCP `propose_loop_memory_candidate`는 같은 결정 함수를 사용한다.
- 결과는 prompt body, compact summary, custom instructions, transcript body, raw path를 출력하지 않는다.
- AGENTS.md, CLAUDE.md, memory files, project docs에는 자동으로 쓰지 않는다.

### Approved Memory Record 판단 기준

- approved memory write는 local SQLite `loop_memories` 저장까지만 수행한다.
- `promptlane loop memory-approve`와 MCP `record_loop_memory`는 latest eligible candidate를 재검증한 뒤 저장한다.
- stored memory는 statement, safe evidence refs, approval actor, created_at, privacy metadata만 포함한다.
- unsafe statement(raw path, secret-looking token)는 저장하지 않는다.
- AGENTS.md, CLAUDE.md, project docs, vector store에는 쓰지 않는다.

### Instruction File Patch Proposal 판단 기준

- instruction patch는 승인된 최신 `loop_memories` record에서만 생성한다.
- `promptlane loop instruction-patch`와 MCP `propose_instruction_patch`는 같은 pure proposal generator를 사용한다.
- 결과는 `AGENTS.md` 또는 `CLAUDE.md` 대상 unified diff 문자열과 approval-required metadata만 반환한다.
- 명령과 MCP tool은 instruction file, project docs, memory files를 직접 쓰지 않는다.
- prompt body, compact summary, transcript body, raw path, secret-looking token은 출력하지 않는다.

### Explicit Instruction Patch Apply 판단 기준

- instruction apply는 승인된 최신 `loop_memories` record에서만 동작한다.
- CLI는 `--confirm-apply`, MCP는 `confirm_apply=true` 없이는 파일을 쓰지 않는다.
- 적용 대상은 `AGENTS.md` 또는 `CLAUDE.md`로 제한한다.
- 같은 `source_memory` marker가 이미 있으면 중복 append하지 않는다.
- 결과는 target file name, applied/already_present, source_memory id, privacy metadata만 반환하고 raw path를 반환하지 않는다.
- prompt body, compact summary, transcript body, raw path, secret-looking token은 출력하지 않는다.

### Brand Migration 판단 기준

- GitHub repository는 `wlsdks/promptlane`이고 local `origin`도 새 URL을 사용한다.
- GitHub description/topics는 local-first agent loop memory/meta-prompting 포지션을 반영한다.
- package/plugin product-facing description, homepage, repository, display name은 PromptLane을 사용한다.
- npm package name, CLI binary, plugin command id는 compatibility window 동안 `promptlane`를 유지한다.
- README/docs는 `PromptLane`을 제품명으로 소개하고 `promptlane`를 현재 CLI/package 이름으로 설명한다.

### Shared Loop Status Model 판단 기준

- CLI `promptlane loop status`, MCP `get_promptlane_status`, `/api/v1/loops`, web Loops status header는 같은 `src/loop/status.ts` 모델에서 나온 readiness, latest snapshot, compact refresh, next action 값을 사용한다.
- 공유 모델은 prompt body, compact summary, custom instructions, transcript body, raw path, secret-looking token을 입력으로 받거나 출력하지 않는다.
- MCP surface는 `available_tools`만 추가하고 readiness 판단 자체는 shared model을 따른다.
- Web API는 list item metadata와 별개로 `status` object를 반환해 web client가 list length로 상태를 재추론하지 않게 한다.
- package/CLI alias migration은 이 slice에서 하지 않는다.

### Approved Memory In Continuation Brief 판단 기준

- CLI `promptlane loop brief`, MCP `prepare_loop_brief`, `/api/v1/loops/:id/brief`는 최신 approved `loop_memories`를 continuation prompt의 `Approved Loop Memories` 섹션에 포함한다.
- memory section은 statement와 safe evidence refs만 포함한다.
- continuation brief는 현재 snapshot의 `project_id`와 같은 source snapshot에서 승인된 memory만 포함한다.
- prompt body, compact summary, custom instructions, transcript body, raw path, secret-looking token은 brief 출력에 포함하지 않는다.
- memory inclusion은 read-only이며 AGENTS.md, CLAUDE.md, project docs, vector store를 쓰지 않는다.
- package/CLI alias migration은 이 slice에서 하지 않는다.

## 2026-05-04 Habit Coach Panel Extraction

- [x] 기능/코드/UI 관점에서 다음 고효과 개선 후보 재점검
- [x] Habit Coach panel을 component-owned TSX/CSS로 분리
- [x] `App.tsx`와 `styles.css` line budget을 낮춰 구조 퇴행 방지
- [x] 브라우저/릴리스 게이트로 Coach, Dashboard, Practice 흐름 검증
- [x] PR 생성, CI 확인, main merge, branch cleanup

### 판단 기준

- Coach의 핵심 가치인 habit score, repeated weakness, next request brief, review queue는 그대로 유지한다.
- panel UI와 copy brief 상태는 `HabitCoachPanel`이 소유하고 `App.tsx`는 routing/composition 중심으로 남긴다.
- prompt body, raw path, token은 새 컴포넌트와 테스트 출력에 노출하지 않는다.
- Dashboard와 Coach 양쪽에서 같은 panel이 정상 렌더링되어야 한다.

## 2026-05-04 Practice CSS Extraction

- [x] 기능/코드/UI 관점에서 다음 고효과 개선 후보 재점검
- [x] Practice 전용 스타일을 component-owned CSS로 분리
- [x] `styles.css` line budget을 낮춰 전역 CSS 비대화 방지
- [x] 브라우저/릴리스 게이트로 Practice와 주요 웹 흐름 검증
- [x] PR 생성, CI 확인, main merge, branch cleanup

### 판단 기준

- `practice-*` selector는 `PracticeView`가 소유하고, shared archive score 스타일은 전역에 둔다.
- 화면 정보 구조와 기능 동작은 바꾸지 않고 스타일 소유권만 명확히 한다.
- Practice의 fixed draft copy, score preview, quick fix, history, outcome feedback이 그대로 동작해야 한다.
- 전역 CSS budget을 낮춰 앞으로 Practice 개선이 다시 `styles.css`에 쌓이지 않도록 한다.

## 2026-05-04 Practice Copy Fixed Draft UX

- [x] 기능/코드/UI 관점에서 다음 고효과 개선 후보 재점검
- [x] Practice one-click builder에서 보완된 초안을 바로 복사하는 흐름 추가
- [x] 한국어/영어 UI 문구와 브라우저 e2e 검증 보강
- [x] 전체 테스트, 브라우저, 릴리스, 패키징 게이트 검증
- [x] PR 생성, CI 확인, main merge, branch cleanup

### 판단 기준

- 사용자는 편집기에 먼저 적용하지 않아도 "보완된 초안"을 바로 Claude Code/Codex로 가져갈 수 있어야 한다.
- 복사 기록은 기존과 동일하게 score와 missing label metadata만 저장하고 draft 원문은 저장하지 않는다.
- 버튼/문구는 `DESIGN.md`의 dense developer workbench 기준을 유지하고, mobile wrap-safe 상태를 유지한다.
- 새 기능은 자동 제출이 아니라 명시적 복사이므로 local-first, HITL 사용성 경계를 지킨다.

## 2026-05-04 Practice View Module Extraction

- [x] 기능/코드/UI 관점에서 다음 고효과 개선 후보 재점검
- [x] `App.tsx`의 Practice UI와 local scoring 흐름을 독립 모듈로 분리
- [x] `App.tsx` line budget을 낮춰 구조 퇴행 방지
- [x] 브라우저/릴리스 게이트로 Practice와 주요 웹 흐름 검증
- [x] PR 생성, CI 확인, main merge, branch cleanup

### 판단 기준

- Practice 화면은 제품의 핵심 가치인 "다음 요청을 더 잘 쓰게 돕기"에 직접 닿으므로 독립적으로 확장 가능해야 한다.
- 기능 동작과 화면 정보 구조는 유지하되 app shell, routing, practice scoring state를 분리한다.
- Practice history는 draft 원문을 저장하지 않는 privacy-safe 동작을 유지해야 한다.
- 품질 게이트는 다음 UI 추가가 `App.tsx`에 다시 몰리는 것을 막아야 한다.

## 2026-05-04 Prompt Detail CSS Extraction

- [x] 기능/코드/UI 관점에서 다음 고효과 개선 후보 재점검
- [x] Prompt detail 전용 스타일을 독립 CSS 모듈로 분리
- [x] `styles.css` line budget을 낮춰 UI 스타일 퇴행 방지
- [x] 브라우저/릴리스 게이트로 detail 화면과 주요 웹 흐름 검증
- [x] PR 생성, CI 확인, main merge, branch cleanup

### 판단 기준

- 기능과 DOM 구조를 바꾸지 않고 스타일 소유권만 더 명확히 한다.
- detail 화면의 분석 preview, 개선안, agent follow-up, queue action 스타일은 그대로 유지되어야 한다.
- `styles.css`는 전역 shell/list/dashboard 중심으로 남기고 detail 전용 규칙은 component-owned CSS로 이동한다.
- 웹 검증은 detail 화면 privacy-safe 렌더링과 주요 navigation 흐름을 포함해야 한다.

## 2026-05-04 Prompt Detail Module Extraction

- [x] 기능/코드/UI 관점에서 다음 고효과 개선 후보 재점검
- [x] `App.tsx`의 Prompt detail 관련 UI를 독립 모듈로 분리
- [x] `App.tsx` line budget을 낮춰 구조 퇴행 방지
- [x] 브라우저/릴리스 게이트로 detail 화면 동작 검증
- [x] PR 생성, CI 확인, main merge, branch cleanup

### 판단 기준

- 기능 동작과 화면 정보 구조는 유지하되 `App.tsx` 집중도를 낮춘다.
- detail 화면은 prompt body, raw path, token privacy 회귀 없이 유지되어야 한다.
- 품질 게이트는 다음 UI 추가가 `App.tsx`에 다시 몰리는 것을 막아야 한다.
- 웹 검증은 detail, coach, practice, scores, MCP 흐름을 포함한다.

## 2026-05-04 Detail Agent Actions Polish

- [x] 기능/코드/UI 관점에서 다음 고효과 개선 후보 재점검
- [x] Prompt detail 화면에 선택 프롬프트용 agent-native 후속 명령 추가
- [x] 명령 스냅샷이 prompt body, raw path, token을 노출하지 않는 회귀 테스트 추가
- [x] 브라우저/릴리스 게이트로 실제 동작 검증
- [x] PR 생성, CI 확인, main merge, branch cleanup

### 판단 기준

- 웹 detail은 회고 화면에서 끝나지 않고 Claude Code/Codex 안의 다음 action으로 이어져야 한다.
- 선택한 prompt id 기반 `score_prompt`, `improve_prompt`, `prepare_agent_rewrite` 명령을 복사할 수 있어야 한다.
- 표시되는 명령과 테스트 출력은 prompt body, raw path, token을 포함하지 않아야 한다.
- 새 UI는 `DESIGN.md`의 dense developer workbench 기준을 유지하고 `App.tsx` 집중도를 줄이는 방향이어야 한다.

## 2026-05-04 Coach Follow-Up Commands Polish

- [x] 기능/코드/UI 관점에서 다음 고효과 개선 후보 재점검
- [x] `promptlane coach` 텍스트 출력에 agent-native follow-up 명령 추가
- [x] privacy-safe CLI 회귀 테스트 추가
- [x] 브라우저/릴리스 게이트로 실제 동작 검증
- [x] PR 생성, CI 확인, main merge, branch cleanup

### 판단 기준

- `coach`는 웹으로 보내기 전에 Claude Code/Codex 안에서 바로 쓸 다음 명령을 제안해야 한다.
- 출력은 prompt body, raw path, token을 포함하지 않아야 한다.
- MCP 명령과 slash command를 모두 보여주되, 자동 제출이나 숨은 외부 호출처럼 보이면 안 된다.

## 2026-05-04 Recommended Agent Action Polish

- [x] 기능/코드/UI 관점에서 다음 고효과 개선 후보 재점검
- [x] Dashboard Agent command center에 추천 1순위 명령을 추가
- [x] Claude Code와 MCP 양쪽 명령 복사 UX 회귀 테스트 추가
- [x] 브라우저/릴리스 게이트로 실제 동작 검증
- [x] PR 생성, CI 확인, main merge, branch cleanup

### 판단 기준

- 사용자는 웹에서 명령 목록을 해석하지 않아도 바로 다음 행동을 알 수 있어야 한다.
- 추천 명령은 prompt body, raw path, token을 포함하지 않고 agent-native workflow만 가리킨다.
- 웹은 회고/대시보드 역할을 유지하고, 실제 실행은 Claude Code/Codex 안에서 하도록 안내한다.

## 2026-05-04 Vertical StatusLine And Agent UX Polish

- [x] statusLine chain이 `claude-hud`와 promptlane multiline 출력을 모두 보존하는지 재점검
- [x] promptlane 상태줄을 score/action 중심의 세로 분리 출력으로 개선
- [x] 웹 Dashboard의 agent command surface를 더 실사용 중심으로 다듬기
- [x] 기능/코드 품질 회귀 테스트와 브라우저 검증 실행
- [x] PR 생성, CI 확인, main merge, branch cleanup

### 판단 기준

- 기존 HUD의 stdout, ANSI 색상, 줄바꿈을 변경하지 않는다.
- promptlane 상태줄은 한 줄에 과도한 정보를 몰아넣지 않고 readiness와 coaching action을 분리한다.
- 웹 UI는 command 실행 맥락, 복사 행동, 현재 개선 포인트를 즉시 이해할 수 있어야 한다.
- 모든 출력은 local-first privacy를 유지하고 prompt body, raw path, token을 노출하지 않는다.

## 2026-05-04 StatusLine And Product Polish QA

- [x] `claude-hud` chained statusLine 충돌/표현 회귀 범위 재점검
- [x] 코드베이스 품질/성능/모듈화 개선 후보 수집
- [x] 웹 UI/UX와 기능 흐름을 실제 화면 기준으로 점검
- [x] 고효과 개선 구현 및 회귀 테스트 추가
- [x] Playwright/browser와 release gate 검증
- [x] PR 생성, CI 확인, main merge, branch cleanup

### 판단 기준

- 기존 Claude HUD의 multiline/ANSI 출력은 유지하고 promptlane는 가로 폭을 과도하게 늘리지 않는다.
- 기능 추가는 promptlane 정체성인 local-first prompt coach/memory에 직접 도움이 되는 것만 한다.
- UI 개선은 `DESIGN.md`의 warm developer workbench 기준을 따른다.
- prompt body, raw path, token은 stdout/stderr, browser diagnostics, test output에 노출하지 않는다.

## 2026-05-03 Claude StatusLine Multiline Layout

- [x] 현재 chained statusLine 출력이 기존 HUD 줄바꿈을 깨는 원인 확인
- [x] 기존 HUD multiline 보존과 promptlane compact line 회귀 테스트 추가
- [x] chained renderer와 promptlane statusLine 문구를 짧게 개선
- [x] 로컬 Claude 설정/실행 출력 재검증
- [x] targeted/full 검증 실행
- [ ] PR 생성, CI 확인, main merge, branch cleanup

### 판단 기준

- `claude-hud` 같은 기존 HUD의 줄바꿈과 ANSI 출력은 promptlane가 한 줄로 뭉개면 안 된다.
- 기존 HUD가 있으면 promptlane는 별도 짧은 line으로 붙여 가로 폭을 과도하게 늘리지 않는다.
- 기존 HUD가 실패하거나 비어 있으면 promptlane만 짧고 읽기 쉬운 한 줄로 표시한다.
- statusLine 출력은 prompt body, raw path, token을 포함하지 않는다.

## 2026-05-03 Stable CLI Entry Path For Hooks

- [x] Claude Code hook error 원인 확인 및 로컬 설정 수리
- [x] source 실행 경로에서도 dist CLI를 우선 선택하는 회귀 테스트 추가
- [x] hook/statusLine/service/session-start command 생성 경계 하드닝
- [x] targeted/full 검증 실행
- [ ] PR 생성, CI 확인, main merge, branch cleanup

### 판단 기준

- Claude Code/Codex hook command는 존재하지 않는 `src/cli/index.js`를 설치하면 안 된다.
- repo 개발 실행에서는 빌드된 `dist/cli/index.js`가 있으면 그 경로를 우선 사용한다.
- npm 배포 실행에서는 기존처럼 실행 중인 `dist` CLI 경로를 유지한다.
- 설정 점검과 검증 과정에서 prompt body, raw path, token을 출력하지 않는다.

## 2026-05-03 Preserve Existing Claude StatusLine

- [x] 기존 Claude Code statusLine overwrite 원인 확인
- [x] 기존 statusLine chain/restore TDD 추가
- [x] installer/uninstaller에서 기존 HUD 보존 구현
- [x] README/Plugin 문서에 coexistence 동작 반영
- [x] 테스트/릴리스 게이트 실행
- [x] PR 생성, CI 확인, main merge, branch cleanup

### 판단 기준

- Claude Code는 `statusLine`을 하나만 지원하므로 여러 설정을 만들지 않고 하나의 command 안에서 기존 HUD와 promptlane를 같이 실행한다.
- 기존 `claude-hud` 같은 command는 설치 시 보존되고, promptlane 제거 시 가능한 경우 원래 command로 복구되어야 한다.
- reinstall은 기존 command를 중첩 wrapping하지 않고 promptlane command만 갱신해야 한다.
- statusLine 출력과 로그는 prompt body, raw path, secret을 노출하지 않아야 한다.

## 2026-05-03 Coach Release Readiness

- [x] benchmark v1에 coach actionability 지표 추가
- [x] `coach_prompt` agent brief를 첫 보완/다음 요청 template 중심으로 강화
- [x] `promptlane start --open-web`로 첫 3분 setup 안내 압축
- [x] README/README.ko 첫 3분 외부 사용자 흐름 재정리
- [x] 테스트/벤치마크/릴리스 게이트 실행
- [x] PR 생성, CI 확인, main merge, branch cleanup

### 판단 기준

- 실제 1주일 dogfooding은 제외하고 자동화 가능한 품질 게이트만 강화한다.
- benchmark는 prompt quality score와 coach output이 행동 가능한지 숫자로 확인해야 한다.
- agent 내부 사용자는 웹을 열지 않아도 `coach_prompt` 하나로 다음 행동을 알아야 한다.
- 첫 설치 문서는 CLI 설치, marketplace, setup, 첫 prompt, coach 순서를 3분 안에 이해시켜야 한다.

## 2026-05-03 Session Start Web Auto-Open

- [x] Claude Code/Codex session-start hook 설계와 opt-in 범위 확정
- [x] TDD로 hook 설치, session-start 실행, setup 출력 고정
- [x] 로컬 서버 ensure + 웹 open hook 구현
- [x] README/플러그인 setup 문서 갱신
- [x] 테스트/릴리스 게이트 실행
- [x] PR 생성, CI 확인, main merge, branch cleanup

### 판단 기준

- npm/plugin 설치만으로 브라우저를 몰래 띄우지 않는다.
- 사용자가 `--open-web`를 명시한 setup/install-hook에서만 자동 웹 open을 설치한다.
- SessionStart hook은 fail-open이고 stdout/stderr에 prompt, path, token을 노출하지 않는다.
- 서버가 꺼져 있으면 로컬 server를 detached로 띄우고 웹 UI를 연다.
- 같은 session id에서 반복 실행되어도 브라우저 spam을 만들지 않는다.

## 2026-05-03 Product Identity And Usability Audit

- [x] 정체성 기준과 점검 범위 문서화
- [x] CLI 첫 사용/agent-native coach 흐름 검증
- [x] 웹 UI/접근성/사용성 실브라우저 검증
- [x] README/plugin/MCP 문구와 실제 기능 일치 점검
- [x] 발견한 결함 또는 얇은 지점 개선
- [x] 테스트/릴리스 게이트 실행
- [x] PR 생성, CI 확인, main merge, branch cleanup

### 판단 기준

- 제품 정체성은 “AI coding prompt coach and memory workspace, local-first”로 일관되어야 한다.
- 첫 사용자는 웹 대시보드보다 `setup -> real prompt -> coach` 루프를 먼저 이해해야 한다.
- Claude Code/Codex 내부에서 score, habit review, rewrite guidance를 쉽게 호출할 수 있어야 한다.
- 웹은 기록/대시보드/회고용이어야 하며, agent-native 흐름과 역할이 겹쳐 혼란을 만들면 안 된다.
- privacy/trust 메시지는 local-first를 과장하지 않고 agent-mediated egress risk를 분명히 해야 한다.

## 2026-05-03 Coach Activation Runbook

- [x] 현재 `start` / `setup` / README 첫 성공 흐름 점검
- [x] 첫 5분 happy path를 TDD로 고정
- [x] `start`와 `setup` 출력에서 MCP fallback/doctor/web archive를 문제 해결 섹션으로 분리
- [x] README/README.ko/plugin command 문서를 coach-first activation 중심으로 정리
- [x] CLI targeted tests와 release gate 실행
- [x] PR 생성, CI 확인, main merge, branch cleanup

### 판단 기준

- 첫 사용자는 MCP, hook, server, dashboard 개념을 모두 이해하지 않아도 첫 prompt score를 확인할 수 있어야 한다.
- 기본 안내는 `setup -> 실제 prompt 하나 전송 -> coach` 순서가 먼저 보여야 한다.
- `doctor`, manual MCP registration, web archive는 실패/심화 경로로 분리한다.
- agent-assisted rewrite/judge가 hidden external call처럼 오해되지 않도록 privacy boundary 문구는 유지한다.

## 2026-05-03 Google API Key Redaction Privacy Fix

- [x] Google/Gemini API key detector 회귀 테스트 추가
- [x] Markdown/SQLite/snippet/FTS raw key 미노출 storage 회귀 테스트 추가
- [x] detector 보강 및 targeted privacy 검증
- [x] 기존 local archive remediation 경로 확인
- [x] CLI/UI 사용성 재검증
- [x] 오픈소스 유용성 평가 정리
- [x] PR 생성, CI 확인, main merge, branch cleanup

### 판단 기준

- Google/Gemini `AIza...` API key는 phone detector보다 먼저 전체가 `api_key`로 redaction되어야 한다.
- Markdown, SQLite prompt row, redaction event, snippet, FTS 검색 경계 어디에도 raw key가 남으면 안 된다.
- 이미 저장된 local archive를 복구할 수 있는 안전한 경로를 확인하거나, 사용자에게 명확한 remediation 명령을 제공한다.
- 사용성 평가는 기능 나열이 아니라 첫 사용, 반복 사용, privacy trust, Claude Code/Codex 내부 사용 흐름 기준으로 판단한다.

## 2026-05-03 Doctor MCP List Detection

- [x] `doctor`가 설정 파일 감지 실패 시 agent CLI `mcp list`를 read-only fallback으로 확인
- [x] `mcp list` 실패가 capture/server/token 진단을 깨지 않도록 TDD로 고정
- [x] `setup --register-mcp` 이후 doctor 신뢰도 문서 갱신
- [x] targeted/full 검증 실행
- [x] PR 생성, CI 확인, main merge, branch cleanup

### 판단 기준

- `doctor`는 실제 등록 성공 후에도 config path heuristic 차이 때문에 `not detected`를 과도하게 내면 안 된다.
- fallback은 `claude mcp list` / `codex mcp list`처럼 read-only command만 사용한다.
- CLI가 없거나 list가 실패하면 기존 설정 파일 heuristic 결과와 next action 안내를 유지한다.
- 외부 command stderr/stdout에 prompt body나 token을 찍지 않는다.

## 2026-05-03 Optional MCP Registration In Setup

- [x] `setup --profile coach --register-mcp` 동작을 TDD로 설계
- [x] dry-run에서는 실제 agent config를 쓰지 않고 등록 명령만 preview
- [x] 명시 옵션이 있을 때만 Claude Code/Codex MCP 등록 명령 실행
- [x] setup 출력/README/PLUGIN 문서를 one-command coach setup에 맞게 갱신
- [x] targeted/full 검증 실행
- [x] PR 생성, CI 확인, main merge, branch cleanup

### 판단 기준

- 기본 `setup --profile coach`는 여전히 MCP 설정을 자동으로 바꾸지 않고 명령만 안내한다.
- 사용자가 `--register-mcp`를 명시하면 setup consent 범위 안에서 MCP 등록까지 처리한다.
- 실패한 MCP 등록은 capture hook 설치를 되돌리거나 숨기지 않고, 결과와 다음 명령을 명확히 보여준다.
- dry-run은 실제 `claude`/`codex` 명령을 실행하지 않는다.

## 2026-05-03 Coach First Activation

- [x] 첫 5분 성공 흐름을 `start`/setup/doctor 안내로 압축
- [x] `doctor`가 MCP 등록 상태와 다음 명령을 함께 보여주도록 TDD 개선
- [x] README/README.ko를 coach-first quick start로 정리하고 `--json`을 고급 흐름으로 이동
- [x] agent rewrite/judge privacy 문구를 agent-mediated egress risk 기준으로 강화
- [x] 웹 빈 상태를 첫 prompt capture + score 확인 중심으로 단순화
- [x] targeted/full 검증 실행
- [x] PR 생성, CI 확인, main merge, branch cleanup

### 판단 기준

- 첫 사용자는 CLI, marketplace, setup, MCP, web 개념을 모두 이해하지 않아도 첫 prompt score까지 도달해야 한다.
- `doctor`는 capture readiness뿐 아니라 MCP 등록 여부와 바로 실행할 등록 명령을 알려줘야 한다.
- agent rewrite/judge는 local-only로 과장하지 않고 redacted packet이 active agent provider session으로 전달될 수 있음을 명확히 표시한다.
- 웹 빈 archive는 기능 목록보다 “프롬프트 하나 보내고 점수 보기”를 우선 안내한다.

## 2026-05-03 Agent Assisted Rewrite MCP

- [x] 현재 MCP/storage contract에서 agent-assisted rewrite 저장 경계 확정
- [x] `prepare_agent_rewrite` / `record_agent_rewrite` tool을 TDD로 추가
- [x] MCP server/tool catalog/agent command 문서에 새 workflow 연결
- [x] privacy-safe redaction, prompt body/raw path 미노출 회귀 테스트 추가
- [x] targeted/full 검증 실행
- [x] PR 생성, CI 확인, main merge, branch cleanup

### 판단 기준

- `promptlane`는 외부 LLM/API를 직접 호출하지 않고 현재 Claude Code/Codex/Gemini CLI 세션이 rewrite를 만든다.
- prepare tool은 bounded redacted prompt packet과 명확한 rewrite contract만 반환한다.
- record tool은 승인 가능한 rewrite draft와 metadata만 저장하고 raw prompt body, raw absolute path, secret을 저장/반환하지 않는다.
- local deterministic rewrite는 빠른 fallback으로 유지하고, agent-assisted rewrite는 사용자가 명시적으로 요청했을 때만 실행한다.

## 2026-05-03 Critical Usability Flow

- [x] `improve_prompt latest/prompt_id`가 저장 prompt summary가 아니라 redacted archive body를 기반으로 개선하도록 TDD 수정
- [x] CLI 첫 사용 명령 출력이 사람이 읽기 쉬운지 점검하고 필요한 경우 `--json` 경계를 정리
- [x] 웹 빈 archive/onboarding과 MCP tool catalog 불일치 점검 및 개선
- [x] README/README.ko의 first-run 흐름을 global install 사용자 기준으로 정리
- [x] targeted/full 검증 실행
- [x] PR 생성, CI 확인, main merge, branch cleanup

### 판단 기준

- 저장된 prompt 개선은 원문 전체를 그대로 반환하지 않으면서도 실제 요청의 대상/맥락을 반영해야 한다.
- 첫 사용자는 `setup --profile coach`, `doctor`, `coach/score latest`, `open` 순서를 혼동하지 않아야 한다.
- 기본 CLI 출력은 사람이 읽기 쉽고, JSON은 `--json` 또는 agent automation용으로 유지한다.
- 웹 UI는 빈 상태에서도 Claude Code/Codex 양쪽 setup과 다음 행동을 바로 보여줘야 한다.

## 2026-05-03 Feature QA And Hardening

- [x] 현재 main 기능 표면과 공개 문서의 불일치 점검
- [x] 전체 테스트/린트/빌드/smoke/browser/benchmark gate 실행
- [x] 실패하거나 얇은 기능 경계에 회귀 테스트 추가
- [x] 필요하면 privacy-safe, 문서 정확도, 사용성 관련 소규모 개선 적용
- [x] 전체 release gate 재실행
- [x] PR 생성, CI 확인, main merge, branch cleanup

### 판단 기준

- 사용자에게 공개되는 기능 목록과 실제 구현 상태가 어긋나지 않아야 한다.
- 새 agent-judge 기능은 hidden external call, token proxy, raw prompt/path 저장 없이 동작해야 한다.
- 테스트는 단순 snapshot보다 실제 CLI/MCP/server/storage 경계를 검증해야 한다.
- 기능 추가보다 불안정한 경계, 문서 불일치, privacy regression 방지를 우선한다.

## 2026-05-03 Agent Judge MCP

- [x] Claude Code/Codex 공식 문서와 법적 경계 재확인 후 프로젝트 문서화
- [x] 현재 MCP/Storage 구조에서 agent judge 결과 저장 경계 설계
- [x] redacted judge packet / judgment 저장 MCP tool을 TDD로 추가
- [x] README/PLUGINS/architecture 문서에 opt-in, local-first, provider-auth 경계 반영
- [x] targeted/full 검증 실행
- [x] PR 생성
- [x] CI 확인, main merge, branch cleanup

### 판단 기준

- `promptlane`가 사용자 Claude/OAuth나 Codex 계정을 대신 라우팅하는 숨은 외부 호출을 하지 않는다.
- Claude Code/Codex 현재 세션이 MCP tool로 redacted prompt packet을 받아 직접 평가하고, 결과만 저장한다.
- 원문 prompt body, raw absolute path, secret은 judge packet/result/log/stdout/stderr에 노출하지 않는다.
- LLM judge 결과는 advisory signal로 저장하고, deterministic local score를 기본 기준으로 유지한다.

## 2026-05-03 Agent Wrapper Experiment

- [x] 로컬 Claude/Codex CLI의 초기 prompt 입력 표면 확인
- [x] `pl-claude` / `pl-codex` wrapper 설계와 TDD 구현
- [x] package bin, README/PLUGINS 문서, release packaging 반영
- [x] dry-run/실행 smoke와 전체 검증 실행
- [x] PR 생성, CI 확인, main merge, branch cleanup

### 판단 기준

- wrapper는 초기 prompt 인자만 rewrite/approval 대상으로 삼고, interactive 입력창 내부를 계속 가로채는 것처럼 과장하지 않는다.
- 기본값은 approval 모드이며, 진짜 딸깍 자동 rewrite는 `--pc-mode auto`로 명시한다.
- `--pc-dry-run`은 실제 Claude/Codex를 실행하지 않고 어떤 prompt가 선택될지 privacy-safe JSON으로 검증 가능해야 한다.
- subcommand, auth, mcp, plugin 같은 관리 명령은 rewrite하지 않고 원 CLI로 pass-through 해야 한다.

## 2026-05-03 Coach Setup Profile

- [x] coach profile UX 기준과 안전한 기본값 확정
- [x] `setup --profile coach` TDD 구현
- [x] statusline / plugin / README 문서 갱신
- [x] targeted/full 검증 실행
- [x] PR 생성, CI 확인, main merge, branch cleanup

### 판단 기준

- 기본 `setup`은 기존 capture-only 동작을 유지한다.
- coach profile은 별도 명령을 여러 번 외우지 않아도 hook, rewrite guidance, statusline까지 한 번에 연결해야 한다.
- 기본 coach profile은 `context` rewrite guard로 마찰을 줄이고, 더 엄격한 `block-and-copy`는 명시 옵션으로 둔다.
- statusline은 점수뿐 아니라 다음 행동을 바로 보여줘야 한다.

## 2026-05-03 Prompt Rewrite Guard

- [x] 공식 hook 표면 안에서 가능한 Query Rewriting 범위 확정
- [x] hook rewrite guard를 opt-in TDD로 추가
- [x] Claude/Codex hook CLI와 install-hook 옵션에 안전하게 연결
- [x] README/Tech spec/plugin docs에 block-and-copy 제약과 사용법 반영
- [x] targeted/full 검증 실행
- [x] PR 생성, CI 확인, main merge, branch cleanup

### 판단 기준

- 입력창 조작, 자동 Enter, 비공식 TTY 제어는 하지 않는다.
- 기본값은 기존처럼 capture-only fail-open이어야 한다.
- block-and-copy는 원 prompt를 처리하지 못하게 막고, 개선안을 사용자에게 보여주며 clipboard 복사를 best-effort로 시도한다.
- context 모드는 원문 replacement가 아니라 model-visible rewrite guidance임을 문서에 명확히 적는다.

## 2026-05-03 Storage Boundary Refactor

- [x] `sqlite.ts`의 현재 책임과 테스트 커버리지 확인
- [x] 동작 변경 없이 SQLite row mapping/serialization 같은 고효과 경계 분리
- [x] architecture docs/quality gate를 새 storage 경계에 맞춰 갱신
- [x] storage targeted tests와 전체 release gate 실행
- [x] PR 생성, CI 확인, main merge, branch cleanup

### 판단 기준

- DB schema, SQL query behavior, archive source-of-truth 규칙은 바꾸지 않는다.
- route/CLI/MCP가 의존하는 `PromptStorage` public contract는 유지한다.
- raw prompt body, token, raw path가 새 로그나 에러 경로로 새지 않아야 한다.

## 2026-05-03 MCP Tool Contract Refactor

- [x] 현재 main 품질 지표와 큰 파일 압박점 재확인
- [x] MCP tool contract/schema를 handler 구현에서 분리
- [x] architecture docs와 quality gate를 새 경계에 맞춰 갱신
- [x] targeted MCP tests와 전체 release gate 실행
- [x] PR 생성, CI 확인, main merge, branch cleanup

### 판단 기준

- MCP tool 정의, output schema, handler 구현, storage access가 한 파일에서 계속 커지지 않아야 한다.
- tool 설명은 Claude Code/Codex가 직접 선택할 수 있을 만큼 구체적이어야 하고 privacy-safe 반환 규칙을 반복해야 한다.
- handler behavior는 바꾸지 않고 contract-only extraction으로 regression surface를 최소화한다.

## 2026-05-03 Codebase Quality Pass

- [x] 새 작업 브랜치에서 시작하고 현재 보호/PR 운영 규칙 확인
- [x] lint, code-quality scanner, 큰 파일/AI스러운 구조 후보를 수집
- [x] 동작 변경이 작은 모듈화/품질 개선을 우선 적용
- [x] targeted tests와 전체 quality gate 실행
- [ ] PR 생성, CI 확인, main merge, branch cleanup

### 판단 기준

- 오픈소스 첫 공개 전에는 큰 파일, 지나치게 많은 책임, 일회성 문서/규칙, raw prompt/privacy 위험을 우선 점검한다.
- 기능 PR에 대형 리라이트를 섞지 않고, 안전하게 분리 가능한 부분만 이번 패스에서 고친다.
- 큰 리팩터링이 필요한 파일은 별도 후속 PR 후보로 남긴다.

## 2026-05-03 Merge And Architecture Handoff

- [x] 현재 PR의 mergeability, CI, review gate를 재확인
- [x] 오픈소스 아키텍처 관점에서 지금 머지할 범위와 후속 리팩터링 PR 범위를 분리
- [x] 보호 규칙을 지키는 방식으로 PR을 main에 머지 시도
- [ ] 머지 성공 시 원격/로컬 feature branch를 정리
- [x] 앞으로 작업 단위는 branch -> PR -> main merge -> branch cleanup으로 진행

### 현재 상태

- 2026-05-03 기준 PR #1은 mergeable이고 CI는 Node 22/24 모두 통과했다.
- 정상 `gh pr merge --squash --delete-branch`는 base branch required review 정책 때문에 차단되었다.
- `--auto` merge도 저장소에서 auto-merge가 비활성화되어 차단되었다.
- 오픈소스 보호 흐름을 지키기 위해 `--admin` bypass는 사용하지 않았다.

### 판단 기준

- CI green, clean worktree, mergeable 상태라도 required review gate는 우회하지 않는다.
- 대형 모듈 분리는 기능 PR에 섞지 않고 별도 리팩터링 PR로 진행한다.
- 오픈소스 운영에서는 admin bypass보다 보호 규칙과 리뷰 흐름을 우선한다.

## 2026-05-03 Architecture QA And Agent Rules

- [x] Always-on buddy/statusline 변경 코드 QA와 구조 리스크 점검
- [x] `statusline` CLI registration을 작은 함수로 분리
- [x] Node/TypeScript 모듈화 기준을 `docs/ARCHITECTURE.md`, `CLAUDE.md`, `AGENTS.md`, `.claude/rules`에 반영
- [x] 문서 패키징/검증 게이트 재실행
- [x] 커밋, 푸시, CI 확인

### 판단 기준

- CLI command 파일은 명령 등록, orchestration, formatting을 과도하게 한 함수에 몰아넣지 않는다.
- Node runtime 코드는 `module: NodeNext`, ESM, explicit runtime boundary, type-only import를 기준으로 한다.
- Spring식 계층을 그대로 복제하지 않고 port/adapter, local domain service, CLI/server/MCP entrypoint 경계로 설명한다.
- 문서와 agent rules는 privacy, local-first, hook fail-open, prompt body/raw path 미노출 규칙을 반복해서 고정한다.

## 2026-05-03 Always-On Prompt Buddy

- [x] Claude Code status line에 최신 prompt score HUD를 TDD로 추가
- [x] Claude Code/Codex 옆 split pane에서 띄우는 `promptlane buddy` CLI를 TDD로 추가
- [x] `/promptlane:coach` / MCP 문서와 plugin 안내를 always-on buddy 흐름과 연결
- [x] privacy-safe 출력, CLI 실제 실행, release gate 검증
- [x] 커밋, 푸시, CI 확인

### 판단 기준

- Claude Code/Codex 내부 UI를 해킹하지 않고 공식/안정적인 표면(statusLine, CLI, MCP/slash command)만 사용한다.
- 최신 점수, 가장 큰 약점, 추세, capture 상태를 prompt body, raw absolute path, secret 없이 보여준다.
- Codex에는 공식 statusLine이 없으므로 `buddy` split pane을 공통 always-on 경험으로 제공한다.
- buddy는 기본적으로 TTY에서 반복 갱신하고, `--once`/`--json`으로 테스트와 자동화가 쉬워야 한다.

## 2026-05-03 Unified Agent Coach

- [x] `coach_prompt` MCP 통합 workflow를 TDD로 추가
- [x] `promptlane coach --json` CLI fallback을 추가하고 top-level CLI에 연결
- [x] Claude Code `/promptlane:coach` command와 Codex skill/default prompt를 갱신
- [x] privacy-safe partial failure와 raw path/body 미노출 검증
- [x] release gate, 커밋, 푸시, CI 확인

### 판단 기준

- Claude Code/Codex는 여러 tool을 순서대로 추론하지 않아도 한 번의 호출로 최신 요청 점수, 개선안, 반복 습관, 프로젝트 규칙, 다음 요청 템플릿을 받아야 한다.
- `coach_prompt`와 CLI fallback은 setup-needed 상태도 실패가 아니라 다음 행동으로 돌려준다.
- 반환값은 prompt body, raw absolute path, instruction file body, secret을 포함하지 않는다.
- 웹 UI는 변경하지 않고 agent-facing MCP/CLI/plugin 표면만 강화한다.

## 2026-05-03 Agent-Native PromptLane Workflow

- [x] Claude Code/Codex 안에서 바로 쓰는 핵심 workflow 범위 확정
- [x] `score --latest`, `improve --latest` CLI fallback을 TDD로 추가
- [x] Claude Code slash command 5종 추가 및 plugin manifest 반영
- [x] Codex plugin skill/default prompt와 README/PLUGINS 문서 갱신
- [x] targeted tests, release gate, 커밋/푸시 확인

### 판단 기준

- 사용자는 웹을 열지 않아도 Claude Code/Codex 안에서 방금 요청 점수화, 개선, 습관 요약, 프로젝트 규칙 평가, 다음 요청 템플릿 생성을 실행할 수 있어야 한다.
- MCP가 있으면 MCP tool을 우선하고, MCP가 없으면 raw prompt body를 출력하지 않는 CLI fallback을 제공한다.
- 새 기능은 prompt body, raw absolute path, secret을 stdout/stderr나 plugin 문서 예시에 노출하지 않는다.
- tool 수를 불필요하게 늘리기보다 기존 MCP tool과 CLI fallback을 agent-facing command로 묶는다.

## 2026-05-03 Practice Projected Score Preview

- [x] quick fix 전체 적용 draft preview 모델을 TDD로 추가
- [x] Practice UI에서 fixes 적용 후 예상 점수와 delta를 표시
- [x] browser E2E와 desktop/mobile screenshot으로 흐름 확인
- [x] release gate 검증, 커밋, 푸시, CI 확인

### 판단 기준

- 사용자는 quick fix를 적용하기 전에 예상 점수 개선 폭을 볼 수 있어야 한다.
- projected preview는 브라우저 메모리에서만 계산하고 prompt draft text, raw path, secret을 저장하지 않는다.
- 새 화면, 새 DB, 새 MCP tool 없이 Practice builder의 확신과 행동성을 강화한다.

## 2026-05-03 Practice Quick Fix Builder

- [x] Practice quick-fix builder 모델을 TDD로 추가
- [x] Practice UI에서 빠진 항목을 one-click section snippet으로 보완
- [x] 브라우저 E2E와 스크린샷으로 desktop/mobile 확인
- [x] release gate 검증, 커밋, 푸시, CI 확인

### 판단 기준

- 사용자는 점수를 읽고 직접 고민하지 않아도 부족한 프롬프트 섹션을 바로 추가할 수 있어야 한다.
- quick fix는 브라우저 draft textarea 안에서만 작동하고 prompt draft text, raw path, secret을 저장하지 않는다.
- 새 탭, 새 DB, 새 MCP tool을 늘리지 않고 Practice 화면의 핵심 행동만 강화한다.

## 2026-05-03 Coach Brief Preview

- [x] raw-free brief preview 모델을 TDD로 추가
- [x] Coach command center에서 생성된 brief 내용을 확인하고 복사할 수 있게 UI 개선
- [x] 브라우저 E2E와 스크린샷으로 desktop/mobile 확인
- [x] release gate 검증, 커밋, 푸시, CI 확인

### 판단 기준

- 사용자는 복사 전에 다음 요청 브리프 내용을 눈으로 확인할 수 있어야 한다.
- preview와 copied text 모두 prompt body, raw absolute path, secret을 포함하지 않는다.
- 새 탭이나 새 저장소 데이터를 늘리지 않고 Coach 화면 안에서 신뢰도와 사용성을 높인다.

## 2026-05-03 Coach Next Request Brief

- [x] Prompt habit coach가 raw-free next request brief를 만들도록 TDD로 추가
- [x] Coach command center에 copy next request brief 액션과 상태 표시
- [x] 브라우저 E2E와 스크린샷으로 실제 사용성/디자인 확인
- [x] release gate 검증, 커밋, 푸시, CI 확인

### 판단 기준

- 사용자는 분석 결과를 읽고 다시 생각하지 않아도 다음 Claude Code/Codex 요청 초안을 바로 복사할 수 있어야 한다.
- brief는 반복 약점, 고칠 습관, 검증 요구만 포함하고 prompt body, raw absolute path, secret을 포함하지 않는다.
- 새 탭이나 새 저장소 데이터를 늘리지 않고 Dashboard/Coach의 핵심 행동만 강화한다.

## 2026-05-03 Practice Outcome Feedback

- [x] Practice copied draft outcome 모델을 TDD로 추가
- [x] Practice UI에 Worked / Needs context / Blocked feedback controls와 outcome summary 표시
- [x] browser E2E, release gate 검증
- [x] 커밋, 푸시, CI 확인

### 판단 기준

- 사용자는 복사한 개선 초안이 실제 작업에 도움이 됐는지 빠르게 표시할 수 있어야 한다.
- outcome은 score, label, outcome metadata만 저장하고 prompt draft text는 저장하지 않는다.
- 기능은 Practice 화면 안에서 작고 명확해야 하며 새 탭이나 새 MCP tool을 늘리지 않는다.

## 2026-05-03 Practice Score History Loop

- [x] Practice copy 이후 원문 없는 score history 모델을 TDD로 추가
- [x] Practice UI에 최근 점수 추이 그래프와 반복 보완 항목을 표시
- [x] MCP archive tool 설명과 웹 카탈로그에 practice plan/next template 반환을 더 명확히 반영
- [x] browser E2E, MCP stdio, release gate 검증
- [x] 커밋, 푸시, CI 확인

### 판단 기준

- 사용자는 다음 요청 초안을 복사할 때마다 자신의 작성 품질이 오르는지 볼 수 있어야 한다.
- practice history는 prompt draft 원문, raw path, secret을 저장하지 않는다.
- 새 MCP tool을 늘리지 않고 기존 tool 선택 부담을 유지한다.

## 2026-05-03 Prompt Practice Workspace

- [x] 점수/연습 계획 다음에 실제 작성 작업면이 필요한지 재평가
- [x] Practice 탭에서 archive template을 불러오고 로컬 점수 preview를 즉시 보여주기
- [x] copy draft, checklist, missing habit 표시를 desktop web 기준으로 정리
- [x] browser E2E, MCP stdio, release gate 검증
- [x] 커밋, 푸시, CI 확인

### 판단 기준

- 사용자는 promptlane 안에서 다음 Claude Code/Codex 요청을 작성하고 바로 점수를 확인할 수 있어야 한다.
- 초안 작성/점수 preview는 로컬 deterministic rule만 사용하고 prompt를 저장하지 않는다.
- Practice 화면은 raw prompt archive를 새로 노출하지 않고 사용자가 직접 작성 중인 draft만 다룬다.

## 2026-05-03 Archive Practice Plan UX

- [x] `score_prompt_archive`가 점수뿐 아니라 다음 연습 행동을 줄 수 있는지 재평가
- [x] privacy-safe practice plan과 next prompt template을 TDD로 추가
- [x] Scores UI에서 practice plan, copy template, 그래프 주변 정보 구조 보강
- [x] MCP schema/docs/browser E2E/release gate 검증
- [x] 커밋, 푸시, CI 확인

### 판단 기준

- 사용자는 점수와 그래프를 본 뒤 바로 다음 prompt에 넣을 문장을 얻어야 한다.
- practice plan은 prompt body, raw absolute path, secret을 포함하지 않는다.
- 새 MCP tool을 추가하지 않고 기존 `score_prompt_archive`를 더 actionable하게 만들어 tool 선택 부담을 늘리지 않는다.

## 2026-05-03 MCP Output Schema Contract Polish

- [x] MCP `structuredContent`와 tool definition 사이의 남은 contract gap 확인
- [x] 모든 MCP tool에 `outputSchema`를 추가하고 TDD로 고정
- [x] Web MCP catalog와 문서에 output schema 보장 문구 반영
- [x] MCP stdio, browser E2E, release gate 검증
- [x] 커밋, 푸시, CI 확인

### 판단 기준

- `structuredContent`를 반환하는 tool은 에이전트가 예상 가능한 `outputSchema`를 함께 제공해야 한다.
- schema는 prompt body, raw absolute path, secret 반환을 허용하지 않는 privacy contract와 맞아야 한다.
- UI에는 “기능이 많다”보다 “Claude Code/Codex가 안전하게 호출할 수 있다”는 판단 근거가 보여야 한다.

## 2026-05-03 MCP Improve Prompt Tool

- [x] MCP 기능 gap 재평가: score 이후 승인 가능한 개선안 생성 흐름 필요성 판단
- [x] `improve_prompt` MCP tool을 TDD로 추가하고 local-only/privacy contract 검증
- [x] MCP 서버, 웹 MCP 카탈로그, README/docs/plugin skill에 새 tool 설명 반영
- [x] browser E2E, MCP stdio 실제 호출, release gate 검증
- [x] 커밋, 푸시, CI 확인

### 판단 기준

- `improve_prompt`는 직접 prompt, 저장된 `prompt_id`, 최신 prompt 중 하나만 입력받는다.
- 직접 입력은 저장하지 않고, 저장 prompt도 원문 body/raw path/secret을 반환하지 않는다.
- 개선안은 자동 제출하지 않으며 `requires_user_approval: true`와 safety notes를 반환한다.
- tool 수가 늘어도 각 tool의 사용 시점이 겹치지 않아야 한다.

## 2026-05-03 MCP Structured Tool Contract Polish

- [x] MCP tool contract가 에이전트가 안정적으로 쓰기에 충분한지 재평가
- [x] MCP `tools/call` 응답에 `structuredContent`를 추가하고 테스트로 고정
- [x] MCP tool definition에 read-only/local-only risk hints를 추가하고 웹 카탈로그에 표시
- [x] 한국어/영어 UI 문구, browser E2E, release gate 검증
- [x] 커밋, 푸시, CI 확인

### 판단 기준

- MCP tool은 raw prompt body, raw absolute path, secret을 반환하지 않는다.
- 에이전트가 tool 선택 시 read-only/local-only/structured JSON 여부를 바로 알 수 있어야 한다.
- 웹 MCP 화면은 설명용 문서가 아니라 실제 Claude Code/Codex 호출 전 참고하는 작업 화면이어야 한다.

## 2026-05-03 MCP Live Readiness UI

- [x] MCP 화면이 실제 사용 준비 상태를 판단하는 데 충분한지 재평가
- [x] MCP 화면에 prompt count, scored count, redaction, next call을 보여주는 live readiness 패널 추가
- [x] 한국어/영어 UI 문구와 browser E2E 검증 보강
- [x] 전체 검증, 커밋, 푸시, CI 확인

### 판단 기준

- MCP 화면은 도구 목록만 보여주는 설명 페이지가 아니라 Claude Code/Codex 사용 전에 확인하는 운영 화면이어야 한다.
- 표시 데이터는 dashboard/settings/health의 안전한 aggregate만 사용하고 prompt body, raw path, secret은 노출하지 않는다.
- next call은 캡처된 데이터가 없으면 setup/status, 데이터가 있으면 archive score로 자연스럽게 이어져야 한다.

## 2026-05-03 MCP Tool Catalog UI Polish

- [x] 추가 탭/화면이 실제로 필요한지 IA 기준으로 판단
- [x] MCP tool catalog 화면을 추가해 tool 선택 기준과 예시 prompt를 웹에서 확인 가능하게 만들기
- [x] 한국어/영어 UI 문구와 browser E2E 검증 보강
- [x] 전체 검증, 커밋, 푸시, CI 확인

### 판단 기준

- MCP 화면은 마케팅 설명이 아니라 Claude Code/Codex 사용자가 바로 호출할 tool을 고르는 작업 화면이어야 한다.
- tool 설명은 what/when/returns/privacy가 분리되어 있어야 한다.
- prompt body, raw path, secret을 화면에 새로 노출하지 않는다.

## 2026-05-03 MCP Status Preflight And Final Polish

- [x] UI/UX 추가 탭 필요성 재평가
- [x] MCP에서 promptlane 준비 상태를 확인하는 preflight tool 추가
- [x] README/Plugin/Tech spec에 새 MCP tool 사용 맥락 반영
- [x] MCP 테스트와 release/browser 검증 재실행
- [x] 커밋, 푸시, CI 확인

### 판단 기준

- 탭은 정보를 숨기기보다 탐색을 더 쉽게 만들 때만 추가한다.
- MCP status tool은 score tool과 겹치지 않고, 에이전트가 캡처/저장/측정 준비 상태를 판단하는 데만 쓴다.
- status tool도 prompt body, raw path, secret을 반환하지 않는다.

## 2026-05-03 Product Polish: Charts, MCP Tools, UX Review

- [x] 현재 기능 표면이 실제 사용 가치와 맞는지 재점검
- [x] 오픈소스 React chart library를 검토하고 Dashboard/Scores/Insights에 적용
- [x] MCP tool 목록과 설명을 Claude Code/Codex 사용 맥락에 맞게 보강
- [x] Project instruction review를 MCP에서도 호출 가능한지 검토하고 필요한 경우 추가
- [x] UI/UX를 desktop web 기준으로 더 보기 좋고 분석 도구답게 개선
- [x] 테스트, build, browser E2E, pack dry-run 검증 후 커밋/푸시

### 판단 기준

- 그래프는 장식이 아니라 품질 추세, 점수 분포, 반복 약점처럼 사용자가 다음 행동을 결정하는 데이터에만 쓴다.
- 외부 라이브러리는 유명하고 유지보수되는 오픈소스이며 현재 React/Vite 구조와 충돌하지 않아야 한다.
- MCP tool 설명은 에이전트가 언제 어떤 도구를 써야 하는지, 어떤 개인정보를 반환하지 않는지 분명해야 한다.
- Project instruction 분석은 파일 원문, raw absolute path, secret을 반환하지 않는다.

## 2026-05-03 Project Instruction Analysis And Sidebar Polish

- [x] `AGENTS.md` / `CLAUDE.md` 분석 기준과 저장 범위 확정
- [x] 로컬 파일 원문/경로를 노출하지 않는 project instruction snapshot 저장소 구현
- [x] Projects API와 Web UI에서 분석 실행/결과 표시 추가
- [x] 좌측 navigation rail 크기, 타이포그래피, 터치 영역 개선
- [x] 테스트, browser E2E, 빌드 검증 후 커밋/푸시

### 판단 기준

- 프로젝트 규칙 파일 원문과 raw absolute path는 API/UI에 반환하지 않는다.
- 점수는 deterministic local rubric으로 계산하고 외부 LLM을 호출하지 않는다.
- 사용자는 Projects 화면에서 프로젝트별 규칙 파일 상태, 점수, 부족 항목, 다음 수정 힌트를 바로 볼 수 있어야 한다.
- Sidebar는 desktop web 기준으로 현재보다 넓고 큰 글자/아이콘/클릭 영역을 제공해야 한다.

## 2026-05-02 Agent Measurement Verification And Live Refresh

- [x] MCP `score_prompt` / `score_prompt_archive`가 Claude Code/Codex에서 쓸 수 있는지 실제 호출로 점검
- [x] 현재 입력 prompt가 hook capture 후 archive score와 web measurement에 반영되는지 검증
- [x] 웹 Benchmark/Dashboard에서 새 prompt 측정이 자동 또는 명확한 refresh로 보강
- [x] Claude Code/Codex 사용 문서와 E2E/테스트 보강
- [x] 전체 검증, 커밋, 푸시, PR 상태 확인

### 판단 기준

- Agent는 raw prompt body 없이 현재 prompt 또는 archive를 점수화할 수 있어야 한다.
- Hook으로 들어온 Claude Code/Codex prompt가 score archive와 web measurement에 반영되어야 한다.
- 사용자가 화면을 보고 있을 때 새 prompt capture가 감지되면 측정 재실행 행동이 분명해야 한다.
- 외부 LLM 호출이나 자동 재입력은 이번 범위에 포함하지 않는다.

## 2026-05-02 Live Archive Measurement UX

- [x] 현재 benchmark/score 기능이 웹에서 바로 보이는지 점검
- [x] 실사용 archive measurement 모델과 우선 표시 데이터 확정
- [x] Dashboard/Scores 또는 별도 화면에 `Measure now` 흐름 구현
- [x] 한국어/영어 문구, 테스트, browser E2E 보강
- [x] 에이전트 병렬 점검 결과 반영 후 검증, 커밋 및 푸시

### 판단 기준

- Benchmark v1은 개발 회귀 측정이고, 사용자의 실제 archive 측정과 혼동되지 않아야 한다.
- 사용자는 버튼 하나로 현재 프롬프트 습관 점수, review backlog, biggest gap, privacy 상태, next action을 볼 수 있어야 한다.
- 측정 결과는 raw prompt body, raw path, secret을 표시하지 않는다.
- 측정 화면은 정보를 늘리기보다 다음 행동을 분명하게 해야 한다.

## 2026-05-02 Display Data Usefulness And Query Audit

- [x] Dashboard/Coach/Scores/Insights에 표시되는 데이터 목록과 필요성 평가
- [x] API/SQLite 집계 경로가 실제 표시 데이터와 일치하는지 검증
- [x] 불필요하거나 오해를 부르는 표시 항목 제거/조정
- [x] 반복 호출 쿼리와 dashboard 집계 쿼리 최적화 필요 여부 확인
- [x] 테스트, 브라우저 웹 점검, 커밋 및 푸시

### 판단 기준

- 사용자가 다음 행동을 결정하는 데 직접 도움이 되는 데이터만 우선 표시한다.
- privacy-safe project label, masked path, redaction 상태를 유지한다.
- 단순히 “있어서 보여주는” 데이터는 숨기거나 더 적절한 화면으로 이동한다.
- 쿼리 최적화는 실제 WHERE/ORDER/GROUP BY 경로를 보고 판단한다.

## 2026-05-02 Dashboard Information Architecture Split

- [x] Dashboard를 overview 전용 화면으로 축소
- [x] PromptLane, Scores, Insights를 좌측 메뉴의 독립 화면으로 분리
- [x] 기존 Dashboard 섹션을 새 화면에 재배치하고 중복/과밀 표시 제거
- [x] English/Korean UI 문구와 라우팅/E2E 기대값 갱신
- [x] 웹 기준 Playwright 점검, 자동 검증, 커밋 및 푸시

### 분리 기준

- Dashboard는 첫 판단에 필요한 요약과 다음 이동만 보여준다.
- Coach는 사용자가 다음 프롬프트를 더 잘 쓰도록 돕는 화면이다.
- Scores는 누적 프롬프트 점수, 점수 분포, 낮은 점수 목록을 검토하는 화면이다.
- Insights는 프로젝트/도구/재사용/중복/반복 패턴을 운영 분석처럼 보는 화면이다.
- 모바일은 이번 우선순위에서 제외하고, desktop web 가독성과 정보 밀도를 먼저 다듬는다.

## 2026-05-02 Dashboard Design Rebuild And Functionality Recheck

- [x] `/Users/jinan/ai/awesome-design-md` 참고 기준을 프로젝트 디자인 문서와 작업 규칙에 반영
- [x] `/Users/jinan/side-project/oh-my-ontology` 디자인 시스템을 확인하고 promptlane 기준으로 이식
- [x] warm teal/dashboard command center 스타일을 oh-my-ontology 단일 인디고 다크 시스템으로 재구축
- [x] 낮은 점수 review queue가 실제 개선 대상만 보여주는지 실패 테스트 작성
- [x] Prompt Habit Coach dashboard를 command center 형태로 재구축
- [x] 한국어/영어 UI 문구와 responsive layout 보강
- [x] 자동 테스트, 전체 게이트, pack dry-run 재실행
- [x] DevTools MCP로 desktop/mobile 렌더링, 콘솔/네트워크, 핵심 클릭 흐름 확인
- [x] 커밋, 푸시, PR 상태 확인

### 디자인 기준

- awesome-design-md는 그대로 복제하지 않고 `promptlane`의 로컬 우선 developer tool 정체성에 맞게 적용한다.
- 사용자가 명시한 기준은 `/Users/jinan/side-project/oh-my-ontology`의 Linear-base dark indigo design system이다.
- Dashboard 첫 영역은 score, biggest weakness, next fix, low-score review queue가 한눈에 들어오는 작업 화면이어야 한다.
- 낮은 점수 큐는 높은 점수 prompt를 섞어 보여주면 안 된다.
- Dashboard는 raw prompt body, raw path, secret을 표시하지 않는다.

## 2026-05-02 Prompt Habit Coach Dashboard v1

- [x] Dashboard를 단순 지표판에서 습관 코치 화면으로 재구성
- [x] 최근 점수 추세, 가장 큰 약점, 다음 개선 규칙, 낮은 점수 review queue 도출 로직 추가
- [x] 낮은 점수 프롬프트에서 바로 상세/개선 흐름으로 이동 가능한 UI 추가
- [x] English/Korean UI 문구와 responsive 스타일 보강
- [x] 자동 테스트와 browser E2E 업데이트
- [x] DevTools MCP로 실제 Dashboard 렌더링, 콘솔/네트워크, mobile overflow 점검
- [x] 전체 검증, 커밋, 브랜치 푸시, PR CI 확인

### 디자인 기준

- 대시보드 첫 영역은 "내 프롬프트 습관이 지금 어떤 상태인지"를 바로 말해줘야 한다.
- 점수만 나열하지 않고, 가장 자주 빠뜨리는 항목과 다음 요청에서 넣을 문장을 제안한다.
- 낮은 점수 prompt는 review queue로 보여주고, 클릭하면 기존 상세 화면의 PromptLane로 이어진다.
- 원문 prompt body, raw path, secret은 Dashboard에 표시하지 않는다.

## 2026-05-02 Archive Score Review / MCP Batch Scoring

- [x] 누적 프롬프트 archive score 공통 엔진과 privacy-safe report 구현
- [x] CLI `promptlane score` 추가 및 JSON/text 출력 검증
- [x] MCP `score_prompt_archive` 도구 추가 및 Claude/Codex 호출 문서화
- [x] Web API와 Dashboard에서 archive score review 제공
- [x] Claude Code slash command와 Codex plugin skill에 archive score 흐름 추가
- [x] README/기술 문서/플러그인 문서 갱신
- [x] 자동 테스트, browser E2E, release smoke, pack dry-run 검증
- [x] 커밋 및 브랜치 푸시

### 첫 구현 범위

- 원문 프롬프트 전체를 MCP 응답으로 반환하지 않는다.
- 기본 점수는 로컬 deterministic Prompt Quality Score를 사용한다.
- Claude Code/Codex는 `/promptlane:score` 또는 MCP 요청 시 report를 해석하고 개선 방향을 제안한다.
- CLI와 Web도 같은 archive score report를 사용한다.
- 외부 LLM judge나 자동 원문 재입력은 이번 단위에서 제외한다.

## 2026-05-02 Full Open Source Readiness And Agent Rules Audit

- [x] 저장소 공개 문서/라이선스/커뮤니티 파일 완비 여부 점검
- [x] npm package allowlist와 개인정보/로컬 데이터 제외 여부 점검
- [x] GitHub Issues/Discussions/PR 보호/CI 상태 점검
- [x] GitHub secret scanning, push protection, Dependabot security update 상태 점검
- [x] Claude Code/Codex용 규칙 파일과 plugin/skill 지침 점검
- [x] 누락된 agent 규칙 보강
- [x] 검증, 커밋, PR 업데이트

## 2026-05-02 Open Source Bilingual Readme Review

- [x] 오픈소스 준비 상태 재검토
- [x] README 영어/한국어 선택 링크 추가
- [x] 한국어 README 추가 및 package 포함
- [x] 배포 문서와 npm dry-run 범위 갱신
- [x] 검증, 커밋, PR 생성

## 2026-05-02 Pre-Publish Open Source Governance And I18n

- [x] npm tarball에 포함될 파일과 코드 범위 확인
- [x] 개인 PC 경로/토큰/민감정보 포함 여부 점검
- [x] `.gitignore`와 npm package allowlist 보강
- [x] LICENSE, contributing, code of conduct, support, issue/discussion templates 정리
- [x] GitHub issues/discussions 활성화와 main branch PR approval rule 적용
- [x] 웹 UI English/Korean 언어 전환 구현
- [x] 검증 게이트와 pack/install smoke 재실행
- [x] 커밋 및 origin/main 푸시

## 2026-05-02 Open Source English/NPM Readiness

- [x] npm에 포함되는 공개 문서의 한국어 잔존 범위 확인
- [x] README와 npm package에 포함되는 docs를 영어 기준으로 정리
- [x] npm publish 준비 상태와 로그인 상태 확인
- [x] 문서/패키징 검증 게이트 실행
- [x] 커밋 및 origin/main 푸시

## 2026-05-02 Full Feature Audit Plan

- [x] CLI command surface 점검: setup/init/hook/doctor/server/service/statusline/list/search/show/delete/rebuild/import/export/improve
- [x] API surface 점검: ingest, prompts, quality, projects, exports, settings, session, health
- [x] Web UI 흐름 점검: archive/detail/coach/projects/export/mobile
- [x] Storage/privacy 점검: Markdown source of truth, SQLite/FTS, delete cleanup, privacy regression
- [x] Benchmark/release smoke 재실행: 기능 동작과 usefulness regression 확인
- [x] 기능별 완료/제외/남은 리스크 정리

## 2026-05-02 Post-PRD2 Public Beta Hardening Plan

- [x] PRD2 core 완료 판정 audit: PRD_PHASE2 수용 기준과 실제 구현 차이 목록화
- [x] Browser raw-path boundary 결정: archive/detail/dashboard/projects에서 path를 그대로 보여줄지, masked display 옵션을 둘지 확정
- [x] Playwright 자동 E2E 추가: archive -> detail -> coach copy/save -> projects -> export -> mobile overflow
- [x] Benchmark v1 설계 및 구현: privacy, retrieval, coach quality, analytics, latency를 JSON report로 측정
- [x] Privacy regression fixture 확장: Markdown/SQLite/FTS/API/export/log/stdout raw secret/path 누출 검사
- [x] Release checklist 갱신: PRD2에서 추가된 import/export/project/coach 검증 항목 반영
- [x] README/문서 public beta 정리: 설치, hook, local-first, external analysis 미구현, Codex beta, uninstall/delete 경계 확인
- [x] Node 22/24와 package smoke 재검증: 현재 Node 20 warning을 실제 지원 버전에서 제거
- [x] Beta release candidate 태그 전 최종 live smoke: 새 설치 기준으로 Claude Code/Codex 수집과 웹 UI 확인

### 최적 순서

1. 기능을 더 추가하지 말고 PRD2 완료 audit부터 한다.
2. 공개 신뢰에 직결되는 privacy/display 경계를 먼저 닫는다.
3. 수동 검증을 Playwright E2E와 benchmark로 자동화한다.
4. 문서와 release checklist를 실제 구현 기준으로 맞춘다.
5. Node 22/24, package, 새 설치 smoke를 통과한 뒤 beta release candidate로 본다.

### 이번 단계에서 제외

- Claude Code/Codex에 prompt를 자동으로 바꿔 재입력하는 hook interception은 제외한다.
- External LLM/tool-assisted analysis는 Phase 2 core 이후 gated beta로만 검토한다.
- GitHub 연동은 제품 핵심 가치 검증 후 별도 단계로 둔다.

## 2026-05-02 Runtime Verification And Benchmark Plan

- [x] 현재 브랜치/작업트리 상태 확인
- [x] 기본 자동 검증 게이트 실행
- [x] 릴리즈 스모크 실행
- [x] 실제 서버 실행 후 핵심 UI 흐름 확인
- [x] 테스트 보강 필요 영역 판단
- [x] Claude Code/Codex 유저 관점 기능 가치 평가
- [x] 벤치마크 도구 설계 방향 정리

### 점검 기준

- 테스트 통과 여부와 Node engine 경고를 구분해서 본다.
- 서버는 임시 data dir에서 띄우고 실제 ingest 데이터로 확인한다.
- UI는 archive/detail/dashboard/projects/export의 핵심 흐름을 확인한다.
- 벤치마크는 속도뿐 아니라 privacy, retrieval, prompt improvement 품질을 함께 측정해야 한다.

## 2026-05-02 Anonymized Export Web UI

- [x] Export UI 범위와 raw-free 브라우저 경계 확정
- [x] 웹 API client 실패 테스트 작성
- [x] `/exports` 화면, preset 선택, preview, 실행, JSON 복사/다운로드 구현
- [x] desktop/mobile 렌더링과 raw-free 동작 검증
- [x] 전체 검증, 커밋 및 푸시

### 첫 구현 범위

- 기존 anonymized export API만 브라우저에서 사용한다.
- raw export, GitHub 연계, 외부 전송은 제외한다.
- export preview는 included/excluded field, prompt count, sensitive count, residual identifier count, small-set warning을 보여준다.
- 실행 결과는 브라우저에서 JSON preview, copy, download만 제공한다.
- export 화면과 API 응답에는 raw prompt id, raw cwd, raw path, raw secret을 표시하지 않는다.

## 2026-05-02 Anonymized Export Preview Job

- [x] 익명화 export 범위와 raw-free 저장 조건 확정
- [x] storage/API/CLI 실패 테스트 작성
- [x] `export_jobs` SQLite migration과 storage port 추가
- [x] 익명화 preview job 생성과 `job_id` 실행 구현
- [x] CLI `export --anonymized --preview|--job` 추가
- [x] release smoke 보강, 전체 검증, 커밋 및 푸시

### 첫 구현 범위

- browser/API/CLI 기본 경로는 anonymized export만 지원한다.
- export preview는 raw prompt id, raw cwd, raw path, raw secret 없이 `export_jobs`에 snapshot을 저장한다.
- export 실행은 `job_id`만 받아 preview와 같은 prompt count를 검증한다.
- raw export와 파일 저장 UI는 이번 단위에서 제외한다.
- export payload는 masked prompt, tags, quality gap summary, tool, coarse date, project alias만 포함한다.

## 2026-05-02 Import Execution And Imported-Only Filter

- [x] import 실행/resume 실패 테스트 작성
- [x] dry-run parser를 실행 import에서도 재사용 가능하게 분리
- [x] import job 실행, import_records 저장, idempotency/resume 처리 구현
- [x] CLI `import --execute`와 `import --resume <job-id>` 추가
- [x] list/search/API에 imported-only job filter 추가
- [x] targeted/full 검증, 커밋 및 푸시

### 첫 구현 범위

- 단일 JSONL 파일 import 실행만 지원한다.
- assistant/tool/command/file content는 계속 저장하지 않는다.
- import 대상 prompt는 저장 전 redaction pipeline을 다시 통과한다.
- raw source path, raw prompt, raw secret은 import job/record 출력에 저장하지 않는다.
- import 실행은 기존 Markdown/SQLite 데이터를 손상시키지 않고, 같은 record 재실행은 중복 저장하지 않는다.

## 2026-05-02 Prompt Improvement Draft Storage

- [x] 저장소/API 실패 테스트 작성
- [x] `prompt_improvement_drafts` SQLite migration과 storage port 추가
- [x] `POST /api/v1/prompts/:id/improvements` 구현
- [x] prompt detail 응답에 최신 개선 draft 포함
- [x] UI에서 개선안 저장 버튼과 저장 상태 표시
- [x] targeted/full 검증, 커밋 및 푸시

### 첫 구현 범위

- 개선 draft는 원문 prompt를 덮어쓰지 않는다.
- 저장 전 `mask` redaction을 다시 적용한다.
- 자동으로 `AGENTS.md`, `CLAUDE.md` 또는 프로젝트 파일을 수정하지 않는다.
- 저장 이벤트는 `prompt_copied` 재사용 지표와 분리한다.

## 2026-05-02 Product Identity Documentation

- [x] README 첫머리에 local-first prompt memory and improvement workspace 포지셔닝 반영
- [x] PRD/Phase 2 PRD/Technical Spec/Implementation Plan의 목적 문장을 같은 정체성으로 정렬
- [x] CLAUDE.md/AGENTS.md 프로젝트 요약에 prompt coach와 패턴 분석 가치 반영
- [x] 문서 변경 검증, 커밋 및 푸시

### 정체성 기준

- `promptlane`는 단순 프롬프트 저장소가 아니다.
- 핵심 정체성은 "Claude Code, Codex 같은 AI 코딩 도구에 입력한 프롬프트를 로컬에 안전하게 기록하고, 다시 찾고, 분석하고, 다음 요청을 더 잘 쓰도록 돕는 developer tool"이다.
- 제품 포지셔닝은 "AI coding prompt memory and improvement workspace, local-first"로 통일한다.

## 2026-05-02 PromptLane 승인형 개선 흐름

- [x] local prompt improver 실패 테스트 작성
- [x] `improvePrompt` rule 기반 개선안 생성 구현
- [x] `promptlane improve --stdin|--text --json` CLI 추가
- [x] prompt detail UI에 개선안 preview와 복사 버튼 추가
- [x] hook 자동 대체/자동 재제출은 제외하고 사용자 승인형 copy flow로 제한
- [x] CLI/UI 실제 사용성 검증
- [x] 전체 검증, 커밋 및 브랜치 푸시

### 첫 구현 범위

- 원문 prompt를 Claude Code/Codex에 자동으로 대체 제출하지 않는다.
- raw prompt는 서버 로그나 hook stdout에 노출하지 않는다.
- 개선안은 목표, 맥락, 범위, 검증, 출력 형식을 보강한 Markdown prompt로 만든다.
- 저장된 redacted prompt 기준으로 UI 개선안을 생성하고, 사용자가 복사해서 직접 재입력한다.

### 점검 결과

- `promptlane improve --text "이거 좀 고쳐줘" --json`이 승인형 copy 개선안을 생성하는 것을 확인했다.
- 상세 화면에 "승인 후 재입력할 개선안" preview와 "개선안 복사" 버튼을 추가했다.
- Playwright로 desktop/mobile 상세 화면을 확인했고, 개선안 복사 후 copy count가 증가했다.
- mobile 390px에서 document horizontal overflow는 없었다.

## 2026-05-02 Phase 2 실제 사용 흐름 검증

- [x] 임시 data dir에서 실제 빌드 CLI import dry-run/save-job 검증
- [x] import job DB row와 CLI 출력의 raw-free 여부 확인
- [x] hook ingest와 project capture-disabled 회귀 검증
- [x] 서버 실행 후 웹 archive/projects/dashboard 사용성 점검
- [x] desktop/mobile 브라우저 렌더링, 콘솔/네트워크 오류 확인
- [x] CLI help 설명 누락 수정
- [x] 검증 결과 정리, 필요한 수정 여부 판단
- [x] 결과 기록 커밋 및 푸시

### 점검 기준

- raw prompt, raw source path, raw secret은 CLI/DB/UI 출력에 나오면 안 된다.
- import dry-run은 prompt archive를 변경하지 않아야 한다.
- project capture-disabled는 실제 ingest를 막아야 한다.
- UI는 운영형 developer tool로서 archive, project policy, dashboard 경로가 찾기 쉬워야 한다.

### 점검 결과

- 실제 빌드 CLI로 `import --dry-run --save-job --json`을 실행했고 prompt 후보 2건, malformed JSONL 1건, assistant/tool skip 2건으로 집계됐다.
- 저장된 import job과 CLI 조회 결과에는 raw source path와 raw API key가 없었고, dry-run 후 prompt row는 0건이었다.
- 서버 ingest는 첫 prompt를 저장했고, project `capture_disabled` 설정 후 같은 프로젝트의 다음 ingest는 `reason=project_policy`로 차단됐다.
- archive/detail/projects/dashboard를 Playwright로 확인했다. desktop/mobile 모두 콘솔 메시지 0건, 확인 범위 네트워크 200, mobile `scrollWidth=390`으로 page horizontal overflow는 없었다.
- 사용성 문제로 최상위 CLI help에서 `import`, `import-job` 설명이 비어 있는 점을 발견해 설명과 회귀 테스트를 추가했다.

## 2026-05-02 Import Job Storage

- [x] 현재 import/storage 구조 재확인
- [x] import job storage 실패 테스트 작성
- [x] `import_jobs`, `import_records`, `import_errors` SQLite migration 추가
- [x] raw-free import job 저장/조회/list 구현
- [x] `promptlane import --dry-run --save-job` CLI 추가
- [x] `promptlane import-job <id>` 조회 CLI 추가
- [x] targeted 검증 실행
- [x] full 검증, 커밋 및 푸시

### 첫 구현 범위

- 실제 prompt import 실행은 추가하지 않는다.
- dry-run 결과만 job으로 저장하고, 저장 payload는 source hash와 redacted summary만 포함한다.
- raw source path, raw prompt, raw secret은 import job row와 CLI 조회 결과에 저장/출력하지 않는다.
- `import_records`, `import_errors`는 다음 실행 import 단계에서 idempotency/resume/error aggregation에 쓰기 위한 스키마만 먼저 둔다.

## 2026-05-02 Phase 2 PRD 정리 및 Project Control Plane

- [x] Phase 2 PRD의 MVP/현재 기준선 충돌 정리
- [x] import dry-run 저장 범위와 export preview/job 일관성 보정
- [x] project identity, raw path 노출, policy lookup 실패 정책 명시
- [x] external analysis를 core 범위에서 분리
- [x] 문서 변경 검증
- [x] 문서 커밋 및 푸시
- [x] Project Control Plane 최소 구현 실패 테스트 작성
- [x] project policy storage/API/ingest capture-disabled 구현
- [x] UI project list와 capture-disabled toggle 구현
- [x] 서버/UI 브라우저 검증
- [x] 전체 검증, 커밋 및 푸시

### 첫 구현 범위

- `project_policies`, `policy_audit_events`를 추가한다.
- `GET /api/v1/projects`, `PATCH /api/v1/projects/:id/policy`를 추가한다.
- 첫 policy 적용은 ingest의 `capture_disabled`만 포함한다.
- UI는 project list와 capture-disabled toggle만 제공한다.
- import/export/external analysis 후보 산정, retention 실행, external network path는 제외한다.

### 구현 범위 재검토

- Project Control Plane은 의미 있는 선행 작업이다. import, export, 외부/도구 보조 분석이 모두 프로젝트별 opt-in/out과 audit를 필요로 하므로 공통 안전장치로 재사용된다.
- 이번 구현에서 의미가 약한 부분은 없다. 다만 현재 UI는 `capture_disabled`만 다루는 최소판이므로 `analysis_disabled`, retention, export 정책은 다음 기능이 실제로 붙을 때 노출하는 것이 맞다.
- Claude Code/Codex CLI를 분석 실행기로 쓰는 것은 기술적으로 가능하지만 local-only 내부 분석이 아니다. 별도 API key 저장을 피할 수 있을 뿐, payload가 사용자의 Claude Code/Codex 계정과 upstream provider로 나갈 수 있으므로 gated beta의 `tool-assisted-analysis`로 분리한다.
- tool-assisted-analysis는 Phase 2 core가 아니다. preview, explicit opt-in, project policy, redaction, timeout, no auto-write, audit가 갖춰진 뒤에만 다룬다.

## 2026-05-02 Transcript Import Dry Run

- [x] import dry-run 범위 확정
- [x] source별 allowlist parser 실패 테스트 작성
- [x] `promptlane import --dry-run --file <path>` CLI 추가
- [x] raw-free dry-run summary 출력 구현
- [x] assistant/tool/command/file content 제외 회귀 테스트
- [x] malformed JSONL이 전체 dry-run을 깨지 않는지 검증
- [x] dry-run이 Markdown, prompt index, FTS를 변경하지 않는지 검증
- [x] targeted/full 검증, 커밋 및 푸시

### 첫 구현 범위

- 단일 파일 dry-run만 지원한다.
- Claude Code/Codex transcript best-effort parser는 사용자 prompt 후보만 카운트한다.
- 실행 import, resume, imported-only filter, UI import 화면은 제외한다.
- dry-run 결과는 stdout JSON/텍스트 summary로만 반환하고 prompt 저장소는 변경하지 않는다.

## 2026-05-02 README Marketplace Install Flow

- [x] Claude Code/Codex 외부 사용자 설치 순서 정리
- [x] README Quick Start와 Plugin Packaging 섹션 갱신
- [x] 문서 패키징 검증
- [x] 커밋 및 푸시

### 점검 결과

- README 상단에 Quick Start를 추가해 `promptlane` CLI 설치와 Claude Code/Codex marketplace 추가를 분리했다.
- marketplace plugin은 CLI binary를 설치하지 않으므로, 권장 순서를 CLI 설치 후 marketplace 추가로 명시했다.
- Claude Code는 `/plugin marketplace add wlsdks/promptlane`, `/plugin install promptlane`, `/reload-plugins`, `/promptlane:setup` 순서로 정리했다.
- Codex는 `codex plugin marketplace add wlsdks/promptlane` 후 `promptlane setup`으로 hook을 설치하고 Codex hooks를 활성화한다고 정리했다.
- 검증 명령: `git diff --check`, `pnpm pack:dry-run` 통과. Node 20.20.0에서 실행되어 `engines.node >=22 <25` 경고는 계속 발생한다.

## 2026-05-02 Claude HUD-style Plugin

- [x] Claude Code plugin 구조 설계: marketplace, manifest, slash commands, statusLine
- [x] 실패 테스트 작성: Claude plugin 파일, command 문서, statusLine 출력
- [x] `.claude-plugin` marketplace/manifest와 `/promptlane:*` commands 추가
- [x] `promptlane statusline claude-code` CLI 추가
- [x] README/docs/package 포함 파일 갱신
- [x] 검증 명령 실행
- [x] 커밋 및 푸시

### 점검 결과

- Claude Code repo-local marketplace 파일을 `.claude-plugin/marketplace.json`에 추가했다. 사용 흐름은 `/plugin marketplace add wlsdks/promptlane`, `/plugin install promptlane`, `/reload-plugins`다.
- Claude Code plugin manifest `.claude-plugin/plugin.json`에 `/promptlane:setup`, `/promptlane:status`, `/promptlane:open` command 문서를 연결했다.
- `/promptlane:setup`은 CLI 존재 여부를 먼저 확인하고, `promptlane setup --dry-run`을 보여준 뒤 승인 시 실제 setup을 실행하도록 작성했다. statusLine은 기존 Claude `statusLine`을 대체할 수 있어서 별도 승인 후 `install-statusline`을 실행하게 했다.
- `promptlane statusline claude-code`, `install-statusline claude-code`, `uninstall-statusline claude-code`를 추가했다. statusLine은 capture on/paused/setup needed, server 상태, last ingest 상태를 한 줄로 출력한다.
- 검증 명령: `pnpm format`, `pnpm test`, `pnpm lint`, `pnpm build`, `pnpm pack:dry-run`, `pnpm smoke:release`, `git diff --check` 통과. `pnpm promptlane install-statusline claude-code --dry-run`과 `pnpm promptlane statusline claude-code`도 실제 빌드된 CLI로 실행했다.
- 현재 로컬에서는 서버가 내려가 있어 statusLine 출력은 `PM capture paused | server down | last ingest failed`였다. Node 20.20.0에서 실행되어 `engines.node >=22 <25` 경고는 계속 발생한다.

## 2026-05-02 Claude/Codex Plugin Packaging

- [x] 공식 확장 방식과 로컬 plugin manifest 스펙 확인
- [x] Codex repo-local plugin manifest/hook 패키지 추가
- [x] Claude Code 호환 방식과 plugin 한계 문서화
- [x] npm package 포함 파일과 검증 보강
- [x] 검증 명령 실행
- [x] 커밋 및 푸시

### 점검 결과

- Codex용 repo-local plugin 패키지를 `plugins/promptlane`에 추가했다. 구성은 `.codex-plugin/plugin.json`, `hooks.json`, `skills/promptlane/SKILL.md`다.
- Codex plugin hook은 `UserPromptSubmit`에서 `promptlane hook codex`를 실행하며, CLI가 `PATH`에 없거나 실패하면 `|| true`로 fail-open한다. hook command에는 ingest token을 넣지 않았다.
- Claude Code는 공식 확장 지점이 settings hook이라 `integrations/claude-code/settings.example.json`과 설명 문서를 추가했다. 일반 사용자는 `promptlane setup` 또는 `install-hook claude-code`가 더 안전하다.
- README와 `docs/PLUGINS.md`에 plugin 패키징과 명시적 setup이 여전히 필요한 이유를 문서화했다.
- `package.json` `files`에 `docs/PLUGINS.md`, `plugins`, `integrations`를 추가했고, `pnpm pack:dry-run`에서 tarball 포함을 확인했다.
- 검증 명령: `pnpm format`, `pnpm test`, `pnpm lint`, `pnpm build`, `pnpm pack:dry-run`, `pnpm smoke:release`, `git diff --check` 통과. Node 20.20.0에서 실행되어 `engines.node >=22 <25` 경고는 계속 발생한다.

## 2026-05-02 One-command Setup UX

- [x] `setup`/service 설계 범위 확정
- [x] 실패 테스트 작성: setup dry-run, hook install, macOS service plist
- [x] `promptlane setup` 구현
- [x] `promptlane service install/start/status/stop` 구현
- [x] README에 명시적 setup 필요 이유와 간단 사용법 추가
- [x] 검증 명령 실행
- [x] 커밋 및 푸시

### 점검 결과

- `promptlane setup`은 data dir 초기화, Claude Code/Codex hook 자동 감지 설치, macOS LaunchAgent 서버 등록을 한 번에 수행한다.
- package install만으로 사용자 설정 파일이나 로그인 서비스를 바꾸지 않는 이유를 README에 명시했다. `setup`은 사용자가 로컬 설정 변경을 승인하는 명시적 단계다.
- `promptlane setup --dry-run`으로 어떤 설정이 바뀔지 먼저 확인할 수 있고, `--no-service`로 hook만 설치한 뒤 서버는 수동 실행할 수 있다.
- `promptlane service install/status/start/stop`을 추가했다. 현재 자동 서비스 등록은 macOS LaunchAgent만 지원하고, 다른 OS에서는 unsupported 결과를 돌려준다.
- 검증 명령: `pnpm format`, `pnpm test`, `pnpm lint`, `pnpm build`, `pnpm pack:dry-run`, `pnpm smoke:release`, `git diff --check` 통과. Node 20.20.0에서 실행되어 `engines.node >=22 <25` 경고는 계속 발생한다.

## 2026-05-02 Hook 재점검 및 동작 설명

- [x] 현재 서버/doctor 상태 재확인
- [x] 설치된 Claude Code/Codex hook command 재확인
- [x] 설치된 command 그대로 stdin payload 저장 재검증
- [x] hook 동작 방식과 사용자 등록 필요 여부 정리
- [x] 결과 기록, 커밋 및 푸시

### 점검 결과

- hook 등록은 유지되어 있었다. Claude Code는 `~/.claude/settings.json`, Codex는 `~/.codex/hooks.json`에 `UserPromptSubmit` hook command가 있고, Codex는 `~/.codex/config.toml`의 `codex_hooks = true`도 켜져 있다.
- 처음 재점검에서 서버가 내려가 있어 `doctor`의 `server.ok=false`였다. hook은 fail-open이라 도구 사용은 막지 않지만, 서버가 내려가 있으면 저장되지 않는다.
- 서버를 foreground로 실행한 상태에서 설치된 hook command 문자열을 그대로 읽어 stdin payload를 넣었고, Claude Code/Codex 모두 새 prompt가 저장됐다.
- 저장 확인: 최신 2건이 각각 `claude-code-v1`, `codex-v1` adapter로 `indexed` 상태였고, `password/access_token`과 API key 계열 값은 마스킹됐다.
- 결론: hook 등록은 한 번 설치하면 유지된다. 다만 저장을 하려면 `promptlane server`가 떠 있어야 한다. 현재 MVP에는 OS 로그인 시 서버 자동 시작 등록 기능은 없다.

## 2026-05-02 Claude Code/Codex 실제 Hook 연동 점검

- [x] 실제 `claude`/`codex` CLI 존재 여부 확인
- [x] 현재 doctor 상태 확인
- [x] hook 설치 명령의 변경 범위 확인
- [x] 기본 data dir 초기화 및 로컬 서버 실행
- [x] Claude Code/Codex hook 설치 후 doctor 재확인
- [x] 실제 hook wrapper stdin payload 전송으로 저장 검증
- [x] CLI/UI에서 저장 결과 확인
- [x] 검증 결과 기록, 커밋 및 푸시

### 점검 결과

- 실제 CLI 존재: `claude --version`은 `2.1.126 (Claude Code)`, `codex --version`은 `codex-cli 0.128.0`.
- 최초 상태: 기본 data dir 기준 `doctor claude-code`, `doctor codex` 모두 server/token/hook 미설정이었다.
- 실제 설치: `promptlane init`으로 기본 promptlane data dir을 초기화했고, `install-hook claude-code`, `install-hook codex`를 실행했다. Claude 설정은 `~/.claude/settings.json`, Codex 설정은 `~/.codex/hooks.json`, `~/.codex/config.toml`에 설치됐다.
- 발견/수정: 설치된 hook command가 `promptlane hook ...` 전역 명령을 가정해 실제 셸에서 `command not found`가 났다. installer를 수정해 `PROMPTLANE_HOOK="..." "<node>" "<repo>/dist/cli/index.js" hook ...` 형태의 절대 실행 명령을 기록하고 기존 hook도 갱신하게 했다.
- 실제 저장 검증: 설치된 설정 파일의 command 문자열을 그대로 읽어 `sh -c`로 실행했고, Claude Code payload와 Codex payload가 각각 `claude-code-v1`, `codex-v1`로 저장됐다.
- 보안 확인: 실제 저장된 두 prompt 모두 `password/access_token` 계열은 `[REDACTED:secret_assignment]`, API key 계열은 `[REDACTED:api_key]`로 마스킹됐다.
- doctor 결과: Claude Code와 Codex 모두 server/token/settings ok. Codex는 `codexHooksEnabled=true`, `duplicateHooks=false`, `hookSources=["user"]`. 마지막 ingest status는 `ok=true`, `status=200`.
- UI 확인: `http://127.0.0.1:17373` 목록에서 Claude Code/Codex 두 건이 최신 행으로 표시되고 원문 비밀값은 노출되지 않았다.
- 검증 명령: `pnpm test`, `pnpm lint`, `pnpm build`, `pnpm pack:dry-run`, `pnpm smoke:release`, `git diff --check` 통과. Node 20.20.0에서 실행되어 engine 경고는 계속 발생한다.

## 2026-05-02 전체 기능 점검 및 사용성 평가

- [x] 최신 Web Interface Guidelines와 `DESIGN.md` 기준 확인
- [x] 기능/API/스토리지/CLI 테스트 게이트 실행
- [x] 임시 data dir로 서버 실행 및 샘플 데이터 ingest
- [x] Chrome DevTools MCP로 dashboard/list/detail/settings 주요 흐름 재점검
- [x] desktop/mobile 렌더링, 접근성 이름, overflow, 콘솔/네트워크 상태 확인
- [x] 사용성 평가와 개선 후보 정리
- [x] 결과 기록, 커밋 및 푸시

### 점검 결과

- 자동 검증: `pnpm test`, `pnpm lint`, `pnpm build`, `pnpm pack:dry-run`, `pnpm smoke:release`, `git diff --check` 통과.
- 기능 흐름: init/server/ingest/list/search/show/delete/rebuild-index CLI smoke 통과. 웹 UI에서 list 검색, 품질 gap 필터 이동, detail 분석 preview, copy event, bookmark, delete modal/confirm, dashboard, settings를 확인했다.
- 발견/수정: `password=super-secret-value` 같은 명시적 secret assignment가 마스킹되지 않고 목록에 노출되는 문제를 발견했다. `secret_assignment` detector와 회귀 테스트를 추가했고, 새 빌드 서버에서 `[REDACTED:secret_assignment]`로 표시되는 것을 확인했다.
- 브라우저 검증: desktop 1440x900, mobile 390x844 screenshot을 저장했고, mobile에서 document 단위 horizontal overflow는 없었다. 긴 경로는 truncation 내부 overflow만 있었고 페이지 폭은 깨지지 않았다.
- 콘솔/네트워크: Chrome DevTools MCP 기준 콘솔 메시지 없음. 확인 범위 네트워크 요청은 API/asset `200`, favicon `204`.
- 사용성 평가: 현재 구조는 첫 화면 archive 중심, dashboard drill-down, detail action이 이어져 운영형 developer tool로 적합하다. 다만 browser navigation은 `<button>` + `history.pushState` 기반이라 Cmd/Ctrl-click deep link 같은 링크 네이티브 동작은 아직 없다.
- 남은 리스크: 현재 로컬 셸은 Node 20.20.0이라 모든 pnpm 명령에서 `engines.node >=22 <25` 경고가 난다. Node 22 환경에서는 `better-sqlite3` 네이티브 모듈을 Node 22 ABI로 재빌드해야 한다.

## 2026-05-02 Chrome DevTools MCP 기능 점검

- [x] 실행 중인 서버/포트 확인
- [x] Chrome DevTools MCP로 앱 접속
- [x] Dashboard/List/Detail/Settings 주요 화면 점검
- [x] 검색/필터/복사/삭제 등 핵심 상호작용 점검
- [x] desktop/mobile 렌더링, 콘솔/네트워크 오류 확인
- [x] 점검 결과 정리

### 점검 결과

- `localhost:3100`은 `excalidraw-mcp-server`였고, `promptlane`는 임시 data dir `/tmp/promptlane-devtools.5BogJo`로 `http://127.0.0.1:17373`에서 별도 실행했다.
- 샘플 prompt 3건을 ingest했고, 1건은 삭제 흐름 확인 후 정상 삭제되어 최종 UI에는 2건이 남았다.
- 목록, 검색, 태그 필터, 민감정보 필터, 상세 분석 preview, prompt 복사 이벤트, bookmark, 삭제 modal/confirm, dashboard, settings를 Chrome DevTools MCP로 확인했다.
- desktop 1440x900, mobile 390x844에서 screenshot과 accessibility snapshot을 확인했고, mobile horizontal overflow는 없었다.
- 콘솔 메시지는 없었고, 네트워크 요청은 확인 범위에서 모두 `200` 또는 favicon `204`였다.
- Node 22 실행은 기존 `better-sqlite3` 네이티브 모듈이 Node 20 ABI로 빌드되어 실패했다. 이번 브라우저 점검은 현재 설치 상태에 맞춰 Node 20으로 진행했다.

## P6 Web UI

- [x] P6 Web UI 계획 세분화
- [x] UI 구현 전 `DESIGN.md` 재검토
- [x] Vite React 앱 골격 추가
- [x] Prompt list/detail/settings 화면 구현
- [x] local session cookie + CSRF 흐름 추가
- [x] Fastify에서 built web asset 서빙
- [x] Dangerous Markdown/link/image sanitization 확인
- [x] 서버 실행 후 Playwright MCP로 실제 브라우저 점검
- [x] 검증 명령 실행
- [x] 커밋 및 푸시

## Review

- 공식 Claude Code memory/hooks 문서, 공식 OpenAI Codex AGENTS.md 문서, 공개 InfoQ 요약, 로컬 MIT `awesome-design-md` 자료를 확인했다.
- 루트 지침은 짧고 운영 중심으로 두고, UI 상세 규칙은 `DESIGN.md`로 분리했다.
- Playwright MCP로 `/api/v1/health`를 확인했고, favicon 404 콘솔 에러를 발견해 서버에서 204를 반환하도록 보강했다.
- 보강 후 Playwright MCP snapshot과 screenshot에서 헬스 응답이 정상 표시되는 것을 재확인했다.

### P6 계획

- UI는 첫 화면을 prompt list로 두고, 랜딩 페이지를 만들지 않는다.
- 브라우저 앱은 `/api/v1/session`에서 same-origin 세션 쿠키와 CSRF 토큰을 받은 뒤 API를 호출한다.
- CLI/자동화는 기존 bearer app token을 계속 사용할 수 있어야 한다.
- DELETE는 bearer token 또는 session cookie + `x-csrf-token` 중 하나를 요구한다.
- 정적 파일은 Vite build 결과물만 Fastify가 서빙하고, CSP를 기본 응답에 적용한다.
- Playwright MCP 점검에서 desktop 목록/상세/설정, delete modal/confirm, mobile list를 확인했다.
- 상세 화면에서 frontmatter가 보이는 문제와 mobile table header/side shell 레이아웃 문제를 발견해 수정했다.

## P6 Web UI 보강

- [x] prompt list/search 필터 API 테스트 작성
- [x] browser-safe settings API 테스트 작성
- [x] SQLite/API 필터 구현
- [x] Settings API 구현
- [x] 웹 UI 필터 컨트롤, date range, debounce, settings API 연결
- [x] 서버 실행 후 Playwright MCP로 필터/settings 재점검
- [x] 검증 명령 실행
- [x] 커밋 및 푸시

### P6 보강 검토

- Playwright MCP로 desktop 필터 조합, date range 빈 결과/복귀, settings 화면을 확인했다.
- Playwright MCP로 mobile 폭에서 필터 컨트롤이 세로로 안정적으로 쌓이고 목록이 깨지지 않는지 확인했다.
- `pnpm test`, `pnpm lint`, `pnpm build`, `pnpm pack:dry-run`, `git diff --check`를 통과했다.

## P7 Codex Beta - Adapter/Ingest

- [x] 공식 Codex hooks 문서와 현재 PRD/TECH_SPEC 범위 재확인
- [x] Codex adapter 정규화 테스트 작성
- [x] `/api/v1/ingest/codex` 계약 테스트 작성
- [x] Codex adapter 구현
- [x] Codex ingest route 연결
- [x] targeted/full 검증 실행
- [x] 커밋 및 푸시

### P7 Adapter/Ingest 범위

- 이번 단위는 Codex `UserPromptSubmit` payload 정규화와 서버 ingest route까지만 포함한다.
- `install-hook codex`, `uninstall-hook codex`, Codex doctor는 config merge/feature flag 진단을 포함하므로 다음 커밋에서 별도 처리한다.
- 공식 Codex hooks 문서 기준 `UserPromptSubmit`은 공통 stdin JSON 필드와 `turn_id`, `prompt`를 받으며, matcher는 현재 무시된다.
- `pnpm test`, `pnpm lint`, `pnpm build`, `pnpm pack:dry-run`, `git diff --check`를 통과했다.

## P7 Codex Beta - Hook Install/Doctor

- [x] Codex hooks.json/config.toml 설치 테스트 작성
- [x] Codex hook wrapper route 테스트 작성
- [x] Codex doctor feature flag/hook/중복 탐지 테스트 작성
- [x] `install-hook codex` / `uninstall-hook codex` 구현
- [x] `promptlane hook codex` 구현
- [x] `doctor codex` 구현
- [x] targeted/full 검증 실행
- [x] 커밋 및 푸시

### P7 Hook Install/Doctor 범위

- Codex 설치는 공식 hooks 문서 기준 user-level `~/.codex/hooks.json`과 `~/.codex/config.toml`을 기본 대상으로 한다.
- `config.toml`에는 `[features].codex_hooks = true`를 구조적으로 보강하고, uninstall 시에는 feature flag를 제거하지 않는다.
- doctor는 user/project hook source 중복 설치를 경고 상태로 본다.
- `pnpm test`, `pnpm lint`, `pnpm build`, `pnpm pack:dry-run`, `git diff --check`를 통과했다.

## P8 Release Docs

- [x] README 설치/초기화/서버/CLI 사용법 작성
- [x] Claude Code와 Codex beta hook 연결/해제 문서화
- [x] 저장 위치, 삭제, 로컬 우선, 외부 전송 없음 문서화
- [x] OpenAI/Anthropic 비제휴 고지 작성
- [x] 보안 정책 문서 작성
- [x] 어댑터 기여 가이드 작성
- [x] 릴리스 체크리스트 작성
- [x] GitHub issue template 추가
- [x] npm package files 목록에 공개 문서 포함
- [x] 검증 명령 실행
- [x] 커밋 및 푸시

### P8 Release Docs 검토

- `pnpm format`, `pnpm test`, `pnpm lint`, `pnpm build`, `pnpm pack:dry-run`, `git diff --check`를 통과했다.
- `pnpm pack:dry-run`에서 `README.md`, `SECURITY.md`, `docs/ADAPTERS.md`, `docs/RELEASE_CHECKLIST.md` 포함을 확인했다.

## P8 Security Regression

- [x] upstream OAuth/session token 미보존 테스트
- [x] hook fail-open raw prompt 비노출 테스트
- [x] `Sec-Fetch-Site: cross-site` 차단 테스트
- [x] raw secret Markdown/SQLite/redaction_events/FTS 미저장 테스트
- [x] delete 후 prompt/FTS/redaction_events 제거 테스트
- [x] 전체 검증 명령 실행
- [x] 커밋 및 푸시

### P8 Security Regression 검토

- 보안 회귀 범위는 새 기능 추가가 아니라 P0-P8에서 이미 설계한 로컬 우선/비밀정보 최소 저장/브라우저 경계 정책을 고정하는 테스트로 한정한다.
- `pnpm test`, `pnpm lint`, `pnpm build`, `pnpm pack:dry-run`, `git diff --check`를 통과했다.

## P9 Rule-Based Analysis Preview

- [x] 현재 storage/API/UI 계약 파악
- [x] 로컬 규칙 기반 analyzer 테스트 작성
- [x] 저장/조회 시 analysis preview 저장 및 반환 테스트 작성
- [x] raw secret이 analysis 결과에 남지 않는 회귀 테스트 작성
- [x] analyzer 구현
- [x] SQLite `prompt_analyses` 연결
- [x] prompt detail API/UI에 analysis preview 표시
- [x] Playwright로 실제 상세 화면 확인
- [x] 전체 검증 명령 실행
- [x] 커밋 및 푸시

### P9 범위

- PRD의 MVP 분석 범위인 단일 프롬프트 요약/주의점 preview만 구현한다.
- 점수, 트렌드, 자동 태그, instruction 파일 후보 제안, 외부 LLM 분석은 Phase 2 이후 범위로 유지한다.
- 분석 입력은 저장 정책이 적용된 본문만 사용해서 `redactionMode=mask`에서 raw secret이 분석 결과에 남지 않도록 한다.
- Playwright CLI로 로컬 서버 상세 화면에서 `분석 preview`와 `local-rules-v1` 요약 표시를 확인했다.
- `pnpm format`, `pnpm test`, `pnpm lint`, `pnpm build`, `pnpm pack:dry-run`, `git diff --check`를 통과했다.

## P10 Release Smoke Harness

- [x] CI 제외 범위로 릴리스 전 로컬 검증 항목 재정의
- [x] 기존 CLI/server 계약 확인
- [x] 임시 data dir/HOME 기반 release smoke 스크립트 추가
- [x] `init/server/ingest/list/search/show/delete/rebuild-index` 흐름 검증
- [x] Claude/Codex fixture-like ingest 검증
- [x] Markdown/SQLite/FTS/delete 정리 검증
- [x] README와 release checklist에 smoke 사용법 반영
- [x] smoke 및 전체 검증 명령 실행
- [x] 커밋 및 푸시

### P10 범위

- CI matrix는 이번 작업에서 제외한다.
- 스모크는 배포 산출물인 `dist/cli/index.js`를 직접 실행해서 사용자가 받을 CLI 흐름을 검증한다.
- 실제 사용자 `~/.claude`, `~/.codex`, `~/.promptlane`를 건드리지 않도록 임시 HOME과 임시 data dir만 사용한다.
- 샌드박스에서는 로컬 포트 listen이 `EPERM`으로 막혀 `pnpm smoke:release`를 권한 상승으로 실행했고 통과했다.
- `pnpm format`, `pnpm test`, `pnpm lint`, `pnpm build`, `pnpm pack:dry-run`, `pnpm smoke:release`, `git diff --check`를 통과했다.

## P11 Prompt Quality Dashboard / Advanced Analysis

- [x] 현재 `local-rules-v1` 분석 결과와 SQLite/API/UI 계약 재확인
- [x] 분석 상세 스키마 설계
  - [x] `goal_clarity`, `background_context`, `scope_limits`, `output_format`, `verification_criteria` 항목 정의
  - [x] 각 항목 상태를 `good` / `weak` / `missing`으로 제한
  - [x] 항목별 reason과 rule-based suggestion 문구 정의
  - [x] raw prompt나 redacted placeholder가 분석 결과에 그대로 남지 않는 보안 기준 고정
- [x] 자동 태그 규칙 설계
  - [x] `bugfix`, `refactor`, `docs`, `test`, `ui`, `backend`, `security`, `db`, `release`, `ops` 1차 태그 세트 정의
  - [x] 태그는 검색/필터용 메타데이터로 저장하고, Markdown 원문은 사람이 읽는 archive로 유지
  - [x] 오탐 가능성이 큰 태그는 보수적으로 붙이고 UI에서 근거를 함께 노출
- [x] 실패 테스트 먼저 작성
  - [x] analyzer 체크리스트 상태/제안/태그 단위 테스트
  - [x] 민감정보가 analysis/tag/suggestion/API 응답에 노출되지 않는 회귀 테스트
  - [x] SQLite 저장, 삭제, rebuild-index 시 analysis/tag 정합성 테스트
  - [x] dashboard/pattern API 계약 테스트
- [x] 분석 저장 구조 확장
  - [x] `prompt_analyses`에 checklist/tags JSON을 추가하거나 새 테이블로 분리할지 결정
  - [x] 기존 DB와 호환되는 migration 적용
  - [x] `rebuild-index`가 Markdown archive를 기준으로 분석과 태그를 재생성하도록 연결
  - [x] 삭제 시 Markdown, DB row, FTS, redaction_events, prompt_analyses, prompt_tags 정리 유지
- [x] Prompt Quality Dashboard API 추가
  - [x] 전체 프롬프트 수
  - [x] 민감정보 포함 비율
  - [x] 도구별 분포
  - [x] 프로젝트/cwd별 분포
  - [x] 최근 7일/30일 입력량
  - [x] 부족 항목 상위 목록: 검증 기준 없음, 출력 형식 없음, 맥락 부족 등
- [x] 반복 패턴 분석 API 추가
  - [x] 프로젝트/cwd별 자주 빠지는 체크리스트 항목 집계
  - [x] "테스트 명령을 자주 빼먹음", "파일 범위를 명시하지 않음" 같은 copyable 문장 생성
  - [x] 최소 표본 수를 두어 데이터가 적을 때 과도한 결론을 내지 않도록 처리
- [x] AGENTS.md / CLAUDE.md 후보 제안 API 추가
  - [x] 반복 패턴을 instruction 후보로 변환
  - [x] 자동 파일 수정은 하지 않고 UI에서 copyable suggestion만 제공
  - [x] 프로젝트별 후보와 전체 후보를 구분
- [x] 기존 prompts API 확장
  - [x] prompt detail에 checklist, suggestions, tags 반환
  - [x] prompt list에 tags와 주요 부족 항목 summary 반환
  - [x] tag 필터 쿼리 추가
  - [x] FTS `tags` 컬럼과 `prompt_tags` 정합성 유지
- [x] 웹 UI 구현 전 `DESIGN.md` 재검토
- [x] 웹 UI 정보 구조 변경
  - [x] 좌측 nav에 Dashboard 추가
  - [x] Dashboard에 수치, 분포, 최근 입력량, 부족 항목, 반복 패턴을 조용한 운영형 레이아웃으로 배치
  - [x] Prompt Detail의 분석 preview를 항목별 체크리스트로 확장
  - [x] 개선 프롬프트 제안과 instruction 후보를 copyable block으로 표시
  - [x] Prompt List에 태그 badge와 tag 필터 추가
  - [x] 빈 데이터/표본 부족/분석 없음 상태 처리
- [x] Playwright MCP 실제 브라우저 점검
  - [x] desktop 1440x900 dashboard/list/detail/settings screenshot
  - [x] mobile 390x844 dashboard/list/detail screenshot
  - [x] accessibility snapshot에서 주요 버튼, 필터, copy action 이름 확인
  - [x] 콘솔/네트워크 오류, 텍스트 overflow, 중첩 카드 여부 확인
- [x] 기본 검증 명령 실행
  - [x] `pnpm test`
  - [x] `pnpm lint`
  - [x] `pnpm build`
  - [x] `pnpm pack:dry-run`
  - [x] `git diff --check`
- [x] 커밋 및 `git push origin main`

### P11 설계 메모

- 이번 범위는 외부 LLM 없이 deterministic local rules만 사용한다.
- 분석 항목은 저장된 redacted prompt만 입력으로 사용한다.
- dashboard 집계는 원문을 반환하지 않고 count/rate/top bucket만 반환한다.
- 프로젝트 분포는 우선 `project_root`가 있으면 사용하고, 없으면 `cwd` prefix/name 기반으로 표시한다.
- 태그와 체크리스트는 이후 규칙 개선을 위해 analyzer version을 함께 저장한다.
- `AGENTS.md` / `CLAUDE.md` 후보는 자동 반영하지 않는다. 사용자가 직접 복사할 수 있는 제안으로 시작한다.
- UI는 기존 developer tool 톤을 유지하고, landing/hero/장식형 그래픽은 만들지 않는다.

## P12 Design System Refresh / Regression QA

- [x] P11 이후 전체 회귀 검증
  - [x] `pnpm test`
  - [x] `pnpm lint`
  - [x] `pnpm build`
  - [x] `pnpm pack:dry-run`
  - [x] `git diff --check`
- [x] 로컬 디자인 가이드 구조와 관련 예시 확인
- [x] `promptlane` 전용 `DESIGN.md` 재작성
  - [x] Visual Theme & Atmosphere
  - [x] Color Palette & Roles
  - [x] Typography Rules
  - [x] Component Stylings
  - [x] Layout Principles
  - [x] Depth & Elevation
  - [x] Do's and Don'ts
  - [x] Responsive Behavior
  - [x] Agent Prompt Guide
- [x] UI 토큰과 레이아웃 리프레시
  - [x] sidebar/topbar 상태와 정보 위계 정리
  - [x] list/dashboard/detail/settings 화면의 panel/table 밀도 개선
  - [x] quality checklist/tag/copy 영역 overflow 방지
  - [x] empty/loading 상태가 새 디자인 톤과 맞는지 확인
- [x] Playwright MCP 실제 브라우저 재점검
  - [x] desktop 1440x900 list/dashboard/detail/settings screenshot
  - [x] mobile 390x844 list/dashboard/detail screenshot
  - [x] accessibility snapshot에서 nav/filter/copy/delete 이름 확인
  - [x] 콘솔/네트워크 오류, 텍스트 overflow, 직접 URL 진입 확인
- [x] 커밋 및 `git push origin main`

### P12 설계 메모

- `awesome-design-md`의 목적은 특정 사이트 복제가 아니라 AI가 반복해서 따를 수 있는 명확한 디자인 문서다.
- `promptlane`는 마케팅 사이트가 아니라 로컬 운영형 developer tool이므로 첫 화면은 계속 실제 archive/list로 둔다.
- 시각 방향은 Linear의 정밀한 정보 밀도와 Cursor의 따뜻한 로컬 도구 톤을 참고하되, 자체 색상/컴포넌트 언어로 유지한다.

## P13 Feature Discovery / Usability Review

- [x] PRD/TECH_SPEC 대비 완료 범위 재점검
- [x] 현재 UI를 Web Interface Guidelines 기준으로 1차 점검
- [x] 기능 후보 우선순위 정리
  - [x] PRD Phase 2 잔여 기능: transcript import, 프로젝트 설정 UI, 중복 감지, git/PR 연결, import/reconciliation 이벤트
  - [x] PRD 이후 제품 기능: prompt reuse/copy, usefulness feedback, saved prompts, anonymized export, onboarding checklist
  - [x] 비용/위험/효용 기준으로 다음 구현 단위 선정
- [x] 사용성 개선 구현
  - [x] detail에서 prompt body copy action 추가
  - [x] list pagination의 `next_cursor`를 UI에서 사용할 수 있게 연결
  - [x] 검색/필터 상태를 URL query와 동기화해 공유/새로고침 시 유지
  - [x] loading 문구와 empty state 문구를 DESIGN.md 톤에 맞게 정리
- [x] 유용성 측정 설계
  - [x] 사용자가 prompt를 재사용했는지 추적할 로컬 이벤트 정의
  - [x] copied/reused/bookmarked 같은 저위험 신호부터 시작
  - [x] 외부 전송 없이 dashboard에서 useful prompt 후보를 볼 수 있게 설계
- [x] Playwright MCP 사용성 점검
  - [x] 검색/필터/URL 새로고침
  - [x] load more
  - [x] detail copy action
  - [x] desktop/mobile overflow와 console/network 오류
- [x] 기본 검증 명령 실행
  - [x] `pnpm test`
  - [x] `pnpm lint`
  - [x] `pnpm build`
  - [x] `pnpm pack:dry-run`
  - [x] `git diff --check`
- [x] 커밋 및 `git push origin main`

### P13 발견 사항

- MVP core는 자동 수집, 저장, 검색, 상세, 삭제, hook/doctor/rebuild, 보안 회귀 기준까지 대부분 완료된 상태다.
- Phase 2 중 규칙 기반 분석 정식화, 자동 태그, instruction 후보 제안은 이미 구현됐다.
- 아직 구현되지 않은 큰 기능은 과거 transcript import, 프로젝트별 설정 UI, 중복 프롬프트 감지, git branch/commit/PR 연결, import/reconciliation 이벤트 상세화다.
- 현재 사용성 결함은 UI가 API pagination의 `next_cursor`를 쓰지 않고, 검색/필터 상태가 URL에 남지 않으며, 상세 화면에서 좋은 프롬프트를 바로 복사해 재사용할 수 없다는 점이다.
- 이번 작업에서는 "찾기 -> 열기 -> 재사용" 루프를 줄이는 기능을 우선 구현했다. 상세 프롬프트 복사, list load more, URL query 기반 필터 유지가 해당한다.
- 다음 기능 후보 우선순위는 중복 프롬프트 감지, 프로젝트 설정 UI, usefulness feedback/bookmark, git branch/commit/PR 연결, transcript import 순서가 적절하다.
- usefulness 측정은 외부 전송 없이 로컬 이벤트로 시작한다. 1차 이벤트는 `prompt_copied`, `prompt_bookmarked`, `prompt_reused_hint` 정도가 적합하고, dashboard에서는 "재사용 후보"로만 보여준다.
- Playwright MCP로 `/`, `/?tag=docs`, `/?q=P13`, prompt detail, mobile list/detail을 확인했다. 첫 페이지 50개에서 `더 보기` 후 62개로 확장됐고, 상세 복사 버튼은 실제 클릭 후 `복사됨` 상태를 표시했다.

## P14 Local Usefulness Signals

- [x] PRD 잔여 기능과 P13 사용성 결과 기준으로 다음 구현 단위 확정
- [x] 실패 테스트 먼저 작성
  - [x] copy 이벤트와 bookmark toggle API 계약 테스트
  - [x] SQLite 저장/조회/삭제 정합성 테스트
  - [x] dashboard 재사용 후보 집계 테스트
- [x] 로컬 usefulness 저장 구조 추가
  - [x] `prompt_usage_events`에 `prompt_copied` 같은 저위험 이벤트 기록
  - [x] `prompt_bookmarks`로 사용자가 다시 보고 싶은 프롬프트 표시
  - [x] 삭제 시 prompt 관련 usefulness 데이터 정리
- [x] API 확장
  - [x] prompt summary/detail에 `usefulness` 반환
  - [x] `POST /api/v1/prompts/:id/events` 추가
  - [x] `PUT /api/v1/prompts/:id/bookmark` 추가
  - [x] quality dashboard에 `useful_prompts` 반환
- [x] 웹 UI 구현 전 `DESIGN.md` 재검토
- [x] 웹 UI 연결
  - [x] detail copy 성공 시 로컬 copy 이벤트 기록
  - [x] detail bookmark toggle 추가
  - [x] list에 saved/reuse count 신호를 낮은 대비로 표시
  - [x] dashboard에 "재사용 후보" 패널 추가
- [x] Playwright MCP 사용성 점검
  - [x] detail copy event
  - [x] bookmark toggle
  - [x] dashboard useful prompts
  - [x] desktop/mobile overflow와 console/network 오류
- [x] 기본 검증 명령 실행
  - [x] `pnpm test`
  - [x] `pnpm lint`
  - [x] `pnpm format`
  - [x] `pnpm build`
  - [x] `pnpm pack:dry-run`
  - [x] `pnpm smoke:release`
  - [x] `git diff --check`
- [x] 커밋 및 `git push origin main`

### P14 설계 메모

- usefulness는 외부 분석이나 원문 전송이 아니라 로컬 메타 이벤트만 저장한다.
- `prompt_copied`는 "이 프롬프트를 다시 쓸 가능성이 있다"는 약한 신호로 본다.
- bookmark는 사용자가 명시적으로 저장한 강한 신호로 본다.
- dashboard의 "재사용 후보"는 자동 판단이 아니라 copy count/bookmark 기반 정렬 목록으로 표시한다.
- Playwright MCP로 detail bookmark, copy event, dashboard useful prompts, mobile dashboard를 확인했다. 콘솔 오류는 0개였고 관련 API는 200으로 응답했다.

## P15 Duplicate Prompt Detection

- [x] PRD 잔여 기능과 P14 이후 제품 가치 기준으로 다음 구현 단위 확정
- [x] 실패 테스트 먼저 작성
  - [x] SQLite exact duplicate group 집계 테스트
  - [x] prompt summary/detail duplicate count 반환 테스트
  - [x] quality dashboard duplicate prompt group API 계약 테스트
- [x] 로컬 중복 탐지 구현
  - [x] redaction 이후 저장 본문 HMAC인 `stored_content_hash` 기준으로 exact duplicate group 탐지
  - [x] 원문 prompt body를 dashboard/API에 반환하지 않음
  - [x] 삭제 후 duplicate group count가 자동으로 줄어드는지 확인
- [x] 웹 UI 구현 전 `DESIGN.md` 재검토
- [x] 웹 UI 연결
  - [x] list/detail에 중복 그룹 크기 badge 표시
  - [x] dashboard에 "중복 후보" 패널 추가
  - [x] 중복 후보에서 상세로 이동 가능하게 연결
- [x] Playwright MCP 사용성 점검
  - [x] duplicate badge
  - [x] dashboard duplicate prompts
  - [x] desktop/mobile overflow와 console/network 오류
- [x] 기본 검증 명령 실행
  - [x] `pnpm test`
  - [x] `pnpm lint`
  - [x] `pnpm format`
  - [x] `pnpm build`
  - [x] `pnpm pack:dry-run`
  - [x] `pnpm smoke:release`
  - [x] `git diff --check`
- [x] 커밋 및 `git push origin main`

### P15 설계 메모

- 이번 단위는 semantic similarity가 아니라 exact duplicate detection만 다룬다.
- 기준은 raw prompt가 아니라 redaction 이후 저장 본문 HMAC이다. 민감정보 원문이나 prompt body는 집계 API에 노출하지 않는다.
- 중복 탐지는 "이 프롬프트를 정리하거나 더 좋은 버전을 남길 수 있다"는 운영 신호로 대시보드에 표시한다.
- Playwright MCP로 list duplicate badge, detail duplicate signal, dashboard duplicate prompts, mobile dashboard를 확인했다. 콘솔 오류는 0개였고 관련 API는 200으로 응답했다.

## P16 Focus Filters

- [x] PRD 완료 범위와 P14/P15 사용성 결과 기준으로 다음 구현 단위 확정
- [x] 실패 테스트 먼저 작성
  - [x] SQLite focus filter: saved / duplicated / quality-gap
  - [x] API query `focus` 계약 테스트
  - [x] URL query와 UI 필터 동기화 기준 고정
- [x] 저장소/API 구현
  - [x] `ListPromptsOptions.focus` 추가
  - [x] saved는 `prompt_bookmarks`, duplicated는 `stored_content_hash` group count 기준
  - [x] quality-gap은 `prompt_analyses.checklist_json`의 weak/missing 존재 기준
  - [x] search에서도 동일 focus 필터 적용
- [x] 웹 UI 구현 전 `DESIGN.md` 재검토
- [x] 웹 UI 연결
  - [x] topbar에 Focus select 추가
  - [x] URL query `focus`로 새로고침/공유 시 유지
  - [x] empty state 문구가 선택한 focus에 맞게 표시
- [x] Playwright MCP 사용성 점검
  - [x] saved focus
  - [x] duplicated focus
  - [x] quality-gap focus
  - [x] desktop/mobile overflow와 console/network 오류
- [x] 기본 검증 명령 실행
  - [x] `pnpm test`
  - [x] `pnpm lint`
  - [x] `pnpm format`
  - [x] `pnpm build`
  - [x] `pnpm pack:dry-run`
  - [x] `pnpm smoke:release`
  - [x] `git diff --check`
- [x] 커밋 및 `git push origin main`

### P16 설계 메모

- Focus filter는 새 분석이 아니라 이미 저장된 local signal을 목록 탐색에 연결하는 기능이다.
- 제품 효용은 "저장한 프롬프트만 다시 보기", "중복 정리 후보만 보기", "품질 보강이 필요한 프롬프트만 보기"를 빠르게 하는 데 있다.
- URL state를 유지해 dashboard에서 발견한 운영 신호를 목록 필터로 이어서 볼 수 있게 한다.
- Playwright MCP로 `?focus=saved`, `?focus=duplicated`, `?focus=quality-gap`, mobile quality-gap list를 확인했다. 콘솔 오류는 0개였고 관련 API는 200으로 응답했다.

## P17 Quality Gap Drilldown

- [x] PRD 완료 범위와 P16 이후 사용성 빈틈 기준으로 다음 구현 단위 확정
- [x] 실패 테스트 먼저 작성
  - [x] SQLite `qualityGap` 필터가 특정 체크리스트 항목의 weak/missing만 반환
  - [x] search에서도 `qualityGap` 필터가 동일하게 적용
  - [x] API query `quality_gap` 계약과 invalid value 검증
- [x] 저장소/API 구현
  - [x] `ListPromptsOptions.qualityGap` 추가
  - [x] `prompt_analyses.checklist_json` 기준 항목별 weak/missing 필터 적용
  - [x] `focus=quality-gap`과 함께 조합 가능하게 유지
- [x] 웹 UI 구현 전 `DESIGN.md` 재검토
- [x] 웹 UI 연결
  - [x] topbar에 부족 항목 select 추가
  - [x] URL query `gap`으로 새로고침/공유 시 유지
  - [x] dashboard의 "자주 부족한 항목" row에서 해당 큐로 이동
  - [x] empty state 문구가 선택한 부족 항목에 맞게 표시
- [x] Playwright MCP 사용성 점검
  - [x] dashboard gap row drilldown
  - [x] list quality gap item filter
  - [x] desktop/mobile overflow와 console/network 오류
- [x] 기본 검증 명령 실행
  - [x] `pnpm test`
  - [x] `pnpm lint`
  - [x] `pnpm format`
  - [x] `pnpm build`
  - [x] `pnpm pack:dry-run`
  - [x] `pnpm smoke:release`
  - [x] `git diff --check`
- [x] 커밋 및 `git push origin main`

### P17 설계 메모

- PRD의 주요 기능은 구현되어 있으므로 이번 단위는 새 분석이 아니라 기존 분석 결과를 더 행동 가능한 큐로 바꾸는 작업이다.
- `quality_gap`은 원문 prompt를 노출하지 않고 체크리스트 key만 받는다.
- 대시보드에서 발견한 반복 문제를 목록의 실제 프롬프트 집합으로 바로 좁혀, "무엇을 고쳐야 하는지"에서 "어떤 프롬프트를 고칠지"까지 연결한다.
- Playwright MCP로 dashboard `검증 기준` row drilldown, `?focus=quality-gap&gap=verification_criteria` URL 유지, desktop/mobile list 렌더링을 확인했다. 현재 페이지 콘솔 오류는 0개였고 관련 API는 200으로 응답했다.

## P18 Dashboard Distribution Drilldown

- [x] PRD 완료 범위와 P17 이후 사용성 빈틈 기준으로 다음 구현 단위 확정
- [x] 웹 UI 구현 전 `DESIGN.md`와 Web Interface Guidelines 재검토
- [x] 웹 UI 연결
  - [x] 도구별 분포 bucket 클릭 시 `tool` 필터 목록으로 이동
  - [x] 프로젝트별 분포 bucket 클릭 시 `cwdPrefix` 필터 목록으로 이동
  - [x] URL query가 필터 상태를 유지하는지 확인
  - [x] distribution row가 버튼처럼 접근 가능한 이름과 hover/focus 상태를 갖도록 정리
- [x] Playwright MCP 사용성 점검
  - [x] tool distribution drilldown
  - [x] project distribution drilldown
  - [x] desktop/mobile overflow와 console/network 오류
- [x] 기본 검증 명령 실행
  - [x] `pnpm test`
  - [x] `pnpm lint`
  - [x] `pnpm format`
  - [x] `pnpm build`
  - [x] `pnpm pack:dry-run`
  - [x] `pnpm smoke:release`
  - [x] `git diff --check`
- [x] 커밋 및 `git push origin main`

### P18 설계 메모

- 새 저장 구조나 분석 규칙을 만들지 않고, 이미 있는 `tool`/`cwdPrefix` 필터를 대시보드 분포와 연결한다.
- 제품 효용은 "어느 프로젝트/도구가 많은가"를 본 뒤 바로 해당 프롬프트 목록을 확인하는 데 있다.
- 분포 row는 통계 표시이면서 동작 가능한 탐색 항목이므로 button으로 구현하고 접근 가능한 이름을 유지한다.
- Playwright MCP로 `claude-code` 분포 drilldown이 `?tool=claude-code`에서 2행만 표시하고, `project-a` 분포 drilldown이 `?cwd=/Users/example/project-a`에서 2행만 표시하는 것을 확인했다. 모바일 목록 렌더링과 현재 페이지 콘솔 오류 0개도 확인했다.

## P19 Dashboard Metric Drilldown

- [x] PRD 완료 범위와 P18 이후 사용성 빈틈 기준으로 다음 구현 단위 확정
- [x] 웹 UI 구현 전 `DESIGN.md`와 Web Interface Guidelines 재검토
- [x] 웹 UI 연결
  - [x] 전체 프롬프트 metric 클릭 시 전체 목록으로 이동
  - [x] 민감정보 포함 metric 클릭 시 `isSensitive=true` 목록으로 이동
  - [x] 최근 7일/30일 metric 클릭 시 `receivedFrom` 필터 목록으로 이동
  - [x] metric이 버튼처럼 접근 가능한 이름과 hover/focus 상태를 갖도록 정리
- [x] Playwright MCP 사용성 점검
  - [x] sensitive metric drilldown
  - [x] recent 7/30 metric drilldown
  - [x] desktop/mobile overflow와 console/network 오류
- [x] 기본 검증 명령 실행
  - [x] `pnpm test`
  - [x] `pnpm lint`
  - [x] `pnpm format`
  - [x] `pnpm build`
  - [x] `pnpm pack:dry-run`
  - [x] `pnpm smoke:release`
  - [x] `git diff --check`
- [x] 커밋 및 `git push origin main`

### P19 설계 메모

- 새 API 없이 기존 `isSensitive`, `receivedFrom` 필터를 대시보드 metric과 연결한다.
- 제품 효용은 "민감정보 비율이 높다" 또는 "최근 입력량이 늘었다"를 본 뒤 바로 해당 프롬프트 목록을 확인하는 데 있다.
- metric은 통계 카드이면서 동작 가능한 탐색 항목이므로 `button`으로 구현하고 URL query 상태를 유지한다.
- Playwright MCP로 민감정보 metric drilldown이 `?sensitive=true`에서 1행만 표시하고, 최근 7일 metric drilldown이 `?from=2026-04-24`에서 3행, 최근 30일 metric drilldown이 `?from=2026-04-01`에서 3행을 표시하는 것을 확인했다. 모바일 목록 렌더링과 현재 페이지 콘솔 오류 0개도 확인했다.

## P20 Active Filter Bar

- [x] PRD 완료 범위와 P19 이후 사용성 빈틈 기준으로 다음 구현 단위 확정
- [x] 웹 UI 구현 전 `DESIGN.md`와 Web Interface Guidelines 재검토
- [x] 웹 UI 연결
  - [x] 현재 적용된 query/tool/tag/sensitivity/focus/gap/cwd/date 필터를 칩으로 표시
  - [x] 각 칩에서 해당 필터만 해제
  - [x] 전체 필터 초기화 버튼 추가
  - [x] 필터 없음 상태에서는 불필요한 UI를 렌더링하지 않음
- [x] Playwright MCP 사용성 점검
  - [x] dashboard drilldown 이후 활성 필터 표시
  - [x] 단일 필터 제거
  - [x] 전체 필터 초기화
  - [x] desktop/mobile overflow와 console/network 오류
- [x] 기본 검증 명령 실행
  - [x] `pnpm test`
  - [x] `pnpm lint`
  - [x] `pnpm format`
  - [x] `pnpm build`
  - [x] `pnpm pack:dry-run`
  - [x] `pnpm smoke:release`
  - [x] `git diff --check`
- [x] 커밋 및 `git push origin main`

### P20 설계 메모

- 새 저장 구조나 API 없이 기존 URL 필터 상태를 더 명확하게 보여주는 UI 개선이다.
- 제품 효용은 drilldown과 복합 필터 사용 후 현재 조건을 이해하고 빠르게 해제하는 데 있다.
- 칩은 좁은 화면에서도 줄바꿈되는 낮은 대비 컨트롤로 두고, 필터 값이 raw prompt나 민감정보를 포함하지 않도록 기존 query param 값만 표시한다.
- Playwright MCP로 복합 필터 URL에서 활성 필터 칩 표시, `도구` 칩 단일 제거, 전체 필터 초기화, 모바일 줄바꿈 렌더링을 확인했다. 현재 페이지 콘솔 오류는 0개였다.

## P21 Prompt List Snippets

- [x] PRD 완료 범위와 P20 이후 사용성 빈틈 기준으로 다음 구현 단위 확정
- [x] 실패 테스트 먼저 작성
  - [x] list/search summary가 redacted snippet을 반환
  - [x] raw secret이 snippet/API 응답에 노출되지 않는 회귀 테스트
- [x] 저장소/API 구현
  - [x] `PromptSummary.snippet` 추가
  - [x] `prompt_fts.snippet`을 summary에 연결
  - [x] snippet 누락 시 빈 문자열로 안전하게 fallback
- [x] 웹 UI 구현 전 `DESIGN.md`와 Web Interface Guidelines 재검토
- [x] 웹 UI 연결
  - [x] 목록 경로 아래에 한 줄 snippet 표시
  - [x] desktop/mobile에서 긴 snippet overflow 방지
  - [x] redacted placeholder만 표시되고 raw secret은 표시하지 않음
- [x] Playwright MCP 사용성 점검
  - [x] list snippet rendering
  - [x] sensitive prompt redacted snippet
  - [x] desktop/mobile overflow와 console/network 오류
- [x] 기본 검증 명령 실행
  - [x] `pnpm test`
  - [x] `pnpm lint`
  - [x] `pnpm format`
  - [x] `pnpm build`
  - [x] `pnpm pack:dry-run`
  - [x] `pnpm smoke:release`
  - [x] `git diff --check`
- [x] 커밋 및 `git push origin main`

### P21 설계 메모

- 새 분석을 만들지 않고 저장 시 이미 생성한 FTS snippet을 목록 summary로 노출한다.
- 제품 효용은 날짜/경로만으로 구분하기 어려운 프롬프트를 상세 화면 진입 전 목록에서 식별하는 데 있다.
- snippet은 저장 정책이 적용된 redacted text에서 생성된 값만 사용하며, raw prompt나 raw secret을 새로 읽거나 노출하지 않는다.
- Playwright MCP로 일반 snippet과 `[REDACTED:api_key]` snippet이 목록에 표시되고 raw token은 표시되지 않는 것을 확인했다. 모바일에서는 snippet이 카드 안에서 줄바꿈됐고 현재 페이지 콘솔 오류는 0개였다.

## P22 Setup & Safety Checklist

- [x] PRD 완료 범위와 현재 제품 사용성 빈틈 기준으로 다음 구현 단위 확정
- [x] 실패 테스트 먼저 작성
  - [x] settings API가 브라우저 안전한 제외 프로젝트 목록을 반환
  - [x] settings API가 인증 토큰과 raw prompt를 노출하지 않음
- [x] 설정 API 구현
  - [x] `excluded_project_roots`를 settings 응답에 추가
  - [x] 기존 secret 비노출 계약 유지
- [x] 웹 UI 구현 전 `DESIGN.md`와 Web Interface Guidelines 재검토
- [x] 웹 UI 연결
  - [x] 설정 화면에 온보딩/안전 체크리스트 추가
  - [x] 서버, 로컬 저장소, redaction, hook 수집, 첫 프롬프트 저장 상태 표시
  - [x] 수집 제외 프로젝트 목록 표시
  - [x] desktop/mobile에서 긴 경로 overflow 방지
- [x] Playwright MCP 사용성 점검
  - [x] settings checklist rendering
  - [x] excluded project roots rendering
  - [x] desktop/mobile overflow와 console/network 오류
- [x] 기본 검증 명령 실행
  - [x] `pnpm test`
  - [x] `pnpm lint`
  - [x] `pnpm format`
  - [x] `pnpm build`
  - [x] `pnpm pack:dry-run`
  - [x] `pnpm smoke:release`
  - [x] `git diff --check`
- [x] 커밋 및 `git push origin main`

### P22 설계 메모

- 새 저장 구조를 만들지 않고 기존 health/settings/dashboard 신호를 설정 화면에서 행동 가능한 체크리스트로 묶는다.
- 제품 효용은 첫 설치 사용자가 "서버가 살아 있는지, hook 수집이 성공했는지, redaction이 안전한지, 실제 프롬프트가 들어왔는지"를 한 화면에서 판단하게 하는 데 있다.
- 수집 제외 프로젝트는 브라우저에 보여줘도 되는 설정 값만 반환하고, 인증 토큰과 raw prompt는 계속 응답에 포함하지 않는다.
- Playwright MCP로 설정 화면 desktop/mobile 렌더링, 체크리스트 텍스트, 수평 overflow 없음, 콘솔 경고/오류 0개를 확인했다.

## P23 Quality Trend Timeline

- [x] PRD 이후 제품 사용성 빈틈 기준으로 다음 구현 단위 확정
- [x] 실패 테스트 먼저 작성
  - [x] dashboard가 최근 7일 일별 입력량/품질 보강/민감정보 trend를 반환
  - [x] trend 응답에 raw prompt가 포함되지 않음
- [x] 저장소/API 구현
  - [x] `PromptQualityDashboard.trend.daily` 타입 추가
  - [x] SQLite dashboard 집계에 최근 7일 날짜 버킷 추가
  - [x] 빈 날짜도 0으로 채워 UI가 안정적으로 렌더링되게 처리
- [x] 웹 UI 구현 전 `DESIGN.md`와 Web Interface Guidelines 재검토
- [x] 웹 UI 연결
  - [x] 대시보드에 Quality trend 패널 추가
  - [x] 일별 입력량, 품질 보강 비율, 민감정보 건수를 compact row/bar로 표시
  - [x] desktop/mobile overflow 방지
- [x] Playwright MCP 사용성 점검
  - [x] trend panel rendering
  - [x] desktop/mobile overflow와 console/network 오류
- [x] 기본 검증 명령 실행
  - [x] `pnpm test`
  - [x] `pnpm lint`
  - [x] `pnpm format`
  - [x] `pnpm build`
  - [x] `pnpm pack:dry-run`
  - [x] `pnpm smoke:release`
  - [x] `git diff --check`
- [x] 커밋 및 `git push origin main`

### P23 설계 메모

- 새 분석기를 만들지 않고 기존 `prompt_analyses.checklist_json`과 `prompts.received_at`을 집계한다.
- 제품 효용은 "프롬프트 입력량이 늘고 있는지"와 "품질 보강이 필요한 프롬프트 비율이 줄고 있는지"를 대시보드에서 빠르게 확인하는 데 있다.
- trend는 날짜, count, rate만 반환하고 저장 본문이나 snippet은 반환하지 않는다.
- Playwright MCP로 desktop/mobile 대시보드에서 trend 7개 row, 민감정보 count, 수평 overflow 없음, 콘솔 경고/오류 0개를 확인했다.

## P24 Trend Day Drilldown / Date Filter Semantics

- [x] P23 이후 사용성 빈틈 기준으로 다음 구현 단위 확정
- [x] 실패 테스트 먼저 작성
  - [x] date-only `receivedFrom`/`receivedTo`가 해당 날짜 전체를 포함
  - [x] ISO timestamp 범위 필터 기존 동작 유지
- [x] 저장소/API 구현
  - [x] date-only lower bound를 day start로 정규화
  - [x] date-only upper bound를 day end로 정규화
- [x] 웹 UI 구현 전 `DESIGN.md`와 Web Interface Guidelines 재검토
- [x] 웹 UI 연결
  - [x] trend day row 클릭 시 `from=<date>&to=<date>` 목록으로 이동
  - [x] row가 button 의미, aria-label, hover/focus 상태를 갖도록 정리
  - [x] desktop/mobile overflow 방지
- [x] Playwright MCP 사용성 점검
  - [x] trend day drilldown URL과 목록 결과
  - [x] active filter bar의 시작일/종료일 표시
  - [x] desktop/mobile overflow와 console/network 오류
- [x] 기본 검증 명령 실행
  - [x] `pnpm test`
  - [x] `pnpm lint`
  - [x] `pnpm format`
  - [x] `pnpm build`
  - [x] `pnpm pack:dry-run`
  - [x] `pnpm smoke:release`
  - [x] `git diff --check`
- [x] 커밋 및 `git push origin main`

### P24 설계 메모

- 새 집계를 만들지 않고 P23 trend와 기존 날짜 필터를 연결한다.
- 제품 효용은 "품질 보강 비율이 높았던 날"을 본 뒤 바로 해당 날짜의 실제 프롬프트 목록으로 내려가 점검하는 데 있다.
- date input 사용자는 `2026-05-01`을 하루 전체로 기대하므로 저장소 레벨에서 date-only bound를 명확히 보정한다.
- Playwright MCP로 trend day row 클릭 후 `?from=2026-05-01&to=2026-05-01` 목록 이동, 3개 결과, active filter 표시, 모바일 overflow 없음, 콘솔 경고/오류 0개를 확인했다.

## P25 Detail Return to Current Queue

- [x] P24 이후 사용성 빈틈 기준으로 다음 구현 단위 확정
- [x] 웹 UI 구현 전 `DESIGN.md`와 Web Interface Guidelines 재검토
- [x] 웹 UI 연결
  - [x] 상세 화면에 명시적인 `목록으로` action 추가
  - [x] 기존 필터/드릴다운 queue 상태를 유지해 목록으로 복귀
  - [x] detail action layout을 desktop/mobile에서 안정적으로 정리
- [x] Playwright MCP 사용성 점검
  - [x] 필터 목록에서 상세 진입 후 `목록으로` 복귀
  - [x] URL query와 active filter 유지
  - [x] desktop/mobile overflow와 console/network 오류
- [x] 기본 검증 명령 실행
  - [x] `pnpm test`
  - [x] `pnpm lint`
  - [x] `pnpm format`
  - [x] `pnpm build`
  - [x] `pnpm pack:dry-run`
  - [x] `pnpm smoke:release`
  - [x] `git diff --check`
- [x] 커밋 및 `git push origin main`

### P25 설계 메모

- 새 API 없이 기존 list filter state와 navigation을 활용한다.
- 제품 효용은 대시보드 drilldown이나 품질 보강 큐에서 상세를 연 뒤 다시 같은 작업 큐로 돌아가 여러 프롬프트를 빠르게 훑는 데 있다.
- 브라우저 back을 몰라도 보이는 action으로 흐름을 제공한다.
- Playwright MCP로 `?focus=quality-gap` 목록에서 상세 진입 후 `목록으로` 클릭 시 같은 URL, 2개 결과, active filter 유지, 모바일 overflow 없음, 콘솔 경고/오류 0개를 확인했다.

## P26 Detail Queue Navigation

- [x] P25 이후 사용성 빈틈 기준으로 다음 구현 단위 확정
- [x] 웹 UI 구현 전 `DESIGN.md`와 Web Interface Guidelines 재검토
- [x] 웹 UI 연결
  - [x] 현재 목록 queue 기준 이전/다음 프롬프트 계산
  - [x] 상세 화면에 `이전` / `다음` action 추가
  - [x] queue 밖 direct detail 진입 시 버튼 disabled 처리
  - [x] desktop/mobile에서 action layout overflow 방지
- [x] Playwright MCP 사용성 점검
  - [x] 필터 큐에서 상세 진입 후 다음/이전 이동
  - [x] queue 위치에 맞는 disabled 상태
  - [x] desktop/mobile overflow와 console/network 오류
- [x] 기본 검증 명령 실행
  - [x] `pnpm test`
  - [x] `pnpm lint`
  - [x] `pnpm format`
  - [x] `pnpm build`
  - [x] `pnpm pack:dry-run`
  - [x] `pnpm smoke:release`
  - [x] `git diff --check`
- [x] 커밋 및 `git push origin main`

### P26 설계 메모

- 새 API 없이 현재 로드된 list `prompts` 상태를 queue로 사용한다.
- 제품 효용은 품질 보강 큐, 날짜 drilldown, 민감정보 큐를 상세 화면에서 연속 검토하는 데 있다.
- direct URL로 상세에 진입해 queue가 없으면 이전/다음은 비활성화한다.
- Playwright MCP로 `?focus=quality-gap` 큐에서 상세 다음/이전 이동, `1 / 2`와 `2 / 2` 표시, direct detail `큐 없음` disabled, 모바일 overflow 없음, 콘솔 경고/오류 0개를 확인했다.

## P27 Detail Gap Drilldown

- [x] P26 이후 사용성 빈틈 기준으로 다음 구현 단위 확정
- [x] 웹 UI 구현 전 `DESIGN.md`와 Web Interface Guidelines 재검토
- [x] 웹 UI 연결
  - [x] 상세 분석 체크리스트의 `weak` / `missing` 항목에 같은 부족 항목 보기 action 추가
  - [x] 기존 `focus=quality-gap&gap=<key>` 목록 필터로 이동
  - [x] URL에는 raw prompt나 민감정보가 아니라 체크리스트 enum key만 유지
  - [x] desktop/mobile에서 checklist action overflow 방지
- [x] Playwright MCP 사용성 점검
  - [x] 상세 checklist action에서 부족 항목 목록 이동
  - [x] active filter bar와 목록 결과 확인
  - [x] desktop/mobile overflow와 console/network 오류 확인
- [x] 기본 검증 명령 실행
  - [x] `pnpm test`
  - [x] `pnpm lint`
  - [x] `pnpm format`
  - [x] `pnpm build`
  - [x] `pnpm pack:dry-run`
  - [x] `pnpm smoke:release`
  - [x] `git diff --check`
- [x] 커밋 및 `git push origin main`

### P27 설계 메모

- 새 분석기나 저장 구조 없이 기존 detail checklist와 `qualityGap` 목록 필터를 연결한다.
- 제품 효용은 개별 프롬프트 상세에서 발견한 부족 항목을 같은 문제를 가진 전체 큐로 바로 확장하는 데 있다.
- URL과 API에는 안전한 checklist key만 사용하고, raw prompt나 snippet을 경로/쿼리에 넣지 않는다.
- Playwright MCP로 상세 `배경 맥락` action 클릭 후 `?focus=quality-gap&gap=background_context` 이동, active filter 2개, 목록 2개, 모바일 390px 수평 overflow 없음, 콘솔 경고/오류 0개를 확인했다.

## P28 Project Quality Profiles

- [x] PRD Phase 2 잔여 범위와 현재 제품 사용성 빈틈 기준으로 다음 구현 단위 확정
- [x] 웹 UI 구현 전 `DESIGN.md`와 Web Interface Guidelines 재검토
- [x] 실패 테스트 먼저 작성
  - [x] dashboard가 프로젝트별 입력량, 품질 보강률, 민감정보 수, 재사용 신호를 반환
  - [x] project profile 응답에 raw prompt/snippet이 포함되지 않음
- [x] 저장소/API 구현
  - [x] `PromptQualityDashboard.project_profiles` 타입 추가
  - [x] SQLite dashboard 집계에 프로젝트별 품질 프로필 추가
  - [x] 프로젝트별 top gap을 checklist enum/label/count로 제한
- [x] 웹 UI 연결
  - [x] 대시보드에 프로젝트 품질 프로필 패널 추가
  - [x] 프로젝트 전체/품질 보강/민감정보 drilldown action 제공
  - [x] desktop/mobile에서 긴 경로와 badge overflow 방지
- [x] Playwright MCP 사용성 점검
  - [x] project profile rendering
  - [x] project 전체/품질 보강/민감정보 drilldown
  - [x] desktop/mobile overflow와 console/network 오류
- [x] 기본 검증 명령 실행
  - [x] `pnpm test`
  - [x] `pnpm lint`
  - [x] `pnpm format`
  - [x] `pnpm build`
  - [x] `pnpm pack:dry-run`
  - [x] `pnpm smoke:release`
  - [x] `git diff --check`
- [x] 커밋 및 `git push origin main`

### P28 설계 메모

- 새 원문 저장이나 외부 분석 없이 기존 `prompts`, `prompt_analyses`, usefulness 메타 이벤트만 집계한다.
- 제품 효용은 어느 프로젝트에서 프롬프트 품질 보강/민감정보/재사용 신호가 집중되는지 한눈에 보고 바로 목록으로 이동하는 데 있다.
- 프로젝트 프로필 API에는 count/rate/checklist key만 반환하고 prompt body, snippet, raw secret은 반환하지 않는다.
- Playwright MCP로 프로젝트 프로필 렌더링, project-a 품질 보강 drilldown, project-a 민감정보 drilldown, mobile 390px 렌더링, 콘솔 경고/오류 0개를 확인했다.

## P29 Reused Focus Filter

- [x] P28 이후 사용성 빈틈 기준으로 다음 구현 단위 확정
- [x] 웹 UI 구현 전 `DESIGN.md`와 Web Interface Guidelines 재검토
- [x] 실패 테스트 먼저 작성
  - [x] `focus=reused`가 복사 또는 저장된 프롬프트만 반환
  - [x] search에서도 `focus=reused`가 동일하게 적용
  - [x] API query `focus=reused` 계약 검증
- [x] 저장소/API 구현
  - [x] `PromptFocusFilter`에 `reused` 추가
  - [x] copied event 또는 bookmark가 있는 prompt를 reused로 분류
  - [x] 기존 saved/duplicated/quality-gap 동작 유지
- [x] 웹 UI 연결
  - [x] Focus select에 `재사용됨` 추가
  - [x] Dashboard 재사용 후보와 Project profile reuse에서 reused 목록으로 이동
  - [x] empty state와 active filter label 정리
- [x] Playwright MCP 사용성 점검
  - [x] reused focus rendering
  - [x] project profile reuse drilldown
  - [x] desktop/mobile overflow와 console/network 오류
- [x] 기본 검증 명령 실행
  - [x] `pnpm test`
  - [x] `pnpm lint`
  - [x] `pnpm format`
  - [x] `pnpm build`
  - [x] `pnpm pack:dry-run`
  - [x] `pnpm smoke:release`
  - [x] `git diff --check`
- [x] 커밋 및 `git push origin main`

### P29 설계 메모

- `reused`는 외부 판단이 아니라 로컬에서 사용자가 복사했거나 저장한 명시적/약한 사용 신호만 본다.
- 제품 효용은 “좋았던 프롬프트를 다시 찾기”를 dashboard뿐 아니라 목록 필터와 프로젝트별 큐에서도 일관되게 지원하는 데 있다.
- URL에는 `focus=reused`와 선택적 `cwd`만 들어가며 raw prompt, snippet, secret은 포함하지 않는다.
- Playwright MCP로 `?focus=reused` 목록, 프로젝트 프로필 `재사용됨` drilldown, `?focus=reused&cwd=/Users/example/project-a` active filter, mobile 390px 렌더링, 콘솔 경고/오류 0개를 확인했다.

## P30 Efficiency Review / Phase 2 PRD

- [x] 현재 구현과 기존 PRD의 Phase 2 항목 대조
- [x] 효율성 평가 문서 작성
  - [x] 사용 흐름 효율성
  - [x] 분석/재사용 루프 효율성
  - [x] 운영/복구 효율성
  - [x] 구현 복잡도와 위험 대비 효용
- [x] 2차 PRD 작성
  - [x] 이미 구현된 Phase 2성 기능을 기준선으로 명시
  - [x] 다음 개발 후보를 문제/범위/수용 기준으로 분해
  - [x] 외부 LLM 분석, transcript import, project control, export 경계를 명확히 구분
- [x] 문서 링크와 package 포함 범위 검토
- [x] 검증 명령 실행
- [x] 커밋 및 `git push origin main`

### P30 설계 메모

- 효율성 평가는 이미 구현된 Phase 2성 기능을 기준선으로 보고, 다음 병목을 project control, transcript import, prompt improvement, anonymized export, external LLM opt-in 순서로 정리했다.
- 2차 PRD는 비즈니스 KPI가 아니라 개발용 요구사항으로 유지했다.
- 첫 구현 후보는 Project Control Plane으로 잡았다. import/export/external analysis가 모두 프로젝트별 policy를 필요로 하므로, 이 기반을 먼저 만드는 것이 후속 기능의 위험을 줄인다.
- README 문서 링크와 `package.json` package files에 `docs/PRD_PHASE2.md`, `docs/EFFICIENCY_REVIEW.md`를 추가했다.
- 검증 명령: `pnpm format`, `pnpm test`, `pnpm lint`, `pnpm build`, `pnpm pack:dry-run`, `git diff --check` 통과. Node 20.20.0에서 실행되어 `engines.node >=22 <25` 경고는 계속 발생한다.

## P31 Phase 2 PRD Deep Review

- [x] 서브 에이전트 리뷰 착수
  - [x] 보안/프라이버시 경계 리뷰
  - [x] 제품/UX/가치 리뷰
  - [x] 구현/테스트/아키텍처 리뷰
- [x] 로컬 코드/문서 기준 추가 검토
- [x] 리뷰 결과 통합
- [x] PRD/효율성 문서 보강
- [x] 검증 명령 실행
- [x] 커밋 및 `git push origin main`

### P31 설계 메모

- 보안 리뷰에서 지적한 Phase 2 mutation/preview job CSRF 요구, import 파일 경계, allowlist parser, anonymized export 재식별 방지, external LLM preview snapshot 동일성, provider response untrusted content 경계를 PRD에 반영했다.
- 제품 리뷰에서 지적한 import 이후 imported-only queue, quality-gap 큐 중심 improvement workflow, Phase 2 core와 external LLM gated beta 분리를 반영했다.
- 구현 리뷰에서 지적한 project identity, Projects API와 Settings API 경계, `ProjectPolicyStoragePort`, policy audit, rebuild/delete lifecycle, 첫 구현 slice 축소와 필수 테스트 목록을 반영했다.
- 효율성 평가 문서도 external LLM을 Phase 2 core가 아닌 gated beta로 낮추고, import dry-run + imported-only queue를 앞당기는 순서로 갱신했다.
- 검증 명령: `pnpm format`, `pnpm test`, `pnpm lint`, `pnpm build`, `pnpm pack:dry-run`, `git diff --check` 통과. Node 20.20.0에서 실행되어 `engines.node >=22 <25` 경고는 계속 발생한다.

## 2026-05-02 Full Runtime Feature Check

- [x] CLI command surface 확인
- [x] 임시 data dir에서 init/server/ingest/list/search/show/delete/rebuild 동작 확인
- [x] PromptLane improve, import, anonymized export 동작 확인
- [x] Benchmark, release smoke, browser E2E 실행
- [x] 실제 기능 목록과 한계 정리

## 2026-05-02 Prompt Quality Score v1

- [x] 점수 기준 설계: 기존 5개 checklist를 0-100 rubric으로 변환
- [x] 분석 단위 테스트: strong/vague/partial prompt 점수와 breakdown 검증
- [x] storage/API/dashboard에 quality score와 평균/추세 노출
- [x] 웹 UI에 per-prompt score, dashboard 평균, 프로젝트 평균 표시
- [x] benchmark에 score calibration 지표 추가
- [x] 문서/검증/커밋/PR 브랜치 푸시

### 설계 메모

- Prompt Quality Score v1은 외부 LLM judge가 아니라 기존 로컬 checklist의 deterministic 점수다.
- 가중치: goal clarity 25, background context 20, scope limits 20, output format 15, verification criteria 20.
- 상태 점수: good은 full weight, weak은 half weight, missing은 0점이다.
- band는 excellent >= 85, good >= 60, needs_work >= 40, weak < 40으로 계산한다.
- benchmark는 `prompt_quality_score_calibration`으로 list/detail score 일치, vague prompt 저점, fixture 간 점수 spread를 확인한다.

## 2026-05-02 MCP Prompt Scoring

- [x] MCP tool 계약 설계: 사용자 요청에 따라 current prompt text 또는 저장 prompt id를 점수화
- [x] MCP tool handler 단위 테스트 추가
- [x] `promptlane mcp` stdio JSON-RPC 서버 구현
- [x] Claude Code/Codex 연결 문서화
- [x] 직접 JSON-RPC smoke, test/lint/build/pack 검증
- [x] 커밋 및 PR 브랜치 푸시

### 설계 메모

- MCP 서버는 `promptlane mcp`로 실행되는 stdio JSON-RPC 서버다.
- 노출 tool은 `score_prompt` 하나만 둔다. 입력은 `prompt`, `prompt_id`, `latest: true` 중 정확히 하나다.
- 직접 전달된 prompt text는 저장하지 않고, 결과에도 prompt body를 반환하지 않는다.
- 저장 prompt scoring은 기존 SQLite analysis를 읽고 score/checklist metadata만 반환한다.
- Claude Code는 `claude mcp add --transport stdio promptlane -- promptlane mcp`, Codex는 `codex mcp add promptlane -- promptlane mcp`로 연결하도록 문서화했다.

## 2026-05-08 Multi-Track Improvement Pass

목적: 한 세션 안에서 메모/도큐먼트에 누적된 PR 후보 + 아키텍처 deepening 후보 + 신규 기능 brainstorming + UI 패트롤 셋업을 순차 진행한다.

### Track A — 아키텍처 Deepening 탐색 (read-only) ✅

- [x] `improve-codebase-architecture` 스킬로 후보 8개 도출, 5개 1차 통과, 4개 사용자 선택, depth-check로 우선순위 정리.
- 채택된 후보: A2 ingest pipeline 추출, A3 coaching decision 모듈, A1 MCP per-tool ADR, A4 capability registry ADR.
- 보류: 후보 5(App.tsx) — Track D 후보. 후보 6(hook design doc) — 문서 작업으로 분리. 후보 7(project-label) — ARCHITECTURE.md에 의도된 분리 명시, 보류. 후보 8(rebuild+migration) — 검증 부족, Track D 검증 후보.

### Track B — CLI UserError + program-level catch (PR 후보)

- [x] 실패 테스트: 잘못된 옵션/입력 시 raw stack trace가 stderr에 노출되지 않는다 + non-zero exit.
- [x] `src/shared/errors.ts` (또는 `src/cli/user-error.ts`) — `UserError` 클래스 + 표준 메시지 포맷.
- [x] CLI commands에서 invalid 입력은 `throw new UserError(...)` 또는 command-boundary 변환으로 통일. `importer` 입력 오류는 `ImportInputError`로 분리 후 CLI에서 `UserError`로 변환.
- [x] `src/cli/index.ts`에 program-level catch — UserError는 friendly + exit 1, 그 외는 기존 동작.
- [x] 영향받는 명령 회귀 테스트.
- [x] 검증 게이트(`pnpm test/lint/format/build/pack:dry-run`).
- [x] 별도 브랜치 + PR.

### Track C — service CLI UX 개선 (PR 후보)

- [x] launchctl 실패 시 raw stderr 노출 → friendly mapping (no permission, already loaded, no plist).
- [x] JSON-only 출력 → plain text formatter + `--json` 플래그로 자동화 옵션 보존.
- [x] 회귀 테스트.
- [x] 검증 게이트, 별도 브랜치 + PR.

### Track A2 — Ingest pipeline 순수 함수 추출 (PR 후보)

- [x] 실패 테스트: importer 경로에서도 max prompt length 초과 시 store 차단.
- [x] `src/storage/ingest-flow.ts` — `ingestPrompt(event, options) → result` 순수 함수 추출.
- [x] `server/routes/ingest.ts` + `importer/execute.ts` 모두 동일 함수 호출.
- [x] 회귀 테스트, 검증 게이트, 별도 브랜치 + PR.

### Track A3 — Coaching decision 모듈 (PR 후보)

- [x] 실패 테스트: rewrite-guard와 agent-wrapper가 같은 입력에 같은 (action, copy, score) 반환.
- [x] `src/analysis/coaching-decision.ts` — `decideCoachingAction(prompt, context) → CoachingAction`.
- [x] DEFAULT_MIN_SCORE, ask-mode trigger 조건, language detection을 한 곳에 모은다.
- [x] rewrite-guard와 agent-wrapper는 본 모듈 호출. MCP coach handler는 다음 slice.
- [x] 회귀 테스트, 검증 게이트, 별도 브랜치 + PR.
- [x] MCP coach handler도 `decideCoachingAction` 기반으로 next_action/clarifying_questions 판단을 공유.

### Track A1 — MCP per-tool 마이그레이션 ADR

- [x] `docs/adr/0001-mcp-per-tool-modules.md` — 현재 split 양식과 신규 per-tool 양식 공존, 통일 vs 유지 결정.
- [x] 실제 마이그레이션은 ADR 합의 후 별도 PR.

### Track A4 — Storage capability registry ADR

- [x] `docs/adr/0002-storage-capability-registry.md` — optional 메서드 가드 분산 문제, registry vs 현행 유지 결정.

### Track D — 신규 기능 brainstorming

- [x] PRD_PHASE2 + Track A 결과 + Phase 2 backlog를 input으로 다음 우선순위 토론.
- [x] 결과는 PRD 갱신 또는 후속 PR 후보로.
- [x] 다음 구현 후보: ADR 0002 기반 storage capability negotiation helper를 route registration 경계에 도입.
- [x] 다음 구현 후보: storage capability declaration을 explicit MCP storage errors로 확장.
- [x] 다음 구현 후보: ingest/export/prompt/loop-memory route의 hand-written storage capability guard를 shared helper로 전환.
- [x] 다음 구현 후보: MCP capability metadata가 `tools/list` filtering까지 필요한지 결정하고, 필요할 때 registry/capability catalogue slice로 진행.
- [ ] 다음 구현 후보: 새 MCP tool/schema 변경이 생길 때 `tools/list`와 `tools/call` dispatch를 같은 registry에서 파생.
- [x] MCP coach loop stdio audit 실행: `score_prompt` -> `improve_prompt` -> `record_clarifications` 실제 MCP JSON-RPC 흐름 확인.
- [x] 다음 구현 후보: MCP instructions/docs에서 `apply_clarifications`를 final draft presentation step으로 명확화.
- [x] 다음 구현 후보: 반복 가능한 `smoke:mcp-coach-loop` harness 추가.
- [x] native dialog safe preflight/smoke 실행: OS dialog 없이 metadata fallback과 MCP elicitation 경로 확인.
- [ ] 다음 검증 후보: 실제 Claude Code 또는 Codex interactive session에서 native ask UI handoff 확인.
- [x] Reuse loop in-app Browser audit 실행: 검색, 상세, 저장은 통과하고 copy 실패 friction 확인.
- [x] prompt detail copy 실패 시 local-only manual-copy fallback 제공.
- [x] `App.tsx` query-hook extraction 첫 slice: selected prompt detail loading hook 분리.

### Track E — UI 패트롤 셋업

- [x] `ui-patrol` 스킬로 cron 기반 디자인 자동 점검 셋업.
- [x] `workflow_dispatch` run `28717406758`에서 GitHub Actions ui-patrol 성공 및 screenshot artifact 9개 업로드 확인.
- [ ] 운영 후 첫 scheduled artifact 결과 확인.
## 2026-07-05 Codex Plugin Setup-Driven Hooks

- [x] RED: Add packaging regressions that the Codex marketplace plugin does not bundle active hooks and points users through explicit `promptlane setup`.
- [x] GREEN: Remove active bundled Codex hooks from the plugin manifest/package docs while preserving setup-installed user-level hooks.
- [x] VERIFY: Run focused packaging tests, full gates, push a coherent PR, merge, and prune the branch.

## 2026-07-05 Codex Plugin Hook Event Mapping

- [x] RED: Add packaging regression coverage that each bundled Codex plugin hook event uses the matching `PROMPTLANE_HOOK` lifecycle marker.
- [x] GREEN: Fix `plugins/promptlane/hooks.json` so `UserPromptSubmit`, `Stop`, `PreCompact`, and `PostCompact` no longer point at shifted markers.
- [x] VERIFY: Run focused packaging tests, full gates, push a coherent PR, merge, and prune the branch.

## 2026-07-05 PromptLane Hook And Docs Copy

- [x] RED: Add regression coverage for rewrite-guard hook context headers and docs copy that should describe product surfaces as PromptLane while preserving `promptlane` command/id compatibility.
- [x] GREEN: Update hook copy plus README/PLUGINS/reuse-audit wording for PromptLane-facing storage/server surfaces.
- [x] VERIFY: Run focused tests, full gates, push a coherent PR, merge, and prune the branch.

## 2026-07-05 PromptLane CLI Infrastructure Help Copy

- [x] RED: Add regression coverage for CLI infrastructure help and MCP readiness copy that should use PromptLane as the product surface while preserving `promptlane` command compatibility.
- [x] GREEN: Update CLI/web help copy for server, MCP, hooks, status line, and service setup without renaming runtime IDs or command namespaces.
- [x] VERIFY: Run focused tests, full test/lint/build/pack dry-run gates, push a coherent PR, merge, and prune the branch.

## 2026-07-05 Reuse Copy Fallback Audit Refresh

- [x] EVIDENCE: `corepack pnpm e2e:browser` forces clipboard writes to fail and verifies the prompt detail manual-copy fallback appears.
- [x] DOCS: Refresh reuse audit, next backlog, and goal audit so the copy-failure fallback is no longer tracked as an open implementation gap.
- [x] VERIFY: Run focused docs/search checks plus full test/lint/build/pack dry-run gates, push a coherent PR, merge, and prune the branch.

## 2026-07-05 Reuse Copy Fallback E2E Coverage

- [x] DECISION: The audit claims current and saved improvement drafts both have local manual-copy fallback, so browser E2E should force clipboard failure on both actions.
- [x] GREEN: `scripts/browser-e2e.mjs` now uses shared clipboard failure helpers and verifies `Copy draft` plus `Copy saved draft` fallback paths.
- [x] VERIFY: Run browser E2E, full test/lint/build/pack dry-run gates, push a coherent PR, merge, and prune the branch.

## 2026-07-05 PromptLane Audit Refresh After Fallback Coverage

- [x] EVIDENCE: `main` is at `d6dfcc4` after PR #359, no open PRs, and no scheduled `ui-patrol` run has appeared yet.
- [x] DOCS: Refresh `NEXT_BACKLOG` and `PROMPTLANE_GOAL_AUDIT_2026-07-05.md` so they cite PR #358/#359 reuse fallback coverage instead of the stale #357/#346 state.
- [x] VERIFY: Run docs/search checks plus full test/lint/build/pack dry-run gates, push a coherent PR, merge, and prune the branch.

## 2026-07-05 Package Dry-Run Lifecycle Gates

- [x] RED/GREEN: Stabilize `pack:dry-run` through a wrapper that strips pnpm-only npm env and pins lifecycle builds through `corepack pnpm build`.
- [x] DOCS: Align npm publishing, package contents, release checklist, README, and README.ko package gates with `corepack pnpm pack:dry-run`.
- [x] GUARDS: Add packaging tests that keep release checklist and README package verification commands aligned with the wrapper.
- [x] INTEGRATE: PR #361, PR #362, and PR #363 were merged to `main`; branches were pruned.

## 2026-07-05 Loop Read Storage Capability Guard

- [x] RED: `/api/v1/loops` returns 200 with an empty PromptLane state when `listLoopSnapshots` is missing.
- [x] GREEN: Loop read routes now require loop snapshot, compact boundary, loop memory, and merge decision storage through the shared capability helper.
- [x] PRIVACY: Missing capability responses use one raw-free local configuration problem and do not expose method names or local paths.
- [x] VERIFY: Run focused tests and full local gates.
- [x] INTEGRATE: PR #364 was merged to `main`; branch was pruned.

## 2026-07-05 Reuse Copy Saved Draft Fallback Label

- [x] EVIDENCE: Fresh Codex in-app Browser pass confirmed search/detail reuse, current draft copy fallback, saved draft persistence, saved draft copy fallback, and no fake token/temp path exposure in visible states.
- [x] RED: Add a focused copy-failure message test requiring saved-draft copy failure to use `Could not copy the saved draft.`
- [x] GREEN: `copySavedImprovementDraft` now uses the saved-draft-specific helper message while preserving the same local manual-copy fallback textarea.
- [x] VERIFY: Run focused tests and full local gates.
- [x] INTEGRATE: PR #365 was merged to `main`; branch was pruned.

## 2026-07-05 Reuse Saved Draft As Current Draft

- [x] RED: Add focused tests requiring saved drafts to reopen as the current improvement draft and expose a visible `Use as current draft` action.
- [x] GREEN: Saved draft rows can now reopen their redacted draft text as the current coach draft without adding a new storage API or auto-submission path.
- [x] VERIFY: Focused tests, full test/lint/build, browser E2E, pack dry-run, and diff check passed.
- [x] INTEGRATE: PR #366 was merged to `main`; branch was pruned.

## 2026-07-05 Saved Draft Mode Label

- [x] RED: Add a focused label test proving `saved-draft` is not exposed as user-facing badge copy.
- [x] GREEN: The coach draft badge now renders `Saved draft` for reopened saved drafts and `Copy draft` for generated drafts.
- [x] VERIFY: Focused tests, browser E2E, full test/lint/build, pack dry-run, and diff check passed.
- [x] INTEGRATE: PR #367 was merged to `main`; branch was pruned.

## 2026-07-05 Reopened Saved Draft Save State

- [x] RED: Add focused save-state coverage requiring reopened saved drafts to show `Already saved` and disable duplicate save.
- [x] GREEN: The coach panel now disables the save action for reopened saved drafts while preserving normal save behavior for generated drafts.
- [x] VERIFY: Focused tests, browser E2E, full test/lint/build, pack dry-run, and diff check passed.
- [x] INTEGRATE: PR #368 was merged to `main`; branch was pruned.

## 2026-07-05 PromptLane Audit Reuse Drift Guard

- [x] RED: Add a focused packaging/docs drift test requiring the PromptLane goal audit and next backlog to cite PR #366, PR #367, and PR #368 saved-draft reuse work.
- [x] GREEN: Refresh the PromptLane goal audit and next backlog so saved-draft reuse is documented as the current completed flow instead of a stale active slice.
- [x] VERIFY: Focused test, full test/lint/build, pack dry-run, and diff check passed.
- [x] INTEGRATE: PR #369 was merged to `main`; branch was pruned.

## 2026-07-05 Reuse Audit Next Slice Closure

- [x] RED: Add a focused packaging/docs drift test requiring the reuse audit to stop carrying the stale real-browser rerun recommendation after PR #366-#368 landed.
- [x] GREEN: Refresh `docs/REUSE_LOOP_AUDIT_2026-07-05.md` so no immediate reuse-flow slice remains until fresh user-flow evidence appears.
- [x] VERIFY: Focused test, full test/lint/build, pack dry-run, and diff check passed.
- [x] INTEGRATE: PR #370 was merged to `main`; branch was pruned.

## 2026-07-05 MCP Coach Loop Audit Next Slice Closure

- [x] RED: Add a focused packaging/docs drift test requiring the MCP coach loop audit to stop carrying completed docs and smoke-harness follow-ups.
- [x] GREEN: Refresh `docs/MCP_COACH_LOOP_AUDIT_2026-07-05.md` so only the approval-gated native ask UI dogfood remains.
- [x] VERIFY: Focused test, full test/lint/build, pack dry-run, and diff check passed.
- [x] INTEGRATE: PR #371 was merged to `main`; branch was pruned.

## 2026-07-05 Goal Audit And Backlog Drift Guard

- [x] RED: Add a focused packaging/docs drift test requiring the PromptLane goal audit and next backlog to cite latest merged evidence through PR #371 and stop carrying completed MCP/reuse follow-up text.
- [x] GREEN: Refresh `docs/PROMPTLANE_GOAL_AUDIT_2026-07-05.md` and `docs/NEXT_BACKLOG.md` so completed audit follow-ups are closed and only scheduled UI patrol plus approval-gated native ask dogfood remain.
- [x] VERIFY: Focused test, full test/lint/build, pack dry-run, and diff check passed.
- [x] INTEGRATE: PR #372 was merged to `main`; branch was pruned.

## 2026-07-05 CLI Root PromptLane Help Copy

- [x] RED: Add a focused CLI help-copy test requiring root `promptlane --help` to present PromptLane as an agent loop memory and meta-prompting workbench while preserving the `promptlane` command id.
- [x] GREEN: Update the root CLI description to the PromptLane workbench positioning for Codex and Claude Code.
- [x] VERIFY: Focused test, full test/lint/build, pack dry-run, and diff check passed.
- [x] INTEGRATE: PR #373 was merged to `main`; branch was pruned.

## 2026-07-05 PromptLane Repositioning Design

- [x] RED: Add a focused packaging/docs drift test requiring a PromptLane repositioning spec before replacing PromptLane branding.
- [x] GREEN: Add `docs/superpowers/specs/2026-07-05-promptlane-repositioning-design.md` with PromptLane product naming, PromptLane rejection, prompt improvement first positioning, compatibility rules, migration slices, TDD guard requirements, and package inclusion.
- [x] VERIFY: Focused test, placeholder/path scan, full test/lint/build, pack dry-run, and diff check passed.
- [x] INTEGRATE: PR #374 was merged to `main`; branch was pruned.

## 2026-07-05 PromptLane Product Contract

- [x] RED: Add packaging drift guards requiring PromptLane product-facing metadata, README first viewport, `docs/PROMPTLANE.md`, and `docs/PROMPTLANE.md` legacy status while preserving `promptlane` runtime ids.
- [x] GREEN: Update README/README.ko, package and plugin metadata, Codex skill copy, AGENTS/CLAUDE/INSTRUCTION routing, NEXT_BACKLOG, PACKAGE_CONTENTS, root CLI/help/hook/coach/buddy copy, and runtime inventory to PromptLane-first wording.
- [x] VERIFY: Focused packaging and CLI/hook tests passed; full `corepack pnpm test` passed.
- [x] INTEGRATE: PR #375 was merged to `main`; branch was pruned.

## 2026-07-05 PromptLane Core Docs Alignment

- [x] RED: Add packaging/docs drift guard requiring shipped core docs (`ARCHITECTURE`, `AGENT-HARNESS`, `PLUGINS`, `TECH_SPEC`) to name PromptLane as the prompt improvement workspace with loop-aware continuation while preserving `promptlane` runtime ids.
- [x] GREEN: Align core doc product boundaries, harness wording, plugin MCP wording, and tech spec purpose to PromptLane-first positioning.
- [x] VERIFY: Focused packaging test, full test/lint/build, pack dry-run, and diff check passed.
- [x] INTEGRATE: PR #376 was merged to `main`; branch was pruned.

## 2026-07-05 PromptLane PromptLane Boundary

- [x] RED: Add focused packaging/docs and MCP drift guards requiring active product docs and agent-facing tool descriptions to avoid presenting `PromptLane` as a service name.
- [x] GREEN: Replace active README, release checklist, tech spec, implementation-plan, and MCP `improve_prompt` `PromptLane` labels with PromptLane improvement-draft wording while preserving `promptlane` runtime IDs.
- [x] VERIFY: Focused packaging and MCP tests, full test/lint/build, pack dry-run, and diff check passed.
- [x] INTEGRATE: PR #377 was merged to `main`; branch was pruned.

## 2026-07-05 PromptLane Plugin Surface Copy

- [x] RED: Update packaging tests to require Claude Code marketplace metadata and slash command docs to present PromptLane, while preserving `promptlane` command IDs and `promptlane` compatibility alias where explicitly documented.
- [x] GREEN: Replace PromptLane-facing marketplace and slash command titles/descriptions with PromptLane wording without changing command filenames or runtime IDs.
- [x] VERIFY: Focused packaging test, full test/lint/build, pack dry-run, and diff check passed.
- [x] INTEGRATE: PR #379 was merged to `main`; branch was pruned.

## 2026-07-05 PromptLane Runtime Surface Copy

- [x] RED: Add focused MCP, storage, web readiness, and CLI loop tests requiring user-facing runtime copy to say PromptLane while preserving `promptlane` commands and `get_promptlane_status` compatibility names.
- [x] GREEN: Replace PromptLane-facing runtime descriptions, local archive/server messages, instruction-memory headings, and loop status labels with PromptLane wording without renaming internal types or compatibility tool names.
- [x] VERIFY: Focused tests, full test/lint/build, pack dry-run, and diff check passed.
- [x] INTEGRATE: PR #381 was merged to `main`; branch was pruned.

## 2026-07-05 PromptLane Safety Guidance Copy

- [x] RED: Use focused API/web guidance tests and literal scans to prove safety/privacy guidance no longer needs to expose `PromptLane` as the product name.
- [x] GREEN: Replace safety guidance phrases such as `PromptLane does not ...`, `outside PromptLane`, and `PromptLane records ...` with PromptLane wording while preserving internal `PromptLaneStatus` compatibility identifiers.
- [x] VERIFY: Focused API/web tests, full test/lint/build, pack dry-run, and diff check passed.
- [x] INTEGRATE: PR #383 was merged to `main`; branch was pruned.

## 2026-07-08 MCP First Prompt Next Step

- [x] RED: Add focused MCP status expectations for setup-needed and empty archives to require a concrete first prompt action.
- [x] GREEN: Update `get_promptlane_status` next actions to point users through `promptlane setup --profile coach --register-mcp`, then one Codex or Claude Code prompt, then `coach_prompt` or status recheck.
- [x] VERIFY: Focused MCP status/server checks and diff hygiene passed.
- [x] INTEGRATE: Commit prepared from `codex/promptlane-mcp-status-first-step` for PR.

## 2026-07-08 Loop MCP Setup Guidance

- [x] RED: Add focused loop MCP status coverage for unavailable storage setup guidance.
- [x] GREEN: Update `get_promptlane_loop_status` setup-needed next action to use `promptlane setup --profile coach --register-mcp` before loop collection.
- [x] VERIFY: Focused loop MCP/server checks and diff hygiene passed.
- [x] INTEGRATE: Commit prepared from `codex/promptlane-loop-mcp-setup-guidance` for PR.

## 2026-07-08 Goal Audit Evidence Alignment

- [x] RED: Add focused packaging guards requiring the goal audit and backlog to cite PR #512/#513 and stop carrying stale scheduled-ui-patrol/native-dialog blockers.
- [x] GREEN: Refresh `docs/PROMPTLANE_GOAL_AUDIT_2026-07-05.md` and `docs/NEXT_BACKLOG.md` to match current local `quality-evidence` status, local browser evidence, approved native-dialog evidence, and first-step MCP guidance.
- [x] VERIFY: Focused packaging guard, `quality-evidence`, and diff hygiene passed.
- [x] INTEGRATE: Commit prepared from `codex/promptlane-goal-audit-evidence-alignment` for PR.

## 2026-07-08 Goal Audit Baseline Copy

- [x] RED: Add a focused packaging guard that rejects the stale `Latest merged main commit at audit time` label in the long-lived goal audit.
- [x] GREEN: Rename the fixed `2f99c10` pointer to an initial audit baseline and clarify that later merged PR evidence extends it.
- [x] VERIFY: Focused packaging guard and diff hygiene passed.
- [x] INTEGRATE: Commit prepared from `codex/promptlane-goal-audit-baseline-copy` for PR.

## 2026-07-08 Quality Evidence Release Gate Guidance

- [x] RED: Add focused CLI and packaging expectations requiring `quality-evidence` JSON/text to expose the local release gate commands before goal completion claims.
- [x] GREEN: Add `release_gate` to `scripts/quality-95-evidence.mjs`, render it in `promptlane quality-evidence`, and document the field in backlog/9.5 plan.
- [x] VERIFY: Focused CLI, packaging, quality-evidence, build, built-CLI output, and diff hygiene checks passed.
- [x] INTEGRATE: Commit prepared from `codex/promptlane-quality-release-gate-guidance` for PR.

## 2026-07-08 Quality Release Gate Checklist Alignment

- [x] RED: Expand focused `quality-evidence` CLI expectations so `release_gate` matches `docs/RELEASE_CHECKLIST.md` verification commands.
- [x] GREEN: Add format, benchmark, browser E2E, release smoke, and built product CLI quality-evidence checks to the structured `release_gate`, backlog, and 9.5 plan.
- [x] VERIFY: Focused CLI, packaging, quality-evidence, build, built-CLI output, and diff hygiene checks passed.
- [x] INTEGRATE: Commit prepared from `codex/promptlane-quality-release-gate-checklist-alignment` for PR.

## 2026-07-08 Release Stability Evidence Policy Alignment

- [x] RED: Add a focused packaging guard requiring release stability evidence to stop carrying scheduled UI patrol and native-dialog blocker language while listing the full `release_gate`.
- [x] GREEN: Refresh `docs/RELEASE_STABILITY_EVIDENCE_2026-07-06.md` to use local browser evidence, approved native-dialog evidence, and the checklist-aligned local release gate.
- [x] VERIFY: Focused packaging guard, `quality-evidence`, stale blocker scan, and diff hygiene checks passed.
- [x] INTEGRATE: Commit prepared from `codex/promptlane-release-evidence-policy-alignment` for PR.

## 2026-07-08 Quality Plan Native Evidence Alignment

- [x] RED: Add a focused packaging guard requiring the 9.5 quality plan to cite approved native-dialog evidence and reject stale pending/blocker language.
- [x] GREEN: Refresh the 9.5 quality plan completion-state copy to match current complete `quality-evidence` output and the approved native-dialog audit.
- [x] VERIFY: Focused packaging guards, `quality-evidence`, stale blocker scan, and diff hygiene passed.
- [x] INTEGRATE: Commit prepared from `codex/promptlane-quality-plan-native-evidence-alignment` for PR.

## 2026-07-08 Backlog Quality Completion Alignment

- [x] RED: Add a focused packaging guard requiring `docs/NEXT_BACKLOG.md` to stop carrying stale native-dialog pending/blocker copy after quality evidence became complete.
- [x] GREEN: Refresh the backlog 9.5 quality section to describe current complete evidence, future operator-gated recommendations, and explicit-approval-only native-dialog dogfood.
- [x] VERIFY: Focused packaging guard, stale backlog scan, `quality-evidence`, and diff hygiene passed.
- [x] INTEGRATE: Commit prepared from `codex/promptlane-backlog-quality-completion-alignment` for PR.

## 2026-07-08 Prompt List Query Hook Extraction

- [x] RED: Add focused prompt-list query tests for replace/append behavior, search cursor hiding, and row patching.
- [x] GREEN: Extract prompt list loading, cursor, and summary patch state from `App.tsx` into `usePromptListQuery`.
- [x] VERIFY: Focused web query tests, web typecheck, touched-code formatting check, and diff hygiene passed.
- [x] INTEGRATE: Commit prepared from `codex/promptlane-prompt-list-query-hook` for PR.

## 2026-07-08 Dashboard Query Hook Extraction

- [x] RED: Add focused dashboard query tests for view-gated dashboard, archive score, and coach feedback loading decisions.
- [x] GREEN: Extract dashboard/archive score/coach feedback automatic loading state from `App.tsx` into `useDashboardQuery`.
- [x] VERIFY: Focused dashboard/list query tests, web typecheck, touched-code formatting check, and diff hygiene passed.
- [x] INTEGRATE: Commit prepared from `codex/promptlane-dashboard-query-hook` for PR.

## 2026-07-08 Workspace Query Hook Extraction

- [x] RED: Add focused workspace query tests for projects/loops view-gated loading and project row patching.
- [x] GREEN: Extract projects and loops list automatic loading state from `App.tsx` into `useWorkspaceQuery` while leaving loop worktree navigation in `App.tsx`.
- [x] VERIFY: Focused workspace/dashboard query tests, web typecheck, touched-code formatting check, and diff hygiene passed.
- [x] INTEGRATE: Commit prepared from `codex/promptlane-workspace-query-hook` for PR.

## 2026-07-08 Loop Worktree Query Hook Extraction

- [x] RED: Add focused workspace query tests for cached loop worktree detail matching and loop route navigation decisions.
- [x] GREEN: Move loop worktree detail state, route-triggered loading, and worktree selection navigation into `useWorkspaceQuery`.
- [x] VERIFY: Focused workspace/dashboard query tests, web typecheck, touched-code formatting check, and diff hygiene passed.
- [x] INTEGRATE: Commit prepared from `codex/promptlane-loop-worktree-query-hook` for PR.

## 2026-07-08 Prompt Selection Hook Extraction

- [x] RED: Add focused prompt selection tests for immutable toggle behavior and visible-row select-all behavior.
- [x] GREEN: Extract bulk-selection state and helpers from `App.tsx` into `usePromptSelection`.
- [x] VERIFY: Focused prompt selection/list query tests, web typecheck, touched-code formatting check, and diff hygiene passed.
- [x] INTEGRATE: Commit prepared from `codex/promptlane-prompt-selection-hook` for PR.

## 2026-07-08 App View Model Extraction

- [x] RED: Add focused tests for route-driven page chrome labels and detail queue navigation.
- [x] GREEN: Extract `getVisibleChrome` and `getQueueNavigation` from `App.tsx` into a pure `app-view` helper.
- [x] VERIFY: Focused app-view/routing tests and web typecheck passed.

## 2026-07-08 Setup Checks Model Extraction

- [x] RED: Add focused setup check tests for first-run guidance, raw-free local path display, and attention states.
- [x] GREEN: Extract setup checks, setup status labels, and local path display from `App.tsx` into a pure `setup-checks` helper.
- [x] VERIFY: Focused setup-checks tests and web typecheck passed.

## 2026-07-08 Prompt Filter Model Extraction

- [x] RED: Add focused prompt filter model tests for empty filters, clear patches, and raw-free path chips.
- [x] GREEN: Extract active filter chips and filter clearing helpers from `App.tsx` into `prompt-filter-model`, masking cwd filter chips with the local path display helper.
- [x] VERIFY: Focused prompt-filter/routing tests and web typecheck passed.

## 2026-07-08 Prompt Empty State Model Extraction

- [x] RED: Add focused prompt empty-state tests for first-run setup guidance, quality-gap queues, and filtered reuse empty states.
- [x] GREEN: Extract prompt list empty-state title, hint, secondary hint, and first-run commands from `App.tsx` into `prompt-empty-state`.
- [x] VERIFY: Focused prompt-empty-state/filter model tests and web typecheck passed.

## 2026-07-08 Archive Review Model Extraction

- [x] RED: Add focused archive review model tests for reviewable score bands and the six-prompt review queue limit.
- [x] GREEN: Extract archive review prompt selection from `App.tsx` into `archive-review-model`.
- [x] VERIFY: Focused archive-review/measurement tests and web typecheck passed.

## 2026-07-08 Project Empty State Model Extraction

- [x] RED: Add a focused project empty-state test requiring the explicit coach setup command.
- [x] GREEN: Extract project empty-state copy from `App.tsx` into `project-empty-state` and align the command with `promptlane setup --profile coach`.
- [x] VERIFY: Focused project/prompt empty-state tests and web typecheck passed.

## 2026-07-08 Sidebar Storage Extraction

- [x] RED: Add focused sidebar storage tests for saved collapsed state, missing browser storage, and throwing storage access.
- [x] GREEN: Extract sidebar collapsed-state localStorage helpers from `App.tsx` into `sidebar-storage`.
- [x] VERIFY: Focused sidebar-storage tests and web typecheck passed.

## 2026-07-08 Storage Project Label Path Separators

- [x] RED: Add focused storage project-label tests for backslash-separated paths.
- [x] GREEN: Update storage project labels to trim and split both POSIX and backslash path separators.
- [x] VERIFY: Focused storage/MCP project-label tests and repo typecheck passed.

## 2026-07-08 Archive Score Project Label Path Separators

- [x] RED: Add focused archive-score test for backslash-separated cwd/cwdPrefix project labels.
- [x] GREEN: Update archive score project labels to trim and split both POSIX and backslash path separators.
- [x] VERIFY: Focused archive-score/storage project-label tests and repo typecheck passed.

## 2026-07-08 MCP Project Label Normalization

- [x] RED: Add focused MCP project-label test for whitespace plus trailing backslash separators.
- [x] GREEN: Normalize MCP project labels by trimming before removing POSIX/backslash trailing separators.
- [x] VERIFY: Focused MCP project-label/score-tool tests and repo typecheck passed.

## 2026-07-08 Storage Project Label Whitespace Trim

- [x] RED: Add focused storage project-label test for whitespace-wrapped POSIX/backslash paths.
- [x] GREEN: Trim storage project-label input before removing trailing POSIX/backslash separators.
- [x] VERIFY: Focused storage project-label/loop status tests and repo typecheck passed.

## 2026-07-08 Shared Project Label Helper

- [x] RED: Add focused shared project-label test for POSIX/backslash paths and caller-specific fallbacks.
- [x] GREEN: Move project label normalization into `shared/project-label` and keep storage/MCP/archive fallbacks at their wrappers.
- [x] VERIFY: Focused shared/storage/MCP/archive-score project-label tests and repo typecheck passed.

## 2026-07-08 Duplicate Groups Raw-Free Projects

- [x] RED: Expand duplicate prompt group storage test to reject raw project paths in dashboard output.
- [x] GREEN: Return project labels for duplicate group `projects` and prompt `cwd` fields.
- [x] VERIFY: Focused sqlite storage/project-label tests and repo typecheck passed.

## 2026-07-08 Useful Prompts Raw-Free Cwd

- [x] RED: Expand useful prompt dashboard test to reject raw cwd paths.
- [x] GREEN: Return project labels for useful prompt `cwd` values in the quality dashboard.
- [x] VERIFY: Focused sqlite storage/project-label tests, typecheck, and diff hygiene passed.

## 2026-07-08 Quality Patterns Raw-Free Projects

- [x] RED: Expand quality dashboard test to require project labels for repeated pattern and project suggestion outputs.
- [x] GREEN: Return project labels from quality pattern summaries while keeping internal aggregation keyed by source path.
- [x] VERIFY: Focused sqlite storage/project-label tests, typecheck, and diff hygiene passed.

## 2026-07-08 Project Profiles Raw-Free Keys

- [x] RED: Expand quality dashboard test to reject raw project paths in serialized dashboard output.
- [x] GREEN: Return stable project ids for project distribution/profile keys while preserving labels and internal aggregation.
- [x] VERIFY: Focused sqlite storage/project-label tests, typecheck, and diff hygiene passed.

## 2026-07-08 Quality Dashboard Privacy Contract

- [x] RED: Add focused quality dashboard test requiring a local-only raw-free privacy block.
- [x] GREEN: Add `privacy` metadata to storage and web quality dashboard contracts.
- [x] VERIFY: Focused sqlite storage/web measurement tests, typecheck, and diff hygiene passed.

## 2026-07-08 Measurement Dashboard Privacy Fallback

- [x] RED: Add focused measurement test requiring dashboard privacy when archive score data is unavailable.
- [x] GREEN: Use dashboard privacy metadata as the measurement fallback instead of treating missing archive score as automatically safe.
- [x] VERIFY: Focused measurement/habit-coach/storage dashboard tests, typecheck, touched-file formatting, and diff hygiene passed.

## 2026-07-08 Selected Loop Brief Recovery

- [x] RED: Add focused CLI/MCP tests requiring selected loop brief misses to explain the recovery command instead of stopping at a generic filter mismatch, plus a raw-path echo regression check.
- [x] GREEN: Share selected loop snapshot not-found wording from the loop domain so CLI and MCP return the same raw-free recovery action.
- [x] VERIFY: Focused loop CLI/MCP tests, typecheck, and diff hygiene passed.

## 2026-07-08 Loop Status Selected Continuation Actions

- [x] RED: Add focused loop status test requiring multi-worktree status `next_actions` to surface selected continuation commands.
- [x] GREEN: Reuse the command-center continuation commands in top-level status actions so MCP/CLI agents can choose the intended worktree/branch without digging through nested review items.
- [x] VERIFY: Focused loop status/MCP/CLI loop tests, typecheck, and diff hygiene passed.

## 2026-07-08 Doctor Service Recovery Guidance

- [x] RED: Add focused doctor output expectation requiring server-down recovery to mention `promptlane service start` before falling back to foreground `promptlane server`.
- [x] GREEN: Align doctor server recovery guidance with setup's background-service path while preserving setup fallback for uninstalled services.
- [x] VERIFY: Focused doctor/setup/start tests, typecheck, and diff hygiene passed.

## 2026-07-08 Doctor JSON Next Actions

- [x] RED: Add focused doctor tests requiring Claude Code and Codex JSON/result output to include the same raw-free recovery `next_actions` as plain text output.
- [x] GREEN: Store doctor next actions on the result object so automation and text formatting share the same recovery guidance.
- [x] VERIFY: Focused doctor/setup/start tests, typecheck, and diff hygiene passed.

## 2026-07-08 Doctor Ingest Diagnosis Raw-Free Paths

- [x] RED: Add focused ingest diagnosis test requiring server-owner mismatch recovery hints to avoid echoing configured or bound raw data-dir paths.
- [x] GREEN: Replace raw data-dir values in the mismatch hint with a path-free local server conflict explanation and the service stop/install recovery command.
- [x] VERIFY: Focused ingest diagnosis/doctor tests, typecheck, and diff hygiene passed.

## 2026-07-08 Doctor Data Dir Equals Parsing

- [x] RED: Add focused ingest diagnosis test requiring server-owner mismatch detection when the running server uses `--data-dir=<path>` syntax.
- [x] GREEN: Teach the doctor ingest process parser to recognize both spaced and equals-style `--data-dir` arguments while keeping mismatch hints raw-free.
- [x] VERIFY: Focused ingest diagnosis/doctor tests, typecheck, touched-file formatting, and diff hygiene passed.

## 2026-07-08 Doctor Quoted Data Dir Parsing

- [x] RED: Add focused ingest diagnosis test proving matching quoted data-dir values with spaces must not be misdiagnosed as a server-owner mismatch.
- [x] GREEN: Parse quoted `--data-dir` values for both spaced and equals-style arguments before comparing normalized local data directories.
- [x] VERIFY: Focused ingest diagnosis/doctor tests, typecheck, touched-file formatting, and diff hygiene passed.

## 2026-07-08 Doctor Default Data Dir Inference

- [x] RED: Add focused ingest diagnosis test requiring a running `promptlane server` without `--data-dir` to count as the default data directory when the configured doctor data-dir is custom.
- [x] GREEN: Infer the default PromptLane data directory for bound server commands that omit `--data-dir` so owner mismatch diagnosis stays accurate and raw-free.
- [x] VERIFY: Focused ingest diagnosis/doctor tests, typecheck, touched-file formatting, and diff hygiene passed.

## 2026-07-08 Effectiveness Backlog Drift Guard

- [x] RED: Add a focused packaging/docs drift test requiring landed archive and one-call coach effectiveness work to stop being described as active follow-ups.
- [x] GREEN: Refresh `docs/NEXT_BACKLOG.md` so archive-level effectiveness summary and `coach_prompt` effectiveness guidance are recorded as landed evidence.
- [x] VERIFY: Focused packaging docs test, typecheck, and diff hygiene passed.

## 2026-07-08 MCP Custom Data Dir Setup Guidance

- [x] RED: Add focused `get_promptlane_status` test requiring setup-needed MCP
  guidance to mention custom `--data-dir` initialization without echoing raw
  local paths.
- [x] GREEN: Add a raw-free custom storage next action to setup-needed MCP
  status responses.
- [x] VERIFY: Focused MCP score-tool tests, typecheck, touched-file formatting,
  and diff hygiene passed.

## 2026-07-08 Coach Prompt Custom Data Dir Guidance

- [x] RED: Extend focused `coach_prompt` setup guidance test so the one-call
  agent brief must include the raw-free custom `--data-dir` recovery action.
- [x] GREEN: Reuse `get_promptlane_status` setup next actions in not-ready
  coach briefs while preserving start/server/doctor recovery guidance.
- [x] VERIFY: Focused MCP score-tool/server tests, typecheck, touched-file
  formatting, and diff hygiene passed.

## 2026-07-08 Loop MCP Custom Data Dir Guidance

- [x] RED: Extend focused `get_promptlane_loop_status` setup guidance test so
  custom `--data-dir` recovery appears without echoing raw local paths.
- [x] GREEN: Add the same raw-free custom storage next action to loop MCP
  setup-needed responses.
- [x] VERIFY: Focused loop MCP tests, MCP server tests, typecheck,
  touched-file formatting, and diff hygiene passed.

## 2026-07-08 PromptLane Release Evidence Quality CLI Ledger

- [x] CHECK: release smoke now verifies the built product `quality-evidence --require-complete`, but local/release evidence ledgers still described release smoke as ending at import/export/delete cleanup.
- [x] RED: packaging guard requires `quality evidence CLI gate` in the local 9.5 evidence, backlog, 9.5 plan, and release stability evidence, exposing stale ledger text.
- [x] GREEN: update local 9.5 evidence, release stability evidence, next backlog, and 9.5 quality plan to record the built product quality evidence CLI gate inside release smoke evidence.
- [x] VERIFY: focused packaging guard, quality evidence JSON smoke, touched-file formatting/type/diff hygiene checks.

## 2026-07-08 Dashboard Summary Refresh Hook Boundary

- [x] CHECK: bulk delete refreshed the prompt list through the list query but
      still refreshed dashboard/archive summaries by directly wiring dashboard API
      calls and setters inside `App.tsx`.
- [x] RED: add focused dashboard-query tests requiring a shared mutation refresh
      helper to update dashboard/archive summaries and preserve the existing
      independent refresh behavior when one summary request fails.
- [x] GREEN: expose `refreshSummaries()` from `useDashboardQuery` and route bulk
      delete through that hook-owned refresh boundary.
- [x] VERIFY: focused dashboard-query/App-adjacent tests, touched TypeScript
      formatting, typecheck, and diff hygiene checks.

## 2026-07-08 Single Delete Summary Refresh Hook Boundary

- [x] CHECK: single prompt delete still refreshed dashboard/archive summaries by
      directly wiring dashboard API calls and setters inside `App.tsx`, even
      after bulk delete moved to the hook-owned refresh boundary.
- [x] GREEN: route single prompt delete through `useDashboardQuery`
      `refreshSummaries()` so delete mutations use the same summary refresh
      contract.
- [x] VERIFY: focused dashboard-query/App-adjacent tests, touched TypeScript
      formatting, typecheck, and diff hygiene checks.

## 2026-07-08 PromptLane 1.0.0 Release Surface Prep

- [x] CHECK: git had no release tags, while package/plugin/shared version and
      publishing docs still pointed at `0.1.0-beta.0` / beta publish flow.
- [x] RED: add a packaging guard requiring the public release surface to use
      `1.0.0`, stable changelog copy, `latest` npm publish commands, and
      annotated `v1.0.0` tag instructions.
- [x] GREEN: align `package.json`, shared runtime version, Claude plugin
      manifests, README status copy, changelog, npm publishing runbook, and
      release checklist with the 1.0.0 stable release target.
- [x] VERIFY: focused release-surface guard, shared version test, touched-file
      formatting/type/diff hygiene checks.
