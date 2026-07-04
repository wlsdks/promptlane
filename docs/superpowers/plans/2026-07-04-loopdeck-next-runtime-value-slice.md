# Loopdeck Next Runtime Value Slice

Decision: Selected Worktree Continuation Brief Parity

This is not a rename slice. The runtime id compatibility line is now blocked on
future evidence, not on more immediate docs. The next value should improve the
agent loop itself: when a user reviews a specific worktree, session, or branch
in Loopdeck, Codex and Claude Code should be able to request a continuation
brief for that same selected loop instead of only the globally latest snapshot.

## Why This Slice

Loopdeck already has:

- worktree/session/branch-aware loop snapshot metadata
- Web worktree drilldown with `worktree`, `session`, and `branch` filters
- CLI `loop brief` and MCP `prepare_loop_brief` for copy-ready continuation
  prompts
- approved memory inclusion and compact boundary awareness in continuation
  briefs

The gap is parity. Web can select a loop slice, but the agent-facing surfaces
still default to latest-only continuation. That is the wrong center of gravity
for concurrent Codex and Claude Code worktrees, because the agent often resumes
one selected branch or session while another run has newer snapshots.

## Product Decision

Keep:

- latest-only behavior as the default for backward compatibility
- local-first SQLite as the source of truth
- human-reviewed continuation prompts; no auto-submit
- approved memory and compact boundary sections in generated briefs

Improve:

- CLI `loop brief` should accept optional `--worktree`, `--session`, and
  `--branch` filters.
- MCP `prepare_loop_brief` should accept optional `worktree`, `session_id`, and
  `branch` arguments.
- API `/api/v1/loops/:id/brief` can remain snapshot-id based for row actions,
  but the selected worktree detail should have a follow-up plan for filtered
  brief actions after CLI/MCP parity lands.

Do not add yet:

- database schema changes
- background scanning of uncollected worktrees
- automatic merge or conflict recommendation
- hidden external LLM calls
- writes to `AGENTS.md` or `CLAUDE.md`
- package, plugin, slash command, hook, or MCP server-name renames

## TDD First Target

TDD first target:

Add a focused RED test for CLI `loop brief`:

- seed two snapshots where the newer global snapshot belongs to a different
  worktree
- call `loop brief --worktree selected-worktree`
- expect the prompt title/body to use the selected snapshot, not the global
  latest snapshot
- expect approved memories to remain project-scoped to the selected snapshot
- expect output to exclude prompt bodies and raw paths

Then add the matching MCP RED test:

- call MCP `prepare_loop_brief` with `{ "worktree": "selected-worktree" }`
- expect `source` or explicit selection metadata to reflect filtered selection
- expect invalid filters with no matching snapshot to return `not_found`
- expect prompt bodies, transcript text, compact summaries, raw paths, and
  provider credentials to remain absent

## Implementation Shape

The smallest implementation should introduce a shared selector helper instead
of duplicating filter logic in CLI and MCP:

```text
src/loop/snapshot-selection.ts
```

It should accept an already-loaded list of recent snapshots and optional
filters:

- `worktree`
- `session_id`
- `branch`

It should return the newest matching snapshot or a typed not-found result.
Storage can continue loading a bounded recent list first; DB-level filtering is
not required for this slice.

CLI and MCP should share the same selector before calling `createLoopBrief`, so
compact boundary awareness, approved memory inclusion, and privacy behavior stay
unchanged.

## Acceptance Criteria

- CLI `loop brief` still works with no filters.
- CLI `loop brief --worktree <label>` selects the newest matching snapshot.
- CLI `loop brief --worktree <label> --session <id> --branch <name>` narrows the
  selection.
- MCP `prepare_loop_brief` supports equivalent optional filters.
- Non-matching filters return a clear not-found result.
- Generated briefs never include prompt bodies, compact summaries, transcript
  text, raw paths, API tokens, or provider credentials.
- No public runtime ids are renamed.
- Focused tests pass before the full Node 22 pnpm gate.

## First Follow-Up After This Slice

Implementation checkpoint:

- CLI `loop brief` and MCP `prepare_loop_brief` now share selected
  worktree/session/branch snapshot selection.
- Web selected worktree detail can copy a continuation brief using the same
  selected worktree/session/branch filters.
- The latest-only behavior remains the default when no filters are provided.
- Non-matching MCP filters return `not_found`.

Decision:

- Selected brief actions should move into a broader command-center direction,
  because concurrent Codex and Claude Code worktrees need a review-before-merge
  view before any future merge workflow is credible.
- The first command-center slice is read-only and uses only safe metadata that
  already exists in `LoopdeckStatus.activity`.
- Merge automation, branch checkout, conflict prediction, hidden external model
  calls, and file writes remain out of scope.

Implementation checkpoint:

- `LoopdeckStatus.activity.command_center` now exposes a raw-free
  multi-worktree review summary when multiple worktrees or sessions are active.
- CLI `loop status`, MCP `get_loopdeck_status`, and the web Loops summary expose
  the same command center contract.
- Command-center review items now include a safe `continuation_command`, CLI
  `loop status` prints that command, MCP `get_loopdeck_status` schemas it, and
  the web Loops summary can copy a filtered selected brief for each worktree.
- Command-center review items now include `evidence_count` and
  `merge_readiness`, derived from the latest snapshot outcome metadata without
  returning evidence ref strings or outcome summaries.
- CLI `loop status`, MCP `get_loopdeck_status`, and the web Loops summary now
  show whether each worktree is ready, needs review, or is missing evidence
  before any future merge workflow.
- `LoopdeckStatus.activity.command_center.review_packet` now aggregates those
  readiness signals into a read-only review-before-merge packet with counts,
  status, summary, next action, and safe action labels.
- CLI `loop status`, MCP `get_loopdeck_status`, and the web Loops summary expose
  the packet without reading diffs, checking out branches, calling external
  models, or writing git/project state.
- `review_packet.checklist` now exposes a read-only human checklist derived from
  safe aggregate actions, so Codex and Claude Code can tell the user what to do
  before a merge decision without storing completion state.
- Local merge decisions now have a CLI-only journal boundary:
  `prompt-coach loop decision record/list` stores an explicit local operator
  decision for a selected worktree without prompt bodies, raw paths, external
  calls, or git writes.
- Recent merge decisions now flow read-only through `LoopdeckStatus.activity`,
  CLI `loop status`, MCP `get_loopdeck_status`, `/api/v1/loops`, and the web
  Loops summary so Codex and Claude Code can see prior human decisions without
  gaining a write-capable merge journal tool.
- Recent merge decisions now influence review packet next-action text only via
  optional `review_packet.decision_advisory`; `review_packet.status`,
  `review_packet.next_action`, readiness counts, checklist status, and git state
  remain unchanged by decision records.
- Selected worktree detail now shows the matching latest local merge decision
  read-only through `/api/v1/loops/worktrees/:worktree`, API typing, and the web
  detail panel, scoped by selected worktree and selected snapshot project.
- Selected worktree detail now includes a raw-free review packet summary,
  packet next action, and selected worktree action through
  `/api/v1/loops/worktrees/:worktree`, API typing, and the web detail panel.
- Selected worktree detail now includes a CLI-equivalent read-only command hint
  sourced from the existing command-center review item continuation command,
  without adding command execution, web write buttons, checklist completion
  state, merge automation, or git writes.
- The next runtime slice should decide whether selected worktree detail needs a
  raw-free missing-evidence explanation when the selected worktree is blocked,
  without returning evidence refs or outcome summaries.
