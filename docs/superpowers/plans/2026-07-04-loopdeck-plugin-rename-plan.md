# Loopdeck Plugin Rename Plan

**Date:** 2026-07-04
**Status:** Compatibility gate, not an implementation approval

## Decision

Loopdeck is the product name, but the current package name remains `prompt-coach`, the current primary CLI remains `prompt-coach`, and `loopdeck` is a compatibility-preserving CLI alias.

Claude Code slash commands remain `/prompt-coach:*` until this plan's gates are
met. Do not ship `/loopdeck:*` as the only namespace, do not remove existing
`/prompt-coach:*` commands, and do not rename the plugin id in the same slice as
ordinary product copy changes.

## Why This Needs A Separate Plan

Plugin identifiers and slash command namespaces are runtime contracts. They are
not just brand copy. Claude Code users may have command muscle memory, saved
docs, marketplace install state, and team onboarding snippets that reference
`/prompt-coach:*`. Codex users may have the repo-local plugin installed from
`plugins/prompt-coach` and hooks that execute the `prompt-coach` binary.

A direct rename would risk breaking the exact agent surfaces Loopdeck needs to
be trusted by: setup, capture hooks, MCP registration, status checks, and local
review workflows.

## Current Compatibility Contract

- `package.json#name` stays `prompt-coach`.
- `package.json#bin.prompt-coach` stays the primary compatibility command.
- `package.json#bin.loopdeck` stays an alias to the same compiled CLI entrypoint.
- `.claude-plugin/plugin.json#name` stays `prompt-coach`.
- Claude Code command docs stay under `commands/*.md` and remain installed as
  `/prompt-coach:*`.
- `plugins/prompt-coach/.codex-plugin/plugin.json#name` stays `prompt-coach`.
- Codex hooks keep calling `prompt-coach hook codex` unless a later compatibility
  slice proves a dual command path.
- Claude Code hooks keep calling `prompt-coach hook claude-code` unless a later
  compatibility slice proves a dual command path.
- MCP examples keep the server name `prompt-coach` during this migration.

## Rename Phases

### Phase 1: Observe compatibility

Keep the current ids stable and collect evidence that the Loopdeck product name
is understandable without changing runtime ids. This phase is the current state.

Required evidence:

- README and plugin docs explain the product name and the `prompt-coach` runtime
  ids.
- `loopdeck` manual CLI alias works while `prompt-coach` remains primary.
- Packaging tests lock package, plugin, command, hook, and docs compatibility.
- Fresh install smoke proves `prompt-coach setup --profile coach --register-mcp`
  still works from the published package shape.

### Phase 2: Add dual namespace aliases

Add `/loopdeck:*` only as aliases, not replacements. Every new Loopdeck slash
command must route to the same local CLI or MCP workflow as its
`/prompt-coach:*` equivalent.

Required evidence:

- Both `/prompt-coach:setup` and `/loopdeck:setup` are documented.
- Both old and new command docs install from the Claude Code marketplace.
- Codex plugin metadata can advertise Loopdeck while keeping
  `plugins/prompt-coach` install compatibility.
- Hook commands still work when only `prompt-coach` is on `PATH`.
- Hook commands also work when only the `loopdeck` alias is on `PATH`, if that
  behavior is explicitly implemented.

### Phase 3: Deprecate old namespace

Only after Phase 2 has real usage evidence, mark `/prompt-coach:*` as
deprecated in docs while keeping it functional.

Required evidence:

- Release notes announce the deprecation window.
- README.md, docs/PLUGINS.md, `.claude-plugin/plugin.json`,
  `plugins/prompt-coach/.codex-plugin/plugin.json`, and `commands/*.md` are
  updated together.
- CI verifies both namespaces still work.
- Support docs explain how to migrate saved slash command snippets.

### Phase 4: Remove only after a major/versioned window

Remove old ids only after a major release or clearly versioned compatibility
window. This must be a breaking-change release with explicit rollback guidance.

Required evidence:

- No supported install path still depends on `/prompt-coach:*`.
- Fresh install smoke passes for the new namespace.
- Upgrade smoke passes from a version that still used `/prompt-coach:*`.
- Docs have no stale old-namespace examples except in migration notes.

## Acceptance Gates Before Any Runtime Rename

- `pnpm test`, `pnpm lint`, `pnpm build`, `pnpm pack:dry-run`, and
  `git diff --check` pass.
- Packaging tests cover `package.json`, `.claude-plugin/plugin.json`,
  `plugins/prompt-coach/.codex-plugin/plugin.json`, `commands/*.md`,
  `README.md`, and `docs/PLUGINS.md`.
- fresh install smoke proves the package installs the expected binaries and
  plugin files.
- Codex plugin smoke proves the repo-local plugin loads, the fail-open prompt
  hook runs, and no secret or prompt body is printed.
- Claude Code plugin smoke proves marketplace install, slash command discovery,
  and setup/status commands work.
- Hook compatibility is checked for every hook marker that currently references
  `prompt-coach`.
- MCP server name compatibility is checked before any server-name rename.
- Release notes state whether this is alias-only, deprecated, or breaking.

## Files That Must Move Together

- `package.json`
- `.claude-plugin/plugin.json`
- `.claude-plugin/marketplace.json`
- `plugins/prompt-coach/.codex-plugin/plugin.json`
- `plugins/prompt-coach/skills/prompt-coach/SKILL.md`
- `commands/*.md`
- `README.md`
- `README.ko.md`
- `docs/PLUGINS.md`
- `docs/PACKAGE_CONTENTS.md`
- packaging tests in `src/packaging/plugin-files.test.ts`

## Explicit Non-Goals For The Current Slice

- No `/loopdeck:*` slash commands.
- No npm package rename.
- No removal of the `prompt-coach` binary.
- No plugin id rename.
- No hook marker rename.
- No MCP server name rename.
- No hidden external LLM or hosted migration service.

## First Implementable Slice After This Plan

If rename work becomes urgent, start with a pure docs/test slice that adds
alias-only command docs while keeping every `/prompt-coach:*` command intact.
Only then add implementation for dual namespace aliases, and only after a RED
test proves both old and new namespaces are packaged.
