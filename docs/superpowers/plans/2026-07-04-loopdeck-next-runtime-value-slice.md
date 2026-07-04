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
- Selected worktree detail now includes a raw-free missing-evidence explanation
  when the selected worktree is blocked, without returning evidence refs,
  outcome summaries, prompt bodies, diffs, or git state.
- Selected worktree detail now includes a raw-free reviewer checklist preview
  derived from the existing command-center review packet checklist and filtered
  to the selected worktree action, without adding checklist completion state,
  write tools, or merge automation.
- Selected worktree detail now includes a raw-free readiness summary for ready,
  needs-review, and missing-evidence states, including single ready worktrees
  where the top-level command center is not shown, while reusing the existing
  command-center readiness/checklist/command derivation.
- Selected worktree detail now includes a raw-free evidence-count explanation
  derived only from selected worktree aggregate evidence count, without exposing
  evidence ref strings, evidence bodies, output summaries, diffs, or raw paths.
- Selected worktree detail now includes a raw-free selection-scope explanation
  derived only from explicit worktree/session/branch filters, so operators can
  tell whether the selected continuation brief is worktree-wide,
  session-filtered, branch-filtered, or both session-and-branch filtered.
- Selected worktree detail now includes a raw-free selected snapshot
  age/staleness explanation derived only from safe snapshot `created_at`
  metadata, so operators can see when another loop snapshot was recorded after
  the current selection without reading git state or filesystem state.
- Selected worktree detail now includes a raw-free selected brief action
  rationale, including the CLI-equivalent filtered brief command and explicit
  no-file-write/no-external-call flags.
- Selected worktree detail now includes a raw-free merge-readiness-to-brief
  rationale, so users can see that copying a selected brief continues the loop
  without satisfying the separate merge gate.
- Selected worktree detail now groups accumulated read-only guidance with
  compact section labels for continuation guidance, merge review guidance, and
  evidence guidance, without changing API contracts or adding write behavior.
- Selected worktree detail now uses compact presentation structure for the
  review packet area: a selected-detail wrapper, section cards, section titles,
  and a responsive review grid for readiness, brief rationale, evidence,
  checklist, and missing-evidence guidance.
- Selected worktree detail now explains selected review command hint provenance,
  showing that the hint reuses the existing command-center continuation command
  from safe selected worktree metadata without reading git, executing commands,
  writing files, or making external calls.
- Selected worktree detail now distinguishes the selected continuation command
  from the review packet command hint, explaining that selected continuation
  follows selected worktree/session/branch filters while the review hint copies
  the command-center merge-review command.
- Selected worktree detail now explains which filter categories are represented
  in each visible command, using only filter names for selected continuation and
  command-center review scope.
- Selected worktree detail now explains selected brief copy side effects,
  showing that the copy action only writes to the local clipboard and temporary
  UI feedback, not files, commands, external services, prompt submission, or
  merge state.
- Selected worktree detail now explains paste destination for Codex/Claude Code
  continuation handoff, showing that the copied brief belongs in the active
  agent request box and remains user-submitted.
- Selected worktree detail now exposes a raw-free continuation handoff checklist:
  copy selected brief, paste into Codex or Claude Code, submit manually, then
  collect the next loop snapshot after the agent turn.
- Selected worktree detail now includes a raw-free post-handoff reminder,
  separating next loop snapshot collection from memory approval and merge
  decisions.
- Selected worktree detail now includes a raw-free source-of-truth note,
  explaining that the next loop snapshot is local loop memory input rather than
  a transcript import.
- Selected worktree detail now includes a raw-free privacy boundary note,
  explaining that Loopdeck stores loop metadata in the local database and
  Markdown archive only, without prompt bodies, transcripts, raw paths, or
  provider credentials.
- Selected worktree detail now includes a raw-free operator review gate,
  explaining that copied continuation briefs remain operator-reviewed and
  manually submitted in Codex or Claude Code.
- Selected worktree detail now includes a raw-free collection responsibility
  note, explaining that the operator explicitly collects the next loop snapshot
  after the agent turn and that Loopdeck does not watch transcripts or scrape
  agent UI in the background.
- Selected worktree detail now includes a raw-free pre-merge advisory,
  explaining that merge decisions should wait until the next loop snapshot is
  collected and reviewed, and that memory approval remains separate from merge
  readiness.
- Selected worktree detail now includes a raw-free post-collection review note,
  explaining that collected loop snapshot quality and evidence should be
  reviewed before memory approval or merge readiness is reconsidered.
- Selected worktree detail now includes a raw-free continuation safety grouping
  label, explaining that the following copy, paste, review, collect, privacy,
  and merge gating notes are read-only handoff boundaries for Codex and Claude
  Code continuation.
- Selected worktree detail now includes a raw-free continuation safety ordering
  note, explaining that operators should review the safety guidance before
  copying or pasting selected continuation briefs.
- Selected worktree detail now includes a raw-free continuation safety
  non-persistence note, explaining that reviewed guidance state is not stored or
  synchronized and must be re-checked by the operator each time.
- Selected worktree detail now includes a raw-free continuation safety re-check
  cue, explaining that after each selected brief copy the operator should
  re-check safety guidance before pasting into Codex or Claude Code.
- Selected worktree detail now includes a raw-free copy feedback reminder,
  explaining that copied state only means the brief reached the local clipboard
  and is not safety approval or agent submission.
- Selected worktree detail now includes a raw-free selected-brief copy feedback
  accessibility note, explaining that visible copy button labels stay stable and
  copied status belongs in accessible feedback rather than replacing the visible
  command.
- Selected worktree detail now includes a raw-free selected-brief copy feedback
  timeout note, explaining that copied feedback clears after a short local
  timeout and does not record review completion or submission state.
- Selected worktree detail now includes a raw-free selected-brief copy feedback
  failure note, explaining that clipboard failure requires a manual retry and
  does not submit prompts or store review state.
- Selected worktree detail now includes a raw-free selected-brief copy retry
  note, explaining that retrying the selected brief copy is a manual operator
  action and Loopdeck does not automatically retry clipboard writes or submit
  prompts.
- Selected worktree detail now includes a raw-free selected-brief pre-paste
  confirmation note, explaining that the operator confirms the copied brief
  and target agent request before paste, without submitting prompts or
  approving safety review.
- Selected worktree detail now includes a raw-free selected-brief target-agent
  check note, explaining that the operator verifies the active Codex or Claude
  Code request box before paste, without Loopdeck inspecting agent UI state or
  target contents.
- Selected worktree detail now includes a raw-free paste destination
  verification boundary note, explaining that paste destination is a manual
  operator choice in Codex or Claude Code, without Loopdeck verifying active
  windows, target contents, or paste success.
- Selected worktree detail now includes a raw-free manual submission boundary
  note, explaining that the operator submits the pasted brief manually in Codex
  or Claude Code, without Loopdeck pressing Enter, clicking submit, or
  recording submitted state.
- Selected worktree detail now includes a raw-free submission result
  non-persistence note, explaining that agent response and submission result
  stay outside Loopdeck until the next explicit loop snapshot, without Loopdeck
  detecting, storing, or syncing submitted state after handoff.
- Selected worktree detail now includes a raw-free post-submission collection
  reminder boundary note, explaining that the operator collects the next loop
  snapshot explicitly after the agent response is ready, without Loopdeck
  starting collection from submission, transcript changes, or agent UI activity.
- Selected worktree detail now includes a raw-free collection result
  non-persistence note, explaining that collection result state is not persisted
  until the operator records the next explicit loop snapshot, without Loopdeck
  storing, syncing, or inferring collection result state from agent UI activity.
- Selected worktree detail now includes a raw-free collection retry boundary
  note, explaining that the operator reruns the explicit loop collection flow
  when retry is needed, without Loopdeck automatically retrying collection
  commands or hidden recovery actions.
- Selected worktree detail now includes a raw-free retry outcome
  non-persistence note, explaining that retry attempt and outcome stay outside
  Loopdeck until the next explicit loop snapshot, without Loopdeck detecting,
  storing, or syncing retry success or failure state.
- Selected worktree detail now includes a raw-free collection evidence
  freshness boundary note, explaining that the operator checks freshness
  against the latest explicit loop snapshot evidence, without Loopdeck
  verifying freshness from git status, transcripts, or agent UI activity.
- Selected worktree detail now includes a raw-free freshness result
  non-persistence note, explaining that freshness result state stays outside
  Loopdeck until the next explicit loop snapshot, without Loopdeck detecting,
  storing, or syncing freshness result state.
- Selected worktree detail now includes a raw-free freshness uncertainty
  collection reminder, explaining that the operator collects a new explicit
  loop snapshot when evidence freshness is uncertain, without Loopdeck
  verifying freshness or starting collection automatically.
- Selected worktree detail now includes a raw-free pre-merge freshness
  advisory, explaining that the operator reviews freshness uncertainty before
  merge decisions, without Loopdeck approving merges or verifying freshness
  before merge.
- Selected worktree detail now includes a raw-free pre-memory-approval
  freshness advisory, explaining that the operator reviews freshness
  uncertainty before approving loop memory, without Loopdeck approving memory
  or verifying freshness from this note.
- Selected worktree detail now includes a raw-free post-memory-approval
  collection reminder, explaining that the operator collects a new explicit
  loop snapshot after approving loop memory, without Loopdeck starting
  collection from approval or approval state changes.
- Selected worktree detail now includes a raw-free post-memory-approval
  collection result non-persistence note, explaining that post-approval
  collection result state stays outside Loopdeck until the next explicit loop
  snapshot, without Loopdeck detecting, storing, or syncing that result state.
- Selected worktree detail now includes a raw-free post-memory-approval
  collection retry boundary note, explaining that the operator reruns the
  explicit post-approval loop collection flow when retry is needed, without
  Loopdeck automatically retrying commands or hidden recovery actions.
- Selected worktree detail now includes a raw-free post-memory-approval retry
  outcome non-persistence note, explaining that post-approval retry outcome
  state stays outside Loopdeck until the next explicit loop snapshot, without
  Loopdeck detecting, storing, or syncing retry success or failure state.
- Selected worktree detail now includes a raw-free post-memory-approval retry
  evidence freshness boundary note, explaining that the operator checks retry
  evidence freshness against the latest explicit loop snapshot, without Loopdeck
  verifying freshness from git status, transcripts, or agent UI activity.
- Selected worktree detail now includes a raw-free post-memory-approval retry
  freshness result non-persistence note, explaining that retry freshness result
  state stays outside Loopdeck until the next explicit loop snapshot, without
  Loopdeck detecting, storing, or syncing that state.
- Selected worktree detail now includes a raw-free post-memory-approval retry
  freshness uncertainty collection reminder, explaining that the operator
  collects a new explicit loop snapshot when post-approval retry freshness is
  uncertain, without Loopdeck verifying freshness or starting collection
  automatically.
- Selected worktree detail now includes a raw-free post-memory-approval retry
  pre-memory-approval freshness advisory, explaining that the operator reviews
  post-approval retry freshness uncertainty before approving loop memory again,
  without Loopdeck approving memory or verifying freshness from this advisory.
- Selected worktree detail now includes a raw-free post-memory-approval retry
  renewed-memory-approval collection reminder, explaining that the operator
  collects a new explicit loop snapshot after approving loop memory again,
  without Loopdeck starting collection from renewed approval state changes.
- Selected worktree detail now includes a raw-free post-memory-approval retry
  renewed-memory-approval collection result non-persistence note, explaining
  that renewed-memory-approval collection result state stays outside Loopdeck
  until the next explicit loop snapshot, without Loopdeck detecting, storing,
  or syncing that result state.
- Selected worktree detail now includes a raw-free post-memory-approval retry
  renewed-memory-approval collection uncertainty reminder, explaining that the
  operator collects a new explicit loop snapshot when renewed-memory-approval
  collection result is uncertain, without Loopdeck verifying the result or
  starting collection automatically.
- Selected worktree detail now includes a raw-free post-memory-approval retry
  renewed-memory-approval pre-merge freshness advisory, explaining that the
  operator reviews renewed-memory-approval freshness uncertainty before merge
  decisions, without Loopdeck approving merges or verifying freshness before
  merge.
- Selected worktree detail now includes a raw-free post-memory-approval retry
  renewed-memory-approval pre-handoff freshness advisory, explaining that the
  operator reviews renewed-memory-approval freshness uncertainty before
  continuation handoff, without Loopdeck approving handoffs or verifying
  freshness before handoff.
- Selected worktree detail now includes a raw-free post-memory-approval retry
  renewed-memory-approval pre-paste freshness advisory, explaining that the
  operator reviews renewed-memory-approval freshness uncertainty before pasting
  into Codex or Claude Code, without Loopdeck approving paste targets or
  verifying freshness before paste.
- Selected worktree detail now includes a raw-free post-memory-approval retry
  renewed-memory-approval pre-submit freshness advisory, explaining that the
  operator reviews renewed-memory-approval freshness uncertainty before
  submitting in Codex or Claude Code, without Loopdeck approving submissions or
  verifying freshness before submit.
- The next runtime slice should decide whether selected worktree detail needs a
  raw-free post-memory-approval retry renewed-memory-approval post-submit
  freshness advisory, without
  adding transcript content, prompt bodies, raw paths, target contents,
  active-window titles, pasted content, paste result state, submitted state,
  agent response content, collection result state, post-approval collection
  result state, renewed memory approval collection result state, retry result
  state, post-approval retry result state, retry outcome state, freshness result
  state, retry freshness result state, post-approval retry freshness result
  state, approval result state, renewed memory approval state, freshness
  verification, automatic collection, collection command execution, retry
  automation, git status reads, command execution, persisted review state,
  checklist completion state, paste target state, handoff approval state,
  submission approval state, memory approval writes, memory approval state,
  merge writes, merge decision state, or external calls.
