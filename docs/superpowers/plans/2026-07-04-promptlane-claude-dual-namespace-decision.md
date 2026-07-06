# PromptLane Claude Code Dual Namespace Decision

Historical naming note:

- Current product name: PromptLane.
- Current runtime id: `promptlane`.
- This document preserves an older PromptLane compatibility decision. See `docs/PROMPTLANE.md` for the active product contract.
- See `docs/PROMPTLANE-LEGACY-SURFACES.md` before adding or changing any PromptLane/`promptlane` surface.

**Date:** 2026-07-04
**Slice:** R3 Claude Code Dual Namespace Packaging
**Decision: defer**

## Context

R2 documented `/promptlane:*` as a future alias-only slash namespace while keeping
`/promptlane:*` available. R3 asked whether Claude Code can package both
namespaces now.

The current Claude Code plugin reference describes commands as plugin
components loaded from `commands/` or `skills/`, and the plugin manifest
`name` is the component namespace. The relevant reference is:

- https://code.claude.com/docs/en/plugins-reference

Claude Code plugin `name` is the namespace for packaged commands in the current
plugin model.

This means adding files such as `commands/promptlane-setup.md` under the current
`promptlane` plugin would not create `/promptlane:setup`. It would create another
command inside the existing plugin namespace instead, so it would not create
`/promptlane:*` and would make the migration harder to reason about.
In short, this would not create `/promptlane:*`.
The same problem applies to a `commands/promptlane-*.md` pattern.

## Decision

Do not add `/promptlane:*` command files yet.

`/promptlane:* remains required` for Claude Code plugin users. The package,
Claude Code plugin name, Codex plugin id, hook commands, and MCP server-name
examples stay on the current compatibility ids.

## Safe Future Paths

R3 can reopen only if one of these paths is chosen and proven with a fresh
failing test first:

- dual plugin package: ship a second Claude Code plugin identity named
  `promptlane` that aliases the same workflows while keeping `promptlane`
  installed and discoverable
- official namespace alias support: use a documented Claude Code mechanism that
  maps one plugin's commands into an additional namespace without changing the
  compatibility plugin id
- major rename window: rename the plugin id only after deprecation, rollback,
  marketplace, and saved-command migration gates are satisfied

## Acceptance Gate For Any Reopen

- keep `/promptlane:*` installed and documented
- prove `/promptlane:*` discovery with a Claude Code plugin smoke, not just file
  presence
- keep hook-sensitive command paths on `promptlane` unless a hook binary smoke
  proves a dual command path
- do not store or print prompt bodies, transcript text, compact summaries, raw
  paths, API tokens, or provider credentials
- update README, README.ko, docs/PLUGINS, package contents, and release notes
  in the same slice
