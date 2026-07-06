# PromptLane Plugin Rename Plan

Historical naming note:

- Current product name: PromptLane.
- Current runtime id: `promptlane`.
- This document preserves an older PromptLane compatibility decision. See `docs/PROMPTLANE.md` for the active product contract.
- See `docs/PROMPTLANE-LEGACY-SURFACES.md` before adding or changing any PromptLane/`promptlane` surface.

**Date:** 2026-07-04
**Status:** Compatibility gate, not an implementation approval

## Decision

PromptLane is the product name, but the current package name remains `promptlane`, the current primary CLI remains `promptlane`, and `promptlane` is a compatibility-preserving CLI alias.

Claude Code slash commands remain `/promptlane:*` until this plan's gates are
met. Do not ship `/promptlane:*` as the only namespace, do not remove existing
`/promptlane:*` commands, and do not rename the plugin id in the same slice as
ordinary product copy changes.

## Why This Needs A Separate Plan

Plugin identifiers and slash command namespaces are runtime contracts. They are
not just brand copy. Claude Code users may have command muscle memory, saved
docs, marketplace install state, and team onboarding snippets that reference
`/promptlane:*`. Codex users may have the repo-local plugin installed from
`plugins/promptlane` and hooks that execute the `promptlane` binary.

A direct rename would risk breaking the exact agent surfaces PromptLane needs to
be trusted by: setup, capture hooks, MCP registration, status checks, and local
review workflows.

## Current Compatibility Contract

- `package.json#name` stays `promptlane`.
- `package.json#bin.promptlane` stays the primary compatibility command.
- `package.json#bin.promptlane` stays an alias to the same compiled CLI entrypoint.
- `.claude-plugin/plugin.json#name` stays `promptlane`.
- Claude Code command docs stay under `commands/*.md` and remain installed as
  `/promptlane:*`.
- `plugins/promptlane/.codex-plugin/plugin.json#name` stays `promptlane`.
- Codex hooks keep calling `promptlane hook codex` unless a later compatibility
  slice proves a dual command path.
- Claude Code hooks keep calling `promptlane hook claude-code` unless a later
  compatibility slice proves a dual command path.
- MCP examples keep the server name `promptlane` during this migration.

## Rename Phases

### Phase 1: Observe compatibility

Keep the current ids stable and collect evidence that the PromptLane product name
is understandable without changing runtime ids. This phase is the current state.

Required evidence:

- README and plugin docs explain the product name and the `promptlane` runtime
  ids.
- `promptlane` manual CLI alias works while `promptlane` remains primary.
- Packaging tests lock package, plugin, command, hook, and docs compatibility.
- Fresh install smoke proves `promptlane setup --profile coach --register-mcp`
  still works from the published package shape.

### Phase 2: Add dual namespace aliases

Add `/promptlane:*` only as aliases, not replacements. Every new PromptLane slash
command must route to the same local CLI or MCP workflow as its
`/promptlane:*` equivalent.

Required evidence:

- Both `/promptlane:setup` and `/promptlane:setup` are documented.
- Both old and new command docs install from the Claude Code marketplace.
- Codex plugin metadata can advertise PromptLane while keeping
  `plugins/promptlane` install compatibility.
- Hook commands still work when only `promptlane` is on `PATH`.
- Hook commands also work when only the `promptlane` alias is on `PATH`, if that
  behavior is explicitly implemented.

### Phase 3: Deprecate old namespace

Only after Phase 2 has real usage evidence, mark `/promptlane:*` as
deprecated in docs while keeping it functional.

Required evidence:

- Release notes announce the deprecation window.
- README.md, docs/PLUGINS.md, `.claude-plugin/plugin.json`,
  `plugins/promptlane/.codex-plugin/plugin.json`, and `commands/*.md` are
  updated together.
- CI verifies both namespaces still work.
- Support docs explain how to migrate saved slash command snippets.

### Phase 4: Remove only after a major/versioned window

Remove old ids only after a major release or clearly versioned compatibility
window. This must be a breaking-change release with explicit rollback guidance.

Required evidence:

- No supported install path still depends on `/promptlane:*`.
- Fresh install smoke passes for the new namespace.
- Upgrade smoke passes from a version that still used `/promptlane:*`.
- Docs have no stale old-namespace examples except in migration notes.

## Acceptance Gates Before Any Runtime Rename

- `pnpm test`, `pnpm lint`, `pnpm build`, `pnpm pack:dry-run`, and
  `git diff --check` pass.
- Packaging tests cover `package.json`, `.claude-plugin/plugin.json`,
  `plugins/promptlane/.codex-plugin/plugin.json`, `commands/*.md`,
  `README.md`, and `docs/PLUGINS.md`.
- fresh install smoke proves the package installs the expected binaries and
  plugin files.
- Codex plugin smoke proves the repo-local plugin loads, the fail-open prompt
  hook runs, and no secret or prompt body is printed.
- Claude Code plugin smoke proves marketplace install, slash command discovery,
  and setup/status commands work.
- Hook compatibility is checked for every hook marker that currently references
  `promptlane`.
- MCP server name compatibility is checked before any server-name rename.
- Release notes state whether this is alias-only, deprecated, or breaking.

## Files That Must Move Together

- `package.json`
- `.claude-plugin/plugin.json`
- `.claude-plugin/marketplace.json`
- `plugins/promptlane/.codex-plugin/plugin.json`
- `plugins/promptlane/skills/promptlane/SKILL.md`
- `commands/*.md`
- `README.md`
- `README.ko.md`
- `docs/PLUGINS.md`
- `docs/PACKAGE_CONTENTS.md`
- packaging tests in `src/packaging/plugin-files.test.ts`

## Explicit Non-Goals For The Current Slice

- No `/promptlane:*` slash commands.
- No npm package rename.
- No removal of the `promptlane` binary.
- No plugin id rename.
- No hook marker rename.
- No MCP server name rename.
- No hidden external LLM or hosted migration service.

## First Implementable Slice After This Plan

If rename work becomes urgent, start with a pure docs/test slice that adds
alias-only command docs while keeping every `/promptlane:*` command intact.
Only then add implementation for dual namespace aliases, and only after a RED
test proves both old and new namespaces are packaged.
