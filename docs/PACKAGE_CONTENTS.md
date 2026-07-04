# Package Contents

This document describes what should be included when `prompt-coach` is
published to npm.

Check the current package with:

```sh
npm pack --dry-run --json
```

## Included

The npm package intentionally includes:

- `dist/cli`: the compiled `prompt-coach` CLI entrypoint, the loopdeck alias
  that points at the same binary, plus experimental `pc-claude` and
  `pc-codex` wrapper entrypoints
- `dist/server`: the compiled local Fastify server and web API
- `dist/web`: the compiled React web UI assets
- `dist/storage`, `dist/analysis`, `dist/hooks`, `dist/importer`,
  `dist/exporter`, and related runtime modules
- `README.md`, `README.ko.md`, `CHANGELOG.md`, `LICENSE`, `SECURITY.md`,
  `CONTRIBUTING.md`, `CODE_OF_CONDUCT.md`, and `SUPPORT.md`
- public product and release docs under `docs/`
  - includes `docs/LEGAL_USAGE_GUIDE.md` so users can inspect the provider
    documentation boundary for agent-judge mode
  - includes `docs/superpowers/plans/2026-07-04-loopdeck-plugin-rename-plan.md`
    so package-local README and plugin docs can link to the compatibility gate
  - includes `docs/superpowers/plans/2026-07-04-loopdeck-plugin-rename-issue-slices.md`
    and `docs/superpowers/plans/2026-07-04-loopdeck-runtime-id-inventory.json`
    so rename work starts from shippable slices and a machine-checkable runtime
    id inventory
  - includes `docs/superpowers/plans/2026-07-04-loopdeck-claude-dual-namespace-decision.md`
    so the package records why `/loopdeck:*` command files are deferred until a
    real Claude Code namespace alias path is proven
  - includes `docs/superpowers/plans/2026-07-04-loopdeck-mcp-server-name-decision.md`
    so the package records why `prompt-coach` remains the canonical MCP server
    name during the Loopdeck migration
  - includes `docs/superpowers/plans/2026-07-04-loopdeck-deprecation-readiness.md`
    so future rename work has release-note, support, rollback, and upgrade-smoke
    gates before any old id is deprecated
- Claude Code plugin artifacts under `.claude-plugin`, `commands`, and
  `integrations/claude-code`
- Codex plugin artifacts under `plugins/prompt-coach`
- local verification scripts: `scripts/benchmark.mjs`,
  `scripts/browser-e2e.mjs`, `scripts/hook-binary-smoke.mjs`,
  `scripts/mcp-elicitation-smoke.mjs`,
  `scripts/mcp-native-dialog-preflight.mjs`, `scripts/quality-gate.mjs`, and
  `scripts/release-smoke.mjs`

## Excluded

The npm package should not include:

- source TypeScript files under `src/`
- test fixtures under `tests/`
- GitHub workflow and issue template files under `.github/`
- local runtime data such as `.prompt-coach/`, SQLite databases, logs,
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
