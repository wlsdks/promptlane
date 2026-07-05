# Loopdeck Deprecation Readiness

Historical naming note:

- Current product name: PromptLane.
- Current runtime id: `prompt-coach`.
- This document preserves an older Loopdeck compatibility decision. See `docs/PROMPTLANE.md` for the active product contract.
- See `docs/LOOPDECK-LEGACY-SURFACES.md` before adding or changing any Loopdeck/`loopdeck` surface.

**Date:** 2026-07-04
**Slice:** R7 Deprecation Window Readiness
**Decision: not deprecated**

## Current Position

`prompt-coach` remains the compatibility runtime id. The product-facing name is
Loopdeck, but `/prompt-coach:* remains supported`, the npm package name remains
`prompt-coach`, the Claude Code plugin name remains `prompt-coach`, the Codex
plugin id remains `prompt-coach`, hook commands keep `prompt-coach hook ...`,
and the canonical MCP server name remains `prompt-coach`.

Do not show a deprecation banner yet. Do not remove the old namespace. Do not
tell users they must migrate saved slash command snippets yet.

## Alias-only release note template

Use this only when an alias is added while every old id remains supported:

> Loopdeck now includes an additional alias for `<surface>`. Existing
> `prompt-coach` commands, `/prompt-coach:*` slash commands, plugin ids, hook
> commands, and MCP server registrations keep working. No migration is required.

Required evidence:

- Fresh install smoke passes.
- Upgrade smoke from the previous release passes.
- Docs show old and new paths as aliases, not replacements.
- Rollback by ignoring the alias leaves the old path working.

## Deprecation release note template

Use this only after minimum evidence before deprecation is satisfied:

> `<old-surface>` is now deprecated but still functional. Use `<new-surface>`
> for new setup. Existing saved snippets continue to work during the announced
> deprecation window.

Required evidence:

- Alias-only release has shipped and passed CI for at least one release window.
- Support docs include saved slash command snippets migration guidance.
- Claude Code plugin smoke proves both old and new command namespaces are
  discoverable when the new namespace exists.
- Codex plugin smoke proves the old plugin id still installs.
- Hook binary smoke proves old hook commands remain fail-open and secret-free.
- MCP server-name decision confirms whether a new server-name alias exists.
- Release notes state rollback steps.

## Breaking release note template

Use this only for a major/versioned breaking-change release:

> `<old-surface>` has been removed after the announced deprecation window.
> Follow the migration guide to use `<new-surface>`.

Required evidence:

- No supported install path still depends on the old id.
- Upgrade smoke passes from the last deprecated release.
- Rollback guidance names the last compatible version.
- Support docs identify how to recover saved slash command snippets.
- CI proves package, Claude Code plugin, Codex plugin, hook, MCP, and docs
  surfaces are internally consistent.

## Support guidance for saved slash command snippets

Before any deprecation banner, support docs must say:

- saved `/prompt-coach:*` snippets keep working
- new `/loopdeck:*` snippets are optional only after a real alias namespace ships
- users should not bulk-rewrite snippets until the alias is smoke-tested
- rollback is to keep or restore `/prompt-coach:*`

## Minimum evidence before deprecation

Do not mark `/prompt-coach:*`, plugin ids, hook commands, or MCP server names as
deprecated until all of these are true:

- alias-only implementation exists for that exact surface
- telemetry or issue evidence shows the alias path is discoverable enough for
  real users
- fresh install, upgrade smoke, and rollback smoke pass
- support docs cover saved snippets and old configuration
- release notes clearly classify the change as alias-only, deprecation, or
  breaking

## Rollback and upgrade smoke

Rollback smoke:

- keep existing `prompt-coach` CLI, `/prompt-coach:*`, plugin ids, hook commands,
  and MCP server names functional after ignoring any new alias
- verify no prompt body, transcript, compact summary, raw path, API token, or
  provider credential is printed

Upgrade smoke:

- install from the previous compatibility release
- upgrade to the candidate release
- verify old commands still work
- verify any new alias works only if that alias shipped in the release
- verify docs and release notes match the observed behavior
