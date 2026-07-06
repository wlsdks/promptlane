# PromptLane Runtime Surfaces

Last updated: 2026-07-05

Product name: PromptLane.

Primary CLI command: `promptlane`.

Active slash namespace: `/promptlane:*`.

This document is the review guide for PromptLane product copy and `promptlane`
runtime identifiers. Product-facing copy should use PromptLane. Runtime command,
plugin command, MCP server name, data directory, and hook command surfaces should
use the existing `promptlane` identity unless a dedicated migration plan changes
that contract.

## Primary Surfaces

### Primary CLI Command

`package.json#bin.promptlane` points at the compiled CLI entrypoint.
README and package contents should present it as the primary command.

### MCP Compatibility Tool

MCP compatibility tool: `get_promptlane_status`.

This tool name is the archive readiness tool. Tool descriptions and result copy
should say PromptLane when they describe the product.

### Internal Runtime Types

Internal names such as `PromptLaneStatus`, `createPromptLaneStatus`, and related
tests may remain while they describe the existing loop status model. New
user-facing copy should use PromptLane as the product name and `promptlane` for
runtime identifiers.

### Historical Planning Docs

Historical planning docs under `docs/superpowers/plans/2026-07-04-promptlane-*`
and older sections in `docs/superpowers/specs/2026-07-04-agent-loop-memory-design.md`
may keep PromptLane wording when the document is preserving past decisions,
rejected plans, or migration history.

When historical docs are shipped, they must point readers to `docs/PROMPTLANE.md`
for the current product identity.

## Forbidden Surfaces

- Do not add alternate CLI aliases without a dedicated migration plan and release
  gate.
- Do not rename the package, primary CLI, hook command, MCP server name, data
  directory, or slash namespace away from `promptlane` without a dedicated
  migration plan and release gate.

## Review Rule

When a new `PromptLane` or `promptlane` string appears, classify it as one of:

1. primary CLI command
2. MCP compatibility tool
3. internal runtime type or test
4. historical planning doc
5. current product-facing copy

All five are allowed when they follow the naming boundary above.
