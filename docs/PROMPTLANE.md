# PromptLane

Last updated: 2026-07-05

Product name: PromptLane.

PromptLane is a local-first prompt improvement workspace for Codex, Claude
Code, and long-running coding-agent work.

It helps developers write better coding-agent requests by recording prompts
locally, scoring them, improving them, and carrying approved lessons forward
across longer agent workflows.

## Product Thesis

PromptLane starts with prompt improvement:

- capture prompts from Codex and Claude Code
- redact and store them locally in Markdown and SQLite
- score weak requests with a deterministic local rubric
- generate copy-ready improved prompts
- review recurring prompt habits
- reuse strong prompt patterns safely

Loop features are loop-aware continuation. They help the next prompt stay
specific when work spans sessions, worktrees, branches, or compact boundaries.
They are not the product identity and they do not turn PromptLane into an
automatic agent runtime.

## Runtime Compatibility

Keep `prompt-coach` as the stable runtime identity until a dedicated migration
plan proves otherwise.

| Surface | Current value | Rule |
| --- | --- | --- |
| npm package | `prompt-coach` | Keep |
| Primary CLI | `prompt-coach` | Keep |
| Hook command | `prompt-coach hook ...` | Keep |
| Claude Code slash namespace | `/prompt-coach:*` | Keep |
| Canonical MCP server name | `prompt-coach` | Keep |
| Data directory | `~/.prompt-coach` | Keep |
| Legacy CLI alias | `loopdeck` | Compatibility only |

Do not use broad search-and-replace. `prompt-coach` is correct in commands,
package names, config paths, MCP server names, and slash namespaces.

## Core Workflows

### First Coach Loop

Goal: a new user sees one useful correction for a real prompt.

1. Install and run explicit setup.
2. Send a real Codex or Claude Code prompt.
3. Run the coach workflow.
4. Review the score, gaps, and copy-ready improved draft.

Success criteria:

- setup is explicit
- nothing leaves the machine
- the user sees one actionable improvement
- no prompt is auto-submitted
- Do not auto-submit prompt drafts into Codex or Claude Code

### Loop-Aware Continuation

Goal: a user can continue a long-running coding-agent task without rebuilding
context from scattered notes.

1. PromptLane records prompt and loop metadata.
2. A hook, CLI command, or MCP tool creates a safe loop snapshot.
3. The user or active agent asks for a continuation brief.
4. PromptLane returns a raw-free brief tied to selected worktree, session, or
   branch filters when provided.

Success criteria:

- the brief references safe labels and prompt IDs, not raw transcript bodies
- selected filters do not fall back to unrelated latest activity
- the brief is copy/review first, not auto-submit

### Memory And Instruction Improvement

Goal: recurring lessons become durable only after approval.

1. A loop outcome is recorded with passing status and safe evidence refs.
2. PromptLane proposes a memory candidate.
3. The user approves the memory.
4. PromptLane can propose an AGENTS.md or CLAUDE.md patch.
5. The user explicitly applies the patch through a gated CLI/MCP path.

Success criteria:

- failed or unevidenced loops are not accepted as durable memory
- memory approval does not write instruction files
- instruction patch proposal is reviewable and idempotent
- applying a patch requires explicit confirmation

## Privacy And Local-First Boundaries

PromptLane must preserve these boundaries:

- no hidden provider calls
- no automatic prompt resubmission
- no provider credential extraction, storage, proxying, or replay
- no raw transcript ingestion
- no private app database scraping
- no raw local path disclosure in summaries, MCP results, or docs examples
- no prompt body echo in setup/status/server error paths

MCP agent rewrite and judge tools may return bounded redacted packets only when
the user explicitly asks the active agent session to evaluate or rewrite them.
PromptLane does not call the provider on the user's behalf.

## Feature Portfolio

Keep:

- local prompt capture
- redacted Markdown archive as human-readable source of truth
- SQLite index and FTS
- deterministic prompt scoring and improvement drafts
- MCP rewrite/judge flows mediated by the active user-controlled agent session
- web archive/detail/search/settings surfaces
- setup, doctor, status, hook, and smoke commands

Improve:

- PromptLane-first README and plugin metadata
- Codex and Claude Code setup/status guidance
- continuation briefs
- worktree/session/branch filtering
- user-approved memory and instruction patch workflows
- package/plugin docs around compatibility IDs

Do not expand now:

- generic durable execution runtime
- semantic vector memory by default
- cloud/team sync
- external provider judge calls from inside PromptLane
- automatic prompt resubmission
- automatic merge/rebase/branch checkout

## Autonomy Model

PromptLane may become more helpful, but autonomy must remain staged.

| Level | Behavior | Default |
| --- | --- | --- |
| 0 | observe only | allowed |
| 1 | suggest a next prompt | allowed |
| 2 | draft a patch or instruction update | allowed after eligible evidence |
| 3 | apply after explicit approval | opt-in |
| 4 | run a gated local loop with stop conditions | future only |

Level 4 must remain local, non-destructive, bounded, and verified before it is
offered as a normal workflow.

## Non-Goals

PromptLane is not:

- a hosted agent platform
- a LangGraph/Temporal replacement
- a team cloud memory backend
- a provider credential broker
- a hidden LLM judge service
- a project management suite
- an automatic merge bot

## Acceptance Criteria

The PromptLane direction is healthy when these are true:

- a plain Codex or Claude Code user can get value through setup, capture, coach,
  status, and brief workflows
- product-facing metadata uses PromptLane
- runtime IDs remain `prompt-coach` until a dedicated migration proves a rename
- prompt bodies remain in the redacted archive only
- loop snapshots and status surfaces remain raw-free
- instruction changes are proposed before they are applied
- tests and smoke commands cover each public runtime surface before release
