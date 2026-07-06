# Instruction Files

Last updated: 2026-07-05

This document defines how PromptLane uses project instruction files for Codex,
Claude Code, and other coding agents.

## Source Of Truth

`AGENTS.md` is the cross-agent source of truth for this repository.

Use it for:

- product identity and compatibility boundaries
- routing to deeper docs
- core privacy and local-first invariants
- architecture boundaries
- verification gates
- git workflow

Do not use it for:

- long product specs
- generated loop briefs
- one-off session notes
- duplicated Claude Code details
- raw prompts, transcript excerpts, compact summaries, tokens, or raw local paths

`CLAUDE.md` is Claude Code specific.

Use it for:

- "read AGENTS.md first" guidance
- Claude Code hook/stdout cautions
- plugin/slash command namespace expectations
- Claude-specific MCP and native-dialog verification notes

Do not copy the whole AGENTS.md content into CLAUDE.md. Duplication creates
drift and wastes agent context.

## Layering Rules

Keep repo-level instruction files short and route deeper work to docs:

- Product planning: `docs/PROMPTLANE.md`, `docs/superpowers/specs/2026-07-05-promptlane-repositioning-design.md`
- Legacy naming surfaces: `docs/PROMPTLANE.md`, `docs/PROMPTLANE-LEGACY-SURFACES.md`
- Current operational queue: `docs/NEXT_BACKLOG.md`
- Harness details: `docs/AGENT-HARNESS.md`
- Architecture: `docs/ARCHITECTURE.md`
- UI system: `DESIGN.md`
- Plugin and adapter details: `docs/PLUGINS.md`, `docs/ADAPTERS.md`

Add nested instruction files only when a subdirectory has durable rules that do
not apply elsewhere. Prefer routing comments in root `AGENTS.md` before adding
more files.

## When To Update AGENTS.md

Update `AGENTS.md` when one of these is true:

- an agent repeats the same repo-specific mistake
- a recurring review comment should become a durable rule
- the authoritative verification command changes
- a compatibility boundary changes, such as package name, CLI alias, plugin id,
  hook command, slash namespace, or MCP server name
- a privacy invariant gains a new runtime surface

Do not update `AGENTS.md` for temporary task state. Use `tasks/todo.md` or a
design/plan doc instead.

## PromptLane Memory And Patch Proposals

PromptLane may propose instruction changes from approved loop memories, but the
proposal path must stay review-first.

Allowed:

- generate a unified diff
- show a copyable apply command
- call a confirmed CLI/MCP apply path
- record that a user-approved memory informed the proposal

Not allowed:

- silently editing AGENTS.md, CLAUDE.md, or project docs
- accepting failed or unevidenced loop outcomes as durable memory
- writing raw prompt bodies, raw paths, transcripts, compact summaries, or
  provider data into instruction files
- using hidden external LLM calls to rewrite instruction files

## Size And Context Budget

Keep `AGENTS.md` concise. Codex and other agents may enforce project instruction
size limits, and long instruction files reduce useful working context.

Practical rule:

- Put rules that must apply on every task in `AGENTS.md`.
- Put detailed rationale and examples in `docs/*`.
- Put active execution state in `tasks/todo.md`.
- Put one-off evidence in audit/spec/plan documents.

## Compatibility Language

During the PromptLane compatibility window, use this wording consistently:

- Product name: PromptLane
- npm package: `promptlane`
- primary compatibility CLI: `promptlane`
- legacy CLI alias: `promptlane`
- canonical MCP server name: `promptlane`
- Claude Code slash namespace: `/promptlane:*`
- `/promptlane:*` remains unshipped legacy alias planning unless a later migration
  proves it is still needed

Do not introduce deprecation language for `promptlane` runtime identifiers
until the deprecation readiness plan says the evidence gates are satisfied.
