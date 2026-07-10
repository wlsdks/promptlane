# 0001 — MCP Per-Tool Module Migration

- Status: Accepted
- Date: 2026-07-05
- Tracks: Track A1 from the 2026-05-08 multi-track improvement pass

## Context

`src/mcp` currently hosts twenty agent-facing tools that follow two different
file layouts:

> Historical count at ADR acceptance. The server exposes 21 tools after the
> per-tool `get_benchmark_candidates` addition; the module-layout decision is
> unchanged.

- **Split layout** (the older one): `src/mcp/score-tool-definitions.ts` owns
  the JSON schema and tool name; `src/mcp/score-tool-types.ts` owns the
  TypeScript argument/result contract; `src/mcp/score-tool.ts` owns the
  handler orchestration; `src/mcp/server.ts` owns JSON-RPC dispatch via
  `PROMPTLANE_MCP_TOOL_HANDLERS`. The same axis applies to
  `agent-judge-tool-*`, `agent-rewrite-tool-*`, and `loop-tool-*`.

  Tools currently in this layout: `get_promptlane_status`, `score_prompt`,
  `improve_prompt`, `score_prompt_archive`, `review_project_instructions`,
  `coach_prompt`, `prepare_agent_judge_batch`, `record_agent_judgments`,
  `prepare_agent_rewrite`, `record_agent_rewrite`, `get_promptlane_status`,
  `prepare_loop_brief`, `record_loop_outcome`,
  `propose_loop_memory_candidate`, `record_loop_memory`,
  `propose_instruction_patch`, `apply_instruction_patch` (17 tools).

- **Per-tool layout** (the newer one): `src/mcp/apply-clarifications-tool.ts`,
  `src/mcp/record-clarifications-tool.ts`,
  `src/mcp/ask-clarifying-questions-tool.ts` each colocate the schema, the
  TypeScript contract, and the handler in a single tool-shaped module (3
  tools).

Adding a new tool currently requires the contributor to know that:

1. The handler must be added to (or registered through)
   `PROMPTLANE_MCP_TOOL_HANDLERS` in `src/mcp/server.ts`.
2. The tool definition must live in a `*-tool-definitions.ts` file or in the
   per-tool module.
3. The TypeScript contract must live in a `*-tool-types.ts` file or in the
   per-tool module.
4. The handler implementation must live in a `*-tool.ts` file or the per-tool
   module.

The split layout was a deliberate decision recorded in
`docs/ARCHITECTURE.md`, which describes the four axes (definition, type,
handler, transport routing) as load-bearing privacy and review boundaries.
The per-tool layout emerged because the newer tools are smaller and the
overhead of three companion files was not paying off; nothing in the existing
ARCHITECTURE.md text forbids it.

## Friction signals

- Cross-cut on add: every new tool in the split layout touches four files.
- Drift between layouts: a future contributor sees both styles and has to
  decide which convention to follow each time. There is no rule recorded.
- Review surface: `server.ts` carries an implicit registry whose entries can
  silently fall out of sync with the tool definitions if a rename happens.

## Considered options

### Option A — keep the split layout for the legacy tools, document the rule

Codify in `docs/ARCHITECTURE.md` that:

- Tools whose handler exceeds ~150 lines or whose schema is large stay in the
  split layout.
- New tools default to the per-tool layout.
- A small `tool registry` module (or an exported list per file) is the single
  enforcement point for `server.ts` to discover handlers.

Pros: no churn, clarifies the existing decision, removes ambiguity for new
tools.

Cons: split-vs-per-tool stays as a permanent fork in the conventions; the
`PROMPTLANE_MCP_TOOL_HANDLERS` literal in `server.ts` remains a manual
list.

### Option B — migrate everything to per-tool modules

Move every tool into a single module that exports `{ definition, handler }`
(plus a small `Args`/`Result` type), and have `server.ts` register them via a
generated array. Delete `score-tool-definitions.ts`, `score-tool-types.ts`,
and `score-tool.ts` once their tools have been split out.

Pros: single convention; adding a tool is a one-file diff plus one registry
line; review surface is clearly the per-tool module.

Cons: real engineering churn for ten tools. The privacy review surface that
ARCHITECTURE.md cites benefits from a definitions file the privacy fixture
can grep. We would need to keep the privacy regression and audit grep
patterns working.

### Option C — registry pattern with helper, files unchanged

Introduce `src/mcp/registry.ts` that exposes
`registerTool({ definition, handler })` and have each tool module call it on
import. `server.ts` imports the registry instead of the literal handler map.
The split layout can stay where it is; the change is purely the dispatch
indirection.

Pros: removes the manual `PROMPTLANE_MCP_TOOL_HANDLERS` list. Keeps the
existing privacy review surface intact. No wholesale rewrite.

Cons: side-effectful module imports; some teams treat that as an anti-pattern
because the import order matters. We already do this in places, but it should
be called out.

## Decision

Adopt **Option A now** and keep **Option C as the next migration target**.

New MCP tools default to a per-tool module:

```text
src/mcp/<tool-name>-tool.ts
```

That module should own the tool definition, argument/result types, handler,
and focused tests unless the tool is large enough to justify a local split.
Existing split-layout tools stay where they are until a feature or risk-driven
change touches them. Do not migrate the legacy split-layout tools only for
style consistency.

`src/mcp/server.ts` may keep the explicit `PROMPTLANE_MCP_TOOL_HANDLERS`
map for now. The next structural improvement is a registry that removes the
manual definition/handler sync point without forcing a wholesale rewrite of
the legacy tools. That registry must be explicit data, not import-time global
mutation.

Option B is rejected for the current phase. It creates too much churn in the
highest-risk agent-facing surface and would obscure privacy review during the
PromptLane transition.

## Consequences

- New tools such as PromptLane or clarification tools should be added as
  per-tool modules.
- Existing prompt scoring, archive scoring, project instruction review,
  agent-judge, and agent-rewrite tools can remain in their split files.
- When a PR changes the tool list, it must update the definition export and
  server handler map together, or introduce the explicit registry first.
- Reviewers should reject mixed layout churn that is not attached to a feature,
  privacy fix, or registry migration.
- The quality gate remains the enforcement rail for large MCP files; small
  shared helpers are preferred over expanding `score-tool.ts`.

## Migration Gate

Implement Option C only when at least one of these is true:

- a tool-list mismatch reaches review or CI;
- a new tool would otherwise require touching more than two registry files;
- `src/mcp/server.ts` grows because of dispatch plumbing rather than transport
  behavior;
- a packaging or MCP schema test needs a single authoritative tool catalogue.

The registry shape should be close to:

```ts
type RegisteredPromptLaneTool = {
  definition: PromptLaneMcpToolDefinition;
  handler: PromptLaneToolHandler;
};
```

Each tool module should export one `RegisteredPromptLaneTool`, and the MCP
server should derive both `tools/list` and `tools/call` dispatch from that
same array.
