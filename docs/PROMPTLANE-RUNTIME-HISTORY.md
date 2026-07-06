# PromptLane Legacy Decision

Last updated: 2026-07-05

PromptLane is not the primary product name. It was rejected after review because
it made the product sound like a dedicated loop-engineering surface. The active
product name is PromptLane.

PromptLane remains only as historical terminology and a compatibility CLI alias
while the current npm package, primary CLI, hook command, Claude Code slash
namespace, and canonical MCP server name stay `promptlane`.

## Current Product Contract

Use `docs/PROMPTLANE.md` for current product identity, positioning, runtime
compatibility, privacy boundaries, and migration sequencing.

Use `docs/PROMPTLANE-LEGACY-SURFACES.md` for the allowlist of remaining
PromptLane/`promptlane` strings and the review rule for new occurrences.

## Legacy Runtime Notes

- `promptlane` may still appear as a CLI alias for existing manual terminal
  workflows.
- Existing loop snapshot/schema docs may still use PromptLane wording until their
  own migration slices update them.
- `/promptlane:*` is not shipped as an active slash-command namespace.
- Do not re-promote PromptLane in README, package metadata, plugin metadata, or
  new product-facing docs.

## Preserved Runtime IDs

These values are still compatibility IDs, not product names:

- npm package: `promptlane`
- primary CLI: `promptlane`
- hook command: `promptlane hook ...`
- canonical MCP server name: `promptlane`
- Claude Code slash namespace: `/promptlane:*`
- data directory: `~/.promptlane`
