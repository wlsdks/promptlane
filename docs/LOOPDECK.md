# Loopdeck Legacy Decision

Last updated: 2026-07-05

Loopdeck is not the primary product name. It was rejected after review because
it made the product sound like a dedicated loop-engineering surface. The active
product name is PromptLane.

Loopdeck remains only as historical terminology and a compatibility CLI alias
while the current npm package, primary CLI, hook command, Claude Code slash
namespace, and canonical MCP server name stay `prompt-coach`.

## Current Product Contract

Use `docs/PROMPTLANE.md` for current product identity, positioning, runtime
compatibility, privacy boundaries, and migration sequencing.

## Legacy Runtime Notes

- `loopdeck` may still appear as a CLI alias for existing manual terminal
  workflows.
- Existing loop snapshot/schema docs may still use Loopdeck wording until their
  own migration slices update them.
- `/loopdeck:*` is not shipped as an active slash-command namespace.
- Do not re-promote Loopdeck in README, package metadata, plugin metadata, or
  new product-facing docs.

## Preserved Runtime IDs

These values are still compatibility IDs, not product names:

- npm package: `prompt-coach`
- primary CLI: `prompt-coach`
- hook command: `prompt-coach hook ...`
- canonical MCP server name: `prompt-coach`
- Claude Code slash namespace: `/prompt-coach:*`
- data directory: `~/.prompt-coach`
