# PromptLane Plugin Rename Issue Slices

Historical naming note:

- Current product name: PromptLane.
- Current runtime id: `promptlane`.
- This document preserves an older PromptLane compatibility decision. See `docs/PROMPTLANE.md` for the active product contract.
- See `docs/PROMPTLANE-LEGACY-SURFACES.md` before adding or changing any PromptLane/`promptlane` surface.

**Date:** 2026-07-04
**Parent plan:** `docs/superpowers/plans/2026-07-04-promptlane-plugin-rename-plan.md`
**Status:** Implementation slicing plan, not approval to rename runtime ids

## Purpose

Break the PromptLane plugin rename plan into independently shippable issues that
protect Claude Code, Codex, hooks, MCP, and npm packaging compatibility. Each
slice must keep the current `promptlane` runtime ids working until a later
phase has explicit compatibility evidence.

## Global Invariants

- Do not remove `/promptlane:*`.
- Do not rename `package.json#name`.
- Do not rename plugin ids.
- Do not remove the `promptlane` binary.
- Do not rename MCP server examples without an MCP compatibility decision.
- Do not change hook commands unless a hook binary compatibility smoke proves
  both old and new command paths.
- Do not store or print prompt body, transcript text, compact summary, raw cwd,
  raw repository paths, API tokens, or provider credentials.
- Each implementation slice needs TDD proof: RED test output before the change,
  GREEN focused output after the change, and the full repo gate before merge.

## Shared Acceptance Gates

Every rename slice must include:

- `pnpm test`
- `pnpm lint`
- `pnpm build`
- `pnpm pack:dry-run`
- `git diff --check`
- Fresh install smoke for packaged files and binaries touched by the slice
- Codex plugin smoke when `plugins/promptlane/**` or hook metadata changes
- Claude Code plugin smoke when `.claude-plugin/**` or `commands/*.md` changes
- release-note classification: alias-only, deprecation, or breaking

## Slice R1: Compatibility Inventory Gate

Goal: create a machine-checkable inventory of runtime ids before any alias or
rename implementation.

Scope:

- inventory `package.json#name`
- inventory `package.json#bin.promptlane`
- inventory `package.json#bin.promptlane`
- inventory `.claude-plugin/plugin.json#name`
- inventory `plugins/promptlane/.codex-plugin/plugin.json#name`
- inventory command docs under `commands/*.md`
- inventory hook install examples under README, plugin docs, and setup command
  docs
- inventory MCP server-name examples in README and plugin docs

TDD proof:

- RED: packaging test fails because the inventory artifact does not exist or
  misses at least one runtime id surface.
- GREEN: inventory artifact exists and all current surfaces are covered.

Acceptance:

- no runtime id changes
- no command alias behavior changes
- inventory is included in npm package files only if it becomes user-facing

## Slice R2: Alias-Only Command Docs

Goal: document `/promptlane:*` as a future alias namespace without installing or
shipping it as the only namespace.

Scope:

- add docs that define `/promptlane:*` as alias-only and optional
- keep every `/promptlane:*` command documented
- add migration notes explaining that existing Claude Code users do not need to
  change saved slash commands
- update README, README.ko, docs/PLUGINS, and command docs together

TDD proof:

- RED: packaging docs test fails because alias-only docs do not mention both
  `/promptlane:*` and `/promptlane:*`.
- GREEN: docs include both namespaces and explicitly say alias-only.

Acceptance:

- Do not remove `/promptlane:*`.
- Do not add new command files that shadow old commands yet.
- Claude Code plugin smoke proves old commands remain discoverable.

## Slice R3: Claude Code Dual Namespace Packaging Decision

Goal: decide whether `/promptlane:*` command aliases can be packaged for Claude
Code while keeping `/promptlane:*` commands intact.

Scope:

- check the current Claude Code plugin namespace model before adding files
- document whether command-file aliases can actually create `/promptlane:*`
- define safe future paths for dual plugin package, official namespace alias
  support, or a later major rename window
- keep command bodies and manifest unchanged unless a fresh RED test proves a
  real alias path exists

TDD proof:

- RED: packaging test fails because the R3 decision artifact does not exist.
- GREEN: decision artifact documents why current `commands/promptlane-*.md` files
  would not create `/promptlane:*`, keeps `/promptlane:*` required, and names the
  allowed future paths.

Acceptance:

- Do not add `/promptlane:*` command files unless Claude Code plugin smoke can
  prove both namespaces are discoverable.
- `promptlane` binary remains the command used in hook-sensitive paths unless
  a later hook slice proves otherwise.
- R3 may end as "defer" if the current official namespace model cannot support
  alias-only commands without a second plugin identity or plugin id rename.

## Slice R4: Codex Plugin Display Rename Without ID Rename

Goal: make Codex-facing copy say PromptLane while preserving install path and
plugin id compatibility.

Scope:

- update user-facing display copy in `plugins/promptlane/**`
- keep `plugins/promptlane/.codex-plugin/plugin.json#name` as `promptlane`
  unless a later major rename slice approves an id change
- keep setup-installed hook command compatibility
- update Codex plugin docs and smoke instructions

TDD proof:

- RED: packaging test fails because display copy lacks PromptLane or because id
  compatibility is not asserted.
- GREEN: display copy uses PromptLane and id compatibility stays locked.

Acceptance:

- Codex plugin smoke proves repo-local plugin load works.
- fail-open hook still runs without printing prompt body, raw path, or secrets.

## Slice R5: Hook Binary Compatibility Smoke

Goal: decide whether hooks can safely call `promptlane` as a fallback while
keeping `promptlane` primary.

Scope:

- add smoke coverage for `promptlane hook codex`
- add smoke coverage for `promptlane hook claude-code`
- optionally add `promptlane hook ...` smoke only after binary alias behavior is
  proven from packaged output
- document fallback order and failure behavior

TDD proof:

- RED: smoke test fails because only one binary path is covered.
- GREEN: hook smoke proves the approved binary paths are present and fail-open.

Acceptance:

- no hook command switches to `promptlane` as the only command
- hook stdout/stderr never prints prompt body, raw path, or secrets
- Fresh install smoke covers packaged bin permissions

## Slice R6: MCP Server Name Compatibility Decision

Goal: decide whether `promptlane` should become an MCP server alias or stay
documentation-only during the compatibility window.

Scope:

- inventory README, README.ko, docs/PLUGINS, setup output, and CLI examples
- define whether `promptlane` remains the canonical MCP server name
- if adding alias docs, make the alias explicit and non-breaking
- update doctor/setup tests only after RED proves the current guidance is
  insufficient

TDD proof:

- RED: tests fail because MCP name compatibility decision is missing from setup
  or docs.
- GREEN: docs/setup output state the canonical name and any alias behavior.

Acceptance:

- MCP server name compatibility is checked before any server-name rename.
- no hidden hosted service, provider credential proxy, or external LLM call

## Slice R7: Deprecation Window Readiness

Goal: prepare deprecation evidence without deprecating old namespace early.

Scope:

- draft release-note template for alias-only, deprecation, and breaking phases
- draft support guidance for saved slash command snippets
- define minimum usage/evidence needed before marking `/promptlane:*`
  deprecated
- define rollback and upgrade smoke requirements

TDD proof:

- RED: release/support docs test fails because deprecation readiness lacks
  evidence gates.
- GREEN: docs include deprecation evidence gates and rollback language.

Acceptance:

- no deprecation banner is shown to users yet
- no old command namespace is removed
- breaking-change language is isolated to future release planning

## Execution Order

1. Slice R1: Compatibility Inventory Gate
2. Slice R2: Alias-Only Command Docs
3. Slice R3: Claude Code Dual Namespace Packaging Decision
4. Slice R4: Codex Plugin Display Rename Without ID Rename
5. Slice R5: Hook Binary Compatibility Smoke
6. Slice R6: MCP Server Name Compatibility Decision
7. Slice R7: Deprecation Window Readiness

R3 through R7 can be delayed independently. Do not merge a later slice if it
requires removing or weakening an earlier compatibility invariant.
