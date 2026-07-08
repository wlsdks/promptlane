# Package Contents

This document describes what should be included when `promptlane` is
published to npm.

Check the current package with:

```sh
corepack pnpm pack:dry-run
```

For machine-readable package inspection after the build already exists, skip
lifecycle scripts so npm does not interleave build logs with JSON:

```sh
corepack pnpm build
npm pack --dry-run --json --ignore-scripts
```

## Included

The npm package intentionally includes:

- `dist/cli`: the compiled `promptlane` CLI entrypoint plus experimental
  `pl-claude` and `pl-codex` wrapper entrypoints
- `dist/server`: the compiled local Fastify server and web API
- `dist/web`: the compiled React web UI assets
- `dist/storage`, `dist/analysis`, `dist/hooks`, `dist/importer`,
  `dist/exporter`, and related runtime modules
- `README.md`, `README.ko.md`, `CHANGELOG.md`, `LICENSE`, `SECURITY.md`,
  `CONTRIBUTING.md`, `CODE_OF_CONDUCT.md`, and `SUPPORT.md`
- public product and release docs under `docs/`
  - includes `docs/LEGAL_USAGE_GUIDE.md` so users can inspect the provider
    documentation boundary for agent-judge mode
  - includes `docs/PROMPTLANE.md`, `docs/PROMPTLANE-RUNTIME-HISTORY.md`,
    `docs/PROMPTLANE-LEGACY-SURFACES.md`, and `docs/LOOP-SNAPSHOT-SCHEMA.md` so
    installed users can inspect the active PromptLane product contract, the
    PromptLane legacy decision, the remaining legacy surface allowlist, and the
    loop snapshot privacy schema
  - includes `docs/AGENT-HARNESS.md` and `docs/INSTRUCTION-FILES.md` so
    installed plugin and CLI users can inspect the Codex/Claude Code harness
    contract and instruction-file layering rules without cloning the repo
  - includes `docs/DOGFOOD_CODEX_CLAUDE_2026-07-05.md` and
    `docs/DOGFOOD_WEB_USER_FLOW_2026-07-05.md` so package users can inspect
    repeatable Codex/Claude Code integration and web user-flow evidence
  - includes `docs/superpowers/plans/2026-07-04-promptlane-plugin-rename-plan.md`
    so package-local README and plugin docs can link to the compatibility gate
  - includes `docs/superpowers/plans/2026-07-04-promptlane-plugin-rename-issue-slices.md`
    and `docs/superpowers/plans/2026-07-04-promptlane-runtime-id-inventory.json`
    so rename work starts from shippable slices and a machine-checkable runtime
    id inventory
  - includes `docs/superpowers/plans/2026-07-04-promptlane-claude-dual-namespace-decision.md`
    so the package records why `/promptlane:*` command files are deferred until a
    real Claude Code namespace alias path is proven
  - includes `docs/superpowers/plans/2026-07-04-promptlane-mcp-server-name-decision.md`
    so the package records why `promptlane` remains the canonical MCP server
    name during the PromptLane compatibility window
  - includes `docs/superpowers/plans/2026-07-04-promptlane-deprecation-readiness.md`
    so future rename work has release-note, support, rollback, and upgrade-smoke
    gates before any old id is deprecated
- Claude Code plugin artifacts under `.claude-plugin`, `commands`, and
  `integrations/claude-code`
- Codex plugin artifacts under `plugins/promptlane`
- local verification scripts:
  - `scripts/benchmark.mjs`
  - `scripts/benchmark-runner.mjs`
  - `scripts/benchmark-fixtures.mjs`
  - `scripts/agent-setup-smoke.mjs`
  - `scripts/browser-e2e.mjs`
  - `scripts/first-coach-loop-dogfood.mjs`
  - `scripts/loop-memory-approval-dogfood.mjs`
  - `scripts/hook-binary-smoke.mjs`
  - `scripts/mcp-coach-loop-smoke.mjs`
  - `scripts/mcp-elicitation-smoke.mjs`
  - `scripts/mcp-native-dialog-approved.mjs`
  - `scripts/mcp-native-dialog-preflight.mjs`
  - `scripts/quality-95-evidence.mjs`
  - `scripts/npm-publish-preflight.mjs`
  - `scripts/package-install-smoke.mjs`
  - `scripts/pack-dry-run.mjs`
  - `scripts/quality-gate.mjs`
  - `scripts/release-smoke.mjs`
  - `scripts/ui-patrol.mjs`

## Excluded

The npm package should not include:

- source TypeScript files under `src/`
- test fixtures under `tests/`
- GitHub workflow and issue template files under `.github/`
- local runtime data such as `.promptlane/`, SQLite databases, logs,
  spool files, quarantine files, and prompt archives
- environment files such as `.env`
- local package artifacts such as `*.tgz`
- dependency folders such as `node_modules/`
- editor, OS, browser report, and temporary cache files

## Privacy Boundary

The package must not contain real prompts, real credentials, personal machine
paths, local prompt archives, or private database files. Release scripts may
contain synthetic fixtures such as `/Users/example` and fake API-key-shaped
strings to test redaction behavior.

## Source Maps

The build emits `.map` files inside `dist/` so that local development can step
through compiled output. These maps are excluded from the published tarball
through a `!dist/**/*.map` entry in `package.json#files` because end users of
the CLI do not need them, and the saved bytes (~1 MB unpacked, ~75 files)
shrink every install. The maps that stay in `dist/` for local debugging must
not contain private paths, credentials, or local data.
