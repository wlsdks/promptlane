# Release Checklist

Use this checklist before publishing a stable public release or npm package.

## Scope

- [ ] README describes install, init, server, hook install, doctor, uninstall, and delete flows.
- [ ] README states the default storage path.
- [ ] README states that local rule-based analysis preview is implemented.
- [ ] README states that PromptLane improvement drafts are copy-based and do not auto-type, replace, or resubmit prompts into Claude Code or Codex.
- [ ] Prompt Rewrite Guard docs state that `block-and-copy` is opt-in and requires manual paste/enter.
- [ ] README states that transcript import is CLI-centered and has no web upload UI.
- [ ] README states that browser export is anonymized-only and raw export is not implemented.
- [ ] README documents Benchmark v1 as a local regression baseline, not a real-user quality proof.
- [ ] README states that hidden external LLM/provider calls are disabled by
      default, and optional MCP agent-judge packets require explicit user request.
- [ ] README includes a non-affiliation notice for Anthropic and OpenAI.
- [ ] Codex is clearly labeled beta.
- [ ] Adapter guide is up to date.
- [ ] Security policy is up to date.

## Verification

- [ ] `corepack pnpm format`
- [ ] `corepack pnpm test`
- [ ] `corepack pnpm lint`
- [ ] `corepack pnpm build`
- [ ] `corepack pnpm pack:dry-run`
- [ ] `corepack pnpm --silent benchmark -- --json`
- [ ] `corepack pnpm e2e:browser`
- [ ] `corepack pnpm smoke:release`
- [ ] `corepack pnpm smoke:package-install`
- [ ] `corepack pnpm evidence:quality -- --require-complete`
- [ ] `corepack pnpm promptlane quality-evidence --require-complete`
- [ ] `corepack pnpm promptlane quality-evidence --runtime-tool codex --require-runtime-ready`
- [ ] Create or refresh annotated tag `v1.0.0` before `corepack pnpm npm-publish:preflight`.
- [ ] Push the annotated tag with `git push origin v1.0.0 --force` before `corepack pnpm npm-publish:preflight`.
- [ ] `corepack pnpm npm-publish:preflight`
- [ ] `git diff --check`

Before `promptlane@1.0.0` is published, the tag may be refreshed after the full
local gate confirms the intended release commit. After `promptlane@1.0.0` is
published, do not retarget `v1.0.0`; bump the package version and create a new
tag.

For machine-readable inspection of the 9.5 quality summary, use
`corepack pnpm --silent evidence:quality` or
`node scripts/quality-95-evidence.mjs`; plain `corepack pnpm evidence:quality`
may include package-manager execution banners around stdout.
The default ledger is repeatable isolated release evidence. The runtime command
above is the separate maintainer gate for claiming that the installed Codex
hook path is currently live.

For machine-readable npm publish preflight output, use
`corepack pnpm --silent npm-publish:preflight -- --json`; plain
`corepack pnpm npm-publish:preflight -- --json` may include package-manager
execution banners around stdout.

## Package Contents

Confirm `corepack pnpm pack:dry-run` includes:

- [ ] built CLI files under `dist/cli` (including `pl-claude.js`, `pl-codex.js`)
- [ ] built server files under `dist/server`
- [ ] built web assets under `dist/web`
- [ ] `README.md`, `README.ko.md`
- [ ] `CHANGELOG.md`, `LICENSE`
- [ ] `SECURITY.md`, `CODE_OF_CONDUCT.md`, `CONTRIBUTING.md`, `SUPPORT.md`
- [ ] `docs/PRD.md`, `docs/PRD_PHASE2.md`
- [ ] `docs/ARCHITECTURE.md`
- [ ] `docs/EFFICIENCY_REVIEW.md`
- [ ] `docs/LEGAL_USAGE_GUIDE.md`
- [ ] `docs/TECH_SPEC.md`
- [ ] `docs/IMPLEMENTATION_PLAN.md`
- [ ] `docs/ADAPTERS.md`
- [ ] `docs/PLUGINS.md`
- [ ] `docs/PROMPTLANE.md`
- [ ] `docs/PROMPTLANE-RUNTIME-HISTORY.md`
- [ ] `docs/PROMPTLANE-LEGACY-SURFACES.md`
- [ ] `docs/LOOP-SNAPSHOT-SCHEMA.md`
- [ ] `docs/AGENT-HARNESS.md`
- [ ] `docs/INSTRUCTION-FILES.md`
- [ ] `docs/BENCHMARK_V1.md`
- [ ] `docs/benchmark-fixtures/real.example.json`
- [ ] `docs/FEATURE_AUDIT_2026-05-02.md`
- [ ] `docs/PRD2_COMPLETION_AUDIT.md`
- [ ] `docs/NPM_PUBLISHING.md`
- [ ] `docs/PACKAGE_CONTENTS.md`
- [ ] `docs/PRE_PUBLISH_PRIVACY_AUDIT.md`
- [ ] `docs/RELEASE_CHECKLIST.md`
- [ ] `docs/DOGFOOD_CODEX_CLAUDE_2026-07-05.md`
- [ ] `docs/DOGFOOD_WEB_USER_FLOW_2026-07-05.md`
- [ ] `docs/NATIVE_DIALOG_DOGFOOD_AUDIT_2026-07-05.md`
- [ ] `docs/RELEASE_STABILITY_EVIDENCE_2026-07-06.md`
- [ ] `docs/LOCAL_95_EVIDENCE_2026-07-06.md`
- [ ] `docs/PRODUCT_POSITIONING_EVIDENCE_2026-07-06.md`
- [ ] `docs/UI_PATROL_EVIDENCE_2026-07-06.md`
- [ ] `docs/UI_PATROL_SCHEDULE_READINESS_2026-07-06.md`
- [ ] `docs/CODEX_CLAUDE_LOCAL_INTEGRATION_EVIDENCE_2026-07-06.md`
- [ ] `docs/superpowers/plans/2026-07-04-promptlane-plugin-rename-plan.md`
- [ ] `docs/superpowers/plans/2026-07-04-promptlane-plugin-rename-issue-slices.md`
- [ ] `docs/superpowers/plans/2026-07-04-promptlane-claude-dual-namespace-decision.md`
- [ ] `docs/superpowers/plans/2026-07-04-promptlane-mcp-server-name-decision.md`
- [ ] `docs/superpowers/plans/2026-07-04-promptlane-deprecation-readiness.md`
- [ ] `docs/superpowers/plans/2026-07-04-promptlane-next-runtime-value-slice.md`
- [ ] `docs/superpowers/plans/2026-07-04-promptlane-runtime-id-inventory.json`
- [ ] `docs/superpowers/plans/2026-07-05-promptlane-95-quality-plan.md`
- [ ] `docs/superpowers/specs/2026-07-05-promptlane-repositioning-design.md`
- [ ] `.claude-plugin/` and `commands/` directories
- [ ] `plugins/` and `integrations/` directories
- [ ] `scripts/benchmark.mjs`
- [ ] `scripts/benchmark-runner.mjs`
- [ ] `scripts/benchmark-fixtures.mjs`
- [ ] `scripts/benchmark-scores.mjs`
- [ ] `scripts/agent-setup-smoke.mjs`
- [ ] `scripts/browser-e2e.mjs`
- [ ] `scripts/first-coach-loop-dogfood.mjs`
- [ ] `scripts/loop-memory-approval-dogfood.mjs`
- [ ] `scripts/hook-binary-smoke.mjs`
- [ ] `scripts/mcp-coach-loop-smoke.mjs`
- [ ] `scripts/mcp-elicitation-smoke.mjs`
- [ ] `scripts/mcp-native-dialog-approved.mjs`
- [ ] `scripts/mcp-native-dialog-preflight.mjs`
- [ ] `scripts/quality-95-evidence.mjs`
- [ ] `scripts/npm-publish-preflight.mjs`
- [ ] `scripts/package-install-smoke.mjs`
- [ ] `scripts/pack-dry-run.mjs`
- [ ] `scripts/quality-gate.mjs`
- [ ] `scripts/release-smoke.mjs`
- [ ] `scripts/ui-patrol.mjs`

Confirm `corepack pnpm pack:dry-run` uses the local wrapper:

- [ ] wrapper strips pnpm-only npm env before `npm pack`
- [ ] wrapper runs `npm pack --dry-run --ignore-scripts` after build

Confirm `corepack pnpm pack:dry-run` excludes:

- [ ] no `dist/**/*.map` files (source maps stay local-only)
- [ ] no `src/`, `node_modules/`, `coverage/`, `tests/`, `.github/`

## Security Regression

- [ ] Raw detected secrets are absent from Markdown under `mask` mode.
- [ ] Raw detected secrets are absent from SQLite prompt rows and FTS search results under `mask` mode.
- [ ] Raw prompt-body absolute paths are redacted from Markdown, SQLite, FTS, browser prompt APIs, export surfaces, import job summaries, and hook stdout/stderr.
- [ ] npm publish tokens (`npm_<36+ char>`) are masked in the privacy regression fixture across the same surfaces.
- [ ] `/api/v1/health` returns only `ok`, `version`, and a per-boot UUID
  `instance_id`; it does not return `data_dir` or any raw filesystem path.
- [ ] Hook wrappers record `last_ingest_status` even when `postPayload` throws, so `doctor` can surface the failure.
- [ ] `doctor --json` distinguishes recent `ready`, stale/never-seen
      `unverified`, and hard-failure `needs_attention` hook states.
- [ ] Adapter idempotency keys normalize the upstream `session_id` before hashing (Claude Code parity with Codex).
- [ ] Invalid payload values are not echoed in error responses.
- [ ] Hook wrappers fail open and do not write prompt text to stdout/stderr.
- [ ] Browser state-changing requests require same-origin session and CSRF protection.
- [ ] Ingest routes require bearer auth.
- [ ] Host, Origin, and cross-site browser request checks are enforced.
- [ ] Delete removes Markdown, prompt row, FTS row, redaction events, and related prompt metadata.
- [ ] Anonymized export jobs are invalidated when previewed prompt membership, deletion state, project policy versions, redaction version, or preview counts change.

## PRD2 Feature Regression

- [ ] Project list and policy toggle work in the web UI without exposing raw project paths.
- [ ] `capture_disabled` project policy blocks new ingest for that project.
- [ ] `capture_disabled` project policy skips matching import candidates for known projects.
- [ ] `promptlane import --dry-run --save-job` stores a raw-free job summary.
- [ ] `promptlane import --execute` imports prompt candidates and supports resume/idempotency.
- [ ] Imported-only filter works in CLI/API list flows.
- [ ] Prompt detail shows local analysis and a PromptLane improvement draft.
- [ ] PromptLane improvement drafts can be copied and saved without overwriting the original prompt.
- [ ] Export preview and execute work from both CLI and web UI.
- [ ] Benchmark v1 passes with `privacy_leak_count` equal to 0.
- [ ] Browser E2E passes on desktop and mobile viewport checks.

## Local Release Gate

- [ ] Node support matches `package.json#engines.node`.
- [ ] `corepack pnpm test`, `lint`, `build`, and `pack:dry-run` pass locally.
- [ ] `better-sqlite3` opens a database and supports WAL/FTS5 in local smoke.
- [ ] Platform support notes are accurate for the release.

## Manual Smoke

`corepack pnpm smoke:release` automates the core local smoke path below with an isolated temporary data directory and HOME.

- [ ] `promptlane init`
- [ ] `promptlane server`
- [ ] `promptlane install-hook claude-code --dry-run`
- [ ] `promptlane install-hook codex --dry-run`
- [ ] Capture one fixture-like Claude Code prompt.
- [ ] Capture one fixture-like Codex prompt.
- [ ] Confirm both prompts appear in CLI.
- [ ] Confirm both prompts appear in the web UI.
- [ ] Confirm PromptLane improvement draft copy/save works in the web UI.
- [ ] Confirm anonymized export preview and execution work.
- [ ] Confirm Benchmark v1 passes.
- [ ] Delete a prompt and confirm it disappears from CLI and web UI.

## Deferred For Broader Platform Claims

PromptLane 1.0.0 can publish from the local-first release gate above. Do not make broad platform claims before platform-specific smoke is complete:

- [ ] `better-sqlite3` install/open/WAL/FTS5 smoke on each claimed release platform.
- [ ] Hook install, doctor, MCP registration, and browser smoke on each claimed release platform.
